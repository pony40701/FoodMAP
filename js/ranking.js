document.addEventListener('DOMContentLoaded', function() {
    const googleRestaurantList = document.querySelector('.google-list .restaurant-list');
    const customRestaurantList = document.querySelector('.custom-restaurant-list');
    const loadMoreButton = document.querySelector('.load-more');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const MAX_ITEMS_PER_LIST = 15; // 每個列表最多顯示15家
    const INITIAL_PAGE_SIZE = 6; // 初始加載6家
    const SCROLL_PAGE_SIZE = 3;  // 每次滾動加載3家

    // 初始化收藏按鈕處理器
    const favoriteButtonHandler = new FavoriteButton();

    let activeFilter = 'all';
    let isLoading = false;

    // 初始隱藏加載更多按鈕
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }

    // 檢查是否達到上限並顯示按鈕
    function checkAndShowLoadMore() {
        const googleItems = googleRestaurantList.querySelectorAll('.restaurant-item').length;
        // 當滾動加載的項目達到或超過上限時，就顯示按鈕
        if (googleItems >= MAX_ITEMS_PER_LIST) {
            if (loadMoreButton) loadMoreButton.style.display = 'block';
        }
    }

    // 將 fetch 邏輯簡化，只負責獲取數據
    async function fetchGoogleData(page, filter, pageSize) {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${window.API_BASE_URL}/lleader/ranking/google?page=${page}&size=${pageSize}&filter=${filter}&timestamp=${timestamp}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            googleRestaurantList.innerHTML += '<p>無法載入Google商家資料。</p>';
            return null; // 返回 null 以便調用者處理
        }
    }

    async function fetchCustomData(page, filter, pageSize) {
        try {
            const timestamp = new Date().getTime();
            const response = await fetch(`${window.API_BASE_URL}/rleader/ranking/restaurants?page=${page}&size=${pageSize}&filter=${filter}&timestamp=${timestamp}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        } catch (error) {
            customRestaurantList.innerHTML += '<p>無法載入食力派回饋資料。</p>';
            return null; // 返回 null
        }
    }

    function createRestaurantItemElement(restaurant, rank, type) {
        const restaurantItem = document.createElement('div');
        restaurantItem.className = 'restaurant-item';
    
        const isGoogle = type === 'google';
        
        const id = isGoogle ? restaurant.placeId : restaurant.restaurantId;
        const rating = isGoogle ? restaurant.rating : restaurant.averageRating;
        const imageUrl = isGoogle 
            ? (restaurant.photoUrl || '../images/default-restaurant.jpg') 
            : '../images/restaurant-default.jpg';
    
        restaurantItem.innerHTML = `
            <div class="rank rank-${rank}">${rank}</div>
            <div class="restaurant-image">
                <img src="${imageUrl}" alt="${restaurant.name}" loading="lazy">
            </div>
            <div class="restaurant-info">
                <h3 class="restaurant-name">${restaurant.name}</h3>
                <div class="basic-info">
                    <div class="rating">
                        <span class="stars">★</span>
                        <strong>${rating ? rating.toFixed(1) : 'N/A'}</strong>
                        <span>(${restaurant.reviewCount || 0} 則評論)</span>
                    </div>
                </div>
                <p class="address"><i class="fas fa-map-marker-alt"></i> ${restaurant.address || '無地址資訊'}</p>
                <div class="actions">
                     <button class="favorite-btn" data-place-id="${id}"><i class="far fa-heart"></i> 收藏</button>
                     <button class="details-btn" data-id="${id}">查看詳情</button>
                </div>
            </div>
        `;
    
        if (!isGoogle) {
            const imgElement = restaurantItem.querySelector('img');
            imgElement.dataset.restaurantId = restaurant.restaurantId;
        }
    
        const detailsBtn = restaurantItem.querySelector('.details-btn');
        if (detailsBtn) {
            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const restaurantId = detailsBtn.dataset.id;
                window.location.href = `restaurantListDetail.html?restaurantId=${restaurantId}`;
            });
        }
    
        return restaurantItem;
    }

    function renderGoogleRestaurants(restaurants) {
        if (!restaurants || restaurants.length === 0) return;

        const fragment = document.createDocumentFragment();
        const initialCount = googleRestaurantList.children.length;

        for (const [index, restaurant] of restaurants.entries()) {
            if (initialCount + index >= MAX_ITEMS_PER_LIST) {
                checkAndShowLoadMore();
                break;
            }
            const rank = initialCount + index + 1;
            const restaurantItem = createRestaurantItemElement(restaurant, rank, 'google');
            fragment.appendChild(restaurantItem);
        }
        googleRestaurantList.appendChild(fragment);
        favoriteButtonHandler.initialize();
    }

    function renderCustomRestaurants(restaurants) {
        if (!restaurants || restaurants.length === 0) return;

        const fragment = document.createDocumentFragment();
        const initialCount = customRestaurantList.children.length;
        for (const [index, restaurant] of restaurants.entries()) {
            if (initialCount + index >= MAX_ITEMS_PER_LIST) {
                checkAndShowLoadMore();
                break;
            }
            const rank = initialCount + index + 1;
            const restaurantItem = createRestaurantItemElement(restaurant, rank, 'custom');
            fragment.appendChild(restaurantItem);
        }
        customRestaurantList.appendChild(fragment);

        // 非同步加載圖片
        restaurants.forEach(restaurant => {
            const imgElement = customRestaurantList.querySelector(`img[data-restaurant-id="${restaurant.restaurantId}"]`);
            if (imgElement) {
                fetch(`${window.API_BASE_URL}/rleader/ranking/restaurant/photo/${restaurant.restaurantId}`)
                    .then(response => {
                        if (response.ok) {
                            return response.blob();
                        }
                        throw new Error('Image not found.');
                    })
                    .then(blob => {
                        imgElement.src = URL.createObjectURL(blob);
                    })
                    .catch(error => {
                        // 圖片加載失敗，維持預設圖片
                    });
            }
        });

        favoriteButtonHandler.initialize();
    }
    
    // 將加載和渲染邏輯集中處理
    async function loadAndRender(pageSize, isInitialLoad = false) {
        if (isLoading) return;

        const totalItems = googleRestaurantList.querySelectorAll('.restaurant-item').length;
        if (!isInitialLoad && totalItems >= MAX_ITEMS_PER_LIST) {
            checkAndShowLoadMore();
            return;
        }

        isLoading = true;
        
        const googleItemsLoaded = googleRestaurantList.children.length;
        const customItemsLoaded = customRestaurantList.children.length;

        const googlePage = Math.floor(googleItemsLoaded / pageSize);
        const customPage = Math.floor(customItemsLoaded / pageSize);

        try {
            // Promise.all 會等待兩個請求都完成
            const [googleData, customData] = await Promise.all([
                fetchGoogleData(googlePage, activeFilter, pageSize),
                fetchCustomData(customPage, activeFilter, pageSize)
            ]);

            const googleContent = googleData?.content;
            const customContent = customData?.content;

            if (googleContent?.length > 0) {
                renderGoogleRestaurants(googleContent);
            }
            if (customContent?.length > 0) {
                renderCustomRestaurants(customContent);
            }

        } catch (error) {
            // silent fail
        } finally {
            isLoading = false;
            // 檢查是否需要顯示"加載更多"按鈕
            checkAndShowLoadMore();
        }
    }

    async function resetAndLoad() {
        googleRestaurantList.innerHTML = '';
        customRestaurantList.innerHTML = '';
        isLoading = false; 
        if (loadMoreButton) loadMoreButton.style.display = 'none';

        await loadAndRender(INITIAL_PAGE_SIZE, true);
        await favoriteButtonHandler.initialize();
    }
    
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', (e) => {
            e.preventDefault(); // 加上 preventDefault 以確保行為一致
            window.location.href = 'restaurantList.html';
        });
    }

    window.addEventListener('scroll', () => {
        const totalItems = googleRestaurantList.querySelectorAll('.restaurant-item').length;
        if (isLoading || totalItems >= MAX_ITEMS_PER_LIST) {
            return;
        }

        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 150) {
            loadAndRender(SCROLL_PAGE_SIZE);
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (isLoading) return;
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeFilter = button.dataset.filter;
            resetAndLoad();
        });
    });

    resetAndLoad();

    if (window.favoriteSystem) {
        window.favoriteSystem.initialize().then(() => {
            console.log('收藏系統初始化完成');
            favoriteButtonHandler.initialize(); // 確保初始載入時按鈕狀態正確
        });
    }
});