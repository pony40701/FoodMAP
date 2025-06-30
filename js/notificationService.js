// 通知服務模組
const NotificationService = {
    initialized: false,
    apiBaseUrl: window.API_BASE_URL || 'http://localhost:8080/api',
    pollingInterval: null,
    
    // 初始化通知服務
    initialize: function() {
        if (this.initialized) return;
        
        // 檢查用戶是否已登入
        if (!localStorage.getItem('isLoggedIn') || !localStorage.getItem('userId')) {
            return false;
        }
        
        // 立即檢查未讀通知數量
        this.checkUnreadNotifications();
        
        // 設置定期檢查 (每3分鐘檢查一次)
        this.pollingInterval = setInterval(() => {
            this.checkUnreadNotifications();
        }, 180000);
        
        // 監聽跨頁面的通知狀態變化
        this.setupCrossPageSync();
        
        // 監聽頁面可見性變化
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkUnreadNotifications();
            }
        });
        
        this.initialized = true;
        return true;
    },
    
    // 設置跨頁面同步
    setupCrossPageSync: function() {
        // 監聽 storage 事件，當其他頁面更新通知狀態時同步
        window.addEventListener('storage', (e) => {
            if (e.key === 'notificationReadStatus' || e.key === 'notificationReadStatusTimestamp') {
                this.checkUnreadNotifications();
            }
        });
        
        // 監聽自定義事件
        document.addEventListener('notificationMarkedAsRead', () => {
            this.checkUnreadNotifications();
        });
    },
    
    // 獲取本地存儲的通知已讀狀態
    getLocalNotificationReadStatus: function() {
        try {
            const readStatus = localStorage.getItem('notificationReadStatus');
            return readStatus ? JSON.parse(readStatus) : {};
        } catch (error) {
            return {};
        }
    },
    
    // 更新本地存儲的通知已讀狀態
    updateLocalNotificationReadStatus: function(notificationId = null, markAllAsRead = false) {
        try {
            let readStatus = this.getLocalNotificationReadStatus();
            
            if (markAllAsRead) {
                // 標記所有通知為已讀
                readStatus.allRead = true;
                readStatus.lastMarkAllReadTime = Date.now();
            } else if (notificationId) {
                // 確保 notificationId 是字串類型
                notificationId = String(notificationId);
                
                // 標記特定通知為已讀
                if (!readStatus.readNotifications) {
                    readStatus.readNotifications = [];
                }
                if (!readStatus.readNotifications.includes(notificationId)) {
                    readStatus.readNotifications.push(notificationId);
                }
            }
            
            localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
            
            // 觸發跨頁面同步事件
            localStorage.setItem('notificationReadStatusTimestamp', Date.now().toString());
            
            return readStatus;
        } catch (error) {
            return {};
        }
    },
    
    // 檢查未讀通知數量
    checkUnreadNotifications: async function() {
        try {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                return;
            }
            
            // 獲取本地已讀狀態
            const readStatus = this.getLocalNotificationReadStatus();
            
            // 檢查是否所有通知都已標記為已讀
            if (readStatus.allRead) {
                // 檢查標記時間，如果是最近標記的（24小時內），則保持已讀狀態
                const markTime = readStatus.lastMarkAllReadTime || 0;
                const hoursSinceMarked = (Date.now() - markTime) / (1000 * 60 * 60);
                
                if (hoursSinceMarked < 24) {
                    this.updateNotificationBadge(0);
                    return 0;
                }
            }
            
            // 如果API可用，嘗試從API獲取真實數據
            try {
                const response = await fetch(`${this.apiBaseUrl}/notifications/user/${userId}/unread-count`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    let unreadCount = data.count || 0;
                    
                    // 考慮本地已讀狀態
                    if (readStatus.readNotifications && readStatus.readNotifications.length > 0) {
                        unreadCount = Math.max(0, unreadCount - readStatus.readNotifications.length);
                    }
                    
                    this.updateNotificationBadge(unreadCount);
                    return unreadCount;
                }
            } catch (apiError) {
                // API 失敗時的處理
            }
            
            // 移除模擬資料，改為返回0
            this.updateNotificationBadge(0);
            return 0;
            
        } catch (error) {
            
            // 出錯時檢查本地狀態
            const errorReadStatus = this.getLocalNotificationReadStatus();
            const unreadCount = errorReadStatus.allRead ? 0 : 1;
            this.updateNotificationBadge(unreadCount);
            return unreadCount;
        }
    },
    
    // 更新通知徽章顯示
    updateNotificationBadge: function(count) {
        // 優先顯示感嘆號指示器，有未讀通知時顯示感嘆號而不是數字
        const exclamationElement = document.getElementById('notification-exclamation');
        const badgeElement = document.getElementById('notification-count');
        
        if (count > 0) {
            // 有未讀通知時優先顯示感嘆號
            if (exclamationElement) {
                exclamationElement.style.display = 'flex';
            }
            
            // 隱藏數字徽章，避免重疊
            if (badgeElement) {
                badgeElement.style.display = 'none';
            }
        } else {
            // 沒有未讀通知時隱藏感嘆號
            if (exclamationElement) {
                exclamationElement.style.display = 'none';
            }
            
            // 也隱藏數字徽章
            if (badgeElement) {
                badgeElement.style.display = 'none';
            }
        }
        
        if (!exclamationElement) {
        }
        if (!badgeElement) {
        }
        
        // 更新頭像上的通知徽章
        const avatarBadge = document.getElementById('avatar-notification-badge');
        if (avatarBadge) {
            if (count > 0) {
                avatarBadge.style.display = 'flex';
                
                // 確保徽章可見 - 強制重新計算樣式
                setTimeout(() => {
                    avatarBadge.style.display = 'none';
                    setTimeout(() => {
                        avatarBadge.style.display = 'flex';
                    }, 10);
                }, 10);
            } else {
                avatarBadge.style.display = 'none';
            }
        } else {
        }
        
        // 更新通知狀態到localStorage
        if (count > 0) {
            localStorage.setItem('hasUnreadNotifications', 'true');
        } else {
            localStorage.removeItem('hasUnreadNotifications');
        }
    },
    
    // 標記通知為已讀
    markAsRead: async function(notificationId) {
        try {
            // 確保 notificationId 是字串類型
            notificationId = String(notificationId);
            
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                return false;
            }
            
            // 立即更新本地狀態
            this.updateLocalNotificationReadStatus(notificationId);
            
            try {
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
            } catch (apiError) {
            }
            
            // 重新檢查未讀通知數量
            this.checkUnreadNotifications();
            
            // 觸發事件通知其他頁面
            document.dispatchEvent(new CustomEvent('notificationMarkedAsRead', {
                detail: { notificationId }
            }));
            
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // 標記所有通知為已讀
    markAllAsRead: async function() {
        try {
            const userId = localStorage.getItem('userId');
            const authToken = localStorage.getItem('authToken');
            
            if (!userId || !authToken) {
                return false;
            }
            
            // 立即更新本地狀態
            this.updateLocalNotificationReadStatus(null, true);
            
            try {
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
            } catch (apiError) {
            }
            
            // 更新通知計數顯示
            this.updateNotificationBadge(0);
            
            // 觸發事件通知其他頁面
            document.dispatchEvent(new CustomEvent('notificationMarkedAsRead', {
                detail: { allRead: true }
            }));
            
            return true;
        } catch (error) {
            return false;
        }
    },
    
    // 重置通知狀態（用於重新登入）
    resetNotificationStatus: function() {
        localStorage.removeItem('notificationReadStatus');
        localStorage.removeItem('hasUnreadNotifications');
        this.checkUnreadNotifications();
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