// 模擬店家資料
const store = {
  name: '老張牛肉麵',
  image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
  rating: 4.5,
  address: '台北市大安區忠孝東路四段123號',
  isOpen: true,
  phone: '02-1234-5678',
  menu: [
    { name: '招牌牛肉麵', price: 180 },
    { name: '紅燒牛肉麵', price: 160 },
    { name: '滷味拼盤', price: 120 },
    { name: '小菜', price: 60 }
  ],
  reviews: [
    { user: '王小明', rating: 5, content: '湯頭濃郁，牛肉超嫩！', time: '2024-06-01' },
    { user: '陳美麗', rating: 4, content: '環境乾淨，服務親切。', time: '2024-05-28' },
    { user: '李大仁', rating: 4, content: '份量足夠，價格合理。', time: '2024-05-20' }
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  // 基本資料
  document.getElementById('store-name').textContent = store.name;
  document.getElementById('store-image').src = store.image;
  document.getElementById('store-rating').innerHTML = '★'.repeat(Math.floor(store.rating)) + '☆'.repeat(5-Math.floor(store.rating)) + ` <span>${store.rating.toFixed(1)}</span>`;
  document.getElementById('store-address').innerHTML = '<i class="fas fa-map-marker-alt"></i> ' + store.address;
  document.getElementById('store-status').textContent = store.isOpen ? '營業中' : '已打烊';
  document.getElementById('store-status').className = 'store-status ' + (store.isOpen ? 'status-open' : 'status-closed');

  // 菜單
  const menuList = document.getElementById('menu-list');
  menuList.innerHTML = '';
  store.menu.forEach(item => {
    const li = document.createElement('li');
    li.className = 'menu-item';
    li.innerHTML = `<div class="menu-item-name">${item.name}</div><div class="menu-item-price">NT$ ${item.price}</div>`;
    menuList.appendChild(li);
  });

  // 評論
  const reviewList = document.getElementById('review-list');
  reviewList.innerHTML = '';
  store.reviews.forEach(r => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <div class="review-header">
        <span class="review-user">${r.user}</span>
        <span class="review-rating">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
        <span class="review-time">${r.time}</span>
      </div>
      <div class="review-content">${r.content}</div>
    `;
    reviewList.appendChild(div);
  });

  // 按鈕互動
  document.getElementById('btn-favorite').addEventListener('click', () => alert('已收藏！'));
  document.getElementById('btn-share').addEventListener('click', () => alert('分享功能開發中...'));
  document.getElementById('btn-call').addEventListener('click', () => alert('撥打電話：' + store.phone));
  document.getElementById('btn-review').addEventListener('click', () => alert('撰寫評論功能開發中...'));
  document.querySelector('.btn-login').addEventListener('click', () => alert('登入功能開發中...'));
  document.getElementById('btn-user-center').addEventListener('click', () => alert('用戶中心功能開發中...'));
}); 