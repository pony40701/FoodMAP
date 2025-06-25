// 頭像上傳功能
class AvatarUpload {
    constructor() {
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.init();
    }

    init() {
        console.log('AvatarUpload 初始化，API 基礎 URL:', this.apiBaseUrl);
        this.bindEvents();
    }

    bindEvents() {
        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleFileSelect(e));
            console.log('頭像上傳事件已綁定');
        } else {
            console.warn('找不到頭像上傳輸入元素 #avatarUpload');
        }
    }

    // 處理文件選擇
    async handleFileSelect(event) {
        const file = event.target.files[0];
        console.log('文件選擇事件觸發:', file);
        
        if (!file) {
            console.log('沒有選擇文件');
            return;
        }

        try {
            console.log('開始處理文件:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // 驗證文件
            if (!this.validateFile(file)) {
                console.warn('文件驗證失敗');
                return;
            }

            // 顯示預覽
            this.showPreview(file);

            // 上傳文件
            await this.uploadAvatar(file);

        } catch (error) {
            console.error('頭像處理過程中發生錯誤:', error);
            this.showToast('頭像上傳失敗，請稍後再試');
        }
    }

    // 驗證文件
    validateFile(file) {
        console.log('驗證文件:', file.name);
        
        // 檢查文件類型
        if (!this.allowedTypes.includes(file.type)) {
            console.warn('不支援的文件類型:', file.type);
            this.showToast('請選擇有效的圖片格式 (JPG, PNG, GIF, WebP)');
            return false;
        }

        // 檢查文件大小
        if (file.size > this.maxFileSize) {
            console.warn('文件太大:', file.size, '最大限制:', this.maxFileSize);
            this.showToast('圖片大小不能超過 5MB');
            return false;
        }

        console.log('文件驗證通過');
        return true;
    }

    // 顯示預覽
    showPreview(file) {
        console.log('顯示預覽圖片');
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('FileReader 讀取完成');
            const avatarImg = document.querySelector('.avatar-img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
                console.log('預覽圖片已更新');
            } else {
                console.warn('找不到頭像圖片元素 .avatar-img');
            }
        };
        reader.onerror = (e) => {
            console.error('FileReader 讀取失敗:', e);
        };
        reader.readAsDataURL(file);
    }

    // 上傳頭像
    async uploadAvatar(file) {
        console.log('開始上傳頭像...');
        
        try {
            // 獲取當前用戶 ID - 多重檢查
            let userData = null;
            let userId = null;
            
            // 檢查方法 1: localStorage 中的 userData
            try {
                const userDataStr = localStorage.getItem('userData');
                if (userDataStr) {
                    userData = JSON.parse(userDataStr);
                    userId = userData.id;
                    console.log('從 userData 獲取用戶 ID:', userId);
                }
            } catch (e) {
                console.warn('解析 userData 失敗:', e);
            }
            
            // 檢查方法 2: localStorage 中的 userId
            if (!userId) {
                userId = localStorage.getItem('userId');
                console.log('從 userId 獲取用戶 ID:', userId);
            }
            
            // 檢查方法 3: 提供預設測試 ID（開發環境）
            if (!userId && window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                userId = '38'; // 測試用戶 ID
                console.warn('使用預設測試用戶 ID:', userId);
            }

            if (!userId) {
                console.error('找不到用戶 ID，無法上傳頭像');
                this.showToast('請先登入');
                return;
            }

            // 獲取認證 token
            const authToken = localStorage.getItem('authToken');
            console.log('認證 Token:', authToken ? '存在' : '不存在');

            // 顯示上傳進度
            this.showUploadProgress(true);

            // 建立 FormData
            const formData = new FormData();
            formData.append('avatar', file);

            const uploadUrl = `${this.apiBaseUrl}/users/${userId}/avatar`;
            console.log('上傳 URL:', uploadUrl);
            console.log('文件資訊:', {
                name: file.name,
                size: file.size,
                type: file.type
            });

            // 發送上傳請求
            const requestOptions = {
                method: 'POST',
                body: formData
            };

            // 只有在有 token 的情況下才添加 Authorization header
            if (authToken) {
                requestOptions.headers = {
                    'Authorization': `Bearer ${authToken}`
                };
            }

            console.log('發送上傳請求...', requestOptions);
            
            const response = await fetch(uploadUrl, requestOptions);
            
            console.log('收到伺服器回應:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            // 嘗試解析回應
            let result;
            try {
                const responseText = await response.text();
                console.log('伺服器回應內容:', responseText);
                
                if (responseText) {
                    result = JSON.parse(responseText);
                } else {
                    result = {};
                }
            } catch (e) {
                console.error('解析伺服器回應失敗:', e);
                throw new Error('伺服器回應格式錯誤');
            }

            if (response.ok && result.success) {
                console.log('頭像上傳成功:', result);
                
                // 更新本地存儲的用戶資料
                if (result.avatar_url) {
                    if (userData) {
                        userData.avatar_url = result.avatar_url;
                        localStorage.setItem('userData', JSON.stringify(userData));
                        console.log('已更新本地用戶資料');
                    }
                }

                this.showToast('頭像更新成功！');
                
                // 更新所有頁面上的頭像顯示
                this.updateAllAvatars(result.avatar_url);
                
                // 重新載入用戶資料以確保同步
                if (typeof loadUserData === 'function') {
                    console.log('重新載入用戶資料...');
                    await loadUserData();
                } else {
                    console.log('loadUserData 函數不存在，嘗試手動重新載入');
                    await this.reloadUserData(userId);
                }
                
            } else {
                const errorMsg = result.error || result.message || `上傳失敗 (${response.status})`;
                console.error('上傳失敗:', errorMsg);
                throw new Error(errorMsg);
            }

        } catch (error) {
            console.error('頭像上傳錯誤:', error);
            this.showToast(error.message || '頭像上傳失敗');
            
            // 上傳失敗時恢復原始頭像
            this.restoreOriginalAvatar();
        } finally {
            this.showUploadProgress(false);
        }
    }

    // 手動重新載入用戶資料
    async reloadUserData(userId) {
        try {
            console.log('手動重新載入用戶資料，用戶 ID:', userId);
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`);
            
            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('userData', JSON.stringify(userData));
                console.log('用戶資料重新載入成功:', userData);
                
                // 更新顯示
                if (typeof updateUserDisplay === 'function') {
                    updateUserDisplay(userData);
                }
            } else {
                console.warn('重新載入用戶資料失敗:', response.status);
            }
        } catch (error) {
            console.error('重新載入用戶資料時發生錯誤:', error);
        }
    }

    // 更新所有頁面上的頭像顯示
    updateAllAvatars(avatarUrl) {
        console.log('更新所有頭像顯示，新的 URL:', avatarUrl);
        
        // 更新 userCenter 頁面的頭像
        const sidebarAvatarImg = document.querySelector('.sidebar .user-avatar .avatar-img');
        const navbarAvatarImg = document.querySelector('.navbar .user-avatar .avatar-img');
        
        // 更新所有可能的頭像元素
        const avatarElements = document.querySelectorAll('.avatar-img, .user-avatar img, img[alt="會員頭像"]');
        
        console.log('找到頭像元素數量:', avatarElements.length);
        
        avatarElements.forEach((img, index) => {
            if (img) {
                console.log(`更新頭像元素 ${index + 1}:`, img.className, img.src);
                img.src = avatarUrl;
                
                // 強制重新載入圖片
                img.onload = () => {
                    console.log(`頭像元素 ${index + 1} 更新成功`);
                };
                img.onerror = (e) => {
                    console.error(`頭像元素 ${index + 1} 更新失敗:`, e);
                    // 載入失敗時使用預設頭像
                    img.src = 'images/TEST.jpg';
                };
            }
        });
        
        // 特別處理 userCenter 頁面的頭像
        if (sidebarAvatarImg) {
            sidebarAvatarImg.src = avatarUrl;
            console.log('更新側邊欄頭像:', avatarUrl);
        }
        
        if (navbarAvatarImg) {
            navbarAvatarImg.src = avatarUrl;
            console.log('更新導航欄頭像:', avatarUrl);
        }
    }

    // 恢復原始頭像（當上傳失敗時）
    restoreOriginalAvatar() {
        console.log('恢復原始頭像');
        
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        const userId = userData.id || localStorage.getItem('userId');
        
        if (userId) {
            // 使用預設頭像或從 API 重新載入
            const defaultAvatarUrl = `${this.apiBaseUrl}/users/${userId}/avatar?t=${new Date().getTime()}`;
            const avatarImg = document.querySelector('.sidebar .user-avatar .avatar-img');
            
            if (avatarImg) {
                avatarImg.src = userData.avatar_url || defaultAvatarUrl;
                
                // 如果載入失敗，使用預設頭像
                avatarImg.onerror = () => {
                    avatarImg.src = 'images/TEST.jpg';
                };
            }
        }
    }

    // 顯示/隱藏上傳進度
    showUploadProgress(show) {
        const button = document.querySelector('.btn-change-avatar');
        if (button) {
            if (show) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 上傳中...';
                console.log('顯示上傳進度');
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-camera"></i> 更換頭像';
                console.log('隱藏上傳進度');
            }
        }
    }

    // Toast 提示函數
    showToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message);
        } else {
            // 如果沒有 showToast 函數，使用 alert 作為後備
            alert(message);
        }
        console.log('Toast 提示:', message);
    }
}

// 全域函數，供 HTML 調用
function changeAvatar() {
    console.log('changeAvatar 函數被調用，將打開裁切彈窗');
    
    // 使用新的裁切彈窗
    if (typeof window.showAvatarCropModal === 'function') {
        window.showAvatarCropModal();
    } else {
        console.warn('AvatarCropModal 未載入，回退到原始方法');
        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput) {
            avatarInput.click();
            console.log('觸發文件選擇對話框');
        } else {
            console.error('找不到頭像上傳輸入元素');
        }
    }
}

// 調試函數
window.debugAvatar = function() {
    console.log('=== 頭像調試資訊 ===');
    console.log('avatarUpload 實例:', window.avatarUpload);
    console.log('API_BASE_URL:', window.API_BASE_URL);
    console.log('localStorage 內容:');
    console.log('  - isLoggedIn:', localStorage.getItem('isLoggedIn'));
    console.log('  - userId:', localStorage.getItem('userId'));
    console.log('  - userData:', localStorage.getItem('userData'));
    console.log('  - authToken:', localStorage.getItem('authToken'));
    
    const avatarElements = document.querySelectorAll('.avatar-img, .user-avatar img, img[alt="會員頭像"]');
    console.log('找到的頭像元素:', avatarElements.length);
    avatarElements.forEach((img, index) => {
        console.log(`  元素 ${index + 1}:`, img.src);
    });
};

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，初始化 AvatarUpload');
    if (typeof window.avatarUpload === 'undefined') {
        window.avatarUpload = new AvatarUpload();
        console.log('AvatarUpload 實例已創建');
    }
    
    // 在控制台提供調試函數
    console.log('調試函數已註冊，可使用 window.debugAvatar() 查看狀態');
}); 