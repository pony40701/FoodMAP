document.getElementById('merchantLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 獲取表單數據
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        remember: document.getElementById('remember').checked
    };
    
    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('請輸入有效的電子郵件地址！');
        return;
    }
    
    // 驗證密碼
    if (formData.password.length < 8) {
        alert('密碼長度必須至少為8個字符！');
        return;
    }
    
    // 模擬API請求
    console.log('登入資料：', formData);
    
    // 如果選擇記住我，將登入資訊存儲在localStorage中
    if (formData.remember) {
        localStorage.setItem('merchantEmail', formData.email);
    } else {
        localStorage.removeItem('merchantEmail');
    }
    
    // 顯示成功訊息
    alert('登入成功！');
    
    // 重定向到商家管理頁面
    window.location.href = '/HTML/merchantDashboard.html';
});

// 檢查是否有保存的電子郵件
window.addEventListener('load', function() {
    const savedEmail = localStorage.getItem('merchantEmail');
    if (savedEmail) {
        document.getElementById('email').value = savedEmail;
        document.getElementById('remember').checked = true;
    }
}); 