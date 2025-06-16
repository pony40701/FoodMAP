// 登入模組
console.log('登入模組已載入');

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

console.log('登入元素檢查:', {
    loginForm: !!loginElements.loginForm,
    loginModal: !!loginElements.loginModal,
    closeBtn: !!loginElements.closeBtn,
    loginBtn: !!loginElements.loginBtn,
    loginButton: !!loginElements.loginButton,
    loginSection: !!loginElements.loginSection,
    userSection: !!loginElements.userSection
});

// 初始化登入功能
function initLogin() {
    console.log('初始化登入功能');
    
    // 綁定登入按鈕點擊事件
    if (loginElements.loginBtn) {
        loginElements.loginBtn.addEventListener('click', () => {
            console.log('點擊登入按鈕');
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
            console.log('點擊登入按鈕（id）');
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
            console.log('點擊關閉按鈕');
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
                    
                    // 關閉登入視窗
                    loginElements.loginModal.style.display = 'none';
                    
                    // 顯示成功訊息
                    window.showToast('登入成功！');
                    
                    // 重新載入頁面以更新狀態
                    window.location.reload();
                } else {
                    throw new Error(data.message || '登入失敗');
                }
            } catch (error) {
                console.error('登入失敗:', error);
                window.showToast(error.message || '登入失敗，請稍後再試');
            }
        });
    }
}

// 在 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 加載完成，初始化登入功能');
    initLogin();
    // 立即修復樣式
    fixLoginModalStyles();
});

// 暴露全局登入彈窗函數
window.showLoginModal = function() {
    console.log('顯示登入彈窗');
    if (loginElements.loginModal) {
        loginElements.loginModal.style.display = 'block';
        // 應用樣式修復
        fixLoginModalStyles();
    } else {
        console.error('找不到登入彈窗元素');
    }
};

// 更新登入狀態
function updateLoginStatus(isLoggedIn) {
    console.log('更新登入狀態:', isLoggedIn);
    
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    
    if (isLoggedIn) {
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('用戶資訊:', userData);
        
        // 隱藏登入按鈕，顯示用戶區域
        if (loginSection) loginSection.style.display = 'none';
        if (userSection) {
            userSection.style.display = 'flex';
            
            // 更新用戶名稱
            const userNameElement = document.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = userData.username || userData.fullName || userData.email;
            }
            
            // 更新用戶頭像 - 檢查 image_url 和 avatar_url
            const userAvatarImg = document.querySelector('.avatar-img');
            if (userAvatarImg) {
                const avatarUrl = userData.image_url || userData.avatar_url;
                console.log('頭像URL:', avatarUrl);
                
                if (avatarUrl) {
                    userAvatarImg.src = avatarUrl;
                    userAvatarImg.alt = userData.username || '會員頭像';
                    console.log('設置用戶頭像:', avatarUrl);
                } else {
                    console.log('用戶沒有頭像URL');
                }
            }
        }
    } else {
        // 顯示登入按鈕，隱藏用戶區域
        if (loginSection) loginSection.style.display = 'block';
        if (userSection) userSection.style.display = 'none';
        
        // 清除本地儲存的用戶資訊
        localStorage.clear();
    }
}

// 登出功能
window.logout = function() {
    console.log('執行登出');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    updateLoginStatus(false);
    showMessage('已成功登出', 'success');
    
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
function checkLoginStatus() {
    console.log('檢查登入狀態');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = localStorage.getItem('user');
    
    if (isLoggedIn && user) {
        console.log('用戶已登入');
        updateLoginStatus(true);
        
        // 如果在會員中心頁面且未登入，則跳轉到首頁
        if (window.location.pathname.includes('userCenter.html') && !isLoggedIn) {
            window.location.href = 'index.html';
        }
    } else {
        console.log('用戶未登入');
        updateLoginStatus(false);
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
    console.log('顯示提示訊息:', message);
    
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
    
    console.log('修復登入視窗樣式');
    
    const modalContent = loginModal.querySelector('.modal-content');
    const modalHeader = loginModal.querySelector('.modal-header');
    const modalTitle = modalHeader.querySelector('h2');
    const modalBody = loginModal.querySelector('.modal-body');
    const closeButton = modalHeader.querySelector('.close');
    const form = loginModal.querySelector('.login-form');
    
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