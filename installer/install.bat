@echo off
setlocal enabledelayedexpansion

:: インストーラーのディレクトリパスを取得
set "INSTALLER_DIR=%~dp0"

:: ルートディレクトリを設定 (SillyTavernのルート)
set "ROOT_DIR=%INSTALLER_DIR%..\"

:: 管理者権限チェック
net session >nul 2>&1
if %errorlevel% neq 0 (
   echo 管理者権限が必要です。右クリック→「管理者として実行」してください。
   pause
   exit /b 1
)

:: 必要なディレクトリの存在確認
if not exist "%ROOT_DIR%public\scripts\extensions" (
   echo public/scripts/extensions ディレクトリが見つかりません
   echo カレントディレクトリ: %cd%
   echo インストーラーは SillyTavern/installer/ に配置し、SillyTavernルートで実行してください
   pause
   exit /b 1
)

:: 拡張機能のコピー（強制上書き）
robocopy "%INSTALLER_DIR%extensions\chat_window_onoff" "%ROOT_DIR%public\scripts\extensions\chat_window_onoff" /E /IS /IT >nul
robocopy "%INSTALLER_DIR%extensions\image_display_extension" "%ROOT_DIR%public\scripts\extensions\image_display_extension" /E /IS /IT >nul
robocopy "%INSTALLER_DIR%extensions\right_nav_kai" "%ROOT_DIR%public\scripts\extensions\right_nav_kai" /E /IS /IT >nul
robocopy "%INSTALLER_DIR%extensions\text_styling_extension" "%ROOT_DIR%public\scripts\extensions\text_styling_extension" /E /IS /IT >nul

:: default.pngのコピー処理（修正版）
if not exist "%ROOT_DIR%public\addchara\" (
   mkdir "%ROOT_DIR%public\addchara\"
   echo addcharaディレクトリを作成しました
)

if not exist "%ROOT_DIR%public\addchara\default.png" (
   copy "%INSTALLER_DIR%default.png" "%ROOT_DIR%public\addchara\" >nul
   echo default.pngをコピーしました
)

:: index.htmlの編集
set "index_file=%ROOT_DIR%public\index.html"
set "temp_file=%index_file%.tmp"

set "start_str=<link rel="icon" type="image/x-icon" href="favicon.ico">"
set "end_str=<!-- Scripts are loaded at the end of the body to improve page load speed -->"

set "insert_lines=    <link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">\r\n"
set "insert_lines=!insert_lines!    <script src="scripts/extensions/image_display_extension/image-display.js"></script>\r\n"
set "insert_lines=!insert_lines!    <link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">\r\n"
set "insert_lines=!insert_lines!    <script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>\r\n"
set "insert_lines=!insert_lines!    <link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">\r\n"
set "insert_lines=!insert_lines!    <script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>\r\n"
set "insert_lines=!insert_lines!    <link rel="stylesheet" href="scripts/extensions/right_nav_kai/right_nav_kai.css">\r\n"
set "insert_lines=!insert_lines!    <script src="scripts/extensions/right_nav_kai/right_nav_kai.js"></script>"

if not exist "%index_file%" (
   echo index.htmlが見つかりません: %index_file%
   pause
   exit /b 1
)

:: ファイル内容の置換処理
(
   for /f "tokens=1* delims=:" %%a in ('findstr /n "^" "%index_file%"') do (
      set "line=%%b"
      if defined line (
         echo.!line! | findstr /c:"%start_str%" >nul && (
            echo %%b
            echo !insert_lines!
            set "in_section=1"
         ) || (
            echo %%b | findstr /c:"%end_str%" >nul && (
               set "in_section=0"
               echo %%b
            ) || (
               if "!in_section!"=="1" (
                  REM セクション内の行はスキップ
               ) else (
                  echo %%b
               )
            )
         )
      ) else echo.
   )
) > "%temp_file%"

:: ファイル置換とバックアップ
move /y "%index_file%" "%index_file%.bak" >nul
move /y "%temp_file%" "%index_file%" >nul

echo インストールが完了しました
echo 拡張機能: %ROOT_DIR%public\scripts\extensions\
echo デフォルト画像: %ROOT_DIR%public\addchara\
echo index.htmlのバックアップ: %index_file%.bak
pause
