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
        
        // 監聽跨頁面的通知狀態變化
        this.setupCrossPageSync();
        
        // 開發測試用：如果需要，可以強制顯示通知徽章進行測試
        if (localStorage.getItem('debugShowNotification') === 'true') {
            this.showTestNotification();
        }
        
        this.initialized = true;
        console.log('通知服務初始化完成');
        return true;
    },
    
    // 設置跨頁面同步
    setupCrossPageSync: function() {
        // 監聽 storage 事件，當其他頁面更新通知狀態時同步
        window.addEventListener('storage', (e) => {
            if (e.key === 'notificationReadStatus') {
                console.log('檢測到其他頁面的通知狀態變化，重新檢查');
                this.checkUnreadNotifications();
            }
        });
        
        // 監聽自定義事件
        document.addEventListener('notificationMarkedAsRead', () => {
            console.log('檢測到通知已標記為已讀事件');
            this.checkUnreadNotifications();
        });
    },
    
    // 測試用：立即顯示通知徽章
    showTestNotification: function() {
        console.log('顯示測試通知徽章');
        this.updateNotificationBadge(1);
    },
    
    // 獲取本地存儲的通知已讀狀態
    getLocalNotificationReadStatus: function() {
        try {
            const readStatus = localStorage.getItem('notificationReadStatus');
            return readStatus ? JSON.parse(readStatus) : {};
        } catch (error) {
            console.error('解析通知已讀狀態失敗:', error);
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
                console.log('本地標記所有通知為已讀');
            } else if (notificationId) {
                // 標記特定通知為已讀
                if (!readStatus.readNotifications) {
                    readStatus.readNotifications = [];
                }
                if (!readStatus.readNotifications.includes(notificationId)) {
                    readStatus.readNotifications.push(notificationId);
                    console.log(`本地標記通知 ${notificationId} 為已讀`);
                }
            }
            
            localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
            
            // 觸發跨頁面同步事件
            localStorage.setItem('notificationReadStatus', JSON.stringify(readStatus));
            
            return readStatus;
        } catch (error) {
            console.error('更新通知已讀狀態失敗:', error);
            return {};
        }
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
            
            // 獲取本地已讀狀態
            const readStatus = this.getLocalNotificationReadStatus();
            
            // 檢查是否所有通知都已標記為已讀
            if (readStatus.allRead) {
                console.log('所有通知已標記為已讀');
                this.updateNotificationBadge(0);
                return 0;
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
                    
                    console.log(`從API檢測到 ${unreadCount} 個未讀通知`);
                    this.updateNotificationBadge(unreadCount);
                    return unreadCount;
                }
            } catch (apiError) {
                console.warn('API請求失敗，使用本地數據:', apiError);
            }
            
            // API失敗時使用模擬數據，但考慮本地已讀狀態
            console.log('使用模擬通知數據');
            let mockUnreadCount = 3; // 模擬3個未讀通知
            
            // 如果本地標記所有為已讀，則顯示0
            if (readStatus.allRead) {
                mockUnreadCount = 0;
            } else if (readStatus.readNotifications && readStatus.readNotifications.length > 0) {
                // 減去已讀的通知數量
                mockUnreadCount = Math.max(0, mockUnreadCount - readStatus.readNotifications.length);
            }
            
            this.updateNotificationBadge(mockUnreadCount);
            return mockUnreadCount;
            
        } catch (error) {
            console.error('檢查未讀通知時發生錯誤:', error);
            
            // 出錯時檢查本地狀態
            const readStatus = this.getLocalNotificationReadStatus();
            const unreadCount = readStatus.allRead ? 0 : 1;
            this.updateNotificationBadge(unreadCount);
            return unreadCount;
        }
    },
    
    // 更新通知徽章顯示
    updateNotificationBadge: function(count) {
        console.log(`更新通知徽章：${count}個未讀通知`);
        
        // 優先顯示感嘆號指示器，有未讀通知時顯示感嘆號而不是數字
        const exclamationElement = document.getElementById('notification-exclamation');
        const badgeElement = document.getElementById('notification-count');
        
        if (count > 0) {
            // 有未讀通知時優先顯示感嘆號
            if (exclamationElement) {
                exclamationElement.style.display = 'flex';
                console.log('顯示下拉選單感嘆號指示器');
            }
            
            // 隱藏數字徽章，避免重疊
            if (badgeElement) {
                badgeElement.style.display = 'none';
                console.log('隱藏數字徽章以避免與感嘆號重疊');
            }
        } else {
            // 沒有未讀通知時隱藏感嘆號
            if (exclamationElement) {
                exclamationElement.style.display = 'none';
                console.log('隱藏下拉選單感嘆號指示器');
            }
            
            // 也隱藏數字徽章
            if (badgeElement) {
                badgeElement.style.display = 'none';
                console.log('隱藏下拉選單通知徽章');
            }
        }
        
        if (!exclamationElement) {
            console.warn('找不到下拉選單感嘆號指示器元素');
        }
        if (!badgeElement) {
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
                console.warn('API標記已讀失敗，但本地狀態已更新:', apiError);
            }
            
            // 重新檢查未讀通知數量
            this.checkUnreadNotifications();
            
            // 觸發事件通知其他頁面
            document.dispatchEvent(new CustomEvent('notificationMarkedAsRead', {
                detail: { notificationId }
            }));
            
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
                console.warn('API標記所有已讀失敗，但本地狀態已更新:', apiError);
            }
            
            // 更新通知計數顯示
            this.updateNotificationBadge(0);
            
            // 觸發事件通知其他頁面
            document.dispatchEvent(new CustomEvent('notificationMarkedAsRead', {
                detail: { allRead: true }
            }));
            
            return true;
        } catch (error) {
            console.error('標記所有通知已讀時發生錯誤:', error);
            return false;
        }
    },
    
    // 重置通知狀態（用於測試或重新登入）
    resetNotificationStatus: function() {
        localStorage.removeItem('notificationReadStatus');
        localStorage.removeItem('hasUnreadNotifications');
        console.log('通知狀態已重置');
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