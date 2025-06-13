// 假資料
const mockOrders = [
    {
        id: 'ORD001',
        userId: 1,
        storeName: '老王牛肉麵',
        orderTime: '2024-03-15T12:30:00',
        status: 'completed',
        totalAmount: 350,
        items: ['牛肉麵', '小菜']
    },
    {
        id: 'ORD002',
        userId: 1,
        storeName: '阿婆滷肉飯',
        orderTime: '2024-03-14T18:45:00',
        status: 'pending',
        totalAmount: 280,
        items: ['滷肉飯', '湯品']
    },
    {
        id: 'ORD003',
        userId: 1,
        storeName: '小籠包專賣店',
        orderTime: '2024-03-13T11:20:00',
        status: 'cancelled',
        totalAmount: 420,
        items: ['小籠包', '酸辣湯']
    }
];

const mockReviews = [
    {
        id: 1,
        userId: 1,
        storeName: '老王牛肉麵',
        title: '超好吃的牛肉麵',
        content: '牛肉很嫩，湯頭濃郁，服務態度很好！',
        rating: 5,
        time: '2024-03-15T14:30:00',
        tags: ['牛肉麵', '湯頭濃郁', '服務好']
    },
    {
        id: 2,
        userId: 1,
        storeName: '阿婆滷肉飯',
        title: '道地的滷肉飯',
        content: '滷肉香而不膩，米飯粒粒分明。',
        rating: 4,
        time: '2024-03-14T19:20:00',
        tags: ['滷肉飯', '道地', 'CP值高']
    },
    {
        id: 3,
        userId: 1,
        storeName: '小籠包專賣店',
        title: '皮薄餡多的小籠包',
        content: '小籠包皮薄餡多，湯汁豐富。',
        rating: 5,
        time: '2024-03-13T12:15:00',
        tags: ['小籠包', '湯包', '點心']
    }
];

const mockNotifications = [
    {
        id: 1,
        userId: 1,
        type: 'order',
        content: '您的訂單 ORD001 已準備完成，請前往取餐。',
        time: '2024-03-15T12:30:00',
        read: false
    },
    {
        id: 2,
        userId: 1,
        type: 'promotion',
        content: '本週末全館商品 8 折起！',
        time: '2024-03-14T10:00:00',
        read: true
    },
    {
        id: 3,
        userId: 1,
        type: 'system',
        content: '您的評論已獲得回覆。',
        time: '2024-03-13T15:45:00',
        read: false
    }
];

// 從 localStorage 獲取收藏數據
function getFavoriteStores() {
    // 使用新的收藏系統
    if (window.favoriteSystem && window.favoriteSystem.initialized) {
        return window.favoriteSystem.getFavoriteStores();
    }
    
    // 如果收藏系統未初始化，返回空數組
    console.warn('收藏系統未初始化，無法獲取收藏數據');
    return [];
}

function getFavoriteReviews() {
    // 使用新的收藏系統
    if (window.favoriteSystem && window.favoriteSystem.initialized) {
        return window.favoriteSystem.getFavoriteReviews();
    }
    
    // 如果收藏系統未初始化，返回空數組
    console.warn('收藏系統未初始化，無法獲取收藏心得數據');
    return [];
}

// 載入收藏
async function loadFavorites(type = 'stores') {
    console.log(`開始載入收藏 (類型: ${type})`);
    
    const storesContainer = document.querySelector('.favorites-stores');
    const reviewsContainer = document.querySelector('.favorites-reviews');
    
    if (!storesContainer || !reviewsContainer) {
        console.error('找不到收藏列表的容器元素');
            return;
        }

        // 顯示載入中
        storesContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 載入收藏餐廳中...</div>';
        storesContainer.style.display = 'block';
        reviewsContainer.style.display = 'none';

    if (type === 'stores') {
        try {
            // 檢查收藏系統是否初始化
            if (!window.favoriteSystem || !window.favoriteSystem.initialized) {
                console.log('收藏系統未初始化，創建模擬的收藏系統');
                window.favoriteSystem = {
                    initialized: true,
                    stores: [],
                    reviews: [],
                    getFavoriteStores: function() {
                        return this.stores;
                    },
                    getFavoriteReviews: function() {
                        return this.reviews;
                    },
                    initialize: function() {
                        this.initialized = true;
                        return Promise.resolve(true);
                    },
                    removeStore: function(id) {
                        this.stores = this.stores.filter(store => store.id !== id && store.place_id !== id);
                        return Promise.resolve(true);
                    }
                };
            }
            
            // 從 API 獲取收藏餐廳數據
            let restaurants = await fetchFavoriteRestaurants();
            
            // 排序餐廳，將已收藏的餐廳排在前面
            restaurants.sort((a, b) => {
                // 如果兩個餐廳都是收藏或都不是收藏，則按評分排序
                if ((a.isFavorite && b.isFavorite) || (!a.isFavorite && !b.isFavorite)) {
                    return b.rating - a.rating; // 評分高的排前面
                }
                // 收藏的排前面
                return a.isFavorite ? -1 : 1;
            });
            
            // 使用簡單的方式顯示收藏餐廳，不依賴 Google Places API
            const favoriteStoresHTML = [];
            
            // 從數據生成餐廳卡片
            for (const restaurant of restaurants) {
                const placeId = restaurant.id || restaurant.place_id;
                if (!placeId) {
                    console.warn('發現沒有 ID 的餐廳資料:', restaurant);
                    continue;
                }
                
                console.log(`處理餐廳: ${restaurant.name || '未知'} (ID: ${placeId})`);
                
                // 使用 restaurant.photos 屬性作為圖片來源
                const photoUrl = restaurant.photos || 'images/default-restaurant.jpg';
                
                // 生成餐廳卡片 HTML
                favoriteStoresHTML.push(`
                    <div class="restaurant-card v3" data-place-id="${placeId}">
                        <div class="restaurant-image-wrapper v3">
                            <img src="${photoUrl}" alt="${restaurant.name || '未知餐廳'}" class="restaurant-image v3" onerror="this.src='images/default-restaurant.jpg'" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="restaurant-info v3">
                            <div class="restaurant-title-row v3">
                                <h3 class="restaurant-name v3">${restaurant.name || '未知餐廳'}</h3>
                                <button class="favorite-btn active" data-place-id="${placeId}" data-name="${(restaurant.name || '未知餐廳').replace(/"/g, '&quot;')}">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                            <div class="restaurant-rating-row v3">
                                <div class="rating-stars v3">${generateStars(restaurant.rating || 0)}</div>
                                <div class="rating-score v3">${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</div>
                                <div class="rating-count v3">(${restaurant.user_ratings_total || 0} 則評論)</div>
                            </div>
                            <div class="restaurant-address-row v3">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="address-text v3">${restaurant.address || restaurant.vicinity || '地址未知'}</span>
                            </div>
                            ${restaurant.types && restaurant.types.length > 0 ? `
                            <div class="restaurant-tags-row v3">
                                ${restaurant.types.slice(0, 3).map(type => `<span class="tag v3">${type}</span>`).join('')}
                            </div>
                            ` : ''}
                            <div class="restaurant-status-row v3">
                                <span class="status-dot v3 open"></span>
                                <span class="status-text v3 open">營業中</span>
                            </div>
                        </div>
                    </div>
                `);
            }
            
            // 更新 DOM
            if (favoriteStoresHTML.length > 0) {
                storesContainer.innerHTML = `<div class="restaurants-grid v3">${favoriteStoresHTML.join('')}</div>`;
                console.log('成功渲染餐廳卡片');

            // 綁定收藏按鈕事件
            const favoriteButtons = storesContainer.querySelectorAll('.favorite-btn');
            favoriteButtons.forEach(button => {
                const placeId = button.dataset.placeId;
                const name = button.dataset.name;
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(placeId, name);
                });
            });

            // 綁定餐廳卡片點擊事件
            const restaurantCards = storesContainer.querySelectorAll('.restaurant-card');
            restaurantCards.forEach(card => {
                const placeId = card.dataset.placeId;
                
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.favorite-btn')) {
                            console.log(`顯示餐廳詳情彈窗: ${placeId}`);
                            // 使用全局函數顯示餐廳詳情彈窗
                            if (typeof window.showRestaurantDetail === 'function') {
                                // 先獲取餐廳數據
                                const storedFavorites = localStorage.getItem('favoriteStores');
                                if (storedFavorites) {
                                    try {
                                        const favorites = JSON.parse(storedFavorites);
                                        if (Array.isArray(favorites)) {
                                            const restaurant = favorites.find(r => r.id === placeId || r.place_id === placeId);
                                            if (restaurant) {
                                                window.showRestaurantDetail(restaurant);
                                                return;
                                            }
                                        }
                                    } catch (error) {
                                        console.error('解析收藏數據失敗:', error);
                                    }
                                }
                                // 如果沒有找到餐廳數據，直接傳遞 ID
                                window.showRestaurantDetail({id: placeId, place_id: placeId});
                            } else {
                                console.error('全局 showRestaurantDetail 函數不存在');
                                showToast('無法顯示餐廳詳情，請稍後再試');
                            }
                    }
                });
            });
            } else {
                storesContainer.innerHTML = '<div class="no-data">還沒有收藏的餐廳</div>';
                console.log('沒有可顯示的餐廳卡片');
            }

        } catch (error) {
            console.error('載入收藏餐廳時發生錯誤', error);
            storesContainer.innerHTML = '<div class="error-message">載入收藏餐廳時發生錯誤，請稍後再試</div>';
        }
    } else { // type === 'reviews'
        // 顯示收藏心得列表
            reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏的心得</div>';
            storesContainer.style.display = 'none';
            reviewsContainer.style.display = 'block';
    }
}

// 從收藏中移除餐廳
function removeFavorite(id, name) {
    console.log(`嘗試移除收藏: ${name} (ID: ${id})`);
    
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        console.log('用戶未登入，顯示登入彈窗');
        // 顯示登入彈窗
        showLoginModal();
        return;
    }

    if (confirm(`確定要取消收藏 ${name || '這家店'} 嗎？`)) {
        console.log(`用戶確認移除收藏: ${name}`);
        
        // 使用新的收藏系統移除收藏
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            window.favoriteSystem.removeStore(id).then(success => {
                if (success) {
                    console.log(`成功移除收藏: ${name} (ID: ${id})`);
                    showToast(`已取消收藏 ${name || '這家店'}`);
                    
                    // 立即從頁面中移除卡片
                    const card = document.querySelector(`.restaurant-card[data-place-id="${id}"]`);
                    if (card) {
                        card.remove();
                        console.log('已從頁面中移除卡片');
                    }
                    
                    // 從 localStorage 中移除收藏
                    try {
                        const storedFavorites = localStorage.getItem('favoriteStores');
                        if (storedFavorites) {
                            const favorites = JSON.parse(storedFavorites);
                            if (Array.isArray(favorites)) {
                                const updatedFavorites = favorites.filter(r => r.id !== id && r.place_id !== id);
                                localStorage.setItem('favoriteStores', JSON.stringify(updatedFavorites));
                                console.log(`已從 localStorage 中移除收藏: ${id}`);
                            }
                        }
                    } catch (error) {
                        console.error('更新 localStorage 失敗:', error);
                    }
                    
                    // 檢查是否還有收藏餐廳
                    const remainingCards = document.querySelectorAll('.restaurant-card');
                    if (remainingCards.length === 0) {
                        const storesContainer = document.querySelector('.favorites-stores');
                        if (storesContainer) {
                            storesContainer.innerHTML = '<div class="no-data">還沒有收藏的餐廳</div>';
                            console.log('沒有剩餘的餐廳卡片');
                        }
                    }
        } else {
                    console.error(`移除收藏失敗: ${name} (ID: ${id})`);
                    showToast(`移除收藏失敗，請稍後再試`);
                }
            }).catch(error => {
                console.error(`移除收藏出錯: ${error}`);
                showToast(`移除收藏時發生錯誤，請稍後再試`);
            });
        } else {
            console.error('收藏系統未初始化，無法移除收藏');
            showToast('收藏系統未初始化，無法移除收藏');
            
            // 嘗試初始化收藏系統
            if (window.favoriteSystem) {
                window.favoriteSystem.initialize().then(() => {
                    console.log('收藏系統初始化完成，重新嘗試移除收藏');
                    window.favoriteSystem.removeStore(id);
                    showToast(`已取消收藏 ${name || '這家店'}`);
                    
                    // 立即從頁面中移除卡片
                    const card = document.querySelector(`.restaurant-card[data-place-id="${id}"]`);
                    if (card) {
                        card.remove();
                        console.log('已從頁面中移除卡片');
                    }
                }).catch(error => {
                    console.error('收藏系統初始化失敗:', error);
                });
            }
        }
    } else {
        console.log(`用戶取消移除收藏: ${name}`);
    }
}

// 顯示 Toast 提示訊息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 顯示 toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // 3秒後移除 toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 查看店家詳情 - 改為顯示彈窗
function viewRestaurant(placeId) {
    console.log(`顯示餐廳詳情彈窗: ${placeId}`);
    
    // 從 localStorage 獲取收藏數據
    let restaurant = null;
    const storedFavorites = localStorage.getItem('favoriteStores');
    if (storedFavorites) {
        try {
            const favorites = JSON.parse(storedFavorites);
            if (Array.isArray(favorites)) {
                restaurant = favorites.find(r => r.id === placeId || r.place_id === placeId);
            }
        } catch (error) {
            console.error('解析收藏數據失敗:', error);
        }
    }
    
    // 使用全局函數顯示彈窗
    if (typeof window.showRestaurantDetail === 'function') {
        if (restaurant) {
            window.showRestaurantDetail(restaurant);
        } else {
            window.showRestaurantDetail({id: placeId, place_id: placeId});
        }
        return;
    }
    
    // 如果全局函數不存在，顯示錯誤提示
    console.error('全局 showRestaurantDetail 函數不存在');
    showToast('無法顯示餐廳詳情，請稍後再試');
}

// 顯示餐廳詳情彈窗 - 完全交由全局函數處理
function showRestaurantModal(placeId) {
    console.log(`顯示餐廳詳情彈窗: ${placeId}`);
    
    // 從 localStorage 獲取收藏數據
    let restaurant = null;
    const storedFavorites = localStorage.getItem('favoriteStores');
    if (storedFavorites) {
        try {
            const favorites = JSON.parse(storedFavorites);
            if (Array.isArray(favorites)) {
                restaurant = favorites.find(r => r.id === placeId || r.place_id === placeId);
            }
        } catch (error) {
            console.error('解析收藏數據失敗:', error);
        }
    }
    
    if (!restaurant) {
        console.error(`找不到餐廳數據: ${placeId}`);
        showToast('無法顯示餐廳詳情，請稍後再試');
        return;
    }
    
    // 使用全局函數顯示彈窗
    if (typeof window.showRestaurantDetail === 'function') {
        console.log('使用全局 showRestaurantDetail 函數顯示彈窗');
        window.showRestaurantDetail(restaurant);
        return;
    }
    
    // 如果全局函數不存在，顯示錯誤提示
    console.error('全局 showRestaurantDetail 函數不存在');
    showToast('無法顯示餐廳詳情，請稍後再試');
}

// 從 API 獲取餐廳詳情
async function fetchRestaurantDetails(placeId) {
    // 這裡可以添加從 API 獲取餐廳詳情的代碼
    console.log(`從 API 獲取餐廳詳情: ${placeId}`);
    
    // 從 localStorage 獲取收藏數據
    const storedFavorites = localStorage.getItem('favoriteStores');
    if (storedFavorites) {
        try {
            const favorites = JSON.parse(storedFavorites);
            if (Array.isArray(favorites)) {
                // 查找對應的餐廳
                const restaurant = favorites.find(r => r.id === placeId || r.place_id === placeId);
                if (restaurant) {
                    console.log(`從收藏中找到餐廳: ${restaurant.name}`);
                    return restaurant;
                }
            }
        } catch (error) {
            console.error('解析收藏數據失敗:', error);
        }
    }
    
    // 如果沒有找到餐廳，返回基本數據結構
    console.log('沒有找到餐廳，返回空數據');
    return {
        id: placeId,
        place_id: placeId,
        name: '未知餐廳',
        address: '地址未知',
        photos: 'images/default-restaurant.jpg',
        rating: 0,
        user_ratings_total: 0,
        vicinity: '地址未知',
        types: [],
        isFavorite: false
    };
}

// 查看心得詳情
function viewReviewDetail(reviewId) {
    // 跳轉到心得詳情頁面
    window.location.href = `foodReviewList.html?review_id=${reviewId}`;
}

// 收藏心得功能
function addToFavoriteReviews(review) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入會員');
        return;
    }

    let favoriteReviews = getFavoriteReviews();
    const exists = favoriteReviews.some(fav => fav.id === review.id);
    
    if (exists) {
        alert('此心得已在收藏清單中');
        return;
    }
    
    favoriteReviews.unshift(review); // 添加到最前面
    localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
    alert(`已收藏 ${review.storeName} 的心得`);
}

// 修改 switchFavoritesTab 函式
function switchFavoritesTab(tab) {
    console.log("切換收藏頁籤：", tab);
    
    // 移除所有標籤按鈕的 active 類別
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 添加 active 類別到選中的標籤按鈕
    const targetTabBtn = document.querySelector(`.favorites-tabs .tab-btn[data-tab="${tab}"]`);
    if (targetTabBtn) {
        targetTabBtn.classList.add('active');
    }

    // 載入對應的內容
    if (tab === 'stores') {
        document.querySelector('.favorites-stores').style.display = 'block';
        document.querySelector('.favorites-reviews').style.display = 'none';
    } else {
        document.querySelector('.favorites-stores').style.display = 'none';
        document.querySelector('.favorites-reviews').style.display = 'block';
    }
}

// 更新設定
function updateSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const settings = {
        notifications: {
            order: document.getElementById('orderNotifications').checked,
            promotion: document.getElementById('promotionNotifications').checked,
            system: document.getElementById('systemNotifications').checked
        },
        privacy: {
            showProfile: document.getElementById('showProfile').checked,
            showReviews: document.getElementById('showReviews').checked
        }
    };

    // 更新密碼
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (currentPassword && newPassword && confirmPassword) {
        // 這裡需要更安全的密碼處理方式，目前僅做簡單判斷
        if (user.password && currentPassword !== user.password) {
             alert('目前密碼不正確');
             return;
         }
        if (newPassword !== confirmPassword) {
            alert('新密碼與確認密碼不符');
            return;
        }
        // 這裡將新密碼保存到 user 對象中，以便更新 localStorage
         user.password = newPassword;
    }

    user.settings = settings;
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('設定已更新');
}

// 輔助函數
function getStatusText(status) {
    const statusMap = {
        'pending': '待處理',
        'preparing': '準備中',
        'ready': '待取餐',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function getNotificationTypeText(type) {
    const typeMap = {
        'order': '訂單',
        'system': '系統',
        'promotion': '優惠'
    };
    return typeMap[type] || type;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // 1分鐘內
        return '剛剛';
    } else if (diff < 3600000) { // 1小時內
        return `${Math.floor(diff / 60000)}分鐘前`;
    } else if (diff < 86400000) { // 1天內
        return `${Math.floor(diff / 3600000)}小時前`;
    } else {
        return date.toLocaleDateString();
    }
}

// 檢查登入狀態
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('登入狀態檢查:', isLoggedIn);
    
    if (!isLoggedIn) {
        // 如果未登入，重定向到首頁
        console.log('用戶未登入，將重定向到首頁');
        // 注意：開發測試階段暫時不重定向
        // window.location.href = 'index.html';
        return false;
    }
    return true;
}

// 登出功能已移至 login.js 統一管理

// 初始化選單
function initMenu() {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // 移除所有選單項目的 active 類別
            menuItems.forEach(mi => mi.classList.remove('active'));

            // 添加當前選單項目的 active 類別
            item.classList.add('active');

            // 隱藏所有內容區塊
            contentSections.forEach(section => section.classList.remove('active'));

            // 顯示對應的內容區塊
            const targetSectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 如果切換到收藏區塊，載入收藏內容
                if (targetSectionId === 'favorites') {
                    // 檢查當前活躍的標籤
                    const activeTab = document.querySelector('.favorites-tabs .tab-btn.active')?.getAttribute('data-tab') || 'stores';
                    loadFavorites(activeTab);
                }
            }
        });
    });
}

// 初始化表單
function initForms() {
    // 個人資料表單
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 這裡添加更新個人資料的邏輯
            alert('個人資料已更新');
        });
    }

    // 設定表單
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 這裡添加更新設定的邏輯
            alert('設定已更新');
        });
    }
}

// 初始化篩選功能
function initFilters() {
    // 訂單狀態篩選
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', () => {
            loadOrders(orderStatus.value);
        });
    }

    // 評論評分篩選
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) {
        reviewRating.addEventListener('change', () => {
            loadReviews(reviewRating.value);
        });
    }

    // 通知類型篩選
    const notificationFilters = document.querySelectorAll('#notifications .filter-btn');
    notificationFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            notificationFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadNotifications(btn.getAttribute('data-type'));
        });
    });

    // 收藏標籤切換
    const tabButtons = document.querySelectorAll('.favorites-tabs .tab-btn'); // 確保選擇器正確
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchFavoritesTab(tab);
        });
    });
}

// 載入使用者資料
function loadUserData() {
    const userEmail = localStorage.getItem('userEmail');
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { email: userEmail };

    if (userEmail) {
        // 更新使用者資訊顯示
        document.querySelector('.user-email').textContent = userEmail;
        document.querySelector('.user-name').textContent = currentUser.name || userEmail.split('@')[0];

        // 更新個人資料表單
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.querySelector('#email').value = userEmail;
            profileForm.querySelector('#name').value = currentUser.name || '';
            profileForm.querySelector('#phone').value = currentUser.phone || '';
            profileForm.querySelector('#address').value = currentUser.address || '';
        }

        // 在這裡載入設定（如果 localStorage 中有保存的話）
        if (currentUser.settings) {
            document.getElementById('orderNotifications').checked = currentUser.settings.notifications.order;
            document.getElementById('promotionNotifications').checked = currentUser.settings.notifications.promotion;
            document.getElementById('systemNotifications').checked = currentUser.settings.notifications.system;
            document.getElementById('showProfile').checked = currentUser.settings.privacy.showProfile;
            document.getElementById('showReviews').checked = currentUser.settings.privacy.showReviews;
        }

    } else {
        // 如果沒有登入郵箱，可能需要重定向或顯示錯誤
        console.error('User email not found in localStorage.');
        // 或者可以顯示預設值或空白
        document.querySelector('.user-email').textContent = 'N/A';
        document.querySelector('.user-name').textContent = '訪客';
         const profileForm = document.getElementById('profileForm');
         if (profileForm) {
             profileForm.querySelector('#email').value = '';
             profileForm.querySelector('#name').value = '';
             profileForm.querySelector('#phone').value = '';
             profileForm.querySelector('#address').value = '';
         }
    }
}

// 編輯評論
function editReview(reviewId) {
    const review = mockReviews.find(r => r.id === reviewId);
    
    if (!review) return;

    // 填充表單
    document.getElementById('editStoreName').value = review.storeName;
    document.getElementById('editTitle').value = review.title;
    document.getElementById('editContent').value = review.content;
    
    // 設置評分
    const stars = document.querySelectorAll('.rating .star');
    stars.forEach(star => {
        const rating = parseInt(star.dataset.rating);
        star.classList.toggle('active', rating <= review.rating);
    });

    // 設置標籤
    const tagsList = document.getElementById('editTagsList');
    tagsList.innerHTML = review.tags.map(tag => `
        <span class="tag">
            ${tag}
            <span class="remove-tag" onclick="removeTag(this)">&times;</span>
        </span>
    `).join('');

    // 顯示彈窗
    document.getElementById('editReviewModal').style.display = 'block';

    // 設置表單提交事件
    const form = document.getElementById('editReviewForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveReviewEdit(reviewId);
    };
}

// 儲存評論編輯
function saveReviewEdit(reviewId) {
    const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) return;

    // 獲取表單數據
    const storeName = document.getElementById('editStoreName').value;
    const title = document.getElementById('editTitle').value;
    const content = document.getElementById('editContent').value;
    const rating = document.querySelectorAll('.rating .star.active').length;
    const tags = Array.from(document.querySelectorAll('#editTagsList .tag'))
        .map(tag => tag.textContent.trim());

    // 更新評論
    mockReviews[reviewIndex] = {
        ...mockReviews[reviewIndex],
        storeName,
        title,
        content,
        rating,
        tags,
        updateTime: new Date().toISOString()
    };
    
    // 關閉彈窗並重新載入評論
    closeEditModal();
    loadReviews();
    
    // 顯示成功訊息
    alert('評論已成功更新！');
}

// 刪除評論
function deleteReview(reviewId) {
    if (!confirm('確定要刪除這則評論嗎？')) return;

    const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) return;

    // 從假資料中移除評論
    mockReviews.splice(reviewIndex, 1);
    
    // 重新載入評論列表
    loadReviews();
    
    // 顯示成功訊息
    alert('評論已成功刪除！');
}

// 關閉編輯彈窗
function closeEditModal() {
    document.getElementById('editReviewModal').style.display = 'none';
}

// 移除標籤
function removeTag(element) {
    element.parentElement.remove();
}

// 添加標籤
document.getElementById('editTagInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tag = this.value.trim();
        if (tag) {
            const tagsList = document.getElementById('editTagsList');
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" onclick="removeTag(this)">&times;</span>
            `;
            tagsList.appendChild(tagElement);
            this.value = '';
        }
    }
});

// 初始化評分星星
document.querySelectorAll('.rating .star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        const stars = this.parentElement.querySelectorAll('.star');
        stars.forEach(s => {
            const r = parseInt(s.dataset.rating);
            s.classList.toggle('active', r <= rating);
        });
    });
});

// 關閉按鈕事件
document.querySelector('.close')?.addEventListener('click', closeEditModal);

// 點擊彈窗外部關閉
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editReviewModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Google Maps API 載入完成後的 callback 函式 (不再使用，但保留結構以防萬一)
// let placesService;
// function initPage() {
//     // ... existing code ...
// }

// 當 DOM 載入完成時初始化頁面
document.addEventListener('DOMContentLoaded', initializePage);

// 初始化頁面
function initializePage() {
    console.log('初始化會員中心頁面');

    // 強制設置登入狀態（僅用於開發測試）
    localStorage.setItem('isLoggedIn', 'true');
    console.log('已強制設置登入狀態為 true（開發測試用）');

    // 創建模擬的 favoriteSystem 物件
    if (!window.favoriteSystem) {
        console.log('創建模擬的 favoriteSystem 物件');
        window.favoriteSystem = {
            initialized: true,
            stores: [],
            reviews: [],
            getFavoriteStores: function() {
                return this.stores;
            },
            getFavoriteReviews: function() {
                return this.reviews;
            },
            initialize: function() {
                this.initialized = true;
                return Promise.resolve(true);
            },
            removeStore: function(id) {
                this.stores = this.stores.filter(store => store.id !== id && store.place_id !== id);
                return Promise.resolve(true);
            }
        };
    }
    
    // 確保收藏頁籤顯示正確
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchFavoritesTab(tab);
        });
    });

    // 載入用戶資料
    loadUserData();
    
    // 初始化側邊欄選單
    initializeSidebar();

    // 設置事件監聽器
    setupEventListeners();
    
    // 處理 URL hash
    handleURLHash();
    
    // 載入初始數據
    loadOrders();
    loadReviews();
    loadNotifications();
}

// 添加測試數據（僅用於開發測試）
function addTestData() {
    console.log('添加測試收藏數據');
    
    // 測試餐廳數據
    const testRestaurants = [
        {
            id: 'test-restaurant-1',
            place_id: 'test-restaurant-1',
            name: '陶板屋（大里德芳南店）',
            address: '台中市大里區德芳南路436號',
            photos: 'images/restaurants/restaurant1.jpg',
            rating: 4.5,
            user_ratings_total: 120,
            vicinity: '台中市大里區德芳南路436號',
            types: ['日式料理', '連鎖餐廳', '平價'],
            isFavorite: true
        },
        {
            id: 'test-restaurant-2',
            place_id: 'test-restaurant-2',
            name: '弗卡夏手作義式料理-全台玻璃口味最多/可線上預約',
            address: '台中市南屯區大墩十一街396號',
            photos: 'images/restaurants/restaurant2.jpg',
            rating: 4.2,
            user_ratings_total: 85,
            vicinity: '台中市南屯區大墩十一街396號',
            types: ['義式料理', '手工披薩', '義大利麵'],
            isFavorite: true
        },
        {
            id: 'test-restaurant-3',
            place_id: 'test-restaurant-3',
            name: '品心港式飲茶 大里店',
            address: '台中市大里區德芳南路436號',
            photos: 'images/restaurants/restaurant3.jpg',
            rating: 4.8,
            user_ratings_total: 210,
            vicinity: '台中市大里區德芳南路436號',
            types: ['港式料理', '點心', '飲茶'],
            isFavorite: true
        }
    ];
    
    // 將測試數據添加到收藏系統
    if (window.favoriteSystem) {
        window.favoriteSystem.stores = testRestaurants;
        
        // 保存到 localStorage
        localStorage.setItem('favoriteStores', JSON.stringify(testRestaurants));
        console.log('測試數據已添加到收藏系統');
    }
}

// 處理 URL hash
function handleURLHash() {
    // 獲取 URL hash
    let hash = window.location.hash;
    
    // 如果沒有 hash，則顯示個人資料區塊
    if (!hash) {
        hash = '#profile';
    }
    
    // 移除 # 符號
    const sectionId = hash.substring(1);
    
    // 檢查區塊是否存在
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) {
        // 如果區塊不存在，則顯示個人資料區塊
        switchSection('profile');
        return;
    }
    
    // 切換到對應的區塊
    switchSection(sectionId);
}

// 初始化圖表 (保留原有的假圖表)
function initializeCharts() {
    // 這裡可以添加圖表初始化邏輯
    // 目前只是佔位符
    console.log('圖表初始化完成');
}

// 設置事件監聽器
function setupEventListeners() {
    // 監聽選單點擊事件
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // 更新 URL hash
            window.location.hash = section;
            
            // 切換到對應的區塊
            switchSection(section);
        });
    });
    
    // 監聽收藏頁籤切換
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            console.log('切換收藏頁籤:', tab);
            switchFavoritesTab(tab);
        });
    });
    
    // 監聽個人資料表單提交
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // 監聽帳號設定表單提交
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateSettings();
        });
    }
    
    // 監聽訂單狀態篩選
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }
    
    // 監聽評論評分篩選
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) {
        reviewRating.addEventListener('change', function() {
            loadReviews(this.value);
        });
    }
    
    // 監聽通知類型篩選
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            filterNotifications(type);
        });
    });
}

// 切換區塊
function switchSection(sectionId) {
    console.log(`切換到區塊: ${sectionId}`);
    
    // 移除所有區塊的 active 類別
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 移除所有選單項目的 active 類別
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // 添加 active 類別到選中的區塊
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // 如果切換到收藏區塊，更新收藏列表
        if (sectionId === 'favorites') {
            console.log('切換到收藏區塊，載入收藏列表');
            const activeTab = document.querySelector('.favorites-tabs .tab-btn.active')?.getAttribute('data-tab') || 'stores';
            loadFavorites(activeTab);
            
            // 確保收藏頁籤按鈕事件綁定
            document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tab = this.getAttribute('data-tab');
                    switchFavoritesTab(tab);
                });
            });
        } else if (sectionId === 'orders') {
            loadOrders();
        } else if (sectionId === 'reviews') {
            loadReviews();
        } else if (sectionId === 'notifications') {
            loadNotifications();
        }
    }
    
    // 添加 active 類別到選中的選單項目
    const targetMenuItem = document.querySelector(`.menu-item[data-section="${sectionId}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
}

// 初始化收藏功能
function initializeFavorites() {
    // 初始化收藏頁籤切換
    const tabBtns = document.querySelectorAll('.favorites-tabs .tab-btn');
    const favoritesStores = document.querySelector('.favorites-stores');
    const favoritesReviews = document.querySelector('.favorites-reviews');
    
    if (!tabBtns.length || !favoritesStores || !favoritesReviews) {
        console.warn('找不到收藏相關元素');
        return;
    }
    
    // 確保收藏系統已初始化
    if (!window.favoriteSystem || !window.favoriteSystem.initialized) {
        console.log('初始化收藏系統');
        if (window.favoriteSystem) {
            window.favoriteSystem.initialize().then(() => {
                console.log('收藏系統初始化完成，載入收藏列表');
                loadFavorites('stores');
            }).catch(error => {
                console.error('收藏系統初始化失敗:', error);
                favoritesStores.innerHTML = '<div class="error-message">收藏系統初始化失敗，請重新整理頁面</div>';
            });
        } else {
            console.error('收藏系統不存在');
            favoritesStores.innerHTML = '<div class="error-message">收藏系統未正確載入，請重新整理頁面</div>';
            return;
        }
    } else {
        // 如果收藏系統已初始化，直接載入收藏列表
        loadFavorites('stores');
    }
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            console.log("切換收藏頁籤：", tab);
            
            // 更新按鈕狀態
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新內容顯示
            loadFavorites(tab);
        });
    });
}

// 載入訂單
function loadOrders(statusFilter = 'all') {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    let filteredOrders = mockOrders;
    if (statusFilter !== 'all') {
        filteredOrders = mockOrders.filter(order => order.status === statusFilter);
    }

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<div class="no-data">沒有找到相關訂單</div>';
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>${order.storeName}</h4>
                <span class="order-status">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <p><strong>訂單編號:</strong> ${order.id}</p>
                <p><strong>訂購時間:</strong> ${new Date(order.orderTime).toLocaleString()}</p>
                <p><strong>訂購項目:</strong> ${order.items.join(', ')}</p>
                <p><strong>總金額:</strong> $${order.totalAmount}</p>
            </div>
        </div>
    `).join('');
}

// 載入評論
function loadReviews(ratingFilter = 'all') {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    let filteredReviews = mockReviews;
    if (ratingFilter !== 'all') {
        filteredReviews = mockReviews.filter(review => review.rating >= parseInt(ratingFilter));
    }

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-data">沒有找到相關評論</div>';
        return;
    }

    reviewsList.innerHTML = filteredReviews.map(review => `
        <div class="review-item">
            <div class="review-actions">
                <button onclick="editReview(${review.id})" title="編輯評論">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteReview(${review.id})" title="刪除評論" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="review-header">
                <h4>${review.title}</h4>
                <div class="review-rating">${'★'.repeat(review.rating)}</div>
            </div>
            <div class="review-details">
                <p><strong>店家:</strong> ${review.storeName}</p>
                <p><strong>評論時間:</strong> ${new Date(review.time).toLocaleString()}</p>
                <p><strong>內容:</strong> ${review.content}</p>
                <div class="review-tags">
                    ${review.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 載入通知
function loadNotifications(typeFilter = 'all') {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;

    let filteredNotifications = mockNotifications;
    if (typeFilter !== 'all') {
        filteredNotifications = mockNotifications.filter(notification => notification.type === typeFilter);
    }

    if (filteredNotifications.length === 0) {
        notificationsList.innerHTML = '<div class="no-data">沒有找到相關通知</div>';
        return;
    }

    notificationsList.innerHTML = filteredNotifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}">
            <div class="notification-header">
                <span class="notification-type">${getNotificationTypeText(notification.type)}</span>
                <span class="notification-time">${formatTime(notification.time)}</span>
            </div>
            <div class="notification-content">
                ${notification.content}
            </div>
            ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
        </div>
    `).join('');
}

// 篩選通知
function filterNotifications(type) {
    // 更新篩選按鈕狀態
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#notifications .filter-btn[data-type="${type}"]`).classList.add('active');
    
    // 載入篩選後的通知
    loadNotifications(type);
}

// 更新個人資料
function updateProfile() {
    const formData = new FormData(document.getElementById('profileForm'));
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    // 更新 localStorage
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    Object.assign(currentUser, userData);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 更新顯示
    document.querySelector('.user-name').textContent = userData.name || userData.email.split('@')[0];

    alert('個人資料已更新');
}

// 初始化側邊欄選單
function initializeSidebar() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 獲取要顯示的區塊 ID
            const sectionId = this.getAttribute('data-section');
            
            // 更新 URL hash
            window.location.hash = sectionId;
            
            // 切換到對應的區塊
            switchSection(sectionId);
        });
    });
}

// 更新收藏列表（直接用 favorites 資料，不用 Google API）
function updateFavoritesList() {
    const favoritesStores = document.querySelector('.favorites-stores');
    if (!favoritesStores) return;
    
    // 使用新的收藏系統獲取收藏列表
    const favorites = window.favoriteSystem ? 
        window.favoriteSystem.getFavorites() : 
        JSON.parse(localStorage.getItem('favorites') || '[]');
        
    if (!favorites || favorites.length === 0) {
        favoritesStores.innerHTML = '<div class="no-favorites">還沒有收藏的餐廳</div>';
        return;
    }
    
    console.log('收藏的餐廳資料:', favorites);
    
    // 使用固定的圖片URL
    const restaurantImages = [
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&w=600',
        'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3&w=600',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&w=600',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&w=600',
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?ixlib=rb-4.0.3&w=600'
    ];
    
    // 生成HTML
    let html = '';
    favorites.forEach((restaurant, idx) => {
        const photoUrl = restaurantImages[idx % restaurantImages.length];
        
        // 簡化的營業時間處理
        let isOpen = false;
        if (restaurant.opening_hours && restaurant.opening_hours.open_now) {
            isOpen = restaurant.opening_hours.open_now;
        }
        
        html += `
        <div class="restaurant-card" data-id="${restaurant.id}">
            <div class="restaurant-image-wrapper">
                <img src="${photoUrl}" alt="${restaurant.name}" class="restaurant-image">
            </div>
            <div class="restaurant-info">
                <div class="restaurant-title-row">
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <button class="favorite-btn active" onclick="removeFavorite('${restaurant.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="restaurant-rating-row">
                    <span class="rating-stars">${generateStars(restaurant.rating || 0)}</span>
                    <span class="rating-score">${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
                    <span class="rating-count">(${restaurant.user_ratings_total || 0}則評論)</span>
                </div>
                <div class="restaurant-address-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="address-text">${restaurant.address || ''}</span>
                </div>
                ${restaurant.types && restaurant.types.length > 0 ? `
                    <div class="restaurant-tags-row">
                        ${restaurant.types.slice(0, 3).map(type => `<span class="tag">${type}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="restaurant-status-row">
                    <span class="status-dot ${isOpen ? 'open' : 'closed'}"></span>
                    <span class="status-text ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
                </div>
            </div>
        </div>`;
    });
    
    // 一次性更新 DOM，避免閃爍
    favoritesStores.innerHTML = html;
    
    // 綁定卡片點擊事件
    const cards = favoritesStores.querySelectorAll('.restaurant-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.favorite-btn')) return;
            
            const id = this.getAttribute('data-id');
            window.location.href = `restaurant.html?place_id=${id}`;
        });
    });
}

// 更新收藏心得列表
function updateFavoriteReviews() {
    const reviewsContainer = document.querySelector('.favorites-reviews');
    if (!reviewsContainer) return;
    
    const favoriteReviews = getFavoriteReviews();
    if (!favoriteReviews || favoriteReviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="no-favorites">還沒有收藏任何心得</div>';
        return;
    }
    
    reviewsContainer.innerHTML = favoriteReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <img src="https://via.placeholder.com/50" alt="${review.author || review.reviewerName || '匿名'}" class="reviewer-avatar">
                <div>
                    <div class="reviewer-name">${review.author || review.reviewerName || '匿名'}</div>
                    <div class="store-name">${review.storeName}</div>
                </div>
                <button class="favorite-btn" onclick="removeFavoriteReview(${review.id})">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="review-content">${review.content}</div>
            <div class="review-footer">
                <div class="review-rating">${'★'.repeat(review.rating)}</div>
                <div class="review-date">${review.date || new Date(review.time || Date.now()).toLocaleDateString()}</div>
            </div>
        </div>
    `).join('');
}

// 生成星級評分（與 main.js 中保持一致）
function generateStars(rating) {
    if (rating === undefined || rating === null) {
        return '☆☆☆☆☆';
    }
    
    // 確保 rating 是數字
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) {
        return '☆☆☆☆☆';
    }
    
    // 計算星星
    const fullStars = Math.floor(numRating);
    const halfStar = numRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let result = '';
    
    // 添加實心星星
    for (let i = 0; i < fullStars; i++) {
        result += '★';
    }
    
    // 添加半星
    if (halfStar) {
        result += '★';
    }
    
    // 添加空心星星
    for (let i = 0; i < emptyStars; i++) {
        result += '☆';
    }
    
    return result;
}

// 用戶中心頁面處理
class UserCenter {
    constructor() {
        this.initialized = false;
        this.currentSection = 'profile';
    }

    // 初始化用戶中心
    async initialize() {
        try {
            console.log('開始初始化用戶中心');
            
            // 檢查登入狀態
            if (!this.checkLoginStatus()) {
                console.log('用戶未登入，將重定向到登入頁面');
                // 注意：開發測試階段暫時不重定向
                // window.location.href = 'userLogin.html';
                // 強制設置登入狀態（僅用於開發測試）
                localStorage.setItem('isLoggedIn', 'true');
                console.log('已強制設置登入狀態為 true（開發測試用）');
            }

            try {
                // 初始化各個模組
                await this.initializeModules();
            } catch (moduleError) {
                console.error('模組初始化失敗:', moduleError);
                console.log('繼續初始化其他部分');
            }
            
            // 初始化事件監聽
            this.initializeEventListeners();
            
            try {
                // 載入用戶資料
                await this.loadUserData();
            } catch (dataError) {
                console.error('用戶資料載入失敗:', dataError);
                console.log('使用預設用戶資料');
            }

            this.initialized = true;
            console.log('用戶中心初始化成功');
            return true;
        } catch (error) {
            console.error('用戶中心初始化失敗:', error);
            // 不拋出錯誤，確保頁面仍然可以載入
            console.log('繼續載入頁面，使用靜態數據');
            this.initialized = true; // 強制設置為已初始化
            return true;
        }
    }

    // 檢查登入狀態
    checkLoginStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // 初始化各個模組
    async initializeModules() {
        try {
            // 確保有模擬的收藏系統
            if (!window.favoriteSystem) {
                console.log('創建模擬的 favoriteSystem 物件');
                window.favoriteSystem = {
                    initialized: true,
                    stores: [],
                    reviews: [],
                    getFavoriteStores: function() {
                        return this.stores;
                    },
                    getFavoriteReviews: function() {
                        return this.reviews;
                    },
                    initialize: function() {
                        this.initialized = true;
                        return Promise.resolve(true);
                    },
                    removeStore: function(id) {
                        this.stores = this.stores.filter(store => store.id !== id && store.place_id !== id);
                        return Promise.resolve(true);
                    }
                };
            }
            
            // 初始化收藏系統
            if (window.favoriteSystem) {
                if (!window.favoriteSystem.initialized) {
                    await window.favoriteSystem.initialize();
                }
            }
            
            // 初始化收藏UI
            if (window.favoriteUI) {
                if (typeof window.favoriteUI.initialize === 'function') {
                    await window.favoriteUI.initialize();
                }
            }
            
            // 初始化收藏按鈕
            if (window.favoriteButton) {
                if (typeof window.favoriteButton.initialize === 'function') {
                    await window.favoriteButton.initialize();
                }
            }
        } catch (error) {
            console.error('初始化模組失敗:', error);
            // 不拋出錯誤，確保頁面仍然可以載入
            console.log('繼續載入頁面，使用靜態數據');
        }
    }

    // 初始化事件監聽
    initializeEventListeners() {
        // 側邊欄導航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.currentTarget.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // 頭像上傳
        const avatarUpload = document.getElementById('avatarUpload');
        if (avatarUpload) {
            avatarUpload.addEventListener('change', (e) => {
                this.handleAvatarUpload(e);
            });
        }

        // 個人資料表單
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // 帳號設定表單
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updatePassword();
            });
        }

        // 登出按鈕
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // 切換內容區塊
    switchSection(section) {
        // 更新當前區塊
        this.currentSection = section;

        // 更新導航項目狀態
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === section);
        });

        // 更新內容區塊顯示
        document.querySelectorAll('.content-section').forEach(content => {
            content.classList.toggle('active', content.id === section);
        });

        // 如果切換到收藏區塊，重新載入收藏內容
        if (section === 'favorites' && window.favoriteUI) {
            window.favoriteUI.loadContent();
        }
    }

    // 載入用戶資料
    async loadUserData() {
        try {
            // 從 localStorage 獲取用戶資料
            const userData = JSON.parse(localStorage.getItem('userData')) || {};

            // 填充表單
            document.getElementById('username')?.setAttribute('value', userData.username || '');
            document.getElementById('email')?.setAttribute('value', userData.email || '');
            document.getElementById('phone')?.setAttribute('value', userData.phone || '');
            document.getElementById('address')?.setAttribute('value', userData.address || '');

            // 設置頭像
            const userAvatar = document.getElementById('userAvatar');
            if (userAvatar) {
                userAvatar.src = userData.avatar || 'images/default-avatar.jpg';
            }
        } catch (error) {
            console.error('載入用戶資料失敗:', error);
            throw error;
        }
    }

    // 處理頭像上傳
    async handleAvatarUpload(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;

            // 檢查文件類型
            if (!file.type.startsWith('image/')) {
                alert('請上傳圖片文件');
                return;
            }

            // 檢查文件大小（限制為 2MB）
            if (file.size > 2 * 1024 * 1024) {
                alert('圖片大小不能超過 2MB');
                return;
            }

            // 讀取文件並顯示預覽
            const reader = new FileReader();
            reader.onload = (e) => {
                const userAvatar = document.getElementById('userAvatar');
                if (userAvatar) {
                    userAvatar.src = e.target.result;
                }

                // 更新用戶資料
                const userData = JSON.parse(localStorage.getItem('userData')) || {};
                userData.avatar = e.target.result;
                localStorage.setItem('userData', JSON.stringify(userData));
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('上傳頭像失敗:', error);
            alert('上傳頭像失敗，請稍後再試');
        }
    }

    // 更新個人資料
    async updateProfile() {
        try {
            const formData = {
                username: document.getElementById('username')?.value,
                email: document.getElementById('email')?.value,
                phone: document.getElementById('phone')?.value,
                address: document.getElementById('address')?.value
            };

            // 驗證必填欄位
            if (!formData.username || !formData.email) {
                alert('請填寫必填欄位');
                return;
            }

            // 更新用戶資料
            const userData = JSON.parse(localStorage.getItem('userData')) || {};
            Object.assign(userData, formData);
            localStorage.setItem('userData', JSON.stringify(userData));

            alert('個人資料更新成功');
        } catch (error) {
            console.error('更新個人資料失敗:', error);
            alert('更新失敗，請稍後再試');
        }
    }

    // 更新密碼
    async updatePassword() {
        try {
            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;

            // 驗證密碼
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('請填寫所有密碼欄位');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('新密碼與確認密碼不符');
                return;
            }

            if (newPassword.length < 8) {
                alert('新密碼長度不能少於 8 個字符');
                return;
            }

            // 更新密碼
            const userData = JSON.parse(localStorage.getItem('userData')) || {};
            userData.password = newPassword;
            localStorage.setItem('userData', JSON.stringify(userData));

            // 清空表單
            document.getElementById('settingsForm')?.reset();

            alert('密碼更新成功');
        } catch (error) {
            console.error('更新密碼失敗:', error);
            alert('更新失敗，請稍後再試');
        }
    }

    // 登出
    logout() {
        try {
            // 清除登入狀態
            localStorage.removeItem('isLoggedIn');
            // 跳轉到登入頁面
            window.location.href = 'userLogin.html';
        } catch (error) {
            console.error('登出失敗:', error);
            alert('登出失敗，請稍後再試');
        }
    }
}

// 創建實例並初始化
const userCenter = new UserCenter();
document.addEventListener('DOMContentLoaded', () => {
    userCenter.initialize().catch(error => {
        console.error('用戶中心初始化失敗:', error);
    });
});

// 添加收藏系統事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    // 監聽收藏系統變更事件
    document.addEventListener('favoritesChanged', () => {
        console.log('收藏系統變更，重新載入收藏列表');
        // 獲取當前活動的頁籤
        const activeTab = document.querySelector('.favorites-tabs .tab-btn.active');
        const tabType = activeTab ? activeTab.dataset.tab : 'stores';
        
        // 重新載入收藏列表
        loadFavorites(tabType);
    });
});

// 清除收藏數據並重新初始化（用於解決數據損壞問題）
function resetFavoriteSystem() {
    console.log('重置收藏系統');
    
    // 清除收藏相關的 localStorage 數據
    localStorage.removeItem('favoriteStores');
    localStorage.removeItem('favoriteReviews');
    
    // 如果收藏系統存在，重置並重新初始化
    if (window.favoriteSystem) {
        window.favoriteSystem.stores = [];
        window.favoriteSystem.reviews = [];
        window.favoriteSystem.initialized = false;
        
        // 重新初始化收藏系統
        window.favoriteSystem.initialize().then(() => {
            console.log('收藏系統重置並重新初始化成功');
            
            // 重新載入收藏列表
            const activeTab = document.querySelector('.favorites-tabs .tab-btn.active')?.getAttribute('data-tab') || 'stores';
            loadFavorites(activeTab);
        }).catch(error => {
            console.error('收藏系統重置後初始化失敗:', error);
        });
    } else {
        console.error('收藏系統不存在，無法重置');
    }
}

// 從 API 獲取收藏餐廳數據
async function fetchFavoriteRestaurants() {
    console.log('從 API 獲取收藏餐廳數據');
    
    // 這裡應該是實際的 API 調用
    // 例如：const response = await fetch('https://api.foodmap.example.com/favorites');
    // const data = await response.json();
    // return data;
    
    // 從 localStorage 獲取收藏數據
    const storedFavorites = localStorage.getItem('favoriteStores');
    if (storedFavorites) {
        try {
            const favorites = JSON.parse(storedFavorites);
            if (Array.isArray(favorites) && favorites.length > 0) {
                console.log(`從 localStorage 獲取到 ${favorites.length} 個收藏餐廳`);
                return favorites;
            }
        } catch (error) {
            console.error('解析收藏數據失敗:', error);
        }
    }
    
    // 如果沒有收藏數據，返回空數組
    console.log('沒有找到收藏數據，返回空數組');
    return [];
}