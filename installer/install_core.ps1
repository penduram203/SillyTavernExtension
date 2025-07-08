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
    $startTag = '<link rel="icon" type="image/x-icon" href="favicon.ico">'
    $endTag = '<!-- Scripts are loaded at the end of the body to improve page load speed -->'
    $newLine = [System.Environment]::NewLine
    
    # 挿入するHTMLブロックを定義
    # 前後に改行を1つずつ含めることで、タグとの間に適切なスペースを確保する
    $replacementBlock = @"

    <link rel="stylesheet" href="scripts/extensions/image_display_extension/image-display.css">
    <script src="scripts/extensions/image_display_extension/image-display.js"></script>
    <link rel="stylesheet" href="scripts/extensions/text_styling_extension/text-styling.css">
    <script src="scripts/extensions/text_styling_extension/text-styling.js" defer></script>
    <link rel="stylesheet" href="scripts/extensions/chat_window_onoff/chat_window_onoff.css">
    <script src="scripts/extensions/chat_window_onoff/chat_window_onoff.js"></script>
    <link rel="stylesheet" href="scripts/extensions/right_nav_kai/right_nav_kai.css">
    <script src="scripts/extensions/right_nav_kai/right_nav_kai.js"></script>

"@

    # ファイルをUTF-8として正しく読み込む
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8

    # ==================== ここからが新しいロジック ====================

    # 開始タグと終了タグの位置を検索
    $startIndex = $content.IndexOf($startTag)
    $endIndex = $content.IndexOf($endTag)

    # エラーチェック
    if ($startIndex -eq -1) {
        Write-Host "Error: Start tag not found. The version of SillyTavern might be incompatible." -ForegroundColor Red
        Write-Host "Expected start tag: $startTag"
        exit $exitCode
    }
    if ($endIndex -eq -1) {
        Write-Host "Error: End tag not found. The version of SillyTavern might be incompatible." -ForegroundColor Red
        Write-Host "Expected end tag: $endTag"
        exit $exitCode
    }
    if ($startIndex -ge $endIndex) {
        Write-Host "Error: The order of the start and end tags is incorrect." -ForegroundColor Red
        exit $exitCode
    }

    # 新しいコンテンツを構築する
    # 1. 開始タグの直後までの部分を取得
    $firstPart = $content.Substring(0, $startIndex + $startTag.Length)
    
    # 2. 終了タグ以降の部分を取得
    $secondPart = $content.Substring($endIndex)
    
    # 3. 「開始タグまでの部分」 + 「新しいブロック」 + 「終了タグ以降の部分」 を結合
    #    これにより、間の部分は完全に破棄・置換される
    $newContent = $firstPart + $replacementBlock + $secondPart

    # ==================== 新しいロジックここまで ====================

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
