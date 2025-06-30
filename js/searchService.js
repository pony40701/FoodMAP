// 搜索服务类
class SearchService {
    constructor() {
        this.searchRadius = 8000; // 8公里的搜索范围
        this.maxResults = 60; // 最大结果数
        this.currentLocation = null;
        this.allRestaurants = []; // 存儲所有餐廳資料
    }

    // 初始化搜尋服務
    async init() {
        try {
            // 獲取所有餐廳資料
            if (window.restaurantService) {
                this.allRestaurants = await window.restaurantService.getAllRestaurantsJson();
            } else if (window.favoriteService) {
                this.allRestaurants = await window.favoriteService.getAllRestaurantsJson();
            }
            
            // 獲取用戶當前位置
            await this.getCurrentLocation();
        } catch (error) {
            console.error('搜尋服務初始化失敗:', error);
        }
    }

    // 獲取用戶當前位置
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        this.currentLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        resolve(this.currentLocation);
                    },
                    (error) => {
                        // 使用台北市中心作為預設位置
                        this.currentLocation = { lat: 25.0330, lng: 121.5654 };
                        resolve(this.currentLocation);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 300000
                    }
                );
            } else {
                this.currentLocation = { lat: 25.0330, lng: 121.5654 };
                resolve(this.currentLocation);
            }
        });
    }

    // 主要搜尋方法
    async search(foodKeyword = '', locationKeyword = '') {
        try {
            let results = [...this.allRestaurants];
            
            // 如果沒有搜尋條件，返回所有餐廳
            if (!foodKeyword && !locationKeyword) {
                return this.formatResults(results);
            }
            
            // 根據食物關鍵字篩選
            if (foodKeyword) {
                results = this.filterByFoodKeyword(results, foodKeyword);
            }
            
            // 根據地點關鍵字篩選
            if (locationKeyword) {
                results = this.filterByLocationKeyword(results, locationKeyword);
            }
            
            return this.formatResults(results);
        } catch (error) {
            console.error('搜尋過程中發生錯誤:', error);
            return [];
        }
    }

    // 根據食物關鍵字篩選餐廳
    filterByFoodKeyword(restaurants, keyword) {
        const lowerKeyword = keyword.toLowerCase();
        
        return restaurants.filter(restaurant => {
            // 檢查餐廳名稱
            if (restaurant.name && restaurant.name.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            // 檢查餐廳類型
            if (restaurant.types && Array.isArray(restaurant.types)) {
                for (const type of restaurant.types) {
                    if (type.toLowerCase().includes(lowerKeyword)) {
                        return true;
                    }
                }
            }
            
            // 檢查 json_raw 中的 cuisine_type
            if (restaurant.json_raw) {
                try {
                    const jsonData = JSON.parse(restaurant.json_raw);
                    if (jsonData.types && Array.isArray(jsonData.types)) {
                        for (const type of jsonData.types) {
                            if (type.toLowerCase().includes(lowerKeyword)) {
                                return true;
                            }
                        }
                    }
                } catch (error) {
                    // 忽略 JSON 解析錯誤
                }
            }
            
            // 檢查預定義的食物類型關鍵字
            const foodTypeKeywords = this.getFoodTypeKeywords();
            for (const [type, keywords] of Object.entries(foodTypeKeywords)) {
                if (keywords.some(k => k.toLowerCase().includes(lowerKeyword))) {
                    // 檢查餐廳是否屬於此類型
                    if (this.restaurantMatchesType(restaurant, type)) {
                        return true;
                    }
                }
            }
            
            return false;
        });
    }

    // 根據地點關鍵字篩選餐廳
    filterByLocationKeyword(restaurants, keyword) {
        const lowerKeyword = keyword.toLowerCase();
        
        return restaurants.filter(restaurant => {
            // 檢查地址
            if (restaurant.address && restaurant.address.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            // 檢查 formatted_address
            if (restaurant.formatted_address && restaurant.formatted_address.toLowerCase().includes(lowerKeyword)) {
                return true;
            }
            
            return false;
        });
    }

    // 獲取食物類型關鍵字對應表
    getFoodTypeKeywords() {
        return {
            '中式': ['中餐', '中式料理', '餃子', '麵食', '粥', '炒飯', '湯包', '小籠包', '中式', 'chinese'],
            '美式': ['漢堡', '美式餐廳', '炸雞', '牛排館', '美式早餐', '三明治', '美式', 'american', 'burger'],
            '韓式': ['韓式料理', '韓國料理', '韓式烤肉', '韓式炸雞', '韓式火鍋', '韓式小菜', '韓式', 'korean'],
            '義式': ['義大利麵', '披薩', '義式餐廳', '燉飯', '義大利菜', 'pasta', '義式', 'italian'],
            '法式': ['法式料理', '法國菜', '法式餐廳', '法式甜點', '法式麵包', '法式咖啡', '法式', 'french'],
            '泰式': ['泰國菜', '泰式料理', '泰式火鍋', '泰式咖哩', '泰式炒飯', '泰式河粉', '泰式', 'thai'],
            '火鍋': ['麻辣鍋', '涮涮鍋', '石頭火鍋', '個人鍋', '涮羊肉', '麻辣燙', '火鍋', 'hot pot'],
            '牛排': ['牛排館', '排餐', '舒肥牛排', '和牛', '炭烤牛排', '牛排餐廳', '牛排', 'steak'],
            '燒烤': ['燒肉', 'BBQ', '串燒', '炭烤', '烤肉', '串烤', '燒烤', 'barbecue'],
            '飲品': ['手搖飲', '咖啡廳', '茶飲', '果汁', '冰沙', '奶茶', '飲品', 'beverage', 'drink'],
            '異國料理': ['印度菜', '越南菜', '墨西哥菜', '中東料理', '南洋料理', '異國美食', '異國料理', 'international']
        };
    }

    // 檢查餐廳是否匹配特定類型
    restaurantMatchesType(restaurant, type) {
        // 檢查餐廳類型
        if (restaurant.types && Array.isArray(restaurant.types)) {
            for (const restaurantType of restaurant.types) {
                if (restaurantType.toLowerCase().includes(type.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // 檢查 json_raw 中的類型
        if (restaurant.json_raw) {
            try {
                const jsonData = JSON.parse(restaurant.json_raw);
                if (jsonData.types && Array.isArray(jsonData.types)) {
                    for (const restaurantType of jsonData.types) {
                        if (restaurantType.toLowerCase().includes(type.toLowerCase())) {
                            return true;
                        }
                    }
                }
            } catch (error) {
                // 忽略 JSON 解析錯誤
            }
        }
        
        return false;
    }

    // 格式化搜尋結果
    formatResults(restaurants) {
        return restaurants.map(restaurant => {
            // 確保餐廳資料格式一致
            const formatted = {
                id: restaurant.place_id || restaurant.id,
                name: restaurant.name || '未知餐廳',
                address: restaurant.address || restaurant.formatted_address || '',
                rating: restaurant.rating || restaurant.averageRating || 0,
                user_ratings_total: restaurant.user_ratings_total || restaurant.reviewCount || 0,
                photos: restaurant.photos || 'images/no-image.jpg',
                location: restaurant.location || { lat: 0, lng: 0 },
                opening_hours: restaurant.opening_hours || null,
                types: restaurant.types || [],
                price_level: restaurant.price_level,
                json_raw: restaurant.json_raw
            };
            
            return formatted;
        });
    }

    // 根據關鍵字搜尋餐廳（舊方法，保持向後兼容）
    async searchByKeywords(keywords, location) {
        const allResults = new Map(); // 使用Map来去重
        let requestCount = 0;
        const maxRequests = keywords.length;

        for (const keyword of keywords) {
            try {
                const request = {
                    location: location,
                    radius: this.searchRadius,
                    type: 'restaurant',
                    keyword: keyword,
                    language: 'zh-TW'
                };

                const places = await this.performSearch(request);
                requestCount++;

                for (const place of places) {
                    if (!allResults.has(place.place_id)) {
                        const details = await this.getPlaceDetails(place.place_id);
                        if (details) {
                            allResults.set(place.place_id, details);
                        }
                    }

                    // 如果已经收集足够的结果，提前结束
                    if (allResults.size >= this.maxResults) {
                        break;
                    }
                }

                // 如果已经找到足够多的结果，不再继续搜索其他关键词
                if (allResults.size >= this.maxResults) {
                    break;
                }
            } catch (error) {
                // 继续尝试其他关键词
            }
        }

        return Array.from(allResults.values());
    }

    async performSearch(request) {
        return new Promise((resolve, reject) => {
            if (this.placesService) {
                this.placesService.nearbySearch(request, (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        resolve(results);
                    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                        resolve([]);
                    } else {
                        reject(new Error(status));
                    }
                });
            } else {
                resolve([]);
            }
        });
    }

    async getPlaceDetails(placeId) {
        try {
            return await new Promise((resolve, reject) => {
                if (this.placesService) {
                    this.placesService.getDetails({
                        placeId: placeId,
                        fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 
                                'photos', 'geometry', 'opening_hours', 'types', 'price_level']
                    }, (result, status) => {
                        if (status === google.maps.places.PlacesServiceStatus.OK) {
                            const formattedResult = this.formatPlaceDetails(result);
                            resolve(formattedResult);
                        } else {
                            reject(new Error(status));
                        }
                    });
                } else {
                    resolve(null);
                }
            });
        } catch (error) {
            return null;
        }
    }

    formatPlaceDetails(place) {
        let photo = 'images/no-image.jpg';
        if (place.photos && place.photos[0]) {
            try {
                photo = place.photos[0].getUrl({maxWidth: 400});
            } catch (e) {
                // 忽略获取图片时的错误
            }
        }

        return {
            id: place.place_id,
            name: place.name || '未知名称',
            address: place.formatted_address || '',
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            photos: photo,
            location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            opening_hours: place.opening_hours || null,
            types: place.types || [],
            price_level: place.price_level
        };
    }
}

// 导出搜索服务
window.SearchService = SearchService;
