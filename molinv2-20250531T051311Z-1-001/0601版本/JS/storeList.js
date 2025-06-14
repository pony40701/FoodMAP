// 移除假資料，改用 Google Places API
let placesService;
let currentStores = [];

// 初始化頁面
window.addEventListener('DOMContentLoaded', () => {
    // 初始化 Google Places Service
    if (typeof google !== 'undefined') {
        placesService = new google.maps.places.PlacesService(document.createElement('div'));
        // 搜尋附近的餐廳
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    searchNearbyStores(lat, lng);
                },
                (error) => {
                    console.error('無法獲取位置:', error);
                    // 使用預設位置（台中市南屯區公益路二段51號）
                    searchNearbyStores(24.1477, 120.6470);
                }
            );
        }
    }

    document.getElementById('btn-search').addEventListener('click', handleSearch);
    document.getElementById('type-filter').addEventListener('change', handleSearch);
    document.getElementById('store-search').addEventListener('keypress', e => { if (e.key === 'Enter') handleSearch(); });
    document.querySelector('.btn-login').addEventListener('click', () => alert('登入功能開發中...'));
    document.getElementById('btn-user-center').addEventListener('click', () => alert('用戶中心功能開發中...'));
});

// 搜尋附近的餐廳
function searchNearbyStores(lat, lng) {
    const request = {
        location: new google.maps.LatLng(lat, lng),
        radius: '5000',
        type: ['restaurant']
    };

    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            currentStores = results.map(place => ({
                id: place.place_id,
                name: place.name,
                type: place.types[0],
                rating: place.rating || 0,
                address: place.vicinity,
                isOpen: place.opening_hours?.isOpen() || false,
                image: (place.photos && place.photos[0] && place.photos[0].photo_reference)
                    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=AIzaSyAqANvNvM5qZb9I_nkoMPJz_yjhvYKlKD0`
                    : './IMAGE/default-restaurant.jpg'
            }));
            displayStores(currentStores);
        }
    });
}

function handleSearch() {
    const keyword = document.getElementById('store-search').value.trim().toLowerCase();
    const type = document.getElementById('type-filter').value;
    
    if (keyword) {
        const request = {
            query: keyword,
            type: ['restaurant']
        };

        placesService.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                currentStores = results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    type: place.types[0],
                    rating: place.rating || 0,
                    address: place.vicinity,
                    isOpen: place.opening_hours?.isOpen() || false,
                    image: (place.photos && place.photos[0] && place.photos[0].photo_reference)
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=AIzaSyAqANvNvM5qZb9I_nkoMPJz_yjhvYKlKD0`
                        : './IMAGE/default-restaurant.jpg'
                }));
                
                // 根據類型篩選
                if (type) {
                    currentStores = currentStores.filter(store => store.type === type);
                }
                
                displayStores(currentStores);
            }
        });
    } else if (type) {
        // 如果只有類型篩選，使用現有的搜尋結果進行篩選
        const filtered = currentStores.filter(store => store.type === type);
        displayStores(filtered);
    }
}

function displayStores(stores) {
    const list = document.getElementById('store-list');
    list.innerHTML = '';
    if (stores.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;">查無相關店家</p>';
        return;
    }
    stores.forEach(store => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <img src="${store.image}" alt="${store.name}" class="restaurant-image" onerror="this.style.display='none'">
            <div class="restaurant-info">
                <div class="restaurant-name">${store.name}</div>
                <div class="restaurant-rating">${'★'.repeat(Math.floor(store.rating))}${'☆'.repeat(5-Math.floor(store.rating))} <span style="color:#666;font-size:0.95rem;">${store.rating.toFixed(1)}</span></div>
                <div class="restaurant-address">${store.address}</div>
                <div class="restaurant-status ${store.isOpen ? 'status-open' : 'status-closed'}">${store.isOpen ? '營業中' : '已打烊'}</div>
                <button class="view-btn">查看店家</button>
            </div>
        `;
        card.querySelector('.view-btn').addEventListener('click', e => {
            e.stopPropagation();
            alert(`即將前往「${store.name}」店家頁（功能開發中）`);
        });
        card.addEventListener('click', () => {
            alert(`即將前往「${store.name}」店家頁（功能開發中）`);
        });
        list.appendChild(card);
    });
} 