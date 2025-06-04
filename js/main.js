// 輪播圖功能
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(n) {
    currentSlide = (n + slides.length) % slides.length;
    document.querySelector('.carousel-wrapper').style.transform = `translateX(-${currentSlide * 33.333}%)`;
    
    // 更新指示點
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// 自動輪播
setInterval(() => {
    showSlide(currentSlide + 1);
}, 5000);

// 點擊指示點切換輪播圖
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// 分類切換功能
const categoryItems = document.querySelectorAll('.category-item');
const restaurantSections = document.querySelectorAll('.restaurant-section');

categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('data-target');
        
        // 更新分類項目的活動狀態
        categoryItems.forEach(cat => cat.classList.remove('active'));
        item.classList.add('active');
        
        // 顯示對應的餐廳區塊
        restaurantSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});

// 搜尋功能
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        // 在這裡實現搜尋邏輯
        console.log('搜尋:', searchTerm);
    }
});

// 登入狀態檢查
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginBtn = document.querySelector('.btn-login');
    
    if (isLoggedIn) {
        loginBtn.textContent = '會員中心';
        loginBtn.onclick = () => {
            window.location.href = 'userLogin.html';
        };
    } else {
        loginBtn.textContent = '登入';
        loginBtn.onclick = () => {
            window.location.href = 'userLogin.html';
        };
    }
}

// 頁面載入時檢查登入狀態
document.addEventListener('DOMContentLoaded', checkLoginStatus); 