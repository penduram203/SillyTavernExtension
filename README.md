SillyTavernの拡張機能です<br>
<br>
# インストール方法
まず　https://github.com/penduram203/SillyTavernExtension/tree/main
にアクセスし、<br>
「<> code」をクリックしてから「Download ZIP」をクリックしてファイルをダウンロード<br>
![](https://files.catbox.moe/0uhqi3.png)<br>
<br>
ZIPを解凍して出来る①「right_nav_kai」②「image_display_extension」③「chat_window_onoff」④「text_styling_extension」の４つを、全て**SillyTavern/public/scripts/extensions**の中に入れる<br>
![](https://files.catbox.moe/kx5pck.png)<br>
<br>
次に**SillyTavern/public**の中にある**index.html**をテキスト閲覧ソフトで編集する<br>
![](https://files.catbox.moe/oaolvu.png)<br>
<br>

```
上から４５〜５０行目辺りにある
<link rel="icon" type="image/x-icon" href="favicon.ico"> の行と
"<!-- Scripts are loaded at the end of the body to improve page load speed --> の行の間に



<link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">
<script src="scripts/extensions/image_display_extension/image-display.js"></script>
<link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">
<script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>
<link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">
<script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>
<link rel="stylesheet" href="scripts/extensions/right_nav_kai/right_nav_kai.css">
<script src="scripts/extensions/right_nav_kai/right_nav_kai.js"></script>

⇧の８行を追記して保存
```
![](https://files.catbox.moe/ksuyjb.png)
![](https://files.catbox.moe/vt3zo4.png)
<br>
<br>
次にSillyTavern/publicの中に「addchara」という名前の新規フォルダを作成します<br>
![](https://files.catbox.moe/f3k0r6.png)<br>
<br>
最後に「addchara」フォルダの中に貴方の好きな画像を作成しdefault.pngと名付けます<br>
このdefault.pngは画像表示エリアのデフォルト画像として機能します<br>
<br>
これでインストールは完了です<br>
chat-window-onoffとtext_styling_extensionはそのまま使えますが<br>
right_nav_kaiとimage-displayに関しては追加設定が必要です<br>
<br>
# ①right_nav_kai
画面右上のキャラクター管理パネルのUIを変更します<br>
単にキャラ画像を大きく表示するだけの拡張機能ですが画像を変更するには設定が必要です<br>
ただしキャラ作者が予め設定しておけばユーザー側は設定不要です
![](https://files.catbox.moe/ngee0a.png)<br>
<br>
まず画像を変更したいキャラクター名を把握し、<br>
次にインストール時に作った「addchara」フォルダ内に、「キャラクター名」フォルダを作ります<br>
例えばCerebryxという名前のキャラクターの画像を変更したい時はCerebryxという名前の新規フォルダを作ります<br>
既にキャラ名のフォルダが存在する場合は新規作成しなくていいです<br>
![](https://files.catbox.moe/vb1ntj.png)<br>
<br>
次に「キャラクター名」フォルダの中に「キャラクター名」テキストファイルを新規作成し、拡張子をtxtからjsonに変えます<br>
CerebryxというキャラならCerebryx.txtというファイルを作り、拡張子をjsonに変更し、Cerebryx.jsonというJSONファイルを作ります<br>
この時点でフォルダ構成は **SillyTavern/public/addchara/キャラクター名/キャラクター名.json** となっているはずです<br>
既にキャラ名のJSONファイルが存在する場合は新規作成しなくていいです<br>
![](https://files.catbox.moe/j57nud.png)<br>
### ケース①新規にJSONファイルを作った場合
新規作成の場合のJSONファイルは単純な構造です<br>
白紙の新規JSONファイルを開いたら以下のように書き込んで保存します
```
{
    "image_display_extension":{
    "thumbnail": "addchara/キャラクター名/適当なファイル名.png"
    }
}
```
Cerebryxというキャラなら以下のように書き込んで保存します
```
{
    "image_display_extension":{
    "thumbnail": "addchara/Cerebryx/適当なファイル名.png"
    }
}
```
### ケース②既にJSONファイルがあり、複雑な構成になっている場合
chub.aiなどからインポートしたキャラや編集中の自作キャラなどの場合はJSONの構造が複雑な場合があります<br>
JSONファイルを開いて下の方までスクロールすると以下のようなコードが書かれているので
```
        "post_history_instructions": "",
        "tags": [],
        "creator": "",
        "character_version": "",
        "alternate_greetings": [],
        "extensions": {
            "talkativeness": "0.5",
            "fav": false,
            "world": "",
            "depth_prompt": {
                "prompt": "",
                "depth": 4,
                "role": "system"
            }
        },
        "group_only_greetings": []
    },
    "create_date": "2025-7-1 @16h 12m 16s 315ms"
}
```
次のように書き換えましょう。「,」や「{}」の位置に注意して下さい
```
        "post_history_instructions": "",
        "tags": [],
        "creator": "",
        "character_version": "",
        "alternate_greetings": [],
        "extensions": {
            "talkativeness": "0.5",
            "fav": false,
            "world": "",
            "depth_prompt": {
                "prompt": "",
                "depth": 4,
                "role": "system"
            },
            "image_display_extension": {
            "thumbnail": "addchara/キャラクター名/適当なファイル名.png"
            }
        },
        "group_only_greetings": []
    },
    "create_date": "2025-7-1 @16h 12m 16s 315ms"
}
```
次にJSONファイル内に書かれたファイル名と同じ名前の画像ファイルを用意します<br>
これが実際に表示される画像ファイルです<br>
「適当なファイル名」の部分は本当に適当にどんな名前でもいいです<br>
JSON内部のファイル名と画像ファイルの名前さえ一致すればいいので<br>
「tekitou.png」や「イベントCG_001.png」とかでも構いません<br>
![](https://files.catbox.moe/0mml32.png)
<br>
この状態でSillyTavernを再起動し、キャラクター選択パネルを開くと画像が更新されています<br>
![](https://files.catbox.moe/11n54n.png)<br>
<br>
以上で説明は終了です。<br>
なお、ちゃんと設定したのに画質が凄く粗い場合は「小さなサムネ画像が無理に引き伸ばされて表示されている」だけで<br>
それは設定をミスしているか、最初から設定されていないかのどちらかです。
# ②image-display
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
### 画像の自動変更<br>
image-displayにはチャット欄に入力されたキーワードに反応して画像表示ウインドウの画像を自動変更する機能があります<br>
これを機能させる為にいくつか設定が必要です<br>
JSONファイルを用意するまでは①right_nav_kaiと同じなのでそちらを参考にして下さい<br>
<br>
まずインストール時に作った「addchara」フォルダを開き、「キャラクター名」フォルダを新規作成し、<br>
その中に「キャラクター名.json」ファイルを新規作成します<br>
フォルダ構成は　**SillyTavern/public/addchara/キャラクター名/キャラクター名.json**　です<br>
キャラクター名のフォルダやJSONファイルが既に存在する場合は新規作成の必要はありません<br>
ここまではright_nav_kaiの解説と同じです<br>
<br>
以下の内容もright_nav_kaiの解説と似ています<br>
### ケース①新規にJSONファイルを作った場合
新規作成の場合のJSONファイルは単純な構造です<br>
白紙の新規JSONファイルを開いたら以下のように書き込んで保存します
```
{
    "image_display_extension":{
    "山": "addchara/キャラクター名/適当なファイル名1.png",
    "川": "addchara/キャラクター名/適当なファイル名2.png",
    "町": "addchara/キャラクター名/適当なファイル名3.png",
    "default": "addchara/キャラクター名/適当なファイル名0.png"
    }
}

この⇩ように入力すると「町」「街」「マチ」「まち」４つの単語全てに反応します

"町|街|マチ|まち": "addchara/キャラクター名/適当なファイル名.png",
```
次にJSONファイルの内容通りに画像ファイルをaddchara/キャラクター名/の中に配置します<br>
キャラ名やアドレス欄は自分で自由に変更して下さい<br>
キーワードもキャラ名も画像ファイル名も自由ですが、キャラ名は実際のフォルダ名と一致させて下さい
```
{
    "image_display_extension":{
    "ダンジョン１階": "addchara/RPG風味/CG001.png",
    "ダンジョン２階": "addchara/RPG風味/CG002.png",
    "街の宿屋": "addchara/RPG風味/CG003.png",
    "default": "addchara/RPG風味/default.png"
    }
}
```
例えば上記の構成なら「RPG風味」というフォルダ内にキャラクター名.jsonと画像ファイルを全て置いて下さい<br>
![](https://files.catbox.moe/5i2aad.png)<br>
<br>
全て完了したらSillyTavernを再起動して当該キャラを選択してチャットを開始します<br>
最初はデフォルト状態の「default.png」が表示され<br>
「"」で囲まれた、"ダンジョン１階"や"街の宿屋"といった単語がチャット欄に入力されると<br>
単語と関連したアドレスの画像が画像表示ウインドウに表示されます<br>
<br>
以下の画像では"川"という単語に反応して対応する画像が表示されています<br>
![](https://files.catbox.moe/izaf0p.png)<br>
<br>
下記のようにimage_displayとright_nav_kaiの２つの情報を一括で記述することも出来ます<br>
慣れてきたら下記のように一気に記述しましょう<br>
そうすればimage_displayとright_nav_kaiの２つの設定を同時に済ませられます
```
{
    "image_display_extension":{
    "ダンジョン１階": "addchara/RPG風味/CG001.png",
    "ダンジョン２階": "addchara/RPG風味/CG002.png",
    "街の宿屋": "addchara/RPG風味/CG003.png",
    "default": "addchara/RPG風味/default.png",
    "thumbnail": "addchara/RPG風味/thumbnail.png"
    }
}
```
### ケース②既にJSONファイルがあり、複雑な構成になっている場合
chub.aiなどからインポートしたキャラや編集中の自作キャラなどの場合はJSONの構造が複雑な場合があります<br>
JSONファイルを開いて下の方までスクロールすると以下のようなコードが書かれているので
```
        "post_history_instructions": "",
        "tags": [],
        "creator": "",
        "character_version": "",
        "alternate_greetings": [],
        "extensions": {
            "talkativeness": "0.5",
            "fav": false,
            "world": "",
            "depth_prompt": {
                "prompt": "",
                "depth": 4,
                "role": "system"
            }
        },
        "group_only_greetings": []
    },
    "create_date": "2025-7-1 @16h 12m 16s 315ms"
}
```
次のように書き換えましょう。「,」や「{}」の位置に注意して下さい
```
        "post_history_instructions": "",
        "tags": [],
        "creator": "",
        "character_version": "",
        "alternate_greetings": [],
        "extensions": {
            "talkativeness": "0.5",
            "fav": false,
            "world": "",
            "depth_prompt": {
                "prompt": "",
                "depth": 4,
                "role": "system"
            },
            "image_display_extension":{
            "ダンジョン１階": "addchara/RPG風味/CG001.png",
            "ダンジョン２階": "addchara/RPG風味/CG002.png",
            "街の宿屋": "addchara/RPG風味/CG003.png",
            "default": "addchara/RPG風味/default.png",
            "thumbnail": "addchara/RPG風味/thumbnail.png"
            }
        },
        "group_only_greetings": []
    },
    "create_date": "2025-7-1 @16h 12m 16s 315ms"
}
```
JSONが出来たらケース①と同じく画像ファイルをaddchara/キャラクター名/の中に配置し<br>
再起動して当該キャラとのチャットを開始すればキーワードに応じて画像が自動で切り替わります

```
{
    "image_display_extension":{
    "シーン00": "適当アドレス00",
    "シーン01": "適当アドレス01",
    "シーン02": "適当アドレス02",
    "シーン03": "適当アドレス03",
    "シーン04": "適当アドレス04",
    "シーン05": "適当アドレス05",
    "シーン06": "適当アドレス06",
    "シーン07": "適当アドレス07",
    "シーン08": "適当アドレス08",
    "シーン09": "適当アドレス09",
    "シーン10": "適当アドレス10",
    "シーン11": "適当アドレス11",
    "シーン12": "適当アドレス12",
    "シーン13": "適当アドレス13",
    "default": "適当アドレス"
    }
}
```
シーンとアドレスの数を増やせば上記のように大量のCGを管理する事も出来ます<br>
<br>
これでキャラが選択されると自動的にJSONファイルが読み込まれ<br>
自動的に単語と結びつく画像が表示されます<br>
<br>
### ただし、これらは全てキャラ作者がCGとJSONファイルを用意してある前提です <br>
### 「image-display」は飽くまで画像の自動切り替えツールであってCGとJSONファイルは全く別に用意しないといけません <br>
### 理想形はキャラ作者がCGをアップしてJSONファイルを作成し、キャラとJSONファイルをZIPで同時配布する方法です <br>
### その方法ならユーザーの手間は①ZIPをダウンロード②解凍したフォルダをaddcharaフォルダに入れる<br>
### この２つだけで済みますから楽なはずです <br>
### これからSillyTavernでキャラを公開しようとしてる人達は、出来たら画像ファイルとJSONファイルをZIPで同時配布してあげれば <br>
### ユーザー側は手間要らずで画像自動切り替え機能付きのAIチャットを楽しめるはずですから、それを推奨します <br>
<br>

# ③chat-window-onoff<br>
チャットウインドウの表示と非表示を切り替えれるようになります<br>
<br>
![](https://files.catbox.moe/q4zf8w.png)<br>
<br>
画面左下にある殆ど透明な💡電球のアイコンをクリックするとチャットウインドウが隠れます<br>
💡電球アイコンをもう一度クリックするとチャットウインドウが再び表示されます<br>
<br>
# ④text_styling_extension<br>
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
