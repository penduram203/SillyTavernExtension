SillyTavernの拡張機能です<br>
<br>
# インストール方法
まず　https://github.com/penduram203/SillyTavernExtension/tree/main
にアクセスし、<br>
「<> code」をクリックしてから「Download ZIP」をクリックしてファイルをダウンロード<br>
<br>
![](https://files.catbox.moe/0uhqi3.png)
<br>
<br>
ZIPファイルを解凍すると「chat_window_onoff」「image_display_extension」「text_styling_extension」の３つのフォルダが出来るので
その３つのフォルダを**SillyTavern/public/scripts/extensions**の中に入れる<br>
<br>
![](https://files.catbox.moe/jsw0ne.png)
<br>
<br>
次に**SillyTavern/public**の中にある**index.html**をテキスト閲覧ソフトで編集する<br>
<br>
![](https://files.catbox.moe/oaolvu.png)
<br>
![](https://files.catbox.moe/ksuyjb.png)
```
<link rel="icon" type="image/x-icon" href="favicon.ico"> の行と
"<!-- Scripts are loaded at the end of the body to improve page load speed --> の行の間に

<link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">
<script src="scripts/extensions/image_display_extension/image-display.js"></script>
<link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">
<script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>
<link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">
<script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>

⇧の６行を追記する
```
![](https://files.catbox.moe/cqdh2b.png)
<br>
<br>
これでインストールは完了です<br>
chat-window-onoffとtext_styling_extensionはそのまま使えますが<br>
image-displayに関してはキーワードファイルの設定が必要です<br>
<br>
# image-display
背景とは別に画像表示ウインドウを用意し、ユーザーが入力したキーワードに応じて画像を自動的に切り替える機能です<br>
<br>
![](https://files.catbox.moe/e6n5w8.png)<br>
<br>
画面左下に殆ど透明な3つのボタンがあります<br>
「カスタムボタン」を押すとパネルが開いてウインドウの位置とサイズを自由に調整出来ます<br>
マウスでウインドウの端を直接ドラッグしても位置とサイズを自由に変更出来ます<br>
「最大化ボタン」を押すとウインドウが最大サイズに引き伸ばされます<br>
「左半分ボタン」を押すとウインドウが画面の左半分に寄ります<br>
<br>
<br>
次に画像の自動変更の説明です<br>
**SillyTavern/public/scripts/extensions/image_display_extension/character_image_mapping**を開くと<br>
中に**sample.json**というJSONファイルが入っているのでテキストエディタで開きます
```
{
    "山": "https://files.catbox.moe/fnbsc1.png",
    "川": "https://files.catbox.moe/8xv1lx.png",
    "町": "https://files.catbox.moe/gci6w9.png",
    "default": "https://files.catbox.moe/94yxhd.png"
}
```
JSONファイルは上記のような構造になっています<br>
「"」で囲まれた、"山"や"川"といった単語がチャット欄に入力されると<br>
単語と関連したアドレスの画像が画像表示ウインドウに表示されます<br>
単語が何も入力されていない場合は"default"のアドレスの画像が表示されます<br>
アドレス欄は自分で自由に変更して下さい<br>
<br>
![](https://files.catbox.moe/izaf0p.png)<br>
<br>
次に**sample.json**のファイル名を変更してキャラクター毎に対応させます<br>
JSONファイルは画像と単語の組み合わせ情報なので、キャラの数だけJSONファイルが必要です<br>
<br>
![](https://files.catbox.moe/j8vxgd.png)<br>
<br>
①画面右上のキャラクター管理アイコンをクリックして<br>
②その下のキャラ選択アイコンをクリック<br>
③一覧表示されるキャラの名前と同じファイル名のJSONファイルを作る<br>
<br>
![](https://files.catbox.moe/1k72ko.png)<br>
<br>
これでキャラが選択されると自動的にJSONファイルが読み込まれ<br>
自動的に単語と結びつく画像が表示されます<br>
<br>
# chat-window-onoff<br>
チャットウインドウの表示と非表示を切り替えれるようになります<br>
<br>
![](https://files.catbox.moe/q4zf8w.png)<br>
<br>
画面左下にある殆ど透明な💡電球のアイコンをクリックするとチャットウインドウが隠れます<br>
一度💡電球アイコンを押すと、アイコン自体が完全な透明になって全く見えなくなりますが<br>
アイコンのあった場所をもう一度クリックするとウインドウとアイコンが再び表示されます<br>
<br>
# text_styling_extension<br>
左下の⚙歯車アイコンをクリックすると操作パネルが開きます<br>
パネルを操作することで文字のサイズや色をタグ別に調整することが出来ます<br>
タグは<p、<q、<emの3種類あり、
<br>
<pは通常テキスト、<qはキャラのセリフなど、<emは「*」で囲まれた文字列です<br>
パネルではサイズ、太さ、行間、透過度、文字色、縁取り色、縁取り幅などが設定出来ます<br>
「このスタイルを有効にする」のチェックを外すと、そのタグに対する装飾が無効になります<br>
⚙歯車アイコンをもう一度押すと操作パネルが隠れます<br>
<br>
![](https://files.catbox.moe/pmrh2y.png)<br>
<br>
⚙歯車アイコンの右側には殆ど透明な「中央ボタン」と「右半分ボタン」があります<br>
中央ボタンを押すとチャットウインドウが中央に、右半分ボタンを押すと右半分に寄ります<br>
<br>
![](https://files.catbox.moe/pp9lxk.png)<br>
<br>
チャットウインドウの右上をドラッグすると位置を変更、ウインドウの右下をドラッグするとサイズを変更出来ます<br>
<br>
