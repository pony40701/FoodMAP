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
        // 初始化收藏系統
        if (window.favoriteSystem) {
            await window.favoriteSystem.initialize();
        }
        
        // 初始化收藏按鈕
        if (window.favoriteButton) {
            await window.favoriteButton.initialize();
        }
        
        // 初始化地圖
        window.mapInit = await new MapInit().init();
    } catch (error) {
        console.error('初始化失敗:', error);
        showToast('初始化失敗，請重新整理頁面');
    }
});

// ===========================================
// 餐廳列表顯示
// ===========================================
function createRestaurantCard(restaurant) {
    // 添加調試信息
    console.log('創建餐廳卡片:', {
        restaurant: restaurant,
        id: restaurant.id || restaurant.place_id,
        place_id: restaurant.place_id,
        name: restaurant.name
    });

    const card = document.createElement('div');
    card.className = 'restaurant-card v3';
    
    // 確保有餐廳ID (優先使用 place_id)
    const restaurantId = restaurant.place_id || restaurant.id;
    
    if (!restaurantId) {
        console.error('找不到餐廳ID，無法創建收藏按鈕:', restaurant);
    }
    
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
    
    // 檢查是否已收藏
    const isFavorited = window.favoriteSystem && restaurantId && 
        window.favoriteSystem.isStoreFavorited(restaurantId);
    
    console.log(`餐廳 ${restaurant.name} (ID: ${restaurantId}) 收藏狀態:`, isFavorited);
    
    card.innerHTML = `
        <div class="restaurant-image-wrapper v3">
            <img src="${restaurant.photos}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
        </div>
        <div class="restaurant-info v3">
            <div class="restaurant-title-row v3">
                <h3 class="restaurant-name v3">${restaurant.name}</h3>
                <button class="favorite-btn" title="加入收藏" data-place-id="${restaurantId || ''}" data-name="${(restaurant.name || '').replace(/"/g, '&quot;')}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
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
    
    console.log(`顯示 ${restaurants.length} 間餐廳`);
    
    // 為每個餐廳創建卡片
    restaurants.forEach(restaurant => {
        // 如果沒有 ID，但有名稱，生成一個臨時 ID
        if (!restaurant.place_id && !restaurant.id && restaurant.name) {
            restaurant.id = 'temp-id-' + Date.now();
            console.log('生成臨時 ID:', restaurant.id);
        }
        
        const card = createRestaurantCard(restaurant);
        
        // 添加點擊事件
        card.addEventListener('click', (e) => {
            // 如果點擊的是收藏按鈕，不觸發餐廳詳情
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                return;
            }
            
            // 使用 mapInit 中的方法顯示餐廳詳情
            if (window.mapInit && typeof window.mapInit.showRestaurantDetail === 'function') {
                window.mapInit.showRestaurantDetail(restaurant);
            } else {
                console.error('找不到 showRestaurantDetail 函數');
                showToast('無法顯示餐廳詳情，請重新整理頁面');
            }
        });
        
        container.appendChild(card);
    });
    
    // 綁定收藏按鈕點擊事件
    container.querySelectorAll('.favorite-btn').forEach(button => {
        // 檢查按鈕是否已經有事件處理程序
        if (button.getAttribute('data-event-bound') === 'true') {
            return; // 如果已經綁定過事件，則跳過
        }
        
        button.setAttribute('data-event-bound', 'true');
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const placeId = this.getAttribute('data-place-id');
            const name = this.getAttribute('data-name');
            
            if (!placeId) {
                console.error('找不到餐廳ID');
                showToast('無法識別餐廳，請重新整理頁面');
                return;
            }
            
            console.log(`點擊收藏按鈕 (ID: ${placeId}, 名稱: ${name})`);
            
            // 使用 favoriteButton 模組處理收藏功能
            if (window.favoriteButton && window.favoriteButton.initialized) {
                await window.favoriteButton.toggleStoreFavorite(placeId, this);
                return;
            }
            
            // 舊的收藏處理邏輯，作為備用
            // 檢查是否登入
            if (!localStorage.getItem('isLoggedIn')) {
                showToast('請先登入會員');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                return;
            }
            
            // 檢查收藏系統是否已初始化
            if (!window.favoriteSystem || !window.favoriteSystem.initialized) {
                console.error('收藏系統未初始化');
                showToast('收藏系統初始化失敗，請重新整理頁面');
                return;
            }
            
            // 檢查是否已收藏
            const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
            
            try {
                if (isFavorited) {
                    // 如果已收藏，則移除收藏
                    const success = await window.favoriteSystem.removeStore(placeId);
                    if (success) {
                        this.querySelector('i').classList.replace('fas', 'far');
                        this.classList.remove('active');
                        showToast('已取消收藏');
                        console.log(`已取消收藏餐廳 (ID: ${placeId})`);
                    } else {
                        showToast('取消收藏失敗，請稍後再試');
                    }
                } else {
                    // 如果未收藏，則添加收藏
                    
                    // 嘗試獲取圖片資訊
                    let photos = null;
                    const restCard = this.closest('.restaurant-card') || this.closest('.store-card');
                    if (restCard) {
                        const imgElement = restCard.querySelector('img');
                        if (imgElement && imgElement.src) {
                            photos = imgElement.src;
                            console.log(`找到商家圖片: ${photos}`);
                        }
                    }
                    
                    // 嘗試從彈窗中獲取圖片
                    if (!photos && window.currentSelectedRestaurant && window.currentSelectedRestaurant.photos) {
                        photos = window.currentSelectedRestaurant.photos;
                        console.log(`從詳情彈窗獲取圖片: ${photos}`);
                    }
                    
                    const storeData = {
                        id: placeId,
                        place_id: placeId,
                        name: name,
                        photos: photos,
                        favoriteTime: new Date().toISOString()
                    };
                    const success = await window.favoriteSystem.addStore(storeData);
                    if (success) {
                        this.querySelector('i').classList.replace('far', 'fas');
                        this.classList.add('active');
                        showToast('已加入收藏');
                        console.log(`已收藏餐廳 (ID: ${placeId})`);
                    } else {
                        showToast('加入收藏失敗，請稍後再試');
                    }
                }
                
                // 更新所有相同ID的按鈕
                if (window.favoriteButton) {
                    window.favoriteButton.updateAllButtonsWithSameId(placeId);
                }
            } catch (error) {
                console.error('收藏操作失敗:', error);
                showToast('收藏操作失敗，請稍後再試');
            }
        });
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

// ===========================================
// Toast 提示
// ===========================================
function showToast(message) {
    // 如果已經定義了全局 showToast 函數，則使用它
    if (window.showToast && window.showToast !== showToast) {
        window.showToast(message);
        return;
    }
    
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

// 導出 Toast 函數，只有在全局未定義時才導出
if (!window.showToast) {
    window.showToast = showToast;
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
        // 設置今天是星期五，用於測試
        if (window.businessHours) {
            window.businessHours.forceDay(5); // 5 = 星期五
            console.log('已設置今天是星期五，用於測試');
        }
        
        // 初始化輪播
        initCarousel();
        
        // 初始化收藏系統
        if (!window.favoriteSystem) {
            console.log('初始化收藏系統');
            await window.favoriteSystem.initialize();
        }
        
        // 初始化收藏按鈕
        if (window.favoriteButton) {
            await window.favoriteButton.initialize();
        }
    } catch (error) {
        console.error('初始化頁面時發生錯誤:', error);
        showToast('初始化失敗，請重新整理頁面');
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
        if (window.favoriteSystem) {
            window.favoriteSystem.clearAllFavorites();
        }
    }
});

// 點擊彈窗外部關閉
window.onclick = function(event) {
    const weeklyModal = document.getElementById('weeklyHoursModal');
    const restaurantModal = document.getElementById('restaurantModal');
    const restaurantModalNew = document.getElementById('restaurantModalNew');
    const weeklyHoursModalNew = document.getElementById('weeklyHoursModalNew');
    
    if (event.target === weeklyModal) {
        if (weeklyModal.classList.contains('active')) {
            weeklyModal.classList.remove('active');
        }
    } else if (event.target === restaurantModal) {
        if (restaurantModal.classList.contains('active')) {
            restaurantModal.classList.remove('active');
        }
    } else if (event.target === restaurantModalNew) {
        if (window.RestaurantModal && restaurantModalNew.classList.contains('active')) {
            window.RestaurantModal.closeModal();
        }
    } else if (event.target === weeklyHoursModalNew) {
        if (window.RestaurantModal && weeklyHoursModalNew.classList.contains('active')) {
            window.RestaurantModal.closeWeeklyHoursModal();
        }
    }
};

// 監聽 ESC 鍵關閉彈窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const weeklyModal = document.getElementById('weeklyHoursModal');
        const restaurantModal = document.getElementById('restaurantModal');
        const restaurantModalNew = document.getElementById('restaurantModalNew');
        const weeklyHoursModalNew = document.getElementById('weeklyHoursModalNew');
        
        if (weeklyModal && weeklyModal.classList.contains('active')) {
            weeklyModal.classList.remove('active');
        }
        
        if (restaurantModal && restaurantModal.classList.contains('active')) {
            restaurantModal.classList.remove('active');
        }
        
        if (window.RestaurantModal) {
            if (weeklyHoursModalNew && weeklyHoursModalNew.classList.contains('active')) {
                window.RestaurantModal.closeWeeklyHoursModal();
            } else if (restaurantModalNew && restaurantModalNew.classList.contains('active')) {
                window.RestaurantModal.closeModal();
            }
        }
    }
});

// 初始化登入彈窗
function initLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('#loginModal .close');
    const loginForm = document.getElementById('loginForm');
    
    if (!loginModal || !closeBtn || !loginForm) {
        console.error('找不到登入彈窗相關元素');
        return;
    }
    
    // 關閉按鈕點擊事件
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    
    // 點擊模態框外部時關閉
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    console.log('登入彈窗初始化完成');
}

// 檢查 URL 參數，處理從其他頁面跳轉過來的餐廳詳情請求
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const showRestaurantId = urlParams.get('showRestaurant');
    
    if (showRestaurantId) {
        console.log('檢測到 showRestaurant 參數:', showRestaurantId);
        
        // 嘗試從 sessionStorage 獲取餐廳數據
        try {
            const restaurantData = JSON.parse(sessionStorage.getItem('selectedRestaurant'));
            console.log('從 sessionStorage 獲取的餐廳數據:', restaurantData);
            
            if (restaurantData && (restaurantData.place_id === showRestaurantId || restaurantData.id === showRestaurantId)) {
                // 等待地圖初始化完成
                setTimeout(() => {
                    if (window.mapInit) {
                        console.log('使用 mapInit 顯示餐廳詳情');
                        window.mapInit.showRestaurantDetail(restaurantData);
                    } else {
                        console.log('嘗試初始化 MapInit');
                        // 嘗試初始化 mapInit
                        const mapInitInstance = new MapInit();
                        mapInitInstance.init().then(() => {
                            window.mapInit = mapInitInstance;
                            window.mapInit.showRestaurantDetail(restaurantData);
                        }).catch(error => {
                            console.error('初始化 MapInit 失敗:', error);
                        });
                    }
                }, 1000); // 給地圖加載一些時間
                
                // 清除 sessionStorage 中的數據
                sessionStorage.removeItem('selectedRestaurant');
            } else {
                console.warn('sessionStorage 中的餐廳 ID 與 URL 參數不匹配');
            }
        } catch (error) {
            console.error('解析 sessionStorage 餐廳數據時出錯:', error);
        }
    }
}

// 頁面加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 檢查 URL 參數
    checkUrlParameters();
    
    // 其他初始化代碼...
});
