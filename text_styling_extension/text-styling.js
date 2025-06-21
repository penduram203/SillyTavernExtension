document.addEventListener('DOMContentLoaded', () => {
    console.log('テキストスタイル拡張機能: 初期化開始');
    
    // ▼▼▼ 削除 ▼▼▼
    // SVGフィルターをbodyに追加する関数 (createSvgFilters) 全体を削除
    // ▲▲▲ 削除 ▲▲▲

    // ▼▼▼ 削除 ▼▼▼
    // createSvgFilters(); // 起動時のフィルター生成呼び出しを削除
    // ▲▲▲ 削除 ▲▲▲

    const DEFAULTS = {
        strongFontSize: 200,
        strongFontWeight: 700,
        strongTextColor: '#ffffff',
        strongOutlineColor: '#000000',
        strongOutlineWidth: 1,
        strongLineHeight: 1.3,
        strongTextOpacity: 1.0,
        normalFontSize: 100,
        normalFontWeight: 400,
        normalTextColor: '#dddddd',
        normalOutlineColor: '#000000',
        normalOutlineWidth: 1,
        normalLineHeight: 1.5,
        normalTextOpacity: 1.0,
        chatWindowOpacity: 1.0,
        panelMinimized: false
    };
    
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
    }

    // (中略: パネルのHTML生成部分は変更なし)
    const panel = document.createElement('div');
    panel.id = 'text-styling-panel';
    document.body.appendChild(panel);

    const header = document.createElement('div');
    header.id = 'text-styling-header';
    header.textContent = 'テキストスタイル設定';
    panel.appendChild(header);

    const restoreButton = document.createElement('button');
    restoreButton.id = 'restore-panel-button';
    restoreButton.textContent = '⚙️';
    restoreButton.title = '設定パネルの表示/非表示';
    
    restoreButton.onclick = function() {
        panel.classList.toggle('hidden');
        saveSettings();
    };
    
    document.body.appendChild(restoreButton);

    const mainContainer = document.createElement('div');
    panel.appendChild(mainContainer);
    
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'columns-container';
    mainContainer.appendChild(columnsContainer);
    
    const leftColumn = document.createElement('div');
    leftColumn.className = 'column';
    columnsContainer.appendChild(leftColumn);
    
    const rightColumn = document.createElement('div');
    rightColumn.className = 'column';
    columnsContainer.appendChild(rightColumn);
    
    const strongSection = document.createElement('div');
    strongSection.className = 'text-styling-section';
    strongSection.innerHTML = `
        <h3>強調テキスト設定 (<strong>タグ内)</h3>
        <div class="text-styling-control-group">
            <label for="strong-font-size">文字サイズ: <span id="strong-font-size-value"></span>%</label>
            <input type="range" id="strong-font-size" min="50" max="300" step="10">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-font-weight">文字の太さ: <span id="strong-font-weight-value"></span></label>
            <input type="range" id="strong-font-weight" min="100" max="900" step="100">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-line-height">行間: <span id="strong-line-height-value"></span></label>
            <input type="range" id="strong-line-height" min="1.0" max="2.5" step="0.1">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-text-color">文字色</label>
            <input type="color" id="strong-text-color">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-outline-color">縁取り色</label>
            <input type="color" id="strong-outline-color">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-outline-width">縁取り幅: <span id="strong-outline-width-value"></span>px</label>
            <input type="range" id="strong-outline-width" min="0" max="15" step="1.0">
        </div>
        <div class="text-styling-control-group">
            <label for="strong-text-opacity">文字/縁取り 透過度: <span id="strong-text-opacity-value"></span>%</label>
            <input type="range" id="strong-text-opacity" min="0" max="100" step="1">
        </div>
    `;
    leftColumn.appendChild(strongSection);
    
    const normalSection = document.createElement('div');
    normalSection.className = 'text-styling-section';
    normalSection.innerHTML = `
        <h3>通常テキスト設定 (<strong>タグ外)</h3>
        <div class="text-styling-control-group">
            <label for="normal-font-size">文字サイズ: <span id="normal-font-size-value"></span>%</label>
            <input type="range" id="normal-font-size" min="50" max="300" step="10">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-font-weight">文字の太さ: <span id="normal-font-weight-value"></span></label>
            <input type="range" id="normal-font-weight" min="100" max="900" step="100">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-line-height">行間: <span id="normal-line-height-value"></span></label>
            <input type="range" id="normal-line-height" min="1.0" max="2.5" step="0.1">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-text-color">文字色</label>
            <input type="color" id="normal-text-color">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-outline-color">縁取り色</label>
            <input type="color" id="normal-outline-color">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-outline-width">縁取り幅: <span id="normal-outline-width-value"></span>px</label>
            <input type="range" id="normal-outline-width" min="0" max="15" step="1.0">
        </div>
        <div class="text-styling-control-group">
            <label for="normal-text-opacity">文字/縁取り 透過度: <span id="normal-text-opacity-value"></span>%</label>
            <input type="range" id="normal-text-opacity" min="0" max="100" step="1">
        </div>
    `;
    rightColumn.appendChild(normalSection);
    
    const chatSection = document.createElement('div');
    chatSection.className = 'text-styling-section';
    chatSection.innerHTML = `
        <h3>チャットウィンドウ設定</h3>
        <div class="text-styling-control-group">
            <label for="chat-opacity">透過度: <span id="chat-opacity-value"></span>%</label>
            <input type="range" id="chat-opacity" min="0" max="100" step="1">
        </div>
    `;
    mainContainer.appendChild(chatSection);
    
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
    const strongTextOpacityInput = document.getElementById('strong-text-opacity');
    const strongTextOpacityValue = document.getElementById('strong-text-opacity-value');
    
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
    const normalTextOpacityInput = document.getElementById('normal-text-opacity');
    const normalTextOpacityValue = document.getElementById('normal-text-opacity-value');
    
    const chatOpacityInput = document.getElementById('chat-opacity');
    const chatOpacityValue = document.getElementById('chat-opacity-value');

    strongFontSizeInput.addEventListener('input', () => updateStrongStyle());
    strongFontWeightInput.addEventListener('input', () => updateStrongStyle());
    strongLineHeightInput.addEventListener('input', () => updateStrongStyle());
    strongTextColorInput.addEventListener('input', () => updateStrongStyle());
    strongOutlineColorInput.addEventListener('input', () => updateStrongStyle());
    strongOutlineWidthInput.addEventListener('input', () => updateStrongStyle());
    strongTextOpacityInput.addEventListener('input', () => updateStrongStyle());
    
    normalFontSizeInput.addEventListener('input', () => updateNormalStyle());
    normalFontWeightInput.addEventListener('input', () => updateNormalStyle());
    normalLineHeightInput.addEventListener('input', () => updateNormalStyle());
    normalTextColorInput.addEventListener('input', () => updateNormalStyle());
    normalOutlineColorInput.addEventListener('input', () => updateNormalStyle());
    normalOutlineWidthInput.addEventListener('input', () => updateNormalStyle());
    normalTextOpacityInput.addEventListener('input', () => updateNormalStyle());
    
    chatOpacityInput.addEventListener('input', updateChatWindowOpacity);

    // ▼▼▼ ここから変更 ▼▼▼
    function updateStrongStyle() {
        const fontSize = parseInt(strongFontSizeInput.value);
        const fontWeight = parseInt(strongFontWeightInput.value);
        const lineHeight = parseFloat(strongLineHeightInput.value);
        const textColor = strongTextColorInput.value;
        const outlineColor = strongOutlineColorInput.value;
        const outlineWidth = parseFloat(strongOutlineWidthInput.value);
        const textOpacity = parseFloat(strongTextOpacityInput.value) / 100;
        
        strongFontSizeValue.textContent = fontSize;
        strongFontWeightValue.textContent = fontWeight;
        strongLineHeightValue.textContent = lineHeight.toFixed(1);
        strongOutlineWidthValue.textContent = outlineWidth.toFixed(1);
        strongTextOpacityValue.textContent = Math.round(textOpacity * 100);
        
        // CSS変数の更新
        document.documentElement.style.setProperty('--strong-font-size', `${fontSize}%`);
        document.documentElement.style.setProperty('--strong-font-weight', fontWeight);
        document.documentElement.style.setProperty('--strong-line-height', lineHeight);
        document.documentElement.style.setProperty('--strong-text-rgb', hexToRgb(textColor));
        document.documentElement.style.setProperty('--strong-text-opacity', textOpacity);
        
        // 縁取り用のCSS変数を更新 (SVG操作を削除)
        document.documentElement.style.setProperty('--strong-outline-width', `${outlineWidth}px`);
        document.documentElement.style.setProperty('--strong-outline-rgb', hexToRgb(outlineColor));
        
        saveSettings();
    }

    function updateNormalStyle() {
        const fontSize = parseInt(normalFontSizeInput.value);
        const fontWeight = parseInt(normalFontWeightInput.value);
        const lineHeight = parseFloat(normalLineHeightInput.value);
        const textColor = normalTextColorInput.value;
        const outlineColor = normalOutlineColorInput.value;
        const outlineWidth = parseFloat(normalOutlineWidthInput.value);
        const textOpacity = parseFloat(normalTextOpacityInput.value) / 100;

        normalFontSizeValue.textContent = fontSize;
        normalFontWeightValue.textContent = fontWeight;
        normalLineHeightValue.textContent = lineHeight.toFixed(1);
        normalOutlineWidthValue.textContent = outlineWidth.toFixed(1);
        normalTextOpacityValue.textContent = Math.round(textOpacity * 100);
        
        // CSS変数の更新
        document.documentElement.style.setProperty('--normal-font-size', `${fontSize}%`);
        document.documentElement.style.setProperty('--normal-font-weight', fontWeight);
        document.documentElement.style.setProperty('--normal-line-height', lineHeight);
        document.documentElement.style.setProperty('--normal-text-rgb', hexToRgb(textColor));
        document.documentElement.style.setProperty('--normal-text-opacity', textOpacity);
        
        // 縁取り用のCSS変数を更新 (SVG操作を削除)
        document.documentElement.style.setProperty('--normal-outline-width', `${outlineWidth}px`);
        document.documentElement.style.setProperty('--normal-outline-rgb', hexToRgb(outlineColor));

        saveSettings();
    }
    // ▲▲▲ ここまで変更 ▲▲▲

    function updateChatWindowOpacity() {
        const opacity = parseInt(chatOpacityInput.value) / 100;
        chatOpacityValue.textContent = chatOpacityInput.value;
        document.documentElement.style.setProperty('--chat-opacity', opacity);
        saveSettings();
    }

    // (中略: saveSettings, restoreSettings, setDefaultSettings, setTimeout内の処理は変更なし)
    function saveSettings() {
        const settings = {
            strongFontSize: parseInt(strongFontSizeInput.value),
            strongFontWeight: parseInt(strongFontWeightInput.value),
            strongLineHeight: parseFloat(strongLineHeightInput.value),
            strongTextColor: strongTextColorInput.value,
            strongOutlineColor: strongOutlineColorInput.value,
            strongOutlineWidth: parseFloat(strongOutlineWidthInput.value),
            strongTextOpacity: parseFloat(strongTextOpacityInput.value) / 100,
            normalFontSize: parseInt(normalFontSizeInput.value),
            normalFontWeight: parseInt(normalFontWeightInput.value),
            normalLineHeight: parseFloat(normalLineHeightInput.value),
            normalTextColor: normalTextColorInput.value,
            normalOutlineColor: normalOutlineColorInput.value,
            normalOutlineWidth: parseFloat(normalOutlineWidthInput.value),
            normalTextOpacity: parseFloat(normalTextOpacityInput.value) / 100,
            chatWindowOpacity: parseFloat(chatOpacityInput.value) / 100,
            panelMinimized: panel.classList.contains('hidden')
        };
        localStorage.setItem('textStylingSettings', JSON.stringify(settings));
    }

    function restoreSettings() {
        const saved = localStorage.getItem('textStylingSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                
                strongFontSizeInput.value = settings.strongFontSize || DEFAULTS.strongFontSize;
                strongFontWeightInput.value = settings.strongFontWeight || DEFAULTS.strongFontWeight;
                strongLineHeightInput.value = settings.strongLineHeight || DEFAULTS.strongLineHeight;
                strongTextColorInput.value = settings.strongTextColor || DEFAULTS.strongTextColor;
                strongOutlineColorInput.value = settings.strongOutlineColor || DEFAULTS.strongOutlineColor;
                strongOutlineWidthInput.value = settings.strongOutlineWidth !== undefined ? settings.strongOutlineWidth : DEFAULTS.strongOutlineWidth;
                strongTextOpacityInput.value = Math.round((settings.strongTextOpacity !== undefined ? settings.strongTextOpacity : DEFAULTS.strongTextOpacity) * 100);
                
                normalFontSizeInput.value = settings.normalFontSize || DEFAULTS.normalFontSize;
                normalFontWeightInput.value = settings.normalFontWeight || DEFAULTS.normalFontWeight;
                normalLineHeightInput.value = settings.normalLineHeight || DEFAULTS.normalLineHeight;
                normalTextColorInput.value = settings.normalTextColor || DEFAULTS.normalTextColor;
                normalOutlineColorInput.value = settings.normalOutlineColor || DEFAULTS.normalOutlineColor;
                normalOutlineWidthInput.value = settings.normalOutlineWidth !== undefined ? settings.normalOutlineWidth : DEFAULTS.normalOutlineWidth;
                normalTextOpacityInput.value = Math.round((settings.normalTextOpacity !== undefined ? settings.normalTextOpacity : DEFAULTS.normalTextOpacity) * 100);

                chatOpacityInput.value = Math.round((settings.chatWindowOpacity !== undefined ? settings.chatWindowOpacity : DEFAULTS.chatWindowOpacity) * 100);
                
                if (settings.panelMinimized) {
                    panel.classList.add('hidden');
                } else {
                    panel.classList.remove('hidden');
                }

                const originalSave = saveSettings;
                saveSettings = () => {};
                updateStrongStyle();
                updateNormalStyle();
                updateChatWindowOpacity();
                saveSettings = originalSave;

            } catch (e) {
                console.error('設定復元エラー:', e);
                setDefaultSettings();
            }
        } else {
            setDefaultSettings();
        }
    }

    function setDefaultSettings() {
        strongFontSizeInput.value = DEFAULTS.strongFontSize;
        strongFontWeightInput.value = DEFAULTS.strongFontWeight;
        strongLineHeightInput.value = DEFAULTS.strongLineHeight;
        strongTextColorInput.value = DEFAULTS.strongTextColor;
        strongOutlineColorInput.value = DEFAULTS.strongOutlineColor;
        strongOutlineWidthInput.value = DEFAULTS.strongOutlineWidth;
        strongTextOpacityInput.value = Math.round(DEFAULTS.strongTextOpacity * 100);
        
        normalFontSizeInput.value = DEFAULTS.normalFontSize;
        normalFontWeightInput.value = DEFAULTS.normalFontWeight;
        normalLineHeightInput.value = DEFAULTS.normalLineHeight;
        normalTextColorInput.value = DEFAULTS.normalTextColor;
        normalOutlineColorInput.value = DEFAULTS.normalOutlineColor;
        normalOutlineWidthInput.value = DEFAULTS.normalOutlineWidth;
        normalTextOpacityInput.value = Math.round(DEFAULTS.normalTextOpacity * 100);
        
        chatOpacityInput.value = Math.round(DEFAULTS.chatWindowOpacity * 100);
        
        panel.classList.remove('hidden');

        const originalSave = saveSettings;
        saveSettings = () => {};
        updateStrongStyle();
        updateNormalStyle();
        updateChatWindowOpacity();
        saveSettings = originalSave;
    }

    setTimeout(() => {
        console.log('初期化処理を開始');
        const chatElement = document.getElementById('chat');
        if (chatElement) {
            const chatBgColor = getComputedStyle(chatElement).backgroundColor;
            document.documentElement.style.setProperty('--chat-bg-rgb', hexToRgb(chatBgColor));
        }
        restoreSettings();
    }, 500);
});
