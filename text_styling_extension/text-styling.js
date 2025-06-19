document.addEventListener('DOMContentLoaded', () => {
    console.log('テキストスタイル拡張機能: 初期化開始');
    
    // デフォルト設定値
    const DEFAULTS = {
        // 強調テキスト設定
        strongFontSize: 200,
        strongFontWeight: 700,
        strongTextColor: '#ffffff',
        strongOutlineColor: '#000000',
        strongOutlineWidth: 1,
        strongLineHeight: 1.3,
        
        // 通常テキスト設定
        normalFontSize: 100,
        normalFontWeight: 400,
        normalTextColor: '#dddddd',
        normalOutlineColor: '#000000',
        normalOutlineWidth: 1,
        normalLineHeight: 1.5,
        
        // チャットウィンドウ設定
        chatWindowOpacity: 1.0,
        
        // パネル状態
        panelMinimized: false
    };

    // 操作パネル作成
    const panel = document.createElement('div');
    panel.id = 'text-styling-panel';
    document.body.appendChild(panel);
    console.log('パネル要素を作成');

    // ヘッダー作成
    const header = document.createElement('div');
    header.id = 'text-styling-header';
    header.textContent = 'テキストスタイル設定';
    panel.appendChild(header);

    // 最小化ボタン作成
    const minimizeButton = document.createElement('button');
    minimizeButton.id = 'minimize-button';
    minimizeButton.textContent = '－';
    minimizeButton.title = '最小化';
    
    minimizeButton.onclick = function() {
        console.log('最小化ボタンがクリックされました');
        panel.classList.add('hidden');
        restoreButton.classList.add('visible');
        saveSettings();
    };
    
    header.appendChild(minimizeButton);
    console.log('最小化ボタンを作成・登録');

    // 復元ボタン作成
    const restoreButton = document.createElement('button');
    restoreButton.id = 'restore-panel-button';
    restoreButton.textContent = '⚙️';
    restoreButton.title = '設定パネルを開く';
    
    restoreButton.onclick = function() {
        console.log('復元ボタンがクリックされました');
        panel.classList.remove('hidden');
        restoreButton.classList.remove('visible');
        saveSettings();
    };
    
    document.body.appendChild(restoreButton);
    console.log('復元ボタンを作成・登録');

    // メインコンテナ作成 (2列レイアウト用)
    const mainContainer = document.createElement('div');
    panel.appendChild(mainContainer);
    
    // 2列レイアウトコンテナ
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'columns-container';
    mainContainer.appendChild(columnsContainer);
    
    // 左カラム (強調テキスト設定)
    const leftColumn = document.createElement('div');
    leftColumn.className = 'column';
    columnsContainer.appendChild(leftColumn);
    
    // 右カラム (通常テキスト設定)
    const rightColumn = document.createElement('div');
    rightColumn.className = 'column';
    columnsContainer.appendChild(rightColumn);
    
    // 強調テキスト設定セクション
    const strongSection = document.createElement('div');
    strongSection.className = 'text-styling-section';
    strongSection.innerHTML = `
        <h3>強調テキスト設定 (&lt;strong&gt;タグ内)</h3>
        
        <div class="text-styling-control-group">
            <label for="strong-font-size">
                文字サイズ: <span id="strong-font-size-value">${DEFAULTS.strongFontSize}</span>%
            </label>
            <input type="range" id="strong-font-size" min="50" max="300" step="10" value="${DEFAULTS.strongFontSize}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="strong-font-weight">
                文字の太さ: <span id="strong-font-weight-value">${DEFAULTS.strongFontWeight}</span>
            </label>
            <input type="range" id="strong-font-weight" min="100" max="900" step="100" value="${DEFAULTS.strongFontWeight}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="strong-line-height">
                行間: <span id="strong-line-height-value">${DEFAULTS.strongLineHeight}</span>
            </label>
            <input type="range" id="strong-line-height" min="1.0" max="2.5" step="0.1" value="${DEFAULTS.strongLineHeight}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="strong-text-color">文字色</label>
            <input type="color" id="strong-text-color" value="${DEFAULTS.strongTextColor}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="strong-outline-color">縁取り色</label>
            <input type="color" id="strong-outline-color" value="${DEFAULTS.strongOutlineColor}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="strong-outline-width">
                縁取り幅: <span id="strong-outline-width-value">${DEFAULTS.strongOutlineWidth}</span>px
            </label>
            <input type="range" id="strong-outline-width" min="0" max="5" step="0.1" value="${DEFAULTS.strongOutlineWidth}">
        </div>
    `;
    leftColumn.appendChild(strongSection);
    
    // 通常テキスト設定セクション
    const normalSection = document.createElement('div');
    normalSection.className = 'text-styling-section';
    normalSection.innerHTML = `
        <h3>通常テキスト設定 (&lt;strong&gt;タグ外)</h3>
        
        <div class="text-styling-control-group">
            <label for="normal-font-size">
                文字サイズ: <span id="normal-font-size-value">${DEFAULTS.normalFontSize}</span>%
            </label>
            <input type="range" id="normal-font-size" min="50" max="300" step="10" value="${DEFAULTS.normalFontSize}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="normal-font-weight">
                文字の太さ: <span id="normal-font-weight-value">${DEFAULTS.normalFontWeight}</span>
            </label>
            <input type="range" id="normal-font-weight" min="100" max="900" step="100" value="${DEFAULTS.normalFontWeight}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="normal-line-height">
                行間: <span id="normal-line-height-value">${DEFAULTS.normalLineHeight}</span>
            </label>
            <input type="range" id="normal-line-height" min="1.0" max="2.5" step="0.1" value="${DEFAULTS.normalLineHeight}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="normal-text-color">文字色</label>
            <input type="color" id="normal-text-color" value="${DEFAULTS.normalTextColor}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="normal-outline-color">縁取り色</label>
            <input type="color" id="normal-outline-color" value="${DEFAULTS.normalOutlineColor}">
        </div>
        
        <div class="text-styling-control-group">
            <label for="normal-outline-width">
                縁取り幅: <span id="normal-outline-width-value">${DEFAULTS.normalOutlineWidth}</span>px
            </label>
            <input type="range" id="normal-outline-width" min="0" max="5" step="0.1" value="${DEFAULTS.normalOutlineWidth}">
        </div>
    `;
    rightColumn.appendChild(normalSection);
    
    // チャットウィンドウ設定セクション
    const chatSection = document.createElement('div');
    chatSection.className = 'text-styling-section';
    chatSection.innerHTML = `
        <h3>チャットウィンドウ設定</h3>
        
        <div class="text-styling-control-group">
            <label for="chat-opacity">
                透過度: <span id="chat-opacity-value">${Math.round(DEFAULTS.chatWindowOpacity * 100)}</span>%
            </label>
            <input type="range" id="chat-opacity" min="0" max="100" step="1" value="${Math.round(DEFAULTS.chatWindowOpacity * 100)}">
        </div>
    `;
    mainContainer.appendChild(chatSection);
    
    console.log('コントロール要素を追加');

    // 各コントロールの要素を取得
    // 強調テキスト設定
    const strongFontSizeInput = document.getElementById('strong-font-size');
    const strongFontSizeValue = document.getElementById('strong-font-size-value');
    const strongFontWeightInput = document.getElementById('strong-font-weight');
    const strongFontWeightValue = document.getElementById('strong-font-weight-value');
    const strongLineHeightInput = document.getElementById('strong-line-height');
    const strongLineHeightValue = document.getElementById('strong-line-height-value');
    const strongTextColorInput = document.getElementById('strong-text-color');
    const strongOutlineColorInput = document.getElementById('strong-outline-color');
    const strongOutlineWidthInput = document.getElementById('strong-outline-width');
    const strongOutlineWidthValue = document.getElementById('strong-outline-width-value');
    
    // 通常テキスト設定
    const normalFontSizeInput = document.getElementById('normal-font-size');
    const normalFontSizeValue = document.getElementById('normal-font-size-value');
    const normalFontWeightInput = document.getElementById('normal-font-weight');
    const normalFontWeightValue = document.getElementById('normal-font-weight-value');
    const normalLineHeightInput = document.getElementById('normal-line-height');
    const normalLineHeightValue = document.getElementById('normal-line-height-value');
    const normalTextColorInput = document.getElementById('normal-text-color');
    const normalOutlineColorInput = document.getElementById('normal-outline-color');
    const normalOutlineWidthInput = document.getElementById('normal-outline-width');
    const normalOutlineWidthValue = document.getElementById('normal-outline-width-value');
    
    // チャットウィンドウ設定
    const chatOpacityInput = document.getElementById('chat-opacity');
    const chatOpacityValue = document.getElementById('chat-opacity-value');

    // CSS変数を初期化
    document.documentElement.style.setProperty('--strong-font-size', `${DEFAULTS.strongFontSize}%`);
    document.documentElement.style.setProperty('--strong-font-weight', DEFAULTS.strongFontWeight);
    document.documentElement.style.setProperty('--strong-line-height', DEFAULTS.strongLineHeight);
    document.documentElement.style.setProperty('--strong-text-color', DEFAULTS.strongTextColor);
    document.documentElement.style.setProperty('--strong-outline-color', DEFAULTS.strongOutlineColor);
    document.documentElement.style.setProperty('--strong-outline-width', `${DEFAULTS.strongOutlineWidth}px`);
    
    document.documentElement.style.setProperty('--normal-font-size', `${DEFAULTS.normalFontSize}%`);
    document.documentElement.style.setProperty('--normal-font-weight', DEFAULTS.normalFontWeight);
    document.documentElement.style.setProperty('--normal-line-height', DEFAULTS.normalLineHeight);
    document.documentElement.style.setProperty('--normal-text-color', DEFAULTS.normalTextColor);
    document.documentElement.style.setProperty('--normal-outline-color', DEFAULTS.normalOutlineColor);
    document.documentElement.style.setProperty('--normal-outline-width', `${DEFAULTS.normalOutlineWidth}px`);
    
    document.documentElement.style.setProperty('--chat-opacity', DEFAULTS.chatWindowOpacity);
    
    console.log('CSS変数を初期化');

    // 設定変更イベントリスナー
    // 強調テキスト
    strongFontSizeInput.addEventListener('input', () => updateStrongStyle());
    strongFontWeightInput.addEventListener('input', () => updateStrongStyle());
    strongLineHeightInput.addEventListener('input', () => updateStrongStyle());
    strongTextColorInput.addEventListener('input', () => updateStrongStyle());
    strongOutlineColorInput.addEventListener('input', () => updateStrongStyle());
    strongOutlineWidthInput.addEventListener('input', () => updateStrongStyle());
    
    // 通常テキスト
    normalFontSizeInput.addEventListener('input', () => updateNormalStyle());
    normalFontWeightInput.addEventListener('input', () => updateNormalStyle());
    normalLineHeightInput.addEventListener('input', () => updateNormalStyle());
    normalTextColorInput.addEventListener('input', () => updateNormalStyle());
    normalOutlineColorInput.addEventListener('input', () => updateNormalStyle());
    normalOutlineWidthInput.addEventListener('input', () => updateNormalStyle());
    
    // チャットウィンドウ
    chatOpacityInput.addEventListener('input', updateChatWindowOpacity);

    // 強調テキストスタイルを更新
    function updateStrongStyle() {
        const fontSize = parseInt(strongFontSizeInput.value);
        const fontWeight = parseInt(strongFontWeightInput.value);
        const lineHeight = parseFloat(strongLineHeightInput.value);
        const textColor = strongTextColorInput.value;
        const outlineColor = strongOutlineColorInput.value;
        const outlineWidth = parseFloat(strongOutlineWidthInput.value);
        
        strongFontSizeValue.textContent = fontSize;
        strongFontWeightValue.textContent = fontWeight;
        strongLineHeightValue.textContent = lineHeight.toFixed(1);
        strongOutlineWidthValue.textContent = outlineWidth.toFixed(1);
        
        document.documentElement.style.setProperty('--strong-font-size', `${fontSize}%`);
        document.documentElement.style.setProperty('--strong-font-weight', fontWeight);
        document.documentElement.style.setProperty('--strong-line-height', lineHeight);
        document.documentElement.style.setProperty('--strong-text-color', textColor);
        document.documentElement.style.setProperty('--strong-outline-color', outlineColor);
        document.documentElement.style.setProperty('--strong-outline-width', `${outlineWidth}px`);
        
        saveSettings();
    }

    // 通常テキストスタイルを更新
    function updateNormalStyle() {
        const fontSize = parseInt(normalFontSizeInput.value);
        const fontWeight = parseInt(normalFontWeightInput.value);
        const lineHeight = parseFloat(normalLineHeightInput.value);
        const textColor = normalTextColorInput.value;
        const outlineColor = normalOutlineColorInput.value;
        const outlineWidth = parseFloat(normalOutlineWidthInput.value);
        
        normalFontSizeValue.textContent = fontSize;
        normalFontWeightValue.textContent = fontWeight;
        normalLineHeightValue.textContent = lineHeight.toFixed(1);
        normalOutlineWidthValue.textContent = outlineWidth.toFixed(1);
        
        document.documentElement.style.setProperty('--normal-font-size', `${fontSize}%`);
        document.documentElement.style.setProperty('--normal-font-weight', fontWeight);
        document.documentElement.style.setProperty('--normal-line-height', lineHeight);
        document.documentElement.style.setProperty('--normal-text-color', textColor);
        document.documentElement.style.setProperty('--normal-outline-color', outlineColor);
        document.documentElement.style.setProperty('--normal-outline-width', `${outlineWidth}px`);
        
        saveSettings();
    }

    // チャットウィンドウ透過度を更新
    function updateChatWindowOpacity() {
        const opacity = parseInt(chatOpacityInput.value) / 100;
        chatOpacityValue.textContent = chatOpacityInput.value;
        document.documentElement.style.setProperty('--chat-opacity', opacity);
        saveSettings();
    }

    // 設定を保存
    function saveSettings() {
        const settings = {
            // 強調テキスト設定
            strongFontSize: parseInt(strongFontSizeInput.value),
            strongFontWeight: parseInt(strongFontWeightInput.value),
            strongLineHeight: parseFloat(strongLineHeightInput.value),
            strongTextColor: strongTextColorInput.value,
            strongOutlineColor: strongOutlineColorInput.value,
            strongOutlineWidth: parseFloat(strongOutlineWidthInput.value),
            
            // 通常テキスト設定
            normalFontSize: parseInt(normalFontSizeInput.value),
            normalFontWeight: parseInt(normalFontWeightInput.value),
            normalLineHeight: parseFloat(normalLineHeightInput.value),
            normalTextColor: normalTextColorInput.value,
            normalOutlineColor: normalOutlineColorInput.value,
            normalOutlineWidth: parseFloat(normalOutlineWidthInput.value),
            
            // チャットウィンドウ設定
            chatWindowOpacity: parseFloat(chatOpacityInput.value) / 100,
            
            // パネル状態
            panelMinimized: panel.classList.contains('hidden')
        };
        
        localStorage.setItem('textStylingSettings', JSON.stringify(settings));
        console.log('設定を保存:', settings);
    }

    // 設定を復元
    function restoreSettings() {
        const saved = localStorage.getItem('textStylingSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                console.log('保存された設定を復元:', settings);
                
                // 強調テキスト設定
                strongFontSizeInput.value = settings.strongFontSize || DEFAULTS.strongFontSize;
                strongFontWeightInput.value = settings.strongFontWeight || DEFAULTS.strongFontWeight;
                strongLineHeightInput.value = settings.strongLineHeight || DEFAULTS.strongLineHeight;
                strongTextColorInput.value = settings.strongTextColor || DEFAULTS.strongTextColor;
                strongOutlineColorInput.value = settings.strongOutlineColor || DEFAULTS.strongOutlineColor;
                strongOutlineWidthInput.value = settings.strongOutlineWidth || DEFAULTS.strongOutlineWidth;
                
                // 通常テキスト設定
                normalFontSizeInput.value = settings.normalFontSize || DEFAULTS.normalFontSize;
                normalFontWeightInput.value = settings.normalFontWeight || DEFAULTS.normalFontWeight;
                normalLineHeightInput.value = settings.normalLineHeight || DEFAULTS.normalLineHeight;
                normalTextColorInput.value = settings.normalTextColor || DEFAULTS.normalTextColor;
                normalOutlineColorInput.value = settings.normalOutlineColor || DEFAULTS.normalOutlineColor;
                normalOutlineWidthInput.value = settings.normalOutlineWidth || DEFAULTS.normalOutlineWidth;
                
                // チャットウィンドウ設定
                chatOpacityInput.value = Math.round((settings.chatWindowOpacity || DEFAULTS.chatWindowOpacity) * 100);
                
                // 表示値を更新
                strongFontSizeValue.textContent = strongFontSizeInput.value;
                strongFontWeightValue.textContent = strongFontWeightInput.value;
                strongLineHeightValue.textContent = parseFloat(strongLineHeightInput.value).toFixed(1);
                strongOutlineWidthValue.textContent = parseFloat(strongOutlineWidthInput.value).toFixed(1);
                
                normalFontSizeValue.textContent = normalFontSizeInput.value;
                normalFontWeightValue.textContent = normalFontWeightInput.value;
                normalLineHeightValue.textContent = parseFloat(normalLineHeightInput.value).toFixed(1);
                normalOutlineWidthValue.textContent = parseFloat(normalOutlineWidthInput.value).toFixed(1);
                
                chatOpacityValue.textContent = chatOpacityInput.value;
                
                // CSS変数を更新
                document.documentElement.style.setProperty('--strong-font-size', `${strongFontSizeInput.value}%`);
                document.documentElement.style.setProperty('--strong-font-weight', strongFontWeightInput.value);
                document.documentElement.style.setProperty('--strong-line-height', strongLineHeightInput.value);
                document.documentElement.style.setProperty('--strong-text-color', strongTextColorInput.value);
                document.documentElement.style.setProperty('--strong-outline-color', strongOutlineColorInput.value);
                document.documentElement.style.setProperty('--strong-outline-width', `${strongOutlineWidthInput.value}px`);
                
                document.documentElement.style.setProperty('--normal-font-size', `${normalFontSizeInput.value}%`);
                document.documentElement.style.setProperty('--normal-font-weight', normalFontWeightInput.value);
                document.documentElement.style.setProperty('--normal-line-height', normalLineHeightInput.value);
                document.documentElement.style.setProperty('--normal-text-color', normalTextColorInput.value);
                document.documentElement.style.setProperty('--normal-outline-color', normalOutlineColorInput.value);
                document.documentElement.style.setProperty('--normal-outline-width', `${normalOutlineWidthInput.value}px`);
                
                document.documentElement.style.setProperty('--chat-opacity', settings.chatWindowOpacity || DEFAULTS.chatWindowOpacity);
                
                // パネル状態を復元
                if (settings.panelMinimized) {
                    console.log('最小化状態を復元');
                    panel.classList.add('hidden');
                    restoreButton.classList.add('visible');
                }
            } catch (e) {
                console.error('設定復元エラー:', e);
                setDefaultSettings();
            }
        } else {
            console.log('保存された設定なし、デフォルトを使用');
            setDefaultSettings();
        }
    }

    // デフォルト設定
    function setDefaultSettings() {
        // 強調テキスト設定
        strongFontSizeInput.value = DEFAULTS.strongFontSize;
        strongFontWeightInput.value = DEFAULTS.strongFontWeight;
        strongLineHeightInput.value = DEFAULTS.strongLineHeight;
        strongTextColorInput.value = DEFAULTS.strongTextColor;
        strongOutlineColorInput.value = DEFAULTS.strongOutlineColor;
        strongOutlineWidthInput.value = DEFAULTS.strongOutlineWidth;
        
        // 通常テキスト設定
        normalFontSizeInput.value = DEFAULTS.normalFontSize;
        normalFontWeightInput.value = DEFAULTS.normalFontWeight;
        normalLineHeightInput.value = DEFAULTS.normalLineHeight;
        normalTextColorInput.value = DEFAULTS.normalTextColor;
        normalOutlineColorInput.value = DEFAULTS.normalOutlineColor;
        normalOutlineWidthInput.value = DEFAULTS.normalOutlineWidth;
        
        // チャットウィンドウ設定
        chatOpacityInput.value = Math.round(DEFAULTS.chatWindowOpacity * 100);
        
        // 表示値を更新
        strongFontSizeValue.textContent = DEFAULTS.strongFontSize;
        strongFontWeightValue.textContent = DEFAULTS.strongFontWeight;
        strongLineHeightValue.textContent = DEFAULTS.strongLineHeight.toFixed(1);
        strongOutlineWidthValue.textContent = DEFAULTS.strongOutlineWidth.toFixed(1);
        
        normalFontSizeValue.textContent = DEFAULTS.normalFontSize;
        normalFontWeightValue.textContent = DEFAULTS.normalFontWeight;
        normalLineHeightValue.textContent = DEFAULTS.normalLineHeight.toFixed(1);
        normalOutlineWidthValue.textContent = DEFAULTS.normalOutlineWidth.toFixed(1);
        
        chatOpacityValue.textContent = Math.round(DEFAULTS.chatWindowOpacity * 100);
        
        // CSS変数を更新
        document.documentElement.style.setProperty('--strong-font-size', `${DEFAULTS.strongFontSize}%`);
        document.documentElement.style.setProperty('--strong-font-weight', DEFAULTS.strongFontWeight);
        document.documentElement.style.setProperty('--strong-line-height', DEFAULTS.strongLineHeight);
        document.documentElement.style.setProperty('--strong-text-color', DEFAULTS.strongTextColor);
        document.documentElement.style.setProperty('--strong-outline-color', DEFAULTS.strongOutlineColor);
        document.documentElement.style.setProperty('--strong-outline-width', `${DEFAULTS.strongOutlineWidth}px`);
        
        document.documentElement.style.setProperty('--normal-font-size', `${DEFAULTS.normalFontSize}%`);
        document.documentElement.style.setProperty('--normal-font-weight', DEFAULTS.normalFontWeight);
        document.documentElement.style.setProperty('--normal-line-height', DEFAULTS.normalLineHeight);
        document.documentElement.style.setProperty('--normal-text-color', DEFAULTS.normalTextColor);
        document.documentElement.style.setProperty('--normal-outline-color', DEFAULTS.normalOutlineColor);
        document.documentElement.style.setProperty('--normal-outline-width', `${DEFAULTS.normalOutlineWidth}px`);
        
        document.documentElement.style.setProperty('--chat-opacity', DEFAULTS.chatWindowOpacity);
    }

    // 初期化
    setTimeout(() => {
        console.log('初期化処理を開始');
        
        // チャット背景色を取得してRGB形式で保存
        const chatElement = document.getElementById('chat');
        if (chatElement) {
            const chatBgColor = getComputedStyle(chatElement).backgroundColor;
            const rgbValues = chatBgColor.match(/\d+/g);
            if (rgbValues && rgbValues.length >= 3) {
                document.documentElement.style.setProperty(
                    '--chat-bg-rgb', 
                    `${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}`
                );
                console.log('チャット背景色を設定:', rgbValues);
            }
        }
        
        // 設定を復元
        restoreSettings();
        
        // デバッグ情報を出力
        console.log('最小化ボタン要素:', minimizeButton);
        console.log('復元ボタン要素:', restoreButton);
        console.log('初期パネル状態:', panel.classList.contains('hidden') ? '非表示' : '表示');
    }, 500);
});
