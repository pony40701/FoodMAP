// 餐廳分類模組
class RestaurantCategory {
    constructor() {
        this.categories = [
            { type: 'all', name: '全部餐廳', icon: '🍽️' },
            { type: 'restaurant', name: '中式', icon: '🥢' },
            { type: 'restaurant', name: '日式', icon: '🍣' },
            { type: 'restaurant', name: '韓式', icon: '🍱' },
            { type: 'restaurant', name: '義式', icon: '🍕' },
            { type: 'restaurant', name: '法式', icon: '🥐' },
            { type: 'restaurant', name: '泰式', icon: '🥥' },
            { type: 'restaurant', name: '火鍋', icon: '🍲' },
            { type: 'restaurant', name: '牛排', icon: '🥩' },
            { type: 'restaurant', name: '燒烤', icon: '🍖' },
            { type: 'restaurant', name: '異國料理', icon: '🌏' },
            { type: 'restaurant', name: '素食', icon: '🥗' },
            { type: 'restaurant', name: '美式', icon: '🍔' }
        ];
    }

    // 渲染分類列表
    renderCategories(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 新增橫向排列的外層
        container.innerHTML = `
            <div class="food-types-row" style="display: flex; flex-wrap: wrap; gap: 16px; overflow-x: auto; padding: 8px 0;justify-content: center; align-items: center">

                ${this.categories.map(category => `
                    <div class="food-type-item" data-type="${category.type}" data-name="${category.name}" style="display: flex; flex-direction: column; align-items: center; min-width: 72px; cursor: pointer;">
                        <div class="emoji-circle" style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; font-size: 2rem; background: #fff6ee; border-radius: 50%; box-shadow: 0 2px 8px rgba(255,107,26,0.08); margin-bottom: 4px;">${category.icon}</div>
                        <span style="font-size: 15px; color: #444;">${category.name}</span>
                    </div>
                `).join('')}
            </div>
        `;
        this.attachEventListeners(container);
    }

    // 附加事件監聽器
    attachEventListeners(container) {
        container.querySelectorAll('.food-type-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.name;
                
                // 禁用無限滾動
                if (window.infiniteScroll) {
                    window.infiniteScroll.disable();
                }
                
                if (type === '全部餐廳') {
                    // 顯示全部餐廳，確保排序與收藏狀態
                    if (window.displayRestaurants && window.mapInit && window.mapInit.allRestaurants) {
                        window.displayRestaurants(window.mapInit.allRestaurants, true);
                    }
                    if (window.updateResultsTitle) {
                        window.updateResultsTitle(`全部餐廳 (${window.mapInit && window.mapInit.allRestaurants ? window.mapInit.allRestaurants.length : 0} 間)`);
                    }
                } else {
                    // 呼叫 mapInit 的 searchByType，確保分類正確
                    if (window.mapInit && typeof window.mapInit.searchByType === 'function') {
                        window.mapInit.searchByType(type);
                    }
                }
            });
        });
    }

    // 根據類型搜尋餐廳
    async searchByType(type, typeName) {
        if (!window.placesService) {
            window.displayRestaurants([]);
            window.updateResultsTitle(`${typeName} 餐廳 (0 間)`);
            return;
        }

        const request = {
            query: typeName + '餐廳',
            locationBias: {
                center: window.map ? window.map.getCenter() : new google.maps.LatLng(24.1477, 120.6470),
                radius: 5000
            }
        };

        try {
            window.placesService.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const restaurants = results.map(window.mapPlaceResult);
                    window.currentRestaurants = restaurants;
                    window.displayRestaurants(restaurants);
                    window.updateResultsTitle(`${typeName} 餐廳 (${restaurants.length} 間)`);
                    if (window.map) window.showRestaurantsOnMap(restaurants);
                } else {
                    window.displayRestaurants([]);
                    window.updateResultsTitle(`${typeName} 餐廳 (0 間)`);
                }
            });
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            window.displayRestaurants([]);
            window.updateResultsTitle(`${typeName} 餐廳搜尋失敗`);
        }
    }
}

// export default RestaurantCategory;
window.RestaurantCategory = RestaurantCategory; 