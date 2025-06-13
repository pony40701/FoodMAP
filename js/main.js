// ===========================================
// 輪播功能
// ===========================================
let currentSlide = 0;

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    currentSlide = (n + slides.length) % slides.length;
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    setInterval(() => showSlide(currentSlide + 1), 5000);
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    showSlide(0);
}

// ===========================================
// 地圖初始化
// ===========================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        window.mapInit = await new MapInit().init();
    } catch (error) {
        console.error('初始化地圖失敗:', error);
    }
});

// ===========================================
// 餐廳列表顯示
// ===========================================
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card v3';
    
    // 檢查是否已登入
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isFav = isLoggedIn && window.isFavorite && window.isFavorite(restaurant.id);
    
    // 營業時間判斷
    let isOpen = false;
    let todayHours = '';
    
    if (restaurant.opening_hours) {
        if (restaurant.opening_hours.weekday_text) {
            // 獲取今日營業時間文字
            const today = new Date().getDay();
            const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引
            
            if (restaurant.opening_hours.weekday_text[index]) {
                const todayText = restaurant.opening_hours.weekday_text[index];
                // 直接從完整的營業時間文字中提取時間部分
                const timeMatch = todayText.match(/:\s*(.+)$/);
                const timeStr = timeMatch ? timeMatch[1].trim() : null;
                
                if (timeStr) {
                    isOpen = window.businessHours.isOpenFromText(timeStr);
                    const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][today];
                    todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${dayName} ${timeStr}</span>`;
                    
                    // 調試信息
                    console.log('營業時間判斷:', {
                        restaurantName: restaurant.name,
                        todayFullText: todayText,
                        extractedTime: timeStr,
                        isOpen: isOpen,
                        currentTime: new Date().toLocaleTimeString()
                    });
                }
            }
        } else if (restaurant.opening_hours.periods) {
            // 如果有 periods 資料，使用它來判斷
            const now = new Date();
            const day = now.getDay();
            const period = restaurant.opening_hours.periods.find(p => p.open.day === day);
            if (period) {
                const openTime = `${period.open.hours}:${period.open.minutes || '00'}`;
                const closeTime = `${period.close.hours}:${period.close.minutes || '00'}`;
                isOpen = window.businessHours.isOpenNow(openTime, closeTime);
                todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${openTime}-${closeTime}</span>`;
            }
        } else if (restaurant.opening_hours.open_now !== undefined) {
            // 如果只有 open_now 屬性
            isOpen = restaurant.opening_hours.open_now;
        }
    }
    
    card.innerHTML = `
        <div class="restaurant-image-wrapper v3">
            <img src="${restaurant.photos}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
        </div>
        <div class="restaurant-info v3">
            <div class="restaurant-title-row v3">
                <h3 class="restaurant-name v3">${restaurant.name}</h3>
                <button class="favorite-btn v3 ${isFav ? 'active' : ''}" aria-label="加入收藏" data-id="${restaurant.id}">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="restaurant-rating-row v3">
                <span class="rating-stars v3">${generateStars(restaurant.rating)}</span>
                <span class="rating-score v3">${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
                <span class="rating-count v3">(${restaurant.user_ratings_total || 0}則評論)</span>
            </div>
            <div class="restaurant-address-row v3">
                <i class="fas fa-map-marker-alt"></i>
                <span class="address-text v3">${restaurant.address}</span>
            </div>
            ${restaurant.types ? `
                <div class="restaurant-tags-row v3">
                    ${restaurant.types.slice(0, 3).map(type => `<span class="tag v3">${type}</span>`).join('')}
                </div>
            ` : ''}
            <div class="restaurant-status-row v3">
                <span class="status-dot v3 ${isOpen ? 'open' : 'closed'}"></span>
                <span class="status-text v3 ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
                ${todayHours}
            </div>
        </div>
    `;
    
    return card;
}

window.displayRestaurants = function(restaurants, isFirstPage = true) {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    
    if (!restaurants || restaurants.length === 0) {
        if (isFirstPage) {
            container.innerHTML = '<div class="no-results">找不到相關餐廳</div>';
        }
        return;
    }

    // 如果是第一頁，清空容器
    if (isFirstPage) {
        container.innerHTML = '';
    }
    
    // 為每個餐廳創建卡片
    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        
        // 收藏按鈕事件
        const favBtn = card.querySelector('.favorite-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // 檢查是否已登入
                if (localStorage.getItem('isLoggedIn') !== 'true') {
                    alert('請先登入會員');
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'block';
                    return;
                }
                
                // 切換收藏狀態
                const isFavorite = window.toggleFavorite(restaurant.id, restaurant.name, restaurant);
                
                // 更新按鈕外觀
                favBtn.classList.toggle('active', isFavorite);
                favBtn.querySelector('i').className = isFavorite ? 'fas fa-heart' : 'far fa-heart';
            });
        }

        // 添加點擊事件
        card.addEventListener('click', () => {
            window.mapInit.showRestaurantDetail(restaurant);
        });

        container.appendChild(card);
    });
    
    // 如果正在載入下一頁，顯示載入提示
    if (!isFirstPage && restaurants.length === 20) {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading-more';
        loadingElement.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span>載入更多餐廳...</span>
            </div>
        `;
        container.appendChild(loadingElement);
    }
};

// 生成星級評分
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return '★'.repeat(fullStars) + 
           (halfStar ? '★' : '') + 
           '☆'.repeat(emptyStars);
}

// 顯示餐廳詳情
function showRestaurantDetail(restaurant) {
    const modal = document.getElementById('restaurantModal');
    if (!modal) return;

    const content = modal.querySelector('.restaurant-modal-content');
    
    // 檢查是否已登入
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const isFav = isLoggedIn && window.isFavorite(restaurant.id);
    
    content.innerHTML = `
        <div class="restaurant-modal-header">
            <h2>${restaurant.name}</h2>
            <span class="restaurant-modal-close" onclick="closeRestaurantModal()">&times;</span>
        </div>
        <div class="restaurant-modal-body">
            <div class="restaurant-details">
                <div class="restaurant-main-info">
                    <div class="restaurant-modal-image">
                        <img src="${restaurant.photos}" alt="${restaurant.name}">
                    </div>
                    <div class="restaurant-info-text">
                        <div class="modal-rating">
                            <span class="modal-stars">${generateStars(restaurant.rating)}</span>
                            <span class="modal-rating-value">${restaurant.rating}</span>
                            <span class="modal-rating-count">(${restaurant.user_ratings_total} 則評論)</span>
                        </div>
                        <div class="modal-address">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${restaurant.address}</span>
                        </div>
                        <div class="modal-hours">
                            <div class="modal-status ${restaurant.opening_hours && restaurant.opening_hours.isOpen ? 'open' : 'closed'}">
                                <i class="fas fa-clock"></i>
                                <span>${restaurant.opening_hours && restaurant.opening_hours.isOpen ? '營業中' : '休息中'}</span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-favorite-btn ${isFav ? 'active' : ''}" onclick="handleModalFavoriteClick('${restaurant.id}', '${restaurant.name.replace(/'/g, "\\'")}')">
                                <i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? '已收藏' : '收藏'}
                            </button>
                            <button class="modal-direction-btn" onclick="openGoogleMaps('${restaurant.address}')">
                                <i class="fas fa-directions"></i> 導航
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    // 新增：監聽 ESC 鍵關閉彈窗
    function escCloseHandler(e) {
        if (e.key === 'Escape') {
            closeRestaurantModal();
        }
    }
    document.addEventListener('keydown', escCloseHandler);

    // 關閉時移除監聽，避免重複
    modal.querySelector('.restaurant-modal-close').onclick = function() {
        closeRestaurantModal();
        document.removeEventListener('keydown', escCloseHandler);
    };

    // 點擊彈窗外部也關閉
    modal.onclick = function(e) {
        if (e.target === modal) {
            closeRestaurantModal();
            document.removeEventListener('keydown', escCloseHandler);
        }
    };
}

// 顯示登入彈窗，確保它在最上層
window.showLoginModal = function() {
    // 顯示提示訊息
    alert('請先登入會員');
    
    // 強制關閉餐廳詳情彈窗（如果存在）
    const restaurantModal = document.getElementById('restaurantModal');
    if (restaurantModal) {
        restaurantModal.style.display = 'none';
    }
    
    // 顯示登入彈窗
    let loginModal;
    if (window.parent && window.parent.document.getElementById('loginModal')) {
        loginModal = window.parent.document.getElementById('loginModal');
    } else if (document.getElementById('loginModal')) {
        loginModal = document.getElementById('loginModal');
    }
    
    if (loginModal) {
        // 確保登入彈窗在最上層
        loginModal.style.zIndex = '3000';
        loginModal.style.display = 'block';
        
        // 將登入彈窗移到最前面
        document.body.appendChild(loginModal);
    }
};

// 處理彈窗中的收藏按鈕點擊
window.handleModalFavoriteClick = function(id, name) {
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        // 使用新的登入彈窗函數
        window.showLoginModal();
        return;
    }
    
    // 獲取當前選中的餐廳
    const restaurant = window.currentSelectedRestaurant;
    
    // 切換收藏狀態
    const isFavorite = window.toggleFavorite(id, name, restaurant);
    
    // 更新按鈕外觀
    const btn = document.querySelector('.modal-favorite-btn');
    if (btn) {
        btn.classList.toggle('active', isFavorite);
        btn.innerHTML = `<i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i> ${isFavorite ? '已收藏' : '收藏'}`;
    }
};

// 關閉餐廳詳情
function closeRestaurantModal() {
    const modal = document.getElementById('restaurantModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===========================================
// 收藏功能
// ===========================================
window.toggleFavorite = function(id, name, restaurant) {
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.showLoginModal();
        return false;
    }
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === id);
    
    if (index === -1) {
        // 添加到收藏
        // 如果有完整的餐廳資訊，則保存更多資料
        if (restaurant) {
            const restaurantData = {
                id: id,
                name: name,
                address: restaurant.address || '',
                rating: restaurant.rating || 0,
                user_ratings_total: restaurant.user_ratings_total || 0,
                types: restaurant.types || [],
                opening_hours: restaurant.opening_hours || null
            };
            favorites.push(restaurantData);
        } else {
            // 如果沒有完整資訊，只保存基本資料
            favorites.push({ id, name });
        }
        showToast('已加入收藏');
    } else {
        // 從收藏中移除
        favorites.splice(index, 1);
        showToast('已移除收藏');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // 重新排序並顯示餐廳列表
    if (window.currentRestaurants && window.infiniteScroll) {
        window.infiniteScroll.setRestaurants([...window.currentRestaurants]);
    }
    
    return favorites.some(fav => fav.id === id);
};

window.isFavorite = function(id) {
    if (!id) return false;
    
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        return false;
    }
    
    // 從 localStorage 獲取收藏列表
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // 檢查指定 id 的餐廳是否在收藏列表中
    return favorites.some(fav => fav.id === id);
};

// ===========================================
// Toast 提示
// ===========================================
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    toast.offsetHeight;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 開啟 Google Maps 導航
function openGoogleMaps(address) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
}

// ===========================================
// 頁面初始化
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initCarousel();
        // 不自動呼叫 initLoginModal();  // 只有點擊登入按鈕時才初始化登入彈窗
    } catch (error) {
        console.error('初始化頁面時發生錯誤:', error);
    }
    // 延遲初始化登入彈窗，只有點擊登入按鈕時才執行
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (!window._loginModalInited) {
                initLoginModal();
                window._loginModalInited = true;
            }
        }, { once: true });
    }
});

// 頁面載入時檢查登入和收藏狀態
document.addEventListener('DOMContentLoaded', () => {
    // 檢查是否登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        // 如果未登入，清除所有收藏狀態
        if (window.clearFavorites) {
            window.clearFavorites();
        }
    }
});

// ===========================================
// 營業時間相關功能
// ===========================================

// 顯示完整營業時間彈窗
window.showWeeklyHoursModal = function(placeId) {
    const modal = document.getElementById('weeklyHoursModal');
    const modalBody = document.getElementById('weekly-hours-modal-body');
    
    if (!modal || !modalBody) return;
    
    // 清空原有內容
    modalBody.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 載入營業時間中...</div>';
    
    // 顯示彈窗
    modal.style.display = 'block';
    
    // 如果有 placeId，使用 Places API 獲取詳細營業時間
    if (placeId) {
        const request = {
            placeId: placeId,
            fields: ['opening_hours']
        };
        
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        
        placesService.getDetails(request, (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && 
                place && place.opening_hours && place.opening_hours.weekday_text) {
                
                // 獲取成功，顯示營業時間
                displayWeeklyHours(place.opening_hours.weekday_text);
            } else {
                // 獲取失敗，顯示錯誤信息
                modalBody.innerHTML = '<div class="error-message">無法獲取營業時間，請稍後再試</div>';
            }
        });
    } else {
        // 如果沒有 placeId，嘗試從當前選中的餐廳獲取營業時間
        const currentRestaurant = window.currentSelectedRestaurant;
        
        if (currentRestaurant && currentRestaurant.opening_hours && 
            currentRestaurant.opening_hours.weekday_text) {
            displayWeeklyHours(currentRestaurant.opening_hours.weekday_text);
        } else {
            modalBody.innerHTML = '<div class="error-message">無法獲取營業時間，請稍後再試</div>';
        }
    }
};

// 關閉完整營業時間彈窗
window.closeWeeklyHoursModal = function() {
    const modal = document.getElementById('weeklyHoursModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// 顯示一週營業時間
function displayWeeklyHours(weekdayText) {
    const modalBody = document.getElementById('weekly-hours-modal-body');
    if (!modalBody || !weekdayText || !Array.isArray(weekdayText)) return;
    
    // 獲取今天是星期幾
    const today = new Date().getDay();
    // 轉換為 weekday_text 的索引 (0=週一, 1=週二, ..., 6=週日)
    const todayIndex = today === 0 ? 6 : today - 1;
    
    // 創建營業時間表格
    let html = '<div class="weekly-hours-table">';
    
    // 遍歷每一天的營業時間
    weekdayText.forEach((dayText, index) => {
        // 分割日期和時間
        const parts = dayText.split(': ');
        const day = parts[0];
        const hours = parts[1] || '休息';
        
        // 判斷是否為今天
        const isToday = index === todayIndex;
        
        // 添加表格行
        html += `
            <div class="hours-row ${isToday ? 'today' : ''}">
                <div class="day-name">${day}</div>
                <div class="day-hours">${hours}</div>
            </div>
        `;
    });
    
    html += '</div>';
    modalBody.innerHTML = html;
}

// 點擊彈窗外部關閉
window.onclick = function(event) {
    const weeklyModal = document.getElementById('weeklyHoursModal');
    const restaurantModal = document.getElementById('restaurantModal');
    
    if (event.target === weeklyModal) {
        closeWeeklyHoursModal();
    } else if (event.target === restaurantModal) {
        closeRestaurantModal();
    }
};

// 監聽 ESC 鍵關閉彈窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeWeeklyHoursModal();
        closeRestaurantModal();
    }
});
