// 食物類型選擇功能
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('foodTypeModal');
    const foodTypeBtn = document.getElementById('foodTypeBtn');
    const closeBtn = modal.querySelector('.close-modal');
    const applyBtn = modal.querySelector('.btn-apply');
    const clearBtn = modal.querySelector('.btn-clear');
    const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
    const otherCheckbox = document.getElementById('otherFoodType');
    const otherInput = document.getElementById('otherFoodTypeInput');
    const filterButtons = document.querySelectorAll('.category-item[data-filter]');
    let selectedTypes = new Set();
    let otherValue = '';

    // 收藏功能
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // 初始化時顯示最新文章
    filterArticlesByDate();

    // 添加過濾按鈕的點擊事件
    filterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            // 移除所有按鈕的 active 類
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // 添加當前按鈕的 active 類
            this.classList.add('active');

            const filterType = this.dataset.filter;
            if (filterType === 'latest') {
                filterArticlesByDate();
            } else if (filterType === 'popular') {
                filterArticlesByViews();
            }
        });
    });

    // 按日期排序（最新的在前面）
    function filterArticlesByDate() {
        const articles = Array.from(document.querySelectorAll('.food-card'));
        articles.sort((a, b) => {
            const dateA = new Date(a.dataset.date);
            const dateB = new Date(b.dataset.date);
            return dateB - dateA;
        });
        reorderArticles(articles);
    }

    // 按瀏覽次數排序（最多的在前面）
    function filterArticlesByViews() {
        const articles = Array.from(document.querySelectorAll('.food-card'));
        articles.sort((a, b) => {
            const viewsA = parseInt(a.dataset.views);
            const viewsB = parseInt(b.dataset.views);
            return viewsB - viewsA;
        });
        reorderArticles(articles);
    }

    // 重新排序文章
    function reorderArticles(sortedArticles) {
        const container = document.querySelector('.food-grid');
        sortedArticles.forEach(article => {
            container.appendChild(article);
        });
    }

    // 打開彈窗
    foodTypeBtn.addEventListener('click', function() {
        modal.classList.add('show');
    });

    // 關閉彈窗
    function closeModal() {
        modal.classList.remove('show');
    }

    closeBtn.addEventListener('click', closeModal);

    // 點擊彈窗外部關閉
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // 處理其他類型輸入框的顯示/隱藏
    otherCheckbox.addEventListener('change', function() {
        otherInput.classList.toggle('show', this.checked);
        if (!this.checked) {
            otherInput.value = '';
            otherValue = '';
        }
    });

    // 儲存其他類型的輸入值
    otherInput.addEventListener('input', function() {
        otherValue = this.value;
    });

    // 清除選擇
    clearBtn.addEventListener('click', function() {
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        selectedTypes.clear();
        otherValue = '';
        otherInput.value = '';
        otherInput.classList.remove('show');
        updateFoodTypeButton();
    });

    // 套用選擇
    applyBtn.addEventListener('click', function() {
        selectedTypes.clear();
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                if (checkbox.value === 'other' && otherValue.trim()) {
                    selectedTypes.add('other:' + otherValue.trim());
                } else if (checkbox.value !== 'other') {
                    selectedTypes.add(checkbox.value);
                }
            }
        });
        updateFoodTypeButton();
        filterArticles();
        closeModal();
    });

    // 更新按鈕文字
    function updateFoodTypeButton() {
        if (selectedTypes.size === 0) {
            foodTypeBtn.textContent = '食物類型';
            foodTypeBtn.classList.remove('active');
        } else {
            foodTypeBtn.textContent = `已選擇 ${selectedTypes.size} 種類型`;
            foodTypeBtn.classList.add('active');
        }
    }

    // 篩選文章
    function filterArticles() {
        const articles = document.querySelectorAll('.food-card');
        
        if (selectedTypes.size === 0) {
            // 如果沒有選擇任何類型，顯示所有文章
            articles.forEach(article => {
                article.style.display = 'block';
            });
            return;
        }

        articles.forEach(article => {
            const category = article.querySelector('.category').textContent.trim();
            const categoryValue = getCategoryValue(category);
            
            // 檢查是否符合選擇的類型（包括其他類型）
            const isMatch = Array.from(selectedTypes).some(type => {
                if (type.startsWith('other:')) {
                    // 對於其他類型，檢查標題、店名和描述
                    const title = article.querySelector('h2').textContent.toLowerCase();
                    const restaurantName = article.querySelector('.restaurant-name span').textContent.toLowerCase();
                    const excerpt = article.querySelector('.excerpt').textContent.toLowerCase();
                    const searchTerm = type.split(':')[1].toLowerCase();
                    return title.includes(searchTerm) || 
                           restaurantName.includes(searchTerm) || 
                           excerpt.includes(searchTerm);
                }
                return type === categoryValue;
            });

            article.style.display = isMatch ? 'block' : 'none';
        });
    }

    // 將中文類別轉換為對應的值
    function getCategoryValue(category) {
        const categoryMap = {
            '台式': 'taiwanese',
            '日式': 'japanese',
            '韓式': 'korean',
            '東南亞': 'southeast-asian',
            '中東': 'middle-eastern',
            '義式': 'italian',
            '燒肉': 'bbq',
            '火鍋': 'hotpot',
            '漢堡': 'burger',
            '牛排': 'steak',
            '甜點': 'dessert',
            '素食': 'vegetarian',
            // 相容舊的類別名稱
            '泰式料理': 'southeast-asian',
            '韓式料理': 'korean',
            '日本料理': 'japanese',
            '台式料理': 'taiwanese',
            '義式料理': 'italian'
        };
        return categoryMap[category] || category.toLowerCase();
    }

    // 初始化收藏狀態
    function initializeFavorites() {
        favoriteButtons.forEach(btn => {
            const card = btn.closest('.food-card');
            const articleId = getArticleId(card);
            if (favorites.includes(articleId)) {
                btn.classList.add('active');
                btn.querySelector('i').classList.remove('far');
                btn.querySelector('i').classList.add('fas');
            }
        });
    }

    // 生成文章唯一ID
    function getArticleId(card) {
        const title = card.querySelector('h2').textContent;
        const date = card.dataset.date;
        return `${title}-${date}`;
    }

    // 處理收藏點擊
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.food-card');
            const articleId = getArticleId(card);
            const icon = this.querySelector('i');

            // 添加動畫
            this.classList.add('animating');
            setTimeout(() => {
                this.classList.remove('animating');
            }, 400);

            if (this.classList.contains('active')) {
                // 取消收藏
                this.classList.remove('active');
                icon.classList.remove('fas');
                icon.classList.add('far');
                favorites = favorites.filter(id => id !== articleId);
            } else {
                // 加入收藏
                this.classList.add('active');
                icon.classList.remove('far');
                icon.classList.add('fas');
                favorites.push(articleId);
            }

            // 儲存到 localStorage
            localStorage.setItem('favorites', JSON.stringify(favorites));
        });
    });

    // 初始化收藏狀態
    initializeFavorites();
}); 