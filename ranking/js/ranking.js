let googleIsLastPage = false;
let customIsLastPage = false;
const pageSize = 5;
let currentFilter = 'all';

// 新增一個全域變數來儲存自訂後端的餐廳資料
window._customPlaces = [];

async function loadGoogleRestaurants(page = 0) {
    if (googleIsLastPage && page > 0) return;

    const restaurantList = document.querySelector('.restaurant-list');
    if (page === 0) {
        restaurantList.innerHTML = '';
    }
    
    try {
        const response = await fetch(`http://localhost:8080/api/lleader/ranking/google?page=${page}&size=${pageSize}&filter=${currentFilter}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pageData = await response.json();
        customList.innerHTML = '';
    }

    try {
        const res = await fetch(`http://localhost:8080/api/rleader/ranking/restaurants?page=${page}&size=${pageSize}&filter=${currentFilter}`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const pageData = await res.json();
        customList.innerHTML = '';
        googleIsLastPage = false;
        customIsLastPage = false;
        
        // 根據點擊的按鈕篩選並重新載入
        currentFilter = btn.dataset.filter;
        // TODO: 實現篩選邏輯，可能需要修改後端 API 呼叫
        console.log("篩選條件:", currentFilter);

        // 重新載入資料
        loadGoogleRestaurants(googleCurrentPage);
    }
} 