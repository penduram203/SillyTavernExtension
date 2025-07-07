document.addEventListener('DOMContentLoaded', () => {
    console.log("Image Display: DOMContentLoaded イベント発生。初期化を開始します。");

    // --- デフォルト値とグローバル変数の定義 ---
    const DEFAULT_WIDTH = 300,
        DEFAULT_HEIGHT = 200,
        DEFAULT_LEFT = 100,
        DEFAULT_TOP = 100,
        DEFAULT_BG_COLOR = '#000000';
    const defaultImageMap = {
        "default": "addchara/default.png"
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
    let isDefaultImageFailed = false; // デフォルト画像エラーフラグ追加

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
    const controlContainer = document.createElement('div');
    controlContainer.id = 'image-control-container';
    document.body.appendChild(controlContainer);
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
            preNormalState: preNormalState
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
    
    // 画像エラーハンドラの改善: デフォルト画像失敗時に空のデータURLを設定
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        
        // デフォルト画像の読み込みに失敗した場合
        if (this.src.endsWith("addchara/default.png")) {
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
    
    // 修正点1: 長いキーワードを優先してマッチング
    function findMatchingImageUrl(text) {
        if (!text || !currentImageMap) return null;
        
        // キーワードを長さで降順ソート（長いキーワードを優先）
        const sortedKeywords = Object.keys(currentImageMap)
            .filter(key => key !== "default")
            .sort((a, b) => b.length - a.length);
        
        // 長いキーワードから順にチェック
        for (const keyword of sortedKeywords) {
            if (text.includes(keyword)) {
                return currentImageMap[keyword];
            }
        }
        return null;
    }

    // 修正点2: ユーザーメッセージのみを対象にフィルタリング
    function findLastUserKeywordImage() {
        // ユーザーメッセージのみを選択 (is_user="true")
        const userMessages = Array.from(document.querySelectorAll('.mes[is_user="true"] .mes_text'));
        
        // 最新のメッセージから古い順にチェック
        for (let i = userMessages.length - 1; i >= 0; i--) {
            const text = userMessages[i].textContent;
            const imageUrl = findMatchingImageUrl(text);
            if (imageUrl) return imageUrl;
        }
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
            return context.character.data.extensions.image_display_extension;
        }

        try {
            const response = await fetch(`addchara/${characterName}/${characterName}.json`);
            if (response.ok) {
                const jsonData = await response.json();
                const foundMap = findImageMapInData(jsonData);
                if (foundMap) {
                    console.log(`✅ 拡張機能のローカルマッピングを読み込みました: ${characterName}`);
                    return foundMap;
                } else {
                    console.log(`✅ 拡張機能のローカルマッピングを読み込みました (従来形式): ${characterName}`);
                    return jsonData;
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
            updateImage();
            return;
        }

        if (imageMapCache.has(newCharacter)) {
            console.log(`✅ キャッシュから画像マップを読み込みました: ${newCharacter}`);
            currentImageMap = imageMapCache.get(newCharacter);
            updateImage();
            return;
        }

        console.log(`初めてのキャラクターです。データ取得を開始します: ${newCharacter}`);
        const customMap = await getCharacterData(newCharacter);
        currentImageMap = customMap ? { ...defaultImageMap, ...customMap } : defaultImageMap;
        
        imageMapCache.set(newCharacter, currentImageMap);
        updateImage();
    }
    
    // 現在のチャット内容に基づいて画像を更新
    function updateImage() {
        // デフォルト画像エラー状態をリセット
        if (isDefaultImageFailed) {
            imgElement.style.display = ''; // 表示状態に戻す
            isDefaultImageFailed = false;
        }
        
        // 修正: ユーザーメッセージのみを対象とした画像検索
        const userKeywordImage = findLastUserKeywordImage();
        const newUrl = userKeywordImage || currentImageMap.default;

        if (imgElement.src !== newUrl) {
            console.log(`🖼️ 画像を更新: ${newUrl}`);
            imgElement.src = newUrl;
            currentImageUrl = newUrl;
            imgElement.style.display = ''; // 常に表示状態にする
        }
    }

    // --- アプリケーションの起動 ---
    // 1. チャット欄のキーワード監視（ユーザーメッセージのみ対象）
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        new MutationObserver(() => updateImage()).observe(chatContainer, {
            childList: true,
            subtree: true // サブツリーの変更も監視
        });
        console.log("✅ チャット欄(ユーザーメッセージ)の監視を開始しました。");
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

