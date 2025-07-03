(function () {
    'use strict';

    let debounceTimer; // デバウンス処理用のタイマー変数

    // スタイルを対象要素に適用するメインの関数
    function applyCustomStyles(element) {
        // パネルが表示状態（openDrawerクラスを持つ）の場合のみ処理を実行
        if (element.classList.contains('openDrawer')) {

            console.log('Right Nav Kai: Applying custom styles (debounced).');

            // setPropertyを使ってスタイルを確実に上書きする
            // ★★★ ここの値を 60vw に修正 ★★★
            element.style.setProperty('width', '60vw', 'important');
            element.style.setProperty('inset', '34px 0px 1px 85px', 'important');
            element.style.setProperty('margin', '2px 2px 2px auto', 'important');
            element.style.setProperty('height', 'auto', 'important');
            element.style.setProperty('display', 'flex', 'important');
        }
    }

    // #right-nav-panel の属性変更を監視するObserverをセットアップする関数
    function setupObserverForNavPanel(panel) {
        const observer = new MutationObserver((mutationsList) => {
            // デバウンス処理
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                applyCustomStyles(panel);
            }, 50);
        });

        observer.observe(panel, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        console.log('Right Nav Kai: Performance-optimized observer started.');
        
        // 初期表示時にも一度スタイルを適用
        applyCustomStyles(panel);
    }

    // ページ読み込み時に要素を監視する初期化処理
    function initialize() {
        const navPanel = document.getElementById('right-nav-panel');
        if (navPanel) {
            setupObserverForNavPanel(navPanel);
        } else {
            const bodyObserver = new MutationObserver((mutationsList, observer) => {
                const navPanel = document.getElementById('right-nav-panel');
                if (navPanel) {
                    setupObserverForNavPanel(navPanel);
                    observer.disconnect();
                }
            });
            bodyObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        initialize();
    } else {
        document.addEventListener('DOMContentLoaded', initialize);
    }
})();
