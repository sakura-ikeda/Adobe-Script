/*
Photoshop v22.4以上のバージョンで日本語のクリッピングパス名が使用されたPSDファイルを開いた時にクリッピングパスを読み込めない不具合の対応用スクリプト
PSDファイルのイメージリソース部分を読み込みクリッピングパス情報を取得しています
Photoshopのファイルメニュー/スクリプト/スクリプトマネージャーでの使用を想定しています

スクリプトマネージャー設定内容
Photoshopイベント：ドキュメントを開く
スクリプト：このスクリプトを選択

上記の設定によりクリッピングパスが正常に保存されたPSDファイルを開いたタイミングで、クリッピングパスが読み込めなかった場合に再度クリッピングパスを設定しなおします。
*/

(function() { 

    //Photoshopのバージョンが22.3以下は処理中止
    if(parseFloat(app.version) <= 22.3) return;
    //ドキュメントが開かれていない場合は処理中止
    if(documents.length == 0) return;
    //クリッピングパスが認識されている場合は処理中止
    for (var clippingPathIndex = 0; clippingPathIndex < app.activeDocument.pathItems.length; clippingPathIndex++) {
        if (app.activeDocument.pathItems[clippingPathIndex].kind == PathKind.CLIPPINGPATH) {
            return;
        }
    }
    
    //アクティブなファイルパスを取得しバイナリモードで開く
    //開かなかった場合は処理中止
    var filePath = app.activeDocument.path+"/"+encodeURI(app.activeDocument.name);
    var fileObj = new File(filePath);
    if(!fileObj.open("r")) return; 
    fileObj.encoding = 'binary';
    
    //psdファイルではない場合処理中止
    if (fileObj.read(4) != "8BPS") {
        fileObj.close();
        return
    }
    
    //イメージリソースからクリッピングパス名を取得する
    //Photoshop file structure
    //https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/
    
    //File header Section
    fileObj.seek(4 + 2 + 6 + 2 + 4 + 4 + 2 + 2, 0);
    //Color Mode Data Section
    var colorModeDataLength = binaryToDecimal(fileObj.read(4));
    fileObj.seek(colorModeDataLength, 1);
    //Image Resouces Section
    //イメージリソースのデータサイズが取得できなかった場合は処理中止
    var resouceLength = binaryToDecimal(fileObj.read(4));
    if (isNaN(resouceLength)) {
        fileObj.close();
        return;
    }
    //Image Resouce Blocks
    var identifier = 0;
    var rlen = 0;
    var pascalNumber = 0;
    var data = null;
    var sig = "";
    var pointer = 0;
    var clippingPathName = null;
    var clippingPathFlag = false;
    var counter = 0;
    var mfData = fileObj.read(resouceLength);
    fileObj.close();
    
    //$.writeln("mfData legnth:" + mfData.length);
    
    while (mfData.length > pointer) {
        //Signature 8BIM
        if(mfData.slice(pointer, pointer += 4) != "8BIM") break;
        //Identifier
        identifier = mfData.slice(pointer, pointer += 2);
        clippingPathFlag = (binaryToDecimal(identifier) == 0x0BB7);
        //$.writeln("Identifier:" + binaryToDecimal(identifier) + " 0x" + binaryToDecimal(identifier).toString(16));
        //Pascal string (Padding even)
        pascalNumber = mfData.slice(pointer, pointer += 1).charCodeAt(0);
        if (pascalNumber == 0) {
            pointer++;
        } else if (isNaN(pointer)) {
            break;
        } else {
            pointer += pascalNumber;
            if (pascalNumber % 2 == 0) pointer++;
        }
        //Resouce length
        rlen = binaryToDecimal(mfData.slice(pointer, pointer += 4));
        //Resouce Data (Pading even)
        if(clippingPathFlag) {
            data = mfData.slice(pointer, pointer += rlen);
        } else {
            pointer += rlen
        }
        if (rlen % 2 != 0) pointer++;
    
        //Clipping Path (0x0BB7)
        if (clippingPathFlag) {
            //クリッピングパス名をファイルに書き出す
            var clippingPathNamePascalNumber = binaryToDecimal(data[0]);
            clippingPathName = data.slice(1, clippingPathNamePascalNumber + 1);
            var tmpPath = "/var/tmp/clipname";
            var clippingPathNameFileObj = new File(tmpPath);
            clippingPathNameFileObj.open("w");
            clippingPathNameFileObj.encoding = 'binary';
            clippingPathNameFileObj.write(clippingPathName);
            clippingPathNameFileObj.close();
            //ファイル取り込み時に文字コードを自動判別するのを利用してSJISのクリッピングパス名を取得する
            clippingPathNameFileObj = new File(tmpPath);
            clippingPathNameFileObj.open("r");
            clippingPathName = clippingPathNameFileObj.read();
            clippingPathNameFileObj.close();
            clippingPathNameFileObj.remove();
            break;
        }
        //無限ループ対策（リファレンスのイメージリソースID数）
        counter++;
        if (counter > 91+998+1000) break;
    }
    
    //イメージリソースからクリッピングパスが取得できなかった場合は処理中止
    if (clippingPathName == null)　return;
    //イメージリソースから取得したクリッピングパス名と同名のパスをクリッピングパスに設定する
    for (var index = 0; index < app.activeDocument.pathItems.length; index++) {
        if (app.activeDocument.pathItems[index].name == clippingPathName) {
            app.activeDocument.pathItems[index].kind = PathKind.CLIPPINGPATH;
        }
    }
    
    function binaryToDecimal(n) {
        var num = toBinary(n);
        var dec_value = 0;
        // Initializing base value to 1, i.e 2^0
        var base = 1;
        var temp = num;
        while (temp) {
            var last_digit = temp % 10;
            temp = Math.floor(temp / 10);
            dec_value += last_digit * base;
            base = base * 2;
        }
        return dec_value;
    }
    
    function toBinary(n) {
        var num = "";
        var buf = 0;
        for (var index = 0; index < n.length; index++) {
            buf = n[index].charCodeAt(0);
            if (isNaN(buf)) buf = 0;
            num += ('00000000' + buf.toString(2)).slice(-8);        
        }
        return num;
    }

    
    } ())
    
