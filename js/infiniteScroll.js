// 無限滾動載入功能
class InfiniteScroll {
    constructor() {
        this.pageSize = 20;  // 每頁顯示數量
        this.currentPage = 1; // 當前頁數
        this.allRestaurants = []; // 所有餐廳數據
        this.loading = false; // 是否正在載入
        this.hasMore = true; // 是否還有更多數據
        
        // 綁定滾動事件
        this.bindScrollEvent();
    }    // 設置餐廳數據
    setRestaurants(restaurants) {
        // 對餐廳進行排序：收藏的排在前面，然後按照評分排序
        this.allRestaurants = restaurants.sort((a, b) => {
            // 先判斷是否被收藏
            const aFavorite = window.isFavorite(a.id);
            const bFavorite = window.isFavorite(b.id);
            
            if (aFavorite && !bFavorite) return -1;
            if (!aFavorite && bFavorite) return 1;
            
            // 如果收藏狀態相同，則按照評分排序
            if (b.rating === a.rating) {
                return b.user_ratings_total - a.user_ratings_total;
            }
            return b.rating - a.rating;
        });
        
        this.currentPage = 1;
        this.hasMore = restaurants.length > this.pageSize;
        this.displayCurrentPage();
    }

    // 顯示當前頁的餐廳
    displayCurrentPage() {
        const start = 0;
        const end = this.currentPage * this.pageSize;
        const currentRestaurants = this.allRestaurants.slice(start, end);
        
        window.displayRestaurants(currentRestaurants, this.currentPage === 1);
        
        this.loading = false;
        this.hasMore = end < this.allRestaurants.length;
    }

    // 綁定滾動事件
    bindScrollEvent() {
        window.addEventListener('scroll', () => {
            if (this.loading || !this.hasMore) return;

            const {scrollTop, scrollHeight, clientHeight} = document.documentElement;
            
            // 當滾動到底部時
            if (scrollTop + clientHeight >= scrollHeight - 100) {
                this.loading = true;
                this.currentPage++;
                this.displayCurrentPage();
            }
        });
    }

    // 重置狀態
    reset() {
        this.currentPage = 1;
        this.allRestaurants = [];
        this.loading = false;
        this.hasMore = true;
    }
}

// 創建實例並掛載到 window
window.infiniteScroll = new InfiniteScroll();
