// 地圖初始化模組
class MapInit {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentUserLocationMarker = null;
        this.placesService = null;
        this.userLocation = null;  // 新增：儲存使用者位置
        
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
            const { PlacesService } = await google.maps.importLibrary("places");
            
            // 創建一個隱藏的地圖元素用於 Places API
            const mapDiv = document.createElement('div');
            mapDiv.style.display = 'none';
            document.body.appendChild(mapDiv);
            
            const { Map } = await google.maps.importLibrary("maps");
            this.map = new Map(mapDiv, {
                center: { lat: 25.0478, lng: 121.5319 }, // 台北市
                zoom: 15,
                mapId: 'DEMO_MAP_ID'
            });

            // 初始化 Places 服務
            this.placesService = new PlacesService(this.map);

            // 獲取使用者位置
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        this.userLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        this.searchNearbyRestaurants(position.coords.latitude, position.coords.longitude);
                    },
                    () => {
                        console.log('用戶拒絕提供位置資訊，使用預設位置');
                        this.userLocation = { lat: 25.0478, lng: 121.5319 };
                        this.searchNearbyRestaurants(25.0478, 121.5319);
                    }
                );
            } else {
                this.userLocation = { lat: 25.0478, lng: 121.5319 };
                this.searchNearbyRestaurants(25.0478, 121.5319);
            }

            return this;
        } catch (error) {
            console.error('初始化服務時發生錯誤:', error);
            throw error;
        }
    }

    async searchByType(type) {
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
            const mainCategory = type;

            // 使用使用者位置作為搜尋中心點
            const searchLocation = this.userLocation || this.map.getCenter();

            // 建立搜尋請求
            const request = {
                location: searchLocation,
                radius: 5000,
                type: 'restaurant',
                keyword: mainCategory,
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

            // 處理搜尋結果
            const processedResults = await this.processSearchResults(searchResults);
            
            if (processedResults.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            window.currentRestaurants = processedResults;
            window.displayRestaurants(processedResults);
            this.updateResultsTitle(`${mainCategory}餐廳 (找到 ${processedResults.length} 間)`);
            await this.showRestaurantsOnMap(processedResults);

        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
            window.displayRestaurants([]);
        }
    }

    async processSearchResults(searchResults) {
        const processedResults = await Promise.all(searchResults.map(async place => {
            try {
                // 獲取詳細資訊
                const details = await new Promise((resolve, reject) => {
                    this.placesService.getDetails({
                        placeId: place.place_id,
                        fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'photos', 'geometry', 'opening_hours']
                    }, (result, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            resolve(result);
                        } else {
                            reject(new Error(status));
                        }
                    });
                });

                let photo = 'images/no-image.jpg';
                if (details.photos && details.photos[0]) {
                    try {
                        photo = details.photos[0].getUrl({maxWidth: 400});
                    } catch (e) {
                        console.error('獲取圖片時發生錯誤:', e);
                    }
                }

                return {
                    id: place.place_id,
                    name: details.name || place.name || '未知名稱',
                    address: details.formatted_address || place.vicinity || '',
                    rating: details.rating || place.rating || 0,
                    user_ratings_total: details.user_ratings_total || place.user_ratings_total || 0,
                    photos: photo,
                    location: {
                        lat: details.geometry.location.lat(),
                        lng: details.geometry.location.lng()
                    },
                    opening_hours: details.opening_hours || null
                };
            } catch (error) {
                console.error('處理餐廳資訊時發生錯誤:', error);
                return null;
            }
        }));

        return processedResults.filter(result => result !== null);
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

            // 處理搜尋結果
            const processedResults = await this.processSearchResults(searchResults);
            
            if (processedResults.length === 0) {
                this.updateResultsTitle('找不到相關餐廳');
                window.displayRestaurants([]);
                return;
            }

            window.currentRestaurants = processedResults;
            window.displayRestaurants(processedResults);
            this.updateResultsTitle('附近的餐廳');
            await this.showRestaurantsOnMap(processedResults);

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

            // 添加標記點擊事件
            marker.addListener("click", () => {
                if (window.showRestaurantDetail) {
                    window.showRestaurantDetail(restaurant);
                }
            });
        }

        // 調整地圖視圖以顯示所有標記
        if (this.markers.length > 0) {
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
        if (!restaurant) {
            console.error('未提供餐廳資料');
            return;
        }

        // 獲取所有必要的 DOM 元素
        const modal = document.getElementById('restaurantModal');
        if (!modal) {
            console.error('找不到餐廳詳細資訊視窗');
            return;
        }

        const elements = {
            name: document.getElementById('modal-restaurant-name'),
            img: document.getElementById('modal-restaurant-img'),
            stars: document.getElementById('modal-stars'),
            rating: document.getElementById('modal-rating'),
            ratingCount: document.getElementById('modal-rating-count'),
            address: document.getElementById('modal-address'),
            status: document.getElementById('modal-status'),
            todayHours: document.getElementById('modal-today-hours'),
            favoriteBtn: document.getElementById('modal-favorite-btn'),
            directionBtn: document.getElementById('modal-direction-btn'),
            mapContainer: document.getElementById('modal-map')
        };

        // 檢查必要的元素是否存在
        if (!elements.name || !elements.img || !elements.rating) {
            console.error('找不到必要的餐廳資訊元素');
            return;
        }

        try {
            // 設置基本餐廳資訊
            elements.name.textContent = restaurant.name || '未知餐廳';
            elements.img.src = restaurant.photos || 'images/no-image.jpg';
            elements.img.alt = restaurant.name || '餐廳圖片';

            // 設置評分
            const rating = restaurant.rating || 0;
            if (elements.rating) {
                elements.rating.textContent = rating.toFixed(1);
            }
            if (elements.ratingCount) {
                elements.ratingCount.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
            }

            // 生成星星評分
            if (elements.stars) {
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
                elements.stars.textContent = starsHtml;
            }

            // 設置地址
            if (elements.address && restaurant.address) {
                elements.address.textContent = restaurant.address;
            }

            // 設置營業狀態
            if (elements.status && restaurant.opening_hours) {
                const isOpen = restaurant.opening_hours.isOpen();
                elements.status.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span class="modal-status-text">${isOpen ? '營業中' : '休息中'}</span>
                `;
                elements.status.className = `modal-status ${isOpen ? 'open' : 'closed'}`;
                
                // 設置營業時間
                if (elements.todayHours && restaurant.opening_hours.weekday_text) {
                    const today = new Date().getDay();
                    elements.todayHours.textContent = restaurant.opening_hours.weekday_text[today];
                }
            }

            // 設置收藏按鈕事件
            if (elements.favoriteBtn) {
                elements.favoriteBtn.onclick = (e) => {
                    e.stopPropagation();
                    const isFavorite = elements.favoriteBtn.classList.contains('active');
                    if (isFavorite) {
                        elements.favoriteBtn.classList.remove('active');
                        elements.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
                    } else {
                        elements.favoriteBtn.classList.add('active');
                        elements.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                    }
                };
            }

            // 設置導航按鈕事件
            if (elements.directionBtn && restaurant.address) {
                elements.directionBtn.onclick = () => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
                    window.open(url, '_blank');
                };
            }

            // 初始化地圖
            if (elements.mapContainer && restaurant.location && restaurant.location.lat && restaurant.location.lng) {
                try {
                    const mapOptions = {
                        center: { 
                            lat: restaurant.location.lat, 
                            lng: restaurant.location.lng 
                        },
                        zoom: 15,
                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                        mapTypeControl: false,
                        fullscreenControl: false
                    };

                    const map = new google.maps.Map(elements.mapContainer, mapOptions);

                    // 添加標記
                    new google.maps.Marker({
                        position: { 
                            lat: restaurant.location.lat, 
                            lng: restaurant.location.lng 
                        },
                        map: map,
                        title: restaurant.name,
                        animation: google.maps.Animation.DROP
                    });
                } catch (error) {
                    console.error('初始化地圖時發生錯誤:', error);
                }
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
        } catch (error) {
            console.error('顯示餐廳詳細資訊時發生錯誤:', error);
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
