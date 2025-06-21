// 全域變數
let currentMode = 'add'; // 'add' 或 'edit'
let currentEditId = null;

// 當頁面載入完成時執行
document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    checkLoginStatus();
    // 載入菜單項目
    loadMenuItems();
    // 設置搜尋功能
    setupSearch();
    // 設置圖片預覽
    setupImagePreview();
});

// 檢查登入狀態
async function checkLoginStatus() {
    const token = localStorage.getItem('merchantToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/merchants/validate', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token 驗證失敗');
        }
    } catch (error) {
        console.error('驗證失敗:', error);
        window.location.href = 'index.html';
    }
}

// 載入菜單項目
async function loadMenuItems() {
    try {
        const token = localStorage.getItem('merchantToken');
        const response = await fetch('http://localhost:8080/api/merchants/menu', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('獲取菜單失敗');
        }

        const menuItems = await response.json();
        displayMenuItems(menuItems);
    } catch (error) {
        console.error('載入菜單失敗:', error);
        alert('載入菜單失敗，請稍後再試');
    }
}

// 顯示菜單項目
function displayMenuItems(menuItems) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';

    menuItems.forEach(item => {
        const tr = document.createElement('tr');
        const imageUrl = item.menuImage 
            ? `data:image/jpeg;base64,${item.menuImage}` 
            : 'images/no-image.jpg';
        tr.innerHTML = `
            <td><img src="${imageUrl}" alt="${item.itemName}" class="menu-item-img"></td>
            <td>${item.itemName}</td>
            <td>${item.description || ''}</td>
            <td>$${item.price}</td>
            <td>
                <button class="action-btn edit" onclick="editMenuItem(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteMenuItem(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 設置搜尋功能
function setupSearch() {
    const searchInput = document.getElementById('search-filter');
    searchInput.addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const name = row.children[1].textContent.toLowerCase();
            const description = row.children[2].textContent.toLowerCase();
            if (name.includes(searchText) || description.includes(searchText)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// 設置圖片預覽
function setupImagePreview() {
    const imageInput = document.getElementById('item-image');
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const currentImage = document.getElementById('current-image');
                currentImage.innerHTML = `<img src="${e.target.result}" alt="預覽圖片">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// 顯示新增菜品彈窗
function showAddMenuItemModal() {
    currentMode = 'add';
    currentEditId = null;
    document.getElementById('modalTitle').textContent = '新增菜品';
    document.getElementById('addMenuItemForm').reset();
    document.getElementById('current-image').innerHTML = '';
    document.getElementById('addMenuItemModal').style.display = 'block';
}

// 隱藏彈窗
function hideAddMenuItemModal() {
    document.getElementById('addMenuItemModal').style.display = 'none';
}

// 編輯菜品
async function editMenuItem(id) {
    currentMode = 'edit';
    currentEditId = id;
    document.getElementById('modalTitle').textContent = '編輯菜品';

    try {
        const token = localStorage.getItem('merchantToken');
        const response = await fetch(`http://localhost:8080/api/merchants/menu/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('獲取菜品資料失敗');
        }

        const item = await response.json();
        
        // 填充表單
        document.getElementById('item-name').value = item.itemName;
        document.getElementById('item-price').value = item.price;
        document.getElementById('item-description').value = item.description || '';
        
        // 顯示現有圖片
        if (item.menuImage) {
            document.getElementById('current-image').innerHTML = `
                <img src="data:image/jpeg;base64,${item.menuImage}" alt="${item.itemName}">
            `;
        } else {
            document.getElementById('current-image').innerHTML = '';
        }

        document.getElementById('addMenuItemModal').style.display = 'block';
    } catch (error) {
        console.error('載入菜品資料失敗:', error);
        alert('載入菜品資料失敗，請稍後再試');
    }
}

// 刪除菜品
async function deleteMenuItem(id) {
    if (!confirm('確定要刪除這個菜品嗎？')) {
        return;
    }

    try {
        const token = localStorage.getItem('merchantToken');
        const response = await fetch(`http://localhost:8080/api/merchants/menu/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('刪除失敗');
        }

        alert('刪除成功');
        loadMenuItems(); // 重新載入菜單
    } catch (error) {
        console.error('刪除失敗:', error);
        alert('刪除失敗，請稍後再試');
    }
}

// 提交菜品表單
async function submitMenuItem() {
    const form = document.getElementById('addMenuItemForm');
    if (!form.checkValidity()) {
        alert('請填寫所有必要欄位');
        return;
    }

    const formData = {
        itemName: document.getElementById('item-name').value,
        price: parseFloat(document.getElementById('item-price').value),
        description: document.getElementById('item-description').value
    };

    // 處理圖片
    const imageInput = document.getElementById('item-image');
    if (imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            formData.menuImage = e.target.result.split(',')[1]; // 移除 data:image/jpeg;base64,
            await sendMenuItemData(formData);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        await sendMenuItemData(formData);
    }
}

// 發送菜品資料到後端
async function sendMenuItemData(formData) {
    try {
        const token = localStorage.getItem('merchantToken');
        const url = currentMode === 'add' 
            ? 'http://localhost:8080/api/merchants/menu'
            : `http://localhost:8080/api/merchants/menu/${currentEditId}`;
        
        const response = await fetch(url, {
            method: currentMode === 'add' ? 'POST' : 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(currentMode === 'add' ? '新增失敗' : '更新失敗');
        }

        alert(currentMode === 'add' ? '新增成功' : '更新成功');
        hideAddMenuItemModal();
        loadMenuItems(); // 重新載入菜單
    } catch (error) {
        console.error('提交失敗:', error);
        alert('提交失敗，請稍後再試');
    }
}

// 登出功能
document.querySelector('.logout-item').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('merchantToken');
    window.location.href = 'index.html';
});

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 分類篩選
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // 這裡可以實現分類篩選功能
            ('選擇分類:', this.value);
        });
    }

    // 排序功能
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', function() {
            // 這裡可以實現排序功能
            ('排序方式:', this.value);
        });
    }
}); 