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

// 登入彈窗功能
function initLoginModal() {
    const loginBtn = document.querySelector('.btn-login');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');

    // 檢查登入狀態並更新按鈕
    updateLoginStatus();

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (localStorage.getItem('isLoggedIn') === 'true') {
                window.location.href = 'userCenter.html';
            } else {
                if (modal) modal.style.display = 'block';
            }
        });
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            // 模擬登入成功
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            modal.style.display = 'none';
            updateLoginStatus();
            window.location.href = 'userCenter.html';
        });
    }
}
function updateLoginStatus() {
    const loginBtn = document.querySelector('.btn-login');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (loginBtn) {
        if (isLoggedIn) {
            loginBtn.textContent = '會員中心';
        } else {
            loginBtn.textContent = '登入';
        }
    }
}
function socialLogin(platform) {
    alert('社群登入（' + platform + '）功能尚未開放');
}
document.addEventListener('DOMContentLoaded', function() {
    initLoginModal();
}); 