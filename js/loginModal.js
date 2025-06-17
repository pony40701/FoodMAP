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
            
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;
            
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
                    
                    // 重新載入頁面以更新狀態
                    window.location.reload();
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