document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const foodTypeBtn = document.getElementById('foodTypeBtn');
    const foodTypeModal = document.getElementById('foodTypeModal');
    const closeModal = foodTypeModal.querySelector('.close-modal');
    const applyBtn = foodTypeModal.querySelector('.btn-apply');
    const clearBtn = foodTypeModal.querySelector('.btn-clear');
    const filterItems = document.querySelectorAll('.category-item[data-filter]');
    const searchInput = document.getElementById('content-search');
    const searchBtn = document.querySelector('.content-search-btn');
    const foodGrid = document.querySelector('.food-grid');

    // State
    let allArticles = []; // To store all articles fetched from the backend

    // --- MOCK DATA ---
    const mockArticles = [
        { id: 1, user: { name: '美食達人小明', avatar: 'https://i.pravatar.cc/40?img=1' }, rating: 5, title: '台北信義區隱藏版日式拉麵', restaurant: '麵屋武藏', imageUrl: '/images/restaurant1.jpg', excerpt: '這家位於信義區巷弄內的拉麵店，湯頭濃郁，叉燒軟嫩多汁，值得一試！', date: '2024-03-20', category: '日式', views: 150, favorited: false },
        { id: 2, user: { name: '早餐控大王', avatar: 'https://i.pravatar.cc/40?img=2' }, rating: 4, title: '老字號台式早餐店推薦', restaurant: '阜杭豆漿', imageUrl: '/images/carousel2.jpg', excerpt: '傳統台式早餐店，蛋餅外酥內軟，搭配特製醬料，每天都想吃！', date: '2024-03-19', category: '台式', views: 320, favorited: true },
        { id: 3, user: { name: '義食主義者', avatar: 'https://i.pravatar.cc/40?img=3' }, rating: 5, title: '道地義大利手工披薩', restaurant: 'Pizzeria Oggi', imageUrl: '/images/restaurant2.jpg', excerpt: '採用進口食材，薄脆餅皮配上新鮮配料，道地義式風味！', date: '2024-03-18', category: '義式', views: 280, favorited: false },
        { id: 4, user: { name: '泰式美食家', avatar: 'https://i.pravatar.cc/40?img=4' }, rating: 5, title: '隱藏版泰式船麵', restaurant: '船麵小廚', imageUrl: '/images/restaurant3.jpg', excerpt: '巷弄中的泰式船麵，湯頭香辣夠味，配料新鮮豐富，絕對值得一試！', date: '2024-03-17', category: '東南亞', views: 245, favorited: false },
        { id: 5, user: { name: '甜點控女孩', avatar: 'https://i.pravatar.cc/40?img=5' }, rating: 4, title: '法式手工甜點工作室', restaurant: 'Le Petit Pâtissier', imageUrl: '/images/carousel3.jpg', excerpt: '純手工製作的法式馬卡龍，口感酥脆，內餡綿密，完美比例的甜度讓人難以忘懷。', date: '2024-03-16', category: '甜點', views: 198, favorited: false },
        { id: 6, user: { name: '韓食達人', avatar: 'https://i.pravatar.cc/40?img=6' }, rating: 5, title: '正宗韓式部隊鍋', restaurant: '韓食堂', imageUrl: '/images/carousel1.jpg', excerpt: '超濃郁起司配上道地韓式辣醬，各式配料豐富多樣，是一鍋值得分享的美味！', date: '2024-03-15', category: '韓式', views: 267, favorited: true },
    ];

    // --- API Fetching ---
    async function fetchArticles() {
        // Now we fetch from the real backend API
        try {
            const response = await fetch('http://localhost:8080/api/ex-reviews');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Map the DTO from backend to the structure our frontend expects
            allArticles = data.map(dto => ({
                id: dto.reviewId, // Assuming there will be an ID, let's use a placeholder for now
                user: { name: dto.authorName, avatar: 'https://i.pravatar.cc/40' }, // Placeholder avatar
                rating: dto.authorRating,
                title: dto.reviewTitle,
                restaurant: dto.restaurantName,
                imageUrl: dto.reviewImage || '/images/default-food.jpg', // Use a default image if null
                excerpt: '', // The new API doesn't provide an excerpt, so we leave it empty
                date: new Date(dto.reviewDate).toISOString().split('T')[0], // Format date to YYYY-MM-DD
                category: dto.cuisineType,
                views: dto.viewCount,
                favorited: false // Default favorite status
            }));
            return allArticles;
        } catch (error) {
            console.error("Could not fetch articles:", error);
            // Optionally, display an error message to the user on the page
            foodGrid.innerHTML = '<p>無法載入文章，請稍後再試。</p>';
            return []; // Return empty array on error
        }
    }

    // --- Rendering ---
    function createStarRating(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += i <= rating ? '★' : '☆';
        }
        return stars;
    }

    function createArticleCard(article) {
        const card = document.createElement('article');
        card.className = 'food-card';
        card.dataset.id = article.id;
        card.dataset.date = article.date;
        card.dataset.views = article.views;
        card.dataset.category = article.category; // For filtering

        card.innerHTML = `
            <div class="food-image">
                <img src="${article.imageUrl}" alt="美食照片">
                <button class="favorite-btn" title="收藏">
                    <i class="${article.favorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="food-content">
                <div class="user-info">
                    <img src="${article.user.avatar}" alt="用戶頭像" class="avatar">
                    <div class="user-details">
                        <span class="username">${article.user.name}</span>
                        <div class="rating">${createStarRating(article.rating)}</div>
                    </div>
                </div>
                <div class="restaurant-info">
                    <h2>${article.title}</h2>
                    <div class="restaurant-name">
                        <i class="fas fa-store"></i>
                        <span>${article.restaurant}</span>
                    </div>
                </div>
                <p class="excerpt">${article.excerpt || '點擊查看更多...'}</p>
                <div class="meta">
                    <div class="meta-left">
                        <span class="date">${article.date}</span>
                        <span class="category">${article.category}</span>
                    </div>
                    <span class="views">${article.views} 次瀏覽</span>
                </div>
            </div>
        `;

        // Add event listener for the favorite button on this specific card
        card.querySelector('.favorite-btn').addEventListener('click', () => {
             const icon = card.querySelector('.favorite-btn i');
             icon.classList.toggle('far');
             icon.classList.toggle('fas');
             // In a real app, you'd also update the 'favorited' state and send it to the backend.
             const targetArticle = allArticles.find(a => a.id === article.id);
             if (targetArticle) {
                targetArticle.favorited = !targetArticle.favorited;
             }
        });

        return card;
    }

    function renderArticles(articles) {
        foodGrid.innerHTML = ''; // Clear existing cards
        if (articles.length === 0) {
            foodGrid.innerHTML = '<p>找不到相符的文章。</p>';
            return;
        }
        articles.forEach(article => {
            const card = createArticleCard(article);
            foodGrid.appendChild(card);
        });
    }

    // --- Filtering and Sorting ---
    function filterAndSortArticles() {
        const activeFilter = document.querySelector('.category-item.active').dataset.filter;
        const searchKeyword = searchInput.value.toLowerCase();
        const selectedFoodTypes = Array.from(foodTypeModal.querySelectorAll('input[type="checkbox"]:checked'))
                                       .map(cb => cb.value.toLowerCase());

        let filteredArticles = [...allArticles];

        // 1. Filter by search keyword
        if (searchKeyword) {
            filteredArticles = filteredArticles.filter(article => {
                return article.title.toLowerCase().includes(searchKeyword) ||
                       article.excerpt.toLowerCase().includes(searchKeyword) ||
                       article.restaurant.toLowerCase().includes(searchKeyword);
            });
        }

        // 2. Filter by selected food types
        if (selectedFoodTypes.length > 0 && !selectedFoodTypes.includes('other')) {
            filteredArticles = filteredArticles.filter(article => {
                return selectedFoodTypes.includes(article.category.toLowerCase());
            });
        }

        // 3. Sort based on the active filter (latest or popular)
        if (activeFilter === 'latest') {
            filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (activeFilter === 'popular') {
            filteredArticles.sort((a, b) => b.views - a.views);
        }

        renderArticles(filteredArticles);
    }

    // --- Event Listeners ---
    // Modal
    foodTypeBtn.addEventListener('click', () => {
        foodTypeModal.style.display = 'block';
    });
    closeModal.addEventListener('click', () => {
        foodTypeModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target === foodTypeModal) {
            foodTypeModal.style.display = 'none';
        }
    });
    applyBtn.addEventListener('click', () => {
        filterAndSortArticles();
        foodTypeModal.style.display = 'none';
    });
    clearBtn.addEventListener('click', () => {
        foodTypeModal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        filterAndSortArticles();
    });

    // Filters
    filterItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.category-item.active').classList.remove('active');
            item.classList.add('active');
            filterAndSortArticles();
        });
    });

    // Search
    searchBtn.addEventListener('click', filterAndSortArticles);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            filterAndSortArticles();
        }
    });

    // --- Initialization ---
    async function initializePage() {
        await fetchArticles();
        filterAndSortArticles(); // Initial render
    }

    initializePage();
}); 