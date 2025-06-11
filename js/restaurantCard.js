// 餐廳卡片模組
import favoritesCore from '../core/favoritesCore.js';

export class RestaurantCard {
    constructor() {
        this.setupEventListeners();
    }

    // 設置事件監聽器
    setupEventListeners() {
        // 監聽收藏狀態變更
        favoritesCore.onStateChange('stores', () => {
            this.updateAllFavoriteButtons();
        });

        // 監聽收藏按鈕點擊
        document.addEventListener('click', (e) => {
            const favoriteBtn = e.target.closest('.favorite-btn');
            if (!favoriteBtn) return;

            e.preventDefault();
            e.stopPropagation();

            const restaurantCard = favoriteBtn.closest('.restaurant-card');
            if (!restaurantCard) return;

            const placeId = restaurantCard.dataset.placeId;
            if (!placeId) {
                console.error('找不到餐廳ID');
                return;
            }

            this.toggleFavorite(placeId, favoriteBtn);
        });
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
        }        // 收藏排序
        const sortedPlaces = places.sort((a, b) => {
            const aIsFavorite = favoritesCore.isStoreFavorite(a.place_id);
            const bIsFavorite = favoritesCore.isStoreFavorite(b.place_id);
            if (aIsFavorite && !bIsFavorite) return -1;
            if (!aIsFavorite && bIsFavorite) return 1;
            return 0;
        });

        container.innerHTML = sortedPlaces.map(place => this.createRestaurantCard(place)).join('');

        // 為每個卡片添加點擊事件
        const cards = container.querySelectorAll('.restaurant-card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showRestaurantDetail(places[index]);
            });
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

        // 構建卡片內容
        const content = `
            <div class="restaurant-image">
                <img src="${place.photos || '../images/no-image.jpg'}" alt="${place.name}" loading="lazy">
                <button class="favorite-btn ${favoriteClass}" onclick="event.stopPropagation();">
                    <i class="${favoriteIcon}"></i>
                </button>
            </div>
            <div class="restaurant-info">
                <div class="title-container">
                    <h3>${place.name}</h3>
                </div>
                <div class="rating">
                    <div class="stars">
                        ${this.generateRatingStars(place.rating)}
                    </div>
                    <span class="rating-text">(${place.user_ratings_total || 0})</span>
                </div>
                <p class="address">${place.address}</p>
                ${place.opening_hours ? `
                    <div class="opening-hours ${place.opening_hours.isOpen() ? 'open' : 'closed'}">
                        <i class="fas fa-clock"></i>
                        ${place.opening_hours.isOpen() ? '營業中' : '休息中'}
                    </div>
                ` : ''}
            </div>
        `;

        card.innerHTML = content;

        // 添加點擊事件到整個卡片
        card.addEventListener('click', (e) => {
            // 如果點擊的是收藏按鈕，不觸發卡片點擊事件
            if (e.target.closest('.favorite-btn')) {
                return;
            }
            
            this.showRestaurantDetail(place);
        });

        // 為收藏按鈕添加點擊事件
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(place.id, favoriteBtn);
            });
        }

        return card;
    }

    // 顯示餐廳詳細資訊
    showRestaurantDetail(place) {
        // 獲取必要的 DOM 元素
        const modal = document.getElementById('restaurantModal');
        const modalName = document.getElementById('modal-restaurant-name');
        const modalImg = document.getElementById('modal-restaurant-img');
        const modalStars = document.getElementById('modal-stars');
        const modalRating = document.getElementById('modal-rating');
        const modalRatingCount = document.getElementById('modal-rating-count');
        const modalAddress = document.getElementById('modal-address');
        const modalStatus = document.querySelector('.modal-status');
        const modalTodayHours = document.getElementById('modal-today-hours');
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        const modalDirectionBtn = document.getElementById('modal-direction-btn');

        // 設置餐廳基本資訊
        modalName.textContent = place.name;
        modalImg.src = place.photos || 'images/no-image.jpg';
        modalImg.alt = place.name;

        // 設置評分資訊
        if (modalStars) {
            modalStars.innerHTML = this.generateRatingStars(place.rating);
        }
        if (modalRating) {
            modalRating.textContent = place.rating.toFixed(1);
        }
        if (modalRatingCount) {
            modalRatingCount.textContent = `(${place.user_ratings_total || 0}則評論)`;
        }

        // 設置地址
        if (modalAddress) {
            modalAddress.textContent = place.address;
        }

        // 設置營業狀態
        if (modalStatus && place.opening_hours) {
            const isOpen = place.opening_hours.isOpen();
            modalStatus.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>${isOpen ? '營業中' : '休息中'}</span>
            `;
            modalStatus.className = `modal-status ${isOpen ? 'open' : 'closed'}`;
        }

        // 設置營業時間資訊
        if (modalTodayHours && place.opening_hours && place.opening_hours.weekday_text) {
            const today = new Date().getDay();
            modalTodayHours.textContent = place.opening_hours.weekday_text[today];
        }

        // 設置收藏按鈕狀態和事件
        if (modalFavoriteBtn) {
            const isFavorite = this.favoriteStores.includes(place.id);
            modalFavoriteBtn.classList.toggle('active', isFavorite);
            modalFavoriteBtn.innerHTML = isFavorite ? 
                '<i class="fas fa-heart"></i> 已收藏' : 
                '<i class="far fa-heart"></i> 收藏';
            
            modalFavoriteBtn.onclick = () => {
                this.toggleFavorite(place.id, modalFavoriteBtn);
            };
        }

        // 設置導航按鈕事件
        if (modalDirectionBtn) {
            modalDirectionBtn.onclick = () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.address)}`;
                window.open(url, '_blank');
            };
        }

        // 初始化地圖
        if (place.location && google && google.maps) {
            const mapContainer = document.getElementById('modal-map');
            if (mapContainer && place.location.lat && place.location.lng) {
                const map = new google.maps.Map(mapContainer, {
                    center: { 
                        lat: place.location.lat, 
                        lng: place.location.lng 
                    },
                    zoom: 15
                });

                new google.maps.Marker({
                    position: { 
                        lat: place.location.lat, 
                        lng: place.location.lng 
                    },
                    map: map,
                    title: place.name
                });
            }
        }

        // 顯示 Modal
        modal.style.display = 'block';

        // 設置關閉按鈕事件
        const closeBtn = modal.querySelector('.restaurant-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }

        // 點擊 Modal 外部關閉
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
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
        // 檢查登入狀態
        const isLoggedIn = this.checkUserLoginStatus();
        if (!isLoggedIn) {
            alert('請先登入會員');
            document.getElementById('loginModal').style.display = 'block';
            return;
        }

        const isFavorite = favoritesCore.isStoreFavorite(placeId);
        if (isFavorite) {
            if (favoritesCore.removeStore(placeId)) {
                this.updateFavoriteButton(button, false);
                this.syncFavoriteButtons(placeId, false);
                this.showToast('已取消收藏');
            }
        } else {
            if (favoritesCore.addStore(placeId)) {
                this.updateFavoriteButton(button, true);
                this.syncFavoriteButtons(placeId, true);
                this.showToast('已加入收藏');
            }
        }
    }

    // 更新收藏按鈕狀態
    updateFavoriteButton(button, isFavorite) {
        if (!button) return;
        
        const icon = button.querySelector('i');
        if (icon) {
            icon.className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
        }
        button.classList.toggle('active', isFavorite);
    }

    // 同步所有相同餐廳的收藏按鈕
    syncFavoriteButtons(placeId, isFavorite) {
        // 更新所有相同餐廳的卡片收藏按鈕
        document.querySelectorAll(`.restaurant-card[data-place-id="${placeId}"] .favorite-btn`).forEach(btn => {
            this.updateFavoriteButton(btn, isFavorite);
        });

        // 更新模態框中的收藏按鈕
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        if (modalFavoriteBtn && modalFavoriteBtn.closest('#restaurantModal').style.display === 'block') {
            this.updateFavoriteButton(modalFavoriteBtn, isFavorite);
        }
    }

    // 顯示 Toast 提示
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 顯示 Toast
        setTimeout(() => toast.classList.add('show'), 100);
        
        // 3秒後隱藏並移除 Toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // 檢查用戶登入狀態
    checkUserLoginStatus() {
        // 從 localStorage 獲取登入狀態
        const userInfo = localStorage.getItem('userInfo');
        return userInfo !== null;
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