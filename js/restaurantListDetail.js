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
    this.setupMap();
    this.setupFullMenuButton();
    this.setupShareModal();
  }

  init() {
    // 從 URL 獲取餐廳資料
    this.getRestaurantDataFromUrl();
    // 更新頁面資訊
    this.updatePageInfo();
    // 初始化輪播圖
    new RestaurantCarousel(this.restaurantData);
    // 地圖初始化將在 initMap 回調中，通過調用 initMapInDetail 處理
  }

  // 預設餐廳資料
  getDefaultRestaurantData() {
    // 根據餐廳類型獲取相應的圖片
    const images = this.getImagesByType(this.restaurantData?.tags?.[0] || '中式');

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
      businessHours: '11:00 - 22:00'
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
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantData = urlParams.get('data');
    
    if (restaurantData) {
      try {
        this.restaurantData = JSON.parse(decodeURIComponent(restaurantData));
        // 確保 ratingCount 存在
        if (!this.restaurantData.ratingCount) {
          this.restaurantData.ratingCount = 0;
        }
        // 根據餐廳類型設置圖片
        if (!this.restaurantData.images) {
          this.restaurantData.images = this.getImagesByType(this.restaurantData.tags?.[0] || '中式');
        }
      } catch (error) {
        console.error('解析餐廳資料失敗:', error);
        // 如果解析失敗，使用預設資料
        this.restaurantData = this.getDefaultRestaurantData();
      }
    } else {
      // 如果沒有資料，使用預設資料
      this.restaurantData = this.getDefaultRestaurantData();
    }
  }

  // 更新頁面資訊
  updatePageInfo() {
    // 更新餐廳名稱
    document.querySelector('.restaurant-name').textContent = this.restaurantData.name;

    // 更新評分和評論數
    const ratingScore = document.querySelector('.rating-score');
    const reviewCount = document.querySelector('.review-count');
    ratingScore.textContent = this.restaurantData.rating;
    // 確保評論數顯示正確
    const count = this.restaurantData.ratingCount || 0;
    reviewCount.textContent = `${count} 則評論`;

    // 更新認證標籤
    const verifiedBadge = document.querySelector('.verified-badge');
    verifiedBadge.style.display = this.restaurantData.isVerified ? 'flex' : 'none';

    // 更新價格範圍和標籤
    const price = document.querySelector('.price');
    const tags = document.querySelector('.tags');
    price.textContent = this.restaurantData.priceRange || this.restaurantData.price;
    tags.textContent = this.restaurantData.tags.join(', ');

    // 更新營業狀態
    const status = document.querySelector('.status');
    const hours = document.querySelector('.hours');
    status.textContent = this.restaurantData.isOpen ? '營業中' : '休息中';
    status.className = `status ${this.restaurantData.isOpen ? 'open' : 'closed'}`;
    hours.textContent = this.restaurantData.businessHours;
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
        console.log('收藏餐廳:', this.restaurantData.name);
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        // TODO: 實現取消收藏功能
        console.log('取消收藏餐廳:', this.restaurantData.name);
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

  setupMap() {
    // 這個方法不再直接初始化地圖，而是等待 initMap 調用
    // 這裡可以放置一些準備工作，如果需要的話
  }

  // 在 RestaurantDetail 內部初始化地圖的方法
  async initMapInDetail() {
    // 檢查是否有位置資訊
    if (!this.restaurantData || !this.restaurantData.location) {
      console.error('無法獲取餐廳位置資訊');
      return;
    }

    const { lat, lng } = this.restaurantData.location;
    const center = { lat: lat, lng: lng };

    // 創建地圖實例
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      console.error('找不到地圖容器元素');
      return;
    }

    const map = new google.maps.Map(mapElement, {
      zoom: 15,
      center: center,
      mapTypeControl: false, // 隱藏地圖類型控制項
      streetViewControl: false, // 隱藏街景控制項
      fullscreenControl: false // 隱藏全螢幕控制項
    });

    // 在餐廳位置添加標記
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    const markerContent = document.createElement('div');
    markerContent.className = 'restaurant-pin';
    markerContent.style.cssText = `
        background-color: #FF6B1A;
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        position: relative;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    const icon = document.createElement('div');
    icon.innerHTML = '🍽️';
    icon.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(45deg);
        font-size: 12px;
    `;

    markerContent.appendChild(icon);

    new AdvancedMarkerElement({
      map: map,
      position: center,
      title: this.restaurantData.name,
      content: markerContent
    });

    // 設置路線按鈕點擊事件 (保留在地圖初始化後設置)
    const directionsBtn = document.querySelector('.directions-btn');
    if (directionsBtn && this.restaurantData.location) {
      directionsBtn.addEventListener('click', () => {
        const { lat, lng } = this.restaurantData.location;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(directionsUrl, '_blank');
      });
    }

    // 更新地圖資訊 (地址和營業時間) - 確保在獲取資料後更新
    const address = document.querySelector('.address');
    const businessHours = document.querySelector('.business-hours');

    if (address) {
      address.innerHTML = `<i class="fas fa-map-marker-alt"></i>${this.restaurantData.address || '地址資訊未提供'}`;
    }

    if (businessHours) {
      businessHours.innerHTML = `<i class="far fa-clock"></i>營業時間：${this.restaurantData.businessHours || '營業時間未提供'}`;
    }
  }

  // 設置分享彈出視窗功能
  setupShareModal() {
    const shareBtn = document.querySelector('.action-btn.share');
    const shareModalOverlay = document.querySelector('.share-modal-overlay');
    const closeModalBtn = document.querySelector('.close-modal');
    const shareLinkInput = document.querySelector('.share-link-input');
    const copyLinkBtn = document.querySelector('.copy-link-btn');
    const shareTitle = document.querySelector('.share-modal-content h2');
    const shareIcons = document.querySelectorAll('.share-options .share-icon');

    if (!shareBtn || !shareModalOverlay || !closeModalBtn || !shareLinkInput || !copyLinkBtn || !shareTitle || shareIcons.length === 0) {
      console.error('分享彈出視窗相關元素未找到');
      return;
    }

    // 顯示彈出視窗
    shareBtn.addEventListener('click', () => {
      // 更新分享連結和標題
      const currentUrl = window.location.href;
      shareLinkInput.value = currentUrl; // 暫時使用當前頁面 URL 作為分享連結
      if (this.restaurantData) {
         shareTitle.textContent = `分享 ${this.restaurantData.name || '這家餐廳'}`; // 更新標題
      }
     
      shareModalOverlay.classList.add('visible');
    });

    // 隱藏彈出視窗
    const hideModal = () => {
      shareModalOverlay.classList.remove('visible');
    };

    closeModalBtn.addEventListener('click', hideModal);
    shareModalOverlay.addEventListener('click', (e) => {
      // 如果點擊的是覆蓋層本身，則關閉視窗
      if (e.target === shareModalOverlay) {
        hideModal();
      }
    });

    // 阻止點擊內容區關閉視窗
    document.querySelector('.share-modal-content').addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 複製連結功能
    copyLinkBtn.addEventListener('click', () => {
      shareLinkInput.select();
      shareLinkInput.setSelectionRange(0, 99999); // for mobile devices
      navigator.clipboard.writeText(shareLinkInput.value)
        .then(() => {
          alert('連結已複製到剪貼簿！');
        })
        .catch(err => {
          console.error('複製連結失敗:', err);
          alert('複製連結失敗！');
        });
    });

    // 分享圖標點擊事件 (佔位符)
    shareIcons.forEach(icon => {
      icon.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止預設跳轉
        const platform = icon.getAttribute('aria-label').replace('分享到 ', '');
        alert(`即將分享到 ${platform} (功能開發中...)`);
        // TODO: 實現實際的分享功能，可能需要根據不同平台構建分享連結或調用相應的 SDK
        // 隱藏小視窗
        hideModal();
      });
    });
  }
}

// Google Maps JavaScript API 回調函數
// 這個函數會在 Google Maps API 腳本載入完成後自動執行
let restaurantDetailInstance = null; // 定義一個變數來保存 RestaurantDetail 實例

window.initMap = function() {
  // 在 DOMContentLoaded 中已經創建了 RestaurantDetail 實例
  // 在這裡呼叫它的地圖初始化方法
  if (restaurantDetailInstance) {
    restaurantDetailInstance.initMapInDetail();
  } else {
    console.error('RestaurantDetail 實例未準備好，無法初始化地圖。');
  }
};

// 當 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // 在 DOMContentLoaded 時創建並保存 RestaurantDetail 實例
  restaurantDetailInstance = new RestaurantDetail();

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
        <a href="#" class="menu-item restaurant-card">
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