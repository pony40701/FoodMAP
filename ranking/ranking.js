document.addEventListener('DOMContentLoaded', function() {
    const googleRestaurantList = document.querySelector('.google-list .restaurant-list');
    const customRestaurantList = document.querySelector('.custom-restaurant-list');
    const loadMoreButton = document.querySelector('.load-more');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let googleCurrentPage = 0;
    let customCurrentPage = 0;
    const pageSize = 10;
    let activeFilter = 'all';
    let isLoading = false;

    async function fetchGoogleRestaurants(page, filter) {
        isLoading = true;
        try {
            const response = await fetch(`http://localhost:8080/api/lleader/ranking/google?page=${page}&size=${pageSize}&filter=${filter}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            renderGoogleRestaurants(data.content);
            googleCurrentPage++;
            if (data.last) {
                loadMoreButton.style.display = 'none';
            }
        } catch (error) {
            console.error('Error fetching Google restaurants:', error);
            googleRestaurantList.innerHTML += '<p>無法載入Google商家資料。</p>';
        } finally {
            isLoading = false;
        }
    }

    async function fetchCustomRestaurants(page, filter) {
        try {
            const response = await fetch(`http://localhost:8080/api/rleader/ranking/restaurants?page=${page}&size=${pageSize}&filter=${filter}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            renderCustomRestaurants(data.content);
            customCurrentPage++;
            if (data.last) {
                // This logic might need adjustment if lists have different lengths
                // For now, we let the Google fetch handle the button display
            }
        } catch (error) {
            console.error('Error fetching custom restaurants:', error);
            customRestaurantList.innerHTML += '<p>無法載入食力派回饋資料。</p>';
        }
    }

    function renderGoogleRestaurants(restaurants) {
        if (restaurants.length === 0 && googleCurrentPage === 0) {
            googleRestaurantList.innerHTML = '<p class="no-data">目前沒有符合條件的餐廳。</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        restaurants.forEach((restaurant, index) => {
            const rank = googleCurrentPage * pageSize + index + 1;
            const restaurantItem = document.createElement('div');
            restaurantItem.className = 'restaurant-item';
            restaurantItem.innerHTML = `
                <div class="rank rank-${rank}">${rank}</div>
                <div class="restaurant-image">
                    <img src="${restaurant.photoUrl || '../images/default-restaurant.jpg'}" alt="${restaurant.name}" loading="lazy">
                </div>
                <div class="restaurant-info">
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <div class="basic-info">
                        <div class="rating">
                            <span class="stars">★</span>
                            <strong>${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</strong>
                            <span>(${restaurant.reviewCount || 0} 則評論)</span>
                        </div>
                    </div>
                    <p class="address"><i class="fas fa-map-marker-alt"></i> ${restaurant.address || '無地址資訊'}</p>
                </div>
                <div class="actions">
                     <button class="details-btn" data-id="${restaurant.placeId}">查看詳情</button>
                </div>
            `;
            fragment.appendChild(restaurantItem);
        });
        googleRestaurantList.appendChild(fragment);
    }

    function renderCustomRestaurants(restaurants) {
        if (restaurants.length === 0 && customCurrentPage === 0) {
            customRestaurantList.innerHTML = '<p class="no-data">目前沒有符合條件的餐廳。</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        restaurants.forEach((restaurant, index) => {
            const rank = customCurrentPage * pageSize + index + 1;
            const restaurantItem = document.createElement('div');
            restaurantItem.className = 'restaurant-item';
            
            // The backend now provides a direct URL, so just use it.
            const imageUrl = restaurant.photoUrl || '../images/restaurant-default.jpg';

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
                            <strong>${restaurant.averageRating ? restaurant.averageRating.toFixed(1) : 'N/A'}</strong>
                            <span>(${restaurant.reviewCount || 0} 則評論)</span>
                        </div>
                    </div>
                    <p class="address"><i class="fas fa-map-marker-alt"></i> ${restaurant.address || '無地址資訊'}</p>
                </div>
                <div class="actions">
                     <button class="details-btn" data-id="${restaurant.id}">查看詳情</button>
                </div>
            `;
            fragment.appendChild(restaurantItem);
        });
        customRestaurantList.appendChild(fragment);
    }
    
    async function resetAndLoad() {
        googleCurrentPage = 0;
        customCurrentPage = 0;
        googleRestaurantList.innerHTML = '';
        customRestaurantList.innerHTML = '';
        loadMoreButton.style.display = 'block';
        isLoading = true;

        // Use Promise.all to fetch both lists in parallel
        await Promise.all([
            fetchGoogleRestaurants(googleCurrentPage, activeFilter),
            fetchCustomRestaurants(customCurrentPage, activeFilter)
        ]);

        isLoading = false;
    }
    
    loadMoreButton.addEventListener('click', () => {
        if (!isLoading) {
            // Parallel fetch on load more as well
            isLoading = true;
            Promise.all([
                fetchGoogleRestaurants(googleCurrentPage, activeFilter),
                fetchCustomRestaurants(customCurrentPage, activeFilter)
            ]).finally(() => {
                isLoading = false;
            });
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

    // Initial load
    resetAndLoad();
});