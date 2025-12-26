// グローバル変数
let images = [];
const MAX_IMAGES = 4;

// DOM要素の取得
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const clearBtn = document.getElementById('clearBtn');
const thumbnailContainer = document.getElementById('thumbnailContainer');
const errorMessage = document.getElementById('errorMessage');
const imageCount = document.getElementById('imageCount');

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    updateUI();
});

// イベントリスナーの設定
function initEventListeners() {
    // ファイル選択ボタン
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // アップロードエリアクリック
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // ファイル選択
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        fileInput.value = ''; // リセット
    });

    // ドラッグ&ドロップ
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    // クリップボードからの貼り付け
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        const files = [];

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                files.push(file);
            }
        }

        if (files.length > 0) {
            handleFiles(files);
        }
    });

    // クリアボタン
    clearBtn.addEventListener('click', () => {
        clearImages();
    });
}

// ファイルの処理
function handleFiles(fileList) {
    const files = Array.from(fileList);

    // 画像ファイルのみフィルタ
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
        showError('画像ファイルを選択してください');
        return;
    }

    // 制限チェック
    if (images.length + imageFiles.length > MAX_IMAGES) {
        showError(`画像は最大${MAX_IMAGES}枚までです`);
        return;
    }

    // 画像を読み込む
    imageFiles.forEach(file => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                images.push({
                    src: e.target.result,
                    width: img.width,
                    height: img.height,
                    aspectRatio: img.width / img.height
                });
                updateUI();
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    });

    hideError();
}

// 画像のクリア
function clearImages() {
    images = [];
    updateUI();
    hideError();
}

// UIの更新
function updateUI() {
    updateImageCount();
    updateThumbnails();
}

// 画像カウントの更新
function updateImageCount() {
    imageCount.textContent = `${images.length} / ${MAX_IMAGES}`;
}

// サムネイルの更新
function updateThumbnails() {
    // コンテナをクリア
    thumbnailContainer.innerHTML = '';
    thumbnailContainer.className = 'thumbnail-container';

    if (images.length === 0) {
        return;
    }

    // レイアウトクラスを追加
    thumbnailContainer.classList.add('active');

    if (images.length === 1) {
        // 1枚の場合、縦長か横長かを判定
        const aspectRatio = images[0].aspectRatio;
        if (aspectRatio < 1) {
            // 縦長
            thumbnailContainer.classList.add('layout-1-tall');
        } else {
            // 横長
            thumbnailContainer.classList.add('layout-1-wide');
        }
    } else if (images.length === 2) {
        thumbnailContainer.classList.add('layout-2');
    } else if (images.length === 3) {
        thumbnailContainer.classList.add('layout-3');
    } else if (images.length === 4) {
        thumbnailContainer.classList.add('layout-4');
    }

    // サムネイルを生成
    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item';

        const img = document.createElement('img');
        img.src = image.src;
        img.alt = `Image ${index + 1}`;

        item.appendChild(img);
        thumbnailContainer.appendChild(item);
    });
}

// エラーメッセージの表示
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');

    setTimeout(() => {
        hideError();
    }, 5000);
}

// エラーメッセージの非表示
function hideError() {
    errorMessage.classList.remove('show');
}
