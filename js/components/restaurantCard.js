import favoritesCore from '../core/favoritesCore.js';

// 餐廳卡片模組
class RestaurantCard {
    constructor() {
        this.setupEventListeners();
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽收藏狀態變更
        favoritesCore.onStateChange('stores', () => {
            this.updateAllFavoriteButtons();
        });
    }

    // 切換收藏狀態
    toggleFavorite(placeId, button) {
        // 檢查登入狀態
        const isLoggedIn = this.checkUserLoginStatus();
        if (!isLoggedIn) {
            alert('請先登入會員');
            document.getElementById('loginModal').style.display = 'block';
            return;
        }

        const isFavorite = favoritesCore.isStoreFavorite(placeId);
        if (isFavorite) {
            favoritesCore.removeStore(placeId);
            showToast('已移除收藏');
        } else {
            favoritesCore.addStore(placeId);
            showToast('已加入收藏');
        }

        // 更新按鈕狀態
        this.updateFavoriteButton(button, !isFavorite);
    }

    // 更新收藏按鈕狀態
    updateFavoriteButton(button, isFavorite) {
        if (button.id === 'modal-favorite-btn') {
            // 模態框中的收藏按鈕
            button.innerHTML = isFavorite ? 
                '<i class="fas fa-heart"></i> 已收藏' : 
                '<i class="far fa-heart"></i> 收藏';
            button.classList.toggle('active', isFavorite);
        } else {
            // 卡片中的收藏按鈕
            const icon = button.querySelector('i');
            if (icon) {
                icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            }
            button.classList.toggle('active', isFavorite);
        }
    }

    // 更新所有相同餐廳的收藏按鈕
    updateAllFavoriteButtons() {
        favoritesCore.getFavoriteStores().forEach(placeId => {
            // 更新卡片上的收藏按鈕
            document.querySelectorAll(`.restaurant-card[data-place-id="${placeId}"] .favorite-btn`).forEach(btn => {
                this.updateFavoriteButton(btn, true);
            });

            // 更新模態框中的收藏按鈕
            const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
            if (modalFavoriteBtn && modalFavoriteBtn.closest('#restaurantModal').style.display === 'block') {
                this.updateFavoriteButton(modalFavoriteBtn, true);
            }
        });
    }

    // 檢查使用者登入狀態
    checkUserLoginStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // 更新結果標題
    updateResultsTitle(title) {
        const resultsTitle = document.querySelector('.results-title');
        if (resultsTitle) {
            resultsTitle.textContent = title;
        }
    }
}

// 創建全局單例
window.restaurantCard = new RestaurantCard();

export default window.restaurantCard;
