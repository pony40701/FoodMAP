// 評論管理功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化評論列表
    initializeComments();
    
    // 初始化過濾器
    initializeFilters();
    
    // 初始化分頁
    initializePagination();
});

// 初始化評論列表
function initializeComments() {
    const commentsContainer = document.querySelector('.comments-container');
    if (!commentsContainer) return;

    // 為每個評論的回覆按鈕添加事件監聽器
    const replyButtons = document.querySelectorAll('.reply-button');
    replyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentItem = this.closest('.comment-item');
            const replyForm = commentItem.querySelector('.reply-form');
            
            if (replyForm) {
                replyForm.style.display = replyForm.style.display === 'none' ? 'block' : 'none';
                this.textContent = replyForm.style.display === 'none' ? '回覆' : '取消';
            }
        });
    });

    // 為回覆表單添加事件監聽器
    const replyForms = document.querySelectorAll('.reply-form');
    replyForms.forEach(form => {
        const submitButton = form.querySelector('.submit-reply');
        const cancelButton = form.querySelector('.cancel-reply');
        const textarea = form.querySelector('.reply-textarea');

        if (submitButton) {
            submitButton.addEventListener('click', function() {
                handleReplySubmit(form);
            });
        }

        if (cancelButton) {
            cancelButton.addEventListener('click', function() {
                const replyButton = form.closest('.comment-item').querySelector('.reply-button');
                form.style.display = 'none';
                replyButton.textContent = '回覆';
            });
        }

        if (textarea) {
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });
        }
    });
}

// 初始化過濾器
function initializeFilters() {
    const ratingFilter = document.getElementById('rating-filter');
    const timeFilter = document.getElementById('time-filter');

    if (ratingFilter) {
        ratingFilter.addEventListener('change', function() {
            filterComments();
        });
    }

    if (timeFilter) {
        timeFilter.addEventListener('change', function() {
            filterComments();
        });
    }
}

// 過濾評論
function filterComments() {
    const ratingFilter = document.getElementById('rating-filter');
    const timeFilter = document.getElementById('time-filter');
    const comments = document.querySelectorAll('.comment-item');

    const selectedRating = ratingFilter ? ratingFilter.value : 'all';
    const selectedTime = timeFilter ? timeFilter.value : 'all';

    comments.forEach(comment => {
        const rating = comment.dataset.rating;
        const date = new Date(comment.dataset.date);
        const now = new Date();
        const timeDiff = now - date;
        const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        let showByRating = selectedRating === 'all' || rating === selectedRating;
        let showByTime = selectedTime === 'all' || 
            (selectedTime === 'week' && daysDiff <= 7) ||
            (selectedTime === 'month' && daysDiff <= 30) ||
            (selectedTime === 'year' && daysDiff <= 365);

        comment.style.display = showByRating && showByTime ? 'block' : 'none';
    });
}

// 初始化分頁
function initializePagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    const pageButtons = pagination.querySelectorAll('.page-button');
    pageButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.disabled) return;
            
            // 移除其他按鈕的 active 類
            pageButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加 active 類到當前按鈕
            this.classList.add('active');
            
            // 更新評論列表
            updateCommentsList(this.dataset.page);
        });
    });
}

// 更新評論列表
function updateCommentsList(page) {
    // 這裡可以添加 AJAX 請求來獲取新的評論數據
    (`Loading page ${page}...`);
}

// 處理回覆提交
function handleReplySubmit(form) {
    const textarea = form.querySelector('.reply-textarea');
    const commentId = form.closest('.comment-item').dataset.commentId;
    
    if (!textarea || !textarea.value.trim()) {
        alert('請輸入回覆內容');
        return;
    }

    // 這裡可以添加 AJAX 請求來提交回覆
    (`Submitting reply for comment ${commentId}: ${textarea.value}`);

    // 模擬提交成功
    const replyContent = document.createElement('div');
    replyContent.className = 'reply-content';
    replyContent.innerHTML = `
        <div class="reply-item">
            <div class="reply-header">
                <div class="restaurant-info">
                    <img src="/IMAGE/TEST.jpg" alt="餐廳頭像" class="restaurant-avatar">
                    <span class="restaurant-name">餐廳名稱</span>
                </div>
                <span class="reply-date">剛剛</span>
            </div>
            <p class="reply-text">${textarea.value}</p>
        </div>
    `;

    const commentItem = form.closest('.comment-item');
    commentItem.appendChild(replyContent);

    // 重置表單
    textarea.value = '';
    form.style.display = 'none';
    const replyButton = commentItem.querySelector('.reply-button');
    replyButton.textContent = '回覆';
}

// 格式化日期
function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} 分鐘前`;
        }
        return `${hours} 小時前`;
    } else if (days < 7) {
        return `${days} 天前`;
    } else {
        return date.toLocaleDateString('zh-TW');
    }
}

// 生成星級評分
function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 <= rating) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function submitReply(button) {
    // Logic to submit reply
    console.log('Reply submitted');
    hideReplyForm(button);
}

function merchantLogout() {
    localStorage.removeItem('merchantToken');
    localStorage.removeItem('merchantEmail');
    localStorage.removeItem('restaurantId');
    alert('您已成功登出商家帳戶。');
    window.location.href = 'index.html';
} 