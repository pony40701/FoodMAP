// 餐廳服務模組 - 僅支援後端 API
class RestaurantService {
    constructor() {
        // 儲存從後端獲取的資料
        this.apiData = [];
        this.dataLoaded = false;
        
        // 初始化收藏資料結構
        this.favoriteData = this.loadFavoriteData();
        
        this.initialized = false;
        console.log('餐廳服務已創建，準備初始化');
    }
    
    // 初始化方法
    async init() {
        try {
            console.log('開始初始化餐廳服務...');
            
            // 從 API 載入資料
            await this.preloadRestaurantData();
            
            this.initialized = true;
            console.log('餐廳服務初始化完成');
            return true;
        } catch (error) {
            console.error('餐廳服務初始化失敗:', error);
            return false;
        }
    }
    
    // 預載餐廳資料
    async preloadRestaurantData() {
        try {
            if (!window.config || !window.config.api) {
                throw new Error('API 配置未找到');
            }
            
            const apiUrl = `${window.config.api.baseUrl}${window.config.api.endpoints.restaurants.all}`;
            console.log(`從 API 獲取餐廳資料: ${apiUrl}`);
            
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
            console.log(`API 回應資料長度: ${data.length}`);
            
            if (Array.isArray(data) && data.length > 0) {
                this.apiData = data;
                this.dataLoaded = true;
                console.log(`成功從 API 載入 ${data.length} 間餐廳資料`);
            } else {
                throw new Error('從 API 獲取的資料為空或格式不正確');
            }
        } catch (error) {
            console.error('從 API 載入餐廳資料失敗:', error);
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
            console.error('載入收藏資料失敗:', error);
            return {};
        }
    }
    
    // 獲取附近餐廳列表
    async getNearbyRestaurants(lat, lng, radius = 5000) {
        console.log(`獲取附近餐廳: 緯度${lat}, 經度${lng}, 半徑${radius}`);
        
        // 如果已經從 API 載入了資料，直接使用
        if (this.dataLoaded && this.apiData.length > 0) {
            console.log(`使用已載入的 ${this.apiData.length} 間餐廳資料`);
            return this.apiData;
        }
        
        try {
            if (!window.config || !window.config.api) {
                throw new Error('API 配置未找到');
            }
            
            const apiUrl = `${window.config.api.baseUrl}${window.config.api.endpoints.restaurants.all}`;
            console.log(`從 API 獲取餐廳資料: ${apiUrl}`);
            
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
            console.log(`API 回應資料長度: ${data.length}`);
            
            if (Array.isArray(data) && data.length > 0) {
                this.apiData = data;
                this.dataLoaded = true;
                console.log(`成功從 API 載入 ${data.length} 間餐廳資料`);
                return data;
            } else {
                throw new Error('從 API 獲取的資料為空或格式不正確');
            }
        } catch (error) {
            console.error('從 API 載入餐廳資料失敗:', error);
            throw error; // 向上傳遞錯誤
        }
    }
    
    // 獲取餐廳詳情
    async getRestaurantDetails(placeId) {
        console.log(`獲取餐廳詳情: ${placeId}`);
        
        if (!placeId) {
            throw new Error('未提供餐廳ID');
        }
        
        // 優先使用已載入的資料
        if (this.dataLoaded && this.apiData.length > 0) {
            const restaurant = this.apiData.find(r => r.place_id === placeId || r.id === placeId);
            if (restaurant) return restaurant;
        }
        
        try {
            if (!window.config || !window.config.api) {
                throw new Error('API 配置未找到');
            }
            
            const apiUrl = `${window.config.api.baseUrl}${window.config.api.endpoints.restaurants.byId}${placeId}`;
            console.log(`從 API 獲取餐廳詳情: ${apiUrl}`);
            
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
            if (data) {
                console.log(`成功從 API 載入餐廳詳情`);
                return data;
            } else {
                throw new Error('餐廳詳情資料為空');
            }
        } catch (error) {
            console.error('從 API 載入餐廳詳情失敗:', error);
            throw error;
        }
    }
    
    // 獲取用戶收藏的餐廳
    async getFavoriteRestaurants(userId) {
        console.log(`獲取用戶收藏: ${userId}`);
        
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
            console.error('處理舊版收藏資料失敗:', error);
        }
        
        return this.favoriteData[userId] || [];
    }
    
    // 添加餐廳收藏
    async addFavorite(userId, placeId) {
        console.log(`添加收藏: 用戶${userId}, 餐廳${placeId}`);
        
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
        console.log(`移除收藏: 用戶${userId}, 餐廳${placeId}`);
        
        if (!userId || !placeId) {
            throw new Error('未提供用戶ID或餐廳ID');
        }
        
        if (this.favoriteData[userId]) {
            const index = this.favoriteData[userId].indexOf(placeId);
            if (index !== -1) {
                this.favoriteData[userId].splice(index, 1);
                // 同步到本地存儲
                this.saveFavoriteData();
                return true;
            }
        }
        
        return false;
    }
    
    // 保存收藏資料到本地存儲
    saveFavoriteData() {
        try {
            const userId = localStorage.getItem('userId');
            if (userId && this.favoriteData[userId]) {
                // 保存完整的收藏資料
                localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteData[userId]));
                console.log(`已保存 ${this.favoriteData[userId].length} 個收藏餐廳`);
            }
        } catch (error) {
            console.error('保存收藏資料失敗:', error);
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
        console.log('已清除餐廳資料快取');
    }
    
    // 獲取所有餐廳資料
    async getAllRestaurantsJson() {
        if (!this.initialized) {
            console.log('服務尚未初始化，進行初始化...');
            await this.init();
        }
        
        if (this.dataLoaded && this.apiData.length > 0) {
            return this.apiData;
        }
        
        try {
            await this.preloadRestaurantData();
            return this.apiData;
        } catch (error) {
            console.error('獲取餐廳資料失敗:', error);
            throw error;
        }
    }
}

// 創建全局實例
window.restaurantService = new RestaurantService(); 