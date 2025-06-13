// 地圖初始化模組
class MapInit {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentUserLocationMarker = null;
        this.placesService = null;
        
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
            const { Map } = await google.maps.importLibrary("maps");
            const { LatLng } = await google.maps.importLibrary("core");
            const { PlacesService } = await google.maps.importLibrary("places");
            
            // 初始化地圖（以台北市為中心）
            this.map = new Map(document.getElementById('map'), {
                center: { lat: 25.0478, lng: 121.5319 },
                zoom: 15,
                mapId: 'DEMO_MAP_ID'
            });

            // 初始化 Places 服務
            this.placesService = new PlacesService(this.map);

            // 初始化成功後，嘗試獲取用戶位置
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        const userLocation = new LatLng(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        this.map.setCenter(userLocation);
                        this.addUserLocationMarker(userLocation);
                        this.searchNearbyRestaurants(position.coords.latitude, position.coords.longitude);
                    },
                    () => {
                        console.log('用戶拒絕提供位置資訊，使用預設位置');
                        this.searchNearbyRestaurants(25.0478, 121.5319);
                    }
                );
            }

            // 顯示地圖
            document.getElementById('map').style.display = 'block';

            return this;
        } catch (error) {
            console.error('初始化地圖時發生錯誤:', error);
            throw error;
        }
    }    async searchByType(type) {
        try {
            // 显示加载中提示
            this.updateResultsTitle("搜尋中...");
            const container = document.getElementById('restaurants-container');
            if (container) {
                container.innerHTML = `
                    <div class="loading-message">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>正在搜尋最佳美食...</p>
                    </div>
                `;
            }

            if (!this.map || !this.placesService) {
                throw new Error('地圖或Places服務尚未初始化');
            }

            // 使用新的搜索服務
            const searchService = new SearchService(this.map, this.placesService);
            
            // 获取所有相关关键词
            const keywordArray = [
                ...new Set([
                    ...(this.cuisineKeywords[type] || []),
                    ...(this.foodTypeKeywords[type] || []),
                    type
                ])
            ];

            // 执行搜索
            const results = await searchService.searchByKeywords(
                keywordArray,
                this.map.getCenter()
            );

            if (!results || results.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            // 按评分排序
            results.sort((a, b) => {
                if (b.rating === a.rating) {
                    return b.user_ratings_total - a.user_ratings_total;
                }
                return b.rating - a.rating;
            });

            // 更新結果標題
            this.updateResultsTitle(`${type}餐廳 (找到 ${results.length} 間)`);
            
            // 使用無限滾動來顯示結果
            window.infiniteScroll.setRestaurants(results);
            
            // 更新地圖上的標記
            await this.showRestaurantsOnMap(results);

        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
            window.displayRestaurants([]);
        }
    }

    async searchNearbyRestaurants(lat, lng) {
        try {
            if (!this.map || !this.placesService) {
                throw new Error('地圖或搜尋服務尚未初始化');
            }

            const request = {
                location: new google.maps.LatLng(lat, lng),
                radius: 5000,
                type: 'restaurant',
                language: 'zh-TW'
            };

            console.log('開始搜尋附近餐廳:', request);

            // 使用 Promise 封裝 nearbySearch
            const searchResults = await new Promise((resolve, reject) => {
                this.placesService.nearbySearch(request, async (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        console.log(`找到 ${results.length} 間餐廳，開始獲取詳細資訊`);
                        // 獲取詳細資訊
                        const detailedResults = await Promise.all(
                            results.map(place => this.getPlaceDetails(place.place_id))
                        );
                        resolve(detailedResults.filter(result => result !== null));
                    } else {
                        reject(new Error(status));
                    }
                });
            });

            if (!searchResults || searchResults.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            console.log(`成功獲取 ${searchResults.length} 間餐廳的詳細資訊`);

            const mappedResults = searchResults.map(place => {
                // 調試信息
                console.log('處理餐廳數據:', {
                    id: place.place_id,
                    name: place.name
                });
                
                let photo = 'images/no-image.jpg';
                if (place.photos && place.photos[0]) {
                    try {
                        photo = place.photos[0].getUrl({maxWidth: 400});
                    } catch (e) {
                        console.error('獲取圖片時發生錯誤:', e);
                    }
                }

                // 處理營業時間
                let opening_hours = null;
                if (place.opening_hours) {
                    opening_hours = {
                        weekday_text: place.opening_hours.weekday_text || null,
                        periods: place.opening_hours.periods || null,
                        open_now: place.opening_hours.open_now
                    };
                }

                // 確保 place_id 存在
                const placeId = place.place_id;
                if (!placeId) {
                    console.error('找不到餐廳ID:', place);
                }

                return {
                    id: placeId,
                    place_id: placeId,
                    name: place.name || '未知名稱',
                    address: place.vicinity || place.formatted_address || '',
                    rating: place.rating || 0,
                    user_ratings_total: place.user_ratings_total || 0,
                    photos: photo,
                    location: {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng()
                    },
                    opening_hours: opening_hours,
                    types: place.types || []
                };
            });

            // 更新結果標題
            this.updateResultsTitle(`附近餐廳 (找到 ${mappedResults.length} 間)`);
            
            // 使用無限滾動來顯示結果
            window.infiniteScroll.setRestaurants(mappedResults);
            
            // 更新地圖上的標記
            await this.showRestaurantsOnMap(mappedResults);

        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
            window.displayRestaurants([]);
        }
    }

    // 獲取地點詳細資訊
    async getPlaceDetails(placeId) {
        if (!placeId) {
            console.error('getPlaceDetails: 缺少 placeId 參數');
            return null;
        }

        console.log(`開始獲取地點詳細資訊 (ID: ${placeId})`);

        return new Promise((resolve, reject) => {
            const request = {
                placeId: placeId,
                fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 
                        'opening_hours', 'user_ratings_total', 'vicinity', 'types', 'place_id']
            };

            this.placesService.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // 確保 place_id 存在
                    if (!place.place_id) {
                        place.place_id = placeId;
                    }
                    
                    console.log(`成功獲取地點詳細資訊 (ID: ${placeId}, 名稱: ${place.name})`);
                    resolve(place);
                } else {
                    console.warn(`無法獲取地點詳細資訊 (${placeId}):`, status);
                    resolve(null);
                }
            });
        });
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
            console.log('生成臨時 ID:', restaurant.id);
        }
        
        // 保存當前選中的餐廳，供其他函數使用
        window.currentSelectedRestaurant = restaurant;
        
        console.log('顯示餐廳詳細資訊:', {
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
        
        if (restaurant.photos) {
            // 如果photos是字符串，直接使用
            if (typeof restaurant.photos === 'string') {
                photoUrl = restaurant.photos;
            }
            // 如果photos是陣列且有內容
            else if (Array.isArray(restaurant.photos) && restaurant.photos.length > 0) {
                // 如果第一個元素有url屬性
                if (restaurant.photos[0].url) {
                    photoUrl = restaurant.photos[0].url;
                }
                // 如果第一個元素是字符串
                else if (typeof restaurant.photos[0] === 'string') {
                    photoUrl = restaurant.photos[0];
                }
            }
            // 如果photos是對象且有url屬性
            else if (restaurant.photos.url) {
                photoUrl = restaurant.photos.url;
            }
        }
        
        // 設置圖片
        if (modalImg) {
            modalImg.src = photoUrl;
            modalImg.alt = restaurant.name;
            modalImg.onerror = function() { this.src = 'images/default-restaurant.jpg'; };
        }

        // 設置評分
        const rating = restaurant.rating || 0;
        if (modalRating) modalRating.textContent = rating.toFixed(1);
        if (modalRatingCount) modalRatingCount.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
        
        // 生成星星評分
        if (modalStars) {
            let starsHtml = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    starsHtml += '★';
                } else if (i - 0.5 <= rating) {
                    starsHtml += '½';
                } else {
                    starsHtml += '☆';
                }
            }
            modalStars.textContent = starsHtml;
        }

        // 設置地址
        if (modalAddress) modalAddress.textContent = restaurant.address || restaurant.vicinity || '';

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
                
                // 檢查是否已存在查看完整營業時間按鈕
                const modalHoursContainer = modalTodayHours.parentElement;
                if (modalHoursContainer) {
                    // 先移除可能存在的舊按鈕
                    const existingBtn = modalHoursContainer.querySelector('.view-full-hours-btn');
                    if (existingBtn) {
                        modalHoursContainer.removeChild(existingBtn);
                    }
                    
                    // 添加新按鈕
                    const viewFullHoursBtn = document.createElement('button');
                    viewFullHoursBtn.className = 'view-full-hours-btn';
                    viewFullHoursBtn.textContent = '查看完整營業時間';
                    viewFullHoursBtn.addEventListener('click', () => {
                        if (typeof window.showWeeklyHoursModal === 'function') {
                            window.showWeeklyHoursModal(restaurantId);
                        }
                    });
                    
                    modalHoursContainer.appendChild(viewFullHoursBtn);
                }
            }
        }

        // 設置餐廳標籤
        if (modalTags && restaurant.types && restaurant.types.length > 0) {
            modalTags.innerHTML = restaurant.types.slice(0, 3).map(type => 
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
                
                // 清除舊的事件監聽器
                const newBtn = modalFavoriteBtn.cloneNode(true);
                modalFavoriteBtn.parentNode.replaceChild(newBtn, modalFavoriteBtn);
                
                // 設置新的點擊事件
                newBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // 檢查是否已登入
                    if (localStorage.getItem('isLoggedIn') !== 'true') {
                        if (typeof showToast === 'function') showToast('請先登入會員');
                        return;
                    }
                    
                    // 使用 favoriteButton 模組處理收藏功能
                    if (window.favoriteButton && window.favoriteButton.initialized) {
                        await window.favoriteButton.toggleStoreFavorite(restaurantId, newBtn);
                        
                        // 更新按鈕文字
                        const isFavorited = window.favoriteSystem && window.favoriteSystem.isStoreFavorited(restaurantId);
                        newBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}`;
                        
                        // 更新所有相同 ID 的按鈕
                        if (window.favoriteButton.updateAllButtonsWithSameId) {
                            window.favoriteButton.updateAllButtonsWithSameId(restaurantId);
                        }
                    }
                });
            }
        }

        // 設置導航按鈕
        if (modalDirectionBtn) {
            // 清除舊的事件監聽器
            const newBtn = modalDirectionBtn.cloneNode(true);
            modalDirectionBtn.parentNode.replaceChild(newBtn, modalDirectionBtn);
            
            // 設置新的點擊事件
            newBtn.addEventListener('click', () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address || restaurant.vicinity || '')}`;
                window.open(url, '_blank');
            });
        }

        // 顯示彈窗
        modal.classList.add('active');

        // 設置關閉按鈕
        const closeBtn = modal.querySelector('.restaurant-modal-close');
        if (closeBtn) {
            // 清除舊的事件監聽器
            const newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            
            // 設置新的點擊事件
            newCloseBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
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
