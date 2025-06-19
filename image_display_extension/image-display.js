document.addEventListener('DOMContentLoaded', () => {
    // デフォルト値の定義
    const DEFAULT_WIDTH = 300;
    const DEFAULT_HEIGHT = 200;
    const DEFAULT_LEFT = 100;
    const DEFAULT_TOP = 100;
    const DEFAULT_BG_COLOR = '#000000';

    // 画像マッピング（複数キーワード対応）
    const imageMap = {
        "海": "https://files.catbox.moe/ar7sly.png",
        "山|山頂|山脈": "https://files.catbox.moe/g7qyus.png",
        "0001|０００１": "https://files.catbox.moe/l81266.png",
        "default": "https://files.catbox.moe/z4smwu.png"
    };

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
    colorPicker.style.position = 'absolute';
    colorPicker.style.top = '5px';
    colorPicker.style.right = '30px';
    colorPicker.style.width = '20px';
    colorPicker.style.height = '20px';
    colorPicker.style.cursor = 'pointer';
    colorPicker.style.border = 'none';
    colorPicker.style.backgroundColor = 'transparent';
    header.appendChild(colorPicker);

    // 画像要素
    const imgElement = document.createElement('img');
    imgElement.id = 'displayed-image';
    imgElement.src = imageMap.default;
    imageContainer.appendChild(imgElement);

    // リサイズハンドル
    const resizeHandle = document.createElement('div');
    resizeHandle.id = 'resize-handle';
    imageContainer.appendChild(resizeHandle);

    // コントロールボタン用コンテナ作成（画面左下固定）
    const controlContainer = document.createElement('div');
    controlContainer.id = 'image-control-container';
    controlContainer.style.position = 'fixed';
    controlContainer.style.left = '10px';
    controlContainer.style.bottom = '10px';
    controlContainer.style.zIndex = '10000';
    controlContainer.style.display = 'flex';
    controlContainer.style.gap = '5px';
    document.body.appendChild(controlContainer);

    // リセットボタン（画面左下に配置）
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = 'リセット';
    resetButton.title = 'サイズと位置をデフォルトにリセット';
    resetButton.style.padding = '5px 10px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.backgroundColor = '#555';
    resetButton.style.color = 'white';
    resetButton.style.border = 'none';
    resetButton.style.borderRadius = '3px';
    controlContainer.appendChild(resetButton);

    // 最大化ボタン（リセットボタンの右隣）
    const maximizeButton = document.createElement('button');
    maximizeButton.id = 'maximize-button';
    maximizeButton.textContent = '最大化';
    maximizeButton.title = '画像表示エリアを最大化';
    maximizeButton.style.padding = '5px 10px';
    maximizeButton.style.cursor = 'pointer';
    maximizeButton.style.backgroundColor = '#555';
    maximizeButton.style.color = 'white';
    maximizeButton.style.border = 'none';
    maximizeButton.style.borderRadius = '3px';
    controlContainer.appendChild(maximizeButton);

    // 最小化ボタン（初期状態では非表示）
    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'minimize-button';
    minimizeButton.textContent = '復元';
    minimizeButton.title = '元のサイズに戻す';
    minimizeButton.style.padding = '5px 10px';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.backgroundColor = '#555';
    minimizeButton.style.color = 'white';
    minimizeButton.style.border = 'none';
    minimizeButton.style.borderRadius = '3px';
    minimizeButton.style.display = 'none';
    controlContainer.appendChild(minimizeButton);

    // 現在の画像URLを保持する変数
    let currentImageUrl = imageMap.default;
    
    // 最大化状態を追跡する変数
    let isMaximized = false;
    
    // 最大化前のサイズと位置を保存する変数
    let preMaximizeState = {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        left: DEFAULT_LEFT,
        top: DEFAULT_TOP
    };

    // ドラッグ機能
    let isDragging = false;
    let offsetX, offsetY;

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
    let isResizing = false;
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

    // 状態保存関数
    function saveDisplayState() {
        const state = {
            width: imageContainer.offsetWidth,
            height: imageContainer.offsetHeight,
            left: parseInt(imageContainer.style.left) || DEFAULT_LEFT,
            top: parseInt(imageContainer.style.top) || DEFAULT_TOP,
            bgColor: colorPicker.value,
            isMaximized: isMaximized,  // 最大化状態を保存
            preMaximizeState: preMaximizeState  // 最大化前の状態を保存
        };
        localStorage.setItem('imageDisplayState', JSON.stringify(state));
        console.log('表示状態を保存しました', state);
    }

    // 状態復元関数
    function restoreDisplayState() {
        const savedState = localStorage.getItem('imageDisplayState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                
                // 通常状態を復元
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
                
                // 最大化前の状態を復元
                if (state.preMaximizeState) {
                    preMaximizeState = state.preMaximizeState;
                }
                
                // 最大化状態を復元
                if (state.isMaximized) {
                    // 最大化状態を設定
                    isMaximized = true;
                    
                    // 最大化処理を実行
                    imageContainer.style.width = '100%';
                    imageContainer.style.height = '100%';
                    imageContainer.style.left = '0';
                    imageContainer.style.top = '0';
                    
                    // リサイズハンドルを非表示
                    resizeHandle.style.display = 'none';
                    
                    // ボタン表示切り替え
                    maximizeButton.style.display = 'none';
                    minimizeButton.style.display = 'block';
                    
                    console.log('保存された最大化状態を復元');
                }
                
                console.log('表示状態を復元しました', state);
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
        
        // 最大化状態をリセット
        if (isMaximized) {
            toggleMaximize();
        }
        
        console.log('デフォルト状態を設定');
    }

    // 初期化時に状態復元
    restoreDisplayState();

    // 背景色変更イベント
    colorPicker.addEventListener('input', () => {
        const color = colorPicker.value;
        console.log('背景色を変更:', color);
        imageContainer.style.backgroundColor = color;
        saveDisplayState();
    });

    // リセットボタンのクリックイベント
    resetButton.addEventListener('click', () => {
        if (isMaximized) {
            toggleMaximize();
        }
        setDefaultDisplayState();
        saveDisplayState();
        console.log('リセットボタンが押されました');
    });

    // 最大化/最小化トグル関数
    function toggleMaximize() {
        if (isMaximized) {
            // 最小化処理
            imageContainer.style.width = `${preMaximizeState.width}px`;
            imageContainer.style.height = `${preMaximizeState.height}px`;
            imageContainer.style.left = `${preMaximizeState.left}px`;
            imageContainer.style.top = `${preMaximizeState.top}px`;
            
            // リサイズハンドルを再表示
            resizeHandle.style.display = 'block';
            
            // ボタン表示切り替え
            maximizeButton.style.display = 'block';
            minimizeButton.style.display = 'none';
        } else {
            // 最大化前の状態を保存
            preMaximizeState = {
                width: imageContainer.offsetWidth,
                height: imageContainer.offsetHeight,
                left: parseInt(imageContainer.style.left),
                top: parseInt(imageContainer.style.top)
            };
            
            // 最大化処理
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
            imageContainer.style.left = '0';
            imageContainer.style.top = '0';
            
            // リサイズハンドルを非表示
            resizeHandle.style.display = 'none';
            
            // ボタン表示切り替え
            maximizeButton.style.display = 'none';
            minimizeButton.style.display = 'block';
        }
        
        isMaximized = !isMaximized;
        console.log(`表示エリアを${isMaximized ? '最大化' : '最小化'}しました`);
        
        // 状態を保存
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
            // 最大化中は常に画面全体にフィット
            imageContainer.style.width = '100%';
            imageContainer.style.height = '100%';
        } else {
            saveDisplayState();
        }
    });

    // キーワード検出機能
    function checkKeywords(text) {
        console.log(`メッセージを分析: ${text}`);
        
        // デフォルト以外のキーワードグループを取得
        const keywordGroups = Object.entries(imageMap)
            .filter(([key]) => key !== "default")
            .map(([keys, url]) => ({
                keys: keys.split('|'),
                url
            }));
        
        // 各キーワードグループをチェック
        for (const group of keywordGroups) {
            for (const keyword of group.keys) {
                // 日本語キーワードの正規表現作成（単語境界なし）
                const regex = new RegExp(keyword);
                
                if (regex.test(text)) {
                    console.log(`キーワード検出: "${keyword}" -> ${group.url}`);
                    return group.url;
                }
            }
        }
        
        console.log(`キーワードなし -> 現在の画像を維持`);
        return null; // キーワードがない場合はnullを返す
    }

    // 画像読み込みエラー処理
    imgElement.onerror = function() {
        console.error("画像の読み込みに失敗しました:", this.src);
        this.src = imageMap.default;
    };

    // チャットメッセージ監視
    const chatContainer = document.getElementById('chat');
    if (chatContainer) {
        console.log("チャットコンテナ(#chat)を発見");
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && node.querySelector && node.querySelector('.mes_text')) {
                            const messageElement = node.querySelector('.mes_text');
                            const messageText = messageElement ? messageElement.textContent : '';
                            
                            if (messageText) {
                                console.log("新しいメッセージを検出:", messageText);
                                const newImageUrl = checkKeywords(messageText);
                                
                                // 新しい画像URLがある場合のみ更新
                                if (newImageUrl && newImageUrl !== currentImageUrl) {
                                    imgElement.src = newImageUrl;
                                    currentImageUrl = newImageUrl; // 現在の画像URLを更新
                                }
                            }
                        }
                    });
                }
            });
        });

        observer.observe(chatContainer, { 
            childList: true, 
            subtree: true
        });
    } else {
        console.error('チャットコンテナ(#chat)が見つかりません');
    }
});
