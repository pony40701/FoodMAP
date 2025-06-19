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

    // 照片上傳功能
    const photoUpload = document.getElementById('photo-upload');
    const photoGrid = document.querySelector('.photo-grid');
    const addPhotoButton = document.querySelector('.add-photo');

    if (addPhotoButton && photoUpload) {
        // 點擊新增照片按鈕時觸發檔案選擇
        addPhotoButton.onclick = function() {
            photoUpload.click();
        };

        // 處理照片上傳
        photoUpload.onchange = function(e) {
            const files = e.target.files;
            for (let file of files) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'photo-item';
                        photoItem.innerHTML = `
                            <img src="${e.target.result}" alt="餐廳照片">
                            <div class="photo-overlay">
                                <button class="delete-photo"><i class="fas fa-trash"></i></button>
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
        photoGrid.onclick = function(e) {
            if (e.target.closest('.delete-photo')) {
                const photoItem = e.target.closest('.photo-item');
                if (photoItem && !photoItem.classList.contains('add-photo')) {
                    photoItem.remove();
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
    console.log("開始驗證商家登入狀態");
    const token = localStorage.getItem("merchantToken");
    const email = localStorage.getItem("merchantEmail");
    const restaurantId = localStorage.getItem("restaurantId");
    
    console.log("登入資訊檢查：", {
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
        console.log("發送驗證請求到後端");
        const response = await fetch("http://localhost:8080/api/merchants/validate", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("驗證請求回應狀態:", response.status);
        if (!response.ok) {
            throw new Error("驗證失敗");
        }

        const isValid = await response.json();
        console.log("Token 驗證結果:", isValid);
        
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
    console.log("開始載入餐廳資料");
    const token = localStorage.getItem("merchantToken");
    const restaurantId = localStorage.getItem("restaurantId");
    console.log("當前登入資訊：", {
        token: token,
        restaurantId: restaurantId
    });
    
    try {
        console.log("發送獲取餐廳資料請求");
        const response = await fetch("http://localhost:8080/api/merchants/restaurant/info", {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("獲取餐廳資料回應狀態:", response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("回應內容:", errorText);
            throw new Error(`獲取餐廳資料失敗: ${response.status}`);
        }

        const restaurant = await response.json();
        console.log("獲取到的餐廳資料:", restaurant);
        
        if (!restaurant) {
            console.error("餐廳資料為空");
            return;
        }

        // 更新頭像（包括導覽列和基本資料區塊）
        updateAvatars(restaurant.avatarUrl);
        
        // 更新基本資料欄位
        console.log("更新基本資料欄位");
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
        console.log("更新營業資訊");
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
        console.log("更新餐廳簡介");
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
function updateAvatars(avatarUrl) {
    console.log("開始更新頭像");
    console.log("原始頭像URL:", avatarUrl);

    // 檢查是否為預設頭像
    const isDefaultAvatar = avatarUrl === 'images/default-avatar.png';
    
    // 如果是預設頭像，直接使用路徑；如果不是，確保路徑正確
    const processedAvatarUrl = isDefaultAvatar ? avatarUrl : (avatarUrl.startsWith('/') ? avatarUrl : '/' + avatarUrl);
    console.log("處理後的頭像URL:", processedAvatarUrl);

    // 更新所有頭像元素
    const avatarElements = [
        document.querySelector("#basic-info .profile-avatar"),  // 基本資料區塊的頭像
        document.querySelector(".avatar-img")                   // 導覽列的頭像
    ];

    avatarElements.forEach((avatarElement, index) => {
        if (avatarElement) {
            console.log(`更新頭像元素 ${index}:`, avatarElement);
            console.log(`當前頭像元素 ${index} 的 src:`, avatarElement.src);
            avatarElement.src = processedAvatarUrl;
            console.log(`設置後頭像元素 ${index} 的 src:`, avatarElement.src);

            // 監聽圖片載入事件
            avatarElement.onload = () => {
                console.log(`頭像 ${index} 圖片載入成功:`, processedAvatarUrl);
            };
            avatarElement.onerror = (error) => {
                console.error(`頭像 ${index} 圖片載入失敗:`, error);
                console.error(`頭像 ${index} 失敗的URL:`, processedAvatarUrl);
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
    console.log("開始載入餐廳照片");
    const token = localStorage.getItem("merchantToken");
    
    try {
        const response = await fetch(`http://localhost:8080/api/merchants/restaurant/photos/${restaurantId}`, {
            method: 'GET',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`獲取餐廳照片失敗: ${response.status}`);
        }

        const photoUrls = await response.json();
        console.log("獲取到的照片 URLs:", photoUrls);

        // 清空現有的照片（除了新增照片按鈕）
        const photoGrid = document.querySelector('.photo-grid');
        const addPhotoButton = photoGrid.querySelector('.add-photo');
        photoGrid.innerHTML = '';
        photoGrid.appendChild(addPhotoButton);

        // 添加所有照片
        photoUrls.forEach(url => {
            // 確保路徑以斜線開頭
            const imageUrl = url.startsWith('/') ? url.substring(1) : url;
            console.log("原始照片URL:", url);
            console.log("處理後的照片URL:", imageUrl);
            
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            photoItem.innerHTML = `
                <img src="${imageUrl}" alt="餐廳照片" onerror="this.src='images/default-restaurant.jpg'">
                <div class="photo-overlay">
                    <button class="delete-photo"><i class="fas fa-trash"></i></button>
                </div>
            `;
            photoGrid.insertBefore(photoItem, addPhotoButton);
        });
    } catch (error) {
        console.error("載入餐廳照片失敗:", error);
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
    const isEditing = !section.classList.contains('editing');
    
    // 如果要進入編輯模式，先檢查其他區段是否正在編輯
    if (isEditing) {
        const editingSections = document.querySelectorAll('.info-section .info-grid.editing, .info-section .info-content.editing, .info-section .photo-gallery.editing');
        editingSections.forEach(editingSection => {
            if (editingSection.id !== sectionId) {
                cancelEdit(editingSection.id);
            }
        });
    }

    // 更新編輯狀態
    section.classList.toggle('editing', isEditing);
    
    // 獲取按鈕元素
    const buttonGroup = section.closest('.info-section').querySelector('.button-group');
    const editButton = buttonGroup.querySelector('.edit-button');
    const actionButtons = buttonGroup.querySelector('.action-buttons');
    
    // 更新按鈕顯示狀態
    if (isEditing) {
        editButton.style.display = 'none';
        actionButtons.style.display = 'flex';
        
        // 儲存原始值，用於取消時還原
        const inputs = section.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.dataset.originalValue = input.value;
        });
        
        // 如果是頭像，儲存原始圖片路徑
        const avatar = section.querySelector('.profile-avatar');
        if (avatar) {
            avatar.dataset.originalSrc = avatar.src;
        }
    } else {
        editButton.style.display = 'flex';
        actionButtons.style.display = 'none';
    }
    
    // 切換輸入欄位的顯示/隱藏
    const viewElements = section.querySelectorAll('.view-mode');
    const editElements = section.querySelectorAll('.edit-mode');
    
    viewElements.forEach(el => el.style.display = isEditing ? 'none' : 'block');
    editElements.forEach(el => el.style.display = isEditing ? 'block' : 'none');
}

// 取消編輯
function cancelEdit(sectionId) {
    const section = document.getElementById(sectionId);
    
    // 還原所有輸入欄位的值
    const inputs = section.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.dataset.originalValue) {
            input.value = input.dataset.originalValue;
        }
    });
    
    // 還原頭像
    const avatar = section.querySelector('.profile-avatar');
    if (avatar && avatar.dataset.originalSrc) {
        avatar.src = avatar.dataset.originalSrc;
        // 同時更新導覽列的頭像
        document.querySelector('.avatar-img').src = avatar.dataset.originalSrc;
    }
    
    // 清除檔案輸入
    const fileInputs = section.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.value = '';
    });
    
    // 退出編輯模式
    toggleEditMode(sectionId);
}

// 儲存變更
async function saveChanges(sectionId) {
    try {
        let success = false;
        
        switch(sectionId) {
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
            // 如果儲存成功，退出編輯模式
            toggleEditMode(sectionId);
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

async function savePhotos() {
    // TODO: 實作餐廳照片的儲存邏輯
    return false;
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
