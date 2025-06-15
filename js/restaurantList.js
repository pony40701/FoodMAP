// 全域變數
let map;
let service;
let infowindow;
let currentPosition;
let markers = [];
let currentRestaurants = [];

// 初始化地圖
function initMap() {
  console.log('開始初始化地圖');
  
  // 預設位置（台北市中心）
  const defaultLocation = { lat: 25.0330, lng: 121.5654 };
  
  try {
    // 創建地圖
    map = new google.maps.Map(document.getElementById('map'), {
      center: defaultLocation,
      zoom: 15,
      mapTypeControl: false
    });
    
    console.log('地圖創建成功');
    
    // 確保在地圖完全載入後才初始化 PlacesService
    google.maps.event.addListenerOnce(map, 'idle', function() {
      console.log('地圖載入完成，初始化 PlacesService');
      infowindow = new google.maps.InfoWindow();
      service = new google.maps.places.PlacesService(map);
      
      // 獲取使用者位置
      if (navigator.geolocation) {
        console.log('開始獲取使用者位置');
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('成功獲取使用者位置：', position);
            
            currentPosition = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // 建立標記顯示使用者位置
            new google.maps.Marker({
              position: currentPosition,
              map: map,
              title: '您的位置',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4285F4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });
            
            map.setCenter(currentPosition);
            searchNearbyRestaurants();
          },
          (error) => {
            console.error('獲取使用者位置失敗：', error);
            currentPosition = defaultLocation;
            searchNearbyRestaurants();
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        console.log('瀏覽器不支援地理位置功能，使用預設位置');
        currentPosition = defaultLocation;
        searchNearbyRestaurants();
      }
    });
  } catch (error) {
    console.error('初始化地圖時發生錯誤：', error);
  }
}

// 搜尋附近餐廳
function searchNearbyRestaurants() {
  if (!service) {
    console.error('Places Service 尚未初始化');
    return;
  }

  console.log('開始搜尋附近餐廳，當前位置：', currentPosition);
  
  const request = {
    location: new google.maps.LatLng(currentPosition.lat, currentPosition.lng),
    radius: 1500,
    type: 'restaurant'
  };

  console.log('搜尋請求參數：', request);

  // 添加延遲確保 service 已完全初始化
  setTimeout(() => {
    service.nearbySearch(request, (results, status) => {
      console.log('Places API 回應狀態：', status);
      console.log('搜尋結果：', results);

      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        currentRestaurants = results;
        console.log('成功獲取餐廳資料，數量：', results.length);
        clearMarkers();
        results.forEach(createMarker);
        renderRestaurantCards(results);
      } else {
        console.error('搜尋餐廳失敗，錯誤狀態：', status);
        document.getElementById('restaurant-cards').innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <p>抱歉，無法載入餐廳資料。請稍後再試。</p>
            <p>錯誤狀態：${status}</p>
          </div>
        `;
      }
    });
  }, 1000);
}

// 創建地圖標記
function createMarker(place) {
  const marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name
  });

  markers.push(marker);

  google.maps.event.addListener(marker, 'click', () => {
    // 獲取詳細資訊
    service.getDetails(
      {
        placeId: place.place_id,
        fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 'photos', 'reviews', 'opening_hours']
      },
      (placeDetails, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const content = `
            <div style="max-width: 300px;">
              <h3>${place.name}</h3>
              <p>評分: ${place.rating || '暫無評分'}</p>
              <p>地址: ${placeDetails.formatted_address || '暫無地址'}</p>
              <p>電話: ${placeDetails.formatted_phone_number || '暫無電話'}</p>
            </div>
          `;
          infowindow.setContent(content);
          infowindow.open(map, marker);
        }
      }
    );
  });
}

// 清除所有標記
function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}

// 渲染餐廳卡片
function renderRestaurantCards(restaurants) {
  console.log('開始渲染餐廳卡片，資料：', restaurants);
  
  const container = document.getElementById('restaurants-container');
  if (!container) {
    console.error('找不到 restaurants-container 容器元素');
    return;
  }
  
  container.innerHTML = '';

  if (!restaurants || restaurants.length === 0) {
    console.log('沒有餐廳資料可顯示');
    container.innerHTML = '<div style="text-align: center; padding: 20px;">此區域沒有找到餐廳</div>';
    return;
  }

  restaurants.forEach((restaurant, index) => {
    console.log(`處理第 ${index + 1} 個餐廳：`, restaurant.name);
    
    try {
      const photoUrl = restaurant.photos && restaurant.photos[0] ? 
        restaurant.photos[0].getUrl() : 
        'images/no-image.jpg';

      const card = `
        <div class="restaurant-card" data-place-id="${restaurant.place_id}">
          <div class="restaurant-image">
            <img src="${photoUrl}" alt="${restaurant.name}" onerror="this.src='images/no-image.jpg'">
            <button class="favorite-btn" onclick="toggleFavorite('${restaurant.place_id}')">
              <i class="far fa-heart"></i>
            </button>
          </div>
          <div class="restaurant-info">
            <h3 class="restaurant-name">${restaurant.name}</h3>
            <div class="rating-container">
              <div class="stars">
                ${getStarRating(restaurant.rating || 0)}
              </div>
              <span class="rating-text">${restaurant.rating || '暫無評分'} (${restaurant.user_ratings_total || 0})</span>
            </div>
            <div class="restaurant-tags">
              ${restaurant.types ? restaurant.types.slice(0, 3).map(type => `<span class="tag">${formatType(type)}</span>`).join('') : ''}
            </div>
            <div class="restaurant-footer">
              <span class="price-level">${getPriceLevel(restaurant.price_level)}</span>
              <span class="distance">${calculateDistance(restaurant.geometry.location)}</span>
            </div>
          </div>
        </div>
      `;
      container.innerHTML += card;
    } catch (error) {
      console.error(`渲染餐廳卡片時發生錯誤，餐廳名稱：${restaurant.name}`, error);
    }
  });
}

// 格式化餐廳類型
function formatType(type) {
  const typeMap = {
    'restaurant': '餐廳',
    'food': '美食',
    'cafe': '咖啡廳',
    'bar': '酒吧',
    // 可以根據需要添加更多類型映射
  };
  return typeMap[type] || type;
}

// 獲取星級評分HTML
function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let starsHtml = '';
  
  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      starsHtml += '<i class="fas fa-star"></i>';
    } else if (i === fullStars && halfStar) {
      starsHtml += '<i class="fas fa-star-half-alt"></i>';
    } else {
      starsHtml += '<i class="far fa-star"></i>';
    }
  }
  
  return starsHtml;
}

// 獲取價格等級顯示
function getPriceLevel(level) {
  if (!level) return '價格未提供';
  return '￥'.repeat(level);
}

// 計算與當前位置的距離
function calculateDistance(location) {
  if (!currentPosition || !location) return '';
  
  const distance = google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(currentPosition),
    location
  );
  
  if (distance < 1000) {
    return `${Math.round(distance)}m`;
  } else {
    return `${(distance / 1000).toFixed(1)}km`;
  }
}

// 顯示餐廳詳細資訊
function showRestaurantDetails(placeId) {
  service.getDetails(
    {
      placeId: placeId,
      fields: ['name', 'rating', 'formatted_address', 'formatted_phone_number', 'photos', 'reviews', 'opening_hours', 'website']
    },
    (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const modalContent = document.getElementById('modal-content-container');
        const photos = place.photos ? 
          place.photos.slice(0, 3).map(photo => `<img src="${photo.getUrl()}" style="width: 200px; height: 150px; object-fit: cover; margin: 5px;">`).join('') :
          '';
        
        const reviews = place.reviews ? 
          place.reviews.map(review => `
            <div style="margin-bottom: 15px;">
              <p><strong>${review.author_name}</strong> - ${review.rating}星</p>
              <p>${review.text}</p>
            </div>
          `).join('') :
          '<p>暫無評論</p>';

        modalContent.innerHTML = `
          <h2>${place.name}</h2>
          <div style="margin: 15px 0;">
            ${photos}
          </div>
          <p><strong>地址：</strong>${place.formatted_address || '暫無資料'}</p>
          <p><strong>電話：</strong>${place.formatted_phone_number || '暫無資料'}</p>
          <p><strong>評分：</strong>${place.rating || '暫無評分'} (${place.user_ratings_total || 0} 則評論)</p>
          ${place.website ? `<p><strong>網站：</strong><a href="${place.website}" target="_blank">${place.website}</a></p>` : ''}
          <h3>評論</h3>
          ${reviews}
        `;

        document.getElementById('restaurant-modal').style.display = 'flex';
      }
    }
  );
}

// 關閉餐廳詳細資訊視窗
function closeRestaurantModal() {
  document.getElementById('restaurant-modal').style.display = 'none';
}

// 搜尋處理函數
function handleSearch() {
  const foodQuery = document.getElementById('food-search').value;
  const locationQuery = document.getElementById('location-search').value;

  if (foodQuery || locationQuery) {
    const request = {
      location: currentPosition,
      radius: '1500',
      type: ['restaurant'],
      keyword: foodQuery
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        currentRestaurants = results;
        clearMarkers();
        results.forEach(createMarker);
        renderRestaurantCards(results);
      }
    });
  }
}

// 初始化事件監聽器
document.addEventListener('DOMContentLoaded', () => {
  // 搜尋按鈕點擊事件
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }
  
  // 餐廳卡片點擊事件委派
  const restaurantsContainer = document.getElementById('restaurants-container');
  if (restaurantsContainer) {
    restaurantsContainer.addEventListener('click', (event) => {
      const card = event.target.closest('.restaurant-card');
      if (card) {
        const placeId = card.dataset.placeId;
        if (placeId) {
          showRestaurantDetails(placeId);
        }
      }
    });
  }
  
  // 關閉詳細資訊視窗按鈕點擊事件
  const modalClose = document.querySelector('.modal-close');
  if (modalClose) {
    modalClose.addEventListener('click', closeRestaurantModal);
  }
  
  // 排序按鈕點擊事件
  const sortBtns = document.querySelectorAll('.sort-btn');
  if (sortBtns.length > 0) {
    sortBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sortType = btn.dataset.sort;
        sortRestaurants(sortType);
      });
    });
  }
});

// 餐廳排序函數
function sortRestaurants(sortType) {
  if (!currentRestaurants.length) return;

  switch(sortType) {
    case 'rating':
      currentRestaurants.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'rating-count':
      currentRestaurants.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
      break;
    case 'distance':
      currentRestaurants.sort((a, b) => {
        const distA = google.maps.geometry.spherical.computeDistanceBetween(
          currentPosition,
          a.geometry.location
        );
        const distB = google.maps.geometry.spherical.computeDistanceBetween(
          currentPosition,
          b.geometry.location
        );
        return distA - distB;
      });
      break;
  }

  renderRestaurantCards(currentRestaurants);
}

// ... existing code ...