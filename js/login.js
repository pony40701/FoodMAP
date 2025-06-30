// 登入模組

// 檢查必要的 DOM 元素
const loginElements = {
    loginForm: document.getElementById('loginForm'),
    loginModal: document.getElementById('loginModal'),
    closeBtn: document.querySelector('#loginModal .close'),
    loginBtn: document.querySelector('.btn-login'),
    loginButton: document.getElementById('loginButton'),
    loginSection: document.getElementById('loginSection'),
    userSection: document.getElementById('userSection')
};

// 初始化登入功能
function initLogin() {
    
    // 綁定登入按鈕點擊事件
    if (loginElements.loginBtn) {
        loginElements.loginBtn.addEventListener('click', () => {
            if (loginElements.loginModal) {
                loginElements.loginModal.style.display = 'block';
                // 應用樣式修復
                fixLoginModalStyles();
            }
        });
    }

    // 綁定登入按鈕點擊事件（使用 id）
    if (loginElements.loginButton) {
        loginElements.loginButton.addEventListener('click', () => {
            if (loginElements.loginModal) {
                loginElements.loginModal.style.display = 'block';
                // 應用樣式修復
                fixLoginModalStyles();
            }
        });
    }

    // 綁定關閉按鈕點擊事件
    if (loginElements.closeBtn) {
        loginElements.closeBtn.addEventListener('click', () => {
            if (loginElements.loginModal) {
                loginElements.loginModal.style.display = 'none';
            }
        });
    }

    // 點擊模態框外部關閉
    window.addEventListener('click', (event) => {
        if (event.target === loginElements.loginModal) {
            loginElements.loginModal.style.display = 'none';
        }
    });
    
    // 綁定登入表單提交事件
    if (loginElements.loginForm) {
        loginElements.loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = loginElements.loginForm.querySelector('#email').value;
            const password = loginElements.loginForm.querySelector('#password').value;
            
            try {
                const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // 儲存認證資訊
                    localStorage.setItem('authToken', data.token);
                    localStorage.setItem('userId', data.id);
                    localStorage.setItem('isLoggedIn', 'true');
                    
                    // 儲存用戶資料
                    const userData = {
                        id: data.id,
                        email: data.email,
                        username: data.username,
                        fullName: data.fullName,
                        image_url: data.image_url,
                        avatar_url: data.avatar_url,
                        phone: data.phone,
                        address: data.address
                    };
                    localStorage.setItem('user', JSON.stringify(userData));
                    
                    // 隱藏登入按鈕，顯示會員頭像區域
                    loginElements.loginSection.style.display = 'none';
                    loginElements.userSection.style.display = 'flex';
                    
                    // 更新用戶名稱
                    const userNameElement = document.querySelector('.user-name');
                    if (userNameElement) {
                        userNameElement.textContent = userData.username || userData.fullName || userData.email;
                    }
                    
                    // 更新用戶頭像 - 檢查 image_url 和 avatar_url
                    const userAvatarImg = document.querySelector('.avatar-img');
                    if (userAvatarImg) {
                        const avatarUrl = userData.image_url || userData.avatar_url;
                        
                        if (avatarUrl) {
                            userAvatarImg.src = avatarUrl;
                            userAvatarImg.alt = userData.username || '會員頭像';
                        }
                    }
                    
                    // 登入成功後僅清空現有餐廳列表，但不重新加載
                    // 避免重複顯示餐廳卡片
                    if (window.displayedRestaurants) {
                        // 重置已顯示餐廳集合
                        window.displayedRestaurants = new Set();
                    }
                    
                    // 關閉登入彈窗
                    if (loginElements.loginModal) {
                        loginElements.loginModal.style.display = 'none';
                    }
                    
                    // 初始化通知服務
                    if (window.NotificationService) {
                        window.NotificationService.initialize();
                    }
                    
                    // 顯示成功訊息
                    window.showToast('登入成功！');
                    
                    // 重新加載餐廳數據
                    if (window.mapInit && typeof window.mapInit.loadRestaurants === 'function') {
                        window.mapInit.loadRestaurants();
                    }
                } else {
                    throw new Error(data.message || '登入失敗');
                }
            } catch (error) {
                window.showToast(error.message || '登入失敗，請稍後再試');
            }
        });
    }
}

// 在 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    initLogin();
    // 立即修復樣式
    fixLoginModalStyles();
});

// 暴露全局登入彈窗函數
window.showLoginModal = function() {
    if (loginElements.loginModal) {
        loginElements.loginModal.style.display = 'block';
        // 應用樣式修復
        fixLoginModalStyles();
    }
};

// 更新登入狀態
async function updateLoginStatus(isLoggedIn) {
    
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    
    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('user') || localStorage.getItem('userData') || '{}');
        const userId = userData.id || localStorage.getItem('userId');
        
        // 隱藏登入按鈕，顯示用戶區域
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'flex';
            
            // 更新用戶名稱
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = userData.username || userData.fullName || userData.email;
            }
            
            // 更新用戶頭像 - 從API重新載入最新頭像
            const userAvatarImg = document.querySelector('.avatar-img');
            if (userAvatarImg && userId) {
                try {
                    // 嘗試從API載入最新的用戶資料和頭像
                    await loadUserAvatarFromAPI(userId, userAvatarImg);
                } catch (error) {
                    console.warn('載入用戶頭像失敗，使用本地資料:', error);
                    // 回退到本地存儲的頭像
                    const avatarUrl = userData.image_url || userData.avatar_url;
                    if (avatarUrl) {
                        userAvatarImg.src = avatarUrl;
                        userAvatarImg.alt = userData.username || '會員頭像';
                    }
                }
            }
        }
    } else {
        // 顯示登入按鈕，隱藏用戶區域
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        
        // 清除本地儲存的用戶資訊
        localStorage.clear();
        
        // 登出時重置所有收藏按鈕狀態
        setTimeout(() => {
            if (window.favoriteButton && typeof window.favoriteButton.initializeAllButtons === 'function') {
                window.favoriteButton.initializeAllButtons();
            }
        }, 100);
    }
}

// 從API載入用戶頭像的函數
async function loadUserAvatarFromAPI(userId, avatarImgElement) {
    const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    try {
        console.log('正在從API載入用戶頭像，用戶ID:', userId);
        
        // 先嘗試載入用戶資料
        const userResponse = await fetch(`${apiBaseUrl}/users/${userId}`);
        if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('用戶資料載入成功:', userData);
            
            // 更新localStorage中的用戶資料
            localStorage.setItem('userData', JSON.stringify(userData));
            localStorage.setItem('user', JSON.stringify(userData));
            
            // 如果有頭像數據，直接使用
            if (userData.avatar_url) {
                avatarImgElement.src = userData.avatar_url;
                avatarImgElement.alt = userData.username || '會員頭像';
                console.log('頭像已更新:', userData.avatar_url.substring(0, 50) + '...');
                return;
            }
        }
        
        // 如果用戶資料中沒有頭像，嘗試直接從頭像API載入
        const avatarUrl = `${apiBaseUrl}/users/${userId}/avatar?t=${new Date().getTime()}`;
        console.log('嘗試載入頭像 URL:', avatarUrl);
        
        const avatarResponse = await fetch(avatarUrl);
        if (avatarResponse.ok) {
            const blob = await avatarResponse.blob();
            if (blob.size > 0) {
                const objectUrl = URL.createObjectURL(blob);
                avatarImgElement.src = objectUrl;
                avatarImgElement.alt = '會員頭像';
                console.log('頭像載入成功，大小:', (blob.size / 1024).toFixed(2) + 'KB');
                
                // 清理舊的object URL
                avatarImgElement.onload = () => {
                    if (avatarImgElement.previousObjectUrl) {
                        URL.revokeObjectURL(avatarImgElement.previousObjectUrl);
                    }
                    avatarImgElement.previousObjectUrl = objectUrl;
                };
                
                return;
            }
        }
        
        // 如果都失敗了，使用預設頭像
        console.log('使用預設頭像');
        avatarImgElement.src = 'images/default-avatar.png';
        avatarImgElement.alt = '預設頭像';
        
    } catch (error) {
        console.error('載入用戶頭像時發生錯誤:', error);
        // 使用預設頭像
        avatarImgElement.src = 'images/default-avatar.png';
        avatarImgElement.alt = '預設頭像';
    }
}

// 登出功能
window.logout = function() {
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    updateLoginStatus(false);
    showMessage('已成功登出', 'success');
    
    // 無論在哪個頁面，登出後都重新整理頁面
    setTimeout(() => {
        window.location.reload();
    }, 500);
    
    // 如果在會員中心，則跳轉到首頁
    if (window.location.pathname.includes('userCenter.html')) {
        window.location.href = 'index.html';
    }
};

// 顯示訊息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 檢查是否已登入
async function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = localStorage.getItem('user') || localStorage.getItem('userData');
    
    if (isLoggedIn && user) {
        await updateLoginStatus(true);
        
        // 確保收藏按鈕狀態更新
        setTimeout(async () => {
            if (window.favoriteButton && typeof window.favoriteButton.initialize === 'function') {
                await window.favoriteButton.initialize(true); // 強制重新初始化
            }
            
            // 如果在首頁，重新排序已收藏餐廳
            if (window.favoriteButton && typeof window.favoriteButton.reorderRestaurantsByFavorite === 'function') {
                await window.favoriteButton.reorderRestaurantsByFavorite();
            }
        }, 300);
        
        // 如果在會員中心頁面且未登入，則跳轉到首頁
        if (window.location.pathname.includes('userCenter.html') && !isLoggedIn) {
            window.location.href = 'index.html';
        }
    } else {
        await updateLoginStatus(false);
    }
}

// 頁面載入時檢查登入狀態
document.addEventListener('DOMContentLoaded', checkLoginStatus);

// 社交媒體登入
function socialLogin(platform) {
    // 這裡可以根據不同的平台實現不同的登入邏輯
    switch(platform) {
        case 'google':
            alert('Google 登入功能尚未開放');
            break;
        case 'facebook':
            alert('Facebook 登入功能尚未開放');
            break;
        case 'line':
            alert('Line 登入功能尚未開放');
            break;
    }
}

// 顯示提示訊息
function showToast(message) {
    
    // 檢查是否已存在 toast 元素
    let toast = document.getElementById('toast-notification');
    
    // 如果不存在，則創建一個
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#ff6b1a';
        toast.style.color = 'white';
        toast.style.padding = '12px 24px';
        toast.style.borderRadius = '4px';
        toast.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        toast.style.zIndex = '9999';
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        document.body.appendChild(toast);
    }
    
    // 設置訊息內容
    toast.textContent = message;
    
    // 顯示 toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // 3秒後隱藏 toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

// 不要在 index.html 自動跳轉到 userLogin.html
// 僅在需要登入的頁面（如 userCenter.html）才做強制跳轉
// 此檔案無需任何自動跳轉邏輯

// 修復登入視窗樣式的函數
function fixLoginModalStyles() {
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) return;
    
    const modalContent = loginModal.querySelector('.modal-content');
    const modalHeader = loginModal.querySelector('.modal-header') || loginModal.querySelector('div[style*="text-align: center"]');
    const modalTitle = modalHeader ? modalHeader.querySelector('h2') : null;
    const modalBody = loginModal.querySelector('.modal-body');
    const closeButton = modalHeader ? modalHeader.querySelector('.close') : null;
    const form = loginModal.querySelector('.login-form') || loginModal.querySelector('form#loginForm');
    
    // 修復模態框內容
    if (modalContent) {
        modalContent.style.padding = '0';
        modalContent.style.maxWidth = '340px';
    }
    
    // 修復頭部區域
    if (modalHeader) {
        modalHeader.style.padding = '10px 15px 0px';
        modalHeader.style.marginBottom = '0';
        modalHeader.style.display = 'block';
        modalHeader.style.position = 'relative';
        modalHeader.style.textAlign = 'center';
    }
    
    // 修復標題
    if (modalTitle) {
        modalTitle.style.margin = '0';
        modalTitle.style.padding = '0';
        modalTitle.style.fontSize = '20px';
        modalTitle.style.color = '#ff6b1a';
        modalTitle.style.textAlign = 'center';
    }
    
    // 修復關閉按鈕
    if (closeButton) {
        closeButton.style.position = 'absolute';
        closeButton.style.right = '15px';
        closeButton.style.top = '10px';
        closeButton.style.fontSize = '20px';
    }
    
    // 修復主體區域
    if (modalBody) {
        modalBody.style.padding = '10px 15px 15px';
    }
    
    // 修復表單
    if (form) {
        form.style.marginTop = '0';
        
        // 修復表單組
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.style.marginBottom = '8px';
            
            const label = group.querySelector('label');
            if (label) {
                label.style.fontSize = '14px';
                label.style.marginBottom = '2px';
                label.style.display = 'block';
            }
            
            const input = group.querySelector('input');
            if (input) {
                input.style.padding = '8px 10px';
                input.style.border = '1px solid #ddd';
                input.style.borderRadius = '6px';
                input.style.fontSize = '14px';
                input.style.boxSizing = 'border-box';
                input.style.width = '100%';
            }
        });
    }
    
    // 修復社交登入區域
    const socialLogin = loginModal.querySelector('.social-login');
    if (socialLogin) {
        socialLogin.style.marginTop = '8px';
        
        const socialText = socialLogin.querySelector('p');
        if (socialText) {
            socialText.style.marginBottom = '3px';
            socialText.style.fontSize = '13px';
        }
        
        // 確保社交按鈕顏色
        const googleBtn = socialLogin.querySelector('.social-btn.google');
        if (googleBtn) googleBtn.style.color = '#db4437';
        
        const fbBtn = socialLogin.querySelector('.social-btn.facebook');
        if (fbBtn) fbBtn.style.color = '#1877f3';
        
        const lineBtn = socialLogin.querySelector('.social-btn.line');
        if (lineBtn) lineBtn.style.color = '#00c300';
    }
}

// 登入成功處理
function handleLoginSuccess(userData) {
    
    // 取得登入相關元素
    const loginElements = getLoginElements();
    
    // 檢查元素是否存在
    if (!loginElements.loginModal) {
        return;
    }
    
    // 關閉登入模態視窗
    loginElements.loginModal.style.display = 'none';
    
    // 存儲登入狀態到本地儲存
    updateLoginState(true, userData);
    
    // 先清空餐廳容器，避免重複顯示
    const restaurantsContainer = document.getElementById('restaurants-container');
    if (restaurantsContainer) {
        restaurantsContainer.innerHTML = '';
    }
    
    // 隱藏登入按鈕，顯示會員頭像區域
    loginElements.loginSection.style.display = 'none';
    loginElements.userSection.style.display = 'flex';
    
    // 更新用戶名稱
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = userData.username || userData.email;
    }
    
    // 更新用戶頭像
    if (userData.avatar_url || userData.image_url) {
        const avatarUrl = userData.avatar_url || userData.image_url;
        const userAvatarImg = document.querySelector('.avatar-img');
        if (userAvatarImg) {
            userAvatarImg.src = avatarUrl;
        }
    }
    
    // 初始化通知服務並立即顯示通知徽章
    if (window.NotificationService) {
        window.NotificationService.initialize();
        
        // 立即顯示通知徽章 (測試用)
        setTimeout(() => {
            // 直接顯示頭像上的通知徽章
            const avatarBadge = document.getElementById('avatar-notification-badge');
            if (avatarBadge) {
                avatarBadge.style.display = 'flex';
            }
        }, 500);
    }
    
    // 顯示登入成功訊息
    window.showToast('登入成功！');
    
    // 重新加載餐廳數據
    if (window.mapInit && typeof window.mapInit.loadRestaurants === 'function') {
        window.mapInit.loadRestaurants();
    }
}

// 將登入模組掛載到全局 window 物件
window.login = {
    initLogin: initLogin,
    checkLoginStatus: checkLoginStatus,
    handleLoginSuccess: handleLoginSuccess,
    logout: window.logout
};

// 頁面載入完成後，如果已登入且有未讀通知標記，則顯示通知徽章
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (localStorage.getItem('isLoggedIn') === 'true' && 
            localStorage.getItem('hasUnreadNotifications') === 'true') {
            // 確保通知徽章顯示
            const avatarBadge = document.getElementById('avatar-notification-badge');
            if (avatarBadge) {
                avatarBadge.style.display = 'flex';
            }
        }
    }, 1500); // 延遲一點時間，確保DOM已完全載入
});

// 監聽頭像更新事件
window.addEventListener('avatarUpdated', async (event) => {
    console.log('收到頭像更新事件:', event.detail);
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        await updateLoginStatus(true);
    }
});

// 監聽localStorage變化（跨頁面通信）
window.addEventListener('storage', async (event) => {
    if (event.key === 'avatarUpdateTimestamp') {
        console.log('檢測到頭像更新，重新載入用戶狀態');
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            await updateLoginStatus(true);
        }
    }
});

// 頁面獲得焦點時檢查頭像更新
window.addEventListener('focus', async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // 檢查是否有頭像更新
        const lastUpdate = localStorage.getItem('avatarUpdateTimestamp');
        const lastCheck = localStorage.getItem('lastAvatarCheck');
        
        if (lastUpdate && lastUpdate !== lastCheck) {
            console.log('檢測到頭像更新，重新載入');
            await updateLoginStatus(true);
            localStorage.setItem('lastAvatarCheck', lastUpdate);
        }
    }
});