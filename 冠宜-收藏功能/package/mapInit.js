// 地圖初始化模組
class MapInit {
    constructor() {
        this.map = null;
        this.markers = [];
        this.placesService = null;
        this.isMapInitialized = false;
        this.defaultLocation = { lat: 24.1477, lng: 120.6470 }; // 預設台中位置
    }

    // 初始化地圖
    initMap() {
        if (typeof google === 'undefined') {
            console.error('Google Maps API 未載入');
            return;
        }

        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('找不到地圖容器元素');
            return;
        }

        // 嘗試獲取使用者位置
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => this.handleLocationSuccess(position),
                (error) => this.handleLocationError(error)
            );
        } else {
            this.handleLocationError(new Error('瀏覽器不支援地理位置功能'));
        }
    }

    // 處理位置獲取成功
    handleLocationSuccess(position) {
        const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };

        // 初始化地圖
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: userLocation,
            mapTypeControl: false
        });

        // 添加使用者位置標記
        this.addUserLocationMarker(userLocation);

        // 初始化 Places Service
        this.initializePlacesService(userLocation);
    }

    // 處理位置獲取失敗
    handleLocationError(error) {
        console.error('無法獲取位置:', error);
        this.updateLocationStatus('使用預設位置進行搜尋');

        // 使用預設位置初始化地圖
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: this.defaultLocation,
            mapTypeControl: false
        });

        // 初始化 Places Service
        this.initializePlacesService(this.defaultLocation);
    }

    // 添加使用者位置標記
    addUserLocationMarker(location) {
        if (this.currentUserLocationMarker) {
            this.currentUserLocationMarker.setMap(null);
        }

        this.currentUserLocationMarker = new google.maps.Marker({
            position: location,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
            },
            title: "您的位置"
        });
    }

    // 初始化 Places Service
    initializePlacesService(location) {
        if (typeof google !== 'undefined' && typeof google.maps.places !== 'undefined') {
            this.placesService = new google.maps.places.PlacesService(this.map);
            this.isMapInitialized = true;

            // 添加延遲以確保 Places Service 完成初始化
            setTimeout(() => {
                google.maps.event.addListenerOnce(this.map, 'idle', () => {
                    this.updateLocationStatus('使用您的位置進行搜尋');
                    this.searchNearbyRestaurants(location.lat, location.lng);
                });
            }, 500);
        }
    }

    // 搜尋附近的餐廳
    searchNearbyRestaurants(lat, lng) {
        if (!this.placesService) {
            console.error('Places Service 未初始化');
            return;
        }

        const request = {
            location: new google.maps.LatLng(lat, lng),
            radius: 5000,
            type: ['restaurant']
        };

        this.placesService.nearbySearch(request, async (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                const mapped = await this.processPlaceResults(results);
                window.allNearbyRestaurants = mapped;
                window.currentRestaurants = mapped.slice(0, 4);
                window.displayRestaurants(window.currentRestaurants);
                this.updateResultsTitle('附近的餐廳');
                this.showRestaurantsOnMap(mapped);
            } else {
                window.displayRestaurants([]);
                this.updateResultsTitle('搜尋失敗，請檢查網路連線或稍後再試');
            }
        });
    }

    // 處理地點結果
    async processPlaceResults(results) {
        return await Promise.all(results.map(place => {
            return new Promise(resolve => {
                this.placesService.getDetails({
                    placeId: place.place_id,
                    fields: ['name', 'formatted_address', 'opening_hours', 'rating', 'user_ratings_total', 'photos', 'types', 'geometry']
                }, (detail, detailStatus) => {
                    if (detailStatus === google.maps.places.PlacesServiceStatus.OK && detail) {
                        const mergedPlace = {
                            ...place,
                            photos: detail.photos || place.photos,
                            opening_hours: detail.opening_hours || place.opening_hours,
                            rating: detail.rating || place.rating,
                            user_ratings_total: detail.user_ratings_total || place.user_ratings_total,
                            types: detail.types || place.types,
                            geometry: detail.geometry || place.geometry
                        };
                        resolve(this.mapPlaceResult(mergedPlace));
                    } else {
                        resolve(this.mapPlaceResult(place));
                    }
                });
            });
        }));
    }

    // 映射地點結果
    mapPlaceResult(place) {
        let imageUrl = '';
        if (place.photos && place.photos[0]) {
            if (place.photos[0].getUrl) {
                imageUrl = place.photos[0].getUrl({
                    maxWidth: 400,
                    maxHeight: 300
                });
            } else if (place.photos[0].photo_reference) {
                imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=AIzaSyAqANvNvM5qZb9I_nkoMPJz_yjhvYKlKD0`;
            }
        }

        return {
            id: place.place_id,
            name: place.name,
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            address: place.vicinity || place.formatted_address || place.name || '地址未提供',
            isOpen: (place.opening_hours && (place.opening_hours.open_now !== undefined)) ? place.opening_hours.open_now : false,
            opening_hours: place.opening_hours,
            image: imageUrl,
            type: (place.types && place.types[0]) ? place.types[0] : 'restaurant',
            location: place.geometry && place.geometry.location ? place.geometry.location : null
        };
    }

    // 在地圖上顯示餐廳
    showRestaurantsOnMap(restaurants) {
        if (!this.map) {
            console.warn('地圖未初始化，跳過地圖標記顯示');
            return;
        }

        // 清除現有的標記
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        restaurants.forEach(restaurant => {
            if (restaurant.location) {
                try {
                    const marker = new google.maps.Marker({
                        position: restaurant.location,
                        map: this.map,
                        title: restaurant.name
                    });

                    const infoWindow = new google.maps.InfoWindow({
                        content: `
                            <div class="map-info-window">
                                <h3>${restaurant.name}</h3>
                                <p>評分: ${restaurant.rating} ⭐</p>
                                <p>${restaurant.address}</p>
                            </div>
                        `
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(this.map, marker);
                    });

                    this.markers.push(marker);
                } catch (error) {
                    console.warn('無法創建地圖標記:', error);
                }
            }
        });

        // 調整地圖視角以顯示所有標記
        if (restaurants.length > 0 && restaurants[0].location) {
            try {
                const bounds = new google.maps.LatLngBounds();
                restaurants.forEach(restaurant => {
                    if (restaurant.location) {
                        bounds.extend(restaurant.location);
                    }
                });
                this.map.fitBounds(bounds);
            } catch (error) {
                console.warn('無法調整地圖視角:', error);
            }
        }
    }

    // 更新位置狀態
    updateLocationStatus(message) {
        const statusElement = document.getElementById('location-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    // 更新結果標題
    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }
}

// 導出模組
export default MapInit; 