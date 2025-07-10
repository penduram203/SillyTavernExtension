#!/bin/bash

# インストーラーのディレクトリパスを取得
INSTALLER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ルートディレクトリを設定 (SillyTavernのルート)
ROOT_DIR="$(dirname "$INSTALLER_DIR")"

# 管理者権限チェック
if [ "$EUID" -ne 0 ]; then
  echo "管理者権限が必要です。sudoで実行してください:"
  echo "  sudo ./install.sh"
  exit 1
fi

# 必要なディレクトリの存在確認
if [ ! -d "$ROOT_DIR/public/scripts/extensions" ]; then
  echo "public/scripts/extensions ディレクトリが見つかりません"
  echo "カレントディレクトリ: $(pwd)"
  echo "インストーラーは SillyTavern/installer/ に配置し、SillyTavernルートで実行してください"
  exit 1
fi

# 拡張機能のコピー（強制上書き）
cp -rf "$INSTALLER_DIR/extensions/chat_window_onoff" "$ROOT_DIR/public/scripts/extensions/"
cp -rf "$INSTALLER_DIR/extensions/image_display_extension" "$ROOT_DIR/public/scripts/extensions/"
cp -rf "$INSTALLER_DIR/extensions/right_nav_kai" "$ROOT_DIR/public/scripts/extensions/"
cp -rf "$INSTALLER_DIR/extensions/text_styling_extension" "$ROOT_DIR/public/scripts/extensions/"
cp -rf "$INSTALLER_DIR/extensions/stj_editor" "$ROOT_DIR/public/scripts/extensions/"

# default.pngのコピー処理（修正部分）
# ① addcharaディレクトリの存在確認
if [ ! -d "$ROOT_DIR/public/addchara" ]; then
  # ② 存在しない場合は作成
  mkdir -p "$ROOT_DIR/public/addchara"
fi

# ④ addchara内にdefault.pngが存在するか確認
if [ ! -f "$ROOT_DIR/public/addchara/default.png" ]; then
  # ⑤ 存在しない場合のみコピー
  cp "$INSTALLER_DIR/default.png" "$ROOT_DIR/public/addchara/"
fi

# index.htmlの編集
index_file="$ROOT_DIR/public/index.html"
start_str='<link rel="icon" type="image/x-icon" href="favicon.ico">'
end_str='<!-- Scripts are loaded at the end of the body to improve page load speed -->'

insert_lines='
    <link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">
    <script src="scripts/extensions/image_display_extension/image-display.js"></script>
    <link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">
    <script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>
    <link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">
    <script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>
    <link rel="stylesheet" href="scripts/extensions/right_nav_kai/right_nav_kai.css">
    <script src="scripts/extensions/right_nav_kai/right_nav_kai.js"></script>
    <link rel="stylesheet" href="scripts/extensions/stj_editor/stj_editor.css">
    <script src="scripts/extensions/stj_editor/stj_editor.js"></script>'

if [ ! -f "$index_file" ]; then
  echo "index.htmlが見つかりません: $index_file"
  exit 1
fi

# バックアップ作成
cp "$index_file" "${index_file}.bak"

# セクション置換処理
awk -v start="$start_str" \
    -v end="$end_str" \
    -v insert="$insert_lines" '
BEGIN { in_section=0; printed=0 }
{
  if ($0 ~ start) {
    print $0
    print insert
    in_section=1
    printed=1
  } else if ($0 ~ end) {
    in_section=0
    print $0
    printed=1
  } else if (in_section) {
    # セクション内の行はスキップ
    printed=0
  } else {
    print $0
    printed=1
  }
}
END { if (!printed) print }' "$index_file" > "${index_file}.tmp"

# ファイル置換
mv "${index_file}.tmp" "$index_file"

echo "インストールが完了しました"
echo "拡張機能: $ROOT_DIR/public/scripts/extensions/"
echo "デフォルト画像: $ROOT_DIR/public/addchara/"
echo "index.htmlのバックアップ: ${index_file}.bak"

chmod -R 777 $ROOT_DIR/public/scripts/extensions/
chmod -R 777 $ROOT_DIR/public/index.html
chmod -R 777 $ROOT_DIR/public/addchara
