// 地圖初始化模組 (新版 Places API，不含 fields)
class MapInit {
    constructor() {
        this.map = null;
        this.markers = [];
        this.isMapInitialized = false;
        this.defaultLocation = { lat: 25.0330, lng: 121.5654 }; // 預設台北
        this.currentUserLocationMarker = null;
    }

    async init() {
        try {
            const { Map } = await google.maps.importLibrary("maps");
            const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

            let center = this.defaultLocation;
            if (navigator.geolocation) {
                await new Promise(resolve => {
                    navigator.geolocation.getCurrentPosition(
                        pos => {
                            center = {
                                lat: pos.coords.latitude,
                                lng: pos.coords.longitude
                            };
                            resolve();
                        },
                        () => resolve(),
                        { timeout: 3000 }
                    );
                });
            }
            this.map = new Map(document.getElementById('map'), {
                center,
                zoom: 15,
                mapId: "DEMO_MAP_ID"
            });
            this.isMapInitialized = true;
            await this.addUserLocationMarker(center);

            await this.searchNearbyRestaurants(center.lat, center.lng);
        } catch (error) {
            console.error('初始化地圖時發生錯誤:', error);
        }
    }

    async searchNearbyRestaurants(lat, lng) {
        try {
            const { Place } = await google.maps.importLibrary("places");
            const results = await Place.searchByText({
                textQuery: "餐廳",
                locationBias: {
                    circle: {
                        center: { latitude: lat, longitude: lng },
                        radius: 5000
                    }
                },
                language: "zh-TW",
                maxResultCount: 20
            });
            if (!results || !results.places) throw new Error('Places search failed');
            const mapped = await this.processPlaceResults(results.places);
            window.allNearbyRestaurants = mapped;
            window.currentRestaurants = mapped;
            window.displayRestaurants(window.currentRestaurants);
            this.updateResultsTitle('附近的餐廳');
            await this.showRestaurantsOnMap(mapped);
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            window.displayRestaurants([]);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
        }
    }

    async searchByType(type, keyword) {
        try {
            if (!this.map) return;
            const location = this.map.getCenter();
            const { Place } = await google.maps.importLibrary("places");
            const results = await Place.searchByText({
                textQuery: `${keyword} 餐廳`,
                locationBias: {
                    circle: {
                        center: { latitude: location.lat(), longitude: location.lng() },
                        radius: 5000
                    }
                },
                language: "zh-TW",
                maxResultCount: 20
            });
            if (!results || !results.places) throw new Error('Places search failed');
            const mapped = await this.processPlaceResults(results.places);
            window.allNearbyRestaurants = mapped;
            window.currentRestaurants = mapped;
            window.displayRestaurants(window.currentRestaurants);
            this.updateResultsTitle(`${keyword}餐廳`);
            await this.showRestaurantsOnMap(mapped);
        } catch (error) {
            console.error('搜尋餐廳時發生錯誤:', error);
            window.displayRestaurants([]);
            this.updateResultsTitle('搜尋失敗，請稍後再試');
        }
    }

    async processPlaceResults(places) {
        return Promise.all(places.map(async place => {
            let photoUrl = "images/no-image.jpg";
            if (place.photos && place.photos.length > 0 && place.photos[0].url) {
                photoUrl = place.photos[0].url;
            }
            return {
                id: place.id || place.place_id || "",
                name: place.displayName?.text || place.name || "未知名稱",
                address: place.formattedAddress || place.address || "",
                rating: place.rating || 0,
                user_ratings_total: place.userRatingCount || 0,
                photos: photoUrl,
                opening_hours: place.regularOpeningHours
                    ? {
                        isOpen: place.regularOpeningHours.openNow || false,
                        periods: place.regularOpeningHours.periods || [],
                        weekday_text: place.regularOpeningHours.weekdayDescriptions || []
                    } : null,
                location: place.location
                    ? { lat: place.location.latitude, lng: place.location.longitude }
                    : null,
                types: place.types || []
            };
        }));
    }

    async showRestaurantsOnMap(restaurants) {
        this.markers.forEach(marker => marker.map = null);
        this.markers = [];
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const { LatLngBounds } = await google.maps.importLibrary("core");
        const bounds = new LatLngBounds();
        for (const restaurant of restaurants) {
            if (!restaurant.location) continue;
            const marker = new AdvancedMarkerElement({
                map: this.map,
                position: restaurant.location,
                title: restaurant.name,
                content: this.createMarkerContent(restaurant)
            });
            bounds.extend(restaurant.location);
            this.markers.push(marker);
        }
        if (restaurants.length > 0) this.map.fitBounds(bounds);
    }

    createMarkerContent(restaurant) {
        const container = document.createElement('div');
        container.className = 'marker-content';
        container.innerHTML = `
            <div class="marker-title">${restaurant.name}</div>
            ${restaurant.rating ? `
                <div class="marker-rating">
                    <span class="stars">★</span>
                    ${restaurant.rating.toFixed(1)}
                </div>
            ` : ''}
        `;
        return container;
    }

    updateResultsTitle(title) {
        const titleElement = document.getElementById('results-title');
        if (titleElement) {
            titleElement.textContent = title;
            titleElement.style.display = 'block';
        }
    }

    async addUserLocationMarker(location) {
        if (!location) return;
        if (this.currentUserLocationMarker) {
            this.currentUserLocationMarker.map = null;
        }
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        const dot = document.createElement('div');
        dot.className = 'user-location-dot';
        dot.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #4285F4;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;
        this.currentUserLocationMarker = new AdvancedMarkerElement({
            map: this.map,
            position: location,
            title: "您的位置",
            content: dot
        });
    }
}
