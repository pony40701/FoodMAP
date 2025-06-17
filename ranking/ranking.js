const GOOGLE_API_KEY = ''; // 此處請填入你的 Google API 金鑰
const ADDRESS = '台中市南屯區公益路二段51號18樓';
const CORS_PROXY = 'https://corsproxy.io/?';

// 分頁相關變數
let googleCurrentPage = 0;
let customCurrentPage = 0;
let googleIsLastPage = false;
let customIsLastPage = false;
const pageSize = 5;
let currentFilter = 'all'; // 新增：儲存當前的篩選條件

// 新增一個全域變數來儲存自訂後端的餐廳資料
window._customPlaces = [];

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
    const id = isCustom ? place.restaurantId : place.placeId;
    const source = isCustom ? 'custom' : 'google';

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

    const reviewCount = place.reviewCount || 0;
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
                    <button class="details-btn" data-id="${id}" data-source="${source}">查看詳情</button>
                </div>
            </div>
        </div>
    `;
}

// 轉換自訂後端資料為通用格式
function adaptCustomToDetail(place) {
    return {
        id: place.restaurantId,
        name: place.name,
        photoUrl: place.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image', // 假設 custom place 有 imageUrl
        rating: place.averageRating,
        reviewCount: place.reviewCount,
        address: place.address || place.vicinity || '',
        phone: place.phone,
        isOpen: place.open, // 假設有這些屬性
        priceLevel: place.priceLevel,
        types: place.categories || []
    };
}

// 轉換 Google Places 資料為通用格式
function adaptGoogleToDetail(place) {
    const photoRef = place.photos ? place.photos[0].photo_reference : null;
    return {
        id: place.place_id,
        name: place.name,
        photoUrl: photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${GOOGLE_API_KEY}` : 'https://via.placeholder.com/300x200?text=No+Image',
        rating: place.rating,
        reviewCount: place.reviewCount || place.user_ratings_total || 0,
        address: place.vicinity || place.address || '',
        phone: place.formatted_phone_number,
        isOpen: place.opening_hours ? place.opening_hours.open_now : '未知',
        priceLevel: place.price_level,
        types: place.types || []
    };
}

function showRestaurantDetail(place) {
    const modal = document.getElementById('restaurantModal');
    const modalContent = modal.querySelector('.restaurant-detail');
    
    const isOpenText = place.isOpen === true ? '營業中' : (place.isOpen === false ? '已打烊' : '營業狀態未知');
    const priceText = place.priceLevel ? '$'.repeat(place.priceLevel) : '價格資訊無';

    modalContent.innerHTML = `
        <div class="detail-image">
            <img src="${place.photoUrl}" alt="${place.name}">
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
                    <div class="reviews">(${place.reviewCount || 0}則評論)</div>
                </div>
            </div>
            <div class="detail-info">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${place.address || ''}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <span>${place.phone || '無電話資訊'}</span>
                </div>
                <div class="info-item ${place.isOpen ? 'open' : ''}">
                    <i class="fas fa-clock"></i>
                    <span>${isOpenText}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-dollar-sign"></i>
                    <span>${priceText}</span>
                </div>
            </div>
            <div class="detail-tags">
                <span class="detail-tag">${place.types.join(', ')}</span>
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

function setupActionButtons() { // 更名以反映更廣泛的功能
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
    detailButtons.forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const source = btn.dataset.source;
            let placeData;

            if (source === 'google') {
                const place = window._googlePlaces.find(p => p.placeId === id);
                if(place) placeData = adaptGoogleToDetail(place);
            } else {
                // 注意: restaurantId 可能是數字或字串，使用 == 進行比較
                const place = window._customPlaces.find(p => p.restaurantId == id);
                if(place) placeData = adaptCustomToDetail(place);
            }

            if (placeData) {
                showRestaurantDetail(placeData);
            } else {
                console.error('Restaurant not found for id:', id, 'and source:', source);
                alert('抱歉，找不到該餐廳的詳細資訊。');
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
        // 將篩選條件加入 API 請求
        const response = await fetch(`http://localhost:8080/api/lleader/ranking/google?page=${page}&size=${pageSize}&filter=${currentFilter}`);
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
            restaurantList.innerHTML += createRestaurantItem(place, globalIndex, false);
        });

        setupActionButtons();

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
        // 將篩選條件加入 API 請求
        const res = await fetch(`http://localhost:8080/api/rleader/ranking/restaurants?page=${page}&size=${pageSize}&filter=${currentFilter}`);
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

        if (page === 0) {
            window._customPlaces = [];
        }
        window._customPlaces = window._customPlaces.concat(data);

        data.forEach((item, idx) => {
            const globalIndex = page * pageSize + idx;
            const place = {
                restaurantId: item.restaurantId,
                name: item.name,
                rating: item.averageRating,
                reviewCount: item.reviewCount,
                address: item.address,
                photoUrl: item.imageUrl, // 假設後端返回 imageUrl
                // 將 item 其他需要的屬性也加入 place 物件
            };
            customList.innerHTML += createRestaurantItem(place, globalIndex, true);
        });

        // 為新載入的項目設定事件監聽器
        setupActionButtons();

        updateLoadMoreButton();
    } catch (e) {
        console.error('Error fetching custom restaurants:', e);
        customList.innerHTML += '<p>無法載入食力派饕客回饋店家。</p>';
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
    loadMoreBtn.addEventListener('click', () => {
        if (!googleIsLastPage) {
            googleCurrentPage++;
        }
        if (!customIsLastPage) {
            customCurrentPage++;
        }
        loadGoogleRestaurants(googleCurrentPage);
        loadCustomRestaurants(customCurrentPage);
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // 清除現有列表並重置頁碼
            document.querySelector('.restaurant-list').innerHTML = '';
            document.querySelector('.custom-restaurant-list').innerHTML = '';
            googleCurrentPage = 0;
            customCurrentPage = 0;
            googleIsLastPage = false;
            customIsLastPage = false;
            
            // 根據點擊的按鈕篩選並重新載入
            currentFilter = btn.dataset.filter; // 更新篩選條件
            console.log("篩選條件:", currentFilter);

            // 重新載入資料
            loadGoogleRestaurants(googleCurrentPage);
            loadCustomRestaurants(customCurrentPage);

            // 更新按鈕的 active 狀態
            document.querySelector('.filter-btn.active').classList.remove('active');
            btn.classList.add('active');
        });
    });
}

document.addEventListener('DOMContentLoaded', init); 