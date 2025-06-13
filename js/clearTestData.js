// 清除收藏店家測試數據
document.addEventListener('DOMContentLoaded', function() {
    console.log('正在清除測試資料...');
    
    // 獲取當前收藏店家
    const currentStores = JSON.parse(localStorage.getItem('favoriteStores')) || [];
    
    // 過濾掉測試數據（測試數據的ID以'test-restaurant-'開頭）
    const filteredStores = currentStores.filter(store => 
        !store.id.startsWith('test-restaurant-') && 
        !store.place_id.startsWith('test-restaurant-')
    );
    
    // 更新localStorage
    localStorage.setItem('favoriteStores', JSON.stringify(filteredStores));
    
    console.log(`測試資料已清除，從 ${currentStores.length} 筆收藏減少到 ${filteredStores.length} 筆`);
    
    // 顯示通知
    if (typeof showToast === 'function') {
        showToast('已成功移除測試資料');
    }
}); 