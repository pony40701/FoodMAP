// 餐廳服務模組 - 數據庫連接版本
class RestaurantService {
    constructor() {
        // 檢查API設置是否存在
        if (!window.API_CONFIG) {
            console.error('API配置未找到，請確保已載入config.js');
        }
        
        this.API = window.API_CONFIG ? window.API_CONFIG.RESTAURANT : null;
        this.BASE_URL = window.API_CONFIG ? window.API_CONFIG.BASE_URL : null;
        
        // 初始化本地緩存
        this.cache = {
            restaurants: {},
            searchResults: {}
        };
        
        this.initialized = !!this.API;
        
        if (this.initialized) {
            console.log('餐廳服務已初始化，使用數據庫模式');
        } else {
            console.error('餐廳服務初始化失敗，API配置不可用');
        }
    }
    
    // 獲取附近餐廳列表
    async getNearbyRestaurants(lat, lng, radius = 5000) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            
            const cacheKey = `${lat},${lng},${radius}`;
            
            // 檢查緩存
            if (this.cache.searchResults[cacheKey]) {
                console.log('從緩存返回附近餐廳數據');
                return this.cache.searchResults[cacheKey];
            }
            
            const url = `${this.API.GET_ALL}?lat=${lat}&lng=${lng}&radius=${radius}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`獲取餐廳列表失敗: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 處理從數據庫返回的JSON數據
            const restaurants = data.map(item => {
                // 如果有json_raw字段，解析它
                if (item.jsonRaw) {
                    try {
                        const googleData = JSON.parse(item.jsonRaw);
                        // 合併數據庫和Google數據
                        return {
                            ...googleData,
                            id: item.placeId,
                            place_id: item.placeId,
                            name: item.name || googleData.name,
                            address: item.address || googleData.formatted_address || googleData.vicinity
                        };
                    } catch (e) {
                        console.error('解析JSON數據失敗:', e);
                    }
                }
                
                // 若沒有json_raw或解析失敗，使用數據庫字段
                return {
                    id: item.placeId,
                    place_id: item.placeId,
                    name: item.name || '未知名稱',
                    address: item.address || '',
                    rating: item.rating || 0,
                    user_ratings_total: item.reviewCount || 0,
                    photos: item.photoUrl ? [item.photoUrl] : null,
                    location: item.latitude && item.longitude ? {
                        lat: item.latitude,
                        lng: item.longitude
                    } : null
                };
            });
            
            // 緩存搜索結果
            this.cache.searchResults[cacheKey] = restaurants;
            return restaurants;
        } catch (error) {
            console.error('獲取附近餐廳失敗:', error);
            // 失敗時返回空數組
            return [];
        }
    }
    
    // 獲取餐廳詳情
    async getRestaurantDetails(placeId) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            if (!placeId) throw new Error('缺少餐廳ID');
            
            // 檢查緩存
            if (this.cache.restaurants[placeId]) {
                console.log(`從緩存返回餐廳數據: ${placeId}`);
                return this.cache.restaurants[placeId];
            }
            
            const url = this.API.GET_BY_ID(placeId);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`獲取餐廳詳情失敗: ${response.status}`);
            }
            
            const data = await response.json();
            let restaurant = data;
            
            // 處理從數據庫返回的JSON數據
            if (data.jsonRaw) {
                try {
                    const googleData = JSON.parse(data.jsonRaw);
                    // 合併數據庫和Google數據
                    restaurant = {
                        ...googleData,
                        id: data.placeId,
                        place_id: data.placeId,
                        name: data.name || googleData.name,
                        address: data.address || googleData.formatted_address || googleData.vicinity
                    };
                } catch (e) {
                    console.error('解析JSON數據失敗:', e);
                }
            }
            
            // 緩存餐廳詳情
            this.cache.restaurants[placeId] = restaurant;
            return restaurant;
        } catch (error) {
            console.error(`獲取餐廳詳情失敗 (ID: ${placeId}):`, error);
            return null;
        }
    }
    
    // 獲取用戶收藏的餐廳
    async getFavoriteRestaurants(userId) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            if (!userId) throw new Error('缺少用戶ID');
            
            const url = this.API.GET_FAVORITES(userId);
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`獲取收藏餐廳失敗: ${response.status}`);
            }
            
            const jsonStrings = await response.json();
            
            // 解析JSON字符串為對象
            const restaurants = jsonStrings.map(jsonStr => {
                try {
                    return JSON.parse(jsonStr);
                } catch (e) {
                    console.error('解析餐廳JSON失敗:', e, jsonStr);
                    return null;
                }
            }).filter(item => item !== null);
            
            return restaurants;
        } catch (error) {
            console.error('獲取收藏餐廳失敗:', error);
            return [];
        }
    }
    
    // 添加餐廳收藏
    async addFavorite(userId, placeId) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            if (!userId || !placeId) throw new Error('缺少用戶ID或餐廳ID');
            
            const url = this.API.ADD_FAVORITE;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `userId=${userId}&placeId=${placeId}`
            });
            
            if (!response.ok) {
                throw new Error(`添加收藏失敗: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('添加收藏失敗:', error);
            return false;
        }
    }
    
    // 移除餐廳收藏
    async removeFavorite(userId, placeId) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            if (!userId || !placeId) throw new Error('缺少用戶ID或餐廳ID');
            
            const url = `${this.API.REMOVE_FAVORITE}?userId=${userId}&placeId=${placeId}`;
            const response = await fetch(url, { method: 'DELETE' });
            
            if (!response.ok) {
                throw new Error(`移除收藏失敗: ${response.status}`);
            }
            
            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('移除收藏失敗:', error);
            return false;
        }
    }
    
    // 檢查餐廳是否已收藏
    async isFavorited(userId, placeId) {
        try {
            if (!this.initialized) throw new Error('服務未初始化');
            if (!userId || !placeId) return false;
            
            const url = `${this.API.CHECK_FAVORITE}?userId=${userId}&placeId=${placeId}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`檢查收藏狀態失敗: ${response.status}`);
            }
            
            const result = await response.json();
            return result.is_favorited === true;
        } catch (error) {
            console.error('檢查收藏狀態失敗:', error);
            return false;
        }
    }
    
    // 清除緩存
    clearCache() {
        this.cache = {
            restaurants: {},
            searchResults: {}
        };
        console.log('餐廳服務緩存已清除');
    }
}

// 創建全局實例
window.restaurantService = new RestaurantService(); 