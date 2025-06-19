// 全域變數
let currentDisplayedRestaurants = [];
let map; // Leaflet 地圖實例
let markers = []; // Leaflet 標記陣列
let userLocation = null;
let currentSortType = null;
let currentPage = 0; // 分頁變數，預設為 0
let pageSize = 10; // 每頁顯示 10 筆
let totalPages = 0; // 總頁數
let totalElements = 0; // 總筆數

// 分頁狀態
let currentSort = null; // 添加排序狀態變量

// 隨機打亂陣列的函數
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 初始化 Leaflet 地圖
function initMap() {
  // 設定台北101為預設中心位置
  const taipei101 = { lat: 25.0330, lng: 121.5654 };
  
  // 創建 Leaflet 地圖實例
  map = L.map('map').setView([taipei101.lat, taipei101.lng], 13);
  
  // 添加 OpenStreetMap 圖層
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // 初始載入地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 更新地圖標記
function updateMapMarkers(restaurants) {
    // 清除現有標記
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // 添加新標記
    for (const restaurant of restaurants) {
        if (!restaurant.latitude || !restaurant.longitude) {
            console.warn(`Restaurant ${restaurant.name} has invalid coordinates`);
            continue;
        }

        // 確保經緯度是數字
        const lat = Number(restaurant.latitude);
        const lng = Number(restaurant.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Restaurant ${restaurant.name} has invalid coordinate types`);
            continue;
        }

        // 創建自定義圖標
        const customIcon = L.divIcon({
            className: 'restaurant-marker',
            html: `
                <div style="
                    background-color: #FF6B1A;
                    width: 24px;
                    height: 24px;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    position: relative;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(45deg);
                        font-size: 12px;
                    ">🍽️</div>
                </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });

        // 創建標記
        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        // 添加彈出視窗
        const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 14px;">${restaurant.name}</h3>
                <p style="margin: 0; color: #666; font-size: 12px;">${restaurant.averageRating} ⭐ (${restaurant.reviewCount} 則評論)</p>
                <div style="margin-top: 8px; color: #d32323; font-size: 11px; cursor: pointer;">
                    點擊查看詳細資訊 →
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);

        // 添加點擊事件
        marker.on('click', function() {
            // 傳遞完整的餐廳對象
            if (window.RestaurantModal && window.RestaurantModal.showRestaurantDetail) {
                window.RestaurantModal.showRestaurantDetail(restaurant);
            } else {
                // 如果 RestaurantModal 不可用，使用備用方案
                showRestaurantModal(restaurant);
            }
        });

        markers.push(marker);
    }
}

// 生成餐廳卡片 HTML (This function is deprecated and will be removed)
// function createRestaurantCard(restaurant) {
// ... existing code ...
// }

// 渲染餐廳列表 (This function is deprecated and will be removed)
// function renderRestaurants(restaurants) {
// ... existing code ...
// }

// 篩選餐廳
function filterRestaurants() {
  // 使用 currentDisplayedRestaurants 作為篩選基礎
  let filtered = [...currentDisplayedRestaurants];

  // 排序處理
  if (currentSortType) {
    switch (currentSortType) {
      case "rating":
        filtered.sort((a, b) => {
          const ratingDiff = b.averageRating - a.averageRating;
          if (ratingDiff !== 0) return ratingDiff;
          return b.reviewCount - a.reviewCount;
        });
        break;
      case "rating-count":
        filtered.sort((a, b) => {
          const countDiff = b.reviewCount - a.reviewCount;
          if (countDiff !== 0) return countDiff;
          return b.averageRating - a.averageRating;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "distance":
        if (userLocation) {
          filtered.sort((a, b) => {
            const distA = getDistance(userLocation, { latitude: a.latitude, longitude: a.longitude });
            const distB = getDistance(userLocation, { latitude: b.latitude, longitude: b.longitude });
            return distA - distB;
          });
        }
        break;
    }
  }

  return filtered;
}

// 計算距離的函數
function getDistance(point1, point2) {
    const R = 6371; // 地球半徑，單位：公里
    const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
    const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 添加防抖函數來優化搜尋性能
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 將 handleSearch 函數移到文件頂部，確保它在被調用前已定義
function handleSearch() {
  ('Search function triggered');

  const foodSearchInput = document.getElementById("food-search");
  const locationSearchInput = document.getElementById("location-search");
  
  if (!foodSearchInput || !locationSearchInput) {
    console.error('Search inputs not found');
    return;
  }

  const foodSearch = (foodSearchInput.value || '').toLowerCase();
  const locationSearch = (locationSearchInput.value || '').toLowerCase();
  
  ('Search terms:', { foodSearch, locationSearch });

  // 使用 currentDisplayedRestaurants 作為搜尋基礎
  let filtered = currentDisplayedRestaurants.filter(restaurant => {
    if (!restaurant) return false;

    const matchesFood = restaurant.name.toLowerCase().includes(foodSearch) ||
                       (restaurant.description && restaurant.description.toLowerCase().includes(foodSearch));
    
    const matchesLocation = restaurant.address && 
                           restaurant.address.toLowerCase().includes(locationSearch);
    
    // 如果兩個搜尋框都為空，返回所有結果
    if (!foodSearch && !locationSearch) return true;
    
    // 如果只有食物搜尋，只檢查食物相關
    if (foodSearch && !locationSearch) return matchesFood;
    
    // 如果只有地點搜尋，只檢查地點相關
    if (!foodSearch && locationSearch) return matchesLocation;
    
    // 如果兩個都有，則需要同時符合
    return matchesFood && matchesLocation;
  });

  ('Filtered results:', filtered.length);

  // 儲存搜尋結果
  currentDisplayedRestaurants = filtered;
  
  // 重置到第一頁
  currentPage = 1;
  const pageData = currentDisplayedRestaurants.slice(0, pageSize);
  
  // 直接更新餐廳列表
  const cardsContainer = document.getElementById('restaurant-cards');
  if (cardsContainer) {
    renderFilteredCards(pageData, currentDisplayedRestaurants.length);
  } else {
    console.error('Restaurant cards container not found!');
  }

  // 更新地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 使用防抖包裝搜尋函數
const debouncedSearch = debounce(handleSearch, 300);

// 添加事件監聽器
document.addEventListener('DOMContentLoaded', function() {
  // 初始化頁面
  renderCards(1);
  
  // 綁定排序按鈕事件
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // 移除其他按鈕的 active 類
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      // 添加當前按鈕的 active 類
      this.classList.add('active');
      
      // 獲取排序類型
      currentSortType = this.dataset.sort;
      
      // 根據排序類型呼叫後端 API
      let sortParam = null;
      if (currentSortType === 'rating') {
        sortParam = 'ratingDesc';
      } else if (currentSortType === 'rating-count') {
        sortParam = 'reviewCountDesc';
      } else if (currentSortType === 'newest') {
        sortParam = 'createdAtDesc';
      }
      
      // 重置分頁到第一頁並呼叫後端 API
      currentPage = 0;
      fetchRestaurants(sortParam, currentPage);
      // 滾動到頁面頂部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // 綁定類型篩選下拉選單事件
  const typeDropdownTrigger = document.querySelector('.type-dropdown-trigger');
  const typeDropdownMenu = document.querySelector('.type-dropdown-menu');
  
  if (typeDropdownTrigger && typeDropdownMenu) {
    // 點擊觸發器顯示/隱藏下拉選單
    typeDropdownTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      typeDropdownMenu.classList.toggle('show');
    });

    // 點擊其他地方關閉下拉選單
    document.addEventListener('click', function(e) {
      if (!typeDropdownMenu.contains(e.target) && !typeDropdownTrigger.contains(e.target)) {
        typeDropdownMenu.classList.remove('show');
      }
    });

    // 生成並添加標籤選項
    const tagGrid = document.querySelector('.tag-grid');
    if (tagGrid) {
      const tags = getAllUniqueTags();
      const tagRow = document.querySelector('.tag-row');
      
      tags.forEach(tag => {
        const tagOption = document.createElement('div');
        tagOption.className = 'tag-option';
        tagOption.dataset.type = tag;
        tagOption.innerHTML = `<span>${tag}</span>`;
        
        tagOption.addEventListener('click', function() {
          // 移除其他選項的選中狀態
          document.querySelectorAll('.tag-option').forEach(opt => opt.classList.remove('selected'));
          // 添加當前選項的選中狀態
          this.classList.add('selected');
          // 更新當前選中的標籤
          currentSelectedTag = this.dataset.type;
          // 更新按鈕文字
          typeDropdownTrigger.textContent = this.dataset.type === 'all' ? '所有類型 ▼' : `${this.dataset.type} ▼`;
        });
        
        tagRow.appendChild(tagOption);
      });
    }

    // 綁定套用篩選按鈕事件
    const applyTagsBtn = document.querySelector('.apply-tags');
    if (applyTagsBtn) {
      applyTagsBtn.addEventListener('click', function() {
        filterRestaurants();
        typeDropdownMenu.classList.remove('show');
      });
    }
  }

  // 綁定搜尋輸入框事件
  const foodSearchInput = document.getElementById('food-search');
  const locationSearchInput = document.getElementById('location-search');
  
  if (foodSearchInput && locationSearchInput) {
    // 使用防抖函數來優化搜尋性能
    const debouncedSearch = debounce(handleSearch, 300);
    
    foodSearchInput.addEventListener('input', debouncedSearch);
    locationSearchInput.addEventListener('input', debouncedSearch);
  }
});

// renderCards function is used for initial load
function renderCards(page = 1) {
  currentPage = page;
  // 移除隨機打亂，保持後端的排序結果
  // currentDisplayedRestaurants = shuffleArray([...currentDisplayedRestaurants]);
  
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = currentDisplayedRestaurants.slice(start, end);
  
  // Render the first page initially
  renderFilteredCards(pageData, currentDisplayedRestaurants.length);

  // 初始載入時更新地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

function renderPagination(totalCount) { 
  const totalPages = Math.ceil(totalCount / pageSize);
  let html = '';
  const paginationContainer = document.querySelector('.pagination');
  
  if (!paginationContainer) return; // Exit if pagination container is not found

  // Only render pagination if there's more than one page
  if (totalPages <= 1) {
      paginationContainer.innerHTML = ''; // Clear pagination if only one page
      return;
  }

  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn${i === currentPage ? ' active' : ''}" data-page="${i}">${i}</button>`;
  }
  
  paginationContainer.innerHTML = html;
  
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.onclick = function() {
      currentPage = parseInt(this.dataset.page);
      
      // Get the correct page data from the stored filtered/sorted array
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize;
      const pageData = currentDisplayedRestaurants.slice(start, end);
      
      // Render the correct page
      renderFilteredCards(pageData, currentDisplayedRestaurants.length); // Pass total count from stored array
      window.scrollTo({ top: document.getElementById('restaurant-cards').offsetTop - 20, behavior: 'smooth' });
    };
  });
}

// 修改 showRestaurantModal 函數
function showRestaurantModal(restaurant) {
  const modal = document.getElementById('restaurant-modal');
  const modalContent = document.getElementById('modal-content-container');
  
  // 獲取隨機三則評論
  const getRandomReviews = (restaurant) => {
    // 這裡我們暫時使用現有的評論資料，實際應用中可以從後端獲取更多評論
    const reviews = [
      {
        reviewer: restaurant.reviewer,
        rating: restaurant.rating,
        content: restaurant.review,
        date: "2024-03-15"
      },
      {
        reviewer: "美食達人",
        rating: 4.5,
        content: "環境舒適，服務親切，值得推薦！",
        date: "2024-03-14"
      },
      {
        reviewer: "饕客小王",
        rating: 4.8,
        content: "食材新鮮，料理精緻，下次還會再來！",
        date: "2024-03-13"
      }
    ];
    return reviews;
  };

  const reviews = getRandomReviews(restaurant);
  
  // 設置彈出視窗內容
  modalContent.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- 頂部區域：商家名稱和認證標誌 -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h2 style="margin: 0; font-size: 28px; font-weight: 600;">${restaurant.name}</h2>
        ${restaurant.isVerified ? 
          '<div style="display: flex; align-items: center; gap: 4px; color: #d32323; font-size: 14px; font-weight: 500;"><i class="fas fa-check-circle"></i> 食力派認證商家</div>' : 
          ''}
      </div>

      <!-- 主要內容區域：圖片和資訊 -->
      <div style="display: flex; gap: 24px;">
        <!-- 左側：商家圖片 -->
        <div style="flex: 0 0 400px;">
          <img src="${restaurant.image}" alt="${restaurant.name}" 
               style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        </div>

        <!-- 右側：商家資訊 -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
          <!-- 評分區域 -->
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="color: #d32323; font-size: 24px; font-weight: 500;">
              ${"★".repeat(Math.floor(restaurant.rating))}${restaurant.rating % 1 >= 0.5 ? "½" : ""}
            </div>
            <div style="color: #666; font-size: 16px;">
              ${restaurant.rating} (${restaurant.ratingCount} 則評論)
            </div>
          </div>

          <!-- 基本資訊 -->
          <div style="display: flex; flex-direction: column; gap: 12px; color: #333;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-map-marker-alt" style="color: #666; width: 20px;"></i>
              <span>${restaurant.address}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-phone" style="color: #666; width: 20px;"></i>
              <span>${restaurant.phone || '02-1234-5678'}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-clock" style="color: #666; width: 20px;"></i>
              <span>${restaurant.businessHours || '週一至週日 11:00-22:00'}</span>
            </div>
          </div>

          <!-- 價格範圍 -->
          <div style="color: #666; font-size: 15px;">
            <i class="fas fa-dollar-sign" style="color: #666; margin-right: 4px;"></i>
            均消 ${restaurant.price}
          </div>
        </div>
      </div>

      <!-- Google Maps 靜態圖片 -->
      <div style="width: 100%; height: 300px; border-radius: 12px; overflow: hidden; position: relative;">
        <img 
          src="https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(restaurant.address)}&zoom=15&size=800x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(restaurant.address)}&key=AIzaSyC6_6-dHTpnaLn6NKtn6OhmCFUqf1B4YN4" 
          alt="地圖位置"
          style="width: 100%; height: 100%; object-fit: cover;"
        />
        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}" 
          target="_blank"
          style="position: absolute; bottom: 16px; right: 16px; background: white; padding: 8px 16px; border-radius: 20px; text-decoration: none; color: #333; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 6px;"
        >
          <i class="fas fa-external-link-alt"></i>
          在 Google Maps 中查看
        </a>
      </div>

      <!-- 評論區域 -->
      <div style="border-top: 1px solid #eee; padding-top: 24px;">
        <h3 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">顧客評論</h3>
        <div style="display: flex; flex-direction: column; gap: 20px;">
          ${reviews.map(review => `
            <div style="display: flex; gap: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
              <div style="flex: 0 0 48px; height: 48px; background: #e0e0e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #666; font-weight: 500;">
                ${review.reviewer.charAt(0)}
              </div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="font-weight: 500;">${review.reviewer}</span>
                  <span style="color: #666; font-size: 14px;">${review.date}</span>
                </div>
                <div style="color: #d32323; margin-bottom: 8px;">
                  ${"★".repeat(Math.floor(review.rating))}${review.rating % 1 >= 0.5 ? "½" : ""}
                </div>
                <p style="margin: 0; color: #333; line-height: 1.5;">${review.content}</p>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  
  // 顯示彈出視窗
  modal.style.display = 'flex';
  
  // 添加關閉按鈕事件
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };
  
  // 點擊背景關閉彈出視窗
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  };
}

// 修改 renderFilteredCards 函數中的卡片渲染部分
function renderFilteredCards(pageData, totalCount) {
  (`Rendering page with ${pageData.length} items. Total count: ${totalCount}`);
  
  const cardsContainer = document.getElementById('restaurant-cards');
  if (!cardsContainer) return;

  const cards = pageData.map(restaurant => {
    // 在組裝卡片時，根據 isOpen 設定 class
    const hoursStatusClass = restaurant.isOpen ? 'open-status' : 'closed-status';
    return `
      <div class="restaurant-card yelp-style" style="display: flex; gap: 16px; padding: 16px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; cursor: pointer;" 
        onclick="navigateToDetail('${encodeURIComponent(JSON.stringify(restaurant))}')">
        <div class="yelp-img-wrap" style="flex: 0 0 200px; height: 150px; overflow: hidden; border-radius: 4px;">
          <img src="${restaurant.image}" alt="${restaurant.name}" class="yelp-image" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div class="yelp-info" style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <div class="yelp-row yelp-title-row">
            <h3 class="yelp-name" style="font-size: 18px; font-weight: 600; margin: 0; line-height: 1.3;">
              ${restaurant.name}
            </h3>
            ${restaurant.isVerified ? '<div style="color: #d32323; font-size: 13px; margin-top: 2px;">✓ 食力派</div>' : ''}
          </div>
          <div class="yelp-row yelp-rating-row" style="display: flex; align-items: center; gap: 4px;">
            <span class="stars" style="color: #d32323; font-size: 14px;">${"★".repeat(Math.floor(restaurant.rating))}${restaurant.rating % 1 >= 0.5 ? "½" : ""}</span>
            <span class="rating-text" style="color: #666; font-size: 13px;">${restaurant.rating} (${restaurant.ratingCount} 則評論)</span>
          </div>
          <div class="yelp-row yelp-price-row" style="display: flex; gap: 12px; align-items: center;">
            <div style="color: #666; font-size: 13px; font-weight: 500; background: #f8f8f8; padding: 2px 8px; border-radius: 4px;">均消 ${restaurant.price}</div>
            <div style="color: #666; font-size: 13px;">${restaurant.address}</div>
          </div>
          <div class="yelp-row yelp-review-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px solid #eee;">
            <div style="display: flex; gap: 8px; align-items: flex-start;">
              <img src="${restaurant.reviewImage}" alt="評論照片" style="width: 48px; height: 48px; object-fit: cover; border-radius: 4px;" />
              <div style="flex: 1;">
                <div style="font-size: 13px; margin-bottom: 2px;">
                  <span style="font-weight: 500;">${restaurant.reviewer}</span>
                  <span style="color: #666; margin-left: 6px;">${restaurant.rating} ★</span>
                </div>
                <p style="font-size: 13px; color: #333; margin: 0; line-height: 1.4;">${restaurant.review}</p>
              </div>
            </div>
          </div>
          <div class="favorite-btn" data-id="${restaurant.id}">
            <i class="far fa-heart"></i> <!-- 預設空心愛心 -->
          </div>
        </div>
      </div>
    `;
  }).join("");

  cardsContainer.innerHTML = `
    <div class="yelp-cards-list" style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
      <div class="results-count">顯示 ${pageData.length} 個結果，共 ${totalCount} 個</div>
      ${cards}
    </div>
  `;

  // 更新分頁
  renderPaginationControls();

  // 為每個愛心按鈕添加點擊事件監聽器
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation(); // 阻止事件冒泡到卡片點擊事件
      this.classList.toggle('active');
    });
  });
}

// 新增導航到詳情頁的函數
function navigateToDetail(restaurantData) {
  window.location.href = `restaurantListDetail.html?data=${restaurantData}`;
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('頁面載入完成，開始獲取餐廳資料');
    fetchRestaurants(null, 0);  // 使用分頁參數獲取第一頁資料
    
    // 初始化地圖
    initMap();
    
    // 初始化其他UI元素
    initSearchButton();
    initSearchInputs();
    initDropdowns();
    initTags();
});

// ... existing code ...

// 取代假資料，直接 fetch 後台 API
function fetchRestaurants(sortType = null, page = 0) {
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    // 修正：使用正確的 API 端點 /restaurants/list
    let url = baseUrl + '/restaurants/list';
    const params = new URLSearchParams();
    
    // 添加分頁參數
    params.append('page', page);
    params.append('size', pageSize);
    
    // 如果有排序參數，添加排序參數到現有的 /restaurants/list API
    if (sortType) {
        // 將排序類型轉換為後端期望的參數名稱
        let sortBy = '';
        switch (sortType) {
            case 'ratingDesc':
                sortBy = 'averageRating';
                params.append('sortBy', sortBy);
                params.append('sortDir', 'desc');
                break;
            case 'reviewCountDesc':
                sortBy = 'reviewCount';
                params.append('sortBy', sortBy);
                params.append('sortDir', 'desc');
                break;
            case 'createdAtDesc':
                sortBy = 'createdAt';
                params.append('sortBy', sortBy);
                params.append('sortDir', 'desc');
                break;
            default:
                sortBy = 'averageRating';
                params.append('sortBy', sortBy);
                params.append('sortDir', 'desc');
        }
    }
    
    url += '?' + params.toString();
    console.log('發送 API 請求到:', url);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received restaurant data:', data); // 添加日誌
            
            let restaurants = [];
            
            // 檢查是否為分頁資料
            if (data.content && Array.isArray(data.content)) {
                // 分頁資料
                restaurants = data.content;
                totalPages = data.totalPages;
                totalElements = data.totalElements;
                currentPage = data.number;
            } else if (Array.isArray(data)) {
                // 非分頁資料（舊的排序查詢）
                restaurants = data;
                totalPages = Math.ceil(restaurants.length / pageSize);
                totalElements = restaurants.length;
                currentPage = 0;
            }
            
            // 確保資料格式正確
            const formattedData = restaurants.map((restaurant, index) => {
                console.log(`處理餐廳 ${index + 1}: ${restaurant.name}`);
                console.log('原始 googleReviews:', restaurant.googleReviews);
                console.log('googleReviews 類型:', typeof restaurant.googleReviews);
                console.log('googleReviews 長度:', Array.isArray(restaurant.googleReviews) ? restaurant.googleReviews.length : 'N/A');
                
                return {
                    ...restaurant,
                    // 確保 createdAt 是字串格式
                    createdAt: restaurant.createdAt ? new Date(restaurant.createdAt).toISOString() : null,
                    // 確保數值型別正確
                    averageRating: restaurant.averageRating ? Number(restaurant.averageRating) : null,
                    reviewCount: restaurant.reviewCount ? Number(restaurant.reviewCount) : 0,
                    latitude: restaurant.latitude ? Number(restaurant.latitude) : null,
                    longitude: restaurant.longitude ? Number(restaurant.longitude) : null,
                    // 確保保留 googleReviews
                    googleReviews: restaurant.googleReviews || []
                };
            });
            
            console.log('Formatted restaurant data:', formattedData); // 添加日誌
            console.log('第一筆餐廳的 googleReviews:', formattedData[0]?.googleReviews);
            
            // 更新當前顯示的餐廳列表
            currentDisplayedRestaurants = formattedData;
            // 渲染餐廳卡片
            renderRestaurants(formattedData);
            // 更新地圖標記
            updateMapMarkers(formattedData);
            // 渲染分頁控制
            renderPaginationControls();
        })
        .catch(error => {
            console.error('Error fetching restaurants:', error);
            const container = document.getElementById('restaurant-cards');
            if (container) {
                container.innerHTML = '<div class="error-message">無法取得餐廳資料，請稍後再試。</div>';
            }
        });
}

function renderRestaurants(restaurants) {
    const container = document.getElementById('restaurant-cards');
    if (!container) return;
    container.innerHTML = '';
    
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    restaurants.forEach(restaurant => {
        // 從 json_raw 解析數據
        if (restaurant.json_raw) {
            try {
                const jsonData = JSON.parse(restaurant.json_raw);
                console.log('成功解析 json_raw 數據:', restaurant.name, jsonData);
                
                // 從 JSON 數據中提取評分、評論數
                if (jsonData.rating) {
                    restaurant.averageRating = jsonData.rating;
                    restaurant.rating = jsonData.rating;
                }
                if (jsonData.user_ratings_total) {
                    restaurant.reviewCount = jsonData.user_ratings_total;
                    restaurant.user_ratings_total = jsonData.user_ratings_total;
                }
                
                // 提取營業時間
                if (jsonData.opening_hours && jsonData.opening_hours.weekday_text) {
                    restaurant.businessHours = jsonData.opening_hours.weekday_text;
                    restaurant.opening_hours = jsonData.opening_hours;
                }
            } catch (error) {
                console.error('解析 json_raw 失敗:', error);
            }
        }
        
        const card = document.createElement('div');
        card.className = 'restaurant-card yelp-style';
        
        // 確保評分和評論數有默認值，但優先使用從 json_raw 解析出來的數據
        const rating = restaurant.averageRating || restaurant.rating || 0;
        const reviewCount = restaurant.reviewCount || restaurant.user_ratings_total || 0;
        
        // 營業時間處理
        let businessHoursText = '暫無營業時間資料';
        let isOpen = false;

        // 判斷現在是否營業的函數
        function isOpenNow(businessHoursText) {
            if (!businessHoursText) return false;
            // 處理多個時段
            const now = new Date();
            const nowMinutes = now.getHours() * 60 + now.getMinutes();
            // 支援全形/半形符號
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
                    // 跨日
                    if (endMin < startMin) endMin += 24 * 60;
                    if (
                        (nowMinutes >= startMin && nowMinutes <= endMin) ||
                        (endMin > 24 * 60 && nowMinutes <= endMin - 24 * 60)
                    ) {
                        return true;
                    }
                }
            }
            return false;
        }

        // robust openingHours 處理
        if (restaurant.openingHours) {
            let openingHoursArr = restaurant.openingHours;
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
                // 只取第一個「：」或「:」之後的所有內容
                const timePart = todayText.split(/：|:/).slice(1).join(':').trim();
                businessHoursText = timePart ? timePart : todayText;
                isOpen = isOpenNow(businessHoursText);
            } else if (typeof openingHoursArr === 'string' && openingHoursArr.length > 0) {
                businessHoursText = openingHoursArr;
            }
        } else if (restaurant.opening_hours) {
            isOpen = restaurant.opening_hours.open_now || false;
            if (restaurant.opening_hours.weekday_text && Array.isArray(restaurant.opening_hours.weekday_text)) {
                const today = new Date().getDay();
                const index = today === 0 ? 6 : today - 1;
                if (restaurant.opening_hours.weekday_text[index]) {
                    const todayText = restaurant.opening_hours.weekday_text[index];
                    const timeMatch = todayText.match(/:\s*(.+)$/);
                    businessHoursText = timeMatch ? timeMatch[1].trim() : '暫無營業時間資料';
                    isOpen = isOpenNow(businessHoursText);
                }
            } else if (restaurant.businessHours && Array.isArray(restaurant.businessHours)) {
                businessHoursText = restaurant.businessHours[0] || '暫無營業時間資料';
            }
        }
        
        // 圖片來源改為 google_restaurant_photos 的 API
        let photoUrl = baseUrl + '/restaurant-images/' + (restaurant.placeId || restaurant.place_id) + '/raw';
        card.innerHTML = `
            <div class="yelp-img-wrap">
                <img class="yelp-image" src="${photoUrl}" alt="${restaurant.name}" onerror="this.src='images/default-restaurant.jpg'">
            </div>
            <div class="yelp-info">
                <div class="yelp-title-row">
                    <h3 class="yelp-name">${restaurant.name}</h3>
                </div>
                <div class="yelp-rating-row">
                    <div class="stars">${generateStars(rating)}</div>
                    <span class="rating-text">${rating ? rating.toFixed(1) : 'N/A'} (${reviewCount || 0} 則評論)</span>
                </div>
                <div class="yelp-price-row">
                    <span class="address">${restaurant.address || ''}</span>
                </div>
                <div class="yelp-hours-row">
                    <span class="hours-icon ${isOpen ? 'open' : 'closed'}"></span>
                    <span class="hours-text ${isOpen ? 'open-status' : 'closed-status'}">${isOpen ? '營業中' : '休息中'}</span>
                    <span class="hours-details">${businessHoursText}</span>
                </div>
                <div class="yelp-review-row">
                    <p class="review-text">${restaurant.description || ''}</p>
                </div>
            </div>
        `;

        // 添加點擊事件處理
        card.addEventListener('click', () => {
            console.log('=== 點擊餐廳卡片 ===');
            console.log('餐廳名稱:', restaurant.name);
            console.log('點擊前的 restaurant 物件:', restaurant);
            console.log('點擊前的 googleReviews:', restaurant.googleReviews);
            console.log('googleReviews 是否為陣列:', Array.isArray(restaurant.googleReviews));
            console.log('googleReviews 長度:', restaurant.googleReviews?.length);
            
            // 確保 googleReviews 欄位正確帶入 localStorage
            const restaurantToSave = { ...restaurant };
            
            // 處理 googleReviews 欄位
            if (typeof restaurant.googleReviews === 'undefined' || restaurant.googleReviews === null) {
                console.log('googleReviews 為 undefined 或 null，嘗試使用備用欄位');
                if (typeof restaurant.google_reviews !== 'undefined' && restaurant.google_reviews !== null) {
                    restaurantToSave.googleReviews = restaurant.google_reviews;
                    console.log('使用 google_reviews 欄位:', restaurant.google_reviews);
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
            
            // 直接存完整物件
            localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantToSave));
            // 導頁到餐廳詳情頁面
            window.location.href = 'restaurantListDetail.html';
        });

        container.appendChild(card);
    });
}

// 添加 generateStars 函數
function generateStars(rating) {
    if (!rating) return '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    // 添加實心星星
    for (let i = 0; i < fullStars; i++) {
        stars += '<span class="star full">★</span>';
    }
    // 添加半星
    if (halfStar) {
        stars += '<span class="star half">★</span>';
    }
    // 添加空心星星
    for (let i = 0; i < emptyStars; i++) {
        stars += '<span class="star empty">☆</span>';
    }
    return stars;
}

// 渲染分頁控制
function renderPaginationControls() {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;
    
    let html = '';
    
    // 顯示分頁資訊
    html += `<div class="pagination-info">第 ${currentPage + 1} 頁，共 ${totalPages} 頁 (${totalElements} 筆資料)</div>`;
    
    // 上一頁按鈕
    const prevDisabled = currentPage <= 0;
    html += `<button class="pagination-btn prev-btn" ${prevDisabled ? 'disabled' : ''}>上一頁</button>`;
    
    // 下一頁按鈕
    const nextDisabled = currentPage >= totalPages - 1;
    html += `<button class="pagination-btn next-btn" ${nextDisabled ? 'disabled' : ''}>下一頁</button>`;
    
    paginationContainer.innerHTML = html;
    
    // 綁定按鈕事件
    const prevBtn = paginationContainer.querySelector('.prev-btn');
    const nextBtn = paginationContainer.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                // 將前端排序類型轉換為後端參數
                let sortParam = null;
                if (currentSortType === 'rating') {
                    sortParam = 'ratingDesc';
                } else if (currentSortType === 'rating-count') {
                    sortParam = 'reviewCountDesc';
                } else if (currentSortType === 'newest') {
                    sortParam = 'createdAtDesc';
                }
                fetchRestaurants(sortParam, currentPage);
                // 滾動到頁面頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                // 將前端排序類型轉換為後端參數
                let sortParam = null;
                if (currentSortType === 'rating') {
                    sortParam = 'ratingDesc';
                } else if (currentSortType === 'rating-count') {
                    sortParam = 'reviewCountDesc';
                } else if (currentSortType === 'newest') {
                    sortParam = 'createdAtDesc';
                }
                fetchRestaurants(sortParam, currentPage);
                // 滾動到頁面頂部
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}