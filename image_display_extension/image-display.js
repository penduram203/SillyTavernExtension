document.addEventListener('DOMContentLoaded', async () => {
    // デフォルト値の定義
    const DEFAULT_WIDTH = 300;
    const DEFAULT_HEIGHT = 200;
    const DEFAULT_LEFT = 100;
    const DEFAULT_TOP = 100;
    const DEFAULT_BG_COLOR = '#000000';

    // デフォルトの画像マッピング
    const defaultImageMap = {
        "山": "https://files.catbox.moe/fnbsc1.png",
        "川": "https://files.catbox.moe/8xv1lx.png",
        "町": "https://files.catbox.moe/gci6w9.png",
        "default": "https://files.catbox.moe/94yxhd.png"
    };

    // グローバル変数
    let currentCharacter = null;
    let currentImageMap = defaultImageMap;
    let currentImageUrl = currentImageMap.default;
    let currentMode = 'normal'; // 'normal'(カスタムモード), 'maximized', 'halfMaximized'
    let preNormalState = {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        left: DEFAULT_LEFT,
        top: DEFAULT_TOP
    };
    let chatObserver = null;
    let isDragging = false;
    let isResizing = false;
    let offsetX, offsetY;
    let isCustomWindowOpen = false;

    // UI要素の作成
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
    customButton.classList.add('enabled');
    controlContainer.appendChild(customButton);
    const maximizeButton = document.createElement('button');
    maximizeButton.id = 'maximize-button';
    maximizeButton.textContent = '最大化';
    maximizeButton.title = '画像表示エリアを最大化';
    maximizeButton.classList.add('enabled');
    controlContainer.appendChild(maximizeButton);
    const halfMaximizeButton = document.createElement('button');
    halfMaximizeButton.id = 'half-maximize-button';
    halfMaximizeButton.textContent = '左半分';
    halfMaximizeButton.title = '画像表示エリアを左半分に最大化';
    halfMaximizeButton.classList.add('enabled');
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

    // (カスタム設定ウィンドウの更新・入力イベント)
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

    // カスタムウィンドウの開閉
    function toggleCustomWindow() {
        isCustomWindowOpen = !isCustomWindowOpen;
        if (isCustomWindowOpen) {
            customWindow.style.display = 'block';
            updateCustomWindow();
        } else {
            customWindow.style.display = 'none';
        }
    }
    
    // カスタムウィンドウを強制的に閉じる関数
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

    // (状態保存・復元、モード変更関数)
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
                    case 'maximized': applyMaximizeMode(); break;
                    case 'halfMaximized': applyHalfMaximizeMode(); break;
                    default: applyNormalMode(); break;
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
        preNormalState = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT, left: DEFAULT_LEFT, top: DEFAULT_TOP };
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
            preNormalState = { width: imageContainer.offsetWidth, height: imageContainer.offsetHeight, left: parseInt(imageContainer.style.left), top: parseInt(imageContainer.style.top) };
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
            preNormalState = { width: imageContainer.offsetWidth, height: imageContainer.offsetHeight, left: parseInt(imageContainer.style.left), top: parseInt(imageContainer.style.top) };
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
    
    // 初期化時に状態復元
    restoreDisplayState();

    // 背景色変更イベント
    colorPicker.addEventListener('input', () => {
        imageContainer.style.backgroundColor = colorPicker.value;
        saveDisplayState();
    });

    // 最大化ボタンのクリックイベント
    maximizeButton.addEventListener('click', () => {
        if (currentMode === 'maximized') return;
        closeCustomWindow(); // ウィンドウを閉じる
        applyMaximizeMode();
        saveDisplayState();
    });
    
    // 左半分ボタンのクリックイベント
    halfMaximizeButton.addEventListener('click', () => {
        if (currentMode === 'halfMaximized') return;
        closeCustomWindow(); // ウィンドウを閉じる
        applyHalfMaximizeMode();
        saveDisplayState();
    });

    // (ドラッグ/リサイズ、キーワード検出、画像処理などの機能)
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
    function checkKeywords(text) {
        const keywordGroups = Object.entries(currentImageMap)
            .filter(([key]) => key !== "default")
            .map(([keys, url]) => ({
                keys: keys.split('|'),
                url
            }));
        for (const group of keywordGroups) {
            for (const keyword of group.keys) {
                try {
                    const regex = new RegExp(keyword);
                    if (regex.test(text)) return group.url;
                } catch(e) { console.error(`無効な正規表現パターン: ${keyword}`); }
            }
        }
        return null;
    }
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        this.src = currentImageMap.default;
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
            if(currentMode === 'normal') header.style.cursor = 'grab';
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

    // (キャラクター関連の機能)
    async function loadCharacterImageMap(characterName) {
        if (!characterName) return defaultImageMap;
        try {
            const response = await fetch(`scripts/extensions/image_display_extension/character_image_mapping/${characterName}.json`);
            if (!response.ok) {
                console.warn(`⚠️ キャラクター専用マッピングファイルが見つかりません: ${characterName}.json`);
                return defaultImageMap;
            }
            const customMap = await response.json();
            console.log(`✅ キャラクター専用マッピングを読み込みました: ${characterName}`);
            return customMap;
        } catch (error) {
            console.error(`❌ マッピングファイルの読み込みエラー (${characterName}):`, error);
            return defaultImageMap;
        }
    }
    function saveCharacterLastImage(character, imageUrl) {
        if (!character) return;
        const savedData = localStorage.getItem('characterLastImages');
        let characterLastImages = savedData ? JSON.parse(savedData) : {};
        characterLastImages[character] = imageUrl;
        localStorage.setItem('characterLastImages', JSON.stringify(characterLastImages));
        console.log(`💾 キャラクターの最後の画像を保存: ${character} -> ${imageUrl}`);
    }
    function getCharacterLastImage(character) {
        if (!character) return null;
        const savedData = localStorage.getItem('characterLastImages');
        if (!savedData) return null;
        const characterLastImages = JSON.parse(savedData);
        return characterLastImages[character] || null;
    }
    function findLastKeywordImage() {
        if (!currentCharacter) return null;
        const userMessages = Array.from(document.querySelectorAll('.mes[is_user="true"]'));
        userMessages.sort((a, b) => {
            const idA = parseInt(a.getAttribute('mesid'));
            const idB = parseInt(b.getAttribute('mesid'));
            return idB - idA;
        });
        for (const message of userMessages) {
            const textElement = message.querySelector('.mes_text');
            if (textElement) {
                const messageText = textElement.textContent;
                const imageUrl = checkKeywords(messageText);
                if (imageUrl) return imageUrl;
            }
        }
        return null;
    }
    async function handleCharacterChange(newCharacter) {
        if (newCharacter === currentCharacter) return;
        console.log(`🔍 キャラクター変更を検出: ${newCharacter}`);
        currentCharacter = newCharacter;
        try {
            currentImageMap = await loadCharacterImageMap(currentCharacter);
        } catch (e) {
            console.error(`❌ マッピング読み込みエラー: ${e.message}`);
            currentImageMap = defaultImageMap;
        }
        let lastImageUrl = getCharacterLastImage(currentCharacter);
        if (!lastImageUrl) {
            console.warn(`⚠️ キャラクター ${currentCharacter} に対応するlast_imageが存在しません`);
        }
        try {
            const foundImageUrl = findLastKeywordImage();
            if (foundImageUrl) {
                lastImageUrl = foundImageUrl;
                console.log(`🔍 チャット履歴から画像を検出: ${lastImageUrl}`);
            } else {
                console.log(`🔍 キーワードに一致するメッセージが見つかりません`);
            }
        } catch (e) {
            console.error(`❌ 履歴スキャンエラー: ${e.message}`);
        }
        const newUrl = lastImageUrl || currentImageMap.default;
        imgElement.src = newUrl;
        currentImageUrl = newUrl;
        if (currentCharacter && lastImageUrl) {
            saveCharacterLastImage(currentCharacter, lastImageUrl);
        }
        console.log(`🖼️ 画像を設定: ${newUrl}`);
    }
    function detectCharacterName() {
        const characterElement = document.querySelector('.mes[mesid="0"][is_user="false"]');
        if (characterElement) {
            const characterName = characterElement.getAttribute('ch_name');
            if (characterName) return characterName;
        }
        console.warn('⚠️ キャラクター要素が見つかりません');
        return null;
    }
    function setupChatObserver() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            console.error('❌ チャットコンテナ(#chat)が見つかりません');
            return;
        }
        if (chatObserver) chatObserver.disconnect();
        chatObserver = new MutationObserver((mutations) => {
            let shouldUpdateCharacter = false;
            let shouldCheckKeyword = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === 1 && node.matches && node.matches('.mes')) {
                            if (node.getAttribute('is_user') === 'true') shouldCheckKeyword = true;
                            else if (node.getAttribute('mesid') === '0') shouldUpdateCharacter = true;
                        }
                    }
                    if (mutation.removedNodes.length > 0) shouldCheckKeyword = true;
                }
            }
            if (shouldUpdateCharacter) {
                setTimeout(() => {
                    const newCharacter = detectCharacterName();
                    if (newCharacter) handleCharacterChange(newCharacter);
                }, 500);
            }
            if (shouldCheckKeyword) {
                setTimeout(() => {
                    try {
                        const lastImageUrl = findLastKeywordImage();
                        const targetUrl = lastImageUrl || currentImageMap.default;
                        if (targetUrl !== currentImageUrl) {
                            imgElement.src = targetUrl;
                            currentImageUrl = targetUrl;
                            if (currentCharacter) saveCharacterLastImage(currentCharacter, targetUrl);
                        }
                    } catch (e) { console.error(`❌ キーワードチェックエラー: ${e.message}`); }
                }, 300);
            }
        });
        chatObserver.observe(chatContainer, { childList: true, subtree: true });
        const initialCharacter = detectCharacterName();
        if (initialCharacter) handleCharacterChange(initialCharacter);
    }
    document.addEventListener('chat_changed', () => {
        console.log('🔔 chat_changed イベントを検出');
        setTimeout(() => {
            const newCharacter = detectCharacterName();
            if (newCharacter) handleCharacterChange(newCharacter);
        }, 1000);
    });

    // 初期設定
    setupChatObserver();
});
