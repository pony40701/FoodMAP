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
// 登入彈窗
// ===========================================
function initLoginModal() {
    const loginBtn = document.querySelector('.btn-login');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
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
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) { modal.style.display = 'none'; }
    });
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
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
    if (loginBtn) loginBtn.textContent = isLoggedIn ? '會員中心' : '登入';
}

function socialLogin(platform) {
    alert('社群登入（' + platform + '）功能尚未開放');
}

// ===========================================
// 地圖初始化
// ===========================================
window.addEventListener('DOMContentLoaded', async () => {
    try {
        window.mapInit = await new MapInit().init();
    } catch (error) {
        console.error('初始化地圖失敗:', error);
    }
});

// ===========================================
// 餐廳列表顯示
// ===========================================
window.displayRestaurants = function(restaurants) {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    
    if (!restaurants || restaurants.length === 0) {
        container.innerHTML = '<div class="no-results">找不到相關餐廳</div>';
        return;
    }

    // 清空容器
    container.innerHTML = '';
    
    // 為每個餐廳創建卡片
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurant.photos}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
                <button class="favorite-btn" onclick="event.stopPropagation();">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <div class="rating">
                    <div class="stars">
                        ${window.mapInit.generateStars(restaurant.rating)}
                    </div>
                    <span class="rating-text">${restaurant.rating} (${restaurant.user_ratings_total})</span>
                </div>
                <p class="address">${restaurant.address}</p>
                <p class="opening-hours ${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? 'open' : 'closed'}">
                    <i class="fas fa-clock"></i>
                    ${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? '營業中' : '休息中'}
                </p>
            </div>
        `;

        // 添加點擊事件
        card.addEventListener('click', () => {
            window.mapInit.showRestaurantDetail(restaurant);
        });

        container.appendChild(card);
    });
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

// 顯示餐廳詳情
function showRestaurantDetail(restaurant) {
    const modal = document.getElementById('restaurantModal');
    if (!modal) return;

    const content = modal.querySelector('.restaurant-modal-content');
    content.innerHTML = `
        <div class="restaurant-modal-header">
            <h2>${restaurant.name}</h2>
            <span class="restaurant-modal-close" onclick="closeRestaurantModal()">&times;</span>
        </div>
        <div class="restaurant-modal-body">
            <div class="restaurant-details">
                <div class="restaurant-main-info">
                    <div class="restaurant-modal-image">
                        <img src="${restaurant.photos}" alt="${restaurant.name}">
                    </div>
                    <div class="restaurant-info-text">
                        <div class="modal-rating">
                            <span class="modal-stars">${generateStars(restaurant.rating)}</span>
                            <span class="modal-rating-value">${restaurant.rating}</span>
                            <span class="modal-rating-count">(${restaurant.user_ratings_total} 則評論)</span>
                        </div>
                        <div class="modal-address">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${restaurant.address}</span>
                        </div>
                        <div class="modal-hours">
                            <div class="modal-status ${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? 'open' : 'closed'}">
                                <i class="fas fa-clock"></i>
                                <span>${restaurant.opening_hours && restaurant.opening_hours.isOpen() ? '營業中' : '休息中'}</span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-favorite-btn">
                                <i class="far fa-heart"></i> 收藏
                            </button>
                            <button class="modal-direction-btn" onclick="openGoogleMaps('${restaurant.address}')">
                                <i class="fas fa-directions"></i> 導航
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// 關閉餐廳詳情
function closeRestaurantModal() {
    const modal = document.getElementById('restaurantModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 切換收藏狀態
function toggleFavorite(restaurant) {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(f => f.id === restaurant.id);
    
    if (index === -1) {
        favorites.push(restaurant);
        showToast('已加入收藏');
    } else {
        favorites.splice(index, 1);
        showToast('已移除收藏');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// ===========================================
// 收藏功能
// ===========================================
window.toggleFavorite = function(id, name) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === id);
    if (index === -1) {
        favorites.push({ id, name });
        showToast('已加入收藏');
    } else {
        favorites.splice(index, 1);
        showToast('已移除收藏');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    const btn = document.querySelector(`[data-id="${id}"] .favorite-btn`);
    if (btn) btn.classList.toggle('active');
};

window.isFavorite = function(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some(fav => fav.id === id);
};

// ===========================================
// Toast 提示
// ===========================================
function showToast(message) {
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
        initCarousel();
        initLoginModal();
    } catch (error) {
        console.error('初始化頁面時發生錯誤:', error);
    }
});
