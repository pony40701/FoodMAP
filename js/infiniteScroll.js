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
        // 收藏功能已被移除，只按照評分排序
        this.allRestaurants = restaurants.sort((a, b) => {
            // 按照評分排序
            if (b.rating === a.rating) {
                return b.user_ratings_total - a.user_ratings_total;
            }
            return b.rating - a.rating;
        });
        
        // 重置頁面並顯示
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

// 顯示提示訊息的輔助函數
function showToast(message) {
    if (window.showToast) {
        window.showToast(message);
    } else {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}
