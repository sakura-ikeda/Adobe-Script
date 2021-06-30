# Adobe-Script
全てのファイルを[ダウンロード](https://github.com/sakura-ikeda/Adobe-Script/archive/refs/heads/main.zip)
###### ご利用に関して生じた損害などに対して、当方では一切の責任を負えませんのでよろしくお願いします。

## [Illustrator](https://github.com/sakura-ikeda/Adobe-Script/tree/main/Illustrator)
#### [placedClippingPathName.scpt](https://github.com/sakura-ikeda/Adobe-Script/blob/main/Illustrator/placedClippingPathName.scpt)
Illustrator v24.3.1(CC2021)で、配置されたPSD画像に日本語を含むクリッピングパス名が使用されている場合、クリッピングパスが外れる不具合の対応スクリプト。<br>
配置されたPSD画像をPhotoshopで開き、クリッピングパス名が日本語だった場合にPath 1のような英数字に変更して保存します。なおPhotoshopは日本語のクリッピングパス名で不具合のないv22.2以下のバージョンを使用してください。<br>

## [Photoshop](https://github.com/sakura-ikeda/Adobe-Script/tree/main/Photoshop)

#### [clippingPathRename.jsx](https://github.com/sakura-ikeda/Adobe-Script/blob/main/Photoshop/clippingPathRename.jsx)
Photoshop v22.3以上のバージョンで日本語のクリッピングパス名がうまく保存されない不具合の対応スクリプト。<br>
クリッピングパス名が日本語だった場合にPath 1のような英数字に変更して上書き保存します。<br>
Photoshopのファイルメニュー/スクリプト/スクリプトマネージャーでの使用を想定しています。<br>
```
スクリプトマネージャー設定内容
Photoshopイベント：ドキュメントを保存
スクリプト：clippingPathRename.jsx（このスクリプト）
```   
上記の設定によりファイルを保存したタイミングでクリッピングパス名が日本語だった場合にPath 1のような英数字に変換して上書き保存し直します。<br>

#### [PSDClippingPathName.jsx](https://github.com/sakura-ikeda/Adobe-Script/blob/main/Photoshop/PSDClippingPathName.jsx)
Photoshop v22.2以下のバージョンで保存された日本語のクリッピングパス名が使用された**PSDファイル**を、Photoshop v22.4以上のバージョンで開いた時にクリッピングパスを読み込めない不具合の対応用スクリプト。<br>
PSDファイルのイメージリソース部分を読み込みクリッピングパス情報を取得しています。<br>
注意：Photoshop v22.3以上のバージョンで保存された日本語のクリッピングパス名が使用されたPSDファイルは対応できません。<br>
Photoshopのファイルメニュー/スクリプト/スクリプトマネージャーでの使用を想定しています。<br>
```
スクリプトマネージャー設定内容
Photoshopイベント：ドキュメントを開く
スクリプト：PSDClippingPathName.jsx（このスクリプト）
```
上記の設定によりクリッピングパスが正常に保存されたPSDファイルを開いたタイミングで、クリッピングパスが読み込めなかった場合に再度クリッピングパスを設定しなおします。
