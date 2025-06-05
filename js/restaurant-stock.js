// 初始化庫存記錄
function initializeStockRecords() {
    const stockTable = document.querySelector('.stock-table table tbody');
    const sampleData = [
        { id: 1, name: '高麗菜', quantity: '10箱' },
        { id: 2, name: '胡蘿蔔', quantity: '5箱' },
        { id: 3, name: '洋蔥', quantity: '8箱' },
        { id: 4, name: '馬鈴薯', quantity: '15箱' },
        { id: 5, name: '青椒', quantity: '6箱' }
    ];

    // 清空表格
    stockTable.innerHTML = '';

    // 添加樣本數據
    sampleData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>
                <button class="action-btn edit" onclick="editRecord(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteRecord(${item.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        stockTable.appendChild(row);
    });
}

// 顯示新增庫存彈窗
function showAddStockModal() {
    const modal = document.getElementById('addStockModal');
    modal.classList.add('show');
}

// 關閉彈窗
function closeModal() {
    const modal = document.getElementById('addStockModal');
    modal.classList.remove('show');
}

// 處理新增庫存表單提交
function handleAddStockSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('itemName');
    const quantityInput = document.getElementById('itemQuantity');
    
    const name = nameInput.value.trim();
    const quantity = quantityInput.value.trim();
    
    if (!name || !quantity) {
        alert('請填寫品名和數量');
        return;
    }
    
    // 獲取表格主體
    const stockTable = document.querySelector('.stock-table table tbody');
    
    // 創建新行
    const newRow = document.createElement('tr');
    const newId = stockTable.children.length + 1;
    
    newRow.innerHTML = `
        <td>${name}</td>
        <td>${quantity}</td>
        <td>
            <button class="action-btn edit" onclick="editRecord(${newId})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="deleteRecord(${newId})">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    
    // 添加到表格
    stockTable.appendChild(newRow);
    
    // 重置表單並關閉彈窗
    document.getElementById('addStockForm').reset();
    closeModal();
}

// 編輯記錄
function editRecord(id) {
    // 獲取當前行的數據
    const row = document.querySelector(`.stock-table table tbody tr:nth-child(${id})`);
    const name = row.cells[0].textContent;
    const quantity = row.cells[1].textContent;
    
    // 填充表單
    document.getElementById('itemName').value = name;
    document.getElementById('itemQuantity').value = quantity;
    
    // 顯示彈窗
    showAddStockModal();
    
    // 更新提交按鈕文字
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = '更新';
    
    // 更新提交處理函數
    submitBtn.onclick = function(event) {
        event.preventDefault();
        
        const newName = document.getElementById('itemName').value.trim();
        const newQuantity = document.getElementById('itemQuantity').value.trim();
        
        if (!newName || !newQuantity) {
            alert('請填寫品名和數量');
            return;
        }
        
        // 更新表格數據
        row.cells[0].textContent = newName;
        row.cells[1].textContent = newQuantity;
        
        // 重置表單並關閉彈窗
        document.getElementById('addStockForm').reset();
        closeModal();
        
        // 恢復提交按鈕原始狀態
        submitBtn.textContent = '確認';
        submitBtn.onclick = handleAddStockSubmit;
    };
}

// 刪除記錄
function deleteRecord(id) {
    if (confirm('確定要刪除這筆記錄嗎？')) {
        const row = document.querySelector(`.stock-table table tbody tr:nth-child(${id})`);
        row.remove();
    }
}

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化庫存記錄
    initializeStockRecords();
    
    // 綁定新增按鈕事件
    const addStockBtn = document.querySelector('.add-stock-btn');
    addStockBtn.addEventListener('click', showAddStockModal);
    
    // 綁定關閉按鈕事件
    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeModal);
    
    // 綁定取消按鈕事件
    const cancelBtn = document.querySelector('.cancel-btn');
    cancelBtn.addEventListener('click', closeModal);
    
    // 綁定表單提交事件
    const addStockForm = document.getElementById('addStockForm');
    addStockForm.addEventListener('submit', function(event) {
        event.preventDefault();
        handleAddStockSubmit(event);
    });
    
    // 綁定確認按鈕事件
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        handleAddStockSubmit(event);
    });
}); 