// ===========================================
// 全局變量聲明
// ===========================================
let currentSlide = 0;
let map, placesService;
let isMapInitialized = false;
let currentUserLocationMarker = null;
window.mapReady = false;
let pendingSearch = null;
let userLocation = null; // 用戶位置
let userCity = '台北'; // 預設城市
let mapUserLocation = null; // 地圖獲取的用戶位置

// ===========================================
// 核心功能函數 - 優先定義
// ===========================================

// 輪播圖功能
function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    currentSlide = (n + slides.length) % slides.length;
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
    
    // 更新指示點
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// 初始化輪播圖功能
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) {
        console.log('沒有找到輪播圖元素');
        return;
    }
    
    console.log('初始化輪播圖，找到', slides.length, '個滑塊');
    
    // 自動輪播
    setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    // 點擊指示點切換輪播圖
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
    
    // 初始化第一張圖片
    showSlide(0);
}

// 更多分類功能
function showMoreCategories() {
    alert('更多分類功能開發中...');
}

// 更新結果標題
function updateResultsTitle(title) {
    const titleElement = document.getElementById('results-title');
    if (titleElement) {
        titleElement.textContent = title;
        titleElement.style.display = 'block';
    }
}

// 登入彈窗功能
function initLoginModal() {
    const loginBtn = document.querySelector('.btn-login');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');

    // 檢查登入狀態並更新按鈕
    updateLoginStatus();

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('isLoggedIn') === 'true') {
                window.location.href = 'userCenter.html';
            } else {
                if (modal) modal.style.display = 'block';
            }
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // 模擬登入成功
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            modal.style.display = 'none';
            updateLoginStatus();
            window.location.href = 'userCenter.html';
        });
    }
}

function updateLoginStatus() {
    const loginBtn = document.querySelector('.btn-login');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loginBtn) {
        if (isLoggedIn) {
            loginBtn.textContent = '會員中心';
        } else {
            loginBtn.textContent = '登入';
        }
    }
}

function socialLogin(platform) {
    alert('社群登入（' + platform + '）功能尚未開放');
}

// Google Maps 與 Places API 初始化
function initMap() {
    console.log('🚀 initMap 函數被調用');
    console.log('📍 當前時間:', new Date().toLocaleTimeString());
    
    // 防止重複初始化
    if (isMapInitialized) {
        console.log('⚠️ 地圖已經初始化，跳過重複初始化');
        return;
    }
    
    try {
        // 檢查 Google Maps API 是否載入
        if (typeof google === 'undefined') {
            console.error('❌ Google Maps API 尚未載入');
            setTimeout(() => {
                console.log('🔄 重試初始化地圖...');
                initMap();
            }, 1000);
            return;
        }
        
        console.log('✅ Google Maps API 已載入');
        console.log('🔍 檢查 Places library:', typeof google.maps.places);
        
        // 檢查 DOM 元素是否存在
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('❌ 找不到地圖容器元素');
            setTimeout(initMap, 1000); // 1 秒後重試
            return;
        }
        
        console.log('✅ 地圖容器元素已找到');

        // 嘗試獲取使用者位置
        if (navigator.geolocation) {
            console.log('🌍 嘗試獲取使用者位置...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('✅ 成功獲取使用者位置:', position.coords);
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    createMapWithLocation(userLocation);
                },
                (error) => {
                    console.error('❌ 無法獲取位置:', error);
                    console.log('🔄 使用預設位置（台北市中心）');
                    // 使用預設位置（台北市中心）
                    const defaultLocation = { lat: 25.0330, lng: 121.5654 };
                    createMapWithLocation(defaultLocation);
                },
                {
                    timeout: 10000,
                    maximumAge: 300000,
                    enableHighAccuracy: true
                }
            );
        } else {
            console.error('❌ 瀏覽器不支援地理位置功能');
            // 使用預設位置
            const defaultLocation = { lat: 25.0330, lng: 121.5654 };
            createMapWithLocation(defaultLocation);
        }
    } catch (error) {
        console.error('❌ initMap 初始化錯誤:', error);
        // 嘗試重新初始化
        setTimeout(() => {
            console.log('🔄 5秒後嘗試重新初始化地圖...');
            isMapInitialized = false;
            initMap();
        }, 5000);
    }
}

function createMapWithLocation(location) {
    console.log('🗺️ 開始創建地圖，位置:', location);
    
    try {
        const mapElement = document.getElementById('map');
        map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: location,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        console.log('✅ 地圖對象已創建');

        // 保存地圖獲取的用戶位置到全局變數
        mapUserLocation = {
            lat: location.lat,
            lng: location.lng,
            timestamp: Date.now()
        };
        
        // 同時更新 userLocation
        userLocation = mapUserLocation;
        
        console.log('✅ 用戶位置已保存到全局變數:', mapUserLocation);

        // 添加使用者位置標記
        if (currentUserLocationMarker) {
            currentUserLocationMarker.setMap(null);
        }
        currentUserLocationMarker = new google.maps.Marker({
            position: location,
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

        console.log('✅ 使用者位置標記已添加');
        
        // 獲取城市名稱
        getCityFromCoordinates(location.lat, location.lng)
            .then(city => {
                userCity = city;
                console.log('✅ 用戶城市已更新:', userCity);
            })
            .catch(err => {
                console.log('⚠️ 無法獲取城市名稱，使用預設:', err);
            });
        
        // 初始化 Places Service
        initializePlacesService(location);
        
    } catch (error) {
        console.error('❌ 創建地圖時發生錯誤:', error);
        throw error;
    }
}

function initializePlacesService(location) {
    console.log('🔧 開始初始化 Places Service...');
    
    // 檢查 Places library 是否可用
    if (typeof google === 'undefined' || typeof google.maps.places === 'undefined') {
        console.error('❌ Google Maps Places Library 未載入');
        setTimeout(() => {
            console.log('🔄 重試初始化 Places Service...');
            initializePlacesService(location);
        }, 2000);
        return;
    }
    
    try {
        console.log('📍 創建 Places Service...');
        placesService = new google.maps.places.PlacesService(map);
        console.log('✅ Places Service 已創建:', placesService);

        // 測試 Places Service 是否正常工作
        console.log('🧪 測試 Places Service...');
        const testRequest = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 500,
            type: ['restaurant']
        };
        
        placesService.nearbySearch(testRequest, (results, status) => {
            console.log('🧪 Places Service 測試結果:');
            console.log('  - 狀態:', status);
            console.log('  - 結果數量:', results ? results.length : 0);
            
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('✅ Places Service 工作正常！');
                
                // 標記初始化完成
                isMapInitialized = true;
                window.mapReady = true;
                
                console.log('🎉 地圖和 Places Service 初始化完成！');
                
                // 如果有等待中的分類搜尋，立即執行
                if (pendingSearch) {
                    console.log('🚀 執行等待中的搜尋:', pendingSearch);
                    setTimeout(() => {
                        searchByType(pendingSearch.type, pendingSearch.typeName);
                        pendingSearch = null;
                    }, 500);
                }
                
                // 自動搜尋附近餐廳
                console.log('🔍 開始搜尋附近餐廳...');
                searchNearbyRestaurants(location.lat, location.lng);
                
            } else {
                console.error('❌ Places Service 測試失敗:', status);
                console.log('🔄 3秒後重試 Places Service 初始化...');
                setTimeout(() => {
                    initializePlacesService(location);
                }, 3000);
            }
        });
        
    } catch (error) {
        console.error('❌ 初始化 Places Service 時發生錯誤:', error);
        setTimeout(() => {
            console.log('🔄 重試初始化 Places Service...');
            initializePlacesService(location);
        }, 2000);
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
    if (!placesService) return;
    
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: 5000,
        type: ['restaurant']
    };
    
    placesService.nearbySearch(request, async (results, status) => {
        console.log('附近餐廳搜尋 - API 回傳 results:', results);
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            // 補抓沒有照片的餐廳
            const mapped = await Promise.all(results.slice(0, 8).map(place => {
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
            displayRestaurants(mapped);
            updateResultsTitle('附近推薦餐廳');
        } else {
            displayRestaurants([]);
            updateResultsTitle('搜尋失敗，請檢查網路連線或稍後再試');
        }
    });
}

// 添加狀態消息解釋
function getPlacesStatusMessage(status) {
    const statusMessages = {
        'OK': '成功',
        'ZERO_RESULTS': '沒有結果',
        'OVER_QUERY_LIMIT': '超過查詢限制',
        'REQUEST_DENIED': '請求被拒絕',
        'INVALID_REQUEST': '無效請求',
        'UNKNOWN_ERROR': '未知錯誤'
    };
    return statusMessages[status] || status;
}

// 備用搜尋方法
function fallbackSearch(typeName) {
    console.log('執行備用搜尋:', typeName);
    
    const fallbackRequest = {
        location: map ? map.getCenter() : new google.maps.LatLng(25.0330, 121.5654),
        radius: 5000,
        type: ['restaurant', 'food', 'meal_takeaway']
    };
    
    console.log('備用搜尋請求:', fallbackRequest);
    
    placesService.nearbySearch(fallbackRequest, (results, status) => {
        console.log('備用搜尋結果:', status, results ? results.length : 0);
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            // 過濾包含關鍵字的餐廳
            const filtered = results.filter(place => 
                place.name.toLowerCase().includes(typeName.toLowerCase()) ||
                (place.types && place.types.some(t => t.includes('restaurant')))
            );
            
            console.log('過濾後的結果:', filtered.length);
            
            if (filtered.length > 0) {
                const restaurants = filtered.slice(0, 6).map(mapPlaceResult);
                displayRestaurants(restaurants);
                updateResultsTitle(`${typeName} 相關餐廳 (${restaurants.length} 間)`);
            } else {
                // 如果過濾後沒有結果，顯示一般餐廳
                const restaurants = results.slice(0, 6).map(mapPlaceResult);
                displayRestaurants(restaurants);
                updateResultsTitle(`附近餐廳 (${restaurants.length} 間)`);
            }
        } else {
            console.error('備用搜尋也失敗');
            displayRestaurants([]);
            updateResultsTitle(`搜尋 ${typeName} 餐廳失敗，請稍後再試`);
        }
    });
}

// 獲取用戶當前位置
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (userLocation) {
            console.log('✅ 使用已緩存的用戶位置:', userLocation);
            resolve(userLocation);
            return;
        }
        
        if (!navigator.geolocation) {
            console.log('❌ 瀏覽器不支援地理位置');
            reject(new Error('瀏覽器不支援地理位置'));
            return;
        }
        
        console.log('🌍 正在獲取用戶位置...');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                
                console.log('✅ 成功獲取用戶位置:', userLocation);
                
                // 反向地理編碼獲取城市名稱
                getCityFromCoordinates(userLocation.lat, userLocation.lng)
                    .then(city => {
                        userCity = city;
                        console.log('✅ 用戶城市:', userCity);
                    })
                    .catch(err => {
                        console.log('⚠️ 無法獲取城市名稱，使用預設:', err);
                    });
                
                resolve(userLocation);
            },
            (error) => {
                console.error('❌ 獲取位置失敗:', error.message);
                
                // 提供詳細的錯誤信息
                let errorMsg = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '用戶拒絕了位置權限請求';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '位置資訊不可用';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '獲取位置超時';
                        break;
                    default:
                        errorMsg = '未知的位置錯誤';
                        break;
                }
                
                console.log('📍 位置錯誤詳細:', errorMsg);
                reject(new Error(errorMsg));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000 // 5分鐘內的緩存位置可接受
            }
        );
    });
}

// 根據座標獲取城市名稱
async function getCityFromCoordinates(lat, lng) {
    try {
        if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
            const geocoder = new google.maps.Geocoder();
            const response = await new Promise((resolve, reject) => {
                geocoder.geocode(
                    { location: { lat, lng } },
                    (results, status) => {
                        if (status === 'OK' && results[0]) {
                            resolve(results);
                        } else {
                            reject(new Error('Geocoding failed'));
                        }
                    }
                );
            });
            
            // 從結果中提取城市名稱
            for (const result of response) {
                for (const component of result.address_components) {
                    if (component.types.includes('locality') || 
                        component.types.includes('administrative_area_level_1')) {
                        return component.long_name;
                    }
                }
            }
        }
        
        return '台北'; // 預設值
    } catch (error) {
        console.log('Geocoding 錯誤:', error);
        return '台北'; // 預設值
    }
}

// 顯示位置狀態給用戶
function showLocationStatus(message, isSuccess = true) {
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        const color = isSuccess ? 'green' : 'orange';
        diagnosticDiv.innerHTML += `<div style="color: ${color};">📍 ${message}</div>`;
    }
}

// 分類搜尋功能 - 核心函數（修正版，使用地圖已獲取的位置）
function searchByType(type, typeName) {
    console.log('🔥 searchByType 函數被調用！');
    console.log('參數:', { type, typeName });
    console.log('地圖用戶位置:', mapUserLocation);
    console.log('全局用戶位置:', userLocation);
    
    // 檢查基本 API 可用性
    if (typeof google === 'undefined' || typeof google.maps.places === 'undefined') {
        console.log('⏳ Google Places API 尚未載入，等待中...');
        
        const container = document.getElementById('restaurants-container');
        if (container) {
            container.innerHTML = '<div class="loading-message">🔄 API 載入中，請稍候...</div>';
            updateResultsTitle('正在載入 API...');
        }
        
        // 延長等待時間並重試
        setTimeout(() => searchByType(type, typeName), 2000);
        return;
    }
    
    console.log('✅ 開始智能搜尋:', typeName);
    
    // 顯示搜尋中的消息
    const container = document.getElementById('restaurants-container');
    if (container) {
        container.innerHTML = '<div class="loading-message">🔍 正在搜尋中，請稍候...</div>';
        updateResultsTitle(`搜尋 ${typeName} 餐廳中...`);
    }
    
    // 優先使用地圖已獲取的位置
    if (mapUserLocation && isMapInitialized) {
        console.log('✅ 使用地圖已獲取的用戶位置進行搜尋');
        performDirectLocationSearch(typeName, mapUserLocation, container);
    } else if (userLocation) {
        console.log('✅ 使用全局用戶位置進行搜尋');
        performDirectLocationSearch(typeName, userLocation, container);
    } else {
        console.log('⚠️ 沒有用戶位置，使用定位重試策略');
        performLocationRetrySearch(typeName, container);
    }
}

// 新增：直接使用已獲取位置進行搜尋
async function performDirectLocationSearch(typeName, location, container) {
    console.log('🎯 直接位置搜尋:', typeName, location);
    
    try {
        const service = await getReliableSearchService();
        
        console.log('📍 執行位置搜尋...');
        
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 3000, // 3公里範圍
            type: ['restaurant'],
            keyword: typeName
        };
        
        console.log('📋 搜尋請求:', request);
        
        // 設置超時
        const searchTimeout = setTimeout(() => {
            console.log('⚠️ 直接位置搜尋超時，嘗試文字搜尋');
            performQuickTextSearch(typeName, userCity, container);
        }, 8000);
        
        service.nearbySearch(request, async (results, status) => {
            clearTimeout(searchTimeout);
            
            console.log('🎯 直接位置搜尋結果:', status, results ? results.length : 0);
            
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                console.log('✅ 直接位置搜尋成功！');
                
                // 獲取詳細資訊
                const detailedResults = await getDetailedRestaurantInfo(results.slice(0, 8), service);
                
                displayRestaurants(detailedResults);
                updateResultsTitle(`附近的 ${typeName} (${detailedResults.length} 間)`);
                
                // 在地圖上顯示搜尋結果標記
                showRestaurantsOnMap(detailedResults);
                
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.log('⚠️ 附近沒有找到結果，嘗試擴大搜尋範圍');
                
                // 擴大搜尋範圍再試一次
                const expandedRequest = {
                    location: new google.maps.LatLng(location.lat, location.lng),
                    radius: 5000, // 擴大到5公里
                    type: ['restaurant'],
                    keyword: typeName
                };
                
                service.nearbySearch(expandedRequest, (expandedResults, expandedStatus) => {
                    if (expandedStatus === google.maps.places.PlacesServiceStatus.OK && expandedResults && expandedResults.length > 0) {
                        console.log('✅ 擴大搜尋成功！');
                        const restaurants = expandedResults.slice(0, 8).map(mapPlaceResult);
                        displayRestaurants(restaurants);
                        updateResultsTitle(`附近的 ${typeName} (${restaurants.length} 間) - 擴大搜尋`);
                        showRestaurantsOnMap(restaurants);
                    } else {
                        console.log('⚠️ 擴大搜尋也無結果，嘗試文字搜尋');
                        performQuickTextSearch(typeName, userCity, container);
                    }
                });
                
            } else {
                console.error('❌ 直接位置搜尋失敗:', status);
                console.log('🔄 降級到文字搜尋');
                performQuickTextSearch(typeName, userCity, container);
            }
        });
        
    } catch (error) {
        console.error('❌ 直接位置搜尋錯誤:', error);
        console.log('🔄 降級到文字搜尋');
        performQuickTextSearch(typeName, userCity, container);
    }
}

// 新增：在地圖上顯示餐廳標記
function showRestaurantsOnMap(restaurants) {
    if (!map) return;
    
    console.log('🗺️ 在地圖上顯示餐廳標記:', restaurants.length);
    
    // 清除之前的餐廳標記（但保留用戶位置標記）
    if (window.restaurantMarkers) {
        window.restaurantMarkers.forEach(marker => marker.setMap(null));
    }
    window.restaurantMarkers = [];
    
    const bounds = new google.maps.LatLngBounds();
    
    // 添加用戶位置到邊界
    if (mapUserLocation) {
        bounds.extend(new google.maps.LatLng(mapUserLocation.lat, mapUserLocation.lng));
    }
    
    // 為每個餐廳添加標記
    restaurants.forEach((restaurant, index) => {
        if (restaurant.location) {
            const position = typeof restaurant.location.lat === 'function' 
                ? new google.maps.LatLng(restaurant.location.lat(), restaurant.location.lng())
                : new google.maps.LatLng(restaurant.location.lat, restaurant.location.lng);
            
            const marker = new google.maps.Marker({
                position: position,
                map: map,
                title: restaurant.name,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: "#FF5722",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2,
                },
                label: {
                    text: (index + 1).toString(),
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold"
                }
            });
            
            // 添加點擊事件
            marker.addListener('click', () => {
                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div style="padding: 10px;">
                            <h4>${restaurant.name}</h4>
                            <p>評分: ${restaurant.rating} ⭐</p>
                            <p>${restaurant.address}</p>
                        </div>
                    `
                });
                infoWindow.open(map, marker);
            });
            
            window.restaurantMarkers.push(marker);
            bounds.extend(position);
        }
    });
    
    // 調整地圖視野以包含所有標記
    if (restaurants.length > 0) {
        map.fitBounds(bounds);
        
        // 確保最小縮放等級
        const listener = google.maps.event.addListener(map, "idle", function() {
            if (map.getZoom() > 16) map.setZoom(16);
            google.maps.event.removeListener(listener);
        });
    }
}

// 新的定位重試搜尋策略 - 定位失敗時自動重新載入頁面
async function performLocationRetrySearch(typeName, container) {
    let searchCompleted = false;
    let retryCount = sessionStorage.getItem('locationRetryCount') || 0;
    retryCount = parseInt(retryCount);
    
    console.log('🚀 啟動定位重試搜尋策略，重試次數：', retryCount);
    
    // 如果已經重試超過2次，則使用預設搜尋
    if (retryCount >= 2) {
        console.log('⚠️ 已達到最大重試次數，使用預設搜尋');
        sessionStorage.removeItem('locationRetryCount');
        sessionStorage.removeItem('pendingSearchType');
        performFallbackSearch(typeName, container);
        return;
    }
    
    try {
        // 保存當前搜尋類型，以便重新載入後繼續搜尋
        sessionStorage.setItem('pendingSearchType', typeName);
        
        console.log('📍 嘗試獲取用戶位置...');
        
        const locationPromise = getUserLocationImproved()
            .then(location => {
                if (!searchCompleted) {
                    console.log('✅ 獲取位置成功，執行位置搜尋');
                    // 清除重試計數器
                    sessionStorage.removeItem('locationRetryCount');
                    sessionStorage.removeItem('pendingSearchType');
                    return performRobustLocationSearch(typeName, location, container);
                }
            })
            .catch(error => {
                console.log('⚠️ 位置獲取失敗:', error.message);
                
                if (!searchCompleted) {
                    searchCompleted = true;
                    
                    // 增加重試計數
                    retryCount++;
                    sessionStorage.setItem('locationRetryCount', retryCount.toString());
                    
                    console.log('🔄 定位失敗，即將重新載入頁面進行第', retryCount, '次重試');
                    
                    // 顯示重新載入訊息
                    if (container) {
                        container.innerHTML = `<div class="loading-message">📍 定位失敗，正在重新載入頁面進行第${retryCount}次重試...</div>`;
                        updateResultsTitle('正在重新定位...');
                    }
                    
                    // 3秒後重新載入頁面
                    setTimeout(() => {
                        console.log('🔄 開始重新載入頁面...');
                        window.location.reload();
                    }, 3000);
                }
                
                return null;
            });
        
        // 10秒後如果仍未成功，直接重新載入
        setTimeout(() => {
            if (!searchCompleted) {
                console.log('⏰ 定位超時，重新載入頁面');
                searchCompleted = true;
                
                retryCount++;
                sessionStorage.setItem('locationRetryCount', retryCount.toString());
                
                if (container) {
                    container.innerHTML = '<div class="loading-message">📍 定位超時，正在重新載入頁面...</div>';
                    updateResultsTitle('正在重新定位...');
                }
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }, 10000);
        
        await locationPromise;
        
    } catch (error) {
        console.error('❌ 定位重試過程錯誤:', error);
        if (!searchCompleted) {
            searchCompleted = true;
            performFallbackSearch(typeName, container);
        }
    }
}

// 改進的用戶定位函數 - 更長超時時間
function getUserLocationImproved() {
    return new Promise((resolve, reject) => {
        // 檢查是否有緩存的位置（5分鐘內）
        if (userLocation && userLocation.timestamp) {
            const now = Date.now();
            const cacheAge = now - userLocation.timestamp;
            if (cacheAge < 300000) { // 5分鐘
                console.log('✅ 使用緩存位置');
                resolve(userLocation);
                return;
            }
        }
        
        if (!navigator.geolocation) {
            reject(new Error('瀏覽器不支援地理位置'));
            return;
        }
        
        console.log('🌍 正在獲取用戶位置（延長超時）...');
        
        const timeoutId = setTimeout(() => {
            reject(new Error('定位超時（10秒）'));
        }, 10000); // 延長到10秒
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: Date.now()
                };
                console.log('✅ 成功獲取用戶位置:', userLocation);
                resolve(userLocation);
            },
            (error) => {
                clearTimeout(timeoutId);
                let errorMsg = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = '用戶拒絕了位置權限';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = '位置資訊不可用';
                        break;
                    case error.TIMEOUT:
                        errorMsg = '定位請求超時';
                        break;
                    default:
                        errorMsg = '未知的定位錯誤';
                        break;
                }
                console.log('❌ 定位失敗:', errorMsg);
                reject(new Error(errorMsg));
            },
            {
                enableHighAccuracy: false, // 降低精度要求提升速度
                timeout: 9000, // 內部超時9秒
                maximumAge: 300000 // 接受5分鐘內的緩存
            }
        );
    });
}

// 強化的位置搜尋函數
async function performRobustLocationSearch(typeName, location, container) {
    try {
        const service = await getReliableSearchService();
        
        console.log('🎯 執行強化位置搜尋...');
        
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 3000, // 擴大搜尋範圍到3公里
            type: ['restaurant'],
            keyword: typeName
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.log('⚠️ 位置搜尋超時，將嘗試其他方式');
                reject(new Error('位置搜尋超時'));
            }, 12000); // 12秒超時
            
            service.nearbySearch(request, async (results, status) => {
                clearTimeout(timeout);
                
                console.log('🎯 位置搜尋結果:', status, results ? results.length : 0);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const restaurants = results.slice(0, 8).map(mapPlaceResult);
                    displayRestaurants(restaurants);
                    updateResultsTitle(`附近的 ${typeName} 餐廳 (${restaurants.length} 間)`);
                    resolve(restaurants);
                } else {
                    console.log('⚠️ 位置搜尋無結果，嘗試文字搜尋');
                    reject(new Error('位置搜尋無結果'));
                }
            });
        });
        
    } catch (error) {
        console.error('❌ 位置搜尋錯誤:', error);
        throw error;
    }
}

// 強化的文字搜尋函數
async function performRobustTextSearch(typeName, cityName, container) {
    try {
        const service = await getReliableSearchService();
        
        console.log('📝 執行強化文字搜尋...');
        
        const searchQuery = `${cityName} ${typeName} 餐廳`;
        const request = {
            query: searchQuery,
            fields: ['place_id', 'name', 'rating', 'user_ratings_total', 'vicinity', 'formatted_address', 'opening_hours', 'photos', 'types', 'geometry']
        };
        
        console.log('📋 文字搜尋請求:', searchQuery);
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                console.error('❌ 文字搜尋超時');
                reject(new Error('文字搜尋超時'));
            }, 15000); // 15秒超時
            
            service.textSearch(request, (results, status) => {
                clearTimeout(timeout);
                
                console.log('🎯 文字搜尋結果:', status, results ? results.length : 0);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const restaurants = results.slice(0, 8).map(mapPlaceResult);
                    displayRestaurants(restaurants);
                    updateResultsTitle(`${cityName} ${typeName} 餐廳 (${restaurants.length} 間)`);
                    resolve(restaurants);
                } else if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayRestaurants([]);
                    updateResultsTitle(`${typeName} 餐廳 (0 間)`);
                    resolve([]);
                } else {
                    console.error('❌ 文字搜尋失敗，狀態:', status);
                    reject(new Error(`文字搜尋失敗: ${status}`));
                }
            });
        });
        
    } catch (error) {
        console.error('❌ 文字搜尋錯誤:', error);
        throw error;
    }
}

// 最後備用搜尋（當所有其他方法都失敗時）
async function performFallbackSearch(typeName, container) {
    console.log('🔧 執行最後備用搜尋...');
    
    try {
        const service = await getReliableSearchService();
        
        // 使用最簡單的搜尋請求
        const request = {
            query: `${typeName} 餐廳 台北`,
            fields: ['place_id', 'name', 'rating', 'vicinity', 'photos']
        };
        
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                console.log('⚠️ 備用搜尋也超時，顯示無結果');
                if (container) {
                    container.innerHTML = '<div class="error-message">搜尋超時，請檢查網路連線或稍後重試</div>';
                    updateResultsTitle('搜尋失敗');
                }
                resolve(null);
            }, 10000);
            
            service.textSearch(request, (results, status) => {
                clearTimeout(timeout);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    console.log('✅ 備用搜尋成功');
                    const restaurants = results.slice(0, 6).map(mapPlaceResult);
                    displayRestaurants(restaurants);
                    updateResultsTitle(`${typeName} 餐廳 (${restaurants.length} 間)`);
                    resolve(restaurants);
                } else {
                    console.log('❌ 備用搜尋也失敗');
                    if (container) {
                        container.innerHTML = '<div class="error-message">暫時無法搜尋，請稍後重試</div>';
                        updateResultsTitle('搜尋暫時不可用');
                    }
                    resolve(null);
                }
            });
        });
        
    } catch (error) {
        console.error('❌ 備用搜尋錯誤:', error);
        if (container) {
            container.innerHTML = '<div class="error-message">搜尋發生錯誤，請重新整理頁面</div>';
            updateResultsTitle('搜尋錯誤');
        }
        return null;
    }
}

// 獲取可靠的搜尋服務
async function getReliableSearchService() {
    // 優先使用主要的 Places Service
    if (placesService && map) {
        return placesService;
    }
    
    // 如果主服務不可用，創建臨時服務
    console.log('🔧 創建臨時搜尋服務...');
    
    let tempDiv = document.getElementById('reliable-search-map');
    if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = 'reliable-search-map';
        tempDiv.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;visibility:hidden;';
        document.body.appendChild(tempDiv);
    }
    
    const tempMap = new google.maps.Map(tempDiv, {
        zoom: 10,
        center: userLocation || { lat: 25.0330, lng: 121.5654 }
    });
    
    return new google.maps.places.PlacesService(tempMap);
}

// 測試點擊功能
function testClick() {
    console.log('🖱️ 測試點擊功能');
    searchByType('restaurant', '測試');
}

// 測試真實 API 搜尋功能
function testAPISearch() {
    console.log('🧪 測試真實 API 搜尋功能');
    console.log('地圖準備狀態:', window.mapReady);
    console.log('Places Service:', placesService);
    
    if (!window.mapReady || !placesService) {
        console.error('❌ 地圖或 Places Service 未準備好');
        return;
    }
    
    console.log('📍 開始測試簡單餐廳搜尋...');
    
    const testRequest = {
        location: map.getCenter(),
        radius: 2000,
        type: ['restaurant']
    };
    
    console.log('測試請求:', testRequest);
    
    placesService.nearbySearch(testRequest, (results, status) => {
        console.log('=== API 測試結果 ===');
        console.log('狀態:', status);
        console.log('結果數量:', results ? results.length : 0);
        console.log('前3個結果:', results ? results.slice(0, 3) : []);
        console.log('================');
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            console.log('✅ API 搜尋功能正常！');
            const restaurants = results.slice(0, 4).map(mapPlaceResult);
            displayRestaurants(restaurants);
            updateResultsTitle(`API 測試結果 (${restaurants.length} 間餐廳)`);
        } else {
            console.error('❌ API 搜尋失敗:', getPlacesStatusMessage(status));
        }
    });
}

// 測試餐廳顯示功能
function testRestaurantDisplay() {
    const fakeRestaurants = [
        {
            id: 'test1',
            name: '測試餐廳 1',
            rating: 4.5,
            address: '台北市信義區',
            isOpen: true,
            user_ratings_total: 150,
            image: null
        },
        {
            id: 'test2',
            name: '測試餐廳 2',
            rating: 4.2,
            address: '台北市大安區',
            isOpen: false,
            user_ratings_total: 89,
            image: null
        }
    ];
    
    console.log('使用假資料測試餐廳顯示...');
    displayRestaurants(fakeRestaurants);
    updateResultsTitle('測試餐廳顯示');
}

function displayRestaurants(places) {
    console.log('displayRestaurants 被調用，餐廳數量:', places ? places.length : 0);
    
    let container = document.getElementById('restaurants-container');
    
    if (!container) {
        console.error('❌ 找不到餐廳容器 #restaurants-container');
        return;
    }
    
    console.log('✅ 找到餐廳容器');
    
    // 清空容器
    container.innerHTML = '';
    
    // 確保容器可見
    container.style.display = 'grid';
    container.style.visibility = 'visible';
    
    if (!places || places.length === 0) {
        container.innerHTML = '<div class="no-results">沒有找到相關的餐廳，請嘗試其他分類</div>';
        console.log('顯示無結果信息');
        return;
    }
    
    // 排序：將被收藏的餐廳放在最前面
    const sortedPlaces = places.sort((a, b) => {
        const aIsFavorite = isFavorite(a.id);
        const bIsFavorite = isFavorite(b.id);
        
        // 被收藏的排在前面
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        
        // 如果都被收藏或都未被收藏，按評分排序（高分在前）
        const aRating = parseFloat(a.rating) || 0;
        const bRating = parseFloat(b.rating) || 0;
        return bRating - aRating;
    });
    
    console.log('餐廳已按收藏狀態和評分排序');
    console.log('開始創建餐廳卡片...');
    
    sortedPlaces.forEach((place, index) => {
        try {
            console.log(`創建餐廳卡片 ${index + 1}:`, place.name);
            
            const name = place.name || '無名稱';
            const address = place.address || '地址未提供';
            const rating = place.rating ? place.rating.toFixed(1) : '0.0';
            const ratingCount = place.user_ratings_total || 0;
            const imageUrl = place.image || 'https://via.placeholder.com/400x300?text=餐廳圖片';
            
            // 餐廳類型處理
            const rawType = place.type || 'restaurant';
            const formattedType = formatRestaurantType(rawType);
            const typeIcon = getRestaurantTypeIcon(rawType);
            
            // 營業狀態
            const isOpen = place.isOpen;
            const statusClass = isOpen ? 'status-open' : 'status-closed';
            const statusText = isOpen ? '營業中' : '已打烊';
            const todayHours = getTodayOpeningHours(place);
            
            // 收藏狀態
            const isCurrentlyFavorite = isFavorite(place.id);
            
            // 生成星級顯示
            const fullStars = Math.floor(parseFloat(rating));
            const hasHalfStar = (parseFloat(rating) % 1) >= 0.5;
            const emptyStars = 5 - Math.ceil(parseFloat(rating));
            const starsDisplay = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
            
            const card = document.createElement('div');
            card.className = 'restaurant-card';
            
            // 為被收藏的餐廳添加特殊樣式
            if (isCurrentlyFavorite) {
                card.classList.add('favorited');
            }
            
            card.innerHTML = `
                <div class="restaurant-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='https://via.placeholder.com/400x300?text=餐廳圖片'">
                    ${isCurrentlyFavorite ? '<div class="favorite-badge">❤️ 已收藏</div>' : ''}
                </div>
                <div class="card-info">
                    <div class="restaurant-name-container">
                        <h4 class="restaurant-name">${name}</h4>
                        <button class="favorite-btn" data-place-id="${place.id}">
                            <i class="${isCurrentlyFavorite ? 'fas' : 'far'} fa-star"></i>
                        </button>
                    </div>
                    <div class="restaurant-rating">
                        <div class="rating-stars">
                            <span class="stars">${starsDisplay}</span>
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
                        <span class="type-text">${formattedType}</span>
                    </div>
                    <div class="restaurant-hours">
                        <div class="status-indicator ${statusClass}">
                            <i class="fas fa-clock"></i>
                            <span class="status-text">${statusText}</span>
                        </div>
                        <div class="today-hours">${todayHours}</div>
                    </div>
                </div>
            `;
            
            // 添加收藏按鈕事件
            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                favoriteBtn.addEventListener('click', (event) => {
                    event.stopPropagation();
                    toggleFavoriteStore(place);
                });
            }
            
            // 添加卡片點擊事件，顯示詳細資訊彈窗
            card.addEventListener('click', (event) => {
                // 如果點擊的是收藏按鈕，不觸發卡片點擊事件
                if (event.target.closest('.favorite-btn')) {
                    return;
                }
                showRestaurantModal(place);
            });
            
            container.appendChild(card);
            console.log(`✅ 餐廳卡片 ${index + 1} 創建並添加完成`);
        } catch (error) {
            console.error('❌ 創建餐廳卡片時發生錯誤:', error, place);
        }
    });
    
    console.log('✅ 所有餐廳卡片創建完成');
    
    // 滾動到結果區域
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 測試函數 - 用來測試基本功能
function testBasicFunctionality() {
    console.log('=== 基本功能測試 ===');
    console.log('地圖狀態:', window.mapReady);
    console.log('地圖對象:', map);
    console.log('Places Service:', placesService);
    console.log('餐廳容器:', document.getElementById('restaurants-container'));
    console.log('地圖初始化狀態:', isMapInitialized);
    console.log('==================');
}

// 新增診斷測試函數
function testSystemStatus() {
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (!diagnosticDiv) {
        console.log('找不到診斷資訊面板');
        return;
    }
    
    const status = {
        現在時間: new Date().toLocaleTimeString(),
        地圖準備狀態: window.mapReady,
        地圖對象: !!map,
        Places服務: !!placesService,
        地圖初始化: isMapInitialized,
        餐廳容器: !!document.getElementById('restaurants-container'),
        searchByType函數: typeof searchByType,
        等待中的搜尋: pendingSearch,
        Google對象: typeof google,
        GooglePlaces: typeof google !== 'undefined' ? typeof google.maps.places : 'undefined'
    };
    
    let html = '<h4>🔍 系統狀態檢查結果：</h4>';
    for (const [key, value] of Object.entries(status)) {
        const icon = (value === true || value === 'function') ? '✅' : (value === false || value === 'undefined') ? '❌' : '⚪';
        html += `<div>${icon} ${key}: ${JSON.stringify(value)}</div>`;
    }
    
    // 添加建議
    html += '<h4>🎯 診斷建議：</h4>';
    if (!status.地圖準備狀態) {
        html += '<div>🔄 地圖尚未準備完成，請等待或嘗試強制測試</div>';
    }
    if (!status.Places服務) {
        html += '<div>⚠️ Places Service 未初始化</div>';
    }
    if (status.searchByType函數 === 'function') {
        html += '<div>✅ 搜尋函數可用</div>';
    }
    
    diagnosticDiv.innerHTML = html;
    console.log('系統狀態:', status);
}

function testCategoryFunction(categoryName) {
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = `<h4>🧪 測試分類搜尋: ${categoryName}</h4><div>正在測試，請查看控制台和餐廳區域...</div>`;
    }
    
    console.log(`=== 開始測試分類功能: ${categoryName} ===`);
    console.log('1. 檢查函數存在性...');
    
    if (typeof searchByType !== 'function') {
        console.error('❌ searchByType 函數不存在！');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ searchByType 函數不存在！</div>';
        }
        return;
    }
    
    console.log('2. 調用搜尋函數...');
    try {
        searchByType('restaurant', categoryName);
        console.log('✅ 搜尋函數調用成功');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ 搜尋函數調用成功，請查看餐廳區域</div>';
        }
    } catch (error) {
        console.error('❌ 搜尋函數調用失敗:', error);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ 搜尋函數調用失敗: ${error.message}</div>`;
        }
    }
}

// 強制測試函數 - 跳過地圖準備檢查
function forceTestAPI(categoryName = '餐廳') {
    console.log('🚀 === 強制測試 API (跳過地圖檢查) ===');
    
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = `<h4>🚀 強制測試: ${categoryName}</h4><div>跳過地圖準備檢查，直接測試 API...</div>`;
    }
    
    // 檢查基本要素
    if (typeof google === 'undefined') {
        console.error('❌ Google Maps API 未載入');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Maps API 未載入</div>';
        }
        return;
    }
    
    if (typeof google.maps === 'undefined') {
        console.error('❌ Google Maps 核心未載入');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Maps 核心未載入</div>';
        }
        return;
    }
    
    if (typeof google.maps.places === 'undefined') {
        console.error('❌ Google Places Library 未載入');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Places Library 未載入</div>';
        }
        return;
    }
    
    console.log('✅ Google APIs 已載入');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: green;">✅ Google APIs 已載入</div>';
    }
    
    // 如果地圖不存在，創建一個簡單的地圖
    if (!map) {
        console.log('🗺️ 地圖不存在，創建臨時地圖...');
        const mapElement = document.getElementById('map');
        if (mapElement) {
            try {
                map = new google.maps.Map(mapElement, {
                    zoom: 15,
                    center: { lat: 25.0330, lng: 121.5654 }, // 台北市中心
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                });
                console.log('✅ 臨時地圖創建成功');
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += '<div style="color: green;">✅ 臨時地圖創建成功</div>';
                }
            } catch (error) {
                console.error('❌ 創建地圖失敗:', error);
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += `<div style="color: red;">❌ 創建地圖失敗: ${error.message}</div>`;
                }
                return;
            }
        } else {
            console.error('❌ 找不到地圖元素');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: red;">❌ 找不到地圖元素</div>';
            }
            return;
        }
    }
    
    // 如果 Places Service 不存在，創建一個
    if (!placesService && map) {
        console.log('🔧 創建臨時 Places Service...');
        try {
            placesService = new google.maps.places.PlacesService(map);
            console.log('✅ 臨時 Places Service 創建成功');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: green;">✅ 臨時 Places Service 創建成功</div>';
            }
        } catch (error) {
            console.error('❌ 創建 Places Service 失敗:', error);
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += `<div style="color: red;">❌ 創建 Places Service 失敗: ${error.message}</div>`;
            }
            return;
        }
    }
    
    if (!placesService) {
        console.error('❌ 無法創建 Places Service');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ 無法創建 Places Service</div>';
        }
        return;
    }
    
    // 執行強制搜尋 - 使用最簡單的參數
    console.log('🔍 執行強制搜尋...');
    const taipei = new google.maps.LatLng(25.0330, 121.5654);
    
    // 嘗試最簡單的搜尋請求
    const forceRequest = {
        location: taipei,
        radius: 1000, // 減少搜尋範圍
        type: ['restaurant'] // 只搜尋餐廳
    };
    
    console.log('📋 強制搜尋請求:', forceRequest);
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: blue;">📋 開始搜尋...</div>';
    }
    
    // 更新顯示狀態
    const container = document.getElementById('restaurants-container');
    if (container) {
        container.innerHTML = '<div class="loading-message">🚀 強制搜尋中...</div>';
        updateResultsTitle(`強制搜尋 ${categoryName}...`);
    }
    
    // 設置超時機制
    let searchTimeout = setTimeout(() => {
        console.error('❌ 搜尋超時（15秒）');
        if (container) {
            container.innerHTML = '<div class="error-message">❌ 搜尋超時，請檢查網路連線</div>';
        }
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ 搜尋超時（15秒）</div>';
        }
    }, 15000);
    
    try {
        console.log('📞 調用 Places Service nearbySearch...');
        console.log('  - placesService:', placesService);
        console.log('  - request:', forceRequest);
        
        placesService.nearbySearch(forceRequest, (results, status) => {
            clearTimeout(searchTimeout); // 清除超時
            
            console.log('🚀 === 強制搜尋回調執行 ===');
            console.log('📊 狀態:', status);
            console.log('📊 狀態類型:', typeof status);
            console.log('📈 結果:', results);
            console.log('📈 結果數量:', results ? results.length : 0);
            
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += `<div style="color: blue;">📊 搜尋回調執行，狀態: ${status}</div>`;
                diagnosticDiv.innerHTML += `<div style="color: blue;">📈 找到 ${results ? results.length : 0} 個結果</div>`;
            }
            
            // 檢查所有可能的成功狀態
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('✅ 搜尋狀態: OK');
                
                if (results && results.length > 0) {
                    console.log('✅ 強制搜尋成功！找到', results.length, '個結果');
                    console.log('📋 前3個結果:', results.slice(0, 3));
                    
                    try {
                        const restaurants = results.slice(0, 6).map(mapPlaceResult);
                        console.log('🍽️ 處理後的餐廳資料:', restaurants);
                        
                        displayRestaurants(restaurants);
                        updateResultsTitle(`強制搜尋結果: ${categoryName} (${restaurants.length} 間)`);
                        
                        if (diagnosticDiv) {
                            diagnosticDiv.innerHTML += '<div style="color: green;">✅ 強制搜尋成功，餐廳已顯示</div>';
                        }
                    } catch (processError) {
                        console.error('❌ 處理搜尋結果時發生錯誤:', processError);
                        if (diagnosticDiv) {
                            diagnosticDiv.innerHTML += `<div style="color: red;">❌ 處理結果錯誤: ${processError.message}</div>`;
                        }
                    }
                } else {
                    console.log('⚠️ 搜尋成功但沒有結果');
                    displayRestaurants([]);
                    updateResultsTitle(`強制搜尋結果: ${categoryName} (0 間)`);
                    
                    if (diagnosticDiv) {
                        diagnosticDiv.innerHTML += '<div style="color: orange;">⚠️ 搜尋成功但沒有結果</div>';
                    }
                }
            } else {
                console.error('❌ 強制搜尋失敗，狀態:', status);
                console.error('❌ 狀態說明:', getPlacesStatusMessage(status));
                
                displayRestaurants([]);
                updateResultsTitle(`強制搜尋失敗: ${getPlacesStatusMessage(status)}`);
                
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += `<div style="color: red;">❌ 搜尋失敗: ${getPlacesStatusMessage(status)}</div>`;
                    
                    // 根據錯誤類型提供建議
                    if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                        diagnosticDiv.innerHTML += '<div style="color: red;">💡 建議: 檢查 API 金鑰權限設定</div>';
                    } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                        diagnosticDiv.innerHTML += '<div style="color: red;">💡 建議: API 配額已用完</div>';
                    }
                }
            }
            
            console.log('🚀 === 強制搜尋回調結束 ===');
        });
        
        console.log('📞 nearbySearch 調用完成，等待回調...');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: blue;">📞 API 調用完成，等待回應...</div>';
        }
        
    } catch (error) {
        clearTimeout(searchTimeout);
        console.error('❌ 強制搜尋過程中發生錯誤:', error);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ 強制搜尋錯誤: ${error.message}</div>`;
        }
        
        if (container) {
            container.innerHTML = '<div class="error-message">❌ 搜尋時發生錯誤，請重新嘗試</div>';
        }
    }
}

// 最基礎的 API 連接測試
function testBasicAPIConnection() {
    console.log('🔬 === 基礎 API 連接測試 ===');
    
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = '<h4>🔬 基礎 API 連接測試</h4>';
    }
    
    // 1. 檢查 Google 對象
    console.log('1️⃣ 檢查 Google 對象...');
    if (typeof google === 'undefined') {
        console.error('❌ Google 對象不存在');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google 對象不存在</div>';
        }
        return;
    }
    console.log('✅ Google 對象存在');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: green;">✅ Google 對象存在</div>';
    }
    
    // 2. 檢查 Google Maps
    console.log('2️⃣ 檢查 Google Maps...');
    if (typeof google.maps === 'undefined') {
        console.error('❌ Google Maps 不存在');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Maps 不存在</div>';
        }
        return;
    }
    console.log('✅ Google Maps 存在');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: green;">✅ Google Maps 存在</div>';
    }
    
    // 3. 檢查 Places 庫
    console.log('3️⃣ 檢查 Places 庫...');
    if (typeof google.maps.places === 'undefined') {
        console.error('❌ Google Places 庫不存在');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Places 庫不存在</div>';
        }
        return;
    }
    console.log('✅ Google Places 庫存在');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: green;">✅ Google Places 庫存在</div>';
    }
    
    // 4. 測試 LatLng 創建
    console.log('4️⃣ 測試 LatLng 創建...');
    try {
        const testLatLng = new google.maps.LatLng(25.0330, 121.5654);
        console.log('✅ LatLng 創建成功:', testLatLng);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ LatLng 創建成功</div>';
        }
    } catch (error) {
        console.error('❌ LatLng 創建失敗:', error);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ LatLng 創建失敗: ${error.message}</div>`;
        }
        return;
    }
    
    // 5. 檢查 PlacesServiceStatus
    console.log('5️⃣ 檢查 PlacesServiceStatus...');
    try {
        const statusOK = google.maps.places.PlacesServiceStatus.OK;
        console.log('✅ PlacesServiceStatus 可存取:', statusOK);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ PlacesServiceStatus 可存取</div>';
        }
    } catch (error) {
        console.error('❌ PlacesServiceStatus 存取失敗:', error);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ PlacesServiceStatus 存取失敗: ${error.message}</div>`;
        }
        return;
    }
    
    // 6. 測試地圖創建（但不顯示）
    console.log('6️⃣ 測試隱藏地圖創建...');
    try {
        // 創建一個隱藏的div來測試地圖
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.width = '100px';
        hiddenDiv.style.height = '100px';
        hiddenDiv.style.position = 'absolute';
        hiddenDiv.style.left = '-9999px';
        document.body.appendChild(hiddenDiv);
        
        const testMap = new google.maps.Map(hiddenDiv, {
            zoom: 10,
            center: { lat: 25.0330, lng: 121.5654 }
        });
        
        console.log('✅ 隱藏地圖創建成功');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ 隱藏地圖創建成功</div>';
        }
        
        // 7. 測試 Places Service 創建
        console.log('7️⃣ 測試 Places Service 創建...');
        try {
            const testPlacesService = new google.maps.places.PlacesService(testMap);
            console.log('✅ Places Service 創建成功');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: green;">✅ Places Service 創建成功</div>';
            }
            
            // 8. 執行最簡單的搜尋測試
            console.log('8️⃣ 執行最簡單的搜尋測試...');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: blue;">🔍 執行搜尋測試...</div>';
            }
            
            const simpleRequest = {
                location: new google.maps.LatLng(25.0330, 121.5654),
                radius: 500,
                type: ['restaurant']
            };
            
            const searchTimeout = setTimeout(() => {
                console.error('❌ 基礎搜尋測試超時');
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += '<div style="color: red;">❌ 基礎搜尋測試超時</div>';
                }
                document.body.removeChild(hiddenDiv);
            }, 10000);
            
            testPlacesService.nearbySearch(simpleRequest, (results, status) => {
                clearTimeout(searchTimeout);
                console.log('🎯 基礎搜尋回調結果:');
                console.log('  - 狀態:', status);
                console.log('  - 結果數量:', results ? results.length : 0);
                
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += `<div style="color: blue;">📊 基礎搜尋狀態: ${status}</div>`;
                    diagnosticDiv.innerHTML += `<div style="color: blue;">📈 基礎搜尋結果: ${results ? results.length : 0} 個</div>`;
                }
                
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    console.log('🎉 所有基礎 API 測試通過！');
                    if (diagnosticDiv) {
                        diagnosticDiv.innerHTML += '<div style="color: green; font-weight: bold;">🎉 所有基礎 API 測試通過！</div>';
                        diagnosticDiv.innerHTML += '<div style="color: green;">💡 API 金鑰和權限正常，問題可能在地圖初始化</div>';
                    }
                } else {
                    console.error('❌ 基礎搜尋失敗:', status);
                    if (diagnosticDiv) {
                        diagnosticDiv.innerHTML += `<div style="color: red;">❌ 基礎搜尋失敗: ${status}</div>`;
                        if (status === google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
                            diagnosticDiv.innerHTML += '<div style="color: red;">💡 API 金鑰權限問題</div>';
                        } else if (status === google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
                            diagnosticDiv.innerHTML += '<div style="color: red;">💡 API 配額用完</div>';
                        }
                    }
                }
                
                // 清理測試元素
                document.body.removeChild(hiddenDiv);
            });
            
        } catch (placesError) {
            console.error('❌ Places Service 創建失敗:', placesError);
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += `<div style="color: red;">❌ Places Service 創建失敗: ${placesError.message}</div>`;
            }
            document.body.removeChild(hiddenDiv);
        }
        
    } catch (mapError) {
        console.error('❌ 隱藏地圖創建失敗:', mapError);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ 隱藏地圖創建失敗: ${mapError.message}</div>`;
        }
    }
}

// 超級簡化的文字搜尋測試
function testSimpleTextSearch() {
    console.log('🔥 === 超級簡化文字搜尋測試 ===');
    
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = '<h4>🔥 超級簡化文字搜尋測試</h4>';
    }
    
    // 檢查基本組件
    if (typeof google === 'undefined' || typeof google.maps.places === 'undefined') {
        console.error('❌ Google APIs 未準備好');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google APIs 未準備好</div>';
        }
        return;
    }
    
    // 創建最簡單的地圖和服務
    try {
        // 創建隱藏地圖
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.width = '100px';
        hiddenDiv.style.height = '100px';
        hiddenDiv.style.position = 'absolute';
        hiddenDiv.style.left = '-9999px';
        document.body.appendChild(hiddenDiv);
        
        const testMap = new google.maps.Map(hiddenDiv, {
            zoom: 10,
            center: { lat: 25.0330, lng: 121.5654 }
        });
        
        const testService = new google.maps.places.PlacesService(testMap);
        
        console.log('✅ 測試地圖和服務創建成功');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ 測試地圖和服務創建成功</div>';
        }
        
        // 嘗試文字搜尋（不依賴地理位置）
        console.log('🔍 嘗試文字搜尋...');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: blue;">🔍 嘗試文字搜尋...</div>';
        }
        
        const textSearchRequest = {
            query: '台北餐廳',
            fields: ['place_id', 'name', 'rating', 'geometry']
        };
        
        const searchTimeout = setTimeout(() => {
            console.error('❌ 文字搜尋超時');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: red;">❌ 文字搜尋超時</div>';
            }
            document.body.removeChild(hiddenDiv);
        }, 8000);
        
        testService.textSearch(textSearchRequest, (results, status) => {
            clearTimeout(searchTimeout);
            
            console.log('🎯 文字搜尋結果:');
            console.log('  - 狀態:', status);
            console.log('  - 結果數量:', results ? results.length : 0);
            
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += `<div style="color: blue;">📊 文字搜尋狀態: ${status}</div>`;
                diagnosticDiv.innerHTML += `<div style="color: blue;">📈 文字搜尋結果: ${results ? results.length : 0} 個</div>`;
            }
            
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('🎉 文字搜尋成功！');
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += '<div style="color: green; font-weight: bold;">🎉 文字搜尋成功！</div>';
                    diagnosticDiv.innerHTML += '<div style="color: green;">💡 API 完全正常，嘗試實際顯示餐廳</div>';
                }
                
                // 嘗試在真實餐廳容器中顯示結果
                if (results && results.length > 0) {
                    console.log('🍽️ 嘗試顯示真實餐廳結果...');
                    const simpleRestaurants = results.slice(0, 4).map(place => ({
                        id: place.place_id,
                        name: place.name,
                        rating: place.rating || 0,
                        address: '台北市',
                        isOpen: true,
                        user_ratings_total: 100,
                        image: null
                    }));
                    
                    displayRestaurants(simpleRestaurants);
                    updateResultsTitle(`文字搜尋測試結果 (${simpleRestaurants.length} 間餐廳)`);
                    
                    if (diagnosticDiv) {
                        diagnosticDiv.innerHTML += '<div style="color: green;">✅ 餐廳顯示測試完成</div>';
                    }
                }
                
            } else {
                console.error('❌ 文字搜尋失敗:', status);
                if (diagnosticDiv) {
                    diagnosticDiv.innerHTML += `<div style="color: red;">❌ 文字搜尋失敗: ${status}</div>`;
                }
            }
            
            document.body.removeChild(hiddenDiv);
        });
        
    } catch (error) {
        console.error('❌ 簡化搜尋測試錯誤:', error);
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += `<div style="color: red;">❌ 簡化搜尋測試錯誤: ${error.message}</div>`;
        }
    }
}

// 網路連線測試
function testNetworkConnection() {
    console.log('🌐 === 網路連線測試 ===');
    
    const diagnosticDiv = document.getElementById('diagnostic-info');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML = '<h4>🌐 網路連線測試</h4>';
    }
    
    // 測試到 Google Maps API 的連線
    const testUrl = 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=testCallback';
    
    console.log('🔗 測試 Google Maps API 連線...');
    if (diagnosticDiv) {
        diagnosticDiv.innerHTML += '<div style="color: blue;">🔗 測試 Google Maps API 連線...</div>';
    }
    
    // 創建一個測試圖片來檢查網路
    const testImg = new Image();
    testImg.onload = () => {
        console.log('✅ 網路連線正常');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: green;">✅ 網路連線正常</div>';
            diagnosticDiv.innerHTML += '<div style="color: blue;">💡 建議嘗試文字搜尋測試</div>';
        }
    };
    testImg.onerror = () => {
        console.error('❌ 網路連線問題');
        if (diagnosticDiv) {
            diagnosticDiv.innerHTML += '<div style="color: red;">❌ 網路連線問題</div>';
            diagnosticDiv.innerHTML += '<div style="color: red;">💡 請檢查防火牆或網路設定</div>';
        }
    };
    
    // 使用 Google 的 favicon 來測試連線
    testImg.src = 'https://www.google.com/favicon.ico?' + Date.now();
    
    // 也測試 Places API 的連線
    setTimeout(() => {
        if (typeof google !== 'undefined' && google.maps && google.maps.places) {
            console.log('✅ Google Places API 已載入');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: green;">✅ Google Places API 已載入</div>';
            }
        } else {
            console.error('❌ Google Places API 載入問題');
            if (diagnosticDiv) {
                diagnosticDiv.innerHTML += '<div style="color: red;">❌ Google Places API 載入問題</div>';
            }
        }
    }, 1000);
}

// 檢查並恢復待處理的搜尋請求
function checkAndResumePendingSearch() {
    const pendingSearchType = sessionStorage.getItem('pendingSearchType');
    const retryCount = sessionStorage.getItem('locationRetryCount');
    
    if (pendingSearchType) {
        console.log('🔄 檢測到待處理的搜尋請求:', pendingSearchType, '重試次數:', retryCount);
        
        // 等待地圖初始化完成後再執行搜尋
        setTimeout(() => {
            console.log('🚀 恢復搜尋:', pendingSearchType);
            searchByType('restaurant', pendingSearchType);
        }, 3000); // 給地圖初始化一些時間
    }
}

// DOM 加載完成後的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM 加載完成');
    initLoginModal();
    
    // 初始化輪播圖
    initCarousel();
    
    // 檢查是否有待處理的搜尋請求（重新載入後恢復搜尋）
    checkAndResumePendingSearch();
    
    // 等待一下再測試基本狀態
    setTimeout(testBasicFunctionality, 2000);
});

// 立即將所有核心函數綁定到全局範圍
window.initMap = initMap;
window.showSlide = showSlide;
window.showMoreCategories = showMoreCategories;
window.updateResultsTitle = updateResultsTitle;
window.mapPlaceResult = mapPlaceResult;
window.getPlacesStatusMessage = getPlacesStatusMessage;
window.fallbackSearch = fallbackSearch;
window.searchByType = searchByType;
window.testClick = testClick;
window.testAPISearch = testAPISearch;
window.testRestaurantDisplay = testRestaurantDisplay;
window.searchNearbyRestaurants = searchNearbyRestaurants;
window.initCarousel = initCarousel;
window.testSystemStatus = testSystemStatus;
window.testCategoryFunction = testCategoryFunction;
window.forceTestAPI = forceTestAPI;
window.testBasicAPIConnection = testBasicAPIConnection;
window.testSimpleTextSearch = testSimpleTextSearch;
window.testNetworkConnection = testNetworkConnection;
window.getDetailedRestaurantInfo = getDetailedRestaurantInfo;
window.getUserLocation = getUserLocation;
window.getCityFromCoordinates = getCityFromCoordinates;
window.showLocationStatus = showLocationStatus;
window.performLocationBasedSearch = performLocationBasedSearch;
window.performTextBasedSearch = performTextBasedSearch;
window.getSearchMapAndService = getSearchMapAndService;
window.getUserLocationQuick = getUserLocationQuick;
window.performLocationSearch = performLocationSearch;
window.performQuickTextSearch = performQuickTextSearch;
window.getQuickSearchService = getQuickSearchService;
// 新增的輔助函數
window.formatRestaurantType = formatRestaurantType;
window.getRestaurantTypeIcon = getRestaurantTypeIcon;
window.getTodayOpeningHours = getTodayOpeningHours;
window.isFavorite = isFavorite;
window.toggleFavoriteStore = toggleFavoriteStore;
window.displayRestaurants = displayRestaurants;
// 新增的優化搜尋函數
window.performLocationRetrySearch = performLocationRetrySearch;
window.checkAndResumePendingSearch = checkAndResumePendingSearch;
window.getUserLocationImproved = getUserLocationImproved;
window.performRobustLocationSearch = performRobustLocationSearch;
window.performRobustTextSearch = performRobustTextSearch;
window.performFallbackSearch = performFallbackSearch;
window.getReliableSearchService = getReliableSearchService;
// 新增的直接位置搜尋函數
window.performDirectLocationSearch = performDirectLocationSearch;
window.showRestaurantsOnMap = showRestaurantsOnMap;
// 新增的地圖相關函數
window.geocodeAddress = geocodeAddress;
window.isValidCoordinate = isValidCoordinate;
// 新增的營業時間功能
window.showWeeklyHoursModal = showWeeklyHoursModal;
window.closeWeeklyHoursModal = closeWeeklyHoursModal;
window.populateWeeklyHoursModal = populateWeeklyHoursModal;

console.log('✅ 所有函數已綁定到 window 對象');
console.log('✅ initMap:', typeof window.initMap);
console.log('✅ showMoreCategories:', typeof window.showMoreCategories);
console.log('✅ updateResultsTitle:', typeof window.updateResultsTitle);
console.log('✅ searchByType:', typeof window.searchByType);
console.log('✅ testClick:', typeof window.testClick);
console.log('✅ testAPISearch:', typeof window.testAPISearch);
console.log('✅ testRestaurantDisplay:', typeof window.testRestaurantDisplay);
console.log('✅ initCarousel:', typeof window.initCarousel);

// 獲取詳細餐廳資訊的輔助函數
async function getDetailedRestaurantInfo(places, service) {
    const detailedPlaces = [];
    
    for (const place of places) {
        try {
            const detailedPlace = await new Promise((resolve) => {
                // 如果已經有詳細資訊，直接使用
                if (place.photos || place.opening_hours || place.formatted_address) {
                    resolve(place);
                    return;
                }
                
                // 否則獲取詳細資訊
                service.getDetails({
                    placeId: place.place_id,
                    fields: ['name', 'formatted_address', 'opening_hours', 'rating', 'user_ratings_total', 'photos', 'types', 'geometry', 'business_status']
                }, (details, detailStatus) => {
                    if (detailStatus === google.maps.places.PlacesServiceStatus.OK && details) {
                        // 合併原始資料和詳細資料
                        resolve({
                            ...place,
                            photos: details.photos || place.photos,
                            opening_hours: details.opening_hours || place.opening_hours,
                            formatted_address: details.formatted_address || place.formatted_address,
                            rating: details.rating || place.rating,
                            user_ratings_total: details.user_ratings_total || place.user_ratings_total,
                            business_status: details.business_status || place.business_status
                        });
                    } else {
                        resolve(place); // 如果獲取詳細資訊失敗，使用原始資料
                    }
                });
            });
            
            detailedPlaces.push(mapPlaceResult(detailedPlace));
            
        } catch (error) {
            console.log('獲取詳細資訊失敗:', place.name, error);
            detailedPlaces.push(mapPlaceResult(place));
        }
    }
    
    return detailedPlaces;
}

// 快速獲取用戶位置（3秒超時）
function getUserLocationQuick() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('瀏覽器不支援地理位置'));
            return;
        }
        
        const timeoutId = setTimeout(() => {
            reject(new Error('定位超時'));
        }, 3000);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                clearTimeout(timeoutId);
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                resolve(userLocation);
            },
            (error) => {
                clearTimeout(timeoutId);
                reject(error);
            },
            {
                enableHighAccuracy: false, // 關閉高精度提升速度
                timeout: 2500,
                maximumAge: 300000 // 5分鐘緩存
            }
        );
    });
}

// 快速位置搜尋
async function performLocationSearch(typeName, location, container) {
    try {
        const service = await getQuickSearchService();
        
        const request = {
            location: new google.maps.LatLng(location.lat, location.lng),
            radius: 1500,
            type: ['restaurant'],
            keyword: typeName
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('搜尋超時')), 5000);
            
            service.nearbySearch(request, (results, status) => {
                clearTimeout(timeout);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const restaurants = results.slice(0, 6).map(mapPlaceResult);
                    displayRestaurants(restaurants);
                    updateResultsTitle(`附近 ${typeName} (${restaurants.length}間)`);
                    resolve(restaurants);
                } else {
                    reject(new Error('附近無結果'));
                }
            });
        });
    } catch (error) {
        throw error;
    }
}

// 快速文字搜尋
async function performQuickTextSearch(typeName, cityName, container) {
    try {
        const service = await getQuickSearchService();
        
        const request = {
            query: `${cityName} ${typeName} 餐廳`,
            fields: ['place_id', 'name', 'rating', 'vicinity', 'photos']
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                if (container) {
                    container.innerHTML = '<div class="error-message">搜尋超時，請重試</div>';
                }
                reject(new Error('搜尋超時'));
            }, 6000);
            
            service.textSearch(request, (results, status) => {
                clearTimeout(timeout);
                
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const restaurants = results.slice(0, 6).map(mapPlaceResult);
                    displayRestaurants(restaurants);
                    updateResultsTitle(`${cityName} ${typeName} (${restaurants.length}間)`);
                    resolve(restaurants);
                } else if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayRestaurants([]);
                    updateResultsTitle(`${typeName} (0間)`);
                    resolve([]);
                } else {
                    if (container) {
                        container.innerHTML = `<div class="error-message">搜尋失敗: ${getPlacesStatusMessage(status)}</div>`;
                    }
                    reject(new Error(`搜尋失敗: ${status}`));
                }
            });
        });
    } catch (error) {
        if (container) {
            container.innerHTML = '<div class="error-message">搜尋錯誤，請重試</div>';
        }
        throw error;
    }
}

// 快速獲取搜尋服務
async function getQuickSearchService() {
    if (placesService) {
        return placesService;
    }
    
    // 創建快速臨時服務
    let tempDiv = document.getElementById('quick-search-map');
    if (!tempDiv) {
        tempDiv = document.createElement('div');
        tempDiv.id = 'quick-search-map';
        tempDiv.style.cssText = 'width:1px;height:1px;position:absolute;left:-9999px;';
        document.body.appendChild(tempDiv);
    }
    
    const tempMap = new google.maps.Map(tempDiv, {
        zoom: 10,
        center: userLocation || { lat: 25.0330, lng: 121.5654 }
    });
    
    return new google.maps.places.PlacesService(tempMap);
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
    const chineseCuisines = ['中式', '日式', '韓式', '美式', '義式', '法式', '泰式', '印式', '墨式', '火鍋', '燒烤', '牛排', '素食'];
    if (chineseCuisines.some(cuisine => type && type.includes(cuisine))) {
        return type;
    }
    
    return typeMap[type] || type || '餐廳';
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
        '牛排': '🥩',
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

// 修正營業時間顯示
function getTodayOpeningHours(restaurant) {
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
    const dayNames = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    
    if (restaurant.opening_hours && restaurant.opening_hours.weekday_text) {
        // Google weekday_text index 0=星期一，所以要位移
        let weekdayIndex = today === 0 ? 6 : today - 1;
        const todayHours = restaurant.opening_hours.weekday_text[weekdayIndex];
        if (todayHours) {
            return todayHours;
        }
    }
    
    // 預設時間
    if (restaurant.isOpen) {
        return `${dayNames[today]} 09:00 - 22:00`;
    } else {
        return `${dayNames[today]} 休息`;
    }
}

// 檢查店家是否已收藏
function isFavorite(placeId) {
    const favoritePlaceIds = JSON.parse(localStorage.getItem('favoriteStores')) || [];
    return favoritePlaceIds.includes(placeId);
}

// 重新排序當前顯示的餐廳列表
function refreshCurrentRestaurantList() {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    
    const restaurantCards = Array.from(container.querySelectorAll('.restaurant-card'));
    if (restaurantCards.length === 0) return;
    
    // 提取餐廳資料並重新排序
    const restaurantData = restaurantCards.map(card => {
        const nameElement = card.querySelector('.restaurant-name');
        const placeIdElement = card.querySelector('[data-place-id]');
        const ratingElement = card.querySelector('.rating-value');
        
        return {
            element: card,
            placeId: placeIdElement ? placeIdElement.dataset.placeId : '',
            name: nameElement ? nameElement.textContent : '',
            rating: ratingElement ? parseFloat(ratingElement.textContent) || 0 : 0
        };
    });
    
    // 排序：收藏的在前面，然後按評分排序
    restaurantData.sort((a, b) => {
        const aIsFavorite = isFavorite(a.placeId);
        const bIsFavorite = isFavorite(b.placeId);
        
        if (aIsFavorite && !bIsFavorite) return -1;
        if (!aIsFavorite && bIsFavorite) return 1;
        
        return b.rating - a.rating;
    });
    
    // 重新排列DOM元素
    restaurantData.forEach(data => {
        container.appendChild(data.element);
    });
    
    console.log('餐廳列表已重新排序');
}

// 收藏功能
function toggleFavoriteStore(restaurant) {
    // 檢查登入狀態
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入會員才能使用收藏功能');
        return;
    }

    let favoritePlaceIds = JSON.parse(localStorage.getItem('favoriteStores')) || [];
    const placeId = restaurant.id;
    const index = favoritePlaceIds.indexOf(placeId);

    if (index > -1) {
        // 已收藏，移除
        favoritePlaceIds.splice(index, 1);
        alert(`${restaurant.name} 已從收藏移除`);
    } else {
        // 未收藏，添加
        favoritePlaceIds.push(placeId);
        alert(`${restaurant.name} 已添加到收藏`);
    }

    localStorage.setItem('favoriteStores', JSON.stringify(favoritePlaceIds));
    
    // 更新收藏按鈕狀態
    const favoriteBtn = document.querySelector(`[data-place-id="${placeId}"]`);
    if (favoriteBtn) {
        const icon = favoriteBtn.querySelector('i');
        if (icon) {
            icon.className = isFavorite(placeId) ? 'fas fa-star' : 'far fa-star';
        }
        
        // 更新卡片的收藏樣式
        const restaurantCard = favoriteBtn.closest('.restaurant-card');
        if (restaurantCard) {
            const restaurantImage = restaurantCard.querySelector('.restaurant-image');
            const existingBadge = restaurantCard.querySelector('.favorite-badge');
            
            if (isFavorite(placeId)) {
                // 添加收藏樣式
                restaurantCard.classList.add('favorited');
                // 添加收藏標記
                if (!existingBadge && restaurantImage) {
                    const badge = document.createElement('div');
                    badge.className = 'favorite-badge';
                    badge.innerHTML = '❤️ 已收藏';
                    restaurantImage.appendChild(badge);
                }
            } else {
                // 移除收藏樣式
                restaurantCard.classList.remove('favorited');
                // 移除收藏標記
                if (existingBadge) {
                    existingBadge.remove();
                }
            }
        }
    }
    
         // 重新獲取當前顯示的餐廳列表，並重新排序顯示
     setTimeout(() => {
         refreshCurrentRestaurantList();
     }, 300);
}

// 顯示餐廳詳細資訊彈窗
function showRestaurantModal(restaurant) {
    const modal = document.getElementById('restaurantModal');
    if (!modal) return;
    
    // 填充餐廳資訊
    document.getElementById('modal-restaurant-name').textContent = restaurant.name || '無名稱';
    document.getElementById('modal-restaurant-img').src = restaurant.image || 'https://via.placeholder.com/400x300?text=餐廳圖片';
    document.getElementById('modal-address').textContent = restaurant.address || '地址未提供';
    
    // 評分資訊
    const rating = restaurant.rating ? restaurant.rating.toFixed(1) : '0.0';
    const ratingCount = restaurant.user_ratings_total || 0;
    const fullStars = Math.floor(parseFloat(rating));
    const hasHalfStar = (parseFloat(rating) % 1) >= 0.5;
    const emptyStars = 5 - Math.ceil(parseFloat(rating));
    const starsDisplay = '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
    
    document.getElementById('modal-stars').textContent = starsDisplay;
    document.getElementById('modal-rating').textContent = rating;
    document.getElementById('modal-rating-count').textContent = `(${ratingCount}則評論)`;
    
    // 類型資訊
    const rawType = restaurant.type || 'restaurant';
    const formattedType = formatRestaurantType(rawType);
    const typeIcon = getRestaurantTypeIcon(rawType);
    document.getElementById('modal-type-icon').textContent = typeIcon;
    document.getElementById('modal-type-text').textContent = formattedType;
    
    // 營業狀態
    const isOpen = restaurant.isOpen;
    const statusElement = document.getElementById('modal-status');
    const statusClass = isOpen ? 'status-open' : 'status-closed';
    const statusText = isOpen ? '營業中' : '已打烊';
    statusElement.className = `modal-status ${statusClass}`;
    statusElement.querySelector('.modal-status-text').textContent = statusText;
    
    const todayHours = getTodayOpeningHours(restaurant);
    document.getElementById('modal-today-hours').textContent = todayHours;
    
    // 營業時間現在使用彈窗顯示，不需要預先初始化
    
    // 收藏按鈕
    const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
    const isCurrentlyFavorite = isFavorite(restaurant.id);
    
    modalFavoriteBtn.className = `modal-favorite-btn ${isCurrentlyFavorite ? 'favorited' : ''}`;
    modalFavoriteBtn.innerHTML = `<i class="${isCurrentlyFavorite ? 'fas' : 'far'} fa-star"></i> ${isCurrentlyFavorite ? '已收藏' : '收藏'}`;
    
    // 移除舊的事件監聽器並添加新的
    const newFavoriteBtn = modalFavoriteBtn.cloneNode(true);
    modalFavoriteBtn.parentNode.replaceChild(newFavoriteBtn, modalFavoriteBtn);
    
    newFavoriteBtn.addEventListener('click', () => {
        toggleFavoriteStore(restaurant);
        // 更新彈窗中的收藏狀態
        setTimeout(() => {
            const updatedIsFavorite = isFavorite(restaurant.id);
            newFavoriteBtn.className = `modal-favorite-btn ${updatedIsFavorite ? 'favorited' : ''}`;
            newFavoriteBtn.innerHTML = `<i class="${updatedIsFavorite ? 'fas' : 'far'} fa-star"></i> ${updatedIsFavorite ? '已收藏' : '收藏'}`;
        }, 100);
    });
    
    // 儲存餐廳資訊以供導航使用
    window.currentModalRestaurant = restaurant;
    
    // 顯示彈窗
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滾動
    
    // 初始化彈窗中的地圖
    setTimeout(() => {
        initModalMap(restaurant);
    }, 300);
}

// 關閉餐廳詳細資訊彈窗
function closeRestaurantModal() {
    const modal = document.getElementById('restaurantModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢復背景滾動
    }
}

// 初始化彈窗中的地圖
function initModalMap(restaurant) {
    const modalMapElement = document.getElementById('modal-map');
    if (!modalMapElement) {
        console.log('❌ 找不到地圖容器元素');
        return;
    }
    
    console.log('🗺️ 初始化彈窗地圖，餐廳資料:', restaurant);
    
    // 檢查是否有座標資訊 - 增強版位置檢測
    let location = null;
    
    // 優先順序1: 檢查 geometry.location (Google Places API 標準格式)
    if (restaurant.geometry && restaurant.geometry.location) {
        if (typeof restaurant.geometry.location.lat === 'function') {
            // Google Maps LatLng 對象
            location = {
                lat: restaurant.geometry.location.lat(),
                lng: restaurant.geometry.location.lng()
            };
            console.log('✅ 使用 geometry.location (LatLng 對象):', location);
        } else if (restaurant.geometry.location.lat && restaurant.geometry.location.lng) {
            // 普通座標對象
            location = {
                lat: parseFloat(restaurant.geometry.location.lat),
                lng: parseFloat(restaurant.geometry.location.lng)
            };
            console.log('✅ 使用 geometry.location (座標對象):', location);
        }
    }
    
    // 優先順序2: 檢查直接的 lat/lng 屬性
    if (!location && restaurant.lat && restaurant.lng) {
        location = {
            lat: parseFloat(restaurant.lat),
            lng: parseFloat(restaurant.lng)
        };
        console.log('✅ 使用直接 lat/lng 屬性:', location);
    }
    
    // 優先順序3: 檢查 location 屬性
    if (!location && restaurant.location) {
        if (typeof restaurant.location.lat === 'function') {
            location = {
                lat: restaurant.location.lat(),
                lng: restaurant.location.lng()
            };
            console.log('✅ 使用 location 屬性 (LatLng 對象):', location);
        } else if (restaurant.location.lat && restaurant.location.lng) {
            location = {
                lat: parseFloat(restaurant.location.lat),
                lng: parseFloat(restaurant.location.lng)
            };
            console.log('✅ 使用 location 屬性 (座標對象):', location);
        }
    }
    
    // 如果仍然沒有位置，嘗試使用地址進行地理編碼
    if (!location && restaurant.address && restaurant.address !== '地址未提供') {
        console.log('⚠️ 沒有座標資訊，嘗試使用地址進行地理編碼:', restaurant.address);
        geocodeAddress(restaurant.address, restaurant);
        return;
    }
    
    // 最後備案：使用預設位置（根據用戶當前城市或台北）
    if (!location) {
        location = userLocation || mapUserLocation || { lat: 25.0330, lng: 121.5654 };
        console.log('⚠️ 使用預設位置:', location);
    }
    
    // 驗證座標有效性
    if (!isValidCoordinate(location.lat, location.lng)) {
        console.log('❌ 座標無效，使用預設位置');
        location = { lat: 25.0330, lng: 121.5654 };
    }
    
    console.log('🎯 最終使用的位置:', location);
    
    // 創建地圖
    const modalMap = new google.maps.Map(modalMapElement, {
        zoom: 17, // 增加縮放等級以顯示更詳細的位置
        center: location,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        gestureHandling: 'cooperative' // 改善觸控體驗
    });
    
    // 添加標記
    const marker = new google.maps.Marker({
        position: location,
        map: modalMap,
        title: restaurant.name,
        animation: google.maps.Animation.DROP, // 添加動畫效果
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="15" fill="#ff6b1a" stroke="#fff" stroke-width="4"/>
                    <text x="20" y="26" text-anchor="middle" fill="white" font-size="18">🍽️</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
        }
    });
    
    // 添加資訊視窗
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 8px; min-width: 200px;">
                <h4 style="margin: 0 0 8px 0; color: #ff6b1a;">${restaurant.name}</h4>
                <p style="margin: 0 0 4px 0; color: #666;"><i class="fas fa-map-marker-alt"></i> ${restaurant.address || '地址未提供'}</p>
                <p style="margin: 0; color: #666;"><i class="fas fa-star"></i> ${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'} 分</p>
            </div>
        `
    });
    
    // 點擊標記顯示資訊視窗
    marker.addListener('click', () => {
        infoWindow.open(modalMap, marker);
    });
    
    // 儲存地圖實例以供其他功能使用
    window.modalMap = modalMap;
    window.modalMarker = marker;
    window.modalInfoWindow = infoWindow;
    
    console.log('✅ 彈窗地圖初始化完成');
}

// 新增：地址地理編碼函數
function geocodeAddress(address, restaurant) {
    const geocoder = new google.maps.Geocoder();
    
    console.log('🔍 開始地理編碼:', address);
    
    geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = {
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            
            console.log('✅ 地理編碼成功:', location);
            
            // 更新餐廳資料並重新初始化地圖
            restaurant.geometry = {
                location: location
            };
            
            initModalMap(restaurant);
        } else {
            console.log('❌ 地理編碼失敗:', status);
            
            // 使用預設位置
            restaurant.geometry = {
                location: userLocation || mapUserLocation || { lat: 25.0330, lng: 121.5654 }
            };
            
            initModalMap(restaurant);
        }
    });
}

// 新增：驗證座標有效性
function isValidCoordinate(lat, lng) {
    return !isNaN(lat) && !isNaN(lng) && 
           lat >= -90 && lat <= 90 && 
           lng >= -180 && lng <= 180 &&
           lat !== 0 && lng !== 0; // 排除 (0,0) 座標
}

// 顯示營業時間詳細彈窗
function showWeeklyHoursModal() {
    const modal = document.getElementById('weeklyHoursModal');
    const restaurant = window.currentModalRestaurant;
    
    if (!modal) {
        console.log('❌ 找不到營業時間彈窗元素');
        return;
    }
    
    if (!restaurant) {
        console.log('❌ 沒有餐廳資料');
        return;
    }
    
    console.log('📅 顯示營業時間彈窗:', restaurant.name);
    console.log('🔍 餐廳資料:', restaurant);
    
    // 如果沒有詳細的營業時間資料，嘗試重新獲取
    if (!restaurant.opening_hours || !restaurant.opening_hours.weekday_text) {
        console.log('⚠️ 沒有詳細營業時間，嘗試重新獲取...');
        fetchDetailedOpeningHours(restaurant, () => {
            populateWeeklyHoursModal(restaurant);
        });
    } else {
        populateWeeklyHoursModal(restaurant);
    }
    
    // 顯示彈窗
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滾動
}

// 關閉營業時間詳細彈窗
function closeWeeklyHoursModal() {
    const modal = document.getElementById('weeklyHoursModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // 恢復背景滾動
    }
}

// 獲取詳細營業時間
async function fetchDetailedOpeningHours(restaurant, callback) {
    if (!restaurant.place_id) {
        console.log('❌ 沒有 place_id，無法獲取詳細資訊');
        callback();
        return;
    }
    
    try {
        const service = await getReliableSearchService();
        
        service.getDetails({
            placeId: restaurant.place_id,
            fields: ['opening_hours', 'name', 'business_status']
        }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && details) {
                console.log('✅ 成功獲取詳細營業時間:', details.opening_hours);
                
                // 合併營業時間資料
                if (details.opening_hours) {
                    restaurant.opening_hours = details.opening_hours;
                }
                if (details.business_status) {
                    restaurant.business_status = details.business_status;
                }
                
                callback();
            } else {
                console.log('❌ 獲取詳細營業時間失敗:', status);
                callback();
            }
        });
    } catch (error) {
        console.log('❌ 獲取詳細營業時間錯誤:', error);
        callback();
    }
}

// 填充營業時間彈窗內容
function populateWeeklyHoursModal(restaurant) {
    const modalBody = document.getElementById('weekly-hours-modal-body');
    if (!modalBody) return;
    
    console.log('📊 處理營業時間資料 - 餐廳:', restaurant.name);
    console.log('🕒 opening_hours 結構:', restaurant.opening_hours);
    console.log('📋 完整餐廳資料:', {
        place_id: restaurant.place_id,
        business_status: restaurant.business_status,
        isOpen: restaurant.isOpen,
        opening_hours: restaurant.opening_hours
    });
    
    const dayNames = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];
    const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.
    
    let weeklyHoursHTML = '<div class="weekly-hours-table">';
    let hasRealData = false;
    
    // 檢查是否有Google Places API的weekday_text資料
    if (restaurant.opening_hours && restaurant.opening_hours.weekday_text && 
        Array.isArray(restaurant.opening_hours.weekday_text) && 
        restaurant.opening_hours.weekday_text.length > 0) {
        
        console.log('✅ 找到 weekday_text 資料:', restaurant.opening_hours.weekday_text);
        hasRealData = true;
        
        // 使用Google Places API的資料（weekday_text index 0=星期一）
        restaurant.opening_hours.weekday_text.forEach((dayText, index) => {
            // Google weekday_text: 0=星期一, 1=星期二, ..., 6=星期日
            // 我們的dayNames: 0=週一, 1=週二, ..., 6=週日
            const dayName = dayNames[index];
            
            // 判斷是否為今天
            let todayIndex = today === 0 ? 6 : today - 1; // 轉換JavaScript的星期（0=週日）到我們的索引
            const isToday = index === todayIndex;
            
            // 解析營業時間
            let hoursText = '';
            let hoursClass = '';
            
            console.log(`📅 解析第${index}天 (${dayName}):`, dayText);
            
            if (dayText.includes('休息') || dayText.includes('Closed') || 
                dayText.includes('不營業') || dayText.includes('公休') ||
                dayText.toLowerCase().includes('closed')) {
                hoursText = '休息';
                hoursClass = 'closed';
            } else {
                // 提取時間 - 支援多種格式
                const timePatterns = [
                    /(\d{1,2}:\d{2}\s*(?:AM|PM)?\s*[-–—]\s*\d{1,2}:\d{2}\s*(?:AM|PM)?)/i,
                    /(\d{1,2}:\d{2}[\s]*[-–—][\s]*\d{1,2}:\d{2})/,
                    /(\d{1,2}:\d{2})/
                ];
                
                let timeMatch = null;
                for (const pattern of timePatterns) {
                    timeMatch = dayText.match(pattern);
                    if (timeMatch) break;
                }
                
                if (timeMatch) {
                    hoursText = timeMatch[1].replace(/[-–—]/g, ' - ');
                    hoursClass = 'open';
                } else {
                    // 如果無法解析，顯示原始文字（移除星期部分）
                    hoursText = dayText.replace(/^[週星期]*[一二三四五六日天Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday]*[:：\s]*/, '').trim();
                    hoursClass = hoursText.includes('休息') || hoursText.toLowerCase().includes('closed') ? 'closed' : 'open';
                }
            }
            
            const todayLabel = isToday ? ' (今天)' : '';
            
            weeklyHoursHTML += `
                <div class="hours-day">
                    <span class="day-name ${isToday ? 'today' : ''}">${dayName}${todayLabel}</span>
                    <span class="day-hours ${hoursClass}">${hoursText}</span>
                </div>
            `;
        });
    } 
    // 檢查periods資料
    else if (restaurant.opening_hours && restaurant.opening_hours.periods && 
             Array.isArray(restaurant.opening_hours.periods) && 
             restaurant.opening_hours.periods.length > 0) {
        
        console.log('✅ 找到 periods 資料:', restaurant.opening_hours.periods);
        hasRealData = true;
        
        const periods = restaurant.opening_hours.periods;
        const weekData = new Array(7).fill(null).map(() => ({ open: null, close: null }));
        
        // 解析periods資料
        periods.forEach(period => {
            if (period.open && period.open.day !== undefined) {
                const day = period.open.day; // 0=Sunday, 1=Monday...
                weekData[day].open = period.open.time;
                if (period.close) {
                    weekData[day].close = period.close.time;
                }
            }
        });
        
        // 轉換為顯示格式
        dayNames.forEach((dayName, index) => {
            // 將我們的索引轉換為Google的星期格式
            const googleDay = index === 6 ? 0 : index + 1; // 週日=0, 週一=1...
            const todayIndex = today === 0 ? 6 : today - 1;
            const isToday = index === todayIndex;
            
            let hoursText = '';
            let hoursClass = 'closed';
            
            const dayData = weekData[googleDay];
            if (dayData && dayData.open) {
                const openTime = formatGoogleTime(dayData.open);
                const closeTime = dayData.close ? formatGoogleTime(dayData.close) : '24:00';
                hoursText = `${openTime} - ${closeTime}`;
                hoursClass = 'open';
            } else {
                hoursText = '休息';
                hoursClass = 'closed';
            }
            
            const todayLabel = isToday ? ' (今天)' : '';
            
            weeklyHoursHTML += `
                <div class="hours-day">
                    <span class="day-name ${isToday ? 'today' : ''}">${dayName}${todayLabel}</span>
                    <span class="day-hours ${hoursClass}">${hoursText}</span>
                </div>
            `;
        });
    } else {
        console.log('⚠️ 沒有詳細營業時間資料，使用預設資料');
        
        // 沒有詳細的營業時間資料，使用預設或餐廳的基本資訊
        dayNames.forEach((dayName, index) => {
            // 判斷是否為今天
            let todayIndex = today === 0 ? 6 : today - 1;
            const isToday = index === todayIndex;
            
            // 使用預設營業時間或餐廳的開放狀態
            let hoursText = '';
            let hoursClass = '';
            
            if (restaurant.business_status === 'CLOSED_PERMANENTLY') {
                hoursText = '永久停業';
                hoursClass = 'closed';
            } else if (restaurant.business_status === 'CLOSED_TEMPORARILY') {
                hoursText = '暫時停業';
                hoursClass = 'closed';
            } else if (restaurant.isOpen !== undefined) {
                // 根據餐廳的營業狀態給出預設時間
                if (restaurant.isOpen) {
                    hoursText = '09:00 - 22:00';
                    hoursClass = 'open';
                } else {
                    hoursText = '目前休息';
                    hoursClass = 'closed';
                }
            } else {
                // 完全沒有資料，給出一般營業時間
                hoursText = '營業時間未知';
                hoursClass = 'open';
            }
            
            const todayLabel = isToday ? ' (今天)' : '';
            
            weeklyHoursHTML += `
                <div class="hours-day">
                    <span class="day-name ${isToday ? 'today' : ''}">${dayName}${todayLabel}</span>
                    <span class="day-hours ${hoursClass}">${hoursText}</span>
                </div>
            `;
        });
    }
    
    // 添加標題
    const headerText = hasRealData ? '營業時間' : '參考營業時間';
    weeklyHoursHTML = `<div class="weekly-hours-header">${headerText}</div>` + weeklyHoursHTML;
    
    weeklyHoursHTML += '</div>'; // 關閉 weekly-hours-table
    
    modalBody.innerHTML = weeklyHoursHTML;
    
    console.log('✅ 營業時間彈窗內容已填充, 使用真實資料:', hasRealData);
}

// 格式化 Google 時間格式 (例如: "0900" -> "09:00")
function formatGoogleTime(timeString) {
    if (!timeString || timeString.length !== 4) {
        return timeString || '00:00';
    }
    
    const hours = timeString.substring(0, 2);
    const minutes = timeString.substring(2, 4);
    return `${hours}:${minutes}`;
}

// 開啟Google Maps導航
function openGoogleMaps() {
    const restaurant = window.currentModalRestaurant;
    if (!restaurant) {
        console.log('❌ 沒有餐廳資料');
        return;
    }
    
    console.log('🗺️ 開啟 Google Maps 導航，餐廳資料:', restaurant);
    
    let location = null;
    
    // 使用與 initModalMap 相同的位置檢測邏輯
    // 優先順序1: 檢查 geometry.location
    if (restaurant.geometry && restaurant.geometry.location) {
        if (typeof restaurant.geometry.location.lat === 'function') {
            location = {
                lat: restaurant.geometry.location.lat(),
                lng: restaurant.geometry.location.lng()
            };
            console.log('✅ 導航使用 geometry.location (LatLng 對象):', location);
        } else if (restaurant.geometry.location.lat && restaurant.geometry.location.lng) {
            location = {
                lat: parseFloat(restaurant.geometry.location.lat),
                lng: parseFloat(restaurant.geometry.location.lng)
            };
            console.log('✅ 導航使用 geometry.location (座標對象):', location);
        }
    }
    
    // 優先順序2: 檢查直接的 lat/lng 屬性
    if (!location && restaurant.lat && restaurant.lng) {
        location = {
            lat: parseFloat(restaurant.lat),
            lng: parseFloat(restaurant.lng)
        };
        console.log('✅ 導航使用直接 lat/lng 屬性:', location);
    }
    
    // 優先順序3: 檢查 location 屬性
    if (!location && restaurant.location) {
        if (typeof restaurant.location.lat === 'function') {
            location = {
                lat: restaurant.location.lat(),
                lng: restaurant.location.lng()
            };
            console.log('✅ 導航使用 location 屬性 (LatLng 對象):', location);
        } else if (restaurant.location.lat && restaurant.location.lng) {
            location = {
                lat: parseFloat(restaurant.location.lat),
                lng: parseFloat(restaurant.location.lng)
            };
            console.log('✅ 導航使用 location 屬性 (座標對象):', location);
        }
    }
    
    // 如果有有效座標，使用座標導航
    if (location && isValidCoordinate(location.lat, location.lng)) {
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${restaurant.id || restaurant.place_id || ''}`;
        console.log('🎯 使用座標導航:', googleMapsUrl);
        window.open(googleMapsUrl, '_blank');
    } else {
        // 如果沒有有效座標，使用名稱和地址搜索
        const searchQuery = `${restaurant.name} ${restaurant.address || ''}`.trim();
        const query = encodeURIComponent(searchQuery);
        const googleMapsUrl = `https://www.google.com/maps/search/${query}`;
        console.log('🔍 使用名稱地址搜索導航:', googleMapsUrl);
        window.open(googleMapsUrl, '_blank');
    }
}