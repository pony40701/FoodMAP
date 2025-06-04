// 收藏功能核心模組
class FavoritesModule {
    constructor() {
        this.favoriteStores = [];
        this.favoriteReviews = [];
        this.map = null;
        this.markers = [];
    }

    // 從 localStorage 獲取收藏數據
    getFavoriteStores() {
        return JSON.parse(localStorage.getItem('favoriteStores')) || [];
    }

    getFavoriteReviews() {
        return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
    }

    // 收藏店家
    addToFavorites(placeId) {
        let favorites = this.getFavoriteStores();
        if (!favorites.includes(placeId)) {
            favorites.push(placeId);
            localStorage.setItem('favoriteStores', JSON.stringify(favorites));
            return true;
        }
        return false;
    }

    // 取消收藏店家
    removeFromFavorites(placeId) {
        let favorites = this.getFavoriteStores();
        favorites = favorites.filter(id => id !== placeId);
        localStorage.setItem('favoriteStores', JSON.stringify(favorites));
        return true;
    }

    // 收藏心得
    addToFavoriteReviews(review) {
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
    removeFromFavoriteReviews(reviewId) {
        let favorites = this.getFavoriteReviews();
        favorites = favorites.filter(review => review.id !== reviewId);
        localStorage.setItem('favoriteReviews', JSON.stringify(favorites));
        return true;
    }

    // 檢查是否已收藏
    isStoreFavorite(placeId) {
        return this.getFavoriteStores().includes(placeId);
    }

    isReviewFavorite(reviewId) {
        return this.getFavoriteReviews().some(review => review.id === reviewId);
    }

    // 初始化地圖
    initializeMap(containerId, stores = []) {
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
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        // 創建地圖
        this.map = new google.maps.Map(mapElement, {
            center: stores.length > 0 ? 
                { lat: stores[0].geometry.location.lat(), lng: stores[0].geometry.location.lng() } : 
                { lat: 25.0330, lng: 121.5654 }, // 預設台北市中心
            zoom: 13
        });

        // 添加標記
        stores.forEach(store => {
            if (store.geometry && store.geometry.location) {
                const marker = new google.maps.Marker({
                    position: { lat: store.geometry.location.lat(), lng: store.geometry.location.lng() },
                    map: this.map,
                    title: store.name
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
        });

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

// 導出模組
export default FavoritesModule; 