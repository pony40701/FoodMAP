const GOOGLE_API_KEY = ''; // 此處請填入你的 Google API 金鑰
const ADDRESS = '台中市南屯區公益路二段51號18樓';
const CORS_PROXY = 'https://corsproxy.io/?';

async function getLatLng(address) {
    const url = CORS_PROXY + encodeURIComponent(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`);
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK') {
        return data.results[0].geometry.location;
    }
    throw new Error('找不到地址');
}

async function getNearbyRestaurants(lat, lng) {
    const url = CORS_PROXY + encodeURIComponent(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=1000&type=restaurant&language=zh-TW&key=${GOOGLE_API_KEY}`);
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 'OK') {
        return data.results;
    }
    throw new Error('找不到附近餐廳');
}

function createRestaurantItem(place, index, isCustom = false) {
    let photoUrl = '';
    if (isCustom) {
        photoUrl = place.image || 'https://via.placeholder.com/300x200?text=No+Image';
    } else {
        photoUrl = place.photos
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : 'https://via.placeholder.com/300x200?text=No+Image';
    }
    return `
        <div class="restaurant-item">
            <div class="rank rank-${index + 1}">#${index + 1}</div>
            <div class="restaurant-image">
                <img src="${photoUrl}" alt="${place.name}">
            </div>
            <div class="restaurant-info">
                <h2 class="restaurant-name">${place.name}</h2>
                <div class="rating">
                    <span class="stars">★★★★☆</span>
                    <span class="score">${place.rating || 'N/A'}</span>
                    <span class="reviews">(${place.user_ratings_total || 0}則評價)</span>
                </div>
                <div class="basic-info">
                    <div><i class="fas fa-map-marker-alt"></i> ${place.vicinity || place.address || ''}</div>
                </div>
                <div class="actions">
                    <button class="favorite-btn">♡</button>
                    <button class="details-btn">查看詳情</button>
                </div>
            </div>
        </div>
    `;
}

function showRestaurantDetail(place) {
    const modal = document.getElementById('restaurantModal');
    const modalContent = modal.querySelector('.restaurant-detail');
    const photoUrl = place.photos
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
        : 'https://via.placeholder.com/300x200?text=No+Image';
    modalContent.innerHTML = `
        <div class="detail-image">
            <img src="${photoUrl}" alt="${place.name}">
            <button class="modal-close">&times;</button>
        </div>
        <div class="detail-content">
            <div class="detail-header">
                <div class="detail-title">
                    ${place.name}
                    <button class="favorite-btn" title="收藏">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                <div class="detail-rating">
                    <div class="score">${place.rating || 'N/A'}</div>
                    <div class="reviews">(${place.user_ratings_total || 0}則評論)</div>
                </div>
            </div>
            <div class="detail-info">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${place.vicinity || ''}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>無電話資訊</span>
                </div>
                <div class="info-item open">
                    <i class="fas fa-clock"></i>
                    <span>營業狀態未知</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>價格資訊無</span>
                </div>
            </div>
            <div class="detail-tags">
                <span class="detail-tag">${place.types ? place.types.join(', ') : ''}</span>
            </div>
        </div>
    `;
    modal.style.display = 'block';
    // 關閉按鈕功能
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
    // 點擊模態框外部關閉
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    // 收藏按鈕功能
    const favoriteBtn = modal.querySelector('.favorite-btn');
    favoriteBtn.onclick = (e) => {
        e.stopPropagation();
        favoriteBtn.classList.toggle('active');
        const icon = favoriteBtn.querySelector('i');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
    };
}

function setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            btn.classList.toggle('active');
            btn.innerHTML = btn.classList.contains('active') ? '♥' : '♡';
        };
    });
    // 詳情按鈕
    const detailButtons = document.querySelectorAll('.details-btn');
    detailButtons.forEach((btn, idx) => {
        btn.onclick = () => {
            const restaurantList = document.querySelectorAll('.restaurant-item');
            const restaurantItem = btn.closest('.restaurant-item');
            const index = Array.from(restaurantList).indexOf(restaurantItem);
            if (window._googlePlaces && window._googlePlaces[index]) {
                showRestaurantDetail(window._googlePlaces[index]);
            }
        };
    });
}

async function loadGoogleRestaurants(sortType = 'composite') {
    const restaurantList = document.querySelector('.restaurant-list');
    restaurantList.innerHTML = '載入中...';
    try {
        const { lat, lng } = await getLatLng(ADDRESS);
        let places = await getNearbyRestaurants(lat, lng);

        // 加入綜合分數：評分 × log10(評價數+1)
        places.forEach(place => {
            const rating = place.rating || 0;
            const count = place.user_ratings_total || 0;
            place.compositeScore = rating * Math.log10(count + 1);
        });

        // 排序
        if (sortType === 'weekly') {
            // 本周熱門：依評價數排序（多到少）
            places.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
        } else if (sortType === 'new') {
            // 新店推薦：依評價數排序（少到多）
            places.sort((a, b) => (a.user_ratings_total || 0) - (b.user_ratings_total || 0));
        } else {
            // 綜合分數排序
            places.sort((a, b) => b.compositeScore - a.compositeScore);
        }

        window._googlePlaces = places;
        restaurantList.innerHTML = '';
        places.slice(0, 5).forEach((place, idx) => {
            restaurantList.innerHTML += createRestaurantItem(place, idx);
        });
        setupFavoriteButtons();
    } catch (e) {
        restaurantList.innerHTML = '載入失敗：' + e.message;
    }
}

async function loadCustomRestaurants(sortType = 'composite') {
    const customList = document.querySelector('.custom-restaurant-list');
    customList.innerHTML = '載入中...';
    try {
        const res = await fetch('/api/reviews');
        let data = await res.json();

        data.forEach(item => {
            const rating = item.overallScore || 0;
            const count = item.totalViews || 0;
            item.compositeScore = rating * Math.log10(count + 1);
        });

        if (sortType === 'weekly') {
            data.sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0));
        } else if (sortType === 'new') {
            data.sort((a, b) => (a.totalViews || 0) - (b.totalViews || 0));
        } else {
            data.sort((a, b) => b.compositeScore - a.compositeScore);
        }

        customList.innerHTML = '';
        data.slice(0, 5).forEach((item, idx) => {
            const place = {
                name: item.restaurantName,
                rating: item.overallScore,
                user_ratings_total: item.totalViews,
                vicinity: '地址資訊待補',
                image: item.imageUrl
            };
            customList.innerHTML += createRestaurantItem(place, idx, true);
        });
        setupFavoriteButtons();
    } catch (e) {
        customList.innerHTML = '載入失敗：' + e.message;
    }
}

function init() {
    loadGoogleRestaurants();
    loadCustomRestaurants();
    // 載入更多按鈕功能
    const loadMoreBtn = document.querySelector('.load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            alert('如需載入更多，請升級API串接分頁功能');
        });
    }
    // 過濾按鈕功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterType = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (filterType === 'weekly') {
                loadGoogleRestaurants('weekly');
                loadCustomRestaurants('weekly');
            } else if (filterType === 'new') {
                loadGoogleRestaurants('new');
                loadCustomRestaurants('new');
            } else {
                loadGoogleRestaurants('composite');
                loadCustomRestaurants('composite');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', init); 