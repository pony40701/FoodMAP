// API 基礎 URL 配置
// 已在 config.js 中設置，移除重複宣告
const FAVORITES_API_PATH = '/users';
const RESTAURANT_API_PATH = '/google-restaurants';
const PHOTOS_API_PATH = '/google-restaurant-photos';
const USER_API_PATH = '/users';

// 構建餐廳圖片URL的函數
function buildRestaurantPhotoUrl(placeId) {
    if (!placeId) return 'images/default-restaurant.jpg';
    
    // 確保 API_BASE_URL 存在
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 直接返回圖片 URL
    return `${baseUrl}/restaurant-images/${placeId}/raw`;
}

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
        try {
            // 檢查 getFavoriteStores 方法是否存在
            if (typeof window.favoriteSystem.getFavoriteStores === 'function') {
                return window.favoriteSystem.getFavoriteStores();
            } else {
                // 如果方法不存在，直接使用 stores 數組
                console.warn('favoriteSystem.getFavoriteStores 方法不存在，直接使用 stores 數組');
                return window.favoriteSystem.stores || [];
            }
        } catch (error) {
            console.error('從 favoriteSystem 獲取收藏餐廳時出錯:', error);
            return [];
        }
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
        try {
            // 檢查 getFavoriteReviews 方法是否存在
            if (typeof window.favoriteSystem.getFavoriteReviews === 'function') {
                return window.favoriteSystem.getFavoriteReviews();
            } else {
                // 如果方法不存在，直接使用 reviews 數組
                console.warn('favoriteSystem.getFavoriteReviews 方法不存在，直接使用 reviews 數組');
                return window.favoriteSystem.reviews || [];
            }
        } catch (error) {
            console.error('從 favoriteSystem 獲取收藏評論時出錯:', error);
            return [];
        }
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

    // 獲取用戶ID
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('未找到用戶ID，請先登入');
        storesContainer.innerHTML = '<div class="error">請先登入後查看收藏</div>';
        reviewsContainer.innerHTML = '<div class="error">請先登入後查看收藏</div>';
        return;
    }

    if (type === 'stores') {
        // 顯示載入中狀態
        storesContainer.innerHTML = '<div class="loading">載入收藏店家中...</div>';
        
        try {
            // 從API獲取收藏餐廳列表
            const response = await fetch(`${API_BASE_URL}/users/${userId}/favorites/restaurants`);
            
            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('從API獲取的收藏資料:', data);
            
            // 從不同可能的資料結構中提取收藏列表
            let stores = [];
            if (data.favorites && Array.isArray(data.favorites)) {
                stores = data.favorites;
            } else if (data.data && Array.isArray(data.data)) {
                stores = data.data;
            } else if (Array.isArray(data)) {
                stores = data;
            }
            
            // 檢查是否有收藏數據
            if (stores.length === 0) {
                storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
                return;
            }
            
            // 直接渲染已有的資料
            await renderFavoriteStores(stores);
            
            // 檢查是否需要獲取詳細資料
            const storesNeedingDetails = stores.filter(store => {
                const restaurant = store.restaurant || store;
                return !restaurant.name || restaurant.name === '載入中...';
            });
            
            if (storesNeedingDetails.length > 0) {
                console.log('需要獲取餐廳詳情的項目數:', storesNeedingDetails.length);
                
                // 為每個餐廳獲取詳情
                const promises = storesNeedingDetails.map(async (store) => {
                    try {
                        const storeId = store.place_id || store.id || (store.restaurant && store.restaurant.id);
                        if (!storeId) return;
                        
                        const detailResponse = await fetch(`${API_BASE_URL}${RESTAURANT_API_PATH}/${storeId}`);
                        if (detailResponse.ok) {
                            const detailData = await detailResponse.json();
                            
                            // 更新餐廳資料
                            if (store.restaurant) {
                                // 如果有 restaurant 屬性，更新裡面的資料
                                store.restaurant.name = detailData.name || store.restaurant.name;
                                store.restaurant.rating = detailData.rating || store.restaurant.rating || 0;
                                store.restaurant.user_ratings_total = detailData.user_ratings_total || store.restaurant.user_ratings_total || 0;
                                store.restaurant.formatted_address = detailData.formatted_address || detailData.vicinity || store.restaurant.formatted_address || '地址不詳';
                                if (detailData.photos && detailData.photos.length > 0) {
                                    store.restaurant.photos = detailData.photos;
                                }
                            } else {
                                // 直接更新 store 物件
                                store.name = detailData.name || store.name;
                                store.rating = detailData.rating || store.rating || 0;
                                store.user_ratings_total = detailData.user_ratings_total || store.user_ratings_total || 0;
                                store.formatted_address = detailData.formatted_address || detailData.vicinity || store.formatted_address || '地址不詳';
                                if (detailData.photos && detailData.photos.length > 0) {
                                    store.photos = detailData.photos;
                                }
                            }
                        }
                    } catch (detailError) {
                        console.error(`獲取餐廳詳情失敗:`, detailError);
                    }
                });
                
                // 等待所有詳情獲取完成
                await Promise.all(promises);
                
                // 重新渲染收藏列表
                await renderFavoriteStores(stores);
            }
            
            // 存儲最新的收藏列表到localStorage作為快取
            localStorage.setItem('favoriteStores', JSON.stringify(stores));
        } catch (error) {
            console.error('載入收藏店家失敗:', error);
            
            // 嘗試從localStorage讀取快取資料
            try {
                const cachedData = localStorage.getItem('favoriteStores');
                if (cachedData) {
                    const cachedStores = JSON.parse(cachedData);
                    console.log('使用快取的收藏資料:', cachedStores);
                    
                    if (cachedStores.length > 0) {
                        await renderFavoriteStores(cachedStores);
                        storesContainer.insertAdjacentHTML('beforeend', 
                            '<div class="cache-notice">顯示的是快取資料，連線到伺服器失敗</div>');
                        return;
                    }
                }
            } catch (cacheError) {
                console.error('讀取快取資料失敗:', cacheError);
            }
            
            storesContainer.innerHTML = `<div class="error">載入收藏店家失敗，請稍後再試</div>
                <div style="margin-top: 20px;">錯誤詳情: ${error.message || '未知錯誤'}</div>`;
        }
    } else if (type === 'reviews') {
        // 顯示載入中狀態
        reviewsContainer.innerHTML = '<div class="loading">載入收藏評論中...</div>';
        
        try {
            // 從API獲取收藏評論列表
            const response = await fetch(`${API_BASE_URL}/user/${userId}/favorites?type=review`);
            
            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('從API獲取的收藏評論資料:', data);
            
            // 檢查是否有收藏評論
            if (!data || !data.favorites || data.favorites.length === 0) {
                reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏任何評論</div>';
                return;
            }
            
            // 處理收藏評論數據
            const favoriteReviews = data.favorites.map(item => {
                // 檢查是否已經包含評論詳情
                if (item.review) {
                    return {
                        id: item.target_id,
                        reviewId: item.target_id,
                        author: item.review.author || item.review.user_name || '匿名',
                        storeName: item.review.restaurant_name || '未知餐廳',
                        content: item.review.content,
                        rating: item.review.rating || 5,
                        date: new Date(item.review.created_at || item.favorited_at).toLocaleDateString()
                    };
                }
                
                // 如果API只返回基本ID信息
                return {
                    id: item.target_id,
                    reviewId: item.target_id,
                    author: '載入中...',
                    storeName: '載入中...',
                    content: '載入中...',
                    rating: 0,
                    date: new Date(item.favorited_at).toLocaleDateString()
                };
            });
            
            // 渲染收藏評論列表
            renderFavoriteReviews(favoriteReviews);
            
            // 如果需要獲取評論詳情
            const needDetailsReviews = favoriteReviews.filter(review => review.author === '載入中...');
            if (needDetailsReviews.length > 0) {
                console.log('需要獲取評論詳情的項目數:', needDetailsReviews.length);
                
                // 為每個評論獲取詳情
                const promises = needDetailsReviews.map(async (review) => {
                    try {
                        const detailResponse = await fetch(`${API_BASE_URL}/reviews/${review.id}`);
                        if (detailResponse.ok) {
                            const detailData = await detailResponse.json();
                            // 更新評論數據
                            review.author = detailData.author || detailData.user_name || '匿名';
                            review.storeName = detailData.restaurant_name || '未知餐廳';
                            review.content = detailData.content;
                            review.rating = detailData.rating || 5;
                            review.date = new Date(detailData.created_at || review.date).toLocaleDateString();
                        }
                    } catch (detailError) {
                        console.error(`獲取評論 ${review.id} 詳情失敗:`, detailError);
                    }
                });
                
                // 等待所有詳情獲取完成
                await Promise.all(promises);
                
                // 重新渲染收藏評論列表
                renderFavoriteReviews(favoriteReviews);
            }
            
            // 存儲最新的收藏評論到localStorage作為快取
            localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
            
        } catch (error) {
            console.error('載入收藏評論失敗:', error);
            
            // 嘗試從localStorage讀取快取資料
            try {
                const cachedData = localStorage.getItem('favoriteReviews');
                if (cachedData) {
                    const favoriteReviews = JSON.parse(cachedData);
                    console.log('使用快取的收藏評論資料:', favoriteReviews);
                    
                    if (favoriteReviews.length > 0) {
                        renderFavoriteReviews(favoriteReviews);
                        reviewsContainer.insertAdjacentHTML('beforeend', 
                            '<div class="cache-notice">顯示的是快取資料，連線到伺服器失敗</div>');
                        return;
                    }
                }
            } catch (cacheError) {
                console.error('讀取快取評論資料失敗:', cacheError);
            }
            
            reviewsContainer.innerHTML = `<div class="error">載入收藏評論失敗，請稍後再試</div>
                <div style="margin-top: 20px;">錯誤詳情: ${error.message || '未知錯誤'}</div>`;
        }
    }
}

// 渲染收藏店家列表
async function renderFavoriteStores(stores) {
    console.log('開始渲染收藏店家', stores);
    const storesContainer = document.querySelector('.favorites-stores');
    
    if (!storesContainer) {
        console.error('找不到收藏店家容器');
        return;
    }
    
    // 過濾出有效的店家數據
    const validStores = stores.filter(store => {
        const restaurant = store.restaurant || store;
        return restaurant && (restaurant.place_id || restaurant.id || store.target_id || store.place_id || store.id);
    });
    
    if (validStores.length === 0) {
        storesContainer.innerHTML = `
            <div class="no-data">
                <i class="far fa-frown"></i>
                <p>您還沒有收藏任何餐廳</p>
                <a href="restaurantList.html" class="btn-primary">去探索美食</a>
            </div>
        `;
        return;
    }
    
    // 清空容器，準備重新渲染
    storesContainer.innerHTML = '';
    
    // 創建店家卡片容器
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'restaurants-grid';
    
    // 使用內聯樣式確保網格布局正確顯示
    cardsContainer.style.display = 'grid';
    cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
    cardsContainer.style.gap = '24px';
    cardsContainer.style.width = '100%';
    
    storesContainer.appendChild(cardsContainer);
    
    // 處理並顯示每一家店家
    for (const store of validStores) {
        try {
            // 處理資料結構，支援多種可能的API回傳格式
            const restaurant = store.restaurant || store;
            const placeId = restaurant.place_id || restaurant.id || store.target_id || store.place_id || store.id;
            
            if (!placeId) {
                console.warn('跳過無效店家數據:', store);
                continue;
            }
            
            const name = restaurant.name || '未知餐廳';
            const rating = parseFloat(restaurant.rating) || parseFloat(restaurant.average_rating) || 0;
            const reviewCount = restaurant.user_ratings_total || restaurant.review_count || restaurant.reviewCount || 0;
            const address = restaurant.formatted_address || restaurant.vicinity || restaurant.address || '地址不詳';
            
            // 使用統一的圖片URL構建函數
            const imageUrl = buildRestaurantPhotoUrl(placeId);
            console.log('餐廳圖片URL:', imageUrl, '餐廳ID:', placeId);
            
            // 營業時間判斷
            let isOpen = false;
            let todayHours = '';
            
            if (restaurant.opening_hours) {
                // 如果opening_hours是字符串形式的JSON，先解析它
                if (typeof restaurant.opening_hours === 'string') {
                    try {
                        restaurant.opening_hours = JSON.parse(restaurant.opening_hours);
                    } catch (error) {
                        console.warn('解析營業時間JSON失敗:', error);
                    }
                }
                
                if (restaurant.opening_hours.weekday_text) {
                    // 獲取今日營業時間文字
                    const today = new Date().getDay();
                    const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引
                    
                    if (restaurant.opening_hours.weekday_text[index]) {
                        const todayText = restaurant.opening_hours.weekday_text[index];
                        // 直接從完整的營業時間文字中提取時間部分
                        const timeMatch = todayText.match(/:\s*(.+)$/);
                        const timeStr = timeMatch ? timeMatch[1].trim() : null;
                        
                        if (timeStr) {
                            isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                                window.businessHours.isOpenFromText(timeStr) : 
                                restaurant.opening_hours.open_now;
                                
                            const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][today];
                            todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${timeStr}</span>`;
                        }
                    }
                } else if (restaurant.opening_hours.periods) {
                    // 如果有 periods 資料，使用它來判斷
                    const now = new Date();
                    const day = now.getDay();
                    const period = restaurant.opening_hours.periods.find(p => p.open.day === day);
                    if (period) {
                        const openTime = `${period.open.hours}:${period.open.minutes || '00'}`;
                        const closeTime = `${period.close.hours}:${period.close.minutes || '00'}`;
                        isOpen = window.businessHours && window.businessHours.isOpenNow ? 
                            window.businessHours.isOpenNow(openTime, closeTime) : false;
                        todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${openTime}-${closeTime}</span>`;
                    }
                } else if (restaurant.opening_hours.open_now !== undefined) {
                    // 如果只有 open_now 屬性
                    isOpen = restaurant.opening_hours.open_now;
                }
            } else if (restaurant.business_hours) {
                // 嘗試使用 business_hours 欄位
                try {
                    const businessHours = typeof restaurant.business_hours === 'string' ? 
                        JSON.parse(restaurant.business_hours) : restaurant.business_hours;
                    
                    const today = new Date().getDay();
                    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                    const todayBusiness = businessHours[dayKey];
                    
                    if (todayBusiness) {
                        isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                            window.businessHours.isOpenFromText(todayBusiness) : false;
                        todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${todayBusiness}</span>`;
                    }
                } catch (error) {
                    console.warn('解析 business_hours 失敗:', error);
                }
            }
            
            // 創建卡片元素
            const card = document.createElement('div');
            card.className = 'restaurant-card v3';
            card.setAttribute('data-id', placeId);
            
            // 卡片內容模板
            card.innerHTML = `
                <div class="restaurant-image-wrapper v3">
                    <img src="${imageUrl}" alt="${name}" onerror="this.style.display='none'; var err = document.createElement('div'); err.className='image-error-message'; err.textContent='圖片載入失敗'; err.style.textAlign='center'; err.style.padding='20px'; err.style.color='#999'; this.parentNode.appendChild(err);">
                </div>
                <button class="favorite-btn v3 active" title="取消收藏" data-place-id="${placeId}" data-name="${name.replace(/"/g, '&quot;')}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="restaurant-info v3">
                    <div class="restaurant-title-row v3">
                        <h3 class="restaurant-name v3" title="${name}">${name}</h3>
                    </div>
                    <div class="restaurant-rating-row v3">
                        <span class="rating-stars v3">${generateStars(rating)}</span>
                        <span class="rating-score v3">${rating ? rating.toFixed(1) : 'N/A'}</span>
                        <span class="rating-count v3">(${reviewCount}則評論)</span>
                    </div>
                    <div class="restaurant-address-row v3">
                        <i class="fas fa-map-marker-alt"></i>
                        <span class="address-text v3" title="${address}">${address}</span>
                    </div>
                    <div class="restaurant-status-row v3">
                        <span class="status-dot v3 ${isOpen ? 'open' : 'closed'}"></span>
                        <span class="status-text v3 ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
                        ${todayHours}
                    </div>
                </div>`;
            
            // 添加點擊事件，點擊卡片跳轉到餐廳詳情
            card.addEventListener('click', (e) => {
                // 如果點擊的是收藏按鈕，不觸發卡片點擊事件
                if (e.target.closest('.favorite-btn')) {
                    e.stopPropagation();
                    return;
                }
                console.log('卡片被點擊，placeId:', placeId);
                viewRestaurant(placeId);
            });
            
            // 綁定收藏按鈕點擊事件
            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 顯示確認對話框
                    if (confirm('確定要取消收藏這家餐廳嗎？')) {
                        await removeFavorite(placeId);
                    }
                });
            }
            
            // 將卡片添加到容器中
            cardsContainer.appendChild(card);
        } catch (error) {
            console.error(`渲染餐廳卡片失敗:`, error);
        }
    }
    
    console.log('收藏店家渲染完成');
}

// 渲染收藏評論列表
function renderFavoriteReviews(reviews) {
    const reviewsContainer = document.querySelector('.favorites-reviews');
    
    if (!reviewsContainer) {
        console.error('找不到收藏評論容器');
        return;
    }
    
    if (!reviews || reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏任何心得</div>';
        return;
    }
    
    reviewsContainer.innerHTML = reviews.map(review => {
        // 處理使用者頭像 - 使用後端資料
        let avatarUrl = '';
        const userId = review.userId || review.user_id;
        
        if (review.avatar || review.userAvatar || review.avatarUrl) {
            avatarUrl = review.avatar || review.userAvatar || review.avatarUrl;
        } else if (userId) {
            // 使用後端API獲取用戶頭像
            avatarUrl = `${window.API_BASE_URL || 'http://localhost:8080/api'}/users/${userId}/avatar`;
        }
        
        // 如果沒有有效的頭像URL，使用預設頭像
        if (!avatarUrl) {
            avatarUrl = `${window.API_BASE_URL || 'http://localhost:8080/api'}/default-avatar`;
        }
        
        return `
        <div class="review-card">
            <div class="review-header">
                <img src="${avatarUrl}" 
                     alt="${review.author || review.reviewerName || review.userName || '匿名'}" 
                     class="reviewer-avatar" 
                     onerror="this.onerror=null; this.src='${window.API_BASE_URL}/default-avatar';">
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
    `}).join('');
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
async function removeFavorite(id) {
    if (!id) {
        console.error('移除收藏失敗: 未提供餐廳ID');
        showToast('移除收藏失敗，請稍後再試');
        return;
    }

    console.log(`移除收藏餐廳: ${id}`);
    
    // 獲取用戶ID
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('移除收藏失敗: 未找到用戶ID');
        showToast('請先登入後再操作');
        return;
    }

    try {
        // 先顯示載入狀態
        const removeBtn = document.querySelector(`.btn-remove[onclick="removeFavorite('${id}')"]`);
        if (removeBtn) {
            removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 移除中...';
            removeBtn.disabled = true;
        }
        
        // 發送API請求移除收藏
        const url = `${API_BASE_URL}${FAVORITES_API_PATH}/${userId}/favorites/restaurants/${id}`;
        const response = await fetch(url, { method: 'DELETE' });
        
        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
        }
        
        const body = await response.json();
        if (!body.success) {
            throw new Error(body.message || '移除收藏失敗');
        }
        
        console.log(`成功透過API移除收藏: ${id}`);
        
        // 同時更新localStorage的快取資料
        const storedFavorites = localStorage.getItem('favoriteStores');
        if (storedFavorites) {
            let favorites = JSON.parse(storedFavorites);
            
            // 過濾掉要移除的餐廳
            favorites = favorites.filter(store => {
                const storeId = store.place_id || store.id;
                return storeId !== id;
            });
            
            // 保存回localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(favorites));
            console.log(`本地快取也已更新，移除 ${id}`);
        }
        
        // 顯示成功訊息
        showToast('已移除收藏', 'success');
        
        // 從DOM中移除對應的餐廳卡片
        removeCardFromDOM(id);
        
        return;
    } catch (error) {
        console.error('移除收藏時發生錯誤:', error);
        
        // 回復按鈕狀態
        const removeBtn = document.querySelector(`.btn-remove[onclick="removeFavorite('${id}')"]`);
        if (removeBtn) {
            removeBtn.innerHTML = '<i class="fas fa-trash"></i> 移除';
            removeBtn.disabled = false;
        }
        
        // 顯示錯誤訊息
        showToast(error.message || '移除收藏失敗，請稍後再試', 'error');
        
        // 嘗試從本地快取移除（作為備用方案）
        try {
            const storedFavorites = localStorage.getItem('favoriteStores');
            if (storedFavorites) {
                let favorites = JSON.parse(storedFavorites);
                
                // 過濾掉要移除的餐廳
                favorites = favorites.filter(store => {
                    const storeId = store.place_id || store.id;
                    return storeId !== id;
                });
                
                // 保存回localStorage
                localStorage.setItem('favoriteStores', JSON.stringify(favorites));
                console.log(`API請求失敗，但已從本地快取移除 ${id}`);
                
                // 從DOM中移除對應的餐廳卡片
                removeCardFromDOM(id);
                
                showToast('已從本地移除收藏，但未能同步到伺服器', 'warning');
            }
        } catch (localError) {
            console.error('從本地快取移除收藏失敗:', localError);
        }
    }
}

// 從DOM中移除餐廳卡片
function removeCardFromDOM(placeId) {
    const card = document.querySelector(`.restaurant-card[data-id="${placeId}"]`);
    if (card) {
        // 添加淡出動畫效果
        card.style.transition = 'opacity 0.5s ease';
        card.style.opacity = '0';
        
        // 動畫結束後移除元素
        setTimeout(() => {
            card.remove();
            
            // 檢查是否還有其他卡片
            const remainingCards = document.querySelectorAll('.restaurant-card');
            if (remainingCards.length === 0) {
                const storesContainer = document.querySelector('.favorites-stores');
                if (storesContainer) {
                    storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
                }
            }
        }, 500);
    }
}

// 顯示 Toast 提示訊息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
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
async function removeFavoriteReview(reviewId) {
    if (!reviewId) {
        console.error('移除收藏評論失敗: 缺少評論 ID');
        showToast('無法移除收藏評論: 缺少評論 ID');
        return;
    }
    
    console.log(`移除收藏評論: ${reviewId}`);
    
    // 獲取用戶ID
    const userId = localStorage.getItem('userId');
    if (!userId) {
        console.error('移除收藏評論失敗: 未找到用戶ID');
        showToast('請先登入後再操作');
        return;
    }
    
    try {
        // 先顯示載入狀態
        const removeBtn = document.querySelector(`button[onclick="removeFavoriteReview(${reviewId})"]`);
        if (removeBtn) {
            const originalText = removeBtn.innerHTML;
            removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 移除中...';
            removeBtn.disabled = true;
        }
        
        // 發送API請求移除收藏評論
        const response = await fetch(`${API_BASE_URL}/user/${userId}/favorites`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                target_id: reviewId,
                target_type: 'review'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
        }
        
        console.log(`成功透過API移除收藏評論: ${reviewId}`);
        
        // 同時更新localStorage的快取資料
        const storedReviews = localStorage.getItem('favoriteReviews');
        if (storedReviews) {
            let favoriteReviews = JSON.parse(storedReviews);
            
            // 過濾掉要移除的評論
            favoriteReviews = favoriteReviews.filter(review => {
                const id = review.id || review.reviewId;
                return id != reviewId; // 使用!=而非!==以處理數字和字符串的比較
            });
            
            // 保存回localStorage
            localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
            console.log(`本地快取也已更新，移除評論 ${reviewId}`);
        }
        
        // 顯示成功訊息
        showToast('已從收藏評論中移除');
        
        // 重新載入收藏評論列表
        await loadFavorites('reviews');
    } catch (error) {
        console.error('移除收藏評論失敗:', error);
        
        // 回復按鈕狀態
        const removeBtn = document.querySelector(`button[onclick="removeFavoriteReview(${reviewId})"]`);
        if (removeBtn) {
            removeBtn.innerHTML = '取消收藏';
            removeBtn.disabled = false;
        }
        
        // 顯示錯誤訊息
        showToast(`移除收藏評論失敗: ${error.message || '請稍後再試'}`);
        
        // 嘗試從本地快取移除（作為備用方案）
        try {
            const storedReviews = localStorage.getItem('favoriteReviews');
            if (storedReviews) {
                let favoriteReviews = JSON.parse(storedReviews);
                
                // 過濾掉要移除的評論
                favoriteReviews = favoriteReviews.filter(review => {
                    const id = review.id || review.reviewId;
                    return id != reviewId;
                });
                
                // 保存回localStorage
                localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
                console.log(`API請求失敗，但已從本地快取移除評論 ${reviewId}`);
                
                // 重新載入收藏評論列表
                await loadFavorites('reviews');
                showToast('已從本地移除收藏評論，但未能同步到伺服器');
            }
        } catch (localError) {
            console.error('從本地快取移除收藏評論失敗:', localError);
        }
    }
}

// 查看餐廳詳情
async function viewRestaurant(restaurantId) {
    console.log('查看餐廳詳情:', restaurantId);
    
    try {
        // 優先從 API 獲取最新的餐廳詳情
        const apiBaseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
        const apiUrl = `${apiBaseUrl}/restaurants/${restaurantId}`;
        
        console.log('從 API 獲取餐廳詳情:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (response.ok) {
            // 如果 API 請求成功，使用 API 返回的數據
            const restaurantData = await response.json();
            console.log('成功從 API 獲取餐廳詳情:', restaurantData);
            
            // 確保有位置數據
            if (!restaurantData.geometry && (restaurantData.lat || restaurantData.latitude)) {
                restaurantData.geometry = {
                    location: {
                        lat: restaurantData.lat || restaurantData.latitude,
                        lng: restaurantData.lng || restaurantData.longitude
                    }
                };
            }
            
            // 保留原始圖片資訊
            if (!restaurantData.photos && restaurantData.photo_url) {
                restaurantData.photos = [restaurantData.photo_url];
            }
            
            // 顯示餐廳詳情
            if (window.RestaurantModal && typeof window.RestaurantModal.showRestaurantDetail === 'function') {
                window.RestaurantModal.showRestaurantDetail(restaurantData);
            } else {
                console.error('RestaurantModal 未初始化');
                showToast('無法顯示餐廳詳情，請重新整理頁面');
            }
        } else {
            // 如果 API 請求失敗，嘗試使用本地數據
            console.warn('API 請求失敗，使用本地數據:', response.status);
            
            // 從收藏系統中獲取餐廳數據
            if (window.favoriteSystem && typeof window.favoriteSystem.getRestaurantById === 'function') {
                const localRestaurant = await window.favoriteSystem.getRestaurantById(restaurantId);
                
                if (localRestaurant) {
                    console.log('使用本地餐廳數據:', localRestaurant);
                    
                    // 確保有位置數據
                    if (!localRestaurant.geometry && (localRestaurant.lat || localRestaurant.latitude)) {
                        localRestaurant.geometry = {
                            location: {
                                lat: localRestaurant.lat || localRestaurant.latitude,
                                lng: localRestaurant.lng || localRestaurant.longitude
                            }
                        };
                    }
                    
                    // 保留原始圖片資訊
                    if (!localRestaurant.photos && localRestaurant.photo_url) {
                        localRestaurant.photos = [localRestaurant.photo_url];
                    }
                    
                    // 顯示餐廳詳情
                    if (window.RestaurantModal && typeof window.RestaurantModal.showRestaurantDetail === 'function') {
                        window.RestaurantModal.showRestaurantDetail(localRestaurant);
                    } else {
                        console.error('RestaurantModal 未初始化');
                        showToast('無法顯示餐廳詳情，請重新整理頁面');
                    }
                } else {
                    console.error('找不到餐廳數據:', restaurantId);
                    showToast('找不到餐廳資訊');
                }
            } else {
                console.error('favoriteSystem 未初始化');
                showToast('系統錯誤，請重新整理頁面');
            }
        }
    } catch (error) {
        console.error('顯示餐廳詳情時出錯:', error);
        showToast('顯示餐廳詳情時出錯');
    }
}

// 備用的餐廳詳情顯示函數
function showRestaurantDetailFallback(restaurant) {
    console.log('使用備用方案顯示餐廳詳情:', restaurant);
    
    // 從不同可能的數據結構中提取餐廳信息
    const restaurantData = restaurant.restaurant || restaurant;
    const restaurantName = restaurantData.name || '未知餐廳';
    const rating = parseFloat(restaurantData.rating) || parseFloat(restaurantData.average_rating) || 0;
    const ratingCount = restaurantData.user_ratings_total || restaurantData.review_count || restaurant.reviewCount || 0;
    const address = restaurantData.formatted_address || restaurantData.vicinity || restaurantData.address || '地址不詳';
    const isOpen = restaurantData.opening_hours?.open_now || restaurantData.isOpen || false;
    const placeId = restaurantData.place_id || restaurantData.id || restaurant.target_id || restaurant.id;
    
    // 確保 API_BASE_URL 存在
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 使用新的圖片URL構建函數
    let photoUrl = `${baseUrl}/restaurant-images/${placeId}/raw`;
    
    // 如果有photo_url直接使用
    if (restaurantData.photo_url) {
        photoUrl = restaurantData.photo_url;
    } else if (restaurantData.photos && Array.isArray(restaurantData.photos) && restaurantData.photos.length > 0) {
        const photo = restaurantData.photos[0];
        if (typeof photo === 'string') {
            photoUrl = photo;
        } else if (photo && typeof photo === 'object') {
            photoUrl = photo.url || photo.photo_url || photoUrl;
        }
    }
    
    console.log(`餐廳詳情圖片URL: ${photoUrl} (ID: ${placeId})`);
    
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
        
        if (nameElement) nameElement.textContent = restaurantName;
        
        if (imageElement) {
            imageElement.src = photoUrl;
            imageElement.alt = restaurantName;
            imageElement.onerror = function() {
                this.src = 'images/no-image.jpg';
            };
        }
        
        if (starsElement) starsElement.textContent = generateStars(rating);
        if (ratingElement) ratingElement.textContent = rating.toFixed(1);
        if (ratingCountElement) ratingCountElement.textContent = `(${ratingCount}則評論)`;
        if (addressElement) addressElement.textContent = address;
        
        if (statusElement && statusTextElement) {
            if (isOpen) {
                statusElement.classList.add('open');
                statusElement.classList.remove('closed');
                statusTextElement.textContent = '營業中';
            } else {
                statusElement.classList.add('closed');
                statusElement.classList.remove('open');
                statusTextElement.textContent = '休息中';
            }
        }
        
        // 檢查是否有營業時間
        const todayHoursElement = document.getElementById('modal-today-hours-new');
        if (todayHoursElement) {
            if (restaurantData.opening_hours && restaurantData.opening_hours.weekday_text) {
                const today = new Date().getDay();
                const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引
                if (restaurantData.opening_hours.weekday_text[index]) {
                    todayHoursElement.textContent = restaurantData.opening_hours.weekday_text[index].split(': ')[1] || '未提供營業時間';
                } else {
                    todayHoursElement.textContent = '未提供營業時間';
                }
            } else {
                todayHoursElement.textContent = '未提供營業時間';
            }
        }
        
        // 處理收藏按鈕
        const favoriteBtn = document.getElementById('modal-favorite-btn-new');
        if (favoriteBtn) {
            // 檢查是否已收藏
            const isFavorite = true; // 在收藏列表中顯示的餐廳，必然是已收藏的
            
            // 更新收藏按鈕狀態
            if (isFavorite) {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                favoriteBtn.classList.add('active');
            } else {
                favoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
                favoriteBtn.classList.remove('active');
            }
            
            // 綁定收藏按鈕點擊事件
            favoriteBtn.onclick = function() {
                if (isFavorite) {
                    // 如果已收藏，則取消收藏
                    if (confirm('確定要取消收藏這家餐廳嗎？')) {
                        removeFavorite(placeId);
                        closeModal();
                    }
                }
            };
        }
        
        // 處理導航按鈕
        const directionBtn = document.getElementById('modal-direction-btn-new');
        if (directionBtn) {
            directionBtn.onclick = function() {
                openGoogleMaps(address);
            };
        }
        
        // 顯示彈窗
        newModal.classList.add('active');
        
        // 綁定關閉按鈕
        const closeBtn = document.querySelector('.restaurant-modal-close-new');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }
        
        // 點擊彈窗外部關閉
        newModal.onclick = function(e) {
            if (e.target === newModal) {
                closeModal();
            }
        };
    } else {
        console.log('找不到新版彈窗元素，嘗試使用舊版彈窗');
        
        // 使用舊版彈窗
        const oldModal = document.getElementById('restaurantModal');
        if (oldModal) {
            // 填充舊版彈窗內容
            const nameElement = document.getElementById('modal-restaurant-name');
            if (nameElement) nameElement.textContent = restaurantName;
            
            const modalImg = document.getElementById('modal-restaurant-img');
            if (modalImg) {
                modalImg.src = photoUrl;
                modalImg.alt = restaurantName;
                modalImg.onerror = function() {
                    this.src = 'images/no-image.jpg';
                };
            }
            
            const starsElement = document.getElementById('modal-stars');
            if (starsElement) starsElement.textContent = generateStars(rating);
            
            const ratingElement = document.getElementById('modal-rating');
            if (ratingElement) ratingElement.textContent = rating.toFixed(1);
            
            const ratingCountElement = document.getElementById('modal-rating-count');
            if (ratingCountElement) ratingCountElement.textContent = `(${ratingCount}則評論)`;
            
            const addressElement = document.getElementById('modal-address');
            if (addressElement) addressElement.textContent = address;
            
            // 顯示彈窗
            oldModal.style.display = 'block';
            
            // 綁定關閉按鈕
            const closeBtn = document.querySelector('.restaurant-modal-close');
            if (closeBtn) {
                closeBtn.onclick = function() {
                    oldModal.style.display = 'none';
                };
            }
            
            // 點擊彈窗外部關閉
            window.onclick = function(e) {
                if (e.target === oldModal) {
                    oldModal.style.display = 'none';
                }
            };
        } else {
            console.error('找不到任何可用的彈窗元素');
            showToast('無法顯示餐廳詳情，請稍後再試');
        }
    }
    
    function closeModal() {
        if (newModal) {
            newModal.classList.remove('active');
        }
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
        let filteredNotifications = mockNotifications.filter(notification => notification.type !== 'order');
        if (typeFilter !== 'all') {
            filteredNotifications = filteredNotifications.filter(notification => notification.type === typeFilter);
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
        // 過濾掉訂單類型的通知
        const filteredNotifications = Array.isArray(notificationsData) 
            ? notificationsData.filter(notification => notification.type !== 'order')
            : [];
        renderNotifications(filteredNotifications);
        
        // 添加標記所有通知為已讀的按鈕
        if (filteredNotifications.length > 0) {
            addMarkAllAsReadButton(notificationsList);
        }
        
        // 自動標記通知為已讀（如果存在通知服務模組）
        if (window.NotificationService && typeof window.NotificationService.markAllAsRead === 'function') {
            window.NotificationService.markAllAsRead();
        }
    })
    .catch(error => {
        console.error('獲取通知資料失敗:', error);
        // 使用假資料作為備用
        let filteredNotifications = mockNotifications.filter(notification => notification.type !== 'order');
        if (typeFilter !== 'all') {
            filteredNotifications = filteredNotifications.filter(notification => notification.type === typeFilter);
        }
        renderNotifications(filteredNotifications);
        
        // 添加標記所有通知為已讀的按鈕
        if (filteredNotifications.length > 0) {
            addMarkAllAsReadButton(notificationsList);
        }
    });
    
    // 渲染通知列表
    function renderNotifications(notifications) {
        if (notifications.length === 0) {
            notificationsList.innerHTML = '<div class="no-data">沒有找到相關通知</div>';
            return;
        }

        notificationsList.innerHTML = notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
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
        
        // 添加點擊事件，點擊通知時標記為已讀
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                markNotificationAsRead(notificationId, this);
            });
        });
    }
}

// 添加標記所有通知為已讀的按鈕
function addMarkAllAsReadButton(container) {
    // 檢查是否已存在該按鈕
    if (document.getElementById('mark-all-as-read-btn')) return;
    
    // 創建按鈕容器，便於定位
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mark-all-read-container';
    buttonContainer.style.marginBottom = '15px';  // 增加底部間距
    buttonContainer.style.textAlign = 'right';    // 將按鈕靠右對齊
    
    // 創建按鈕
    const markAllBtn = document.createElement('button');
    markAllBtn.id = 'mark-all-as-read-btn';
    markAllBtn.className = 'btn-primary';
    markAllBtn.style.padding = '8px 15px';
    markAllBtn.style.borderRadius = '4px';
    markAllBtn.style.fontSize = '14px';
    markAllBtn.style.cursor = 'pointer';
    markAllBtn.textContent = '標記所有為已讀';
    
    // 添加點擊事件
    markAllBtn.addEventListener('click', function() {
        if (window.NotificationService && typeof window.NotificationService.markAllAsRead === 'function') {
            window.NotificationService.markAllAsRead()
                .then(success => {
                    if (success) {
                        // 重新載入通知列表
                        loadNotifications('all');
                        showToast('已將所有通知標記為已讀');
                    }
                });
        } else {
            // 如果沒有通知服務模組，直接更新UI
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
                item.querySelector('.unread-indicator')?.remove();
            });
            showToast('已將所有通知標記為已讀');
            buttonContainer.remove(); // 移除整個容器
        }
    });
    
    // 將按鈕添加到容器中
    buttonContainer.appendChild(markAllBtn);
    
    // 獲取篩選欄，將按鈕容器插入到篩選欄之後、通知列表之前
    const filterBar = document.querySelector('#notifications .filter-bar');
    if (filterBar) {
        filterBar.insertAdjacentElement('afterend', buttonContainer);
    } else {
        // 如果找不到篩選欄，則插入到通知列表之前
        container.insertAdjacentElement('beforebegin', buttonContainer);
    }
}

// 標記單個通知為已讀
function markNotificationAsRead(notificationId, element) {
    if (!notificationId) return;
    
    // 如果有通知服務模組，使用其標記為已讀功能
    if (window.NotificationService && typeof window.NotificationService.markAsRead === 'function') {
        window.NotificationService.markAsRead(notificationId)
            .then(success => {
                if (success && element) {
                    element.classList.remove('unread');
                    element.querySelector('.unread-indicator')?.remove();
                }
            });
    } else {
        // 否則僅更新UI
        if (element) {
            element.classList.remove('unread');
            element.querySelector('.unread-indicator')?.remove();
        }
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
    
    // 準備分析數據
    const analyticsData = {
        reviews: {
            totalReviews: 8,
            averageRating: 4.5,
            totalLikes: 3
        },
        favorites: {
            totalFavoriteStores: 0,
            totalFavoriteReviews: 0,
            newThisMonth: 0
        }
    };
    
    // 立即獲取實際的收藏數據
    try {
        // 獲取收藏店家數量
        const favoriteStores = getFavoriteStores();
        analyticsData.favorites.totalFavoriteStores = favoriteStores.length;
        
        // 獲取收藏評論數量
        const favoriteReviews = getFavoriteReviews();
        analyticsData.favorites.totalFavoriteReviews = favoriteReviews.length;
        
        // 本月新增暫時用固定值
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        // 計算本月新增收藏數量
        const newThisMonthStores = favoriteStores.filter(store => {
            const favoriteDate = new Date(store.favoriteTime || store.createdAt || store.addedAt || Date.now());
            return favoriteDate.getMonth() === thisMonth && favoriteDate.getFullYear() === thisYear;
        }).length;
        
        const newThisMonthReviews = favoriteReviews.filter(review => {
            const favoriteDate = new Date(review.favoriteTime || review.createdAt || review.addedAt || Date.now());
            return favoriteDate.getMonth() === thisMonth && favoriteDate.getFullYear() === thisYear;
        }).length;
        
        analyticsData.favorites.newThisMonth = newThisMonthStores + newThisMonthReviews;
        
        console.log('收藏統計數據:', analyticsData.favorites);
    } catch (error) {
        console.error('獲取收藏數據失敗:', error);
    }
    
    // 更新分析數據顯示
    updateAnalyticsDisplay(analyticsData);
}

// 更新數據分析顯示
function updateAnalyticsDisplay(data) {
    // 評論統計
    if (data.reviews) {
        const reviewsContent = document.querySelector('.analytics-card:nth-child(1) .card-content');
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
        const favoritesContent = document.querySelector('.analytics-card:nth-child(2) .card-content');
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
    const tabBtns = document.querySelectorAll('.view-toggle .toggle-btn');
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
            // 移除所有頁籤的active類別
            tabBtns.forEach(b => b.classList.remove('active'));
            // 為當前點擊的頁籤添加active類別
            this.classList.add('active');
            
            const view = this.getAttribute('data-view');
            console.log(`切換到收藏頁籤: ${view}`);
            
            // 切換顯示內容
            if (view === 'stores') {
                favoritesStores.style.display = 'grid';
                favoritesReviews.style.display = 'none';
                loadFavorites('stores');
            } else if (view === 'reviews') {
                favoritesStores.style.display = 'none';
                favoritesReviews.style.display = 'grid';
                loadFavorites('reviews');
            }
        });
    });
    
    // 默認載入店家收藏
    const activeTab = document.querySelector('.view-toggle .toggle-btn.active');
    const defaultView = activeTab ? activeTab.getAttribute('data-view') : 'stores';
    
    // 確保正確的頁籤處於激活狀態
    if (defaultView === 'stores') {
        favoritesStores.style.display = 'grid';
        favoritesReviews.style.display = 'none';
    } else if (defaultView === 'reviews') {
        favoritesStores.style.display = 'none';
        favoritesReviews.style.display = 'grid';
    }
    
    loadFavorites(defaultView);
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
        const validSections = ['profile', 'analytics', 'reviews', 'notifications', 'favorites', 'settings'];
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
    console.log('設置事件監聽');
    
    // 設置選單項目點擊事件
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
            
            // 更新URL hash
            window.location.hash = section;
        });
    });
    
    // 設置評論過濾器
    const reviewRatingSelect = document.getElementById('reviewRating');
    if (reviewRatingSelect) {
        reviewRatingSelect.addEventListener('change', function() {
            const rating = this.value;
            loadReviews(rating);
        });
    }
    
    // 設置通知過濾按鈕
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const type = this.getAttribute('data-type');
            filterNotifications(type);
        });
    });
    
    // 設置時間範圍選擇器
    document.querySelectorAll('.time-range-select').forEach(select => {
        select.addEventListener('change', function() {
            const timeRange = this.value;
            const cardType = this.closest('.analytics-card').querySelector('h3').textContent.trim();
            
            // 更新所有卡片的時間範圍
            document.querySelectorAll('.time-range-select').forEach(s => {
                s.value = timeRange;
            });
            
            // 重新載入相應的數據
            loadAnalyticsData(timeRange);
        });
    });
    
    // 設置設定表單提交事件
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateSettings();
        });
    }
    
    // 添加收藏狀態變化的監聽
    document.addEventListener('favoriteChanged', function(event) {
        console.log('收藏狀態變化:', event.detail);
        // 立即更新數據分析頁面的收藏統計
        updateFavoriteStats();
    });
    
    // 同時監聽來自favoriteButton.js的事件
    document.addEventListener('favoritesChanged', function(event) {
        console.log('收藏變更事件被觸發，更新統計數據');
        updateFavoriteStats();
    });
    
    // 添加URL Hash變化的監聽
    window.addEventListener('hashchange', handleURLHash);
    
    // 設置個人資料更新按鈕
    const updateProfileBtn = document.querySelector('.update-profile-btn');
    if (updateProfileBtn) {
        updateProfileBtn.addEventListener('click', function() {
            updateProfile();
        });
    }
    
    // 監聽收藏相關操作
    document.querySelector('.favorites-stores')?.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-favorite-btn');
        if (removeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const cardElement = removeBtn.closest('.restaurant-card');
            const placeId = cardElement.getAttribute('data-id');
            if (placeId) {
                removeFavorite(placeId);
                // 在移除收藏後觸發事件以更新統計數據
                document.dispatchEvent(new CustomEvent('favoriteChanged', {
                    detail: { type: 'remove', id: placeId }
                }));
            }
        }
    });
    
    // 監聽收藏評論操作
    document.querySelector('.favorites-reviews')?.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-favorite-review-btn');
        if (removeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const reviewCard = removeBtn.closest('.review-card');
            const reviewId = reviewCard.getAttribute('data-id');
            if (reviewId) {
                removeFavoriteReview(reviewId);
                // 在移除收藏評論後觸發事件以更新統計數據
                document.dispatchEvent(new CustomEvent('favoriteChanged', {
                    detail: { type: 'remove', id: reviewId, isReview: true }
                }));
            }
        }
    });
}

// 立即更新數據分析頁面的收藏統計
function updateFavoriteStats() {
    console.log('立即更新收藏統計數據');
    
    try {
        // 獲取收藏店家數量
        const favoriteStores = getFavoriteStores();
        const totalFavoriteStores = favoriteStores.length;
        
        // 獲取收藏評論數量
        const favoriteReviews = getFavoriteReviews();
        const totalFavoriteReviews = favoriteReviews.length;
        
        // 更新UI顯示
        const favoritesCard = document.querySelector('.analytics-card:nth-child(2)');
        if (favoritesCard) {
            const statsValues = favoritesCard.querySelectorAll('.stat-value');
            if (statsValues.length >= 2) {
                // 更新收藏店家數
                statsValues[0].textContent = totalFavoriteStores;
                // 更新收藏評論數
                statsValues[1].textContent = totalFavoriteReviews;
            }
        }
        
        console.log(`收藏統計已更新: 店家 ${totalFavoriteStores}, 評論 ${totalFavoriteReviews}`);
    } catch (error) {
        console.error('更新收藏統計數據失敗:', error);
    }
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
        
        // 如果切換到數據分析區塊，立即更新收藏統計數據
        if (sectionId === 'analytics') {
            loadAnalyticsData();
            updateFavoriteStats();
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

// 在 DOMContentLoaded 時初始化
document.addEventListener('DOMContentLoaded', initializeUserCenter);

