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
    }

    async searchByType(cuisine) {
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

            // 取得搜尋關鍵字
            const keywords = this.cuisineKeywords[cuisine] || [cuisine];
            const center = this.map.getCenter();

            // 建立搜尋請求
            const request = {
                location: center,
                radius: 5000,
                type: 'restaurant',
                keyword: keywords.join(' OR '),
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
            this.updateResultsTitle(`${cuisine}餐廳 (找到 ${mappedResults.length} 間)`);
            await this.showRestaurantsOnMap(mappedResults);

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
