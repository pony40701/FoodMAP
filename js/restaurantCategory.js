// 餐廳分類模組
class RestaurantCategory {
    constructor() {
        this.categories = [
            { type: 'restaurant', name: '中式', icon: '🥢' },
            { type: 'restaurant', name: '燒烤', icon: '🍖' },
            { type: 'restaurant', name: '火鍋', icon: '🍲' },
            { type: 'restaurant', name: '日式', icon: '🍣' },
            { type: 'restaurant', name: '美式', icon: '🍔' },
            { type: 'restaurant', name: '義式', icon: '🍝' },
            { type: 'restaurant', name: '牛排', icon: '🥩' },
            { type: 'restaurant', name: '素食', icon: '🥗' }
        ];
    }

    // 渲染分類列表
    renderCategories(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const categoriesHTML = this.categories.map(category => `
            <div class="food-type-item" data-type="${category.type}" data-name="${category.name}">
                <div class="emoji-circle">${category.icon}</div>
                <span>${category.name}</span>
            </div>
        `).join('');

        container.innerHTML = categoriesHTML;
        this.attachEventListeners(container);
    }

    // 附加事件監聽器
    attachEventListeners(container) {
        container.querySelectorAll('.food-type-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const name = item.dataset.name;
                this.searchByType(type, name);
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

export default RestaurantCategory; 