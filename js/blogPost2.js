// 全局變數
let editor;
let isEditingPost = false; // 添加編輯模式標記
let editingPostId = null; // 添加正在編輯的文章ID

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化編輯器功能
    initEditor();
    // 初始化星級評分
    initRating();
    // 載入用戶數據
    loadUserData();
    // 載入文章列表
    loadPosts();
    // 初始化統計圖表
    initStatsChart();
    // 初始化字型大小控制
    initFontSize();
    // 初始化顏色選擇器
    initColorPicker();
    // 初始化導覽列
    initializeNavbar();
    // 初始化評分系統
    initRatingSystem();
    // 如果當前在草稿箱頁面，載入草稿
    if (document.getElementById('drafts-section').classList.contains('active')) {
        loadDrafts();
    }
});

// 初始化導覽列
function initializeNavbar() {
    // 恢復按鈕狀態
    // restoreButtonStates();
    
    // 設置當前頁面的導覽連結為 active
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

// 本地存儲功能
function addToWishlist(restaurantId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.includes(restaurantId)) {
        wishlist.push(restaurantId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
}

function removeFromWishlist(restaurantId) {
    let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist = wishlist.filter(id => id !== restaurantId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function addToFavorites(restaurantId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (!favorites.includes(restaurantId)) {
        favorites.push(restaurantId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function removeFromFavorites(restaurantId) {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    favorites = favorites.filter(id => id !== restaurantId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// 頁面載入時恢復按鈕狀態
// function restoreButtonStates() {
//     const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//     const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
//     wishlist.forEach(id => {
//         const button = document.querySelector(`.wishlist-btn[data-restaurant-id="${id}"]`);
//         if (button) {
//             button.classList.add('active');
//             button.querySelector('.btn-icon').textContent = '💖';
//             button.querySelector('.btn-text').textContent = '已加入';
//         }
//     });
    
//     favorites.forEach(id => {
//         const button = document.querySelector(`.favorite-btn[data-restaurant-id="${id}"]`);
//         if (button) {
//             button.classList.add('active');
//             button.querySelector('.btn-icon').textContent = '🌟';
//             button.querySelector('.btn-text').textContent = '已收藏';
//         }
//     });
// }

// // 通知功能
// function showNotification(message, type = 'info') {
//     const notification = document.createElement('div');
//     notification.className = `notification ${type}`;
//     notification.textContent = message;
    
//     document.body.appendChild(notification);
    
//     setTimeout(() => {
//         notification.classList.add('show');
//     }, 100);
    
//     setTimeout(() => {
//         notification.classList.remove('show');
//         setTimeout(() => {
//             notification.remove();
//         }, 300);
//     }, 2000);
// }

// 切換不同區段顯示
function showSection(sectionId) {
    // 隱藏所有區段
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // 顯示選中的區段
    document.getElementById(`${sectionId}-section`).classList.add('active');
    
    // 更新導覽列選中狀態
    document.querySelectorAll('.blog-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionId}')"]`).classList.add('active');

    // 根據不同區段載入對應內容
    switch (sectionId) {
        case 'drafts':
            loadDrafts();
            break;
        case 'published':
            loadPublishedPosts();
            break;
        case 'stats':
            // 重新初始化統計圖表和排行榜
            initStatsChart();
            break;
    }
}

// 圖片處理相關常量
const MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
const MAX_IMAGE_WIDTH = 1200; // 最大寬度
const IMAGE_QUALITY = 0.8; // 圖片壓縮質量

// 初始化編輯器功能
function initEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    // 設置編輯器預設字體大小
    editor.style.fontSize = `${currentFontSize}px`;

    // 初始化顏色選擇器
    initColorPicker();

    // 監聽選取範圍變化
    document.addEventListener('selectionchange', updateToolbarState);

    // 監聽輸入事件
    editor.addEventListener('input', updateToolbarState);

    // 監聽鍵盤事件
    editor.addEventListener('keyup', updateToolbarState);
    editor.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    formatText('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    formatText('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    formatText('underline');
                    break;
            }
        }
    });

    // 監聽編輯器的點擊事件，處理圖片選取
    editor.addEventListener('click', function(e) {
        // 移除所有圖片的選中狀態
        document.querySelectorAll('.image-container').forEach(container => {
            container.classList.remove('selected');
        });

        // 檢查是否點擊了圖片容器
        const imageContainer = e.target.closest('.image-container');
        if (imageContainer) {
            imageContainer.classList.add('selected');
            e.stopPropagation();
        }
    });

    // 監聽文檔點擊事件，取消圖片選中
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.editor')) {
            document.querySelectorAll('.image-container').forEach(container => {
                container.classList.remove('selected');
            });
        }
    });

    // 處理圖片上傳
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.addEventListener('change', handleImageUpload);
}

// 更新工具列狀態
function updateToolbarState() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    let container = range.commonAncestorContainer;
    
    // 確保選取範圍在編輯器內
    if (!editor.contains(container)) return;
    
    // 如果選中的是文字節點，獲取其父節點
    if (container.nodeType === 3) {
        container = container.parentNode;
    }

    // 獲取當前游標位置的樣式
    const computedStyle = window.getComputedStyle(container);
    
    // 更新字體大小選擇器
    const fontSize = parseInt(computedStyle.fontSize);
    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
        // 找到最接近的字體大小選項
        const availableSizes = Array.from(fontSizeSelect.options).map(option => parseInt(option.value));
        const closestSize = availableSizes.reduce((prev, curr) => {
            return (Math.abs(curr - fontSize) < Math.abs(prev - fontSize) ? curr : prev);
        });
        fontSizeSelect.value = closestSize;
    }

    // 更新粗體按鈕狀態
    const boldButton = document.querySelector('button[onclick="formatText(\'bold\')"]');
    if (boldButton) {
        boldButton.classList.toggle('active', computedStyle.fontWeight >= 600);
    }

    // 更新斜體按鈕狀態
    const italicButton = document.querySelector('button[onclick="formatText(\'italic\')"]');
    if (italicButton) {
        italicButton.classList.toggle('active', computedStyle.fontStyle === 'italic');
    }

    // 更新底線按鈕狀態和顏色
    const underlineButton = document.querySelector('button[onclick="formatText(\'underline\')"]');
    if (underlineButton) {
        let hasUnderline = false;
        let underlineColor = '';
        
        // 檢查當前節點及其所有父節點的底線樣式和顏色
        let currentNode = container;
        while (currentNode && currentNode !== document.body) {
            const style = window.getComputedStyle(currentNode);
            if (style.textDecoration.includes('underline')) {
                hasUnderline = true;
                underlineColor = style.color;
                break;
            }
            currentNode = currentNode.parentNode;
        }
        
        underlineButton.classList.toggle('active', hasUnderline);
        if (hasUnderline && underlineColor) {
            underlineButton.style.borderBottom = `2px solid ${underlineColor}`;
        } else {
            underlineButton.style.borderBottom = '';
        }
    }

    // 更新對齊按鈕狀態
    const alignButtons = {
        'justifyLeft': document.querySelector('button[onclick="formatText(\'justifyLeft\')"]'),
        'justifyCenter': document.querySelector('button[onclick="formatText(\'justifyCenter\')"]'),
        'justifyRight': document.querySelector('button[onclick="formatText(\'justifyRight\')"]')
    };

    Object.entries(alignButtons).forEach(([align, button]) => {
        if (button) {
            button.classList.remove('active');
        }
    });

    // 檢查當前對齊方式
    const textAlign = computedStyle.textAlign;
    if (alignButtons[`justify${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`]) {
        alignButtons[`justify${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`].classList.add('active');
    }

    // 更新顏色選擇器
    const colorPreview = document.querySelector('.color-preview');
    if (colorPreview) {
        let currentNode = container;
        let color = null;
        
        // 向上遍歷節點樹，找到最近的顏色設定
        while (currentNode && currentNode !== document.body) {
            const style = window.getComputedStyle(currentNode);
            const currentColor = style.color;
            
            // 檢查是否為有效的顏色值（不是透明或繼承）
            if (currentColor !== 'inherit' && 
                currentColor !== 'transparent' && 
                currentColor !== 'rgba(0, 0, 0, 0)' &&
                currentColor !== 'initial') {
                color = currentColor;
                break;
            }
            currentNode = currentNode.parentNode;
        }

        if (color) {
            // 轉換 rgb/rgba 為 hex
            if (color.startsWith('rgb')) {
                const rgb = color.match(/\d+/g);
                if (rgb) {
                    const hex = '#' + rgb.slice(0, 3).map(x => {
                        const hex = parseInt(x).toString(16);
                        return hex.length === 1 ? '0' + hex : hex;
                    }).join('');
                    colorPreview.style.backgroundColor = hex;
                    currentColor = hex;
                }
            } else {
                colorPreview.style.backgroundColor = color;
                currentColor = color;
            }
            
            // 更新自訂顏色輸入框
            const customColorInput = document.getElementById('customColor');
            if (customColorInput) {
                customColorInput.value = currentColor;
            }
        }
    }
}

// 文字格式化功能
window.formatText = function(command, value = null) {
    const editor = document.getElementById('editor');
    editor.focus();

    // 檢查是否有選中的圖片容器
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (range) {
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) {
            container = container.parentNode;
        }
        
        const imageWrapper = container.closest('.image-wrapper');
        
        if (imageWrapper && ['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
            imageWrapper.classList.remove('align-left', 'align-center', 'align-right');
            
            switch(command) {
                case 'justifyLeft':
                    imageWrapper.classList.add('align-left');
                    break;
                case 'justifyCenter':
                    imageWrapper.classList.add('align-center');
                    break;
                case 'justifyRight':
                    imageWrapper.classList.add('align-right');
                    break;
            }
            
            // 立即更新工具列狀態
            updateToolbarState();
            return;
        }
    }

    // 執行格式化命令
    document.execCommand(command, false, value);
    
    // 立即更新工具列狀態
    updateToolbarState();
};

// 插入圖片功能
window.insertImage = function() {
    const imageUpload = document.getElementById('imageUpload');
    imageUpload.click();
};

// 處理圖片上傳
async function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const editor = document.getElementById('editor');
    
    for (const file of files) {
        try {
            // 檢查文件類型
            if (!file.type.startsWith('image/')) {
                alert('請上傳圖片文件');
                continue;
            }

            // 檢查文件大小
            if (file.size > MAX_IMAGE_SIZE) {
                const processedImage = await processImage(file);
                await insertImageToEditor(processedImage, editor);
            } else {
                await insertImageToEditor(file, editor);
            }
        } catch (error) {
            console.error('處理圖片時發生錯誤：', error);
            alert('處理圖片時發生錯誤，請稍後再試');
        }
    }
    
    // 清除選擇的文件
    e.target.value = '';
}

// 處理圖片（壓縮/調整大小）
function processImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            // 計算新的尺寸
            let width = img.width;
            let height = img.height;
            
            if (width > MAX_IMAGE_WIDTH) {
                height = (MAX_IMAGE_WIDTH * height) / width;
                width = MAX_IMAGE_WIDTH;
            }

            // 創建 canvas 進行壓縮
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // 轉換為 Blob
            canvas.toBlob(
                (blob) => resolve(blob),
                'image/jpeg',
                IMAGE_QUALITY
            );
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

// 將圖片插入編輯器
function insertImageToEditor(imageFile, editor) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

            // 創建圖片容器結構
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper'; // 移除預設對齊類別
            
            const container = document.createElement('div');
            container.className = 'image-container';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.draggable = false;
            
            // 添加調整大小的控制點
            const handles = ['nw', 'ne', 'sw', 'se'].map(pos => {
                const handle = document.createElement('div');
                handle.className = `resize-handle resize-handle-${pos}`;
                handle.style.cssText = pos.includes('n') ? 
                    `top: -5px; ${pos.includes('w') ? 'left: -5px' : 'right: -5px'}; cursor: ${pos}-resize;` :
                    `bottom: -5px; ${pos.includes('w') ? 'left: -5px' : 'right: -5px'}; cursor: ${pos}-resize;`;
                return handle;
            });
            
            // 添加大小資訊顯示
            const resizeInfo = document.createElement('div');
            resizeInfo.className = 'resize-info';
            
            container.appendChild(img);
            handles.forEach(handle => container.appendChild(handle));
            container.appendChild(resizeInfo);
            
            // 在圖片前後添加換行，確保圖片獨立一行
            const breakBefore = document.createElement('br');
            const breakAfter = document.createElement('br');
            
            wrapper.appendChild(breakBefore);
            wrapper.appendChild(container);
            wrapper.appendChild(breakAfter);

            // 插入圖片到游標位置
            if (range) {
                range.insertNode(wrapper);
                // 將游標移動到圖片後面的換行符之後
                range.setStartAfter(breakAfter);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);
            } else {
                editor.appendChild(wrapper);
                const newRange = document.createRange();
                newRange.setStartAfter(wrapper);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            }
            
            // 初始化圖片縮放功能
            initializeImageResize(container, img, resizeInfo, handles);
            
            resolve();
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
    });
}

// 初始化圖片縮放功能
function initializeImageResize(container, img, resizeInfo, handles) {
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startWidth, startHeight;

    // 點擊圖片容器時選中它
    container.addEventListener('mousedown', function(e) {
        if (!e.target.classList.contains('resize-handle')) {
            e.preventDefault();
            // 移除其他圖片的選中狀態
            document.querySelectorAll('.image-container').forEach(cont => {
                if (cont !== container) {
                    cont.classList.remove('selected');
                }
            });
            // 切換當前圖片的選中狀態
            container.classList.toggle('selected');
        }
    });

    // 為每個控制點添加事件監聽
    handles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation();
            startResize(e, handle);
        });
    });

    function startResize(e, handle) {
        isResizing = true;
        currentHandle = handle;
        container.classList.add('resizing');

        // 記錄初始值
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        
        // 添加事件監聽
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        // 防止拖曳時選中文字
        e.preventDefault();
    }

    function resize(e) {
        if (!isResizing) return;

        // 計算移動距離
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const aspectRatio = startWidth / startHeight;
        
        let newWidth = startWidth;
        let newHeight = startHeight;

        // 根據不同的控制點計算新尺寸
        if (currentHandle.classList.contains('resize-handle-se')) {
            newWidth = Math.max(50, startWidth + deltaX);
            newHeight = newWidth / aspectRatio;
        } else if (currentHandle.classList.contains('resize-handle-sw')) {
            newWidth = Math.max(50, startWidth - deltaX);
            newHeight = newWidth / aspectRatio;
        } else if (currentHandle.classList.contains('resize-handle-ne')) {
            newWidth = Math.max(50, startWidth + deltaX);
            newHeight = newWidth / aspectRatio;
        } else if (currentHandle.classList.contains('resize-handle-nw')) {
            newWidth = Math.max(50, startWidth - deltaX);
            newHeight = newWidth / aspectRatio;
        }

        // 確保高度不小於最小值
        if (newHeight < 50) {
            newHeight = 50;
            newWidth = newHeight * aspectRatio;
        }

        // 更新圖片尺寸
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;

        // 更新大小資訊顯示
        updateResizeInfo(newWidth, newHeight);
    }

    function stopResize() {
        if (!isResizing) return;

        isResizing = false;
        currentHandle = null;
        container.classList.remove('resizing');
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        
        // 隱藏大小資訊
        setTimeout(() => {
            resizeInfo.style.display = 'none';
        }, 1500);
    }

    function updateResizeInfo(width, height) {
        resizeInfo.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
        resizeInfo.style.display = 'block';
    }
}

// 創建圖片操作按鈕
function createImageButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };
    return button;
}

// 包裝選中的文字
function wrapSelectedText(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const content = range.extractContents();
    element.appendChild(content);
    range.insertNode(element);
}

// 初始化星級評分
function initRating() {
    const starsContainers = document.querySelectorAll('.stars');
    if (!starsContainers.length) return;

    starsContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                updateStars(container, rating);
            });

            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(container, rating);
            });
        });

        container.addEventListener('mouseleave', function() {
            const selectedRating = this.getAttribute('data-selected-rating') || 0;
            updateStars(container, selectedRating);
        });
    });
}

// 更新星星顯示
function updateStars(starsContainer, rating) {
    if (typeof starsContainer === 'string') {
        rating = starsContainer;
        starsContainer = document.querySelector('.stars');
    }
    
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
    
    // 更新評分數值顯示
    const ratingValueElement = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
    if (ratingValueElement) {
        ratingValueElement.textContent = rating + '.0';
    }
    
    starsContainer.setAttribute('data-selected-rating', rating);
    
    // 更新總評分
    updateOverallRating();
}

// 高亮星星
function highlightStars(starsContainer, rating) {
    if (typeof starsContainer === 'string') {
        rating = starsContainer;
        starsContainer = document.querySelector('.stars');
    }
    
    const stars = starsContainer.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// 載入用戶數據
function loadUserData() {
    // 這裡應該從後端 API 獲取用戶數據
    // 目前使用模擬數據
    const userData = {
        name: '美食探索家',
        avatar: '/IMAGE/jojo.jpg',  // 確保路徑正確
        bio: '熱愛分享美食體驗'
    };

    // 更新用戶資訊
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('userBio').textContent = userData.bio;

    // 處理頭像載入
    const avatarImg = document.getElementById('userAvatar');
    if (avatarImg) {
        // 先設置預設頭像
        avatarImg.src = 'images/pig.jpg';
        
        // 創建新的圖片物件來預載入用戶頭像
        const img = new Image();
        img.onload = function() {
            avatarImg.src = userData.avatar;
        };
        img.onerror = function() {
            // 如果載入失敗，保持預設頭像
            console.log('頭像載入失敗，使用預設頭像');
        };
        img.src = userData.avatar;
    }
}

// 載入文章列表
function loadPosts() {
    // 這裡應該從後端 API 獲取文章列表
    // 目前使用模擬數據
    const posts = [
        {
            id: 1,
            title: '台北最佳日式料理推薦',
            status: 'published',
            date: '2024-03-15',
            views: 156,
            likes: 23
        },
        {
            id: 2,
            title: '隱藏版美食小店分享',
            status: 'draft',
            date: '2024-03-14',
            views: 0,
            likes: 0
        }
    ];

    // 更新已發布文章列表
    const publishedList = document.getElementById('publishedList');
    const draftsList = document.getElementById('draftsList');

    if (publishedList && draftsList) {
        posts.forEach(post => {
            const postElement = createPostElement(post);
            if (post.status === 'published') {
                publishedList.appendChild(postElement);
            } else {
                draftsList.appendChild(postElement);
            }
        });
    }
}

// 創建文章元素
function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.innerHTML = `
        <h3>${post.title}</h3>
        <p>發布日期：${post.date}</p>
        <p>觀看次數：${post.views} | 讚數：${post.likes}</p>
        <div class="button-group">
            <button onclick="editPost(${post.id})" class="btn-save-draft">編輯</button>
            ${post.status === 'draft' ? 
                `<button onclick="publishPost(${post.id})" class="btn-publish">發布</button>` :
                `<button onclick="deletePost(${post.id})" class="btn-save-draft">刪除</button>`
            }
        </div>
    `;
    return div;
}

// 初始化統計圖表
function initStatsChart() {
    // 從 localStorage 獲取已發布文章
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    
    // 計算總觀看次數和讚數
    const totalStats = publishedPosts.reduce((acc, post) => {
        acc.views += post.views;
        acc.likes += post.likes;
        return acc;
    }, { views: 0, likes: 0 });

    // 更新統計卡片
    document.getElementById('totalViews').textContent = totalStats.views.toLocaleString();
    document.getElementById('totalLikes').textContent = totalStats.likes.toLocaleString();

    // 初始化排行榜
    initRankings();
    
    // 原有的圖表邏輯
    updateViewsChart(publishedPosts);
}

// 更新觀看數據圖表
function updateViewsChart(posts) {
    // 獲取最近6個月的數據
    const months = ['一月', '二月', '三月', '四月', '五月', '六月'];
    const currentDate = new Date();
    const monthlyViews = new Array(6).fill(0);
    
    // 計算每月的觀看次數
    posts.forEach(post => {
        const postDate = new Date(post.publishDate);
        const monthDiff = currentDate.getMonth() - postDate.getMonth() + 
            (currentDate.getFullYear() - postDate.getFullYear()) * 12;
        
        if (monthDiff >= 0 && monthDiff < 6) {
            monthlyViews[5 - monthDiff] += post.views;
        }
    });

    const viewsData = {
        labels: months,
        data: monthlyViews
    };
    
    // 這裡可以添加實際的圖表繪製代碼
    console.log('更新圖表數據：', viewsData);
}

// 初始化排行榜
function initRankings() {
    // 綁定排行榜切換事件
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // 更新標籤狀態
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 更新排行榜顯示
            const type = this.getAttribute('data-type');
            document.querySelectorAll('.ranking-list').forEach(list => list.classList.remove('active'));
            document.getElementById(`${type}Ranking`).classList.add('active');
            
            // 更新排行榜內容
            updateRankings(type);
        });
    });

    // 初始化顯示最多觀看排行榜
    updateRankings('views');
}

// 更新排行榜內容
function updateRankings(type) {
    // 從 localStorage 獲取已發布文章
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    
    // 根據類型排序文章
    const sortedPosts = [...publishedPosts].sort((a, b) => b[type] - a[type]).slice(0, 5);
    
    // 獲取對應的排行榜容器
    const rankingList = document.getElementById(`${type}Ranking`);
    if (!rankingList) return;
    
    // 清空現有內容
    rankingList.innerHTML = '';
    
    if (sortedPosts.length === 0) {
        rankingList.innerHTML = '<div class="no-posts">目前沒有文章</div>';
        return;
    }

    // 生成排行榜項目
    sortedPosts.forEach((post, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.className = 'ranking-item';
        rankingItem.innerHTML = `
            <div class="ranking-number">${index + 1}</div>
            <div class="ranking-content">
                <div class="ranking-title">${escapeHtml(post.title)}</div>
                <div class="ranking-info">
                    <i class="fas fa-utensils"></i> ${escapeHtml(post.restaurant)}
                </div>
            </div>
            <div class="ranking-stats">
                <span><i class="fas fa-eye"></i> ${post.views}</span>
                <span><i class="fas fa-heart"></i> ${post.likes}</span>
            </div>
        `;
        
        // 添加點擊事件，高亮對應的文章
        rankingItem.addEventListener('click', () => {
            // 切換到已發布文章頁面
            showSection('published');
            
            // 找到並高亮對應的文章卡片
            const postCard = document.querySelector(`.post-card[data-post-id="${post.id}"]`);
            if (postCard) {
                postCard.classList.add('highlight');
                postCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // 移除高亮效果
                setTimeout(() => {
                    postCard.classList.remove('highlight');
                }, 2000);
            }
        });
        
        rankingList.appendChild(rankingItem);
    });
}

// 生成隨機測試數據
function generateTestData() {
    return {
        views: Math.floor(Math.random() * 1000) + 100, // 100-1099 的隨機觀看數
        likes: Math.floor(Math.random() * 200) + 50    // 50-249 的隨機讚數
    };
}

// 表單提交處理（發布文章）
document.getElementById('blogPostForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 驗證必填項目
    const title = document.getElementById('postTitle').value;
    const restaurant = document.getElementById('restaurantName').value;
    const content = document.getElementById('editor').innerHTML;
    
    if (!restaurant || !content) {
        alert('請至少填寫餐廳名稱和評論內容');
        return;
    }

    // 驗證評分
    const ratings = collectRatings();
    if (Object.values(ratings).every(rating => rating === '0')) {
        alert('請至少給出一個評分項目');
        return;
    }

    // 生成測試數據
    const testData = generateTestData();

    // 準備發布數據
    const postData = {
        id: isEditingPost ? editingPostId : Date.now(),
        title: title || '未命名文章',
        restaurant: restaurant,
        location: document.getElementById('restaurantLocation').value,
        content: content,
        ratings: ratings,
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
        publishDate: new Date().toISOString(),
        status: 'published',
        views: testData.views,  // 使用隨機觀看數
        likes: testData.likes   // 使用隨機讚數
    };

    try {
        // 從 localStorage 獲取已發布文章
        const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
        
        if (isEditingPost) {
            // 如果是從草稿編輯，刪除原草稿
            const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
            const updatedDrafts = drafts.filter(d => d.id !== editingPostId);
            localStorage.setItem('blogDrafts', JSON.stringify(updatedDrafts));
            
            // 更新已發布文章
            const existingIndex = publishedPosts.findIndex(p => p.id === editingPostId);
            if (existingIndex !== -1) {
                // 保留原有的觀看數和讚數
                postData.views = publishedPosts[existingIndex].views;
                postData.likes = publishedPosts[existingIndex].likes;
                publishedPosts[existingIndex] = postData;
            } else {
                publishedPosts.push(postData);
            }
            showNotification('文章已更新並發布！', 'success');
        } else {
            // 發布新文章
            publishedPosts.push(postData);
            showNotification(`文章發布成功！\n初始觀看數：${testData.views}\n初始讚數：${testData.likes}`, 'success');
        }
        
        // 儲存回 localStorage
        localStorage.setItem('publishedPosts', JSON.stringify(publishedPosts));
        
        // 清空表單並重置狀態
        clearForm();
        
        // 更新文章列表並切換到已發布頁面
        loadPublishedPosts();
        showSection('published');
        
    } catch (error) {
        console.error('發布文章時發生錯誤：', error);
        showNotification('發布文章時發生錯誤，請稍後再試', 'error');
    }
});

// 當表單提交時，收集所有評分數據
document.getElementById('blogPostForm')?.addEventListener('submit', function(e) {
    const ratings = {
        environment: document.querySelector('.stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0',
        service: document.querySelector('.stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0',
        taste: document.querySelector('.stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0',
        price: document.querySelector('.stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0',
        overall: document.querySelector('.overall-rating .rating-value')?.textContent || '0.0'
    };
    
    console.log('Ratings:', ratings);
});

// 修改儲存草稿功能
document.addEventListener('DOMContentLoaded', function() {
    // 綁定儲存草稿按鈕事件
    const saveDraftBtn = document.querySelector('.btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function(e) {
            e.preventDefault(); // 防止表單提交
            
            // 獲取表單數據
            const postData = {
                id: isEditingPost ? editingPostId : Date.now(), // 使用現有ID或創建新ID
                title: document.getElementById('postTitle').value || '未命名草稿',
                restaurant: document.getElementById('restaurantName').value || '',
                location: document.getElementById('restaurantLocation').value || '',
                content: document.getElementById('editor').innerHTML || '',
                ratings: collectRatings(),
                tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean),
                date: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };

            // 驗證必填項目
            if (!postData.restaurant || !postData.content) {
                alert('請至少填寫餐廳名稱和評論內容');
                return;
            }

            // 從 localStorage 獲取現有草稿
            const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
            
            if (isEditingPost) {
                // 如果是編輯模式，更新現有草稿
                const draftIndex = drafts.findIndex(d => d.id === editingPostId);
                if (draftIndex !== -1) {
                    drafts[draftIndex] = postData;
                } else {
                    drafts.push(postData);
                }
                alert('草稿已更新');
            } else {
                // 如果是新草稿，直接添加
                drafts.push(postData);
                alert('新草稿已儲存');
            }
            
            // 儲存回 localStorage
            localStorage.setItem('blogDrafts', JSON.stringify(drafts));
            
            // 清空表單並重置編輯狀態
            clearForm();
            
            // 如果當前在草稿箱頁面，更新顯示
            if (document.getElementById('drafts-section').classList.contains('active')) {
                loadDrafts();
            }

            // 返回草稿箱頁面
            showSection('drafts');
        });
    }

    // 添加取消編輯按鈕
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn-cancel';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i> 取消編輯';
    cancelBtn.onclick = function() {
        if (confirm('確定要取消編輯嗎？未儲存的修改將會遺失。')) {
            clearForm();
            showSection('drafts');
        }
    };

    // 將取消按鈕添加到按鈕組
    const buttonGroup = document.querySelector('.button-group');
    if (buttonGroup) {
        buttonGroup.appendChild(cancelBtn);
    }
});

// 文章操作函數
function editPost(postId) {
    const posts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // 設置編輯模式標記
    isEditingPost = true;
    editingPostId = post.id;

    // 產生新的草稿 id，避免覆蓋原本草稿
    const newDraftId = Date.now();

    // 將文章轉為草稿（給新 id）
    const draft = {
        ...post,
        id: newDraftId,
        lastModified: new Date().toISOString(),
        status: 'draft'
    };

    // 儲存為草稿
    const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('blogDrafts', JSON.stringify(drafts));

    // 刪除已發布文章
    deletePost(postId, true);

    // 切換到編輯頁面
    showSection('write');

    // 填充表單
    document.getElementById('postTitle').value = draft.title;
    document.getElementById('restaurantName').value = draft.restaurant;
    document.getElementById('restaurantLocation').value = draft.location;
    document.getElementById('editor').innerHTML = draft.content;
    document.getElementById('tags').value = draft.tags.join(', ');

    // 設置評分
    Object.entries(draft.ratings).forEach(([category, rating]) => {
        const starsContainer = document.querySelector(`.stars[data-category="${category}"]`);
        if (starsContainer) {
            starsContainer.setAttribute('data-selected-rating', rating);
            updateStars(starsContainer, rating);
            // 新增：同步更新評分數值
            const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = rating + '.0';
            }
            updateOverallRating();
        }
    });

    // 更新按鈕文字
    const saveDraftBtn = document.querySelector('.btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.textContent = '更新草稿';
    }

    showNotification('文章已載入編輯模式', 'info');
}

function publishPost(postId) {
    // 實現發布草稿功能
    console.log('發布文章：', postId);
}

// 刪除已發布文章
function deletePost(postId, silent = false) {
    if (!silent && !confirm('確定要刪除這篇文章嗎？')) return;

    // 從 localStorage 獲取已發布文章
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    
    // 過濾掉要刪除的文章
    const updatedPosts = publishedPosts.filter(post => post.id !== postId);
    
    // 儲存更新後的文章列表
    localStorage.setItem('publishedPosts', JSON.stringify(updatedPosts));
    
    if (!silent) {
        // 顯示成功訊息
        showNotification('文章已刪除', 'success');
        
        // 重新載入文章列表
        loadPublishedPosts();
        
        // 更新統計數據和排行榜
        initStatsChart();
    }
}

// 字型大小控制
let currentFontSize = 16;

function setFontSize(size) {
    size = parseInt(size);
    currentFontSize = size;
    
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    
    // 如果有選取文字
    if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        const content = range.extractContents();
        span.appendChild(content);
        range.insertNode(span);
        
        // 保持選取狀態
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        // 如果是游標位置，更新當前字體大小
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        span.appendChild(document.createTextNode('\u200B'));
        
        range.insertNode(span);
        range.setStart(span.firstChild, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // 立即更新工具列狀態
    updateToolbarState();
}

// 初始化字型大小
function initFontSize() {
    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
        fontSizeSelect.value = currentFontSize;
    }
}

// 顏色選擇器相關變數
let currentColor = '#000000';
let isColorPaletteVisible = false;

// 切換調色板顯示狀態
window.toggleColorPalette = function(event) {
    if (!event) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const palette = document.querySelector('.color-palette');
    if (!palette) return;
    
    isColorPaletteVisible = !isColorPaletteVisible;
    palette.style.display = isColorPaletteVisible ? 'block' : 'none';
    
    if (isColorPaletteVisible) {
        document.addEventListener('click', handleClickOutside);
    } else {
        document.removeEventListener('click', handleClickOutside);
    }
}

// 處理點擊調色板外部
function handleClickOutside(event) {
    const colorPicker = document.querySelector('.color-picker');
    const palette = document.querySelector('.color-palette');
    
    // 如果點擊的是調色盤內的元素或顏色選擇器按鈕，不關閉調色盤
    if ((colorPicker && colorPicker.contains(event.target)) || 
        (palette && palette.contains(event.target))) {
        return;
    }
    
    closeColorPalette();
}

// 關閉調色板
function closeColorPalette() {
    isColorPaletteVisible = false;
    const palette = document.querySelector('.color-palette');
    if (palette) {
        palette.style.display = 'none';
    }
    document.removeEventListener('click', handleClickOutside);
}

// 初始化顏色選擇器
function initColorPicker() {
    // 為每個顏色選項添加點擊事件
    document.querySelectorAll('.color-option').forEach(option => {
        option.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const color = this.getAttribute('data-color');
            console.log('選擇顏色：', color); // 添加調試日誌
            if (color) {
                handleColorChange(color, false);
            }
        };
    });
    
    // 為顏色選擇器按鈕添加點擊事件
    const currentColorButton = document.querySelector('.current-color');
    if (currentColorButton) {
        currentColorButton.onclick = function(e) {
            toggleColorPalette(e);
        };
    }

    // 自訂顏色輸入處理
    const customColorInput = document.getElementById('customColor');
    if (customColorInput) {
        // 監聽 input 事件（即時預覽）
        customColorInput.oninput = function(e) {
            e.stopPropagation();
            const color = e.target.value;
            if (color) {
                handleColorChange(color, true);
            }
        };

        // 監聽 click 事件（保持調色盤開啟）
        customColorInput.onclick = function(e) {
            e.stopPropagation();
        };
    }

    // 防止調色盤內的點擊事件冒泡
    const colorPalette = document.querySelector('.color-palette');
    if (colorPalette) {
        colorPalette.onclick = function(e) {
            e.stopPropagation();
        };
    }

    // 添加確認按鈕點擊事件
    const confirmColorBtn = document.querySelector('.confirm-color-btn');
    if (confirmColorBtn) {
        confirmColorBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const customColorInput = document.getElementById('customColor');
            if (customColorInput) {
                handleColorChange(customColorInput.value, false);
            }
        };
    }

    // 初始化時設置預設顏色
    updateColorPreview(currentColor);
}

// 更新顏色預覽
function updateColorPreview(color) {
    const colorPreview = document.querySelector('.color-preview');
    const customColorInput = document.getElementById('customColor');
    
    if (colorPreview) {
        colorPreview.style.backgroundColor = color;
    }
    
    if (customColorInput) {
        customColorInput.value = color;
    }
}

// 處理顏色變更
function handleColorChange(color, isPreview) {
    if (!color) return;
    
    console.log('處理顏色變更：', color, isPreview); // 添加調試日誌

    // 更新預覽
    updateColorPreview(color);

    // 如果是預覽模式，不執行後續操作
    if (isPreview) {
        return;
    }

    // 更新全域顏色變數
    currentColor = color;

    // 應用顏色到文字
    applyColorToText(color);

    // 更新工具列狀態
    updateToolbarState();

    // 關閉調色板
    closeColorPalette();
}

// 應用顏色到文字
function applyColorToText(color) {
    console.log('應用顏色到文字：', color); // 添加調試日誌
    
    const editor = document.getElementById('editor');
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0).cloneRange();
    const originalRange = range.cloneRange(); // 保存原始範圍

    try {
        if (!range.collapsed) {
            // 有選取文字的情況
            const span = document.createElement('span');
            span.style.color = color;
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);

            // 選中新建的 span 以更新工具列
            const tempRange = document.createRange();
            tempRange.selectNode(span);
            selection.removeAllRanges();
            selection.addRange(tempRange);
        } else {
            // 游標位置
            const span = document.createElement('span');
            span.style.color = color;
            span.appendChild(document.createTextNode('\u200B'));
            range.insertNode(span);

            // 選中新建的 span 以更新工具列
            const tempRange = document.createRange();
            tempRange.selectNode(span);
            selection.removeAllRanges();
            selection.addRange(tempRange);

            // 恢復游標位置
            originalRange.setStartAfter(span);
            originalRange.collapse(true);
        }

        // 更新工具列狀態
        updateToolbarState();

        // 恢復原始選擇範圍
        selection.removeAllRanges();
        selection.addRange(originalRange);
    } catch (error) {
        console.error('應用顏色時發生錯誤：', error); // 添加錯誤日誌
    }
}

// 評分系統相關代碼
function initRatingSystem() {
    const starsGroups = document.querySelectorAll('.stars');
    if (!starsGroups.length) return;

    starsGroups.forEach(group => {
        const stars = group.querySelectorAll('i');
        const ratingValue = group.parentElement.querySelector('.rating-value');

        // 初始化評分
        group.setAttribute('data-selected-rating', '0');

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                updateStars(group, rating);
                group.setAttribute('data-selected-rating', rating);
                if (ratingValue) {
                    ratingValue.textContent = rating + '.0';
                }
                updateOverallRating();
            });

            star.addEventListener('mouseover', function() {
                const rating = this.getAttribute('data-rating');
                highlightStars(group, rating);
            });
        });

        group.addEventListener('mouseleave', function() {
            const selectedRating = this.getAttribute('data-selected-rating') || 0;
            updateStars(group, selectedRating);
        });
    });
}

function updateStars(group, rating) {
    const stars = group.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function highlightStars(group, rating) {
    const stars = group.querySelectorAll('i');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

// 更新總評分
function updateOverallRating() {
    const categories = ['environment', 'service', 'taste', 'price'];
    let totalRating = 0;
    let validRatings = 0;
    
    // 計算平均分數
    categories.forEach(category => {
        const starsContainer = document.querySelector(`.stars[data-category="${category}"]`);
        if (starsContainer) {
            const rating = parseInt(starsContainer.getAttribute('data-selected-rating')) || 0;
            if (rating > 0) {
                totalRating += rating;
                validRatings++;
            }
        }
    });
    
    // 更新總評分
    const averageRating = validRatings > 0 ? (totalRating / validRatings).toFixed(1) : '0.0';
    const overallStars = document.querySelector('.overall-rating .stars');
    const overallValue = document.querySelector('.overall-rating .rating-value');
    
    if (overallStars && overallValue) {
        // 更新總評分的星星顯示
        const stars = overallStars.querySelectorAll('i');
        const ratingNum = parseFloat(averageRating);
        
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < Math.floor(ratingNum));
        });
        
        // 更新總評分數值
        overallValue.textContent = averageRating;
    }
}

// 收集評分數據
function collectRatings() {
    const ratings = {};
    document.querySelectorAll('.stars').forEach(starsContainer => {
        const category = starsContainer.dataset.category;
        if (category) {
            ratings[category] = starsContainer.getAttribute('data-selected-rating') || '0';
        }
    });
    return ratings;
}

// 清空表單
function clearForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('restaurantName').value = '';
    document.getElementById('restaurantLocation').value = '';
    document.getElementById('editor').innerHTML = '';
    document.getElementById('tags').value = '';
    
    // 重置所有評分
    document.querySelectorAll('.stars').forEach(starsContainer => {
        starsContainer.setAttribute('data-selected-rating', '0');
        starsContainer.querySelectorAll('i').forEach(star => {
            star.classList.remove('active');
        });
    });
    
    // 重置評分數值顯示
    document.querySelectorAll('.rating-value').forEach(value => {
        value.textContent = '0.0';
    });

    // 重置按鈕文字
    const saveDraftBtn = document.querySelector('.btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.textContent = '儲存草稿';
    }

    // 重置編輯狀態
    isEditingPost = false;
    editingPostId = null;
}

// 載入草稿箱
function loadDrafts() {
    const draftsList = document.getElementById('draftsList');
    if (!draftsList) return;

    // 從 localStorage 獲取草稿
    const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    
    // 清空現有內容
    draftsList.innerHTML = '';
    
    if (drafts.length === 0) {
        draftsList.innerHTML = '<div class="no-drafts">目前沒有草稿</div>';
        return;
    }

    // 按最後修改時間排序（新的在前）
    drafts.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    // 顯示草稿列表
    drafts.forEach(draft => {
        const draftElement = createDraftElement(draft);
        draftsList.appendChild(draftElement);
    });
}

// 創建草稿元素
function createDraftElement(draft) {
    const div = document.createElement('div');
    div.className = 'draft-card';
    
    // 格式化日期
    const lastModified = new Date(draft.lastModified).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="draft-header">
            <h3>${escapeHtml(draft.title)}</h3>
            <span class="draft-date">最後修改：${lastModified}</span>
        </div>
        <div class="draft-content">
            <p class="restaurant-info">
                <i class="fas fa-utensils"></i> ${escapeHtml(draft.restaurant)}
                ${draft.location ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(draft.location)}</span>` : ''}
            </p>
            <p class="draft-preview">${truncateText(stripHtml(draft.content), 100)}</p>
            ${draft.tags.length > 0 ? `
                <div class="draft-tags">
                    ${draft.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="draft-actions">
            <button onclick="editDraft(${draft.id})" class="btn-edit">
                <i class="fas fa-edit"></i> 編輯
            </button>
            <button onclick="deleteDraft(${draft.id})" class="btn-delete">
                <i class="fas fa-trash-alt"></i> 刪除
            </button>
            <button onclick="publishDraft(${draft.id})" class="btn-publish">
                <i class="fas fa-paper-plane"></i> 發布
            </button>
        </div>
    `;
    
    return div;
}

// 編輯草稿
function editDraft(draftId) {
    const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    const draft = drafts.find(d => d.id === draftId);
    
    if (!draft) return;

    // 設置編輯模式標記
    isEditingPost = true;
    editingPostId = draft.id;

    // 切換到寫文章頁面
    showSection('write');
    
    // 填充表單
    document.getElementById('postTitle').value = draft.title;
    document.getElementById('restaurantName').value = draft.restaurant;
    document.getElementById('restaurantLocation').value = draft.location;
    document.getElementById('editor').innerHTML = draft.content;
    document.getElementById('tags').value = draft.tags.join(', ');
    
    // 設置評分
    Object.entries(draft.ratings).forEach(([category, rating]) => {
        const starsContainer = document.querySelector(`.stars[data-category="${category}"]`);
        if (starsContainer) {
            starsContainer.setAttribute('data-selected-rating', rating);
            updateStars(starsContainer, rating);
            // 新增：同步更新評分數值
            const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
            if (ratingValue) {
                ratingValue.textContent = rating + '.0';
            }
            updateOverallRating();
        }
    });

    // 更新按鈕文字
    const saveDraftBtn = document.querySelector('.btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.textContent = '更新草稿';
    }

    showNotification('正在編輯草稿', 'info');
}

// 刪除草稿
function deleteDraft(draftId, silent = false) {
    if (!silent && !confirm('確定要刪除這篇草稿嗎？')) return;

    const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    localStorage.setItem('blogDrafts', JSON.stringify(updatedDrafts));
    
    // 無論 silent 狀態都刷新草稿列表
    loadDrafts();

    if (!silent) {
        showNotification('草稿已刪除', 'success');
    }
}

// 發布草稿
function publishDraft(draftId) {
    if (!confirm('確定要發布這篇文章嗎？')) return;

    // 從 localStorage 獲取草稿
    const drafts = JSON.parse(localStorage.getItem('blogDrafts') || '[]');
    const draft = drafts.find(d => d.id === draftId);
    
    if (!draft) return;

    // 添加發布相關資訊
    const publishedPost = {
        ...draft,
        publishDate: new Date().toISOString(),
        status: 'published',
        views: 0,
        likes: 0,
        comments: []
    };

    // 從 localStorage 獲取已發布文章
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    
    // 添加新發布的文章
    publishedPosts.push(publishedPost);
    
    // 儲存回 localStorage
    localStorage.setItem('publishedPosts', JSON.stringify(publishedPosts));
    
    // 刪除草稿
    deleteDraft(draftId);
    
    // 顯示成功訊息
    alert('文章已成功發布！');
    
    // 如果當前在已發布文章頁面，更新顯示
    if (document.getElementById('published-section').classList.contains('active')) {
        loadPublishedPosts();
    }
}

// 載入已發布文章
function loadPublishedPosts() {
    const publishedList = document.getElementById('publishedList');
    if (!publishedList) return;

    // 從 localStorage 獲取已發布文章
    const publishedPosts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    
    // 清空現有內容
    publishedList.innerHTML = '';
    
    if (publishedPosts.length === 0) {
        publishedList.innerHTML = '<div class="no-posts">目前沒有已發布的文章</div>';
        return;
    }

    // 按發布時間排序（新的在前）
    publishedPosts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    // 顯示文章列表
    publishedPosts.forEach(post => {
        const postElement = createPublishedPostElement(post);
        publishedList.appendChild(postElement);
    });
}

// 創建已發布文章元素
function createPublishedPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.setAttribute('data-post-id', post.id); // 添加文章ID屬性
    
    // 計算總評分
    const ratings = post.ratings;
    const totalRating = Object.values(ratings).reduce((sum, rating) => sum + Number(rating), 0);
    const averageRating = (totalRating / Object.keys(ratings).length).toFixed(1);
    
    // 格式化日期
    const publishDate = new Date(post.publishDate).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    div.innerHTML = `
        <div class="post-header">
            <h3>${escapeHtml(post.title)}</h3>
            <span class="post-date">發布於：${publishDate}</span>
        </div>
        <div class="post-content">
            <p class="restaurant-info">
                <i class="fas fa-utensils"></i> ${escapeHtml(post.restaurant)}
                ${post.location ? `<span><i class="fas fa-map-marker-alt"></i> ${escapeHtml(post.location)}</span>` : ''}
            </p>
            <div class="post-ratings">
                <span class="rating-label">總評分</span>
                <div class="stars-small">
                    ${Array.from({length: 5}, (_, i) => `
                        <i class="fas fa-star ${i < averageRating ? 'active' : ''}"></i>
                    `).join('')}
                </div>
                <span class="rating-value">${averageRating}</span>
            </div>
            <p class="post-preview">${truncateText(stripHtml(post.content), 150)}</p>
            ${post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="post-stats">
            <span><i class="fas fa-eye"></i> ${post.views}</span>
            <span><i class="fas fa-heart"></i> ${post.likes}</span>
        </div>
        <div class="post-actions">
            <button onclick="editPost(${post.id})" class="btn-edit">
                <i class="fas fa-edit"></i> 編輯
            </button>
            <button onclick="deletePost(${post.id})" class="btn-delete">
                <i class="fas fa-trash-alt"></i> 刪除
            </button>
        </div>
    `;
    
    return div;
}

// 獲取評分類別標籤
function getRatingLabel(category) {
    const labels = {
        environment: '用餐環境',
        service: '服務品質',
        taste: '餐點美味',
        price: '價格合理'
    };
    return labels[category] || category;
}

// 輔助函數
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}