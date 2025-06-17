document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有需要的元素
    const verifyEmailForm = document.getElementById('verifyEmailForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const emailInput = document.getElementById('email');
    const verificationCodeInput = document.getElementById('verificationCode');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const resendCodeButton = document.getElementById('resendCode');
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
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

    // 驗證電子郵件格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 驗證密碼強度
    function validatePassword(password) {
        return password.length >= 8;
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

    // 驗證碼倒計時
    function startResendTimer() {
        let timeLeft = 60;
        resendCodeButton.disabled = true;
        
        const timer = setInterval(() => {
            timeLeft--;
            resendCodeButton.textContent = `重新發送驗證碼 (${timeLeft}s)`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendCodeButton.disabled = false;
                resendCodeButton.textContent = '重新發送驗證碼';
            }
        }, 1000);
    }

    // 驗證電子郵件表單
    verifyEmailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        
        if (!validateEmail(email)) {
            showError(emailInput, '請輸入有效的電子郵件地址');
            return;
        }

        // 模擬發送驗證碼
        startResendTimer();
        goToStep(2);
    });

    // 重設密碼表單
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const verificationCode = verificationCodeInput.value.trim();
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let isValid = true;

        if (verificationCode.length !== 6) {
            showError(verificationCodeInput, '請輸入 6 位數驗證碼');
            isValid = false;
        }

        if (!validatePassword(newPassword)) {
            showError(newPasswordInput, '密碼至少需要 8 個字元');
            isValid = false;
        }

        if (newPassword !== confirmPassword) {
            showError(confirmPasswordInput, '密碼不相符');
            isValid = false;
        }

        if (isValid) {
            // 模擬密碼重設成功
            goToStep(3);
        }
    });

    // 重新發送驗證碼
    resendCodeButton.addEventListener('click', function() {
        if (!this.disabled) {
            startResendTimer();
        }
    });

    // 即時驗證輸入
    emailInput.addEventListener('input', function() {
        if (validateEmail(this.value.trim())) {
            clearError(this);
        }
    });

    newPasswordInput.addEventListener('input', function() {
        if (validatePassword(this.value)) {
            clearError(this);
        }
    });

    confirmPasswordInput.addEventListener('input', function() {
        if (this.value === newPasswordInput.value) {
            clearError(this);
        }
    });

    // 初始化
    goToStep(1);
});

document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    
    // 這裡可以添加實際的郵件發送邏輯
    // 目前僅模擬發送成功
    showSuccessModal();
});

function showSuccessModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('successModal');
    modal.style.display = 'none';
    
    // 清空表單
    document.getElementById('forgotPasswordForm').reset();
}

// 點擊彈跳視窗外部時關閉
window.onclick = function(event) {
    const modal = document.getElementById('successModal');
    if (event.target == modal) {
        closeModal();
    }
} 