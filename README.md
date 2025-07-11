# インストール
まず　https://github.com/penduram203/SillyTavernExtension/tree/main
にアクセスし、<br>
「<> code」をクリックしてから「Download ZIP」をクリックしてファイルをダウンロード<br>
![](https://files.catbox.moe/pn6hwh.png)<br>
<br>
ZIPファイルを解凍して、中にあるinstallerフォルダをSillyTavernフォルダに移動させる<br>
![](https://files.catbox.moe/lzsx5l.png)<br>
<br>
installerフォルダを開いてinstall.batをクリックして自動インストール開始<br>
linuxならinstall.shを自動インストール方法.txtに書いてある手順でインストール<br>
失敗する場合は手動インストール.txtを見て下さい<br>
![](https://files.catbox.moe/7humtn.png)<br>
<br>
これでインストール完了です<br>
<br>
# キャラクターの自作
#### 拡張機能とは無関係の公式機能ですが一応キャラ作成の方法を紹介しておきます<br>
#### まずキャラクター管理パネルを開いて新規キャラ作成アイコンをクリックします
![](https://files.catbox.moe/8bw9z3.png)<br>
<br>
#### 適当に記入して、入力が終わったら「キャラ作成」ボタンを押します<br>
#### より複雑なキャラを作成したい場合は「高度な設定」ボタンで編集して下さい
![](https://files.catbox.moe/ksi59b.png)<br>
<br>
#### これで自作キャラの完成です
![](https://files.catbox.moe/7qcqcc.png)<br>
# 画像の自動切り替え
背景とは別に画像表示ウインドウを用意し、ユーザーが入力したキーワードに応じて画像を自動的に切り替える機能です<br>
画面左下に殆ど透明な3つのボタンがあります<br>
<br>
「カスタムボタン」を押すとパネルが開いてウインドウの位置とサイズを自由に調整出来ます<br>
マウスでウインドウの端を直接ドラッグしても位置とサイズを自由に変更出来ます<br>
「最大化ボタン」を押すとウインドウが最大サイズに引き伸ばされます<br>
「左半分ボタン」を押すとウインドウが画面の左半分に寄ります<br>
![](https://files.catbox.moe/6am0o4.png)<br>
<br>
### 画像マッピング<br>
画像の自動切り替えを機能させる為にいくつか設定が必要です<br>
まずキャラクターを決めて、インストール時に自動作成された「addchara」フォルダの中に「キャラクター名」フォルダを作成します<br>
例えば「azusa」という名前のキャラなら**SillyTavern/public/addchara/azusa/** となります<br>
キャラクター名のフォルダが既に存在する場合は新規作成の必要はありません<br>
<br>
フォルダを作ったらキャラクターエディット画面から **「JSONデータ編集」** ボタンを押します
![](https://files.catbox.moe/qsxfwl.png)<br>
<br>
すると以下のようなウインドウが開いてJSONデータの編集モードになります<br>
キーワードや画像ファイル名は自由に変更して下さい<br>
![](https://files.catbox.moe/z4prql.png)<br>
⇧の設定画面の内容通りに画像ファイルをaddchara/キャラクター名/の中に配置します<br>
例えば上記の構成なら「サキュバス城」という名前のフォルダ内に画像ファイルを全て置いて下さい<br>
次にJSON出力ボタンで「キャラクター名_ext.json」をダウンロードして同じフォルダに入れて下さい<br>
⇩のように画像ファイルとJSONが揃えば準備完了です<br>
![](https://files.catbox.moe/v9vg7f.png)<br>
<br>
全て完了したらSillyTavernを再起動して当該キャラを選択してチャットを開始します<br>
最初はデフォルト状態の「defa.png」が表示され<br>
「"」で囲まれた、"地下室"や"玉座の間"といった単語がチャット欄に入力されると<br>
単語と関連したアドレスの画像が画像表示ウインドウに表示されます<br>
# キャラクターの配布<br>
①エクスポートのボタンを押して、②JSON形式を選択すると、キャラクター名.jsonファイルがダウンロードされます<br>
![](https://files.catbox.moe/jmswpn.png)<br>
<br>
**キャラクター名.json** にはキャラクターの設定やプロフィールが格納され、<br>
**キャラクター名_ext.json** には画像切り替えのキーワード等が格納されます<br>
先に用意しておいた①画像ファイル②キャラクター名_ext.jsonに、③キャラクター名.jsonを加え、<br>
このフォルダを丸ごとZIPに圧縮して配布します<br>
![](https://files.catbox.moe/2mjame.png)<br>
#### これからSillyTavernでキャラを公開しようとしてる人達が上記の形式のZIPでキャラクターを配布すれば <br>
#### ユーザー側は簡単に画像自動切り替え機能付きのAIチャットを楽しめるはずですから、それを推奨します <br>
# ユーザーがやるべきこと<br>
ユーザーはダウンロードしたZIPファイルを解凍してフォルダごとpublic/addcharaフォルダにいれます<br>
**一旦SillyTavernを開いたブラウザの画面をF5キーで更新するか、ブラウザの更新ボタンを押して下さい**<br>
**更新ボタンを押さずにキャラをインポートすると正常に認識されませんのでご注意下さい**<br>
その状態でSillyTavernのキャラ選択画面からキャラクターインポートボタンをクリックします<br>
![](https://files.catbox.moe/7nubgm.png)<br>
<br>
ダウンロードしたキャラ名のフォルダを参照し、キャラクター名.jsonを選択すればインポート完了です<br>
# チャットウインドウの表示切り替え<br>
![](https://files.catbox.moe/38e5mq.png)<br>
<br>
画面左下にある殆ど透明な💡電球のアイコンをクリックするとチャットウインドウが隠れます<br>
💡電球アイコンをもう一度クリックするとチャットウインドウが再び表示されます<br>
<br>
# テキスト操作パネル<br>
左下の⚙歯車アイコンをクリックすると操作パネルが開きます<br>
パネルを操作することで文字のサイズや色をタグ別に調整することが出来ます<br>
タグは<p、<q、<emの3種類あり、
<br>
<pは通常テキスト、<qはキャラのセリフなど、<emは「*」で囲まれた文字列です<br>
パネルではサイズ、太さ、行間、透過度、文字色、縁取り色、縁取り幅などが設定出来ます<br>
「このスタイルを有効にする」のチェックを外すと、そのタグに対する装飾が無効になります<br>
⚙歯車アイコンをもう一度押すと操作パネルが隠れます<br>
<br>
![](https://files.catbox.moe/m7mz6i.png)<br>
<br>
⚙歯車アイコンの右側には殆ど透明な「中央ボタン」と「右半分ボタン」があります<br>
中央ボタンを押すとチャットウインドウが中央に、右半分ボタンを押すと右半分に寄ります<br>
<br>
![](https://files.catbox.moe/jnkvn3.png)<br>
<br>
チャットウインドウの右上をドラッグすると位置を変更、ウインドウの右下をドラッグするとサイズを変更出来ます<br>
<br>
