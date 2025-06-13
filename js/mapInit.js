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

            // 使用 Promise 封裝 nearbySearch
            const searchResults = await new Promise((resolve, reject) => {
                this.placesService.nearbySearch(request, async (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
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

            const mappedResults = searchResults.map(place => {
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
                    
                    // 調試信息
                    console.log('餐廳營業時間資料:', {
                        name: place.name,
                        opening_hours: opening_hours,
                        currentTime: new Date().toLocaleTimeString()
                    });
                }

                return {
                    id: place.place_id,
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
        return new Promise((resolve, reject) => {
            const request = {
                placeId: placeId,
                fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 
                        'opening_hours', 'user_ratings_total', 'vicinity', 'types']
            };

            this.placesService.getDetails(request, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
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
        // 保存當前選中的餐廳，供其他函數使用
        window.currentSelectedRestaurant = restaurant;
        
        const modal = document.getElementById('restaurantModal');
        const modalName = document.getElementById('modal-restaurant-name');
        const modalImg = document.getElementById('modal-restaurant-img');
        const modalStars = document.getElementById('modal-stars');
        const modalRating = document.getElementById('modal-rating');
        const modalRatingCount = document.getElementById('modal-rating-count');
        const modalAddress = document.getElementById('modal-address');
        const modalStatus = document.getElementById('modal-status');
        const modalTodayHours = document.getElementById('modal-today-hours');
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        const modalDirectionBtn = document.getElementById('modal-direction-btn');
        const modalHoursInfoBtn = document.getElementById('modal-hours-info-btn');

        // 設置餐廳資訊
        modalName.textContent = restaurant.name;
        modalImg.src = restaurant.photos || 'images/no-image.jpg';
        modalImg.alt = restaurant.name;

        // 設置評分
        const rating = restaurant.rating || 0;
        modalRating.textContent = rating.toFixed(1);
        modalRatingCount.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
        
        // 生成星星評分
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

        // 設置地址
        modalAddress.textContent = restaurant.address;

        // 設置營業狀態
        let isOpen = false;
        let todayHoursText = '';
        
        if (restaurant.opening_hours) {
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
                        isOpen = window.businessHours.isOpenFromText(timeStr);
                        const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][today];
                        todayHoursText = `${dayName} ${timeStr}`;
                        
                        // 調試信息
                        console.log('彈窗營業時間判斷:', {
                            restaurantName: restaurant.name,
                            todayFullText: todayText,
                            extractedTime: timeStr,
                            isOpen: isOpen,
                            currentTime: new Date().toLocaleTimeString()
                        });
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
            if (todayHoursText) {
                modalTodayHours.textContent = todayHoursText;
            }

            // 設置完整時間按鈕點擊事件
            if (modalHoursInfoBtn) {
                modalHoursInfoBtn.onclick = () => {
                    if (typeof window.showWeeklyHoursModal === 'function') {
                        if (restaurant.id) {
                            window.showWeeklyHoursModal(restaurant.id);
                        } else {
                            window.showWeeklyHoursModal();
                        }
                    }
                };
            }
        }

        // 設置收藏按鈕事件
        if (modalFavoriteBtn) {
            // 檢查是否已收藏
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const isFav = isLoggedIn && window.isFavorite && window.isFavorite(restaurant.id);
            
            // 更新按鈕狀態
            modalFavoriteBtn.classList.toggle('active', isFav);
            modalFavoriteBtn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? '已收藏' : '收藏'}`;
            
            // 設置點擊事件
            modalFavoriteBtn.onclick = (e) => {
                e.stopPropagation();
                
                // 檢查是否已登入
                if (localStorage.getItem('isLoggedIn') !== 'true') {
                    // 顯示提示訊息
                    alert('請先登入會員');
                    
                    // 使用全局的 showLoginModal 函數
                    if (typeof window.showLoginModal === 'function') {
                        window.showLoginModal();
                    }
                    return;
                }
                
                // 切換收藏狀態
                window.toggleFavorite(restaurant.id, restaurant.name, restaurant);
                
                // 更新按鈕外觀
                const isFavorite = window.isFavorite && window.isFavorite(restaurant.id);
                modalFavoriteBtn.classList.toggle('active', isFavorite);
                modalFavoriteBtn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> ${isFavorite ? '已收藏' : '收藏'}`;
            };
        }

        // 設置導航按鈕事件
        if (modalDirectionBtn) {
            modalDirectionBtn.onclick = () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
                window.open(url, '_blank');
            };
        }

        // 初始化地圖
        const mapContainer = document.getElementById('modal-map');
        const location = restaurant.location;
        
        if (location && location.lat && location.lng) {
            const mapOptions = {
                center: { lat: location.lat, lng: location.lng },
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                fullscreenControl: false
            };

            const map = new google.maps.Map(mapContainer, mapOptions);

            // 添加標記
            new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: restaurant.name,
                animation: google.maps.Animation.DROP
            });
        }

        // 顯示彈窗
        modal.style.display = 'block';

        // 關閉按鈕功能
        const closeBtn = modal.querySelector('.restaurant-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // 點擊彈窗外部關閉
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
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
