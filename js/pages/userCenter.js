import favoritesCore from '../core/favoritesCore.js';

// 載入收藏
async function loadFavorites(type = 'stores') {
    const storesContainer = document.querySelector('.favorites-stores');
    const reviewsContainer = document.querySelector('.favorites-reviews');
    
    if (!storesContainer || !reviewsContainer) {
        console.error('找不到收藏列表的容器元素');
        return;
    }

    if (type === 'stores') {
        const favoritePlaceIds = favoritesCore.getFavoriteStores();
        
        if (favoritePlaceIds.length === 0) {
            storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        } else {
            // 顯示載入中
            storesContainer.innerHTML = '<div class="loading">載入收藏店家中...</div>';
            
            // 使用 Google Places API 獲取店家詳細資訊
            try {
                const favoriteStoresDetails = await getFavoriteStoresDetails(favoritePlaceIds);
                
                if (favoriteStoresDetails.length === 0) {
                    storesContainer.innerHTML = '<div class="no-data">無法載入收藏店家資訊</div>';
                } else {
                    storesContainer.innerHTML = favoriteStoresDetails.map(store => `
                        <div class="store-card" data-place-id="${store.place_id}">
                            <img src="${store.image}" alt="${store.name}" class="store-image">
                            <button class="favorite-btn" onclick="removeFromFavorites('${store.place_id}')">
                                <i class="fas fa-star"></i>
                            </button>
                            <div class="store-info">
                                <h3 class="store-name">${store.name}</h3>
                                <div class="store-rating">
                                    ${store.rating ? `<span class="stars">${'★'.repeat(Math.floor(store.rating))}${(store.rating % 1) >= 0.5 ? '½' : ''}</span> ${store.rating}` : '暫無評分'}
                                    ${store.user_ratings_total ? ` (${store.user_ratings_total} 則評論)` : ''}
                                </div>
                                <p class="store-address">${store.address || '地址未知'}</p>
                                <div class="store-status">
                                    ${store.isOpen !== undefined ? 
                                        (store.isOpen ? '<span class="status-open">營業中</span>' : '<span class="status-closed">休息中</span>') 
                                        : '<span class="status-unknown">狀態未知</span>'
                                    }
                                </div>
                            </div>
                            <div class="store-actions">
                                <button onclick="viewStoreDetail('${store.place_id}')" class="btn-secondary">查看詳情</button>
                                <button onclick="removeFromFavorites('${store.place_id}')" class="btn-secondary">取消收藏</button>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('載入收藏店家時發生錯誤:', error);
                if (error.message === 'Google Maps API 未載入') {
                    storesContainer.innerHTML = '<div class="no-data">Google Maps API 未載入，請檢查網路連線或稍後再試</div>';
                } else {
                    storesContainer.innerHTML = '<div class="no-data">載入收藏店家時發生錯誤</div>';
                }
            }
        }
        
        storesContainer.style.display = 'grid';
        reviewsContainer.style.display = 'none';

    } else { // type === 'reviews'
        const favoriteReviews = favoritesCore.getFavoriteReviews();
        if (favoriteReviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏任何心得</div>';
        } else {
            reviewsContainer.innerHTML = favoriteReviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <img src="${review.avatar || '../IMAGE/default_avatar.jpg'}" alt="${review.author || review.reviewerName || '匿名'}" class="reviewer-avatar">
                        <div>
                            <div class="reviewer-name">${review.author || review.reviewerName || '匿名'}</div>
                            <div class="store-name">${review.storeName}</div>
                        </div>
                        <button class="favorite-btn" onclick="removeFromFavoriteReviews(${review.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="review-content">${review.content}</div>
                    <div class="review-footer">
                        <div class="review-rating">${'★'.repeat(review.rating)}</div>
                        <div class="review-date">${review.date || new Date(review.time || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div class="review-actions">
                        <button onclick="viewReviewDetail(${review.id})" class="btn-secondary">查看詳情</button>
                    </div>
                </div>
            `).join('');
        }
        storesContainer.style.display = 'none';
        reviewsContainer.style.display = 'grid';
    }
}

// 使用 Google Places API 獲取收藏店家的詳細資訊
async function getFavoriteStoresDetails(placeIds) {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        throw new Error('Google Maps API 未載入');
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const stores = [];

    // 使用 Promise.all 同時處理所有請求
    await Promise.all(placeIds.map(placeId => {
        return new Promise((resolve, reject) => {
            service.getDetails(
                { placeId: placeId },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        // 整理店家資訊
                        stores.push({
                            place_id: place.place_id,
                            name: place.name,
                            address: place.formatted_address || place.vicinity,
                            rating: place.rating,
                            user_ratings_total: place.user_ratings_total,
                            image: place.photos ? place.photos[0].getUrl({maxWidth: 300}) : '../IMAGE/default-restaurant.jpg',
                            isOpen: place.opening_hours ? place.opening_hours.isOpen() : undefined
                        });
                    } else {
                        console.warn(`無法獲取店家資訊: ${placeId}, 狀態: ${status}`);
                    }
                    resolve(); // 不論成功失敗都resolve，避免單一店家錯誤影響整體
                }
            );
        });
    }));

    return stores;
}

// 從收藏中移除店家
function removeFromFavorites(placeId) {
    if (confirm('確定要取消收藏這家店嗎？')) {
        if (favoritesCore.removeStore(placeId)) {
            showToast('已取消收藏');
            loadFavorites('stores'); // 重新載入收藏列表
        }
    }
}

// 從收藏中移除心得
function removeFromFavoriteReviews(reviewId) {
    if (confirm('確定要取消收藏這則心得嗎？')) {
        if (favoritesCore.removeReview(reviewId)) {
            showToast('已取消收藏心得');
            loadFavorites('reviews'); // 重新載入收藏列表
        }
    }
}

// 顯示 Toast 提示
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 顯示 Toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // 3秒後隱藏並移除 Toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 查看店家詳情
function viewStoreDetail(placeId) {
    // 跳轉到店家詳情頁面
    window.location.href = `storeDetail.html?place_id=${placeId}`;
}

// 查看心得詳情
function viewReviewDetail(reviewId) {
    // 跳轉到心得詳情頁面
    window.location.href = `foodReviewList.html?review_id=${reviewId}`;
}

// 收藏心得功能
function addToFavoriteReviews(review) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入會員');
        return;
    }

    if (favoritesCore.addReview(review)) {
        showToast(`已收藏 ${review.storeName} 的心得`);
        loadFavorites('reviews'); // 重新載入收藏列表
    } else {
        showToast('此心得已在收藏清單中');
    }
}

// 修改 switchFavoritesTab 函式
function switchFavoritesTab(tab) {
    // 移除所有標籤按鈕的 active 類別
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // 添加 active 類別到選中的標籤按鈕
    const targetTabBtn = document.querySelector(`.favorites-tabs .tab-btn[data-tab="${tab}"]`);
    if (targetTabBtn) {
        targetTabBtn.classList.add('active');
    }

    // 載入對應的收藏內容
    loadFavorites(tab);
}

// 初始化收藏功能
function initializeFavorites() {
    // 確保收藏標籤按鈕正確設置
    switchFavoritesTab('stores');
    
    // 監聽收藏狀態變更
    favoritesCore.onStateChange('stores', () => loadFavorites('stores'));
    favoritesCore.onStateChange('reviews', () => loadFavorites('reviews'));
}

// 檢查登入狀態
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
    // 檢查登入狀態
    checkLoginStatus();
    // 初始化收藏功能
    initializeFavorites();
    // 安全綁定登出按鈕
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.logout) window.logout();
        });
    }
});

// 導出公共函數
window.removeFromFavorites = removeFromFavorites;
window.removeFromFavoriteReviews = removeFromFavoriteReviews;
window.viewStoreDetail = viewStoreDetail;
window.viewReviewDetail = viewReviewDetail;
window.addToFavoriteReviews = addToFavoriteReviews;
window.switchFavoritesTab = switchFavoritesTab;
