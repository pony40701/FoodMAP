document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有需要的元素
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const showLoginModalBtn = document.getElementById('showLoginModal');
    const closeBtn = document.querySelector('.close');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');

    // 密碼切換功能
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // 顯示登入彈跳視窗
    showLoginModalBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    // 關閉登入彈跳視窗
    closeBtn.addEventListener('click', function() {
        loginModal.style.display = 'none';
    });

    // 點擊彈跳視窗外部時關閉
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // 驗證電子郵件格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 顯示錯誤訊息
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        errorMessage.textContent = message;
        formGroup.classList.add('error');
    }

    // 清除錯誤訊息
    function clearError(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error');
    }

    // 處理登入表單提交
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 這裡添加登入邏輯
        console.log('登入嘗試:', { email, password });
        
        // 模擬登入成功
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', email);
        
        // 關閉彈跳視窗
        loginModal.style.display = 'none';
        
        // 跳轉到首頁
        window.location.href = 'homePage.html';
    });

    // 切換步驟
    function goToStep(stepNumber) {
        steps.forEach((step, index) => {
            if (index + 1 <= stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        stepContents.forEach((content, index) => {
            content.style.display = index + 1 === stepNumber ? 'block' : 'none';
        });
    }

    // 處理註冊表單提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // 獲取表單數據
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();

        // 驗證電子郵件
        if (!validateEmail(email)) {
            showError(document.getElementById('email'), '請輸入有效的電子郵件地址');
            isValid = false;
        }

        // 驗證密碼
        if (password.length < 8) {
            showError(document.getElementById('password'), '密碼至少需要 8 個字元');
            isValid = false;
        }

        // 驗證確認密碼
        if (password !== confirmPassword) {
            showError(document.getElementById('confirmPassword'), '密碼不相符');
            isValid = false;
        }

        // 驗證姓名
        if (name.length < 2) {
            showError(document.getElementById('name'), '姓名至少需要 2 個字元');
            isValid = false;
        }

        // 驗證手機號碼
        if (!/^[0-9]{10}$/.test(phone)) {
            showError(document.getElementById('phone'), '請輸入有效的手機號碼');
            isValid = false;
        }

        if (isValid) {
            // 儲存註冊資料
            const userData = {
                email: email,
                name: name,
                phone: phone
            };
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // 自動登入
            localStorage.setItem('userEmail', email);
            localStorage.setItem('isLoggedIn', 'true');
            
            // 跳轉到首頁
            window.location.href = 'homePage.html';
        }
    });

    // 即時驗證輸入
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
});

// 完成註冊
function completeRegistration() {
    // 切換到成功步驟
    goToStep(3);
    
    // 顯示成功彈跳視窗
    setTimeout(() => {
        showSuccessModal();
    }, 1000);
}

// 顯示成功彈跳視窗
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}

// 跳轉到首頁
function redirectToHome() {
    window.location.href = 'homePage.html';
}

// 點擊彈跳視窗外部時關閉
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target == modal) {
        redirectToHome();
    }
}

// 社交媒體登入處理
function socialLogin(platform) {
    // 這裡可以根據不同的平台實現不同的登入邏輯
    switch(platform) {
        case 'google':
            // 實現 Google 登入
            console.log('使用 Google 登入');
            // TODO: 實現 Google OAuth 登入
            break;
        case 'facebook':
            // 實現 Facebook 登入
            console.log('使用 Facebook 登入');
            // TODO: 實現 Facebook OAuth 登入
            break;
        case 'line':
            // 實現 Line 登入
            console.log('使用 Line 登入');
            // TODO: 實現 Line OAuth 登入
            break;
    }
} 