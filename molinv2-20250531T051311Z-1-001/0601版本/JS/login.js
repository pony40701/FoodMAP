document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // 預設帳號密碼檢查
        if (email === '111@gmail.com' && password === '123456789') {
            // 儲存登入狀態
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            // 跳轉到首頁
            window.location.href = '../HTML/homePage.html';
        } else {
            alert('帳號或密碼錯誤！');
        }
    });
}); 