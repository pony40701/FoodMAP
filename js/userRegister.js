document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有需要的元素
    const registerForm = document.getElementById('registerForm');
    const verificationForm = document.getElementById('verificationForm');
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
    const resendCodeBtn = document.getElementById('resendCodeBtn');
    const resendTimer = document.getElementById('resendTimer');

    // API 基礎 URL
    const API_BASE_URL = 'http://localhost:8080/api';

    // 全域變數宣告
    let registrationData = {};

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

    // showError 函式提前宣告
    function showError(input, message) {
        const formGroup = input.closest('.form-group, .terms-checkbox');
        if (formGroup) {
            let errorMessage = formGroup.querySelector('.error-message');
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                formGroup.appendChild(errorMessage);
            }
            errorMessage.textContent = message;
            formGroup.classList.add('error');
        }
    }

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
            // 儲存註冊資料
            registrationData = {
                email: email,
                username: username,
                password: password,
                name: name,
                phone: phone,
                avatarBase64: avatarPreview.dataset.base64 || null
            };

            // 發送驗證碼
            sendVerificationCode(email, username);
        }
    });

    // 處理驗證碼表單提交
    verificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const code = document.getElementById('verificationCode').value.trim();
        
        if (code.length !== 6) {
            showError(document.getElementById('verificationCode'), '請輸入 6 位數驗證碼');
            return;
        }

        // 驗證驗證碼
        verifyCode(registrationData.email, code);
    });

    // 重新發送驗證碼
    resendCodeBtn.addEventListener('click', function() {
        if (!this.disabled) {
            sendVerificationCode(registrationData.email, registrationData.username);
        }
    });

    // 發送驗證碼
    async function sendVerificationCode(email, username) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/send-registration-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username })
            });

            const result = await response.json();

            if (response.ok) {
                // 顯示驗證碼步驟
                document.getElementById('verificationEmail').textContent = email;
                goToStep(2);
                startResendTimer();
            } else {
                alert('發送驗證碼失敗: ' + result.error);
            }
        } catch (error) {
            console.error('發送驗證碼錯誤:', error);
            alert('發送驗證碼時發生錯誤，請稍後再試');
        }
    }

    // 驗證碼倒計時
    function startResendTimer() {
        let timeLeft = 60;
        resendCodeBtn.disabled = true;
        resendTimer.style.display = 'inline';
        
        const timer = setInterval(() => {
            timeLeft--;
            resendTimer.textContent = `重新發送 (${timeLeft}s)`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendCodeBtn.disabled = false;
                resendTimer.style.display = 'none';
            }
        }, 1000);
    }

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

    // ====== 以下 function 也全部放進 DOMContentLoaded 作用域 ======
    function completeRegistration() {
        goToStep(4);
        setTimeout(() => {
            showSuccessModal();
        }, 1000);
    }

    function showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'block';
    }

    function redirectToHome() {
        window.location.href = 'index.html';
    }

    window.onclick = function(event) {
        const modal = document.getElementById('successModal');
        if (event.target == modal) {
            redirectToHome();
        }
    }

    function socialLogin(platform) {
        switch(platform) {
            case 'google':
                break;
            case 'facebook':
                break;
            case 'line':
                break;
        }
    }

    function fillConfirmData() {
        document.getElementById('confirmEmail').textContent = registrationData.email || '';
        document.getElementById('confirmUsername').textContent = registrationData.username || '';
        document.getElementById('confirmName').textContent = registrationData.name || '';
        document.getElementById('confirmPhone').textContent = registrationData.phone || '';
    }

    async function verifyCode(email, code) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-registration-code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, code })
            });

            const result = await response.json();

            if (response.ok) {
                fillConfirmData(); // 驗證成功時填入資料
                goToStep(3);
            } else {
                showError(document.getElementById('verificationCode'), result.error);
            }
        } catch (error) {
            console.error('驗證碼驗證錯誤:', error);
            showError(document.getElementById('verificationCode'), '驗證時發生錯誤，請稍後再試');
        }
    }

    // 讓外部可呼叫
    window.prevStep = function() {
        const currentStep = Array.from(stepContents).findIndex(content => content.style.display === 'block');
        if (currentStep > 0) {
            goToStep(currentStep);
        }
    };
    window.submitRegistration = function() {
        // 準備註冊資料
        const registerData = {
            email: registrationData.email,
            username: registrationData.username,
            password: registrationData.password,
            name: registrationData.name,
            phone_number: registrationData.phone,
            avatar_url: registrationData.avatarBase64
        };
        const submitButton = document.querySelector('.btn-submit');
        submitButton.disabled = true;
        submitButton.textContent = '註冊中...';
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
            if (data.id) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userEmail', registrationData.email);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    username: data.username
                }));
                goToStep(4);
            } else {
                alert('註冊失敗: ' + (data.error || '未知錯誤'));
                submitButton.disabled = false;
                submitButton.textContent = '確認註冊';
            }
        })
        .catch(error => {
            alert('註冊時發生錯誤，請稍後再試');
            submitButton.disabled = false;
            submitButton.textContent = '確認註冊';
        });
    };
}); 