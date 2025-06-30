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
            
            await renderExperience(review);
        } catch (error) {
            console.error('無法獲取文章詳情:', error);
            container.innerHTML = `<p class="error-message">無法載入文章：${error.message}</p>`;
        }
    }

    async function renderExperience(review) {
        const publishDate = new Date(review.reviewDate).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Handle author avatar
        const authorAvatarUrl = review.authorAvatar
            ? `data:image/jpeg;base64,${review.authorAvatar}`
            : 'images/default-avatar.png';

        let contentHtml = '';
        let firstPhotoId = null;

        // 先檢查內容中是否包含圖片佔位符，找出第一張圖片的ID
        if (review.contentJson) {
            const firstImageMatch = review.contentJson.match(/\[IMAGE_PLACEHOLDER_(\d+)\]/);
            if (firstImageMatch) {
                firstPhotoId = firstImageMatch[1];
            }
            
            // 處理圖片佔位符
            contentHtml = await processImagePlaceholders(review.contentJson);
        }
        
        // 檢查是否有封面圖片
        let coverImageHtml = '';
        
        if (review.imageBase64) {
            // 檢查內容的第一張圖片是否與封面圖相同（通過比較photoId）
            const reviewPhotoUrl = firstPhotoId ? 
                `http://localhost:8080/api/reviews/photos/${firstPhotoId}` : null;
                
            // 檢查處理後的內容中是否已經包含了與封面相同的圖片
            const hasDuplicateCover = reviewPhotoUrl && contentHtml.includes(reviewPhotoUrl);
            
            // 如果沒有重複的圖片，則顯示封面圖
            if (!hasDuplicateCover) {
                coverImageHtml = `
                    <div class="experience-cover-image">
                        <img src="data:image/jpeg;base64,${review.imageBase64}" alt="${review.reviewTitle || '心得封面圖片'}">
                    </div>
                `;
            } else {
                console.log('避免重複顯示封面圖片');
            }
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

        // Handle author link
        const authorName = review.authorUsername || '匿名使用者';
        const authorLinkStart = review.authorId
            ? `<a href="userCenter.html?userId=${review.authorId}" class="author-link">`
            : '<div class="author-link-disabled">';
        const authorLinkEnd = review.authorId ? '</a>' : '</div>';

        const html = `
            ${breadcrumbHtml}
            <h1 class="experience-title">${review.reviewTitle}</h1>
            <div class="author-meta">
                ${authorLinkStart}
                    <img src="${authorAvatarUrl}" alt="作者頭像" class="author-avatar" onerror="this.onerror=null;this.src='images/default-avatar.png';">
                    <div class="author-info">
                        <div class="author-name">${authorName}</div>
                        <div class="publish-date">${publishDate}</div>
                    </div>
                ${authorLinkEnd}
                <div class="meta-stats">
                    <span><i class="fas fa-eye"></i> ${review.viewCount || 0}</span>
                    <button class="favorite-btn-detail ${review.favorited ? 'favorited' : ''}" data-review-id="${review.reviewId}">
                        <i class="${review.favorited ? 'fas' : 'far'} fa-heart"></i>
                        <span class="fav-text">${review.favorited ? '已收藏' : '收藏'}</span>
                    </button>
                </div>
            </div>
            <div class="restaurant-info-row" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                <a href="restaurantDetail.html?placeId=${review.restaurantPlaceId}" class="restaurant-link" style="font-size: 1.1em;">
                    <i class="fas fa-store"></i>
                    <span>${review.restaurantName}</span>
                </a>
            </div>
            ${scoresHtml}
            <div class="overall-score-container">
                <div class="score-item">
                    <span class="score-label">平均</span>
                    <span class="score-value overall-score-value">
                        <i class="fas fa-star"></i> ${review.authorRating ? review.authorRating.toFixed(1) : 'N/A'}
                    </span>
                </div>
            </div>
            <div class="review-tags-inline" style="margin: 12px 0 0 0;">
              ${
                review.tags && review.tags.length > 0
                  ? review.tags.map(tag => `<span class=\"review-tag\">${tag}</span>`).join('')
                  : ''
              }
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

    // 新增：獲取多張圖片資訊的函式
    async function fetchImages(photoIds) {
        const imageMap = new Map();
        const promises = photoIds.map(async (photoId) => {
            try {
                const infoResponse = await fetch(`http://localhost:8080/api/review-photos/info/${photoId}`);
                if (infoResponse.ok) {
                    const photoInfo = await infoResponse.json();
                    imageMap.set(photoId, photoInfo);
                }
            } catch (error) {
                // 如果單張圖片資訊獲取失敗，只在控制台記錄錯誤，不中斷整個流程
                console.error(`Failed to fetch image info for id ${photoId}`, error);
            }
        });
        await Promise.all(promises);
        return imageMap;
    }

    // 處理圖片佔位符的函數
    async function processImagePlaceholders(content) {
        if (!content) return content;
        
        // 使用正則表達式找出所有圖片佔位符
        const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
        const matches = [];
        let match;
        
        // 收集所有佔位符及其位置
        while ((match = placeholderRegex.exec(content)) !== null) {
            matches.push({
                placeholder: match[0],
                photoId: match[1],
                index: match.index
            });
        }
        
        // 如果沒有佔位符，直接返回
        if (matches.length === 0) {
            return content;
        }
        
        // 從後往前替換，避免影響索引位置
        matches.sort((a, b) => b.index - a.index);
        
        let processedContent = content;
        
        for (const item of matches) {
            const imageUrl = `http://localhost:8080/api/reviews/photos/${item.photoId}`;
            
            // 建立簡單的圖片HTML
            const imageHtml = `<img src="${imageUrl}" alt="心得圖片" class="review-image" style="display: block; max-width: 100%; height: auto; margin: 1rem auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
            
            // 替換佔位符
            processedContent = processedContent.substring(0, item.index) + 
                            imageHtml + 
                            processedContent.substring(item.index + item.placeholder.length);
        }
        
        return processedContent;
    }

    fetchAndRenderExperience();
}); 