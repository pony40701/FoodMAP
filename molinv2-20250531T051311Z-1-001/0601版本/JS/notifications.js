document.addEventListener('DOMContentLoaded', function() {
    const notificationsList = document.querySelector('.notifications-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const markAllReadBtn = document.getElementById('markAllRead');
    const clearAllBtn = document.getElementById('clearAll');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    let currentPage = 1;
    const itemsPerPage = 10;
    let currentFilter = 'all';
    let notifications = [];

    // 檢查登入狀態
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = '../HTML/userLogin.html';
        return;
    }

    // 載入通知
    function loadNotifications() {
        notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        displayNotifications();
    }

    // 顯示通知
    function displayNotifications() {
        let filteredNotifications = notifications;

        // 根據篩選條件過濾通知
        if (currentFilter !== 'all') {
            filteredNotifications = notifications.filter(notification => 
                notification.type === currentFilter
            );
        }

        // 分頁處理
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNotifications = filteredNotifications.slice(startIndex, endIndex);

        notificationsList.innerHTML = '';

        if (pageNotifications.length === 0) {
            notificationsList.innerHTML = '<p class="no-notifications">沒有通知</p>';
            return;
        }

        pageNotifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
            notificationElement.innerHTML = `
                <div class="notification-icon ${notification.type}">
                    ${getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <h3>${notification.title}</h3>
                    <p>${notification.message}</p>
                    <span class="notification-time">${formatTime(notification.time)}</span>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? `
                        <button class="mark-read" data-id="${notification.id}">標為已讀</button>
                    ` : ''}
                    <button class="delete-notification" data-id="${notification.id}">刪除</button>
                </div>
            `;
            notificationsList.appendChild(notificationElement);
        });

        // 更新分頁資訊
        const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
        pageInfo.textContent = `第 ${currentPage} 頁 / 共 ${totalPages} 頁`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        // 添加事件監聽器
        addNotificationEventListeners();
    }

    // 獲取通知圖示
    function getNotificationIcon(type) {
        const icons = {
            order: '📦',
            system: '⚙️',
            promotion: '🎉'
        };
        return icons[type] || '📢';
    }

    // 格式化時間
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        // 小於1分鐘
        if (diff < 60000) {
            return '剛剛';
        }
        // 小於1小時
        if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分鐘前`;
        }
        // 小於24小時
        if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小時前`;
        }
        // 小於7天
        if (diff < 604800000) {
            return `${Math.floor(diff / 86400000)}天前`;
        }
        // 其他情況顯示完整日期
        return date.toLocaleDateString();
    }

    // 添加通知事件監聽器
    function addNotificationEventListeners() {
        // 標為已讀
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.dataset.id;
                markAsRead(notificationId);
            });
        });

        // 刪除通知
        document.querySelectorAll('.delete-notification').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.dataset.id;
                deleteNotification(notificationId);
            });
        });
    }

    // 標為已讀
    function markAsRead(notificationId) {
        const index = notifications.findIndex(n => n.id === notificationId);
        if (index !== -1) {
            notifications[index].read = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
            displayNotifications();
        }
    }

    // 刪除通知
    function deleteNotification(notificationId) {
        notifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        displayNotifications();
    }

    // 全部標為已讀
    markAllReadBtn.addEventListener('click', function() {
        notifications.forEach(notification => {
            notification.read = true;
        });
        localStorage.setItem('notifications', JSON.stringify(notifications));
        displayNotifications();
    });

    // 清除全部
    clearAllBtn.addEventListener('click', function() {
        if (confirm('確定要清除所有通知嗎？')) {
            notifications = [];
            localStorage.setItem('notifications', JSON.stringify(notifications));
            displayNotifications();
        }
    });

    // 篩選按鈕
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            currentPage = 1;
            displayNotifications();
        });
    });

    // 分頁按鈕
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayNotifications();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const filteredNotifications = currentFilter === 'all' 
            ? notifications 
            : notifications.filter(n => n.type === currentFilter);
        const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayNotifications();
        }
    });

    // 初始化載入
    loadNotifications();
}); 