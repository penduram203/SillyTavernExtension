@echo off
setlocal

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

:: 必要なディレクトリとファイルの存在確認
if not exist "%ROOT_DIR%public\scripts\extensions" (
   echo public/scripts/extensions ディレクトリが見つかりません
   echo インストーラーは SillyTavern/installer/ に配置してください。
   pause
   exit /b 1
)
if not exist "%INSTALLER_DIR%install_core.ps1" (
   echo 必要なファイル install_core.ps1 が見つかりません。
   echo バッチファイルと同じ場所に配置してください。
   pause
   exit /b 1
)

:: 拡張機能のコピー（強制上書き）
echo 拡張機能をコピーしています...
robocopy "%INSTALLER_DIR%extensions" "%ROOT_DIR%public\scripts\extensions" /E /IS /IT /NFL /NDL /NJH /NJS /nc /ns /np >nul

:: default.pngのコピー処理
if not exist "%ROOT_DIR%public\addchara\" (
   mkdir "%ROOT_DIR%public\addchara\"
   echo addcharaディレクトリを作成しました
)
if not exist "%ROOT_DIR%public\addchara\default.png" (
   copy "%INSTALLER_DIR%default.png" "%ROOT_DIR%public\addchara\" >nul
   echo default.pngをコピーしました
)

:: index.htmlの編集
echo index.htmlを編集しています...
set "index_file=%ROOT_DIR%public\index.html"

if not exist "%index_file%" (
   echo index.htmlが見つかりません: %index_file%
   pause
   exit /b 1
)

:: バックアップを作成
copy /y "%index_file%" "%index_file%.bak" >nul
echo index.htmlのバックアップを作成しました: %index_file%.bak

:: ================================================================
:: PowerShellスクリプトを呼び出して、安全にファイル編集を行う
:: ================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%INSTALLER_DIR%install_core.ps1" -filePath "%index_file%"

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo !!  index.html の編集に失敗しました。            !!
    echo !!  SillyTavernのバージョンが対応していないか、   !!
    echo !!  ファイルが変更されている可能性があります。     !!
    echo !!  バックアップからファイルを復元してください。     !!
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo バックアップファイル: %index_file%.bak
) else (
    echo.
    echo インストールが正常に完了しました。
)

echo.
pause
