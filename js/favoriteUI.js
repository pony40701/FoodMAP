// 收藏系統UI處理模組
class FavoriteUI {
    constructor() {
        this.mapInstance = null;
        this.markers = [];
        this.currentView = 'list'; // 'list' 或 'map'
    }

    // 初始化UI
    async initialize() {
        try {
            // 初始化標籤頁切換
            this.initializeTabs();
            
            // 初始化視圖切換
            this.initializeViewToggle();

            // 載入收藏內容
            await this.loadContent();

            ('收藏UI初始化成功');
            return true;
        } catch (error) {
            console.error('收藏UI初始化失敗:', error);
            throw error;
        }
    }

    // 初始化標籤頁切換
    initializeTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                
                // 更新按鈕狀態
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // 更新內容顯示
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(tabId + 'Tab').classList.add('active');

                // 如果切換到店家標籤且在地圖視圖，更新地圖
                if (tabId === 'stores' && this.currentView === 'map') {
                    this.initializeMap();
                }
            });
        });
    }

    // 初始化視圖切換
    initializeViewToggle() {
        const listViewBtn = document.getElementById('listViewBtn');
        const mapViewBtn = document.getElementById('mapViewBtn');
        const mapContainer = document.getElementById('mapContainer');
        const storesGrid = document.querySelector('.stores-grid');

        if (!listViewBtn || !mapViewBtn || !mapContainer || !storesGrid) {
            console.error('找不到視圖切換所需的DOM元素');
            return;
        }

        listViewBtn.addEventListener('click', () => {
            this.currentView = 'list';
            listViewBtn.classList.add('active');
            mapViewBtn.classList.remove('active');
            mapContainer.style.display = 'none';
            storesGrid.style.display = 'grid';
        });

        mapViewBtn.addEventListener('click', () => {
            this.currentView = 'map';
            mapViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            mapContainer.style.display = 'block';
            storesGrid.style.display = 'none';
            this.initializeMap();
        });
    }

    // 載入收藏內容
    async loadContent() {
        await this.loadStores();
        await this.loadReviews();
    }

    // 載入收藏店家
    async loadStores() {
        const storesGrid = document.querySelector('.stores-grid');
        if (!storesGrid) {
            console.error('找不到店家列表容器');
            return;
        }

        const stores = window.favoriteSystem.getFavoriteStores();

        if (stores.length === 0) {
            storesGrid.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
            return;
        }

        storesGrid.innerHTML = stores.map(store => this.createStoreCard(store)).join('');
        
        // 初始化收藏按鈕
        if (window.favoriteButton) {
            window.favoriteButton.initializeAllButtons();
        }
        
        // 為每個商家卡片的詳情按鈕添加點擊事件
        storesGrid.querySelectorAll('.btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const storeId = btn.getAttribute('data-store-id');
                if (storeId) {
                    this.viewStoreDetail(storeId);
                }
            });
        });
    }

    // 創建店家卡片
    createStoreCard(store) {
        // 處理圖片URL：可能是字符串或者是包含URL的對象陣列
        let imageUrl = 'images/default-restaurant.jpg';
        
        if (store.photos) {
            // 如果photos是字符串，直接使用
            if (typeof store.photos === 'string') {
                imageUrl = store.photos;
            }
            // 如果photos是陣列且有內容
            else if (Array.isArray(store.photos) && store.photos.length > 0) {
                // 如果第一個元素有url屬性
                if (store.photos[0].url) {
                    imageUrl = store.photos[0].url;
                }
                // 如果第一個元素是字符串
                else if (typeof store.photos[0] === 'string') {
                    imageUrl = store.photos[0];
                }
            }
            // 如果photos是對象且有url屬性
            else if (store.photos.url) {
                imageUrl = store.photos.url;
            }
        }
        
        const rating = store.rating || 0;
        const reviewCount = store.user_ratings_total || 0;
        const address = store.address || '';

        return `
            <div class="store-card" data-store-id="${store.id}">
                <img src="${imageUrl}" alt="${store.name}" class="store-image">
                <button class="favorite-btn active" data-place-id="${store.id}" data-name="${store.name}">
                    <i class="fas fa-heart"></i>
                </button>
                <div class="store-info">
                    <h3 class="store-name">${store.name}</h3>
                    <div class="store-rating">
                        <span class="stars">${'★'.repeat(Math.floor(rating))}${rating % 1 ? '½' : ''}</span>
                        ${rating} (${reviewCount} 則評論)
                    </div>
                    <p class="store-address">${address}</p>
                    <div class="store-status">${store.isOpen ? '<span class="status-open">營業中</span>' : '<span class="status-closed">休息中</span>'}</div>
                </div>
                <div class="store-actions">
                    <button data-store-id="${store.id}" class="btn-secondary">查看詳情</button>
                </div>
            </div>
        `;
    }

    // 載入收藏評論
    async loadReviews() {
        const reviewsGrid = document.querySelector('.reviews-grid');
        if (!reviewsGrid) {
            console.error('找不到評論列表容器');
            return;
        }

        const reviews = window.favoriteSystem.getFavoriteReviews();

        if (reviews.length === 0) {
            reviewsGrid.innerHTML = '<div class="no-data">還沒有收藏任何評論</div>';
            return;
        }

        reviewsGrid.innerHTML = reviews.map(review => this.createReviewCard(review)).join('');
        
        // 初始化收藏按鈕
        if (window.favoriteButton) {
            window.favoriteButton.initializeAllButtons();
        }
    }

    // 創建評論卡片
    createReviewCard(review) {
        return `
            <div class="review-card" data-review-id="${review.id}">
                <div class="review-header">
                    <img src="${review.userAvatar || 'images/default-avatar.jpg'}" alt="${review.userName}" class="reviewer-avatar">
                    <div>
                        <div class="reviewer-name">${review.userName}</div>
                        <div class="store-name">${review.storeName}</div>
                    </div>
                </div>
                <div class="review-content">${review.content}</div>
                <div class="review-footer">
                    <div class="review-rating">${'★'.repeat(review.rating)}</div>
                    <div class="review-date">${new Date(review.date).toLocaleDateString()}</div>
                    <button class="favorite-btn active">
                        <i class="fas fa-star"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 初始化地圖
    async initializeMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('找不到地圖容器元素');
            return;
        }

        const stores = window.favoriteSystem.getFavoriteStores();

        if (stores.length === 0) {
            mapElement.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
            return;
        }

        // 確保 Google Maps API 已載入
        if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
            console.error('Google Maps API 未載入');
            return;
        }

        // 清除現有標記
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        // 創建地圖
        this.mapInstance = new google.maps.Map(mapElement, {
            center: { lat: stores[0].location.lat, lng: stores[0].location.lng },
            zoom: 13
        });

        // 添加標記
        stores.forEach(store => {
            if (store.location) {
                const marker = new google.maps.Marker({
                    position: { lat: store.location.lat, lng: store.location.lng },
                    map: this.mapInstance,
                    title: store.name
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="map-info-window">
                            <h3>${store.name}</h3>
                            <p>${store.address}</p>
                            <p>評分：${store.rating ? store.rating + ' ★' : '暫無評分'}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(this.mapInstance, marker);
                });

                this.markers.push(marker);
            }
        });

        // 調整地圖視角以顯示所有標記
        if (this.markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            this.markers.forEach(marker => bounds.extend(marker.getPosition()));
            this.mapInstance.fitBounds(bounds);
        }
    }

    // 切換店家收藏狀態
    async toggleStoreFavorite(storeId) {
        try {
            await window.favoriteSystem.removeStore(storeId);
            await this.loadStores();
            if (this.currentView === 'map') {
                this.initializeMap();
            }
        } catch (error) {
            console.error('切換店家收藏狀態失敗:', error);
            alert('操作失敗，請稍後再試');
        }
    }

    // 切換評論收藏狀態
    async toggleReviewFavorite(reviewId) {
        try {
            await window.favoriteSystem.removeReview(reviewId);
            await this.loadReviews();
        } catch (error) {
            console.error('切換評論收藏狀態失敗:', error);
            alert('操作失敗，請稍後再試');
        }
    }

    // 查看店家詳情
    viewStoreDetail(storeId) {
        // 獲取店家資訊
        const store = window.favoriteSystem.getFavoriteStores().find(s => s.id === storeId || s.place_id === storeId);
        
        if (!store) {
            console.error(`找不到ID為 ${storeId} 的店家資訊`);
            alert('無法顯示店家詳情');
            return;
        }
        
        ('顯示店家詳情:', store);
        
        // 直接調用我們的方法，避免被userCenter.js覆蓋
        this.showRestaurantDetail(store);
    }
    
    // 顯示餐廳詳情彈窗
    showRestaurantDetail(restaurant) {
        // 獲取彈窗元素
        const modal = document.getElementById('restaurantModal');
        if (!modal) {
            console.error('找不到餐廳詳情彈窗元素');
            alert('找不到餐廳詳情彈窗元素');
            return;
        }
        
        ('彈窗存在，準備顯示餐廳詳情', restaurant);

        // 獲取內容容器
        const content = modal.querySelector('.restaurant-modal-content');
        if (!content) {
            console.error('找不到餐廳彈窗內容容器');
            alert('找不到餐廳彈窗內容容器');
            return;
        }
        
        // 使用 place_id 作為備選 ID
        const restaurantId = restaurant.id || restaurant.place_id;
        
        // 檢查餐廳是否已被收藏
        const isFavorite = window.favoriteSystem && restaurantId && 
            window.favoriteSystem.isStoreFavorited(restaurantId);
        const favoriteIconClass = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        
        // 處理圖片URL
        let imageUrl = 'images/default-restaurant.jpg';
        if (restaurant.photos) {
            // 如果photos是字符串，直接使用
            if (typeof restaurant.photos === 'string') {
                imageUrl = restaurant.photos;
            }
            // 如果photos是陣列且有內容
            else if (Array.isArray(restaurant.photos) && restaurant.photos.length > 0) {
                // 如果第一個元素有url屬性
                if (restaurant.photos[0].url) {
                    imageUrl = restaurant.photos[0].url;
                }
                // 如果第一個元素是字符串
                else if (typeof restaurant.photos[0] === 'string') {
                    imageUrl = restaurant.photos[0];
                }
            }
            // 如果photos是對象且有url屬性
            else if (restaurant.photos.url) {
                imageUrl = restaurant.photos.url;
            }
        }
        
        ('餐廳圖片URL:', imageUrl);
        
        // 處理評分與評論數
        const rating = restaurant.rating || 0;
        const reviewCount = restaurant.user_ratings_total || 0;
        const address = restaurant.address || '';
        
        // 生成星級評分
        const generateStars = (rating) => {
            const fullStars = Math.floor(rating);
            const halfStar = rating % 1 >= 0.5;
            const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
            
            return '★'.repeat(fullStars) + 
                (halfStar ? '★' : '') + 
                '☆'.repeat(emptyStars);
        };
        
        // 設置彈窗內容
        content.innerHTML = `
            <div class="restaurant-modal-header">
                <h2>${restaurant.name}</h2>
                <span class="restaurant-modal-close" onclick="window.favoriteUI.closeRestaurantModal()">&times;</span>
            </div>
            <div class="restaurant-modal-body">
                <div class="restaurant-details">
                    <div class="restaurant-main-info">
                        <div class="restaurant-modal-image">
                            <img src="${imageUrl}" alt="${restaurant.name}" onerror="this.src='images/default-restaurant.jpg'">
                        </div>
                        <div class="restaurant-info-text">
                            <div class="modal-rating">
                                <span class="modal-stars">${generateStars(rating)}</span>
                                <span class="modal-rating-value">${rating.toFixed(1)}</span>
                                <span class="modal-rating-count">(${reviewCount} 則評論)</span>
                            </div>
                            <div class="modal-address">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${address}</span>
                            </div>
                            <div class="modal-hours">
                                <div class="modal-status ${restaurant.isOpen ? 'open' : 'closed'}">
                                    <i class="fas fa-clock"></i>
                                    <span>${restaurant.isOpen ? '營業中' : '休息中'}</span>
                                </div>
                            </div>
                            <div class="modal-actions">
                                <button class="modal-favorite-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                                        data-place-id="${restaurantId}" 
                                        data-name="${restaurant.name.replace(/'/g, "\\'")}">
                                    <i class="${favoriteIconClass}"></i> 收藏
                                </button>
                                <button class="modal-direction-btn" onclick="window.favoriteUI.openGoogleMaps('${address.replace(/'/g, "\\'")}')">
                                    <i class="fas fa-directions"></i> 導航
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 顯示彈窗
        modal.style.display = 'block';
        modal.classList.add('active');
        
        // 輸出確認信息
        ('彈窗已顯示', modal.style.display, modal.classList);
        
        // 保存當前選中的餐廳
        window.currentSelectedRestaurant = restaurant;

        // 初始化收藏按鈕
        if (window.favoriteButton) {
            window.favoriteButton.initializeAllButtons();
        }
        
        // 監聽 ESC 鍵關閉彈窗
        const escCloseHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeRestaurantModal();
                document.removeEventListener('keydown', escCloseHandler);
            }
        };
        document.addEventListener('keydown', escCloseHandler);

        // 點擊彈窗外部關閉
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeRestaurantModal();
            }
        };
    }
    
    // 關閉餐廳詳情彈窗
    closeRestaurantModal() {
        const modal = document.getElementById('restaurantModal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            ('彈窗已關閉', modal.style.display, modal.classList);
        }
    }
    
    // 開啟 Google Maps 導航
    openGoogleMaps(address) {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    }
}

// 創建全局實例
window.favoriteUI = new FavoriteUI(); 

// 覆蓋 userCenter.js 中的 showRestaurantModal 方法
// 這是為了確保我們的方法不被 userCenter.js 的同名方法覆蓋
window.showRestaurantModal = function(placeId) {
    ('使用 favoriteUI 的彈窗方法');
    if (window.favoriteUI) {
        window.favoriteUI.viewStoreDetail(placeId);
    }
};

// 在 DOM 加載完成後自動初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        ('正在初始化 FavoriteUI...');
        
        // 確保收藏系統已初始化
        if (window.favoriteSystem && !window.favoriteSystem.initialized) {
            await window.favoriteSystem.initialize();
        }
        
        // 初始化 UI
        if (window.favoriteUI) {
            await window.favoriteUI.initialize();
            
            // 直接為店家卡片添加點擊事件
            const addCardClickHandlers = () => {
                document.querySelectorAll('.store-card').forEach(card => {
                    ('為店家卡片添加點擊事件');
                    card.addEventListener('click', function(e) {
                        // 如果點擊的是收藏按鈕或查看詳情按鈕，不處理
                        if (e.target.closest('.favorite-btn') || e.target.closest('.btn-secondary')) {
                            return;
                        }
                        
                        const storeId = this.getAttribute('data-store-id');
                        if (storeId) {
                            e.preventDefault();
                            e.stopPropagation();
                            window.favoriteUI.viewStoreDetail(storeId);
                        }
                    });
                });
                
                // 為查看詳情按鈕添加事件
                document.querySelectorAll('.btn-secondary').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const storeId = this.getAttribute('data-store-id');
                        if (storeId) {
                            window.favoriteUI.viewStoreDetail(storeId);
                        }
                    });
                });
            };
            
            // 添加事件處理器
            addCardClickHandlers();
            
            // 監聽 DOM 變動，為新添加的卡片添加事件處理器
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        addCardClickHandlers();
                    }
                });
            });
            
            // 監聽包含卡片的容器
            const storesContainer = document.querySelector('.stores-grid');
            if (storesContainer) {
                observer.observe(storesContainer, { childList: true, subtree: true });
            }
        }
    } catch (error) {
        console.error('初始化 FavoriteUI 失敗:', error);
    }
}); 