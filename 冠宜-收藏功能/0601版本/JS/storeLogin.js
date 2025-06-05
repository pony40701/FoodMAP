document.addEventListener('DOMContentLoaded', function() {
    const storeLoginForm = document.getElementById('storeLoginForm');

    // 檢查是否已經登入
    if (localStorage.getItem('isStoreLoggedIn')) {
        window.location.href = 'storeDashboard.html';
        return;
    }

    // 處理登入表單提交
    storeLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 從 localStorage 獲取商家資料
        const stores = JSON.parse(localStorage.getItem('stores')) || [];
        const store = stores.find(s => s.email === email && s.password === '123456789');

        if (store) {
            // 登入成功
            localStorage.setItem('isStoreLoggedIn', 'true');
            localStorage.setItem('storeEmail', email);
            localStorage.setItem('storeId', store.id);
            
            // 重定向到商家儀表板
            window.location.href = 'storeDashboard.html';
        } else {
            alert('帳號或密碼錯誤！');
        }
    });
}); 