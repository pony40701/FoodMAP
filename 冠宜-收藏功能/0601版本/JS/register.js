document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const phone = document.getElementById('phone').value;

        // 基本驗證
        if (password !== confirmPassword) {
            alert('兩次輸入的密碼不一致！');
            return;
        }

        // 儲存用戶資料
        const userData = {
            name: name,
            email: email,
            password: password,
            phone: phone
        };

        // 儲存到 localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);

        // 跳轉到首頁
        window.location.href = '../HTML/homePage.html';
    });
}); 