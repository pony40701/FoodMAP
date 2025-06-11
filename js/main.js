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
    restaurants.forEach((restaurant, idx) => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.setAttribute('data-idx', idx);
        card.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurant.photos}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
                <button class="favorite-btn" data-id="${restaurant.id}">
                    <i class="${FavoritesManager.isFavorite(restaurant.id) ? 'fas' : 'far'} fa-heart"></i>
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
        container.appendChild(card);
    });

    // 事件代理：只綁一次
    container.onclick = function(e) {
        const card = e.target.closest('.restaurant-card');
        if (card && !e.target.closest('.favorite-btn')) {
            const idx = card.getAttribute('data-idx');
            const restaurant = restaurants[idx];
            console.log('代理卡片被點擊', restaurant);
            if (window.mapInit && typeof window.mapInit.showRestaurantDetail === 'function') {
                window.mapInit.showRestaurantDetail(restaurant);
            }
        }
    };

    // 先移除舊的事件監聽器（用 cloneNode 方式）
    // const newContainer = container.cloneNode(true);
    // container.parentNode.replaceChild(newContainer, container);

    // 事件代理：收藏按鈕
    // newContainer.addEventListener('click', function(e) {
    //     const btn = e.target.closest('.favorite-btn');
    //     if (btn) {
    //         e.stopPropagation();
    //         const id = btn.getAttribute('data-id');
    //         const restaurant = restaurants.find(r => r.id == id || r.place_id == id);
    //         if (!restaurant) return;
    //         // 收藏時存完整物件
    //         if (FavoritesManager.isFavorite(id)) {
    //             FavoritesManager.removeFavorite(id);
    //         } else {
    //             // 存入完整物件，確保會員中心能正確顯示
    //             FavoritesManager.addFavorite({
    //                 id: restaurant.id,
    //                 name: restaurant.name,
    //                 photos: restaurant.photos,
    //                 rating: restaurant.rating,
    //                 user_ratings_total: restaurant.user_ratings_total,
    //                 address: restaurant.address,
    //                 opening_hours: restaurant.opening_hours ? (restaurant.opening_hours.weekday_text || null) : null
    //             });
    //         }
    //         btn.querySelector('i').className = FavoritesManager.isFavorite(id) ? 'fas fa-heart' : 'far fa-heart';
    //     }
    // });
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
            const isFavorite = FavoritesManager.isFavorite(restaurant.id);
            modalFavoriteBtn.innerHTML = isFavorite ? 
                '<i class="fas fa-heart"></i> 已收藏' : 
                '<i class="far fa-heart"></i> 收藏';
            modalFavoriteBtn.onclick = () => {
                if (FavoritesManager.isFavorite(restaurant.id)) {
                    FavoritesManager.removeFavorite(restaurant.id);
                    modalFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> 收藏';
                } else {
                    FavoritesManager.addFavorite(restaurant);
                    modalFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                }
            };
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

// 餐廳卡片相關功能
document.addEventListener('DOMContentLoaded', function() {
    const restaurantsContainer = document.getElementById('restaurants-container');

    // 模擬餐廳數據
    const restaurants = [
        {
            id: 1,
            name: "美味餐廳",
            image: "images/restaurant1.jpg",
            rating: 4.5,
            reviewCount: 128,
            address: "台北市中山區中山北路二段",
            isOpen: true,
            openingHours: "11:00 - 21:00"
        },
        // 可以添加更多餐廳...
    ];

    // 渲染餐廳卡片
    function renderRestaurants(restaurants) {
        restaurantsContainer.innerHTML = restaurants.map(restaurant => `
            <div class="restaurant-card" data-id="${restaurant.id}">
                <div class="restaurant-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}">
                    <button class="favorite-btn" onclick="handleFavoriteClick(event, ${restaurant.id})">
                        <i class="fa${FavoritesManager.isFavorite(restaurant.id) ? 's' : 'r'} fa-heart"></i>
                    </button>
                </div>
                <div class="restaurant-info">
                    <div class="title-container">
                        <h3>${restaurant.name}</h3>
                    </div>
                    <div class="rating">
                        <div class="stars">
                            ${getStarRating(restaurant.rating)}
                        </div>
                        <span class="rating-text">${restaurant.rating} (${restaurant.reviewCount})</span>
                    </div>
                    <p class="address">${restaurant.address}</p>
                    <p class="opening-hours ${restaurant.isOpen ? 'open' : ''}">
                        <i class="fas fa-clock"></i>
                        ${restaurant.isOpen ? '營業中' : '休息中'} - ${restaurant.openingHours}
                    </p>
                </div>
            </div>
        `).join('');
    }

    // 生成星級評分
    function getStarRating(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let stars = '';
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }

    // 初始渲染
    renderRestaurants(restaurants);

    // 監聽收藏更新事件
    window.addEventListener('favoritesUpdated', function() {
        renderRestaurants(restaurants);
    });
});

// 處理收藏按鈕點擊
function handleFavoriteClick(event, restaurantId) {
    event.stopPropagation(); // 防止觸發卡片點擊事件
    
    const button = event.currentTarget;
    const restaurant = getRestaurantById(restaurantId); // 需要實現這個函數
    
    if (FavoritesManager.isFavorite(restaurantId)) {
        FavoritesManager.removeFavorite(restaurantId);
    } else {
        FavoritesManager.addFavorite(restaurant);
    }
    
    FavoritesManager.updateFavoriteButton(button, restaurantId);
}

// 獲取餐廳資訊的輔助函數
function getRestaurantById(id) {
    // 這裡應該從你的數據源獲取餐廳資訊
    // 目前使用模擬數據
    return {
        id: id,
        name: "美味餐廳",
        image: "images/restaurant1.jpg",
        rating: 4.5,
        reviewCount: 128,
        address: "台北市中山區中山北路二段",
        isOpen: true,
        openingHours: "11:00 - 21:00"
    };
}
