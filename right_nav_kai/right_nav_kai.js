(function () {
    'use strict';

    let debounceTimer;
    let characterImageCache = {};
    const DEBUG = true; // デバッグモード

    // デバッグログ出力関数
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[RightNavKai DEBUG]', ...args);
        }
    }

    // キャラクター名抽出関数
    function extractCharacterName(title) {
        debugLog('Extracting name from title:', title);
        const match = title.match(/\[Character\]\s*(.+?)\s*File:/);
        const name = match ? match[1].trim() : null;
        debugLog('Extracted character name:', name);
        return name;
    }

    // JSON取得関数（エラーハンドリング強化 & 構造非依存化）
    async function fetchCharacterImage(characterName, imgElement) {
        if (!characterName) {
            debugLog('Character name is missing');
            return;
        }

        if (characterImageCache[characterName]) {
            debugLog(`Using cached image for ${characterName}`, characterImageCache[characterName]);
            imgElement.src = characterImageCache[characterName];
            return;
        }

        try {
            const url = `addchara/${characterName}/${characterName}.json`;
            debugLog(`Fetching JSON from: ${url}`);

            const response = await fetch(url);
            if (!response.ok) {
                debugLog(`Fetch failed: ${response.status} ${response.statusText}`);
                return;
            }

            const jsonData = await response.json();
            debugLog(`JSON response for ${characterName}:`, jsonData);

            function findThumbnailUrl(obj) {
                if (typeof obj !== 'object' || obj === null) {
                    return null;
                }
                if (Object.prototype.hasOwnProperty.call(obj, 'image_display_extension')) {
                    const extensionData = obj.image_display_extension;
                    if (typeof extensionData === 'object' && extensionData !== null && Object.prototype.hasOwnProperty.call(extensionData, 'thumbnail')) {
                        return extensionData.thumbnail;
                    }
                }
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const value = obj[key];
                        if (typeof value === 'object' && value !== null) {
                            const result = findThumbnailUrl(value);
                            if (result) {
                                return result;
                            }
                        }
                    }
                }
                return null;
            }

            const imageUrl = findThumbnailUrl(jsonData);

            if (!imageUrl) {
                debugLog(`Image URL not found in JSON for ${characterName}`);
                return;
            }

            debugLog(`Found image URL for ${characterName}:`, imageUrl);
            characterImageCache[characterName] = imageUrl;
            imgElement.src = imageUrl;
            debugLog(`Image src updated to: ${imageUrl}`);
        } catch (error) {
            console.error(`Right Nav Kai: Failed to load image for ${characterName}`, error);
            debugLog(`Error details: ${error.message}`);
        }
    }

    // 画像更新関数
    function updateCharacterImages() {
        debugLog('Updating character images...');
        const characterBlocks = document.querySelectorAll('#right-nav-panel .character_select');
        debugLog(`Found ${characterBlocks.length} character blocks`);

        characterBlocks.forEach((block, index) => {
            const avatarElement = block.querySelector('.avatar');
            if (!avatarElement) return;

            const title = avatarElement.getAttribute('title');
            if (!title) return;

            const characterName = extractCharacterName(title);
            if (!characterName) return;

            const imgElement = avatarElement.querySelector('img');
            if (!imgElement) return;

            debugLog(`Processing character #${index}: ${characterName}`);
            fetchCharacterImage(characterName, imgElement);
        });
    }

    // Observer設定関数（スタイル操作を削除し、画像更新のトリガーに特化）
    function setupObserverForNavPanel(panel) {
        debugLog('Setting up observer for nav panel');

        const observer = new MutationObserver((mutations) => {
            // 複数の変更をまとめて処理するためのデバウンス
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // パネルが開いている（'openDrawer'クラスを持つ）場合のみ画像更新を実行
                if (panel.classList.contains('openDrawer')) {
                    debugLog('Panel is open, triggering image update.');
                    updateCharacterImages();
                }
            }, 100); // 連続的な変更に対応するため少し待つ
        });

        // 監視対象は元のままで、SillyTavernの様々な変更に対応できるようにする
        observer.observe(panel, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true
        });

        // キャラクターリスト自体の変更（ソートなど）も監視する
        const charList = document.getElementById('rm_print_characters_block');
        if (charList) {
            debugLog('Setting up observer for character list');
            const listObserver = new MutationObserver(() => {
                // ここでもデバウンスをかけるとより安定する
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    if (panel.classList.contains('openDrawer')) {
                        debugLog('Character list updated, triggering image update.');
                        updateCharacterImages();
                    }
                }, 100);
            });
            listObserver.observe(charList, {
                childList: true,
                subtree: true
            });
        }

        // 初期表示時にパネルが既に開いている場合に対応
        if (panel.classList.contains('openDrawer')) {
            debugLog('Panel already open on initialization, updating images.');
            // 少し遅延させてから実行し、初期描画を確実にする
            setTimeout(updateCharacterImages, 200);
        }
    }



    // 初期化関数
    function initialize() {
        debugLog('Initializing Right Nav Kai extension');
        const navPanel = document.getElementById('right-nav-panel');
        if (navPanel) {
            setupObserverForNavPanel(navPanel);
        } else {
            // navPanelがまだDOMにない場合、DOM全体を監視して出現を待つ
            const bodyObserver = new MutationObserver((mutations, observer) => {
                const foundPanel = document.getElementById('right-nav-panel');
                if (foundPanel) {
                    debugLog('Nav panel found via observer');
                    setupObserverForNavPanel(foundPanel);
                    observer.disconnect(); // パネルが見つかったら監視を停止
                }
            });
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    debugLog('Right Nav Kai extension loaded');

    // DOMの準備ができてから初期化を実行
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }
})();
