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
        if (review.contentJson) {
            // The content from the backend is already an HTML string.
            // No need to parse it as JSON.
            contentHtml = review.contentJson;
            
            // 處理圖片佔位符 [IMAGE_PLACEHOLDER_${photoId}]
            contentHtml = await processImagePlaceholders(contentHtml);
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
        
        // 徹底清理混亂的 HTML 結構
        let cleanedContent = content;
        
        // 定義正則表達式（避免重複宣告）
        const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
        
        // 1. 移除所有重複的 image-wrapper 結構
        cleanedContent = cleanedContent.replace(/<div class="image-wrapper">\[IMAGE_PLACEHOLDER_(\d+)\]<\/div>/g, '[IMAGE_PLACEHOLDER_$1]');

        let match;
        const placeholders = new Set();
        while ((match = placeholderRegex.exec(cleanedContent)) !== null) {
            placeholders.add(match[1]);
        }

        if (placeholders.size === 0) {
            return cleanedContent;
        }

        const photoIds = Array.from(placeholders);
        const fetchedImages = await fetchImages(photoIds);
        
        // 2. 移除所有 image-wrapper 相關的 HTML 結構
        cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*image-wrapper[^"]*"[^>]*>/gi, '');
        
        // 移除所有 image-container 開始標籤
        cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*image-container[^"]*"[^>]*>/gi, '');
        
        // 移除所有 img 標籤
        cleanedContent = cleanedContent.replace(/<img[^>]*>/gi, '');
        
        // 移除所有 resize-handle 相關標籤
        cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*resize-handle[^"]*"[^>]*>/gi, '');
        cleanedContent = cleanedContent.replace(/<div[^>]*class="[^"]*resize-info[^"]*"[^>]*>/gi, '');
        
        // 移除多餘的結束標籤
        cleanedContent = cleanedContent.replace(/<\/div>/g, '');
        
        // 3. 清理多餘的空格和換行
        cleanedContent = cleanedContent
            .replace(/\s+/g, ' ')  // 多個空格變為單個空格
            .replace(/\n\s*\n/g, '\n')  // 多個換行變為單個換行
            .trim();
        
        // 使用正規表示式尋找 [IMAGE_PLACEHOLDER_${photoId}] 格式的佔位符
        let result = cleanedContent;
        
        // 為每個圖片ID獲取信息並替換
        for (const photoId of photoIds) {
            try {
                // 從後端獲取圖片信息
                const infoResponse = await fetch(`http://localhost:8080/api/reviews/photos/${photoId}/info`);
                if (infoResponse.ok) {
                    const photoInfo = await infoResponse.json();
                    
                    // 構建圖片HTML
                    const imageUrl = `http://localhost:8080/api/reviews/photos/${photoId}`;
                    let imgStyle = 'max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);';
                    
                    // 應用圖片大小
                    if (photoInfo.width && photoInfo.height && 
                        photoInfo.width !== '0px' && photoInfo.height !== '0px') {
                        imgStyle = `width: ${photoInfo.width}; height: ${photoInfo.height}; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);`;
                    }
                    
                    // 構建完整的圖片容器結構（與寫心得頁面一致）
                    const imgHtml = `
                        <div class="image-wrapper">
                            <div class="image-container" style="position: relative; display: inline-block; margin: 0; max-width: 100%; border-radius: 8px; overflow: hidden;">
                                <img src="${imageUrl}" alt="心得圖片" style="${imgStyle}" draggable="false">
                            </div>
                        </div>
                    `;
                    
                    // 替換佔位符
                    const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                    result = result.replace(placeholder, imgHtml);
                } else {
                    console.warn(`無法獲取圖片 ${photoId} 信息:`, infoResponse.status);
                    // 如果無法獲取信息，使用預設樣式
                    const imageUrl = `http://localhost:8080/api/reviews/photos/${photoId}`;
                    const defaultImgHtml = `
                        <div class="image-wrapper">
                            <div class="image-container" style="position: relative; display: inline-block; margin: 0; max-width: 100%; border-radius: 8px; overflow: hidden;">
                                <img src="${imageUrl}" alt="心得圖片" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);" draggable="false">
                            </div>
                        </div>
                    `;
                    const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                    result = result.replace(placeholder, defaultImgHtml);
                }
            } catch (error) {
                console.error(`處理圖片 ${photoId} 時發生錯誤:`, error);
                // 發生錯誤時使用預設樣式
                const imageUrl = `http://localhost:8080/api/reviews/photos/${photoId}`;
                const defaultImgHtml = `
                    <div class="image-wrapper">
                        <div class="image-container" style="position: relative; display: inline-block; margin: 0; max-width: 100%; border-radius: 8px; overflow: hidden;">
                            <img src="${imageUrl}" alt="心得圖片" style="max-width: 100%; height: auto; border-radius: 8px; margin: 1.5rem 0; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);" draggable="false">
                        </div>
                    </div>
                `;
                const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                result = result.replace(placeholder, defaultImgHtml);
            }
        }
        
        return result;
    }

    fetchAndRenderExperience();
}); 