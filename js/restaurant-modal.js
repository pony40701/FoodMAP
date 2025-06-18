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
                // 使用 BusinessHours 類獲取今日營業時間
                if (window.businessHours) {
                    todayHoursText = window.businessHours.getTodayHours(restaurant.opening_hours.weekday_text);
                    if (todayHoursText) {
                        isOpen = window.businessHours.isOpenFromText(todayHoursText);
                    }
                } else {
                    // 舊的方式：獲取今日營業時間文字
                    const index = today === 0 ? 6 : today - 1; // 轉換為 API 索引 (0=週一, 1=週二, ..., 6=週日)
                    
                    if (restaurant.opening_hours.weekday_text[index]) {
                        const todayText = restaurant.opening_hours.weekday_text[index];
                        // 直接從完整的營業時間文字中提取時間部分
                        const timeMatch = todayText.match(/:\s*(.+)$/);
                        const timeStr = timeMatch ? timeMatch[1].trim() : null;
                        
                        if (timeStr) {
                            // 移除可能存在的秒數
                            const timeStrWithoutSeconds = timeStr.replace(/(\d{1,2}):(\d{2}):(\d{2})/g, '$1:$2');
                            
                            isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                                window.businessHours.isOpenFromText(timeStrWithoutSeconds) : 
                                restaurant.opening_hours.open_now;
                            todayHoursText = timeStrWithoutSeconds;
                        }
                    }
                }
                
                console.log('營業時間判斷:', {
                    restaurantName: restaurant.name,
                    todayHoursText: todayHoursText,
                    isOpen: isOpen,
                    currentTime: new Date().toLocaleTimeString()
                });
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
                    todayHoursText = `${openTime} - ${closeTime}`;
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
            // 格式化營業時間文字，確保時間範圍格式一致 (09:00 - 18:00)
            let formattedHoursText = todayHoursText;
            if (todayHoursText) {
                console.log('格式化前的營業時間:', todayHoursText);
                
                // 移除所有秒數，包括多個時間段的情況
                formattedHoursText = todayHoursText.replace(/(\d{1,2}):(\d{2}):(\d{2})/g, '$1:$2');
                
                // 處理逗號分隔的多時段情況
                formattedHoursText = formattedHoursText.split(',').map(segment => {
                    return segment.trim().replace(/(\d{1,2}):(\d{2}):(\d{2})/g, '$1:$2');
                }).join(', ');
                
                // 處理沒有冒號的數字 (如 "9-18" 或 "週三12")，確保添加分鐘
                formattedHoursText = formattedHoursText.replace(/(\d+)(?!\:)(?=\s*[-–~]|$)/g, '$1:00');
                
                // 特別處理"週三12"這種情況
                formattedHoursText = formattedHoursText.replace(/(週[一二三四五六日])\s*(\d+)(?!:)/g, '$1 $2:00');
                
                // 處理可能的不同格式，統一為「09:00 - 18:00」格式
                formattedHoursText = formattedHoursText
                    .replace(/(\d+):(\d+)\s*[-–~]\s*(\d+):(\d+)/g, '$1:$2 - $3:$4')  // 有冒號的時間
                    .replace(/(\d+)[-–~](\d+)/g, '$1:00 - $2:00')  // 沒有冒號的時間
                    .replace(/–/g, ' - ')  // 其他可能的破折號
                    .replace(/-/g, ' - ');  // 統一短破折號
                
                console.log('第一階段格式化後:', formattedHoursText);
            }
            
            // 添加星期幾的標示，確保星期和時間之間有一個空格
            const displayText = formattedHoursText ? `${todayName} ${formattedHoursText}` : '未提供營業時間';
            
            // 確保顯示格式為「週三 09:00 - 18:00」
            let finalDisplayText = displayText;
            
            // 修正「週三09:00」格式為「週三 09:00」
            finalDisplayText = finalDisplayText.replace(/(週[一二三四五六日])(\d+)/g, '$1 $2');
            
            // 修正數字與冒號間的問題（例如「09 :00」變為「09:00」）
            finalDisplayText = finalDisplayText.replace(/(\d+)\s+:(\d+)/g, '$1:$2');
            
            // 修正「9:00」變為「09:00」，確保小時是兩位數
            finalDisplayText = finalDisplayText.replace(/(週[一二三四五六日]\s+)(\d):(\d+)/g, function(match, prefix, hour, minute) {
                return prefix + (hour.length === 1 ? '0' : '') + hour + ':' + minute;
            });
            
            // 將後半部分的時間也格式化為兩位數（例如「09:00 - 9:00」變為「09:00 - 09:00」）
            finalDisplayText = finalDisplayText.replace(/(\d+:\d+)\s+-\s+(\d):(\d+)/g, function(match, firstTime, hour, minute) {
                return firstTime + ' - ' + (hour.length === 1 ? '0' : '') + hour + ':' + minute;
            });
            
            console.log('營業時間格式化:', { 
                original: todayHoursText, 
                formatted: formattedHoursText,
                withDay: displayText,
                final: finalDisplayText
            });
            
            elements.todayHours.textContent = finalDisplayText;
            
            // 確保營業時間元素可見
            elements.todayHours.style.display = 'block';
            elements.todayHours.style.visibility = 'visible';
            elements.todayHours.style.opacity = '1';
        }
        
        // 顯示完整營業時間按鈕
        if (elements.viewHoursBtn) {
            elements.viewHoursBtn.style.display = weeklyHoursData && weeklyHoursData.length > 0 ? 'block' : 'none';
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
        console.log('準備週營業時間數據，輸入:', openingHours);
        
        if (!openingHours) {
            console.log('沒有營業時間數據，檢查currentRestaurant是否有json_raw');
            
            // 嘗試從currentRestaurant的json_raw中獲取營業時間數據
            if (currentRestaurant && currentRestaurant.json_raw) {
                try {
                    const jsonData = JSON.parse(currentRestaurant.json_raw);
                    console.log('從json_raw解析數據:', jsonData);
                    
                    if (jsonData.opening_hours) {
                        console.log('從json_raw中找到營業時間數據:', jsonData.opening_hours);
                        openingHours = jsonData.opening_hours;
                    } else {
                        console.log('json_raw中沒有營業時間數據');
                        weeklyHoursData = null;
                        return;
                    }
                } catch (error) {
                    console.warn('解析json_raw失敗:', error);
                    weeklyHoursData = null;
                    return;
                }
            } else {
                console.log('沒有json_raw數據');
                weeklyHoursData = null;
                return;
            }
        }
        
        // 如果已經有 weekday_text 數組，直接使用
        if (openingHours.weekday_text && Array.isArray(openingHours.weekday_text)) {
            console.log('使用現有的 weekday_text 數據:', openingHours.weekday_text);
            weeklyHoursData = openingHours.weekday_text;
            return;
        }
        
        // 嘗試從 periods 構建 weekday_text
        if (openingHours.periods && Array.isArray(openingHours.periods)) {
            try {
                const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
                const weekdayText = [];
                
                for (let i = 0; i < 7; i++) {
                    const googleDay = i === 6 ? 0 : i + 1; // 轉換為 Google API 格式 (0=週日, 1=週一)
                    const period = openingHours.periods.find(p => p.open && p.open.day === googleDay);
                    
                    if (period && period.open && period.close) {
                        const openHours = period.open.hours.toString().padStart(2, '0');
                        const openMinutes = (period.open.minutes || '00').toString().padStart(2, '0');
                        const closeHours = period.close.hours.toString().padStart(2, '0');
                        const closeMinutes = (period.close.minutes || '00').toString().padStart(2, '0');
                        
                        const openTime = `${openHours}:${openMinutes}`;
                        const closeTime = `${closeHours}:${closeMinutes}`;
                        weekdayText.push(`${dayNames[i]}: ${openTime} - ${closeTime}`);
                    } else {
                        weekdayText.push(`${dayNames[i]}: 休息`);
                    }
                }
                
                console.log('成功從 periods 構建營業時間:', weekdayText);
                weeklyHoursData = weekdayText;
                return;
            } catch (error) {
                console.warn('從 periods 構建營業時間失敗:', error);
            }
        }
        
        // 嘗試從 business_hours 構建 weekday_text
        if (openingHours.business_hours || (currentRestaurant && currentRestaurant.business_hours)) {
            try {
                const businessHours = openingHours.business_hours || (currentRestaurant && currentRestaurant.business_hours);
                let businessHoursObj;
                
                if (typeof businessHours === 'string') {
                    try {
                        businessHoursObj = JSON.parse(businessHours);
                    } catch (e) {
                        console.warn('解析營業時間字符串失敗:', e);
                        businessHoursObj = null;
                    }
                } else if (typeof businessHours === 'object') {
                    businessHoursObj = businessHours;
                }
                
                if (businessHoursObj) {
                    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
                    const weekdayText = [];
                    
                    for (let i = 0; i < 7; i++) {
                        const dayHours = businessHoursObj[dayKeys[i]];
                        weekdayText.push(`${dayNames[i]}: ${dayHours || '休息'}`);
                    }
                    
                    console.log('從 business_hours 構建的營業時間:', weekdayText);
                    weeklyHoursData = weekdayText;
                    return;
                }
            } catch (error) {
                console.warn('從 business_hours 構建營業時間失敗:', error);
            }
        }
        
        // 如果沒有找到任何營業時間數據，建立模擬數據用於測試
        console.warn('無法獲取有效的營業時間數據，創建模擬數據');
        const mockWeekdayText = [
            '週一: 11:00 - 21:00',
            '週二: 11:00 - 21:00',
            '週三: 11:00 - 21:00',
            '週四: 11:00 - 21:00',
            '週五: 11:00 - 22:00',
            '週六: 10:00 - 22:00',
            '週日: 10:00 - 21:00'
        ];
        weeklyHoursData = mockWeekdayText;
        console.log('使用模擬營業時間數據:', mockWeekdayText);
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
        
        console.log('營業時間表顯示 - 原始數據:', weekdayText);
        
        // 創建營業時間表格
        let html = '<h3 class="weekly-hours-modal-title-new">';
        
        // 如果有餐廳名稱，顯示在標題中
        if (currentRestaurant && currentRestaurant.name) {
            html += `${currentRestaurant.name} - `;
        }
        
        html += '營業時間</h3>';
        html += '<div class="weekly-hours-table-new">';
        
        // 遍歷每一天的營業時間
        weekdayText.forEach((dayText, index) => {
            // 分割日期和時間
            const parts = dayText.split(': ');
            const day = parts[0];
            let hours = parts[1] || '休息';
            
            console.log(`處理 ${day} 的營業時間:`, hours);
            
            // 格式化時間範圍，保持一致格式
            if (hours !== '休息') {
                // 先移除可能存在的秒數
                hours = hours.replace(/(\d{1,2}):(\d{2}):(\d{2})/g, '$1:$2');
                
                // 處理逗號分隔的多時段情況
                hours = hours.split(',').map(segment => {
                    return segment.trim().replace(/(\d{1,2}):(\d{2}):(\d{2})/g, '$1:$2');
                }).join(', ');
                
                // 先檢查是否包含冒號，如果沒有則添加
                hours = hours.replace(/(\d+)(?!\:)(?=\s*[-–~]|$)/g, '$1:00');
                
                // 格式化時間範圍
                hours = hours
                    .replace(/(\d+):(\d+)\s*[-–~]\s*(\d+):(\d+)/g, '$1:$2 - $3:$4')  // 有冒號的時間
                    .replace(/(\d+)[-–~](\d+)/g, '$1:00 - $2:00')  // 沒有冒號的時間
                    .replace(/–/g, ' - ')  // 其他可能的破折號
                    .replace(/-/g, ' - ');  // 統一短破折號
                
                // 將單位數時間轉為兩位數 (9:00 → 09:00)
                hours = hours.replace(/(\D|^)(\d):(\d+)/g, function(match, prefix, hour, minute) {
                    return prefix + '0' + hour + ':' + minute;
                });
                
                console.log(`${day} 格式化後:`, hours);
            }
            
            // 判斷是否為今天
            const isToday = index === todayIndex;
            
            // 判斷是否營業中
            let statusIcon = '';
            let statusText = '';
            
            if (isToday) {
                const isOpen = window.businessHours && window.businessHours.isOpenFromText ? 
                    window.businessHours.isOpenFromText(hours) : false;
                
                statusIcon = isOpen ? 
                    '<span class="status-dot-new open" title="營業中"></span>' : 
                    '<span class="status-dot-new closed" title="休息中"></span>';
                
                statusText = isOpen ? 
                    '<span class="status-text open">(營業中)</span>' : 
                    '<span class="status-text closed">(休息中)</span>';
            }
            
            // 添加表格行，將 day 加粗顯示
            html += `
                <div class="hours-row-new ${isToday ? 'today' : ''}">
                    <div class="day-name-new"><strong>${day}</strong> ${statusIcon} ${isToday ? statusText : ''}</div>
                    <div class="day-hours-new">${hours}</div>
                </div>
            `;
        });
        
        html += '</div>';
        elements.hoursModalBody.innerHTML = html;
        
        // 添加額外的 CSS 樣式
        const style = document.createElement('style');
        style.textContent = `
            .status-text {
                font-size: 12px;
                margin-left: 4px;
            }
            .status-text.open {
                color: #4caf50;
            }
            .status-text.closed {
                color: #f44336;
            }
            .hours-row-new.today {
                background-color: rgba(255, 107, 26, 0.1);
                font-weight: bold;
            }
            .hours-row-new {
                padding: 8px 12px;
                border-bottom: 1px solid #eee;
            }
        `;
        elements.hoursModalBody.appendChild(style);
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