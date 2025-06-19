// 餐廳服務模組 - 僅支援後端 API
// 請確保 config.js 已在 HTML 中先引入

class RestaurantService {
    constructor() {
        // 儲存從後端獲取的資料
        this.apiData = [];
        this.dataLoaded = false;
        
        // 初始化收藏資料結構
        this.favoriteData = this.loadFavoriteData();
        
        this.initialized = false;
        
        // 確保 API_BASE_URL 存在，若不存在則使用預設值
        this.baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
        
        // 初始化餐廳詳情緩存
        this.restaurantCache = {};
    }
    
    // 初始化方法
    async init() {
        try {
            // 從 API 載入資料
            await this.preloadRestaurantData();
            
            this.initialized = true;
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // 預載餐廳資料
    async preloadRestaurantData() {
        try {
            if (!window.config || !window.config.api) {
            }
            
            const apiUrl = `${this.baseUrl}${window.config?.api?.endpoints?.restaurants?.all || '/google-restaurants/all'}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API 回應錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                this.apiData = data;
                this.dataLoaded = true;
            } else {
                throw new Error('從 API 獲取的資料為空或格式不正確');
            }
        } catch (error) {
            throw error; // 向上傳遞錯誤
        }
    }
    
    // 載入收藏資料
    loadFavoriteData() {
        try {
            // 嘗試載入舊版收藏資料
            const oldFavoritesJson = localStorage.getItem('googleMapsFavorites');
            const userId = localStorage.getItem('userId');
            
            let favoriteData = {};
            
            if (userId && oldFavoritesJson) {
                const oldFavorites = JSON.parse(oldFavoritesJson);
                favoriteData[userId] = Object.keys(oldFavorites);
            }
            
            return favoriteData;
        } catch (error) {
            return {};
        }
    }
    
    // 獲取附近餐廳列表
    async getNearbyRestaurants(lat, lng, radius = 5000) {
        // 如果已經從 API 載入了資料，直接使用
        if (this.dataLoaded && this.apiData.length > 0) {
            return this.apiData;
        }
        
        try {
            const apiUrl = `${this.baseUrl}${window.config?.api?.endpoints?.restaurants?.all || '/google-restaurants/all'}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API 回應錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                this.apiData = data;
                this.dataLoaded = true;
                return data;
            } else {
                throw new Error('從 API 獲取的資料為空或格式不正確');
            }
        } catch (error) {
            throw error; // 向上傳遞錯誤
        }
    }
    
    // 獲取餐廳詳情
    async getRestaurantDetails(placeId) {
        try {
            // 從緩存中獲取數據
            if (this.restaurantCache[placeId]) {
                return this.restaurantCache[placeId];
            }
            
            // 從 API 獲取數據
            const response = await fetch(`${this.baseUrl}/google-restaurants/${placeId}`);
            if (!response.ok) {
                throw new Error(`獲取餐廳詳情失敗: ${response.status}`);
            }
            
            const restaurant = await response.json();
            
            // 從 json_raw 解析數據
            if (restaurant.json_raw) {
                try {
                    const jsonData = JSON.parse(restaurant.json_raw);
                    
                    // 從 JSON 數據中提取評分、評論數
                    if (jsonData.rating) {
                        restaurant.rating = jsonData.rating;
                        restaurant.averageRating = jsonData.rating;
                    }
                    if (jsonData.user_ratings_total) {
                        restaurant.reviewCount = jsonData.user_ratings_total;
                        restaurant.user_ratings_total = jsonData.user_ratings_total;
                    }
                    
                    // 提取營業時間
                    if (jsonData.opening_hours && jsonData.opening_hours.weekday_text) {
                        restaurant.businessHours = jsonData.opening_hours.weekday_text;
                        restaurant.opening_hours = jsonData.opening_hours;
                    }
                } catch (error) {
                }
            }
            
            // 保存到緩存
            this.restaurantCache[placeId] = restaurant;
            
            return restaurant;
        } catch (error) {
            throw error;
        }
    }
    
    // 獲取用戶收藏的餐廳
    async getFavoriteRestaurants(userId) {
        try {
            // 檢查是否有舊版收藏資料
            const oldFavoritesJson = localStorage.getItem('googleMapsFavorites');
            if (oldFavoritesJson) {
                const oldFavorites = JSON.parse(oldFavoritesJson);
                // 將舊版收藏資料轉換為新格式
                if (!this.favoriteData[userId]) {
                    this.favoriteData[userId] = [];
                }
                this.favoriteData[userId] = [...new Set([
                    ...this.favoriteData[userId],
                    ...Object.keys(oldFavorites)
                ])];
                // 清除舊版收藏資料
                localStorage.removeItem('googleMapsFavorites');
            }
        } catch (error) {
        }
        
        return this.favoriteData[userId] || [];
    }
    
    // 添加餐廳收藏
    async addFavorite(userId, placeId) {
        if (!userId || !placeId) {
            throw new Error('未提供用戶ID或餐廳ID');
        }
        
        if (!this.favoriteData[userId]) {
            this.favoriteData[userId] = [];
        }
        
        if (!this.favoriteData[userId].includes(placeId)) {
            this.favoriteData[userId].push(placeId);
            // 同步到本地存儲
            this.saveFavoriteData();
        }
        
        return true;
    }
    
    // 移除餐廳收藏
    async removeFavorite(userId, placeId) {
        if (!userId || !placeId) {
            throw new Error('未提供用戶ID或餐廳ID');
        }
        
        try {
            // 使用新的 API 路徑
            const response = await fetch(`${this.baseUrl}/users/${userId}/favorites/restaurants/${placeId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`API 呼叫失敗: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                // 更新本地收藏數據
                if (this.favoriteData[userId]) {
                    const index = this.favoriteData[userId].indexOf(placeId);
                    if (index !== -1) {
                        this.favoriteData[userId].splice(index, 1);
                        // 同步到本地存儲
                        this.saveFavoriteData();
                    }
                }
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    // 保存收藏資料到本地存儲
    saveFavoriteData() {
        try {
            const userId = localStorage.getItem('userId');
            if (userId && this.favoriteData[userId]) {
                // 保存完整的收藏資料
                localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteData[userId]));
            }
        } catch (error) {
            throw error;
        }
    }
    
    // 檢查餐廳是否已收藏
    async isFavorited(userId, placeId) {
        if (!userId || !placeId) return false;
        
        return !!(this.favoriteData[userId] && this.favoriteData[userId].includes(placeId));
    }
    
    // 清除快取
    clearCache() {
        this.apiData = [];
        this.dataLoaded = false;
    }
    
    // 獲取所有餐廳資料
    async getAllRestaurantsJson() {
        if (!this.initialized) {
            await this.init();
        }
        
        if (this.dataLoaded && this.apiData.length > 0) {
            return this.apiData;
        }
        
        try {
            await this.preloadRestaurantData();
            return this.apiData;
        } catch (error) {
            throw error;
        }
    }
    
    // 添加獲取餐廳的方法 (如果不存在)
    async getRestaurants() {
        if (!this.initialized) {
            await this.init();
        }
        
        if (this.dataLoaded && this.apiData.length > 0) {
            const uniqueIds = new Map();
            const uniqueRestaurants = [];
            const duplicateIds = new Set();
            
            for (const restaurant of this.apiData) {
                const id = restaurant.place_id || restaurant.id;
                
                if (!id) {
                    continue;
                }
                
                if (!uniqueIds.has(id)) {
                    uniqueIds.set(id, restaurant);
                    uniqueRestaurants.push(restaurant);
                } else {
                    duplicateIds.add(id);
                }
            }
            
            if (duplicateIds.size > 0) {
            }
            
            if (uniqueRestaurants.length !== this.apiData.length) {
            }
            
            return uniqueRestaurants;
        }
        
        try {
            await this.preloadRestaurantData();
            
            const uniqueIds = new Map();
            const uniqueRestaurants = [];
            const duplicateIds = new Set();
            
            for (const restaurant of this.apiData) {
                const id = restaurant.place_id || restaurant.id;
                
                if (!id) {
                    continue;
                }
                
                if (!uniqueIds.has(id)) {
                    uniqueIds.set(id, restaurant);
                    uniqueRestaurants.push(restaurant);
                } else {
                    duplicateIds.add(id);
                }
            }
            
            if (duplicateIds.size > 0) {
            }
            
            if (uniqueRestaurants.length !== this.apiData.length) {
                this.apiData = uniqueRestaurants;
            }
            
            return uniqueRestaurants;
        } catch (error) {
            return [];
        }
    }
}

// 創建全局實例
window.restaurantService = new RestaurantService(); 