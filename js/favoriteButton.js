// 收藏按鈕處理模組
// 請確保 config.js 已在 HTML 中先引入

class FavoriteButton {
    constructor() {
        this.initialized = false;
        // API 基礎 URL
        this.apiBaseUrl = 'http://localhost:8080';
    }

    // 初始化收藏按鈕
    async initialize(forceRefresh = false) {
        try {
            // 確保收藏系統已初始化
            if (!window.favoriteSystem?.initialized || forceRefresh) {
                await window.favoriteSystem?.initialize();
            }

            // 初始化所有收藏按鈕
            await this.initializeAllButtons();
            
            // 添加對收藏變更事件的監聽
            this.setupFavoritesChangedListener();
            
            this.initialized = true;
            return true;
        } catch (error) {
            return false;
        }
    }

    // 設置收藏變更事件監聽器
    setupFavoritesChangedListener() {
        document.addEventListener('favoritesChanged', async (event) => {
            await this.reorderRestaurantsByFavorite();
        });
    }
    
    // 重新排序餐廳列表，將收藏的餐廳移到最前面
    async reorderRestaurantsByFavorite() {
        try {
            // 獲取餐廳容器
            const container = document.getElementById('restaurants-container');
            if (!container) {
                return;
            }
            
            // 獲取所有餐廳卡片
            const cards = Array.from(container.querySelectorAll('.restaurant-card'));
            if (cards.length === 0) {
                return;
            }
            
            // 創建一個新的陣列以保存排序後的卡片
            const sortedCards = await Promise.all(cards.map(async (card) => {
                // 找到卡片中的收藏按鈕，獲取餐廳ID
                const favoriteBtn = card.querySelector('.favorite-btn');
                if (!favoriteBtn) {
                    return { card, isFavorited: false };
                }
                
                const placeId = favoriteBtn.getAttribute('data-place-id');
                if (!placeId) {
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
            
            // 臨時容器用於重建DOM結構
            const fragment = document.createDocumentFragment();
            
            // 將排序後的卡片添加到fragment中
            sortedCards.forEach(item => {
                fragment.appendChild(item.card);
            });
            
            // 清空原容器並添加排序後的卡片
            container.innerHTML = '';
            container.appendChild(fragment);
        } catch (error) {
            // 錯誤處理
        }
    }
    
    // 將餐廳卡片移到最前面
    moveCardToFront(button) {
        try {
            // 找到所屬的餐廳卡片
            const card = button.closest('.restaurant-card') || button.closest('.store-card');
            if (!card) {
                return;
            }
            
            // 找到餐廳容器
            const container = document.getElementById('restaurants-container');
            if (!container) {
                return;
            }
            
            // 檢查卡片是否已在最前面
            if (container.firstChild === card) {
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
        } catch (error) {
            // 錯誤處理
        }
    }

    // 初始化所有收藏按鈕
    async initializeAllButtons() {
        try {
            // 檢查用戶登錄狀態
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const userId = localStorage.getItem('userId');
            
            // 找到所有收藏按鈕
            const buttons = document.querySelectorAll('.favorite-btn');
            
            for (const button of buttons) {
                // 獲取店家/評論ID
                const placeId = button.getAttribute('data-place-id');
                const reviewId = button.getAttribute('data-review-id');

                if (placeId) {
                    // 設置店家收藏按鈕狀態
                    if (isLoggedIn && userId) {
                        await this.updateStoreButtonState(button, placeId);
                    } else {
                        // 用戶未登錄，重置按鈕狀態
                        this.updateButtonUI(button, false);
                    }
                    
                    // 添加點擊事件
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleStoreFavorite(placeId, button);
                    };
                } else if (reviewId) {
                    // 設置評論收藏按鈕狀態
                    if (isLoggedIn && userId) {
                        this.updateReviewButtonState(button, reviewId);
                    } else {
                        // 用戶未登錄，重置按鈕狀態
                        this.updateButtonUI(button, false);
                    }
                    
                    // 添加點擊事件
                    button.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.toggleReviewFavorite(reviewId, button);
                    };
                }
            }
        } catch (error) {
            // 錯誤處理
        }
    }

    // 更新店家收藏按鈕狀態
    async updateStoreButtonState(button, placeId) {
        if (!window.favoriteSystem) {
            return;
        }
        
        const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
        this.updateButtonUI(button, isFavorited);
    }

    // 更新評論收藏按鈕狀態
    updateReviewButtonState(button, reviewId) {
        if (!window.favoriteSystem) {
            return;
        }
        
        const isFavorited = window.favoriteSystem.isReviewFavorited(reviewId);
        this.updateButtonUI(button, isFavorited);
    }

    // 更新按鈕UI
    updateButtonUI(button, isFavorited) {
        try {
            if (!button) {
                return;
            }

            const icon = button.querySelector('i');
            if (!icon) {
                return;
            }

            if (isFavorited) {
                button.classList.add('active');
                icon.className = 'fas fa-heart';
            } else {
                button.classList.remove('active');
                icon.className = 'far fa-heart';
            }
        } catch (error) {
            // 錯誤處理
        }
    }

    // 切換店家收藏狀態
    async toggleStoreFavorite(placeId, button) {
        try {
            if (!window.favoriteSystem) {
                this.showToast('收藏系統未初始化，請重新整理頁面');
                return;
            }
            
            if (!placeId) {
                this.showToast('無法識別餐廳，請重新整理頁面');
                return;
            }

            // 檢查是否已登入
            const userId = localStorage.getItem('userId');
            if (!userId || !localStorage.getItem('isLoggedIn')) {
                this.showToast('請先登入會員');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                return;
            }
            
            const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
            
            let success = false;
            
            if (!isFavorited) {
                // 獲取店家資訊
                const name = button ? button.getAttribute('data-name') : '未知餐廳';
                
                // 添加收藏
                success = await window.favoriteSystem.addStore({
                    place_id: placeId,
                    name: name
                });

                if (success) {
                    this.showToast('已加入收藏');
                    this.updateButtonUI(button, true);
                    this.updateAllButtonsWithSameId(placeId, true);
                } else {
                    this.showToast('無法加入收藏，請稍後再試');
                }
            } else {
                // 移除收藏前彈窗確認（美化）
                if (typeof showConfirmationModal === 'function') {
                    const confirmed = await showConfirmationModal('您確定要移除這家收藏店家嗎？', '移除收藏');
                    if (!confirmed) return;
                } else {
                    if (!window.confirm('您確定要移除這家收藏店家嗎？')) return;
                }
                // 移除收藏
                success = await window.favoriteSystem.removeStore(placeId);
                
                if (success) {
                    this.showToast('已從收藏中移除');
                    this.updateButtonUI(button, false);
                    this.updateAllButtonsWithSameId(placeId, false);
                } else {
                    this.showToast('無法移除收藏，請稍後再試');
                }
            }
        } catch (error) {
            this.showToast('請先登入會員');
        }
    }

    // 切換評論收藏狀態
    async toggleReviewFavorite(reviewId, button) {
        try {
            if (!window.favoriteSystem) {
                this.showToast('收藏系統未初始化，請重新整理頁面');
                return;
            }
            
            if (!reviewId) {
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
            this.showToast('請先登入會員');
        }
    }

    // 更新所有具有相同ID的按鈕
    async updateAllButtonsWithSameId(placeId) {
        try {
            const buttons = document.querySelectorAll(`.favorite-btn[data-place-id="${placeId}"]`);
            
            const isFavorited = await window.favoriteSystem.isStoreFavorited(placeId);
            
            buttons.forEach((button, index) => {
                this.updateButtonUI(button, isFavorited);
            });
        } catch (error) {
            // 錯誤處理
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
        }
    } catch (error) {
        // 錯誤處理
    }
});