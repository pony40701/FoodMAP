document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginBtn = document.querySelector('.btn-login');

    // 檢查登入狀態並更新按鈕
    updateLoginStatus();

    // 登入按鈕點擊事件
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('isLoggedIn') === 'true') {
                window.location.href = 'userCenter.html';
            } else {
                if (loginModal) loginModal.style.display = 'block';
            }
        });
    }

    // 關閉按鈕點擊事件
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    // 點擊模態框外部時關閉
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // 登入表單提交事件
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 預設帳號密碼檢查
            if (email === '111@gmail.com' && password === '123456789') {
                // 儲存登入狀態
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                
                // 關閉模態框
                loginModal.style.display = 'none';
                
                // 更新登入狀態
                updateLoginStatus();
                
                // 檢查是否有登入成功後的回調函數
                if (window.onLoginSuccess) {
                    window.onLoginSuccess();
                    // 清除回調函數，避免影響其他登入操作
                    window.onLoginSuccess = null;
                } else {
                    // 如果沒有回調函數，則跳轉到會員中心
                    window.location.href = 'userCenter.html';
                }
            } else {
                alert('帳號或密碼錯誤！');
            }
        });
    }
});

// 更新登入狀態
function updateLoginStatus() {
    const loginBtn = document.querySelector('.btn-login');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (loginBtn) {
        if (isLoggedIn) {
            loginBtn.textContent = '會員中心';
        } else {
            loginBtn.textContent = '登入';
        }
    }
}

// 登出功能
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    updateLoginStatus();
    window.location.href = 'index.html';
}

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