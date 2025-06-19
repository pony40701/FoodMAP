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
            
            ('餐廳彈窗DOM元素:', elements);
            
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
            
            ('餐廳彈窗模組初始化完成，已掛載到 window.RestaurantModal');
    }
    
    // 顯示餐廳詳情
    async function showRestaurantDetail(restaurant) {
            if (!restaurant) {
                console.error('餐廳數據為空');
                return;
            }
            
            ('顯示餐廳詳情:', restaurant);
            
            // 確保DOM元素已初始化
            if (!elements.modal) {
                ('DOM元素未初始化，重新獲取');
                init();
            }
            
            // 保存當前餐廳數據
            currentRestaurant = restaurant;
            
            // 確保有餐廳ID
            if (!restaurant.place_id && !restaurant.id && restaurant.name) {
                restaurant.id = 'temp-id-' + Date.now();
                ('生成臨時 ID:', restaurant.id);
            }
            
            const restaurantId = restaurant.place_id || restaurant.id;
            
            // 設置餐廳名稱
        if (elements.name) elements.name.textContent = restaurant.name;
        
        // 處理圖片URL
        let photoUrl = 'images/default-restaurant.jpg';  // 修改預設圖片路徑
        
        if (restaurantId) {
            // 使用統一的 API 端點
            photoUrl = `http://localhost:8080/api/restaurant-images/${restaurantId}/raw`;
            ('使用資料庫圖片:', photoUrl, '餐廳ID:', restaurantId);
        } else {
            ('找不到餐廳ID，使用預設圖片');
            }
            
            // 設置圖片
            if (elements.image) {
                ('設置餐廳圖片:', photoUrl);
                elements.image.src = photoUrl;
            elements.image.alt = restaurant.name;
                elements.image.onerror = function() {
                    ('圖片載入失敗，使用預設圖片');
                    this.src = 'images/default-restaurant.jpg';
                };
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
        if (elements.tags) {
            let tagsHtml = '';
            if (restaurant.types) {
                let typeArray = [];
                if (Array.isArray(restaurant.types)) {
                    typeArray = restaurant.types;
                } else if (typeof restaurant.types === 'string') {
                    typeArray = restaurant.types.split(',').map(type => type.trim());
                } else if (restaurant.types) {
                    typeArray = [restaurant.types];
                }
                
                // 只取前三個類型
                typeArray.slice(0, 3).forEach(type => {
                    tagsHtml += `<span class="restaurant-tag">${type}</span>`;
                });
            }
            elements.tags.innerHTML = tagsHtml;
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
            ('彈窗已顯示');
        } else {
            console.error('找不到彈窗元素');
        }
            
            // 初始化地圖
        if (elements.mapContainer) {
            try {
                // 確保餐廳有位置數據
                let lat = null;
                let lng = null;
                
                // 優先使用後端返回的座標數據
                if (restaurant.latitude && restaurant.longitude) {
                    lat = Number(restaurant.latitude);
                    lng = Number(restaurant.longitude);
                } else if (restaurant.location) {
                    lat = restaurant.location.lat;
                    lng = restaurant.location.lng;
                } else if (restaurant.geometry && restaurant.geometry.location) {
                    lat = restaurant.geometry.location.lat();
                    lng = restaurant.geometry.location.lng();
                } else if (restaurant.lat && restaurant.lng) {
                    lat = restaurant.lat;
                    lng = restaurant.lng;
                }
                
                if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
                    const location = { lat, lng };
                    initModalMap(location, restaurant.name);
                } else {
                    console.warn('餐廳缺少位置數據，無法顯示地圖');
                    elements.mapContainer.innerHTML = '<div class="map-error">無法顯示地圖，缺少位置數據</div>';
                }
            } catch (error) {
                console.error('初始化地圖失敗:', error);
                elements.mapContainer.innerHTML = '<div class="map-error">載入地圖時發生錯誤</div>';
            }
        }
    }
    
    // 初始化彈窗地圖
    function initModalMap(location, restaurantName) {
        if (!elements.mapContainer) return;
        
        try {
            // 清除現有地圖
            if (modalMap) {
                modalMap.remove();
            }
            
            // 創建 Leaflet 地圖
            modalMap = L.map(elements.mapContainer).setView([location.lat, location.lng], 16);
            
            // 添加 OpenStreetMap 圖層
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(modalMap);
            
            // 創建自定義圖標
            const customIcon = L.divIcon({
                className: 'restaurant-marker-modal',
                html: `
                    <div style="
                        background-color: #FF6B1A;
                        width: 24px;
                        height: 24px;
                        border-radius: 50% 50% 50% 0;
                        transform: rotate(-45deg);
                        position: relative;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    ">
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%) rotate(45deg);
                            font-size: 12px;
                        ">🍽️</div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 24],
                popupAnchor: [0, -24]
            });
            
            // 創建標記
            modalMarker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(modalMap);
            
            // 添加彈出視窗
            modalMarker.bindPopup(`<b>${restaurantName}</b>`);
            
            ('地圖初始化成功');
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
            modalMap.remove();
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
    ('頁面載入完成，初始化 RestaurantModal');
    RestaurantModal.init();
}); 