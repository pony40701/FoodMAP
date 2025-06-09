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
    if (typeof google === 'undefined') {
        setTimeout(initMap, 1000);
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                createMapWithLocation(userLocation);
            },
            (error) => {
                const defaultLocation = { lat: 25.0330, lng: 121.5654 };
                createMapWithLocation(defaultLocation);
            }
        );
    } else {
        const defaultLocation = { lat: 25.0330, lng: 121.5654 };
        createMapWithLocation(defaultLocation);
    }
}

// 創建地圖
function createMapWithLocation(location) {
    const mapElement = document.getElementById('map');
    map = new google.maps.Map(mapElement, {
        zoom: 15,
        center: location,
        mapTypeControl: false
    });

    new google.maps.Marker({
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

    placesService = new google.maps.places.PlacesService(map);
    isMapInitialized = true;
}

// 搜尋餐廳
function searchByType(type, typeName) {
    if (!isMapInitialized) return;

    const container = document.getElementById('restaurants-container');
    if (container) {
        container.innerHTML = '<div class="loading-message">搜尋中...</div>';
    }

    const request = {
        location: map.getCenter(),
        radius: 3000,
        type: ['restaurant'],
        keyword: typeName
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const restaurants = results.slice(0, 8).map(mapPlaceResult);
            displayRestaurants(restaurants);
        } else {
            if (container) {
                container.innerHTML = '<div class="error-message">搜尋失敗，請稍後再試</div>';
            }
        }
    });
}

// 顯示餐廳列表
function displayRestaurants(restaurants) {
    const container = document.getElementById('restaurants-container');
    if (!container) return;

    if (restaurants.length === 0) {
        container.innerHTML = '<div class="no-results">找不到相關餐廳</div>';
        return;
    }

    const html = restaurants.map((restaurant, index) => `
        <div class="restaurant-card">
            <div class="restaurant-image">
                ${restaurant.photos ? 
                    `<img src="${restaurant.photos}" alt="${restaurant.name}" loading="lazy">` : 
                    '<div class="no-image">暫無圖片</div>'
                }
                <button class="favorite-btn ${isFavorite(restaurant.id) ? 'active' : ''}" 
                        onclick="toggleFavoriteStore('${restaurant.id}', '${restaurant.name}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="rating">
                    ${restaurant.rating ? `
                        <span class="stars" style="--rating: ${restaurant.rating};"></span>
                        <span class="rating-text">${restaurant.rating} (${restaurant.user_ratings_total})</span>
                    ` : '<span class="no-rating">尚無評分</span>'}
                </div>
                <p class="address">${restaurant.address || '地址未提供'}</p>
                ${restaurant.opening_hours ? `
                    <p class="opening-hours ${restaurant.opening_hours.isOpen ? 'open' : 'closed'}">
                        ${restaurant.opening_hours.isOpen ? '營業中' : '休息中'}
                    </p>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

// 收藏功能
function toggleFavoriteStore(id, name) {
    let favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
    const index = favorites.findIndex(store => store.id === id);
    
    if (index === -1) {
        favorites.push({ id, name, timestamp: Date.now() });
        showToast('已加入收藏');
    } else {
        favorites.splice(index, 1);
        showToast('已取消收藏');
    }
    
    localStorage.setItem('favoriteStores', JSON.stringify(favorites));
    
    const btn = document.querySelector(`button[onclick*="${id}"]`);
    if (btn) {
        btn.classList.toggle('active');
    }
}

function isFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favoriteStores') || '[]');
    return favorites.some(store => store.id === id);
}

// 顯示提示訊息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 2000);
    }, 100);
}

// 地點結果轉換
function mapPlaceResult(place) {
    return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        photos: place.photos ? place.photos[0].getUrl() : null,
        opening_hours: place.opening_hours ? {
            isOpen: place.opening_hours.isOpen(),
            periods: place.opening_hours.periods
        } : null,
        location: place.geometry.location
    };
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});