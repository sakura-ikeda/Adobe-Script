#target photoshop;

(function() { 

//Photoshopのバージョンが22.2以下は処理をしない
if(parseFloat(app.version) <= 22.2) return;

var doc = app.activeDocument;
var clippingPath = null;
var pathItemsNames = [];
var re = new RegExp('^[\x200-9a-zA-z]+$');
if (!Array.prototype.indexOf) { Array.prototype.indexOf = function indexOf(member, startFrom) { /* In non-strict mode, if the `this` variable is null or undefined, then it is set to the window object. Otherwise, `this` is automatically converted to an object. In strict mode, if the `this` variable is null or undefined, a `TypeError` is thrown. */ if (this == null) { throw new TypeError("Array.prototype.indexOf() - can't convert `" + this + "` to object"); } var index = isFinite(startFrom) ? Math.floor(startFrom) : 0, that = this instanceof Object ? this : new Object(this), length = isFinite(that.length) ? Math.floor(that.length) : 0; if (index >= length) { return -1; } if (index < 0) { index = Math.max(length + index, 0); } if (member === undefined) { /* Since `member` is undefined, keys that don't exist will have the same value as `member`, and thus do need to be checked. */ do { if (index in that && that[index] === undefined) { return index; } } while (++index < length); } else { do { if (that[index] === member) { return index; } } while (++index < length); } return -1; };}

//クリッピングパスとパスアイテム名の取得
for (index = 0; index < doc.pathItems.length; index++) {
    pathItemsNames[index] = doc.pathItems[index].name;
    if(doc.pathItems[index].kind == PathKind.CLIPPINGPATH) {
        if(doc.pathItems[index].name.match(re) == null) {
            clippingPath = doc.pathItems[index];
        }
    }
}

//クリッピングパスがない場合は処理をしない
if(clippingPath == null) return;

//設定しようとしているクリッピングパス名がすでに使われている場合、パス名が重複しなくなるまで数字を増やす
for (index = 1; index < doc.pathItems.length + 1; index++) {
    if(pathItemsNames.indexOf("Path " + index) < 0) {
        clippingPath.name = "Path " + index;
        doc.save();
        break;
    }
}

} ())
