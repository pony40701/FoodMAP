// 收藏系統核心模組
class FavoriteSystem {
    constructor() {
        this.initialized = false;
        this.stores = [];
        this.reviews = [];
        
        // 設置API支持標誌
        this.useApi = false;
        this.userId = null;
        
        // API 基礎 URL
        this.apiBaseUrl = 'http://localhost:8080';
    }

    // 初始化收藏系統
    async initialize() {
        console.log('初始化收藏系統');
        
        try {
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
            
            return true;
        } catch (error) {
            console.error('初始化收藏系統失敗:', error);
            this.initialized = false;
            throw error;
        }
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
                return {
                    stores: [],
                    reviews: []
                };
            }

            console.log(`開始載入用戶 ${this.userId} 的收藏數據`);

            // 從後端 API 獲取收藏的餐廳列表
            const response = await fetch(`${this.apiBaseUrl}/api/favorites/${this.userId}/restaurants`);
            if (!response.ok) {
                throw new Error(`獲取收藏列表失敗: ${response.status}`);
            }

            const favorites = await response.json();
            console.log('從API獲取到的原始收藏數據:', favorites);

            // 更新本地收藏列表
            this.stores = favorites.map(favorite => {
                const store = {
                    id: favorite.targetId,
                    place_id: favorite.targetId,
                    favoriteTime: favorite.favoritedAt
                };
                console.log('處理收藏數據:', store);
                return store;
            });

            // 更新 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log('成功更新本地收藏列表，數量:', this.stores.length);
            console.log('當前收藏列表:', this.stores);

            return {
                stores: this.stores,
                reviews: this.reviews
            };
        } catch (error) {
            console.error('載入收藏數據失敗:', error);
            // 如果API調用失敗，嘗試從localStorage讀取
            await this.loadFromLocalStorage();
            return {
                stores: this.stores,
                reviews: this.reviews
            };
        }
    }

    // 添加店家收藏
    async addStore(storeData) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // 確保有 place_id
            if (!storeData.place_id && storeData.id) {
                storeData.place_id = storeData.id;
            } else if (!storeData.id && storeData.place_id) {
                storeData.id = storeData.place_id;
            } else if (!storeData.id && !storeData.place_id) {
                console.error('添加收藏失敗: 缺少餐廳ID');
                return false;
            }

            console.log('準備添加收藏:', storeData);

            // 檢查是否已收藏
            const isFavorited = await this.isStoreFavorited(storeData.place_id);
            console.log('檢查是否已收藏:', storeData.place_id, isFavorited);
            
            if (isFavorited) {
                console.log('該店家已在收藏列表中');
                return true; // 已經收藏了，視為成功
            }

            // 檢查登入狀態
            if (!this.userId) {
                console.error('用戶未登入，無法添加收藏');
                return false;
            }

            // 呼叫後端 API 新增收藏
            const requestBody = {
                userId: this.userId,
                targetId: storeData.place_id,
                targetType: 'restaurant'
            };
            console.log('發送收藏請求:', requestBody);

            const response = await fetch(`${this.apiBaseUrl}/api/favorites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 回應錯誤:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error(`API 呼叫失敗: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            console.log('API 回應結果:', result);

            if (!result.success) {
                throw new Error(result.message || '新增收藏失敗');
            }

            // 重新載入收藏列表
            await this.loadFavorites();
            
            // 觸發事件
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
                console.error('收藏系統未初始化');
                return false;
            }

            if (!storeId) {
                console.error('移除收藏失敗: 缺少餐廳ID');
                return false;
            }
            
            // API模式且已登入
            if (this.useApi && this.userId > 0) {
                try {
                    const success = await window.restaurantService.removeFavorite(this.userId, storeId);
                    if (success) {
                        console.log(`成功透過API移除餐廳收藏 (ID: ${storeId})`);
                        // 從本地列表中移除
                        this.stores = this.stores.filter(store => 
                            store.id !== storeId && store.place_id !== storeId
                        );
                        // 觸發收藏變更事件
                        this.triggerFavoritesChangedEvent();
                        return true;
                    } else {
                        console.error('API移除收藏失敗');
                        return false;
                    }
                } catch (error) {
                    console.error('API移除收藏失敗，回退到本地存儲:', error);
                    // 失敗後回退到本地存儲
                }
            }

            // 從列表中移除 (檢查 id 和 place_id)
            const initialLength = this.stores.length;
            this.stores = this.stores.filter(store => 
                store.id !== storeId && store.place_id !== storeId
            );
            
            // 如果長度沒變，說明沒有找到對應的收藏
            if (initialLength === this.stores.length) {
                console.log(`未找到ID為 ${storeId} 的收藏餐廳`);
                return false;
            }
            
            // 更新 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log(`成功移除餐廳收藏 (ID: ${storeId})`);

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('移除店家收藏失敗:', error);
            return false;
        }
    }

    // 更新店家資訊
    async updateStoreInfo(storeId, updatedData) {
        try {
            if (!this.initialized) {
                console.error('收藏系統未初始化');
                return false;
            }

            if (!storeId) {
                console.error('更新店家資訊失敗: 缺少餐廳ID');
                return false;
            }

            // 找到要更新的店家
            const storeIndex = this.stores.findIndex(store => 
                (store.id === storeId) || (store.place_id === storeId)
            );
            
            if (storeIndex === -1) {
                console.log(`未找到ID為 ${storeId} 的收藏餐廳，無法更新資訊`);
                return false;
            }
            
            // 更新店家資訊
            this.stores[storeIndex] = {
                ...this.stores[storeIndex],
                ...updatedData,
                id: storeId,
                place_id: storeId
            };
            
            // 更新 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log(`成功更新餐廳資訊 (ID: ${storeId})`);

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('更新店家資訊失敗:', error);
            return false;
        }
    }

    // 添加評論收藏
    async addReview(reviewData) {
        try {
            if (!this.initialized) {
                console.error('收藏系統未初始化');
                return false;
            }

            // 確保有 ID
            if (!reviewData.id) {
                console.error('添加收藏失敗: 缺少評論ID');
                return false;
            }

            // 檢查是否已收藏
            if (this.isReviewFavorited(reviewData.id)) {
                console.log('該評論已在收藏列表中');
                return true; // 已經收藏了，視為成功
            }

            // 添加收藏時間戳
            reviewData.favoriteTime = new Date().toISOString();

            // 添加到收藏列表
            this.reviews.push(reviewData);
            
            // 保存到 localStorage
            localStorage.setItem('favoriteReviews', JSON.stringify(this.reviews));
            console.log(`成功收藏評論 (ID: ${reviewData.id})`);

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('添加評論收藏失敗:', error);
            return false;
        }
    }

    // 移除評論收藏
    async removeReview(reviewId) {
        try {
            if (!this.initialized) {
                console.error('收藏系統未初始化');
                return false;
            }

            if (!reviewId) {
                console.error('移除收藏失敗: 缺少評論ID');
                return false;
            }

            // 從列表中移除
            const initialLength = this.reviews.length;
            this.reviews = this.reviews.filter(review => review.id !== reviewId);
            
            // 如果長度沒變，說明沒有找到對應的收藏
            if (initialLength === this.reviews.length) {
                console.log(`未找到ID為 ${reviewId} 的收藏評論`);
                return false;
            }
            
            // 更新 localStorage
            localStorage.setItem('favoriteReviews', JSON.stringify(this.reviews));
            console.log(`成功移除評論收藏 (ID: ${reviewId})`);

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('移除評論收藏失敗:', error);
            return false;
        }
    }

    // 檢查店家是否已收藏
    async isStoreFavorited(storeId) {
        if (!storeId) {
            console.log('無效的 storeId');
            return false;
        }
        
        try {
            // 確保已初始化
            if (!this.initialized) {
                console.log('系統未初始化，進行初始化');
                await this.initialize();
            }

            // 如果使用API且已登入，重新載入收藏列表
            if (this.useApi && this.userId > 0) {
                console.log(`正在檢查用戶 ${this.userId} 的收藏狀態，storeId: ${storeId}`);
                await this.loadFavorites();
            }

            console.log('當前收藏列表:', this.stores);

            // 檢查是否在收藏列表中
            const isFavorited = this.stores.some(store => {
                console.log('比對收藏記錄:', {
                    store_id: store.id,
                    store_place_id: store.place_id,
                    checking_id: storeId,
                    matches_id: store.id === storeId,
                    matches_place_id: store.place_id === storeId
                });
                
                const match = store.id === storeId || store.place_id === storeId;
                if (match) {
                    console.log('找到匹配的收藏記錄:', store);
                }
                return match;
            });

            console.log(`檢查收藏狀態 - storeId: ${storeId}, 結果: ${isFavorited}`);
            return isFavorited;
        } catch (error) {
            console.error('檢查收藏狀態失敗:', error);
            return false;
        }
    }

    // 為了兼容性，添加 isFavorite 作為 isStoreFavorited 的別名
    async isFavorite(storeId) {
        return await this.isStoreFavorited(storeId);
    }

    // 檢查評論是否已收藏
    isReviewFavorited(reviewId) {
        if (!reviewId) return false;
        return this.reviews.some(review => review && review.id === reviewId);
    }

    // 獲取收藏的餐廳列表
    getFavoriteStores() {
        console.log('獲取收藏的餐廳列表');
        
        // 如果收藏系統未初始化，先初始化
        if (!this.initialized) {
            console.warn('收藏系統未初始化，嘗試初始化');
            this.initialize();
        }
        
        // 返回深拷貝，避免外部修改影響原始數據
        try {
            // 檢查 stores 是否為有效數組
            if (!Array.isArray(this.stores)) {
                console.warn('收藏餐廳不是有效數組，返回空數組');
                return [];
            }
            
            // 返回深拷貝
            return JSON.parse(JSON.stringify(this.stores || []));
        } catch (error) {
            console.error('獲取收藏餐廳列表時出錯:', error);
            return [];
        }
    }

    // 獲取所有收藏的評論
    getFavoriteReviews() {
        return this.reviews;
    }

    // 清空所有收藏
    async clearAllFavorites() {
        try {
            this.stores = [];
            this.reviews = [];
            localStorage.removeItem('favoriteStores');
            localStorage.removeItem('favoriteReviews');
            console.log('成功清空所有收藏');

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('清空收藏失敗:', error);
            return false;
        }
    }

    // 觸發收藏變更事件
    triggerFavoritesChangedEvent() {
        const event = new CustomEvent('favoritesChanged', {
            detail: {
                stores: this.stores,
                reviews: this.reviews
            }
        });
        document.dispatchEvent(event);
        console.log('已觸發收藏變更事件');
    }
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