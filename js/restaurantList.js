let currentDisplayedRestaurants = [];
let map;
let markers = [];
let userLocation = null;
let currentSortType = null;
let currentPage = 0;
let pageSize = 10;
let totalPages = 0;
let totalElements = 0;

let currentSort = null;

let searchService = null;
let originalRestaurants = [];
let allRestaurantsLoaded = false;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initMap() {
  const taipei101 = { lat: 25.0330, lng: 121.5654 };
  
  map = L.map('map').setView([taipei101.lat, taipei101.lng], 13);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  updateMapMarkers(currentDisplayedRestaurants);
}

function updateMapMarkers(restaurants) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    for (const restaurant of restaurants) {
        if (!restaurant.latitude || !restaurant.longitude) {
            continue;
        }

        const lat = Number(restaurant.latitude);
        const lng = Number(restaurant.longitude);

        if (isNaN(lat) || isNaN(lng)) {
            continue;
        }

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

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        const popupContent = `
            <div class="map-popup-content" data-restaurant-id="${restaurant.placeId || restaurant.id}" style="padding: 10px; min-width: 200px; cursor: pointer;">
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 15px; font-weight: 600;">${restaurant.name}</h3>
                <p style="margin: 0 0 6px 0; color: #666; font-size: 13px;">${restaurant.averageRating} ⭐ (${restaurant.reviewCount} 則評論)</p>
                <p style="margin: 0 0 8px 0; color: #666; font-size: 12px;">${restaurant.address}</p>
                <div style="margin-top: 8px; color: #d32323; font-size: 12px; font-weight: 500; text-align: center; padding: 4px 8px; background: rgba(211, 35, 35, 0.1); border-radius: 4px;">
                    點擊查看完整資訊
                </div>
            </div>
        `;

        const popup = marker.bindPopup(popupContent);
        
        marker.on('popupopen', function() {
            const popupElement = document.querySelector('.map-popup-content');
            if (popupElement) {
                popupElement.addEventListener('click', function() {
                    const restaurantToSave = { ...restaurant };
                    
                    if (typeof restaurant.googleReviews === 'undefined' || restaurant.googleReviews === null) {
                        if (typeof restaurant.google_reviews !== 'undefined' && restaurant.google_reviews !== null) {
                            restaurantToSave.googleReviews = restaurant.google_reviews;
                        } else {
                            restaurantToSave.googleReviews = [];
                        }
                    }
                    
                    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantToSave));
                    window.location.href = 'restaurantListDetail.html';
                });
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

// 載入所有餐廳資料供搜尋使用
async function loadAllRestaurants() {
  if (allRestaurantsLoaded) {
    return originalRestaurants;
  }
  
  const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
  
  try {
    const response = await fetch(`${baseUrl}/restaurants/list`);
    
    if (!response.ok) {
      throw new Error('無法載入餐廳資料');
    }
    
    const data = await response.json();
    
    // 格式化資料
    originalRestaurants = data.map(restaurant => ({
      ...restaurant,
      createdAt: restaurant.createdAt ? new Date(restaurant.createdAt).toISOString() : null,
      averageRating: restaurant.averageRating ? Number(restaurant.averageRating) : null,
      reviewCount: restaurant.reviewCount ? Number(restaurant.reviewCount) : 0,
      latitude: restaurant.latitude ? Number(restaurant.latitude) : null,
      longitude: restaurant.longitude ? Number(restaurant.longitude) : null,
      googleReviews: restaurant.googleReviews || []
    }));
    
    allRestaurantsLoaded = true;
    return originalRestaurants;
    
  } catch (error) {
    // 如果無法載入全部資料，使用當前已載入的資料
    return currentDisplayedRestaurants;
  }
}

// 新的搜尋功能，使用本地資料搜尋
async function performSearch() {
  const foodSearchInput = document.getElementById("food-search");
  const locationSearchInput = document.getElementById("location-search");
  
  if (!foodSearchInput || !locationSearchInput) {
    return;
  }

  const foodKeyword = foodSearchInput.value.trim();
  const locationKeyword = locationSearchInput.value.trim();

  try {
    // 確保已載入所有餐廳資料
    await loadAllRestaurants();
    
    // 如果沒有搜尋關鍵字，返回第一頁分頁資料
    if (!foodKeyword && !locationKeyword) {
      fetchRestaurants(null, 0);
      return;
    }
    
    // 使用原始資料進行搜尋
    let searchResults = [...originalRestaurants];
    
    // 根據餐廳名稱搜尋
    if (foodKeyword) {
      searchResults = searchResults.filter(restaurant => {
        if (!restaurant) return false;
        
        const name = (restaurant.name || '').toLowerCase();
        const description = (restaurant.description || '').toLowerCase();
        const types = Array.isArray(restaurant.types) ? restaurant.types.join(' ').toLowerCase() : '';
        
        const keyword = foodKeyword.toLowerCase();
        
        return name.includes(keyword) || 
               description.includes(keyword) || 
               types.includes(keyword);
      });
    }
    
    // 根據地址搜尋
    if (locationKeyword) {
      searchResults = searchResults.filter(restaurant => {
        if (!restaurant) return false;
        const address = (restaurant.address || '').toLowerCase();
        const formattedAddress = (restaurant.formatted_address || '').toLowerCase();
        const keyword = locationKeyword.toLowerCase();
        return address.includes(keyword) || formattedAddress.includes(keyword);
      });
    }
    
    // 更新當前顯示的資料
    currentDisplayedRestaurants = searchResults;
    
    // 重置到第一頁
    currentPage = 1;
    const pageData = searchResults.slice(0, pageSize);
    
    // 更新餐廳列表顯示
    const cardsContainer = document.getElementById('restaurant-cards');
    if (cardsContainer) {
      renderFilteredCards(pageData, searchResults.length);
    }

    // 更新地圖標記
    updateMapMarkers(searchResults);
    
  } catch (error) {
    fetchRestaurants(null, 0);
  }
}

// 舊的搜尋函數 (保留作為備用)
function handleSearch() {
  const foodSearchInput = document.getElementById("food-search");
  const locationSearchInput = document.getElementById("location-search");
  
  if (!foodSearchInput || !locationSearchInput) {
    return;
  }

  const foodSearch = (foodSearchInput.value || '').toLowerCase();
  const locationSearch = (locationSearchInput.value || '').toLowerCase();

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

  // 儲存搜尋結果
  currentDisplayedRestaurants = filtered;
  
  // 重置到第一頁
  currentPage = 1;
  const pageData = currentDisplayedRestaurants.slice(0, pageSize);
  
  // 直接更新餐廳列表
  const cardsContainer = document.getElementById('restaurant-cards');
  if (cardsContainer) {
    renderFilteredCards(pageData, currentDisplayedRestaurants.length);
  }

  // 更新地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 使用防抖包裝搜尋函數
const debouncedSearch = debounce(handleSearch, 300);

// 添加事件監聽器
document.addEventListener('DOMContentLoaded', function() {
  // 初始化地圖
  initMap();
  
  // 初始化頁面 - 從第一頁開始載入分頁資料
  fetchRestaurants(null, 0);
  
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
  const searchBtn = document.querySelector('.search-btn');
  
  if (foodSearchInput && locationSearchInput) {
    // 使用防抖函數來優化搜尋性能 - 使用新的搜尋函數
    const debouncedSearch = debounce(performSearch, 300);
    
    // 輸入框即時搜尋
    foodSearchInput.addEventListener('input', debouncedSearch);
    locationSearchInput.addEventListener('input', debouncedSearch);
    
    // Enter 鍵搜尋
    foodSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
    
    locationSearchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
      }
    });
  }
  
  // 搜尋按鈕點擊事件
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
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
  const cardsContainer = document.getElementById('restaurant-cards');
  if (!cardsContainer) return;

  const cards = pageData.map((restaurant, index) => {
    // 確保 API_BASE_URL 存在，若不存在則使用預設值
    const baseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
    
    // 使用正確的欄位名稱
    const rating = restaurant.averageRating || 0;
    const reviewCount = restaurant.reviewCount || 0;
    const photoUrl = baseUrl + '/restaurant-images/' + (restaurant.placeId || restaurant.place_id) + '/raw';
    
    return `
      <div class="restaurant-card yelp-style" style="position: relative; display: flex; gap: 16px; padding: 16px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); align-items: center; cursor: pointer;" 
        onclick="navigateToDetail('${encodeURIComponent(JSON.stringify(restaurant))}')">
        <div class="yelp-img-wrap" style="flex: 0 0 200px; height: 150px; overflow: hidden; border-radius: 4px;">
          <img src="${photoUrl}" alt="${restaurant.name}" class="yelp-image" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='images/default-restaurant.jpg'" />
        </div>
        <div class="yelp-info" style="flex: 1; display: flex; flex-direction: column; gap: 8px; position: relative;">
          <div class="yelp-row yelp-title-row">
            <h3 class="yelp-name" style="font-size: 18px; font-weight: 600; margin: 0; line-height: 1.3;">
              ${restaurant.name}
            </h3>
          </div>
          <div class="yelp-row yelp-rating-row" style="display: flex; align-items: center; gap: 4px;">
            <span class="stars" style="color: #d32323; font-size: 14px;">${generateStars(rating)}</span>
            <span class="rating-text" style="color: #666; font-size: 13px;">${rating ? rating.toFixed(1) : 'N/A'} (${reviewCount} 則評論)</span>
          </div>
          <div class="yelp-row yelp-address-row" style="display: flex; gap: 12px; align-items: center;">
            <div style="color: #666; font-size: 13px;">${restaurant.address || ''}</div>
          </div>
          <div class="yelp-row yelp-description-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px solid #eee;">
            <p style="font-size: 13px; color: #333; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${restaurant.description || ''}</p>
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

  // 更新分頁變數以支援搜尋結果分頁
  totalElements = totalCount;
  totalPages = Math.ceil(totalCount / pageSize);

  // 更新分頁 - 使用搜尋結果專用的分頁控制
  renderSearchResultPaginationControls();
}

// 渲染分頁控制 - 日式優雅設計
function renderSearchPaginationControls() {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;
  
  let html = '';
  
  // 只有多於一頁時才顯示分頁控制
  if (totalPages > 1) {
    html += '<div class="pagination-wrapper">';
    
    // 計算要顯示的頁碼範圍
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 3);
    
    // 如果當前頁接近開始，多顯示幾頁
    if (currentPage <= 2) {
      endPage = Math.min(totalPages, 4);
    }
    
    // 如果當前頁接近結束，往前多顯示幾頁
    if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - 3);
    }
    
    // 生成頁碼按鈕
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage + 1;
      html += `<button class="page-number ${isActive ? 'active' : ''}" data-page="${i - 1}">${i}</button>`;
    }
    
    // 下一頁箭頭 - 只有不在最後一頁時才顯示
    if (currentPage < totalPages - 1) {
      html += `<button class="page-arrow next-arrow" data-page="${currentPage + 1}">></button>`;
    }
    
    html += '</div>';
    
    paginationContainer.innerHTML = html;
    
    // 綁定頁碼按鈕事件
    const pageButtons = paginationContainer.querySelectorAll('.page-number, .page-arrow');
    pageButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.dataset.page);
        if (targetPage >= 0 && targetPage < totalPages && targetPage !== currentPage) {
          currentPage = targetPage;
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
    });
  } else {
    // 如果只有一頁或沒有資料，不顯示分頁控制
    paginationContainer.innerHTML = '';
  }
}

// 搜尋結果專用的分頁控制 - 日式優雅設計
function renderSearchResultPaginationControls() {
  const paginationContainer = document.querySelector('.pagination');
  if (!paginationContainer) return;
  
  let html = '';
  
  // 只有搜尋結果需要分頁時才顯示
  if (totalPages > 1) {
    html += '<div class="pagination-wrapper">';
    
    // 計算要顯示的頁碼範圍
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 3);
    
    // 如果當前頁接近開始，多顯示幾頁
    if (currentPage <= 2) {
      endPage = Math.min(totalPages, 4);
    }
    
    // 如果當前頁接近結束，往前多顯示幾頁
    if (currentPage >= totalPages - 1) {
      startPage = Math.max(1, totalPages - 3);
    }
    
    // 生成頁碼按鈕
    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === currentPage;
      html += `<button class="page-number ${isActive ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // 下一頁箭頭 - 只有不在最後一頁時才顯示
    if (currentPage < totalPages) {
      html += `<button class="page-arrow next-arrow" data-page="${currentPage + 1}">></button>`;
    }
    
    html += '</div>';
    
    paginationContainer.innerHTML = html;
    
    // 綁定頁碼按鈕事件
    const pageButtons = paginationContainer.querySelectorAll('.page-number, .page-arrow');
    pageButtons.forEach(btn => {
      if (!btn.hasEventListener) {
        btn.hasEventListener = true;
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.page);
          if (targetPage >= 1 && targetPage <= totalPages && targetPage !== currentPage) {
            currentPage = targetPage;
            const start = (currentPage - 1) * pageSize;
            const end = start + pageSize;
            const pageData = currentDisplayedRestaurants.slice(start, end);
            renderFilteredCards(pageData, currentDisplayedRestaurants.length);
            // 滾動到頁面頂部
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
      }
    });
  } else {
    paginationContainer.innerHTML = '';
  }
}

// 添加 generateStars 函數（如果還沒有的話）
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

// 新增導航到詳情頁的函數
function navigateToDetail(restaurantData) {
  // 解析餐廳資料
  let restaurant;
  try {
    restaurant = JSON.parse(decodeURIComponent(restaurantData));
  } catch (error) {
    return;
  }
  
  // 使用餐廳 ID 跳轉，優先使用 placeId，否則使用 id
  const restaurantId = restaurant.placeId || restaurant.id;
  if (restaurantId) {
    window.location.href = `restaurantListDetail.html?restaurantId=${encodeURIComponent(restaurantId)}`;
  } else {
    // 如果沒有 ID，回退到原來的方式
    window.location.href = `restaurantListDetail.html?data=${restaurantData}`;
  }
}

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
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
    
    let url;
    const params = new URLSearchParams();
    
    // 添加分頁參數
    params.append('page', page);
    params.append('size', pageSize);
    
    // 如果有排序參數，使用排序 API，否則使用一般分頁 API
    if (sortType) {
        url = baseUrl + '/restaurants/sort';
        // 將排序類型轉換為後端期望的參數名稱
        let sortBy = '';
        switch (sortType) {
            case 'ratingDesc':
                sortBy = 'averageRating';
                break;
            case 'reviewCountDesc':
                sortBy = 'reviewCount';
                break;
            case 'createdAtDesc':
                sortBy = 'createdAt';
                break;
            default:
                sortBy = 'averageRating';
        }
        params.append('sortBy', sortBy);
    } else {
        // 使用一般分頁 API
        url = baseUrl + '/restaurants';
    }
    
    url += '?' + params.toString();
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let restaurants = [];
            
            // 檢查是否為分頁資料 (後端 API 回傳的是 Page 物件)
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
                return {
                    ...restaurant,
                    // 確保 createdAt 是字串格式
                    createdAt: restaurant.createdAt ? new Date(restaurant.createdAt).toISOString() : null,
                    // 確保數值型別正確
                    averageRating: restaurant.averageRating ? Number(restaurant.averageRating) : null,
                    reviewCount: restaurant.reviewCount ? Number(restaurant.reviewCount) : 0,
                    latitude: restaurant.latitude ? Number(restaurant.latitude) : null,
                    longitude: restaurant.longitude ? Number(restaurant.longitude) : null,
                    // 確保保留 googleReviews (分頁 API 可能沒有這個欄位)
                    googleReviews: restaurant.googleReviews || []
                };
            });
            
            // 更新當前顯示的餐廳列表（只存當前頁面的資料）
            currentDisplayedRestaurants = formattedData;
            
            // 渲染餐廳卡片
            renderRestaurants(formattedData);
            
            // 更新地圖標記
            updateMapMarkers(formattedData);
            
            // 渲染分頁控制
            renderSearchPaginationControls();
        })
        .catch(error => {
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
                // Silently handle JSON parsing errors
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
                <div class="yelp-row yelp-address-row" style="display: flex; gap: 12px; align-items: center;">
                    <div style="color: #666; font-size: 13px;">${restaurant.address || ''}</div>
                </div>
                <div class="yelp-row yelp-description-row" style="margin-top: 4px; padding-top: 8px; border-top: 1px solid #eee;">
                    <p style="font-size: 13px; color: #333; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${restaurant.description || ''}</p>
                </div>
            </div>
        `;

        // 添加點擊事件處理
        card.addEventListener('click', () => {
            // 確保 googleReviews 欄位正確帶入 localStorage
            const restaurantToSave = { ...restaurant };
            
            // 處理 googleReviews 欄位
            if (typeof restaurant.googleReviews === 'undefined' || restaurant.googleReviews === null) {
                if (typeof restaurant.google_reviews !== 'undefined' && restaurant.google_reviews !== null) {
                    restaurantToSave.googleReviews = restaurant.google_reviews;
                } else {
                    restaurantToSave.googleReviews = []; // 確保不是 null，而是空陣列
                }
            }
            
            // 直接存完整物件
            localStorage.setItem('selectedRestaurant', JSON.stringify(restaurantToSave));
            // 導頁到餐廳詳情頁面
            window.location.href = 'restaurantListDetail.html';
        });

        container.appendChild(card);
    });
}