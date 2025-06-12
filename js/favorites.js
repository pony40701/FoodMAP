// 從 localStorage 獲取收藏數據
function getFavoriteStores() {
    return JSON.parse(localStorage.getItem('favorites')) || [];
}

function getFavoriteReviews() {
    return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 不再於載入時檢查登入狀態，僅初始化頁籤與內容
    initializeTabs();
    loadStores();
    loadReviews();
    initializeMap();
    initializeViewToggle();
});

// 顯示登入彈窗，確保它在最上層
function showLoginModal() {
    // 顯示提示訊息
    alert('請先登入會員');
    
    // 強制關閉餐廳詳情彈窗（如果存在）
    const restaurantModal = document.getElementById('restaurantModal');
    if (restaurantModal) {
        restaurantModal.style.display = 'none';
    }
    
    // 顯示登入彈窗
    let loginModal;
    if (window.parent && window.parent.document.getElementById('loginModal')) {
        loginModal = window.parent.document.getElementById('loginModal');
    } else if (document.getElementById('loginModal')) {
        loginModal = document.getElementById('loginModal');
    }
    
    if (loginModal) {
        // 確保登入彈窗在最上層
        loginModal.style.zIndex = '3000';
        loginModal.style.display = 'block';
        
        // 將登入彈窗移到最前面
        document.body.appendChild(loginModal);
    }
}

// 收藏按鈕點擊時才檢查登入狀態
window.handleFavoriteClick = function(restaurantId, restaurantName, restaurant) {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        // 顯示登入彈窗
        showLoginModal();
        return;
    }
    
    // 執行收藏邏輯
    window.toggleFavorite(restaurantId, restaurantName, restaurant);
}

// 標籤切換功能
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // 更新按鈕狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 更新內容顯示
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId + 'Tab').classList.add('active');

            // 如果切換到店家標籤且在地圖視圖，更新地圖
            if (tabId === 'stores' && document.getElementById('mapContainer').style.display === 'block') {
                initializeMap();
            }
        });
    });
}

// 載入收藏店家
async function loadStores() {
    const storesGrid = document.querySelector('.stores-grid');
    if (!storesGrid) return;
    
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        storesGrid.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        // 如果沒有收藏，也清空地圖或顯示無數據訊息
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        }
        return;
    }

    storesGrid.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> 載入收藏中...</div>'; // 顯示載入中

    try {
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const favoriteStoresDetails = [];

        // 使用 Promise.all 同時發送 Place Details 請求
        const fetchDetailsPromises = favorites.map(fav => {
            return new Promise((resolve) => {
                service.getDetails({ placeId: fav.id, fields: ['name', 'rating', 'formatted_address', 'geometry', 'photos', 'opening_hours', 'user_ratings_total', 'vicinity', 'types'] }, (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        // 添加原始收藏數據中的名稱作為備用
                        place.savedName = fav.name;
                        favoriteStoresDetails.push(place);
                    } else {
                        console.warn(`無法獲取地點詳細資訊 (${fav.id}):`, status);
                        // 如果無法獲取詳細資訊，使用保存的基本資訊
                        favoriteStoresDetails.push({
                            place_id: fav.id,
                            name: fav.name,
                            savedName: fav.name,
                            basic: true // 標記為基本資訊
                        });
                    }
                    resolve();
                });
            });
        });

        await Promise.all(fetchDetailsPromises);

        if (favoriteStoresDetails.length === 0) {
            storesGrid.innerHTML = '<div class="no-data">載入收藏資料失敗</div>';
            return;
        }

        // 根據獲取到的詳細資訊生成 HTML 卡片
        storesGrid.innerHTML = favoriteStoresDetails.map(place => {
            // 使用 place 數據或基本數據
            const name = place.name || place.savedName || '未知餐廳';
            const placeId = place.place_id;
            
            // 處理圖片
            let imageUrl = 'images/no-image.jpg';
            if (place.photos && place.photos[0] && place.photos[0].getUrl) {
                imageUrl = place.photos[0].getUrl({maxWidth: 400});
            }

            // 處理評分
            const ratingHTML = place.rating !== undefined
                ? `<div class="store-rating"><span class="stars">${'★'.repeat(Math.floor(place.rating))}${place.rating % 1 >= 0.5 ? '½' : ''}</span> ${place.rating.toFixed(1)} (${place.user_ratings_total || 0} 則評論)</div>`
                : '<div class="store-rating">暫無評分</div>';

            // 處理地址
            const addressText = place.vicinity || place.formatted_address || '地址未知';

            // 處理營業狀態
            let statusHTML = '<span class="status-unknown">狀態未知</span>';
            if (place.opening_hours) {
                if (typeof place.opening_hours.isOpen === 'function') {
                    statusHTML = place.opening_hours.isOpen()
                        ? '<span class="status-open">營業中</span>'
                        : '<span class="status-closed">休息中</span>';
                } else if (place.opening_hours.open_now !== undefined) {
                    statusHTML = place.opening_hours.open_now
                        ? '<span class="status-open">營業中</span>'
                        : '<span class="status-closed">休息中</span>';
                }
            }

            return `
                <div class="store-card" data-place-id="${placeId}">
                    <img src="${imageUrl}" alt="${name}" class="store-image" onerror="this.src='images/no-image.jpg'">
                    <button class="favorite-btn" onclick="removeFromFavorites('${placeId}')">
                        <i class="fas fa-heart"></i>
                    </button>
                    <div class="store-info">
                        <h3 class="store-name">${name}</h3>
                        ${ratingHTML}
                        <p class="store-address">${addressText}</p>
                        <div class="store-status">${statusHTML}</div>
                    </div>
                    <div class="store-actions">
                        <button onclick="viewStoreDetail('${placeId}')" class="btn-secondary">查看詳情</button>
                    </div>
                </div>
            `;
        }).join('');

        // 重新初始化地圖並傳入店家詳細數據
        const mapContainer = document.getElementById('mapContainer');
        if (mapContainer && mapContainer.style.display === 'block') {
            initializeMap(favoriteStoresDetails.filter(place => !place.basic));
        }
    } catch (error) {
        console.error('載入收藏店家時發生錯誤:', error);
        storesGrid.innerHTML = '<div class="no-data">載入收藏資料時發生錯誤</div>';
    }
}

// 載入收藏心得
function loadReviews() {
    const reviewsGrid = document.querySelector('.reviews-grid');
    const favoriteReviews = getFavoriteReviews();

    if (favoriteReviews.length === 0) {
        reviewsGrid.innerHTML = '<div class="no-data">還沒有收藏任何心得</div>';
        return;
    }

    reviewsGrid.innerHTML = favoriteReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <img src="${review.avatar}" alt="${review.reviewerName}" class="reviewer-avatar">
                <div>
                    <div class="reviewer-name">${review.reviewerName}</div>
                    <div class="store-name">${review.storeName}</div>
                </div>
            </div>
            <div class="review-content">${review.content}</div>
            <div class="review-footer">
                <div class="review-rating">${'★'.repeat(review.rating)}</div>
                <div class="review-date">${review.date}</div>
            </div>
        </div>
    `).join('');
}

// 初始化地圖
function initializeMap(stores) {
    // 檢查是否已載入 Google Maps API
    if (typeof google === 'undefined') {
        console.error('Google Maps API 未載入');
        return;
    }

    // 如果沒有傳入店家數據，從 localStorage 獲取 Place IDs 並在此處獲取詳細資訊
    const storesToDisplay = stores || [];
    if (storesToDisplay.length === 0) {
         // 如果 stores 為空，但 localStorage 中有 Place ID，可能是第一次載入，則重新執行 loadStores 來獲取數據並呼叫 initializeMap
         if (getFavoriteStores().length > 0 && !stores) {
             loadStores();
             return;
         }
        document.getElementById('map').innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        return;
    }

    const map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: storesToDisplay[0].geometry.location.lat(), lng: storesToDisplay[0].geometry.location.lng() }, // 以第一個店家為中心
        zoom: 13
    });

    // 添加標記
    storesToDisplay.forEach(store => {
        if (store.geometry && store.geometry.location) {
            const marker = new google.maps.Marker({
                position: { lat: store.geometry.location.lat(), lng: store.geometry.location.lng() },
                map: map,
                title: store.name
            });

            // 添加資訊視窗
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div class="map-info-window">
                        <h3>${store.name}</h3>
                        <p>${store.vicinity || '地址未知'}</p>
                        <p>評分：${store.rating !== undefined ? store.rating + ' ★' : '暫無評分'}</p>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
        }
    });
}

// 視圖切換功能
function initializeViewToggle() {
    const listViewBtn = document.getElementById('listViewBtn');
    const mapViewBtn = document.getElementById('mapViewBtn');
    const mapContainer = document.getElementById('mapContainer');
    const storesGrid = document.querySelector('.stores-grid');

    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        mapContainer.style.display = 'none';
        storesGrid.style.display = 'grid';
    });

    mapViewBtn.addEventListener('click', () => {
        mapViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        mapContainer.style.display = 'block';
        storesGrid.style.display = 'none';
        // 重新初始化地圖以確保正確顯示
        initializeMap();
    });
}

// 查看店家詳情
function viewStoreDetail(placeId) {
    // 導向到 storeDetail.html 並傳入 Place ID
    window.location.href = `storeDetail.html?place_id=${placeId}`;
}

// 取消收藏
function removeFromFavorites(placeId) {
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        // 顯示登入彈窗
        showLoginModal();
        return;
    }
    
    // 從收藏中移除
    window.toggleFavorite(placeId, '', null);
    
    // 重新載入收藏列表
    loadStores();
}

// 取消收藏心得
function removeFromFavoriteReviews(reviewId) {
    if (confirm('確定要取消收藏這則心得嗎？')) {
        let favoriteReviews = getFavoriteReviews();
        favoriteReviews = favoriteReviews.filter(review => review.id !== reviewId);
        localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
        
        // 重新載入頁面內容
        loadReviews();
    }
}

// 收藏功能管理
const FavoritesManager = {
    // 獲取所有收藏
    getFavorites() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    },

    // 保存收藏
    saveFavorites(favorites) {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        // 觸發自定義事件
        window.dispatchEvent(new CustomEvent('favoritesUpdated'));
    },

    // 添加收藏
    addFavorite(restaurant) {
        if (!this.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }

        const favorites = this.getFavorites();
        if (!favorites.some(fav => fav.id === restaurant.id)) {
            favorites.push(restaurant);
            this.saveFavorites(favorites);
            this.showToast('已加入收藏！');
            return true;
        }
        return false;
    },

    // 移除收藏
    removeFavorite(restaurantId) {
        if (!this.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }

        const favorites = this.getFavorites();
        const index = favorites.findIndex(fav => fav.id === restaurantId);
        if (index !== -1) {
            favorites.splice(index, 1);
            this.saveFavorites(favorites);
            this.showToast('已移除收藏！');
            return true;
        }
        return false;
    },

    // 檢查是否已收藏
    isFavorite(restaurantId) {
        const favorites = this.getFavorites();
        return favorites.some(fav => fav.id === restaurantId);
    },

    // 檢查是否已登入
    isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    },

    // 顯示登入提示
    showLoginPrompt() {
        showLoginModal();
    },

    // 顯示提示訊息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 顯示 toast
        setTimeout(() => toast.classList.add('show'), 100);

        // 3秒後移除 toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // 更新收藏按鈕狀態
    updateFavoriteButton(button, restaurantId) {
        const isFavorite = this.isFavorite(restaurantId);
        button.innerHTML = `<i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>`;
        button.classList.toggle('active', isFavorite);
    }
};

// 導出 FavoritesManager
window.FavoritesManager = FavoritesManager;

// 檢查是否為收藏狀態
window.isFavorite = function(id) {
    if (!id) return false;
    
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        return false;
    }
    
    // 從 localStorage 獲取收藏列表
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    // 檢查指定 id 的餐廳是否在收藏列表中
    return favorites.some(fav => fav.id === id);
};

// 切換收藏狀態
window.toggleFavorite = function(id, name, restaurant) {
    // 檢查是否已登入
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        showLoginModal();
        return false;
    }
    
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === id);
    
    if (index === -1) {
        // 添加到收藏
        if (restaurant) {
            // 如果有完整的餐廳資訊，保存更多資料
            const restaurantData = {
                id: id,
                name: name,
                address: restaurant.address || '',
                rating: restaurant.rating || 0,
                user_ratings_total: restaurant.user_ratings_total || 0,
                types: restaurant.types || [],
                opening_hours: restaurant.opening_hours || null
            };
            favorites.push(restaurantData);
        } else {
            // 如果沒有完整資訊，只保存基本資料
            favorites.push({ id, name });
        }
        window.showToast('已加入收藏');
    } else {
        // 從收藏中移除
        favorites.splice(index, 1);
        window.showToast('已移除收藏');
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // 如果在收藏頁面，重新載入收藏列表
    if (window.location.href.includes('favoritesView.html') || 
        window.location.href.includes('userCenter.html')) {
        if (typeof loadStores === 'function') {
            loadStores();
        } else if (typeof updateFavoritesList === 'function') {
            updateFavoritesList();
        }
    }
    
    // 重新排序並顯示餐廳列表
    if (window.currentRestaurants && window.infiniteScroll) {
        window.infiniteScroll.setRestaurants([...window.currentRestaurants]);
    }
    
    return favorites.some(fav => fav.id === id);
};

// 清除收藏
window.clearFavorites = function() {
    localStorage.removeItem('favorites');
};