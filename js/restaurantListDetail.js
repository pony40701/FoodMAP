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
    this.updatePageInfo();
    new RestaurantCarousel(this.restaurantData);

    // *** 重要修復：設置操作按鈕功能（包括收藏按鈕） ***
    this.setupActionButtons();

    // Leaflet 地圖初始化，只顯示單一餐廳 marker
    const lat = this.restaurantData.latitude;
    const lng = this.restaurantData.longitude;
    if (lat && lng && window.L) {
      const map = L.map('map').setView([lat, lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
    }

    this.renderGoogleReviews();
    
    // 加入頁面保護機制，防止重新整理時資料丟失
    this.setupPageProtection();
    
    // 在餐廳資料載入完成後載入推薦餐廳
    this.loadRecommendedRestaurants();
  }
  
  // 載入推薦餐廳
  async loadRecommendedRestaurants() {
    console.log('=== RestaurantDetail.loadRecommendedRestaurants 開始執行 ===');
    
    const recommendedCardsContainer = document.querySelector('.recommended-restaurants .menu-grid');
    
    if (!recommendedCardsContainer) {
      console.error('找不到推薦餐廳容器 (.recommended-restaurants .menu-grid)');
      return;
    }
    
    // 顯示載入中
    recommendedCardsContainer.innerHTML = '<p>正在載入推薦餐廳...</p>';
    
    // 使用已載入的餐廳資料
    if (!this.restaurantData || this.restaurantData.name === '示例餐廳') {
      console.error('沒有有效的餐廳資料來載入推薦餐廳');
      recommendedCardsContainer.innerHTML = `
        <p style="text-align: center; color: #666; padding: 20px;">
          無法載入餐廳資訊，請重新進入頁面。
        </p>
      `;
      return;
    }
    
    console.log('使用餐廳資料載入推薦:', this.restaurantData.name);
    
    try {
      // 呼叫 API 獲取推薦餐廳
      const recommendedRestaurants = await fetchRecommendedRestaurants(this.restaurantData);
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
            event.preventDefault();
            if (recommendedRestaurants[index]) {
              navigateToRecommendedRestaurant(recommendedRestaurants[index]);
            }
          });
        });

        // Update scroll button states after cards are loaded
        setupMenuScroll('.recommended-restaurants');
        console.log('推薦餐廳載入完成！');
        
      } else {
        console.log('沒有推薦餐廳資料');
        recommendedCardsContainer.innerHTML = '<p>目前沒有找到相似的推薦餐廳。</p>';
      }
      
    } catch (error) {
      console.warn('載入推薦餐廳失敗:', error);
      recommendedCardsContainer.innerHTML = `
        <p style="text-align: center; color: #666; padding: 20px;">
          目前無法載入推薦餐廳，請稍後再試。
        </p>
      `;
    }
  }
  
  // 設置頁面保護機制
  setupPageProtection() {
    // 每次資料更新時都保存到 sessionStorage
    const saveCurrentData = () => {
      if (this.restaurantData && this.restaurantData.name && this.restaurantData.name !== '示例餐廳') {
        sessionStorage.setItem('currentRestaurantData', JSON.stringify(this.restaurantData));
        console.log('餐廳資料已保存到 sessionStorage:', this.restaurantData.name);
      }
    };
    
    // 監聽頁面離開事件
    window.addEventListener('beforeunload', (event) => {
      saveCurrentData();
    });
    
    // 監聽頁面隱藏事件（用戶切換分頁或最小化視窗）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        saveCurrentData();
      }
    });
    
    // 監聽 popstate 事件（用戶按上一頁/下一頁）
    window.addEventListener('popstate', () => {
      saveCurrentData();
    });
    
    // 立即保存當前資料
    saveCurrentData();
    
    console.log('頁面保護機制已設置');
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
    console.log('=== 開始載入餐廳資料 ===');
    
    // 獲取 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    const currentUrlRestaurantId = urlParams.get('restaurantId');
    const currentUrlRestaurantData = urlParams.get('data');
    
    // *** 重要修復：如果 URL 有參數，直接清除所有 sessionStorage 快取 ***
    if (currentUrlRestaurantId || currentUrlRestaurantData) {
      console.log('URL 包含餐廳參數，清除所有快取以確保載入新資料');
      sessionStorage.removeItem('currentRestaurantData');
      sessionStorage.removeItem('restaurantDetailReturnData');
      sessionStorage.removeItem('menuDetailBackupData');
      sessionStorage.removeItem('restaurantDetailPageState');
    }
    
    // 1. *** 優先處理 URL 參數（最高優先級）***
    const restaurantId = currentUrlRestaurantId;
    const restaurantData = currentUrlRestaurantData;
    
    // 如果有餐廳 ID，從 API 獲取資料
    if (restaurantId) {
      try {
        console.log('從 API 載入餐廳資料，ID:', restaurantId);
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`);
        if (response.ok) {
          const apiData = await response.json();
          this.restaurantData = this.transformApiData(apiData);
          
          // 保存到 sessionStorage 備份
          sessionStorage.setItem('currentRestaurantData', JSON.stringify(this.restaurantData));
          console.log('API 資料載入成功:', this.restaurantData.name);
          return;
        }
      } catch (error) {
        console.warn('API 載入失敗:', error);
      }
    }
    
    // 2. 如果有 data 參數，解析 URL 中的資料
    if (restaurantData) {
      try {
        console.log('從 URL 參數載入餐廳資料');
        this.restaurantData = JSON.parse(decodeURIComponent(restaurantData));
        
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
        
        // 保存到 sessionStorage 備份
        sessionStorage.setItem('currentRestaurantData', JSON.stringify(this.restaurantData));
        console.log('URL 參數資料載入成功:', this.restaurantData.name);
        return;
      } catch (error) {
        console.warn('URL 參數解析失敗:', error);
      }
    }
    
    // 3. 沒有 URL 參數時，檢查 sessionStorage（用於頁面重新整理的情況）
    if (!restaurantId && !restaurantData) {
      const sessionRestaurantData = sessionStorage.getItem('currentRestaurantData');
      if (sessionRestaurantData) {
        try {
          console.log('從 sessionStorage 載入餐廳資料（無 URL 參數）');
          this.restaurantData = JSON.parse(sessionRestaurantData);
          console.log('sessionStorage 資料載入成功:', this.restaurantData.name);
          return;
        } catch (error) {
          console.warn('sessionStorage 資料解析失敗:', error);
          sessionStorage.removeItem('currentRestaurantData');
        }
      }
    }
    
    // 4. 從 localStorage 讀取餐廳資料（向下相容性考慮）
    const storedRestaurantData = localStorage.getItem('selectedRestaurant');
    if (storedRestaurantData) {
      try {
        console.log('從 localStorage 載入餐廳資料');
        this.restaurantData = JSON.parse(storedRestaurantData);
        
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
        
        // 保存到 sessionStorage 備份
        sessionStorage.setItem('currentRestaurantData', JSON.stringify(this.restaurantData));
        console.log('localStorage 資料載入成功:', this.restaurantData.name);
        return;
      } catch (error) {
        console.warn('localStorage 資料解析失敗:', error);
        localStorage.removeItem('selectedRestaurant');
      }
    }
    
    // 5. 如果沒有任何資料，使用預設資料
    console.warn('沒有找到任何餐廳資料，使用預設資料');
    this.restaurantData = this.getDefaultRestaurantData();
    
    // 即使是預設資料也要保存，避免重複載入
    sessionStorage.setItem('currentRestaurantData', JSON.stringify(this.restaurantData));
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
    console.log('=== setupActionButtons 開始執行 ===');
    console.log('當前餐廳資料:', this.restaurantData);
    
    // 收藏按鈕
    const saveBtn = document.querySelector('.action-btn.save');
    if (saveBtn) {
      // 設置餐廳ID到按鈕的data屬性
      if (this.restaurantData) {
        const placeId = this.restaurantData.place_id || this.restaurantData.placeId || this.restaurantData.id;
        console.log('提取到的 placeId:', placeId);
        if (placeId) {
          saveBtn.setAttribute('data-place-id', placeId);
          console.log('收藏按鈕 data-place-id 已設置為:', placeId);
        } else {
          console.warn('無法從餐廳資料中取得有效的 placeId');
        }
      } else {
        console.warn('餐廳資料為空，無法設置收藏按鈕 ID');
      }
      
      // 初始化收藏狀態
      this.updateFavoriteButtonState(saveBtn);
      
      // 添加點擊事件
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 檢查登錄狀態
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
          showToast('請先登入會員才能使用收藏功能');
          return;
        }
        
        try {
          // 獲取餐廳資料
          const placeId = saveBtn.getAttribute('data-place-id');
          console.log('收藏按鈕點擊，檢查 data-place-id:', placeId);
          console.log('當前餐廳資料:', this.restaurantData);
          
          if (!placeId) {
            console.error('收藏按鈕的 data-place-id 屬性為空');
            
            // 嘗試從當前餐廳資料中獲取 ID（防止無限遞歸）
            if (!saveBtn.hasAttribute('data-fallback-attempted')) {
              const fallbackId = this.restaurantData?.place_id || this.restaurantData?.placeId || this.restaurantData?.id;
              if (fallbackId) {
                console.log('嘗試使用後備 ID:', fallbackId);
                saveBtn.setAttribute('data-place-id', fallbackId);
                saveBtn.setAttribute('data-fallback-attempted', 'true');
                
                // 直接繼續處理收藏邏輯，不遞歸調用
                const actualPlaceId = fallbackId;
                
                // 初始化收藏系統
                if (!window.favoriteSystem) {
                  window.favoriteSystem = new FavoriteSystem();
                }
                await window.favoriteSystem.initialize();
                
                // 重新執行收藏邏輯
                console.log('後備邏輯：檢查收藏狀態，actualPlaceId:', actualPlaceId);
                const isCurrentlyFavorited = await window.favoriteSystem.isStoreFavorited(actualPlaceId);
                console.log('後備邏輯：當前收藏狀態:', isCurrentlyFavorited);
                const icon = saveBtn.querySelector('i');
                
                if (isCurrentlyFavorited) {
                  // 移除收藏
                  console.log('後備邏輯：執行移除收藏操作...');
                  const success = await window.favoriteSystem.removeStore(actualPlaceId);
                  console.log('後備邏輯：移除收藏結果:', success);
                  if (success) {
                    saveBtn.classList.remove('active');
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    saveBtn.style.color = '';
                    showToast('已從收藏中移除');
                  } else {
                    showToast('無法從收藏中移除，請稍後再試');
                  }
                } else {
                  // 添加收藏
                  console.log('後備邏輯：執行加入收藏操作...');
                  const restaurantData = {
                    place_id: actualPlaceId,
                    name: this.restaurantData.name || '未知餐廳',
                    photos: this.restaurantData.photos || null
                  };
                  console.log('後備邏輯：準備加入的餐廳資料:', restaurantData);
                  
                  const success = await window.favoriteSystem.addStore(restaurantData);
                  console.log('後備邏輯：加入收藏結果:', success);
                  if (success) {
                    saveBtn.classList.add('active');
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    saveBtn.style.color = '#ff6b1a';
                    showToast('已加入收藏');
                  } else {
                    showToast('無法加入收藏，請稍後再試');
                  }
                }
                return;
              }
            }
            
            showToast('無法獲取餐廳資訊，請重新整理頁面後再試');
            return;
          }
          
          // 初始化收藏系統
          if (!window.favoriteSystem) {
            window.favoriteSystem = new FavoriteSystem();
          }
          await window.favoriteSystem.initialize();
          
          // 檢查當前收藏狀態
          console.log('檢查收藏狀態，placeId:', placeId);
          const isCurrentlyFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
          console.log('當前收藏狀態:', isCurrentlyFavorited);
          const icon = saveBtn.querySelector('i');
          
          if (isCurrentlyFavorited) {
            // 移除收藏
            console.log('執行移除收藏操作...');
            const success = await window.favoriteSystem.removeStore(placeId);
            console.log('移除收藏結果:', success);
            if (success) {
              saveBtn.classList.remove('active');
              icon.classList.remove('fas');
              icon.classList.add('far');
              saveBtn.style.color = '';
              showToast('已從收藏中移除');
            } else {
              showToast('無法從收藏中移除，請稍後再試');
            }
          } else {
            // 添加收藏
            console.log('執行加入收藏操作...');
            const restaurantData = {
              place_id: placeId,
              name: this.restaurantData.name || '未知餐廳',
              photos: this.restaurantData.photos || null
            };
            console.log('準備加入的餐廳資料:', restaurantData);
            
            const success = await window.favoriteSystem.addStore(restaurantData);
            console.log('加入收藏結果:', success);
            if (success) {
              saveBtn.classList.add('active');
              icon.classList.remove('far');
              icon.classList.add('fas');
              saveBtn.style.color = '#ff6b1a';
              showToast('已加入收藏');
            } else {
              showToast('無法加入收藏，請稍後再試');
            }
          }
        } catch (error) {
          console.error('收藏操作失敗:', error);
          showToast('收藏功能暫時無法使用，請稍後再試');
        }
      });
    }

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

  // 更新收藏按鈕狀態
  async updateFavoriteButtonState(button) {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        return; // 未登入時不需要檢查收藏狀態
      }
      
      const placeId = button.getAttribute('data-place-id');
      if (!placeId) {
        return;
      }
      
      // 初始化收藏系統
      if (!window.favoriteSystem) {
        window.favoriteSystem = new FavoriteSystem();
      }
      await window.favoriteSystem.initialize();
      
      // 檢查是否已收藏
      const isCurrentlyFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
      const icon = button.querySelector('i');
      
      if (isCurrentlyFavorited) {
        button.classList.add('active');
        icon.classList.remove('far');
        icon.classList.add('fas');
        button.style.color = '#ff6b1a';
      } else {
        button.classList.remove('active');
        icon.classList.remove('fas');
        icon.classList.add('far');
        button.style.color = '';
      }
    } catch (error) {
      console.error('更新收藏按鈕狀態失敗:', error);
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
        // 將餐廳資料保存到 sessionStorage 中，避免 URL 過長的問題
        sessionStorage.setItem('menuDetailRestaurantData', JSON.stringify(this.restaurantData));
        
        // 保存當前頁面狀態到 sessionStorage，以便返回時恢復
        sessionStorage.setItem('restaurantDetailPageState', JSON.stringify({
          restaurantData: this.restaurantData,
          currentUrl: window.location.href
        }));
        
        // 簡單跳轉到 menuDetail.html 頁面，不通過 URL 傳遞大量資料
        window.location.href = 'menuDetail.html';
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
  
  // 檢查並更新登入狀態 - 由 login.js 統一處理
  // checkLoginStatus(); // 註解掉，讓 login.js 自動處理

  // Initialize menu scroll for popular dishes section
  // Note: The popular dishes section in HTML does not have a specific container class like .popular-dishes around the menu-grid and buttons.
  // We will assume the current structure allows selecting the menu-grid and buttons directly or within the menu-section.
  // A more robust solution would be to wrap popular dishes in a specific container like <div class="popular-dishes-container">.
  // For now, we'll try to select relative to the menu-section or the existing structure.
  
  // Since .popular-dishes class is used on a div wrapping the h3, buttons and menu-grid, we can use it.
  setupMenuScroll('.popular-dishes');

  // Initialize menu scroll for recommended restaurants section
  setupMenuScroll('.recommended-restaurants');

  // 動態載入並顯示推薦餐廳
  const loadRecommendedRestaurants = async () => {
    console.log('=== loadRecommendedRestaurants 函數開始執行 ===');
    
    const recommendedCardsContainer = document.querySelector('.recommended-restaurants .menu-grid');
    console.log('推薦餐廳容器:', recommendedCardsContainer);
    
    if (recommendedCardsContainer) {
      // 顯示載入中
      recommendedCardsContainer.innerHTML = '<p>正在載入推薦餐廳...</p>';
      console.log('已設定載入中訊息');
      
      // 使用與主要餐廳資料相同的讀取策略
      let currentRestaurant = null;
      
      try {
        // 1. 優先檢查 sessionStorage 中的餐廳資料（防止重新整理時丟失）
        const sessionRestaurantData = sessionStorage.getItem('currentRestaurantData');
        if (sessionRestaurantData) {
          try {
            currentRestaurant = JSON.parse(sessionRestaurantData);
            console.log('從 sessionStorage 載入推薦用餐廳資料:', currentRestaurant.name);
          } catch (error) {
            console.warn('sessionStorage 資料解析失敗:', error);
          }
        }
        
        // 2. 如果沒有，檢查是否有從 menuDetail.html 返回的資料
        if (!currentRestaurant) {
          const returnData = sessionStorage.getItem('restaurantDetailReturnData');
          if (returnData) {
            try {
              currentRestaurant = JSON.parse(returnData);
              console.log('從 menuDetail 返回資料載入推薦用餐廳資料:', currentRestaurant.name);
            } catch (error) {
              console.warn('menuDetail 返回資料解析失敗:', error);
            }
          }
        }
        
        // 3. 檢查備用數據
        if (!currentRestaurant) {
          const backupData = sessionStorage.getItem('menuDetailBackupData');
          if (backupData) {
            try {
              currentRestaurant = JSON.parse(backupData);
              console.log('從備用資料載入推薦用餐廳資料:', currentRestaurant.name);
            } catch (error) {
              console.warn('備用資料解析失敗:', error);
            }
          }
        }
        
        // 4. 最後才從 localStorage 讀取（相容性考慮）
        if (!currentRestaurant) {
          const storedData = localStorage.getItem('selectedRestaurant');
          if (storedData) {
            currentRestaurant = JSON.parse(storedData);
            console.log('從 localStorage 載入推薦用餐廳資料:', currentRestaurant.name);
          }
        }
        
      } catch (error) {
        console.error('讀取餐廳資料失敗:', error);
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
        console.error('無法取得當前餐廳資訊，嘗試所有資料來源都失敗');
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
  
  // 清除之前的 sessionStorage 資料，確保載入新餐廳
  sessionStorage.removeItem('currentRestaurantData');
  sessionStorage.removeItem('restaurantDetailReturnData');
  sessionStorage.removeItem('menuDetailBackupData');
  sessionStorage.removeItem('restaurantDetailPageState');
  
  // 保存餐廳資料到 localStorage（向下相容）
  localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantToSave));
  
  // 保存餐廳資料到 sessionStorage（主要用於重新整理保護）
  sessionStorage.setItem('currentRestaurantData', JSON.stringify(restaurantToSave));
  
  // 使用餐廳 ID 跳轉，優先使用 placeId，否則使用 id
  const restaurantId = restaurantData.placeId || restaurantData.id;
  if (restaurantId) {
    console.log('使用餐廳 ID 跳轉:', restaurantId);
    window.location.href = `restaurantListDetail.html?restaurantId=${encodeURIComponent(restaurantId)}`;
  } else {
    // 如果沒有 ID，使用 data 參數
    console.log('使用 data 參數跳轉');
    const encodedData = encodeURIComponent(JSON.stringify(restaurantToSave));
    window.location.href = `restaurantListDetail.html?data=${encodedData}`;
  }
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

    // 生成星星評分
    const generateStars = (rating) => {
        if (!rating || rating < 1 || rating > 5) return '';
        let stars = '';
        const fullStars = Math.floor(rating);
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<span class="star filled">★</span>';
            } else {
                stars += '<span class="star empty">☆</span>';
            }
        }
        return stars;
    };

    return `
        <a href="#" class="menu-item restaurant-card v3">
          <div class="menu-item-image">
            <img src="${photoUrl}" alt="${restaurant.name}" onerror="this.src='images/default-restaurant.jpg'">
          </div>
          <div class="menu-item-info">
            <h4 class="restaurant-name">${restaurant.name}</h4>
            <div class="restaurant-rating">
              <span class="rating-score">${rating ? rating.toFixed(1) : 'N/A'}</span>
              <div class="stars">${generateStars(rating)}</div>
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
async function handleWriteReview() {
    // 檢查是否已登入
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        // 顯示請先登入的 alert 訊息，並引導到登入頁面
        const confirmLogin = confirm('請先登入會員才能寫評論。\n\n點擊「確定」前往登入頁面，點擊「取消」返回。');
        if (confirmLogin) {
            // 儲存當前餐廳資訊，以便登入後回來寫評論
            const restaurantName = document.querySelector('.restaurant-name')?.textContent || '';
            
            // 從 localStorage 獲取餐廳 ID
            let restaurantId = '';
            try {
                const selectedRestaurant = localStorage.getItem('selectedRestaurant');
                if (selectedRestaurant) {
                    const restaurantData = JSON.parse(selectedRestaurant);
                    restaurantId = restaurantData.placeId || restaurantData.id || '';
                }
            } catch (error) {
                console.error('解析 localStorage 餐廳資料失敗:', error);
            }
            
            localStorage.setItem('restaurant_id', restaurantId);
            localStorage.setItem('restaurant_name', restaurantName);
            localStorage.setItem('returnToWriteReview', 'true');
            
            // 跳轉到登入頁面
            window.location.href = 'userRegister.html';
        }
    } else {
        // 已登入，獲取當前餐廳資訊並跳轉
        console.log('=== 開始獲取餐廳資訊 ===');
        
        const restaurantName = document.querySelector('.restaurant-name')?.textContent || '';
        const restaurantAddress = document.querySelector('.address')?.textContent || '';
        
        // 先嘗試從 URL 參數獲取 placeId
        const urlParams = new URLSearchParams(window.location.search);
        let placeId = urlParams.get('restaurantId') || urlParams.get('id') || '';
        
        // 如果 URL 沒有 placeId，從 localStorage 獲取
        if (!placeId) {
            try {
                const selectedRestaurant = localStorage.getItem('selectedRestaurant');
                if (selectedRestaurant) {
                    const restaurantData = JSON.parse(selectedRestaurant);
                    placeId = restaurantData.placeId || restaurantData.id || '';
                    console.log('從 localStorage 獲取的餐廳資料:', restaurantData);
                }
            } catch (error) {
                console.error('解析 localStorage 餐廳資料失敗:', error);
            }
        }
        
        console.log('餐廳名稱:', restaurantName);
        console.log('餐廳地址:', restaurantAddress);
        console.log('最終獲取到的 placeId:', placeId);
        
        // 先調用 API 儲存餐廳資料到資料庫
        try {
            const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
            const response = await fetch(`${baseUrl}/restaurant-save/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: restaurantName,
                    address: restaurantAddress,
                    placeId: placeId
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('餐廳儲存成功:', result);
                
                // 構建帶參數的 URL，包含 restaurantId
                const params = new URLSearchParams();
                if (result.restaurantId) params.append('restaurantId', result.restaurantId);
                if (placeId) params.append('placeId', placeId);
                if (restaurantName) params.append('name', restaurantName);
                if (restaurantAddress) params.append('address', restaurantAddress);
                
                const finalUrl = `blogPost.html?${params.toString()}`;
                console.log('最終 URL:', finalUrl);
                
                // 跳轉到心得頁面並帶上參數
                window.location.href = finalUrl;
            } else {
                console.error('儲存餐廳失敗:', response.status, response.statusText);
                // 即使儲存失敗，也繼續跳轉到心得頁面
                const params = new URLSearchParams();
                if (placeId) params.append('placeId', placeId);
                if (restaurantName) params.append('name', restaurantName);
                if (restaurantAddress) params.append('address', restaurantAddress);
                
                const finalUrl = `blogPost.html?${params.toString()}`;
                window.location.href = finalUrl;
            }
        } catch (error) {
            console.error('調用餐廳儲存 API 失敗:', error);
            // 即使 API 調用失敗，也繼續跳轉到心得頁面
            const params = new URLSearchParams();
            if (placeId) params.append('placeId', placeId);
            if (restaurantName) params.append('name', restaurantName);
            if (restaurantAddress) params.append('address', restaurantAddress);
            
            const finalUrl = `blogPost.html?${params.toString()}`;
            window.location.href = finalUrl;
        }
    }
}

// 商家登入相關函數已移除 - 重新導向到相應頁面

// 初始化登入模態框
function initLoginModals() {
  // 移除強制跳轉邏輯，讓 login.js 統一處理登入功能
  // 這樣登入按鈕就會使用彈窗而不是跳轉頁面
  console.log('登入模態框功能由 login.js 統一處理');
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

// 檢查並更新登入狀態
function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const loginSection = document.getElementById('loginSection');
  const userSection = document.getElementById('userSection');
  
  if (isLoggedIn) {
    // 已登入 - 隱藏登入區域，顯示用戶區域
    if (loginSection) {
      loginSection.style.display = 'none';
    }
    if (userSection) {
      userSection.style.display = 'block';
      
      // 設置用戶頭像
      const avatarImg = userSection.querySelector('.avatar-img');
      const savedAvatar = localStorage.getItem('userAvatar');
      if (avatarImg && savedAvatar) {
        avatarImg.src = savedAvatar;
      }
    }
  } else {
    // 未登入 - 顯示登入區域，隱藏用戶區域
    if (loginSection) {
      loginSection.style.display = 'block';
    }
    if (userSection) {
      userSection.style.display = 'none';
    }
  }
}

// 登出功能 - 因為 login.js 可能沒有 logout 函數，這裡保留一個
function logout() {
  // 清除登入相關的 localStorage 資料
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userAvatar');
  localStorage.removeItem('authToken');
  
  // 重新載入頁面以更新 UI 狀態
  window.location.reload();
}