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
            // 顯示載入中提示
            this.updateResultsTitle("搜尋中...");
            const container = document.getElementById('restaurants-container');
            if (container) {
                container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> 搜尋中...</div>';
            }

            if (!this.map || !this.placesService) {
                throw new Error('地圖或搜尋服務尚未初始化');
            }

            // 從預定義的關鍵字中獲取搜尋關鍵字
            const keywordArray = this.cuisineKeywords[type] || [type];
            const mainCategory = type; // 使用傳入的類型作為主要分類名稱

            // 建立搜尋請求
            const request = {
                location: this.map.getCenter(),
                radius: 5000,
                type: 'restaurant',
                keyword: mainCategory, // 使用主要分類作為關鍵字
                language: 'zh-TW'
            };

            // 使用 Promise 封裝 nearbySearch
            let searchResults = await new Promise((resolve, reject) => {
                this.placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        resolve(results);
                    } else {
                        reject(new Error(status));
                    }
                });
            });

            // 如果主要分類搜尋結果為空，嘗試使用其他關鍵字
            if (!searchResults || searchResults.length === 0) {
                for (let i = 1; i < keywordArray.length && (!searchResults || searchResults.length === 0); i++) {
                    request.keyword = keywordArray[i];
                    searchResults = await new Promise((resolve, reject) => {
                        this.placesService.nearbySearch(request, (results, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                                resolve(results);
                            } else {
                                reject(new Error(status));
                            }
                        });
                    });
                }
            }

            if (!searchResults || searchResults.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            // 對每個搜尋結果進行詳細資訊查詢
            const detailedResults = await Promise.all(searchResults.map(async place => {
                const detailsRequest = {
                    placeId: place.place_id,
                    fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'photos', 'geometry', 'opening_hours', 'types']
                };

                try {
                    const details = await new Promise((resolve, reject) => {
                        this.placesService.getDetails(detailsRequest, (result, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK) {
                                resolve(result);
                            } else {
                                reject(new Error(status));
                            }
                        });
                    });

                    // 檢查餐廳是否符合其他關鍵字
                    const restaurantName = details.name.toLowerCase();
                    const restaurantTypes = details.types ? details.types.join(' ').toLowerCase() : '';
                    const matchesKeywords = keywordArray.some(keyword => 
                        restaurantName.includes(keyword.toLowerCase()) || 
                        restaurantTypes.includes(keyword.toLowerCase())
                    );

                    if (matchesKeywords) {
                        const restaurant = {
                            id: details.place_id,
                            name: details.name || '未知名稱',
                            address: details.formatted_address || details.vicinity || '',
                            rating: details.rating || 0,
                            user_ratings_total: details.user_ratings_total || 0,
                            photos: details.photos && details.photos[0] ? 
                                   details.photos[0].getUrl({maxWidth: 400}) : 
                                   'images/no-image.jpg',
                            location: {
                                lat: details.geometry.location.lat(),
                                lng: details.geometry.location.lng()
                            },
                            opening_hours: details.opening_hours || null
                        };

                        // 添加點擊事件到餐廳卡片
                        const card = document.createElement('div');
                        card.className = 'restaurant-card';
                        card.innerHTML = `
                            <div class="restaurant-image">
                                <img src="${restaurant.photos}" alt="${restaurant.name}">
                                <button class="favorite-btn" onclick="event.stopPropagation();">
                                    <i class="far fa-heart"></i>
                                </button>
                            </div>
                            <div class="restaurant-info">
                                <h3>${restaurant.name}</h3>
                                <div class="rating">
                                    <div class="stars">
                                        ${this.generateStars(restaurant.rating)}
                                    </div>
                                    <span class="rating-text">${restaurant.rating} (${restaurant.user_ratings_total})</span>
                                </div>
                                <p class="address">${restaurant.address}</p>
                                <p class="opening-hours ${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? 'open' : 'closed'}">
                                    <i class="fas fa-clock"></i>
                                    ${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? '營業中' : '休息中'}
                                </p>
                            </div>
                        `;

                        // 添加點擊事件
                        card.addEventListener('click', () => {
                            this.showRestaurantDetail(restaurant);
                        });

                        return restaurant;
                    }
                    return null;
                } catch (error) {
                    console.error('獲取餐廳詳細資訊時發生錯誤:', error);
                    return null;
                }
            }));

            // 過濾掉不符合條件的結果
            const filteredResults = detailedResults.filter(result => result !== null);

            if (filteredResults.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            window.currentRestaurants = filteredResults;
            window.displayRestaurants(filteredResults);
            this.updateResultsTitle(`${mainCategory}餐廳 (找到 ${filteredResults.length} 間)`);
            await this.showRestaurantsOnMap(filteredResults);

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
                this.placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        resolve(results);
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
                    opening_hours: place.opening_hours || null
                };
            });

            window.currentRestaurants = mappedResults;
            window.displayRestaurants(mappedResults);
            this.updateResultsTitle('附近的餐廳');
            await this.showRestaurantsOnMap(mappedResults);

        } catch (error) {
            console.error('搜尋附近餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
            window.displayRestaurants([]);
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
        if (restaurant.opening_hours) {
            const isOpen = restaurant.opening_hours.isOpen();
            modalStatus.innerHTML = `
                <i class="fas fa-clock"></i>
                <span class="modal-status-text">${isOpen ? '營業中' : '休息中'}</span>
            `;
            modalStatus.className = `modal-status ${isOpen ? 'open' : 'closed'}`;
            
            // 設置營業時間
            if (restaurant.opening_hours.weekday_text) {
                const today = new Date().getDay();
                modalTodayHours.textContent = restaurant.opening_hours.weekday_text[today];
            }
        }

        // 設置收藏按鈕事件
        modalFavoriteBtn.onclick = (e) => {
            e.stopPropagation();
            const isFavorite = modalFavoriteBtn.classList.contains('active');
            if (isFavorite) {
                modalFavoriteBtn.classList.remove('active');
                modalFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
            } else {
                modalFavoriteBtn.classList.add('active');
                modalFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
            }
        };

        // 設置導航按鈕事件
        modalDirectionBtn.onclick = () => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
            window.open(url, '_blank');
        };

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
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };

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
