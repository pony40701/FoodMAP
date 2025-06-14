// API配置
const API_BASE_URL = 'http://220.132.139.112:8080/foodmap/api';

// 餐廳API端點
const RESTAURANT_API = {
    GET_ALL: `${API_BASE_URL}/restaurants`,
    GET_BY_ID: (id) => `${API_BASE_URL}/restaurants/${id}`,
    GET_FAVORITES: (userId) => `${API_BASE_URL}/favorites/restaurants?userId=${userId}`,
    ADD_FAVORITE: `${API_BASE_URL}/favorites/restaurants`,
    REMOVE_FAVORITE: `${API_BASE_URL}/favorites/restaurants`,
    CHECK_FAVORITE: `${API_BASE_URL}/favorites/restaurants/check`
};

// 評論API端點
const REVIEW_API = {
    GET_ALL: `${API_BASE_URL}/reviews`,
    GET_BY_ID: (id) => `${API_BASE_URL}/reviews/${id}`,
    GET_BY_RESTAURANT: (placeId) => `${API_BASE_URL}/reviews/restaurant/${placeId}`,
    ADD_REVIEW: `${API_BASE_URL}/reviews`,
    UPDATE_REVIEW: (id) => `${API_BASE_URL}/reviews/${id}`,
    DELETE_REVIEW: (id) => `${API_BASE_URL}/reviews/${id}`
};

// 導出API配置
window.API_CONFIG = {
    BASE_URL: API_BASE_URL,
    RESTAURANT: RESTAURANT_API,
    REVIEW: REVIEW_API
}; 