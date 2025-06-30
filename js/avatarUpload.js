// 頭像上傳功能
class AvatarUpload {
    constructor() {
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => this.handleFileSelect(e));
        } else {
            console.warn('找不到頭像上傳輸入元素 #avatarUpload');
        }
    }

    // 處理文件選擇
    async handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }

        try {
            // 驗證文件
            if (!this.validateFile(file)) {
                return;
            }

            // 顯示預覽
            this.showPreview(file);

            // 上傳文件
            await this.uploadAvatar(file);

        } catch (error) {
            this.showToast('頭像上傳失敗，請稍後再試');
        }
    }

    // 驗證文件
    validateFile(file) {
        // 檢查文件類型
        if (!this.allowedTypes.includes(file.type)) {
            this.showToast('請選擇有效的圖片格式 (JPG, PNG, GIF, WebP)');
            return false;
        }

        // 檢查文件大小
        if (file.size > this.maxFileSize) {
            this.showToast('圖片大小不能超過 5MB');
            return false;
        }

        return true;
    }

    // 顯示預覽
    showPreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatarImg = document.querySelector('.avatar-img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
            } else {
                console.warn('找不到頭像圖片元素 .avatar-img');
            }
        };
        reader.onerror = (e) => {
        };
        reader.readAsDataURL(file);
    }

    // 上傳頭像
    async uploadAvatar(file) {
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
                }
            } catch (e) {
                // 解析失敗時不做任何事
            }
            
            // 檢查方法 2: localStorage 中的 userId
            if (!userId) {
                userId = localStorage.getItem('userId');
            }
            
            if (!userId) {
                this.showToast('請先登入');
                return;
            }

            // 獲取認證 token
            const authToken = localStorage.getItem('authToken');

            // 顯示上傳進度
            this.showUploadProgress(true);

            // 建立 FormData
            const formData = new FormData();
            formData.append('avatar', file);

            const uploadUrl = `${this.apiBaseUrl}/users/${userId}/avatar`;

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

            const response = await fetch(uploadUrl, requestOptions);
            
            // 嘗試解析回應
            let result;
            try {
                const responseText = await response.text();
                
                if (responseText) {
                    result = JSON.parse(responseText);
                } else {
                    result = {};
                }
            } catch (e) {
                // 解析失敗時不做額外處理，直接丟出錯誤
                throw new Error('伺服器回應格式錯誤');
            }

            if (response.ok && result.success) {
                // 更新本地存儲的用戶資料
                if (result.avatar_url) {
                    if (userData) {
                        userData.avatar_url = result.avatar_url;
                        localStorage.setItem('userData', JSON.stringify(userData));
                    }
                }

                this.showToast('頭像更新成功！');
                
                // 更新所有頁面上的頭像顯示
                this.updateAllAvatars(result.avatar_url);
                
                // 重新載入用戶資料以確保同步
                if (typeof loadUserData === 'function') {
                    await loadUserData();
                } else {
                    await this.reloadUserData(userId);
                }
                
            } else {
                const errorMsg = result.error || result.message || `上傳失敗 (${response.status})`;
                throw new Error(errorMsg);
            }

        } catch (error) {
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
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`);
            
            if (response.ok) {
                const userData = await response.json();
                localStorage.setItem('userData', JSON.stringify(userData));
            }
        } catch (error) {
        }
    }

    // 更新所有頁面上的頭像顯示
    updateAllAvatars(avatarUrl) {
        // 更新 userCenter 頁面的頭像
        const sidebarAvatarImg = document.querySelector('.sidebar .user-avatar .avatar-img');
        const navbarAvatarImg = document.querySelector('.navbar .user-avatar .avatar-img');
        
        // 更新所有可能的頭像元素
        const avatarElements = document.querySelectorAll('.avatar-img, .user-avatar img, img[alt="會員頭像"]');
        
        avatarElements.forEach((img, index) => {
            if (img) {
                img.src = avatarUrl;
                
                // 強制重新載入圖片
                img.onload = () => {
                };
                img.onerror = () => {
                    // 載入失敗時使用預設頭像
                    img.src = 'images/default-avatar.png';
                };
            }
        });
        
        // 特別處理 userCenter 頁面的頭像
        if (sidebarAvatarImg) {
            sidebarAvatarImg.src = avatarUrl;
        }
        
        if (navbarAvatarImg) {
            navbarAvatarImg.src = avatarUrl;
        }
    }

    // 恢復原始頭像（當上傳失敗時）
    restoreOriginalAvatar() {
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
                    avatarImg.src = 'images/default-avatar.png';
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
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-camera"></i> 更換頭像';
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
    }
}

// 全域函數，供 HTML 調用
function changeAvatar() {
    // 使用新的裁切彈窗
    if (typeof window.showAvatarCropModal === 'function') {
        window.showAvatarCropModal();
    } else {
        console.warn('AvatarCropModal 未載入，回退到原始方法');
        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput) {
            avatarInput.click();
        } else {
            console.error('找不到頭像上傳輸入元素');
        }
    }
}

// 調試函數
window.debugAvatar = function() {
    const avatarElements = document.querySelectorAll('.avatar-img, .user-avatar img, img[alt="會員頭像"]');
    avatarElements.forEach((img, index) => {
    });
};

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.avatarUpload === 'undefined') {
        window.avatarUpload = new AvatarUpload();
    }
    
}); 