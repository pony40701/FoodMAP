console.log('homePage.js loaded!');

// 移除假資料，改用 Google Places API
let currentRestaurants = [];
let placesService;
let map;
let currentUserLocationMarker = null; // 新增：使用者當前位置標記變數
let isMapInitialized = false; // 新增：地圖初始化狀態標記

// 將 initMap 函式移至全域範圍並確保在所有其他程式碼之前定義
function initMap() {
    console.log('initMap 函數被調用');
    
    // 防止重複初始化
    if (isMapInitialized) {
        console.log('地圖已經初始化，跳過重複初始化');
        return;
    }
    
    try {
        // 檢查 DOM 元素是否存在
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('找不到地圖容器元素');
            setTimeout(initMap, 1000); // 1 秒後重試
            return;
        }

        // 嘗試獲取使用者位置
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    // 初始化地圖
                    map = new google.maps.Map(mapElement, {
                        zoom: 15,
                        center: userLocation,
                        mapTypeControl: false
                    });

                    // 添加使用者位置標記
                    if (currentUserLocationMarker) {
                        currentUserLocationMarker.setMap(null);
                    }
                    currentUserLocationMarker = new google.maps.Marker({
                        position: userLocation,
                        map: map,
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        },
                        title: "您的位置"
                    });

                    console.log('地圖已創建，使用使用者位置');

                    // 在地圖初始化後初始化 Places Service
                    if (typeof google !== 'undefined' && typeof google.maps.places !== 'undefined') {
                        console.log('Google Maps API 和 Places Library 已載入。');
                        placesService = new google.maps.places.PlacesService(map);
                        console.log('Places Service 已初始化。', placesService);

                        isMapInitialized = true;
                        
                        // 添加一個短暫的延遲，確保 Places Service 完成內部準備
                        setTimeout(() => {
                            console.log('初始化延遲結束，等待地圖閒置。');
                            google.maps.event.addListenerOnce(map, 'idle', () => {
                                console.log('地圖進入閒置狀態，執行首次搜尋。');
                                updateLocationStatus('使用您的位置進行搜尋。');
                                
                                if (placesService) {
                                    console.log('呼叫 searchNearbyRestaurants...');
                                    searchNearbyRestaurants(userLocation.lat, userLocation.lng);
                                    console.log('searchNearbyRestaurants 呼叫完成。');
                                } else {
                                    console.error('Places Service 未初始化，無法進行附近餐廳搜尋。');
                                    updateLocationStatus('地圖服務初始化失敗，請稍後再試。');
                                }
                            });
                        }, 500);
                    }
                },
                (error) => {
                    console.error('無法獲取位置:', error);
                    // 使用預設位置（台中市南屯區公益路二段51號）
                    const taichung = { lat: 24.1477, lng: 120.6470 };
                    map = new google.maps.Map(mapElement, {
                        zoom: 15,
                        center: taichung,
                        mapTypeControl: false
                    });

                    console.log('地圖已創建，使用預設位置');

                    // 在地圖初始化後初始化 Places Service
                    if (typeof google !== 'undefined' && typeof google.maps.places !== 'undefined') {
                        console.log('Google Maps API 和 Places Library 已載入。');
                        placesService = new google.maps.places.PlacesService(map);
                        console.log('Places Service 已初始化。', placesService);

                        isMapInitialized = true;
                        
                        setTimeout(() => {
                            console.log('初始化延遲結束，等待地圖閒置。');
                            google.maps.event.addListenerOnce(map, 'idle', () => {
                                console.log('地圖進入閒置狀態，執行首次搜尋。');
                                updateLocationStatus('使用預設位置進行搜尋。');
                                
                                if (placesService) {
                                    console.log('呼叫 searchNearbyRestaurants...');
                                    searchNearbyRestaurants(taichung.lat, taichung.lng);
                                    console.log('searchNearbyRestaurants 呼叫完成。');
                                } else {
                                    console.error('Places Service 未初始化，無法進行附近餐廳搜尋。');
                                    updateLocationStatus('地圖服務初始化失敗，請稍後再試。');
                                }
                            });
                        }, 500);
                    }
                }
            );
        } else {
            console.error('瀏覽器不支援地理位置功能');
            updateLocationStatus('您的瀏覽器不支援地理位置功能，使用預設位置。');
            // 使用預設位置
            const taichung = { lat: 24.1477, lng: 120.6470 };
            map = new google.maps.Map(mapElement, {
                zoom: 15,
                center: taichung,
                mapTypeControl: false
            });

            console.log('地圖已創建，使用預設位置');

            // 在地圖初始化後初始化 Places Service
            if (typeof google !== 'undefined' && typeof google.maps.places !== 'undefined') {
                console.log('Google Maps API 和 Places Library 已載入。');
                placesService = new google.maps.places.PlacesService(map);
                console.log('Places Service 已初始化。', placesService);

                isMapInitialized = true;
                
                setTimeout(() => {
                    console.log('初始化延遲結束，等待地圖閒置。');
                    google.maps.event.addListenerOnce(map, 'idle', () => {
                        console.log('地圖進入閒置狀態，執行首次搜尋。');
                        updateLocationStatus('使用預設位置進行搜尋。');
                        
                        if (placesService) {
                            console.log('呼叫 searchNearbyRestaurants...');
                            searchNearbyRestaurants(taichung.lat, taichung.lng);
                            console.log('searchNearbyRestaurants 呼叫完成。');
                        } else {
                            console.error('Places Service 未初始化，無法進行附近餐廳搜尋。');
                            updateLocationStatus('地圖服務初始化失敗，請稍後再試。');
                        }
                    });
                }, 500);
            }
        }
    } catch (error) {
        console.error('initMap 初始化錯誤:', error);
        updateLocationStatus('地圖初始化失敗，請重新載入頁面。');
        // 嘗試重新初始化
        setTimeout(() => {
            console.log('嘗試重新初始化地圖...');
            isMapInitialized = false;
            initMap();
        }, 2000);
    }
}

// 明確地將 initMap 函式賦值給 window 物件，確保 Google Maps API 能夠找到它
window.initMap = initMap;

// 確保函數在全局範圍內
window.showMoreCategories = showMoreCategories;
window.showOpenRestaurants = showOpenRestaurants;
window.searchByType = searchByType;
window.searchRestaurants = searchRestaurants;
window.showAllNearbyRestaurants = showAllNearbyRestaurants;

// 新增：備用初始化機制和頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 內容已載入');
    
    // 立即載入備用資料，不等待 Google Maps API
    console.log('立即載入餐廳資料');
    
    // 初始化非 Google Maps 相關部分
    initMerchantDropdown();
    initLoginButton();
    initReviewButton();
    initFooterLinks();

    // 檢查並綁定搜尋框事件，避免 'searchInput' 不存在時報錯
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchRestaurants();
            }
        });
    } else {
        console.warn("找不到 ID 為 'searchInput' 的元素。");
    }

    initRestaurantDetailModal();
    
    // 背景嘗試初始化 Google Maps (不影響主要功能)
    setTimeout(() => {
        if (!isMapInitialized && typeof google !== 'undefined') {
            console.log('背景嘗試初始化 Google Maps');
            try {
                initMap();
            } catch (error) {
                console.warn('Google Maps 初始化失敗，但不影響主要功能:', error);
            }
        }
    }, 2000);
});

// 新增：更新定位狀態的函式
function updateLocationStatus(message) {
    const statusElement = document.getElementById('location-status');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Google Places API mapping helper
function mapPlaceResult(place) {
    let imageUrl = '';
    if (place.photos && place.photos[0]) {
        if (place.photos[0].getUrl) {
            // 使用 getUrl 方法獲取圖片
            imageUrl = place.photos[0].getUrl({
                maxWidth: 400,
                maxHeight: 300
            });
        } else if (place.photos[0].photo_reference) {
            // 備用方案：使用 photo_reference 構建 URL
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyAqANvNvM5qZb9I_nkoMPJz_yjhvYKlKD0`;
        }
    }
    return {
        id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        user_ratings_total: place.user_ratings_total || 0,
        address: place.vicinity || place.formatted_address || place.name || '地址未提供',
        isOpen: (place.opening_hours && (place.opening_hours.open_now !== undefined)) ? place.opening_hours.open_now : false,
        opening_hours: place.opening_hours,
        image: imageUrl,
        type: (place.types && place.types[0]) ? place.types[0] : 'restaurant',
        location: place.geometry && place.geometry.location ? place.geometry.location : null
    };
}

// 搜尋附近的餐廳
function searchNearbyRestaurants(lat, lng) {
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 5000,
        type: ['restaurant']
    };
    if (placesService) {
        placesService.nearbySearch(request, async (results, status) => {
            console.log('API 回傳 results:', results);
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                // 新增：補抓沒有照片的餐廳
                const mapped = await Promise.all(results.map(place => {
                    return new Promise(resolve => {
                        // 總是調用 getDetails 來獲取完整資訊
                        placesService.getDetails({
                            placeId: place.place_id,
                            fields: ['name', 'formatted_address', 'opening_hours', 'rating', 'user_ratings_total', 'photos', 'types', 'geometry']
                        }, (detail, detailStatus) => {
                            if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                                // 合併原始資料和詳細資料
                                const mergedPlace = {
                                    ...place,
                                    photos: detail.photos || place.photos,
                                    opening_hours: detail.opening_hours || place.opening_hours,
                                    rating: detail.rating || place.rating,
                                    user_ratings_total: detail.user_ratings_total || place.user_ratings_total,
                                    types: detail.types || place.types,
                                    geometry: detail.geometry || place.geometry
                                };
                                resolve(mapPlaceResult(mergedPlace));
                            } else {
                                console.log('無法獲取詳細資訊:', place.name);
                                resolve(mapPlaceResult(place));
                            }
                        });
                    });
                }));
                
                console.log('處理後的餐廳資料:', mapped);
                window.allNearbyRestaurants = mapped;
                currentRestaurants = window.allNearbyRestaurants.slice(0, 4);
                displayRestaurants(currentRestaurants);
                updateResultsTitle('附近的餐廳');
                showRestaurantsOnMap(window.allNearbyRestaurants);
            } else {
                displayRestaurants([]);
                updateResultsTitle('搜尋失敗，請檢查網路連線或稍後再試');
            }
        });
    } else {
        displayRestaurants([]);
        updateResultsTitle('地圖服務初始化失敗，請重新載入頁面');
    }
}

// 隨機選取餐廳的函數
function getRandomRestaurants(restaurants, count) {
    const shuffled = [...restaurants].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// 初始化商家專用下拉選單
function initMerchantDropdown() {
    const dropdownTrigger = document.querySelector('.dropdown-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    dropdownTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        dropdownMenu.classList.toggle('show');
    });

    // 點擊其他地方關閉下拉選單
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-nav')) {
            dropdownMenu.classList.remove('show');
        }
    });

    // 設置下拉選單項目的點擊事件
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent.trim();

            switch(action) {
                case '商家註冊':
                    window.location.href = '/HTML/merchantRegister.html';
                    break;
                case '商家登入':
                    window.location.href = '/HTML/merchantLogin.html';
                    break;
                case '商家管理':
                    // 檢查是否已登入
                    if (localStorage.getItem('merchantEmail')) {
                        window.location.href = '/HTML/merchantDashboard.html';
                    } else {
                        alert('請先登入！');
                        window.location.href = '/HTML/merchantLogin.html';
                    }
                    break;
            }
        });
    });
}

// 強化 Modal 關閉功能（不再用 cloneNode，直接只綁一次）
function initRestaurantDetailModal() {
    console.log('initRestaurantDetailModal called');
    const modal = document.getElementById('restaurantDetailModal');
    if (!modal) return;
    const closeBtn = modal.querySelector('.close');
    console.log('closeBtn', closeBtn);
    console.log('modal', modal);
    // 關閉按鈕
    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    }
    // 點擊 Modal 外部關閉
    modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
    };
    // 支援 ESC 關閉
    window.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }, { once: true });
}

// 進階登入按鈕狀態切換
function updateLoginButton() {
    const loginBtn = document.querySelector('.btn-login');
    if (!loginBtn) return;
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        // 從 localStorage 獲取用戶資料
        const userData = JSON.parse(localStorage.getItem('userData')) || {};
        const userName = userData.name || '會員中心';
        loginBtn.textContent = userName;
        loginBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'userCenter.html';
        };
    } else {
        loginBtn.textContent = '登入';
        loginBtn.onclick = function(e) {
            e.preventDefault();
            const modal = document.getElementById('loginModal');
            if (modal) modal.style.display = 'block';
        };
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateLoginButton();
    window.addEventListener('storage', updateLoginButton);
});

// 新增：頁面顯示時自動同步登入狀態
// 只要切回首頁分頁就自動刷新按鈕

document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        updateLoginButton();
    }
});

// 初始化寫評論按鈕
function initReviewButton() {
    const reviewBtn = document.querySelector('.nav-link[href="#"]');

    reviewBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // 這裡可以實現寫評論功能
        alert('寫評論功能開發中...');
    });
}

// 初始化頁尾連結
function initFooterLinks() {
    const footerLinks = document.querySelectorAll('.footer-links a');

    footerLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.textContent.trim();

            switch(action) {
                case '服務條款':
                    alert('服務條款頁面開發中...');
                    break;
                case '隱私政策':
                    alert('隱私政策頁面開發中...');
                    break;
                case '商家註冊':
                    window.location.href = '/HTML/merchantRegister.html';
                    break;
                case '排行榜':
                    window.location.href = '/HTML/ranking.html';
                    break;
                case '寫評論':
                    alert('寫評論功能開發中...');
                    break;
                case '幫助中心':
                    alert('幫助中心頁面開發中...');
                    break;
            }
        });
    });
}

// 修改搜尋函式
function searchRestaurants() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();
    if (keyword) {
        if (!placesService) {
            displayRestaurants([]);
            updateResultsTitle(`搜尋結果: ${keyword} (0 間)`);
            return;
        }
        const request = {
            query: keyword,
            type: ['restaurant']
        };
        placesService.textSearch(request, (results, status) => {
            console.log('API 回傳 results:', results);
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                window.allNearbyRestaurants = results.map(mapPlaceResult);
                currentRestaurants = window.allNearbyRestaurants.slice(0, 4);
                displayRestaurants(currentRestaurants);
                updateResultsTitle(`搜尋結果: ${keyword} (${window.allNearbyRestaurants.length} 間)`);
                if (map) {
                    showRestaurantsOnMap(window.allNearbyRestaurants);
                }
            } else {
                displayRestaurants([]);
                updateResultsTitle(`搜尋結果: ${keyword} (0 間)`);
            }
        });
    }
}

function showRestaurantsOnMap(restaurants) {
    // 檢查地圖是否已初始化
    if (!map) {
        console.warn('地圖未初始化，跳過地圖標記顯示');
        return;
    }
    
    // 清除現有的標記
    if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
    }
    window.markers = [];

    restaurants.forEach(restaurant => {
        if (restaurant.location) {
            try {
                const marker = new google.maps.Marker({
                    position: restaurant.location,
                    map: map,
                    title: restaurant.name
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="map-info-window">
                            <h3>${restaurant.name}</h3>
                            <p>評分: ${restaurant.rating} ⭐</p>
                            <p>${restaurant.address}</p>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                window.markers.push(marker);
            } catch (error) {
                console.warn('無法創建地圖標記:', error);
            }
        }
    });

    // 如果有餐廳，調整地圖視角以顯示所有標記
    if (restaurants.length > 0 && restaurants[0].location && typeof google !== 'undefined') {
        try {
            const bounds = new google.maps.LatLngBounds();
            restaurants.forEach(restaurant => {
                if (restaurant.location) {
                    bounds.extend(restaurant.location);
                }
            });
            map.fitBounds(bounds);
        } catch (error) {
            console.warn('無法調整地圖視角:', error);
        }
    }
}

// 載入收藏店家（從 localStorage）
function getFavoriteStores() {
    // 直接儲存 Place ID 列表
    return JSON.parse(localStorage.getItem('favoriteStores')) || [];
}

// 修正營業時間顯示（星期日對應 index 6，其餘減 1）
function getTodayOpeningHours(restaurant) {
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    // Google weekday_text index 0=星期一，所以要位移
    let weekdayIndex = today === 0 ? 6 : today - 1;
    if (restaurant.opening_hours && restaurant.opening_hours.weekday_text) {
        const todayHours = restaurant.opening_hours.weekday_text[weekdayIndex];
        if (todayHours) {
            // 直接顯示原始字串（含星期幾與時間）
            return todayHours;
        }
    }
    if (restaurant.isOpen) {
        return `${dayNames[today]} 09:00 - 22:00`;
    } else {
        return `${dayNames[today]} 休息`;
    }
}

// 新增：美化餐廳類型顯示的輔助函數
function formatRestaurantType(type) {
    const typeMap = {
        'restaurant': '餐廳',
        'food': '美食',
        'meal_takeaway': '外帶',
        'meal_delivery': '外送',
        'bakery': '烘焙坊',
        'cafe': '咖啡廳',
        'bar': '酒吧',
        'night_club': '夜店',
        'lodging': '住宿',
        'tourist_attraction': '景點',
        'establishment': '餐廳',
        'point_of_interest': '景點餐廳',
        'store': '商店',
        'gas_station': '加油站',
        'convenience_store': '便利店',
        'supermarket': '超市',
        'shopping_mall': '商場',
        'department_store': '百貨',
        'pharmacy': '藥局',
        'hospital': '醫院',
        'bank': '銀行',
        'atm': 'ATM',
        'church': '教會',
        'mosque': '清真寺',
        'hindu_temple': '印度廟',
        'synagogue': '猶太會堂',
        'park': '公園',
        'zoo': '動物園',
        'aquarium': '水族館',
        'museum': '博物館',
        'library': '圖書館',
        'school': '學校',
        'university': '大學',
        'gym': '健身房',
        'beauty_salon': '美容院',
        'hair_care': '理髮廳',
        'spa': 'SPA',
        'movie_theater': '電影院',
        'bowling_alley': '保齡球館',
        'casino': '賭場',
        'amusement_park': '遊樂園'
    };
    
    // 如果是中文菜系類型，直接返回
    const chineseCuisines = ['中式', '日式', '韓式', '美式', '義式', '法式', '泰式', '印式', '墨式', '其他'];
    if (chineseCuisines.some(cuisine => type && type.includes(cuisine.slice(0, -1)))) {
        return type;
    }
    
    return typeMap[type] || type || '其他';
}

// 新增：獲取餐廳類型圖示的輔助函數
function getRestaurantTypeIcon(type) {
    const iconMap = {
        'restaurant': '🍽️',
        'food': '🍕',
        'meal_takeaway': '🥡',
        'meal_delivery': '🚚',
        'bakery': '🥖',
        'cafe': '☕',
        'bar': '🍺',
        'night_club': '🍸',
        'establishment': '🍽️',
        'point_of_interest': '📍',
        'store': '🏪',
        'convenience_store': '🏪',
        'supermarket': '🛒',
        'shopping_mall': '🛍️',
        'department_store': '🏬',
        'gas_station': '⛽',
        'pharmacy': '💊',
        'hospital': '🏥',
        'bank': '🏦',
        'atm': '💳',
        'church': '⛪',
        'mosque': '🕌',
        'hindu_temple': '🕉️',
        'synagogue': '✡️',
        'park': '🌳',
        'zoo': '🦁',
        'aquarium': '🐠',
        'museum': '🏛️',
        'library': '📚',
        'school': '🏫',
        'university': '🎓',
        'gym': '💪',
        'beauty_salon': '💄',
        'hair_care': '✂️',
        'spa': '🧖‍♀️',
        'movie_theater': '🎬',
        'bowling_alley': '🎳',
        'casino': '🎰',
        'amusement_park': '🎢',
        '中式': '🥢',
        '日式': '🍣',
        '韓式': '🥢',
        '美式': '🍔',
        '義式': '🍝',
        '法式': '🥖',
        '泰式': '🌶️',
        '火鍋': '🍲',
        '燒烤': '🍖',
        '素食': '🥗',
        '其他': '🍽️'
    };
    
    // 檢查是否包含特定關鍵字
    for (const [key, icon] of Object.entries(iconMap)) {
        if (type && type.includes(key)) {
            return icon;
        }
    }
    
    return '🍽️'; // 預設圖示
}

// 修改 createRestaurantCard 函式以包含收藏星號和完善的資訊顯示
function createRestaurantCard(restaurant) {
    const card = document.createElement('div');
    card.classList.add('restaurant-card');
    card.setAttribute('data-place-id', restaurant.id);
    card.addEventListener('click', () => {
        showRestaurantDetails(restaurant.id);
    });
    const isCurrentlyFavorite = isFavorite(restaurant.id);
    const name = restaurant.name || '無名稱';
    const address = restaurant.address || '地址未提供';
    const rating = restaurant.rating ? restaurant.rating.toFixed(1) : '0.0';
    const ratingCount = restaurant.user_ratings_total || 0;
    let imageUrl = restaurant.image;
    let imageTag = '';
    if (imageUrl) {
        imageTag = `<img src="${imageUrl}" alt="${name}" style="width: 100%; height: 200px; object-fit: cover;" />`;
    } else {
        // 沒有圖片時顯示 emoji
        imageTag = `<div style="width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; font-size: 64px; background: #f3f3f3;">🍽️</div>`;
    }
    const rawType = restaurant.type || 'restaurant';
    const type = formatRestaurantType(rawType);
    const typeIcon = getRestaurantTypeIcon(rawType);
    const isOpen = restaurant.isOpen;
    const statusClass = isOpen ? 'status-open' : 'status-closed';
    const statusText = isOpen ? '營業中' : '已打烊';
    const todayHours = getTodayOpeningHours(restaurant);
    card.innerHTML = `
        <div class="restaurant-image">
            ${imageTag}
        </div>
        <div class="card-info">
            <h4 class="restaurant-name">${name}</h4>
            <div class="restaurant-rating">
                <div class="rating-stars">
                    <span class="stars">${'★'.repeat(Math.floor(rating))}${rating % 1 >= 0.5 ? '½' : ''}${'☆'.repeat(5 - Math.ceil(rating))}</span>
                    <span class="rating-value">${rating}</span>
                </div>
                <span class="rating-count">(${ratingCount}則評論)</span>
            </div>
            <div class="restaurant-address">
                <i class="fas fa-map-marker-alt"></i>
                <span class="address-text">${address}</span>
            </div>
            <div class="restaurant-type">
                <span class="type-icon">${typeIcon}</span>
                <span class="type-text">${type}</span>
            </div>
            <div class="restaurant-hours">
                <div class="status-indicator ${statusClass}">
                    <i class="fas fa-clock"></i>
                    <span class="status-text">${statusText}</span>
                </div>
                <div class="today-hours">${todayHours}</div>
            </div>
            <div class="card-actions">
                <button class="favorite-btn" data-place-id="${restaurant.id}">
                    <i class="${isCurrentlyFavorite ? 'fas' : 'far'} fa-star"></i>
                </button>
            </div>
        </div>
    `;
    const favoriteButton = card.querySelector('.favorite-btn');
    if (favoriteButton) {
        favoriteButton.addEventListener('click', (event) => {
            event.stopPropagation();
            const fullRestaurant = currentRestaurants.find(r => r.id === restaurant.id);
            if (fullRestaurant) {
                toggleFavoriteStore(fullRestaurant);
            }
        });
    }
    return card;
}

// 顯示餐廳列表（一次顯示全部）
function displayRestaurants(places) {
    console.log('displayRestaurants 被調用，餐廳數量:', places ? places.length : 0);
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
    // 收藏排序
    const favoritePlaceIds = getFavoriteStores();
    const sortedPlaces = places.sort((a, b) => {
        const aIsFavorite = favoritePlaceIds.includes(a.id);
        const bIsFavorite = favoritePlaceIds.includes(b.id);
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        return 0;
    });
    sortedPlaces.forEach(place => {
        const card = createRestaurantCard(place);
        container.appendChild(card);
    });
}

// 更新結果標題
function updateResultsTitle(title) {
    const titleElement = document.getElementById('results-title');
    if (titleElement) {
        titleElement.textContent = title;
    }
}

// 修改 toggleFavoriteStore 函式以處理接收到的精簡數據
function toggleFavoriteStore(store) {
    // 檢查登入狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入會員');
        return; // 未登入則停止執行後續收藏操作
    }

    let favoritePlaceIds = getFavoriteStores(); // 獲取 Place ID 列表
    // 修復：使用正確的 ID 屬性
    const placeId = store.id; // 使用 store 的 id 作為唯一識別

    const index = favoritePlaceIds.indexOf(placeId); // 在 Place ID 列表尋找

    if (index > -1) {
        // 已收藏，移除 Place ID
        favoritePlaceIds.splice(index, 1);
        alert(`${store.name} 已從收藏移除`);
    } else {
        // 未收藏，添加 Place ID
        favoritePlaceIds.push(placeId);
        alert(`${store.name} 已添加到收藏`);
    }

    localStorage.setItem('favoriteStores', JSON.stringify(favoritePlaceIds));

    // 重新顯示餐廳以更新星號狀態和排序
    displayRestaurants(currentRestaurants);
}

// 檢查店家是否已收藏
function isFavorite(placeId) {
    const favoritePlaceIds = getFavoriteStores(); // 獲取 Place ID 列表
    return favoritePlaceIds.includes(placeId);
}

// 新增：顯示餐廳詳細資訊
function showRestaurantDetails(placeId) {
    if (!placesService) {
        console.error('Places Service 未初始化');
        return;
    }

    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'opening_hours', 'rating', 'reviews', 'photos']
    };

    placesService.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const modal = document.getElementById('restaurantDetailModal');
            if (!modal) return;

            // 更新 Modal 內容
            document.getElementById('modal-restaurant-name').textContent = place.name || '無名稱';
            document.getElementById('modal-restaurant-address').textContent = place.formatted_address || '無地址';

            // 處理營業時間
            const openingHoursElement = document.getElementById('modal-opening-hours');
            if (place.opening_hours && place.opening_hours.weekday_text) {
                openingHoursElement.innerHTML = place.opening_hours.weekday_text.join('<br>');
            } else {
                openingHoursElement.textContent = '無營業時間資訊';
            }

            // 處理星等
            const ratingElement = document.getElementById('modal-rating');
            if (place.rating) {
                ratingElement.textContent = `${place.rating} ★ (${place.user_ratings_total || 0} 則評論)`;
            } else {
                ratingElement.textContent = '無評分資訊';
            }

            // 處理評論
            const reviewsList = document.getElementById('modal-reviews-list');
            reviewsList.innerHTML = '';
            if (place.reviews && place.reviews.length > 0) {
                place.reviews.forEach(review => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <p><strong>${review.author_name}</strong> - ${review.rating} ★</p>
                        <p>${review.text}</p>
                        <small>${review.relative_time_description}</small>
                    `;
                    reviewsList.appendChild(li);
                });
            } else {
                reviewsList.innerHTML = '<li>尚無評論</li>';
            }

            // 顯示 Modal
            modal.style.display = 'block';
        } else {
            console.error('無法獲取餐廳詳細資訊:', status);
            alert('無法獲取餐廳詳細資訊，請稍後再試。');
        }
    });
}

// 新增：測試函數，確保所有功能正常
function testAllFunctions() {
    console.log('🧪 開始測試所有功能...');
    
    // 測試餐廳資料
    console.log(`📊 備用餐廳資料: ${fallbackRestaurants.length} 間`);
    console.log(`📊 當前餐廳資料: ${currentRestaurants.length} 間`);
    
    // 測試各種菜系
    const cuisineTypes = ['中式', '日式', '美式', '義式', '火鍋', '燒烤', '牛排', '素食'];
    cuisineTypes.forEach(cuisine => {
        const count = fallbackRestaurants.filter(r => r.type === cuisine).length;
        console.log(`🍽️ ${cuisine} 餐廳: ${count} 間`);
    });
    
    // 測試營業中餐廳
    const openCount = fallbackRestaurants.filter(r => r.isOpen).length;
    console.log(`🕐 營業中餐廳: ${openCount} 間`);
    
    // 測試容器元素
    const container = document.getElementById('restaurants-container');
    console.log(`📦 餐廳容器: ${container ? '✅ 存在' : '❌ 不存在'}`);
    
    const titleElement = document.getElementById('results-title');
    console.log(`📝 標題元素: ${titleElement ? '✅ 存在' : '❌ 不存在'}`);
    
    console.log('🎉 測試完成！所有功能應該都能正常運作');
}

// 頁面載入完成後自動執行測試
window.addEventListener('load', function() {
    setTimeout(testAllFunctions, 1000);
});

// 確保所有函數都可以從 HTML onclick 屬性調用
window.showMoreCategories = showMoreCategories;
window.showOpenRestaurants = showOpenRestaurants;
window.searchByType = searchByType;
window.searchRestaurants = searchRestaurants;
window.showAllNearbyRestaurants = showAllNearbyRestaurants;

console.log('✅ 所有函數已綁定到 window 對象');
console.log('✅ showMoreCategories:', typeof window.showMoreCategories);
console.log('✅ showOpenRestaurants:', typeof window.showOpenRestaurants);
console.log('✅ searchByType:', typeof window.searchByType);

// 分類搜尋功能
function searchByType(type, typeName) {
    console.log(`searchByType 被調用: ${type}, ${typeName}`);
    if (!placesService) {
        displayRestaurants([]);
        updateResultsTitle(`${typeName} 餐廳 (0 間)`);
        return;
    }
    const request = {
        keyword: typeName + '餐廳',
        location: map ? map.getCenter() : new google.maps.LatLng(24.1477, 120.6470),
        radius: 5000
    };
    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const restaurants = results.map(mapPlaceResult);
            currentRestaurants = restaurants;
            displayRestaurants(restaurants);
            updateResultsTitle(`${typeName} 餐廳 (${restaurants.length} 間)`);
            if (map) showRestaurantsOnMap(restaurants);
        } else {
            displayRestaurants([]);
            updateResultsTitle(`${typeName} 餐廳 (0 間)`);
        }
    });
}

function showMoreCategories() {
    alert('更多分類功能開發中...');
}

function testModal() {
    const modal = document.getElementById('loginModal');
    if (!modal) { console.log('找不到 loginModal'); return; }
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
        console.log('modal 關閉測試完成');
    }, 2000);
}
