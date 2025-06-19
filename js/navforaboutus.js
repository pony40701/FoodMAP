// 當文檔加載完成時執行
document.addEventListener('DOMContentLoaded', function() {
    // 獲取DOM元素
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    const loginBtn = document.querySelector('.btn-login');
    const logoutBtn = document.querySelector('.logout-item');

    // 檢查登入狀態
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (isLoggedIn) {
            loginSection.style.display = 'none';
            userSection.style.display = 'block';
        } else {
            loginSection.style.display = 'block';
            userSection.style.display = 'none';
        }
    }

    // 初始檢查登入狀態
    checkLoginStatus();

    // 登入按鈕點擊事件
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            document.getElementById('loginModal').style.display = 'block';
        });
    }

    // 登出功能
    function logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userToken');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('user');
        
        // 直接更新UI狀態
        checkLoginStatus();
        
        // 清空餐廳容器，避免顯示問題
        const restaurantsContainer = document.getElementById('restaurants-container');
        if (restaurantsContainer) {
            restaurantsContainer.innerHTML = '';
        }
        
        // 重新加載餐廳資料
        if (window.mapInit && typeof window.mapInit.loadRestaurants === 'function') {
            window.mapInit.loadRestaurants();
        }
        
        // 顯示登出成功提示
        if (window.showToast) {
            window.showToast('已成功登出');
        }
    }

    // 登出按鈕點擊事件
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // 處理寫食記按鈕點擊
    window.handleWriteReview = function() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            alert('請先登入會員');
            document.getElementById('loginModal').style.display = 'block';
            window.onLoginSuccess = function() {
                window.location.href = 'blogPost.html';
            };
        } else {
            window.location.href = 'blogPost.html';
        }
    };

    // 商家登入相關功能
    window.openRestaurantLoginModal = function() {
        document.getElementById('restaurantLoginModal').style.display = 'block';
    };

    window.closeRestaurantLoginModal = function() {
        document.getElementById('restaurantLoginModal').style.display = 'none';
    };

    // 搜尋功能
    const searchInputs = document.querySelectorAll('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const foodQuery = searchInputs[0].value.trim();
            const locationQuery = searchInputs[1].value.trim();
            
            if (foodQuery || locationQuery) {
                // 這裡可以實現搜尋邏輯
                ('搜尋:', { food: foodQuery, location: locationQuery });
                // 例如: window.location.href = `search-results.html?food=${foodQuery}&location=${locationQuery}`;
            }
        });
    }

    // 點擊外部關閉下拉選單
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.restaurant-dropdown-content, .avatar-dropdown');
        dropdowns.forEach(dropdown => {
            if (!event.target.closest('.restaurant-dropdown') && 
                !event.target.closest('.user-avatar')) {
                dropdown.style.removeProperty('opacity');
                dropdown.style.removeProperty('visibility');
                dropdown.style.removeProperty('transform');
            }
        });
    });
});

// 暴露登出函數給全局使用
window.logout = function() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    
    // 直接更新UI狀態
    const loginSection = document.getElementById('loginSection');
    const userSection = document.getElementById('userSection');
    
    if (loginSection) loginSection.style.display = 'block';
    if (userSection) userSection.style.display = 'none';
    
    // 清空餐廳容器，避免顯示問題
    const restaurantsContainer = document.getElementById('restaurants-container');
    if (restaurantsContainer) {
        restaurantsContainer.innerHTML = '';
    }
    
    // 重新加載餐廳資料
    if (window.mapInit && typeof window.mapInit.loadRestaurants === 'function') {
        window.mapInit.loadRestaurants();
    }
    
    // 顯示登出成功提示
    if (window.showToast) {
        window.showToast('已成功登出');
    }
}; 