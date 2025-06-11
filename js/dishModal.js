// 開啟 dish modal
function openDishModal(dishName, images, reviews) {
  const modal = document.getElementById('dishModal');
  const title = document.getElementById('dishModalTitle');
  const carousel = document.getElementById('dishImageCarousel');
  const reviewsList = document.getElementById('dishReviewsList');
  const prevBtn = carousel.parentElement.querySelector('.prev-btn');
  const nextBtn = carousel.parentElement.querySelector('.next-btn');

  // 設置標題
  title.textContent = dishName;

  // 清空並添加圖片
  carousel.innerHTML = '';
  images.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imgEl.alt = `${dishName} 圖片`;
    carousel.appendChild(imgEl);
  });

  // 設置輪播功能
  let currentIndex = 0;
  const totalImages = images.length;

  function updateCarousel() {
    const offset = -currentIndex * 100;
    carousel.style.transform = `translateX(${offset}%)`;
    
    // 更新按鈕狀態
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalImages - 1;
  }

  // 綁定按鈕事件
  prevBtn.onclick = () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  };

  nextBtn.onclick = () => {
    if (currentIndex < totalImages - 1) {
      currentIndex++;
      updateCarousel();
    }
  };

  // 初始化輪播狀態
  updateCarousel();

  // 清空並添加評論
  reviewsList.innerHTML = '';
  reviews.forEach(review => {
    const reviewEl = document.createElement('div');
    reviewEl.className = 'review-item';
    reviewEl.innerHTML = `
      <div class=\"review-header-flex\">\n        <div class=\"review-header-line\">\n          <img src=\"${review.avatar}\" alt=\"${review.name}\" class=\"review-avatar\">\n          <span class=\"review-name\">${review.name}</span>\n        </div>\n        <div class=\"review-stars-line\">${renderStars(review.rating || 0)}<span class='review-score'>${review.rating ? review.rating : ''}</span></div>\n      </div>\n      <div class=\"review-text\">${review.text}</div>\n    `;
    reviewsList.appendChild(reviewEl);
  });

  // 顯示 modal
  modal.style.display = 'block';
  modal.offsetHeight;
  modal.classList.add('show');
}

// 星星渲染工具
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '<i class="fas fa-star"></i>'.repeat(full) +
         (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
         '<i class="far fa-star"></i>'.repeat(empty);
}

// 關閉 dish modal
function closeDishModal() {
  const modal = document.getElementById('dishModal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// 點擊 modal 外部關閉
window.addEventListener('click', function(event) {
  const modal = document.getElementById('dishModal');
  if (event.target === modal) {
    closeDishModal();
  }
});

// 為所有菜色卡片添加點擊事件
document.addEventListener('DOMContentLoaded', function() {
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', function() {
      const dishName = this.querySelector('h4').textContent;
      // 使用穩定的圖片連結
      const images = [
        'https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg',
        'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg',
        'https://images.pexels.com/photos/6940991/pexels-photo-6940991.jpeg'
      ];
      // 假評論資料，加入rating
      const reviews = [
        {
          name: '美食家小明',
          avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          text: '這道菜色香味俱全，口感絕佳，是我吃過最好吃的版本之一！',
          rating: 5
        },
        {
          name: '饕客小華',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          text: '食材新鮮，烹調手法專業，每一口都能感受到廚師的用心。',
          rating: 4.5
        },
        {
          name: '美食部落客小紅',
          avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          text: '擺盤精緻，味道層次豐富，絕對值得推薦！',
          rating: 4
        }
      ];
      openDishModal(dishName, images, reviews);
    });
  });
}); 