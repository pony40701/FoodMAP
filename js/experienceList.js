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

    // State for infinite scroll and filtering
    let allArticles = [];
    let isLoading = false;
    let hasMore = true;
    const TOTAL_ARTICLES_LIMIT = 15;
    const initialLoadSize = 6;
    const subsequentLoadSize = 3;
    let currentFilters = {
        sort: 'latest',
        search: '',
        cuisineTypes: []
    };

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
    async function fetchAndRenderArticles(limit, offset, append = false) {
        if (isLoading || !hasMore) return;
        isLoading = true;

        const params = new URLSearchParams({
            limit: limit,
            offset: offset,
            sort: currentFilters.sort
        });
        if (currentFilters.search) {
            params.append('search', currentFilters.search);
        }
        currentFilters.cuisineTypes.forEach(type => {
            params.append('cuisineTypes', type);
        });

        try {
            const response = await fetch(`http://localhost:8080/api/ex-reviews?${params.toString()}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.length < limit || (allArticles.length + data.length) >= TOTAL_ARTICLES_LIMIT) {
                hasMore = false;
            }

            const newArticles = data.map(dto => ({
                id: dto.reviewId || `temp-${Math.random()}`,
                user: { name: dto.authorName, avatar: 'https://i.pravatar.cc/40' },
                rating: dto.authorRating,
                title: dto.reviewTitle,
                restaurant: dto.restaurantName,
                imageUrl: dto.reviewImage || '/images/default-food.jpg',
                excerpt: extractExcerpt(dto.contentJson),
                date: new Date(dto.reviewDate).toISOString().split('T')[0],
                category: dto.cuisineType,
                views: dto.viewCount,
                favorited: false
            }));

            if (append) {
                allArticles.push(...newArticles);
                appendArticleCards(newArticles);
            } else {
                allArticles = newArticles;
                renderArticles(allArticles);
            }

        } catch (error) {
            console.error("Could not fetch articles:", error);
            if (!append) {
                foodGrid.innerHTML = '<p>無法載入文章，請稍後再試。</p>';
            }
        } finally {
            isLoading = false;
        }
    }

    function extractExcerpt(contentJson, maxLength = 50) {
        if (!contentJson) return '';
        try {
            const content = JSON.parse(contentJson);
            if (content && content.blocks && content.blocks.length > 0) {
                for (const block of content.blocks) {
                    if (block.type === 'paragraph' && block.data && block.data.text) {
                        const text = block.data.text;
                        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing content_json:', error);
        }
        return '';
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
        card.dataset.category = article.category;

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

        card.querySelector('.favorite-btn').addEventListener('click', async () => {
             const icon = card.querySelector('.favorite-btn i');
             const targetArticle = allArticles.find(a => a.id === article.id);
            const wasFavorited = !!targetArticle?.favorited;

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                showToast('請先登入會員才能收藏評論');
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'block';
                }
                return;
            }
            const userId = user.id;
            const reviewId = article.id;
            const restaurantPlaceId = article.restaurantPlaceId || '';

            // 標記 optimistic UI
            if (targetArticle) targetArticle.favorited = !wasFavorited;
            icon.classList.toggle('far', wasFavorited);
            icon.classList.toggle('fas', !wasFavorited);

            try {
                if (!wasFavorited) {
                    // 收藏
                    const res = await fetch('http://localhost:8080/api/users/favorite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: userId,
                            targetId: reviewId,
                            targetType: 'review',
                            restaurantPlaceId: restaurantPlaceId
                        })
                    });
                    const data = await res.json();
                    if (!(res.ok && data.success)) {
                        // 失敗還原
                        if (targetArticle) targetArticle.favorited = wasFavorited;
                        icon.classList.toggle('far', !wasFavorited);
                        icon.classList.toggle('fas', wasFavorited);
                        showToast(data.message || '收藏失敗');
                    } else {
                        showToast('收藏成功！');
                    }
                } else {
                    // 取消收藏
                    const res = await fetch(`http://localhost:8080/api/users/favorite/review/${userId}/${reviewId}`, {
                        method: 'DELETE'
                    });
                    const data = await res.json();
                    if (!(res.ok && data.success)) {
                        // 失敗還原
                        if (targetArticle) targetArticle.favorited = wasFavorited;
                        icon.classList.toggle('far', !wasFavorited);
                        icon.classList.toggle('fas', wasFavorited);
                        showToast(data.message || '取消收藏失敗');
                    } else {
                        showToast('取消收藏成功！');
                    }
                }
            } catch (err) {
                // 失敗還原
                if (targetArticle) targetArticle.favorited = wasFavorited;
                icon.classList.toggle('far', !wasFavorited);
                icon.classList.toggle('fas', wasFavorited);
                showToast('操作失敗，請稍後再試');
             }
        });

        return card;
    }

    function renderArticles(articles) {
        foodGrid.innerHTML = '';
        if (articles.length === 0 && !isLoading) {
            foodGrid.innerHTML = '<p>找不到相符的文章。</p>';
            return;
        }
        appendArticleCards(articles);
    }

    function appendArticleCards(articles) {
        articles.forEach(article => {
            const card = createArticleCard(article);
            foodGrid.appendChild(card);
        });
    }

    // --- Event Listeners ---
    window.addEventListener('scroll', () => {
        if (isLoading || !hasMore) return;
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
            fetchAndRenderArticles(subsequentLoadSize, allArticles.length, true);
        }
    });

    modalEventListeners();
    filterEventListeners();
    searchEventListeners();

    function modalEventListeners() {
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
            currentFilters.cuisineTypes = Array.from(foodTypeModal.querySelectorAll('input[type="checkbox"]:checked'))
                .map(cb => cb.closest('.checkbox-container').textContent.trim());
            foodTypeModal.style.display = 'none';
            applyFilters();
        });
        clearBtn.addEventListener('click', () => {
            foodTypeModal.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            currentFilters.cuisineTypes = [];
            applyFilters();
        });
    }

    function filterEventListeners() {
        filterItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('.category-item.active').classList.remove('active');
                item.classList.add('active');
                currentFilters.sort = item.dataset.filter;
                applyFilters();
            });
        });
    }
    
    function searchEventListeners() {
        searchBtn.addEventListener('click', () => {
            currentFilters.search = searchInput.value;
            applyFilters();
        });
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                currentFilters.search = searchInput.value;
                applyFilters();
            }
        });
    }

    function applyFilters() {
        currentFilters.search = searchInput.value;
        allArticles = [];
        hasMore = true;
        foodGrid.innerHTML = '';
        window.scrollTo(0, 0);
        fetchAndRenderArticles(initialLoadSize, 0, false);
    }

    // --- Initialization ---
    function initializePage() {
        fetchAndRenderArticles(initialLoadSize, 0);
    }

    initializePage();
}); 