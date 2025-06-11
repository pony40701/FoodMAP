// 導入收藏核心模組
import favoritesCore from './core/favoritesCore.js';

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
            // 只有未登入時才顯示登入彈窗
            // 已登入時會顯示頭像下拉選單，不需要處理按鈕點擊
            if (localStorage.getItem('isLoggedIn') !== 'true') {
                // 清除任何之前設置的回調函數，避免不必要的跳轉
                window.onLoginSuccess = null;
                if (loginModal) {
                    loginModal.style.display = 'block';
                }
            } else {
                window.location.href = 'userCenter.html';
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
                // 設置登入狀態
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);

                // 更新界面
                updateLoginStatus();
                loginModal.style.display = 'none';

                // 如果有登入成功的回調，執行它
                if (typeof window.onLoginSuccess === 'function') {
                    window.onLoginSuccess();
                    window.onLoginSuccess = null; // 執行後清除
                }

                // 重新載入收藏狀態
                favoritesCore.loadFavorites();
            } else {
                alert('帳號或密碼錯誤！');
            }
        });
    }
});

// 更新登入狀態
function updateLoginStatus() {
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (loginSection && userSection) {
        if (isLoggedIn) {
            // 已登入：隱藏登入按鈕，顯示會員頭像
            loginSection.style.display = 'none';
            userSection.style.display = 'block';
            
            // 更新用戶資訊顯示
            const userEmail = localStorage.getItem('userEmail');
            const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
            const userName = currentUser.name || (userEmail ? userEmail.split('@')[0] : '會員');
            
            // 可以在這裡更新頭像旁的用戶名稱（如果需要的話）
        } else {
            // 未登入：顯示登入按鈕，隱藏會員頭像
            loginSection.style.display = 'block';
            userSection.style.display = 'none';
        }
    } else {
        // 舊版相容性：如果找不到新的區塊，使用舊的按鈕邏輯
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            if (isLoggedIn) {
                loginBtn.textContent = '會員中心';
            } else {
                loginBtn.textContent = '登入';
            }
        }
    }
}

// 登出功能
function logout() {
    // 清除所有登入相關的 localStorage 數據
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('favoriteStores');
    localStorage.removeItem('favoriteReviews');
    
    // 顯示登出成功訊息
    alert('已成功登出！');
    
    // 檢查當前頁面
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop() || '';
    
    if (fileName === 'index.html' || fileName === '' || currentPath === '/') {
        // 在首頁：更新登入狀態顯示，不跳轉
        updateLoginStatus();
    } else {
        // 不在首頁：跳轉到首頁
        window.location.href = 'index.html';
    }
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

// 顯示提示訊息
function showToast(message) {
    // 這裡可以自訂提示訊息的顯示方式
    alert(message);
}