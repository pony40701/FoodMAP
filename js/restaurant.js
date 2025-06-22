// 編輯功能
document.addEventListener('DOMContentLoaded', function() {
    ('DOM 已載入完成');
    
    const editButton = document.getElementById('editButton');
    const cancelButton = document.getElementById('cancelButton');
    const saveButton = document.getElementById('saveButton');
    const restaurantInfo = document.querySelector('.restaurant-info');
    const avatarInput = document.getElementById('avatar-upload');
    const avatarPreview = document.querySelector('.profile-avatar');
    
    ('編輯按鈕元素：', editButton);
    ('取消按鈕元素：', cancelButton);
    ('儲存按鈕元素：', saveButton);
    ('餐廳資訊元素：', restaurantInfo);
    ('頭像輸入元素：', avatarInput);
    ('頭像預覽元素：', avatarPreview);

    // 進入編輯模式
    if (editButton) {
        editButton.onclick = function(e) {
            ('點擊編輯按鈕');
            e.preventDefault();
            if (restaurantInfo) {
                restaurantInfo.classList.add('editing');
                ('已進入編輯模式');
            }
        };
    }

    // 取消編輯
    if (cancelButton) {
        cancelButton.onclick = function(e) {
            ('點擊取消按鈕');
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
                ('已取消編輯');
            }
        };
    }

    // 儲存編輯
    if (saveButton) {
        saveButton.onclick = function(e) {
            ('點擊儲存按鈕');
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

                ('儲存的資料：', formData);

                // 更新顯示的資料
                document.querySelectorAll('.view-mode').forEach((element) => {
                    const input = element.nextElementSibling;
                    if (input) {
                        element.textContent = input.value;
                    }
                });

                // 退出編輯模式
                restaurantInfo.classList.remove('editing');
                ('已儲存並退出編輯模式');
            }
        };
    }

    // 頭像上傳功能
    if (avatarInput && avatarPreview) {
        const avatarContainer = document.querySelector('.avatar-container');
        
        if (avatarContainer) {
            avatarContainer.onclick = function(e) {
                ('點擊頭像容器');
                if (restaurantInfo && restaurantInfo.classList.contains('editing')) {
                    e.preventDefault();
                    avatarInput.click();
                    ('觸發頭像上傳');
                }
            };
        }

        avatarInput.onchange = function(e) {
            ('選擇檔案');
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
                    document.querySelector('.avatar-img').src = e.target.result;
                    ('頭像已更新');
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // 照片上傳功能
    const photoUpload = document.getElementById('photo-upload');
    const photoGrid = document.querySelector('.photo-grid');
    const addPhotoButton = document.querySelector('.add-photo');

    if (addPhotoButton && photoUpload) {
        // 點擊新增照片按鈕時觸發檔案選擇
        addPhotoButton.onclick = function() {
            const infoSection = addPhotoButton.closest('.info-section');
            if (infoSection && infoSection.classList.contains('editing')) {
                photoUpload.click();
            }
        };

        // 處理照片上傳
        photoUpload.onchange = function(e) {
            const files = e.target.files;
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    // 檢查檔案大小（2MB）
                    if (file.size > 2 * 1024 * 1024) {
                        alert('檔案大小不能超過 2MB');
                        continue;
                    }

                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.innerHTML = `
                            <img src="${e.target.result}" alt="餐廳照片" data-base64="${e.target.result}">
                            <div class="photo-overlay">
                                <button class="delete-photo">
                                    <i class="fas fa-trash"></i>
                                    刪除
                                </button>
                            </div>
                        `;
                        // 將新照片插入到新增按鈕之前
                        photoGrid.insertBefore(photoItem, photoGrid.lastElementChild);
                    };
                    reader.readAsDataURL(file);
                }
            }
            // 清空 input 值，這樣可以重複選擇相同的檔案
            this.value = '';
        };
    }

    // 處理照片刪除
    if (photoGrid) {
        photoGrid.onclick = async function(e) {
            const deleteButton = e.target.closest('.delete-photo');
            if (deleteButton) {
                const infoSection = deleteButton.closest('.info-section');
                if (infoSection && infoSection.classList.contains('editing')) {
                    const photoItem = deleteButton.closest('.photo-item');
                    if (photoItem && !photoItem.classList.contains('add-photo')) {
                        try {
                            const img = photoItem.querySelector('img');
                            const base64Data = img.dataset.base64;
                            
                            console.log('準備刪除照片，base64 長度:', base64Data.length);
                            
                            // 發送刪除請求到後端
                            const response = await fetch('http://localhost:8080/api/merchants/restaurant/photos', {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('merchantToken')}`,
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json'
                                },
                                credentials: 'include',
                                body: JSON.stringify({
                                    imageUrl: base64Data
                                })
                            });

                            if (!response.ok) {
                                const errorData = await response.json();
                                console.error('刪除照片失敗:', errorData);
                                throw new Error(errorData.message || '刪除照片失敗');
                            }

                            // 只有在後端成功刪除後才從 UI 移除
                            photoItem.remove();
                            console.log('照片刪除成功');
                        } catch (error) {
                            console.error('刪除照片時發生錯誤:', error);
                            alert('刪除照片失敗: ' + error.message);
                        }
                    }
                }
            }
        };
    }

    // 初始化頁面
    checkMerchantAuth().then(isAuthenticated => {
        if (isAuthenticated) {
            loadRestaurantInfo();
        }
    });
});

// 檢查商家是否已登入
async function checkMerchantAuth() {
    ("開始驗證商家登入狀態");
    const token = localStorage.getItem("merchantToken");
    const email = localStorage.getItem("merchantEmail");
    const restaurantId = localStorage.getItem("restaurantId");
    
    ("登入資訊檢查：", {
        hasToken: !!token,
        token: token,
        email: email,
        restaurantId: restaurantId
    });
    
    if (!token) {
        alert("請先登入");
        window.location.href = "index.html";
        return false;
    }

    try {
        ("發送驗證請求到後端");
        const response = await fetch("http://localhost:8080/api/merchants/validate", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        ("驗證請求回應狀態:", response.status);
        if (!response.ok) {
            throw new Error("驗證失敗");
        }

        const isValid = await response.json();
        ("Token 驗證結果:", isValid);
        
        if (!isValid) {
            throw new Error("Token 無效");
        }

        return true;
    } catch (error) {
        console.error("驗證失敗:", error);
        alert("登入已過期，請重新登入");
        localStorage.removeItem("merchantToken");
        localStorage.removeItem("merchantEmail");
        localStorage.removeItem("restaurantId");
        window.location.href = "index.html";
        return false;
    }
}

// 載入餐廳資料
async function loadRestaurantInfo() {
    ("開始載入餐廳資料");
    const token = localStorage.getItem("merchantToken");
    const restaurantId = localStorage.getItem("restaurantId");
    ("當前登入資訊：", {
        token: token,
        restaurantId: restaurantId
    });
    
    try {
        ("發送獲取餐廳資料請求");
        const response = await fetch("http://localhost:8080/api/merchants/restaurant/info", {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        ("獲取餐廳資料回應狀態:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("回應內容:", errorText);
            throw new Error(`獲取餐廳資料失敗: ${response.status}`);
        }

        const restaurant = await response.json();
        ("獲取到的餐廳資料:", restaurant);
        
        if (!restaurant) {
            console.error("餐廳資料為空");
            return;
        }

        // 更新頭像（包括導覽列和基本資料區塊）
        updateAvatars(restaurant.avatarUrl);
        
        // 更新基本資料欄位
        ("更新基本資料欄位");
        const basicInfoSection = document.querySelector("#basic-info");
        if (basicInfoSection) {
            // 餐廳名稱
            updateField(basicInfoSection, "餐廳名稱", restaurant.name);
            // 電子郵件
            updateField(basicInfoSection, "電子郵件", restaurant.email);
            // 聯絡電話
            updateField(basicInfoSection, "聯絡電話", restaurant.phoneNumber);
            // 營業地址
            updateField(basicInfoSection, "營業地址", restaurant.address);
        }
        
        // 更新營業資訊
        ("更新營業資訊");
        const businessInfoSection = document.querySelector("#business-info");
        if (businessInfoSection) {
            // 營業時間
            updateField(businessInfoSection, "營業時間", restaurant.businessHours);
            // 餐廳類型
            updateField(businessInfoSection, "餐廳類型", restaurant.cuisineType);
            // 付款方式
            updateField(businessInfoSection, "付款方式", restaurant.paymentMethods);
        }
        
        // 更新餐廳簡介
        ("更新餐廳簡介");
        const descriptionSection = document.querySelector("#description-info");
        if (descriptionSection) {
            const viewMode = descriptionSection.querySelector(".view-mode");
            const editMode = descriptionSection.querySelector(".edit-mode");
            if (viewMode) viewMode.textContent = restaurant.description || "";
            if (editMode) editMode.value = restaurant.description || "";
        }

        // 載入餐廳照片
        await loadRestaurantPhotos(restaurantId);
        
    } catch (error) {
        console.error("載入餐廳資料失敗:", error);
        alert("載入餐廳資料失敗");
    }
}

// 更新所有頭像
function updateAvatars(avatarData) {
    ("開始更新頭像");
    ("頭像數據:", avatarData);

    // 檢查是否為預設頭像
    const isDefaultAvatar = avatarData === 'images/default-avatar.png';
    
    // 如果是預設頭像，直接使用路徑；如果不是，使用 base64 數據
    const avatarSrc = isDefaultAvatar ? avatarData : avatarData;

    // 更新所有頭像元素
    const avatarElements = [
        document.querySelector("#basic-info .profile-avatar"),  // 基本資料區塊的頭像
        document.querySelector(".avatar-img")                   // 導覽列的頭像
    ];

    avatarElements.forEach((avatarElement, index) => {
        if (avatarElement) {
            (`更新頭像元素 ${index}:`, avatarElement);
            avatarElement.src = avatarSrc;

            // 監聽圖片載入事件
            avatarElement.onload = () => {
                (`頭像 ${index} 圖片載入成功`);
            };
            avatarElement.onerror = (error) => {
                console.error(`頭像 ${index} 圖片載入失敗:`, error);
                // 載入失敗時使用預設圖片
                avatarElement.src = "images/default-avatar.png";
            };
        } else {
            console.error(`找不到頭像元素 ${index}`);
        }
    });
}

// 載入餐廳照片
async function loadRestaurantPhotos(restaurantId) {
    try {
        const response = await fetch('http://localhost:8080/api/merchants/restaurant/photos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('merchantToken')}`
            }
        });

        if (!response.ok) {
            throw new Error('載入照片失敗');
        }

        const photos = await response.json();
        const photoGrid = document.querySelector('.photo-grid');
        
        // 清除現有照片，但保留"新增照片"按鈕
        const existingPhotos = photoGrid.querySelectorAll('.photo-item:not(.add-photo)');
        existingPhotos.forEach(photo => photo.remove());

        // 添加照片到網格
        photos.forEach(base64Image => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.setAttribute('data-saved', 'true'); // 標記為已保存的照片
            
            photoItem.innerHTML = `
                <img src="${base64Image}" alt="餐廳照片" data-base64="${base64Image}">
                <div class="photo-overlay editing-only">
                    <button class="delete-photo">
                        <i class="fas fa-trash"></i>
                        刪除
                    </button>
                </div>
            `;
            
            // 將新照片插入到"新增照片"按鈕之前
            photoGrid.insertBefore(photoItem, photoGrid.lastElementChild);
        });

    } catch (error) {
        console.error('載入照片失敗:', error);
        alert('載入照片失敗，請稍後再試。');
    }
}

// 更新特定欄位的值
function updateField(section, labelText, value) {
    const item = Array.from(section.querySelectorAll('.info-item')).find(item => 
        item.querySelector('label')?.textContent === labelText
    );
    
    if (item) {
        const viewMode = item.querySelector('.view-mode');
        const editMode = item.querySelector('.edit-mode');
        
        if (viewMode) viewMode.textContent = value || "";
        if (editMode) {
            if (editMode.tagName === 'SELECT') {
                // 如果是下拉選單，找到對應的選項並選中
                const option = Array.from(editMode.options).find(opt => opt.value === value);
                if (option) option.selected = true;
            } else {
                editMode.value = value || "";
            }
        }
    }
}

// 切換編輯模式
function toggleEditMode(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const infoSection = section.closest('.info-section');
    if (!infoSection) return;

    const editButton = infoSection.querySelector('.edit-button');
    const actionButtons = infoSection.querySelector('.action-buttons');
    
    // 進入編輯模式
    editButton.style.display = 'none';
    actionButtons.style.display = 'flex';
    infoSection.classList.add('editing');

    // 處理輸入欄位
    const viewModeElements = section.querySelectorAll('.view-mode');
    const editModeElements = section.querySelectorAll('.edit-mode');

    viewModeElements.forEach(el => {
        el.style.display = 'none';
    });

    editModeElements.forEach(el => {
        el.style.display = 'block';
    });

    // 特殊處理照片區塊
    if (sectionId === 'photo-info') {
        const addPhotoButton = section.querySelector('.add-photo');
        if (addPhotoButton) {
            addPhotoButton.style.display = 'flex';
        }
        // 顯示所有照片的刪除按鈕
        const photoOverlays = section.querySelectorAll('.photo-overlay');
        photoOverlays.forEach(overlay => {
            overlay.style.display = 'flex';
        });
    }
}

// 取消編輯
function cancelEdit(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const infoSection = section.closest('.info-section');
    if (!infoSection) return;

    const editButton = infoSection.querySelector('.edit-button');
    const actionButtons = infoSection.querySelector('.action-buttons');
    
    // 退出編輯模式
    editButton.style.display = 'block';
    actionButtons.style.display = 'none';
    infoSection.classList.remove('editing');

    // 特殊處理照片區塊
    if (sectionId === 'photo-info') {
        const restaurantId = localStorage.getItem('restaurantId');
        if (restaurantId) {
            loadRestaurantPhotos(restaurantId);
        }
        const addPhotoButton = section.querySelector('.add-photo');
        if (addPhotoButton) {
            addPhotoButton.style.display = 'none';
        }
        // 隱藏所有照片的刪除按鈕
        const photoOverlays = section.querySelectorAll('.photo-overlay');
        photoOverlays.forEach(overlay => {
            overlay.style.display = 'none';
        });
    }

    // 處理其他輸入欄位
    const viewModeElements = section.querySelectorAll('.view-mode');
    const editModeElements = section.querySelectorAll('.edit-mode');

    viewModeElements.forEach(el => {
        el.style.display = 'block';
    });

    editModeElements.forEach(el => {
        el.style.display = 'none';
    });
}

// 儲存變更
async function saveChanges(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    let success = false;
    
    try {
        switch (sectionId) {
            case 'basic-info':
                success = await saveBasicInfo();
                break;
            case 'business-info':
                success = await saveBusinessInfo();
                break;
            case 'description-info':
                success = await saveDescription();
                break;
            case 'photo-info':
                success = await savePhotos();
                break;
        }
        
        if (success) {
            const infoSection = section.closest('.info-section');
            if (!infoSection) return;

            // 切換按鈕顯示
            const editButton = infoSection.querySelector('.edit-button');
            const actionButtons = infoSection.querySelector('.action-buttons');
            editButton.style.display = 'block';
            actionButtons.style.display = 'none';
            
            // 切換編輯狀態
            infoSection.classList.remove('editing');

            // 切換輸入欄位和顯示欄位的狀態
            const viewModeElements = section.querySelectorAll('.view-mode');
            const editModeElements = section.querySelectorAll('.edit-mode');

            viewModeElements.forEach(el => {
                el.style.display = 'block';
                // 更新顯示的值
                const input = el.nextElementSibling;
                if (input && input.classList.contains('edit-mode')) {
                    el.textContent = input.value;
                }
            });

            editModeElements.forEach(el => {
                el.style.display = 'none';
            });

            // 特殊處理照片區塊
            if (sectionId === 'photo-info') {
                const addPhotoButton = section.querySelector('.add-photo');
                if (addPhotoButton) {
                    addPhotoButton.style.display = 'none';
                }
            }
        }
    } catch (error) {
        console.error('儲存變更時發生錯誤:', error);
        alert('儲存失敗，請稍後再試。');
    }
}

// 儲存基本資料
async function saveBasicInfo() {
    try {
        const formData = new FormData();
        
        // 獲取基本資料
        const section = document.getElementById('basic-info');
        const inputs = section.querySelectorAll('.info-item');
        
        // 使用標籤文字來識別正確的輸入框
        inputs.forEach(item => {
            const label = item.querySelector('label');
            const input = item.querySelector('.edit-mode');
            
            if (label && input) {
                switch(label.textContent) {
                    case '餐廳名稱':
                        formData.append('name', input.value);
                        break;
                    case '電子郵件':
                        formData.append('email', input.value);
                        break;
                    case '聯絡電話':
                        formData.append('phoneNumber', input.value);
                        break;
                    case '營業地址':
                        formData.append('address', input.value);
                        break;
                }
            }
        });
        
        // 獲取頭像檔案
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput.files.length > 0) {
            formData.append('avatar', avatarInput.files[0]);
        }

        const token = localStorage.getItem('merchantToken');
        const response = await fetch('http://localhost:8080/api/merchants/restaurant/basic-info', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // 獲取更新後的資料
        const updatedData = await response.json();
        
        // 更新頭像（如果有新的頭像URL）
        if (updatedData.avatarUrl) {
            updateAvatars(updatedData.avatarUrl);
        }

        // 更新基本資料欄位
        const basicInfoSection = document.getElementById('basic-info');
        if (basicInfoSection) {
            updateField(basicInfoSection, "餐廳名稱", updatedData.name);
            updateField(basicInfoSection, "電子郵件", updatedData.email);
            updateField(basicInfoSection, "聯絡電話", updatedData.phoneNumber);
            updateField(basicInfoSection, "營業地址", updatedData.address);
        }

        alert('基本資料更新成功！');
        return true;
        
    } catch (error) {
        console.error('更新基本資料時發生錯誤:', error);
        alert('更新基本資料失敗，請稍後再試。');
        return false;
    }
}

// 儲存營業資訊
async function saveBusinessInfo() {
    try {
        const section = document.getElementById('business-info');
        const data = {
            businessHours: '',
            cuisineType: '',
            paymentMethods: ''
        };

        // 使用標籤文字來識別正確的輸入框
        const inputs = section.querySelectorAll('.info-item');
        inputs.forEach(item => {
            const label = item.querySelector('label');
            const input = item.querySelector('.edit-mode');
            
            if (label && input) {
                switch(label.textContent) {
                    case '營業時間':
                        data.businessHours = input.value;
                        break;
                    case '餐廳類型':
                        data.cuisineType = input.value;
                        break;
                    case '付款方式':
                        data.paymentMethods = input.value;
                        break;
                }
            }
        });

        const token = localStorage.getItem('merchantToken');
        const response = await fetch('http://localhost:8080/api/merchants/restaurant/business-info', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 獲取更新後的資料
        const updatedData = await response.json();
        
        // 更新營業資訊欄位
        const businessInfoSection = document.getElementById('business-info');
        if (businessInfoSection) {
            updateField(businessInfoSection, "營業時間", updatedData.businessHours);
            updateField(businessInfoSection, "餐廳類型", updatedData.cuisineType);
            updateField(businessInfoSection, "付款方式", updatedData.paymentMethods);
        }

        alert('營業資訊更新成功！');
        return true;

    } catch (error) {
        console.error('更新營業資訊時發生錯誤:', error);
        alert('更新營業資訊失敗，請稍後再試。');
        return false;
    }
}

async function saveDescription() {
    try {
        const section = document.getElementById('description-info');
        const data = {
            description: ''
        };

        // 使用標籤文字來識別正確的輸入框
        const inputs = section.querySelectorAll('.info-item');
        inputs.forEach(item => {
            const label = item.querySelector('label');
            const input = item.querySelector('.edit-mode');
            
            if (label && input) {
                switch(label.textContent) {
                    case '餐廳簡介':
                        data.description = input.value;
                        break;
                }
            }
        });

        const token = localStorage.getItem('merchantToken');
        const response = await fetch('http://localhost:8080/api/merchants/restaurant/description', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 獲取更新後的資料
        const updatedData = await response.json();
        
        // 更新餐廳簡介欄位
        const descriptionSection = document.getElementById('description-info');
        if (descriptionSection) {
            updateField(descriptionSection, "餐廳簡介", updatedData.description);
        }

        alert('餐廳簡介更新成功！');
        return true;

    } catch (error) {
        console.error('更新餐廳簡介時發生錯誤:', error);
        alert('更新餐廳簡介失敗，請稍後再試。');
        return false;
    }
}

// 修改 savePhotos 函數
async function savePhotos() {
    const token = localStorage.getItem('merchantToken');
    
    try {
        // 只獲取新增的照片元素（沒有 data-saved 屬性的照片）
        const newPhotoItems = document.querySelectorAll('.photo-item:not(.add-photo):not([data-saved])');
        
        // 為每張新照片創建一個 FormData 並發送請求
        for (const item of newPhotoItems) {
            const img = item.querySelector('img');
            const base64Data = img.dataset.base64;
            
            // 將 base64 轉換為 Blob
            // 移除 data:image/jpeg;base64, 前綴
            const base64WithoutPrefix = base64Data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
            const byteCharacters = atob(base64WithoutPrefix);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/jpeg' });
            
            // 創建 FormData
            const formData = new FormData();
            formData.append('photo', blob, 'photo.jpg');

            // 發送更新請求
            const uploadResponse = await fetch('http://localhost:8080/api/merchants/restaurant/photos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.message || '儲存照片失敗');
            }

            // 標記照片為已保存
            item.setAttribute('data-saved', 'true');
        }

        alert('餐廳照片更新成功！');
        return true;
    } catch (error) {
        console.error('儲存照片失敗:', error);
        alert(error.message || '儲存照片失敗，請稍後再試。');
        return false;
    }
}

// 處理頭像上傳預覽
document.getElementById('avatar-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.profile-avatar').src = e.target.result;
            document.querySelector('.avatar-img').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});
