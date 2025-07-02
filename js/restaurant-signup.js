// 商家註冊頁面 JavaScript - 步驟式表單和驗證碼功能
document.addEventListener('DOMContentLoaded', function() {
    // API 基礎 URL
    const API_BASE_URL = 'http://localhost:8080/api';
    
    // 全域變數
    let isVerified = false;
    let registrationData = {};
    // selectedPhotos 已在 HTML 中定義為全域變數
    
    // 初始化
    init();
    
    function init() {
        // 清除所有可能存在的 email-message 元素
        document.querySelectorAll('.email-message').forEach(el => el.remove());
        
        // 初始化步驟按鈕事件
        initStepButtons();
        
        // 初始化表單驗證
        initFormValidation();
        
        // 初始化頭像上傳功能
        initAvatarUpload();
        
        // 初始化餐廳照片上傳功能
        initPhotoUpload();
        
        // 初始化電子郵件檢查功能
        initEmailCheck();
        
        // 初始化密碼顯示/隱藏功能
        initPasswordToggle();
    }
    
    // 初始化步驟按鈕事件
    function initStepButtons() {
        // 步驟1的下一步按鈕
        const step1NextBtn = document.getElementById('step1NextBtn');
        if (step1NextBtn) {
            step1NextBtn.addEventListener('click', function() {
                if (validateStep1()) {
                    // 儲存步驟1的資料
                    saveStep1Data();
                    // 發送驗證碼
                    sendVerificationCode();
                }
            });
        }
        
        // 步驟2的下一步按鈕
        const step2NextBtn = document.getElementById('step2NextBtn');
        if (step2NextBtn) {
            step2NextBtn.addEventListener('click', function() {
                const code = document.getElementById('verificationCode').value.trim();
                if (code.length !== 6) {
                    showError(document.getElementById('verificationCode'), '請輸入 6 位數驗證碼');
                    return;
                }
                // 驗證驗證碼
                verifyCode(code);
            });
        }
        
        // 步驟3的完成註冊按鈕
        const step3NextBtn = document.getElementById('step3NextBtn');
        if (step3NextBtn) {
            step3NextBtn.addEventListener('click', function() {
                if (validateStep3()) {
                    // 提交註冊表單
                    submitRegistration();
                }
            });
        }
        
        // 重新發送驗證碼按鈕
        const resendCodeBtn = document.getElementById('resendCodeBtn');
        if (resendCodeBtn) {
            resendCodeBtn.addEventListener('click', function() {
                if (!this.disabled) {
                    sendVerificationCode();
                }
            });
        }
    }
    
    // 初始化表單驗證
    function initFormValidation() {
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
        
        // 驗證碼輸入框
        const verificationCodeInput = document.getElementById('verificationCode');
        if (verificationCodeInput) {
            verificationCodeInput.addEventListener('input', function() {
                // 當輸入 6 位數字時自動驗證
                if (this.value.length === 6) {
                    clearError(this);
                }
            });
        }
    }
    
    // 初始化頭像上傳功能
    function initAvatarUpload() {
        const avatarInput = document.getElementById('avatar-upload');
        const avatarPreview = document.querySelector('.avatar-preview');

        if (avatarPreview && avatarInput) {
            avatarPreview.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                avatarInput.click();
            });

            avatarInput.addEventListener('change', function (e) {
                const file = e.target.files[0];
                if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                        showError(avatarInput, '檔案大小不能超過 2MB');
                        return;
                    }

                    if (!file.type.startsWith('image/')) {
                        showError(avatarInput, '請上傳圖片檔案');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = function (e) {
                        // 清除舊圖片
                        const oldImage = avatarPreview.querySelector('img');
                        if (oldImage) {
                            oldImage.remove();
                        }
                        
                        // 隱藏預設的上傳提示
                        const placeholder = avatarPreview.querySelector('.avatar-placeholder');
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }

                        // 添加新圖片
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        avatarPreview.appendChild(img);
                        avatarPreview.classList.add('has-image');
                        
                        // 清除錯誤訊息
                        clearError(avatarInput);
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }
    
    // 初始化餐廳照片上傳功能
    function initPhotoUpload() {
        const photoUpload = document.getElementById('photo-upload');
        const photoGrid = document.querySelector('.photo-grid');
        const addPhotoButton = document.querySelector('.add-photo');

        if (addPhotoButton) {
            addPhotoButton.addEventListener('click', function () {
                photoUpload.click();
            });
        }

        if (photoUpload) {
            photoUpload.addEventListener('change', function (e) {
                const files = e.target.files;
                // 將新選擇的照片添加到現有的照片列表中
                const newPhotos = Array.from(files);
                selectedPhotos = selectedPhotos.concat(newPhotos);
                console.log("目前總共選了幾張照片：", selectedPhotos.length);
                console.log("新增的照片：", newPhotos.map(p => p.name).join(", "));
                
                for (let file of files) {
                    if (file.type.startsWith('image/')) {
                        if (file.size > 2 * 1024 * 1024) {
                            alert('檔案大小不能超過 2MB');
                            continue;
                        }

                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const photoItem = document.createElement('div');
                            photoItem.className = 'photo-item photo-preview';
                            photoItem.innerHTML = `
                                <img src="${e.target.result}" alt="餐廳照片">
                                <button class="delete-photo">
                                    <i class="fas fa-times"></i>
                                </button>
                            `;
                            photoGrid.insertBefore(photoItem, photoGrid.firstElementChild);
                        };
                        reader.readAsDataURL(file);
                    }
                }
                this.value = ''; // 清空 input 值，這樣可以重複選擇相同的檔案
            });
        }

        // 處理照片刪除
        photoGrid.addEventListener('click', function (e) {
            if (e.target.closest('.delete-photo')) {
                const photoItem = e.target.closest('.photo-item');
                if (photoItem) {
                    // 找到要刪除的照片在陣列中的索引
                    const index = Array.from(photoItem.parentNode.children).indexOf(photoItem);
                    // 從 selectedPhotos 陣列中移除該照片
                    if (index > -1) {
                        selectedPhotos.splice(index - 1, 1); // -1 是因為還有一個 add-photo 按鈕
                        console.log("刪除後剩餘照片數量：", selectedPhotos.length);
                    }
                    photoItem.remove();
                }
            }
        });
    }
    
    // 初始化電子郵件檢查功能
    function initEmailCheck() {
        const emailInput = document.getElementById('email');
        let emailCheckTimeout;

        if (emailInput) {
            emailInput.addEventListener('input', function() {
                clearTimeout(emailCheckTimeout);
                const email = this.value;
                
                // 清除所有之前的提示訊息
                const formGroup = emailInput.closest('.form-group');
                const errorMessage = formGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.textContent = '';
                    errorMessage.style.display = 'none'; // 隱藏錯誤訊息元素
                }
                formGroup.classList.remove('error');
                
                // 移除所有 email-message 元素
                const existingMessages = formGroup.querySelectorAll('.email-message');
                existingMessages.forEach(el => el.remove());

                // 檢查是否為有效的電子信箱格式
                if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                    return;
                }

                // 設定延遲檢查，避免使用者輸入時頻繁發送請求
                emailCheckTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`${API_BASE_URL}/merchants/check-email?email=${encodeURIComponent(email)}`);
                        const exists = await response.json();

                        // 創建訊息元素
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'email-message';
                        messageDiv.style.margin = '5px 0 0 0';
                        messageDiv.style.padding = '0';
                        messageDiv.style.lineHeight = '1';
                        
                        if (exists) {
                            // 已註冊
                            messageDiv.style.color = '#dc3545';
                            messageDiv.textContent = '此電子信箱已被註冊';
                            formGroup.classList.add('error');
                        } else {
                            // 未註冊，可以使用
                            messageDiv.style.color = '#28a745';
                            messageDiv.textContent = '此電子信箱可以使用';
                        }
                        
                        // 將訊息添加到電子郵件輸入框後面
                        formGroup.appendChild(messageDiv);
                    } catch (error) {
                        console.error('檢查電子信箱時發生錯誤:', error);
                    }
                }, 500); // 500毫秒後執行檢查
            });
        }
    }
    
    // 初始化密碼顯示/隱藏功能
    function initPasswordToggle() {
        const passwordToggles = document.querySelectorAll('.password-toggle');
        
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const passwordInput = this.parentElement.querySelector('input');
                
                if (passwordInput.type === 'password') {
                    // 顯示密碼
                    passwordInput.type = 'text';
                    passwordInput.classList.add('password-visible');
                    this.classList.remove('fa-eye');
                    this.classList.add('fa-eye-slash');
                } else {
                    // 隱藏密碼
                    passwordInput.type = 'password';
                    passwordInput.classList.remove('password-visible');
                    this.classList.remove('fa-eye-slash');
                    this.classList.add('fa-eye');
                }
            });
        });
    }
    
    // 驗證步驟1
    function validateStep1() {
        let isValid = true;
        
        // 驗證餐廳名稱
        const nameInput = document.getElementById('restaurant-name');
        if (!nameInput.value.trim()) {
            showError(nameInput, '請輸入餐廳名稱');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showError(nameInput, '餐廳名稱至少需要 2 個字元');
            isValid = false;
        }
        
        // 驗證電子郵件
        const emailInput = document.getElementById('email');
        const formGroup = emailInput.closest('.form-group');
        const emailMessage = formGroup.querySelector('.email-message');
        
        if (!emailInput.value.trim()) {
            // 只有在沒有填寫電子郵件時才顯示錯誤
            showError(emailInput, '請輸入電子郵件');
            isValid = false;
        } else if (!validateEmail(emailInput.value.trim())) {
            // 只有在電子郵件格式不正確時才顯示錯誤
            showError(emailInput, '請輸入有效的電子郵件地址');
            isValid = false;
        } else if (emailMessage && emailMessage.style.color === 'rgb(220, 53, 69)') {
            // 如果有錯誤訊息（已被註冊），則表單無效，但不再添加額外的錯誤訊息
            isValid = false;
        }
        
        // 驗證聯絡電話
        const phoneInput = document.getElementById('phone');
        if (!phoneInput.value.trim()) {
            showError(phoneInput, '請輸入聯絡電話');
            isValid = false;
        } else if (!/^[0-9]{10}$/.test(phoneInput.value.trim())) {
            showError(phoneInput, '請輸入有效的聯絡電話');
            isValid = false;
        }
        
        // 驗證密碼
        const passwordInput = document.getElementById('password');
        if (!passwordInput.value) {
            showError(passwordInput, '請輸入密碼');
            isValid = false;
        } else if (passwordInput.value.length < 8) {
            showError(passwordInput, '密碼至少需要 8 個字元');
            isValid = false;
        }
        
        // 驗證確認密碼
        const confirmPasswordInput = document.getElementById('confirm-password');
        if (!confirmPasswordInput.value) {
            showError(confirmPasswordInput, '請再次輸入密碼');
            isValid = false;
        } else if (confirmPasswordInput.value !== passwordInput.value) {
            showError(confirmPasswordInput, '密碼不相符');
            isValid = false;
        }
        
        // 驗證服務條款
        const termsInput = document.getElementById('terms');
        if (!termsInput.checked) {
            showError(termsInput, '請閱讀並同意服務條款和隱私政策');
            isValid = false;
        }
        
        // 驗證頭像
        const avatarInput = document.getElementById('avatar-upload');
        if (avatarInput.required && avatarInput.files.length === 0) {
            showError(avatarInput, '請上傳餐廳頭像');
            isValid = false;
        }
        
        return isValid;
    }
    
    // 驗證步驟3
    function validateStep3() {
        let isValid = true;
        
        // 驗證餐廳地址
        const addressInput = document.getElementById('address');
        if (!addressInput.value.trim()) {
            showError(addressInput, '請輸入餐廳地址');
            isValid = false;
        }
        
        // 驗證料理類型
        const cuisineTypeInput = document.getElementById('cuisineType');
        if (!cuisineTypeInput.value.trim()) {
            showError(cuisineTypeInput, '請輸入料理類型');
            isValid = false;
        }
        
        // 驗證營業時間
        const businessHoursInput = document.getElementById('business-hours');
        if (!businessHoursInput.value.trim()) {
            showError(businessHoursInput, '請輸入營業時間');
            isValid = false;
        }
        
        return isValid;
    }
    
    // 儲存步驟1的資料
    function saveStep1Data() {
        registrationData = {
            name: document.getElementById('restaurant-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phoneNumber: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirm-password').value
        };
    }
    
    // 發送驗證碼
    function sendVerificationCode() {
        const email = document.getElementById('email').value.trim();
        const name = document.getElementById('restaurant-name').value.trim();
        
        // 發送 API 請求
        fetch(`${API_BASE_URL}/merchants/send-registration-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, name })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 顯示驗證碼區域
                    document.getElementById('verificationEmail').textContent = email;
                goToStep(2);
                startResendTimer();
            } else {
                alert('發送驗證碼失敗: ' + (data.message || '未知錯誤'));
            }
        })
        .catch(error => {
            console.error('發送驗證碼錯誤:', error);
            alert('發送驗證碼時發生錯誤，請稍後再試');
        });
    }
    
    // 驗證碼倒計時
    function startResendTimer() {
        let timeLeft = 60;
        const resendCodeBtn = document.getElementById('resendCodeBtn');
        const resendTimer = document.getElementById('resendTimer');
        
        if (!resendCodeBtn || !resendTimer) return;
        
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
    
    // 驗證驗證碼
    function verifyCode(code) {
        const email = document.getElementById('email').value.trim();
        
        fetch(`${API_BASE_URL}/merchants/verify-registration-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 驗證成功
                isVerified = true;
                goToStep(3);
            } else {
                // 驗證失敗
                showError(document.getElementById('verificationCode'), data.message || '驗證碼無效');
            }
        })
        .catch(error => {
            console.error('驗證碼驗證錯誤:', error);
            alert('驗證時發生錯誤，請稍後再試');
        });
    }
    
    // 提交註冊表單
    function submitRegistration() {
        if (!isVerified) {
            alert('請先驗證您的電子郵件');
            goToStep(2);
            return;
        }
        
        const formData = new FormData();

        // 取得單檔：頭像
        const avatarFile = document.getElementById('avatar-upload').files[0];
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        // 添加照片
        for (let i = 0; i < selectedPhotos.length; i++) {
            formData.append('photos', selectedPhotos[i]);
        }

        // 抓其他欄位
        const jsonData = {
            name: registrationData.name,
            email: registrationData.email,
            phoneNumber: registrationData.phoneNumber,
            password: registrationData.password,
            confirmPassword: registrationData.confirmPassword,
            address: document.getElementById('address').value.trim(),
            cuisineType: document.getElementById('cuisineType').value.trim(),
            businessHours: document.getElementById('business-hours').value.trim()
        };

        formData.append('data', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

        // 禁用提交按鈕
        const submitButton = document.getElementById('step3NextBtn');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '註冊中...';
        }

        // 發送註冊請求
        fetch(`${API_BASE_URL}/merchants/register`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.text().then(text => {
                    // 註冊成功
                    goToStep(4);
                    // 清空照片列表
                    selectedPhotos = [];
                });
            } else {
                return response.text().then(text => {
                    throw new Error(`${response.status}: ${text}`);
                });
            }
        })
        .catch(error => {
            console.error('註冊失敗', error);
            alert('註冊失敗：' + error.message);
            // 恢復提交按鈕
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = '完成註冊';
            }
        });
    }
    
    // 切換步驟
    function goToStep(stepNumber) {
        const steps = document.querySelectorAll('.step');
        const stepContents = document.querySelectorAll('.step-content');
        
        // 更新步驟指示器
        steps.forEach((step, index) => {
            if (index + 1 <= stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // 更新步驟內容
        stepContents.forEach((content, index) => {
            if (index + 1 === stepNumber) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });

        // 滾動到頁面頂部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 返回上一步
    window.prevStep = function() {
        const currentStep = Array.from(document.querySelectorAll('.step-content')).findIndex(content => 
            window.getComputedStyle(content).display === 'block'
        ) + 1;
        
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    };
    
    // 驗證電子郵件格式
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // 顯示錯誤訊息
    function showError(input, message) {
        const formGroup = input.closest('.form-group, .terms-group');
        if (formGroup) {
            formGroup.classList.add('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                // 如果是電子郵件欄位，且已經有 email-message，則不顯示錯誤訊息
                if (input.id === 'email' && formGroup.querySelector('.email-message')) {
                    errorMessage.style.display = 'none';
                    return;
                }
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
                errorMessage.style.margin = '5px 0 0 0';
                errorMessage.style.padding = '0';
                errorMessage.style.lineHeight = '1';
            }
        }
    }
    
    // 清除錯誤訊息
    function clearError(input) {
        const formGroup = input.closest('.form-group, .terms-group');
        if (formGroup) {
            formGroup.classList.remove('error');
            const errorMessage = formGroup.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }
        }
    }
}); 