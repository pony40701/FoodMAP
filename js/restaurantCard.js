// 餐廳卡片模組
class RestaurantCard {
    constructor() {
        this.favoriteStores = JSON.parse(localStorage.getItem('favoriteStores')) || [];
    }

    // 顯示餐廳列表
    displayRestaurants(places) {
        const container = document.getElementById('restaurants-container');
        if (!container) {
            console.error('找不到餐廳容器元素 #restaurants-container');
            return;
        }

        container.innerHTML = '';
        if (!places || places.length === 0) {
            container.innerHTML = '<div class="no-results">沒有找到相關的餐廳</div>';
            return;
        }

        // 收藏排序
        const sortedPlaces = places.sort((a, b) => {
            const aIsFavorite = this.favoriteStores.includes(a.id);
            const bIsFavorite = this.favoriteStores.includes(b.id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        sortedPlaces.forEach(place => {
            const card = this.createRestaurantCard(place);
            container.appendChild(card);
        });
    }

    // 創建餐廳卡片
    createRestaurantCard(place) {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.dataset.placeId = place.id;

        const isFavorite = this.favoriteStores.includes(place.id);
        const favoriteClass = isFavorite ? 'active' : '';
        const favoriteIcon = isFavorite ? 'fas fa-heart' : 'far fa-heart';

        card.innerHTML = `
            <div class="restaurant-image">
                <img src="${place.image || '../IMAGE/default-restaurant.jpg'}" alt="${place.name}">
                <button class="favorite-btn ${favoriteClass}" onclick="window.toggleFavorite('${place.id}', this)">
                    <i class="${favoriteIcon}"></i>
                </button>
            </div>
            <div class="restaurant-info">
                <h3 class="restaurant-name">${place.name}</h3>
                <div class="restaurant-rating">
                    ${this.generateRatingStars(place.rating)}
                    <span class="rating-count">(${place.user_ratings_total || 0})</span>
                </div>
                <p class="restaurant-address">${place.address}</p>
                <div class="restaurant-status ${place.isOpen ? 'open' : 'closed'}">
                    ${place.isOpen ? '營業中' : '休息中'}
                </div>
            </div>
            <div class="restaurant-actions">
                <button class="btn-secondary view-detail" onclick="window.showRestaurantDetail('${place.id}')">
                    查看詳情
                </button>
            </div>
        `;

        return card;
    }

    // 生成評分星星
    generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
            <span class="rating-value">${rating.toFixed(1)}</span>
        `;
    }    // 切換收藏狀態
    toggleFavorite(placeId, button) {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            // 顯示提示訊息
            alert('請先登入會員以使用收藏功能');
            // 開啟登入視窗
            document.getElementById('loginModal').style.display = 'block';
            
            // 設定登入成功後的回調函數
            window.onLoginSuccess = () => {
                // 登入成功後自動將餐廳加入收藏
                this.favoriteStores.push(placeId);
                button.classList.add('active');
                button.querySelector('i').className = 'fas fa-heart';
                localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteStores));
            };
            return;
        }

        const index = this.favoriteStores.indexOf(placeId);
        if (index > -1) {
            this.favoriteStores.splice(index, 1);
            button.classList.remove('active');
            button.querySelector('i').className = 'far fa-heart';
        } else {
            this.favoriteStores.push(placeId);
            button.classList.add('active'); 
            button.querySelector('i').className = 'fas fa-heart';
        }

        localStorage.setItem('favoriteStores', JSON.stringify(this.favoriteStores));
    }

    // 更新結果標題
    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

export default RestaurantCard; 