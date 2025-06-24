/**
 * 收藏系統
 * 用於管理用戶收藏的餐廳
 */
class FavoriteServiceLegacy {
    constructor() {
        // 直接清除舊版收藏資料
        localStorage.removeItem('googleMapsFavorites');
        this.favorites = this.loadFavorites();
        ('收藏系統初始化完成，已載入收藏:', this.favorites);
    }
    
    /**
     * 載入收藏
     * @returns {Object} 收藏的餐廳
     */
    loadFavorites() {
        try {
            const favoritesJson = localStorage.getItem('favorites');
            return favoritesJson ? JSON.parse(favoritesJson) : {};
        } catch (error) {
            console.error('載入收藏失敗:', error);
            return {};
        }
    }
    
    /**
     * 保存收藏
     */
    saveFavorites() {
        try {
            localStorage.setItem('favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('保存收藏失敗:', error);
        }
    }
    
    /**
     * 添加收藏
     * @param {string} placeId 餐廳ID
     * @param {string} name 餐廳名稱
     */
    addFavorite(placeId, name) {
        if (!placeId) {
            console.error('無法添加收藏: 缺少餐廳ID');
            return false;
        }
        
        this.favorites[placeId] = name || placeId;
        this.saveFavorites();
        
        (`已收藏餐廳: ${name} (ID: ${placeId})`);
        return true;
    }
    
    /**
     * 移除收藏
     * @param {string} placeId 餐廳ID
     */
    removeFavorite(placeId) {
        if (!placeId) {
            console.error('無法移除收藏: 缺少餐廳ID');
            return false;
        }
        
        if (this.favorites[placeId]) {
            const name = this.favorites[placeId];
            delete this.favorites[placeId];
            this.saveFavorites();
            
            (`已取消收藏餐廳: ${name} (ID: ${placeId})`);
            return true;
        }
        
        return false;
    }
    
    /**
     * 切換收藏狀態
     * @param {string} placeId 餐廳ID
     * @param {string} name 餐廳名稱
     * @returns {boolean} 是否已收藏
     */
    toggleFavorite(placeId, name) {
        if (this.isStoreFavorited(placeId)) {
            this.removeFavorite(placeId);
            return false;
        } else {
            this.addFavorite(placeId, name);
            return true;
        }
    }
    
    /**
     * 檢查餐廳是否已收藏
     * @param {string} placeId 餐廳ID
     * @returns {boolean} 是否已收藏
     */
    isStoreFavorited(placeId) {
        return !!this.favorites[placeId];
    }
    
    /**
     * 獲取所有收藏
     * @returns {Object} 所有收藏的餐廳
     */
    getAllFavorites() {
        return {...this.favorites};
    }
    
    /**
     * 獲取收藏數量
     * @returns {number} 收藏數量
     */
    getFavoritesCount() {
        return Object.keys(this.favorites).length;
    }
}

// 創建全局實例
if (!window.favoriteSystem) {
    window.favoriteSystem = new FavoriteServiceLegacy();
} 

// 使用全域 API_BASE_URL，避免重複宣告
const favoriteApiBase = window.API_BASE_URL || 'http://localhost:8080/api';
async function loadFavorites(userId) {
  const res = await fetch(`${favoriteApiBase}/users/${userId}/favorites`);
  return res.json();
} 

// 添加到全局對象
window.favoriteServiceLegacy = {
    loadFavorites: loadFavorites
}; 