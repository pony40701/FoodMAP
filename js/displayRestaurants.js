// 餐廳顯示相關功能

// 顯示餐廳列表
function displayRestaurants(restaurants) {
    (`準備顯示 ${restaurants?.length || 0} 間餐廳`);
    
    // 檢查是否存在餐廳容器
    let container = document.getElementById('restaurants-container');
    
    // 如果不存在，則創建一個
    if (!container) {
        ('找不到餐廳容器，創建一個新的');
        container = document.createElement('div');
        container.id = 'restaurants-container';
        container.className = 'restaurants-grid';
        
        // 找到適合的位置插入
        const resultsTitle = document.getElementById('results-title');
        if (resultsTitle) {
            resultsTitle.after(container);
        } else {
            const foodTypesSection = document.querySelector('.food-types-section');
            if (foodTypesSection) {
                foodTypesSection.after(container);
            } else {
                document.body.appendChild(container);
            }
        }
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 如果沒有餐廳資料，顯示提示
    if (!restaurants || restaurants.length === 0) {
        container.innerHTML = '<div class="no-results">找不到相關餐廳</div>';
        return;
    }
    
    // 創建餐廳卡片
    restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        container.appendChild(card);
    });
    
    // 更新結果標題
    updateResultsTitle(`所有餐廳 (${restaurants.length} 間)`);
}

// 創建餐廳卡片
function createRestaurantCard(restaurant) {
    try {
        ('創建餐廳卡片:', restaurant);
        
        const card = document.createElement('div');
        card.className = 'restaurant-card v3';
        
        // 處理餐廳資料
        let processedRestaurant = { ...restaurant };
        
        // 處理 json_raw 欄位
        if (restaurant.json_raw) {
            try {
                const jsonData = typeof restaurant.json_raw === 'string' 
                    ? JSON.parse(restaurant.json_raw)
                    : restaurant.json_raw;
                processedRestaurant = { ...processedRestaurant, ...jsonData };
                ('處理後的餐廳資料:', processedRestaurant);
            } catch (error) {
                console.warn(`解析 json_raw 失敗: ${error.message}`, restaurant.json_raw);
            }
        }
        
        // 確保必要欄位存在
        const restaurantId = processedRestaurant.place_id || processedRestaurant.id || '';
        const restaurantName = processedRestaurant.name || '未命名餐廳';
        const restaurantAddress = processedRestaurant.formatted_address || processedRestaurant.address || '地址不詳';
        
        // 處理圖片
        let imageUrl = processedRestaurant.photos?.[0]?.getUrl?.() || 
            processedRestaurant.photo || 
            processedRestaurant.image_url || 
            'images/restaurant-placeholder.jpg';
            
        // 檢查是否已收藏
        const isFavorited = window.favoriteSystem && 
            typeof window.favoriteSystem.isStoreFavorited === 'function' && 
            restaurantId && 
            window.favoriteSystem.isStoreFavorited(restaurantId);
        
        card.innerHTML = `
            <div class="restaurant-image-wrapper">
                <img src="${imageUrl}" 
                     alt="${restaurantName}" 
                     loading="lazy" 
                     onerror="this.src='images/restaurant-placeholder.jpg'">
                <button class="favorite-btn" 
                        title="加入收藏" 
                        data-place-id="${restaurantId}" 
                        data-name="${restaurantName.replace(/"/g, '&quot;')}">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-title-row">
                    <h3 class="restaurant-name">${restaurantName}</h3>
                </div>
                <div class="restaurant-rating-row">
                    <div class="rating-stars">
                        ${generateStars(processedRestaurant.rating || 0)}
                    </div>
                    <span class="rating-score">
                        ${processedRestaurant.rating ? processedRestaurant.rating.toFixed(1) : '無評分'}
                    </span>
                    <span class="rating-count">
                        (${processedRestaurant.user_ratings_total || 0}則評論)
                    </span>
                </div>
                <div class="restaurant-address-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${restaurantAddress}</span>
                </div>
                <div class="restaurant-tags-row">
                    ${generateTags(processedRestaurant.cuisine_type || processedRestaurant.types || [])}
                </div>
                <div class="restaurant-status-row">
                    ${generateOpenStatus(
                        processedRestaurant.business_status,
                        processedRestaurant.opening_hours
                    )}
                </div>
            </div>
        `;
        
        // 添加點擊事件
        card.addEventListener('click', function(e) {
            if (e.target.closest('.favorite-btn')) return;
            
            if (window.mapInit?.showRestaurantDetail) {
                window.mapInit.showRestaurantDetail(processedRestaurant);
            } else if (window.RestaurantModal?.showRestaurantDetail) {
                window.RestaurantModal.showRestaurantDetail(processedRestaurant);
            } else {
                console.warn('無法顯示餐廳詳情：找不到相關函數');
            }
        });
        
        return card;
    } catch (error) {
        console.error('創建餐廳卡片時發生錯誤:', error, restaurant);
        
        // 返回一個錯誤卡片
        const errorCard = document.createElement('div');
        errorCard.className = 'restaurant-card v3 error';
        errorCard.innerHTML = `
            <div class="restaurant-info">
                <div class="restaurant-title-row">
                    <h3 class="restaurant-name">載入失敗</h3>
                </div>
                <div class="restaurant-address-row">
                    <span>無法顯示餐廳資訊</span>
                </div>
            </div>
        `;
        return errorCard;
    }
}

// 生成星級評分
function generateStars(rating) {
    if (!rating) return '☆☆☆☆☆';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    let stars = '★'.repeat(fullStars);
    if (halfStar) stars += '½';
    stars += '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0));
    
    return stars;
}

// 生成標籤
function generateTags(types) {
    if (!types || !types.length) return '';
    
    const typeMap = {
        'restaurant': { icon: 'fas fa-utensils', text: '餐廳' },
        'cafe': { icon: 'fas fa-coffee', text: '咖啡廳' },
        'bar': { icon: 'fas fa-glass-martini-alt', text: '酒吧' },
        'food': { icon: 'fas fa-hamburger', text: '美食' },
        'bakery': { icon: 'fas fa-bread-slice', text: '麵包店' },
        '中式': { icon: 'fas fa-utensils', text: '中式' },
        '美式': { icon: 'fas fa-hamburger', text: '美式' },
        '韓式': { icon: 'fas fa-utensils', text: '韓式' },
        '義式': { icon: 'fas fa-pizza-slice', text: '義式' },
        '法式': { icon: 'fas fa-wine-glass-alt', text: '法式' },
        '泰式': { icon: 'fas fa-pepper-hot', text: '泰式' },
        '火鍋': { icon: 'fas fa-hotdog', text: '火鍋' },
        '牛排': { icon: 'fas fa-drumstick-bite', text: '牛排' },
        '燒烤': { icon: 'fas fa-fire', text: '燒烤' },
        '飲品': { icon: 'fas fa-coffee', text: '飲品' },
        '異國料理': { icon: 'fas fa-globe-asia', text: '異國料理' }
    };
    
    let tagsHtml = '';
    
    // 只顯示前2個標籤
    for (let i = 0; i < Math.min(types.length, 2); i++) {
        const type = types[i];
        const tagInfo = typeMap[type] || { icon: 'fas fa-store', text: type };
        
        tagsHtml += `
            <span class="tag tag-${type}">
                <i class="${tagInfo.icon}"></i>
                ${tagInfo.text}
            </span>
        `;
    }
    
    return tagsHtml;
}

// 生成營業狀態
function generateOpenStatus(status, hours) {
    if (!hours) {
        return `
            <span class="status-dot unknown"></span>
            <span class="status-text unknown">營業狀態未知</span>
        `;
    }
    
    if (hours.open_now) {
        return `
            <span class="status-dot open"></span>
            <span class="status-text open">營業中</span>
            <span class="status-hours">${hours.weekday_text ? '查看營業時間' : ''}</span>
        `;
    } else {
        return `
            <span class="status-dot closed"></span>
            <span class="status-text closed">休息中</span>
            <span class="status-hours">${hours.weekday_text ? '查看營業時間' : ''}</span>
        `;
    }
}

// 更新結果標題
function updateResultsTitle(title) {
    const titleElement = document.getElementById('results-title');
    if (titleElement) {
        titleElement.textContent = title;
        titleElement.style.display = 'block';
    }
}

// 導出函數
window.displayRestaurants = displayRestaurants;
window.createRestaurantCard = createRestaurantCard;
window.updateResultsTitle = updateResultsTitle; 