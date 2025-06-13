document.addEventListener('DOMContentLoaded', function() {
    console.log('登入模組已載入');
    
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginBtn = document.querySelector('.btn-login');
    const loginButton = document.getElementById('loginButton');
    
    console.log('登入元素檢查:', { 
        loginForm: !!loginForm, 
        loginModal: !!loginModal, 
        closeBtn: !!closeBtn, 
        loginBtn: !!loginBtn,
        loginButton: !!loginButton
    });
    
    // API 基礎 URL - 使用正確的本地伺服器端口 8080
    const API_BASE_URL = 'http://localhost:8080/api';
    console.log('API基礎URL設置為:', API_BASE_URL);

    // 檢查登入狀態並更新按鈕
    updateLoginStatus();

    // 登入按鈕點擊事件 (通過 class 選擇器)
    if (loginBtn) {
        console.log('綁定登入按鈕點擊事件 (class)');
        loginBtn.addEventListener('click', handleLoginButtonClick);
    } else {
        console.error('找不到登入按鈕元素 (class)');
    }
    
    // 登入按鈕點擊事件 (通過 id 選擇器)
    if (loginButton) {
        console.log('綁定登入按鈕點擊事件 (id)');
        loginButton.addEventListener('click', handleLoginButtonClick);
    } else {
        console.error('找不到登入按鈕元素 (id)');
    }
    
    // 登入按鈕點擊處理函數
    function handleLoginButtonClick(e) {
        console.log('登入按鈕被點擊');
        e.preventDefault();
        // 只有未登入時才顯示登入彈窗
        // 已登入時會顯示頭像下拉選單，不需要處理按鈕點擊
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            // 清除任何之前設置的回調函數，避免不必要的跳轉
            window.onLoginSuccess = null;
            if (loginModal) {
                console.log('顯示登入彈窗');
                loginModal.style.display = 'block';
            } else {
                console.error('找不到登入彈窗元素');
            }
        } else {
            window.location.href = 'userCenter.html';
        }
    }

    // 關閉按鈕點擊事件
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            console.log('關閉登入彈窗');
            loginModal.style.display = 'none';
        });
    }

    // 點擊模態框外部時關閉
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            console.log('點擊彈窗外部，關閉彈窗');
            loginModal.style.display = 'none';
        }
    });

    // 登入表單提交事件
    if (loginForm) {
        console.log('綁定登入表單提交事件');
        loginForm.addEventListener('submit', function(e) {
            console.log('登入表單提交');
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            console.log('嘗試登入:', email);
            
            // 測試帳號快速登入
            if (email === "alice@example.com") {
                apiLogin(email, "hashedpwd1");
            } else if (email === "bob@example.com") {
                apiLogin(email, "hashedpwd2");
            } else {
                // 一般帳號登入
                apiLogin(email, password);
            }
        });
    } else {
        console.error('找不到登入表單元素');
    }
    
    // API 登入功能
    function apiLogin(email, password) {
        // 請求資料
        const loginData = {
            email: email,
            password: password
        };
        
        console.log('發送登入請求:', API_BASE_URL + '/auth/login');
        console.log('請求數據:', JSON.stringify(loginData));
        
        // 檢查後端服務是否可用
        fetch(`${API_BASE_URL}`, {
            method: 'GET',
            mode: 'no-cors'
        })
        .then(() => {
            console.log('後端服務可用，繼續登入流程');
            // 發送 API 請求
            return fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(loginData)
            });
        })
        .then(response => {
            console.log('收到回應:', response);
            console.log('回應狀態:', response.status);
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('帳號或密碼錯誤');
                }
                throw new Error('登入失敗');
            }
            return response.json();
        })
        .then(data => {
            console.log('登入回應數據:', data);
            if (data.success) {
                // 儲存登入狀態
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                
                // 關閉模態框
                loginModal.style.display = 'none';
                
                // 更新登入狀態
                updateLoginStatus();
                
                // 檢查是否有登入成功後的回調函數
                if (window.onLoginSuccess) {
                    window.onLoginSuccess();
                    // 清除回調函數，避免影響其他登入操作
                    window.onLoginSuccess = null;
                    // 顯示登入成功並自動收藏的提示
                    showToast('登入成功，已自動加入收藏！');
                } else {
                    showToast('登入成功！');
                }
            } else {
                showError(data.message || '帳號或密碼錯誤');
            }
        })
        .catch(error => {
            console.error('登入錯誤:', error);
            // 嘗試連接失敗時，顯示更詳細的錯誤信息
            if (error.message === 'Failed to fetch') {
                showError('無法連接到伺服器，請確認後端服務是否正常運行');
            } else {
                showError(error.message || '登入失敗，請稍後再試');
            }
        });
    }
    
    // 顯示錯誤訊息
    function showError(message) {
        console.error('錯誤:', message);
        alert(message);
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
    console.log('執行登出功能');
    
    // 清除收藏狀態
    if (window.clearFavorites) {
        window.clearFavorites();
    }
    
    // 清除登入狀態
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    // 清除所有收藏相關的localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('favorites_')) {
            localStorage.removeItem(key);
        }
    });
    
    // 更新所有收藏按鈕的狀態
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.classList.remove('active');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = 'far fa-heart';
        }
    });
    
    // 如果有餐廳列表，重新整理顯示
    if (window.infiniteScroll) {
        window.infiniteScroll.reset();
        if (window.currentRestaurants) {
            window.infiniteScroll.setRestaurants([...window.currentRestaurants]);
        }
    }
    
    // 更新登入狀態UI
    updateLoginStatus();
    
    console.log('登出完成，清除了所有登入狀態');
    return true; // 返回 true 表示登出成功
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