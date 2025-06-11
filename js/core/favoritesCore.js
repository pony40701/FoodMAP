// 收藏功能核心模組
class FavoritesCore {
  constructor() {
    this.favoriteStores = [];
    this.favoriteReviews = [];
    this.callbacks = new Map();
    this.init();
  }

  // 初始化
  init() {
    this.loadFavorites();
  }

  // 載入收藏資料
  loadFavorites() {
    this.favoriteStores = JSON.parse(localStorage.getItem('favoriteStores')) || [];
    this.favoriteReviews = JSON.parse(localStorage.getItem('favoriteReviews')) || [];
  }

  // 儲存收藏資料
  saveFavorites() {
    localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteStores));
    localStorage.setItem('favoriteReviews', JSON.stringify(this.favoriteReviews));
  }

  // 註冊狀態變更回調
  onStateChange(key, callback) {
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, []);
    }
    this.callbacks.get(key).push(callback);
  }

  // 移除狀態變更回調
  offStateChange(key, callback) {
    if (!this.callbacks.has(key)) return;
    const callbacks = this.callbacks.get(key);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // 觸發狀態變更回調
  notifyStateChange(type) {
    if (!this.callbacks.has(type)) return;
    const callbacks = this.callbacks.get(type);
    callbacks.forEach(callback => callback());
  }

  // 收藏店家
  addStore(placeId) {
    if (!this.favoriteStores.includes(placeId)) {
      this.favoriteStores.push(placeId);
      this.saveFavorites();
      this.notifyStateChange('stores');
      return true;
    }
    return false;
  }

  // 取消收藏店家
  removeStore(placeId) {
    const index = this.favoriteStores.indexOf(placeId);
    if (index > -1) {
      this.favoriteStores.splice(index, 1);
      this.saveFavorites();
      this.notifyStateChange('stores');
      return true;
    }
    return false;
  }

  // 檢查店家是否已收藏
  isStoreFavorite(placeId) {
    return this.favoriteStores.includes(placeId);
  }

  // 獲取收藏的店家
  getFavoriteStores() {
    return [...this.favoriteStores];
  }

  // 收藏心得
  addReview(review) {
    if (!this.favoriteReviews.some(r => r.id === review.id)) {
      this.favoriteReviews.unshift(review);
      this.saveFavorites();
      this.notifyStateChange('reviews');
      return true;
    }
    return false;
  }

  // 取消收藏心得
  removeReview(reviewId) {
    const index = this.favoriteReviews.findIndex(r => r.id === reviewId);
    if (index > -1) {
      this.favoriteReviews.splice(index, 1);
      this.saveFavorites();
      this.notifyStateChange('reviews');
      return true;
    }
    return false;
  }

  // 檢查心得是否已收藏
  isReviewFavorite(reviewId) {
    return this.favoriteReviews.some(r => r.id === reviewId);
  }

  // 獲取收藏的心得
  getFavoriteReviews() {
    return [...this.favoriteReviews];
  }
}

// 創建全局單例
window.favoritesCore = new FavoritesCore();

export default window.favoritesCore;
