// 網站配置
const config = {
    // API 設定
    api: {
        baseUrl: 'http://localhost:8080/api', // 後端 API 基礎 URL
        endpoints: {
            restaurants: {
                all: '/google-restaurants/all',          // 獲取所有餐廳
                byId: '/google-restaurants/',            // 獲取特定餐廳 (需要加上 ID)
                byCategory: '/google-restaurants/category/', // 按分類獲取餐廳 (需要加上分類名稱)
                count: '/google-restaurants/count'       // 獲取餐廳總數
            },
            favorites: {
                all: '/favorites',                // 獲取所有收藏
                add: '/favorites/add',            // 新增收藏
                remove: '/favorites/remove/',     // 移除收藏 (需要加上 ID)
                check: '/favorites/check/'        // 檢查是否已收藏 (需要加上 ID)
            }
        }
    },
    
    // 地圖設定
    map: {
        defaultCenter: { lat: 25.0330, lng: 121.5654 }, // 預設中心點 (台北 101)
        defaultZoom: 15,                               // 預設縮放等級
        clusterOptions: {                              // 標記群組選項
            gridSize: 50,
            maxZoom: 15,
            minimumClusterSize: 3
        }
    },
    
    // 餐廳卡片設定
    restaurantCard: {
        imageHeight: 200,                             // 圖片高度
        maxDescriptionLength: 100                     // 描述最大長度
    },
    
    // 分頁設定
    pagination: {
        itemsPerPage: 12                              // 每頁顯示數量
    }
};

// 全域 API 基礎 URL
window.API_BASE_URL = config.api.baseUrl;

// 導出配置
window.config = config;