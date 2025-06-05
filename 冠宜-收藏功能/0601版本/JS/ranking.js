// 模擬餐廳資料
const restaurantsData = [
    {
        id: 1,
        name: "鼎泰豐",
        address: "台北市大安區信義路二段194號",
        rating: 4.8,
        reviewCount: 1234,
        priceRange: "$$$",
        area: "taipei",
        type: "chinese",
        price: "medium",
        specialty: "小籠包",
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "weekly", "monthly"],
        openTime: "11:00-21:00"
    },
    {
        id: 2,
        name: "茹絲葵牛排館",
        address: "台北市信義區松壽路12號",
        rating: 4.7,
        reviewCount: 987,
        priceRange: "$$$$",
        area: "taipei",
        type: "western",
        price: "luxury",
        specialty: "牛排",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "monthly"],
        openTime: "17:00-23:00"
    },
    {
        id: 3,
        name: "海底撈火鍋",
        address: "台北市松山區南京東路三段67號",
        rating: 4.6,
        reviewCount: 856,
        priceRange: "$$$",
        area: "taipei",
        type: "chinese",
        price: "high",
        specialty: "麻辣鍋",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "weekly"],
        openTime: "11:30-02:00"
    },
    {
        id: 4,
        name: "築地壽司",
        address: "台北市中山區中山北路二段89號",
        rating: 4.5,
        reviewCount: 743,
        priceRange: "$$",
        area: "taipei",
        type: "japanese",
        price: "medium",
        specialty: "生魚片",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "new"],
        openTime: "11:00-22:00"
    },
    {
        id: 5,
        name: "老乾杯",
        address: "台北市大安區敦化南路一段161號",
        rating: 4.4,
        reviewCount: 692,
        priceRange: "$$$",
        area: "taipei",
        type: "japanese",
        price: "high",
        specialty: "燒肉",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "weekly", "monthly"],
        openTime: "17:00-01:00"
    },
    {
        id: 6,
        name: "王品牛排",
        address: "新北市板橋區文化路一段188號",
        rating: 4.3,
        reviewCount: 654,
        priceRange: "$$$",
        area: "newtaipei",
        type: "western",
        price: "high",
        specialty: "牛排",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["overall", "new"],
        openTime: "11:30-22:00"
    },
    {
        id: 7,
        name: "一蘭拉麵",
        address: "台北市大安區忠孝東路四段181號",
        rating: 4.2,
        reviewCount: 521,
        priceRange: "$$",
        area: "taipei",
        type: "japanese",
        price: "medium",
        specialty: "拉麵",
        image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["weekly", "new"],
        openTime: "24小時"
    },
    {
        id: 8,
        name: "金峰魯肉飯",
        address: "台北市中正區羅斯福路一段10號",
        rating: 4.1,
        reviewCount: 432,
        priceRange: "$",
        area: "taipei",
        type: "chinese",
        price: "low",
        specialty: "魯肉飯",
        image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["weekly", "monthly"],
        openTime: "08:00-20:00"
    },
    {
        id: 9,
        name: "春水堂",
        address: "台中市西屯區文心路三段447號",
        rating: 4.0,
        reviewCount: 398,
        priceRange: "$$",
        area: "taichung",
        type: "chinese",
        price: "medium",
        specialty: "珍珠奶茶",
        image: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["monthly", "new"],
        openTime: "10:00-22:00"
    },
    {
        id: 10,
        name: "瓦城泰統",
        address: "高雄市前金區中正四路211號",
        rating: 3.9,
        reviewCount: 356,
        priceRange: "$$",
        area: "kaohsiung",
        type: "thai",
        price: "medium",
        specialty: "泰式料理",
        image: "https://images.unsplash.com/photo-1559847844-d721426d6edc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        category: ["new"],
        openTime: "11:00-22:00"
    }
];

// 全域變數
let currentFilter = 'overall';
let currentPage = 0;
const itemsPerPage = 5;
let filteredRestaurants = [];

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    applyFilters();
});

// 初始化過濾器事件監聽
function initializeFilters() {
    // 過濾器按鈕事件
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有按鈕的 active 狀態
            filterButtons.forEach(b => b.classList.remove('active'));
            // 添加當前按鈕的 active 狀態
            this.classList.add('active');
            
            currentFilter = this.dataset.filter;
            currentPage = 0;
            applyFilters();
        });
    });

    // 載入更多按鈕事件
    document.getElementById('load-more-btn').addEventListener('click', function() {
        currentPage++;
        displayRestaurants(true);
    });
}

// 應用所有過濾器
function applyFilters() {
    filteredRestaurants = restaurantsData.filter(restaurant => {
        // 分類過濾
        const categoryMatch = restaurant.category.includes(currentFilter);
        
        return categoryMatch;
    });

    // 按評分排序
    filteredRestaurants.sort((a, b) => b.rating - a.rating);
    
    displayRestaurants(false);
}

// 顯示餐廳列表
function displayRestaurants(append = false) {
    const container = document.getElementById('restaurants-container');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!append) {
        container.innerHTML = '';
        currentPage = 0;
    }
    
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const restaurantsToShow = filteredRestaurants.slice(startIndex, endIndex);
    
    if (restaurantsToShow.length === 0 && !append) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">沒有找到符合條件的餐廳</p>';
        loadMoreBtn.style.display = 'none';
        return;
    }
    
    restaurantsToShow.forEach((restaurant, index) => {
        const globalRank = startIndex + index + 1;
        const card = createRestaurantCard(restaurant, globalRank);
        container.appendChild(card);
    });
    
    // 恢復按鈕狀態
    setTimeout(() => {
        restoreButtonStates();
    }, 100);
    
    // 控制載入更多按鈕顯示
    if (endIndex >= filteredRestaurants.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// 創建餐廳卡片（修改按鈕位置）
function createRestaurantCard(restaurant, rank) {
    const card = document.createElement('div');
    card.className = `restaurant-card rank-${rank <= 3 ? rank : ''}`;
    
    const stars = '★'.repeat(Math.floor(restaurant.rating)) + '☆'.repeat(5 - Math.floor(restaurant.rating));
    const tags = generateTags(restaurant, rank);
    
    card.innerHTML = `
        <div class="rank-number">${rank}</div>
        <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image" 
             onerror="this.src='https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
        <div class="restaurant-info">
            <div class="restaurant-header">
                <h3>${restaurant.name}</h3>
            </div>
            <div class="restaurant-meta">
                <div class="meta-item">
                    <span>🕒</span>
                    <span>${restaurant.openTime}</span>
                </div>
                <div class="meta-item">
                    <span>📍</span>
                    <span>${getAreaName(restaurant.area)}</span>
                </div>
            </div>
            <div class="restaurant-address">${restaurant.address}</div>
            <div class="restaurant-tags">
                ${tags}
            </div>
            <div class="restaurant-stats">
                <div class="rating-info">
                    <div class="rating">${stars} ${restaurant.rating.toFixed(1)}</div>
                    <div class="review-count">${restaurant.reviewCount} 則評論</div>
                </div>
            </div>
        </div>
        <!-- 按鈕區域移到卡片最外層，使用絕對定位 -->
        <div class="restaurant-actions">
            <button class="action-btn wishlist-btn" onclick="toggleWishlist(${restaurant.id}, this)" data-restaurant-id="${restaurant.id}">
                <span class="btn-icon">🤍</span>
                <span class="btn-text">想去</span>
            </button>
            <button class="action-btn favorite-btn" onclick="toggleFavorite(${restaurant.id}, this)" data-restaurant-id="${restaurant.id}">
                <span class="btn-icon">⭐</span>
                <span class="btn-text">收藏</span>
            </button>
            <button class="action-btn detail-btn" onclick="showRestaurantDetail(${restaurant.id})">
                <span class="btn-icon">📋</span>
                <span class="btn-text">詳情</span>
            </button>
        </div>
    `;
    
    return card;
}

// 生成標籤的函數
function generateTags(restaurant, rank) {
    let tags = [];
    
    // 根據排名和分類添加熱門標籤
    if (rank <= 3 && currentFilter === 'weekly') {
        tags.push('<span class="tag hot-tag">🔥 本週最熱</span>');
    } else if (rank <= 3 && currentFilter === 'monthly') {
        tags.push('<span class="tag hot-tag">⭐ 本月精選</span>');
    } else if (rank <= 3) {
        tags.push('<span class="tag hot-tag">🔥 熱門推薦</span>');
    } else if (rank <= 5) {
        tags.push('<span class="tag premium-tag">👑 人氣餐廳</span>');
    }
    
    // 添加料理特色標籤
    if (restaurant.specialty) {
        tags.push(`<span class="tag cuisine-tag">${restaurant.specialty}</span>`);
    }
    
    // 添加類型標籤
    const typeNames = {
        'chinese': '中式',
        'japanese': '日式',
        'western': '西式',
        'korean': '韓式',
        'thai': '泰式',
        'italian': '義式'
    };
    
    if (typeNames[restaurant.type]) {
        tags.push(`<span class="tag type-tag">${typeNames[restaurant.type]}</span>`);
    }
    
    // 新店標籤
    if (currentFilter === 'new') {
        tags.push('<span class="tag new-tag">🆕 新店推薦</span>');
    }
    
    return tags.join('');
}

// 想去的地方功能
function toggleWishlist(restaurantId, button) {
    const icon = button.querySelector('.btn-icon');
    const text = button.querySelector('.btn-text');
    
    if (button.classList.contains('active')) {
        // 移除想去
        button.classList.remove('active');
        icon.textContent = '🤍';
        text.textContent = '想去';
        removeFromWishlist(restaurantId);
        showNotification('已從想去清單移除', 'info');
    } else {
        // 加入想去
        button.classList.add('active');
        icon.textContent = '💖';
        text.textContent = '已加入';
        addToWishlist(restaurantId);
        showNotification('已加入想去清單', 'success');
    }
}

// 收藏功能
function toggleFavorite(restaurantId, button) {
    const icon = button.querySelector('.btn-icon');
    const text = button.querySelector('.btn-text');
    
    if (button.classList.contains('active')) {
        // 移除收藏
        button.classList.remove('active');
        icon.textContent = '⭐';
        text.textContent = '收藏';
        removeFromFavorites(restaurantId);
        showNotification('已從收藏移除', 'info');
    } else {
        // 加入收藏
        button.classList.add('active');
        icon.textContent = '🌟';
        text.textContent = '已收藏';
        addToFavorites(restaurantId);
        showNotification('已加入收藏', 'success');
    }
}

// 餐廳詳情功能
function showRestaurantDetail(restaurantId) {
    const restaurant = restaurantsData.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    // 創建詳情彈窗
    const modal = document.createElement('div');
    modal.className = 'detail-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${restaurant.name}</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <img src="${restaurant.image}" alt="${restaurant.name}" class="detail-image">
                <div class="detail-info">
                    <div class="detail-section">
                        <h3>基本資訊</h3>
                        <p><strong>地址：</strong>${restaurant.address}</p>
                        <p><strong>營業時間：</strong>${restaurant.openTime}</p>
                        <p><strong>電話：</strong>02-${Math.floor(Math.random() * 90000000) + 10000000}</p>
                        <p><strong>特色料理：</strong>${restaurant.specialty}</p>
                    </div>
                    <div class="detail-section">
                        <h3>評價資訊</h3>
                        <p><strong>評分：</strong>${restaurant.rating.toFixed(1)} / 5.0</p>
                        <p><strong>評論數：</strong>${restaurant.reviewCount} 則</p>
                    </div>
                    <div class="detail-section">
                        <h3>特色介紹</h3>
                        <p>這家餐廳以${restaurant.specialty}聞名，提供優質的用餐體驗。環境舒適，服務親切，是聚餐的好選擇。無論是商務聚餐還是家庭聚會，都能在這裡享受到美味的料理和溫馨的氛圍。</p>
                    </div>
                    <div class="detail-section">
                        <h3>店家位置</h3>
                        <div id="map" style="width: 100%; height: 300px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; color: #666;">
                            <p>地圖載入中...</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn primary" onclick="closeModal()">關閉</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // 初始化地圖（如果有Google Maps API）
    setTimeout(() => {
        if (typeof google !== 'undefined' && google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': restaurant.address }, function(results, status) {
                if (status === 'OK') {
                    const map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 15,
                        center: results[0].geometry.location
                    });
                    new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                        title: restaurant.name
                    });
                } else {
                    document.getElementById('map').innerHTML = '<p>無法載入地圖</p>';
                }
            });
        } else {
            // 如果沒有Google Maps API，顯示替代內容
            document.getElementById('map').innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <p><strong>📍 ${restaurant.address}</strong></p>
                    <p style="color: #666; margin-top: 10px;">請使用Google Maps或其他地圖應用查看詳細位置</p>
                </div>
            `;
        }
    }, 300);
}

// 關閉彈窗
function closeModal() {
    const modal = document.querySelector('.detail-modal');
    if (modal) {
        modal.remove();
    }
}

// 通知功能
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// 本地存儲功能
function addToWishlist(restaurantId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.includes(restaurantId)) {
        wishlist.push(restaurantId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

function removeFromWishlist(restaurantId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist = wishlist.filter(id => id !== restaurantId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToFavorites(restaurantId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(restaurantId)) {
        favorites.push(restaurantId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function removeFromFavorites(restaurantId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(id => id !== restaurantId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// 頁面載入時恢復按鈕狀態
function restoreButtonStates() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    wishlist.forEach(id => {
        const button = document.querySelector(`.wishlist-btn[data-restaurant-id="${id}"]`);
        if (button) {
            button.classList.add('active');
            button.querySelector('.btn-icon').textContent = '💖';
            button.querySelector('.btn-text').textContent = '已加入';
        }
    });
    
    favorites.forEach(id => {
        const button = document.querySelector(`.favorite-btn[data-restaurant-id="${id}"]`);
        if (button) {
            button.classList.add('active');
            button.querySelector('.btn-icon').textContent = '🌟';
            button.querySelector('.btn-text').textContent = '已收藏';
        }
    });
}

// 獲取地區名稱
function getAreaName(area) {
    const areaNames = {
        'taipei': '台北市',
        'newtaipei': '新北市',
        'taoyuan': '桃園市',
        'taichung': '台中市',
        'tainan': '台南市',
        'kaohsiung': '高雄市'
    };
    return areaNames[area] || area;
}

// 獲取類型名稱
function getTypeName(type) {
    const typeNames = {
        'chinese': '中式',
        'japanese': '日式',
        'western': '西式',
        'korean': '韓式',
        'thai': '泰式',
        'italian': '義式'
    };
    return typeNames[type] || type;
}
