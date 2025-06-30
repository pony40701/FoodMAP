// 從 URL 參數或 localStorage 讀取餐廳資訊
function getRestaurantInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id') || localStorage.getItem('restaurant_id');
    const restaurantName = urlParams.get('name') || localStorage.getItem('restaurant_name');
    
    return {
        id: restaurantId,
        name: restaurantName,
        reviews: []
    };
}

// 更新頁面內容
function updatePage() {
    const { id, name, reviews } = getRestaurantInfo();
    
    // 更新餐廳名稱
    const restaurantNameEl = document.getElementById('restaurant-name');
    if (restaurantNameEl) {
        restaurantNameEl.textContent = name || '餐廳名稱';
    }

    // 更新熱門評論區塊
    const popularReviewsContainer = document.getElementById('popular-reviews');
    if (popularReviewsContainer) {
        popularReviewsContainer.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="reviewer-info">
                    <img src="${review.avatar}" alt="${review.name}" class="reviewer-avatar">
                    <div>
                        <div class="reviewer-name">${review.name}</div>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${Array(review.rating).fill('<i class="fas fa-star"></i>').join('')}
                    ${Array(5 - review.rating).fill('<i class="far fa-star"></i>').join('')}
                </div>
                <p class="review-text">${review.text}</p>
                ${review.photos.length ? `
                    <div class="review-photos">
                        ${review.photos.map(photo => `
                            <img src="${photo}" alt="評論照片" loading="lazy">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
}

// 評分星星功能
function initRatingStars() {
    const stars = document.querySelectorAll('.rating-stars .star');
    const ratingText = document.querySelector('.rating-text');
    const ratingTexts = {
        1: '很差',
        2: '普通',
        3: '不錯',
        4: '很好',
        5: '超讚'
    };

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = parseInt(e.currentTarget.dataset.rating, 10);
            
            // 更新星星狀態
            stars.forEach(s => {
                const sRating = parseInt(s.dataset.rating, 10);
                if (sRating <= rating) {
                    s.classList.add('active');
                    s.querySelector('i').className = 'fas fa-star';
                } else {
                    s.classList.remove('active');
                    s.querySelector('i').className = 'far fa-star';
                }
            });

            // 更新評分文字
            if (ratingText) {
                ratingText.textContent = ratingTexts[rating] || '請點選星星來評分';
            }
        });

        // 滑鼠懸停效果
        star.addEventListener('mouseenter', (e) => {
            const rating = parseInt(e.currentTarget.dataset.rating, 10);
            stars.forEach(s => {
                const sRating = parseInt(s.dataset.rating, 10);
                if (sRating <= rating) {
                    s.querySelector('i').className = 'fas fa-star';
                } else {
                    s.querySelector('i').className = 'far fa-star';
                }
            });
        });

        star.addEventListener('mouseleave', (e) => {
            const activeRating = document.querySelector('.rating-stars .star.active')?.dataset.rating;
            stars.forEach(s => {
                const sRating = parseInt(s.dataset.rating, 10);
                if (activeRating && sRating <= activeRating) {
                    s.querySelector('i').className = 'fas fa-star';
                } else {
                    s.querySelector('i').className = 'far fa-star';
                }
            });
        });
    });
}

// 照片上傳預覽功能
function initPhotoUpload() {
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview');
    const maxPhotos = 5;

    if (photoUpload && photoPreview) {
        photoUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            
            // 檢查照片數量限制
            if (files.length + photoPreview.children.length > maxPhotos) {
                alert(`最多只能上傳 ${maxPhotos} 張照片`);
                return;
            }

            files.forEach(file => {
                if (!file.type.startsWith('image/')) {
                    alert('請選擇圖片檔案');
                    return;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    
                    // 添加刪除按鈕
                    const wrapper = document.createElement('div');
                    wrapper.className = 'photo-wrapper';
                    wrapper.appendChild(img);
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'delete-photo';
                    deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                    deleteBtn.onclick = () => wrapper.remove();
                    
                    wrapper.appendChild(deleteBtn);
                    photoPreview.appendChild(wrapper);
                };
                reader.readAsDataURL(file);
            });
        });
    }
}

// 發佈評論功能
function initSubmitComment() {
    const submitBtn = document.getElementById('submit-comment');
    const commentText = document.getElementById('comment-text');
    const stars = document.querySelectorAll('.rating-stars .star');

    if (submitBtn && commentText) {
        submitBtn.addEventListener('click', () => {
            // 獲取評分
            const rating = document.querySelectorAll('.rating-stars .star.active').length;
            if (rating === 0) {
                alert('請選擇評分');
                return;
            }

            // 獲取評論內容
            const content = commentText.value.trim();
            if (content === '') {
                alert('請輸入評論內容');
                return;
            }

            // 獲取上傳的照片
            const photos = Array.from(document.querySelectorAll('.photo-preview img')).map(img => img.src);

            // 這裡可以發送 AJAX 請求到後端
            ('發佈評論：', {
                restaurantId: getRestaurantInfo().id,
                rating,
                content,
                photos
            });

            // 清空表單
            stars.forEach(s => {
                s.classList.remove('active');
                s.querySelector('i').className = 'far fa-star';
            });
            commentText.value = '';
            document.getElementById('photo-preview').innerHTML = '';
            document.querySelector('.rating-text').textContent = '請點選星星來評分';
        });
    }
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    updatePage();
    initRatingStars();
    initPhotoUpload();
    initSubmitComment();
}); 