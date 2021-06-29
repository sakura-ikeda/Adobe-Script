

(function() { 

//Photoshopのバージョンば22.2以下は処理をしない
if(parseFloat(app.version) <= 22.2) return;

//クリッピングパスが認識されていた場合を処理をしない
var index = 0;
for (index = 0; index < app.activeDocument.pathItems.length; index++) {
    if (app.activeDocument.pathItems[index].kind == PathKind.CLIPPINGPATH) {
        return;
    }
}

//アクティブなファイルパスを取得しバイナリモードで開く
//開かなかった場合は処理をしない
var filePath = app.activeDocument.path+"/"+encodeURI(app.activeDocument.name);
var fileObj = new File(filePath);
var res = fileObj.open("r");
if(res == false) return; 
var mfData = "";
fileObj.encoding = 'binary';

//psdファイルではない場合処理中止
if (fileObj.read(4) != "8BPS") {
    fileObj.close();
    return
}

//イメージリソースからクリッピングパス名を取得する
//Photoshop file structure
//https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_17587

//File header Section
fileObj.seek(4 + 2 + 6 + 2 + 4 + 4 + 2 + 2, 0);

//Color Mode Data Section
mfData = fileObj.read(4);
fileObj.seek(binaryToDecimal(toBinary(mfData)), 1);

//Image Resouces Section
//イメージリソースのデータサイズが取得できなかった場合は処理中止
mfData = fileObj.read(4);
var resouceLength = binaryToDecimal(toBinary(mfData));
if (isNaN(resouceLength)) return;

//Image Resouce Blocks
//var pointer = fileObj.tell();
var identifier = 0;
var rlen = 0;
var pascal = 0;
var data = null;
var sig = "";
var pointer = 0;
var clippingPathName = null;
var counter = 0;
var pascalStrings = "";
//$.writeln(resouceLength.toString(16));
mfData = fileObj.read(resouceLength);
fileObj.close();
//$.writeln("mfData legnth:" + mfData.length);

while (mfData.length > pointer) {

    //Signature 8BIM
    sig = mfData.slice(pointer, pointer += 4);
    //$.writeln("Signature:" + sig);
    //Identifier
    identifier = mfData.slice(pointer, pointer += 2);
    //$.writeln("Identifier:" + binaryToDecimal(toBinary(identifier)) + " 0x" + binaryToDecimal(toBinary(identifier)).toString(16));
    //Pascal string (Padding even)
    pascal = mfData.slice(pointer, pointer += 1).charCodeAt(0);
    //$.writeln("Pascal length:" + pascal);
    if (pascal == 0) {
        mfData.slice(pointer, pointer += 1);
    } else {
        pascalStrings = mfData.slice(pointer, pointer += pascal);
        //$.writeln("Pascal strings:" + pascalStrings);
        if (pascal % 2 == 0) mfData.slice(pointer, pointer += 1);
    }
    //Resouce length
    rlen = binaryToDecimal(toBinary(mfData.slice(pointer, pointer += 4)));
    //$.writeln("Resouce length:" + (rlen.toString(16)));
    //Resouce Data (Pading even)
    data = mfData.slice(pointer, pointer += rlen);
    if (rlen % 2 != 0) {
        mfData.slice(pointer, pointer += 1);
    }

    //Clipping Path (0x0BB7)
    if (binaryToDecimal(toBinary(identifier)) == 0x0BB7) {
        var clippingPathNamePascalNumber = binaryToDecimal(toBinary(data[0]));
        //$.writeln("clippingPathNamePascalNumber:" + clippingPathNamePascalNumber);
        var tmpPath = "/var/tmp/clipname";
        clippingPathName = data.slice(1, clippingPathNamePascalNumber + 1);
        var clippingPathNameFileObj = new File(tmpPath);
        clippingPathNameFileObj.open("w");
        clippingPathNameFileObj.encoding = 'binary';
        clippingPathNameFileObj.write(clippingPathName);
        clippingPathNameFileObj.close();
        //テキストファイル取り込み時に文字コードを自動判別するのを利用してSJISのクリッピングパス名を取得する
        clippingPathNameFileObj = new File(tmpPath);
        clippingPathNameFileObj.open("r");
        clippingPathName = clippingPathNameFileObj.read();
        clippingPathNameFileObj.close();
        //$.writeln(clippingPathName);
        clippingPathNameFileObj.remove();
        break;
    }

    //無限ループ対策
    counter++;
    if (counter > 100) break;
}

if (clippingPathName == null)　return;
for (var index = 0; index < app.activeDocument.pathItems.length; index++) {
    if (app.activeDocument.pathItems[index].name == clippingPathName) {
        //alert(clippingPathName);
        app.activeDocument.pathItems[index].kind = PathKind.CLIPPINGPATH;
    }
}

function toBinary(n) {
    var num = "";
    var buf = 0;
    for (var index = 0; index < n.length; index++) {
        buf = n[index].charCodeAt(0);
        if (isNaN(buf)) {
            buf = 0;
        } 
        num += ('00000000' + buf.toString(2)).slice(-8);        
    }
    return num;
}

function binaryToDecimal(n) {
    var num = n;
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


} ())
