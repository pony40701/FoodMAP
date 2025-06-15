// Toast 提示訊息管理模組
window.showToast = function(message) {
    // 檢查是否已存在 toast 元素
    let toast = document.getElementById('toast-notification');
    
    // 如果不存在，則創建一個
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #ff6b1a;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 9999;
            transition: opacity 0.3s, transform 0.3s;
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        `;
        document.body.appendChild(toast);
    }
    
    // 設置訊息內容
    toast.textContent = message;
    
    // 顯示 toast
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // 3秒後隱藏 toast
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        
        // 300ms 後移除元素
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}; 