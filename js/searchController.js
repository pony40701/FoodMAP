// 搜尋控制器
class SearchController {
    constructor() {
        this.searchService = null;
        this.foodInput = null;
        this.locationInput = null;
        this.searchButton = null;
        this.isInitialized = false;
    }

    // 初始化搜尋控制器
    async init() {
        try {
            // 初始化搜尋服務
            this.searchService = new SearchService();
            await this.searchService.init();

            // 獲取搜尋欄元素
            this.foodInput = document.querySelector('.search-input[placeholder="找美食"]');
            this.locationInput = document.querySelector('.search-input[placeholder="選擇地點"]');
            this.searchButton = document.querySelector('.search-btn');

            if (!this.foodInput || !this.locationInput || !this.searchButton) {
                console.error('找不到搜尋欄元素');
                return;
            }

            // 綁定事件
            this.bindEvents();

            this.isInitialized = true;
            console.log('搜尋控制器初始化完成');
        } catch (error) {
            console.error('搜尋控制器初始化失敗:', error);
        }
    }

    // 綁定事件
    bindEvents() {
        // 搜尋按鈕點擊事件
        this.searchButton.addEventListener('click', () => {
            this.performSearch();
        });

        // 輸入框回車事件
        this.foodInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        this.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // 輸入框變更事件（即時搜尋）
        let foodTimeout, locationTimeout;
        
        this.foodInput.addEventListener('input', (e) => {
            clearTimeout(foodTimeout);
            foodTimeout = setTimeout(() => {
                this.performSearch();
            }, 500); // 500ms 延遲
        });

        this.locationInput.addEventListener('input', (e) => {
            clearTimeout(locationTimeout);
            locationTimeout = setTimeout(() => {
                this.performSearch();
            }, 500); // 500ms 延遲
        });

        // 添加搜尋建議
        this.addSearchSuggestions();

        // 清空搜尋條件
        this.addClearSearchButton();
    }

    // 添加搜尋建議
    addSearchSuggestions() {
        // 食物類型建議
        const foodSuggestions = [
            '中式料理', '美式漢堡', '韓式烤肉', '義大利麵', '法式甜點', 
            '泰式料理', '火鍋', '牛排', '燒烤', '手搖飲', '咖啡廳'
        ];

        // 地點建議
        const locationSuggestions = [
            '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
            '信義區', '大安區', '中山區', '松山區', '萬華區', '中正區'
        ];

        // 為食物輸入框添加建議
        this.addSuggestionsToInput(this.foodInput, foodSuggestions);
        
        // 為地點輸入框添加建議
        this.addSuggestionsToInput(this.locationInput, locationSuggestions);
    }

    // 為輸入框添加建議功能
    addSuggestionsToInput(input, suggestions) {
        const suggestionContainer = document.createElement('div');
        suggestionContainer.className = 'suggestion-container';
        suggestionContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        `;

        input.parentNode.appendChild(suggestionContainer);

        input.addEventListener('input', () => {
            const value = input.value.toLowerCase();
            if (value.length < 1) {
                suggestionContainer.style.display = 'none';
                return;
            }

            const filteredSuggestions = suggestions.filter(suggestion => 
                suggestion.toLowerCase().includes(value)
            );

            if (filteredSuggestions.length > 0) {
                suggestionContainer.innerHTML = filteredSuggestions
                    .map(suggestion => `
                        <div class="suggestion-item" style="
                            padding: 10px 15px;
                            cursor: pointer;
                            border-bottom: 1px solid #f0f0f0;
                            transition: background-color 0.2s;
                        ">${suggestion}</div>
                    `).join('');
                
                suggestionContainer.style.display = 'block';

                // 添加點擊事件
                suggestionContainer.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        input.value = item.textContent;
                        suggestionContainer.style.display = 'none';
                        this.performSearch();
                    });

                    item.addEventListener('mouseenter', () => {
                        item.style.backgroundColor = '#f5f5f5';
                    });

                    item.addEventListener('mouseleave', () => {
                        item.style.backgroundColor = 'white';
                    });
                });
            } else {
                suggestionContainer.style.display = 'none';
            }
        });

        // 點擊其他地方時隱藏建議
        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !suggestionContainer.contains(e.target)) {
                suggestionContainer.style.display = 'none';
            }
        });

        // 失去焦點時隱藏建議
        input.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionContainer.style.display = 'none';
            }, 200);
        });
    }

    // 執行搜尋
    async performSearch() {
        if (!this.isInitialized) {
            console.error('搜尋控制器尚未初始化');
            return;
        }

        const foodKeyword = this.foodInput.value.trim();
        const locationKeyword = this.locationInput.value.trim();

        try {
            // 顯示載入中狀態
            this.showLoadingState();

            // 執行搜尋
            const results = await this.searchService.search(foodKeyword, locationKeyword);

            // 顯示搜尋結果
            this.displaySearchResults(results, foodKeyword, locationKeyword);

        } catch (error) {
            console.error('搜尋失敗:', error);
            this.showErrorState('搜尋失敗，請稍後再試');
        }
    }

    // 顯示載入中狀態
    showLoadingState() {
        const container = document.getElementById('restaurants-container');
        if (container) {
            container.innerHTML = `
                <div class="loading-message">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>搜尋中...</p>
                </div>
            `;
        }

        // 更新結果標題
        this.updateResultsTitle('搜尋中...');
    }

    // 顯示搜尋結果
    displaySearchResults(results, foodKeyword, locationKeyword) {
        const container = document.getElementById('restaurants-container');
        if (!container) return;

        if (!results || results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>找不到符合條件的餐廳</p>
                    <p class="search-tips">試試其他關鍵字或地點</p>
                </div>
            `;
            
            // 更新結果標題
            const searchTerms = [];
            if (foodKeyword) searchTerms.push(`"${foodKeyword}"`);
            if (locationKeyword) searchTerms.push(`"${locationKeyword}"`);
            const searchText = searchTerms.length > 0 ? `搜尋 ${searchTerms.join(' 和 ')}` : '搜尋結果';
            this.updateResultsTitle(`${searchText} (0 間餐廳)`);
            return;
        }

        // 清空容器
        container.innerHTML = '';

        // 創建餐廳卡片
        results.forEach(restaurant => {
            const card = this.createRestaurantCard(restaurant);
            if (card) {
                container.appendChild(card);
            }
        });

        // 更新結果標題
        const searchTerms = [];
        if (foodKeyword) searchTerms.push(`"${foodKeyword}"`);
        if (locationKeyword) searchTerms.push(`"${locationKeyword}"`);
        const searchText = searchTerms.length > 0 ? `搜尋 ${searchTerms.join(' 和 ')}` : '搜尋結果';
        this.updateResultsTitle(`${searchText} (${results.length} 間餐廳)`);

        // 設置卡片點擊事件
        this.setupCardClickEvents();
    }

    // 創建餐廳卡片
    createRestaurantCard(restaurant) {
        const card = document.createElement('div');
        card.className = 'restaurant-card v3';
        card.setAttribute('data-id', restaurant.id);

        // 營業時間判斷
        let isOpen = false;
        let todayHours = '';
        
        if (restaurant.opening_hours) {
            if (restaurant.opening_hours.weekday_text) {
                const today = new Date().getDay();
                const index = today === 0 ? 6 : today - 1;
                
                if (restaurant.opening_hours.weekday_text[index]) {
                    const todayText = restaurant.opening_hours.weekday_text[index];
                    const timeMatch = todayText.match(/:\s*(.+)$/);
                    const timeStr = timeMatch ? timeMatch[1].trim() : null;
                    
                    if (timeStr) {
                        isOpen = window.businessHours ? window.businessHours.isOpenFromText(timeStr) : false;
                        const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][today];
                        todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${dayName} ${timeStr}</span>`;
                    }
                }
            }
        }

        // 設置圖片URL
        const imageUrl = `http://localhost:8080/api/restaurant-images/${restaurant.id}/raw`;
        
        // 評分和評論數
        const rating = restaurant.rating || 0;
        const reviewCount = restaurant.user_ratings_total || 0;

        // 檢查是否已收藏（異步處理）
        this.checkFavoriteStatus(restaurant.id).then(isFavorited => {
            const favoriteBtn = card.querySelector('.favorite-btn');
            if (favoriteBtn) {
                const heartIcon = favoriteBtn.querySelector('i');
                if (heartIcon) {
                    heartIcon.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
                }
            }
        });

        card.innerHTML = `
            <div class="restaurant-image-wrapper v3">
                <img src="${imageUrl}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
                <button class="favorite-btn v3" title="加入收藏" data-place-id="${restaurant.id}" data-name="${(restaurant.name || '').replace(/"/g, '&quot;')}">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="restaurant-info v3">
                <div class="restaurant-title-row v3">
                    <h3 class="restaurant-name v3">${restaurant.name}</h3>
                </div>
                <div class="restaurant-rating-row v3">
                    <span class="rating-stars v3">${this.generateStars(rating)}</span>
                    <span class="rating-score v3">${rating ? rating.toFixed(1) : 'N/A'}</span>
                    <span class="rating-count v3">(${reviewCount}則評論)</span>
                </div>
                <div class="restaurant-address-row v3">
                    <i class="fas fa-map-marker-alt"></i>
                    <span class="address-text v3">${restaurant.address}</span>
                </div>
                <div class="restaurant-status-row v3">
                    <span class="status-dot v3 ${isOpen ? 'open' : 'closed'}"></span>
                    <span class="status-text v3 ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
                    ${todayHours}
                </div>
            </div>`;

        return card;
    }

    // 檢查收藏狀態
    async checkFavoriteStatus(placeId) {
        try {
            if (window.favoriteSystem && typeof window.favoriteSystem.isStoreFavorited === 'function') {
                return await window.favoriteSystem.isStoreFavorited(placeId);
            }
        } catch (error) {
            console.error('檢查收藏狀態失敗:', error);
        }
        return false;
    }

    // 生成星級評分
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
    }

    // 設置卡片點擊事件
    setupCardClickEvents() {
        const cards = document.querySelectorAll('.restaurant-card');
        cards.forEach(card => {
            const placeId = card.getAttribute('data-id');
            if (placeId) {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.favorite-btn')) {
                        e.stopPropagation();
                        return;
                    }
                    
                    if (window.RestaurantModal && typeof window.RestaurantModal.showRestaurantDetail === 'function') {
                        fetch(`${window.API_BASE_URL || 'http://localhost:8080/api'}/google-restaurants/${placeId}`)
                            .then(response => response.json())
                            .then(restaurantData => {
                                window.RestaurantModal.showRestaurantDetail(restaurantData);
                            })
                            .catch(error => {
                                console.error('獲取餐廳數據失敗:', error);
                                alert('無法獲取餐廳詳情，請稍後再試');
                            });
                    }
                });
            }
        });

        // 設置收藏按鈕事件
        this.setupFavoriteButtons();
    }

    // 設置收藏按鈕事件
    setupFavoriteButtons() {
        const favoriteButtons = document.querySelectorAll('.favorite-btn');
        favoriteButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                
                const placeId = button.getAttribute('data-place-id');
                const restaurantName = button.getAttribute('data-name');
                
                if (!placeId) {
                    console.error('找不到餐廳 ID');
                    return;
                }

                try {
                    // 檢查收藏系統是否可用
                    if (window.favoriteSystem && typeof window.favoriteSystem.toggleFavorite === 'function') {
                        const isFavorited = await window.favoriteSystem.toggleFavorite(placeId, restaurantName);
                        
                        // 更新按鈕狀態
                        const heartIcon = button.querySelector('i');
                        if (heartIcon) {
                            heartIcon.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
                        }
                        
                        // 顯示提示訊息
                        if (window.showToast) {
                            window.showToast(isFavorited ? '已加入收藏' : '已取消收藏');
                        }
                    } else {
                        console.error('收藏系統未初始化');
                        if (window.showToast) {
                            window.showToast('收藏功能暫時無法使用');
                        }
                    }
                } catch (error) {
                    console.error('收藏操作失敗:', error);
                    if (window.showToast) {
                        window.showToast('收藏操作失敗，請稍後再試');
                    }
                }
            });
        });
    }

    // 更新結果標題
    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    // 顯示錯誤狀態
    showErrorState(message) {
        const container = document.getElementById('restaurants-container');
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
        this.updateResultsTitle('搜尋失敗');
    }

    // 添加清空搜尋按鈕
    addClearSearchButton() {
        // 為每個輸入框添加清空按鈕
        [this.foodInput, this.locationInput].forEach(input => {
            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'clear-search-btn';
            clearButton.innerHTML = '×';
            clearButton.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 18px;
                color: #999;
                cursor: pointer;
                display: none;
                z-index: 10;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: all 0.2s ease;
            `;

            // 設置輸入框為相對定位
            input.style.position = 'relative';

            // 插入清空按鈕
            input.parentNode.appendChild(clearButton);

            // 顯示/隱藏清空按鈕
            const updateClearButton = () => {
                clearButton.style.display = input.value ? 'flex' : 'none';
            };

            input.addEventListener('input', updateClearButton);
            input.addEventListener('focus', updateClearButton);
            input.addEventListener('blur', updateClearButton);

            // 初始化狀態
            updateClearButton();

            // 清空按鈕點擊事件
            clearButton.addEventListener('click', () => {
                input.value = '';
                clearButton.style.display = 'none';
                this.performSearch();
                input.focus();
            });
        });
    }

    // 清空搜尋條件
    clearSearch() {
        if (this.foodInput) this.foodInput.value = '';
        if (this.locationInput) this.locationInput.value = '';
        this.performSearch();
    }
}

// 導出搜尋控制器
window.SearchController = SearchController; 