(function () {
    'use strict';

    // 拡張機能が複数回ロードされるのを防ぐためのフラグ
    if (window.TEXT_LINEBREAKER_EXTENSION_LOADED) {
        return;
    }
    window.TEXT_LINEBREAKER_EXTENSION_LOADED = true;

    // デバウンス処理のためのMapと遅延時間（ミリ秒）
    const debounceMap = new Map();
    const DEBOUNCE_DELAY = 5000; // ストリーミングが落ち着くのを待つ時間

    /**
     * 指定された .mes_text 要素内の未処理の <br> タグを処理する。
     * @param {HTMLElement} mesTextElement - .mes_text クラスを持つHTML要素
     */
    function processMessageLineBreaks(mesTextElement) {
        const brTags = mesTextElement.querySelectorAll('br:not([data-br-processed])');

        // 未処理の<br>がなければ何もしない
        if (brTags.length === 0) {
            return;
        }

        brTags.forEach(br => {
            br.dataset.brProcessed = 'true';
            
            const lrmNode = document.createTextNode('\u200E'); 
            const newBr = document.createElement('br');
            newBr.dataset.brProcessed = 'true';
            
            br.after(lrmNode, newBr);
        });
    }

    /**
     * 指定された要素に対する処理をデバウンス付きでスケジュールする。
     * @param {HTMLElement} mesTextElement - 処理対象の要素
     */
    function scheduleProcessing(mesTextElement) {
        // もしこの要素に対するタイマーが既に存在すれば、それをキャンセルする
        if (debounceMap.has(mesTextElement)) {
            clearTimeout(debounceMap.get(mesTextElement));
        }
        
        // 新しいタイマーをセットする
        const timerId = setTimeout(() => {
            // 遅延時間が経過した後、実際の処理を実行
            processMessageLineBreaks(mesTextElement);
            // 処理が完了したので、Mapからタイマー情報を削除
            debounceMap.delete(mesTextElement);
        }, DEBOUNCE_DELAY);
        
        // 新しいタイマーのIDをMapに保存
        debounceMap.set(mesTextElement, timerId);
    }

    /**
     * チャットエリアを監視し、新しいメッセージの追加や更新に対応する。
     */
    function observeChat() {
        const chatElement = document.getElementById('chat');
        if (!chatElement) {
            console.error('[Text Linebreaker] Error: #chat element not found. Extension cannot run.');
            return;
        }

        // ページロード時に既に存在しているメッセージは即時処理
        const existingMessages = chatElement.querySelectorAll('.mes_text');
        existingMessages.forEach(processMessageLineBreaks);

        const observer = new MutationObserver((mutationsList) => {
            const elementsToProcess = new Set();

            for (const mutation of mutationsList) {
                let targetNode = mutation.target;

                if (targetNode.nodeType === Node.TEXT_NODE) {
                    targetNode = targetNode.parentElement;
                }
                if (!targetNode || targetNode.nodeType !== Node.ELEMENT_NODE) {
                    continue;
                }
                
                const mesText = targetNode.closest('.mes_text');
                if (mesText) {
                    elementsToProcess.add(mesText);
                }
            }

            // 変更が検出されたユニークな要素それぞれに対して、デバウンス処理をスケジュール
            if (elementsToProcess.size > 0) {
                elementsToProcess.forEach(mesText => {
                    scheduleProcessing(mesText);
                });
            }
        });

        // 監視を開始
        observer.observe(chatElement, {
            childList: true,
            subtree: true,
            characterData: true
        });

        console.log('[Text Linebreaker] Extension loaded and is now observing for new messages.');
    }

    // DOMの読み込みが完了してから実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observeChat);
    } else {
        observeChat();
    }

})();
