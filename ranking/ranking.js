// 示意用的餐廳資料
const allRestaurants = {
    all: [
        {
            name: "金龍餐廳",
            rank: 1,
            rating: 4.5,
            reviews: 234,
            tags: ["中式料理", "合菜", "家庭聚餐"],
            image: "https://picsum.photos/300/200?random=1",
            address: "台北市中山區中山北路二段",
            phone: "02-2345-6789",
            price: "$300-500/人",
            hours: "11:00-21:00",
            description: "金龍餐廳以傳統中式料理聞名，主打精緻粵菜及港式點心。餐廳環境優雅，適合商務聚餐及家庭聚會。",
            features: ["提供包廂", "可預約", "免費WiFi", "停車場"],
            payment: ["現金", "信用卡", "行動支付"]
        },
        {
            name: "櫻花壽司",
            rank: 2,
            rating: 4.8,
            reviews: 189,
            tags: ["日本料理", "壽司", "無菜單料理"],
            image: "https://picsum.photos/300/200?random=2",
            address: "台北市信義區信義路五段",
            phone: "02-2765-4321",
            price: "$500-800/人",
            hours: "11:30-22:00",
            description: "櫻花壽司由日本主廚精心料理，提供最新鮮的海鮮食材，每日直送。無菜單料理讓您體驗主廚的創意美食。",
            features: ["要預約", "免費WiFi", "專屬停車位", "信用卡優惠"],
            payment: ["現金", "信用卡"]
        },
        {
            name: "香港茶餐廳",
            rank: 3,
            rating: 4.3,
            reviews: 567,
            tags: ["港式料理", "茶餐廳", "早午餐"],
            image: "https://picsum.photos/300/200?random=3",
            address: "台北市大安區忠孝東路四段",
            phone: "02-2731-5678",
            price: "$200-300/人",
            hours: "07:00-22:00",
            description: "正宗港式茶餐廳，從早餐到宵夜都有供應。招牌菜包括絲襪奶茶、菠蘿包、燒臘飯等港式經典美食。",
            features: ["不需預約", "免費WiFi", "外送服務"],
            payment: ["現金", "信用卡", "行動支付"]
        }
    ],
    weekly: [
        {
            name: "義大利麵屋",
            rank: 1,
            rating: 4.6,
            reviews: 156,
            tags: ["義式料理", "pasta", "pizza"],
            image: "https://picsum.photos/300/200?random=4",
            address: "台北市中山區林森北路",
            phone: "02-2542-9876",
            price: "$350-500/人",
            hours: "11:30-21:30",
            description: "道地的義大利料理，主廚曾在義大利米其林餐廳學習。提供多種手工義大利麵和窯烤披薩。",
            features: ["建議預約", "免費WiFi", "親子友善"],
            payment: ["現金", "信用卡"]
        },
        {
            name: "韓式烤肉",
            rank: 2,
            rating: 4.4,
            reviews: 289,
            tags: ["韓式料理", "烤肉", "小菜"],
            image: "https://picsum.photos/300/200?random=5",
            address: "台北市松山區市民大道",
            phone: "02-2756-8765",
            price: "$450-700/人",
            hours: "17:00-23:00",
            description: "正宗韓式烤肉，使用特製醬料醃製的優質肉品，搭配豐富的韓式小菜。提供專業代烤服務。",
            features: ["提供包廂", "免費停車", "代烤服務"],
            payment: ["現金", "信用卡", "行動支付"]
        }
    ],
    monthly: [
        {
            name: "法式餐廳",
            rank: 1,
            rating: 4.9,
            reviews: 123,
            tags: ["法式料理", "精緻料理", "約會"],
            image: "https://picsum.photos/300/200?random=6",
            address: "台北市大安區敦化南路",
            phone: "02-2709-8888",
            price: "$1200-2000/人",
            hours: "18:00-22:00",
            description: "米其林星級主廚打造的法式fine dining體驗，每季更換菜單，使用當季最新鮮的食材。",
            features: ["需預約", "免費代客停車", "浪漫氣氛", "sommelier推薦"],
            payment: ["現金", "信用卡"]
        }
    ],
    new: [
        {
            name: "泰式料理",
            rank: 1,
            rating: 4.2,
            reviews: 45,
            tags: ["泰式料理", "酸辣", "新開幕"],
            image: "https://picsum.photos/300/200?random=7",
            address: "台北市中正區羅斯福路",
            phone: "02-2369-5432",
            price: "$300-450/人",
            hours: "11:00-21:30",
            description: "新開幕泰式餐廳，主廚來自曼谷，提供最道地的泰國風味。特色料理包括冬陰功湯、青木瓜沙拉等。",
            features: ["不需預約", "外帶優惠", "免費WiFi"],
            payment: ["現金", "信用卡", "行動支付"]
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {
    const restaurantList = document.querySelector('.restaurant-list');
    let currentFilter = 'all';
    
    // 載入餐廳列表
    function createRestaurantItem(restaurant) {
        return `
            <div class="restaurant-item">
                <div class="rank rank-${restaurant.rank}">#${restaurant.rank}</div>
                <div class="restaurant-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}">
                </div>
                <div class="restaurant-info">
                    <h2 class="restaurant-name">${restaurant.name}</h2>
                    <div class="rating">
                        <span class="stars">★★★★☆</span>
                        <span class="score">${restaurant.rating}</span>
                        <span class="reviews">(${restaurant.reviews}則評價)</span>
                    </div>
                    <div class="tags">
                        ${restaurant.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="actions">
                    <button class="favorite-btn">♡</button>
                    <button class="details-btn">查看詳情</button>
                </div>
            </div>
        `;
    }

    // 更新餐廳列表
    function updateRestaurants(filterType) {
        const restaurants = allRestaurants[filterType];
        restaurantList.innerHTML = '';
        restaurants.forEach(restaurant => {
            restaurantList.innerHTML += createRestaurantItem(restaurant);
        });
        setupFavoriteButtons();
    }

    // 設置收藏按鈕功能
    function setupFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                btn.textContent = btn.classList.contains('active') ? '♥' : '♡';
            });
        });

        // 設置詳情按鈕功能
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const restaurantItem = btn.closest('.restaurant-item');
                const rank = restaurantItem.querySelector('.rank').textContent.replace('#', '');
                const restaurant = allRestaurants[currentFilter].find(r => r.rank === parseInt(rank));
                
                if (restaurant) {
                    showRestaurantDetail(restaurant);
                }
            });
        });
    }

    // 顯示餐廳詳細資訊
    function showRestaurantDetail(restaurant) {
        const modal = document.getElementById('restaurantModal');
        const detailContent = modal.querySelector('.restaurant-detail');
        
        detailContent.innerHTML = `
            <div class="detail-header">
                <div class="detail-image">
                    <img src="${restaurant.image}" alt="${restaurant.name}">
                </div>
                <div class="detail-main-info">
                    <h2 class="detail-title">${restaurant.name}</h2>
                    <div class="detail-rating">
                        <span class="stars">★★★★☆</span>
                        <span class="score">${restaurant.rating}</span>
                        <span class="reviews">(${restaurant.reviews}則評價)</span>
                    </div>
                    <div class="tags">
                        ${restaurant.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <h3>基本資訊</h3>
                <div class="detail-info-grid">
                    <div class="detail-info-item">
                        <i>📍</i>
                        <span>${restaurant.address}</span>
                    </div>
                    <div class="detail-info-item">
                        <i>📞</i>
                        <span>${restaurant.phone}</span>
                    </div>
                    <div class="detail-info-item">
                        <i>💰</i>
                        <span>${restaurant.price}</span>
                    </div>
                    <div class="detail-info-item">
                        <i>🕒</i>
                        <span>${restaurant.hours}</span>
                    </div>
                </div>
            </div>
            <div class="detail-section">
                <h3>餐廳介紹</h3>
                <p class="detail-description">${restaurant.description}</p>
            </div>
            <div class="detail-section">
                <h3>設施與服務</h3>
                <div class="tags">
                    ${restaurant.features.map(feature => `<span class="tag">${feature}</span>`).join('')}
                </div>
            </div>
            <div class="detail-section">
                <h3>付款方式</h3>
                <div class="tags">
                    ${restaurant.payment.map(method => `<span class="tag">${method}</span>`).join('')}
                </div>
            </div>
        `;

        modal.classList.add('active');
    }

    // 過濾按鈕功能
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            updateRestaurants(currentFilter);
        });
    });

    // 載入更多按鈕功能
    const loadMoreBtn = document.querySelector('.load-more');
    loadMoreBtn.addEventListener('click', () => {
        alert('載入更多餐廳...');
    });

    // 關閉模態框
    const modalClose = document.querySelector('.modal-close');
    const modal = document.getElementById('restaurantModal');

    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // 點擊模態框外部關閉
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // 初始化顯示
    updateRestaurants('all');
}); 