// 假資料 - 餐廳列表
const restaurants = [
  {
    id: 1,
    name: "鼎泰豐",
    type: "chinese",
    rating: 4.8,
    ratingCount: 1250,
    price: "200-450",
    location: "台北市信義區松高路12號",
    description: "知名小籠包專賣店，提供精緻的中式點心與料理。",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
    coordinates: { lat: 25.0330, lng: 121.5654 }
  },
  {
    id: 2,
    name: "敘敘苑",
    type: "japanese",
    rating: 4.6,
    ratingCount: 890,
    price: "800-1500",
    location: "台北市大安區敦化南路二段81號",
    description: "高級日式燒肉餐廳，提供頂級和牛與精緻料理。",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=500",
    coordinates: { lat: 25.0335, lng: 121.5497 }
  },
  {
    id: 3,
    name: "馬辣頂級麻辣鴛鴦火鍋",
    type: "hotpot",
    rating: 4.5,
    ratingCount: 2100,
    price: "500-800",
    location: "台北市大安區復興南路一段152號",
    description: "提供多種湯底選擇的麻辣火鍋，食材新鮮豐富。",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500",
    coordinates: { lat: 25.0338, lng: 121.5437 }
  },
  {
    id: 4,
    name: "韓味館",
    type: "korean",
    rating: 4.3,
    ratingCount: 750,
    price: "150-300",
    location: "台北市大安區延吉街137巷30號",
    description: "道地韓式料理，提供各式韓式烤肉與小菜。",
    image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500",
    coordinates: { lat: 25.0332, lng: 121.5537 }
  },
  {
    id: 5,
    name: "Smith & Wollensky",
    type: "western",
    rating: 4.7,
    ratingCount: 680,
    price: "1200-2500",
    location: "台北市信義區松智路17號",
    description: "美式頂級牛排館，提供優質牛排與海鮮料理。",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
    coordinates: { lat: 25.0339, lng: 121.5650 }
  }
];

// Google Maps 相關變數
let map;
let markers = [];
let userLocation = null;

// 新增一個變數來儲存當前顯示的餐廳列表（經過篩選和排序後）
let currentDisplayedRestaurants = [];

// 添加全局變量來追踪當前狀態
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
    markers.forEach(marker => marker.map = null);
    markers = [];

    // 創建一個全局的 InfoWindow 實例
    const infoWindow = new google.maps.InfoWindow();

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // 添加新標記
    for (const restaurant of restaurants) {
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
            position: restaurant.coordinates,
            title: restaurant.name,
            content: markerContent
        });

        // 添加點擊事件監聽器
        marker.addListener("click", () => {
            // 關閉所有已開啟的資訊視窗
            infoWindow.close();
            
            // 設置新的資訊視窗內容，添加可點擊的樣式和事件
            const infoContent = document.createElement('div');
            infoContent.style.padding = '8px';
            infoContent.style.cursor = 'pointer'; // 添加指針樣式
            infoContent.innerHTML = `
                <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; color: #333;">${restaurant.name}</h3>
                    <p style="margin: 0; color: #666;">${restaurant.rating} ⭐ (${restaurant.ratingCount} 則評論)</p>
                    <p style="margin: 4px 0; color: #666;">${restaurant.price} · ${restaurant.tags.join(', ')}</p>
                    <div style="margin-top: 8px; color: #d32323; font-size: 13px;">
                        點擊查看詳細資訊 →
                    </div>
                </div>
            `;

            // 添加點擊事件處理程序
            infoContent.addEventListener('click', () => {
                showRestaurantModal(restaurant);
            });
            
            // 開啟資訊視窗
            infoWindow.setContent(infoContent);
            infoWindow.open(map, marker);
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
  // 使用保存的標籤狀態
  const selectedTag = currentSelectedTag;
  
  // 獲取選中的價格範圍
  const selectedPrice = Array.from(document.querySelectorAll('input[type="checkbox"][value^="budget"], input[type="checkbox"][value^="moderate"], input[type="checkbox"][value^="expensive"]:checked'))
    .map(checkbox => checkbox.value);

  // 使用 restaurantData 作為篩選基礎
  let filtered = [...restaurantData];

  // 標籤篩選
  if (selectedTag && selectedTag !== 'all') {
    filtered = filtered.filter(restaurant => restaurant.tags.includes(selectedTag));
  }

  // 價格篩選
  if (selectedPrice.length > 0) {
    filtered = filtered.filter(restaurant => {
      const priceRange = restaurant.price.split('-').map(Number);
      const avgPrice = (priceRange[0] + priceRange[1]) / 2;
      
      if (selectedPrice.includes('budget') && avgPrice <= 300) return true;
      if (selectedPrice.includes('moderate') && avgPrice > 300 && avgPrice <= 800) return true;
      if (selectedPrice.includes('expensive') && avgPrice > 800) return true;
      return false;
    });
  }

  // 排序處理
  if (currentSortType) {
    switch (currentSortType) {
      case "rating":
        filtered.sort((a, b) => {
          const ratingDiff = b.rating - a.rating;
          if (ratingDiff !== 0) return ratingDiff;
          return b.ratingCount - a.ratingCount; // 評分相同時，評論數多的排在前面
        });
        break;
      case "rating-count":
        filtered.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.openDate) - new Date(a.openDate));
        break;
      case "distance":
        // 距離排序邏輯（待實現）
        break;
    }
  }

  // 更新當前顯示的餐廳列表
  currentDisplayedRestaurants = filtered;
  
  // 重置到第一頁並渲染結果
  currentPage = 1;
  const pageData = currentDisplayedRestaurants.slice(0, pageSize);
  renderFilteredCards(pageData, currentDisplayedRestaurants.length);

  // 更新地圖標記
  updateMapMarkers(currentDisplayedRestaurants);
}

// 計算兩點間距離（簡化版）
function getDistance(point1, point2) {
  const R = 6371; // 地球半徑（公里）
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLon = (point2.lng - point1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) * 
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

  // 使用 restaurantData 作為搜尋基礎
  let filtered = restaurantData.filter(restaurant => {
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

// 將 restaurantData 宣告移到文件頂部，並移除其他重複宣告
let restaurantData = [
  {
    name: "鼎泰豐",
    image: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.8,
    ratingCount: 1250,
    tags: ["中式", "茶樓"],
    address: "台北市信義區松高路12號",
    review: "小籠包皮薄餡多，湯汁豐富，服務人員專業親切。",
    reviewer: "王小明",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=200"
  },
  {
    name: "敘敘苑",
    image: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.6,
    ratingCount: 890,
    tags: ["日式", "燒肉"],
    address: "台北市大安區敦化南路二段81號",
    review: "和牛品質極佳，服務周到，環境舒適。",
    reviewer: "陳美麗",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=200"
  },
  {
    name: "馬辣頂級麻辣鴛鴦火鍋",
    image: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=600",
    price: "500-800",
    rating: 4.5,
    ratingCount: 2100,
    tags: ["火鍋"],
    address: "台北市大安區復興南路一段152號",
    review: "湯底香濃，食材新鮮豐富。",
    reviewer: "林大華",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=200"
  },
  {
    name: "韓味館",
    image: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.3,
    ratingCount: 750,
    tags: ["韓式"],
    address: "台北市大安區延吉街137巷30號",
    review: "道地韓式料理，小菜種類豐富。",
    reviewer: "張淑芬",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=200"
  },
  {
    name: "Smith & Wollensky",
    image: "https://images.pexels.com/photos/6940978/pexels-photo-6940978.jpeg?auto=compress&w=600",
    price: "1200-2500",
    rating: 4.7,
    ratingCount: 680,
    tags: ["美式", "牛排"],
    address: "台北市信義區松智路17號",
    review: "牛排品質極佳，服務專業，景觀優美。",
    reviewer: "黃志明",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940978/pexels-photo-6940978.jpeg?auto=compress&w=200"
  },
  {
    name: "添好運",
    image: "https://images.pexels.com/photos/6940979/pexels-photo-6940979.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.4,
    ratingCount: 1680,
    tags: ["港式", "茶樓"],
    address: "台北市信義區松高路12號",
    review: "點心精緻，價格實惠，值得一試。",
    reviewer: "吳怡君",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940979/pexels-photo-6940979.jpeg?auto=compress&w=200"
  },
  {
    name: "海底撈",
    image: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.6,
    ratingCount: 3200,
    tags: ["火鍋"],
    address: "台北市信義區松壽路12號",
    review: "服務貼心，湯底選擇多，食材新鮮。",
    reviewer: "徐志摩",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=200"
  },
  {
    name: "饗食天堂",
    image: "https://images.pexels.com/photos/6940981/pexels-photo-6940981.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: 2800,
    tags: ["自助餐"],
    address: "台北市信義區松壽路12號",
    review: "菜色豐富，海鮮新鮮，甜點精緻。",
    reviewer: "高雅雯",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940981/pexels-photo-6940981.jpeg?auto=compress&w=200"
  },
  {
    name: "MOS BURGER 摩斯漢堡",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: 4200,
    tags: ["美式", "速食"],
    address: "台北市大安區忠孝東路四段45號",
    review: "漢堡新鮮美味，服務快速。",
    reviewer: "曾國城",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200"
  },
  {
    name: "一蘭拉麵",
    image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.4,
    ratingCount: 1950,
    tags: ["日式", "拉麵"],
    address: "台北市信義區松壽路11號",
    review: "湯頭濃郁，麵條Q彈，宵夜首選。",
    reviewer: "葉問",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=200"
  },
  {
    name: "老張牛肉麵",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.3,
    ratingCount: 1580,
    tags: ["中式"],
    address: "台北市大安區忠孝東路四段123號",
    review: "湯頭濃郁，牛肉軟嫩，份量十足。",
    reviewer: "李小龍",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0410, lng: 121.5440 } // Added coordinates
  },
  {
    name: "老乾杯",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.6,
    ratingCount: 920,
    tags: ["日式", "燒肉"],
    address: "台北市大安區敦化南路一段161號",
    review: "肉質鮮美，服務周到，氣氛佳。",
    reviewer: "周杰倫",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0400, lng: 121.5520 } // Added coordinates
  },
  {
    name: "金峰魯肉飯",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: 3800,
    tags: ["台式"],
    address: "台北市中正區羅斯福路一段10號",
    review: "魯肉香氣十足，米飯粒粒分明。",
    reviewer: "蔡依林",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0350, lng: 121.5150 } // Added coordinates
  },
  {
    name: "屋馬燒肉",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.7,
    ratingCount: 1450,
    tags: ["日式", "燒肉"],
    address: "台北市松山區南京東路四段133號",
    review: "肉質鮮嫩，環境舒適，適合聚餐。",
    reviewer: "五月天",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0530, lng: 121.5480 } // Added coordinates
  },
  {
    name: "TGI Friday's",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: 2100,
    tags: ["美式"],
    address: "台北市信義區松壽路11號",
    review: "氣氛熱鬧，餐點多樣，適合朋友聚會。",
    reviewer: "林俊傑",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0370, lng: 121.5660 } // Added coordinates
  },
  {
    name: "義大利麵工房",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.2,
    ratingCount: 1680,
    tags: ["義式"],
    address: "台北市大同區迪化街234號",
    review: "麵條彈牙，醬汁濃郁，份量足。",
    reviewer: "孫燕姿",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0600, lng: 121.5090 } // Added coordinates
  },
  {
    name: "綠色蔬食",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.4,
    ratingCount: 980,
    tags: ["素食"],
    address: "台北市士林區文林路78號",
    review: "蔬菜新鮮，口味多元，健康美味。",
    reviewer: "蘇打綠",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0900, lng: 121.5240 } // Added coordinates
  },
  {
    name: "養心茶樓",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.6,
    ratingCount: 1250,
    tags: ["素食", "茶樓", "港式"],
    address: "台北市大安區忠孝東路四段169號",
    review: "茶點精緻，環境優雅，適合聚會。",
    reviewer: "魚丁糸",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0400, lng: 121.5530 } // Added coordinates
  },
  {
    name: "Olive Garden",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: 1580,
    tags: ["義式"],
    address: "台北市大安區忠孝東路四段45號",
    review: "義大利麵道地，沙拉新鮮。",
    reviewer: "伍佰",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0410, lng: 121.5430 } // Added coordinates
  },
  {
    name: "王品牛排",
    image: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: 2800,
    tags: ["牛排"],
    address: "台北市大安區敦化南路二段76號",
    review: "牛排多汁，服務細心，適合慶祝。",
    reviewer: "張惠妹",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5480 } // Added coordinates
  },
  {
    name: "春水堂",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["台式", "茶樓"],
    address: "台中市西區公益路68號",
    review: "珍珠奶茶發源地，茶香濃郁，輕食美味。",
    reviewer: "周華健",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.1472, lng: 120.6746 } // Added coordinates (Taichung)
  },
  {
    name: "瓦城泰國料理",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["泰式", "咖哩", "酸辣"],
    address: "台北市信義區松壽路12號",
    review: "泰式咖哩香辣開胃，服務親切。",
    reviewer: "梁靜茹",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "星巴克",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "連鎖", "輕食"],
    address: "台北市大安區忠孝東路四段45號",
    review: "咖啡香醇，環境舒適，適合辦公。",
    reviewer: "蕭敬騰",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0410, lng: 121.5440 } // Added coordinates
  },
  {
    name: "鼎王麻辣鍋",
    image: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "麻辣", "聚餐"],
    address: "台中市西屯區朝富路258號",
    review: "湯底濃郁，肉品新鮮，適合多人聚餐。",
    reviewer: "林宥嘉",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.1710, lng: 120.6450 } // Added coordinates (Taichung)
  },
  {
    name: "路易莎咖啡",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "輕食", "連鎖"],
    address: "新北市板橋區文化路一段189號",
    review: "平價咖啡，輕食選擇多，環境舒適。",
    reviewer: "鄧紫棋",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0130, lng: 121.4620 } // Added coordinates (Banqiao)
  },
  {
    name: "漢堡王",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "速食", "漢堡"],
    address: "台北市信義區松壽路11號",
    review: "漢堡多汁，薯條酥脆，速食首選。",
    reviewer: "陳奕迅",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0370, lng: 121.5650 } // Added coordinates
  },
  {
    name: "八方雲集",
    image: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["中式", "鍋貼", "水餃"],
    address: "新北市板橋區中山路一段152號",
    review: "鍋貼酥脆，水餃多汁，平價美味。",
    reviewer: "楊丞琳",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0110, lng: 121.4650 } // Added coordinates (Banqiao)
  },
  {
    name: "美而美",
    image: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["早餐", "三明治", "台式"],
    address: "台北市大安區復興南路一段152號",
    review: "早餐多樣，三明治現做，經濟實惠。",
    reviewer: "羅志祥",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0338, lng: 121.5437 } // Added coordinates
  },
  {
    name: "大戶屋",
    image: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "定食", "健康"],
    address: "台北市信義區松高路12號",
    review: "定食健康，份量足，環境舒適。",
    reviewer: "田馥甄",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5654 } // Added coordinates
  },
  {
    name: "必勝客",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["義式", "披薩", "連鎖"],
    address: "台北市信義區松壽路12號",
    review: "披薩多樣，口味豐富，適合聚餐。",
    reviewer: "林志玲",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "麥當勞",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "速食", "漢堡"],
    address: "台北市大安區敦化南路二段81號",
    review: "速食經典，薯條好吃，兒童最愛。",
    reviewer: "彭于晏",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0335, lng: 121.5497 } // Added coordinates
  },
  {
    name: "三商巧福",
    image: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["中式", "牛肉麵", "連鎖"],
    address: "台北市信義區松智路17號",
    review: "牛肉麵湯頭濃郁，麵條Q彈。",
    reviewer: "柯震東",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0339, lng: 121.5650 } // Added coordinates
  },
  {
    name: "CoCo都可",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["飲料", "手搖", "連鎖"],
    address: "台北市大安區延吉街137巷30號",
    review: "飲料選擇多，珍珠Q彈，價格實惠。",
    reviewer: "郭采潔",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0332, lng: 121.5537 } // Added coordinates
  },
  {
    name: "壽司郎",
    image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "壽司", "連鎖"],
    address: "台北市信義區松高路12號",
    review: "壽司新鮮，價格親民，適合家庭。",
    reviewer: "陳柏霖",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5654 } // Added coordinates
  },
  {
    name: "肯德基",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "炸雞", "速食"],
    address: "台北市大安區敦化南路二段81號",
    review: "炸雞酥脆，套餐多樣，速食經典。",
    reviewer: "桂綸鎂",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0335, lng: 121.5497 } // Added coordinates
  },
  {
    name: "小蒙牛",
    image: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "吃到飽", "牛肉"],
    address: "台北市信義區松壽路12號",
    review: "火鍋吃到飽，肉品新鮮，適合聚餐。",
    reviewer: "張孝全",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "樂檸漢堡",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "漢堡", "輕食"],
    address: "新竹市東區光復路二段123號",
    review: "漢堡新鮮，蔬菜爽脆，飲品好喝。",
    reviewer: "鳳小岳",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.8030, lng: 120.9960 } // Added coordinates (Hsinchu)
  },
  {
    name: "大心新泰式麵食",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["泰式", "麵食", "酸辣"],
    address: "台北市信義區松壽路12號",
    review: "泰式麵食酸辣開胃，湯頭濃郁。",
    reviewer: "許瑋甯",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "四海遊龍",
    image: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["中式", "鍋貼", "連鎖"],
    address: "台北市大安區復興南路一段152號",
    review: "鍋貼皮脆餡多，價格實惠。",
    reviewer: "簡嫚書",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0338, lng: 121.5437 } // Added coordinates
  },
  {
    name: "85度C",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "蛋糕", "連鎖"],
    address: "台北市信義區松高路12號",
    review: "咖啡香醇，蛋糕精緻，適合下午茶。",
    reviewer: "張書豪",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5654 } // Added coordinates
  },
  {
    name: "茹絲葵牛排館",
    image: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.7,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["牛排", "高級", "西式"],
    address: "台北市信義區松壽路12號",
    review: "牛排多汁，服務細心，適合慶祝。",
    reviewer: "郝蕾",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "爭鮮迴轉壽司",
    image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "壽司", "連鎖"],
    address: "台北市信義區松高路12號",
    review: "壽司新鮮，價格親民，適合家庭。",
    reviewer: "秦昊",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5654 } // Added coordinates
  },
  {
    name: "花月嵐拉麵",
    image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "拉麵", "深夜食堂"],
    address: "台北市萬華區中華路一段114號",
    review: "湯頭濃郁，麵條Q彈，宵夜首選。",
    reviewer: "伊能靜",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0450, lng: 121.5090 } // Added coordinates (Wanhua)
  },
  {
    name: "添好運港式飲茶",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["港式", "點心", "米其林"],
    address: "台北市信義區松高路12號",
    review: "點心精緻，價格實惠，值得一試。",
    reviewer: "鍾麗緹",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0330, lng: 121.5654 } // Added coordinates
  },
  {
    name: "海底撈火鍋",
    image: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.6,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "麻辣", "服務"],
    address: "台北市信義區松壽路12號",
    review: "服務貼心，湯底選擇多，食材新鮮。",
    reviewer: "張智霖",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "饗食天堂自助餐",
    image: "https://images.pexels.com/photos/6940981/pexels-photo-6940981.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["自助餐", "海鮮", "甜點"],
    address: "台北市信義區松壽路12號",
    review: "菜色豐富，海鮮新鮮，甜點精緻。",
    reviewer: "袁詠儀",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940981/pexels-photo-6940981.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0360, lng: 121.5670 } // Added coordinates
  },
  {
    name: "王品石二鍋",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "台式", "連鎖"],
    address: "台中市西區公益路88號",
    review: "平價火鍋，湯頭清爽，蔬菜新鮮。",
    reviewer: "任賢齊",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.1475, lng: 120.6740 } // Added coordinates (Taichung)
  },
  {
    name: "TASTY西堤牛排",
    image: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["牛排", "西式", "連鎖"],
    address: "台北市信義區松壽路18號",
    review: "牛排多汁，套餐豐富，適合聚餐。",
    reviewer: "陳曉東",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0375, lng: 121.5680 } // Added coordinates
  },
  {
    name: "壽司郎台北館前店",
    image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "壽司", "連鎖"],
    address: "台北市中正區館前路8號",
    review: "壽司新鮮，價格實惠，適合家庭。",
    reviewer: "梁詠琪",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0470, lng: 121.5170 } // Added coordinates (Zhongzheng)
  },
  {
    name: "貳樓餐廳",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "早午餐", "聚會"],
    address: "台北市大安區敦化南路二段63號",
    review: "早午餐豐盛，氣氛溫馨，適合聚會。",
    reviewer: "楊千嬅",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0345, lng: 121.5500 } // Added coordinates
  },
  {
    name: "大戶屋日式定食",
    image: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "定食", "健康"],
    address: "台北市信義區松高路15號",
    review: "定食健康，份量足，環境舒適。",
    reviewer: "吳彥祖",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0335, lng: 121.5658 } // Added coordinates
  },
  {
    name: "小蒙牛頂級麻辣鍋",
    image: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "吃到飽", "牛肉"],
    address: "台北市信義區松壽路20號",
    review: "火鍋吃到飽，肉品新鮮，適合聚餐。",
    reviewer: "古天樂",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940980/pexels-photo-6940980.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0365, lng: 121.5685 } // Added coordinates
  },
  {
    name: "樂檸漢堡新竹店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "漢堡", "輕食"],
    address: "新竹市東區光復路二段200號",
    review: "漢堡新鮮，蔬菜爽脆，飲品好喝。",
    reviewer: "鳳小岳",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.8035, lng: 120.9970 } // Added coordinates (Hsinchu)
  },
  {
    name: "大心新泰式麵食台北店",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["泰式", "麵食", "酸辣"],
    address: "台北市信義區松壽路22號",
    review: "泰式麵食酸辣開胃，湯頭濃郁。",
    reviewer: "許瑋甯",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0368, lng: 121.5690 } // Added coordinates
  },
  {
    name: "四海遊龍鍋貼專賣店",
    image: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["中式", "鍋貼", "連鎖"],
    address: "台北市大安區復興南路一段200號",
    review: "鍋貼皮脆餡多，價格實惠。",
    reviewer: "簡嫚書",
    isVerified: false,
    reviewImage: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0340, lng: 121.5445 } // Added coordinates
  },
  {
    name: "85度C咖啡蛋糕店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "蛋糕", "連鎖"],
    address: "台北市信義區松高路20號",
    review: "咖啡香醇，蛋糕精緻，適合下午茶。",
    reviewer: "張學友",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0338, lng: 121.5660 } // Added coordinates
  },
  {
    name: "春水堂台中公益店",
    image: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["台式", "茶樓"],
    address: "台中市西區公益路100號",
    review: "珍珠奶茶發源地，茶香濃郁，輕食美味。",
    reviewer: "譚詠麟",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/461382/pexels-photo-461382.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.1480, lng: 120.6750 } // Added coordinates (Taichung)
  },
  {
    name: "瓦城泰國料理信義店",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.4,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["泰式", "咖哩", "酸辣"],
    address: "台北市信義區松壽路24號",
    review: "泰式咖哩香辣開胃，服務親切。",
    reviewer: "梅艷芳",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0372, lng: 121.5695 } // Added coordinates
  },
  {
    name: "星巴克台北101店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "連鎖", "輕食"],
    address: "台北市信義區市府路45號",
    review: "咖啡香醇，環境舒適，適合辦公。",
    reviewer: "張國榮",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0345, lng: 121.5645 } // Added coordinates (Near Taipei 101)
  },
  {
    name: "鼎王麻辣鍋台中朝富店",
    image: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=600",
    price: "800-1500",
    rating: 4.5,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["火鍋", "麻辣", "聚餐"],
    address: "台中市西屯區朝富路300號",
    review: "湯底濃郁，肉品新鮮，適合多人聚餐。",
    reviewer: "陳百強",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940976/pexels-photo-6940976.jpeg?auto=compress&w=200",
    coordinates: { lat: 24.1715, lng: 120.6460 } // Added coordinates (Taichung)
  },
  {
    name: "路易莎咖啡板橋文化店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["咖啡", "輕食", "連鎖"],
    address: "新北市板橋區文化路一段300號",
    review: "平價咖啡，輕食選擇多，環境舒適。",
    reviewer: "王菲",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0135, lng: 121.4630 } // Added coordinates (Banqiao)
  },
  {
    name: "漢堡王信義店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "速食", "漢堡"],
    address: "台北市信義區松壽路30號",
    review: "漢堡多汁，薯條酥脆，速食首選。",
    reviewer: "那英",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0378, lng: 121.5700 } // Added coordinates
  },
  {
    name: "八方雲集鍋貼水餃店",
    image: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.2,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["中式", "鍋貼", "水餃"],
    address: "新北市板橋區中山路一段300號",
    review: "鍋貼酥脆，水餃多汁，平價美味。",
    reviewer: "李宗盛",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940974/pexels-photo-6940974.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0115, lng: 121.4660 } // Added coordinates (Banqiao)
  },
  {
    name: "美而美早餐店",
    image: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["早餐", "三明治", "台式"],
    address: "台北市大安區復興南路一段300號",
    review: "早餐多樣，三明治現做，經濟實惠。",
    reviewer: "周華健",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940975/pexels-photo-6940975.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0342, lng: 121.5440 } // Added coordinates
  },
  {
    name: "大戶屋台北信義店",
    image: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.3,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["日式", "定食", "健康"],
    address: "台北市信義區松高路30號",
    review: "定食健康，份量足，環境舒適。",
    reviewer: "任賢齊",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0340, lng: 121.5665 } // Added coordinates
  },
  {
    name: "必勝客松壽店",
    image: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=600",
    price: "200-450",
    rating: 4.0,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["義式", "披薩", "連鎖"],
    address: "台北市信義區松壽路32號",
    review: "披薩多樣，口味豐富，適合聚餐。",
    reviewer: "梁靜茹",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0380, lng: 121.5710 } // Added coordinates
  },
  {
    name: "麥當勞敦化南店",
    image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=600",
    price: "150-300",
    rating: 4.1,
    ratingCount: Math.floor(Math.random() * 5000) + 100,
    tags: ["美式", "速食", "漢堡"],
    address: "台北市大安區敦化南路二段100號",
    review: "速食經典，薯條好吃，兒童最愛。",
    reviewer: "蕭敬騰",
    isVerified: true,
    reviewImage: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&w=200",
    coordinates: { lat: 25.0340, lng: 121.5505 } // Added coordinates
  }
];

// Make restaurantData globally accessible
window.fullRestaurantData = restaurantData;

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
  currentDisplayedRestaurants = shuffleArray([...restaurantData]);
  
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

// 檢查用戶是否已登入
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// 顯示登入窗口
function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) {
        loginModal.style.display = 'block';
    }
}

// 處理收藏按鈕點擊
async function handleFavoriteClick(button, placeId) {
    // 檢查收藏系統是否已初始化
    if (!window.favoriteSystem) {
        console.error('收藏系統未初始化');
        showToast('收藏系統初始化失敗，請重新整理頁面');
        return;
    }

    const placeId = button.getAttribute('data-place-id');
    const restaurantName = button.getAttribute('data-name');

    if (!placeId) {
        console.error('找不到餐廳ID');
        return;
    }

    // 檢查是否已收藏
    const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
    
    try {
        if (isFavorited) {
            // 如果已收藏，則移除收藏
            await window.favoriteSystem.removeStore(placeId);
            button.querySelector('i').classList.replace('fas', 'far');
            button.classList.remove('active');
            showToast('已取消收藏');
        } else {
            // 如果未收藏，則添加收藏
            const storeData = {
                id: placeId,
                name: restaurantName,
                favoriteTime: new Date().toISOString()
            };
            await window.favoriteSystem.addStore(storeData);
            button.querySelector('i').classList.replace('far', 'fas');
            button.classList.add('active');
            showToast('已加入收藏');
        }
    } catch (error) {
        console.error('收藏操作失敗:', error);
        showToast('收藏操作失敗，請稍後再試');
    }
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
  restaurantData.forEach(restaurant => {
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
  restaurantData.forEach(restaurant => {
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
  // 保存當前選中的餐廳，供其他函數使用
  window.currentSelectedRestaurant = restaurant;
  
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
  
  // 獲取今天是星期幾
  const today = new Date().getDay();
  const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][today];
  
  // 設置營業時間
  let businessHoursHtml = '';
  if (restaurant.businessHours) {
    businessHoursHtml = `
      <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
        <i class="fas fa-clock" style="color: #666; width: 20px;"></i>
        <span>${restaurant.businessHours || '週一至週日 11:00-22:00'}</span>
        <div class="modal-hours-info-btn" onclick="window.showWeeklyHoursModal()">
          <i class="fas fa-info-circle"></i>
          <span>完整時間</span>
        </div>
      </div>
    `;
  } else {
    businessHoursHtml = `
      <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
        <i class="fas fa-clock" style="color: #666; width: 20px;"></i>
        <span>${dayName} 11:00-22:00</span>
        <div class="modal-hours-info-btn" onclick="window.showWeeklyHoursModal()">
          <i class="fas fa-info-circle"></i>
          <span>完整時間</span>
        </div>
      </div>
    `;
  }
  
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
               style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
            ${businessHoursHtml}
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
 
  const cardsContainer = document.getElementById('restaurant-cards');
  if (!cardsContainer) return;

  const cards = pageData.map(restaurant => {
    // 星星評分
    const fullStars = Math.floor(restaurant.rating);
    const halfStar = restaurant.rating % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fas fa-star"></i>';
    }
    if (halfStar) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    // 標籤
    const tagHtml = (restaurant.tags || []).map(tag => {
      
      let tagClass = 'tag-food', icon = 'fa-utensils';
      if (tag.includes('酒吧') || tag.includes('bar')) { tagClass = 'tag-bar'; icon = 'fa-glass-martini-alt'; }
      return `<span class="tag ${tagClass}"><i class="fas ${icon}"></i>${tag}</span>`;
      
    }).join('');

    // ====== robust 營業狀態判斷 ======
    let isOpen = false;
    let todayHours = '';
    let statusHtml = '';
    let jsDay = new Date().getDay();
    // 修正：Google API 的 weekday_text 順序是 [週一, 週二, ..., 週日]
    // 所以需要將 JavaScript 的 day (0=週日, 1=週一, ...) 轉換為 weekday_text 的索引
    let weekdayIndex = jsDay === 0 ? 6 : jsDay - 1;
    if (restaurant.opening_hours) {
      if (typeof restaurant.opening_hours.isOpen === 'function') {
        isOpen = restaurant.opening_hours.isOpen();
      } else if (restaurant.opening_hours.open_now !== undefined) {
        isOpen = restaurant.opening_hours.open_now;
      } else if (restaurant.opening_hours.weekday_text) {
        const todayText = restaurant.opening_hours.weekday_text[weekdayIndex];
        let timePart = todayText.split(':')[1]?.trim();
        if (!timePart) timePart = todayText.split('：')[1]?.trim();
        
        // 顯示今日營業時間，不管是否營業中
        const dayName = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][jsDay];
        todayHours = `<span class='status-hours'><i class='fas fa-clock'></i> ${dayName} ${timePart || '休息'}</span>`;
        
        if (timePart && !/休息|公休|無營業/.test(timePart)) {
          let fixedTimePart = timePart.replace(/：/g, ':').replace(/[－—–]/g, '-');
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const periods = fixedTimePart.split(',');
          
          // 添加調試信息
          console.log('[restaurantList] 營業時間判斷:', {
              timePart: timePart,
              fixedTimePart: fixedTimePart,
              now: now.toLocaleTimeString(),
              nowMinutes: nowMinutes,
              periods: periods
          });
          
          isOpen = false; // 預設為休息中，如果符合任一時段則設為營業中
          
          for (let period of periods) {
            period = period.trim();
            const [start, end] = period.split('-').map(s => s.trim());
            if (start && end) {
              // 使用更嚴格的解析方式
              const startParts = start.split(':');
              const endParts = end.split(':');
              
              const startH = parseInt(startParts[0], 10) || 0;
              const startM = parseInt(startParts[1], 10) || 0;
              const endH = parseInt(endParts[0], 10) || 0;
              const endM = parseInt(endParts[1], 10) || 0;
              
              const startMin = startH * 60 + startM;
              const endMin = endH * 60 + endM;
              
              // 添加調試信息
              console.log('[restaurantList] 時段解析:', {
                  period: period,
                  start: start,
                  end: end,
                  startH: startH,
                  startM: startM,
                  endH: endH,
                  endM: endM,
                  startMin: startMin,
                  endMin: endMin
              });
              
              // 處理跨日的情況
              if (endH < startH || (endH === startH && endM < startM)) {
                // 例如 11:00-02:00 的情況
                console.log('[restaurantList] 跨日營業時間');
                // 將結束時間加上24小時的分鐘數
                endMin += 24 * 60;
                
                // 如果當前時間小於結束時間，需要將當前時間也加上24小時
                if (nowMinutes < endMin) {
                    const adjustedNowMinutes = nowMinutes + 24 * 60;
                    console.log('[restaurantList] 調整後的時間:', {
                        adjustedNowMinutes: adjustedNowMinutes,
                        endMin: endMin
                    });
                    
                    if (startMin <= nowMinutes || adjustedNowMinutes <= endMin) {
                        console.log('[restaurantList] 符合跨日營業條件 - 營業中');
                        isOpen = true;
                        break;
                    }
                } else {
                    if (startMin <= nowMinutes) {
                        console.log('[restaurantList] 符合跨日營業條件 - 營業中');
                        isOpen = true;
                        break;
                    }
                }
              } else {
                // 一般情況 如 09:00-22:00
                if (nowMinutes >= startMin && nowMinutes <= endMin) {
                  console.log('[restaurantList] 符合一般營業條件 - 營業中');
                  isOpen = true;
                  break;
                }
              }
            }
          }
          
          // 最終營業狀態
          console.log('[restaurantList] 最終營業狀態:', isOpen ? '營業中' : '休息中');
        } else {
          isOpen = false;
        }
      }
    }
    
    statusHtml = `
      <span class="status-dot ${isOpen ? 'open' : 'closed'}"></span>
      <span class="status-text ${isOpen ? 'open' : 'closed'}">${isOpen ? '營業中' : '休息中'}</span>
    `;
    // ====== END robust 營業狀態判斷 ======

    return `
      <div class="restaurant-card v3" data-id="${restaurant.id}">
        <div class="restaurant-image-wrapper" onclick="navigateToDetail('${encodeURIComponent(JSON.stringify(restaurant))}')">
          <img src="${restaurant.image}" alt="${restaurant.name}" loading="lazy">
        </div>
        <div class="restaurant-info">
          <div class="restaurant-title-row">
            <h3 class="restaurant-name">${restaurant.name}</h3>
            <button class="favorite-btn" title="加入收藏" data-place-id="${restaurant.id}" data-name="${restaurant.name.replace(/"/g, '&quot;')}">
              <i class="${window.favoriteSystem && window.favoriteSystem.isFavorite(restaurant.id) ? 'fas' : 'far'} fa-heart"></i>
            </button>
          </div>
          <div class="restaurant-rating-row">
            <span class="rating-stars">${starsHtml}</span>
            <span class="rating-score">${restaurant.rating}</span>
            <span class="rating-count">(${restaurant.ratingCount} 則評論)</span>
          </div>
          <div class="restaurant-address-row">
            <i class="fas fa-map-marker-alt"></i>
            <span>${restaurant.address}</span>
          </div>
          <div class="restaurant-tags-row">${tagHtml}</div>
          <div class="restaurant-status-row">
            ${statusHtml}
            ${todayHours || ''}
          </div>
        </div>
      </div>
    `;
  }).join("");

  cardsContainer.innerHTML = `
    <div class="results-count">顯示 ${pageData.length} 個結果，共 ${totalCount} 個</div>
    <div class="restaurants-grid">${cards}</div>
  `;

  renderPagination(totalCount);
  document.querySelectorAll('.favorite-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      const placeId = this.getAttribute('data-place-id');
      if (!placeId) {
        console.error('找不到餐廳ID');
        return;
      }
      handleFavoriteClick(this, placeId);
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

  // 使用 restaurantData 作為搜尋基礎
  let filtered = restaurantData.filter(restaurant => {
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

  // 確保每個餐廳都有唯一的 ID
  restaurantData.forEach((restaurant, index) => {
    if (!restaurant.id) {
      restaurant.id = `restaurant_${index}`;
    } else {
      // 確保 ID 是字符串，避免數字 ID 被視為相同
      restaurant.id = String(restaurant.id);
    }
    console.log(`餐廳 ID: ${restaurant.id}, 名稱: ${restaurant.name}`);
  });

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

  // 初始化下拉選單和標籤功能
  initializeDropdownAndTags();
});