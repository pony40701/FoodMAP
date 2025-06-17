// 使用全域 config.js 裡的設定
const base = window.API_BASE_URL;

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
            console.log('收藏系統已在初始化中，等待完成...');
            return this.initPromise;
        }
        
        console.log('初始化收藏系統');
        
        // 創建初始化Promise
        this.initPromise = new Promise(async (resolve, reject) => {
            try {
                // 如果已經初始化，直接返回
                if (this.initialized) {
                    console.log('收藏系統已初始化，跳過重複初始化');
                    resolve(true);
                    return;
                }
                
                // 檢查登入狀態和用戶ID
                this.isLoggedIn = this.checkLoginStatus();
                this.userId = parseInt(localStorage.getItem('userId') || '0');
                
                // 檢查是否使用API
                this.useApi = true; // 直接使用 API 模式
                console.log(`收藏系統模式: ${this.useApi ? '資料庫API' : '本地存儲'}`);
                
                // 從存儲加載數據
                if (this.useApi && this.userId > 0) {
                    await this.loadFavorites();
                } else {
                    // 使用localStorage
                    await this.loadFromLocalStorage();
                }
                
                // 設置初始化標誌
                this.initialized = true;
                console.log('收藏系統初始化完成，當前收藏數量:', this.stores.length);
                
                resolve(true);
            } catch (error) {
                console.error('初始化收藏系統失敗:', error);
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
                console.log(`成功從localStorage載入 ${this.stores.length} 個收藏餐廳`);
            } catch (error) {
                console.error('解析收藏餐廳數據失敗:', error);
                this.stores = [];
            }
        } else {
            console.log('沒有找到收藏餐廳數據，初始化為空數組');
            this.stores = [];
        }
        
        // 解析收藏心得數據
        if (favoriteReviews) {
            try {
                this.reviews = JSON.parse(favoriteReviews);
                console.log(`成功從localStorage載入 ${this.reviews.length} 個收藏心得`);
            } catch (error) {
                console.error('解析收藏心得數據失敗:', error);
                this.reviews = [];
            }
        } else {
            console.log('沒有找到收藏心得數據，初始化為空數組');
            this.reviews = [];
        }
    }

    // 添加測試數據（僅用於開發測試）- 已移除測試數據
    addTestData() {
        console.log('測試數據功能已停用');
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
                console.log('用戶未登入，清空收藏列表');
                this.stores = [];
                this.reviews = [];
                return { stores: [], reviews: [] };
            }

            console.log(`開始載入用戶 ${this.userId} 的收藏數據`);

            // 從後端 API 獲取收藏的餐廳列表
            const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants`);
            if (!response.ok) {
                throw new Error(`獲取收藏列表失敗: ${response.status}`);
            }

            const favorites = await response.json();
            console.log('從API獲取到的原始收藏數據:', favorites);

            // 更新本地收藏列表
            this.stores = favorites.map(favorite => {
                const store = {
                    id: favorite.place_id || favorite.id || favorite.targetId,
                    place_id: favorite.place_id || favorite.id || favorite.targetId,
                    name: favorite.name || '未知餐廳',
                    photos: favorite.photos || null,
                    favoriteTime: favorite.favoritedAt || favorite.favoriteTime || new Date().toISOString()
                };
                console.log('處理收藏數據:', store);
                return store;
            });

            // 更新 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log('成功更新本地收藏列表，數量:', this.stores.length);
            console.log('當前收藏列表:', this.stores);

            return { stores: this.stores, reviews: this.reviews };
        } catch (error) {
            console.error('載入收藏數據失敗:', error);
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
                console.error('添加收藏失敗: 缺少餐廳ID');
                return false;
            }

            console.log('準備添加收藏:', storeData);

            const isFavorited = await this.isStoreFavorited(storeData.place_id);
            console.log('檢查是否已收藏:', storeData.place_id, isFavorited);
            if (isFavorited) return true;

            if (!this.userId) {
                console.error('用戶未登入，無法添加收藏');
                return false;
            }

            console.log(`發送收藏請求: 用戶ID=${this.userId}, 餐廳ID=${storeData.place_id}`);
            const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants/${storeData.place_id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 回應錯誤:', { status: response.status, statusText: response.statusText, body: errorText });
                throw new Error(`API 呼叫失敗: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('API 回應結果:', result);
            if (!result.success) throw new Error(result.message || '新增收藏失敗');

            await this.loadFavorites();
            this.triggerFavoritesChangedEvent();
            console.log('成功新增收藏:', storeData);
            return true;
        } catch (error) {
            console.error('添加收藏失敗:', error);
            return false;
        }
    }

    // 移除店家收藏
    async removeStore(storeId) {
        try {
            if (!this.initialized) {
                console.error('收藏系統未初始化'); return false;
            }
            if (!storeId) {
                console.error('移除收藏失敗: 缺少餐廳ID'); return false;
            }
            if (this.useApi && this.userId > 0) {
                try {
                    console.log(`發送刪除收藏請求: 用戶ID=${this.userId}, 餐廳ID=${storeId}`);
                    const response = await fetch(`${base}/users/${this.userId}/favorites/restaurants/${storeId}`, {
                        method: 'DELETE', headers: { 'Accept': 'application/json' }
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('API 回應錯誤:', { status: response.status, statusText: response.statusText, body: errorText });
                        throw new Error(`API 呼叫失敗: ${response.status} - ${errorText}`);
                    }

                    const result = await response.json();
                    console.log('API 回應結果:', result);
                    if (result.success) {
                        console.log(`成功透過API移除餐廳收藏 (ID: ${storeId})`);
                        this.stores = this.stores.filter(store => store.id !== storeId && store.place_id !== storeId);
                        this.triggerFavoritesChangedEvent();
                        return true;
                    }
                    console.error('API移除收藏失敗:', result.message);
                    return false;
                } catch (error) {
                    console.error('API移除收藏失敗，回退到本地存儲:', error);
                }
            }

            const initialLength = this.stores.length;
            this.stores = this.stores.filter(store => store.id !== storeId && store.place_id !== storeId);
            if (initialLength === this.stores.length) {
                console.log(`未找到ID為 ${storeId} 的收藏餐廳`);
                return false;
            }

            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log(`成功移除餐廳收藏 (ID: ${storeId})`);
            this.triggerFavoritesChangedEvent();
            return true;
        } catch (error) {
            console.error('移除店家收藏失敗:', error);
            return false;
        }
    }

    // ... (其餘方法保持不變)
}

// 創建全局單例
window.favoriteSystem = new FavoriteSystem();

// 在 DOMContentLoaded 事件中初始化收藏系統
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.favoriteSystem.initialized) {
            await window.favoriteSystem.initialize();
            console.log('收藏系統初始化完成');
        }
    } catch (error) {
        console.error('收藏系統初始化失敗:', error);
    }
});
