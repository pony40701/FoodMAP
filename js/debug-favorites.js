// 收藏系統調試腳本
('開始調試收藏系統...');

// 檢查登入狀態
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId');
    ('登入狀態檢查:', { isLoggedIn, userId });
    return { isLoggedIn, userId };
}

// 檢查收藏數據
function checkFavoriteData() {
    ('檢查收藏數據...');
    
    // 從 localStorage 讀取
    try {
        const favoriteStores = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
        ('本地收藏餐廳數據:', favoriteStores);
        ('收藏餐廳數量:', favoriteStores.length);
        
        if (favoriteStores.length > 0) {
            ('第一個收藏餐廳:', favoriteStores[0]);
        }
    } catch (error) {
        console.error('解析收藏餐廳數據失敗:', error);
    }
}

// 檢查收藏系統對象
function checkFavoriteSystem() {
    ('檢查收藏系統對象...');
    
    if (window.favoriteSystem) {
        ('收藏系統存在:', window.favoriteSystem);
        ('收藏系統已初始化:', window.favoriteSystem.initialized);
        ('API模式:', window.favoriteSystem.useApi);
        ('用戶ID:', window.favoriteSystem.userId);
        ('收藏餐廳數量:', window.favoriteSystem.stores.length);
        
        if (window.favoriteSystem.stores.length > 0) {
            ('收藏餐廳列表:', window.favoriteSystem.stores);
        }
    } else {
        console.error('收藏系統對象不存在!');
    }
}

// 檢查餐廳服務
function checkRestaurantService() {
    ('檢查餐廳服務...');
    
    if (window.restaurantService) {
        ('餐廳服務存在:', window.restaurantService);
        ('餐廳服務已初始化:', window.restaurantService.initialized);
        ('餐廳數據已加載:', window.restaurantService.dataLoaded);
        ('API數據餐廳數量:', window.restaurantService.apiData.length);
    } else {
        console.error('餐廳服務對象不存在!');
    }
}

// 創建模擬的餐廳數據
function createMockRestaurantData() {
    ('創建模擬的餐廳數據...');
    
    const mockRestaurants = [
        {
            place_id: 'mock_place_1',
            id: 'mock_place_1',
            name: '模擬餐廳 1',
            rating: 4.5,
            user_ratings_total: 123,
            formatted_address: '模擬地址 1',
            photos: [
                { 
                    url: 'https://via.placeholder.com/300x200?text=Mock+Restaurant+1' 
                }
            ]
        },
        {
            place_id: 'mock_place_2',
            id: 'mock_place_2',
            name: '模擬餐廳 2',
            rating: 4.2,
            user_ratings_total: 98,
            formatted_address: '模擬地址 2',
            photos: [
                { 
                    url: 'https://via.placeholder.com/300x200?text=Mock+Restaurant+2' 
                }
            ]
        },
        {
            place_id: 'mock_place_3',
            id: 'mock_place_3',
            name: '模擬餐廳 3',
            rating: 3.8,
            user_ratings_total: 75,
            formatted_address: '模擬地址 3',
            photos: [
                { 
                    url: 'https://via.placeholder.com/300x200?text=Mock+Restaurant+3' 
                }
            ]
        }
    ];
    
    return mockRestaurants;
}

// 添加模擬數據到收藏系統
async function addMockDataToFavorites() {
    ('添加模擬數據到收藏系統...');
    
    // 檢查收藏系統
    if (!window.favoriteSystem) {
        console.error('收藏系統對象不存在，無法添加模擬數據!');
        return;
    }
    
    if (!window.favoriteSystem.initialized) {
        ('收藏系統未初始化，開始初始化...');
        await window.favoriteSystem.initialize();
    }
    
    // 清空當前收藏
    window.favoriteSystem.stores = [];
    
    // 添加模擬數據
    const mockRestaurants = createMockRestaurantData();
    mockRestaurants.forEach(restaurant => {
        window.favoriteSystem.stores.push({
            id: restaurant.id,
            place_id: restaurant.place_id,
            name: restaurant.name,
            rating: restaurant.rating,
            user_ratings_total: restaurant.user_ratings_total,
            formatted_address: restaurant.formatted_address,
            photos: restaurant.photos
        });
    });
    
    // 更新本地存儲
    localStorage.setItem('favoriteStores', JSON.stringify(window.favoriteSystem.stores));
    ('已添加模擬數據到收藏系統，數量:', window.favoriteSystem.stores.length);
    
    // 觸發收藏更改事件
    if (typeof window.favoriteSystem.triggerFavoritesChangedEvent === 'function') {
        window.favoriteSystem.triggerFavoritesChangedEvent();
    }
}

// 檢查 renderFavoriteStores 函數
function checkRenderFunction() {
    ('檢查 renderFavoriteStores 函數...');
    
    if (typeof window.renderFavoriteStores === 'function') {
        ('renderFavoriteStores 函數存在');
    } else {
        console.error('renderFavoriteStores 函數不存在!');
    }
    
    if (typeof window.loadFavorites === 'function') {
        ('loadFavorites 函數存在');
    } else {
        console.error('loadFavorites 函數不存在!');
    }
}

// 直接渲染模擬收藏餐廳
async function directRenderMockFavorites() {
    ('直接渲染模擬收藏餐廳...');
    
    const mockRestaurants = createMockRestaurantData();
    const storesContainer = document.querySelector('.favorites-stores');
    
    if (!storesContainer) {
        console.error('找不到收藏餐廳容器!');
        return;
    }
    
    // 使用模擬數據生成HTML
    storesContainer.innerHTML = mockRestaurants.map(restaurant => {
        const stars = '★'.repeat(Math.round(restaurant.rating)) + '☆'.repeat(5 - Math.round(restaurant.rating));
        
        return `
        <div class="restaurant-card" data-id="${restaurant.place_id}">
            <div class="card-image">
                <img src="${restaurant.photos[0].url}" alt="${restaurant.name}">
                <button class="favorite-btn active" data-place-id="${restaurant.place_id}" data-name="${restaurant.name}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="card-content">
                <h3 class="card-title">${restaurant.name}</h3>
                <div class="card-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-value">${restaurant.rating.toFixed(1)}</span>
                    <span class="reviews-count">(${restaurant.user_ratings_total})</span>
                </div>
                <div class="card-address">
                    <i class="fas fa-map-marker-alt"></i> ${restaurant.formatted_address}
                </div>
                <div class="card-actions">
                    <button class="btn-view" onclick="viewRestaurant('${restaurant.place_id}')">
                        <i class="fas fa-eye"></i> 查看
                    </button>
                    <button class="btn-remove" onclick="removeFavorite('${restaurant.place_id}')">
                        <i class="fas fa-trash"></i> 移除
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    ('已直接渲染模擬收藏餐廳');
}

// 執行調試函數
document.addEventListener('DOMContentLoaded', async function() {
    ('調試腳本已載入');
    
    // 檢查各項狀態
    checkLoginStatus();
    checkFavoriteData();
    checkFavoriteSystem();
    checkRestaurantService();
    
    // 等待 2 秒後進行下一步
    setTimeout(async function() {
        ('開始進行模擬數據測試...');
        
        // 添加模擬數據並渲染
        await addMockDataToFavorites();
        checkRenderFunction();
        await directRenderMockFavorites();
        
        ('調試完成');
    }, 2000);
}); 