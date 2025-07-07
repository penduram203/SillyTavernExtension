(function () {
    'use strict';

    let debounceTimer;
    const characterImageCache = new Map(); // Mapオブジェクトでキャッシュ管理
    const CACHE_EXPIRY_DAYS = 7; // キャッシュ有効期限（日）
    const DEBUG = true; // デバッグモード

    // デバッグログ出力関数
    function debugLog(...args) {
        if (DEBUG) {
            console.log('[RightNavKai DEBUG]', ...args);
        }
    }

    // ローカルストレージからキャッシュを読み込み
    function loadCacheFromStorage() {
        try {
            const cacheData = localStorage.getItem('rightNavKaiCache');
            if (cacheData) {
                const parsedCache = JSON.parse(cacheData);
                const currentTime = Date.now();
                
                for (const [name, entry] of Object.entries(parsedCache)) {
                    // 有効期限内のキャッシュのみ読み込み
                    if (currentTime - entry.timestamp < CACHE_EXPIRY_DAYS * 86400000) {
                        characterImageCache.set(name, entry);
                    }
                }
                debugLog('Cache loaded from localStorage', characterImageCache);
            }
        } catch (error) {
            console.error('Right Nav Kai: Cache load error', error);
        }
    }

    // キャッシュをローカルストレージに保存
    function saveCacheToStorage() {
        try {
            const cacheObj = Object.fromEntries(characterImageCache);
            localStorage.setItem('rightNavKaiCache', JSON.stringify(cacheObj));
            debugLog('Cache saved to localStorage');
        } catch (error) {
            console.error('Right Nav Kai: Cache save error', error);
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

    // JSON取得関数（キャッシュ機能強化版）
    async function fetchCharacterImage(characterName, imgElement) {
        if (!characterName) {
            debugLog('Character name is missing');
            return;
        }

        // キャッシュチェック
        const cacheEntry = characterImageCache.get(characterName);
        if (cacheEntry) {
            debugLog(`Using cached image for ${characterName}`);
            imgElement.src = cacheEntry.url;
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
                if (typeof obj !== 'object' || obj === null) return null;
                
                if (obj.image_display_extension?.thumbnail) {
                    return obj.image_display_extension.thumbnail;
                }
                
                for (const key in obj) {
                    if (typeof obj[key] === 'object') {
                        const result = findThumbnailUrl(obj[key]);
                        if (result) return result;
                    }
                }
                return null;
            }

            const imageUrl = findThumbnailUrl(jsonData);

            if (!imageUrl) {
                debugLog(`Image URL not found in JSON for ${characterName}`);
                return;
            }

            // キャッシュに保存
            const cacheData = {
                url: imageUrl,
                timestamp: Date.now()
            };
            characterImageCache.set(characterName, cacheData);
            saveCacheToStorage();

            debugLog(`Found image URL for ${characterName}:`, imageUrl);
            imgElement.src = imageUrl;
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

    // Observer設定関数
    function setupObserverForNavPanel(panel) {
        debugLog('Setting up observer for nav panel');

        const observer = new MutationObserver((mutations) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (panel.classList.contains('openDrawer')) {
                    debugLog('Panel is open, triggering image update.');
                    updateCharacterImages();
                }
            }, 100);
        });

        observer.observe(panel, {
            attributes: true,
            attributeFilter: ['style', 'class'],
            childList: true,
            subtree: true
        });

        const charList = document.getElementById('rm_print_characters_block');
        if (charList) {
            debugLog('Setting up observer for character list');
            const listObserver = new MutationObserver(() => {
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

        if (panel.classList.contains('openDrawer')) {
            setTimeout(updateCharacterImages, 200);
        }
    }

    // 初期化関数
    function initialize() {
        debugLog('Initializing Right Nav Kai extension');
        loadCacheFromStorage(); // 起動時にキャッシュを読み込み
        
        const navPanel = document.getElementById('right-nav-panel');
        if (navPanel) {
            setupObserverForNavPanel(navPanel);
        } else {
            const bodyObserver = new MutationObserver((mutations, observer) => {
                const foundPanel = document.getElementById('right-nav-panel');
                if (foundPanel) {
                    debugLog('Nav panel found via observer');
                    setupObserverForNavPanel(foundPanel);
                    observer.disconnect();
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
