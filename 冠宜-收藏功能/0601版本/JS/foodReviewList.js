document.addEventListener('DOMContentLoaded', function() {
    const reviewsGrid = document.querySelector('.reviews-grid');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortBy = document.getElementById('sortBy');
    const tagFilter = document.getElementById('tagFilter');
    const selectedTags = document.getElementById('selectedTags');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const modal = document.getElementById('reviewModal');
    const closeBtn = document.querySelector('.close');

    let currentPage = 1;
    const itemsPerPage = 9;
    let filteredReviews = [];
    let selectedTagsList = new Set();

    // 從 localStorage 獲取收藏心得
    function getFavoriteReviews() {
        return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
    }

    // 檢查心得是否已收藏
    function isFavoriteReview(reviewId) {
        const favoriteReviews = getFavoriteReviews();
        return favoriteReviews.some(fav => fav.id === reviewId);
    }

    // 切換收藏心得
    function toggleFavoriteReview(review) {
        // 檢查登入狀態
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            alert('請先登入會員');
            return;
        }

        let favoriteReviews = getFavoriteReviews();
        const existingIndex = favoriteReviews.findIndex(fav => fav.id === review.id);

        if (existingIndex > -1) {
            // 已收藏，移除
            favoriteReviews.splice(existingIndex, 1);
            alert(`已取消收藏 ${review.title}`);
        } else {
            // 未收藏，添加到最前面
            const reviewToSave = {
                id: review.id,
                title: review.title,
                storeName: review.storeName,
                content: review.content,
                rating: review.rating,
                tags: review.tags,
                images: review.images,
                author: review.author,
                date: review.date,
                avatar: review.avatar || '../IMAGE/default_avatar.jpg'
            };
            favoriteReviews.unshift(reviewToSave);
            alert(`已收藏 ${review.title}`);
        }

        localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
        // 重新載入當前頁面以更新收藏狀態
        displayReviews();
    }

    // 載入心得
    function loadReviews() {
        const reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        filteredReviews = filterReviews(reviews);
        displayReviews();
    }

    // 篩選心得
    function filterReviews(reviews) {
        let filtered = [...reviews];

        // 搜尋文字
        const searchText = searchInput.value.toLowerCase();
        if (searchText) {
            filtered = filtered.filter(review => 
                review.title.toLowerCase().includes(searchText) ||
                review.content.toLowerCase().includes(searchText) ||
                review.storeName.toLowerCase().includes(searchText)
            );
        }

        // 評分篩選
        const ratingValue = ratingFilter.value;
        if (ratingValue !== 'all') {
            filtered = filtered.filter(review => review.rating >= parseInt(ratingValue));
        }

        // 標籤篩選
        if (selectedTagsList.size > 0) {
            filtered = filtered.filter(review => 
                review.tags.some(tag => selectedTagsList.has(tag))
            );
        }

        // 排序
        const sortValue = sortBy.value;
        switch (sortValue) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'highest':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
        }

        return filtered;
    }

    // 顯示心得
    function displayReviews() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageReviews = filteredReviews.slice(startIndex, endIndex);

        reviewsGrid.innerHTML = '';
        pageReviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-card';
            const isFavorited = isFavoriteReview(review.id);
            
            reviewElement.innerHTML = `
                <div class="review-image">
                    <img src="${review.images && review.images[0] ? review.images[0] : '../IMAGE/default-food.jpg'}" alt="${review.title}">
                    <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-review-id="${review.id}">
                        <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="review-content">
                    <h3>${review.title}</h3>
                    <p class="store-name">${review.storeName}</p>
                    <div class="rating">
                        ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                    </div>
                    <div class="tags">
                        ${review.tags && review.tags.length > 0 ? review.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    <p class="author">作者：${review.author || '匿名'}</p>
                    <p class="date">${new Date(review.date).toLocaleDateString()}</p>
                </div>
            `;
            
            // 綁定心得卡片點擊事件
            reviewElement.addEventListener('click', (e) => {
                // 如果點擊的是收藏按鈕，不要打開詳情
                if (e.target.closest('.favorite-btn')) {
                    return;
                }
                showReviewDetails(review);
            });

            // 綁定收藏按鈕點擊事件
            const favoriteBtn = reviewElement.querySelector('.favorite-btn');
            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavoriteReview(review);
            });

            reviewsGrid.appendChild(reviewElement);
        });

        // 更新分頁資訊
        const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
        pageInfo.textContent = `第 ${currentPage} 頁 / 共 ${totalPages} 頁`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    // 顯示心得詳情
    function showReviewDetails(review) {
        const detailsContainer = document.getElementById('reviewDetails');
        const isFavorited = isFavoriteReview(review.id);
        
        detailsContainer.innerHTML = `
            <div class="review-detail-header">
                <h2>${review.title}</h2>
                <button class="favorite-btn-detail ${isFavorited ? 'favorited' : ''}" data-review-id="${review.id}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                    ${isFavorited ? '已收藏' : '收藏'}
                </button>
            </div>
            <div class="review-header">
                <p class="store-name">${review.storeName}</p>
                <div class="rating">
                    ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                </div>
            </div>
            <div class="review-images">
                ${review.images && review.images.length > 0 ? review.images.map(img => `<img src="${img}" alt="心得圖片">`).join('') : '<p>無圖片</p>'}
            </div>
            <div class="review-content">
                ${review.content}
            </div>
            <div class="review-tags">
                ${review.tags && review.tags.length > 0 ? review.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="review-footer">
                <p class="author">作者：${review.author || '匿名'}</p>
                <p class="date">發布日期：${new Date(review.date).toLocaleString()}</p>
            </div>
        `;

        // 綁定詳情頁面的收藏按鈕
        const favoriteDetailBtn = detailsContainer.querySelector('.favorite-btn-detail');
        favoriteDetailBtn.addEventListener('click', () => {
            toggleFavoriteReview(review);
            // 更新按鈕狀態
            const isNowFavorited = isFavoriteReview(review.id);
            favoriteDetailBtn.className = `favorite-btn-detail ${isNowFavorited ? 'favorited' : ''}`;
            favoriteDetailBtn.innerHTML = `
                <i class="${isNowFavorited ? 'fas' : 'far'} fa-heart"></i>
                ${isNowFavorited ? '已收藏' : '收藏'}
            `;
        });

        modal.style.display = 'block';
    }

    // 事件監聽器
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        loadReviews();
    });

    ratingFilter.addEventListener('change', () => {
        currentPage = 1;
        loadReviews();
    });

    sortBy.addEventListener('change', () => {
        currentPage = 1;
        loadReviews();
    });

    tagFilter.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const tag = e.target.value.trim();
            if (tag && !selectedTagsList.has(tag)) {
                selectedTagsList.add(tag);
                updateSelectedTags();
                currentPage = 1;
                loadReviews();
            }
            e.target.value = '';
        }
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayReviews();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayReviews();
        }
    });

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    function updateSelectedTags() {
        selectedTags.innerHTML = '';
        selectedTagsList.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'selected-tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" data-tag="${tag}">&times;</span>
            `;
            selectedTags.appendChild(tagElement);
        });

        // 添加刪除標籤功能
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', function() {
                const tagToRemove = this.dataset.tag;
                selectedTagsList.delete(tagToRemove);
                updateSelectedTags();
                currentPage = 1;
                loadReviews();
            });
        });
    }

    // 初始化載入
    loadReviews();
}); 