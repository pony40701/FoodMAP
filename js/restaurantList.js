// 全域變數
let currentDisplayedRestaurants = [];
let map;
let markers = [];
let userLocation = null;
let currentSelectedTag = null;
let currentSortType = null;

// 初始化地圖
function initMap() {
  // 設定台北市中心為預設位置
  const taipei = { lat: 25.0330, lng: 121.5654 };
  
  // 創建地圖實例
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: taipei,
    mapTypeControl: false, // 隱藏地圖類型控制項
    styles: [
      {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [{"color": "#f5f5f5"}]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{"color": "#e9e9e9"}, {"lightness": 17}]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{"color": "#eeeeee"}]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [{"color": "#ffffff"}]
      }
    ]
  });

  // 如果有餐廳資料，可以在地圖上添加標記
  // 這裡可以根據實際餐廳資料來添加標記
  // 例如：
  // restaurants.forEach(restaurant => {
  //   new google.maps.Marker({
  //     position: { lat: restaurant.lat, lng: restaurant.lng },
  //     map: map,
  //     title: restaurant.name
  //   });
  // });

  // 初始載入地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 更新地圖標記
async function updateMapMarkers(restaurants) {
    // 清除現有標記
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // 創建一個全局的 InfoWindow 實例
    const infoWindow = new google.maps.InfoWindow();

    try {
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

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

            const position = new google.maps.LatLng(lat, lng);

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

            const marker = new AdvancedMarkerElement({
                map: map,
                position: position,
                title: restaurant.name,
                content: markerContent
            });

            // 添加點擊事件監聽器
            marker.addListener("click", () => {
                infoWindow.close();
                
                const infoContent = document.createElement('div');
                infoContent.style.padding = '8px';
                infoContent.style.cursor = 'pointer';
                infoContent.innerHTML = `
                    <div style="padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; color: #333;">${restaurant.name}</h3>
                        <p style="margin: 0; color: #666;">${restaurant.averageRating} ⭐ (${restaurant.reviewCount} 則評論)</p>
                        <p style="margin: 4px 0; color: #666;">${restaurant.types}</p>
                        <div style="margin-top: 8px; color: #d32323; font-size: 13px;">
                            點擊查看詳細資訊 →
                        </div>
                    </div>
                `;

                infoContent.addEventListener('click', () => {
                    showRestaurantDetail(restaurant.placeId);
                });
                
                infoWindow.setContent(infoContent);
                infoWindow.open(map, marker);
            });

            markers.push(marker);
        }
    } catch (error) {
        console.error('Error creating markers:', error);
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
  // 使用保存的標籤狀態
  const selectedTag = currentSelectedTag;
  
  // 使用 currentDisplayedRestaurants 作為篩選基礎
  let filtered = [...currentDisplayedRestaurants];

  // 標籤篩選
  if (selectedTag && selectedTag !== 'all') {
    filtered = filtered.filter(restaurant => restaurant.types === selectedTag);
  }

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

// 即時搜尋功能
function handleSearchInput() {
  const foodSearch = document.getElementById("food-search").value.toLowerCase();
  const locationSearch = document.getElementById("location-search").value.toLowerCase();

  // 使用 currentDisplayedRestaurants 作為搜尋基礎
  let filtered = currentDisplayedRestaurants.filter(restaurant => {
    const matchesFood = restaurant.name.toLowerCase().includes(foodSearch) ||
                       restaurant.tags.some(tag => tag.toLowerCase().includes(foodSearch)) ||
                       restaurant.description.toLowerCase().includes(foodSearch);
    const matchesLocation = restaurant.address.toLowerCase().includes(locationSearch);
    return matchesFood && matchesLocation;
  });

  // 儲存搜尋結果
  currentDisplayedRestaurants = filtered;
  
  // 重置到第一頁
  currentPage = 1;
  const pageData = currentDisplayedRestaurants.slice(0, pageSize);
  
  // 使用淡出淡入效果更新餐廳列表
  const restaurantList = document.querySelector('.restaurant-list');
  if (restaurantList) {
    // 淡出效果
    restaurantList.style.opacity = '0';
    restaurantList.style.transition = 'opacity 0.3s ease-in-out';
    
    setTimeout(() => {
      renderFilteredCards(pageData, currentDisplayedRestaurants.length);
      // 淡入效果
      restaurantList.style.opacity = '1';
    }, 300);
  }

  // 更新地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 使用防抖包裝搜尋函數
const debouncedSearch = debounce(handleSearchInput, 300);

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
      
      // 執行排序和篩選
      filterRestaurants();
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

// 分頁狀態
let currentPage = 1;
const pageSize = 10;
let currentSort = null; // 添加排序狀態變量

// 隨機打亂陣列的函數
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// renderCards function is used for initial load
function renderCards(page = 1) {
  currentPage = page;
  // On initial load, shuffle the restaurant data
  currentDisplayedRestaurants = shuffleArray([...currentDisplayedRestaurants]);
  
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

// 獲取所有不重複的標籤
function getAllUniqueTags() {
  // 定義要保留的餐廳類型標籤
  const validTags = new Set([
    '日式', '美式', '中式', '台式', '義式', '泰式', '港式', '韓式', '法式', '德式', '越式',
    '印度料理', '墨西哥料理', '燒肉', '火鍋', '牛排', '壽司', '拉麵', '自助餐', '素食',
    '茶樓', '咖啡廳', '速食', '早午餐', '下午茶'
  ]);

  // 更新所有餐廳的標籤
  currentDisplayedRestaurants.forEach(restaurant => {
    const newTags = [];
    restaurant.tags.forEach(tag => {
      if (validTags.has(tag)) {
        newTags.push(tag);
      }
    });
    // 如果沒有有效標籤，根據餐廳類型添加一個基本標籤
    if (newTags.length === 0) {
      if (restaurant.name.includes('火鍋')) newTags.push('火鍋');
      else if (restaurant.name.includes('牛排')) newTags.push('牛排');
      else if (restaurant.name.includes('壽司')) newTags.push('壽司');
      else if (restaurant.name.includes('拉麵')) newTags.push('拉麵');
      else if (restaurant.name.includes('咖啡')) newTags.push('咖啡廳');
      else if (restaurant.name.includes('茶樓') || restaurant.name.includes('飲茶')) newTags.push('茶樓');
      else if (restaurant.name.includes('燒肉')) newTags.push('燒肉');
      else if (restaurant.name.includes('泰式')) newTags.push('泰式');
      else if (restaurant.name.includes('韓式')) newTags.push('韓式');
      else if (restaurant.name.includes('義式') || restaurant.name.includes('披薩')) newTags.push('義式');
      else if (restaurant.name.includes('美式') || restaurant.name.includes('漢堡')) newTags.push('美式');
      else if (restaurant.name.includes('日式')) newTags.push('日式');
      else if (restaurant.name.includes('港式')) newTags.push('港式');
      else if (restaurant.name.includes('台式')) newTags.push('台式');
      else if (restaurant.name.includes('素食')) newTags.push('素食');
      else if (restaurant.name.includes('自助餐')) newTags.push('自助餐');
      else if (restaurant.name.includes('早午餐')) newTags.push('早午餐');
      else if (restaurant.name.includes('下午茶')) newTags.push('下午茶');
      else newTags.push('中式'); // 預設為中式
    }
    restaurant.tags = newTags;
  });

  const allTags = new Set();
  currentDisplayedRestaurants.forEach(restaurant => {
    restaurant.tags.forEach(tag => {
      if (validTags.has(tag)) {
        allTags.add(tag);
      }
    });
  });
  return Array.from(allTags).sort();
}

// 生成標籤選項的 HTML
function generateTagOptions() {
  const tags = getAllUniqueTags();
  const rows = [];
  // 獲取當前選中的標籤
  const selectedTag = document.querySelector('.tag-option.selected')?.dataset.type;

  // 修改為每行四個標籤
  for (let i = 0; i < tags.length; i += 4) {
    const rowTags = tags.slice(i, i + 4);
    const row = rowTags.map(tag => `
      <div class="tag-option${tag === selectedTag ? ' selected' : ''}" data-type="${tag}">
        <span>${tag}</span>
      </div>
    `).join('');
    rows.push(`<div class="tag-row">${row}</div>`);
  }
  return rows.join('');
}

// 更新下拉選單的 HTML 和事件監聽器
function updateDropdownMenu() {
  const dropdownContent = document.querySelector('.type-dropdown-menu');
  if (dropdownContent) {
    // 獲取當前選中的標籤
    const selectedTag = document.querySelector('.tag-option.selected')?.dataset.type;

    dropdownContent.innerHTML = `
      <div class="tag-grid">
        <div class="tag-header">
          <h4>選擇餐廳類型</h4>
        </div>
        <div class="tag-row">
          <div class="tag-option${selectedTag === 'all' ? ' selected' : ''}" data-type="all">
            <span>全部餐廳</span>
          </div>
        </div>
        ${generateTagOptions()}
      </div>
      <div class="tag-actions">
        <button class="apply-tags">套用篩選</button>
      </div>
    `;

    // 添加事件監聽器
    const tagOptions = dropdownContent.querySelectorAll('.tag-option');
    
    // 點擊標籤時切換選中狀態並立即執行篩選
    tagOptions.forEach(label => {
      label.addEventListener('click', function() {
        // 移除其他標籤的選中狀態
        tagOptions.forEach(otherLabel => {
          if (otherLabel !== this) {
            otherLabel.classList.remove('selected');
          }
        });
        
        // 切換當前標籤的選中狀態
        this.classList.toggle('selected');
        
        // 更新當前選中的標籤
        currentSelectedTag = this.dataset.type;
        
        // 更新按鈕文字
        const dropdownTrigger = document.querySelector('.type-dropdown-trigger');
        if (dropdownTrigger) {
          dropdownTrigger.textContent = this.dataset.type === 'all' ? '所有類型 ▼' : `${this.dataset.type} ▼`;
        }
        
        // 立即執行篩選
        filterRestaurants();
        
        // 關閉下拉選單
        document.querySelector('.dropdown-type').classList.remove('open');
      });
    });

    // 套用篩選按鈕點擊事件
    const applyTagsBtn = dropdownContent.querySelector('.apply-tags');
    if (applyTagsBtn) {
      applyTagsBtn.addEventListener('click', () => {
        filterRestaurants();
        document.querySelector('.dropdown-type').classList.remove('open');
      });
    }
  }
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

          <!-- 標籤區域 -->
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${restaurant.tags.map(tag => 
              `<span style="background: #f5f5f5; color: #666; padding: 6px 12px; border-radius: 20px; font-size: 14px;">${tag}</span>`
            ).join("")}
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
  console.log(`Rendering page with ${pageData.length} items. Total count: ${totalCount}`);
  
  const cardsContainer = document.getElementById('restaurant-cards');
  if (!cardsContainer) return;

  const cards = pageData.map(restaurant => `
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
        <div class="yelp-row yelp-tags-row" style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${restaurant.tags.map(tag => `<span class="yelp-tag" style="background: #f5f5f5; color: #666; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${tag}</span>`).join("")}
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
  `).join("");

  cardsContainer.innerHTML = `
    <div class="yelp-cards-list" style="max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px;">
      <div class="results-count">顯示 ${pageData.length} 個結果，共 ${totalCount} 個</div>
      ${cards}
    </div>
  `;

  // 更新分頁
  renderPagination(totalCount);

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

// 將 handleSearch 函數移到文件頂部，確保它在被調用前已定義
function handleSearch() {
  console.log('Search function triggered');

  const foodSearchInput = document.getElementById("food-search");
  const locationSearchInput = document.getElementById("location-search");
  
  if (!foodSearchInput || !locationSearchInput) {
    console.error('Search inputs not found');
    return;
  }

  const foodSearch = (foodSearchInput.value || '').toLowerCase();
  const locationSearch = (locationSearchInput.value || '').toLowerCase();
  
  console.log('Search terms:', { foodSearch, locationSearch });

  // 使用 currentDisplayedRestaurants 作為搜尋基礎
  let filtered = currentDisplayedRestaurants.filter(restaurant => {
    if (!restaurant) return false;

    const matchesFood = restaurant.name.toLowerCase().includes(foodSearch) ||
                       (restaurant.tags && restaurant.tags.some(tag => 
                         tag && tag.toLowerCase().includes(foodSearch))) ||
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

  console.log('Filtered results:', filtered.length);

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

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM Content Loaded');

  // 初始化地圖
  if (typeof google !== 'undefined' && google.maps) {
    initMap();
  }
  
  // 初始化下拉選單
  updateDropdownMenu();
  
  // 渲染初始餐廳列表
  renderCards(1);
  
  // 初始化搜尋按鈕功能
  const searchButton = document.querySelector('.search-btn');
  console.log('Search button element:', searchButton);
  
  if (searchButton) {
    searchButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Search button clicked');
      handleSearch();
    });
  } else {
    console.error('Search button not found!');
  }
  
  // 為搜尋輸入框添加 Enter 鍵事件
  const foodSearchInput = document.getElementById('food-search');
  const locationSearchInput = document.getElementById('location-search');
  
  console.log('Search input elements:', { foodSearchInput, locationSearchInput });
  
  if (foodSearchInput) {
    foodSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Enter pressed in food search');
        handleSearch();
      }
    });
  } else {
    console.error('Food search input not found!');
  }
  
  if (locationSearchInput) {
    locationSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        console.log('Enter pressed in location search');
        handleSearch();
      }
    });
  } else {
    console.error('Location search input not found!');
  }

  // ... rest of the initialization code ...
});

// ... existing code ...

// 初始化下拉選單和標籤功能
function initializeDropdownAndTags() {
  const dropdownTrigger = document.querySelector('.type-dropdown-trigger');
  const dropdownType = document.querySelector('.dropdown-type');
  const tagGrid = document.querySelector('.tag-grid');
  const applyTagsBtn = document.querySelector('.apply-tags');
  
  if (!dropdownTrigger || !dropdownType || !tagGrid) {
    console.error('Dropdown elements not found');
    return;
  }

  // 點擊觸發器時切換下拉選單
  dropdownTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownType.classList.toggle('open');
  });

  // 點擊其他地方時關閉下拉選單
  document.addEventListener('click', (e) => {
    if (!dropdownType.contains(e.target)) {
      dropdownType.classList.remove('open');
    }
  });

  // 生成標籤選項
  const uniqueTags = getAllUniqueTags();
  const tagRow = document.querySelector('.tag-row');
  
  if (tagRow) {
    uniqueTags.forEach(tag => {
      const tagOption = document.createElement('div');
      tagOption.className = 'tag-option';
      tagOption.dataset.type = tag;
      tagOption.innerHTML = `<span>${tag}</span>`;
      
      // 點擊標籤時切換選中狀態
      tagOption.addEventListener('click', () => {
        // 移除其他標籤的選中狀態
        document.querySelectorAll('.tag-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        // 選中當前標籤
        tagOption.classList.add('selected');
        // 更新當前選中的標籤
        currentSelectedTag = tag;
      });
      
      tagRow.appendChild(tagOption);
    });
  }

  // 套用篩選按鈕點擊事件
  if (applyTagsBtn) {
    applyTagsBtn.addEventListener('click', () => {
      filterRestaurants();
      dropdownType.classList.remove('open');
    });
  }
}

// 當 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  
  // 初始化下拉選單和標籤功能
  initializeDropdownAndTags();
  
  // ... existing code ...
});

// ... existing code ...

// 取代假資料，直接 fetch 後台 API
function fetchRestaurants() {
    fetch('http://localhost:8080/api/restaurants/list')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received restaurant data:', data); // 添加日誌
            
            // 確保資料格式正確
            const formattedData = data.map(restaurant => ({
                ...restaurant,
                // 確保 createdAt 是字串格式
                createdAt: restaurant.createdAt ? new Date(restaurant.createdAt).toISOString() : null,
                // 確保數值型別正確
                averageRating: restaurant.averageRating ? Number(restaurant.averageRating) : null,
                reviewCount: restaurant.reviewCount ? Number(restaurant.reviewCount) : 0,
                latitude: restaurant.latitude ? Number(restaurant.latitude) : null,
                longitude: restaurant.longitude ? Number(restaurant.longitude) : null
            }));
            
            console.log('Formatted restaurant data:', formattedData); // 添加日誌
            
            // 更新當前顯示的餐廳列表
            currentDisplayedRestaurants = formattedData;
            // 渲染餐廳卡片
            renderRestaurants(formattedData);
            // 更新地圖標記
            updateMapMarkers(formattedData);
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
    
    restaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card yelp-style';
        
        // 圖片來源改為 google_restaurant_photos 的 API
        let photoUrl = `http://localhost:8080/api/restaurant-images/${restaurant.placeId || restaurant.place_id}/raw`;
        card.innerHTML = `
            <div class="yelp-img-wrap">
                <img class="yelp-image" src="${photoUrl}" alt="${restaurant.name}" onerror="this.src='images/default-restaurant.jpg'">
            </div>
            <div class="yelp-info">
                <div class="yelp-title-row">
                    <h3 class="yelp-name">${restaurant.name}</h3>
                </div>
                <div class="yelp-rating-row">
                    <div class="stars">${generateStars(restaurant.averageRating)}</div>
                    <span class="rating-text">${restaurant.averageRating ? restaurant.averageRating.toFixed(1) : 'N/A'} (${restaurant.reviewCount || 0} 則評論)</span>
                </div>
                <div class="yelp-tags-row">
                    ${restaurant.types ? `<span class="yelp-tag">${restaurant.types}</span>` : ''}
                </div>
                <div class="yelp-price-row">
                    <span class="address">${restaurant.address || ''}</span>
                </div>
                <div class="yelp-review-row">
                    <p class="review-text">${restaurant.description || ''}</p>
                </div>
            </div>
        `;

        // 添加點擊事件處理
        card.addEventListener('click', () => {
            showRestaurantDetail(restaurant.placeId);
        });

        container.appendChild(card);
    });
}

fetchRestaurants();

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

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('頁面載入完成，開始獲取餐廳資料');
    fetchRestaurants();  // 添加這行來獲取餐廳資料
    
    // 初始化地圖
    initMap();
    
    // 初始化其他UI元素
    initSearchButton();
    initSearchInputs();
    initDropdowns();
    initTags();
});

// ... existing code ...

// 移除這行，因為我們已經在 DOMContentLoaded 中調用了
// fetchRestaurants();