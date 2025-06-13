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
    
    // 緩存DOM元素
    const elements = {
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
    
    // 初始化
    function init() {
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
        
        console.log('餐廳彈窗模組初始化完成');
    }
    
    // 顯示餐廳詳情
    async function showRestaurantDetail(restaurant) {
        if (!restaurant) {
            console.error('餐廳數據為空');
            return;
        }
        
        console.log('顯示餐廳詳情:', restaurant);
        
        // 保存當前餐廳數據
        currentRestaurant = restaurant;
        
        // 確保有餐廳ID
        if (!restaurant.place_id && !restaurant.id && restaurant.name) {
            restaurant.id = 'temp-id-' + Date.now();
            console.log('生成臨時 ID:', restaurant.id);
        }
        
        const restaurantId = restaurant.place_id || restaurant.id;
        
        // 設置餐廳名稱
        if (elements.name) elements.name.textContent = restaurant.name;
        
        // 處理圖片URL
        let photoUrl = 'images/default-restaurant.jpg';
        
        if (restaurant.photos) {
            // 如果photos是字符串，直接使用
            if (typeof restaurant.photos === 'string') {
                photoUrl = restaurant.photos;
            }
            // 如果photos是陣列且有內容
            else if (Array.isArray(restaurant.photos) && restaurant.photos.length > 0) {
                // 如果第一個元素有url屬性
                if (restaurant.photos[0].url) {
                    photoUrl = restaurant.photos[0].url;
                }
                // 如果第一個元素是字符串
                else if (typeof restaurant.photos[0] === 'string') {
                    photoUrl = restaurant.photos[0];
                }
            }
            // 如果photos是對象且有url屬性
            else if (restaurant.photos.url) {
                photoUrl = restaurant.photos.url;
            }
        }
        
        // 設置圖片
        if (elements.image) {
            elements.image.src = photoUrl;
            elements.image.alt = restaurant.name;
            elements.image.onerror = function() { this.src = 'images/default-restaurant.jpg'; };
        }
        
        // 設置評分
        const rating = restaurant.rating || 0;
        if (elements.rating) elements.rating.textContent = rating.toFixed(1);
        if (elements.ratingCount) elements.ratingCount.textContent = `(${restaurant.user_ratings_total || 0}則評論)`;
        
        // 生成星星評分
        if (elements.stars) {
            elements.stars.textContent = generateStars(rating);
        }
        
        // 設置地址
        if (elements.address) elements.address.textContent = restaurant.address || restaurant.vicinity || '';
        
        // 設置營業狀態
        let isOpen = false;
        let todayHoursText = '';
        
        // 獲取今天是星期幾
        const today = new Date().getDay(); // 0-6，0代表星期日
        const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
        const todayName = dayNames[today];
        
        if (restaurant.opening_hours) {
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
                    }
                }
            } else if (restaurant.opening_hours.open_now !== undefined) {
                isOpen = restaurant.opening_hours.open_now;
            }
        }
        
        // 更新營業狀態
        if (elements.status) {
            elements.status.className = `modal-status-new ${isOpen ? 'open' : 'closed'}`;
            if (elements.statusText) {
                elements.statusText.textContent = isOpen ? '營業中' : '休息中';
            }
        }
        
        // 更新今日營業時間
        if (elements.todayHours) {
            elements.todayHours.textContent = todayHoursText ? `${todayName}: ${todayHoursText}` : '未提供營業時間';
        }
        
        // 設置餐廳標籤
        if (elements.tags && restaurant.types && restaurant.types.length > 0) {
            elements.tags.innerHTML = '';
            restaurant.types.slice(0, 3).forEach(type => {
                const tag = document.createElement('span');
                tag.className = 'restaurant-tag-new';
                tag.textContent = type;
                elements.tags.appendChild(tag);
            });
        }
        
        // 設置收藏按鈕
        if (elements.favoriteBtn) {
            // 檢查是否已收藏
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const isFavorited = isLoggedIn && window.favoriteSystem && 
                window.favoriteSystem.isStoreFavorited(restaurantId);
            
            // 更新按鈕狀態
            elements.favoriteBtn.classList.toggle('active', isFavorited);
            elements.favoriteBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}`;
            
            // 設置 data 屬性
            elements.favoriteBtn.setAttribute('data-place-id', restaurantId);
            elements.favoriteBtn.setAttribute('data-name', restaurant.name);
        }
        
        // 顯示彈窗
        if (elements.modal) {
            elements.modal.classList.add('active');
        }
        
        // 初始化地圖
        if (elements.mapContainer) {
            try {
                // 確保餐廳有位置數據
                let lat = null;
                let lng = null;
                
                if (restaurant.location) {
                    lat = restaurant.location.lat;
                    lng = restaurant.location.lng;
                } else if (restaurant.geometry && restaurant.geometry.location) {
                    lat = restaurant.geometry.location.lat();
                    lng = restaurant.geometry.location.lng();
                }
                
                if (lat && lng) {
                    // 延遲一下再初始化地圖，確保容器已經渲染
                    setTimeout(async () => {
                        try {
                            await initModalMap({ lat, lng }, restaurant.name);
                        } catch (error) {
                            console.error('初始化地圖失敗:', error);
                            elements.mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">無法載入地圖</div>';
                        }
                    }, 300);
                } else {
                    elements.mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">無法獲取餐廳位置</div>';
                }
            } catch (error) {
                console.error('處理地圖時發生錯誤:', error);
                elements.mapContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">無法載入地圖</div>';
            }
        }
    }
    
    // 初始化彈窗地圖
    async function initModalMap(location, restaurantName) {
        if (!elements.mapContainer) return;
        
        try {
            // 導入 Google Maps 庫
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
            
            // 創建地圖
            modalMap = new Map(elements.mapContainer, {
                center: location,
                zoom: 16,
                mapId: 'MODAL_MAP_ID',
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                }
            });
            
            // 創建標記
            const markerContent = document.createElement('div');
            markerContent.style.cssText = `
                background-color: #FF6B1A;
                width: 24px;
                height: 24px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                position: relative;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;
            
            const icon = document.createElement('div');
            icon.innerHTML = '🍽️';
            icon.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                font-size: 12px;
            `;
            
            markerContent.appendChild(icon);
            
            modalMarker = new AdvancedMarkerElement({
                map: modalMap,
                position: location,
                title: restaurantName,
                content: markerContent
            });
            
            console.log('地圖初始化成功');
        } catch (error) {
            console.error('初始化地圖失敗:', error);
            throw error;
        }
    }
    
    // 關閉彈窗
    function closeModal() {
        if (elements.modal) {
            elements.modal.classList.remove('active');
        }
        
        // 清除地圖資源
        if (modalMap) {
            // 不需要特別清除，Google Maps API 會自動處理
            modalMap = null;
            modalMarker = null;
        }
    }
    
    // 準備週營業時間數據
    function prepareWeeklyHoursData(openingHours) {
        if (!openingHours || !openingHours.weekday_text) {
            weeklyHoursData = null;
            return;
        }
        
        weeklyHoursData = openingHours.weekday_text;
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
            window.favoriteButton.toggleStoreFavorite(restaurantId, elements.favoriteBtn).then(() => {
                // 更新按鈕文字
                const isFavorited = window.favoriteSystem && window.favoriteSystem.isStoreFavorited(restaurantId);
                elements.favoriteBtn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i> ${isFavorited ? '已收藏' : '收藏'}`;
                elements.favoriteBtn.classList.toggle('active', isFavorited);
                
                // 更新所有相同 ID 的按鈕
                if (window.favoriteButton.updateAllButtonsWithSameId) {
                    window.favoriteButton.updateAllButtonsWithSameId(restaurantId);
                }
            });
        } else {
            // 備用方案：直接使用收藏系統
            if (window.favoriteSystem && window.favoriteSystem.initialized) {
                const isFavorited = window.favoriteSystem.isStoreFavorited(restaurantId);
                
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
    RestaurantModal.init();
    
    // 將模組掛載到全局對象
    window.RestaurantModal = RestaurantModal;
    
    // 綁定測試按鈕
    const testModalBtn = document.getElementById('testModalBtn');
    if (testModalBtn) {
        testModalBtn.addEventListener('click', function() {
            // 創建一個測試餐廳對象
            const testRestaurant = {
                id: 'test-restaurant-id',
                place_id: 'test-restaurant-id',
                name: 'Burger Joint 7分so美式廚房-朝富店',
                rating: 4.8,
                user_ratings_total: 6830,
                address: '407台灣台中市西屯朝富路252號1F',
                photos: 'images/carousel1.jpg',
                types: ['餐廳', '美式料理', '漢堡'],
                location: {
                    lat: 24.1681,
                    lng: 120.6438
                },
                opening_hours: {
                    open_now: true,
                    weekday_text: [
                        '星期一: 09:00 – 22:00',
                        '星期二: 09:00 – 22:00',
                        '星期三: 09:00 – 22:00',
                        '星期四: 09:00 – 22:00',
                        '星期五: 09:00 – 23:00',
                        '星期六: 10:00 – 23:00',
                        '星期日: 10:00 – 21:00'
                    ]
                }
            };
            
            // 顯示測試餐廳彈窗
            RestaurantModal.showRestaurantDetail(testRestaurant);
        });
    }
}); 