// 輪播圖功能
class RestaurantCarousel {
  constructor(restaurantData) {
    this.carousel = document.querySelector('.carousel-slides');
    this.slides = [];
    this.currentIndex = 0;
    this.autoPlayInterval = null;
    this.slideInterval = 3000; // 3秒切換一次
    this.restaurantData = restaurantData;

    // 初始化輪播圖
    this.initCarousel();
    this.setupEventListeners();
    this.startAutoPlay();
  }

  // 初始化輪播圖
  initCarousel() {
    // 使用餐廳資料中的圖片
    const images = this.restaurantData.images;

    // 創建輪播圖片元素
    images.forEach((image, index) => {
      const slide = document.createElement('div');
      slide.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
      slide.innerHTML = `<img src="${image.url}" alt="${image.alt}">`;
      this.carousel.appendChild(slide);
      this.slides.push(slide);
    });
  }

  // 設置事件監聽器
  setupEventListeners() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    prevBtn.addEventListener('click', () => {
      this.stopAutoPlay();
      this.showPreviousSlide();
      this.startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
      this.stopAutoPlay();
      this.showNextSlide();
      this.startAutoPlay();
    });

    // 滑鼠懸停時暫停自動播放
    this.carousel.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.carousel.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  // 顯示下一張圖片
  showNextSlide() {
    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.slides[this.currentIndex].classList.add('active');
  }

  // 顯示上一張圖片
  showPreviousSlide() {
    this.slides[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.slides[this.currentIndex].classList.add('active');
  }

  // 開始自動播放
  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => this.showNextSlide(), this.slideInterval);
  }

  // 停止自動播放
  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// 餐廳資料處理
class RestaurantDetail {
  constructor() {
    this.restaurantData = null;
    this.init();
    this.setupActionButtons();
    this.setupMenuScroll();
    this.setupFullMenuButton();
    this.setupShareModal();
    initDirectionsModal(); // 初始化路線規劃功能
  }

  async init() {
    await this.getRestaurantDataFromUrl();
    console.log('上一頁傳來的餐廳資料:', this.restaurantData);
    console.log('googleReviews:', this.restaurantData.googleReviews);
    this.updatePageInfo();
    new RestaurantCarousel(this.restaurantData);

    // Leaflet 地圖初始化，只顯示單一餐廳 marker
    const lat = this.restaurantData.latitude;
    const lng = this.restaurantData.longitude;
    console.log('Detail page lat/lng:', lat, lng);
    if (lat && lng && window.L) {
      const map = L.map('map').setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
    }

    this.renderGoogleReviews();
  }

  // 預設餐廳資料
  getDefaultRestaurantData() {
    // 根據餐廳類型獲取相應的圖片
    const images = this.getImagesByType('中式');

    return {
      name: '示例餐廳',
      rating: 4.5,
      ratingCount: 123,
      isVerified: true,
      priceRange: '$$',
      tags: ['咖啡廳', '甜點', '早餐'],
      isOpen: true,
      businessHours: '營業至 22:00',
      images: images,
      address: '台北市信義區信義路五段7號',
      location: {
        lat: 25.0330,
        lng: 121.5654
      },
      businessHours: '11:00 - 22:00',
      googleReviews: [] // 確保預設資料也有 googleReviews
    };
  }

  // 根據餐廳類型獲取相應的圖片
  getImagesByType(type) {
    // 統一使用本地圖片作為輪播圖
    const localImages = [
      {
        url: 'images/pigDance1.jpg',
        alt: '餐廳圖片1'
      },
      {
        url: 'images/pigDance3.webp',
        alt: '餐廳圖片2'
      },
      {
        url: 'images/pigDance2.jpeg',
        alt: '餐廳圖片3'
      },
      {
        url: 'images/pigDance4.webp',
        alt: '餐廳圖片4'
      }
    ];

    const imageSets = {
      '中式': localImages,
      '日式': localImages,
      '火鍋': localImages,
      '咖啡廳': localImages,
      '牛排': localImages,
      '美式': localImages,
      '韓式': localImages,
      '泰式': localImages,
      '港式': localImages
    };

    // 如果找不到對應的類型，返回中式餐廳的圖片
    return imageSets[type] || imageSets['中式'];
  }

  // 從 URL 獲取餐廳資料
  async getRestaurantDataFromUrl() {
    // 優先從 URL 參數讀取餐廳 ID 或資料
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurantId');
    const restaurantData = urlParams.get('data');
    
    // 如果有餐廳 ID，從 API 獲取資料
    if (restaurantId) {
      try {
        console.log('從 API 載入餐廳資料，ID:', restaurantId);
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`);
        if (response.ok) {
          const apiData = await response.json();
          this.restaurantData = this.transformApiData(apiData);
          console.log('從 API 成功載入餐廳資料:', this.restaurantData);
          return;
        } else {
          console.error('API 請求失敗:', response.status);
        }
      } catch (error) {
        console.error('從 API 載入餐廳資料失敗:', error);
      }
    }
    
    // 如果有 data 參數，解析 URL 中的資料
    if (restaurantData) {
      try {
        this.restaurantData = JSON.parse(decodeURIComponent(restaurantData));
        console.log('從 URL 成功讀取餐廳資料:', this.restaurantData);
        
        // 確保 ratingCount 存在
        if (!this.restaurantData.ratingCount) {
          this.restaurantData.ratingCount = this.restaurantData.reviewCount || this.restaurantData.user_ratings_total || 0;
        }
        
        // 根據餐廳類型設置圖片
        if (!this.restaurantData.images) {
          this.restaurantData.images = this.getImagesByType(this.restaurantData.types || this.restaurantData.tags?.[0] || '中式');
        }
        
        // 設置位置資訊
        if (!this.restaurantData.location && (this.restaurantData.latitude || this.restaurantData.longitude)) {
          this.restaurantData.location = {
            lat: parseFloat(this.restaurantData.latitude),
            lng: parseFloat(this.restaurantData.longitude)
          };
        }
        
        return;
      } catch (error) {
        console.error('解析 URL 餐廳資料失敗:', error);
      }
    }
    
    // 次要：從 localStorage 讀取餐廳資料（相容性考慮）
    const storedRestaurantData = localStorage.getItem('selectedRestaurant');
    if (storedRestaurantData) {
      try {
        this.restaurantData = JSON.parse(storedRestaurantData);
        console.log('從 localStorage 成功讀取餐廳資料:', this.restaurantData);
        console.log('localStorage 中的 googleReviews:', this.restaurantData.googleReviews);
        
        // 確保 ratingCount 存在
        if (!this.restaurantData.ratingCount) {
          this.restaurantData.ratingCount = this.restaurantData.reviewCount || this.restaurantData.user_ratings_total || 0;
        }
        
        // 根據餐廳類型設置圖片
        if (!this.restaurantData.images) {
          this.restaurantData.images = this.getImagesByType(this.restaurantData.types || this.restaurantData.tags?.[0] || '中式');
        }
        
        // 設置位置資訊
        if (!this.restaurantData.location && (this.restaurantData.latitude || this.restaurantData.longitude)) {
          this.restaurantData.location = {
            lat: parseFloat(this.restaurantData.latitude),
            lng: parseFloat(this.restaurantData.longitude)
          };
        }
        
        return;
      } catch (error) {
        console.error('解析 localStorage 餐廳資料失敗:', error);
        localStorage.removeItem('selectedRestaurant');
      }
    }
    
    // 如果沒有任何資料，使用預設資料
    console.log('沒有找到餐廳資料，使用預設資料');
    this.restaurantData = this.getDefaultRestaurantData();
  }

  // 轉換 API 資料格式為前端所需格式
  transformApiData(apiData) {
    const transformed = {
      id: apiData.id || apiData.placeId,
      placeId: apiData.placeId,
      name: apiData.name,
      rating: apiData.rating || apiData.averageRating || 0,
      reviewCount: apiData.reviewCount || apiData.ratingCount || 0,
      ratingCount: apiData.reviewCount || apiData.ratingCount || 0,
      address: apiData.address,
      latitude: apiData.latitude || apiData.lat,
      longitude: apiData.longitude || apiData.lng,
      types: apiData.types,
      priceLevel: apiData.priceLevel,
      websiteUrl: apiData.websiteUrl,
      phoneNumber: apiData.phoneNumber,
      openingHours: apiData.openingHours,
      googleReviews: apiData.googleReviews || [],
      // 設置位置資訊
      location: {
        lat: parseFloat(apiData.latitude || apiData.lat),
        lng: parseFloat(apiData.longitude || apiData.lng)
      }
    };
    
    // 根據餐廳類型設置圖片
    if (!transformed.images) {
      transformed.images = this.getImagesByType(transformed.types || '中式');
    }
    
    return transformed;
  }

  // 更新頁面資訊
  updatePageInfo() {
    // 1. 餐廳名稱
    const restaurantNameElement = document.querySelector('.restaurant-name');
    if (restaurantNameElement) {
      restaurantNameElement.textContent = this.restaurantData.name || '餐廳名稱';
    }
    // 2. 評分與評論數
    const ratingScore = document.querySelector('.rating-score');
    const reviewCount = document.querySelector('.review-count');
    if (ratingScore) {
      const rating = this.restaurantData.rating || this.restaurantData.averageRating || 0;
      ratingScore.textContent = rating.toFixed(1);
    }
    if (reviewCount) {
      const count = this.restaurantData.reviewCount || this.restaurantData.ratingCount || this.restaurantData.user_ratings_total || 0;
      reviewCount.textContent = `${count} 則評論`;
    }
    // 3. 地址
    const addressEl = document.querySelector('.address');
    if (addressEl) {
      addressEl.textContent = this.restaurantData.address || '';
    }
    // 4. 營業時間與營業中判斷
    const status = document.querySelector('.status');
    const hours = document.querySelector('.hours');
    let businessHoursText = '暫無營業時間資料';
    let isOpen = false;
    function isOpenNow(businessHoursText) {
      if (!businessHoursText) return false;
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const normalized = businessHoursText.replace(/：/g, ':').replace(/[－–—~]/g, '-');
      const periods = normalized.split(',').map(p => p.trim());
      for (const period of periods) {
        const match = period.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
        if (match) {
          const [_, start, end] = match;
          const [startH, startM] = start.split(':').map(Number);
          const [endH, endM] = end.split(':').map(Number);
          const startMin = startH * 60 + startM;
          let endMin = endH * 60 + endM;
          if (endMin < startMin) endMin += 24 * 60;
          if ((nowMinutes >= startMin && nowMinutes <= endMin) || (endMin > 24 * 60 && nowMinutes <= endMin - 24 * 60)) {
            return true;
          }
        }
      }
      return false;
    }
    let openingHoursArr = this.restaurantData.openingHours;
    if (typeof openingHoursArr === 'string' && openingHoursArr.startsWith('[')) {
      try {
        openingHoursArr = JSON.parse(openingHoursArr);
      } catch (e) {
        openingHoursArr = null;
      }
    }
    if (Array.isArray(openingHoursArr) && openingHoursArr.length === 7) {
      const today = new Date().getDay();
      const index = today === 0 ? 6 : today - 1;
      const todayText = openingHoursArr[index] || '暫無營業時間資料';
      const timePart = todayText.split(/：|:/).slice(1).join(':').trim();
      businessHoursText = timePart ? timePart : todayText;
      isOpen = isOpenNow(businessHoursText);
    } else if (typeof openingHoursArr === 'string' && openingHoursArr.length > 0) {
      businessHoursText = openingHoursArr;
    } else if (this.restaurantData.opening_hours) {
      isOpen = this.restaurantData.opening_hours.open_now || false;
      if (this.restaurantData.opening_hours.weekday_text && Array.isArray(this.restaurantData.opening_hours.weekday_text)) {
        const today = new Date().getDay();
        const index = today === 0 ? 6 : today - 1;
        if (this.restaurantData.opening_hours.weekday_text[index]) {
          const todayText = this.restaurantData.opening_hours.weekday_text[index];
          const timeMatch = todayText.match(/:\s*(.+)$/);
          businessHoursText = timeMatch ? timeMatch[1].trim() : '暫無營業時間資料';
          isOpen = isOpenNow(businessHoursText);
        }
      } else if (this.restaurantData.businessHours && Array.isArray(this.restaurantData.businessHours)) {
        businessHoursText = this.restaurantData.businessHours[0] || '暫無營業時間資料';
      }
    }
    if (status) {
      status.textContent = isOpen ? '營業中' : '休息中';
      status.className = `status ${isOpen ? 'open' : 'closed'}`;
    }
    if (hours) {
      hours.textContent = businessHoursText;
    }

    // 地圖下方 address
    const mapAddressEl = document.querySelector('.map-section .address');
    if (mapAddressEl) {
      mapAddressEl.textContent = this.restaurantData.address || '';
    }
  }

  // 設置操作按鈕功能
  setupActionButtons() {
    // 收藏按鈕
    const saveBtn = document.querySelector('.action-btn.save');
    saveBtn.addEventListener('click', () => {
      const isSaved = saveBtn.classList.toggle('active');
      const icon = saveBtn.querySelector('i');
      if (isSaved) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        // TODO: 實現收藏功能
        ('收藏餐廳:', this.restaurantData.name);
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        // TODO: 實現取消收藏功能
        ('取消收藏餐廳:', this.restaurantData.name);
      }
    });

    // 取得按鈕元素
    const shareBtn = document.querySelector('.action-btn.share');

    // 監聽分享按鈕點擊事件
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        // 顯示彈出視窗
        const currentUrl = window.location.href;
        const shareLinkInput = document.querySelector('.share-link-input');
        const shareTitle = document.querySelector('.share-modal-content h2');
        const shareModalOverlay = document.querySelector('.share-modal-overlay');
        const closeModalBtn = document.querySelector('.close-modal');
        const copyLinkBtn = document.querySelector('.copy-link-btn');
        const shareIcons = document.querySelectorAll('.share-options .share-icon');

        if (!shareLinkInput || !shareTitle || !shareModalOverlay || !closeModalBtn || !copyLinkBtn || !shareIcons || shareIcons.length === 0) {
          console.error('分享彈出視窗相關元素未找到');
          return;
        }

        shareLinkInput.value = currentUrl; // 暫時使用當前頁面 URL 作為分享連結
        if (this.restaurantData) {
          shareTitle.textContent = `分享 ${this.restaurantData.name || '這家餐廳'}`; // 更新標題
        }
       
        shareModalOverlay.classList.add('visible');
      });
    }
  }

  setupMenuScroll() {
    const menuGrid = document.querySelector('.menu-grid');
    const prevBtn = document.querySelector('.menu-scroll-btn.prev');
    const nextBtn = document.querySelector('.menu-scroll-btn.next');
    
    if (!menuGrid || !prevBtn || !nextBtn) return;

    const scrollAmount = 220; // 每次滾動的距離（卡片寬度 + 間距）

    // 更新按鈕狀態
    const updateButtonStates = () => {
      prevBtn.disabled = menuGrid.scrollLeft <= 0;
      nextBtn.disabled = menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth -1; // Subtract 1 to account for potential floating point issues
    };

    // 滾動到指定位置
    const scrollTo = (position) => {
      menuGrid.scrollTo({
        left: position,
        behavior: 'smooth'
      });
    };

    // 左滾動按鈕點擊事件
    prevBtn.addEventListener('click', () => {
      const newPosition = Math.max(0, menuGrid.scrollLeft - scrollAmount);
      scrollTo(newPosition);
    });

    // 右滾動按鈕點擊事件
    nextBtn.addEventListener('click', () => {
      const newPosition = Math.min(
        menuGrid.scrollWidth - menuGrid.clientWidth,
        menuGrid.scrollLeft + scrollAmount
      );
      scrollTo(newPosition);
    });

    // 監聽滾動事件更新按鈕狀態
    menuGrid.addEventListener('scroll', updateButtonStates);

    // 監聽視窗大小變化
    window.addEventListener('resize', updateButtonStates);

    // 初始化按鈕狀態
    updateButtonStates();
  }

  // 設置查看完整菜單按鈕功能
  setupFullMenuButton() {
    const viewFullMenuBtn = document.querySelector('.view-full-menu');
    if (viewFullMenuBtn) {
      viewFullMenuBtn.addEventListener('click', () => {
        // 將餐廳資料轉換為 JSON 字串並進行編碼
        const encodedRestaurantData = encodeURIComponent(JSON.stringify(this.restaurantData));
        // 導向到 menuDetail.html 頁面，並在 URL 中傳遞資料
        window.location.href = `menuDetail.html?data=${encodedRestaurantData}`;
      });
    }
  }

  // 設置分享彈出視窗功能
  setupShareModal() {
    const shareBtn = document.querySelector('.action-btn.share');

    // 由於分享模態框已被移除，只設定分享按鈕的基本功能
    if (!shareBtn) {
      console.log('分享按鈕未找到');
      return;
    }

    // 簡單的分享功能：複製當前頁面連結
    shareBtn.addEventListener('click', () => {
      const currentUrl = window.location.href;
      const restaurantName = this.restaurantData ? this.restaurantData.name : '這家餐廳';
      
      // 嘗試使用現代的 Navigator API 複製連結
      if (navigator.clipboard) {
        navigator.clipboard.writeText(currentUrl)
          .then(() => {
            alert(`已複製 ${restaurantName} 的分享連結到剪貼簿！`);
          })
          .catch(err => {
            console.error('複製連結失敗:', err);
            // 回退方案：顯示連結讓用戶手動複製
            prompt('請手動複製以下連結：', currentUrl);
          });
      } else {
        // 回退方案：顯示連結讓用戶手動複製
        prompt('請手動複製以下連結：', currentUrl);
      }
    });
  }

  // 渲染 Google 評論
  renderGoogleReviews() {
    const reviewsContainer = document.querySelector('.reviews-container');
    if (!reviewsContainer) {
      console.error('找不到評論容器元素');
      return;
    }

    const googleReviews = this.restaurantData.googleReviews;
    console.log('準備渲染的 googleReviews:', googleReviews);

    // 檢查是否有評論資料
    if (!googleReviews || !Array.isArray(googleReviews) || googleReviews.length === 0) {
      reviewsContainer.innerHTML = '<div class="no-reviews">目前沒有顧客評論</div>';
      return;
    }

    // 生成評論 HTML
    let reviewsHtml = '';
    googleReviews.forEach((review, index) => {
      // 格式化評論時間 (YYYY年M月D日)
      let formattedDate = '';
      if (review.timeCreated) {
        try {
          const date = new Date(review.timeCreated);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() 回傳 0-11
          const day = date.getDate();
          formattedDate = `${year}年${month}月${day}日`;
        } catch (error) {
          console.error('日期格式化錯誤:', error);
          formattedDate = review.timeCreated || ''; // 使用原始值或空字串
        }
      }

      // 生成星星評分
      const generateStars = (rating) => {
        if (!rating || rating < 1 || rating > 5) return '';
        let stars = '';
        for (let i = 1; i <= 5; i++) {
          if (i <= rating) {
            stars += '<span class="star filled">★</span>';
          } else {
            stars += '<span class="star empty">☆</span>';
          }
        }
        return stars;
      };

      // 檢查評論文字是否需要收合（估算是否超過4行）
      const reviewText = review.text || '無評論內容';
      const needsToggle = reviewText.length > 160; // 粗略估算，大約40字一行，4行約160字

      reviewsHtml += `
        <div class="review-item">
          <div class="review-header">
            <div class="reviewer-info">
              <img src="${review.profilePhotoUrl || 'images/default-avatar.png'}" 
                   alt="${review.authorName || '匿名用戶'}" 
                   class="reviewer-avatar"
                   onerror="this.src='images/default-avatar.png'">
              <div class="reviewer-details">
                <h4 class="reviewer-name">${review.authorName || '匿名用戶'}</h4>
                <div class="review-meta">
                  <div class="review-rating">
                    <div class="stars">${generateStars(review.rating)}</div>
                    <span class="rating-score">${review.rating || 'N/A'}</span>
                  </div>
                  <span class="review-date">${formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="review-content">
            <p class="review-text ${needsToggle ? 'review-text-collapsed' : ''}" data-review-index="${index}">
              ${reviewText}
            </p>
            ${needsToggle ? `
              <button class="review-toggle-btn" data-review-index="${index}">
                <span class="toggle-text">...查看更多</span>
                <i class="fas fa-chevron-down"></i>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    });

    // 插入評論 HTML
    reviewsContainer.innerHTML = reviewsHtml;

    // 添加收合/展開功能的事件監聽器
    this.initReviewToggleListeners();
  }

  // 初始化評論收合/展開功能
  initReviewToggleListeners() {
    const toggleButtons = document.querySelectorAll('.review-toggle-btn');
    
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const reviewIndex = button.getAttribute('data-review-index');
        const reviewText = document.querySelector(`.review-text[data-review-index="${reviewIndex}"]`);
        const toggleTextSpan = button.querySelector('.toggle-text');
        const toggleIcon = button.querySelector('i');
        
        if (reviewText.classList.contains('review-text-collapsed')) {
          // 展開評論
          reviewText.classList.remove('review-text-collapsed');
          reviewText.classList.add('review-text-expanded');
          toggleTextSpan.textContent = '顯示較少';
          button.classList.add('expanded');
        } else {
          // 收合評論
          reviewText.classList.remove('review-text-expanded');
          reviewText.classList.add('review-text-collapsed');
          toggleTextSpan.textContent = '...查看更多';
          button.classList.remove('expanded');
        }
      });
    });
  }
}

// 當 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 在 DOMContentLoaded 時創建並保存 RestaurantDetail 實例
  const restaurantDetailInstance = new RestaurantDetail();

  // 初始化登入模態框
  initLoginModals();

  // Initialize menu scroll for popular dishes section
  // Note: The popular dishes section in HTML does not have a specific container class like .popular-dishes around the menu-grid and buttons.
  // We will assume the current structure allows selecting the menu-grid and buttons directly or within the menu-section.
  // A more robust solution would be to wrap popular dishes in a specific container like <div class="popular-dishes-container">.
  // For now, we'll try to select relative to the menu-section or the existing structure.
  
  // Since .popular-dishes class is used on a div wrapping the h3, buttons and menu-grid, we can use it.
  setupMenuScroll('.popular-dishes');

  // Initialize menu scroll for recommended restaurants section
  setupMenuScroll('.recommended-restaurants');

  // Dynamically load and display recommended restaurants
  const loadRecommendedRestaurants = async () => {
    console.log('=== loadRecommendedRestaurants 函數開始執行 ===');
    
    const recommendedCardsContainer = document.querySelector('.recommended-restaurants .menu-grid');
    console.log('推薦餐廳容器:', recommendedCardsContainer);
    
    if (recommendedCardsContainer) {
      // 顯示載入中
      recommendedCardsContainer.innerHTML = '<p>正在載入推薦餐廳...</p>';
      console.log('已設定載入中訊息');
      
      // 直接從 localStorage 讀取當前餐廳資料，不依賴 this
      let currentRestaurant = null;
      try {
        const storedData = localStorage.getItem('selectedRestaurant');
        if (storedData) {
          currentRestaurant = JSON.parse(storedData);
          console.log('從 localStorage 讀取的餐廳資料:', currentRestaurant);
        }
      } catch (error) {
        console.error('讀取 localStorage 失敗:', error);
      }
      
      console.log('當前餐廳資料:', currentRestaurant);
      
      if (currentRestaurant) {
        console.log('準備呼叫 fetchRecommendedRestaurants API...');
        
        try {
          // 呼叫 API 獲取推薦餐廳
          const recommendedRestaurants = await fetchRecommendedRestaurants(currentRestaurant);
          console.log('API 回傳的推薦餐廳:', recommendedRestaurants);
          
          if (recommendedRestaurants && recommendedRestaurants.length > 0) {
            console.log('開始生成推薦餐廳HTML...');
            
            // Generate and insert the HTML for the recommended cards
            let recommendedHtml = '';
            recommendedRestaurants.forEach((restaurant, index) => {
              console.log(`生成第 ${index + 1} 個餐廳卡片:`, restaurant.name);
              recommendedHtml += createRecommendedRestaurantCard(restaurant);
            });
            
            console.log('將HTML插入容器中...');
            recommendedCardsContainer.innerHTML = recommendedHtml;

            // Add click listeners to the newly created cards
            const newRecommendedCards = recommendedCardsContainer.querySelectorAll('.restaurant-card');
            console.log('找到', newRecommendedCards.length, '個餐廳卡片，準備添加點擊事件...');
            
            newRecommendedCards.forEach((card, index) => {
              card.addEventListener('click', (event) => {
                event.preventDefault(); // Prevent default link behavior
                // Use the actual restaurant data for navigation
                if (recommendedRestaurants[index]) {
                  navigateToRecommendedRestaurant(recommendedRestaurants[index]);
                }
              });
            });

            // Update scroll button states after cards are loaded
            setupMenuScroll('.recommended-restaurants');
            console.log('推薦餐廳載入完成！');
            
          } else {
            // 沒有推薦餐廳時顯示訊息
            console.log('沒有推薦餐廳資料');
            recommendedCardsContainer.innerHTML = '<p>目前沒有找到相似的推薦餐廳。</p>';
          }
          
        } catch (error) {
          // 靜默處理API錯誤，只在開發環境顯示詳細錯誤
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn('載入推薦餐廳失敗:', error);
          }
          
          // 提供友善的使用者訊息
          recommendedCardsContainer.innerHTML = `
            <p style="text-align: center; color: #666; padding: 20px;">
              目前無法載入推薦餐廳，請稍後再試。
            </p>
          `;
        }
      } else {
        console.error('無法取得當前餐廳資訊 (localStorage 中沒有資料)');
        // 當無法取得餐廳資訊時，提供fallback內容
        recommendedCardsContainer.innerHTML = `
          <p style="text-align: center; color: #666; padding: 20px;">
            無法載入餐廳資訊，請重新進入頁面。
          </p>
        `;
      }
    } else {
      console.error('找不到推薦餐廳容器 (.recommended-restaurants .menu-grid)');
    }
  };
  
  console.log('準備執行 loadRecommendedRestaurants...');
  // 執行載入推薦餐廳
  loadRecommendedRestaurants();

  // Add functionality for the review modal - MOVED INSIDE DOMContentLoaded
  (function() {
      const reviewBtn = document.querySelector('.action-btn.write-review');
      const reviewModalOverlay = document.querySelector('.review-modal-overlay');
      const closeModalBtn = document.querySelector('.review-modal-content .close-modal');
      const cancelBtn = document.querySelector('.review-modal-content .btn-cancel');
      const submitBtn = document.querySelector('.review-modal-content .btn-submit');
      const ratingStars = document.querySelectorAll('#review-rating .far.fa-star');
      let selectedRating = 0;

      // 靜默處理缺少的評論模態框元素，避免主控台錯誤
      if (!reviewBtn || !reviewModalOverlay || !closeModalBtn || !cancelBtn || !submitBtn || ratingStars.length === 0) {
          // 開發環境下可以顯示詳細錯誤資訊
          if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
              console.warn('評論模態框元素不完整，可能頁面不需要此功能');
              if (!reviewBtn) console.warn('.action-btn.write-review not found');
              if (!reviewModalOverlay) console.warn('.review-modal-overlay not found');
              if (!closeModalBtn) console.warn('.review-modal-content .close-modal not found');
              if (!cancelBtn) console.warn('.review-modal-content .btn-cancel not found');
              if (!submitBtn) console.warn('.review-modal-content .btn-submit not found');
              if (ratingStars.length === 0) console.warn('#review-rating .far.fa-star not found');
          }
          return;
      }

      // Show the modal
      reviewBtn.addEventListener('click', () => {
          reviewModalOverlay.classList.add('visible');
      });

      // Hide the modal
      const hideModal = () => {
          reviewModalOverlay.classList.remove('visible');
          // Reset rating and comment when closing
          resetReviewForm();
      };

      closeModalBtn.addEventListener('click', hideModal);
      cancelBtn.addEventListener('click', hideModal);
      reviewModalOverlay.addEventListener('click', (e) => {
          if (e.target === reviewModalOverlay) {
              hideModal();
          }
      });

      // Prevent clicks inside the modal content from closing the modal
      const modalContent = document.querySelector('.review-modal-content');
      if (modalContent) {
          modalContent.addEventListener('click', (e) => {
              e.stopPropagation();
          });
      }

      // Star rating functionality
      ratingStars.forEach(star => {
          star.addEventListener('click', () => {
              const value = parseInt(star.getAttribute('data-value'));
              selectedRating = value;
              updateStarRating(value);
          });

          star.addEventListener('mouseover', () => {
              updateStarRating(parseInt(star.getAttribute('data-value')), true);
          });

          star.addEventListener('mouseout', () => {
              updateStarRating(selectedRating); // Revert to selected rating on mouseout
          });
      });

      function updateStarRating(value, isHover = false) {
          ratingStars.forEach(star => {
              const starValue = parseInt(star.getAttribute('data-value'));
              if (starValue <= value) {
                  star.classList.remove('far');
                  star.classList.add('fas'); // Filled star
              } else {
                  star.classList.remove('fas');
                  star.classList.add('far'); // Empty star
              }
          });
      }

      // Submit button functionality (placeholder)
      submitBtn.addEventListener('click', () => {
          const commentField = document.getElementById('comment');
          const photoUploadField = document.getElementById('photo-upload');
          
          const reviewContent = commentField ? commentField.value : '';
          const uploadedFiles = photoUploadField ? photoUploadField.files : null;

          console.log('Submitted Review:');
          console.log('Rating:', selectedRating);
          console.log('Comment:', reviewContent);
          console.log('Uploaded Files:', uploadedFiles);

          // TODO: Add actual review submission logic here (e.g., send to backend)

          alert('評論已送出 (功能開發中)');
          hideModal(); // Hide modal after submission (for now)
      });

      // Reset form function
      function resetReviewForm() {
          selectedRating = 0;
          updateStarRating(0);
          const commentField = document.getElementById('comment');
          const photoUploadField = document.getElementById('photo-upload');
          if (commentField) commentField.value = '';
          if (photoUploadField) photoUploadField.value = ''; // Clear file input
      }

  })(); // Self-invoking function MOVED INSIDE

});

// 根據當前餐廳獲取推薦餐廳的API呼叫
async function fetchRecommendedRestaurants(currentRestaurant) {
  console.log('=== 開始載入推薦餐廳 ===');
  console.log('當前餐廳資料:', currentRestaurant);
  
  try {
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 建構查詢參數
    const params = new URLSearchParams();
    params.append('size', '20'); // 獲取更多餐廳以便篩選
    
    // 如果有類型資訊，可以根據類型篩選
    if (currentRestaurant.types) {
      console.log('當前餐廳類型:', currentRestaurant.types);
    }
    
    // 修正API路徑為 /restaurants/list
    const url = `${baseUrl}/restaurants/list?${params.toString()}`;
    console.log('發送推薦餐廳 API 請求到:', url);
    
    const response = await fetch(url);
    console.log('API回應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('API回應資料:', data);
    
    let allRestaurants = [];
    
    // 檢查是否為分頁資料
    if (data.content && Array.isArray(data.content)) {
      allRestaurants = data.content;
      console.log('使用分頁資料，共', allRestaurants.length, '家餐廳');
    } else if (Array.isArray(data)) {
      allRestaurants = data;
      console.log('使用陣列資料，共', allRestaurants.length, '家餐廳');
    } else {
      console.error('未知的資料格式:', data);
      return [];
    }
    
    // 過濾掉當前餐廳
    const filteredRestaurants = allRestaurants.filter(restaurant => {
      const currentId = currentRestaurant.placeId || currentRestaurant.id;
      const restaurantId = restaurant.placeId || restaurant.id;
      return restaurantId !== currentId;
    });
    
    console.log('過濾後的餐廳數量:', filteredRestaurants.length);
    
    // 根據類型、地址和距離進行推薦
    const recommendedRestaurants = getRecommendedRestaurants(currentRestaurant, filteredRestaurants, 5);
    
    console.log('最終推薦餐廳:', recommendedRestaurants);
    return recommendedRestaurants;
    
  } catch (error) {
    console.error('=== 獲取推薦餐廳失敗 ===');
    console.error('錯誤詳情:', error);
    return [];
  }
}

// 根據類型、地址和距離篩選推薦餐廳
function getRecommendedRestaurants(currentRestaurant, allRestaurants, count) {
  if (!allRestaurants || allRestaurants.length === 0) return [];
  
  const currentLat = parseFloat(currentRestaurant.latitude);
  const currentLng = parseFloat(currentRestaurant.longitude);
  const currentAddress = currentRestaurant.address || '';
  const currentTypes = currentRestaurant.types || '';
  
  // 為每個餐廳計算推薦分數
  const scoredRestaurants = allRestaurants.map(restaurant => {
    let score = 0;
    
    // 1. 類型相似度 (40%)
    if (currentTypes && restaurant.types) {
      const currentTypesLower = currentTypes.toLowerCase();
      const restaurantTypesLower = restaurant.types.toLowerCase();
      
      // 簡單的字串匹配檢查
      if (currentTypesLower.includes(restaurantTypesLower) || 
          restaurantTypesLower.includes(currentTypesLower)) {
        score += 40;
      }
    }
    
    // 2. 地址相似度 (30%) - 檢查區域是否相同
    if (currentAddress && restaurant.address) {
      const currentAddressLower = currentAddress.toLowerCase();
      const restaurantAddressLower = restaurant.address.toLowerCase();
      
      // 檢查是否在同一區域 (簡化版)
      const currentDistricts = currentAddressLower.match(/[^\d\s]+區/g) || [];
      const restaurantDistricts = restaurantAddressLower.match(/[^\d\s]+區/g) || [];
      
      if (currentDistricts.length > 0 && restaurantDistricts.length > 0) {
        const hasSameDistrict = currentDistricts.some(district => 
          restaurantDistricts.includes(district)
        );
        if (hasSameDistrict) {
          score += 30;
        }
      }
    }
    
    // 3. 距離相似度 (30%)
    if (!isNaN(currentLat) && !isNaN(currentLng) && 
        restaurant.latitude && restaurant.longitude) {
      const distance = calculateDistance(
        currentLat, currentLng,
        parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)
      );
      
      // 距離越近分數越高 (最大30分，在2公里內)
      if (distance <= 2) {
        score += 30 * (1 - distance / 2);
      }
    }
    
    return {
      ...restaurant,
      recommendScore: score
    };
  });
  
  // 按推薦分數排序，取前 count 個
  const sortedRestaurants = scoredRestaurants
    .sort((a, b) => b.recommendScore - a.recommendScore)
    .slice(0, count);
  
  // 如果推薦分數都很低，就隨機選擇一些餐廳
  if (sortedRestaurants.length < count) {
    const remainingRestaurants = allRestaurants
      .filter(r => !sortedRestaurants.some(sr => 
        (sr.placeId || sr.id) === (r.placeId || r.id)))
      .sort(() => Math.random() - 0.5)
      .slice(0, count - sortedRestaurants.length);
    
    sortedRestaurants.push(...remainingRestaurants);
  }
  
  console.log('推薦餐廳評分結果:', sortedRestaurants.map(r => ({
    name: r.name,
    score: r.recommendScore,
    types: r.types,
    address: r.address
  })));
  
  return sortedRestaurants;
}

// 計算兩點間距離 (公里)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to handle clicking on a recommended restaurant card
function navigateToRecommendedRestaurant(restaurantData) {
  console.log('=== 點擊推薦餐廳卡片 ===');
  console.log('餐廳名稱:', restaurantData.name);
  console.log('點擊前的 restaurant 物件:', restaurantData);
  console.log('點擊前的 googleReviews:', restaurantData.googleReviews);
  
  // 確保 googleReviews 欄位正確帶入 localStorage (與餐廳卡片點擊邏輯一致)
  const restaurantToSave = { ...restaurantData };
  
  // 處理 googleReviews 欄位
  if (typeof restaurantData.googleReviews === 'undefined' || restaurantData.googleReviews === null) {
    console.log('googleReviews 為 undefined 或 null，嘗試使用備用欄位');
    if (typeof restaurantData.google_reviews !== 'undefined' && restaurantData.google_reviews !== null) {
      restaurantToSave.googleReviews = restaurantData.google_reviews;
      console.log('使用 google_reviews 欄位:', restaurantData.google_reviews);
    } else {
      restaurantToSave.googleReviews = []; // 確保不是 null，而是空陣列
      console.log('設定為空陣列');
    }
  } else {
    console.log('googleReviews 已存在，保持原值');
  }
  
  console.log('儲存到 localStorage 的餐廳資料:', restaurantToSave);
  console.log('最終的 googleReviews 內容:', restaurantToSave.googleReviews);
  console.log('=== 儲存完成，準備跳轉 ===');
  
  // 直接存完整物件 (與餐廳卡片點擊邏輯一致)
  localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantToSave));
  // 導頁到餐廳詳情頁面
  window.location.href = 'restaurantListDetail.html';
}

// Function to create HTML for a single recommended restaurant card
function createRecommendedRestaurantCard(restaurant) {
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 圖片來源改為 google_restaurant_photos 的 API
    let photoUrl = baseUrl + '/restaurant-images/' + (restaurant.placeId || restaurant.place_id || restaurant.id) + '/raw';
    
    // 獲取評分和評論數，優先使用 averageRating 和 reviewCount
    const rating = restaurant.averageRating || restaurant.rating || 0;
    const reviewCount = restaurant.reviewCount || restaurant.ratingCount || restaurant.user_ratings_total || 0;

    return `
        <a href="#" class="menu-item restaurant-card v3">
          <div class="menu-item-image">
            <img src="${photoUrl}" alt="${restaurant.name}" onerror="this.src='images/default-restaurant.jpg'">
          </div>
          <div class="menu-item-info">
            <h4 class="restaurant-name">${restaurant.name}</h4>
            <div class="restaurant-rating">
              <span class="rating-score">${rating ? rating.toFixed(1) : 'N/A'}</span>
              <span class="review-count">(${reviewCount || 0} 則評論)</span>
            </div>
          </div>
        </a>
    `;
}

// Update setupMenuScroll to handle multiple scrollable sections
function setupMenuScroll(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const menuGrid = container.querySelector('.menu-grid');
    const prevBtn = container.querySelector('.menu-scroll-btn.prev');
    const nextBtn = container.querySelector('.menu-scroll-btn.next');
    
    if (!menuGrid || !prevBtn || !nextBtn) return;

    const scrollAmount = 220; // 每次滾動的距離（卡片寬度 + 間距）

    // 更新按鈕狀態
    const updateButtonStates = () => {
      prevBtn.disabled = menuGrid.scrollLeft <= 0;
      nextBtn.disabled = menuGrid.scrollLeft + menuGrid.clientWidth >= menuGrid.scrollWidth -1; // Subtract 1 to account for potential floating point issues
    };

    // 滾動到指定位置
    const scrollTo = (position) => {
      menuGrid.scrollTo({
        left: position,
        behavior: 'smooth'
      });
    };

    // 左滾動按鈕點擊事件
    prevBtn.addEventListener('click', () => {
      const newPosition = Math.max(0, menuGrid.scrollLeft - scrollAmount);
      scrollTo(newPosition);
    });

    // 右滾動按鈕點擊事件
    nextBtn.addEventListener('click', () => {
      const newPosition = Math.min(
        menuGrid.scrollWidth - menuGrid.clientWidth,
        menuGrid.scrollLeft + scrollAmount
      );
      scrollTo(newPosition);
    });

    // 監聽滾動事件更新按鈕狀態
    menuGrid.addEventListener('scroll', updateButtonStates);

    // 監聽視窗大小變化
    window.addEventListener('resize', updateButtonStates);

    // 初始化按鈕狀態
    updateButtonStates();
}

// 處理寫評論按鈕點擊
function handleWriteReview() {
    // 檢查是否已登入
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // 顯示請先登入的 alert 訊息，並引導到登入頁面
        const confirmLogin = confirm('請先登入會員才能寫評論。\n\n點擊「確定」前往登入頁面，點擊「取消」返回。');
        if (confirmLogin) {
            // 儲存當前餐廳資訊，以便登入後回來寫評論
            const restaurantName = document.querySelector('.restaurant-name')?.textContent || '';
            const restaurantId = new URLSearchParams(window.location.search).get('id') || '';
            
            localStorage.setItem('restaurant_id', restaurantId);
            localStorage.setItem('restaurant_name', restaurantName);
            localStorage.setItem('returnToWriteReview', 'true');
            
            // 跳轉到登入頁面
            window.location.href = 'userRegister.html';
        }
    } else {
        // 已登入，獲取當前餐廳資訊並跳轉
        const restaurantName = document.querySelector('.restaurant-name')?.textContent || '';
        const restaurantId = new URLSearchParams(window.location.search).get('id') || '';
        
        // 將餐廳資訊存儲到 localStorage
        localStorage.setItem('restaurant_id', restaurantId);
        localStorage.setItem('restaurant_name', restaurantName);
        
        // 跳轉到寫評論頁面
        window.location.href = 'writeComment.html';
    }
}

// 商家登入相關函數已移除 - 重新導向到相應頁面

// 初始化登入模態框
function initLoginModals() {
  // 登入按鈕點擊事件 - 重新導向到登入頁面
  const loginBtn = document.querySelector('.btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = 'userRegister.html';
    });
  }

  // 商家登入相關功能已移除
  console.log('登入模態框功能已簡化 - 重新導向到登入頁面');
}

// 路線規劃功能
function initDirectionsModal() {
  const directionsBtn = document.querySelector('.directions-btn');
  const directionsModal = document.getElementById('directionsModal');
  const cancelBtn = document.querySelector('.directions-btn-cancel');
  const confirmBtn = document.querySelector('.directions-btn-confirm');
  const startAddressInput = document.getElementById('startAddress');

  if (!directionsBtn || !directionsModal || !cancelBtn || !confirmBtn || !startAddressInput) {
    console.warn('路線規劃元素未找到');
    return;
  }

  // 點擊查看路線按鈕
  directionsBtn.addEventListener('click', function(event) {
    event.preventDefault();
    console.log('開啟路線規劃彈出視窗');
    directionsModal.style.display = 'flex';
    setTimeout(() => {
      directionsModal.classList.add('show');
    }, 10);
    
    // 自動聚焦到輸入框
    startAddressInput.focus();
  });

  // 點擊取消按鈕
  cancelBtn.addEventListener('click', function() {
    console.log('取消路線規劃');
    closeDirectionsModal();
  });

  // 點擊確認按鈕
  confirmBtn.addEventListener('click', function() {
    const startAddress = startAddressInput.value.trim();
    
    if (!startAddress) {
      alert('請輸入出發地址');
      startAddressInput.focus();
      return;
    }

    console.log('開始路線規劃，起始地址:', startAddress);
    openGoogleMapsDirections(startAddress);
    closeDirectionsModal();
  });

  // 按 Enter 鍵確認
  startAddressInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
      confirmBtn.click();
    }
  });

  // 點擊背景關閉彈出視窗
  directionsModal.addEventListener('click', function(event) {
    if (event.target === directionsModal) {
      closeDirectionsModal();
    }
  });

  // 關閉彈出視窗函數
  function closeDirectionsModal() {
    directionsModal.classList.remove('show');
    setTimeout(() => {
      directionsModal.style.display = 'none';
      startAddressInput.value = ''; // 清空輸入框
    }, 300);
  }

  // 開啟 Google Maps 路線規劃
  function openGoogleMapsDirections(startAddress) {
    // 獲取目標餐廳地址
    const restaurantAddress = document.querySelector('.map-section .address')?.textContent?.trim() || '';
    
    if (!restaurantAddress) {
      alert('餐廳地址資訊不完整');
      return;
    }

    // 構建 Google Maps 路線規劃 URL
    const encodedStart = encodeURIComponent(startAddress);
    const encodedDestination = encodeURIComponent(restaurantAddress);
    const googleMapsUrl = `https://www.google.com/maps/dir/${encodedStart}/${encodedDestination}`;
    
    console.log('開啟 Google Maps 路線規劃:', googleMapsUrl);
    console.log('起始地址:', startAddress);
    console.log('目標地址:', restaurantAddress);
    
    // 在新視窗開啟 Google Maps
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  }
} 