# 引数からファイルパスを受け取る
param(
    [string]$filePath
)

# 処理が成功したかどうかを判定するための終了コード
$exitCode = 1

try {
    # ファイルの存在チェック
    if (-not (Test-Path $filePath)) {
        Write-Host "Error: File not found at '$filePath'" -ForegroundColor Red
        exit $exitCode
    }

    # 各種文字列の定義
    $startStr = '<link rel="icon" type="image/x-icon" href="favicon.ico">'
    $endStr = '<!-- Scripts are loaded at the end of the body to improve page load speed -->'
    $newLine = [System.Environment]::NewLine
    
    # 挿入するHTMLブロックをヒアドキュメントで定義
    $insertBlock = @"
    <link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">
    <script src="scripts/extensions/image_display_extension/image-display.js"></script>
    <link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">
    <script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>
    <link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">
    <script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>
    <link rel="stylesheet" href="scripts/extensions/right_nav_kai/right_nav_kai.css">
    <script src="scripts/extensions/right_nav_kai/right_nav_kai.js"></script>
    <link rel="stylesheet" href="scripts/extensions/stj_editor/stj_editor.css">
    <script src="scripts/extensions/stj_editor/stj_editor.js"></script>
"@

    # ファイルをUTF-8として正しく読み込む
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8

    # 開始タグと終了タグの位置を検索
    $startIndex = $content.IndexOf($startStr)
    $endIndex = $content.IndexOf($endStr)

    # エラーチェック（英語メッセージに変更）
    if ($startIndex -eq -1) {
        Write-Host "Error: Start tag not found. The version of SillyTavern might be incompatible or the file has been modified." -ForegroundColor Red
        Write-Host "Expected start tag: $startStr"
        exit $exitCode
    }
    if ($endIndex -eq -1) {
        Write-Host "Error: End tag not found. The version of SillyTavern might be incompatible or the file has been modified." -ForegroundColor Red
        Write-Host "Expected end tag: $endStr"
        exit $exitCode
    }
    if ($startIndex -ge $endIndex) {
        Write-Host "Error: The order of the start and end tags is incorrect." -ForegroundColor Red
        exit $exitCode
    }

    # 新しいコンテンツを構築
    $firstPartEnd = $startIndex + $startStr.Length
    $firstPart = $content.Substring(0, $firstPartEnd)
    $secondPart = $content.Substring($endIndex)
    
    # 全てを結合
    $newContent = "$firstPart$newLine$insertBlock$newLine$secondPart"

    # ファイルに書き込む (UTF-8, BOMなし)
    [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.UTF8Encoding]::new($false))
    
    Write-Host "index.html has been successfully modified." -ForegroundColor Green
    $exitCode = 0 # 成功
}
catch {
    Write-Host "An unexpected error occurred during the PowerShell script execution." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
finally {
    exit $exitCode
}
