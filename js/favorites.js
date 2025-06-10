// 從 localStorage 獲取收藏數據
function getFavoriteStores() {
    return JSON.parse(localStorage.getItem('favoriteStores')) || [];
}

function getFavoriteReviews() {
    return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'userLogin.html';
        return;
    }

    initializeTabs();
    loadStores();
    loadReviews();
    initializeMap();
    initializeViewToggle();
});

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
    const favoritePlaceIds = getFavoriteStores(); // 從 localStorage 獲取的是 Place ID 列表

    if (favoritePlaceIds.length === 0) {
        storesGrid.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        // 如果沒有收藏，也清空地圖或顯示無數據訊息
        if (document.getElementById('mapContainer').style.display === 'block') {
             document.getElementById('map').innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        }
        return;
    }

    storesGrid.innerHTML = ''; // 清空現有內容

    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const favoriteStoresDetails = [];

    // 使用 Promise.all 同時發送 Place Details 請求
    const fetchDetailsPromises = favoritePlaceIds.map(placeId => {
        return new Promise((resolve, reject) => {
            service.getDetails({ placeId: placeId /* fields parameter removed */ }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    favoriteStoresDetails.push(place);
                    resolve();
                } else {
                    console.error('Place Details request failed for', placeId, 'with status:', status);
                    resolve(); // 即使失敗也 resolve，不中斷 Promise.all
                }
            });
        });
    });

    await Promise.all(fetchDetailsPromises);

    // 根據獲取到的詳細資訊生成 HTML 卡片
    storesGrid.innerHTML = favoriteStoresDetails.map(place => {
        const imageUrl = (place.photos && place.photos[0])
            ? (place.photos[0].getUrl ? place.photos[0].getUrl({maxWidth: 400}) : (
                place.photos[0].photo_reference
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=AIzaSyAqANvNvM5qZb9I_nkoMPJz_yjhvYKlKD0`
                    : './IMAGE/default-restaurant.jpg'
              ))
            : './IMAGE/default-restaurant.jpg';

        const ratingHTML = place.rating !== undefined
            ? `<div class="store-rating"><span class="stars">${'★'.repeat(Math.floor(place.rating))}${place.rating % 1 ? '½' : ''}</span> ${place.rating} (${place.user_ratings_total || 0} 則評論)</div>`
            : '<div class="store-rating">暫無評分</div>';

        const addressText = place.vicinity || '地址未知';

         const openingHoursText = place.opening_hours
             ? (place.opening_hours.isOpen() ? '<span class="status-open">營業中</span>' : '<span class="status-closed">休息中</span>')
             : '<span class="status-closed">狀態未知</span>'; // 無法獲取營業時間

        return `
            <div class="store-card" data-place-id="${place.place_id}">
                <img src="${imageUrl}" alt="${place.name}" class="store-image">
                <button class="favorite-btn" onclick="removeFromFavorites('${place.place_id}')">
                    <i class="fas fa-star"></i>
                </button>
                <div class="store-info">
                    <h3 class="store-name">${place.name}</h3>
                    ${ratingHTML}
                    <p class="store-address">${addressText}</p>
                    <div class="store-status">${openingHoursText}</div>
                </div>
                <div class="store-actions">
                     <button onclick="viewStoreDetail('${place.place_id}')" class="btn-secondary">查看詳情</button>
                </div>
            </div>
        `;
    }).join('');

    // 重新初始化地圖並傳入店家詳細數據
    if (document.getElementById('mapContainer').style.display === 'block') {
        initializeMap(favoriteStoresDetails);
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
    if (confirm('確定要取消收藏這家店嗎？')) {
        let favoritePlaceIds = getFavoriteStores();
        // 過濾掉匹配 placeId 的店家
        favoritePlaceIds = favoritePlaceIds.filter(id => id !== placeId);
        localStorage.setItem('favoriteStores', JSON.stringify(favoritePlaceIds));
        
        // 重新載入頁面內容
        loadStores();
    }
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