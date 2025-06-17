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

        // 在渲染卡片前，先計算每家餐廳的 isOpen 狀態
        places.forEach(place => {
            place.isOpen = this.isRestaurantOpen(place.openTime, place.closeTime);
        });

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
        // 使用 place_id 作為備選 ID
        const restaurantId = place.id || place.place_id;
        
        // 檢查圖片 URL
        const imageUrl = place.photos ? 
            (Array.isArray(place.photos) ? place.photos[0].getUrl() : place.photos) : 
            'images/no-image.jpg';
        
        // 計算評分
        const rating = place.rating || 0;
        
        // 檢查是否已收藏
        const isFavorited = window.favoriteSystem && restaurantId && 
            window.favoriteSystem.isStoreFavorited(restaurantId);
        
        // 創建餐廳卡片的 HTML
        const html = `
            <div class="restaurant-card">
                <div class="restaurant-image">
                    <img src="${imageUrl}" alt="${place.name}" onerror="this.src='images/no-image.jpg'">
                </div>
                <div class="restaurant-info">
                    <div class="restaurant-header">
                        <h3>${place.name}</h3>
                        <button class="favorite-btn ${isFavorited ? 'active' : ''}" 
                                data-place-id="${restaurantId || ''}" 
                                data-name="${place.name}">
                            <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="restaurant-rating">
                        <span class="stars">${this.generateRatingStars(rating)}</span>
                        <span class="rating-value">${rating.toFixed(1)}</span>
                        <span class="review-count">(${place.user_ratings_total || 0})</span>
                    </div>
                    <div class="restaurant-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${place.vicinity || place.formatted_address}</span>
                    </div>
                </div>
            </div>
        `;

        const card = document.createElement('div');
        card.className = 'restaurant-card-wrapper';
        card.innerHTML = html;

        // 綁定收藏按鈕點擊事件
        const favoriteBtn = card.querySelector('.favorite-btn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const placeId = favoriteBtn.getAttribute('data-place-id');
                const name = favoriteBtn.getAttribute('data-name');

                if (!placeId) {
                    console.error('找不到餐廳ID');
                    return;
                }

                // 檢查收藏系統是否已初始化
                if (!window.favoriteSystem) {
                    console.error('收藏系統未初始化');
                    showToast('收藏系統初始化失敗，請重新整理頁面');
                    return;
                }

                // 檢查是否已收藏
                const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
                
                try {
                    if (isFavorited) {
                        // 如果已收藏，則移除收藏
                        await window.favoriteSystem.removeStore(placeId);
                        favoriteBtn.querySelector('i').classList.replace('fas', 'far');
                        favoriteBtn.classList.remove('active');
                        showToast('已取消收藏');
                    } else {
                        // 如果未收藏，則添加收藏
                        // 嘗試獲取圖片
                        let photos = null;
                        const imgElement = card.querySelector('.restaurant-image img');
                        if (imgElement && imgElement.src) {
                            photos = imgElement.src;
                            console.log(`找到餐廳圖片: ${photos}`);
                        }

                        // 儲存完整的餐廳資訊
                        const storeData = {
                            id: placeId,
                            place_id: placeId,
                            name: name,
                            photos: photos,
                            address: place.vicinity || place.formatted_address,
                            rating: place.rating || 0,
                            user_ratings_total: place.user_ratings_total || 0,
                            favoriteTime: new Date().toISOString()
                        };
                        await window.favoriteSystem.addStore(storeData);
                        favoriteBtn.querySelector('i').classList.replace('far', 'fas');
                        favoriteBtn.classList.add('active');
                        showToast('已加入收藏');
                    }
                } catch (error) {
                    console.error('收藏操作失敗:', error);
                    showToast('收藏操作失敗，請稍後再試');
                }
            });
        }

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
    }

    // 更新結果標題
    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    isRestaurantOpen(openTime, closeTime) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const [openHour, openMinute] = openTime.split(":").map(Number);
        const [closeHour, closeMinute] = closeTime.split(":").map(Number);
        const openMinutes = openHour * 60 + openMinute;
        const closeMinutes = closeHour * 60 + closeMinute;
        if (openMinutes < closeMinutes) {
            return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
        } else {
            return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
        }
    }
}

export default RestaurantCard; 