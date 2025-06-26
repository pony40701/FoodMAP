// 使用全域 config.js 裡的設定
const base = window.API_BASE_URL || 'http://localhost:8080/api';

// 收藏系統核心模組
class FavoriteSystem {
    constructor() {
        this.initialized = false;
        this.stores = [];
        this.reviews = [];
        this.initPromise = null; // 添加初始化Promise
        
        // 設置API支持標誌
        this.useApi = false;
        this.userId = null;
        
        // API 基礎 URL
        this.apiBaseUrl = base;
    }

    // 初始化收藏系統
    async initialize() {
        // 如果已經在初始化中，返回同一個promise
        if (this.initPromise) {
            return this.initPromise;
        }
        
        ('初始化收藏系統');
        
        // 創建初始化Promise
        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                // 檢查登入狀態和用戶ID
                const currentLoginState = this.checkLoginStatus();
                const currentUserId = parseInt(localStorage.getItem('userId') || '0');
                
                // 如果已經初始化且用戶ID沒變，直接返回
                if (this.initialized && this.userId === currentUserId) {
                    resolve(true);
                    return;
                }
                
                // 更新登入狀態和用戶ID
                this.isLoggedIn = currentLoginState;
                this.userId = currentUserId;
                
                // 檢查是否使用API
                this.useApi = true; // 直接使用 API 模式
                
                // 從存儲加載數據
                if (this.useApi && this.userId > 0) {
                    await this.loadFavorites();
                } else {
                    // 使用localStorage
                    await this.loadFromLocalStorage();
                }
                
                // 設置初始化標誌
                this.initialized = true;
                
                resolve(true);
            } catch (error) {
                this.initialized = false;
                this.initPromise = null; // 重置Promise以便下次重試
                reject(error);
            }
        });
        
        return this.initPromise;
    }
    
    // 從localStorage加載數據
    async loadFromLocalStorage() {
        // 從 localStorage 讀取收藏數據
        const favoriteStores = localStorage.getItem('favoriteStores');
        const favoriteReviews = localStorage.getItem('favoriteReviews');
        
        // 解析收藏數據
        if (favoriteStores) {
            try {
                this.stores = JSON.parse(favoriteStores);
            } catch (error) {
                this.stores = [];
            }
        } else {
            this.stores = [];
        }
        
        // 解析收藏心得數據
        if (favoriteReviews) {
            try {
                this.reviews = JSON.parse(favoriteReviews);
            } catch (error) {
                this.reviews = [];
            }
        } else {
            this.reviews = [];
        }
    }

    // 添加測試數據（僅用於開發測試）- 已移除測試數據
    addTestData() {
        // 測試數據已被移除
    }

    // 檢查登入狀態
    checkLoginStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // 載入收藏數據
    async loadFavorites() {
        try {
            // 檢查登入狀態
            if (!this.userId) {
                this.stores = [];
                this.reviews = [];
                return { stores: [], reviews: [] };
            }

            // 從後端 API 獲取收藏的餐廳列表
            const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants`);
            if (!response.ok) {
                throw new Error(`獲取收藏列表失敗: ${response.status}`);
            }

            const favorites = await response.json();

            // 更新本地收藏列表
            this.stores = favorites.map(favorite => {
                const store = {
                    id: favorite.place_id || favorite.id || favorite.targetId,
                    place_id: favorite.place_id || favorite.id || favorite.targetId,
                    name: favorite.name || '未知餐廳',
                    photos: favorite.photos || null,
                    favoriteTime: favorite.favoritedAt || favorite.favoriteTime || new Date().toISOString()
                };
                return store;
            });

            // 更新 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));

            return { stores: this.stores, reviews: this.reviews };
        } catch (error) {
            // 如果API調用失敗，嘗試從localStorage讀取
            await this.loadFromLocalStorage();
            return { stores: this.stores, reviews: this.reviews };
        }
    }

    // 添加店家收藏
    async addStore(storeData) {
        try {
            if (!this.initialized) await this.initialize();

            if (!storeData.place_id && storeData.id) storeData.place_id = storeData.id;
            else if (!storeData.id && storeData.place_id) storeData.id = storeData.place_id;
            else if (!storeData.id && !storeData.place_id) {
                return false;
            }

            const isFavorited = await this.isStoreFavorited(storeData.place_id);
            if (isFavorited) return true;

            if (!this.userId) {
                return false;
            }

            const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants/${storeData.place_id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error(`API 呼叫失敗: ${response.status} - ${await response.text()}`);
            }

            await this.loadFavorites();
            this.triggerFavoritesChangedEvent();
            return true;
        } catch (error) {
            return false;
        }
    }

    // 移除店家收藏
    async removeStore(storeId) {
        try {
            if (!this.initialized) {
                return false;
            }
            if (!storeId) {
                return false;
            }
            if (this.useApi && this.userId > 0) {
                try {
                    const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants/${storeId}`, {
                        method: 'DELETE', headers: { 'Accept': 'application/json' }
                    });

                    if (!response.ok) {
                        throw new Error(`API 呼叫失敗: ${response.status} - ${await response.text()}`);
                    }

                    const result = await response.json();
                    if (result.success) {
                        this.stores = this.stores.filter(store => store.id !== storeId && store.place_id !== storeId);
                        this.triggerFavoritesChangedEvent();
                        return true;
                    }
                    return false;
                } catch (error) {
                    // 如果API移除收藏失敗，回退到本地存儲
                }
            }

            const initialLength = this.stores.length;
            this.stores = this.stores.filter(store => store.id !== storeId && store.place_id !== storeId);
            if (initialLength === this.stores.length) {
                return false;
            }

            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            this.triggerFavoritesChangedEvent();
            return true;
        } catch (error) {
            return false;
        }
    }

    // 檢查餐廳是否已被收藏
    async isStoreFavorited(storeId) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        // 檢查用戶是否登入
        if (!localStorage.getItem('isLoggedIn') || !localStorage.getItem('userId')) {
            return false;
        }
        
        if (!storeId) {
            return false;
        }
        
        // 在內部存儲數組中檢查餐廳是否已被收藏
        const found = this.stores.some(store => {
            return store.id === storeId || store.place_id === storeId;
        });
        
        return found;
    }

    // 觸發收藏變更事件
    triggerFavoritesChangedEvent() {
        const event = new CustomEvent('favoritesChanged', {
            detail: {
                time: new Date(),
                stores: this.stores.length,
                reviews: this.reviews.length
            }
        });
        document.dispatchEvent(event);
    }

    // 獲取收藏的餐廳列表
    getFavoriteStores() {
        return this.stores;
    }
    
    // 獲取收藏的評論列表
    getFavoriteReviews() {
        return this.reviews;
    }
    
    // 根據ID獲取餐廳詳情
    async getRestaurantById(restaurantId) {
        if (!restaurantId) {
            return null;
        }
        
        // 先從本地收藏列表中查找
        const localRestaurant = this.stores.find(store => 
            store.id === restaurantId || 
            store.place_id === restaurantId
        );
        
        if (localRestaurant) {
            // 嘗試從API獲取更完整的資料
            try {
                const response = await fetch(`${this.apiBaseUrl}/restaurants/${restaurantId}`);
                
                if (response.ok) {
                    const apiData = await response.json();
                    
                    // 合併API數據和本地數據，API數據優先
                    const mergedData = { ...localRestaurant, ...apiData };
                    
                    // 確保有位置數據
                    if (!mergedData.geometry && (mergedData.lat || mergedData.latitude)) {
                        mergedData.geometry = {
                            location: {
                                lat: mergedData.lat || mergedData.latitude,
                                lng: mergedData.lng || mergedData.longitude
                            }
                        };
                    }
                    
                    return mergedData;
                }
            } catch (error) {
                // 如果從API獲取補充資料失敗，使用本地資料
            }
            
            // 如果API獲取失敗，確保本地數據有位置信息
            if (localRestaurant.lat || localRestaurant.latitude) {
                localRestaurant.geometry = {
                    location: {
                        lat: localRestaurant.lat || localRestaurant.latitude,
                        lng: localRestaurant.lng || localRestaurant.longitude
                    }
                };
            }
            
            return localRestaurant;
        }
        
        // 如果本地找不到，嘗試從API獲取
        try {
            const response = await fetch(`${this.apiBaseUrl}/restaurants/${restaurantId}`);
            
            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status}`);
            }
            
            const restaurantData = await response.json();
            
            // 確保有位置數據
            if (!restaurantData.geometry && (restaurantData.lat || restaurantData.latitude)) {
                restaurantData.geometry = {
                    location: {
                        lat: restaurantData.lat || restaurantData.latitude,
                        lng: restaurantData.lng || restaurantData.longitude
                    }
                };
            }
            
            return restaurantData;
        } catch (error) {
            return null;
        }
    }
    
    // 清除所有收藏
    clearAllFavorites() {
        this.stores = [];
        this.reviews = [];
        
        // 清除本地存儲
        localStorage.removeItem('favoriteStores');
        localStorage.removeItem('favoriteReviews');
        
        // 觸發收藏變更事件
        this.triggerFavoritesChangedEvent();
        
        return true;
    }
}

// 創建全局單例
window.favoriteSystem = new FavoriteSystem();

// 在 DOMContentLoaded 事件中初始化收藏系統
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.favoriteSystem.initialized) {
            await window.favoriteSystem.initialize();
        }
    } catch (error) {
        // 收藏系統初始化失敗
    }
});
