// 初始化圖表
function initializeChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
            datasets: [{
                label: '營收金額',
                data: [12000, 19000, 15000, 25000, 22000, 30000],
                borderColor: '#ff6b1a',
                backgroundColor: 'rgba(255, 107, 26, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    return chart;
}

// 初始化營收記錄
function initializeRevenueRecords() {
    const records = [
        {
            id: 1,
            date: '2024-03-15',
            amount: 15000,
            paymentMethod: '現金',
            note: '午餐時段'
        },
        {
            id: 2,
            date: '2024-03-14',
            amount: 18000,
            paymentMethod: '信用卡',
            note: '晚餐時段'
        },
        {
            id: 3,
            date: '2024-03-13',
            amount: 12000,
            paymentMethod: '現金',
            note: '午餐時段'
        }
    ];

    const tbody = document.querySelector('.revenue-table tbody');
    tbody.innerHTML = '';

    records.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(record.date)}</td>
            <td>NT$ ${record.amount.toLocaleString()}</td>
            <td>${record.paymentMethod}</td>
            <td>${record.note}</td>
            <td>
                <button class="action-btn edit" onclick="editRecord(${record.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteRecord(${record.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 顯示新增營收彈窗
function showAddRevenueModal() {
    const modal = document.getElementById('addRevenueModal');
    modal.classList.add('show');
}

// 關閉彈窗
function closeModal() {
    const modal = document.getElementById('addRevenueModal');
    modal.classList.remove('show');
}

// 處理新增營收表單提交
function handleAddRevenueSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('addRevenueForm');
    const formData = new FormData(form);
    
    // 這裡可以添加表單驗證邏輯
    
    // 模擬新增營收記錄
    const newRecord = {
        id: Date.now(),
        date: formData.get('revenue-date'),
        amount: parseFloat(formData.get('revenue-amount')),
        paymentMethod: formData.get('revenue-payment'),
        note: formData.get('revenue-note')
    };
    
    // 更新表格
    const tbody = document.querySelector('.revenue-table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${formatDate(newRecord.date)}</td>
        <td>#ORD${String(newRecord.id).slice(-4)}</td>
        <td>NT$ ${newRecord.amount.toLocaleString()}</td>
        <td>${newRecord.paymentMethod}</td>
        <td>${newRecord.note}</td>
        <td>
            <button class="action-btn edit" onclick="editRecord(${newRecord.id})">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" onclick="deleteRecord(${newRecord.id})">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    tbody.insertBefore(tr, tbody.firstChild);
    
    // 關閉彈窗並重置表單
    closeModal();
    form.reset();
}

// 編輯營收記錄
function editRecord(id) {
    // 這裡可以實現編輯功能
    ('編輯記錄:', id);
}

// 刪除營收記錄
function deleteRecord(id) {
    if (confirm('確定要刪除這筆營收記錄嗎？')) {
        // 這裡可以實現刪除功能
        ('刪除記錄:', id);
    }
}

// 處理圖表時間範圍變更
function handleChartTimeRangeChange(event) {
    const timeRange = event.target.value;
    // 這裡可以根據選擇的時間範圍更新圖表數據
    ('更新圖表時間範圍:', timeRange);
}

// 處理表格篩選
function handleTableFilter(event) {
    const filterType = event.target.name;
    const filterValue = event.target.value;
    // 這裡可以實現表格篩選功能
    ('篩選條件:', filterType, filterValue);
}

// 初始化分頁
function initializePagination() {
    const pagination = document.querySelector('.pagination');
    const totalPages = 5;
    const currentPage = 1;
    
    let paginationHTML = `
        <button class="page-button" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="page-button ${i === currentPage ? 'active' : ''}">
                ${i}
            </button>
        `;
    }
    
    paginationHTML += `
        <button class="page-button" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化圖表
    const chart = initializeChart();
    
    // 初始化營收記錄
    initializeRevenueRecords();
    
    // 初始化分頁
    initializePagination();
    
    // 綁定事件監聽器
    document.querySelector('.add-revenue-btn').addEventListener('click', showAddRevenueModal);
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.querySelector('.cancel-btn').addEventListener('click', closeModal);
    document.querySelector('.submit-btn').addEventListener('click', function() {
        document.getElementById('addRevenueForm').dispatchEvent(new Event('submit'));
    });
    document.getElementById('addRevenueForm').addEventListener('submit', handleAddRevenueSubmit);
    document.getElementById('time-range').addEventListener('change', handleChartTimeRangeChange);
    document.getElementById('date-filter').addEventListener('change', handleTableFilter);
    document.getElementById('payment-filter').addEventListener('change', handleTableFilter);
    
    // 點擊彈窗外部關閉彈窗
    document.getElementById('addRevenueModal').addEventListener('click', function(event) {
        if (event.target === this) {
            closeModal();
        }
    });
}); 