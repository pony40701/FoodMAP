document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有需要的元素
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const removeAvatarBtn = document.getElementById('removeAvatar');

    // API 基礎 URL
    const API_BASE_URL = 'http://localhost:8080/api';

    // 大頭貼上傳處理
    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // 檢查檔案類型
            if (!file.type.startsWith('image/')) {
                showError(avatarInput, '請上傳圖片檔案');
                return;
            }

            // 檢查檔案大小（限制為 2MB）
            if (file.size > 2 * 1024 * 1024) {
                showError(avatarInput, '圖片大小不能超過 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result;  // 保留完整的 base64 字串
                avatarPreview.src = base64Data;
                avatarPreview.dataset.base64 = base64Data;  // 儲存完整的 base64 字串
                removeAvatarBtn.style.display = 'flex';
                clearError(avatarInput);
            };
            reader.readAsDataURL(file);
        }
    });

    // 移除大頭貼
    removeAvatarBtn.addEventListener('click', function() {
        avatarInput.value = '';
        avatarPreview.src = 'images/default-avatar.jpg';
        avatarPreview.dataset.base64 = '';
        removeAvatarBtn.style.display = 'none';
        clearError(avatarInput);
    });

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

    // 清除錯誤訊息
    function clearError(input) {
        const formGroup = input.closest('.form-group, .terms-checkbox');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = '';
            }
        }
    }

    // 顯示錯誤訊息
    function showError(input, message) {
        const formGroup = input.closest('.form-group, .terms-checkbox');
        if (formGroup) {
            const errorMessage = formGroup.querySelector('.error-message');
            if (!errorMessage) {
                const newErrorMessage = document.createElement('div');
                newErrorMessage.className = 'error-message';
                formGroup.appendChild(newErrorMessage);
            }
            formGroup.querySelector('.error-message').textContent = message;
            formGroup.classList.add('error');
        }
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
        window.location.href = 'index.html';
    });

    // 處理註冊表單提交
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let isValid = true;

        // 獲取表單數據
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const terms = document.getElementById('terms');

        // 驗證電子郵件
        if (!validateEmail(email)) {
            showError(document.getElementById('email'), '請輸入有效的電子郵件地址');
            isValid = false;
        }

        // 驗證使用者名稱
        if (username.length < 3) {
            showError(document.getElementById('username'), '使用者名稱至少需要 3 個字元');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            showError(document.getElementById('username'), '使用者名稱只能包含英文字母、數字和底線');
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

        // 驗證服務條款
        if (!terms.checked) {
            showError(terms, '請閱讀並同意服務條款和隱私權政策');
            isValid = false;
        }

        if (isValid) {
            // 更新確認資料頁面的內容
            document.getElementById('confirmEmail').textContent = email;
            document.getElementById('confirmUsername').textContent = username;
            document.getElementById('confirmName').textContent = name;
            document.getElementById('confirmPhone').textContent = phone;
            
            // 切換到確認資料步驟
            goToStep(2);
        }
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

    // 返回上一步
    window.prevStep = function() {
        goToStep(1);
    };

    // 提交註冊
    window.submitRegistration = function() {
        // 獲取表單數據
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        
        // 獲取圖片的 base64 數據
        const avatarBase64 = avatarPreview.dataset.base64 || null;
        
        // 準備註冊資料
        const registerData = {
            email: email,
            username: username,
            password: password,
            name: name,
            phone_number: phone,
            avatar_url: avatarBase64  // 使用完整的 base64 字串
        };
        
        // 顯示載入中狀態
        const submitButton = document.querySelector('.btn-submit');
        submitButton.disabled = true;
        submitButton.textContent = '註冊中...';
        
        // 發送註冊請求
        fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(registerData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('註冊響應:', data);
            
            if (data.id) {
                // 註冊成功
                console.log('註冊成功');
                
                // 儲存用戶資料
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    username: data.username
                }));
                
                // 切換到完成步驟
                goToStep(3);
            } else {
                // 註冊失敗
                console.error('註冊失敗:', data.error || '未知錯誤');
                alert('註冊失敗: ' + (data.error || '未知錯誤'));
                
                // 恢復按鈕狀態
                submitButton.disabled = false;
                submitButton.textContent = '確認註冊';
            }
        })
        .catch(error => {
            console.error('註冊錯誤:', error);
            alert('註冊時發生錯誤，請稍後再試');
            
            // 恢復按鈕狀態
            submitButton.disabled = false;
            submitButton.textContent = '確認註冊';
        });
    };

    // 即時驗證輸入
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            if (this.type === 'checkbox') {
                if (this.checked) {
                    clearError(this);
                }
            } else {
                clearError(this);
            }
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
    window.location.href = 'index.html';
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