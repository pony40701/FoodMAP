document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    if (!localStorage.getItem('isStoreLoggedIn')) {
        window.location.href = 'storeLogin.html';
        return;
    }

    // 獲取商家資料
    const storeId = localStorage.getItem('storeId');
    const stores = JSON.parse(localStorage.getItem('stores')) || [];
    const store = stores.find(s => s.id === storeId);

    if (!store) {
        alert('找不到商家資料！');
        window.location.href = 'storeLogin.html';
        return;
    }

    // 更新商家資訊
    document.getElementById('storeName').textContent = store.name;
    updateStoreStatus(store.isOpen);

    // 導航按鈕切換
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.dashboard-section');

    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            
            // 更新按鈕狀態
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // 更新區塊顯示
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });

    // 載入總覽資料
    loadOverview();

    // 載入訂單列表
    loadOrders();

    // 載入菜單
    loadMenu();

    // 載入評論
    loadReviews();

    // 載入設定
    loadSettings();

    // 新增餐點按鈕
    const addMenuItemBtn = document.getElementById('addMenuItem');
    const addMenuItemModal = document.getElementById('addMenuItemModal');
    const closeModalBtn = document.querySelector('.close');

    addMenuItemBtn.addEventListener('click', () => {
        addMenuItemModal.style.display = 'block';
    });

    closeModalBtn.addEventListener('click', () => {
        addMenuItemModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === addMenuItemModal) {
            addMenuItemModal.style.display = 'none';
        }
    });

    // 新增餐點表單提交
    const addMenuItemForm = document.getElementById('addMenuItemForm');
    addMenuItemForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newItem = {
            id: Date.now().toString(),
            name: document.getElementById('itemName').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            description: document.getElementById('itemDescription').value,
            category: document.getElementById('itemCategory').value,
            image: '', // 這裡需要處理圖片上傳
            isAvailable: true
        };

        // 更新商家菜單
        store.menu.push(newItem);
        localStorage.setItem('stores', JSON.stringify(stores));

        alert('餐點新增成功！');
        addMenuItemModal.style.display = 'none';
        addMenuItemForm.reset();
        loadMenu();
    });

    // 更新商家狀態
    function updateStoreStatus(isOpen) {
        const statusElement = document.getElementById('storeStatus');
        if (isOpen) {
            statusElement.textContent = '營業中';
            statusElement.className = 'status-open';
        } else {
            statusElement.textContent = '休息中';
            statusElement.className = 'status-closed';
        }
    }

    // 載入總覽資料
    function loadOverview() {
        // 計算今日訂單數
        const today = new Date().toDateString();
        const todayOrders = store.orders.filter(order => 
            new Date(order.date).toDateString() === today
        );
        document.getElementById('todayOrders').textContent = todayOrders.length;

        // 計算本月營收
        const currentMonth = new Date().getMonth();
        const monthlyOrders = store.orders.filter(order => 
            new Date(order.date).getMonth() === currentMonth
        );
        const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue}`;

        // 計算平均評分
        const averageRating = store.reviews.reduce((sum, review) => sum + review.rating, 0) / 
            (store.reviews.length || 1);
        document.getElementById('averageRating').textContent = averageRating.toFixed(1);

        // 顯示總評論數
        document.getElementById('totalReviews').textContent = store.reviews.length;

        // 顯示最近訂單
        const recentOrdersList = document.getElementById('recentOrdersList');
        recentOrdersList.innerHTML = '';

        const recentOrders = store.orders.slice(-5).reverse();
        recentOrders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'recent-order';
            orderElement.innerHTML = `
                <div class="order-info">
                    <h4>訂單 #${order.id}</h4>
                    <p>${new Date(order.date).toLocaleString()}</p>
                </div>
                <div class="order-status ${order.status}">
                    ${getStatusText(order.status)}
                </div>
            `;
            recentOrdersList.appendChild(orderElement);
        });
    }

    // 載入訂單列表
    function loadOrders() {
        const ordersList = document.getElementById('ordersList');
        const statusFilter = document.getElementById('orderStatus');

        function displayOrders() {
            const selectedStatus = statusFilter.value;
            let filteredOrders = store.orders;

            if (selectedStatus !== 'all') {
                filteredOrders = store.orders.filter(order => order.status === selectedStatus);
            }

            ordersList.innerHTML = '';
            filteredOrders.forEach(order => {
                const orderElement = document.createElement('div');
                orderElement.className = 'order-card';
                orderElement.innerHTML = `
                    <div class="order-header">
                        <h3>訂單 #${order.id}</h3>
                        <span class="order-status ${order.status}">${getStatusText(order.status)}</span>
                    </div>
                    <div class="order-details">
                        <p>時間：${new Date(order.date).toLocaleString()}</p>
                        <p>總金額：$${order.total}</p>
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <span>${item.name}</span>
                                    <span>x${item.quantity}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="order-actions">
                        ${getOrderActions(order.status)}
                    </div>
                `;
                ordersList.appendChild(orderElement);
            });
        }

        statusFilter.addEventListener('change', displayOrders);
        displayOrders();
    }

    // 載入菜單
    function loadMenu() {
        const menuList = document.getElementById('menuList');
        menuList.innerHTML = '';

        store.menu.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <div class="item-image">
                    <img src="${item.image || '../IMAGE/default-food.jpg'}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p class="item-price">$${item.price}</p>
                    <p class="item-description">${item.description}</p>
                    <p class="item-category">${item.category}</p>
                </div>
                <div class="item-actions">
                    <button class="btn-edit" data-id="${item.id}">編輯</button>
                    <button class="btn-delete" data-id="${item.id}">刪除</button>
                    <div class="toggle-switch">
                        <input type="checkbox" id="available-${item.id}" 
                            ${item.isAvailable ? 'checked' : ''}>
                        <label for="available-${item.id}"></label>
                    </div>
                </div>
            `;
            menuList.appendChild(itemElement);
        });

        // 添加編輯和刪除功能
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                editMenuItem(itemId);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemId = this.dataset.id;
                deleteMenuItem(itemId);
            });
        });

        // 添加可用性切換功能
        document.querySelectorAll('[id^="available-"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const itemId = this.id.split('-')[1];
                toggleItemAvailability(itemId, this.checked);
            });
        });
    }

    // 載入評論
    function loadReviews() {
        const reviewsList = document.getElementById('reviewsList');
        const ratingFilter = document.getElementById('reviewRating');

        function displayReviews() {
            const selectedRating = ratingFilter.value;
            let filteredReviews = store.reviews;

            if (selectedRating !== 'all') {
                filteredReviews = store.reviews.filter(review => 
                    review.rating === parseInt(selectedRating)
                );
            }

            reviewsList.innerHTML = '';
            filteredReviews.forEach(review => {
                const reviewElement = document.createElement('div');
                reviewElement.className = 'review-card';
                reviewElement.innerHTML = `
                    <div class="review-header">
                        <div class="review-rating">
                            ${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}
                        </div>
                        <span class="review-date">${new Date(review.date).toLocaleString()}</span>
                    </div>
                    <div class="review-content">
                        <p>${review.content}</p>
                    </div>
                    <div class="review-author">
                        <p>顧客：${review.author}</p>
                    </div>
                `;
                reviewsList.appendChild(reviewElement);
            });
        }

        ratingFilter.addEventListener('change', displayReviews);
        displayReviews();
    }

    // 載入設定
    function loadSettings() {
        const settingsForm = document.getElementById('storeSettingsForm');
        
        // 填充表單
        document.getElementById('storeName').value = store.name;
        document.getElementById('storePhone').value = store.phone;
        document.getElementById('storeAddress').value = store.address;
        document.getElementById('storeCategory').value = store.category;
        document.getElementById('isOpen').checked = store.isOpen;

        // 處理表單提交
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // 更新商家資料
            store.name = document.getElementById('storeName').value;
            store.phone = document.getElementById('storePhone').value;
            store.address = document.getElementById('storeAddress').value;
            store.category = document.getElementById('storeCategory').value;
            store.isOpen = document.getElementById('isOpen').checked;

            // 儲存更新
            localStorage.setItem('stores', JSON.stringify(stores));
            
            // 更新顯示
            document.getElementById('storeName').textContent = store.name;
            updateStoreStatus(store.isOpen);

            alert('設定已更新！');
        });
    }

    // 輔助函數
    function getStatusText(status) {
        const statusTexts = {
            pending: '待處理',
            preparing: '準備中',
            ready: '待取餐',
            completed: '已完成',
            cancelled: '已取消'
        };
        return statusTexts[status] || status;
    }

    function getOrderActions(status) {
        switch (status) {
            case 'pending':
                return `
                    <button class="btn-accept">接受訂單</button>
                    <button class="btn-reject">拒絕訂單</button>
                `;
            case 'preparing':
                return `
                    <button class="btn-ready">準備完成</button>
                `;
            case 'ready':
                return `
                    <button class="btn-complete">完成訂單</button>
                `;
            default:
                return '';
        }
    }

    function editMenuItem(itemId) {
        const item = store.menu.find(i => i.id === itemId);
        if (!item) return;

        // 填充表單
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemDescription').value = item.description;
        document.getElementById('itemCategory').value = item.category;

        // 顯示編輯視窗
        addMenuItemModal.style.display = 'block';
    }

    function deleteMenuItem(itemId) {
        if (confirm('確定要刪除此餐點嗎？')) {
            store.menu = store.menu.filter(item => item.id !== itemId);
            localStorage.setItem('stores', JSON.stringify(stores));
            loadMenu();
        }
    }

    function toggleItemAvailability(itemId, isAvailable) {
        const item = store.menu.find(i => i.id === itemId);
        if (item) {
            item.isAvailable = isAvailable;
            localStorage.setItem('stores', JSON.stringify(stores));
        }
    }
}); 