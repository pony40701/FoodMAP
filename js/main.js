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

// 生成星級評分顯示
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '★';
        } else if (i - 0.5 <= rating) {
            stars += '½';
        } else {
            stars += '☆';
        }
    }
    return stars;
}

// 初始化模態框事件
function initModalEvents() {
    const modal = document.getElementById('restaurantModal');
    if (!modal) return;

    // 移除可能存在的舊事件監聽器
    const oldListener = window.modalEscListener;
    if (oldListener) {
        document.removeEventListener('keydown', oldListener);
    }

    // 點擊關閉按鈕關閉模態框
    const closeBtn = modal.querySelector('.restaurant-modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeRestaurantModal;
    }

    // 點擊模態框外部關閉
    modal.onclick = (event) => {
        if (event.target === modal) {
            closeRestaurantModal();
        }
    };

    // 創建新的事件監聽器並儲存引用
    window.modalEscListener = (event) => {
        if (event.key === 'Escape' && modal.style.display === 'block') {
            closeRestaurantModal();
        }
    };
    
    // 綁定新的事件監聽器
    document.addEventListener('keydown', window.modalEscListener);
}

// 顯示餐廳詳情
function showRestaurantDetail(restaurant) {
    if (!restaurant) {
        console.error('未提供餐廳資料');
        return;
    }

    const modal = document.getElementById('restaurantModal');
    if (!modal) {
        console.error('找不到餐廳詳細資訊視窗');
        return;
    }

    try {
        // 更新餐廳名稱
        const modalName = document.getElementById('modal-restaurant-name');
        if (modalName) {
            modalName.textContent = restaurant.name;
        }

        // 更新餐廳圖片
        const modalImg = document.getElementById('modal-restaurant-img');
        if (modalImg) {
            modalImg.src = restaurant.photos || 'images/no-image.jpg';
            modalImg.alt = restaurant.name;
        }

        // 更新評分資訊
        const modalStars = document.getElementById('modal-stars');
        const modalRating = document.getElementById('modal-rating');
        const modalRatingCount = document.getElementById('modal-rating-count');
        
        if (modalStars) {
            modalStars.textContent = generateStars(restaurant.rating || 0);
        }
        if (modalRating) {
            modalRating.textContent = (restaurant.rating || 0).toFixed(1);
        }
        if (modalRatingCount) {
            modalRatingCount.textContent = `(${restaurant.user_ratings_total || 0} 則評論)`;
        }

        // 更新地址
        const modalAddress = document.getElementById('modal-address');
        if (modalAddress && restaurant.address) {
            modalAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i>${restaurant.address}`;
        }

        // 更新營業狀態
        const modalStatus = document.querySelector('.modal-status');
        if (modalStatus && restaurant.opening_hours) {
            const isOpen = restaurant.opening_hours.isOpen();
            modalStatus.innerHTML = `
                <i class="fas fa-clock"></i>
                <span>${isOpen ? '營業中' : '休息中'}</span>
            `;
            modalStatus.className = `modal-status ${isOpen ? 'open' : 'closed'}`;
        }

        // 更新營業時間
        const modalTodayHours = document.getElementById('modal-today-hours');
        if (modalTodayHours && restaurant.businessHours) {
            modalTodayHours.textContent = restaurant.businessHours;
        }

        // 設置收藏按鈕事件
        const modalFavoriteBtn = document.getElementById('modal-favorite-btn');
        if (modalFavoriteBtn) {
            const isFavorite = false; // TODO: 檢查是否已收藏
            modalFavoriteBtn.innerHTML = isFavorite ? 
                '<i class="fas fa-heart"></i> 已收藏' : 
                '<i class="far fa-heart"></i> 收藏';
            modalFavoriteBtn.onclick = () => toggleFavorite(restaurant);
        }

        // 設置導航按鈕事件
        const modalDirectionBtn = document.getElementById('modal-direction-btn');
        if (modalDirectionBtn) {
            modalDirectionBtn.onclick = () => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(restaurant.address)}`;
                window.open(url, '_blank');
            };
        }

        // 初始化地圖
        const mapContainer = document.getElementById('modal-map');
        if (mapContainer && restaurant.location && restaurant.location.lat && restaurant.location.lng) {
            const map = new google.maps.Map(mapContainer, {
                center: { 
                    lat: restaurant.location.lat, 
                    lng: restaurant.location.lng 
                },
                zoom: 15,
                mapTypeControl: false,
                fullscreenControl: false
            });

            new google.maps.Marker({
                position: { 
                    lat: restaurant.location.lat, 
                    lng: restaurant.location.lng 
                },
                map: map,
                title: restaurant.name
            });
        }

        // 顯示模態框
        modal.style.display = 'block';
        
        // 確保模態框事件已初始化
        initModalEvents();
    } catch (error) {
        console.error('顯示餐廳詳細資訊時發生錯誤:', error);
    }
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
    const btn = document.getElementById('modal-favorite-btn');
    if (!btn) return;

    const isFavorite = btn.innerHTML.includes('已收藏');
    if (isFavorite) {
        btn.innerHTML = '<i class="far fa-heart"></i> 收藏';
        showToast('已移除收藏');
    } else {
        btn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
        showToast('已加入收藏');
    }
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
