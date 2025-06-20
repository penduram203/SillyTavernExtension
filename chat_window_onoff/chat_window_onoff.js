document.addEventListener('DOMContentLoaded', () => {
    console.log('チャットウィンドウ On/Off 拡張機能: 初期化開始');

    const STORAGE_KEY = 'chatWindowHiddenState';

    // 少し遅延させて、他のDOM要素が確実に読み込まれるのを待つ
    setTimeout(() => {
        // 1. アイコンボタンの作成
        const toggleButton = document.createElement('button');
        toggleButton.id = 'toggle-chat-button';
        toggleButton.textContent = '💡';
        toggleButton.title = 'チャットウィンドウの表示/非表示';
        document.body.appendChild(toggleButton);
        console.log('💡 アイコンボタンをDOMに追加しました。');

        // 2. クリックイベントの設定
        toggleButton.addEventListener('click', () => {
            // bodyにクラスをトグルしてチャットウィンドウの表示を切り替える
            document.body.classList.toggle('chat-window-is-hidden');
            
            // ボタン自身の状態を更新 (アクティブ/非アクティブ)
            const isHidden = document.body.classList.contains('chat-window-is-hidden');
            toggleButton.classList.toggle('active', isHidden);

            // 状態をlocalStorageに保存
            try {
                localStorage.setItem(STORAGE_KEY, isHidden);
                console.log(`チャットウィンドウの状態を保存: ${isHidden ? '非表示' : '表示'}`);
            } catch (e) {
                console.error('localStorageへの保存に失敗しました:', e);
            }
        });

        // 3. ページ読み込み時に、保存された状態を復元
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState === 'true') {
                document.body.classList.add('chat-window-is-hidden');
                toggleButton.classList.add('active');
                console.log('保存された状態（非表示）を復元しました。');
            }
        } catch (e) {
            console.error('localStorageからの状態復元に失敗しました:', e);
        }

    }, 500); // 500msの遅延で、他要素の読み込み完了を待つ
});
