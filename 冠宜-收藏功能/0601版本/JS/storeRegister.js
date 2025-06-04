document.addEventListener('DOMContentLoaded', function() {
    const storeRegisterForm = document.getElementById('storeRegisterForm');

    // 處理註冊表單提交
    storeRegisterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const storeName = document.getElementById('storeName').value;
        const storeEmail = document.getElementById('storeEmail').value;
        const storePassword = document.getElementById('storePassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const storePhone = document.getElementById('storePhone').value;
        const storeAddress = document.getElementById('storeAddress').value;
        const storeCategory = document.getElementById('storeCategory').value;

        // 驗證密碼
        if (storePassword !== confirmPassword) {
            alert('兩次輸入的密碼不一致！');
            return;
        }

        // 從 localStorage 獲取現有商家資料
        const stores = JSON.parse(localStorage.getItem('stores')) || [];

        // 檢查電子郵件是否已被註冊
        if (stores.some(store => store.email === storeEmail)) {
            alert('此電子郵件已被註冊！');
            return;
        }

        // 創建新商家資料
        const newStore = {
            id: Date.now().toString(),
            name: storeName,
            email: storeEmail,
            password: storePassword,
            phone: storePhone,
            address: storeAddress,
            category: storeCategory,
            rating: 0,
            reviews: [],
            orders: [],
            menu: [],
            isOpen: true,
            createdAt: new Date().toISOString()
        };

        // 儲存商家資料
        stores.push(newStore);
        localStorage.setItem('stores', JSON.stringify(stores));

        // 自動登入
        localStorage.setItem('isStoreLoggedIn', 'true');
        localStorage.setItem('storeEmail', storeEmail);
        localStorage.setItem('storeId', newStore.id);

        alert('註冊成功！');
        window.location.href = 'storeDashboard.html';
    });
}); 