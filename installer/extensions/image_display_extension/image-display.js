document.addEventListener('DOMContentLoaded', () => {
    console.log("Image Display: DOMContentLoaded イベント発生。初期化を開始します。");

    // --- デフォルト値とグローバル変数の定義 ---
    const DEFAULT_WIDTH = 300,
        DEFAULT_HEIGHT = 200,
        DEFAULT_LEFT = 100,
        DEFAULT_TOP = 100,
        DEFAULT_BG_COLOR = '#000000';
    const defaultImageMap = {
        "default": "addchara/default"
    };
    let currentCharacter = null,
        currentImageMap = defaultImageMap,
        currentImageUrl = currentImageMap.default;
    let currentMode = 'normal',
        preNormalState = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            left: DEFAULT_LEFT,
            top: DEFAULT_TOP
        };
    let isDragging = false,
        isResizing = false,
        offsetX, offsetY, isCustomWindowOpen = false;
    const imageMapCache = new Map();
    let isDefaultImageFailed = false;

    // ★★★ 追加: テキストモードの変数 ★★★
    let currentTextMode = 'user'; // 'user' または 'ai'

    // ★★★ 追加: ストリーミング検出用の変数 ★★★
    let streamingTimer = null;
    let lastStreamingText = '';
    const STREAMING_DELAY = 1000; // 1秒間テキストに変化がなければストリーミング終了と判断

    // 対応する画像拡張子のリスト
    const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'bmp'];

    // --- 拡張子自動検出関数 ---
    async function detectImageExtension(imagePath) {
        if (!imagePath) return null;
        
        // 既に拡張子がある場合はそのまま返す
        if (imagePath.match(/\.(png|jpg|jpeg|webp|gif|avif|bmp)$/i)) {
            return imagePath;
        }
        
        // 各拡張子を試して存在確認
        for (const ext of ALLOWED_EXTENSIONS) {
            const imagePathWithExt = `${imagePath}.${ext}`;
            const exists = await checkImageExists(imagePathWithExt);
            if (exists) {
                console.log(`✅ 拡張子自動検出: ${imagePathWithExt}`);
                return imagePathWithExt;
            }
        }
        
        console.warn(`⚠️ 画像が見つかりません: ${imagePath}`);
        return null;
    }

    // 画像の存在確認関数
    function checkImageExists(imageUrl) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = imageUrl;
        });
    }

    // 画像マップの拡張子自動検出
    async function detectImageMapExtensions(imageMap) {
        if (!imageMap) return imageMap;
        
        const detectedMap = {};
        
        for (const [key, value] of Object.entries(imageMap)) {
            if (Array.isArray(value)) {
                // 配列の場合：各要素の拡張子を検出
                const detectedArray = [];
                for (const imagePath of value) {
                    const detectedPath = await detectImageExtension(imagePath);
                    if (detectedPath) {
                        detectedArray.push(detectedPath);
                    }
                }
                detectedMap[key] = detectedArray.length > 0 ? detectedArray : value;
            } else if (typeof value === 'string') {
                // 文字列の場合：単一の拡張子を検出
                const detectedPath = await detectImageExtension(value);
                detectedMap[key] = detectedPath || value;
            } else {
                detectedMap[key] = value;
            }
        }
        
        return detectedMap;
    }

    // --- UI要素の作成 ---
    const imageContainer = document.createElement('div');
    imageContainer.id = 'image-display-container';
    document.body.appendChild(imageContainer);
    const header = document.createElement('div');
    header.id = 'image-display-header';
    header.textContent = '画像表示エリア (ドラッグで移動)';
    imageContainer.appendChild(header);
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'bg-color-picker';
    colorPicker.value = DEFAULT_BG_COLOR;
    colorPicker.title = '背景色を変更';
    header.appendChild(colorPicker);
    const imgElement = document.createElement('img');
    imgElement.id = 'displayed-image';
    imgElement.src = currentImageMap.default;
    imageContainer.appendChild(imgElement);
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'resize-handle';
    imageContainer.appendChild(resizeHandle);
    
    // ★★★ 修正: コントロールコンテナ（CSSで横並び・最下部に配置される） ★★★
    const controlContainer = document.createElement('div');
    controlContainer.id = 'image-control-container';
    document.body.appendChild(controlContainer);
    
    // ★★★ 追加: テキストモード切り替えボタン ★★★
    const textModeButton = document.createElement('button');
    textModeButton.id = 'text-mode-button';
    // ★★★ 修正: 「UT」に名称変更 ★★★
    textModeButton.textContent = 'UT';
    textModeButton.title = 'クリックでテキストモード切り替え（ユーザー / AI）';
    controlContainer.appendChild(textModeButton);

    const customButton = document.createElement('button');
    customButton.id = 'custom-button';
    customButton.textContent = 'カスタム';
    customButton.title = 'カスタムモードに切り替え / 設定を開く';
    controlContainer.appendChild(customButton);
    const maximizeButton = document.createElement('button');
    maximizeButton.id = 'maximize-button';
    maximizeButton.textContent = '最大化';
    maximizeButton.title = '画像表示エリアを最大化';
    controlContainer.appendChild(maximizeButton);
    const halfMaximizeButton = document.createElement('button');
    halfMaximizeButton.id = 'half-maximize-button';
    halfMaximizeButton.textContent = '左半分';
    halfMaximizeButton.title = '画像表示エリアを左半分に最大化';
    controlContainer.appendChild(halfMaximizeButton);
    const customWindow = document.createElement('div');
    customWindow.id = 'custom-window';
    document.body.appendChild(customWindow);
    const customWindowTitle = document.createElement('h3');
    customWindowTitle.textContent = 'カスタム設定';
    customWindow.appendChild(customWindowTitle);
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.title = '閉じる';
    customWindow.appendChild(closeButton);
    const clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    customWindow.appendChild(clearDiv);
    const xLabel = document.createElement('label');
    xLabel.htmlFor = 'custom-x';
    xLabel.textContent = 'X座標 (px)';
    customWindow.appendChild(xLabel);
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.id = 'custom-x';
    customWindow.appendChild(xInput);
    const yLabel = document.createElement('label');
    yLabel.htmlFor = 'custom-y';
    yLabel.textContent = 'Y座標 (px)';
    customWindow.appendChild(yLabel);
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.id = 'custom-y';
    customWindow.appendChild(yInput);
    const widthLabel = document.createElement('label');
    widthLabel.htmlFor = 'custom-width';
    widthLabel.textContent = '幅 (px)';
    customWindow.appendChild(widthLabel);
    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.id = 'custom-width';
    customWindow.appendChild(widthInput);
    const heightLabel = document.createElement('label');
    heightLabel.htmlFor = 'custom-height';
    heightLabel.textContent = '高さ (px)';
    customWindow.appendChild(heightLabel);
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.id = 'custom-height';
    customWindow.appendChild(heightInput);

    // --- UI操作のための関数群 ---
    function updateCustomWindow() {
        xInput.value = parseInt(imageContainer.style.left) || DEFAULT_LEFT;
        yInput.value = parseInt(imageContainer.style.top) || DEFAULT_TOP;
        widthInput.value = imageContainer.offsetWidth;
        heightInput.value = imageContainer.offsetHeight;
    }

    function handleCustomInput() {
        if (currentMode === 'normal') {
            imageContainer.style.left = `${xInput.value}px`;
            imageContainer.style.top = `${yInput.value}px`;
            imageContainer.style.width = `${widthInput.value}px`;
            imageContainer.style.height = `${heightInput.value}px`;
            saveDisplayState();
        }
    }
    xInput.addEventListener('input', handleCustomInput);
    yInput.addEventListener('input', handleCustomInput);
    widthInput.addEventListener('input', handleCustomInput);
    heightInput.addEventListener('input', handleCustomInput);

    function toggleCustomWindow() {
        isCustomWindowOpen = !isCustomWindowOpen;
        if (isCustomWindowOpen) {
            customWindow.style.display = 'block';
            updateCustomWindow();
        } else {
            customWindow.style.display = 'none';
        }
    }

    function closeCustomWindow() {
        if (isCustomWindowOpen) {
            isCustomWindowOpen = false;
            customWindow.style.display = 'none';
        }
    }
    closeButton.addEventListener('click', toggleCustomWindow);
    customButton.addEventListener('click', () => {
        if (currentMode !== 'normal') {
            applyNormalMode();
            saveDisplayState();
        }
        toggleCustomWindow();
    });

    // ★★★ 追加: テキストモード切り替え関数 ★★★
    function toggleTextMode() {
        currentTextMode = currentTextMode === 'user' ? 'ai' : 'user';
        // ★★★ 修正: 「UT」と「AI」に表示変更 ★★★
        textModeButton.textContent = currentTextMode === 'user' ? 'UT' : 'AI';
        textModeButton.title = `クリックでテキストモード切り替え（現在: ${currentTextMode === 'user' ? 'ユーザー' : 'AI'}）`;
        console.log(`🔄 テキストモードを切り替え: ${currentTextMode}`);
        saveDisplayState();
        updateImage(); // モード切り替え時に画像を更新
    }
    
    textModeButton.addEventListener('click', toggleTextMode);

    function saveDisplayState() {
        if (currentMode === 'normal') {
            preNormalState = {
                width: imageContainer.offsetWidth,
                height: imageContainer.offsetHeight,
                left: parseInt(imageContainer.style.left) || DEFAULT_LEFT,
                top: parseInt(imageContainer.style.top) || DEFAULT_TOP
            };
        }
        const state = {
            bgColor: colorPicker.value,
            currentMode: currentMode,
            preNormalState: preNormalState,
            // ★★★ 追加: テキストモードを保存 ★★★
            textMode: currentTextMode
        };
        localStorage.setItem('imageDisplayState', JSON.stringify(state));
    }

    function restoreDisplayState() {
        const savedState = localStorage.getItem('imageDisplayState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.preNormalState) preNormalState = state.preNormalState;
                if (state.bgColor) {
                    imageContainer.style.backgroundColor = state.bgColor;
                    colorPicker.value = state.bgColor;
                }
                currentMode = state.currentMode || 'normal';
                // ★★★ 追加: テキストモードを復元 ★★★
                if (state.textMode) {
                    currentTextMode = state.textMode;
                    // ★★★ 修正: 「UT」と「AI」に表示変更 ★★★
                    textModeButton.textContent = currentTextMode === 'user' ? 'UT' : 'AI';
                    textModeButton.title = `クリックでテキストモード切り替え（現在: ${currentTextMode === 'user' ? 'ユーザー' : 'AI'}）`;
                }
                switch (currentMode) {
                    case 'maximized':
                        applyMaximizeMode();
                        break;
                    case 'halfMaximized':
                        applyHalfMaximizeMode();
                        break;
                    default:
                        applyNormalMode();
                        break;
                }
            } catch (e) {
                console.error('状態復元エラー:', e);
                setDefaultDisplayState();
            }
        } else {
            setDefaultDisplayState();
        }
    }

    function setDefaultDisplayState() {
        preNormalState = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            left: DEFAULT_LEFT,
            top: DEFAULT_TOP
        };
        imageContainer.style.backgroundColor = DEFAULT_BG_COLOR;
        colorPicker.value = DEFAULT_BG_COLOR;
        applyNormalMode();
    }

    function applyNormalMode() {
        imageContainer.style.width = `${preNormalState.width}px`;
        imageContainer.style.height = `${preNormalState.height}px`;
        imageContainer.style.left = `${preNormalState.left}px`;
        imageContainer.style.top = `${preNormalState.top}px`;
        imageContainer.style.position = 'absolute';
        resizeHandle.style.display = 'block';
        header.style.cursor = 'grab';
        imageContainer.classList.remove('half-maximized');
        maximizeButton.classList.remove('disabled');
        maximizeButton.classList.add('enabled');
        halfMaximizeButton.classList.remove('disabled');
        halfMaximizeButton.classList.add('enabled');
        currentMode = 'normal';
    }

    function applyMaximizeMode() {
        if (currentMode === 'normal') {
            preNormalState = {
                width: imageContainer.offsetWidth,
                height: imageContainer.offsetHeight,
                left: parseInt(imageContainer.style.left),
                top: parseInt(imageContainer.style.top)
            };
        }
        imageContainer.style.width = '100%';
        imageContainer.style.height = '100%';
        imageContainer.style.left = '0';
        imageContainer.style.top = '0';
        imageContainer.style.position = 'fixed';
        resizeHandle.style.display = 'none';
        header.style.cursor = 'default';
        imageContainer.classList.remove('half-maximized');
        maximizeButton.classList.remove('enabled');
        maximizeButton.classList.add('disabled');
        halfMaximizeButton.classList.remove('disabled');
        halfMaximizeButton.classList.add('enabled');
        currentMode = 'maximized';
    }

    function applyHalfMaximizeMode() {
        if (currentMode === 'normal') {
            preNormalState = {
                width: imageContainer.offsetWidth,
                height: imageContainer.offsetHeight,
                left: parseInt(imageContainer.style.left),
                top: parseInt(imageContainer.style.top)
            };
        }
        imageContainer.style.width = '50vw';
        imageContainer.style.height = '100vh';
        imageContainer.style.left = '0';
        imageContainer.style.top = '0';
        imageContainer.style.position = 'fixed';
        resizeHandle.style.display = 'none';
        header.style.cursor = 'default';
        imageContainer.classList.add('half-maximized');
        maximizeButton.classList.remove('disabled');
        maximizeButton.classList.add('enabled');
        halfMaximizeButton.classList.remove('enabled');
        halfMaximizeButton.classList.add('disabled');
        currentMode = 'halfMaximized';
    }
    restoreDisplayState();
    colorPicker.addEventListener('input', () => {
        imageContainer.style.backgroundColor = colorPicker.value;
        saveDisplayState();
    });
    maximizeButton.addEventListener('click', () => {
        if (currentMode === 'maximized') return;
        closeCustomWindow();
        applyMaximizeMode();
        saveDisplayState();
    });
    halfMaximizeButton.addEventListener('click', () => {
        if (currentMode === 'halfMaximized') return;
        closeCustomWindow();
        applyHalfMaximizeMode();
        saveDisplayState();
    });
    document.addEventListener('mouseup', () => {
        if ((isDragging || isResizing) && currentMode === 'normal') {
            setTimeout(() => {
                saveDisplayState();
                if (isCustomWindowOpen) updateCustomWindow();
            }, 50);
        }
    });
    window.addEventListener('resize', () => {
        if (currentMode === 'maximized') {
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
        } else if (currentMode === 'halfMaximized') {
            imageContainer.style.width = '50vw';
            imageContainer.style.height = '100vh';
        }
    });
    
    // 画像エラーハンドラの改善: 拡張子自動検出を試みる
    imgElement.onerror = async function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        
        // 拡張子自動検出を試みる
        if (this.src && !this.src.match(/\.(png|jpg|jpeg|webp|gif|avif|bmp)$/i)) {
            console.log("🔄 拡張子自動検出を試みます:", this.src);
            const detectedPath = await detectImageExtension(this.src);
            if (detectedPath) {
                console.log(`✅ 拡張子を検出: ${detectedPath}`);
                this.src = detectedPath;
                return;
            }
        }
        
        // デフォルト画像の読み込みに失敗した場合
        if (this.src.match(/default\.(png|jpg|jpeg|webp|gif|avif|bmp)$/i) || this.src.endsWith('/default')) {
            isDefaultImageFailed = true;
            console.warn("⚠️ デフォルト画像が見つかりません。画像表示を無効化します");
            
            // 空のデータURLを設定してエラー連鎖を防止
            this.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
            this.style.display = 'none'; // 画像要素を非表示
        } else {
            // その他の画像エラーの場合はデフォルト画像を試みる
            this.src = currentImageMap.default;
        }
    };
    
    header.addEventListener('mousedown', (e) => {
        if (e.target === colorPicker || currentMode !== 'normal') return;
        isDragging = true;
        offsetX = e.clientX - imageContainer.getBoundingClientRect().left;
        offsetY = e.clientY - imageContainer.getBoundingClientRect().top;
        imageContainer.classList.add('dragging');
        header.style.cursor = 'grabbing';
        e.preventDefault();
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging && currentMode === 'normal') {
            imageContainer.style.left = `${e.clientX - offsetX}px`;
            imageContainer.style.top = `${e.clientY - offsetY}px`;
            if (isCustomWindowOpen) updateCustomWindow();
        }
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            imageContainer.classList.remove('dragging');
            if (currentMode === 'normal') header.style.cursor = 'grab';
        }
    });
    resizeHandle.addEventListener('mousedown', (e) => {
        if (currentMode !== 'normal') return;
        e.stopPropagation();
        isResizing = true;
        imageContainer.classList.add('resizing');
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = imageContainer.offsetWidth;
        const startHeight = imageContainer.offsetHeight;

        function handleResize(e) {
            if (isResizing) {
                const newWidth = Math.max(100, startWidth + (e.clientX - startX));
                const newHeight = Math.max(100, startHeight + (e.clientY - startY));
                imageContainer.style.width = `${newWidth}px`;
                imageContainer.style.height = `${newHeight}px`;
                if (isCustomWindowOpen) updateCustomWindow();
            }
        }

        function stopResize() {
            isResizing = false;
            imageContainer.classList.remove('resizing');
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
        }
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    });

    // 唯一の信頼できるキャラクター名検出器
    function detectCharacterNameFromDOM() {
        const nameHolder = document.querySelector('#character_name_holder');
        if (nameHolder && nameHolder.textContent) return nameHolder.textContent;
        const greetingMessage = document.querySelector('.mes[mesid="0"][is_user="false"]');
        if (greetingMessage && greetingMessage.getAttribute('ch_name')) return greetingMessage.getAttribute('ch_name');
        return null;
    }
    
    // 改良点: OR条件とAND条件、および括弧による優先順位を処理する関数
    function evaluateCondition(condition, text) {
        console.log(`🔍 条件評価: "${condition}", テキスト: "${text}"`);
        
        // 括弧で囲まれた部分を処理
        const processParentheses = (expr) => {
            let start = expr.indexOf('(');
            if (start === -1) return expr;
            
            let depth = 0;
            let result = expr;
            
            while (result.includes('(')) {
                start = result.indexOf('(');
                depth = 1;
                let end = start + 1;
                
                for (let i = start + 1; i < result.length; i++) {
                    if (result[i] === '(') depth++;
                    else if (result[i] === ')') depth--;
                    
                    if (depth === 0) {
                        end = i;
                        break;
                    }
                }
                
                if (depth !== 0) {
                    console.error('括弧の対応が不正です:', result);
                    return result;
                }
                
                const innerExpr = result.substring(start + 1, end);
                const innerResult = evaluateCondition(innerExpr, text);
                result = result.substring(0, start) + innerResult.toString() + result.substring(end + 1);
            }
            return result;
        };

        // AND条件を処理
        const processAnd = (expr) => {
            if (!expr.includes('and')) return expr;
            
            const andParts = expr.split('and').map(part => part.trim());
            console.log(`AND条件処理:`, andParts);
            
            // すべての部分がtrueかチェック
            for (const part of andParts) {
                let partResult;
                if (part === 'true' || part === 'false') {
                    partResult = part === 'true';
                } else {
                    // 再帰的に評価（OR条件や基本条件を含む可能性がある）
                    partResult = evaluateCondition(part, text);
                }
                
                if (!partResult) {
                    console.log(`AND条件失敗: "${part}" が偽`);
                    return false;
                }
            }
            console.log(`AND条件成功`);
            return true;
        };

        // OR条件を処理
        const processOr = (expr) => {
            if (!expr.includes('or')) return expr;
            
            const orParts = expr.split('or').map(part => part.trim());
            console.log(`OR条件処理:`, orParts);
            
            // いずれかの部分がtrueかチェック
            for (const part of orParts) {
                let partResult;
                if (part === 'true' || part === 'false') {
                    partResult = part === 'true';
                } else {
                    // 再帰的に評価（AND条件や基本条件を含む可能性がある）
                    partResult = evaluateCondition(part, text);
                }
                
                if (partResult) {
                    console.log(`OR条件成功: "${part}" が真`);
                    return true;
                }
            }
            console.log(`OR条件失敗`);
            return false;
        };

        // 基本条件（単一キーワード）を評価
        const evaluateBasicCondition = (basicExpr) => {
            const trimmed = basicExpr.trim();
            if (trimmed === 'true' || trimmed === 'false') {
                return trimmed === 'true';
            }
            
            const result = text.includes(trimmed);
            console.log(`基本条件: "${trimmed}" in "${text}" -> ${result}`);
            return result;
        };

        // 評価プロセス
        let processed = condition;
        
        // まず括弧を処理
        processed = processParentheses(processed);
        console.log(`括弧処理後: ${processed}`);
        
        // 次にAND条件を処理
        if (processed.includes('and')) {
            const andResult = processAnd(processed);
            console.log(`AND処理結果: ${andResult}`);
            return andResult;
        }
        
        // 次にOR条件を処理
        if (processed.includes('or')) {
            const orResult = processOr(processed);
            console.log(`OR処理結果: ${orResult}`);
            return orResult;
        }
        
        // 基本条件を評価
        const finalResult = evaluateBasicCondition(processed);
        console.log(`最終結果: ${finalResult}`);
        return finalResult;
    }

    // 改良点: 画像URLまたは画像URLの配列からランダムに1つ選択する関数
    function getRandomImageSource(imageSource) {
        if (Array.isArray(imageSource)) {
            // 配列の場合、ランダムに1つ選択
            if (imageSource.length === 0) {
                console.warn("画像配列が空です");
                return null;
            }
            const randomIndex = Math.floor(Math.random() * imageSource.length);
            const selectedImage = imageSource[randomIndex];
            console.log(`🎲 ランダム選択: ${selectedImage} (${randomIndex + 1}/${imageSource.length})`);
            return selectedImage;
        } else {
            // 文字列の場合、そのまま返す
            return imageSource;
        }
    }

    // 改良点: OR条件とAND条件、および括弧による優先順位に対応
    function findMatchingImageUrl(text) {
        if (!text || !currentImageMap) return null;
    
        // キーワードエントリを準備（デフォルトを除外）
        const keywordEntries = Object.entries(currentImageMap)
            .filter(([key]) => key !== "default")
            .map(([key, url]) => {
                return {
                    condition: key,
                    url: url,
                    // 条件の複雑さをスコアリング（括弧やANDを含む条件を優先）
                    complexity: (key.match(/and/g) || []).length * 10 + 
                               (key.match(/or/g) || []).length * 5 +
                               (key.match(/[()]/g) || []).length * 3 +
                               key.length
                };
            })
            // 複雑さで降順ソート（複雑な条件を優先）
            .sort((a, b) => b.complexity - a.complexity);

        console.log(`🔍 テキスト検索: "${text}"`);
        console.log(`評価する条件:`, keywordEntries.map(e => e.condition));

        // 各エントリについて、条件を評価
        for (const entry of keywordEntries) {
            try {
                console.log(`--- 条件評価開始: "${entry.condition}" ---`);
                const conditionMet = evaluateCondition(entry.condition, text);
                console.log(`条件 "${entry.condition}" -> ${conditionMet}`);
                
                if (conditionMet) {
                    // 条件に合致した場合、画像ソースを取得（単一または配列）
                    const imageSource = entry.url;
                    console.log(`✅ 条件 "${entry.condition}" にマッチ`);
                    
                    // 画像ソースからランダムに1つ選択
                    const selectedImage = getRandomImageSource(imageSource);
                    if (selectedImage) {
                        console.log(`🖼️ 選択画像: ${selectedImage}`);
                        return selectedImage;
                    }
                }
            } catch (error) {
                console.error(`❌ 条件評価エラー "${entry.condition}":`, error);
            }
        }
        return null;
    }

    // ★★★ 修正: テキストモードに応じて検索対象を変更 ★★★
    function findLastKeywordImage() {
        // 現在のテキストモードに基づいて検索対象を決定
        const isUserMode = currentTextMode === 'user';
        const selector = `.mes[is_user="${isUserMode}"] .mes_text`;
        
        const messages = Array.from(document.querySelectorAll(selector));
        console.log(`🔍 ${isUserMode ? 'ユーザー' : 'AI'}メッセージを検索: ${messages.length}件見つかりました`);

        // 最新のメッセージから古い順にチェック
        for (let i = messages.length - 1; i >= 0; i--) {
            const text = messages[i].textContent;
            const imageUrl = findMatchingImageUrl(text);
            if (imageUrl) {
                console.log(`✅ ${isUserMode ? 'ユーザー' : 'AI'}メッセージから画像を発見: ${imageUrl}`);
                return imageUrl;
            }
        }
        console.log(`❌ ${isUserMode ? 'ユーザー' : 'AI'}メッセージにマッチする画像は見つかりませんでした`);
        return null;
    }

    // ★★★ JSON探索ロジック ★★★
    function findImageMapInData(data) {
        if (data === null || typeof data !== 'object') return null;
        if (data.hasOwnProperty('image_display_extension')) {
            const potentialMap = data.image_display_extension;
            if (typeof potentialMap === 'object' && potentialMap !== null) {
                console.log("✅ 再帰探索により 'image_display_extension' を発見しました。");
                return potentialMap;
            }
        }
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const result = findImageMapInData(data[key]);
                if (result !== null) return result;
            }
        }
        return null;
    }

    async function getCharacterData(characterName) {
        const context = await new Promise(resolve => {
            let retries = 2;
            const interval = setInterval(() => {
                const ctx = (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') ? window.SillyTavern.getContext() : null;
                if ((ctx && ctx.character && ctx.character.name === characterName) || retries <= 0) {
                    clearInterval(interval);
                    resolve(ctx);
                }
                retries--;
            }, 500);
        });

        if (context && context.character && context.character.data && context.character.data.extensions && context.character.data.extensions.image_display_extension) {
            console.log(`✅ context APIから拡張データを検出しました: ${characterName}`);
            const imageMap = context.character.data.extensions.image_display_extension;
            // 拡張子自動検出を適用
            return await detectImageMapExtensions(imageMap);
        }

        try {
            const response = await fetch(`addchara/${characterName}/${characterName}_ext.json`);
            if (response.ok) {
                const jsonData = await response.json();
                const foundMap = findImageMapInData(jsonData);
                if (foundMap) {
                    console.log(`✅ 拡張機能のローカルマッピングを読み込みました: ${characterName}`);
                    // 拡張子自動検出を適用
                    return await detectImageMapExtensions(foundMap);
                } else {
                    console.log(`✅ 拡張機能のローカルマッピングを読み込みました (従来形式): ${characterName}`);
                    // 拡張子自動検出を適用
                    return await detectImageMapExtensions(jsonData);
                }
            }
        } catch (e) { /* エラーは無視 */ }

        console.warn(`⚠️ ${characterName} のカスタム画像マップは見つかりませんでした。`);
        return null;
    }

    // キャラクターが変更されたときのメイン処理
    async function handleCharacterChange(newCharacter) {
        if (newCharacter === currentCharacter) return;
        
        console.log(`🔍 キャラクター変更を処理中: ${newCharacter || 'デフォルト画面'}`);
        currentCharacter = newCharacter;

        if (!newCharacter) {
            currentImageMap = defaultImageMap;
            // デフォルト画像マップにも拡張子自動検出を適用
            currentImageMap = await detectImageMapExtensions(defaultImageMap);
            updateImage();
            return;
        }

        console.log(`初めてのキャラクターです。データ取得を開始します: ${newCharacter}`);
        const customMap = await getCharacterData(newCharacter);
        currentImageMap = customMap ? { ...defaultImageMap, ...customMap } : defaultImageMap;
        
        imageMapCache.set(newCharacter, currentImageMap);
        updateImage();
    }
    
    // ★★★ 修正: ストリーミング検出機能を追加 ★★★
    function handleStreamingUpdate() {
        if (currentTextMode !== 'ai') {
            // AIモードでない場合は即時更新
            updateImage();
            return;
        }
        
        // AIモードの場合、最新のAIメッセージを取得
        const aiMessages = Array.from(document.querySelectorAll('.mes[is_user="false"] .mes_text'));
        if (aiMessages.length === 0) return;
        
        const latestMessage = aiMessages[aiMessages.length - 1];
        const currentText = latestMessage.textContent;
        
        // 前回のテキストと同じ場合は何もしない
        if (currentText === lastStreamingText) return;
        
        console.log(`🔄 ストリーミング中: テキスト長 ${currentText.length}文字`);
        lastStreamingText = currentText;
        
        // 既存のタイマーをクリア
        if (streamingTimer) {
            clearTimeout(streamingTimer);
        }
        
        // 新しいタイマーを設定（1秒間テキストに変化がなければストリーミング終了と判断）
        streamingTimer = setTimeout(() => {
            console.log(`✅ ストリーミング終了: 最終テキスト長 ${currentText.length}文字`);
            updateImage();
            streamingTimer = null;
        }, STREAMING_DELAY);
    }
    
    // 現在のチャット内容に基づいて画像を更新
    function updateImage() {
        // デフォルト画像エラー状態をリセット
        if (isDefaultImageFailed) {
            imgElement.style.display = ''; // 表示状態に戻す
            isDefaultImageFailed = false;
        }
        
        // ★★★ 修正: テキストモードに応じて検索対象を変更 ★★★
        const keywordImage = findLastKeywordImage();
        
        // デフォルト画像もランダム選択可能にする（配列対応）
        let newUrl;
        if (keywordImage) {
            newUrl = keywordImage;
        } else {
            // デフォルト画像も配列の場合があるのでランダム選択
            newUrl = getRandomImageSource(currentImageMap.default) || currentImageMap.default;
        }

        if (imgElement.src !== newUrl) {
            console.log(`🖼️ 画像を更新: ${newUrl}`);
            imgElement.src = newUrl;
            currentImageUrl = newUrl;
            imgElement.style.display = ''; // 常に表示状態にする
        }
    }

    // --- アプリケーションの起動 ---
    // 1. チャット欄のキーワード監視（テキストモードに応じて対象を変更）
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        new MutationObserver(() => {
            // ★★★ 修正: ストリーミング検出機能を使用 ★★★
            handleStreamingUpdate();
        }).observe(chatContainer, {
            childList: true,
            subtree: true, // サブツリーの変更も監視
            characterData: true, // テキスト内容の変更も監視
            childList: true,
            subtree: true
        });
        console.log(`✅ チャット欄(${currentTextMode === 'user' ? 'ユーザー' : 'AI'}メッセージ)の監視を開始しました。`);
    }

    // 2. キャラクター変更の監視
    setInterval(() => {
        const detectedName = detectCharacterNameFromDOM();
        if (detectedName !== currentCharacter) {
            handleCharacterChange(detectedName);
        }
    }, 250);
    console.log("🚀 メインループを開始しました。0.25秒ごとにキャラクターを監視します。");
});
