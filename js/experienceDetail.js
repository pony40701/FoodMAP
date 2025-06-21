document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('experience-container');
    const params = new URLSearchParams(window.location.search);
    const reviewId = params.get('id');

    if (!reviewId) {
        container.innerHTML = '<p class="error-message">無效的文章 ID。</p>';
        return;
    }

    async function fetchAndRenderExperience() {
        const user = JSON.parse(localStorage.getItem('user'));
        const userId = user ? user.id : null;
        
        let url = `http://localhost:8080/api/ex-reviews/${reviewId}`;
        if (userId) {
            url += `?userId=${userId}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Try to get more specific error from response body
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || JSON.stringify(errorData);
                } catch (e) {
                    // Ignore if response body is not json
                }
                throw new Error(errorMsg);
            }
            const review = await response.json();
            
            // --- 偵錯用，請幫我看看控制台印出了什麼 ---
            console.log("--- DEBUG: 從伺服器收到的資料 ---");
            console.log("完整的 'review' 物件:", review);
            console.log("收到的 'isFavorited' 狀態:", review.isFavorited);
            console.log("--- DEBUG: 結束 ---");

            renderExperience(review);
        } catch (error) {
            console.error('無法獲取文章詳情:', error);
            container.innerHTML = `<p class="error-message">無法載入文章：${error.message}</p>`;
        }
    }

    function renderExperience(review) {
        const publishDate = new Date(review.reviewDate).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        let contentHtml = '';
        if (review.contentJson) {
            // The content from the backend is already an HTML string.
            // No need to parse it as JSON.
            contentHtml = review.contentJson;
        }
        
        // 檢查是否有封面圖片
        let coverImageHtml = '';
        if (review.imageBase64) {
            coverImageHtml = `
                <div class="experience-cover-image">
                    <img src="data:image/jpeg;base64,${review.imageBase64}" alt="${review.reviewTitle || '心得封面圖片'}">
                </div>
            `;
        }
        
        const breadcrumbHtml = `
            <div class="breadcrumb">
                <a href="experienceList.html">
                    <i class="fas fa-arrow-left"></i>
                    返回心得列表
                </a>
            </div>
        `;

        // Only render scores if they exist
        let scoresHtml = '';
        if (review.environmentScore || review.serviceScore || review.tasteScore || review.priceScore) {
            scoresHtml = `
                <div class="detailed-scores">
                    <div class="score-item">
                        <span class="score-label">環境</span>
                        <span class="score-value">${review.environmentScore || 'N/A'}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">服務</span>
                        <span class="score-value">${review.serviceScore || 'N/A'}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">味道</span>
                        <span class="score-value">${review.tasteScore || 'N/A'}</span>
                    </div>
                    <div class="score-item">
                        <span class="score-label">價格</span>
                        <span class="score-value">${review.priceScore || 'N/A'}</span>
                    </div>
                </div>
            `;
        }

        const html = `
            ${breadcrumbHtml}
            <h1 class="experience-title">${review.reviewTitle}</h1>
            <div class="author-meta">
                <img src="${review.authorAvatar || 'images/default-avatar.png'}" alt="作者頭像" class="author-avatar">
                <div class="author-info">
                    <div class="author-name">${review.authorName}</div>
                    <div class="publish-date">${publishDate}</div>
                </div>
                <div class="meta-stats">
                    <span><i class="fas fa-eye"></i> ${review.viewCount || 0}</span>
                    <button class="favorite-btn-detail ${review.favorited ? 'favorited' : ''}" data-review-id="${review.reviewId}">
                        <i class="${review.favorited ? 'fas' : 'far'} fa-heart"></i>
                        <span class="fav-text">${review.favorited ? '已收藏' : '收藏'}</span>
                    </button>
                </div>
            </div>
             <a href="restaurantDetail.html?placeId=${review.restaurantPlaceId}" class="restaurant-link">
                <i class="fas fa-store"></i>
                <span>${review.restaurantName}</span>
            </a>
            ${scoresHtml}
            <div class="overall-score-container">
                <div class="score-item">
                    <span class="score-label">平均</span>
                    <span class="score-value overall-score-value">
                        <i class="fas fa-star"></i> ${review.authorRating ? review.authorRating.toFixed(1) : 'N/A'}
                    </span>
                </div>
            </div>
            ${coverImageHtml}
            <div class="experience-content">
                ${contentHtml}
            </div>
        `;
        
        container.innerHTML = html;

        // 檢查來源頁面並動態更新返回連結
        const breadcrumbDiv = container.querySelector('.breadcrumb');
        if (breadcrumbDiv && document.referrer.includes('userCenter.html')) {
            breadcrumbDiv.innerHTML = `
                <a href="userCenter.html#favorites">
                    <i class="fas fa-arrow-left"></i>
                    返回我的收藏
                </a>
                <span style="margin: 0 8px; color: #999;">|</span>
                <a href="experienceList.html">
                    前往心得列表
                </a>
            `;
        }

        const favButton = container.querySelector('.favorite-btn-detail');
        if (favButton) {
            favButton.addEventListener('click', () => toggleFavorite(favButton, review));
        }
    }

    async function toggleFavorite(button, review) {
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
        const reviewId = review.reviewId;
        const restaurantPlaceId = review.restaurantPlaceId;

        const isFavorited = button.classList.contains('favorited');

        // Optimistic UI update
        button.classList.toggle('favorited');
        const icon = button.querySelector('i');
        const text = button.querySelector('.fav-text');
        icon.classList.toggle('far');
        icon.classList.toggle('fas');
        text.textContent = isFavorited ? '收藏' : '已收藏';
        
        try {
            const url = new URL('http://localhost:8080/api/users/favorite/toggle');
            url.searchParams.append('userId', userId);
            url.searchParams.append('targetId', reviewId);
            if (restaurantPlaceId) {
                url.searchParams.append('restaurantPlaceId', restaurantPlaceId);
            }

            const res = await fetch(url.toString(), { method: 'POST' });
            const data = await res.json();
            
            if (res.ok && data.success) {
                button.classList.toggle('favorited', data.isFavorited);
                icon.classList.toggle('fas', data.isFavorited);
                icon.classList.toggle('far', !data.isFavorited);
                text.textContent = data.isFavorited ? '已收藏' : '收藏';
                showToast(data.message);
            } else {
                throw new Error(data.message || '操作失敗');
            }
        } catch (err) {
            // Revert UI on error
            button.classList.toggle('favorited', isFavorited);
            icon.classList.toggle('fas', isFavorited);
            icon.classList.toggle('far', !isFavorited);
            text.textContent = isFavorited ? '已收藏' : '收藏';
            showToast(err.message || '操作失敗，請稍後再試');
        }
    }

    fetchAndRenderExperience();
}); 