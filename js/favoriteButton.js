// 收藏按鈕處理模組
// 請確保 config.js 已在 HTML 中先引入

class FavoriteButton {
    constructor() {
        this.initialized = false;
        // API 基礎 URL
        this.apiBaseUrl = 'http://localhost:8080';
    }

    // 初始化收藏按鈕
    async initialize() {
        try {
            // 確保收藏系統已初始化
            if (!window.favoriteSystem?.initialized) {
                await window.favoriteSystem?.initialize();
            }

            // 初始化所有收藏按鈕
            await this.initializeAllButtons();
            
            // 添加對收藏變更事件的監聽
            this.setupFavoritesChangedListener();
            
            this.initialized = true;
            console.log('收藏按鈕初始化成功');
            return true;
        } catch (error) {
            console.error('收藏按鈕初始化失敗:', error);
            return false;
        }
    }

    // 設置收藏變更事件監聽器
    setupFavoritesChangedListener() {
        document.addEventListener('favoritesChanged', async (event) => {
            console.log('收藏變更事件被觸發，重新排序餐廳列表');
            await this.reorderRestaurantsByFavorite();
        });
    }
    
    // 重新排序餐廳列表，將收藏的餐廳移到最前面
    async reorderRestaurantsByFavorite() {
        try {
            // 獲取餐廳容器
            const container = document.getElementById('restaurants-container');
            if (!container) {
                console.log('找不到餐廳容器，無法重新排序');
                return;
            }
            
            // 獲取所有餐廳卡片
            const cards = Array.from(container.querySelectorAll('.restaurant-card'));
            if (cards.length === 0) {
                console.log('沒有找到餐廳卡片，無法重新排序');
                return;
            }
            
            console.log(`開始重新排序 ${cards.length} 張餐廳卡片`);
            
            // 創建一個新的陣列以保存排序後的卡片
            const sortedCards = await Promise.all(cards.map(async (card) => {
                // 找到卡片中的收藏按鈕，獲取餐廳ID
                const favoriteBtn = card.querySelector('.favorite-btn');
                if (!favoriteBtn) {
                    console.warn('找不到收藏按鈕，無法確定收藏狀態');
                    return { card, isFavorited: false };
                }
                
                const placeId = favoriteBtn.getAttribute('data-place-id');
                if (!placeId) {
                    console.warn('找不到餐廳ID，無法確定收藏狀態');
                    return { card, isFavorited: false };
                }
                
                // 檢查是否已收藏
                let isFavorited = false;
                if (window.favoriteSystem) {
                    isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
                }
                
                return { card, isFavorited };
            }));
            
            // 根據收藏狀態排序卡片
            sortedCards.sort((a, b) => {
                if (a.isFavorited && !b.isFavorited) return -1;
                if (!a.isFavorited && b.isFavorited) return 1;
                return 0;
            });
            
            console.log('餐廳卡片排序完成，開始更新DOM');
            
            // 臨時容器用於重建DOM結構
            const fragment = document.createDocumentFragment();
            
            // 將排序後的卡片添加到fragment中
            sortedCards.forEach(item => {
                fragment.appendChild(item.card);
            });
            
            // 清空原容器並添加排序後的卡片
            container.innerHTML = '';
            container.appendChild(fragment);
            
            console.log('餐廳列表重新排序完成，收藏的餐廳已移到最前面');
        } catch (error) {
            console.error('重新排序餐廳列表時發生錯誤:', error);
        }
    }
    
    // 將餐廳卡片移到最前面
    moveCardToFront(button) {
        try {
            // 找到所屬的餐廳卡片
            const card = button.closest('.restaurant-card') || button.closest('.store-card');
            if (!card) {
                console.warn('找不到餐廳卡片，無法移動到前面');
                return;
            }
            
            // 找到餐廳容器
            const container = document.getElementById('restaurants-container');
            if (!container) {
                console.warn('找不到餐廳容器，無法移動卡片');
                return;
            }
            
            // 檢查卡片是否已在最前面
            if (container.firstChild === card) {
                console.log('卡片已在最前面，無需移動');
                return;
            }
            
            // 移除卡片，並添加到容器最前面
            card.remove();
            container.insertBefore(card, container.firstChild);
            
            // 添加高亮效果
            card.style.transition = 'background-color 0.5s';
            card.style.backgroundColor = 'rgba(255, 107, 26, 0.1)';
            
            // 滾動到卡片位置
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // 2秒後恢復原來的背景色
            setTimeout(() => {
                card.style.backgroundColor = '';
            }, 2000);
            
            console.log('已將餐廳卡片移到最前面');
        } catch (error) {
            console.error('移動餐廳卡片時發生錯誤:', error);
        }
    }

    // 初始化所有收藏按鈕
    async initializeAllButtons() {
        try {
            // 找到所有收藏按鈕
            const buttons = document.querySelectorAll('.favorite-btn');
            console.log(`找到 ${buttons.length} 個收藏按鈕`);
            
            for (const button of buttons) {
                // 獲取店家/評論ID
                const placeId = button.getAttribute('data-place-id');
                const reviewId = button.getAttribute('data-review-id');

                console.log('處理按鈕:', {
                    placeId: placeId,
                    reviewId: reviewId,
                    classes: button.className,
                    hasIcon: !!button.querySelector('i')
                });

                if (placeId) {
                    // 設置店家收藏按鈕狀態
                    await this.updateStoreButtonState(button, placeId);
                    // 添加點擊事件
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleStoreFavorite(placeId, button);
                    };
                    console.log(`初始化餐廳收藏按鈕 (ID: ${placeId})`);
                } else if (reviewId) {
                    // 設置評論收藏按鈕狀態
                    this.updateReviewButtonState(button, reviewId);
                    // 添加點擊事件
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleReviewFavorite(reviewId, button);
                    };
                } else {
                    console.warn('發現沒有 ID 的收藏按鈕');
                }

                // 確認按鈕初始化後的狀態
                const icon = button.querySelector('i');
                console.log('按鈕初始化後狀態:', {
                    id: placeId || reviewId,
                    isActive: button.classList.contains('active'),
                    iconClass: icon ? icon.className : 'no icon',
                    buttonClasses: button.className
                });
            }
        } catch (error) {
            console.error('初始化收藏按鈕時發生錯誤:', error);
        }
    }

    // 更新店家收藏按鈕狀態
    async updateStoreButtonState(button, placeId) {
        if (!window.favoriteSystem) {
            console.warn('收藏系統未初始化，無法更新按鈕狀態');
            return;
        }
        
        console.log('更新按鈕狀態，檢查ID:', placeId);
        const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
        console.log('按鈕狀態檢查結果:', isFavorited);
        this.updateButtonUI(button, isFavorited);
    }

    // 更新評論收藏按鈕狀態
    updateReviewButtonState(button, reviewId) {
        if (!window.favoriteSystem) {
            console.warn('收藏系統未初始化，無法更新按鈕狀態');
            return;
        }
        
        const isFavorited = window.favoriteSystem.isReviewFavorited(reviewId);
        this.updateButtonUI(button, isFavorited);
    }

    // 更新按鈕UI
    updateButtonUI(button, isFavorited) {
        try {
            console.log('更新按鈕UI:', {
                button: button,
                isFavorited: isFavorited,
                hasIcon: !!button.querySelector('i')
            });

            if (!button) {
                console.error('按鈕元素不存在');
                return;
            }

            const icon = button.querySelector('i');
            if (!icon) {
                console.error('按鈕中找不到圖標元素');
                return;
            }

            if (isFavorited) {
                console.log('設置按鈕為已收藏狀態');
                button.classList.add('active');
                icon.className = 'fas fa-heart';
            } else {
                console.log('設置按鈕為未收藏狀態');
                button.classList.remove('active');
                icon.className = 'far fa-heart';
            }

            // 檢查更新後的狀態
            console.log('按鈕更新後狀態:', {
                classes: button.className,
                iconClasses: icon.className,
                isActive: button.classList.contains('active')
            });
        } catch (error) {
            console.error('更新按鈕UI時發生錯誤:', error);
        }
    }

    // 切換店家收藏狀態
    async toggleStoreFavorite(placeId, button) {
        try {
            if (!window.favoriteSystem) {
                console.error('收藏系統未初始化');
                this.showToast('收藏系統未初始化，請重新整理頁面');
                return;
            }
            
            if (!placeId) {
                console.error('缺少餐廳ID');
                this.showToast('無法識別餐廳，請重新整理頁面');
                return;
            }

            console.log('處理收藏切換，餐廳ID:', placeId);

            // 檢查是否已登入
            const userId = localStorage.getItem('userId');
            if (!userId || !localStorage.getItem('isLoggedIn')) {
                this.showToast('請先登入會員');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                return;
            }
            
            // 檢查收藏狀態
            const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
            console.log('當前收藏狀態:', isFavorited);
            
            let success = false;
            
            if (!isFavorited) {
                // 獲取店家資訊
                const name = button ? button.getAttribute('data-name') : '未知餐廳';
                
                // 嘗試獲取商家圖片
                let photos = null;
                if (button) {
                    const restCard = button.closest('.restaurant-card') || button.closest('.store-card');
                    if (restCard) {
                        const imgElement = restCard.querySelector('img');
                        if (imgElement && imgElement.src) {
                            photos = imgElement.src;
                            console.log(`找到商家圖片: ${photos}`);
                        }
                    }
                }

                // 若來自詳情彈窗，尋找彈窗圖片
                if (!photos && window.currentSelectedRestaurant && window.currentSelectedRestaurant.photos) {
                    photos = window.currentSelectedRestaurant.photos;
                    console.log(`從詳情彈窗獲取圖片: ${photos}`);
                }
                
                const storeData = {
                    id: placeId,
                    place_id: placeId,
                    name: name,
                    photos: photos,
                    favoriteTime: new Date().toISOString()
                };
                
                console.log('準備添加收藏:', storeData);
                
                // 更新前端收藏系統
                success = await window.favoriteSystem.addStore(storeData);
                if (success) {
                    this.showToast('已加入收藏');
                    // 更新按鈕狀態
                    if (button) {
                        this.updateButtonUI(button, true);
                        // 立即將該餐廳卡片移到最前面
                        this.moveCardToFront(button);
                    }
                    
                    // 觸發自定義事件通知收藏狀態變化
                    document.dispatchEvent(new CustomEvent('favoriteChanged', {
                        detail: { type: 'add', id: placeId }
                    }));
                    
                    // 同時觸發favoritesChanged事件以立即更新統計數據
                    document.dispatchEvent(new CustomEvent('favoritesChanged'));
                } else {
                    this.showToast('加入收藏失敗，請稍後再試');
                }
            } else {
                // 移除收藏
                success = await window.favoriteSystem.removeStore(placeId);
                if (success) {
                    this.showToast('已取消收藏');
                    // 更新按鈕狀態
                    if (button) {
                        this.updateButtonUI(button, false);
                    }
                    
                    // 觸發自定義事件通知收藏狀態變化
                    document.dispatchEvent(new CustomEvent('favoriteChanged', {
                        detail: { type: 'remove', id: placeId }
                    }));
                    
                    // 同時觸發favoritesChanged事件以立即更新統計數據
                    document.dispatchEvent(new CustomEvent('favoritesChanged'));
                } else {
                    this.showToast('取消收藏失敗，請稍後再試');
                }
            }

            // 如果操作成功，更新所有相同 ID 的按鈕
            if (success) {
                console.log('操作成功，更新所有相同 ID 的按鈕');
                await this.updateAllButtonsWithSameId(placeId);
            }

            // 如果在收藏頁面，重新載入內容
            if (window.location.pathname.includes('userCenter.html')) {
                if (window.favoriteUI && typeof window.favoriteUI.loadContent === 'function') {
                    await window.favoriteUI.loadContent();
                }
            }
            
            return success;
        } catch (error) {
            console.error('切換收藏狀態失敗:', error);
            this.showToast('操作失敗，請稍後再試');
            return false;
        }
    }

    // 切換評論收藏狀態
    async toggleReviewFavorite(reviewId, button) {
        try {
            if (!window.favoriteSystem) {
                console.error('收藏系統未初始化');
                this.showToast('收藏系統未初始化，請重新整理頁面');
                return;
            }
            
            if (!reviewId) {
                console.error('缺少評論ID');
                this.showToast('無法識別評論，請重新整理頁面');
                return;
            }

            // 檢查是否已登入
            if (!localStorage.getItem('isLoggedIn')) {
                this.showToast('請先登入會員');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                return;
            }
            
            const isFavorited = window.favoriteSystem.isReviewFavorited(reviewId);
            let success = false;
            
            if (isFavorited) {
                // 移除收藏
                success = await window.favoriteSystem.removeReview(reviewId);
                if (success) {
                    this.showToast('已取消收藏');
                    
                    // 觸發自定義事件通知收藏狀態變化
                    document.dispatchEvent(new CustomEvent('favoriteChanged', {
                        detail: { type: 'remove', id: reviewId, isReview: true }
                    }));
                    
                    // 同時觸發favoritesChanged事件以立即更新統計數據
                    document.dispatchEvent(new CustomEvent('favoritesChanged'));
                } else {
                    this.showToast('取消收藏失敗，請稍後再試');
                    return;
                }
            } else {
                // 獲取評論資訊
                const reviewElement = button.closest('[data-review-id]');
                const reviewData = this.extractReviewData(reviewElement);
                
                if (!reviewData) {
                    this.showToast('無法獲取評論資訊，請稍後再試');
                    return;
                }
                
                success = await window.favoriteSystem.addReview(reviewData);
                if (success) {
                    this.showToast('已加入收藏');
                    
                    // 觸發自定義事件通知收藏狀態變化
                    document.dispatchEvent(new CustomEvent('favoriteChanged', {
                        detail: { type: 'add', id: reviewId, isReview: true }
                    }));
                    
                    // 同時觸發favoritesChanged事件以立即更新統計數據
                    document.dispatchEvent(new CustomEvent('favoritesChanged'));
                } else {
                    this.showToast('加入收藏失敗，請稍後再試');
                    return;
                }
            }

            // 更新按鈕狀態
            this.updateReviewButtonState(button, reviewId);

            // 如果在收藏頁面，重新載入內容
            if (window.favoriteUI) {
                await window.favoriteUI.loadContent();
            }
        } catch (error) {
            console.error('切換收藏狀態失敗:', error);
            this.showToast('操作失敗，請稍後再試');
        }
    }

    // 更新所有具有相同ID的按鈕
    async updateAllButtonsWithSameId(placeId) {
        try {
            console.log(`開始更新所有 ID 為 ${placeId} 的按鈕`);
            
            const buttons = document.querySelectorAll(`.favorite-btn[data-place-id="${placeId}"]`);
            console.log(`找到 ${buttons.length} 個按鈕需要更新`);
            
            const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
            console.log(`獲取到的收藏狀態: ${isFavorited}`);
            
            buttons.forEach((button, index) => {
                console.log(`更新第 ${index + 1} 個按鈕`);
                this.updateButtonUI(button, isFavorited);
            });
            
            // 驗證更新結果
            buttons.forEach((button, index) => {
                const icon = button.querySelector('i');
                console.log(`按鈕 ${index + 1} 更新後狀態:`, {
                    isActive: button.classList.contains('active'),
                    iconClass: icon ? icon.className : 'no icon',
                    buttonClasses: button.className
                });
            });
        } catch (error) {
            console.error('更新相同ID按鈕時發生錯誤:', error);
        }
    }

    // 從DOM元素提取評論資料
    extractReviewData(element) {
        if (!element) return null;

        return {
            id: element.dataset.reviewId,
            userName: element.querySelector('.reviewer-name')?.textContent || '未知用戶',
            userAvatar: element.querySelector('.reviewer-avatar')?.src || '',
            storeName: element.querySelector('.store-name')?.textContent || '未知餐廳',
            content: element.querySelector('.review-content')?.textContent || '',
            rating: element.querySelector('.review-rating')?.textContent.length || 0,
            date: element.querySelector('.review-date')?.textContent || new Date().toLocaleDateString()
        };
    }

    async addToFavorites(placeId) {
        const userId = localStorage.getItem('userId');
        const url = `${API_BASE_URL}/users/${userId}/favorites/restaurants/${placeId}`;
      
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            // body: JSON.stringify({}) // 若後端需要額外參數就放在這
          });
      
          if (!res.ok) {
            // 伺服器回 4xx/5xx
            const errorBody = await res.json().catch(() => ({}));
            throw new Error(errorBody.message || `加入收藏失敗（${res.status}）`);
          }
      
          const result = await res.json();
          // 假設後端回 { success: true, data: { id: X, place_id: Y, … } }
          if (result.success) { 
            // 把剛收藏的餐廳加到本地陣列
            this.localFavorites.push({
              id: result.data.id,        // 後端分配的主鍵
              place_id: result.data.place_id,
              name: result.data.name,
              // …其他欄位
            });
            // 更新 UI：把愛心圖示標為已收藏
            this.updateFavoriteButton(placeId, true);
      
            // 顯示成功訊息
            alert('已加入我的最愛！');
          } else {
            throw new Error(result.message || '加入收藏失敗');
          }
        } catch (err) {
          console.error('addToFavorites 錯誤：', err);
          alert(err.message || '網路異常，請稍後再試');
        }
    }
    
    // 顯示 Toast 提示訊息
    showToast(message) {
        // 如果已經定義了全局 showToast 函數，則使用它
        if (window.showToast && typeof window.showToast === 'function') {
            window.showToast(message);
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        toast.offsetHeight;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// 創建全局單例
window.favoriteButton = new FavoriteButton();

// 在 DOMContentLoaded 事件中初始化收藏按鈕
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.favoriteButton.initialized) {
            await window.favoriteButton.initialize();
            console.log('收藏按鈕初始化完成');
        }
    } catch (error) {
        console.error('收藏按鈕初始化失敗:', error);
    }
});