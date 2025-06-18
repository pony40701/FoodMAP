/**
 * 餐廳彈窗功能 - 新版
 * 不依賴 Google Places API，更穩定可靠
 */

// 餐廳彈窗模組
const RestaurantModal = (function() {
    // 私有變量
    let currentRestaurant = null;
    let weeklyHoursData = null;
    let modalMap = null;
    let modalMarker = null;
    
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 緩存DOM元素
    let elements = {};
    
    // 初始化
    function init() {
        // 獲取DOM元素
        elements = {
            modal: document.getElementById('restaurantModalNew'),
            name: document.getElementById('modal-restaurant-name-new'),
            image: document.getElementById('modal-restaurant-img-new'),
            stars: document.getElementById('modal-stars-new'),
            rating: document.getElementById('modal-rating-new'),
            ratingCount: document.getElementById('modal-rating-count-new'),
            address: document.getElementById('modal-address-new'),
            status: document.getElementById('modal-status-new'),
            statusText: document.querySelector('#modal-status-new .modal-status-text-new'),
            todayHours: document.getElementById('modal-today-hours-new'),
            viewHoursBtn: document.getElementById('view-full-hours-btn-new'),
            tags: document.getElementById('modal-tags-new'),
            favoriteBtn: document.getElementById('modal-favorite-btn-new'),
            directionBtn: document.getElementById('modal-direction-btn-new'),
            closeBtn: document.querySelector('.restaurant-modal-close-new'),
            mapContainer: document.getElementById('modal-map-new'),
            
            hoursModal: document.getElementById('weeklyHoursModalNew'),
            hoursModalBody: document.getElementById('weekly-hours-modal-body-new'),
            hoursModalCloseBtn: document.querySelector('.weekly-hours-modal-close-new')
        };
        
        console.log('餐廳彈窗DOM元素:', elements);
        
        // 綁定事件
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closeModal);
        }
        
        if (elements.modal) {
            elements.modal.addEventListener('click', function(e) {
                if (e.target === elements.modal) {
                    closeModal();
                }
            });
        }
        
        if (elements.viewHoursBtn) {
            elements.viewHoursBtn.addEventListener('click', showWeeklyHours);
        }
        
        if (elements.hoursModalCloseBtn) {
            elements.hoursModalCloseBtn.addEventListener('click', closeWeeklyHoursModal);
        }
        
        if (elements.hoursModal) {
            elements.hoursModal.addEventListener('click', function(e) {
                if (e.target === elements.hoursModal) {
                    closeWeeklyHoursModal();
                }
            });
        }
        
        if (elements.favoriteBtn) {
            elements.favoriteBtn.addEventListener('click', toggleFavorite);
        }
        
        if (elements.directionBtn) {
            elements.directionBtn.addEventListener('click', openDirections);
        }
        
        // 監聽 ESC 鍵
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (elements.hoursModal && elements.hoursModal.classList.contains('active')) {
                    closeWeeklyHoursModal();
                } else if (elements.modal && elements.modal.classList.contains('active')) {
                    closeModal();
                }
            }
        });
        
        // 將模組掛載到全局對象
        window.RestaurantModal = {
            init: init,
            showRestaurantDetail: showRestaurantDetail,
            closeModal: closeModal,
            showWeeklyHours: showWeeklyHours,
            closeWeeklyHoursModal: closeWeeklyHoursModal
        };
        
        console.log('餐廳彈窗模組初始化完成，已掛載到 window.RestaurantModal');
    }
    
    // 顯示餐廳詳情
    async function showRestaurantDetail(restaurant) {
        if (!restaurant) {
            console.error('餐廳數據為空');
            return;
        }
        
        console.log('顯示餐廳詳情:', restaurant);
        
        // 確保DOM元素已初始化
        if (!elements.modal) {
            console.log('DOM元素未初始化，重新獲取');
            init();
        }
        
        // 保存當前餐廳數據
        currentRestaurant = restaurant;
        
        // 嘗試從 json_raw 解析數據
        if (restaurant.json_raw) {
            try {
                const jsonData = JSON.parse(restaurant.json_raw);
                console.log('成功解析 json_raw 數據:', jsonData);
                
                // 更新評分、評論數
                if (jsonData.rating) {
                    restaurant.rating = jsonData.rating;
                    restaurant.average_rating = jsonData.rating;
                }
                if (jsonData.user_ratings_total) {
                    restaurant.user_ratings_total = jsonData.user_ratings_total;
                    restaurant.review_count = jsonData.user_ratings_total;
                    restaurant.reviewCount = jsonData.user_ratings_total;
                }
                
                // 更新營業時間
                if (jsonData.opening_hours) {
                    restaurant.opening_hours = jsonData.opening_hours;
                    if (jsonData.opening_hours.weekday_text) {
                        restaurant.business_hours = jsonData.opening_hours.weekday_text;
                    }
                }
                
                // 更新位置信息
                if (jsonData.geometry && jsonData.geometry.location) {
                    restaurant.geometry = jsonData.geometry;
                    restaurant.lat = jsonData.geometry.location.lat;
                    restaurant.lng = jsonData.geometry.location.lng;
                }
            } catch (error) {
                console.error('解析 json_raw 失敗:', error);
            }
        }
        
        // 確保有餐廳ID
        if (!restaurant.place_id && !restaurant.id && restaurant.name) {
            restaurant.id = 'temp-id-' + Date.now();
            console.log('生成臨時 ID:', restaurant.id);
        }
        
        const restaurantId = restaurant.place_id || restaurant.id;
        
        // 設置餐廳名稱
        if (elements.name) elements.name.textContent = restaurant.name || '暫無資料';
        
        // 處理圖片URL
        let photoUrl = '';
        
        // 直接使用餐廳ID獲取圖片 (從後端API)
        if (restaurantId) {
            photoUrl = `${baseUrl}/restaurant-images/${restaurantId}/raw`;
            console.log('從後端API獲取圖片:', photoUrl);
        }
        
        // 設置圖片
        if (elements.image) {
            console.log('設置餐廳圖片:', photoUrl);
            elements.image.src = photoUrl;
            elements.image.alt = restaurant.name || '暫無資料';
            
            // 簡化錯誤處理，即使圖片加載失敗也不顯示本地圖片
            elements.image.onerror = function() {
                console.log('圖片載入失敗');
                // 不使用本地圖片
                this.style.display = 'none';  // 隱藏圖片元素
                
                // 添加一個文字提示
                const imgContainer = this.parentElement;
                if (imgContainer) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'image-error-message';
                    errorMsg.textContent = '圖片載入失敗';
                    errorMsg.style.textAlign = 'center';
                    errorMsg.style.padding = '20px';
                    errorMsg.style.color = '#999';
                    imgContainer.appendChild(errorMsg);
                }
            };
        }
        
        // 設置評分
        const rating = parseFloat(restaurant.rating) || parseFloat(restaurant.average_rating) || 0;
        if (elements.rating) elements.rating.textContent = rating.toFixed(1) || '暫無資料';
        if (elements.ratingCount) {
            const reviewCount = restaurant.user_ratings_total || restaurant.review_count || restaurant.reviewCount || 0;
            elements.ratingCount.textContent = `(${reviewCount}則評論)`;
            
            // 調試信息
            console.log('評分數據:', {
                restaurantName: restaurant.name,
                rating: rating,
                originalRating: restaurant.rating,
                averageRating: restaurant.average_rating,
                reviewCount: reviewCount,
                originalReviewCount: restaurant.user_ratings_total,
                alternativeReviewCount: restaurant.review_count
            });
        }
        
        // 生成星星評分
        if (elements.stars) {
            elements.stars.textContent = generateStars(rating);
        }
        
        // 設置地址
        if (elements.address) elements.address.textContent = restaurant.address || restaurant.vicinity || '暫無資料';
        
        // 設置營業狀態
        let isOpen = false;
        let todayHoursText = '';
        
        // 獲取今天是星期幾
        const today = new Date().getDay(); // 0-6，0代表星期日
        const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        const todayName = dayNames[today];
        
        if (restaurant.opening_hours) {
            // 如果opening_hours是字符串形式的JSON，先解析它
            if (typeof restaurant.opening_hours === 'string') {
                try {
                    restaurant.opening_hours = JSON.parse(restaurant.opening_hours);
                    console.log('已解析營業時間JSON字符串:', restaurant.opening_hours);
                } catch (error) {
                    console.warn('解析營業時間JSON失敗:', error);
                }
            }
            
            // 準備營業時間數據
            prepareWeeklyHoursData(restaurant.opening_hours);
            
            if (restaurant.opening_hours.weekday_text) {
                // 獲取今日營業時間文字
                const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引 (0=週一, 1=週二, ..., 6=週日)
                
                if (restaurant.opening_hours.weekday_text[index]) {
                    const todayText = restaurant.opening_hours.weekday_text[index];
                    // 直接從完整的營業時間文字中提取時間部分
                    const timeMatch = todayText.match(/:\s*(.+)$/);
                    const timeStr = timeMatch ? timeMatch[1].trim() : null;
                    
                    if (timeStr) {
                        isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                            window.businessHours.isOpenFromText(timeStr) : 
                            restaurant.opening_hours.open_now;
                        todayHoursText = timeStr;
                        
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
                    isOpen = window.businessHours && window.businessHours.isOpenNow ? 
                        window.businessHours.isOpenNow(openTime, closeTime) : false;
                    todayHoursText = `${openTime}-${closeTime}`;
                }
            } else if (restaurant.opening_hours.open_now !== undefined) {
                // 如果只有 open_now 屬性
                isOpen = restaurant.opening_hours.open_now;
            } else if (restaurant.business_hours) {
                // 嘗試使用 business_hours 欄位
                try {
                    const businessHours = typeof restaurant.business_hours === 'string' ? 
                        JSON.parse(restaurant.business_hours) : restaurant.business_hours;
                    
                    const dayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                    const todayBusiness = businessHours[dayKey];
                    
                    if (todayBusiness) {
                        isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                            window.businessHours.isOpenFromText(todayBusiness) : false;
                        todayHoursText = todayBusiness;
                    }
                } catch (error) {
                    console.warn('解析 business_hours 失敗:', error);
                }
            }
        }
        
        // 更新營業狀態
        if (elements.status) {
            elements.status.className = `modal-status-new ${isOpen ? 'open' : 'closed'}`;
        }
        if (elements.statusText) {
            elements.statusText.textContent = isOpen ? '營業中' : '休息中';
        }
        
        // 更新今日營業時間
        if (elements.todayHours) {
            elements.todayHours.textContent = todayHoursText || '未提供營業時間';
        }
        
        // 顯示完整營業時間按鈕
        if (elements.viewHoursBtn) {
            if (weeklyHoursData && weeklyHoursData.length > 0) {
                elements.viewHoursBtn.style.display = 'block';
            } else {
                elements.viewHoursBtn.style.display = 'none';
            }
        }
        
        // 設置收藏按鈕狀態
        const isFavorite = window.favoriteSystem && window.favoriteSystem.initialized ? 
            window.favoriteSystem.isStoreFavorited(restaurantId) : false;
        
        console.log('設置彈窗收藏按鈕初始狀態，餐廳ID:', restaurantId, '，收藏狀態:', isFavorite);
        
        if (elements.favoriteBtn) {
            if (isFavorite) {
                elements.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                elements.favoriteBtn.classList.add('active');
            } else {
                elements.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
                elements.favoriteBtn.classList.remove('active');
            }
        }
        
        // 顯示彈窗
        elements.modal.classList.add('active');
        console.log('彈窗已顯示');
        
        // 初始化地圖
        try {
            // 準備位置數據
            let location = null;
            
            // 嘗試從各種可能的位置獲取經緯度
            if (restaurant.geometry && restaurant.geometry.location) {
                location = restaurant.geometry.location;
            } else if (restaurant.lat !== undefined && restaurant.lng !== undefined) {
                location = { lat: restaurant.lat, lng: restaurant.lng };
            } else if (restaurant.latitude !== undefined && restaurant.longitude !== undefined) {
                location = { lat: restaurant.latitude, lng: restaurant.longitude };
            } else if (restaurant.location) {
                if (typeof restaurant.location === 'string') {
                    try {
                        const locationObj = JSON.parse(restaurant.location);
                        if (locationObj.lat !== undefined && locationObj.lng !== undefined) {
                            location = locationObj;
                        }
                    } catch (e) {
                        console.warn('解析位置字符串失敗:', e);
                    }
                } else if (typeof restaurant.location === 'object') {
                    location = restaurant.location;
                }
            }
            
            if (location && (location.lat !== undefined || location.latitude !== undefined)) {
                console.log('初始化地圖，位置數據:', location);
                initModalMap(location, restaurant.name);
            } else {
                console.warn('餐廳缺少位置數據，無法顯示地圖');
                
                // 隱藏地圖區域
                const locationSection = elements.mapContainer.closest('.restaurant-location-new');
                if (locationSection) {
                    locationSection.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('初始化地圖時出錯:', error);
        }
    }
    
    // 初始化彈窗地圖
    function initModalMap(location, restaurantName) {
        console.log('初始化彈窗地圖:', location, restaurantName);
        
        // 檢查地圖容器是否存在
        if (!elements.mapContainer) {
            console.error('找不到地圖容器元素');
            return;
        }
        
        // 檢查位置數據是否有效
        if (!location || (!location.lat && !location.lng && !location.latitude && !location.longitude)) {
            console.warn('餐廳缺少位置數據，無法顯示地圖');
            
            // 隱藏地圖區域
            const locationSection = elements.mapContainer.closest('.restaurant-location-new');
            if (locationSection) {
                locationSection.style.display = 'none';
            }
            return;
        }
        
        // 確保有有效的經緯度
        const lat = location.lat || location.latitude || 0;
        const lng = location.lng || location.longitude || 0;
        
        console.log(`顯示地圖，位置: ${lat}, ${lng}`);
        
        try {
            // 檢查 Leaflet 是否已載入
            if (typeof L === 'undefined') {
                console.error('Leaflet 地圖庫未載入');
                
                // 隱藏地圖區域
                const locationSection = elements.mapContainer.closest('.restaurant-location-new');
                if (locationSection) {
                    locationSection.style.display = 'none';
                }
                return;
            }
            
            // 清除舊地圖
            if (modalMap) {
                modalMap.remove();
                modalMap = null;
                modalMarker = null;
            }
            
            // 初始化 Leaflet 地圖
            modalMap = L.map(elements.mapContainer).setView([parseFloat(lat), parseFloat(lng)], 16);
            
            // 添加地圖圖層
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(modalMap);
            
            // 添加標記
            modalMarker = L.marker([parseFloat(lat), parseFloat(lng)], {
                title: restaurantName
            }).addTo(modalMap);
            
            // 添加彈出視窗
            modalMarker.bindPopup(`<b>${restaurantName}</b>`);
            
            // 顯示地圖區域
            const locationSection = elements.mapContainer.closest('.restaurant-location-new');
            if (locationSection) {
                locationSection.style.display = 'block';
            }
            
            // 在地圖渲染後調整大小
            setTimeout(() => {
                modalMap.invalidateSize();
            }, 300);
            
            console.log('Leaflet 地圖初始化完成');
        } catch (error) {
            console.error('初始化地圖時發生錯誤:', error);
            
            // 隱藏地圖區域
            const locationSection = elements.mapContainer.closest('.restaurant-location-new');
            if (locationSection) {
                locationSection.style.display = 'none';
            }
        }
    }
    
    // 關閉彈窗
    function closeModal() {
        if (elements.modal) {
            elements.modal.classList.remove('active');
        }
        
        // 清除地圖資源
        if (modalMap) {
            modalMap.remove();
            modalMap = null;
            modalMarker = null;
        }
    }
    
    // 準備週營業時間數據
    function prepareWeeklyHoursData(openingHours) {
        if (!openingHours) {
            weeklyHoursData = null;
            return;
        }
        
        // 如果已經有 weekday_text 數組，直接使用
        if (openingHours.weekday_text && Array.isArray(openingHours.weekday_text)) {
            weeklyHoursData = openingHours.weekday_text;
            return;
        }
        
        // 嘗試從 periods 構建 weekday_text
        if (openingHours.periods && Array.isArray(openingHours.periods)) {
            try {
                const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
                const weekdayText = [];
                
                for (let i = 0; i < 7; i++) {
                    const period = openingHours.periods.find(p => p.open.day === (i === 6 ? 0 : i + 1));
                    if (period) {
                        const openTime = `${period.open.hours.toString().padStart(2, '0')}:${(period.open.minutes || '00').toString().padStart(2, '0')}`;
                        const closeTime = `${period.close.hours.toString().padStart(2, '0')}:${(period.close.minutes || '00').toString().padStart(2, '0')}`;
                        weekdayText.push(`${dayNames[i]}: ${openTime} - ${closeTime}`);
                    } else {
                        weekdayText.push(`${dayNames[i]}: 休息`);
                    }
                }
                
                weeklyHoursData = weekdayText;
                console.log('從 periods 構建的營業時間:', weeklyHoursData);
                return;
            } catch (error) {
                console.warn('從 periods 構建營業時間失敗:', error);
            }
        }
        
        // 嘗試從 business_hours 構建 weekday_text
        if (openingHours.business_hours || currentRestaurant.business_hours) {
            try {
                const businessHours = openingHours.business_hours || currentRestaurant.business_hours;
                const businessHoursObj = typeof businessHours === 'string' ? JSON.parse(businessHours) : businessHours;
                
                if (businessHoursObj) {
                    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
                    const weekdayText = [];
                    
                    for (let i = 0; i < 7; i++) {
                        const dayHours = businessHoursObj[dayKeys[i]];
                        weekdayText.push(`${dayNames[i]}: ${dayHours || '休息'}`);
                    }
                    
                    weeklyHoursData = weekdayText;
                    console.log('從 business_hours 構建的營業時間:', weeklyHoursData);
                    return;
                }
            } catch (error) {
                console.warn('從 business_hours 構建營業時間失敗:', error);
            }
        }
        
        // 如果都無法獲取，設為空
        weeklyHoursData = null;
    }
    
    // 顯示週營業時間彈窗
    function showWeeklyHours() {
        if (!elements.hoursModal || !elements.hoursModalBody) return;
        
        // 清空原有內容
        elements.hoursModalBody.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 載入營業時間中...</div>';
        
        // 顯示彈窗
        elements.hoursModal.classList.add('active');
        
        // 如果有營業時間數據，顯示
        if (weeklyHoursData) {
            displayWeeklyHours(weeklyHoursData);
        } else {
            elements.hoursModalBody.innerHTML = '<div class="error-message">無法獲取營業時間，請稍後再試</div>';
        }
    }
    
    // 關閉週營業時間彈窗
    function closeWeeklyHoursModal() {
        if (elements.hoursModal) {
            elements.hoursModal.classList.remove('active');
        }
    }
    
    // 顯示一週營業時間
    function displayWeeklyHours(weekdayText) {
        if (!elements.hoursModalBody || !weekdayText || !Array.isArray(weekdayText)) return;
        
        // 獲取今天是星期幾
        const today = new Date().getDay();
        // 轉換為 weekday_text 的索引 (0=週一, 1=週二, ..., 6=週日)
        const todayIndex = today === 0 ? 6 : today - 1;
        
        // 創建營業時間表格
        let html = '<div class="weekly-hours-table-new">';
        
        // 遍歷每一天的營業時間
        weekdayText.forEach((dayText, index) => {
            // 分割日期和時間
            const parts = dayText.split(': ');
            const day = parts[0];
            const hours = parts[1] || '休息';
            
            // 判斷是否為今天
            const isToday = index === todayIndex;
            
            // 判斷是否營業中
            let statusIcon = '';
            if (isToday) {
                const isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                    window.businessHours.isOpenFromText(hours) : false;
                statusIcon = isOpen ? 
                    '<span class="status-dot-new open" title="營業中"></span>' : 
                    '<span class="status-dot-new closed" title="休息中"></span>';
            }
            
            // 添加表格行
            html += `
                <div class="hours-row-new ${isToday ? 'today' : ''}">
                    <div class="day-name-new">${day} ${statusIcon}</div>
                    <div class="day-hours-new">${hours}</div>
                </div>
            `;
        });
        
        html += '</div>';
        elements.hoursModalBody.innerHTML = html;
    }
    
    // 切換收藏狀態
    function toggleFavorite() {
        if (!currentRestaurant) return;
        
        const restaurantId = currentRestaurant.place_id || currentRestaurant.id;
        if (!restaurantId) {
            console.error('找不到餐廳ID');
            showToast('無法識別餐廳，請稍後再試');
            return;
        }
        
        // 檢查是否已登入
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            showToast('請先登入會員');
            return;
        }
        
        // 使用 favoriteButton 模組處理收藏功能
        if (window.favoriteButton && window.favoriteButton.initialized) {
            window.favoriteButton.toggleStoreFavorite(restaurantId, elements.favoriteBtn).then(async () => {
                // 使用異步方式獲取最新收藏狀態
                const isFavorited = await window.favoriteSystem.isStoreFavorited(restaurantId);
                console.log(`更新彈窗收藏按鈕狀態，餐廳ID: ${restaurantId}，收藏狀態: ${isFavorited}`);
                
                // 更新按鈕文字和樣式
                elements.favoriteBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}`;
                elements.favoriteBtn.classList.toggle('active', isFavorited);
            });
        } else {
            // 備用方案：直接使用收藏系統
            if (window.favoriteSystem && window.favoriteSystem.initialized) {
                window.favoriteSystem.isStoreFavorited(restaurantId).then(isFavorited => {
                    if (isFavorited) {
                        window.favoriteSystem.removeStore(restaurantId).then(success => {
                            if (success) {
                                elements.favoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
                                elements.favoriteBtn.classList.remove('active');
                                showToast('已取消收藏');
                            } else {
                                showToast('取消收藏失敗，請稍後再試');
                            }
                        });
                    } else {
                        const storeData = {
                            id: restaurantId,
                            place_id: restaurantId,
                            name: currentRestaurant.name,
                            photos: currentRestaurant.photos,
                            address: currentRestaurant.address || currentRestaurant.vicinity,
                            rating: currentRestaurant.rating,
                            user_ratings_total: currentRestaurant.user_ratings_total,
                            types: currentRestaurant.types,
                            favoriteTime: new Date().toISOString()
                        };
                        
                        window.favoriteSystem.addStore(storeData).then(success => {
                            if (success) {
                                elements.favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                                elements.favoriteBtn.classList.add('active');
                                showToast('已加入收藏');
                            } else {
                                showToast('加入收藏失敗，請稍後再試');
                            }
                        });
                    }
                });
            } else {
                showToast('收藏系統未初始化，請重新整理頁面');
            }
        }
    }
    
    // 開啟導航
    function openDirections() {
        if (!currentRestaurant) return;
        
        const address = currentRestaurant.address || currentRestaurant.vicinity || '';
        if (!address) {
            showToast('無法獲取餐廳地址');
            return;
        }
        
        const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    }
    
    // 生成星級評分
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (halfStar ? '★' : '') + 
               '☆'.repeat(emptyStars);
    }
    
    // 顯示提示訊息
    function showToast(message) {
        // 如果已經定義了全局 showToast 函數，則使用它
        if (window.showToast && typeof window.showToast === 'function') {
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
    
    // 公開API
    return {
        init: init,
        showRestaurantDetail: showRestaurantDetail,
        closeModal: closeModal,
        showWeeklyHours: showWeeklyHours,
        closeWeeklyHoursModal: closeWeeklyHoursModal
    };
})();

// 頁面加載完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('頁面載入完成，初始化 RestaurantModal');
    RestaurantModal.init();
}); 