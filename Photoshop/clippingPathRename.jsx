/*
Photoshop v22.3以上のバージョンで日本語のクリッピングパス名がうまく保存されない不具合の対応スクリプト
クリッピングパス名が日本語だった場合にPath 1のような英数字に変更して上書き保存します
Photoshopのファイルメニュー/スクリプト/スクリプトマネージャーでの使用を想定しています

スクリプトマネージャー設定内容
Photoshopイベント：ドキュメントを保存
スクリプト：このスクリプトを選択

上記の設定によりファイルを保存したタイミングでクリッピングパス名が日本語だった場合にPath 1のような英数字に変換して上書き保存し直します。
*/

(function() { 

//Photoshopのバージョンが22.2以下は処理をしない
if(parseFloat(app.version) <= 22.2) return;
//ドキュメントが開かれていない場合は処理をしない
if(documents.length == 0) return;

var doc = app.activeDocument;
var clippingPath = null;

//日本語のクリッピングパスの取得
for (var index = 0; index < doc.pathItems.length; index++) {
    if(doc.pathItems[index].kind == PathKind.CLIPPINGPATH) {
        if(doc.pathItems[index].name.match(/^[\x200-9a-zA-z]+$/) == null) {
            clippingPath = doc.pathItems[index];
            break;
        }
    }
}

//日本語のクリッピングパスがない場合は処理をしない
if(clippingPath == null) return;

//設定しようとしているクリッピングパス名がすでに使われている場合、パス名が重複しなくなるまで数字を増やす
//クリッピングパス名を設定後、上書き保存をする
for (var index = 1; index < doc.pathItems.length + 1; index++) {
    try {
        doc.pathItems.getByName("Path " + index);
    } catch (error) {
        clippingPath.name = "Path " + index;
        doc.save();
        break;
    }
}

} ())
