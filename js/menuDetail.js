class MenuDetail {
  constructor() {
    this.restaurantData = null;
    this.getRestaurantDataFromUrl();
    this.updateBreadcrumb();
    // TODO: 在這裡添加更多處理完整菜單內容的邏輯
  }

  // 從 URL 獲取餐廳資料
  getRestaurantDataFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantData = urlParams.get('data');
    
    if (restaurantData) {
      try {
        this.restaurantData = JSON.parse(decodeURIComponent(restaurantData));
        console.log('獲取到的餐廳資料:', this.restaurantData);
        this.renderMenu();
      } catch (error) {
        console.error('解析餐廳資料失敗:', error);
        // 如果解析失敗，可以導回餐廳列表頁或顯示錯誤訊息
      }
    } else {
      console.error('URL 中沒有餐廳資料');
      // 如果沒有資料，可以導回餐廳列表頁或顯示錯誤訊息
    }
  }

  // 更新麵包屑導航
  updateBreadcrumb() {
    const restaurantLink = document.getElementById('restaurant-link');
    if (restaurantLink && this.restaurantData) {
      // 更新餐廳名稱文字
      restaurantLink.textContent = this.restaurantData.name || '未知餐廳';
      
      // 生成回到餐廳詳細頁面的連結
      // 需要將餐廳資料再次編碼傳回，或者如果 restaurantListDetail 可以只靠 ID 或名稱載入，則使用更簡單的 URL
      const encodedRestaurantData = encodeURIComponent(JSON.stringify(this.restaurantData));
      restaurantLink.href = `restaurantListDetail.html?data=${encodedRestaurantData}`;
    }
  }

  // 根據餐廳類型獲取菜單資料
  getMenuDataByType(type) {
    // 定義不同餐廳類型的範例菜單資料
    const menuData = {
      '中式': [
        {
          category: '開胃菜',
          items: [
            {
              name: '春捲 (3塊)',
              description: '3塊。素食。',
              price: 9.95,
              reviewCount: 0,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '炸餛飩 (6塊)',
              description: '6塊。雞肉',
              price: 9.95,
              reviewCount: 6,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/6061628/pexels-photo-6061628.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '炸蟹肉餛飩 (4塊)',
              description: '',
              price: 11.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '炸蝦 (6塊)',
              description: '',
              price: 11.95,
              reviewCount: 0,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/10817591/pexels-photo-10817591.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '椒鹽雞翅 (6塊)',
              description: '',
              price: 12.95,
              reviewCount: 17,
              photoCount: 5,
              image: 'https://images.pexels.com/photos/6061628/pexels-photo-6061628.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '韓式雞翅 (6塊)',
              description: '',
              price: 12.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '蜂蜜椒鹽雞翅 (6塊)',
              description: '',
              price: 12.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '咖哩雞翅 (6塊)',
              description: '',
              price: 12.95,
              reviewCount: 1,
              photoCount: 1,
              image: ''
            },
            {
              name: '椒鹽炸豆腐',
              description: '',
              price: 10.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '咖哩魚蛋 (8塊)',
              description: '',
              price: 9.95,
              reviewCount: 2,
              photoCount: 2,
              image: ''
            },
            {
              name: '開胃拼盤',
              description: '2塊春捲、2塊炸餛飩、2塊炸蟹肉餛飩、2塊炸蝦',
              price: 14.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '椒鹽炸生蠔 (8塊)',
              description: '',
              price: 13.95,
              reviewCount: 1,
              photoCount: 1,
              image: ''
            }
          ]
        },
        {
          category: '湯品',
          items: [
            {
              name: '酸辣湯',
              description: '',
              price: 9.95,
              reviewCount: 16,
              photoCount: 3,
              image: ''
            },
            {
              name: '餛飩湯',
              description: '',
              price: 9.95,
              reviewCount: 6,
              photoCount: 0,
              image: ''
            },
            {
              name: '玉米雞蓉湯',
              description: '',
              price: 9.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '什錦蔬菜湯',
              description: '',
              price: 8.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '點心',
          items: [
            {
              name: '叉燒包 (3塊)',
              description: '',
              price: 10.95,
              reviewCount: 3,
              photoCount: 1,
              image: ''
            },
            {
              name: '豬肉燒賣 (4塊)',
              description: '香菇、豬肉、蝦仁',
              price: 11.95,
              reviewCount: 3,
              photoCount: 0,
              image: ''
            },
            {
              name: '蝦餃 (4塊)',
              description: '',
              price: 12.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '上海小籠包 (4塊)',
              description: '豬肉',
              price: 11.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '點心拼盤',
              description: '2塊叉燒包、2塊豬肉燒賣、2塊蝦餃、2塊上海小籠包',
              price: 19.95,
              reviewCount: 3,
              photoCount: 1,
              image: ''
            }
          ]
        },
        {
          category: '牛肉',
          items: [
            {
              name: '蒙古牛肉',
              description: '',
              price: 16.95,
              reviewCount: 30,
              photoCount: 4,
              image: 'https://images.pexels.com/photos/70497/pexels-photo-70497.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '芥蘭牛肉',
              description: '',
              price: 16.95,
              reviewCount: 2,
              photoCount: 1,
              image: ''
            },
            {
              name: '番茄牛肉',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 1,
              image: ''
            },
            {
              name: '麻辣豆腐牛肉',
              description: '',
              price: 16.95,
              reviewCount: 1,
              photoCount: 2,
              image: ''
            },
            {
              name: '滑蛋牛肉',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '四季豆牛肉',
              description: '',
              price: 17.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '苦瓜豆豉牛肉',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '鳳梨牛肉',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '羊肉',
          items: [
            {
              name: '蒙古羊肉',
              description: '',
              price: 15.95,
              reviewCount: 3,
              photoCount: 1,
              image: ''
            },
            {
              name: '芥蘭羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '番茄羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '麻辣豆腐羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '滑蛋羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '四季豆羊肉',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '苦瓜豆豉羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '鳳梨羊肉',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '雞肉',
          items: [
            {
              name: '豆豉雞',
              description: '雞肉搭配洋蔥、青椒和豆豉。',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '宮保雞丁',
              description: '麻辣口味。雞肉搭配青椒、乾紅辣椒、花生、櫛瓜和洋蔥。',
              price: 15.95,
              reviewCount: 9,
              photoCount: 1,
              image: 'https://images.pexels.com/photos/6940977/pexels-photo-6940977.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '腰果雞丁',
              description: '雞肉搭配青椒、腰果、櫛瓜和洋蔥。',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '蒙古雞',
              description: '',
              price: 16.95,
              reviewCount: 5,
              photoCount: 5,
              image: ''
            },
            {
              name: '芥蘭雞',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 1,
              image: ''
            },
            {
              name: '四季豆雞',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '檸檬雞',
              description: '',
              price: 15.95,
              reviewCount: 4,
              photoCount: 2,
              image: ''
            },
            {
              name: '芝麻雞',
              description: '',
              price: 15.95,
              reviewCount: 16,
              photoCount: 2,
              image: ''
            },
            {
              name: '咖哩雞',
              description: '',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '糖醋雞',
              description: '',
              price: 15.95,
              reviewCount: 7,
              photoCount: 6,
              image: ''
            }
          ]
        },
        {
          category: '豬肉',
          items: [
            {
              name: '糖醋排骨',
              description: '',
              price: 15.95,
              reviewCount: 7,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/6940991/pexels-photo-6940991.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '四季豆肉絲',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '椒鹽排骨',
              description: '',
              price: 15.95,
              reviewCount: 3,
              photoCount: 2,
              image: ''
            },
            {
              name: '京都排骨',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '麻婆豆腐蓋飯',
              description: '麻辣豆腐搭配絞肉蓋飯',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=800'
            }
          ]
        },
        {
          category: '海鮮',
          items: [
            {
              name: '蒙古蝦',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: 'https://images.pexels.com/photos/10817591/pexels-photo-10817591.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '滑蛋蝦仁',
              description: '',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '核桃蝦仁',
              description: '',
              price: 18.95,
              reviewCount: 12,
              photoCount: 1,
              image: ''
            },
            {
              name: '芥蘭蝦仁',
              description: '',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '薑蔥魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '椒鹽炸魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '玉米魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '蔬菜魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '豆豉魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '糖醋魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '苦瓜豆豉魚片',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '蔬菜',
          items: [
            {
              name: '紅燒豆腐什錦蔬菜',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '紅燒香菇蔬菜',
              description: '',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '魚香茄子',
              description: '辣味蒜蓉醬',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '麻辣四季豆',
              description: '',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '麻辣豬肉豆腐',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '素食全餐',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '宮保素雞丁',
              description: '',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '番茄炒蛋',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '苦瓜炒蛋',
              description: '',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '蒜炒高麗菜',
              description: '',
              price: 13.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '蒜炒芥蘭',
              description: '',
              price: 13.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '炒飯',
          items: [
            {
              name: '招牌炒飯',
              description: '牛肉、雞肉、鮮蝦。',
              price: 16.95,
              reviewCount: 11,
              photoCount: 1,
              image: 'https://images.pexels.com/photos/674689/pexels-photo-674689.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '什錦蔬菜炒飯',
              description: '',
              price: 15.95,
              reviewCount: 2,
              photoCount: 0,
              image: ''
            },
            {
              name: '絞肉炒飯',
              description: '',
              price: 15.95,
              reviewCount: 2,
              photoCount: 0,
              image: ''
            },
            {
              name: '鹹魚雞粒炒飯',
              description: '',
              price: 16.95,
              reviewCount: 3,
              photoCount: 0,
              image: ''
            },
            {
              name: '鳳梨雞肉炒飯',
              description: '',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '雞肉炒飯',
              description: '',
              price: 15.95,
              reviewCount: 10,
              photoCount: 2,
              image: ''
            },
            {
              name: '叉燒炒飯',
              description: '',
              price: 16.95,
              reviewCount: 1,
              photoCount: 2,
              image: ''
            },
            {
              name: '雞蛋炒飯',
              description: '',
              price: 14.95,
              reviewCount: 3,
              photoCount: 2,
              image: ''
            },
            {
              name: '鮭魚炒飯',
              description: '',
              price: 19.95,
              reviewCount: 2,
              photoCount: 0,
              image: ''
            },
            {
              name: '蝦仁炒飯',
              description: '',
              price: 16.95,
              reviewCount: 3,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '炒麵/河粉',
          items: [
            {
              name: '招牌炒麵',
              description: '本店最暢銷炒麵，含牛肉、雞肉、鮮蝦、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 16.95,
              reviewCount: 6,
              photoCount: 2,
              image: 'https://images.pexels.com/photos/1653853/pexels-photo-1653853.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '什錦蔬菜炒麵',
              description: '含芥蘭、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '醬油炒麵',
              description: '含洋蔥絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '醬油河粉',
              description: '含洋蔥絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '雞肉蔬菜炒麵',
              description: '含雞肉、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 16.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '鮮蝦蔬菜炒麵',
              description: '含鮮蝦、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '牛肉醬油河粉',
              description: '含牛肉、高麗菜絲、洋蔥絲、紅蘿蔔絲、蔥花和豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '豆豉牛肉河粉',
              description: '含牛肉、豆豉、高麗菜絲、洋蔥絲、紅蘿蔔絲、蔥花和豆芽菜。',
              price: 15.95,
              reviewCount: 0,
              photoCount: 1,
              image: ''
            },
            {
              name: '豬肉絲乾炒麵',
              description: '鍋煎脆麵，含豬肉、洋蔥絲、蔥花、香菇片、豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 0,
              image: ''
            },
            {
              name: '番茄牛肉乾炒麵',
              description: '鍋煎脆麵，含牛肉、番茄、洋蔥、青椒和豆芽菜。',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '什錦肉絲炒麵',
              description: '含豬肉、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '滑蛋蝦仁河粉',
              description: '含鮮蝦、雞蛋和蔥花。',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '星洲炒米粉',
              description: '米粉搭配咖哩醬、鮮蝦、雞蛋、高麗菜絲、洋蔥絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 1,
              photoCount: 2,
              image: ''
            },
            {
              name: '星洲炒河粉',
              description: '河粉搭配咖哩醬、鮮蝦、雞蛋、高麗菜絲、洋蔥絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '咖哩雞肉炒麵',
              description: '炒麵搭配咖哩醬、雞肉、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 15.95,
              reviewCount: 4,
              photoCount: 0,
              image: ''
            },
            {
              name: '叉燒炒麵',
              description: '炒麵搭配中式叉燒肉、青江菜、高麗菜絲、紅蘿蔔絲和豆芽菜。',
              price: 16.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '蒜香麵',
              description: '炒麵搭配蒜末、奶油和起司',
              price: 14.95,
              reviewCount: 3,
              photoCount: 1,
              image: ''
            }
          ]
        },
        {
          category: '套餐',
          items: [
            {
              name: '廣式兩人套餐',
              description: '含春捲、餛飩湯、糖醋排骨、芥蘭牛肉和叉燒炒飯。',
              price: 40.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '廣式三人套餐',
              description: '含春捲、餛飩湯、糖醋排骨、芥蘭牛肉、芝麻雞和叉燒炒飯。',
              price: 60.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '廣式四人套餐',
              description: '含春捲、餛飩湯、糖醋排骨、芥蘭牛肉、芝麻雞、核桃蝦仁和叉燒炒飯。',
              price: 80.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '川味兩人套餐',
              description: '含春捲、酸辣湯、宮保雞丁、蒙古牛肉和雞肉炒飯。',
              price: 40.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '川味三人套餐',
              description: '含春捲、酸辣湯、宮保雞丁、蒙古牛肉、麻辣四季豆和雞肉炒飯。',
              price: 60.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '川味四人套餐',
              description: '含春捲、酸辣湯、宮保雞丁、蒙古牛肉、麻辣四季豆、椒鹽炸魚片和雞肉炒飯。',
              price: 80.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '素食兩人套餐',
              description: '',
              price: 38.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '素食三人套餐',
              description: '',
              price: 57.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '素食四人套餐',
              description: '',
              price: 76.00,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '飲品',
          items: [
            { name: '可口可樂', description: '', price: 2.50, reviewCount: 0, photoCount: 0, image: '' },
            { name: '零卡可口可樂', description: '', price: 2.50, reviewCount: 0, photoCount: 0, image: '' },
            { name: '雪碧', description: '', price: 2.50, reviewCount: 0, photoCount: 0, image: '' },
            { name: 'Sunkist 柳橙汁', description: '', price: 2.50, reviewCount: 0, photoCount: 0, image: '' },
            { name: '維他命水', description: '', price: 3.75, reviewCount: 0, photoCount: 0, image: '' },
            { name: 'Snapple 冰茶', description: '', price: 3.75, reviewCount: 0, photoCount: 0, image: '' },
            { name: '氣泡水', description: '', price: 3.75, reviewCount: 0, photoCount: 0, image: '' },
            { name: '紅牛', description: '', price: 3.75, reviewCount: 0, photoCount: 0, image: '' },
            { name: '伊藤園綠茶', description: '', price: 3.75, reviewCount: 0, photoCount: 0, image: '' }
          ]
        },
        {
          category: '甜點',
          items: [
            {
              name: '紐約起司蛋糕',
              description: '',
              price: 6.95,
              reviewCount: 0,
              photoCount: 1,
              image: ''
            },
            {
              name: '提拉米蘇',
              description: '',
              price: 6.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            },
            {
              name: '炸香蕉',
              description: '',
              price: 6.95,
              reviewCount: 0,
              photoCount: 0,
              image: ''
            }
          ]
        },
        {
          category: '白飯',
          items: [
            { name: '白飯 (小)', description: '', price: 3.50, reviewCount: 0, photoCount: 0, image: '' },
            { name: '白飯 (大)', description: '', price: 5.00, reviewCount: 0, photoCount: 0, image: '' }
          ]
        }
      ],
      '日式': [
        {
          category: '前菜',
          items: [
            {
              name: '毛豆',
              description: '簡單鹽味毛豆。',
              price: 60,
              reviewCount: 8,
              photoCount: 3,
              image: 'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '日式炸雞',
              description: '酥脆多汁的日式炸雞塊。',
              price: 120,
              reviewCount: 18,
              photoCount: 6,
              image: 'https://images.pexels.com/photos/3023458/pexels-photo-3023458.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
          ]
        },
        {
          category: '壽司/生魚片',
          items: [
            {
              name: '綜合生魚片',
              description: '精選新鮮生魚片。',
              price: 380,
              reviewCount: 45,
              photoCount: 12,
              image: 'https://images.pexels.com/photos/2323365/pexels-photo-2323365.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '鮭魚握壽司',
              description: '新鮮鮭魚握壽司。',
              price: 180,
              reviewCount: 30,
              photoCount: 10,
              image: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
          ]
        },
        {
          category: '丼飯/麵',
          items: [
            {
              name: '日式豬排丼飯',
              description: '酥炸豬排搭配日式醬汁蓋飯。',
              price: 200,
              reviewCount: 28,
              photoCount: 7,
              image: 'https://images.pexels.com/photos/674689/pexels-photo-674689.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
          ]
        }
      ],
      '火鍋': [
        {
          category: '鍋物',
          items: [
            {
              name: '麻辣鍋',
              description: '香醇麻辣湯底。',
              price: 350,
              reviewCount: 55,
              photoCount: 15,
              image: 'https://images.pexels.com/photos/6307857/pexels-photo-6307857.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
            {
              name: '昆布鍋',
              description: '清淡昆布湯底。',
              price: 280,
              reviewCount: 30,
              photoCount: 8,
              image: 'https://images.pexels.com/photos/6307857/pexels-photo-6307857.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
          ]
        },
        {
          category: '肉品',
          items: [
            {
              name: '雪花牛',
              description: '油花均勻的雪花牛肉片。',
              price: 250,
              reviewCount: 40,
              photoCount: 10,
              image: 'https://images.pexels.com/photos/5378428/pexels-photo-5378428.jpeg?auto=compress&cs=tinysrgb&w=800'
            },
          ]
        }
      ],
      '咖啡廳': [
        // ... existing cafe menu data ...
      ],
      '韓式': [
        {
          category: '烤肉',
          items: [
            { name: '銅盤烤肉 (豬肉)', description: '', price: 350, reviewCount: 0, photoCount: 0, image: '' },
            { name: '銅盤烤肉 (牛肉)', description: '', price: 380, reviewCount: 0, photoCount: 0, image: '' },
            { name: '春川辣炒雞', description: '', price: 320, reviewCount: 0, photoCount: 0, image: '' }
          ]
        },
        {
          category: '鍋物',
          items: [
            { name: '部隊鍋', description: '', price: 300, reviewCount: 0, photoCount: 0, image: '' },
            { name: '人參雞湯', description: '', price: 450, reviewCount: 0, photoCount: 0, image: '' }
          ]
        },
        {
          category: '主食',
          items: [
            { name: '石鍋拌飯', description: '', price: 280, reviewCount: 0, photoCount: 0, image: '' },
            { name: '海鮮煎餅', description: '', price: 250, reviewCount: 0, photoCount: 0, image: '' },
            { name: '韓式炸雞', description: '', price: 280, reviewCount: 0, photoCount: 0, image: '' }
          ]
        }
      ],
      '西式': [
        {
          category: '開胃菜',
          items: [
            { name: '凱薩沙拉', description: '', price: 180, reviewCount: 0, photoCount: 0, image: '' },
            { name: '炸起司條', description: '', price: 220, reviewCount: 0, photoCount: 0, image: '' }
          ]
        },
        {
          category: '主餐',
          items: [
            { name: '嫩煎牛排', description: '', price: 650, reviewCount: 0, photoCount: 0, image: '' },
            { name: '奶油培根義大利麵', description: '', price: 320, reviewCount: 0, photoCount: 0, image: '' },
            { name: '番茄海鮮燉飯', description: '', price: 380, reviewCount: 0, photoCount: 0, image: '' }
          ]
        },
        {
          category: '甜點',
          items: [
            { name: '熔岩巧克力蛋糕', description: '', price: 150, reviewCount: 0, photoCount: 0, image: '' },
            { name: '紐約起司蛋糕', description: '', price: 140, reviewCount: 0, photoCount: 0, image: '' }
          ]
        }
      ]
    };

    // 獲取餐廳類型，預設為中式
    const restaurantType = this.restaurantData.tags?.[0] || '中式';

    // 返回對應類型的菜單資料，如果沒有則返回空陣列
    return menuData[restaurantType] || [];
  }

  // 渲染菜單內容
  renderMenu() {
    console.log('renderMenu function called');
    const menuSectionsContainer = document.querySelector('.menu-sections');
    if (!menuSectionsContainer || !this.restaurantData) {
      console.error('找不到菜單容器或餐廳資料缺失');
      return;
    }

    // 根據餐廳類型獲取菜單資料
    const menuData = this.getMenuDataByType(this.restaurantData.tags?.[0]);

    let menuHTML = '';
    const conversionRate = 30; // Placeholder: 1 USD = 30 NTD

    if (menuData.length === 0) {
      menuHTML += '<p>抱歉，目前沒有該餐廳的菜單資料。</p>';
    } else {
      menuData.forEach(category => {
        menuHTML += `<h2 class="menu-category-title">${category.category}</h2>`;
        menuHTML += `<div class="menu-items-list">`;
        category.items.forEach(item => {
          // Convert USD price to NTD and format
          const priceNTD = Math.round(item.price * conversionRate); // Round to nearest integer
          const formattedPrice = `NT$ ${priceNTD}`;

          menuHTML += `
            <div class="menu-item">
              <div class="menu-item-details">
                <div class="menu-item-name">${item.name}</div>
                ${item.description ? `<div class="menu-item-description">${item.description}</div>` : ''}
                <div class="menu-item-price">${formattedPrice}</div>
                <div class="menu-item-meta">
                  ${item.reviewCount > 0 ? `<span class="menu-item-reviews">${item.reviewCount} 則評論</span>` : ''}
                  ${item.photoCount > 0 ? `<span class="menu-item-photos">${item.photoCount} 張照片</span>` : ''}
                </div>
              </div>
              ${item.image ? `
                <div class="menu-item-image">
                  <img src="${item.image}" alt="${item.name}">
                </div>
              ` : ''}
            </div>
          `;
        });
        menuHTML += `</div>`;
      });
    }

    menuSectionsContainer.innerHTML = menuHTML;

    // 更新餐廳名稱標題
    const menuRestaurantName = document.querySelector('.menu-restaurant-name');
    if (menuRestaurantName && this.restaurantData) {
      menuRestaurantName.textContent = `${this.restaurantData.name || '未知餐廳'} 完整菜單`;
    }
  }
}

// 當 DOM 加載完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  new MenuDetail();
}); 