// ===========================================
// 輪播功能
// ===========================================
let currentSlide = 0;

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    currentSlide = (n + slides.length) % slides.length;
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.style.transform = `translateX(-${currentSlide * 33.333}%)`;
    }
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    if (slides.length === 0) return;
    setInterval(() => showSlide(currentSlide + 1), 5000);
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    showSlide(0);
}

// ===========================================
// 登入彈窗
// ===========================================
function initLoginModal() {
    const loginBtn = document.querySelector('.btn-login');
    const modal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    const loginForm = document.getElementById('loginForm');
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
        closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) { modal.style.display = 'none'; }
    });
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
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
    if (loginBtn) loginBtn.textContent = isLoggedIn ? '會員中心' : '登入';
}

function socialLogin(platform) {
    alert('社群登入（' + platform + '）功能尚未開放');
}

// ===========================================
// 類型搜尋 → 全部導向 mapInit
// ===========================================
window.searchByType = function(type, keyword) {
    if (window.mapInit && typeof window.mapInit.searchByType === 'function') {
        window.mapInit.searchByType(type, keyword);
    } else {
        alert('地圖尚未初始化完成，請稍候再試');
    }
};

// ===========================================
// 餐廳列表顯示
// ===========================================
window.displayRestaurants = function(restaurants) {
    const container = document.getElementById('restaurants-container');
    if (!container) return;
    if (!restaurants || restaurants.length === 0) {
        container.innerHTML = '<div class="no-results">找不到相關餐廳</div>';
        return;
    }
    const html = restaurants.map(restaurant => {
        const {
            id = '',
            name = '未知名稱',
            address = '地址未提供',
            rating = 0,
            user_ratings_total = 0,
            photos = null,
            opening_hours = null
        } = restaurant;
        const escapedName = name.replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
        return `
            <div class="restaurant-card" data-id="${id}">
                <div class="restaurant-image">
                    ${photos ?
                        `<img src="${photos}" alt="${escapedName}" loading="lazy" onerror="this.src='images/no-image.jpg';">` :
                        '<div class="no-image">暫無圖片</div>'
                    }
                    <button class="favorite-btn ${window.isFavorite(id) ? 'active' : ''}"
                            onclick="toggleFavorite('${id}', '${escapedName}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="restaurant-info">
                    <h3>${escapedName}</h3>
                    <div class="rating">
                        ${rating > 0 ? `
                            <div class="stars">
                                ${Array(5).fill(0).map((_, i) => `
                                    <i class="fas fa-star ${i < Math.floor(rating) ? 'filled' :
                                        i < rating ? 'half-filled' : ''}"></i>
                                `).join('')}
                            </div>
                            <span class="rating-text">${rating.toFixed(1)} (${user_ratings_total})</span>
                        ` : '<span class="no-rating">尚無評分</span>'}
                    </div>
                    <p class="address" title="${address}">
                        <i class="fas fa-map-marker-alt"></i> ${address}
                    </p>
                    ${opening_hours ? `
                        <p class="opening-hours ${opening_hours.isOpen ? 'open' : 'closed'}">
                            <i class="fas fa-clock"></i>
                            ${opening_hours.isOpen ? '營業中' : '休息中'}
                        </p>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
    container.innerHTML = html;
};

// ===========================================
// 收藏功能
// ===========================================
window.toggleFavorite = function(id, name) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.findIndex(fav => fav.id === id);
    if (index === -1) {
        favorites.push({ id, name });
        showToast('已加入收藏');
    } else {
        favorites.splice(index, 1);
        showToast('已移除收藏');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    const btn = document.querySelector(`[data-id="${id}"] .favorite-btn`);
    if (btn) btn.classList.toggle('active');
};

window.isFavorite = function(id) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.some(fav => fav.id === id);
};

// ===========================================
// Toast 提示
// ===========================================
function showToast(message) {
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

// ===========================================
// 頁面初始化
// ===========================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        initCarousel();
        initLoginModal();
    } catch (error) {
        console.error('初始化頁面時發生錯誤:', error);
    }
});
