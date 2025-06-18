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
        showToast('初始化失敗，請重新整理頁面');
    }
});

// ===========================================
// 餐廳列表顯示
// ===========================================
async function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.className = 'restaurant-card v3';
    
    // 確保有餐廳ID (優先使用 place_id)
    const restaurantId = restaurant.place_id || restaurant.id;
    
    if (!restaurantId) {
        return card;
    }
    
    // 從 json_raw 解析數據
    if (restaurant.json_raw) {
        try {
            const jsonData = JSON.parse(restaurant.json_raw);
            
            // 從 JSON 數據中提取評分、評論數
            if (jsonData.rating) {
                restaurant.rating = jsonData.rating;
                restaurant.averageRating = jsonData.rating;
            }
            if (jsonData.user_ratings_total) {
                restaurant.user_ratings_total = jsonData.user_ratings_total;
                restaurant.reviewCount = jsonData.user_ratings_total;
            }
            
            // 提取營業時間
            if (jsonData.opening_hours) {
                restaurant.opening_hours = jsonData.opening_hours;
            }
        } catch (error) {
        }
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
    let isFavorited = false;
    if (window.favoriteSystem && restaurantId) {
        try {
            // 確保已初始化
            if (!window.favoriteSystem.initialized) {
                await window.favoriteSystem.initialize();
            }
            isFavorited = await window.favoriteSystem.isStoreFavorited(restaurantId);
        } catch (error) {
        }
    }
    
    // 設置圖片URL，優先使用資料庫中的圖片
    const imageUrl = `http://localhost:8080/api/restaurant-images/${restaurantId}/raw`;
    
    // 確保評分和評論數有默認值，但優先使用從 json_raw 解析出的數據
    const rating = restaurant.rating || restaurant.averageRating || 0;
    const reviewCount = restaurant.user_ratings_total || restaurant.reviewCount || 0;
    
    card.innerHTML = `
        <div class="restaurant-image-wrapper v3">
            <img src="${imageUrl}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
            <button class="favorite-btn v3" title="加入收藏" data-place-id="${restaurantId || ''}" data-name="${(restaurant.name || '').replace(/"/g, '&quot;')}">
                <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
            </button>
        </div>
        <div class="restaurant-info v3">
            <div class="restaurant-title-row v3">
                <h3 class="restaurant-name v3">${restaurant.name}</h3>
            </div>
            <div class="restaurant-rating-row v3">
                <span class="rating-stars v3">${generateStars(rating)}</span>
                <span class="rating-score v3">${rating ? rating.toFixed(1) : 'N/A'}</span>
                <span class="rating-count v3">(${reviewCount}則評論)</span>
            </div>
            <div class="restaurant-address-row v3">
                <i class="fas fa-map-marker-alt"></i>
                <span class="address-text v3">${restaurant.address}</span>
            </div>
            <div class="restaurant-status-row v3">
                <span class="status-dot v3 ${isOpen ? 'open' : 'closed'}"></span>
                <span class="status-text v3 ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
                ${todayHours}
            </div>
        </div>`;
    
    return card;
}

window.displayRestaurants = async function(restaurants, isFirstPage = true) {
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
        // 重置已顯示的餐廳集合
        window.displayedRestaurants = new Set();
    }

    // 確保 window.displayedRestaurants 存在
    if (!window.displayedRestaurants) {
        window.displayedRestaurants = new Set();
    }
    
    // 使用 Set 來追蹤已顯示的餐廳
    const uniqueRestaurants = [];
    for (const restaurant of restaurants) {
        const restaurantId = restaurant.place_id || restaurant.id;
        if (!restaurantId) continue;
        
        // 檢查是否已經顯示過這家餐廳
        if (window.displayedRestaurants.has(restaurantId)) {
            continue;
        }
        
        // 將餐廳加入追蹤集合
        window.displayedRestaurants.add(restaurantId);
        uniqueRestaurants.push(restaurant);
    }
    
    // 檢查收藏狀態並排序
    const restaurantsWithFavoriteStatus = await Promise.all(
        uniqueRestaurants.map(async restaurant => {
            const restaurantId = restaurant.place_id || restaurant.id;
            let isFavorited = false;
            
            if (window.favoriteSystem && restaurantId) {
                try {
                    if (!window.favoriteSystem.initialized) {
                        await window.favoriteSystem.initialize();
                    }
                    isFavorited = await window.favoriteSystem.isStoreFavorited(restaurantId);
                } catch (error) {
                }
            }
            
            return { ...restaurant, isFavorited };
        })
    );
    
    // 根據收藏狀態排序
    restaurantsWithFavoriteStatus.sort((a, b) => {
        if (a.isFavorited && !b.isFavorited) return -1;
        if (!a.isFavorited && b.isFavorited) return 1;
        return 0;
    });
    
    // 為每個餐廳創建卡片
    for (const restaurant of restaurantsWithFavoriteStatus) {
        const card = await createRestaurantCard(restaurant);
        
        // 添加點擊事件
        card.addEventListener('click', (e) => {
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                return;
            }
            
            if (window.mapInit && typeof window.mapInit.showRestaurantDetail === 'function') {
                window.mapInit.showRestaurantDetail(restaurant);
            } else {
                showToast('無法顯示餐廳詳情，請重新整理頁面');
            }
        });
        
        container.appendChild(card);
    }
    
    // 綁定收藏按鈕點擊事件
    container.querySelectorAll('.favorite-btn').forEach(button => {
        if (button.getAttribute('data-event-bound') === 'true') {
            return;
        }
        
        button.setAttribute('data-event-bound', 'true');
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const placeId = this.getAttribute('data-place-id');
            const name = this.getAttribute('data-name');
            
            if (!placeId) {
                showToast('無法識別餐廳，請重新整理頁面');
                return;
            }
            
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
                showToast('收藏系統初始化失敗，請重新整理頁面');
                return;
            }
            
            // 檢查是否已收藏
            try {
                const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
                
                if (isFavorited) {
                    // 如果已收藏，則移除收藏
                    const success = await window.favoriteSystem.removeStore(placeId);
                    if (success) {
                        this.querySelector('i').classList.replace('fas', 'far');
                        this.classList.remove('active');
                        showToast('已取消收藏');
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
                        }
                    }
                    
                    // 嘗試從彈窗中獲取圖片
                    if (!photos && window.currentSelectedRestaurant && window.currentSelectedRestaurant.photos) {
                        photos = window.currentSelectedRestaurant.photos;
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
                    } else {
                        showToast('加入收藏失敗，請稍後再試');
                    }
                }
                
                // 更新所有相同ID的按鈕
                if (window.favoriteButton) {
                    window.favoriteButton.updateAllButtonsWithSameId(placeId);
                }
            } catch (error) {
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
        }
        
        // 初始化輪播
        initCarousel();
        
        // 初始化收藏系統
        if (!window.favoriteSystem) {
            await window.favoriteSystem.initialize();
        }
        
        // 初始化收藏按鈕
        if (window.favoriteButton) {
            await window.favoriteButton.initialize();
        }
    } catch (error) {
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
}

// 檢查 URL 參數，處理從其他頁面跳轉過來的餐廳詳情請求
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const showRestaurantId = urlParams.get('showRestaurant');
    
    if (showRestaurantId) {
        // 嘗試從 sessionStorage 獲取餐廳數據
        try {
            const restaurantData = JSON.parse(sessionStorage.getItem('selectedRestaurant'));
            
            if (restaurantData && (restaurantData.place_id === showRestaurantId || restaurantData.id === showRestaurantId)) {
                // 等待地圖初始化完成
                setTimeout(() => {
                    if (window.mapInit) {
                        window.mapInit.showRestaurantDetail(restaurantData);
                    } else {
                        // 嘗試初始化 mapInit
                        const mapInitInstance = new MapInit();
                        mapInitInstance.init().then(() => {
                            window.mapInit = mapInitInstance;
                            window.mapInit.showRestaurantDetail(restaurantData);
                        }).catch(error => {
                        });
                    }
                }, 1000); // 給地圖加載一些時間
                
                // 清除 sessionStorage 中的數據
                sessionStorage.removeItem('selectedRestaurant');
            } else {
            }
        } catch (error) {
        }
    }
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化輪播圖
    initCarousel();
    
    // 初始化登入模態框
    initLoginModal();
    
    // 載入所有餐廳資料
    loadAllRestaurants();
});

// 載入所有餐廳資料
async function loadAllRestaurants() {
    try {
        // 顯示載入中提示
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) {
            resultsTitle.textContent = '載入餐廳資料中...';
            resultsTitle.style.display = 'block';
        }
        
        // 獲取餐廳容器
        let container = document.getElementById('restaurants-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'restaurants-container';
            container.className = 'restaurants-grid';
            
            if (resultsTitle) {
                resultsTitle.after(container);
            } else {
                const foodTypesSection = document.querySelector('.food-types-section');
                if (foodTypesSection) {
                    foodTypesSection.after(container);
                } else {
                    document.body.appendChild(container);
                }
            }
        }
        
        container.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><p>正在從資料庫載入餐廳資料...</p></div>';

        // 從 API 獲取資料
        const apiUrl = 'http://localhost:8080/api/google-restaurants/all';
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();
        
        // 檢查原始資料中的重複項
        const idCounts = new Map();
        const duplicates = new Map();
        
        rawData.forEach(item => {
            const id = item.place_id || item.id;
            if (!id) return;
            
            idCounts.set(id, (idCounts.get(id) || 0) + 1);
            if (idCounts.get(id) === 2) {
                duplicates.set(id, []);
            }
            if (idCounts.get(id) >= 2) {
                duplicates.get(id).push(item);
            }
        });

        // 使用 Map 進行徹底去重
        const restaurantMap = new Map();
        
        // 第一次遍歷：收集所有資料
        for (const item of rawData) {
            const id = item.place_id || item.id;
            if (!id) {
                continue;
            }

            if (restaurantMap.has(id)) {
                const existing = restaurantMap.get(id);
                const merged = mergeRestaurantData(existing, item);
                restaurantMap.set(id, merged);
            } else {
                restaurantMap.set(id, item);
            }
        }

        // 處理 json_raw 並標準化資料
        const processedRestaurants = [];
        for (const [id, restaurant] of restaurantMap) {
            try {
                const processed = await processRestaurantData(restaurant);
                if (processed) {
                    processedRestaurants.push(processed);
                }
            } catch (error) {
                // 處理餐廳資料失敗
            }
        }

        // 更新結果標題
        if (resultsTitle) {
            resultsTitle.textContent = `所有餐廳 (${processedRestaurants.length} 間)`;
        }

        // 顯示餐廳列表
        if (window.displayRestaurants) {
            await window.displayRestaurants(processedRestaurants, true);
        } else {
            container.innerHTML = '<div class="no-results">顯示餐廳失敗，請重新整理頁面</div>';
        }

    } catch (error) {
        const container = document.getElementById('restaurants-container');
        if (container) {
            container.innerHTML = '<div class="no-results">載入餐廳資料失敗，請稍後再試</div>';
        }
    }
}

// 合併餐廳資料，保留更完整的資訊
function mergeRestaurantData(existing, newData) {
    // 如果其中一個為空，返回另一個
    if (!existing) return newData;
    if (!newData) return existing;

    // 合併基本資料
    const merged = { ...existing };

    // 遍歷新資料的所有欄位
    for (const [key, value] of Object.entries(newData)) {
        // 如果現有資料沒有這個欄位，或新資料的欄位值更完整
        if (!merged[key] || 
            (value && typeof value === 'object' && Object.keys(value).length > Object.keys(merged[key] || {}).length) ||
            (value && typeof value === 'string' && value.length > (merged[key] || '').length)) {
            merged[key] = value;
        }
    }

    return merged;
}

// 處理單個餐廳資料
async function processRestaurantData(restaurant) {
    try {
        let processedData = { ...restaurant };

        // 處理 json_raw
        if (restaurant.json_raw) {
            let jsonData;
            try {
                if (typeof restaurant.json_raw === 'string') {
                    jsonData = JSON.parse(restaurant.json_raw);
                } else {
                    jsonData = restaurant.json_raw;
                }

                // 合併 json_raw 中的資料
                processedData = { ...processedData, ...jsonData };
            } catch (error) {
            }
        }

        // 確保必要欄位存在
        processedData.id = processedData.place_id || processedData.id;
        processedData.name = processedData.name || '未命名餐廳';
        processedData.rating = processedData.rating || 0;
        processedData.user_ratings_total = processedData.user_ratings_total || 0;
        processedData.address = processedData.formatted_address || processedData.vicinity || processedData.address || '地址未提供';

        // 標準化營業時間資料
        if (processedData.opening_hours) {
            if (typeof processedData.opening_hours === 'string') {
                try {
                    processedData.opening_hours = JSON.parse(processedData.opening_hours);
                } catch (error) {
                }
            }
        }

        return processedData;
    } catch (error) {
        return null;
    }
}
