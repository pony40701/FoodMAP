
// 編輯功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 已載入完成');
    
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const saveButton = document.getElementById('saveButton');
    const restaurantInfo = document.querySelector('.restaurant-info');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.querySelector('.profile-avatar');
    
    console.log('編輯按鈕元素：', editButton);
    console.log('取消按鈕元素：', cancelButton);
    console.log('儲存按鈕元素：', saveButton);
    console.log('餐廳資訊元素：', restaurantInfo);
    console.log('頭像輸入元素：', avatarInput);
    console.log('頭像預覽元素：', avatarPreview);

    // 進入編輯模式
    if (editButton) {
        editButton.onclick = function(e) {
            console.log('點擊編輯按鈕');
            e.preventDefault();
            if (restaurantInfo) {
                restaurantInfo.classList.add('editing');
                console.log('已進入編輯模式');
            }
        };
    }

    // 取消編輯
    if (cancelButton) {
        cancelButton.onclick = function(e) {
            console.log('點擊取消按鈕');
            e.preventDefault();
            if (restaurantInfo) {
                restaurantInfo.classList.remove('editing');
                // 重置所有輸入欄位的值
                const inputs = document.querySelectorAll('.edit-mode');
                inputs.forEach(input => {
                    if (input.tagName === 'SELECT') {
                        input.selectedIndex = 0;
                    } else {
                        input.value = input.defaultValue;
                    }
                });
                console.log('已取消編輯');
            }
        };
    }

    // 儲存編輯
    if (saveButton) {
        saveButton.onclick = function(e) {
            console.log('點擊儲存按鈕');
            e.preventDefault();
            if (restaurantInfo) {
                // 收集所有編輯的資料
                const formData = {
                    name: document.querySelector('.info-item:nth-child(2) .edit-mode')?.value,
                    email: document.querySelector('.info-item:nth-child(3) .edit-mode')?.value,
                    phone: document.querySelector('.info-item:nth-child(4) .edit-mode')?.value,
                    address: document.querySelector('.info-item:nth-child(5) .edit-mode')?.value,
                    businessHours: document.querySelector('.info-item:nth-child(1) .edit-mode')?.value,
                    type: document.querySelector('.info-item:nth-child(2) .edit-mode')?.value,
                    seats: document.querySelector('.info-item:nth-child(3) .edit-mode')?.value,
                    payment: document.querySelector('.info-item:nth-child(4) .edit-mode')?.value,
                    description: document.querySelector('.info-content .edit-mode')?.value
                };

                console.log('儲存的資料：', formData);

                // 更新顯示的資料
                document.querySelectorAll('.view-mode').forEach((element) => {
                    const input = element.nextElementSibling;
                    if (input) {
                        element.textContent = input.value;
                    }
                });

                // 退出編輯模式
                restaurantInfo.classList.remove('editing');
                console.log('已儲存並退出編輯模式');
            }
        };
    }

    // 頭像上傳功能
    if (avatarInput && avatarPreview) {
        const avatarContainer = document.querySelector('.avatar-container');
        
        if (avatarContainer) {
            avatarContainer.onclick = function(e) {
                console.log('點擊頭像容器');
                if (restaurantInfo && restaurantInfo.classList.contains('editing')) {
                    e.preventDefault();
                    avatarInput.click();
                    console.log('觸發頭像上傳');
                }
            };
        }

        avatarInput.onchange = function(e) {
            console.log('選擇檔案');
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
                    avatarPreview.src = e.target.result;
                    console.log('頭像已更新');
                };
                reader.readAsDataURL(file);
            }
        };
    }
});
