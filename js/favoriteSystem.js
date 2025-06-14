// 收藏系統核心模組
class FavoriteSystem {
    constructor() {
        this.initialized = false;
        this.stores = [];
        this.reviews = [];
        
        // 設置API支持標誌
        this.useApi = false;
        this.userId = null;
    }

    // 初始化收藏系統
    async initialize() {
        console.log('初始化收藏系統');
        
        try {
            // 檢查登入狀態和用戶ID
            this.isLoggedIn = this.checkLoginStatus();
            this.userId = parseInt(localStorage.getItem('userId') || '0');
            
            // 檢查是否使用API
            this.useApi = !!window.restaurantService && window.restaurantService.initialized;
            console.log(`收藏系統模式: ${this.useApi ? '資料庫API' : '本地存儲'}`);
            
            // 從存儲加載數據
            if (this.useApi && this.userId > 0) {
                // 使用API從數據庫加載
                try {
                    this.stores = await window.restaurantService.getFavoriteRestaurants(this.userId) || [];
                    console.log(`成功從API載入 ${this.stores.length} 個收藏餐廳`);
                    // 注意: 評論收藏暫時使用localStorage
                    const favoriteReviews = localStorage.getItem('favoriteReviews');
                    this.reviews = favoriteReviews ? JSON.parse(favoriteReviews) : [];
                } catch (error) {
                    console.error('從API加載收藏失敗，回退到localStorage:', error);
                    await this.loadFromLocalStorage();
                }
            } else {
                // 使用localStorage
                await this.loadFromLocalStorage();
            }
            
            // 設置初始化標誌
            this.initialized = true;
            console.log('收藏系統初始化完成');
            
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
            // 如果是API模式且已登入，則重新獲取數據
            if (this.useApi && this.userId > 0) {
                try {
                    // 使用API從數據庫加載
                    this.stores = await window.restaurantService.getFavoriteRestaurants(this.userId) || [];
                    console.log(`成功從API重新載入 ${this.stores.length} 個收藏餐廳`);
                } catch (error) {
                    console.error('從API加載收藏失敗:', error);
                    // 使用本地數據
                }
            } else {
                // 從 localStorage 讀取收藏數據
                const storedStores = localStorage.getItem('favoriteStores');
                const storedReviews = localStorage.getItem('favoriteReviews');

                this.stores = storedStores ? JSON.parse(storedStores) : [];
                this.reviews = storedReviews ? JSON.parse(storedReviews) : [];
            }

            // 確保每個收藏的餐廳都有 place_id
            this.stores = this.stores.filter(store => {
                if (!store || (!store.id && !store.place_id)) {
                    console.warn('發現無效的收藏餐廳數據，已過濾');
                    return false;
                }
                
                // 確保 id 和 place_id 一致
                if (!store.place_id && store.id) {
                    store.place_id = store.id;
                } else if (!store.id && store.place_id) {
                    store.id = store.place_id;
                }
                
                return true;
            });

            return {
                stores: this.stores,
                reviews: this.reviews
            };
        } catch (error) {
            console.error('載入收藏數據失敗:', error);
            // 重置收藏數據
            this.stores = [];
            this.reviews = [];
            localStorage.removeItem('favoriteStores');
            localStorage.removeItem('favoriteReviews');
            throw error;
        }
    }

    // 添加店家收藏
    async addStore(storeData) {
        try {
            if (!this.initialized) {
                console.error('收藏系統未初始化');
                return false;
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

            // 檢查是否已收藏
            if (this.isStoreFavorited(storeData.place_id)) {
                console.log('該店家已在收藏列表中');
                return true; // 已經收藏了，視為成功
            }
            
            // API模式且已登入
            if (this.useApi && this.userId > 0) {
                try {
                    const success = await window.restaurantService.addFavorite(this.userId, storeData.place_id);
                    if (success) {
                        console.log(`成功透過API收藏餐廳: ${storeData.name} (ID: ${storeData.place_id})`);
                        // 添加到本地列表
                        storeData.favoriteTime = new Date().toISOString();
                        this.stores.push(storeData);
                        // 觸發收藏變更事件
                        this.triggerFavoritesChangedEvent();
                        return true;
                    } else {
                        console.error('API收藏餐廳失敗');
                        return false;
                    }
                } catch (error) {
                    console.error('API收藏失敗，回退到本地存儲:', error);
                    // 失敗後回退到本地存儲
                }
            }

            // 添加收藏時間戳
            storeData.favoriteTime = new Date().toISOString();

            // 添加到收藏列表
            this.stores.push(storeData);
            
            // 保存到 localStorage
            localStorage.setItem('favoriteStores', JSON.stringify(this.stores));
            console.log(`成功收藏餐廳: ${storeData.name} (ID: ${storeData.place_id})`);

            // 觸發收藏變更事件
            this.triggerFavoritesChangedEvent();

            return true;
        } catch (error) {
            console.error('添加店家收藏失敗:', error);
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
    isStoreFavorited(storeId) {
        if (!storeId) return false;
        
        // API模式且已登入
        if (this.useApi && this.userId > 0 && window.restaurantService) {
            // 先從本地列表查詢，避免每次都調用API
            const isInLocalList = this.stores.some(store => 
                (store.id && store.id === storeId) || (store.place_id && store.place_id === storeId)
            );
            
            if (isInLocalList) {
                return true;
            }
            
            // 如果本地不存在，可以考慮調用API確認
            // 注意：這裡不使用異步調用，避免複雜性
        }
        
        // 從本地列表檢查
        return this.stores.some(store => 
            (store.id && store.id === storeId) || 
            (store.place_id && store.place_id === storeId)
        );
    }

    // 為了兼容性，添加 isFavorite 作為 isStoreFavorited 的別名
    isFavorite(storeId) {
        return this.isStoreFavorited(storeId);
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