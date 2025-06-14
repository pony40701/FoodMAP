document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const saveNotificationsBtn = document.getElementById('saveNotifications');
    const savePrivacyBtn = document.getElementById('savePrivacy');
    const deleteAccountBtn = document.getElementById('deleteAccount');

    // 檢查登入狀態
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '../HTML/userLogin.html';
        return;
    }

    // 載入用戶資料
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {
            notifications: {
                order: true,
                promotion: true,
                system: true
            },
            privacy: {
                showProfile: true,
                showReviews: true
            }
        };

        // 填充基本資料
        document.getElementById('name').value = userData.name || '';
        document.getElementById('email').value = userData.email || '';
        document.getElementById('phone').value = userData.phone || '';

        // 填充通知設定
        document.getElementById('orderNotifications').checked = settings.notifications.order;
        document.getElementById('promotionNotifications').checked = settings.notifications.promotion;
        document.getElementById('systemNotifications').checked = settings.notifications.system;

        // 填充隱私設定
        document.getElementById('showProfile').checked = settings.privacy.showProfile;
        document.getElementById('showReviews').checked = settings.privacy.showReviews;
    }

    // 更新基本資料
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        alert('基本資料已更新！');
    });

    // 更新密碼
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 驗證目前密碼
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        if (currentPassword !== userData.password) {
            alert('目前密碼錯誤！');
            return;
        }

        // 驗證新密碼
        if (newPassword !== confirmPassword) {
            alert('兩次輸入的新密碼不一致！');
            return;
        }

        // 更新密碼
        userData.password = newPassword;
        localStorage.setItem('userData', JSON.stringify(userData));
        alert('密碼已更新！');
        passwordForm.reset();
    });

    // 更新通知設定
    saveNotificationsBtn.addEventListener('click', function() {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        settings.notifications = {
            order: document.getElementById('orderNotifications').checked,
            promotion: document.getElementById('promotionNotifications').checked,
            system: document.getElementById('systemNotifications').checked
        };

        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('通知設定已更新！');
    });

    // 更新隱私設定
    savePrivacyBtn.addEventListener('click', function() {
        const settings = JSON.parse(localStorage.getItem('userSettings')) || {};
        settings.privacy = {
            showProfile: document.getElementById('showProfile').checked,
            showReviews: document.getElementById('showReviews').checked
        };

        localStorage.setItem('userSettings', JSON.stringify(settings));
        alert('隱私設定已更新！');
    });

    // 刪除帳號
    deleteAccountBtn.addEventListener('click', function() {
        if (confirm('確定要刪除帳號嗎？此操作無法復原！')) {
            // 清除所有相關資料
            localStorage.removeItem('userData');
            localStorage.removeItem('userSettings');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('orders');
            localStorage.removeItem('favoriteStores');
            localStorage.removeItem('favoriteReviews');
            localStorage.removeItem('notifications');

            alert('帳號已刪除！');
            window.location.href = '../HTML/homePage.html';
        }
    });

    // 初始化載入
    loadUserData();
}); 