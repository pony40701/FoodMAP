view-full-hours-btn// 收藏按鈕處理模組
class FavoriteButton {
    constructor() {
        this.initialized = false;
    }

    // 初始化收藏按鈕
    async initialize() {
        try {
            // 確保收藏系統已初始化
            if (!window.favoriteSystem?.initialized) {
                await window.favoriteSystem?.initialize();
            }

            // 初始化所有收藏按鈕
            this.initializeAllButtons();
            
            this.initialized = true;
            console.log('收藏按鈕初始化成功');
            return true;
        } catch (error) {
            console.error('收藏按鈕初始化失敗:', error);
            return false;
        }
    }

    // 初始化所有收藏按鈕
    initializeAllButtons() {
        try {
            // 找到所有收藏按鈕
            const buttons = document.querySelectorAll('.favorite-btn');
            console.log(`找到 ${buttons.length} 個收藏按鈕`);
            
            buttons.forEach(button => {
                // 獲取店家/評論ID
                const placeId = button.getAttribute('data-place-id');
                const reviewId = button.getAttribute('data-review-id');

                if (placeId) {
                    // 設置店家收藏按鈕狀態
                    this.updateStoreButtonState(button, placeId);
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
            });
        } catch (error) {
            console.error('初始化收藏按鈕時發生錯誤:', error);
        }
    }

    // 更新店家收藏按鈕狀態
    updateStoreButtonState(button, placeId) {
        if (!window.favoriteSystem) {
            console.warn('收藏系統未初始化，無法更新按鈕狀態');
            return;
        }
        
        const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
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
        if (isFavorited) {
            button.classList.add('active');
            button.querySelector('i').className = 'fas fa-heart';
        } else {
            button.classList.remove('active');
            button.querySelector('i').className = 'far fa-heart';
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

            // 檢查是否已登入
            if (!localStorage.getItem('isLoggedIn')) {
                this.showToast('請先登入會員');
                if (window.showLoginModal) {
                    window.showLoginModal();
                }
                return;
            }
            
            const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
            
            if (isFavorited) {
                // 移除收藏
                const success = await window.favoriteSystem.removeStore(placeId);
                if (success) {
                    this.showToast('已取消收藏');
                } else {
                    this.showToast('取消收藏失敗，請稍後再試');
                    return;
                }
            } else {
                // 獲取店家資訊
                const name = button.getAttribute('data-name') || '未知餐廳';
                
                // 嘗試獲取商家圖片
                let photos = null;
                const restCard = button.closest('.restaurant-card') || button.closest('.store-card');
                if (restCard) {
                    const imgElement = restCard.querySelector('img');
                    if (imgElement && imgElement.src) {
                        photos = imgElement.src;
                        console.log(`找到商家圖片: ${photos}`);
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
                    photos: photos,  // 加入圖片資訊
                    favoriteTime: new Date().toISOString()
                };
                
                const success = await window.favoriteSystem.addStore(storeData);
                if (success) {
                    this.showToast('已加入收藏');
                } else {
                    this.showToast('加入收藏失敗，請稍後再試');
                    return;
                }
            }

            // 更新按鈕狀態
            this.updateStoreButtonState(button, placeId);

            // 如果在收藏頁面，重新載入內容
            if (window.favoriteUI) {
                await window.favoriteUI.loadContent();
            }
            
            // 更新所有相同 ID 的按鈕
            this.updateAllButtonsWithSameId(placeId);
            
        } catch (error) {
            console.error('切換收藏狀態失敗:', error);
            this.showToast('操作失敗，請稍後再試');
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
            
            if (isFavorited) {
                // 移除收藏
                const success = await window.favoriteSystem.removeReview(reviewId);
                if (success) {
                    this.showToast('已取消收藏');
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
                
                const success = await window.favoriteSystem.addReview(reviewData);
                if (success) {
                    this.showToast('已加入收藏');
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
    updateAllButtonsWithSameId(placeId) {
        try {
            const buttons = document.querySelectorAll(`.favorite-btn[data-place-id="${placeId}"]`);
            const isFavorited = window.favoriteSystem.isStoreFavorited(placeId);
            
            buttons.forEach(button => {
                this.updateButtonUI(button, isFavorited);
            });
            
            console.log(`更新了 ${buttons.length} 個相同ID的按鈕`);
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

    // 顯示提示訊息
    showToast(message) {
        if (window.showToast) {
            window.showToast(message);
        } else {
            alert(message);
        }
    }
}

// 創建全局實例
window.favoriteButton = new FavoriteButton();

// 在 DOMContentLoaded 事件中初始化收藏按鈕
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!window.favoriteButton.initialized) {
            await window.favoriteButton.initialize();
        }
    } catch (error) {
        console.error('收藏按鈕初始化失敗:', error);
    }
}); 