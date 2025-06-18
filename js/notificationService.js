// 通知服務模組
const NotificationService = {
    initialized: false,
    apiBaseUrl: window.API_BASE_URL || 'http://localhost:8080/api',
    pollingInterval: null,
    
    // 初始化通知服務
    initialize: function() {
        if (this.initialized) return;
        
        console.log('初始化通知服務...');
        
        // 檢查用戶是否已登入
        if (!localStorage.getItem('isLoggedIn') || !localStorage.getItem('userId')) {
            console.log('用戶未登入，無法初始化通知服務');
            return false;
        }
        
        // 立即檢查未讀通知數量
        this.checkUnreadNotifications();
        
        // 設置定期檢查 (每3分鐘檢查一次)
        this.pollingInterval = setInterval(() => {
            this.checkUnreadNotifications();
        }, 180000);
        
        // 開發測試用：如果需要，可以強制顯示通知徽章進行測試
        if (localStorage.getItem('debugShowNotification') === 'true') {
            this.showTestNotification();
        }
        
        this.initialized = true;
        console.log('通知服務初始化完成');
        return true;
    },
    
    // 測試用：立即顯示通知徽章
    showTestNotification: function() {
        console.log('顯示測試通知徽章');
        this.updateNotificationBadge(1);
    },
    
    // 檢查未讀通知數量
    checkUnreadNotifications: async function() {
        try {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                console.warn('用戶未登入，無法獲取通知');
                return;
            }
            
            // 檢查是否需要使用模擬數據
            if (localStorage.getItem('useMockData') === 'true' || true) {
                console.log('使用模擬通知數據');
                const mockUnreadCount = 3; // 模擬3個未讀通知
                this.updateNotificationBadge(mockUnreadCount);
                return mockUnreadCount;
            }
            
            // 嘗試從API獲取真實數據
            const response = await fetch(`${this.apiBaseUrl}/notifications/user/${userId}/unread-count`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`獲取未讀通知數量失敗: ${response.status}`);
            }
            
            const data = await response.json();
            const unreadCount = data.count || 0;
            
            console.log(`檢測到 ${unreadCount} 個未讀通知`);
            
            // 更新通知計數顯示
            this.updateNotificationBadge(unreadCount);
            
            return unreadCount;
        } catch (error) {
            console.error('檢查未讀通知時發生錯誤:', error);
            
            // 如果API請求失敗，使用模擬數據
            console.log('API請求失敗，使用模擬通知數據');
            const mockUnreadCount = 2; // 模擬2個未讀通知
            this.updateNotificationBadge(mockUnreadCount);
            return mockUnreadCount;
        }
    },
    
    // 更新通知徽章顯示
    updateNotificationBadge: function(count) {
        console.log(`更新通知徽章：${count}個未讀通知`);
        
        // 更新下拉選單中的通知徽章
        const badgeElement = document.getElementById('notification-count');
        if (badgeElement) {
            if (count > 0) {
                badgeElement.textContent = count > 99 ? '99+' : count;
                badgeElement.style.display = 'flex';
                console.log('顯示下拉選單通知徽章');
            } else {
                badgeElement.style.display = 'none';
                console.log('隱藏下拉選單通知徽章');
            }
        } else {
            console.warn('找不到下拉選單通知徽章元素');
        }
        
        // 更新頭像上的通知徽章
        const avatarBadge = document.getElementById('avatar-notification-badge');
        if (avatarBadge) {
            if (count > 0) {
                avatarBadge.style.display = 'flex';
                console.log('顯示頭像通知徽章');
                
                // 確保徽章可見 - 強制重新計算樣式
                setTimeout(() => {
                    avatarBadge.style.display = 'none';
                    setTimeout(() => {
                        avatarBadge.style.display = 'flex';
                    }, 10);
                }, 10);
            } else {
                avatarBadge.style.display = 'none';
                console.log('隱藏頭像通知徽章');
            }
        } else {
            console.warn('找不到頭像通知徽章元素');
        }
        
        // 開發測試用：將通知狀態存儲到localStorage
        if (count > 0) {
            localStorage.setItem('hasUnreadNotifications', 'true');
        } else {
            localStorage.removeItem('hasUnreadNotifications');
        }
    },
    
    // 標記通知為已讀
    markAsRead: async function(notificationId) {
        try {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                console.warn('用戶未登入，無法標記通知為已讀');
                return false;
            }
            
            const response = await fetch(`${this.apiBaseUrl}/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`標記通知已讀失敗: ${response.status}`);
            }
            
            // 重新檢查未讀通知數量
            this.checkUnreadNotifications();
            return true;
        } catch (error) {
            console.error('標記通知已讀時發生錯誤:', error);
            return false;
        }
    },
    
    // 標記所有通知為已讀
    markAllAsRead: async function() {
        try {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                console.warn('用戶未登入，無法標記所有通知為已讀');
                return false;
            }
            
            const response = await fetch(`${this.apiBaseUrl}/notifications/user/${userId}/mark-all-read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`標記所有通知已讀失敗: ${response.status}`);
            }
            
            // 更新通知計數顯示
            this.updateNotificationBadge(0);
            return true;
        } catch (error) {
            console.error('標記所有通知已讀時發生錯誤:', error);
            return false;
        }
    },
    
    // 停止通知輪詢
    stopPolling: function() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        this.initialized = false;
    }
};

// 將通知服務暴露為全局變量
window.NotificationService = NotificationService;

// 頁面載入完成後初始化通知服務
document.addEventListener('DOMContentLoaded', function() {
    // 檢查用戶是否已登入
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // 延遲一點時間確保其他模組已載入
        setTimeout(() => {
            NotificationService.initialize();
        }, 1000);
    }
}); 