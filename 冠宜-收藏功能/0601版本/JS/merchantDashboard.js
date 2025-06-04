// 模擬數據
const mockMenuItems = [
    { id: 1, name: '招牌牛肉麵', price: 180, category: '麵食', status: '上架中' },
    { id: 2, name: '紅燒排骨飯', price: 150, category: '飯類', status: '上架中' },
    { id: 3, name: '小籠包', price: 120, category: '點心', status: '上架中' }
];

const mockOrders = [
    { id: 1, customer: '王小明', items: '招牌牛肉麵 x1, 小籠包 x2', total: 420, status: '待處理', time: '2024-03-15 12:30' },
    { id: 2, customer: '李小華', items: '紅燒排骨飯 x1', total: 150, status: '處理中', time: '2024-03-15 12:45' }
];

const mockReviews = [
    { id: 1, customer: '張三', rating: 5, comment: '服務很好，食物美味！', time: '2024-03-15' },
    { id: 2, customer: '李四', rating: 4, comment: '環境舒適，價格合理。', time: '2024-03-14' }
];

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化導航功能
    initNavigation();
    
    // 初始化各區塊內容
    initMenuSection();
    initOrdersSection();
    initReviewsSection();
    initSettingsSection();
    
    // 初始化登出功能
    initLogout();
});

// 導航功能
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active類
            navItems.forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
            
            // 添加active類到當前項目
            this.classList.add('active');
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}

// 菜單管理區塊
function initMenuSection() {
    const menuList = document.querySelector('.menu-list');
    const addItemBtn = document.querySelector('.add-item-btn');
    
    // 顯示菜單項目
    function displayMenuItems() {
        menuList.innerHTML = mockMenuItems.map(item => `
            <div class="menu-item">
                <div class="menu-item-info">
                    <h3>${item.name}</h3>
                    <p>${item.category} - NT$ ${item.price}</p>
                </div>
                <div class="menu-item-actions">
                    <button class="edit-btn" onclick="editMenuItem(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" onclick="deleteMenuItem(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // 新增餐點
    addItemBtn.addEventListener('click', function() {
        // 這裡可以實現新增餐點的邏輯
        alert('新增餐點功能開發中...');
    });
    
    displayMenuItems();
}

// 訂單管理區塊
function initOrdersSection() {
    const ordersList = document.querySelector('.orders-list');
    const orderStatus = document.getElementById('orderStatus');
    
    // 顯示訂單
    function displayOrders() {
        ordersList.innerHTML = mockOrders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <h3>訂單 #${order.id}</h3>
                    <p>顧客：${order.customer}</p>
                    <p>內容：${order.items}</p>
                    <p>總計：NT$ ${order.total}</p>
                    <p>時間：${order.time}</p>
                </div>
                <div class="order-status">
                    <span class="status-badge ${order.status.toLowerCase()}">${order.status}</span>
                </div>
            </div>
        `).join('');
    }
    
    // 訂單狀態篩選
    orderStatus.addEventListener('change', function() {
        // 這裡可以實現訂單篩選的邏輯
        displayOrders();
    });
    
    displayOrders();
}

// 評論管理區塊
function initReviewsSection() {
    const reviewsList = document.querySelector('.reviews-list');
    const reviewRating = document.getElementById('reviewRating');
    
    // 顯示評論
    function displayReviews() {
        reviewsList.innerHTML = mockReviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <h3>${review.customer}</h3>
                    <div class="rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                    </div>
                </div>
                <p class="review-comment">${review.comment}</p>
                <p class="review-time">${review.time}</p>
            </div>
        `).join('');
    }
    
    // 評論評分篩選
    reviewRating.addEventListener('change', function() {
        // 這裡可以實現評論篩選的邏輯
        displayReviews();
    });
    
    displayReviews();
}

// 設定區塊
function initSettingsSection() {
    const settingsForm = document.getElementById('settingsForm');
    
    // 載入設定
    function loadSettings() {
        // 這裡可以從後端API載入設定
        const mockSettings = {
            storeName: '美味餐廳',
            storeAddress: '台北市信義區信義路五段7號',
            storePhone: '02-1234-5678',
            storeHours: '週一至週五 11:00-21:00',
            storeDescription: '提供美味的中式料理，歡迎光臨！'
        };
        
        Object.keys(mockSettings).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = mockSettings[key];
            }
        });
    }
    
    // 儲存設定
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const settings = Object.fromEntries(formData.entries());
        
        // 這裡可以實現儲存設定的邏輯
        console.log('儲存設定：', settings);
        alert('設定已儲存！');
    });
    
    loadSettings();
}

// 登出功能
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    logoutBtn.addEventListener('click', function() {
        if (confirm('確定要登出嗎？')) {
            // 清除登入狀態
            localStorage.removeItem('merchantEmail');
            // 重定向到首頁
            window.location.href = '/HTML/homePage.html';
        }
    });
}

// 編輯菜單項目
function editMenuItem(id) {
    // 這裡可以實現編輯菜單項目的邏輯
    alert(`編輯餐點 #${id} 功能開發中...`);
}

// 刪除菜單項目
function deleteMenuItem(id) {
    if (confirm('確定要刪除此餐點嗎？')) {
        // 這裡可以實現刪除菜單項目的邏輯
        alert(`刪除餐點 #${id} 功能開發中...`);
    }
} 