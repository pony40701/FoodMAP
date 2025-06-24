// ====== 分類顯示名稱對應表（請放在檔案最上方） ======
const typeDisplayName = {
    'restaurant': '餐廳',
    '中式': '中式',
    '美式': '美式',
    '韓式': '韓式',
    '義式': '義式',
    '法式': '法式',
    '泰式': '泰式',
    '火鍋': '火鍋',
    '牛排': '牛排',
    '燒烤': '燒烤',
    '飲品': '飲品',
    '異國料理': '異國料理',
    '素食': '素食'
};

// ====== 分類同義詞對應表（新增） ======
const typeAlias = {
    '素食': ['素食', '蔬食', 'vegan', 'vegetarian'],
    '異國料理': ['異國料理', '異國', '異國風味', 'international', 'foreign'],
    '燒烤': ['燒烤', '烤肉', 'bbq', 'barbecue'],
    // 其他分類可依需求擴充
};

// 地圖初始化模組
class MapInit {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentUserLocationMarker = null;
        this.placesService = null;
        this.allRestaurants = []; // 添加存儲所有餐廳的數組
        
        // 定義餐廳類型對應的搜尋關鍵字
        this.cuisineKeywords = {
            '中式': ['chinese restaurant', '中式餐廳', '中式料理', '中菜'],
            '美式': ['american restaurant', '美式餐廳', 'burger', '漢堡'],
            '韓式': ['korean restaurant', '韓式餐廳', '韓國料理', '韓式烤肉'],
            '義式': ['italian restaurant', '義式餐廳', '義大利麵', '披薩'],
            '法式': ['french restaurant', '法式餐廳', '法國料理'],
            '泰式': ['thai restaurant', '泰式餐廳', '泰國菜'],
            '火鍋': ['hot pot restaurant', '火鍋', '涮涮鍋', '麻辣鍋'],
            '牛排': ['steak house', '牛排館', '牛排餐廳'],
            '燒烤': ['bbq restaurant', '燒烤', '烤肉', '串燒'],
            '飲品': ['beverage shop', '飲料店', '手搖飲', '茶飲'],
            '異國料理': ['exotic restaurant', 'international cuisine', '異國料理']
        };

        // 新增食物類型搜尋邏輯
        this.foodTypeKeywords = {
            '中式': ['中餐', '中式料理', '餃子', '麵食', '粥', '炒飯', '湯包', '小籠包'],
            '美式': ['漢堡', '美式餐廳', '炸雞', '牛排館', '美式早餐', '三明治'],
            '韓式': ['韓式料理', '韓國料理', '韓式烤肉', '韓式炸雞', '韓式火鍋', '韓式小菜'],
            '義式': ['義大利麵', '披薩', '義式餐廳', '燉飯', '義大利菜', 'pasta'],
            '法式': ['法式料理', '法國菜', '法式餐廳', '法式甜點', '法式麵包', '法式咖啡'],
            '泰式': ['泰國菜', '泰式料理', '泰式火鍋', '泰式咖哩', '泰式炒飯', '泰式河粉'],
            '火鍋': ['麻辣鍋', '涮涮鍋', '石頭火鍋', '個人鍋', '涮羊肉', '麻辣燙'],
            '牛排': ['牛排館', '排餐', '舒肥牛排', '和牛', '炭烤牛排', '牛排餐廳'],
            '燒烤': ['燒肉', 'BBQ', '串燒', '炭烤', '烤肉', '串烤'],
            '飲品': ['手搖飲', '咖啡廳', '茶飲', '果汁', '冰沙', '奶茶'],
            '異國料理': ['印度菜', '越南菜', '墨西哥菜', '中東料理', '南洋料理', '異國美食']
        };
    }

    async init() {
        try {
            ('初始化地圖功能 (使用本地資料模式)');
            
            // 使用本地資料，不需要初始化真實地圖
            const mapContainer = document.getElementById('map');
            if (mapContainer) {
                mapContainer.style.display = 'none'; // 隱藏地圖容器
            }
            
            // 載入本地資料
            await this.loadLocalData();
            
            // 顯示所有餐廳
            await this.displayAllRestaurants();
            
            return this;
        } catch (error) {
            console.error('初始化地圖時發生錯誤:', error);
            throw error;
        }
    }
    
    // 載入本地資料的方法
    async loadLocalData() {
        try {
            ('開始載入本地餐廳資料...');
            
            // 顯示載入中提示
            this.updateResultsTitle("載入餐廳資料中...");
            
            // 獲取餐廳容器
            let container = document.getElementById('restaurants-container');
            if (container) {
                container.innerHTML = `
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>正在從資料庫載入餐廳資料...</p>
                    </div>
                `;
            }
            
            // 確保 restaurantService 已初始化
            if (!window.restaurantService) {
                console.error('restaurantService 未定義');
                throw new Error('餐廳服務未初始化');
            }
            
            // 從 restaurantService 獲取所有餐廳
            ('從 restaurantService 獲取餐廳資料...');
            this.allRestaurants = await window.restaurantService.getAllRestaurantsJson();
            
            // 檢查是否成功獲取資料
            if (!this.allRestaurants || this.allRestaurants.length === 0) {
                console.error('無法獲取餐廳資料或資料為空');
                this.updateResultsTitle('無法載入餐廳資料');
                if (container) {
                    container.innerHTML = '<div class="no-results">無法載入餐廳資料，請稍後再試</div>';
                }
                return;
            }
            
            (`成功載入 ${this.allRestaurants.length} 間餐廳`);
            
            // 更新結果標題
            this.updateResultsTitle(`所有餐廳 (${this.allRestaurants.length} 間)`);
            
            // 顯示餐廳
            if (window.infiniteScroll) {
                window.infiniteScroll.setRestaurants(this.allRestaurants);
            } else if (window.displayRestaurants) {
                window.displayRestaurants(this.allRestaurants);
            } else {
                this.displayRestaurants(this.allRestaurants);
            }
        } catch (error) {
            console.error('載入餐廳資料時發生錯誤:', error);
            this.updateResultsTitle('載入資料失敗');
            const container = document.getElementById('restaurants-container');
            if (container) {
                container.innerHTML = `<div class="no-results">載入失敗：${error.message}</div>`;
            }
        }
    }

    // 新增顯示所有餐廳的方法
    async displayAllRestaurants() {
        try {
            ('開始載入所有餐廳');
            
            // 獲取餐廳容器
            let container = document.getElementById('restaurants-container');
            if (!container) {
                ('找不到餐廳容器，創建一個新的');
                container = document.createElement('div');
                container.id = 'restaurants-container';
                container.className = 'restaurants-grid';
                document.querySelector('.food-types-section').after(container);
            }
            
            // 從 favoriteService 獲取所有餐廳
            let restaurants = [];
            if (window.favoriteService && typeof window.favoriteService.getAllRestaurantsJson === 'function') {
                restaurants = await window.favoriteService.getAllRestaurantsJson();
                this.allRestaurants = restaurants; // 保存所有餐廳數據
                (`成功載入 ${restaurants.length} 間餐廳`);
                
                // 更新結果標題
                this.updateResultsTitle(`所有餐廳 (共 ${restaurants.length} 間)`);
                
                // 清空容器
                container.innerHTML = '';
                
                // 創建餐廳卡片
                restaurants.forEach(restaurant => {
                    const card = typeof window.createRestaurantCard === 'function' 
                        ? window.createRestaurantCard(restaurant)
                        : this.createRestaurantCard(restaurant);
                    container.appendChild(card);
                });
            }
        } catch (error) {
            console.error('載入餐廳時發生錯誤:', error);
        }
    }

    // 修改搜尋餐廳類型的方法，支援解析 json_raw 裡的 cuisine_type
    async searchByType(type) {
        if (!type) {
            console.error('未指定搜尋類型');
            return;
        }
        try {
            (`開始搜尋 ${type} 類型的餐廳（從 restaurantService 取得資料，並解析 json_raw 分類）`);
            // 直接從 restaurantService 取得所有餐廳資料
            if (!window.restaurantService || typeof window.restaurantService.getAllRestaurantsJson !== 'function') {
                throw new Error('restaurantService 未初始化或缺少 getAllRestaurantsJson 方法');
            }
            const allRestaurants = await window.restaurantService.getAllRestaurantsJson();
            // 獲取餐廳容器
            let container = document.getElementById('restaurants-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'restaurants-container';
                container.className = 'restaurants-grid';
                document.querySelector('.food-types-section').after(container);
            }
            // 顯示載入中提示
            container.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>正在搜尋${type}美食...</p>
                </div>
            `;
            // 取得同義詞陣列
            const aliasList = typeAlias[type] || [type];
            // 從最新資料中篩選，支援 json_raw 分類與同義詞
            let results = allRestaurants.filter(restaurant => {
                let types = [];
                if (restaurant.cuisine_type && Array.isArray(restaurant.cuisine_type)) {
                    types = types.concat(restaurant.cuisine_type);
                }
                if (restaurant.json_raw) {
                    try {
                        const raw = typeof restaurant.json_raw === 'string' ? JSON.parse(restaurant.json_raw) : restaurant.json_raw;
                        if (raw.cuisine_type && Array.isArray(raw.cuisine_type)) {
                            types = types.concat(raw.cuisine_type);
                        }
                    } catch (e) {}
                }
                // 標準化並分割
                types = types.flatMap(t => t.split(/[ ,，、/|]+/)).map(t => t.trim().toLowerCase());
                // 比對同義詞
                if (aliasList.some(alias => types.includes(alias.trim().toLowerCase()))) return true;
                // 關鍵字比對（保留原有）
                const keywords = [...(this.cuisineKeywords[type] || []), ...(this.foodTypeKeywords[type] || [])];
                if (keywords.length > 0) {
                    const searchText = `${restaurant.name} ${restaurant.formatted_address || ''}`.toLowerCase();
                    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
                }
                return false;
            });
            // 更新結果標題
            const displayName = typeDisplayName[type] || type;
            this.updateResultsTitle(`${displayName}餐廳 (找到 ${results.length} 間)`);
            // 統一用 displayRestaurants 顯示分類結果
            if (window.displayRestaurants) {
                window.displayRestaurants(results, true);
            } else {
                // 備用方案
                container.innerHTML = '';
                if (results.length > 0) {
                    results.forEach(restaurant => {
                        const card = typeof window.createRestaurantCard === 'function' 
                            ? window.createRestaurantCard(restaurant)
                            : this.createRestaurantCard(restaurant);
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = `<div class="no-results">找不到${displayName}類型的餐廳</div>`;
                }
            }
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗');
            const container = document.getElementById('restaurants-container');
            if (container) {
                container.innerHTML = '<div class="no-results">搜尋失敗，請稍後再試</div>';
            }
        }
    }

    // 備用的餐廳顯示方法
    displayRestaurants(restaurants) {
        const container = document.getElementById('restaurants-container');
        if (!container) return;

        container.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const card = this.createRestaurantCard(restaurant);
            container.appendChild(card);
        });
    }

    // 備用的餐廳卡片創建方法
    createRestaurantCard(restaurant) {
        const card = document.createElement('div');
        card.className = 'restaurant-card v3';
        
        // 處理照片
        let imageUrl = 'images/default-restaurant.jpg';  // 預設圖片
        if (restaurant.photos) {
            if (typeof restaurant.photos === 'string') {
                imageUrl = restaurant.photos;
            } else if (Array.isArray(restaurant.photos) && restaurant.photos.length > 0) {
                imageUrl = typeof restaurant.photos[0] === 'string' 
                    ? restaurant.photos[0] 
                    : restaurant.photos[0].url || 'images/default-restaurant.jpg';
            }
        }
        
        // 確保餐廳ID存在
        const restaurantId = restaurant.place_id || restaurant.id || '';
        
        // 創建卡片內容
        card.innerHTML = `
            <div class="restaurant-image-wrapper">
                <img src="${imageUrl}" alt="${restaurant.name}" 
                     onerror="this.src='images/default-restaurant.jpg'" loading="lazy">
            </div>
            <div class="restaurant-info">
                <div class="restaurant-title-row">
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <button class="favorite-btn" title="加入收藏" 
                            data-place-id="${restaurantId}" 
                            data-name="${restaurant.name}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="restaurant-rating-row">
                    <div class="rating-stars">${this.generateStars(restaurant.rating || 0)}</div>
                    <span class="rating-score">${restaurant.rating || '無評分'}</span>
                    <span class="rating-count">(${restaurant.user_ratings_total || 0}則評論)</span>
                </div>
                <div class="restaurant-address-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${restaurant.formatted_address || '地址不詳'}</span>
                </div>
                <div class="restaurant-tags-row">
                    ${this.generateTags(restaurant.cuisine_type || [])}
                </div>
                <div class="restaurant-status-row">
                    ${this.generateOpenStatus(restaurant.business_status, restaurant.opening_hours)}
                </div>
            </div>
        `;
        
        return card;
    }

    async searchNearbyRestaurants(lat, lng) {
        try {
            ('開始從本地資料獲取餐廳');
            
            // 使用 favoriteService 獲取所有餐廳
            if (window.favoriteService && typeof window.favoriteService.getAllRestaurantsJson === 'function') {
                const restaurants = await window.favoriteService.getAllRestaurantsJson();
                
                if (!restaurants || restaurants.length === 0) {
                    this.updateResultsTitle('找不到相關餐廳');
                    if (window.displayRestaurants) {
                        window.displayRestaurants([]);
                    } else if (window.infiniteScroll) {
                        window.infiniteScroll.setRestaurants([]);
                    }
                    return;
                }
                
                (`成功從本地資料獲取 ${restaurants.length} 間餐廳`);
                
                // 更新結果標題
                this.updateResultsTitle(`附近餐廳 (${restaurants.length} 間)`);
                
                // 顯示餐廳
                if (window.infiniteScroll) {
                    window.infiniteScroll.setRestaurants(restaurants);
                } else if (window.displayRestaurants) {
                    window.displayRestaurants(restaurants);
                } else {
                    this.displayRestaurants(restaurants);
                }
            } else {
                console.error('無法獲取餐廳資料，favoriteService 不可用');
                this.updateResultsTitle('無法載入餐廳資料');
            }
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
        }
    }

    // 簡化的 getPlaceDetails 方法，只從本地資料獲取
    async getPlaceDetails(placeId) {
        if (!placeId) {
            console.error('getPlaceDetails: 缺少 placeId 參數');
            return null;
        }
        
        try {
            // 使用 favoriteService 獲取餐廳詳情
            if (window.favoriteService && typeof window.favoriteService.getRestaurantById === 'function') {
                const restaurantDetails = await window.favoriteService.getRestaurantById(placeId);
                if (restaurantDetails) {
                    (`成功從本地資料獲取餐廳詳情 (ID: ${placeId})`);
                    return restaurantDetails;
                }
            }
            
            console.warn(`找不到餐廳詳情 (ID: ${placeId})`);
            return null;
        } catch (error) {
            console.error(`獲取餐廳詳情時發生錯誤:`, error);
            return null;
        }
    }

    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
            titleElement.style.display = 'block';
        }
    }

    async showRestaurantsOnMap(restaurants) {
        // 清除現有的標記
        this.markers.forEach(marker => {
            marker.map = null;
        });
        this.markers = [];

        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { LatLngBounds } = await google.maps.importLibrary("core");
        const bounds = new LatLngBounds();

        // 創建自定義標記樣式
        for (const restaurant of restaurants) {
            if (!restaurant.location || !restaurant.location.lat || !restaurant.location.lng) continue;

            const position = { 
                lat: restaurant.location.lat, 
                lng: restaurant.location.lng 
            };

            const markerContent = document.createElement('div');
            markerContent.className = 'restaurant-pin';
            markerContent.style.cssText = `
                background-color: #FF6B1A;
                width: 24px;
                height: 24px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                position: relative;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;

            const icon = document.createElement('div');
            icon.innerHTML = '🍽️';
            icon.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                font-size: 12px;
            `;

            markerContent.appendChild(icon);

            const marker = new AdvancedMarkerElement({
                map: this.map,
                position: position,
                title: restaurant.name,
                content: markerContent
            });

            bounds.extend(position);
            this.markers.push(marker);

            // 添加點擊事件
            marker.addListener('click', () => {
                // 這裡可以顯示餐廳詳細資訊
                if (window.showRestaurantDetail) {
                    window.showRestaurantDetail(restaurant.id);
                }
            });
        }

        if (restaurants.length > 0) {
            this.map.fitBounds(bounds);
        }
    }

    async addUserLocationMarker(location) {
        if (!location) return;
        
        if (this.currentUserLocationMarker) {
            this.currentUserLocationMarker.map = null;
        }

        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        const dot = document.createElement('div');
        dot.className = 'user-location-dot';
        dot.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #4285F4;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        this.currentUserLocationMarker = new AdvancedMarkerElement({
            map: this.map,
            position: location,
            title: "您的位置",
            content: dot
        });
    }

    // 顯示餐廳詳細資訊
    showRestaurantDetail(restaurant) {
        // 確保 restaurant 對象存在
        if (!restaurant) {
            console.error('餐廳對象為空');
            return;
        }

        // 如果沒有 ID，但有名稱，生成一個臨時 ID
        if (!restaurant.place_id && !restaurant.id && restaurant.name) {
            restaurant.id = 'temp-id-' + Date.now();
            ('生成臨時 ID:', restaurant.id);
        }
        
        // 保存當前選中的餐廳，供其他函數使用
        window.currentSelectedRestaurant = restaurant;
        
        ('顯示餐廳詳細資訊:', {
            name: restaurant.name,
            id: restaurant.id,
            place_id: restaurant.place_id
        });

        // 使用新的彈窗功能
        if (window.RestaurantModal) {
            window.RestaurantModal.showRestaurantDetail(restaurant);
            return;
        }

        // 以下是舊的彈窗邏輯，只在新彈窗不可用時使用
        const modal = document.getElementById('restaurantModal');
        if (!modal) {
            console.error('找不到餐廳彈窗元素');
            return;
        }

        // 獲取彈窗元素
        const modalName = document.getElementById('modal-restaurant-name');
        const modalImg = document.getElementById('modal-restaurant-img');
        const modalStars = document.getElementById('modal-stars');
        const modalRating = document.getElementById('modal-rating');
        const modalRatingCount = document.getElementById('modal-rating-count');
        const modalAddress = document.getElementById('modal-address');
        const modalStatus = document.getElementById('modal-status');
        const modalTodayHours = document.getElementById('modal-today-hours');
        const modalTags = document.getElementById('modal-tags');
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        const modalDirectionBtn = document.getElementById('modal-direction-btn');

        // 優先使用 place_id 作為餐廳ID
        const restaurantId = restaurant.place_id || restaurant.id;
        
        // 設置餐廳名稱
        if (modalName) modalName.textContent = restaurant.name;
        
        // 處理圖片URL
        let photoUrl = 'images/default-restaurant.jpg';
        
        if (restaurantId) {
            // 使用與商家卡片相同的API來源
            photoUrl = `http://localhost:8080/api/restaurant-images/${restaurantId}/raw`;
            ('使用資料庫圖片:', photoUrl, '餐廳ID:', restaurantId);
        } else {
            ('找不到餐廳ID，使用預設圖片');
        }
        
        // 設置圖片
        if (modalImg) {
            ('設置餐廳圖片:', photoUrl);
            modalImg.src = photoUrl;
            modalImg.alt = restaurant.name;
            modalImg.onerror = function() {
                ('圖片載入失敗，使用預設圖片');
                this.src = 'images/no-image.jpg';
            };
        }

        // 設置評分
        const rating = restaurant.rating || 0;
        if (modalRating) modalRating.textContent = rating.toFixed(1);
        if (modalRatingCount) modalRatingCount.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
        
        // 生成星星評分
        if (modalStars) {
            modalStars.innerHTML = this.generateStars(rating);
        }

        // 設置地址
        if (modalAddress) modalAddress.textContent = restaurant.formatted_address || '';

        // 設置營業狀態
        let isOpen = false;
        let todayHoursText = '';
        
        if (restaurant.opening_hours && modalStatus) {
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
                        todayHoursText = `${dayName} ${timeStr}`;
                    }
                }
            } else if (restaurant.opening_hours.open_now !== undefined) {
                isOpen = restaurant.opening_hours.open_now;
            }
            
            modalStatus.innerHTML = `
                <i class="fas fa-clock"></i>
                <span class="modal-status-text">${isOpen ? '營業中' : '休息中'}</span>
            `;
            modalStatus.className = `modal-status ${isOpen ? 'open' : 'closed'}`;
            
            // 設置營業時間
            if (todayHoursText && modalTodayHours) {
                modalTodayHours.textContent = todayHoursText;
            }
        }

        // 設置餐廳標籤
        if (modalTags && restaurant.cuisine_type && restaurant.cuisine_type.length > 0) {
            modalTags.innerHTML = restaurant.cuisine_type.map(type => 
                `<span class="restaurant-tag">${type}</span>`
            ).join('');
        }

        // 設置收藏按鈕
        if (modalFavoriteBtn) {
            if (!restaurantId) {
                console.error('找不到餐廳ID:', restaurant);
                modalFavoriteBtn.style.display = 'none';
            } else {
                // 檢查是否已收藏
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                const isFavorited = isLoggedIn && window.favoriteSystem && 
                    window.favoriteSystem.isStoreFavorited(restaurantId);
                
                // 更新按鈕狀態
                modalFavoriteBtn.classList.toggle('active', isFavorited);
                modalFavoriteBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}`;
                
                // 設置 data 屬性
                modalFavoriteBtn.setAttribute('data-place-id', restaurantId);
                modalFavoriteBtn.setAttribute('data-name', restaurant.name);
            }
        }

        // 設置導航按鈕
        if (modalDirectionBtn) {
            modalDirectionBtn.onclick = () => {
                const address = restaurant.formatted_address || '';
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
                window.open(url, '_blank');
            };
        }

        // 顯示彈窗
        modal.classList.add('active');

        // 設置關閉按鈕
        const closeBtn = modal.querySelector('.restaurant-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.remove('active');
            };
        }
    }

    // 生成星星評分的輔助函數
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHtml = '';
        
        // 全星
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star filled"></i>';
        }
        
        // 半星
        if (hasHalfStar) {
            starsHtml += '<i class="fas fa-star-half-alt filled"></i>';
        }
        
        // 空星
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }
        
        return starsHtml;
    }

    async loadRestaurants() {
        try {
            ('開始載入餐廳資料 - loadRestaurants()');
            
            // 首先清空餐廳容器
            const restaurantsContainer = document.getElementById('restaurants-container');
            if (restaurantsContainer) {
                restaurantsContainer.innerHTML = '';
                ('已清空餐廳容器');
            } else {
                console.warn('找不到餐廳容器元素');
                return;
            }
            
            // 顯示載入中訊息
            restaurantsContainer.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> 載入中...</div>';
            
            // 獲取餐廳數據
            ('正在從服務獲取餐廳數據...');
            const restaurants = await this.restaurantService.getRestaurants();
            (`從服務獲取到 ${restaurants ? restaurants.length : 0} 間餐廳`);
            
            // 清空載入中訊息
            restaurantsContainer.innerHTML = '';
            
            // 處理沒有結果的情況
            if (!restaurants || restaurants.length === 0) {
                restaurantsContainer.innerHTML = '<div class="no-results">未找到符合條件的餐廳</div>';
                return;
            }
            
            // 顯示結果標題
            const titleElement = document.getElementById('results-title');
            if (titleElement) {
                titleElement.textContent = `所有餐廳 (${restaurants.length} 間)`;
            }
            
            // 更嚴格的去重邏輯
            const restaurantIds = new Set();
            const uniqueRestaurants = [];
            const duplicates = [];
            
            for (const restaurant of restaurants) {
                const id = restaurant.place_id || restaurant.id;
                
                if (!id) {
                    console.warn('餐廳缺少ID:', restaurant.name);
                    continue;
                }
                
                if (!restaurantIds.has(id)) {
                    restaurantIds.add(id);
                    uniqueRestaurants.push(restaurant);
                } else {
                    duplicates.push({id, name: restaurant.name});
                }
            }
            
            if (duplicates.length > 0) {
                console.warn(`發現 ${duplicates.length} 個重複餐廳:`, duplicates);
            }
            
            (`去除重複後剩餘 ${uniqueRestaurants.length} 間餐廳（去除 ${restaurants.length - uniqueRestaurants.length} 間）`);
            
            // 使用去重後的數據顯示餐廳卡片
            if (typeof this.displayRestaurantCards === 'function') {
                this.displayRestaurantCards(uniqueRestaurants);
            } else {
                ('顯示餐廳卡片...');
                // 遍歷所有餐廳，創建卡片
                for (const restaurant of uniqueRestaurants) {
                    const card = this.createRestaurantCard(restaurant);
                    restaurantsContainer.appendChild(card);
                }
            }
            
            ('餐廳顯示完成');
            return uniqueRestaurants;
        } catch (error) {
            console.error('載入餐廳失敗:', error);
            const restaurantsContainer = document.getElementById('restaurants-container');
            if (restaurantsContainer) {
                restaurantsContainer.innerHTML = '<div class="no-results">載入餐廳失敗，請稍後再試</div>';
            }
            return [];
        }
    }
}

// 初始化及掛載到 window
const mapInit = new MapInit();
window.mapInit = mapInit;

// 確保 searchByType 方法綁定到正確的 this 上下文
window.searchByType = mapInit.searchByType.bind(mapInit);

// 初始化地圖
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await mapInit.init();
    } catch (error) {
        console.error('初始化地圖時發生錯誤:', error);
    }
});

// 顯示提示訊息
function showToast(message) {
    // 如果已經定義了全局 showToast 函數，則使用它
    if (window.showToast && window.showToast !== showToast) {
        window.showToast(message);
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===========================================
// 營業時間相關功能
// ===========================================

// 顯示完整營業時間彈窗
window.showWeeklyHoursModal = function(placeId) {
    const modal = document.getElementById('weeklyHoursModal');
    const modalBody = document.getElementById('weekly-hours-modal-body');
    
    if (!modal || !modalBody) return;
    
    // 清空原有內容
    modalBody.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 載入營業時間中...</div>';
    
    // 使用 CSS 類控制彈窗顯示
    modal.classList.add('active');
    
    // 如果有 placeId，使用 Places API 獲取詳細營業時間
    if (placeId) {
        const request = {
            placeId: placeId,
            fields: ['opening_hours']
        };
        
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        
        placesService.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && 
                place && place.opening_hours && place.opening_hours.weekday_text) {
                
                // 獲取成功，顯示營業時間
                displayWeeklyHours(place.opening_hours.weekday_text);
            } else {
                // 獲取失敗，顯示錯誤信息
                modalBody.innerHTML = '<div class="error-message">無法獲取營業時間，請稍後再試</div>';
            }
        });
    } else {
        // 如果沒有 placeId，嘗試從當前選中的餐廳獲取營業時間
        const currentRestaurant = window.currentSelectedRestaurant;
        
        if (currentRestaurant && currentRestaurant.opening_hours && 
            currentRestaurant.opening_hours.weekday_text) {
            displayWeeklyHours(currentRestaurant.opening_hours.weekday_text);
        } else {
            modalBody.innerHTML = '<div class="error-message">無法獲取營業時間，請稍後再試</div>';
        }
    }
    
    // 設置關閉按鈕
    const closeBtn = modal.querySelector('.weekly-hours-modal-close');
    if (closeBtn) {
        // 清除舊的事件監聽器
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        
        // 設置新的點擊事件
        newCloseBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    // 點擊彈窗外部關閉
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });
};

// 顯示一週營業時間
function displayWeeklyHours(weekdayText) {
    const modalBody = document.getElementById('weekly-hours-modal-body');
    if (!modalBody || !weekdayText || !Array.isArray(weekdayText)) return;
    
    // 獲取今天是星期幾
    const today = window.businessHours ? window.businessHours.getCurrentDay() : new Date().getDay();
    // 轉換為 weekday_text 的索引 (0=週一, 1=週二, ..., 6=週日)
    const todayIndex = today === 0 ? 6 : today - 1;
    
    // 創建營業時間表格
    let html = '<div class="weekly-hours-table">';
    
    // 遍歷每一天的營業時間
    weekdayText.forEach((dayText, index) => {
        // 分割日期和時間
        const parts = dayText.split(': ');
        const day = parts[0];
        const hours = parts[1] || '休息';
        
        // 判斷是否為今天
        const isToday = index === todayIndex;
        
        // 判斷是否營業中
        let statusIcon = '';
        if (isToday) {
            const isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                window.businessHours.isOpenFromText(hours) : false;
            statusIcon = isOpen ? 
                '<span class="status-dot open" title="營業中"></span>' : 
                '<span class="status-dot closed" title="休息中"></span>';
        }
        
        // 添加表格行
        html += `
            <div class="hours-row ${isToday ? 'today' : ''}">
                <div class="day-name">${day} ${statusIcon}</div>
                <div class="day-hours">${hours}</div>
            </div>
        `;
    });
    
    html += '</div>';
    modalBody.innerHTML = html;
}
