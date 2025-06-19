// 收藏功能核心模組 (舊版，保留向後兼容)
class FavoritesModule {
    constructor() {
        this.favoriteStores = [];
        this.favoriteReviews = [];
        this.map = null;
        this.markers = [];
        
        // 初始化時檢查是否有新版收藏系統
        this.checkNewFavoriteSystem();
    }
    
    // 檢查是否有新版收藏系統
    checkNewFavoriteSystem() {
        if (window.favoriteSystem) {
            ('檢測到新版收藏系統，將使用新版系統');
        } else {
            ('未檢測到新版收藏系統，使用舊版系統');
        }
    }

    // 從 localStorage 獲取收藏數據
    getFavoriteStores() {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return window.favoriteSystem.getFavoriteStores().map(store => store.id || store.place_id);
        }
        return JSON.parse(localStorage.getItem('favoriteStores')) || [];
    }

    getFavoriteReviews() {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return window.favoriteSystem.getFavoriteReviews();
        }
        return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
    }

    // 收藏店家
    async addToFavorites(placeId, name = '未知餐廳') {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            const storeData = {
                id: placeId,
                place_id: placeId,
                name: name,
                favoriteTime: new Date().toISOString()
            };
            return await window.favoriteSystem.addStore(storeData);
        }
        
        // 舊版邏輯
        let favorites = this.getFavoriteStores();
        if (!favorites.includes(placeId)) {
            favorites.push(placeId);
            localStorage.setItem('favoriteStores', JSON.stringify(favorites));
            return true;
        }
        return false;
    }

    // 取消收藏店家
    async removeFromFavorites(placeId) {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return await window.favoriteSystem.removeStore(placeId);
        }
        
        // 舊版邏輯
        let favorites = this.getFavoriteStores();
        favorites = favorites.filter(id => id !== placeId);
        localStorage.setItem('favoriteStores', JSON.stringify(favorites));
        return true;
    }

    // 收藏心得
    async addToFavoriteReviews(review) {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return await window.favoriteSystem.addReview(review);
        }
        
        // 舊版邏輯
        let favorites = this.getFavoriteReviews();
        const exists = favorites.some(fav => fav.id === review.id);
        
        if (!exists) {
            favorites.unshift(review);
            localStorage.setItem('favoriteReviews', JSON.stringify(favorites));
            return true;
        }
        return false;
    }

    // 取消收藏心得
    async removeFromFavoriteReviews(reviewId) {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return await window.favoriteSystem.removeReview(reviewId);
        }
        
        // 舊版邏輯
        let favorites = this.getFavoriteReviews();
        favorites = favorites.filter(review => review.id !== reviewId);
        localStorage.setItem('favoriteReviews', JSON.stringify(favorites));
        return true;
    }

    // 檢查是否已收藏
    isStoreFavorite(placeId) {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return window.favoriteSystem.isStoreFavorited(placeId);
        }
        
        // 舊版邏輯
        return this.getFavoriteStores().includes(placeId);
    }

    isReviewFavorite(reviewId) {
        // 優先使用新版系統
        if (window.favoriteSystem && window.favoriteSystem.initialized) {
            return window.favoriteSystem.isReviewFavorited(reviewId);
        }
        
        // 舊版邏輯
        return this.getFavoriteReviews().some(review => review.id === reviewId);
    }

    // 初始化地圖
    async initializeMap(containerId, stores = []) {
        if (typeof google === 'undefined') {
            console.error('Google Maps API 未載入');
            return;
        }

        const mapElement = document.getElementById(containerId);
        if (!mapElement) {
            console.error('找不到地圖容器元素');
            return;
        }

        // 清除現有的標記
        this.markers.forEach(marker => marker.map = null);
        this.markers = [];

        // 創建地圖
        this.map = new google.maps.Map(mapElement, {
            center: stores.length > 0 ? 
                { lat: stores[0].geometry.location.lat(), lng: stores[0].geometry.location.lng() } : 
                { lat: 25.0330, lng: 121.5654 }, // 預設台北市中心
            zoom: 13
        });

        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // 添加標記
        for (const store of stores) {
            if (store.geometry && store.geometry.location) {
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
                    position: { 
                        lat: store.geometry.location.lat(), 
                        lng: store.geometry.location.lng() 
                    },
                    title: store.name,
                    content: markerContent
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="map-info-window">
                            <h3>${store.name}</h3>
                            <p>${store.vicinity || '地址未知'}</p>
                            <p>評分：${store.rating !== undefined ? store.rating + ' ★' : '暫無評分'}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(this.map, marker);
                });

                this.markers.push(marker);
            }
        }

        // 如果有店家，調整地圖視角以顯示所有標記
        if (stores.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            stores.forEach(store => {
                if (store.geometry && store.geometry.location) {
                    bounds.extend(store.geometry.location);
                }
            });
            this.map.fitBounds(bounds);
        }
    }

    // 切換視圖模式
    toggleViewMode(listViewContainer, mapViewContainer, isMapView) {
        if (isMapView) {
            listViewContainer.style.display = 'none';
            mapViewContainer.style.display = 'block';
            // 重新初始化地圖
            this.initializeMap(mapViewContainer.id);
        } else {
            listViewContainer.style.display = 'grid';
            mapViewContainer.style.display = 'none';
        }
    }
}

// 創建全局實例
window.favoritesModule = new FavoritesModule();

// 導出模組
export default FavoritesModule; 