const GOOGLE_API_KEY = ''; // 此處請填入你的 Google API 金鑰
const ADDRESS = '台中市南屯區公益路二段51號18樓';
const CORS_PROXY = 'https://corsproxy.io/?';

// 分頁相關變數
let googleCurrentPage = 0;
let customCurrentPage = 0;
let googleIsLastPage = false;
let customIsLastPage = false;
const pageSize = 5;

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
    // 為每個圖片元素產生一個唯一的 ID
    const imageId = `restaurant-image-${isCustom ? 'custom' : 'google'}-${index}`;

    let photoUrl = '';
    if (isCustom) {
        // 右側列表先顯示預設圖片，之後再非同步載入真實圖片
        photoUrl = 'https://via.placeholder.com/300x200?text=Loading...';
    } else if (place.photoUrl) {
        photoUrl = place.photoUrl;
    } else if (place.photos) {
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`;
    } else {
        photoUrl = 'https://via.placeholder.com/300x200?text=No+Image';
    }

    const reviewCount = place.reviewCount !== undefined ? place.reviewCount : (place.user_ratings_total || 0);
    const address = place.address || place.vicinity || '';

    return `
        <div class="restaurant-item" data-restaurant-id="${place.restaurantId || ''}">
            <div class="rank rank-${index + 1}">#${index + 1}</div>
            <div class="restaurant-image">
                <img src="${photoUrl}" alt="${place.name}" id="${imageId}">
            </div>
            <div class="restaurant-info">
                <h2 class="restaurant-name">${place.name}</h2>
                <div class="rating">
                    <span class="stars">★★★★☆</span>
                    <span class="score">${place.rating || place.averageRating || 'N/A'}</span>
                    <span class="reviews">(${reviewCount}則評價)</span>
                </div>
                <div class="basic-info">
                    <div><i class="fas fa-map-marker-alt"></i> ${address}</div>
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

async function loadGoogleRestaurants(page = 0) {
    if (googleIsLastPage && page > 0) return; // 如果是最後一頁，且不是初次載入，則不執行

    const restaurantList = document.querySelector('.restaurant-list');
    if (page === 0) {
        restaurantList.innerHTML = ''; // 只有第一頁才清空
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/lleader/ranking/google?page=${page}&size=${pageSize}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pageData = await response.json();
        const places = pageData.content;
        googleIsLastPage = pageData.last;

        // 請注意：此處的排序是針對當前頁面的，並非對所有資料排序。
        // 若要實現全域排序，需在後端完成。
        places.forEach(place => {
            const rating = place.rating || 0;
            const count = place.reviewCount || 0;
            place.compositeScore = rating * Math.log10(count + 1);
        });
        
        // 暫時移除客戶端排序，依賴後端預設排序
        // ...

        if (page === 0) {
            window._googlePlaces = [];
        }
        window._googlePlaces = window._googlePlaces.concat(places);

        places.forEach((place, idx) => {
            const globalIndex = page * pageSize + idx;
            restaurantList.innerHTML += createRestaurantItem(place, globalIndex);
        });

        setupFavoriteButtons();

        // 在資料載入完成後檢查是否要禁用按鈕
        if (page >= 2) {
            googleIsLastPage = true;
        }
        updateLoadMoreButton();
    } catch (e) {
        restaurantList.innerHTML += '載入失敗：' + e.message;
    }
}

async function loadCustomRestaurants(page = 0) {
    if (customIsLastPage && page > 0) return;

    const customList = document.querySelector('.custom-restaurant-list');
    if (page === 0) {
        customList.innerHTML = '';
    }

    try {
        const res = await fetch(`http://localhost:8080/api/rleader/ranking/restaurants?page=${page}&size=${pageSize}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const pageData = await res.json();
        const data = pageData.content;
        customIsLastPage = pageData.last;

        data.forEach(item => {
            const rating = item.averageRating || 0;
            const count = item.reviewCount || 0;
            item.compositeScore = rating * Math.log10(count + 1);
        });
        
        // 暫時移除客戶端排序
        // ...

        data.forEach((item, idx) => {
            const globalIndex = page * pageSize + idx;
            const place = {
                restaurantId: item.restaurantId,
                name: item.name,
                rating: item.averageRating,
                reviewCount: item.reviewCount,
                address: item.address,
            };
            customList.innerHTML += createRestaurantItem(place, globalIndex, true);
        });

        // 非同步載入圖片邏輯也需調整，以處理附加的元素
        document.querySelectorAll('.custom-restaurant-list .restaurant-item:not(.processed)').forEach(async (itemElem) => {
            itemElem.classList.add('processed'); // 標記為已處理
            const restaurantId = itemElem.dataset.restaurantId;
            if (!restaurantId) return;

            try {
                const res = await fetch(`http://localhost:8080/api/rleader/ranking/restaurant/photo/${restaurantId}`);
                if (res.ok) {
                    const data = await res.json();
                    const imgElement = itemElem.querySelector('.restaurant-image img');
                    if (data.photoUrl) {
                        imgElement.src = data.photoUrl;
                    } else {
                        imgElement.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }
                }
            } catch (error) {
                console.error(`Failed to load image for restaurant ${restaurantId}:`, error);
                const imgElement = itemElem.querySelector('.restaurant-image img');
                imgElement.src = 'https://via.placeholder.com/300x200?text=Error';
            }
        });
        
        setupFavoriteButtons();

        // 在資料載入完成後檢查是否要禁用按鈕
        if (page >= 2) {
            customIsLastPage = true;
        }
        updateLoadMoreButton();
    } catch (e) {
        customList.innerHTML += '載入失敗：' + e.message;
    }
}

function updateLoadMoreButton() {
    const loadMoreBtn = document.querySelector('.load-more');
    if (googleIsLastPage && customIsLastPage) {
        loadMoreBtn.textContent = '沒有更多了';
        loadMoreBtn.disabled = true;
    } else {
        loadMoreBtn.textContent = '載入更多';
        loadMoreBtn.disabled = false;
    }
}

function init() {
    loadGoogleRestaurants(googleCurrentPage);
    loadCustomRestaurants(customCurrentPage);

    const loadMoreBtn = document.querySelector('.load-more');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (!googleIsLastPage) {
                googleCurrentPage++;
                loadGoogleRestaurants(googleCurrentPage);
            }
            if (!customIsLastPage) {
                customCurrentPage++;
                loadCustomRestaurants(customCurrentPage);
            }
        });
    }

    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 注意：目前的排序是基於客戶端的，切換排序會重置分頁
            googleCurrentPage = 0;
            customCurrentPage = 0;
            googleIsLastPage = false;
            customIsLastPage = false;
            
            const filterType = button.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // 重新載入時，後端需要支援排序參數，此處暫時只重置並載入第一頁
            loadGoogleRestaurants(0);
            loadCustomRestaurants(0);
        });
    });
}

init(); 