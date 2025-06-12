// 搜索服务类
class SearchService {
    constructor(map, placesService) {
        this.map = map;
        this.placesService = placesService;
        this.searchRadius = 8000; // 8公里的搜索范围
        this.maxResults = 60; // 最大结果数
    }

    async searchByKeywords(keywords, location) {
        const allResults = new Map(); // 使用Map来去重
        let requestCount = 0;
        const maxRequests = keywords.length;

        for (const keyword of keywords) {
            try {
                const request = {
                    location: location,
                    radius: this.searchRadius,
                    type: 'restaurant',
                    keyword: keyword,
                    language: 'zh-TW'
                };

                const places = await this.performSearch(request);
                requestCount++;

                for (const place of places) {
                    if (!allResults.has(place.place_id)) {
                        const details = await this.getPlaceDetails(place.place_id);
                        if (details) {
                            allResults.set(place.place_id, details);
                        }
                    }

                    // 如果已经收集足够的结果，提前结束
                    if (allResults.size >= this.maxResults) {
                        break;
                    }
                }

                // 如果已经找到足够多的结果，不再继续搜索其他关键词
                if (allResults.size >= this.maxResults) {
                    break;
                }
            } catch (error) {
                console.error(`搜索关键词 "${keyword}" 时发生错误:`, error);
                // 继续尝试其他关键词
            }
        }

        return Array.from(allResults.values());
    }

    async performSearch(request) {
        return new Promise((resolve, reject) => {
            this.placesService.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(results);
                } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    resolve([]);
                } else {
                    reject(new Error(status));
                }
            });
        });
    }

    async getPlaceDetails(placeId) {
        try {
            return await new Promise((resolve, reject) => {
                this.placesService.getDetails({
                    placeId: placeId,
                    fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 
                            'photos', 'geometry', 'opening_hours', 'types', 'price_level']
                }, (result, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        const formattedResult = this.formatPlaceDetails(result);
                        resolve(formattedResult);
                    } else {
                        reject(new Error(status));
                    }
                });
            });
        } catch (error) {
            console.error('获取地点详情时发生错误:', error);
            return null;
        }
    }

    formatPlaceDetails(place) {
        let photo = 'images/no-image.jpg';
        if (place.photos && place.photos[0]) {
            try {
                photo = place.photos[0].getUrl({maxWidth: 400});
            } catch (e) {
                console.error('获取图片时发生错误:', e);
            }
        }

        return {
            id: place.place_id,
            name: place.name || '未知名称',
            address: place.formatted_address || place.vicinity || '',
            rating: place.rating || 0,
            user_ratings_total: place.user_ratings_total || 0,
            photos: photo,
            location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            },
            opening_hours: place.opening_hours || null,
            types: place.types || [],
            price_level: place.price_level
        };
    }
}

// 导出搜索服务
window.SearchService = SearchService;
