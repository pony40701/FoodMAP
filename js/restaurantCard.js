// 餐廳卡片模組
class RestaurantCard {
    constructor() {
        this.favoriteStores = JSON.parse(localStorage.getItem('favoriteStores')) || [];
        // 確保 API_BASE_URL 存在，若不存在則使用預設值
        this.baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
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
        // 確保評分和評論數有默認值
        const rating = place.averageRating || place.rating || 0;
        const reviewCount = place.reviewCount || place.user_ratings_total || 0;
        
        // 營業時間處理
        let businessHoursText = '暫無營業時間資料';
        let isOpen = false;
        
        if (place.opening_hours) {
            isOpen = place.opening_hours.open_now || false;
            
            // 如果有 weekday_text，獲取今日營業時間
            if (place.opening_hours.weekday_text && Array.isArray(place.opening_hours.weekday_text)) {
                const today = new Date().getDay(); // 0-6，0代表星期日
                const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引 (0=週一, 1=週二, ..., 6=週日)
                
                if (place.opening_hours.weekday_text[index]) {
                    const todayText = place.opening_hours.weekday_text[index];
                    // 直接從完整的營業時間文字中提取時間部分
                    const timeMatch = todayText.match(/:\s*(.+)$/);
                    businessHoursText = timeMatch ? timeMatch[1].trim() : '暫無營業時間資料';
                }
            } else if (place.businessHours && Array.isArray(place.businessHours)) {
                businessHoursText = place.businessHours[0] || '暫無營業時間資料';
            }
        }
        
        // 創建卡片元素
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        
        // 設置卡片內容
        card.innerHTML = `
            <div class="card-image">
                <img src="${place.photo || 'images/default-restaurant.jpg'}" alt="${place.name}" onerror="this.src='images/default-restaurant.jpg'">
                <div class="card-rating">
                    <span class="rating-stars">${this.generateRatingStars(rating)}</span>
                    <span class="rating-value">${rating.toFixed(1)}</span>
                    <span class="rating-count">(${reviewCount})</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="card-title">${place.name}</h3>
                <p class="card-address">${place.address || place.vicinity || '暫無地址資料'}</p>
                <div class="card-hours">
                    <span class="hours-icon ${isOpen ? 'open' : 'closed'}"></span>
                    <span class="hours-text">${isOpen ? '營業中' : '休息中'}</span>
                    <span class="hours-details">${businessHoursText}</span>
                </div>
                <div class="card-tags">
                    ${place.types ? `<span class="tag">${place.types}</span>` : ''}
                </div>
            </div>
        `;
        
        // 添加點擊事件
        card.addEventListener('click', () => {
            ('點擊餐廳卡片:', place);
            // 如果有 RestaurantModal 模組，使用它顯示詳情
            if (window.RestaurantModal && window.RestaurantModal.showRestaurantDetail) {
                window.RestaurantModal.showRestaurantDetail(place);
            } else {
                // 否則直接跳轉到詳情頁
                window.location.href = `restaurant-detail.html?id=${place.place_id || place.id}`;
            }
        });
        
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