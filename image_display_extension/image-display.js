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
    let isMaximized = false;
    let preMaximizeState = {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        left: DEFAULT_LEFT,
        top: DEFAULT_TOP
    };
    let chatObserver = null;
    let isDragging = false;
    let isResizing = false;
    let offsetX, offsetY;

    // コンテナ作成
    const imageContainer = document.createElement('div');
    imageContainer.id = 'image-display-container';
    document.body.appendChild(imageContainer);

    // ヘッダー作成
    const header = document.createElement('div');
    header.id = 'image-display-header';
    header.textContent = '画像表示エリア (ドラッグで移動)';
    imageContainer.appendChild(header);

    // 背景色選択ツール
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = 'bg-color-picker';
    colorPicker.value = DEFAULT_BG_COLOR;
    colorPicker.title = '背景色を変更';
    header.appendChild(colorPicker);

    // 画像要素
    const imgElement = document.createElement('img');
    imgElement.id = 'displayed-image';
    imgElement.src = currentImageMap.default;
    imageContainer.appendChild(imgElement);

    // リサイズハンドル
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'resize-handle';
    imageContainer.appendChild(resizeHandle);

    // コントロールボタン用コンテナ作成（画面左下固定）
    const controlContainer = document.createElement('div');
    controlContainer.id = 'image-control-container';
    document.body.appendChild(controlContainer);

    // リセットボタン（画面左下に配置）
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'リセット';
    resetButton.title = 'サイズと位置をデフォルトにリセット';
    controlContainer.appendChild(resetButton);

    // 最大化ボタン（リセットボタンの右隣）
    const maximizeButton = document.createElement('button');
    maximizeButton.id = 'maximize-button';
    maximizeButton.textContent = '最大化';
    maximizeButton.title = '画像表示エリアを最大化';
    controlContainer.appendChild(maximizeButton);

    // 最小化ボタン（初期状態では非表示）
    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'image-display_minimize-button';
    minimizeButton.textContent = '復元';
    minimizeButton.title = '元のサイズに戻す';
    minimizeButton.style.display = 'none';
    controlContainer.appendChild(minimizeButton);

    // 状態保存関数
    function saveDisplayState() {
        const state = {
            width: imageContainer.offsetWidth,
            height: imageContainer.offsetHeight,
            left: parseInt(imageContainer.style.left) || DEFAULT_LEFT,
            top: parseInt(imageContainer.style.top) || DEFAULT_TOP,
            bgColor: colorPicker.value,
            isMaximized: isMaximized,
            preMaximizeState: preMaximizeState
        };
        localStorage.setItem('imageDisplayState', JSON.stringify(state));
    }

    // 状態復元関数
    function restoreDisplayState() {
        const savedState = localStorage.getItem('imageDisplayState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                if (state.width && state.height) {
                    imageContainer.style.width = `${state.width}px`;
                    imageContainer.style.height = `${state.height}px`;
                }
                
                if (!isNaN(state.left) && !isNaN(state.top)) {
                    imageContainer.style.left = `${state.left}px`;
                    imageContainer.style.top = `${state.top}px`;
                }
                
                if (state.bgColor) {
                    imageContainer.style.backgroundColor = state.bgColor;
                    colorPicker.value = state.bgColor;
                }
                
                if (state.preMaximizeState) {
                    preMaximizeState = state.preMaximizeState;
                }
                
                if (state.isMaximized) {
                    isMaximized = true;
                    imageContainer.style.width = '100%';
                    imageContainer.style.height = '100%';
                    imageContainer.style.left = '0';
                    imageContainer.style.top = '0';
                    resizeHandle.style.display = 'none';
                    maximizeButton.style.display = 'none';
                    minimizeButton.style.display = 'block';
                }
            } catch (e) {
                console.error('状態復元エラー:', e);
                setDefaultDisplayState();
            }
        } else {
            setDefaultDisplayState();
        }
    }

    // デフォルト状態設定関数
    function setDefaultDisplayState() {
        imageContainer.style.width = `${DEFAULT_WIDTH}px`;
        imageContainer.style.height = `${DEFAULT_HEIGHT}px`;
        imageContainer.style.left = `${DEFAULT_LEFT}px`;
        imageContainer.style.top = `${DEFAULT_TOP}px`;
        imageContainer.style.backgroundColor = DEFAULT_BG_COLOR;
        colorPicker.value = DEFAULT_BG_COLOR;
        
        if (isMaximized) {
            toggleMaximize();
        }
    }

    // 初期化時に状態復元
    restoreDisplayState();

    // 背景色変更イベント
    colorPicker.addEventListener('input', () => {
        imageContainer.style.backgroundColor = colorPicker.value;
        saveDisplayState();
    });

    // リセットボタンのクリックイベント
    resetButton.addEventListener('click', () => {
        if (isMaximized) {
            toggleMaximize();
        }
        setDefaultDisplayState();
        saveDisplayState();
    });

    // 最大化/最小化トグル関数
    function toggleMaximize() {
        if (isMaximized) {
            imageContainer.style.width = `${preMaximizeState.width}px`;
            imageContainer.style.height = `${preMaximizeState.height}px`;
            imageContainer.style.left = `${preMaximizeState.left}px`;
            imageContainer.style.top = `${preMaximizeState.top}px`;
            resizeHandle.style.display = 'block';
            maximizeButton.style.display = 'block';
            minimizeButton.style.display = 'none';
        } else {
            preMaximizeState = {
                width: imageContainer.offsetWidth,
                height: imageContainer.offsetHeight,
                left: parseInt(imageContainer.style.left),
                top: parseInt(imageContainer.style.top)
            };
            
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
            imageContainer.style.left = '0';
            imageContainer.style.top = '0';
            resizeHandle.style.display = 'none';
            maximizeButton.style.display = 'none';
            minimizeButton.style.display = 'block';
        }
        
        isMaximized = !isMaximized;
        saveDisplayState();
    }

    // 最大化ボタンのクリックイベント
    maximizeButton.addEventListener('click', toggleMaximize);
    
    // 最小化ボタンのクリックイベント
    minimizeButton.addEventListener('click', toggleMaximize);

    // 状態保存イベント
    document.addEventListener('mouseup', () => {
        if ((isDragging || isResizing) && !isMaximized) {
            setTimeout(saveDisplayState, 100);
        }
    });

    window.addEventListener('resize', () => {
        if (isMaximized) {
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
        } else {
            saveDisplayState();
        }
    });

    // キーワード検出機能
    function checkKeywords(text) {
        // デフォルト以外のキーワードグループを取得
        const keywordGroups = Object.entries(currentImageMap)
            .filter(([key]) => key !== "default")
            .map(([keys, url]) => ({
                keys: keys.split('|'),
                url
            }));
        
        // 各キーワードグループをチェック
        for (const group of keywordGroups) {
            for (const keyword of group.keys) {
                const regex = new RegExp(keyword);
                if (regex.test(text)) {
                    return group.url;
                }
            }
        }
        
        return null;
    }

    // 画像読み込みエラー処理
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        this.src = currentImageMap.default;
    };

    // ドラッグ機能
    header.addEventListener('mousedown', (e) => {
        if (e.target === colorPicker) return;
        isDragging = true;
        offsetX = e.clientX - imageContainer.getBoundingClientRect().left;
        offsetY = e.clientY - imageContainer.getBoundingClientRect().top;
        imageContainer.classList.add('dragging');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && !isMaximized) {
            imageContainer.style.left = `${e.clientX - offsetX}px`;
            imageContainer.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            imageContainer.classList.remove('dragging');
            if (!isMaximized) saveDisplayState();
        }
    });

    // リサイズ機能
    resizeHandle.addEventListener('mousedown', (e) => {
        if (isMaximized) return;
        
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
            }
        }

        function stopResize() {
            isResizing = false;
            imageContainer.classList.remove('resizing');
            document.removeEventListener('mousemove', handleResize);
            document.removeEventListener('mouseup', stopResize);
            if (!isMaximized) saveDisplayState();
        }

        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    });

    // 画像マッピング読み込み関数
    async function loadCharacterImageMap(characterName) {
        if (!characterName) return defaultImageMap;
        
        try {
            const response = await fetch(`scripts/extensions/image_display_extension/character_image_mapping/${characterName}.json`);
            
            if (!response.ok) {
                console.warn(`キャラクター専用マッピングファイルが見つかりません: ${characterName}.json`);
                return defaultImageMap;
            }
            
            const customMap = await response.json();
            console.log(`キャラクター専用マッピングを読み込みました: ${characterName}`, customMap);
            return customMap;
        } catch (error) {
            console.error(`マッピングファイルの読み込みエラー (${characterName}):`, error);
            return defaultImageMap;
        }
    }

    // キャラクター名変更時の処理
    async function handleCharacterChange(newCharacter) {
        if (newCharacter === currentCharacter) return;
        
        console.log(`キャラクター変更を検出: ${newCharacter}`);
        currentCharacter = newCharacter;
        
        // 新しいマッピングを読み込み
        currentImageMap = await loadCharacterImageMap(currentCharacter);
        
        // 画像をデフォルトにリセット
        imgElement.src = currentImageMap.default;
        currentImageUrl = currentImageMap.default;
        
        console.log(`画像をデフォルトにリセット: ${currentImageMap.default}`);
    }

    // キャラクター名取得関数
    function detectCharacterName() {
        // mesid="0" で is_user="false" の要素を検索
        const characterElement = document.querySelector('.mes[mesid="0"][is_user="false"]');
        
        if (characterElement) {
            const characterName = characterElement.getAttribute('ch_name');
            if (characterName) {
                return characterName;
            }
        }
        
        console.warn('キャラクター要素が見つかりません');
        return null;
    }

    // チャット変更監視機能
    function setupChatObserver() {
        const chatContainer = document.getElementById('chat');
        if (!chatContainer) {
            console.error('チャットコンテナ(#chat)が見つかりません');
            return;
        }

        // 既存のオブザーバーがあれば切断
        if (chatObserver) {
            chatObserver.disconnect();
        }

        chatObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.classList && 
                            (node.classList.contains('mes') || 
                             node.classList.contains('lastInContext') || 
                             node.classList.contains('last_mes'))) {
                            
                            // コンソールにログ出力
                            if (node.querySelector('.mes_text')) {
                                const messageText = node.querySelector('.mes_text').textContent;
                                console.log("新しいメッセージを検出:", messageText);
                                
                                // キーワードに基づく画像更新
                                const newImageUrl = checkKeywords(messageText);
                                if (newImageUrl && newImageUrl !== currentImageUrl) {
                                    imgElement.src = newImageUrl;
                                    currentImageUrl = newImageUrl;
                                }
                            }
                            
                            // CHAT_CHANGED イベントを検出
                            if (node.getAttribute('mesid') === "0" && 
                                node.getAttribute('is_user') === "false") {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            
            // CHAT_CHANGED 後にキャラクター名を更新
            if (shouldUpdate) {
                setTimeout(() => {
                    const newCharacter = detectCharacterName();
                    if (newCharacter) {
                        handleCharacterChange(newCharacter);
                    }
                }, 500); // 少し遅延させて確実に取得
            }
        });

        chatObserver.observe(chatContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'mesid', 'ch_name', 'is_user']
        });

        // 初期キャラクター名を取得
        const initialCharacter = detectCharacterName();
        if (initialCharacter) {
            handleCharacterChange(initialCharacter);
        }
    }

    // コンソールログ監視（CHAT_CHANGED イベント検出）
    const originalConsoleLog = console.log;
    console.log = function(message) {
        originalConsoleLog.apply(console, arguments);
        
        // CHAT_CHANGED を検出
        if (typeof message === 'string' && message.includes('CHAT_CHANGED')) {
            console.log('CHAT_CHANGED イベントを検出');
            
            // 少し遅延させてからチャット監視を再設定
            setTimeout(() => {
                setupChatObserver();
            }, 1000);
        }
    };

    // 初期設定
    setupChatObserver();
});
