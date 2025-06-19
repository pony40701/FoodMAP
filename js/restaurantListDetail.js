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
  }

  init() {
    this.getRestaurantDataFromUrl();
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
    const imageSets = {
      '中式': [
        {
          url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3',
          alt: '中式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?ixlib=rb-4.0.3',
          alt: '中式料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '中式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '中式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3',
          alt: '中式餐廳包廂'
        }
      ],
      '日式': [
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '日式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3',
          alt: '日式料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '日式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '日式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '日式餐廳包廂'
        }
      ],
      '火鍋': [
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3',
          alt: '火鍋餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3',
          alt: '火鍋料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3',
          alt: '火鍋餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3',
          alt: '火鍋餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3',
          alt: '火鍋餐廳包廂'
        }
      ],
      '咖啡廳': [
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '咖啡廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '咖啡特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '咖啡廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '咖啡廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3',
          alt: '咖啡廳戶外區'
        }
      ],
      '牛排': [
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3',
          alt: '牛排餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3',
          alt: '牛排特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3',
          alt: '牛排餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3',
          alt: '牛排餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3',
          alt: '牛排餐廳包廂'
        }
      ],
      '美式': [
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '美式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '美式料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '美式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '美式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '美式餐廳戶外區'
        }
      ],
      '韓式': [
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '韓式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '韓式料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '韓式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '韓式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '韓式餐廳包廂'
        }
      ],
      '泰式': [
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '泰式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '泰式料理特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '泰式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '泰式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '泰式餐廳戶外區'
        }
      ],
      '港式': [
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '港式餐廳環境'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '港式點心特寫'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '港式餐廳用餐區'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '港式餐廳吧台'
        },
        {
          url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?ixlib=rb-4.0.3',
          alt: '港式餐廳包廂'
        }
      ]
    };

    // 如果找不到對應的類型，返回中式餐廳的圖片
    return imageSets[type] || imageSets['中式'];
  }

  // 從 URL 獲取餐廳資料
  getRestaurantDataFromUrl() {
    // 優先從 localStorage 讀取餐廳資料
    const storedRestaurantData = localStorage.getItem('selectedRestaurant');
    
    if (storedRestaurantData) {
      try {
        this.restaurantData = JSON.parse(storedRestaurantData);
        console.log('從 localStorage 成功讀取餐廳資料:', this.restaurantData);
        console.log('localStorage 中的 googleReviews:', this.restaurantData.googleReviews);
        
        // 清除 localStorage 中的資料，避免重複使用
        localStorage.removeItem('selectedRestaurant');
        
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
    
    // 如果 localStorage 沒有資料，嘗試從 URL 讀取
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantData = urlParams.get('data');
    
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
      } catch (error) {
        console.error('解析 URL 餐廳資料失敗:', error);
        // 如果解析失敗，使用預設資料
        this.restaurantData = this.getDefaultRestaurantData();
      }
    } else {
      // 如果沒有資料，使用預設資料
      console.log('沒有找到餐廳資料，使用預設資料');
      this.restaurantData = this.getDefaultRestaurantData();
    }
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
    googleReviews.forEach(review => {
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
            <p class="review-text">${review.text || '無評論內容'}</p>
          </div>
        </div>
      `;
    });

    // 插入評論 HTML
    reviewsContainer.innerHTML = reviewsHtml;
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
  const recommendedCardsContainer = document.querySelector('.recommended-restaurants .menu-grid');
  
  // Check if fullRestaurantData is available and the container exists
  if (recommendedCardsContainer && window.fullRestaurantData && window.fullRestaurantData.length > 0) {
    // Select 6 random restaurants
    const recommendedRestaurants = selectRandomRestaurants(window.fullRestaurantData, 6);
    
    // Generate and insert the HTML for the recommended cards
    let recommendedHtml = '';
    recommendedRestaurants.forEach(restaurant => {
      recommendedHtml += createRecommendedRestaurantCard(restaurant);
    });
    recommendedCardsContainer.innerHTML = recommendedHtml;

    // Add click listeners to the newly created cards
    const newRecommendedCards = recommendedCardsContainer.querySelectorAll('.restaurant-card');
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
     // We need to ensure setupMenuScroll is called *after* cards are added
     // The previous call to setupMenuScroll('.recommended-restaurants') might be too early.
     // Let's re-call it here to be safe.
     setupMenuScroll('.recommended-restaurants');

  } else if (recommendedCardsContainer) {
      // Display a message if no recommended restaurants are available
      recommendedCardsContainer.innerHTML = '<p>目前沒有推薦的店家。</p>';
  }

  // Add functionality for the review modal - MOVED INSIDE DOMContentLoaded
  (function() {
      const reviewBtn = document.querySelector('.action-btn.write-review');
      const reviewModalOverlay = document.querySelector('.review-modal-overlay');
      const closeModalBtn = document.querySelector('.review-modal-content .close-modal');
      const cancelBtn = document.querySelector('.review-modal-content .btn-cancel');
      const submitBtn = document.querySelector('.review-modal-content .btn-submit');
      const ratingStars = document.querySelectorAll('#review-rating .far.fa-star');
      let selectedRating = 0;

      if (!reviewBtn || !reviewModalOverlay || !closeModalBtn || !cancelBtn || !submitBtn || ratingStars.length === 0) {
          console.error('Review modal related elements not found');
          // Optionally log which element was not found for debugging
          if (!reviewBtn) console.error('.action-btn.write-review not found');
          if (!reviewModalOverlay) console.error('.review-modal-overlay not found');
          if (!closeModalBtn) console.error('.review-modal-content .close-modal not found');
          if (!cancelBtn) console.error('.review-modal-content .btn-cancel not found');
          if (!submitBtn) console.error('.review-modal-content .btn-submit not found');
          if (ratingStars.length === 0) console.error('#review-rating .far.fa-star not found');
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
      document.querySelector('.review-modal-content').addEventListener('click', (e) => {
          e.stopPropagation();
      });

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
          const reviewContent = document.getElementById('comment').value;
          const uploadedFiles = document.getElementById('photo-upload').files;

          ('Submitted Review:');
          ('Rating:', selectedRating);
          ('Comment:', reviewContent);
          ('Uploaded Files:', uploadedFiles);

          // TODO: Add actual review submission logic here (e.g., send to backend)

          alert('評論已送出 (功能開發中)');
          hideModal(); // Hide modal after submission (for now)
      });

      // Reset form function
      function resetReviewForm() {
          selectedRating = 0;
          updateStarRating(0);
          document.getElementById('comment').value = '';
          document.getElementById('photo-upload').value = ''; // Clear file input
      }

  })(); // Self-invoking function MOVED INSIDE

});

// Function to handle clicking on a recommended restaurant card
function navigateToRecommendedRestaurant(restaurantData) {
  // Encode the restaurant data as a JSON string and pass it as a URL parameter
  const encodedData = encodeURIComponent(JSON.stringify(restaurantData));
  window.location.href = `restaurantListDetail.html?data=${encodedData}`;
}

// Fisher-Yates (aka Knuth) Shuffle algorithm
function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Select N random restaurants
function selectRandomRestaurants(data, count) {
    if (!data || data.length === 0) return [];
    // Shuffle a copy of the array and take the first 'count' elements
    const shuffled = shuffleArray([...data]);
    return shuffled.slice(0, count);
}

// Function to create HTML for a single recommended restaurant card
function createRecommendedRestaurantCard(restaurant) {
    // Ensure tags is an array
    const tags = Array.isArray(restaurant.tags) ? restaurant.tags : (restaurant.tags ? restaurant.tags.split(',').map(tag => tag.trim()) : []);

    return `
        <a href="#" class="menu-item restaurant-card v3">
          <div class="menu-item-image">
            <img src="${restaurant.image}" alt="${restaurant.name}" onerror="this.src='https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'">
            <!-- Photo count from restaurantData is not available, so we omit it or use a placeholder -->
          </div>
          <div class="menu-item-info">
            <h4 class="restaurant-name">${restaurant.name}</h4>
            <div class="restaurant-rating">
              <!-- <i class="fas fa-star"></i> -->
              <span>${restaurant.rating ? restaurant.rating.toFixed(1) : 'N/A'}</span>
              ${restaurant.ratingCount ? `<span class="review-count">(${restaurant.ratingCount} 則評論)</span>` : ''}
            </div>
            <p class="restaurant-tags">${tags.join(', ') || '未分類'}</p>
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