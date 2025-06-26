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

    // --- API Fetching ---
    async function fetchAndRenderArticles(limit, offset, append = false) {
        if (isLoading || !hasMore) return;
        isLoading = true;

        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? user.id : null;

        const params = new URLSearchParams({
            limit: limit,
            offset: offset,
            sort: currentFilters.sort
        });
        if (userId) {
            params.append('userId', userId);
        }
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
            
            if (data.length < limit) {
                hasMore = false;
            }

            const newArticles = data.map(dto => {
                let imageUrl = '/images/no-image.jpg'; // Default image
                if (dto.imageBase64) {
                    imageUrl = `data:image/jpeg;base64,${dto.imageBase64}`;
                }

                let avatarUrl = dto.authorAvatar
                    ? `data:image/jpeg;base64,${dto.authorAvatar}`
                    : '/images/default-avatar.png';

                return {
                    id: dto.reviewId,
                    user: { id: dto.authorId, username: dto.authorUsername || '匿名使用者', avatar: avatarUrl },
                    rating: dto.authorRating,
                    title: dto.reviewTitle,
                    restaurant: dto.restaurantName,
                    imageUrl: imageUrl,
                    excerpt: extractExcerpt(dto.contentJson),
                    date: new Date(dto.reviewDate).toISOString().split('T')[0],
                    category: dto.cuisineType,
                    views: dto.viewCount,
                    favorited: dto.favorited,
                    restaurantPlaceId: dto.restaurantPlaceId,
                    tags: dto.tags || []
                };
            });

            if (append) {
                const uniqueNewArticles = newArticles.filter(newArt => 
                    !allArticles.some(existingArt => existingArt.id === newArt.id)
                );
                allArticles.push(...uniqueNewArticles);
                appendArticleCards(uniqueNewArticles);
            } else {
                // 對於初始載入或篩選後的載入，allArticles 已由 applyFilters 清空，直接賦值即可
                allArticles = newArticles;
                renderArticles(allArticles);
                if (data.length < limit) {
                    hasMore = false;
                }
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
        let text = '';
        try {
            // First, try to parse as JSON (Editor.js format)
            const content = JSON.parse(contentJson);
            if (content && content.blocks && content.blocks.length > 0) {
                for (const block of content.blocks) {
                    if (block.type === 'paragraph' && block.data && block.data.text) {
                        text += block.data.text + ' ';
                    }
                }
            }
        } catch (error) {
            // If parsing fails, assume it's an HTML string
            text = contentJson;
        }

        // Strip HTML tags from the text
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const plainText = doc.body.textContent || "";
        
        return plainText.trim().length > maxLength ? plainText.trim().substring(0, maxLength) + '...' : plainText.trim();
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
        // Make card clickable
        card.style.cursor = 'pointer';

        const userLink = article.user.id
            ? `<a href="#" class="user-info-link" onclick="event.preventDefault();">`
            : '<div class="user-info-link-disabled">';
        const userLinkEnd = article.user.id ? '</a>' : '</div>';

        // 標籤區塊
        let tagsHtml = '';
        if (article.tags && article.tags.length > 0) {
            tagsHtml = `<span class="review-tags">${article.tags.map(tag => `<span class="review-tag">${tag}</span>`).join(' ')}</span>`;
        }

        card.innerHTML = `
            <div class="food-image">
                <img src="${article.imageUrl}" alt="美食照片" onerror="this.onerror=null;this.src='/images/no-image.jpg';">
                <button class="favorite-btn" title="收藏">
                    <i class="${article.favorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="food-content">
                ${userLink}
                    <div class="user-info">
                        <img src="${article.user.avatar}" alt="用戶頭像" class="avatar" onerror="this.onerror=null;this.src='/images/default-avatar.png';">
                        <div class="user-details">
                            <span class="username">${article.user.username}</span>
                            <div class="rating">${createStarRating(article.rating)}</div>
                        </div>
                    </div>
                ${userLinkEnd}
                <div class="restaurant-info">
                    <h2>${article.title}</h2>
                    <div class="restaurant-name">
                        <i class="fas fa-store"></i>
                        <span>${article.restaurant}</span>
                    </div>
                </div>
                <p class="excerpt">${article.excerpt || '點擊查看更多...'}</p>
                <div class="meta">
                    ${tagsHtml}
                    <div class="meta-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
                        <span class="date">${article.date}</span>
                        <span class="views">${article.views} 次瀏覽</span>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', (e) => {
            // Stop propagation if the click is on the user link or the favorite button
            if (e.target.closest('.favorite-btn') || e.target.closest('.user-info-link')) {
                return;
            }
            window.location.href = `experienceDetail.html?id=${article.id}&fav=${article.favorited}`;
        });

        card.querySelector('.favorite-btn').addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent card click event from firing
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
            const targetId = article.id;
            const restaurantPlaceId = article.restaurantPlaceId;

            // Optimistic UI update
            if (targetArticle) targetArticle.favorited = !wasFavorited;
            icon.classList.toggle('far', wasFavorited);
            icon.classList.toggle('fas', !wasFavorited);

            try {
                const url = new URL('http://localhost:8080/api/users/favorite/toggle');
                url.searchParams.append('userId', userId);
                url.searchParams.append('targetId', targetId);
                if (restaurantPlaceId) {
                    url.searchParams.append('restaurantPlaceId', restaurantPlaceId);
                }

                const res = await fetch(url.toString(), {
                    method: 'POST',
                });
                const data = await res.json();
                
                if (res.ok && data.success) {
                    // Update favorite state from response
                    if (targetArticle) targetArticle.favorited = data.isFavorited;
                    icon.classList.toggle('fas', data.isFavorited);
                    icon.classList.toggle('far', !data.isFavorited);
                    showToast(data.message);
                } else {
                    // Revert UI on failure
                    if (targetArticle) targetArticle.favorited = wasFavorited;
                    icon.classList.toggle('fas', wasFavorited);
                    icon.classList.toggle('far', !wasFavorited);
                    showToast(data.message || '操作失敗');
                }
            } catch (err) {
                // Revert UI on error
                if (targetArticle) targetArticle.favorited = wasFavorited;
                icon.classList.toggle('fas', wasFavorited);
                icon.classList.toggle('far', !wasFavorited);
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