document.addEventListener('DOMContentLoaded', async () => {
    // デフォルト値の定義
    const DEFAULT_WIDTH = 300;
    const DEFAULT_HEIGHT = 200;
    const DEFAULT_LEFT = 100;
    const DEFAULT_TOP = 100;
    const DEFAULT_BG_COLOR = '#000000';

    // デフォルトの画像マッピング
    const defaultImageMap = {
        "海": "https://files.catbox.moe/ar7sly.png",
        "山|山頂|山脈": "https://files.catbox.moe/g7qyus.png",
        "0001|０００１": "https://files.catbox.moe/l81266.png",
        "default": "https://files.catbox.moe/z4smwu.png"
    };

    // グローバル変数
    let currentCharacter = null;
    let currentImageMap = defaultImageMap;
    let currentImageUrl = currentImageMap.default;
    let currentMode = 'normal'; // 'normal'(カスタム), 'maximized', 'halfMaximized'
    let preNormalState = { // カスタムモード（通常モード）の位置とサイズを保持
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

    // --- DOM要素の作成 (変更なし) ---
    const detectionZone = document.createElement('div');
    detectionZone.id = 'mouse-detection-zone';
    document.body.appendChild(detectionZone);

    const imageContainer = document.createElement('div');
    imageContainer.id = 'image-display-container';
    document.body.appendChild(imageContainer);

    const header = document.createElement('div');
    header.id = 'image-display-header';
    header.textContent = '画像表示エリア';
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
    customButton.title = 'カスタムモードに切り替え、設定を開く';
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
    customWindow.innerHTML = `
        <h3>カスタム設定 <button class="close-button" title="閉じる">×</button></h3>
        <div style="clear: both;"></div>
        <label for="custom-x">X座標 (px)</label>
        <input type="number" id="custom-x">
        <label for="custom-y">Y座標 (px)</label>
        <input type="number" id="custom-y">
        <label for="custom-width">幅 (px)</label>
        <input type="number" id="custom-width">
        <label for="custom-height">高さ (px)</label>
        <input type="number" id="custom-height">
    `;
    const closeButton = customWindow.querySelector('.close-button');
    const xInput = customWindow.querySelector('#custom-x');
    const yInput = customWindow.querySelector('#custom-y');
    const widthInput = customWindow.querySelector('#custom-width');
    const heightInput = customWindow.querySelector('#custom-height');

    // --- イベントリスナー (マウス検出、カスタムウィンドウ) ---
    detectionZone.addEventListener('mouseenter', () => { controlContainer.style.display = 'flex'; });
    controlContainer.addEventListener('mouseenter', () => { controlContainer.style.display = 'flex'; });
    detectionZone.addEventListener('mouseleave', (e) => { if (!controlContainer.contains(e.relatedTarget)) { controlContainer.style.display = 'none'; } });
    controlContainer.addEventListener('mouseleave', (e) => { if (!detectionZone.contains(e.relatedTarget)) { controlContainer.style.display = 'none'; } });

    function updateCustomWindow() {
        xInput.value = preNormalState.left;
        yInput.value = preNormalState.top;
        widthInput.value = preNormalState.width;
        heightInput.value = preNormalState.height;
    }

    function handleCustomInput() {
        const newValues = {
            left: parseInt(xInput.value) || 0,
            top: parseInt(yInput.value) || 0,
            width: parseInt(widthInput.value) || DEFAULT_WIDTH,
            height: parseInt(heightInput.value) || DEFAULT_HEIGHT
        };
        imageContainer.style.left = `${newValues.left}px`;
        imageContainer.style.top = `${newValues.top}px`;
        imageContainer.style.width = `${newValues.width}px`;
        imageContainer.style.height = `${newValues.height}px`;
        preNormalState = newValues;
        saveDisplayState();
    }
    xInput.addEventListener('input', handleCustomInput);
    yInput.addEventListener('input', handleCustomInput);
    widthInput.addEventListener('input', handleCustomInput);
    heightInput.addEventListener('input', handleCustomInput);

    function toggleCustomWindow() {
        isCustomWindowOpen = !isCustomWindowOpen;
        customWindow.style.display = isCustomWindowOpen ? 'block' : 'none';
        if (isCustomWindowOpen) updateCustomWindow();
    }
    
    // [新設] カスタムウィンドウを閉じる専用の関数
    function closeCustomWindow() {
        if (isCustomWindowOpen) {
            customWindow.style.display = 'none';
            isCustomWindowOpen = false;
        }
    }

    closeButton.addEventListener('click', toggleCustomWindow); // 閉じるボタンはトグル動作でOK
    
    // --- 状態管理とモード切替 ---

    function saveDisplayState() {
        const state = {
            bgColor: colorPicker.value,
            currentMode: currentMode,
            preNormalState: preNormalState
        };
        localStorage.setItem('imageDisplayState', JSON.stringify(state));
    }

    function updateUiAndBehaviors() {
        [customButton, maximizeButton, halfMaximizeButton].forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
            btn.classList.add('enabled');
        });

        if (currentMode === 'normal') {
            header.style.cursor = 'grab';
            resizeHandle.style.display = 'block';
            imageContainer.classList.remove('half-maximized');
        } else {
            header.style.cursor = 'default';
            resizeHandle.style.display = 'none';
            if (currentMode === 'maximized') {
                maximizeButton.disabled = true;
                maximizeButton.classList.add('disabled');
            } else if (currentMode === 'halfMaximized') {
                halfMaximizeButton.disabled = true;
                halfMaximizeButton.classList.add('disabled');
                imageContainer.classList.add('half-maximized');
            }
        }
    }

    function applyNormalMode() {
        currentMode = 'normal';
        imageContainer.style.position = 'absolute';
        imageContainer.style.width = `${preNormalState.width}px`;
        imageContainer.style.height = `${preNormalState.height}px`;
        imageContainer.style.left = `${preNormalState.left}px`;
        imageContainer.style.top = `${preNormalState.top}px`;
        updateUiAndBehaviors();
    }

    function applyMaximizeMode() {
        currentMode = 'maximized';
        imageContainer.style.position = 'fixed';
        imageContainer.style.width = '100vw';
        imageContainer.style.height = '100vh';
        imageContainer.style.left = '0';
        imageContainer.style.top = '0';
        updateUiAndBehaviors();
    }

    function applyHalfMaximizeMode() {
        currentMode = 'halfMaximized';
        imageContainer.style.position = 'fixed';
        imageContainer.style.width = '50vw';
        imageContainer.style.height = '100vh';
        imageContainer.style.left = '0';
        imageContainer.style.top = '0';
        updateUiAndBehaviors();
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
                
                switch (state.currentMode) {
                    case 'maximized': applyMaximizeMode(); break;
                    case 'halfMaximized': applyHalfMaximizeMode(); break;
                    case 'normal': default: applyNormalMode(); break;
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

    restoreDisplayState();

    // --- コントロールボタンのイベントリスナー ---
    customButton.addEventListener('click', () => {
        applyNormalMode();
        saveDisplayState();
        toggleCustomWindow();
    });

    maximizeButton.addEventListener('click', () => {
        if (currentMode === 'maximized') return;
        applyMaximizeMode();
        saveDisplayState();
        closeCustomWindow(); // [修正] ウィンドウを閉じる
    });
    
    halfMaximizeButton.addEventListener('click', () => {
        if (currentMode === 'halfMaximized') return;
        applyHalfMaximizeMode();
        saveDisplayState();
        closeCustomWindow(); // [修正] ウィンドウを閉じる
    });

    colorPicker.addEventListener('input', () => {
        imageContainer.style.backgroundColor = colorPicker.value;
        saveDisplayState();
    });

    // --- ドラッグ＆リサイズ機能 (カスタムモード限定) ---
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
        if (!isDragging) return;
        imageContainer.style.left = `${e.clientX - offsetX}px`;
        imageContainer.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            imageContainer.classList.remove('dragging');
            header.style.cursor = 'grab';
            preNormalState.left = parseInt(imageContainer.style.left);
            preNormalState.top = parseInt(imageContainer.style.top);
            saveDisplayState();
            if (isCustomWindowOpen) updateCustomWindow();
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
            if (!isResizing) return;
            const newWidth = Math.max(100, startWidth + (e.clientX - startX));
            const newHeight = Math.max(100, startHeight + (e.clientY - startY));
            imageContainer.style.width = `${newWidth}px`;
            imageContainer.style.height = `${newHeight}px`;
        }

        function stopResize() {
            if (!isResizing) return;
            isResizing = false;
            imageContainer.classList.remove('resizing');
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            preNormalState.width = imageContainer.offsetWidth;
            preNormalState.height = imageContainer.offsetHeight;
            saveDisplayState();
            if (isCustomWindowOpen) updateCustomWindow();
        }

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    });

    // --- 以下、キャラクターとチャット監視の機能 (変更なし) ---
    // ... (元のコードをそのままコピー) ...

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
                const keywordGroups = Object.entries(currentImageMap).filter(([key]) => key !== "default").map(([keys, url]) => ({ keys: keys.split('|'), url }));
                for (const group of keywordGroups) {
                    for (const keyword of group.keys) {
                        if (new RegExp(keyword).test(textElement.textContent)) return group.url;
                    }
                }
            }
        }
        return null;
    }
    
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        this.src = currentImageMap.default;
    };

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
        
        let lastImageUrl = getCharacterLastImage(currentCharacter) || findLastKeywordImage();
        const newUrl = lastImageUrl || currentImageMap.default;
        
        if (newUrl !== currentImageUrl) {
            imgElement.src = newUrl;
            currentImageUrl = newUrl;
        }
        
        if (currentCharacter && newUrl) saveCharacterLastImage(currentCharacter, newUrl);
        console.log(`🖼️ 画像を設定: ${newUrl}`);
    }

    function detectCharacterName() {
        const characterElement = document.querySelector('.mes[mesid="0"][is_user="false"]');
        if (characterElement) return characterElement.getAttribute('ch_name');
        return null;
    }

    function setupChatObserver() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) return;
        if (chatObserver) chatObserver.disconnect();

        chatObserver = new MutationObserver(() => {
            const lastImageUrl = findLastKeywordImage() || currentImageMap.default;
            if (lastImageUrl && lastImageUrl !== currentImageUrl) {
                imgElement.src = lastImageUrl;
                currentImageUrl = lastImageUrl;
                if (currentCharacter) saveCharacterLastImage(currentCharacter, lastImageUrl);
            }
        });

        chatObserver.observe(chatContainer, { childList: true, subtree: true });
    }

    document.addEventListener('CHAT_CHANGED', () => {
        console.log('🔔 CHAT_CHANGED イベントを検出');
        setTimeout(() => {
             const newCharacter = detectCharacterName();
             if (newCharacter) handleCharacterChange(newCharacter);
             setupChatObserver();
        }, 500);
    });

    setTimeout(() => {
        const initialCharacter = detectCharacterName();
        if (initialCharacter) handleCharacterChange(initialCharacter);
        setupChatObserver();
    }, 1000);
});
