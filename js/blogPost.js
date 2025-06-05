// 用戶數據
let userData = {
    name: '美食探索家',
    avatar: 'images/pig.jpg',
    bio: '熱愛美食的部落客'
};

// 文章數據
let posts = [];
let drafts = [];

// 初始化編輯器
function initEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    // 設置編輯器事件監聽
    editor.addEventListener('keydown', function(e) {
        // 處理快捷鍵
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
            }
        }
    });

    // 處理圖片拖放
    editor.addEventListener('dragover', function(e) {
        e.preventDefault();
        editor.classList.add('drag-over');
    });

    editor.addEventListener('dragleave', function() {
        editor.classList.remove('drag-over');
    });

    editor.addEventListener('drop', function(e) {
        e.preventDefault();
        editor.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleImageFiles(files);
    });
}

// 初始化評分系統
function initRating() {
    const ratingItems = document.querySelectorAll('.rating-item .stars');
    ratingItems.forEach(item => {
        const stars = item.querySelectorAll('i');
        const valueDisplay = item.parentElement.querySelector('.rating-value');
        
        stars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const rating = this.dataset.rating;
                updateStars(stars, rating);
            });

            star.addEventListener('mouseout', function() {
                const currentRating = item.dataset.currentRating || 0;
                updateStars(stars, currentRating);
            });

            star.addEventListener('click', function() {
                const rating = this.dataset.rating;
                item.dataset.currentRating = rating;
                valueDisplay.textContent = rating + '.0';
                updateOverallRating();
            });
        });
    });
}

// 更新星星顯示
function updateStars(stars, rating) {
    stars.forEach(star => {
        const starRating = star.dataset.rating;
        star.classList.toggle('active', starRating <= rating);
    });
}

// 更新總評分
function updateOverallRating() {
    const categories = ['environment', 'service', 'taste', 'price'];
    let total = 0;
    let count = 0;

    categories.forEach(category => {
        const rating = document.querySelector(`.stars[data-category="${category}"]`).dataset.currentRating;
        if (rating) {
            total += parseInt(rating);
            count++;
        }
    });

    const average = count > 0 ? (total / count).toFixed(1) : '0.0';
    const overallStars = document.querySelector('.overall-rating .stars');
    const overallValue = document.querySelector('.overall-rating .rating-value');

    updateStars(overallStars.querySelectorAll('i'), average);
    overallValue.textContent = average;
}

// 初始化字型大小控制
function initFontSize() {
    const fontSizeSelect = document.getElementById('fontSize');
    if (!fontSizeSelect) return;

    fontSizeSelect.addEventListener('change', function() {
        setFontSize(this.value);
    });
}

// 設置字型大小
function setFontSize(size) {
    document.execCommand('fontSize', false, size);
    const editor = document.getElementById('editor');
    const selection = window.getSelection();
    
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size + 'px';
        
        if (range.collapsed) {
            editor.style.fontSize = size + 'px';
        } else {
            range.surroundContents(span);
        }
    }
}

// 初始化顏色選擇器
function initColorPicker() {
    const colorOptions = document.querySelectorAll('.color-option');
    const customColorInput = document.getElementById('customColor');
    const confirmColorBtn = document.querySelector('.confirm-color-btn');
    const colorPreview = document.querySelector('.color-preview');

    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            setTextColor(color);
            colorPreview.style.backgroundColor = color;
            document.querySelector('.color-palette').style.display = 'none';
        });
    });

    if (customColorInput && confirmColorBtn) {
        confirmColorBtn.addEventListener('click', function() {
            const color = customColorInput.value;
            setTextColor(color);
            colorPreview.style.backgroundColor = color;
            document.querySelector('.color-palette').style.display = 'none';
        });
    }
}

// 切換顏色選擇器顯示
function toggleColorPalette() {
    const palette = document.querySelector('.color-palette');
    palette.style.display = palette.style.display === 'none' ? 'block' : 'none';
}

// 設置文字顏色
function setTextColor(color) {
    document.execCommand('foreColor', false, color);
}

// 格式化文字
function formatText(command) {
    document.execCommand(command, false, null);
}

// 插入圖片
function insertImage() {
    const input = document.getElementById('imageUpload');
    input.click();
}

// 處理圖片檔案
function handleImageFiles(files) {
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                document.getElementById('editor').appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 載入用戶數據
function loadUserData() {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userBio = document.getElementById('userBio');

    if (userName) userName.textContent = userData.name;
    if (userAvatar) userAvatar.src = userData.avatar;
    if (userBio) userBio.textContent = userData.bio;
}

// 載入文章列表
function loadPosts() {
    // 模擬從後端獲取數據
    const mockPosts = [
        {
            id: 1,
            title: '台北必吃美食推薦',
            content: '今天要跟大家分享台北必吃的美食...',
            restaurant: '鼎泰豐',
            location: '台北市信義區',
            rating: 4.5,
            views: 1234,
            likes: 56,
            comments: 12,
            date: '2024-03-15',
            tags: ['台北美食', '必吃', '推薦']
        },
        {
            id: 2,
            title: '台中隱藏版小吃',
            content: '在台中發現了一家超好吃的隱藏版小吃...',
            restaurant: '阿明師',
            location: '台中市西區',
            rating: 4.8,
            views: 856,
            likes: 43,
            comments: 8,
            date: '2024-03-14',
            tags: ['台中美食', '小吃', '隱藏版']
        }
    ];

    posts = mockPosts;
    updatePostsList();
}

// 更新文章列表顯示
function updatePostsList() {
    const publishedList = document.getElementById('publishedList');
    const draftsList = document.getElementById('draftsList');

    if (publishedList) {
        publishedList.innerHTML = posts.map(post => createPostElement(post)).join('');
    }

    if (draftsList) {
        draftsList.innerHTML = drafts.map(draft => createPostElement(draft)).join('');
    }
}

// 創建文章元素
function createPostElement(post) {
    return `
        <div class="post-card" data-id="${post.id}">
            <div class="post-header">
                <div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-meta">
                        <span>${post.restaurant}</span>
                        <span>${post.location}</span>
                        <span>${post.date}</span>
                    </div>
                </div>
                <div class="post-rating">
                    ${createStarRating(post.rating)}
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-footer">
                <div class="post-stats">
                    <span><i class="fas fa-eye"></i> ${post.views}</span>
                    <span><i class="fas fa-heart"></i> ${post.likes}</span>
                    <span><i class="fas fa-comment"></i> ${post.comments}</span>
                </div>
                <div class="post-actions">
                    <button onclick="editPost(${post.id})"><i class="fas fa-edit"></i></button>
                    <button onclick="deletePost(${post.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;
}

// 創建星級評分顯示
function createStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }

    return `<div class="stars">${stars}</div>`;
}

// 初始化統計圖表
function initStatsChart() {
    const ctx = document.getElementById('viewsChart');
    if (!ctx) return;

    // 模擬數據
    const data = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        datasets: [{
            label: '文章觀看次數',
            data: [65, 59, 80, 81, 56, 55],
            fill: false,
            borderColor: '#ff6b6b',
            tension: 0.1
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: '文章觀看趨勢'
                }
            }
        }
    });
}

// 初始化導覽列
function initializeNavbar() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // 檢查登入狀態
            const isLoggedIn = checkLoginStatus();
            if (isLoggedIn) {
                // 如果已登入，顯示用戶選單
                showUserMenu();
            } else {
                // 如果未登入，顯示登入模態框
                showLoginModal();
            }
        });
    }
}

// 檢查登入狀態
function checkLoginStatus() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 顯示用戶選單
function showUserMenu() {
    // 實現用戶選單顯示邏輯
}

// 顯示登入模態框
function showLoginModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <div class="modal-header">
                <h2>登入</h2>
            </div>
            <div class="modal-body">
                <form id="loginForm">
                    <div class="form-group">
                        <input type="email" placeholder="電子郵件" required>
                    </div>
                    <div class="form-group">
                        <input type="password" placeholder="密碼" required>
                    </div>
                    <div class="form-group">
                        <button type="submit" class="btn-login">登入</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    // 處理登入表單提交
    const loginForm = modal.querySelector('#loginForm');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // 實現登入邏輯
        handleLogin();
    });

    // 處理關閉按鈕
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', function() {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    });
}

// 處理登入
function handleLogin() {
    // 模擬登入成功
    localStorage.setItem('isLoggedIn', 'true');
    showNotification('登入成功！', 'success');
    
    // 關閉登入模態框
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    // 更新導覽列
    updateNavbar();
}

// 更新導覽列
function updateNavbar() {
    const loginBtn = document.querySelector('.btn-login');
    if (loginBtn) {
        if (checkLoginStatus()) {
            loginBtn.textContent = '我的帳戶';
        } else {
            loginBtn.textContent = '登入';
        }
    }
}

// 顯示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// 切換內容區域
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    const navItems = document.querySelectorAll('.blog-nav-item');

    sections.forEach(section => {
        section.classList.remove('active');
    });

    navItems.forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(`${sectionId}-section`).classList.add('active');
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');

    if (sectionId === 'drafts') {
        loadDrafts();
    }
}

// 載入草稿
function loadDrafts() {
    // 模擬從後端獲取草稿數據
    const mockDrafts = [
        {
            id: 3,
            title: '高雄美食探索',
            content: '最近在高雄發現了幾家不錯的餐廳...',
            restaurant: '海港城',
            location: '高雄市前鎮區',
            date: '2024-03-13',
            tags: ['高雄美食', '海鮮']
        }
    ];

    drafts = mockDrafts;
    updatePostsList();
}

// 編輯文章
function editPost(postId) {
    const post = posts.find(p => p.id === postId) || drafts.find(d => d.id === postId);
    if (!post) return;

    // 切換到編輯區域
    showSection('write');

    // 填充表單
    document.getElementById('postTitle').value = post.title;
    document.getElementById('restaurantName').value = post.restaurant;
    document.getElementById('restaurantLocation').value = post.location;
    document.getElementById('editor').innerHTML = post.content;
    document.getElementById('tags').value = post.tags.join(', ');

    // 設置評分
    if (post.rating) {
        const categories = ['environment', 'service', 'taste', 'price'];
        categories.forEach(category => {
            const stars = document.querySelector(`.stars[data-category="${category}"]`);
            if (stars) {
                stars.dataset.currentRating = post.rating;
                updateStars(stars.querySelectorAll('i'), post.rating);
                stars.parentElement.querySelector('.rating-value').textContent = post.rating + '.0';
            }
        });
        updateOverallRating();
    }
}

// 刪除文章
function deletePost(postId) {
    if (confirm('確定要刪除這篇文章嗎？')) {
        const postIndex = posts.findIndex(p => p.id === postId);
        const draftIndex = drafts.findIndex(d => d.id === postId);

        if (postIndex !== -1) {
            posts.splice(postIndex, 1);
        } else if (draftIndex !== -1) {
            drafts.splice(draftIndex, 1);
        }

        updatePostsList();
        showNotification('文章已刪除', 'success');
    }
}

// 初始化評分系統
function initRatingSystem() {
    const ratingTabs = document.querySelectorAll('.ranking-tab');
    ratingTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const type = this.dataset.type;
            
            // 更新標籤狀態
            ratingTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 更新排行榜顯示
            document.querySelectorAll('.ranking-list').forEach(list => {
                list.classList.remove('active');
            });
            document.getElementById(`${type}Ranking`).classList.add('active');

            // 更新排行榜數據
            updateRanking(type);
        });
    });
}

// 更新排行榜
function updateRanking(type) {
    const rankingList = document.getElementById(`${type}Ranking`);
    if (!rankingList) return;

    // 根據類型排序文章
    const sortedPosts = [...posts].sort((a, b) => b[type] - a[type]);

    // 生成排行榜 HTML
    rankingList.innerHTML = sortedPosts.slice(0, 5).map((post, index) => `
        <div class="ranking-item">
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-content">
                <div class="ranking-title">${post.title}</div>
                <div class="ranking-meta">
                    <span>${post.restaurant}</span>
                    <span>${post[type]} ${type === 'views' ? '次觀看' : '個讚'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 處理表單提交
document.getElementById('blogPostForm')?.addEventListener('submit', function(e) {
    e.preventDefault();

    // 獲取表單數據
    const title = document.getElementById('postTitle').value;
    const restaurant = document.getElementById('restaurantName').value;
    const location = document.getElementById('restaurantLocation').value;
    const content = document.getElementById('editor').innerHTML;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());
    const rating = document.querySelector('.overall-rating .rating-value').textContent;

    // 創建新文章
    const newPost = {
        id: Date.now(),
        title,
        content,
        restaurant,
        location,
        rating: parseFloat(rating),
        views: 0,
        likes: 0,
        comments: 0,
        date: new Date().toISOString().split('T')[0],
        tags
    };

    // 添加到文章列表
    posts.unshift(newPost);
    updatePostsList();

    // 清空表單
    this.reset();
    document.getElementById('editor').innerHTML = '';

    // 顯示成功通知
    showNotification('文章發布成功！', 'success');
});

// 處理草稿儲存
document.querySelector('.btn-save-draft')?.addEventListener('click', function() {
    const title = document.getElementById('postTitle').value;
    const restaurant = document.getElementById('restaurantName').value;
    const location = document.getElementById('restaurantLocation').value;
    const content = document.getElementById('editor').innerHTML;
    const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

    if (!title || !restaurant || !location || !content) {
        showNotification('請填寫所有必要欄位', 'error');
        return;
    }

    const newDraft = {
        id: Date.now(),
        title,
        content,
        restaurant,
        location,
        date: new Date().toISOString().split('T')[0],
        tags
    };

    drafts.unshift(newDraft);
    updatePostsList();

    // 清空表單
    document.getElementById('blogPostForm').reset();
    document.getElementById('editor').innerHTML = '';

    showNotification('草稿已儲存', 'success');
}); 