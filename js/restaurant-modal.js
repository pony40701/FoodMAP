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
        try {
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
            
            // 檢查關鍵元素是否存在，如果不存在則顯示警告
            const requiredElements = ['modal', 'name', 'image', 'stars', 'rating', 'ratingCount', 'address', 'status', 'statusText', 'todayHours', 'viewHoursBtn'];
            const missingElements = requiredElements.filter(key => !elements[key]);
            
            if (missingElements.length > 0) {
                console.error('缺少必要DOM元素:', missingElements);
                alert('頁面缺少必要元素，餐廳詳情功能可能無法正常工作。請重新整理頁面後再試。');
            }
            
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
        } catch (error) {
            console.error('餐廳彈窗初始化出錯:', error);
            alert('初始化餐廳詳情功能時出現錯誤，請重新整理頁面後再試。');
        }
    }
    
    // 顯示餐廳詳情
    async function showRestaurantDetail(restaurant) {
        try {
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
            
            if (!elements.modal) {
                console.error('初始化後仍無法獲取Modal元素');
                return;
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
            
            // 處理圖片URL - 使用與商家卡片相同的方式
            let photoUrl = '';
            
            // 優先使用restaurant中已存在的圖片URL
            if (restaurant.photo) {
                photoUrl = restaurant.photo;
                console.log('使用餐廳對象中的photo屬性:', photoUrl);
            } else if (restaurant.photos && restaurant.photos.length > 0) {
                // 檢查photos是否是URL數組或對象數組
                if (typeof restaurant.photos[0] === 'string') {
                    photoUrl = restaurant.photos[0];
                } else if (restaurant.photos[0].getUrl) {
                    photoUrl = restaurant.photos[0].getUrl();
                } else if (restaurant.photos[0].url) {
                    photoUrl = restaurant.photos[0].url;
                }
                console.log('使用餐廳對象中的photos陣列:', photoUrl);
            } else if (restaurant.image_url) {
                photoUrl = restaurant.image_url;
                console.log('使用餐廳對象中的image_url屬性:', photoUrl);
            } else if (restaurantId) {
                // 如果沒有直接的圖片URL，從後端API獲取
                photoUrl = `${baseUrl}/restaurant-images/${restaurantId}/raw`;
                console.log('從後端API獲取圖片:', photoUrl);
            }
            
            // 設置圖片
            if (elements.image) {
                console.log('設置餐廳圖片:', photoUrl);
                // 清除舊的錯誤處理
                elements.image.onerror = null;
                // 顯示圖片元素
                elements.image.style.display = 'block';
                
                // 清除可能存在的錯誤提示
                const imgContainer = elements.image.parentElement;
                if (imgContainer) {
                    const existingError = imgContainer.querySelector('.image-error-message');
                    if (existingError) {
                        imgContainer.removeChild(existingError);
                    }
                }
                
                // 設置新圖片
                elements.image.src = photoUrl;
                elements.image.alt = restaurant.name || '餐廳圖片';
                
                // 設置錯誤處理
                elements.image.onerror = function() {
                    console.log('圖片載入失敗，使用預設圖片');
                    this.src = 'images/default-restaurant.jpg';
                    this.onerror = null; // 防止循環錯誤
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
            const opening_hours = getOpeningHoursFromJsonRaw(restaurant);
            const isOpen = isRestaurantOpenNow(opening_hours);
            const todayHoursText = getTodayHours(opening_hours);
            const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
            const today = new Date().getDay();
            const todayName = dayNames[today];
            
            // 更新營業狀態
            if (elements.status) {
                elements.status.className = `modal-status-new ${isOpen ? 'open' : 'closed'}`;
            }
            if (elements.statusText) {
                elements.statusText.textContent = isOpen ? '營業中' : '休息中';
            }
            
            // 顯示今日營業時間
            if (elements.todayHours) {
                let finalDisplayText = todayHoursText === '未提供營業時間' ? todayHoursText : `${todayName} ${todayHoursText}`;
                elements.todayHours.textContent = finalDisplayText;
                elements.todayHours.style.display = 'block';
                elements.todayHours.style.visibility = 'visible';
                elements.todayHours.style.opacity = '1';
            }
            
            // 顯示完整營業時間按鈕
            const weeklyHours = getWeeklyHours(opening_hours);
            if (elements.viewHoursBtn) {
                elements.viewHoursBtn.style.display = (weeklyHours && Array.isArray(weeklyHours) && weeklyHours.length > 0) ? 'block' : 'none';
                elements.viewHoursBtn.style.margin = '12px 0 0 0';
                elements.viewHoursBtn.style.textAlign = 'left';
                elements.viewHoursBtn.style.float = 'left';
                elements.viewHoursBtn.style.clear = 'both';
                // 自動插入 CSS
                if (!document.getElementById('view-hours-btn-left-style')) {
                    const style = document.createElement('style');
                    style.id = 'view-hours-btn-left-style';
                    style.textContent = `
                    #view-full-hours-btn-new {
                        float: left !important;
                        margin-left: 0 !important;
                        margin-top: 12px !important;
                        margin-bottom: 0 !important;
                        text-align: left !important;
                    }
                    `;
                    document.head.appendChild(style);
                }
            }
            
            // 設置收藏按鈕狀態
            let isFavorite = false;
            if (window.favoriteSystem && window.favoriteSystem.initialized) {
                isFavorite = await window.favoriteSystem.isStoreFavorited(restaurantId);
            }
            
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
            console.log('營業時間檢查 - 當前週營業時間數據:', weeklyHoursData);
            console.log('營業時間檢查 - 營業時間設置:', {
                isOpen: isOpen,
                todayHoursText: todayHoursText,
                statusElement: elements.status,
                statusTextElement: elements.statusText,
                todayHoursElement: elements.todayHours
            });
            
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

            // 在 showRestaurantDetail 內，主畫面今日營業狀態與營業時間美化排版：
            if (elements.status && elements.todayHours) {
                // 產生狀態圓點
                const statusDot = `<span class="modal-status-dot ${isOpen ? 'open' : 'closed'}"></span>`;
                // 狀態文字
                const statusText = `<span class="modal-status-text">${isOpen ? '營業中' : '休息中'}</span>`;
                // 今日營業時間
                const todayHoursHtml = `<span class="modal-today-hours">${todayHoursText === '未提供營業時間' ? todayHoursText : todayName + ' ' + todayHoursText}</span>`;
                // 組合
                const statusRow = `<div class="modal-status-row">${statusDot}${statusText}${todayHoursHtml}</div>`;
                // 插入到狀態區塊
                elements.status.innerHTML = statusRow;
                // 隱藏原本 todayHours
                elements.todayHours.style.display = 'none';
                // 自動插入 CSS
                if (!document.getElementById('modal-status-row-style')) {
                    const style = document.createElement('style');
                    style.id = 'modal-status-row-style';
                    style.textContent = `
                    .modal-status-row { display: flex; align-items: center; justify-content: space-between; background: #f8f8f8; border-radius: 6px; padding: 8px 14px; margin-bottom: 10px; font-size: 16px; }
                    .modal-status-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
                    .modal-status-dot.open { background: #4caf50; }
                    .modal-status-dot.closed { background: #f44336; }
                    .modal-status-text { font-weight: bold; margin-right: 8px; }
                    .modal-today-hours { color: #888; font-size: 15px; font-weight: normal; margin-left: auto; }
                    `;
                    document.head.appendChild(style);
                }
            }
        } catch (error) {
            console.error('顯示餐廳詳情時出錯:', error);
            alert('加載餐廳詳情時出現錯誤，請重新整理頁面後再試。');
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
    
    // 顯示週營業時間彈窗
    function showWeeklyHours() {
        if (!elements.hoursModal || !elements.hoursModalBody) return;
        elements.hoursModalBody.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> 載入營業時間中...</div>';
        elements.hoursModal.classList.add('active');
        const opening_hours = getOpeningHoursFromJsonRaw(currentRestaurant);
        const weeklyHours = getWeeklyHours(opening_hours);
        if (weeklyHours && Array.isArray(weeklyHours) && weeklyHours.length === 7) {
            displayWeeklyHours(weeklyHours);
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
    function displayWeeklyHours(weeklyHours) {
        if (!elements.hoursModalBody || !weeklyHours || !Array.isArray(weeklyHours)) return;
        const today = new Date().getDay();
        const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        let html = '<h3 class="weekly-hours-modal-title-new">';
        if (currentRestaurant && currentRestaurant.name) {
            html += `${currentRestaurant.name} - `;
        }
        html += '營業時間</h3>';
        html += '<div class="weekly-hours-table-new">';
        for (let i = 0; i < 7; i++) {
            const isToday = i === today;
            html += `
                <div class="hours-row-new ${isToday ? 'today' : ''}">
                    <div class="day-name-new"><strong>${dayNames[i]}</strong> ${isToday ? '<span class="status-text today">(今天)</span>' : ''}</div>
                    <div class="day-hours-new">${weeklyHours[i]}</div>
                </div>
            `;
        }
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
    
    // 取得今日所有時段
    function getTodayHours(opening_hours) {
        const today = new Date().getDay(); // 0=週日
        if (opening_hours && Array.isArray(opening_hours.periods)) {
            const periods = opening_hours.periods.filter(p => p.open && p.open.day === today);
            if (periods.length > 0) {
                return periods.map(period => {
                    const open = parseTimeString(period.open.time);
                    const close = parseTimeString(period.close.time);
                    return `${open} - ${close}`;
                }).join(', ');
            }
        }
        if (opening_hours && Array.isArray(opening_hours.weekday_text)) {
            return opening_hours.weekday_text[today].replace(/^星期[一二三四五六日]:\s*/, '') || '休息';
        }
        return '未提供營業時間';
    }
    
    // 取得一週時段表
    function getWeeklyHours(opening_hours) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            let dayPeriods = [];
            if (opening_hours && Array.isArray(opening_hours.periods)) {
                dayPeriods = opening_hours.periods.filter(p => p.open && p.open.day === d);
            }
            if (dayPeriods.length > 0) {
                week.push(dayPeriods.map(period => {
                    const open = parseTimeString(period.open.time);
                    const close = parseTimeString(period.close.time);
                    return `${open} - ${close}`;
                }).join(', '));
            } else if (opening_hours && Array.isArray(opening_hours.weekday_text)) {
                const text = opening_hours.weekday_text[d].replace(/^星期[一二三四五六日]:\s*/, '') || '休息';
                week.push(text);
            } else {
                week.push('休息');
            }
        }
        return week;
    }
    
    // 取得 opening_hours 從 json_raw
    function getOpeningHoursFromJsonRaw(restaurant) {
        if (restaurant.json_raw) {
            try {
                const json = typeof restaurant.json_raw === 'string' ? JSON.parse(restaurant.json_raw) : restaurant.json_raw;
                if (json.opening_hours) return json.opening_hours;
            } catch (e) {
                console.warn('解析 json_raw 失敗:', e);
            }
        }
        return restaurant.opening_hours || null;
    }
    
    // 解析時間字符串
    function parseTimeString(timeStr) {
        if (!timeStr || typeof timeStr !== 'string' || timeStr.length < 3) return '';
        if (timeStr.length === 3) timeStr = '0' + timeStr;
        return timeStr.slice(0, 2) + ':' + timeStr.slice(2, 4);
    }
    
    // 判斷餐廳是否營業中
    function isRestaurantOpenNow(opening_hours) {
        const now = new Date();
        const today = now.getDay(); // 0=週日
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        if (opening_hours && Array.isArray(opening_hours.periods)) {
            const periods = opening_hours.periods.filter(p => p.open && p.open.day === today);
            for (const period of periods) {
                const open = period.open.time;
                const close = period.close.time;
                if (open && close) {
                    const openMinutes = parseInt(open.slice(0, 2)) * 60 + parseInt(open.slice(2, 4));
                    const closeMinutes = parseInt(close.slice(0, 2)) * 60 + parseInt(close.slice(2, 4));
                    // 跨午夜
                    if (closeMinutes > openMinutes) {
                        if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) return true;
                    } else {
                        if (currentMinutes >= openMinutes || currentMinutes < closeMinutes) return true;
                    }
                }
            }
        }
        return false;
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