(function() {
    // DOMからキャラクター名を検出する関数
    function detectCharacterNameFromDOM() {
        const nameHolder = document.querySelector('#character_name_holder');
        if (nameHolder && nameHolder.textContent) return nameHolder.textContent;
        const greetingMessage = document.querySelector('.mes[mesid="0"][is_user="false"]');
        if (greetingMessage && greetingMessage.getAttribute('ch_name')) 
            return greetingMessage.getAttribute('ch_name');
        return null;
    }

    // 新規ボタン作成関数
    function createExportButton() {
        // 指定されたパネル内のボタンコンテナを取得
        const buttonContainer = document.querySelector('#rm_ch_create_block .form_create_bottom_buttons_block');
        if (!buttonContainer) {
            console.error('Button container not found');
            return;
        }

        // 既にボタンが追加されていないか確認
        if (document.getElementById('stj_export_button')) {
            return;
        }

        // 新規ボタン作成
        const exportButton = document.createElement('button');
        exportButton.id = 'stj_export_button';
        exportButton.textContent = 'JSONデータ編集';
        exportButton.className = 'menu_button';
        
        // ボタンコンテナの先頭に追加
        buttonContainer.prepend(exportButton);
        
        // モーダルウィンドウ作成
        createExportModal(exportButton);
    }

    // モーダルウィンドウ作成関数
    function createExportModal(anchorButton) {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('stj_export_modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'stj_export_modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '10001';
        modal.innerHTML = `
            <div class="stj-header" style="margin-bottom: 15px;">
                <strong id="stj_char_name_display" style="font-size: 24px; font-weight: bold; color: white; text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);"></strong>
            </div>
            
            <div class="stj-special-container">
                <div class="stj-special-item">
                    <div class="stj-special-preview">
                        <div class="stj-image-preview" id="stj_preview_default">
                            <div class="stj-preview-text">デフォルト画像プレビュー</div>
                        </div>
                    </div>
                    <div class="stj-special-inputs">
                        <div class="stj-input-group">
                            <label for="stj_default_image">画像ファイル名</label>
                            <input type="text" id="stj_default_image" value="defa" class="stj-image-input">
                        </div>
                        <div class="stj-input-group">
                            <label for="stj_default_extension">拡張子</label>
                            <select id="stj_default_extension" class="stj-extension-select">
                                <option value="png">png</option>
                                <option value="jpg">jpg</option>
                                <option value="jpeg">jpeg</option>
                                <option value="webp">webp</option>
                                <option value="gif">gif</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="stj-special-item">
                    <div class="stj-special-preview">
                        <div class="stj-image-preview" id="stj_preview_thumbnail">
                            <div class="stj-preview-text">サムネイル画像プレビュー</div>
                        </div>
                    </div>
                    <div class="stj-special-inputs">
                        <div class="stj-input-group">
                            <label for="stj_thumbnail_image">画像ファイル名</label>
                            <input type="text" id="stj_thumbnail_image" value="thum" class="stj-image-input">
                        </div>
                        <div class="stj-input-group">
                            <label for="stj_thumbnail_extension">拡張子</label>
                            <select id="stj_thumbnail_extension" class="stj-extension-select">
                                <option value="png">png</option>
                                <option value="jpg">jpg</option>
                                <option value="jpeg">jpeg</option>
                                <option value="webp">webp</option>
                                <option value="gif">gif</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="stj_keywords_container" class="stj-grid-container">
                <div class="stj-keyword-item">
                    <div class="stj-image-preview" id="stj_preview_0">
                        <div class="stj-preview-text">画像プレビュー</div>
                    </div>
                    <div class="stj-inputs-container">
                        <div class="stj-input-row">
                            <button class="stj-delete-row">×</button>
                            <div class="stj-input-group stj-keyword-width">
                                <label for="stj_keywords_0">キーワード</label>
                                <input type="text" id="stj_keywords_0" class="stj-keyword-input">
                            </div>
                        </div>
                        <div class="stj-input-row">
                            <div class="stj-input-group stj-image-width">
                                <label for="stj_image_name_0">画像ファイル名</label>
                                <input type="text" id="stj_image_name_0" class="stj-image-input">
                            </div>
                            <div class="stj-input-group stj-extension-width">
                                <label for="stj_extension_0">拡張子</label>
                                <select id="stj_extension_0" class="stj-extension-select">
                                    <option value="png">png</option>
                                    <option value="jpg">jpg</option>
                                    <option value="jpeg">jpeg</option>
                                    <option value="webp">webp</option>
                                    <option value="gif">gif</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stj-button-group">
                <button id="stj_add_keyword">キーワード追加</button>
                <div>
                    <button id="stj_save_data">セーブ</button>
                    <button id="stj_cancel_export">キャンセル</button>
                    <button id="stj_export_json">JSON出力</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // モーダル内のクリックイベントが伝播しないように
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        // キーワード追加ボタン
        document.getElementById('stj_add_keyword').addEventListener('click', function(e) {
            e.stopPropagation();
            addKeywordRow(modal);
        });
        
        // ボタンイベントリスナー登録
        anchorButton.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // モーダルを表示する前に位置を設定
            modal.style.display = 'block';
            modal.style.top = '0';
            modal.style.left = '17.5vw';
            modal.style.width = '65vw';
            modal.style.height = '100vh';
            
            // キャラクター名を検出して表示欄に設定
            const charName = detectCharacterNameFromDOM() || '';
            document.getElementById('stj_char_name_display').textContent = charName;
            
            // 保存データの読み込み
            loadSavedData(charName);
            
            // プレビュー更新イベントリスナーを設定
            setupPreviewListeners();
        });
        
        // キャンセルボタン：イベント伝播を停止
        document.getElementById('stj_cancel_export').addEventListener('click', function(e) {
            e.stopPropagation();
            modal.style.display = 'none';
        });
        
        // JSON出力ボタン：イベント伝播を停止
        document.getElementById('stj_export_json').addEventListener('click', function(e) {
            e.stopPropagation();
            exportJSON();
        });
        
        // セーブボタンのイベントリスナー追加
        document.getElementById('stj_save_data').addEventListener('click', function(e) {
            e.stopPropagation();
            saveData();
        });
        
        // 画面クリックでモーダルを閉じる
        document.addEventListener('click', function(e) {
            if (e.target !== anchorButton && !modal.contains(e.target)) {
                modal.style.display = 'none';
            }
        });
        
        // 初期行の削除ボタンにイベントリスナーを追加
        const firstDeleteButton = modal.querySelector('.stj-delete-row');
        if (firstDeleteButton) {
            firstDeleteButton.addEventListener('click', function(e) {
                e.stopPropagation();
                const item = this.closest('.stj-keyword-item');
                if (item) {
                    item.remove();
                }
            });
        }
        
        // デフォルト/サムネイル入力にプレビューリスナーを設定
        const defaultInputs = ['stj_default_image', 'stj_default_extension', 'stj_thumbnail_image', 'stj_thumbnail_extension'];
        defaultInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', updatePreview);
            }
        });
    }

    // キーワード行を追加
    function addKeywordRow(modal) {
        const container = modal.querySelector('#stj_keywords_container');
        const itemCount = container.querySelectorAll('.stj-keyword-item').length;
        const newItem = document.createElement('div');
        newItem.className = 'stj-keyword-item';
        newItem.innerHTML = `
            <div class="stj-image-preview" id="stj_preview_${itemCount}">
                <div class="stj-preview-text">画像プレビュー</div>
            </div>
            <div class="stj-inputs-container">
                <div class="stj-input-row">
                    <button class="stj-delete-row">×</button>
                    <div class="stj-input-group stj-keyword-width">
                        <label for="stj_keywords_${itemCount}">キーワード</label>
                        <input type="text" id="stj_keywords_${itemCount}" class="stj-keyword-input">
                    </div>
                </div>
                <div class="stj-input-row">
                    <div class="stj-input-group stj-image-width">
                        <label for="stj_image_name_${itemCount}">画像ファイル名</label>
                        <input type="text" id="stj_image_name_${itemCount}" class="stj-image-input">
                    </div>
                    <div class="stj-input-group stj-extension-width">
                        <label for="stj_extension_${itemCount}">拡張子</label>
                        <select id="stj_extension_${itemCount}" class="stj-extension-select">
                            <option value="png">png</option>
                            <option value="jpg">jpg</option>
                            <option value="jpeg">jpeg</option>
                            <option value="webp">webp</option>
                            <option value="gif">gif</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(newItem);
        
        // 削除ボタンのイベントリスナーを追加
        const deleteButton = newItem.querySelector('.stj-delete-row');
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            newItem.remove();
        });
        
        // 画像ファイル名と拡張子の入力欄に対してのみリスナーを設定
        const imageInput = newItem.querySelector('.stj-image-input');
        const extensionSelect = newItem.querySelector('.stj-extension-select');
        
        if (imageInput) {
            imageInput.addEventListener('input', function() {
                updateSinglePreview(itemCount);
            });
        }
        
        if (extensionSelect) {
            extensionSelect.addEventListener('change', function() {
                updateSinglePreview(itemCount);
            });
        }
        
        // スクロールを最下部に移動
        modal.scrollTop = modal.scrollHeight;
        
        // プレビュー更新
        setTimeout(() => updateSinglePreview(itemCount), 100);
    }

    // プレビュー更新リスナーを設定
    function setupPreviewListeners() {
        // 画像ファイル名と拡張子の入力欄に対してのみリスナーを設定
        document.querySelectorAll('.stj-image-input, .stj-extension-select').forEach(input => {
            // 入力欄が属する行のインデックスを取得
            const idParts = input.id.split('_');
            const index = idParts[idParts.length - 1];
            
            input.addEventListener('input', function() {
                // 特定の行のプレビューのみ更新
                updateSinglePreview(index);
            });
        });
        
        // 初期プレビューを更新
        updateAllPreviews();
    }

    // 特定の行のプレビューを更新
    function updateSinglePreview(index) {
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) return;
        
        if (index === 'image' || index === 'extension') {
            // デフォルト画像プレビュー更新
            updateImagePreview('default', 
                document.getElementById('stj_default_image').value,
                document.getElementById('stj_default_extension').value
            );
            
            // サムネイル画像プレビュー更新
            updateImagePreview('thumbnail', 
                document.getElementById('stj_thumbnail_image').value,
                document.getElementById('stj_thumbnail_extension').value
            );
        } else {
            // キーワードプレビュー更新
            const imageInput = document.getElementById(`stj_image_name_${index}`);
            const extensionSelect = document.getElementById(`stj_extension_${index}`);
            
            if (imageInput && extensionSelect) {
                updateImagePreview(index, imageInput.value, extensionSelect.value);
            }
        }
    }

    // すべてのプレビューを更新
    function updateAllPreviews() {
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) return;
        
        // デフォルト画像プレビュー更新
        updateImagePreview('default', 
            document.getElementById('stj_default_image').value,
            document.getElementById('stj_default_extension').value
        );
        
        // サムネイル画像プレビュー更新
        updateImagePreview('thumbnail', 
            document.getElementById('stj_thumbnail_image').value,
            document.getElementById('stj_thumbnail_extension').value
        );
        
        // キーワードプレビュー更新
        document.querySelectorAll('.stj-keyword-item').forEach((item, index) => {
            const imageInput = document.getElementById(`stj_image_name_${index}`);
            const extensionSelect = document.getElementById(`stj_extension_${index}`);
            
            if (imageInput && extensionSelect) {
                updateImagePreview(index, imageInput.value, extensionSelect.value);
            }
        });
    }


    // プレビューを更新
    function updatePreview() {
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) return;
        
        // デフォルト画像プレビュー更新
        updateImagePreview('default', 
            document.getElementById('stj_default_image').value,
            document.getElementById('stj_default_extension').value
        );
        
        // サムネイル画像プレビュー更新
        updateImagePreview('thumbnail', 
            document.getElementById('stj_thumbnail_image').value,
            document.getElementById('stj_thumbnail_extension').value
        );
        
        // キーワードプレビュー更新
        document.querySelectorAll('.stj-keyword-item').forEach((item, index) => {
            const imageInput = item.querySelector(`#stj_image_name_${index}`);
            const extensionSelect = item.querySelector(`#stj_extension_${index}`);
            
            if (imageInput && extensionSelect) {
                updateImagePreview(index, imageInput.value, extensionSelect.value);
            }
        });
    }

    // 個別のプレビューを更新
    function updateImagePreview(type, imageName, extension) {
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) return;
        
        const preview = document.getElementById(`stj_preview_${type}`);
        if (!preview) return;
        
        // 画像パスを生成
        const imagePath = `addchara/${charName}/${imageName}.${extension}`;
        
        // プレビューをクリア
        preview.innerHTML = '';
        
        if (imageName && extension) {
            // プレビューコンテナを作成
            const previewContainer = document.createElement('div');
            previewContainer.style.width = '100%';
            previewContainer.style.height = '100%';
            previewContainer.style.display = 'flex';
            previewContainer.style.justifyContent = 'center';
            previewContainer.style.alignItems = 'center';
            previewContainer.style.overflow = 'hidden';
            
            // 画像要素を作成
            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = `プレビュー: ${type}`;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            
            // ロード成功時の処理
            img.onload = function() {
                previewContainer.innerHTML = '';
                previewContainer.appendChild(img);
            };
            
            // ロード失敗時の処理
            img.onerror = function() {
                previewContainer.innerHTML = '';
                const text = document.createElement('div');
                text.className = 'stj-preview-text stj-preview-error';
                text.textContent = 'image not found';
                previewContainer.appendChild(text);
            };
            
            preview.appendChild(previewContainer);
        } else {
            // 入力がない場合
            const text = document.createElement('div');
            text.className = 'stj-preview-text';
            text.textContent = type === 'default' ? 'デフォルト画像プレビュー' : 
                              type === 'thumbnail' ? 'サムネイル画像プレビュー' : '画像プレビュー';
            preview.appendChild(text);
        }
    }

    // JSONエクスポート処理
    function exportJSON() {
        // 表示されているキャラクター名を取得
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) {
            alert('キャラクター名が設定されていません');
            return;
        }
        
        // デフォルト画像設定
        const defaultImage = document.getElementById('stj_default_image').value;
        const defaultExtension = document.getElementById('stj_default_extension').value;
        
        // サムネイル画像設定
        const thumbnailImage = document.getElementById('stj_thumbnail_image').value;
        const thumbnailExtension = document.getElementById('stj_thumbnail_extension').value;

        // キーワード、画像ファイル名、拡張子のペアを収集
        const keywordInputs = document.querySelectorAll('.stj-keyword-input');
        const imageInputs = document.querySelectorAll('.stj-image-input');
        const extensionSelects = document.querySelectorAll('.stj-extension-select');
        const keywordImagePairs = [];
        let hasError = false;

        for (let i = 0; i < keywordInputs.length; i++) {
            const keyword = keywordInputs[i].value;
            const imageName = imageInputs[i].value;
            const extension = extensionSelects[i].value;

            if (keyword && imageName) {
                keywordImagePairs.push({ keyword, imageName, extension });
            } else if (keyword || imageName) {
                // 片方だけ入力されている場合はエラー
                alert(`キーワードと画像ファイル名の両方を入力してください（行 ${i + 1}）`);
                hasError = true;
                break;
            }
            // 両方空の場合は無視
        }

        if (hasError) {
            return;
        }

        if (keywordImagePairs.length === 0) {
            alert('少なくとも1つのキーワードと画像ファイル名のペアを入力してください');
            return;
        }

        // JSONデータ生成
        const imageDisplayExtension = {};
        for (const pair of keywordImagePairs) {
            imageDisplayExtension[pair.keyword] = `addchara/${charName}/${pair.imageName}.${pair.extension}`;
        }
        // デフォルトとサムネイル
        imageDisplayExtension.default = `addchara/${charName}/${defaultImage}.${defaultExtension}`;
        imageDisplayExtension.thumbnail = `addchara/${charName}/${thumbnailImage}.${thumbnailExtension}`;

        const jsonData = {
            image_display_extension: imageDisplayExtension
        };
        
        // ファイルダウンロード処理
        const jsonStr = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${charName}_ext.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // モーダルを閉じる
        document.getElementById('stj_export_modal').style.display = 'none';
    }

    // カスタムアラート表示関数
    function showCustomAlert(message) {
        // 既存のアラートがあれば削除
        const existingAlert = document.getElementById('stj_custom_alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // アラート要素を作成
        const alertDiv = document.createElement('div');
        alertDiv.id = 'stj_custom_alert';
        alertDiv.textContent = message;
        document.body.appendChild(alertDiv);
        
        // アラートを表示
        setTimeout(() => {
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // 3秒後にフェードアウト
        setTimeout(() => {
            alertDiv.style.opacity = '0';
            alertDiv.style.transform = 'translate(-50%, -50%) scale(0.9)';
            
            // 完全に消去
            setTimeout(() => {
                if (alertDiv.parentNode) {
                    alertDiv.parentNode.removeChild(alertDiv);
                }
            }, 300);
        }, 3000);
    }

    // データ保存関数
    function saveData() {
        // 表示されているキャラクター名を取得
        const charName = document.getElementById('stj_char_name_display').textContent;
        if (!charName) {
            alert('キャラクター名が設定されていません');
            return;
        }

        // 基本データ収集
        const data = {
            charName: charName,
            defaultImage: document.getElementById('stj_default_image').value,
            defaultExtension: document.getElementById('stj_default_extension').value,
            thumbnailImage: document.getElementById('stj_thumbnail_image').value,
            thumbnailExtension: document.getElementById('stj_thumbnail_extension').value,
            keywords: []
        };

        // キーワードデータ収集
        const keywordItems = document.querySelectorAll('.stj-keyword-item');
        keywordItems.forEach(item => {
            const keywordInput = item.querySelector('.stj-keyword-input');
            const imageInput = item.querySelector('.stj-image-input');
            const extensionSelect = item.querySelector('.stj-extension-select');
            
            if (keywordInput && imageInput && extensionSelect) {
                data.keywords.push({
                    keyword: keywordInput.value,
                    imageName: imageInput.value,
                    extension: extensionSelect.value
                });
            }
        });

        // localStorageに保存（キャラ名をキーに使用）
        localStorage.setItem(`stj_editor_data_${charName}`, JSON.stringify(data));
        
        // カスタムアラート表示
        showCustomAlert('データを保存しました');
    }

    // 保存データ読み込み関数
    function loadSavedData(charName) {
        if (!charName) return;

        const savedData = localStorage.getItem(`stj_editor_data_${charName}`);
        if (!savedData) return;

        try {
            const data = JSON.parse(savedData);
            
            // 基本データ設定
            document.getElementById('stj_default_image').value = data.defaultImage || '';
            document.getElementById('stj_default_extension').value = data.defaultExtension || 'png';
            document.getElementById('stj_thumbnail_image').value = data.thumbnailImage || '';
            document.getElementById('stj_thumbnail_extension').value = data.thumbnailExtension || 'png';

            // キーワード行をリセット
            const container = document.getElementById('stj_keywords_container');
            container.innerHTML = '';
            
            // 保存されたキーワード行を再構築
            if (data.keywords && data.keywords.length > 0) {
                data.keywords.forEach((kw, index) => {
                    addKeywordRowWithData(container, index, kw);
                });
            } else {
                // デフォルトの空行を追加
                const modal = document.getElementById('stj_export_modal');
                addKeywordRow(modal);
            }
            
            // プレビューを更新
            setTimeout(updatePreview, 100);
        } catch (e) {
            console.error('保存データの読み込みに失敗しました', e);
        }
    }

    // データ付きキーワード行追加関数
    function addKeywordRowWithData(container, index, data) {
        const newItem = document.createElement('div');
        newItem.className = 'stj-keyword-item';
        newItem.innerHTML = `
            <div class="stj-image-preview" id="stj_preview_${index}">
                <div class="stj-preview-text">画像プレビュー</div>
            </div>
            <div class="stj-inputs-container">
                <div class="stj-input-row">
                    <button class="stj-delete-row">×</button>
                    <div class="stj-input-group stj-keyword-width">
                        <label for="stj_keywords_${index}">キーワード</label>
                        <input type="text" id="stj_keywords_${index}" class="stj-keyword-input" value="${data.keyword || ''}">
                    </div>
                </div>
                <div class="stj-input-row">
                    <div class="stj-input-group stj-image-width">
                        <label for="stj_image_name_${index}">画像ファイル名</label>
                        <input type="text" id="stj_image_name_${index}" class="stj-image-input" value="${data.imageName || ''}">
                    </div>
                    <div class="stj-input-group stj-extension-width">
                        <label for="stj_extension_${index}">拡張子</label>
                        <select id="stj_extension_${index}" class="stj-extension-select">
                            <option value="png" ${data.extension === 'png' ? 'selected' : ''}>png</option>
                            <option value="jpg" ${data.extension === 'jpg' ? 'selected' : ''}>jpg</option>
                            <option value="jpeg" ${data.extension === 'jpeg' ? 'selected' : ''}>jpeg</option>
                            <option value="webp" ${data.extension === 'webp' ? 'selected' : ''}>webp</option>
                            <option value="gif" ${data.extension === 'gif' ? 'selected' : ''}>gif</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(newItem);
        newItem.querySelector('.stj-delete-row').addEventListener('click', function() {
            newItem.remove();
        });
    }

    // パネルが開かれたことを検出するObserver
    function observePanel() {
        const targetNode = document.getElementById('right-nav-panel');
        if (!targetNode) {
            // パネルがまだない場合、再試行
            setTimeout(observePanel, 500);
            return;
        }

        const config = { childList: true, subtree: true };
        
        const callback = function(mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // キャラクター編集パネルが開かれたか確認
                    if (document.getElementById('rm_ch_create_block')) {
                        createExportButton();
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    }

    // 初期化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // 既にパネルが開いている場合
            if (document.getElementById('rm_ch_create_block')) {
                createExportButton();
            }
            observePanel();
        });
    } else {
        if (document.getElementById('rm_ch_create_block')) {
            createExportButton();
        }
        observePanel();
    }
})();
