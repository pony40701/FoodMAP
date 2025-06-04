document.getElementById('merchantRegisterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 獲取表單數據
    const formData = {
        storeName: document.getElementById('storeName').value,
        storeAddress: document.getElementById('storeAddress').value,
        storePhone: document.getElementById('storePhone').value,
        storeType: document.getElementById('storeType').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        businessLicense: document.getElementById('businessLicense').files[0]
    };
    
    // 驗證密碼
    if (formData.password !== formData.confirmPassword) {
        alert('密碼與確認密碼不相符！');
        return;
    }
    
    // 驗證密碼強度
    if (formData.password.length < 8) {
        alert('密碼長度必須至少為8個字符！');
        return;
    }
    
    // 驗證電話號碼格式
    const phoneRegex = /^09\d{8}$/;
    if (!phoneRegex.test(formData.storePhone)) {
        alert('請輸入有效的台灣手機號碼！');
        return;
    }
    
    // 驗證電子郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('請輸入有效的電子郵件地址！');
        return;
    }
    
    // 模擬API請求
    console.log('註冊資料：', formData);
    
    // 顯示成功訊息
    alert('註冊成功！請查收確認郵件以完成註冊程序。');
    
    // 重定向到登入頁面
    window.location.href = '/HTML/merchantLogin.html';
}); 