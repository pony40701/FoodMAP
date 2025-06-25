// 登入彈窗管理模組
window.showLoginModal = function() {
    // 顯示提示訊息
    window.showToast('請先登入會員');
    
    // 獲取登入彈窗元素
    const loginModal = document.getElementById('loginModal');
    if (!loginModal) {
        console.error('找不到登入彈窗元素');
        return;
    }
    
    // 確保登入彈窗在最上層
    loginModal.style.zIndex = '3000';
    loginModal.style.display = 'block';
    
    // 綁定關閉事件
    const closeBtn = loginModal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            loginModal.style.display = 'none';
        };
    }
    
    // 點擊模態框外部時關閉
    window.onclick = function(event) {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    };
    
    // 綁定登入表單提交事件
    const loginForm = loginModal.querySelector('#loginForm');
    if (loginForm) {
        loginForm.onsubmit = async function(e) {
            e.preventDefault();
            
            // 同時嘗試兩種可能的ID，以支援不同頁面的登入表單
            const emailInput = loginForm.querySelector('#email') || loginForm.querySelector('#loginEmail');
            const passwordInput = loginForm.querySelector('#password') || loginForm.querySelector('#loginPassword');
            
            if (!emailInput || !passwordInput) {
                console.error('找不到登入表單的輸入欄位');
                window.showToast('系統錯誤，請稍後再試');
                return;
            }
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
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
                    loginModal.style.display = 'none';
                    
                    // 顯示成功訊息
                    window.showToast('登入成功！');
                    
                    // 先清空餐廳容器，避免重複顯示
                    const restaurantsContainer = document.getElementById('restaurants-container');
                    if (restaurantsContainer) {
                        restaurantsContainer.innerHTML = '';
                        ('已清空餐廳容器，準備重新載入資料');
                    }
                    
                    // 更新用戶界面狀態
                    const loginSection = document.getElementById('loginSection');
                    const userSection = document.getElementById('userSection');
                    
                    if (loginSection) loginSection.style.display = 'none';
                    if (userSection) userSection.style.display = 'flex';
                    
                    // 更新用戶頭像
                    const userAvatarImg = document.querySelector('.avatar-img');
                    if (userAvatarImg) {
                        const avatarUrl = userData.image_url || userData.avatar_url;
                        if (avatarUrl) {
                            userAvatarImg.src = avatarUrl;
                        }
                    }
                    
                    // 重新加載餐廳資料
                    if (window.mapInit && typeof window.mapInit.loadRestaurants === 'function') {
                        ('準備重新加載餐廳數據');
                        window.mapInit.loadRestaurants();
                    }
                } else {
                    throw new Error(data.message || '登入失敗');
                }
            } catch (error) {
                console.error('登入失敗:', error);
                window.showToast(error.message || '登入失敗，請稍後再試');
            }
        };
    }
}; 