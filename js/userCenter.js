// 假資料
const mockOrders = [
    {
        id: 'ORD001',
        userId: 1,
        storeName: '老王牛肉麵',
        orderTime: '2024-03-15T12:30:00',
        status: 'completed',
        totalAmount: 350,
        items: ['牛肉麵', '小菜']
    },
    {
        id: 'ORD002',
        userId: 1,
        storeName: '阿婆滷肉飯',
        orderTime: '2024-03-14T18:45:00',
        status: 'pending',
        totalAmount: 280,
        items: ['滷肉飯', '湯品']
    },
    {
        id: 'ORD003',
        userId: 1,
        storeName: '小籠包專賣店',
        orderTime: '2024-03-13T11:20:00',
        status: 'cancelled',
        totalAmount: 420,
        items: ['小籠包', '酸辣湯']
    }
];

const mockReviews = [
    {
        id: 1,
        userId: 1,
        storeName: '老王牛肉麵',
        title: '超好吃的牛肉麵',
        content: '牛肉很嫩，湯頭濃郁，服務態度很好！',
        rating: 5,
        time: '2024-03-15T14:30:00',
        tags: ['牛肉麵', '湯頭濃郁', '服務好']
    },
    {
        id: 2,
        userId: 1,
        storeName: '阿婆滷肉飯',
        title: '道地的滷肉飯',
        content: '滷肉香而不膩，米飯粒粒分明。',
        rating: 4,
        time: '2024-03-14T19:20:00',
        tags: ['滷肉飯', '道地', 'CP值高']
    },
    {
        id: 3,
        userId: 1,
        storeName: '小籠包專賣店',
        title: '皮薄餡多的小籠包',
        content: '小籠包皮薄餡多，湯汁豐富。',
        rating: 5,
        time: '2024-03-13T12:15:00',
        tags: ['小籠包', '湯包', '點心']
    }
];

const mockNotifications = [
    {
        id: 1,
        userId: 1,
        type: 'order',
        content: '您的訂單 ORD001 已準備完成，請前往取餐。',
        time: '2024-03-15T12:30:00',
        read: false
    },
    {
        id: 2,
        userId: 1,
        type: 'promotion',
        content: '本週末全館商品 8 折起！',
        time: '2024-03-14T10:00:00',
        read: true
    },
    {
        id: 3,
        userId: 1,
        type: 'system',
        content: '您的評論已獲得回覆。',
        time: '2024-03-13T15:45:00',
        read: false
    }
];

// 從 localStorage 獲取收藏數據
function getFavoriteStores() {
    // 直接儲存 Place ID 列表
    return JSON.parse(localStorage.getItem('favoriteStores')) || [];
}

function getFavoriteReviews() {
    return JSON.parse(localStorage.getItem('favoriteReviews')) || [];
}

// 載入收藏
async function loadFavorites(type = 'stores') {
    const storesContainer = document.querySelector('.favorites-stores');
    const reviewsContainer = document.querySelector('.favorites-reviews');
    
    if (!storesContainer || !reviewsContainer) {
        console.error('找不到收藏列表的容器元素');
        return;
    }

    if (type === 'stores') {
        // 從 localStorage 獲取收藏的 Place ID 列表
        const favoritePlaceIds = getFavoriteStores();
        
        if (favoritePlaceIds.length === 0) {
            storesContainer.innerHTML = '<div class="no-data">還沒有收藏任何店家</div>';
        } else {
            // 顯示載入中
            storesContainer.innerHTML = '<div class="loading">載入收藏店家中...</div>';
            
            // 使用 Google Places API 獲取店家詳細資訊
            try {
                const favoriteStoresDetails = await getFavoriteStoresDetails(favoritePlaceIds);
                
                if (favoriteStoresDetails.length === 0) {
                    storesContainer.innerHTML = '<div class="no-data">無法載入收藏店家資訊</div>';
                } else {
                    storesContainer.innerHTML = favoriteStoresDetails.map(store => `
                        <div class="store-card" data-place-id="${store.place_id}">
                            <img src="${store.image}" alt="${store.name}" class="store-image">
                            <button class="favorite-btn" onclick="removeFromFavorites('${store.place_id}')">
                                <i class="fas fa-star"></i>
                            </button>
                            <div class="store-info">
                                <h3 class="store-name">${store.name}</h3>
                                <div class="store-rating">
                                    ${store.rating ? `<span class="stars">${'★'.repeat(Math.floor(store.rating))}${(store.rating % 1) >= 0.5 ? '½' : ''}</span> ${store.rating}` : '暫無評分'}
                                    ${store.user_ratings_total ? ` (${store.user_ratings_total} 則評論)` : ''}
                                </div>
                                <p class="store-address">${store.address || '地址未知'}</p>
                                <div class="store-status">
                                    ${store.isOpen !== undefined ? 
                                        (store.isOpen ? '<span class="status-open">營業中</span>' : '<span class="status-closed">休息中</span>') 
                                        : '<span class="status-unknown">狀態未知</span>'
                                    }
                                </div>
                            </div>
                            <div class="store-actions">
                                <button onclick="viewStoreDetail('${store.place_id}')" class="btn-secondary">查看詳情</button>
                                <button onclick="removeFromFavorites('${store.place_id}')" class="btn-secondary">取消收藏</button>
                            </div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('載入收藏店家時發生錯誤:', error);
                if (error.message === 'Google Maps API 未載入') {
                    storesContainer.innerHTML = '<div class="no-data">Google Maps API 未載入，請檢查網路連線或稍後再試</div>';
                } else {
                    storesContainer.innerHTML = '<div class="no-data">載入收藏店家時發生錯誤</div>';
                }
            }
        }
        storesContainer.style.display = 'grid';
        reviewsContainer.style.display = 'none';

    } else { // type === 'reviews'
        const favoriteReviews = getFavoriteReviews();
        if (favoriteReviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="no-data">還沒有收藏任何心得</div>';
        } else {
            reviewsContainer.innerHTML = favoriteReviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <img src="${review.avatar || '../IMAGE/default_avatar.jpg'}" alt="${review.author || review.reviewerName || '匿名'}" class="reviewer-avatar">
                        <div>
                            <div class="reviewer-name">${review.author || review.reviewerName || '匿名'}</div>
                            <div class="store-name">${review.storeName}</div>
                        </div>
                        <button class="favorite-btn" onclick="removeFromFavoriteReviews(${review.id})">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="review-content">${review.content}</div>
                    <div class="review-footer">
                        <div class="review-rating">${'★'.repeat(review.rating)}</div>
                        <div class="review-date">${review.date || new Date(review.time || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div class="review-actions">
                        <button onclick="viewReviewDetail(${review.id})" class="btn-secondary">查看詳情</button>
                    </div>
                </div>
            `).join('');
        }
        storesContainer.style.display = 'none';
        reviewsContainer.style.display = 'grid';
    }
}

// 使用 Google Places API 獲取收藏店家的詳細資訊
async function getFavoriteStoresDetails(placeIds) {
    return new Promise((resolve, reject) => {
        // 檢查 Google Maps API 是否可用
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
            console.error('Google Maps API 未載入');
            reject(new Error('Google Maps API 未載入'));
            return;
        }

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        const favoriteStoresDetails = [];
        let completedRequests = 0;

        if (placeIds.length === 0) {
            resolve([]);
            return;
        }

        placeIds.forEach(placeId => {
            const request = {
                placeId: placeId,
                fields: ['name', 'formatted_address', 'photos', 'rating', 'user_ratings_total', 'geometry', 'opening_hours']
            };

            service.getDetails(request, (place, status) => {
                completedRequests++;
                
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    let imageUrl = '';
                    if (place.photos && place.photos[0] && place.photos[0].getUrl) {
                        imageUrl = place.photos[0].getUrl({maxWidth: 400});
                    }

                    const storeData = {
                        place_id: place.place_id,
                        name: place.name,
                        rating: place.rating,
                        address: place.formatted_address,
                        isOpen: place.opening_hours?.isOpen(),
                        image: imageUrl || './IMAGE/default-restaurant.jpg',
                        user_ratings_total: place.user_ratings_total,
                        location: place.geometry?.location
                    };
                    favoriteStoresDetails.push(storeData);
                } else {
                    console.error('Place Details request failed for', placeId, 'with status:', status);
                }

                // 如果所有請求都完成了，解析結果
                if (completedRequests === placeIds.length) {
                    resolve(favoriteStoresDetails);
                }
            });
        });
    });
}

// 從收藏中移除店家
function removeFromFavorites(placeId) {
    if (confirm('確定要取消收藏這家店嗎？')) {
        let favoritePlaceIds = getFavoriteStores();
        favoritePlaceIds = favoritePlaceIds.filter(id => id !== placeId);
        localStorage.setItem('favoriteStores', JSON.stringify(favoritePlaceIds));
        
        // 重新載入收藏列表
        loadFavorites('stores');
        
        // 顯示成功訊息
        alert('已取消收藏');
    }
}

// 從收藏中移除心得
function removeFromFavoriteReviews(reviewId) {
    if (confirm('確定要取消收藏這則心得嗎？')) {
        let favoriteReviews = getFavoriteReviews();
        favoriteReviews = favoriteReviews.filter(review => review.id !== reviewId);
        localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
        
        // 重新載入收藏列表
        loadFavorites('reviews');
        
        // 顯示成功訊息
        alert('已取消收藏心得');
    }
}

// 查看店家詳情
function viewStoreDetail(placeId) {
    // 跳轉到店家詳情頁面
    window.location.href = `storeDetail.html?place_id=${placeId}`;
}

// 查看心得詳情
function viewReviewDetail(reviewId) {
    // 跳轉到心得詳情頁面
    window.location.href = `foodReviewList.html?review_id=${reviewId}`;
}

// 收藏心得功能
function addToFavoriteReviews(review) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        alert('請先登入會員');
        return;
    }

    let favoriteReviews = getFavoriteReviews();
    const exists = favoriteReviews.some(fav => fav.id === review.id);
    
    if (exists) {
        alert('此心得已在收藏清單中');
        return;
    }
    
    favoriteReviews.unshift(review); // 添加到最前面
    localStorage.setItem('favoriteReviews', JSON.stringify(favoriteReviews));
    alert(`已收藏 ${review.storeName} 的心得`);
}

// 修改 switchFavoritesTab 函式
function switchFavoritesTab(tab) {
    // 移除所有標籤按鈕的 active 類別
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    // 添加 active 類別到選中的標籤按鈕
    const targetTabBtn = document.querySelector(`.favorites-tabs .tab-btn[data-tab="${tab}"]`);
    if (targetTabBtn) {
        targetTabBtn.classList.add('active');
    }

    // 載入對應的收藏內容
    loadFavorites(tab);
}

// 更新設定
function updateSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const settings = {
        notifications: {
            order: document.getElementById('orderNotifications').checked,
            promotion: document.getElementById('promotionNotifications').checked,
            system: document.getElementById('systemNotifications').checked
        },
        privacy: {
            showProfile: document.getElementById('showProfile').checked,
            showReviews: document.getElementById('showReviews').checked
        }
    };

    // 更新密碼
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (currentPassword && newPassword && confirmPassword) {
        // 這裡需要更安全的密碼處理方式，目前僅做簡單判斷
        if (user.password && currentPassword !== user.password) {
             alert('目前密碼不正確');
             return;
         }
        if (newPassword !== confirmPassword) {
            alert('新密碼與確認密碼不符');
            return;
        }
        // 這裡將新密碼保存到 user 對象中，以便更新 localStorage
         user.password = newPassword;
    }

    user.settings = settings;
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert('設定已更新');
}

// 輔助函數
function getStatusText(status) {
    const statusMap = {
        'pending': '待處理',
        'preparing': '準備中',
        'ready': '待取餐',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function getNotificationTypeText(type) {
    const typeMap = {
        'order': '訂單',
        'system': '系統',
        'promotion': '優惠'
    };
    return typeMap[type] || type;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // 1分鐘內
        return '剛剛';
    } else if (diff < 3600000) { // 1小時內
        return `${Math.floor(diff / 60000)}分鐘前`;
    } else if (diff < 86400000) { // 1天內
        return `${Math.floor(diff / 3600000)}小時前`;
    } else {
        return date.toLocaleDateString();
    }
}

// 檢查登入狀態
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'userLogin.html';
    }
}

// 登出功能已移至 login.js 統一管理

// 初始化選單
function initMenu() {
    const menuItems = document.querySelectorAll('.sidebar .menu-item');
    const contentSections = document.querySelectorAll('.main-content .content-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // 移除所有選單項目的 active 類別
            menuItems.forEach(mi => mi.classList.remove('active'));

            // 添加當前選單項目的 active 類別
            item.classList.add('active');

            // 隱藏所有內容區塊
            contentSections.forEach(section => section.classList.remove('active'));

            // 顯示對應的內容區塊
            const targetSectionId = item.getAttribute('data-section');
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // 如果切換到收藏區塊，載入收藏內容
                if (targetSectionId === 'favorites') {
                    // 檢查當前活躍的標籤
                    const activeTab = document.querySelector('.favorites-tabs .tab-btn.active')?.getAttribute('data-tab') || 'stores';
                    loadFavorites(activeTab);
                }
            }
        });
    });
}

// 初始化表單
function initForms() {
    // 個人資料表單
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 這裡添加更新個人資料的邏輯
            alert('個人資料已更新');
        });
    }

    // 設定表單
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // 這裡添加更新設定的邏輯
            alert('設定已更新');
        });
    }
}

// 初始化篩選功能
function initFilters() {
    // 訂單狀態篩選
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) {
        orderStatus.addEventListener('change', () => {
            loadOrders(orderStatus.value);
        });
    }

    // 評論評分篩選
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) {
        reviewRating.addEventListener('change', () => {
            loadReviews(reviewRating.value);
        });
    }

    // 通知類型篩選
    const notificationFilters = document.querySelectorAll('#notifications .filter-btn');
    notificationFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            notificationFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadNotifications(btn.getAttribute('data-type'));
        });
    });

    // 收藏標籤切換
    const tabButtons = document.querySelectorAll('.favorites-tabs .tab-btn'); // 確保選擇器正確
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchFavoritesTab(tab);
        });
    });
}

// 載入使用者資料
function loadUserData() {
    const userEmail = localStorage.getItem('userEmail');
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { email: userEmail };

    if (userEmail) {
        // 更新使用者資訊顯示
        document.querySelector('.user-email').textContent = userEmail;
        document.querySelector('.user-name').textContent = currentUser.name || userEmail.split('@')[0];

        // 更新個人資料表單
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.querySelector('#email').value = userEmail;
            profileForm.querySelector('#name').value = currentUser.name || '';
            profileForm.querySelector('#phone').value = currentUser.phone || '';
            profileForm.querySelector('#address').value = currentUser.address || '';
        }

        // 在這裡載入設定（如果 localStorage 中有保存的話）
        if (currentUser.settings) {
            document.getElementById('orderNotifications').checked = currentUser.settings.notifications.order;
            document.getElementById('promotionNotifications').checked = currentUser.settings.notifications.promotion;
            document.getElementById('systemNotifications').checked = currentUser.settings.notifications.system;
            document.getElementById('showProfile').checked = currentUser.settings.privacy.showProfile;
            document.getElementById('showReviews').checked = currentUser.settings.privacy.showReviews;
        }

    } else {
        // 如果沒有登入郵箱，可能需要重定向或顯示錯誤
        console.error('User email not found in localStorage.');
        // 或者可以顯示預設值或空白
        document.querySelector('.user-email').textContent = 'N/A';
        document.querySelector('.user-name').textContent = '訪客';
         const profileForm = document.getElementById('profileForm');
         if (profileForm) {
             profileForm.querySelector('#email').value = '';
             profileForm.querySelector('#name').value = '';
             profileForm.querySelector('#phone').value = '';
             profileForm.querySelector('#address').value = '';
         }
    }
}

// 編輯評論
function editReview(reviewId) {
    const review = mockReviews.find(r => r.id === reviewId);
    
    if (!review) return;

    // 填充表單
    document.getElementById('editStoreName').value = review.storeName;
    document.getElementById('editTitle').value = review.title;
    document.getElementById('editContent').value = review.content;
    
    // 設置評分
    const stars = document.querySelectorAll('.rating .star');
    stars.forEach(star => {
        const rating = parseInt(star.dataset.rating);
        star.classList.toggle('active', rating <= review.rating);
    });

    // 設置標籤
    const tagsList = document.getElementById('editTagsList');
    tagsList.innerHTML = review.tags.map(tag => `
        <span class="tag">
            ${tag}
            <span class="remove-tag" onclick="removeTag(this)">&times;</span>
        </span>
    `).join('');

    // 顯示彈窗
    document.getElementById('editReviewModal').style.display = 'block';

    // 設置表單提交事件
    const form = document.getElementById('editReviewForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        saveReviewEdit(reviewId);
    };
}

// 儲存評論編輯
function saveReviewEdit(reviewId) {
    const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
    
    if (reviewIndex === -1) return;

    // 獲取表單數據
    const storeName = document.getElementById('editStoreName').value;
    const title = document.getElementById('editTitle').value;
    const content = document.getElementById('editContent').value;
    const rating = document.querySelectorAll('.rating .star.active').length;
    const tags = Array.from(document.querySelectorAll('#editTagsList .tag'))
        .map(tag => tag.textContent.trim());

    // 更新評論
    mockReviews[reviewIndex] = {
        ...mockReviews[reviewIndex],
        storeName,
        title,
        content,
        rating,
        tags,
        updateTime: new Date().toISOString()
    };
    
    // 關閉彈窗並重新載入評論
    closeEditModal();
    loadReviews();
    
    // 顯示成功訊息
    alert('評論已成功更新！');
}

// 刪除評論
function deleteReview(reviewId) {
    if (!confirm('確定要刪除這則評論嗎？')) return;

    const reviewIndex = mockReviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) return;

    // 從假資料中移除評論
    mockReviews.splice(reviewIndex, 1);
    
    // 重新載入評論列表
    loadReviews();
    
    // 顯示成功訊息
    alert('評論已成功刪除！');
}

// 關閉編輯彈窗
function closeEditModal() {
    document.getElementById('editReviewModal').style.display = 'none';
}

// 移除標籤
function removeTag(element) {
    element.parentElement.remove();
}

// 添加標籤
document.getElementById('editTagInput')?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const tag = this.value.trim();
        if (tag) {
            const tagsList = document.getElementById('editTagsList');
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" onclick="removeTag(this)">&times;</span>
            `;
            tagsList.appendChild(tagElement);
            this.value = '';
        }
    }
});

// 初始化評分星星
document.querySelectorAll('.rating .star').forEach(star => {
    star.addEventListener('click', function() {
        const rating = parseInt(this.dataset.rating);
        const stars = this.parentElement.querySelectorAll('.star');
        stars.forEach(s => {
            const r = parseInt(s.dataset.rating);
            s.classList.toggle('active', r <= rating);
        });
    });
});

// 關閉按鈕事件
document.querySelector('.close')?.addEventListener('click', closeEditModal);

// 點擊彈窗外部關閉
window.addEventListener('click', function(e) {
    const modal = document.getElementById('editReviewModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// Google Maps API 載入完成後的 callback 函式 (不再使用，但保留結構以防萬一)
// let placesService;
// function initPage() {
//     // ... existing code ...
// }

// 頁面載入完成後的主要初始化
document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'userLogin.html';
        return;
    }

    // 初始化頁面
    initializePage();
});

// 初始化頁面所有組件
function initializePage() {
    loadUserData();
    setupEventListeners(); // 確保事件監聽器被設置
    initMenu(); // 初始化選單
    initForms(); // 初始化表單
    initFilters(); // 初始化篩選
    loadOrders(); // 載入訂單
    loadReviews(); // 載入評論
    loadNotifications(); // 載入通知
    initializeCharts(); // 初始化圖表

    // 處理 URL 錨點，如果沒有則顯示個人資料區塊
    handleURLHash();
}

// 處理 URL 錨點
function handleURLHash() {
    const hash = window.location.hash;
    let targetSection = 'profile'; // 默認顯示個人資料
    
    if (hash) {
        // 移除 # 符號
        const sectionId = hash.substring(1);
        // 檢查是否為有效的區塊 ID
        const validSections = ['profile', 'analytics', 'orders', 'reviews', 'notifications', 'favorites', 'settings'];
        if (validSections.includes(sectionId)) {
            targetSection = sectionId;
        }
    }
    
    switchSection(targetSection);
}

// 初始化圖表 (保留原有的假圖表)
function initializeCharts() {
    // 這裡可以添加圖表初始化邏輯
    // 目前只是佔位符
    console.log('圖表初始化完成');
}

// 設置事件監聽器
function setupEventListeners() {
    // 監聽 hashchange 事件，處理瀏覽器後退/前進
    window.addEventListener('hashchange', handleURLHash);
    
    // 選單切換
    document.querySelectorAll('.sidebar .menu-item').forEach(item => { // 確保選擇器正確
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            // 更新 URL hash
            window.location.hash = section;
            // switchSection 會由 hashchange 事件觸發
        });
    });

    // 個人資料表單提交 (保持原狀)
    const profileForm = document.getElementById('profileForm');
    if (profileForm) { // 添加檢查確保元素存在
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }

    // 訂單狀態篩選 (保持原狀)
    const orderStatus = document.getElementById('orderStatus');
    if (orderStatus) { // 添加檢查確保元素存在
         orderStatus.addEventListener('change', function() {
             loadOrders(this.value);
         });
    }

    // 評論評分篩選 (保持原狀)
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) { // 添加檢查確保元素存在
         reviewRating.addEventListener('change', function() {
             loadReviews(this.value);
         });
    }

    // 通知篩選 (保持原狀)
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            filterNotifications(type);
        });
    });

    // 收藏標籤切換
    document.querySelectorAll('.favorites-tabs .tab-btn').forEach(btn => { // 確保選擇器正確
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchFavoritesTab(tab); // <-- 確保呼叫正確
        });
    });

    // 設定表單提交 (保持原狀)
    const settingsForm = document.getElementById('settingsForm');
     if (settingsForm) { // 添加檢查確保元素存在
         settingsForm.addEventListener('submit', function(e) {
             e.preventDefault();
             updateSettings();
         });
     }

    // 編輯評論相關事件監聽器 (保持原狀)
    // ... existing code ...
}

// 切換區塊
function switchSection(sectionId) {
    // 移除所有區塊的 active 類別
    document.querySelectorAll('.main-content .content-section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none'; // 顯式隱藏
    });
    // 移除所有選單項目的 active 類別
    document.querySelectorAll('.sidebar .menu-item').forEach(item => {
        item.classList.remove('active');
    });

    // 添加 active 類別到選中的區塊並顯示
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block'; // 顯式顯示
        
        // 如果切換到收藏區塊，初始化收藏功能
        if (sectionId === 'favorites') {
            initializeFavorites();
        }
    }
    // 添加 active 類別到選中的選單項目
    const targetMenuItem = document.querySelector(`.sidebar .menu-item[data-section="${sectionId}"]`);
    if (targetMenuItem) {
        targetMenuItem.classList.add('active');
    }
}

// 初始化收藏功能
function initializeFavorites() {
    // 確保收藏標籤按鈕正確設置
    switchFavoritesTab('stores');
    
    // 如果 Google Maps API 可用，直接載入
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        loadFavorites('stores');
    } else {
        // 等待 Google Maps API 載入
        let retryCount = 0;
        const maxRetries = 10;
        const checkInterval = setInterval(() => {
            retryCount++;
            if (typeof google !== 'undefined' && google.maps && google.maps.places) {
                clearInterval(checkInterval);
                loadFavorites('stores');
            } else if (retryCount >= maxRetries) {
                clearInterval(checkInterval);
                console.warn('Google Maps API 載入超時，收藏功能可能無法正常工作');
                // 顯示錯誤訊息而不是載入
                const storesContainer = document.querySelector('.favorites-stores');
                if (storesContainer) {
                    storesContainer.innerHTML = '<div class="no-data">Google Maps API 載入失敗，無法顯示收藏店家</div>';
                }
            }
        }, 500);
    }
}

// 載入訂單
function loadOrders(statusFilter = 'all') {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    let filteredOrders = mockOrders;
    if (statusFilter !== 'all') {
        filteredOrders = mockOrders.filter(order => order.status === statusFilter);
    }

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = '<div class="no-data">沒有找到相關訂單</div>';
        return;
    }

    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <h4>${order.storeName}</h4>
                <span class="order-status">${getStatusText(order.status)}</span>
            </div>
            <div class="order-details">
                <p><strong>訂單編號:</strong> ${order.id}</p>
                <p><strong>訂購時間:</strong> ${new Date(order.orderTime).toLocaleString()}</p>
                <p><strong>訂購項目:</strong> ${order.items.join(', ')}</p>
                <p><strong>總金額:</strong> $${order.totalAmount}</p>
            </div>
        </div>
    `).join('');
}

// 載入評論
function loadReviews(ratingFilter = 'all') {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    let filteredReviews = mockReviews;
    if (ratingFilter !== 'all') {
        filteredReviews = mockReviews.filter(review => review.rating >= parseInt(ratingFilter));
    }

    if (filteredReviews.length === 0) {
        reviewsList.innerHTML = '<div class="no-data">沒有找到相關評論</div>';
        return;
    }

    reviewsList.innerHTML = filteredReviews.map(review => `
        <div class="review-item">
            <div class="review-actions">
                <button onclick="editReview(${review.id})" title="編輯評論">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteReview(${review.id})" title="刪除評論" class="btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="review-header">
                <h4>${review.title}</h4>
                <div class="review-rating">${'★'.repeat(review.rating)}</div>
            </div>
            <div class="review-details">
                <p><strong>店家:</strong> ${review.storeName}</p>
                <p><strong>評論時間:</strong> ${new Date(review.time).toLocaleString()}</p>
                <p><strong>內容:</strong> ${review.content}</p>
                <div class="review-tags">
                    ${review.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// 載入通知
function loadNotifications(typeFilter = 'all') {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;

    let filteredNotifications = mockNotifications;
    if (typeFilter !== 'all') {
        filteredNotifications = mockNotifications.filter(notification => notification.type === typeFilter);
    }

    if (filteredNotifications.length === 0) {
        notificationsList.innerHTML = '<div class="no-data">沒有找到相關通知</div>';
        return;
    }

    notificationsList.innerHTML = filteredNotifications.map(notification => `
        <div class="notification-item ${notification.read ? '' : 'unread'}">
            <div class="notification-header">
                <span class="notification-type">${getNotificationTypeText(notification.type)}</span>
                <span class="notification-time">${formatTime(notification.time)}</span>
            </div>
            <div class="notification-content">
                ${notification.content}
            </div>
            ${!notification.read ? '<div class="unread-indicator"></div>' : ''}
        </div>
    `).join('');
}

// 篩選通知
function filterNotifications(type) {
    // 更新篩選按鈕狀態
    document.querySelectorAll('#notifications .filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`#notifications .filter-btn[data-type="${type}"]`).classList.add('active');
    
    // 載入篩選後的通知
    loadNotifications(type);
}

// 更新個人資料
function updateProfile() {
    const formData = new FormData(document.getElementById('profileForm'));
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
    };

    // 更新 localStorage
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    Object.assign(currentUser, userData);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // 更新顯示
    document.querySelector('.user-name').textContent = userData.name || userData.email.split('@')[0];

    alert('個人資料已更新');
}

// 當 DOM 載入完成時初始化頁面
document.addEventListener('DOMContentLoaded', initializePage);
