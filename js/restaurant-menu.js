// 顯示新增菜品彈窗
function showAddMenuItemModal() {
    document.getElementById('modalTitle').textContent = '新增菜品';
    document.getElementById('addMenuItemForm').reset();
    document.getElementById('item-id').value = '';
    document.getElementById('current-image').innerHTML = '';
    document.getElementById('addMenuItemModal').style.display = 'flex';
}

// 隱藏新增菜品彈窗
function hideAddMenuItemModal() {
    document.getElementById('addMenuItemModal').style.display = 'none';
}

// 編輯菜品
function editMenuItem(id) {
    // 模擬從資料庫獲取菜品資料
    const menuItem = {
        id: id,
        name: '招牌牛肉麵',
        price: 180,
        description: '特製湯頭，搭配新鮮牛肉',
        image: 'images/menu-item1.jpg'
    };

    // 設置彈窗標題
    document.getElementById('modalTitle').textContent = '編輯菜品';
    
    // 填充表單資料
    document.getElementById('item-id').value = menuItem.id;
    document.getElementById('item-name').value = menuItem.name;
    document.getElementById('item-price').value = menuItem.price;
    document.getElementById('item-description').value = menuItem.description;
    
    // 顯示當前圖片
    const currentImage = document.getElementById('current-image');
    currentImage.innerHTML = `<img src="${menuItem.image}" alt="${menuItem.name}" style="max-width: 200px; margin-top: 10px;">`;
    
    // 顯示彈窗
    document.getElementById('addMenuItemModal').style.display = 'flex';
}

// 刪除菜品
function deleteMenuItem(id) {
    if (confirm('確定要刪除此菜品嗎？')) {
        // 這裡可以實現刪除功能
        console.log('刪除菜品:', id);
    }
}

// 提交新增/編輯菜品
function submitMenuItem() {
    const form = document.getElementById('addMenuItemForm');
    const formData = new FormData(form);
    const itemId = document.getElementById('item-id').value;
    
    // 這裡可以實現提交功能
    console.log('提交菜品資料:', Object.fromEntries(formData));
    
    // 提交後關閉彈窗
    hideAddMenuItemModal();
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 分類篩選
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // 這裡可以實現分類篩選功能
            console.log('選擇分類:', this.value);
        });
    }

    // 搜尋功能
    const searchFilter = document.getElementById('search-filter');
    if (searchFilter) {
        searchFilter.addEventListener('input', function() {
            // 這裡可以實現搜尋功能
            console.log('搜尋關鍵字:', this.value);
        });
    }

    // 排序功能
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            // 這裡可以實現排序功能
            console.log('排序方式:', this.value);
        });
    }
}); 