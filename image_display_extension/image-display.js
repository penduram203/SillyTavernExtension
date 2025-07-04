document.addEventListener('DOMContentLoaded', () => {
    console.log("Image Display: DOMContentLoaded イベント発生。初期化を開始します。");

    // --- デフォルト値とグローバル変数の定義 ---
    const DEFAULT_WIDTH = 300,
        DEFAULT_HEIGHT = 200,
        DEFAULT_LEFT = 100,
        DEFAULT_TOP = 100,
        DEFAULT_BG_COLOR = '#000000';
    const defaultImageMap = {
        "default": "https://files.catbox.moe/if6r9w.png"
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
    const imageMapCache = new Map(); // ★★★ キャラクターごとの画像マップを記憶するキャッシュ

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

    // --- UI操作のための関数群（変更なし） ---
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
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        this.src = defaultImageMap.default;
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
    
    // --- ★★★ ここからが最後のロジックです ★★★ ---

    // 唯一の信頼できるキャラクター名検出器
    function detectCharacterNameFromDOM() {
        const nameHolder = document.querySelector('#character_name_holder');
        if (nameHolder && nameHolder.textContent) return nameHolder.textContent;
        // フォールバック
        const greetingMessage = document.querySelector('.mes[mesid="0"][is_user="false"]');
        if (greetingMessage && greetingMessage.getAttribute('ch_name')) return greetingMessage.getAttribute('ch_name');
        return null;
    }
    
    // チャット履歴全体をスキャンして、最後に見つかったキーワードの画像URLを返す
    function findLastKeywordImageInChat() {
        const messages = Array.from(document.querySelectorAll('.mes .mes_text'));
        for (let i = messages.length - 1; i >= 0; i--) {
            const imageUrl = checkKeywords(messages[i].textContent);
            if (imageUrl) return imageUrl;
        }
        return null;
    }

    // ★★★ 変更点 ★★★: 再帰的に 'image_display_extension' を探すヘルパー関数を追加
    /**
     * @summary JSONオブジェクト内を再帰的に探索し、'image_display_extension' キーを持つオブジェクトを返す
     * @param {any} data - 探索対象のオブジェクトまたは配列
     * @returns {object|null} - 見つかった画像マップオブジェクト、またはnull
     */
    function findImageMapInData(data) {
        if (data === null || typeof data !== 'object') {
            return null;
        }

        // キー 'image_display_extension' が現在の階層に存在するかチェック
        if (data.hasOwnProperty('image_display_extension')) {
            const potentialMap = data.image_display_extension;
            // 値がnullでなく、オブジェクト形式であることを確認
            if (typeof potentialMap === 'object' && potentialMap !== null) {
                console.log("✅ 再帰探索により 'image_display_extension' を発見しました。");
                return potentialMap;
            }
        }

        // 子要素を再帰的に探索
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const result = findImageMapInData(data[key]);
                if (result !== null) {
                    return result; // 最初に見つかったものを返す
                }
            }
        }

        return null; // 見つからなかった場合
    }

    // ★★★ 変更点 ★★★: `getCharacterData` 関数を新旧両方のJSON形式に対応させる
    // `context`とローカルファイルの両方から画像マップを取得する安定版
    async function getCharacterData(characterName) {
        // SillyTavernの内部データが準備完了するのを待つ
        const context = await new Promise(resolve => {
            let retries = 2; // 最大1秒待つ
            const interval = setInterval(() => {
                const ctx = (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') ? window.SillyTavern.getContext() : null;
                if ((ctx && ctx.character && ctx.character.name === characterName) || retries <= 0) {
                    clearInterval(interval);
                    resolve(ctx);
                }
                retries--;
            }, 500);
        });

        // contextからextensionsを取得
        if (context && context.character && context.character.data && context.character.data.extensions && context.character.data.extensions.image_display_extension) {
            console.log(`✅ context APIから拡張データを検出しました: ${characterName}`);
            return context.character.data.extensions.image_display_extension;
        }

        // ローカルファイルを取得
        try {
            const response = await fetch(`scripts/extensions/image_display_extension/character_image_mapping/${characterName}.json`);
            if (response.ok) {
                const jsonData = await response.json();
                
                // まず、ネストされた 'image_display_extension' を探す（新形式対応）
                const foundMap = findImageMapInData(jsonData);
                
                if (foundMap) {
                    // 新しい形式（キャラクターカードなど）から抽出成功
                    console.log(`✅ 拡張機能のローカルマッピングを読み込みました (キャラクターカード形式): ${characterName}`);
                    return foundMap;
                } else {
                    // 'image_display_extension' が見つからなければ、ファイル全体が画像マップだと仮定する（従来形式対応）
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

        // デフォルト画面に戻る場合は、キャッシュを使わず即座に更新
        if (!newCharacter) {
            currentImageMap = defaultImageMap;
            updateImage();
            return;
        }

        // ★★★ キャッシュロジック ★★★
        // もし、すでに画像マップを記憶していたら、それを使う
        if (imageMapCache.has(newCharacter)) {
            console.log(`✅ キャッシュから画像マップを読み込みました: ${newCharacter}`);
            currentImageMap = imageMapCache.get(newCharacter);
            updateImage();
            return;
        }

        // キャッシュにない場合のみ、時間のかかるデータ取得を実行
        console.log(`初めてのキャラクターです。データ取得を開始します: ${newCharacter}`);
        const customMap = await getCharacterData(newCharacter);
        currentImageMap = customMap ? { ...defaultImageMap, ...customMap } : defaultImageMap;
        
        // 取得したデータをキャッシュに保存
        imageMapCache.set(newCharacter, currentImageMap);
        
        updateImage(); // 最後に画像を更新
    }
    
    // 現在のチャット内容に基づいて画像を一括更新する関数
    function updateImage() {
        const lastKeywordImage = findLastKeywordImageInChat();
        const newUrl = lastKeywordImage || currentImageMap.default;

        if (imgElement.src !== newUrl) {
            console.log(`🖼️ 画像を更新: ${newUrl}`);
            imgElement.src = newUrl;
            currentImageUrl = newUrl;
        }
    }

    // --- アプリケーションの起動 ---
    function checkKeywords(text) {
        const keywordGroups = Object.entries(currentImageMap).filter(([key]) => key !== "default").map(([keys, url]) => ({
            keys: keys.split('|'),
            url
        }));
        for (const group of keywordGroups) {
            for (const keyword of group.keys) {
                try {
                    if (new RegExp(keyword).test(text)) return group.url;
                } catch (e) {
                    console.error(`無効な正規表現パターン: ${keyword}`);
                }
            }
        }
        return null;
    }

    // 1. チャット欄のキーワード監視（メッセージの追加・削除に反応）
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        new MutationObserver(() => updateImage()).observe(chatContainer, {
            childList: true
        });
        console.log("✅ チャット欄(キーワード)の監視を開始しました。");
    }

    // 2. キャラクター変更の監視（定期チェック方式）
    setInterval(() => {
        const detectedName = detectCharacterNameFromDOM();
        if (detectedName !== currentCharacter) {
            handleCharacterChange(detectedName);
        }
    }, 250); // 0.25秒ごとにキャラクターの変更をチェック（高速な反応のため）
    console.log("🚀 メインループを開始しました。0.25秒ごとにキャラクターを監視します。");
});
