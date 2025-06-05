
// 頭像上傳預覽功能
document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.querySelector('.avatar-preview');

    if (avatarPreview && avatarInput) {
        // 點擊頭像區域觸發檔案選擇
        avatarPreview.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            avatarInput.click();
        });

        // 監聽檔案選擇
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // 檢查檔案大小（2MB）
                if (file.size > 2 * 1024 * 1024) {
                    alert('檔案大小不能超過 2MB');
                    return;
                }

                // 檢查檔案類型
                if (!file.type.startsWith('image/')) {
                    alert('請上傳圖片檔案');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    // 移除舊的圖片（如果有的話）
                    const oldImage = avatarPreview.querySelector('img');
                    if (oldImage) {
                        oldImage.remove();
                    }

                    // 創建並添加新圖片
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    avatarPreview.appendChild(img);
                    avatarPreview.classList.add('has-image');
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        console.error('找不到頭像上傳相關元素');
    }
});
