// API 基礎 URL 配置
const API_BASE_URL = 'http://localhost:8080/api';

// 移除臨時模擬登入資料
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
    
    // 如果收藏系統未初始化，從本地存儲中獲取
    console.log('收藏系統未初始化，嘗試從localStorage獲取數據');
    try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        return favorites;
    } catch (e) {
        console.error('解析localStorage收藏數據時出錯:', e);
        return [];
    }
}

function getFavoriteReviews() {
    // 使用新的收藏系統
    if (window.favoriteSystem && window.favoriteSystem.initialized) {
        return window.favoriteSystem.getFavoriteReviews();
    }
    
    // 如果收藏系統未初始化，從本地存儲中獲取
    console.log('收藏系統未初始化，嘗試從localStorage獲取評論數據');
    try {
        const favoriteReviews = JSON.parse(localStorage.getItem('favoriteReviews') || '[]');
        return favoriteReviews;
    } catch (e) {
        console.error('解析localStorage收藏評論數據時出錯:', e);
        return [];
    }
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

    if (type === 'stores') {
        // 顯示載入中狀態
        storesContainer.innerHTML = '<div class="loading">載入收藏店家中...</div>';
        
        try {
            // 只從 favoriteSystem 獲取收藏店家資料
            let favoriteStores = [];
            
            if (window.favoriteSystem && window.favoriteSystem.initialized) {
                favoriteStores = await window.favoriteSystem.getFavoriteStores();
                console.log('從 favoriteSystem 獲取的收藏資料:', favoriteStores);
            }
            
            if (!favoriteStores || favoriteStores.length === 0) {
                storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
            } else {
                await renderFavoriteStores(favoriteStores);
            }
        } catch (error) {
            console.error('載入收藏店家失敗:', error);
            storesContainer.innerHTML = '<div class="error">載入收藏店家失敗，請稍後再試</div>';
        }
    }
}

// 渲染收藏店家列表
async function renderFavoriteStores(stores) {
    console.log('渲染收藏店家列表:', stores);
    const storesContainer = document.querySelector('.favorites-stores');
    
    if (!storesContainer) {
        console.error('找不到收藏店家容器');
        return;
    }
    
    if (!stores || stores.length === 0) {
        storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        return;
    }
    
    // 只顯示有效的收藏店家
    const validStores = stores.filter(store => store && store.place_id && store.name);
    
    if (validStores.length === 0) {
        storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        return;
    }
    
    storesContainer.innerHTML = validStores.map(store => `
        <div class="restaurant-card" data-id="${store.place_id}">
            <div class="restaurant-info">
                <h3>${store.name}</h3>
                <div class="restaurant-actions">
                    <button class="btn-view" onclick="viewRestaurant('${store.place_id}')">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn-remove" onclick="removeFavorite('${store.place_id}')">
                        <i class="fas fa-trash"></i> 移除
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// 渲染收藏評論列表
function renderFavoriteReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏任何心得</div>';
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <img src="${review.avatar || review.userAvatar || 'images/default-avatar.jpg'}" alt="${review.author || review.reviewerName || review.userName || '匿名'}" class="reviewer-avatar" onerror="this.src='images/default-avatar.jpg'">
                <div>
                    <div class="reviewer-name">${review.author || review.reviewerName || review.userName || '匿名'}</div>
                    <div class="store-name">${review.storeName || review.restaurantName}</div>
                </div>
                <span class="favorite-tag">已收藏</span>
            </div>
            <div class="review-content">${review.content}</div>
            <div class="review-footer">
                <div class="review-rating">${'★'.repeat(review.rating)}</div>
                <div class="review-date">${review.date || new Date(review.time || review.createdAt || Date.now()).toLocaleDateString()}</div>
            </div>
            <div class="review-actions">
                <button onclick="viewReviewDetail(${review.id || review.reviewId})" class="btn-secondary">查看詳情</button>
                <button onclick="removeFavoriteReview(${review.id || review.reviewId})" class="btn-secondary">取消收藏</button>
            </div>
        </div>
    `).join('');
}

// 使用 Google Places API 獲取收藏店家的詳細資訊
async function getFavoriteStoresDetails(favorites) {
    return new Promise((resolve, reject) => {
        // 檢查 Google Maps API 是否可用
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.error('Google Maps API 未載入');
            reject(new Error('Google Maps API 未載入'));
            return;
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const favoriteStoresDetails = [];
        let completedRequests = 0;

        if (favorites.length === 0) {
            resolve([]);
            return;
        }

        favorites.forEach(favorite => {
            const request = {
                placeId: favorite.id,
                fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 'opening_hours', 'user_ratings_total', 'vicinity']
            };

            service.getDetails(request, (place, status) => {
                completedRequests++;
                
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    let imageUrl = '';
                    if (place.photos && place.photos[0] && place.photos[0].getUrl) {
                        imageUrl = place.photos[0].getUrl({maxWidth: 400});
                    }

                    const storeData = {
                        place_id: place.place_id,
                        name: place.name,
                        rating: place.rating,
                        address: place.formatted_address || place.vicinity,
                        isOpen: place.opening_hours?.isOpen?.() || place.opening_hours?.open_now,
                        image: imageUrl || 'images/no-image.jpg',
                        user_ratings_total: place.user_ratings_total,
                        location: place.geometry?.location
                    };
                    favoriteStoresDetails.push(storeData);
                } else {
                    console.warn(`無法獲取地點詳細資訊 (${favorite.id}):`, status);
                    // 使用基本資訊建立卡片
                    favoriteStoresDetails.push({
                        place_id: favorite.id,
                        name: favorite.name || '未知餐廳',
                        rating: undefined,
                        address: '無法獲取地址',
                        isOpen: undefined,
                        image: 'images/no-image.jpg',
                        user_ratings_total: 0
                    });
                }
                
                if (completedRequests === favorites.length) {
                    resolve(favoriteStoresDetails);
                }
            });
        });
    });
}

// 顯示登入彈窗，確保它在最上層
function showLoginModal() {
    // 顯示提示訊息
    alert('請先登入會員');
    
    // 強制關閉餐廳詳情彈窗（如果存在）
    const restaurantModal = document.getElementById('restaurantModal');
    if (restaurantModal) {
        restaurantModal.style.display = 'none';
    }
    
    // 顯示登入彈窗
    let loginModal;
    if (window.parent && window.parent.document.getElementById('loginModal')) {
        loginModal = window.parent.document.getElementById('loginModal');
    } else if (document.getElementById('loginModal')) {
        loginModal = document.getElementById('loginModal');
    }
    
    if (loginModal) {
        // 確保登入彈窗在最上層
        loginModal.style.zIndex = '3000';
        loginModal.style.display = 'block';
        
        // 將登入彈窗移到最前面
        document.body.appendChild(loginModal);
    }
}

// 移除收藏餐廳
function removeFavorite(id) {
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!id) {
        console.error('移除收藏失敗: 缺少餐廳 ID');
        showToast('無法移除收藏: 缺少餐廳 ID');
        return;
    }
    
    // 使用 favoriteSystem 或直接從 localStorage 移除收藏
    try {
        let success = false;
        
        // 優先使用 favoriteSystem
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            success = window.favoriteSystem.removeStore(id);
            console.log('使用 favoriteSystem 移除收藏:', success);
        } else {
            // 從 localStorage 移除
            try {
                let favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
                favorites = favorites.filter(storeId => storeId !== id);
                localStorage.setItem('favoriteStores', JSON.stringify(favorites));
                success = true;
                console.log('從 localStorage 移除收藏');
            } catch (e) {
                console.error('從 localStorage 移除收藏失敗:', e);
                success = false;
            }
        }
        
        if (success) {
            // 更新收藏列表顯示
            loadFavorites('stores');
            showToast('已從收藏中移除');
        } else {
            showToast('移除收藏失敗，請稍後再試');
        }
    } catch (error) {
        console.error('移除收藏失敗:', error);
        showToast(`移除收藏失敗: ${error.message}`);
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

// 移除收藏評論
function removeFavoriteReview(reviewId) {
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!reviewId) {
        console.error('移除收藏評論失敗: 缺少評論 ID');
        showToast('無法移除收藏評論: 缺少評論 ID');
        return;
    }
    
    // 使用 favoriteSystem 或直接從 localStorage 移除收藏評論
    try {
        let success = false;
        
        // 優先使用 favoriteSystem
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            success = window.favoriteSystem.removeReview(reviewId);
            console.log('使用 favoriteSystem 移除收藏評論:', success);
        } else {
            // 從 localStorage 移除
            try {
                let favoriteReviews = JSON.parse(localStorage.getItem('favoriteReviews') || '[]');
                favoriteReviews = favoriteReviews.filter(review => review.id !== reviewId);
                localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
                success = true;
                console.log('從 localStorage 移除收藏評論');
            } catch (e) {
                console.error('從 localStorage 移除收藏評論失敗:', e);
                success = false;
            }
        }
        
        if (success) {
            // 更新收藏評論列表顯示
            loadFavorites('reviews');
            showToast('已從收藏評論中移除');
        } else {
            showToast('移除收藏評論失敗，請稍後再試');
        }
    } catch (error) {
        console.error('移除收藏評論失敗:', error);
        showToast(`移除收藏評論失敗: ${error.message}`);
    }
}

// 查看店家詳情
function viewRestaurant(placeId) {
    console.log('viewRestaurant 函數被調用，placeId:', placeId);
    
    // 檢查 RestaurantModal 模組的可用性
    if (window.RestaurantModal) {
        console.log('RestaurantModal 模組存在');
    } else {
        console.warn('RestaurantModal 模組不存在，嘗試重新初始化');
        // 嘗試重新初始化 RestaurantModal
        if (typeof RestaurantModal !== 'undefined') {
            console.log('直接初始化 RestaurantModal');
            RestaurantModal.init();
            window.RestaurantModal = RestaurantModal;
        }
    }
    
    // 從收藏列表中找到對應的餐廳數據
    let restaurant = null;
    
    // 優先從 favoriteSystem 獲取
    if (window.favoriteSystem && window.favoriteSystem.initialized) {
        const stores = window.favoriteSystem.getFavoriteStores();
        restaurant = stores.find(store => store.place_id === placeId || store.id === placeId);
        console.log('從 favoriteSystem 獲取餐廳數據:', restaurant);
    }
    
    // 如果沒找到，嘗試從 localStorage 獲取
    if (!restaurant) {
        try {
            const stores = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
            if (Array.isArray(stores)) {
                restaurant = stores.find(store => store.place_id === placeId || store.id === placeId);
                console.log('從 localStorage 獲取餐廳數據:', restaurant);
            }
        } catch (e) {
            console.error('解析 localStorage 收藏數據時出錯:', e);
        }
    }
    
    if (restaurant) {
        console.log('顯示餐廳詳情:', restaurant);
        
        // 檢查 RestaurantModal 模組是否可用
        if (window.RestaurantModal) {
            console.log('RestaurantModal 模組存在');
            
            // 確保 RestaurantModal 已初始化
            if (typeof window.RestaurantModal.init === 'function') {
                console.log('初始化 RestaurantModal 模組');
                window.RestaurantModal.init();
            }
            
            // 使用 RestaurantModal 顯示餐廳詳情
            if (typeof window.RestaurantModal.showRestaurantDetail === 'function') {
                console.log('使用 RestaurantModal 顯示餐廳詳情');
                try {
                    window.RestaurantModal.showRestaurantDetail(restaurant);
                    console.log('RestaurantModal.showRestaurantDetail 調用成功');
                    return;
                } catch (error) {
                    console.error('RestaurantModal.showRestaurantDetail 調用失敗:', error);
                }
            } else {
                console.error('RestaurantModal.showRestaurantDetail 方法不存在');
            }
        } else {
            console.error('RestaurantModal 模組不存在');
        }
        
        // 如果 RestaurantModal 不可用，嘗試使用 mapInit
        if (window.mapInit && typeof window.mapInit.showRestaurantDetail === 'function') {
            console.log('使用 mapInit 顯示餐廳詳情');
            try {
                window.mapInit.showRestaurantDetail(restaurant);
                console.log('mapInit.showRestaurantDetail 調用成功');
                return;
            } catch (error) {
                console.error('mapInit.showRestaurantDetail 調用失敗:', error);
            }
        } else {
            console.error('mapInit.showRestaurantDetail 方法不存在');
        }
        
        // 如果以上方法都不可用，使用備用方案
        console.log('使用備用方案顯示餐廳詳情');
        showRestaurantDetailFallback(restaurant);
    } else {
        console.error('找不到指定ID的餐廳數據:', placeId);
        // 如果找不到餐廳數據，退回到原來的跳轉方式
        window.location.href = `storeDetail.html?place_id=${placeId}`;
    }
}

// 備用的餐廳詳情顯示函數
function showRestaurantDetailFallback(restaurant) {
    console.log('使用備用方案顯示餐廳詳情:', restaurant);
    
    // 檢查是否有新版彈窗元素
    const newModal = document.getElementById('restaurantModalNew');
    if (newModal) {
        console.log('使用新版彈窗元素');
        
        // 填充新版彈窗內容
        const nameElement = document.getElementById('modal-restaurant-name-new');
        const imageElement = document.getElementById('modal-restaurant-img-new');
        const starsElement = document.getElementById('modal-stars-new');
        const ratingElement = document.getElementById('modal-rating-new');
        const ratingCountElement = document.getElementById('modal-rating-count-new');
        const addressElement = document.getElementById('modal-address-new');
        const statusElement = document.getElementById('modal-status-new');
        const statusTextElement = document.querySelector('#modal-status-new .modal-status-text-new');
        
        if (nameElement) nameElement.textContent = restaurant.name || '未知餐廳';
        
        // 處理圖片URL
        let photoUrl = 'images/restaurant1.jpg';
        if (restaurant.photos) {
            if (typeof restaurant.photos === 'string') {
                photoUrl = restaurant.photos;
            } else if (Array.isArray(restaurant.photos) && restaurant.photos.length > 0) {
                if (typeof restaurant.photos[0] === 'string') {
                    photoUrl = restaurant.photos[0];
                } else if (restaurant.photos[0] && restaurant.photos[0].url) {
                    photoUrl = restaurant.photos[0].url;
                }
            }
        } else if (restaurant.image) {
            photoUrl = restaurant.image;
        }
        
        if (imageElement) {
            imageElement.src = photoUrl;
            imageElement.alt = restaurant.name;
            imageElement.onerror = function() { this.src = 'images/restaurant1.jpg'; };
        }
        
        // 處理評分
        const rating = restaurant.rating || 0;
        if (ratingElement) ratingElement.textContent = rating.toFixed(1);
        if (ratingCountElement) ratingCountElement.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
        if (starsElement) starsElement.textContent = generateStars(rating);
        
        // 處理地址
        if (addressElement) addressElement.textContent = restaurant.address || restaurant.vicinity || '';
        
        // 處理營業狀態
        let isOpen = false;
        if (restaurant.opening_hours) {
            isOpen = restaurant.opening_hours.open_now;
        } else if (restaurant.isOpen !== undefined) {
            isOpen = restaurant.isOpen;
        }
        
        if (statusElement) statusElement.className = `modal-status-new ${isOpen ? 'open' : 'closed'}`;
        if (statusTextElement) statusTextElement.textContent = isOpen ? '營業中' : '休息中';
        
        // 顯示彈窗
        newModal.classList.add('active');
        console.log('新版彈窗已顯示');
        
        // 綁定關閉按鈕事件
        const closeBtn = document.querySelector('.restaurant-modal-close-new');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                newModal.classList.remove('active');
            });
        }
        
        return;
    }
    
    // 使用原始的彈窗邏輯
    const modal = document.getElementById('restaurantModal');
    const modalContent = modal ? modal.querySelector('.restaurant-modal-content') : null;
    
    console.log('彈窗元素:', modal);
    console.log('彈窗內容元素:', modalContent);
    
    if (modal && modalContent) {
        // 生成餐廳詳情內容
        modalContent.innerHTML = `
            <div class="restaurant-modal-header">
                <h2>${restaurant.name || '未知餐廳'}</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="restaurant-main-info">
                <img src="${restaurant.image || restaurant.photos || 'images/restaurant1.jpg'}" 
                     alt="${restaurant.name}" 
                     class="restaurant-modal-image" 
                     onerror="this.src='images/restaurant1.jpg'">
                <div class="restaurant-details">
                    <div class="modal-rating">
                        <span class="modal-stars">${generateStars(restaurant.rating || 0)}</span>
                        <span>${(restaurant.rating || 0).toFixed(1)}</span>
                        <span class="modal-rating-count">(${restaurant.user_ratings_total || restaurant.ratingCount || 0} 則評論)</span>
                    </div>
                    <div class="modal-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${restaurant.address || restaurant.vicinity || restaurant.formattedAddress || '地址未知'}</span>
                    </div>
                    <div class="modal-status">
                        <i class="fas fa-clock"></i>
                        <span class="modal-status-text">${restaurant.isOpen ? '營業中' : '休息中'}</span>
                    </div>
                    <div class="modal-actions">
                        <button class="favorite-btn active" data-place-id="${restaurant.place_id || restaurant.id}" data-name="${restaurant.name}">
                            <i class="fas fa-heart"></i> 已收藏
                        </button>
                        <button class="modal-direction-btn" onclick="openGoogleMaps('${restaurant.address || restaurant.vicinity || restaurant.formattedAddress || ''}')">
                            <i class="fas fa-directions"></i> 路線
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 顯示彈窗
        modal.style.display = 'flex';
        console.log('舊版彈窗已顯示');
        
        // 綁定關閉按鈕事件
        const closeBtn = modalContent.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                console.log('關閉按鈕被點擊');
                modal.style.display = 'none';
            });
        }
        
        // 點擊彈窗外部關閉
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                console.log('點擊彈窗外部');
                modal.style.display = 'none';
            }
        });
    } else {
        console.error('找不到餐廳詳情彈窗元素');
        // 如果找不到彈窗元素，退回到原來的跳轉方式
        window.location.href = `storeDetail.html?place_id=${restaurant.place_id || restaurant.id}`;
    }
}

// 生成星級評分
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - Math.ceil(rating);
    
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// 打開 Google 地圖導航
function openGoogleMaps(address) {
    if (!address) return;
    
    // 編碼地址用於 URL
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    
    // 在新視窗中打開 Google 地圖
    window.open(mapsUrl, '_blank');
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
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        showToast('請先登入');
        return;
    }
    
    // 獲取通知設定
    const orderNotifications = document.getElementById('orderNotifications').checked;
    const promotionNotifications = document.getElementById('promotionNotifications').checked;
    const systemNotifications = document.getElementById('systemNotifications').checked;
    
    // 獲取隱私設定
    const showProfile = document.getElementById('showProfile').checked;
    const showReviews = document.getElementById('showReviews').checked;
    
    // 獲取密碼設定
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 檢查新密碼是否一致
    if (newPassword && newPassword !== confirmPassword) {
        showToast('新密碼與確認密碼不一致');
        return;
    }
    
    // 準備要發送的設定資料
    const settingsData = {
        notificationSettings: {
            orderNotifications,
            promotionNotifications,
            systemNotifications
        },
        privacySettings: {
            showProfile,
            showReviews
        }
    };
    
    // 如果有輸入密碼，則添加密碼變更請求
    if (currentPassword && newPassword) {
        settingsData.passwordChange = {
            currentPassword,
            newPassword
        };
    }
    
    // 發送 API 請求更新設定
    fetch(`${API_BASE_URL}/users/${userId}/settings`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsData)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('目前密碼不正確');
            }
            throw new Error('更新設定失敗');
        }
        return response.json();
    })
    .then(result => {
        console.log('設定更新成功:', result);
        
        // 清除密碼欄位
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        
        showToast('設定已成功更新');
    })
    .catch(error => {
        console.error('更新設定失敗:', error);
        
        // 如果是密碼錯誤，顯示特定訊息
        if (error.message === '目前密碼不正確') {
            showToast('目前密碼不正確，請重新輸入');
        } else {
            // 備用方案：僅在前端保存設定
            let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
            currentUser.settings = {
                notificationSettings: {
                    orderNotifications,
                    promotionNotifications,
                    systemNotifications
                },
                privacySettings: {
                    showProfile,
                    showReviews
                }
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showToast('設定已更新 (本地儲存)');
        }
    });
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
    console.log('檢查登入狀態');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const user = localStorage.getItem('user');
    
    if (!isLoggedIn || !user) {
        console.log('用戶未登入，重定向到首頁');
        window.location.href = 'index.html';
        return false;
    }
    
    console.log('用戶已登入');
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
        orderStatus.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }

    // 評論評分篩選
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) {
        reviewRating.addEventListener('change', function() {
            loadReviews(this.value);
        });
    }

    // 通知類型篩選
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            filterNotifications(type);
        });
    });

    // 收藏標籤切換
    const tabButtons = document.querySelectorAll('.favorites-tabs .tab-btn'); // 確保選擇器正確
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = btn.getAttribute('data-tab');
            switchFavoritesTab(tab);
        });
    });

    // 數據分析時間篩選
    document.querySelectorAll('.analytics-card .time-range-select').forEach(select => {
        select.addEventListener('change', function() {
            const timeRange = this.value;
            loadAnalyticsData(timeRange);
        });
    });
}

// 載入使用者資料
async function loadUserData() {
    console.log('載入使用者資料');
    
    // 從 localStorage 獲取用戶 token 和 ID
    const authToken = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    console.log('用戶認證資訊:', { userId, hasToken: !!authToken });

    if (!authToken || !userId) {
        console.log('未找到用戶認證資訊，重定向到登入頁面');
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // 從後端 API 獲取用戶資料
        console.log('開始從 API 獲取用戶資料');
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
        });

                if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
                }

        const userData = await response.json();
        console.log('API 回應的完整用戶資料:', userData);
        
        // 檢查頭像資料
        if (userData.avatar_url) {
            console.log('頭像資料長度:', userData.avatar_url.length);
            console.log('頭像資料前綴:', userData.avatar_url.substring(0, 50) + '...');
        } else {
            console.log('用戶資料中沒有頭像');
        }
                
                // 更新 localStorage 中的用戶資料
        localStorage.setItem('user', JSON.stringify(userData));
                
        // 更新顯示
                updateUserDisplay(userData);
                updateProfileForm(userData);
        
    } catch (error) {
                console.error('獲取用戶資料失敗:', error);
        showToast('獲取用戶資料失敗，請重新登入');
        // 清除本地存儲並重定向到登入頁面
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// 更新使用者顯示資訊
function updateUserDisplay(userData) {
    console.log('更新使用者資訊顯示:', userData);
    
    if (!userData) {
        console.error('無效的用戶資料');
        return;
        }
    
    // 更新用戶名稱
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = userData.username || userData.fullName || userData.email || '未知用戶';
    }
    
    // 更新用戶郵箱
    const userEmailElement = document.querySelector('.user-email');
    if (userEmailElement) {
        userEmailElement.textContent = userData.email || '';
    }
    
    // 更新用戶頭像 - 檢查 image_url 和 avatar_url
    const userAvatarImg = document.querySelector('.avatar-img');
    if (userAvatarImg) {
        const avatarUrl = userData.avatar_url;
        console.log('頭像URL:', avatarUrl);
        
        if (avatarUrl) {
            userAvatarImg.src = avatarUrl;  // 直接使用返回的 base64 URL
            userAvatarImg.alt = userData.username || '會員頭像';
            console.log('設置用戶頭像成功');
        } else {
            console.log('用戶沒有頭像，使用預設頭像');
            userAvatarImg.src = 'images/default-avatar.jpg';
            userAvatarImg.alt = '預設頭像';
        }
    }
}

// 更新個人資料表單
function updateProfileForm(userData) {
    console.log('更新個人資料表單:', userData);
    
    if (!userData) {
        console.error('無效的用戶資料');
        return;
    }
    
    // 更新姓名欄位
    const nameInput = document.querySelector('input[name="name"]');
    if (nameInput) {
        nameInput.value = userData.fullName || '';
    }
    
    // 更新電子郵件欄位
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput) {
        emailInput.value = userData.email || '';
        // 設置為唯讀
        emailInput.readOnly = true;
    }
    
    // 更新電話欄位
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.value = userData.phoneNumber || '';
    }
    
    // 更新地址欄位
    const addressInput = document.querySelector('input[name="address"]');
    if (addressInput) {
        addressInput.value = userData.address || '';
    }
}

// 更新個人資料
async function updateProfile() {
    console.log('開始更新個人資料');
    
    // 獲取更新按鈕
    const updateBtn = document.querySelector('.update-profile-btn');
    if (updateBtn.disabled) {
        console.log('請求正在處理中，請稍候...');
        return;
    }
    
    const userId = localStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        showToast('請先登入');
        return;
    }
    
    // 禁用按鈕，防止重複提交
    updateBtn.disabled = true;
    updateBtn.textContent = '更新中...';
    
    try {
        // 獲取表單數據
        const name = document.querySelector('input[name="name"]').value;
        const phone = document.querySelector('input[name="phone"]').value;
        const address = document.querySelector('input[name="address"]').value;
        
        console.log('準備更新的資料:', { name, phone, address });
        
        // 準備要發送的數據
    const userData = {
            fullName: name,
            phoneNumber: phone,
            address: address
    };

        // 發送更新請求
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
        });
        
        console.log('更新請求回應狀態:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `更新失敗: ${response.status}`);
        }
        
        const updatedUser = await response.json();
        console.log('更新成功，返回資料:', updatedUser);
        
        // 更新本地存儲的用戶資料
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // 更新顯示
        updateUserDisplay(updatedUser);

        showToast('個人資料更新成功');
    } catch (error) {
        console.error('更新個人資料失敗:', error);
        showToast(error.message || '更新失敗，請稍後再試');
    } finally {
        // 恢復按鈕狀態
        updateBtn.disabled = false;
        updateBtn.textContent = '更新資料';
    }
}

// 在頁面載入時綁定更新按鈕事件
document.addEventListener('DOMContentLoaded', function() {
    const updateBtn = document.querySelector('.update-profile-btn');
    if (updateBtn) {
        console.log('找到更新按鈕，綁定點擊事件');
        updateBtn.addEventListener('click', updateProfile);
    } else {
        console.error('未找到更新按鈕');
    }
});

// 載入訂單
function loadOrders(statusFilter = 'all') {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        // 使用假資料
        let filteredOrders = mockOrders;
        if (statusFilter !== 'all') {
            filteredOrders = mockOrders.filter(order => order.status === statusFilter);
        }
        renderOrders(filteredOrders);
        return;
    }
    
    // 顯示載入中狀態
    ordersList.innerHTML = '<div class="loading">載入訂單中...</div>';
    
    // 從 API 獲取訂單資料
    fetch(`${API_BASE_URL}/orders/user/${userId}?status=${statusFilter}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法獲取訂單資料');
        }
        return response.json();
    })
    .then(ordersData => {
        console.log('從 API 獲取的訂單資料:', ordersData);
        renderOrders(ordersData);
    })
    .catch(error => {
        console.error('獲取訂單資料失敗:', error);
        // 使用假資料作為備用
        let filteredOrders = mockOrders;
        if (statusFilter !== 'all') {
            filteredOrders = mockOrders.filter(order => order.status === statusFilter);
        }
        renderOrders(filteredOrders);
    });
    
    // 渲染訂單列表
    function renderOrders(orders) {
        if (orders.length === 0) {
            ordersList.innerHTML = '<div class="no-data">沒有找到相關訂單</div>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `            <div class="order-item">
                <div class="order-header">
                    <h4>${order.storeName || order.restaurantName}</h4>
                    <span class="order-status">${getStatusText(order.status)}</span>
                </div>
                <div class="order-details">
                    <p><strong>訂單編號:</strong> ${order.id || order.orderId}</p>
                    <p><strong>訂購時間:</strong> ${new Date(order.orderTime || order.createdAt).toLocaleString()}</p>
                    <p><strong>訂購項目:</strong> ${Array.isArray(order.items) ? order.items.join(', ') : (order.orderItems || '無項目資訊')}</p>
                    <p><strong>總金額:</strong> $${order.totalAmount}</p>
                </div>
            </div>
        `).join('');
    }
}

// 載入評論
function loadReviews(ratingFilter = 'all') {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        // 使用假資料
        let filteredReviews = mockReviews;
        if (ratingFilter !== 'all') {
            filteredReviews = mockReviews.filter(review => review.rating >= parseInt(ratingFilter));
        }
        renderReviews(filteredReviews);
        return;
    }
    
    // 顯示載入中狀態
    reviewsList.innerHTML = '<div class="loading">載入評論中...</div>';
    
    // 從 API 獲取評論資料
    fetch(`${API_BASE_URL}/reviews/user/${userId}?rating=${ratingFilter}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法獲取評論資料');
        }
        return response.json();
    })
    .then(reviewsData => {
        console.log('從 API 獲取的評論資料:', reviewsData);
        renderReviews(reviewsData);
    })
    .catch(error => {
        console.error('獲取評論資料失敗:', error);
        // 使用假資料作為備用
        let filteredReviews = mockReviews;
        if (ratingFilter !== 'all') {
            filteredReviews = mockReviews.filter(review => review.rating >= parseInt(ratingFilter));
        }
        renderReviews(filteredReviews);
    });
    
    // 渲染評論列表
    function renderReviews(reviews) {
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<div class="no-data">沒有找到相關評論</div>';
            return;
        }

        reviewsList.innerHTML = reviews.map(review => `
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
                    <p><strong>店家:</strong> ${review.storeName || review.restaurantName}</p>
                    <p><strong>評論時間:</strong> ${new Date(review.time || review.createdAt).toLocaleString()}</p>
                    <p><strong>內容:</strong> ${review.content}</p>
                    <div class="review-tags">
                        ${review.tags ? review.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// 載入通知
function loadNotifications(typeFilter = 'all') {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;
    
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        // 使用假資料
        let filteredNotifications = mockNotifications;
        if (typeFilter !== 'all') {
            filteredNotifications = mockNotifications.filter(notification => notification.type === typeFilter);
        }
        renderNotifications(filteredNotifications);
        return;
    }
    
    // 顯示載入中狀態
    notificationsList.innerHTML = '<div class="loading">載入通知中...</div>';
    
    // 從 API 獲取通知資料
    fetch(`${API_BASE_URL}/notifications/user/${userId}?type=${typeFilter}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法獲取通知資料');
        }
        return response.json();
    })
    .then(notificationsData => {
        console.log('從 API 獲取的通知資料:', notificationsData);
        renderNotifications(notificationsData);
    })
    .catch(error => {
        console.error('獲取通知資料失敗:', error);
        // 使用假資料作為備用
        let filteredNotifications = mockNotifications;
        if (typeFilter !== 'all') {
            filteredNotifications = mockNotifications.filter(notification => notification.type === typeFilter);
        }
        renderNotifications(filteredNotifications);
    });
    
    // 渲染通知列表
    function renderNotifications(notifications) {
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="no-data">沒有找到相關通知</div>';
            return;
        }

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}">
                <div class="notification-header">
                    <span class="notification-type">${getNotificationTypeText(notification.type)}</span>
                    <span class="notification-time">${formatTime(notification.time || notification.createdAt)}</span>
                </div>
                <div class="notification-content">
                    ${notification.content || notification.message}
                </div>
                ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
            </div>
        `).join('');
    }
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
// 載入數據分析資料
function loadAnalyticsData(timeRange = 'month') {
    const userId = parseInt(localStorage.getItem('userId') || '1');
    const authToken = localStorage.getItem('authToken');
    
    if (!userId || !authToken) {
        console.log('未登入，使用假數據');
        return;
    }
    
    // 顯示載入中狀態
    document.querySelectorAll('.analytics-card .card-content').forEach(content => {
        content.innerHTML = '<div class="loading">載入數據中...</div>';
    });
    
    // 從 API 獲取數據分析資料
    fetch(`${API_BASE_URL}/analytics/user/${userId}?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('無法獲取數據分析資料');
        }
        return response.json();
    })
    .then(analyticsData => {
        console.log('從 API 獲取的數據分析資料:', analyticsData);
        updateAnalyticsDisplay(analyticsData);
    })
    .catch(error => {
        console.error('獲取數據分析資料失敗:', error);
        // 使用假資料作為備用
        const mockAnalyticsData = {
            orders: {
                totalOrders: 12,
                totalSpent: 3500,
                averageOrderAmount: 292
            },
            consumption: {
                mostFrequentCategory: '台式料理',
                highestSingleOrder: 1200,
                mostFrequentStore: '老王牛肉麵'
            },
            reviews: {
                totalReviews: 8,
                averageRating: 4.5,
                totalLikes: 3
            },
            favorites: {
                totalFavoriteStores: 15,
                totalFavoriteReviews: 8,
                newThisMonth: 5
            }
        };
        updateAnalyticsDisplay(mockAnalyticsData);
    });
}

// 更新數據分析顯示
function updateAnalyticsDisplay(data) {
    // 訂單統計
    if (data.orders) {
        const ordersContent = document.querySelector('.analytics-card:nth-child(1) .card-content');
        if (ordersContent) {
            ordersContent.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.orders.totalOrders || 0}</div>
                    <div class="stat-label">總訂單數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${data.orders.totalSpent || 0}</div>
                    <div class="stat-label">總消費金額</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${data.orders.averageOrderAmount || 0}</div>
                    <div class="stat-label">平均訂單金額</div>
                </div>
            `;
        }
    }
    
    // 消費分析
    if (data.consumption) {
        const consumptionContent = document.querySelector('.analytics-card:nth-child(2) .card-content');
        if (consumptionContent) {
            consumptionContent.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.consumption.mostFrequentCategory || 'N/A'}</div>
                    <div class="stat-label">最常消費類別</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">$${data.consumption.highestSingleOrder || 0}</div>
                    <div class="stat-label">最高單筆消費</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.consumption.mostFrequentStore || 'N/A'}</div>
                    <div class="stat-label">最常消費店家</div>
                </div>
            `;
        }
    }
    
    // 評論統計
    if (data.reviews) {
        const reviewsContent = document.querySelector('.analytics-card:nth-child(3) .card-content');
        if (reviewsContent) {
            reviewsContent.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.reviews.totalReviews || 0}</div>
                    <div class="stat-label">總評論數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.reviews.averageRating || 0}</div>
                    <div class="stat-label">平均評分</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.reviews.totalLikes || 0}</div>
                    <div class="stat-label">獲得讚數</div>
                </div>
            `;
        }
    }
    
    // 收藏統計
    if (data.favorites) {
        const favoritesContent = document.querySelector('.analytics-card:nth-child(4) .card-content');
        if (favoritesContent) {
            favoritesContent.innerHTML = `
                <div class="stat-item">
                    <div class="stat-value">${data.favorites.totalFavoriteStores || 0}</div>
                    <div class="stat-label">收藏店家數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.favorites.totalFavoriteReviews || 0}</div>
                    <div class="stat-label">收藏評論數</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${data.favorites.newThisMonth || 0}</div>
                    <div class="stat-label">本月新增</div>
                </div>
            `;
        }
    }
}

// 初始化收藏列表
function initializeFavorites() {
    console.log('初始化收藏功能');
    
    // 初始化收藏頁籤切換
    const tabBtns = document.querySelectorAll('.tab-btn');
    const favoritesStores = document.querySelector('.favorites-stores');
    const favoritesReviews = document.querySelector('.favorites-reviews');
    
    // 確保元素存在
    if (!tabBtns.length || !favoritesStores || !favoritesReviews) {
        console.error('找不到收藏相關的DOM元素');
        return;
    }
    
    // 設置頁籤點擊事件
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.dataset.tab;
            loadFavorites(tab);
        });
    });
    
    // 默認載入店家收藏
    const activeTab = document.querySelector('.tab-btn.active');
    const defaultTab = activeTab ? activeTab.dataset.tab : 'stores';
    loadFavorites(defaultTab);
}

// 頁面載入完成後的主要初始化
function initializePage() {
    console.log('初始化會員中心頁面');
    
    // 檢查登入狀態
    if (!checkLoginStatus()) {
        return;
    }
    
    // 初始化選單
    initMenu();

    // 初始化表單
    initForms();

    // 初始化篩選功能
    initFilters();

    // 載入使用者資料
    loadUserData();

    // 初始化收藏功能
    initializeFavorites();

    // 設置事件監聽器
    setupEventListeners();

    // 處理 URL 錨點
    handleURLHash();
}

// 頁面載入時執行初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 處理 URL 錨點
function handleURLHash() {
    const hash = window.location.hash;
    let targetSection = 'profile'; // 默認顯示個人資料
    
    if (hash) {
        // 移除 # 符號
        const sectionId = hash.substring(1);
        // 檢查是否為有效的區塊 ID
        const validSections = ['profile', 'analytics', 'orders', 'reviews', 'notifications', 'favorites', 'settings'];
        if (validSections.includes(sectionId)) {
            targetSection = sectionId;
        }
    }
    
    switchSection(targetSection);
}

// 初始化圖表 (保留原有的假圖表)
function initializeCharts() {
    // 這裡可以添加圖表初始化邏輯
    // 目前只是佔位符
    console.log('圖表初始化完成');
}

// 設置事件監聽器
function setupEventListeners() {
    // 監聽 hashchange 事件，處理瀏覽器後退/前進
    window.addEventListener('hashchange', handleURLHash);
    
    // 選單切換
    document.querySelectorAll('.sidebar .menu-item').forEach(item => { // 確保選擇器正確
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            // 更新 URL hash
            window.location.hash = section;
            // switchSection 會由 hashchange 事件觸發
        });
    });

    // 個人資料表單提交 (修改為按鈕點擊事件)
    const updateProfileBtn = document.querySelector('.update-profile-btn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', function() {
            updateProfile();
        });
    }

    // 訂單狀態篩選 (保持原狀)
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) { // 添加檢查確保元素存在
         orderStatus.addEventListener('change', function() {
             loadOrders(this.value);
         });
    }

    // 評論評分篩選 (保持原狀)
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) { // 添加檢查確保元素存在
         reviewRating.addEventListener('change', function() {
             loadReviews(this.value);
         });
    }

    // 通知篩選 (保持原狀)
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            filterNotifications(type);
        });
    });

    // 收藏標籤切換
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => { // 確保選擇器正確
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchFavoritesTab(tab); // <-- 確保呼叫正確
        });
    });

    // 設定表單提交 (保持原狀)
    const settingsForm = document.getElementById('settingsForm');
     if (settingsForm) { // 添加檢查確保元素存在
         settingsForm.addEventListener('submit', function(e) {
             e.preventDefault();
             updateSettings();
         });
     }

    // 編輯評論相關事件監聽器 (保持原狀)
    // ... existing code ...
}

// 切換區塊
function switchSection(sectionId) {
    // 移除所有區塊的 active 類別
    document.querySelectorAll('.main-content .content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // 顯式隱藏
    });
    // 移除所有選單項目的 active 類別
    document.querySelectorAll('.sidebar .menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // 添加 active 類別到選中的區塊並顯示
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block'; // 顯式顯示
        
        // 如果切換到收藏區塊，初始化收藏功能
        if (sectionId === 'favorites') {
            initializeFavorites();
        }
    }
    // 添加 active 類別到選中的選單項目
    const targetMenuItem = document.querySelector(`.sidebar .menu-item[data-section="${sectionId}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
}

// 檢查API連接狀態
function checkApiConnection() {
    console.log(`檢查API連接狀態: ${API_BASE_URL}`);
    
    // 嘗試連接API健康檢查端點
    fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            console.log('API連接正常');
        } else {
            console.warn(`API連接異常: ${response.status} ${response.statusText}`);
        }
    })
    .catch(error => {
        console.error('API連接失敗:', error);
    });
}

// 確保只初始化一次的標誌
let isInitialized = false;

// 初始化用戶中心
async function initializeUserCenter() {
    if (isInitialized) {
        console.log('用戶中心已經初始化過，跳過重複初始化');
        return;
    }
    
    console.log('開始初始化用戶中心...');
    
    try {
        // 初始化收藏系統
        if (window.favoriteSystem && !window.favoriteSystem.initialized) {
            await window.favoriteSystem.initialize();
        }
        
        // 初始化收藏按鈕
        if (window.favoriteButton && !window.favoriteButton.initialized) {
            await window.favoriteButton.initialize();
        }
        
        // 載入收藏列表
        await loadFavorites();
        
        // 設置初始化完成標誌
        isInitialized = true;
        console.log('用戶中心初始化完成');
    } catch (error) {
        console.error('初始化用戶中心時發生錯誤:', error);
    }
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

    if (type === 'stores') {
        // 顯示載入中狀態
        storesContainer.innerHTML = '<div class="loading">載入收藏店家中...</div>';
        
        try {
            // 只從 favoriteSystem 獲取收藏店家資料
            let favoriteStores = [];
            
            if (window.favoriteSystem && window.favoriteSystem.initialized) {
                favoriteStores = await window.favoriteSystem.getFavoriteStores();
                console.log('從 favoriteSystem 獲取的收藏資料:', favoriteStores);
            }
            
            if (!favoriteStores || favoriteStores.length === 0) {
                storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
            } else {
                await renderFavoriteStores(favoriteStores);
            }
        } catch (error) {
            console.error('載入收藏店家失敗:', error);
            storesContainer.innerHTML = '<div class="error">載入收藏店家失敗，請稍後再試</div>';
        }
    }
}

// 在 DOMContentLoaded 時初始化
document.addEventListener('DOMContentLoaded', initializeUserCenter);

// 導出必要的函數
window.userCenter = {
    initialize: initializeUserCenter,
    loadFavorites: loadFavorites
};

