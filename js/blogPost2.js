// 全局變數
let editor;
let isEditingPost = false; // 添加編輯模式標記
let editingPostId = null; // 添加正在編輯的文章ID

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化編輯器功能
    initEditor();
    // 初始化星級評分
    initRating();
    // 載入用戶數據
    loadUserData();
    // 載入文章列表
    await loadPublishedPosts();
    // 初始化統計圖表
    await initStatsChart();
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
        await loadDrafts();
    }
});

// 初始化導覽列(側邊非上方)
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
// function addToWishlist(restaurantId) {
//     let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//     if (!wishlist.includes(restaurantId)) {
//         wishlist.push(restaurantId);
//         localStorage.setItem('wishlist', JSON.stringify(wishlist));
//     }
// }

// function removeFromWishlist(restaurantId) {
//     let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
//     wishlist = wishlist.filter(id => id !== restaurantId);
//     localStorage.setItem('wishlist', JSON.stringify(wishlist));
// }

// function addToFavorites(restaurantId) {
//     let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
//     if (!favorites.includes(restaurantId)) {
//         favorites.push(restaurantId);
//         localStorage.setItem('favorites', JSON.stringify(favorites));
//     }
// }

// function removeFromFavorites(restaurantId) {
//     let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
//     favorites = favorites.filter(id => id !== restaurantId);
//     localStorage.setItem('favorites', JSON.stringify(favorites));
// }

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

// 包裝函數，用於HTML中的onclick事件
window.showSectionWrapper = function(sectionId) {
    showSection(sectionId).catch(error => {
        console.error('切換頁面時發生錯誤：', error);
    });
};

// 切換不同區段顯示
async function showSection(sectionId) {
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
    
    // 找到對應的導覽項目並設置為active
    const navItems = document.querySelectorAll('.blog-nav-item');
    navItems.forEach(item => {
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes(`'${sectionId}'`)) {
            item.classList.add('active');
        }
    });

    // 根據不同區段載入對應內容
    switch (sectionId) {
        case 'drafts':
            await loadDrafts();
            break;
        case 'published':
            await loadPublishedPosts();
            break;
        case 'stats':
            // 重新初始化統計圖表和排行榜
            await initStatsChart();
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

// 收集編輯器中的圖片數據
function collectImageData(editorSelector = '#editor') {
    const editor = document.querySelector(editorSelector);
    const images = editor.querySelectorAll('img');
    const imageData = [];
    const existingPhotoIds = [];
    
    // 獲取編輯器的HTML內容
    let htmlContent = editor.innerHTML;
    
    console.log('開始收集圖片數據，編輯器選擇器:', editorSelector);
    console.log('找到圖片數量:', images.length);
    
    images.forEach((img, index) => {
        console.log(`處理圖片 ${index + 1}:`, {
            src: img.src ? img.src.substring(0, 50) + '...' : 'null',
            dataPhotoId: img.getAttribute('data-photo-id'),
            className: img.className
        });
        
        // 如果圖片有src屬性且是base64格式（新上傳的圖片）
        if (img.src && img.src.startsWith('data:image/')) {
            console.log(`圖片 ${index + 1} 是新上傳的base64圖片`);
            const base64Data = img.src.split(',')[1];
            const contentType = img.src.split(';')[0].split(':')[1];
            const fileName = `image_${Date.now()}_${index}.jpg`;
            
            // 檢查base64數據大小（限制為2MB）
            const sizeInBytes = Math.ceil((base64Data.length * 3) / 4);
            if (sizeInBytes > 2 * 1024 * 1024) {
                console.warn('圖片太大，跳過處理:', fileName, '大小:', sizeInBytes / 1024 / 1024, 'MB');
                return;
            }
            
            // 將base64轉換為byte array
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            
            // 保存圖片大小信息
            const imageSize = {
                width: img.style.width || img.offsetWidth + 'px',
                height: img.style.height || img.offsetHeight + 'px'
            };
            
            imageData.push({
                fileName: fileName,
                contentType: contentType,
                imageData: Array.from(bytes),
                size: imageSize
            });
            
            // 在HTML內容中替換圖片為佔位符
            const imgContainer = img.closest('.image-container');
            if (imgContainer) {
                const imgHtml = imgContainer.outerHTML;
                const placeholder = `[NEW_IMAGE_PLACEHOLDER_${index}]`;
                htmlContent = htmlContent.replace(imgHtml, placeholder);
                console.log(`替換新圖片為佔位符: ${placeholder}`);
            }
        }
        // 如果圖片是從資料庫載入的（有blob URL）
        else if (img.src && img.src.startsWith('blob:')) {
            // 從圖片的data屬性獲取圖片ID
            const photoId = img.getAttribute('data-photo-id');
            if (photoId) {
                console.log(`圖片 ${index + 1} 是已載入的圖片，ID: ${photoId}`);
                existingPhotoIds.push(photoId);
                
                // 在HTML內容中替換圖片為佔位符
                const imgContainer = img.closest('.image-container');
                if (imgContainer) {
                    const imgHtml = imgContainer.outerHTML;
                    const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                    htmlContent = htmlContent.replace(imgHtml, placeholder);
                    console.log(`替換已存在圖片為佔位符: ${placeholder}`);
                }
            } else {
                console.warn('發現blob URL圖片但沒有data-photo-id屬性:', img.src);
            }
        }
        // 其他情況（可能是外部圖片或其他格式）
        else {
            console.warn('跳過未知格式的圖片:', img.src);
        }
    });
    
    // 如果沒有找到圖片但內容中有佔位符，從佔位符中提取圖片ID
    if (images.length === 0 && htmlContent.includes('[IMAGE_PLACEHOLDER_')) {
        console.log('沒有找到圖片但內容中有佔位符，嘗試從佔位符中提取圖片ID');
        const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
        let match;
        while ((match = placeholderRegex.exec(htmlContent)) !== null) {
            const photoId = match[1];
            if (!existingPhotoIds.includes(photoId)) {
                existingPhotoIds.push(photoId);
                console.log(`從佔位符中提取圖片ID: ${photoId}`);
            }
        }
    }
    
    console.log('收集到的圖片數據:', {
        newImages: imageData.length,
        existingPhotoIds: existingPhotoIds,
        htmlContentLength: htmlContent.length,
        htmlContentPreview: htmlContent.substring(0, 200) + '...'
    });
    
    return {
        newImages: imageData,
        existingPhotoIds: existingPhotoIds,
        processedHtmlContent: htmlContent
    };
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
            ('頭像載入失敗，使用預設頭像');
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
async function initStatsChart() {
    try {
        // 從後端API獲取用戶統計數據
        const response = await fetch('http://localhost:8080/api/reviews/user/1/overview'); // 暫時使用固定用戶ID
        if (!response.ok) throw new Error('載入統計數據失敗');
        const userStats = await response.json();
        
        // 更新統計卡片
        document.getElementById('totalViews').textContent = userStats.totalViews.toLocaleString();
        document.getElementById('totalLikes').textContent = userStats.totalFavorites.toLocaleString();

        // 初始化排行榜
        await initRankings();
        
        // 更新圖表
        await updateViewsChart();
    } catch (error) {
        console.error('載入統計數據時發生錯誤：', error);
        // 如果載入失敗，顯示預設值
        document.getElementById('totalViews').textContent = '0';
        document.getElementById('totalLikes').textContent = '0';
    }
}

// 更新觀看數據圖表
async function updateViewsChart() {
    try {
        // 從後端API獲取用戶統計數據
        const response = await fetch('http://localhost:8080/api/reviews/user/1/stats'); // 暫時使用固定用戶ID
        if (!response.ok) throw new Error('載入圖表數據失敗');
        const statsList = await response.json();
        
        // 獲取最近6個月的數據
        const months = ['一月', '二月', '三月', '四月', '五月', '六月'];
        const currentDate = new Date();
        const monthlyViews = new Array(6).fill(0);
        
        // 計算每月的觀看次數
        statsList.forEach(post => {
            const postDate = new Date(post.createdAt);
            const monthDiff = currentDate.getMonth() - postDate.getMonth() + 
                (currentDate.getFullYear() - postDate.getFullYear()) * 12;
            
            if (monthDiff >= 0 && monthDiff < 6) {
                monthlyViews[5 - monthDiff] += post.totalViews;
            }
        });

        const viewsData = {
            labels: months,
            data: monthlyViews
        };
        
        // 這裡可以添加實際的圖表繪製代碼
        console.log('更新圖表數據：', viewsData);
    } catch (error) {
        console.error('載入圖表數據時發生錯誤：', error);
    }
}

// 初始化排行榜
async function initRankings() {
    // 綁定排行榜切換事件
    document.querySelectorAll('.ranking-tab').forEach(tab => {
        tab.addEventListener('click', async function() {
            // 更新標籤狀態
            document.querySelectorAll('.ranking-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 更新排行榜顯示
            const type = this.getAttribute('data-type');
            document.querySelectorAll('.ranking-list').forEach(list => list.classList.remove('active'));
            document.getElementById(`${type}Ranking`).classList.add('active');
            
            // 更新排行榜內容
            await updateRankings(type);
        });
    });

    // 初始化顯示最多觀看排行榜
    await updateRankings('views');
}

// 更新排行榜內容
async function updateRankings(type) {
    try {
        // 從後端API獲取用戶統計數據
        const response = await fetch('http://localhost:8080/api/reviews/user/1/stats'); // 暫時使用固定用戶ID
        if (!response.ok) throw new Error('載入排行榜數據失敗');
        const statsList = await response.json();
        
        // 根據類型排序文章
        const sortedPosts = [...statsList].sort((a, b) => {
            if (type === 'views') {
                return b.totalViews - a.totalViews;
            } else if (type === 'likes') {
                return b.totalFavorites - a.totalFavorites;
            }
            return 0;
        }).slice(0, 5);
        
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
            
            // 限制標題長度
            const titlePreview = truncateText(post.title, 30);
            
            rankingItem.innerHTML = `
                <div class="ranking-number">${index + 1}</div>
                <div class="ranking-content">
                    <div class="ranking-title">${escapeHtml(titlePreview)}</div>
                    <div class="ranking-info">
                        <i class="fas fa-calendar"></i> ${new Date(post.createdAt).toLocaleDateString('zh-TW')}
                    </div>
                </div>
                <div class="ranking-stats">
                    <span><i class="fas fa-eye"></i> ${post.totalViews}</span>
                    <span><i class="fas fa-heart"></i> ${post.totalFavorites}</span>
                </div>
            `;
            
            // 添加點擊事件，高亮對應的文章
            rankingItem.addEventListener('click', () => {
                // 切換到已發布文章頁面
                showSectionWrapper('published');
                
                // 找到並高亮對應的文章卡片
                const postCard = document.querySelector(`.post-card[data-post-id="${post.reviewId}"]`);
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
    } catch (error) {
        console.error('載入排行榜數據時發生錯誤：', error);
        const rankingList = document.getElementById(`${type}Ranking`);
        if (rankingList) {
            rankingList.innerHTML = '<div class="error">載入排行榜失敗，請稍後再試</div>';
        }
    }
}

// 生成隨機測試數據
// function generateTestData() {
//     return {
//         views: Math.floor(Math.random() * 1000) + 100, // 100-1099 的隨機觀看數
//         likes: Math.floor(Math.random() * 200) + 50    // 50-249 的隨機讚數
//     };
// }

// 表單提交處理（發布文章）
document.getElementById('blogPostFormWrite')?.addEventListener('submit', async function(e) {
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

    // 準備發布數據
    const imageData = collectImageData();
    const postData = {
        userId: 1, // TODO: 從登入資訊中獲取
        restaurantId: 1, // TODO: 從餐廳選擇中獲取
        title: title || '未命名文章',
        content_json: imageData.processedHtmlContent || content,
        status: 'published',
        ratings: {
            environment_score: parseInt(ratings.environment || '0'),
            service_score: parseInt(ratings.service || '0'),
            taste_score: parseInt(ratings.taste || '0'),
            price_score: parseInt(ratings.price || '0'),
            overall_score: parseFloat(document.querySelector('.overall-rating .rating-value')?.textContent || '0.0')
        },
        photoData: imageData.newImages, // 新圖片數據
        photos: imageData.existingPhotoIds, // 已存在的圖片ID
        tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
        // 直接使用原始HTML內容，不進行清理，保留所有文字格式
        postData.content_json = imageData.processedHtmlContent || content;
        
        console.log('使用的HTML內容:', postData.content_json);
        
        // 呼叫後端 API 發布文章
        const response = await fetch('http://localhost:8080/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('後端錯誤回應:', errorText);
            throw new Error(`發布文章失敗: ${response.status} ${response.statusText}`);
        }

        const publishedId = await response.json();
        console.log('發布文章成功:', publishedId);
        alert('文章發布成功！');
        
        // 清空表單並重置狀態
        clearForm();
        
        // 更新文章列表並切換到已發布頁面
        loadPublishedPosts();
        showSectionWrapper('published');
        
    } catch (error) {
        console.error('發布文章時發生錯誤：', error);
        alert('發布文章時發生錯誤：' + error.message);
    }
});

// 編輯文章表單提交處理
document.getElementById('blogPostFormEdit')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // 驗證必填項目
    const title = document.getElementById('postTitleEdit').value;
    const restaurant = document.getElementById('restaurantNameEdit').value;
    const content = document.getElementById('editorEdit').innerHTML;
    
    if (!restaurant || !content) {
        alert('請至少填寫餐廳名稱和評論內容');
        return;
    }

    // 驗證評分
    const ratings = collectRatings('#edit-section');
    if (Object.values(ratings).every(rating => rating === '0')) {
        alert('請至少給出一個評分項目');
        return;
    }

    // 準備發布數據
    const imageData = collectImageData('#editorEdit');
    const postData = {
        userId: window.currentEditingDraft?.userId || window.currentEditingPost?.userId || 1,
        restaurantId: window.currentEditingDraft?.restaurantId || window.currentEditingPost?.restaurantId || 1,
        title: title || '未命名文章',
        content_json: imageData.processedHtmlContent || content,
        status: 'published',
        ratings: {
            environment_score: parseInt(ratings.environment || '0'),
            service_score: parseInt(ratings.service || '0'),
            taste_score: parseInt(ratings.taste || '0'),
            price_score: parseInt(ratings.price || '0'),
            overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
        },
        photoData: imageData.newImages, // 新圖片數據
        photos: imageData.existingPhotoIds, // 已存在的圖片ID
        tags: document.getElementById('tagsEdit').value.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    try {
        // 清理HTML內容，移除可能導致問題的特殊字符
        const contentToClean = imageData.processedHtmlContent || content;
        const cleanedContent = cleanHtmlContent(contentToClean);
        postData.content_json = cleanedContent;
        
        console.log('清理後的HTML內容:', cleanedContent);
        
        let response;
        
        if (window.currentEditingDraftId) {
            // 如果是從草稿編輯，先刪除草稿再發布
            const deleteDraft = confirm('發布後是否要刪除草稿？');
            
            response = await fetch(`http://localhost:8080/api/reviews/drafts/${window.currentEditingDraftId}/publish?deleteDraft=${deleteDraft}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: postData.userId,
                    restaurantId: postData.restaurantId
                })
            });
        } else if (window.currentEditingPostId) {
            // 如果是編輯已發布文章，直接更新
            response = await fetch(`http://localhost:8080/api/reviews/published/${window.currentEditingPostId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
        } else {
            // 直接發布新文章
            response = await fetch('http://localhost:8080/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error('後端錯誤回應:', errorText);
            throw new Error(`發布文章失敗: ${response.status} ${response.statusText}`);
        }

        const publishedId = await response.json();
        console.log('發布文章成功:', publishedId);
        alert('文章發布成功！');
        
        // 清空表單並重置狀態
        clearEditForm();
        
        // 更新文章列表並切換到已發布頁面
        loadPublishedPosts();
        loadDrafts(); // 重新載入草稿列表
        showSectionWrapper('published');
        
    } catch (error) {
        console.error('發布文章時發生錯誤：', error);
        alert('發布文章時發生錯誤：' + error.message);
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
    
    ('Ratings:', ratings);
});

// 修改儲存草稿功能
document.addEventListener('DOMContentLoaded', function() {
    // 綁定儲存草稿按鈕事件
    const saveDraftBtn = document.querySelector('.btn-save-draft');
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', async function(e) {
            e.preventDefault(); // 防止表單提交
            
            // 獲取表單數據
            const imageData = collectImageData('#editor');
            const postData = {
                userId: 1, // TODO: 從登入資訊中獲取
                restaurantId: 1, // TODO: 從餐廳選擇中獲取
                title: document.getElementById('postTitle').value || '未命名草稿',
                content_json: imageData.processedHtmlContent || document.getElementById('editor').innerHTML || '',
                status: 'draft',
                ratings: {
                    environment_score: parseInt(document.querySelector('.stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                    service_score: parseInt(document.querySelector('.stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                    taste_score: parseInt(document.querySelector('.stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                    price_score: parseInt(document.querySelector('.stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                    overall_score: parseFloat(document.querySelector('.overall-rating .rating-value')?.textContent || '0.0')
                },
                photoData: imageData.newImages, // 新圖片數據
                photos: imageData.existingPhotoIds, // 已存在的圖片ID
                tags: document.getElementById('tags').value.split(',').map(tag => tag.trim()).filter(Boolean)
            };

            console.log('儲存草稿資料', {
                title: postData.title,
                contentLength: postData.content_json.length,
                newImages: postData.photoData.length,
                existingPhotos: postData.photos.length
            });
            
            // 驗證必填項目
            if (!postData.content_json) {
                alert('請至少填寫評論內容');
                return;
            }

            try {
                // 直接使用原始HTML內容，不進行清理，保留所有文字格式
                console.log('儲存草稿的HTML內容:', postData.content_json);
                
                // 呼叫後端 API 創建草稿
                const response = await fetch('http://localhost:8080/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                });

                console.log('後端回應狀態:', response.status);
                console.log('後端回應標頭:', Object.fromEntries(response.headers.entries()));

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('後端錯誤回應:', errorText);
                    console.error('後端錯誤狀態:', response.status);
                    console.error('後端錯誤狀態文字:', response.statusText);
                    
                    // 嘗試解析錯誤信息
                    let errorMessage = `儲存草稿失敗: ${response.status} ${response.statusText}`;
                    try {
                        const errorJson = JSON.parse(errorText);
                        if (errorJson.message) {
                            errorMessage += `\n詳細錯誤: ${errorJson.message}`;
                        }
                    } catch (e) {
                        errorMessage += `\n詳細錯誤: ${errorText}`;
                    }
                    
                    throw new Error(errorMessage);
                }

                const result = await response.json();
                console.log('儲存草稿成功:', result);
                alert('草稿已儲存');
                
                // 清空表單
                clearForm();
                
                // 如果當前在草稿箱頁面，更新顯示
                if (document.getElementById('drafts-section').classList.contains('active')) {
                    loadDrafts();
                }

                // 返回草稿箱頁面
                showSectionWrapper('drafts');
            } catch (error) {
                console.error('儲存草稿時發生錯誤：', error);
                console.error('錯誤堆疊:', error.stack);
                alert('儲存草稿失敗：' + error.message);
            }
        });
    }
});

// 清理HTML內容的函數
function cleanHtmlContent(htmlContent) {
    if (!htmlContent) return '';
    
    try {
        console.log('原始HTML內容長度:', htmlContent.length);
        console.log('原始HTML內容:', htmlContent);
        
        // 創建一個臨時的div元素來處理HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // 移除可能導致問題的零寬字符
        const textContent = tempDiv.textContent || tempDiv.innerText || '';
        const cleanedText = textContent.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // 如果清理後沒有內容，返回原始HTML
        if (!cleanedText.trim()) {
            console.log('清理後沒有文字內容，返回原始HTML');
            return htmlContent;
        }
        
        // 更溫和的HTML清理，保留文字格式
        let cleanedHtml = htmlContent
            // 移除零寬字符
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            // 移除可能的控制字符（但保留換行符和製表符）
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
            // 移除多餘的連續空格（但保留單個空格）
            .replace(/[ ]{2,}/g, ' ')
            .trim();
        
        // 檢查是否有有效的HTML結構
        const testDiv = document.createElement('div');
        testDiv.innerHTML = cleanedHtml;
        
        // 如果HTML結構有問題，嘗試修復
        if (testDiv.innerHTML !== cleanedHtml) {
            console.log('HTML結構有問題，嘗試修復...');
            cleanedHtml = testDiv.innerHTML;
        }
        
        console.log('清理後HTML內容長度:', cleanedHtml.length);
        console.log('清理後HTML內容:', cleanedHtml);
        
        return cleanedHtml;
    } catch (error) {
        console.error('清理HTML內容時發生錯誤：', error);
        // 如果清理失敗，返回原始內容
        return htmlContent;
    }
}

// 清空表單函數
function clearForm() {
    document.getElementById('postTitle').value = '';
    document.getElementById('editor').innerHTML = '';
    document.getElementById('tags').value = '';
    
    // 重置評分
    document.querySelectorAll('.stars').forEach(starsContainer => {
        starsContainer.setAttribute('data-selected-rating', '0');
        starsContainer.querySelectorAll('i').forEach(star => star.classList.remove('active'));
    });
    
    // 重置總評分
    document.querySelectorAll('.rating-value').forEach(value => value.textContent = '0.0');
    
    // 重置編輯狀態
    isEditingPost = false;
    editingPostId = null;
}

// 載入草稿列表
async function loadDrafts() {
    const draftsList = document.getElementById('draftsList');
    if (!draftsList) return;
    
    draftsList.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const response = await fetch('http://localhost:8080/api/reviews/drafts/1'); // 暫時使用固定用戶ID
        if (!response.ok) throw new Error('載入草稿失敗');
        const drafts = await response.json();
        
        // 清空現有內容
        draftsList.innerHTML = '';
        
        if (drafts.length === 0) {
            draftsList.innerHTML = '<div class="no-drafts">目前沒有草稿</div>';
            return;
        }

        // 按最後修改時間排序（新的在前）
        drafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // 顯示草稿列表
        drafts.forEach(draft => {
            const draftElement = createDraftElement(draft);
            draftsList.appendChild(draftElement);
        });
    } catch (error) {
        console.error('載入草稿時發生錯誤：', error);
        draftsList.innerHTML = '<div class="error">載入草稿失敗，請稍後再試</div>';
    }
}

// 創建草稿元素
function createDraftElement(draft) {
    const div = document.createElement('div');
    div.className = 'draft-card';
    
    // 格式化日期
    const lastModified = new Date(draft.updatedAt).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 限制內容顯示長度
    const contentPreview = truncateText(stripHtml(draft.contentJson), 80);

    div.innerHTML = `
        <div class="draft-header">
            <h3>${escapeHtml(draft.title)}</h3>
            <span class="draft-date">最後修改：${lastModified}</span>
        </div>
        <div class="draft-content">
            <p class="draft-preview">${contentPreview}</p>
            ${draft.tags && draft.tags.length > 0 ? `
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
            <button onclick="publishDraft(${draft.id}, ${draft.userId}, ${draft.restaurantId})" class="btn-publish">
                <i class="fas fa-paper-plane"></i> 發布
            </button>
        </div>
    `;
    
    return div;
}

// 編輯草稿
async function editDraft(draftId) {
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}/detail`);
        if (!response.ok) throw new Error('載入草稿失敗');
        const draft = await response.json();
        
        // 切換到編輯頁面
        showSectionWrapper('edit');
        
        // 填充表單
        document.getElementById('postTitleEdit').value = draft.title;
        document.getElementById('editorEdit').innerHTML = draft.content_json;
        document.getElementById('tagsEdit').value = draft.tags.join(', ');
        
        // 載入圖片到編輯器
        if (draft.photos && draft.photos.length > 0) {
            await loadImagesToEditor(draft.photos, '#editorEdit');
        }
        
        // 設置評分
        if (draft.ratings) {
            // 設置各項評分
            const ratingCategories = {
                environment: 'environment_score',
                service: 'service_score',
                taste: 'taste_score',
                price: 'price_score'
            };

            Object.entries(ratingCategories).forEach(([category, scoreKey]) => {
                const starsContainer = document.querySelector(`#edit-section .stars[data-category="${category}"]`);
                if (starsContainer && draft.ratings[scoreKey]) {
                    const score = draft.ratings[scoreKey];
                    starsContainer.setAttribute('data-selected-rating', score);
                    updateStars(starsContainer, score);
                    const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
                    if (ratingValue) ratingValue.textContent = score + '.0';
                }
            });

            // 更新總評分
            updateOverallRating('#edit-section');
        }
        
        // 儲存當前編輯的草稿ID和相關資訊
        window.currentEditingDraftId = draftId;
        window.currentEditingDraft = {
            userId: draft.userId,
            restaurantId: draft.restaurantId
        };
        window.currentEditingPostId = null; // 清除已發布文章ID
        window.currentEditingPost = null; // 清除已發布文章資訊
        
        // 更新按鈕文字和事件處理
        const saveDraftBtn = document.querySelector('#edit-section .btn-save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.textContent = '更新草稿';
            // 移除舊的事件監聽器
            saveDraftBtn.replaceWith(saveDraftBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-save-draft').addEventListener('click', async function(e) {
                e.preventDefault();
                
                const imageData = collectImageData('#editorEdit');
                const postData = {
                    userId: window.currentEditingDraft.userId,
                    restaurantId: window.currentEditingDraft.restaurantId,
                    title: document.getElementById('postTitleEdit').value || '未命名草稿',
                    content_json: imageData.processedHtmlContent || document.getElementById('editorEdit').innerHTML || '',
                    status: 'draft',
                    ratings: {
                        environment_score: parseInt(document.querySelector('#edit-section .stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                        service_score: parseInt(document.querySelector('#edit-section .stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                        taste_score: parseInt(document.querySelector('#edit-section .stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                        price_score: parseInt(document.querySelector('#edit-section .stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                        overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
                    },
                    photoData: imageData.newImages, // 新圖片數據
                    photos: imageData.existingPhotoIds, // 已存在的圖片ID
                    tags: document.getElementById('tagsEdit').value.split(',').map(tag => tag.trim()).filter(Boolean)
                };

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('後端錯誤回應:', errorText);
                        throw new Error(`更新草稿失敗: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('更新草稿成功:', result);
                    alert('草稿已更新');
                    clearEditForm();
                    loadDrafts();
                    showSectionWrapper('drafts');
                } catch (error) {
                    console.error('更新草稿時發生錯誤：', error);
                    alert('更新草稿失敗：' + error.message);
                }
            });
        }
        
        // 添加發布按鈕事件處理（先更新草稿再發布）
        const publishBtn = document.querySelector('#edit-section .btn-publish');
        if (publishBtn) {
            publishBtn.textContent = '發布文章';
            // 移除舊的事件監聽器
            publishBtn.replaceWith(publishBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-publish').addEventListener('click', async function(e) {
                e.preventDefault();
                
                console.log('從草稿編輯頁面發布，先更新草稿再發布...');
                
                // 先執行更新草稿功能
                const imageData = collectImageData('#editorEdit');
                const updateData = {
                    userId: window.currentEditingDraft.userId,
                    restaurantId: window.currentEditingDraft.restaurantId,
                    title: document.getElementById('postTitleEdit').value || '未命名草稿',
                    content_json: imageData.processedHtmlContent || document.getElementById('editorEdit').innerHTML || '',
                    status: 'draft',
                    ratings: {
                        environment_score: parseInt(document.querySelector('#edit-section .stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                        service_score: parseInt(document.querySelector('#edit-section .stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                        taste_score: parseInt(document.querySelector('#edit-section .stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                        price_score: parseInt(document.querySelector('#edit-section .stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                        overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
                    },
                    photoData: imageData.newImages, // 新圖片數據
                    photos: imageData.existingPhotoIds, // 已存在的圖片ID
                    tags: document.getElementById('tagsEdit').value.split(',').map(tag => tag.trim()).filter(Boolean)
                };

                if (!updateData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    // 第一步：更新草稿
                    console.log('第一步：更新草稿...');
                    const updateResponse = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    });

                    if (!updateResponse.ok) {
                        const errorText = await updateResponse.text();
                        console.error('更新草稿失敗:', errorText);
                        throw new Error(`更新草稿失敗: ${updateResponse.status} ${updateResponse.statusText}`);
                    }

                    const updateResult = await updateResponse.json();
                    console.log('草稿更新成功:', updateResult);

                    // 第二步：發布草稿
                    console.log('第二步：發布草稿...');
                    const deleteDraft = confirm('發布後是否要刪除草稿？');
                    
                    const publishResponse = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}/publish?deleteDraft=${deleteDraft}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: window.currentEditingDraft.userId,
                            restaurantId: window.currentEditingDraft.restaurantId
                        })
                    });

                    if (!publishResponse.ok) {
                        const errorText = await publishResponse.text();
                        console.error('發布草稿失敗:', errorText);
                        throw new Error(`發布草稿失敗: ${publishResponse.status} ${publishResponse.statusText}`);
                    }

                    const publishedId = await publishResponse.json();
                    console.log('發布成功，新文章ID:', publishedId);
                    alert('草稿已成功發布！');
                    
                    // 清除編輯狀態
                    clearEditForm();
                    
                    loadDrafts(); // 重新載入草稿列表
                    loadPublishedPosts(); // 重新載入已發布文章列表
                    showSectionWrapper('published');
                    
                } catch (error) {
                    console.error('發布過程中發生錯誤：', error);
                    alert('發布失敗：' + error.message);
                }
            });
        }
    } catch (error) {
        console.error('載入草稿時發生錯誤：', error);
        alert('載入草稿失敗：' + error.message);
    }
}

// 刪除草稿
async function deleteDraft(draftId) {
    if (!confirm('確定要刪除這個草稿嗎？')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/Draft/${draftId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('刪除草稿失敗');
        
        alert('草稿已刪除');
        loadDrafts(); // 重新載入草稿列表
    } catch (error) {
        console.error('刪除草稿時發生錯誤：', error);
        alert('刪除草稿失敗：' + error.message);
    }
}

// 發布草稿
async function publishDraft(draftId, userId, restaurantId) {
    try {
        console.log('從草稿列表直接發布草稿:', { draftId, userId, restaurantId });
        
        // 詢問是否要刪除草稿
        const deleteDraft = confirm('發布後是否要刪除草稿？');
        console.log('刪除草稿選項:', deleteDraft);
        
        const response = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}/publish?deleteDraft=${deleteDraft}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                restaurantId: restaurantId
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('發布草稿失敗:', errorText);
            throw new Error(`發布草稿失敗: ${response.status} ${response.statusText}`);
        }
        
        const publishedId = await response.json();
        console.log('發布成功，新文章ID:', publishedId);
        alert('草稿已成功發布！');
        
        loadDrafts(); // 重新載入草稿列表
        loadPublishedPosts(); // 重新載入已發布文章列表
        showSectionWrapper('published');
    } catch (error) {
        console.error('發布草稿時發生錯誤：', error);
        alert('發布草稿失敗：' + error.message);
    }
}

// ========== 編輯文章/草稿時切換到 edit-section 並帶入資料 ==========
function editPost(postId) {
    const posts = JSON.parse(localStorage.getItem('publishedPosts') || '[]');
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    isEditingPost = true;
    editingPostId = post.id;
    showSectionWrapper('edit');
    document.getElementById('postTitleEdit').value = post.title;
    document.getElementById('restaurantNameEdit').value = post.restaurant;
    document.getElementById('restaurantLocationEdit').value = post.location;
    document.getElementById('editorEdit').innerHTML = post.content;
    document.getElementById('tagsEdit').value = post.tags.join(', ');
    Object.entries(post.ratings).forEach(([category, rating]) => {
        const starsContainer = document.querySelector('#edit-section .stars[data-category="' + category + '"]');
        if (starsContainer) {
            starsContainer.setAttribute('data-selected-rating', rating);
            updateStars(starsContainer, rating);
            const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
            if (ratingValue) ratingValue.textContent = rating + '.0';
        }
    });
    updateOverallRating('#edit-section');
    const saveDraftBtn = document.querySelector('#edit-section .btn-save-draft');
    if (saveDraftBtn) saveDraftBtn.textContent = '更新草稿';
}

// 載入已發布文章
async function loadPublishedPosts() {
    const publishedList = document.getElementById('publishedList');
    if (!publishedList) return;

    publishedList.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const response = await fetch('http://localhost:8080/api/reviews/user/1/published'); // 暫時使用固定用戶ID
        if (!response.ok) throw new Error('載入已發布文章失敗');
        const publishedPosts = await response.json();
        
        // 清空現有內容
        publishedList.innerHTML = '';
        
        if (publishedPosts.length === 0) {
            publishedList.innerHTML = '<div class="no-posts">目前沒有已發布的文章</div>';
            return;
        }

        // 按發布時間排序（新的在前）
        publishedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // 顯示文章列表
        publishedPosts.forEach(post => {
            const postElement = createPublishedPostElement(post);
            publishedList.appendChild(postElement);
        });
    } catch (error) {
        console.error('載入已發布文章時發生錯誤：', error);
        publishedList.innerHTML = '<div class="error">載入已發布文章失敗，請稍後再試</div>';
    }
}

// 創建已發布文章元素
function createPublishedPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';
    div.setAttribute('data-post-id', post.id); // 添加文章ID屬性
    
    // 計算總評分
    const ratings = post.ratings;
    const totalRating = ratings ? 
        (ratings.environment_score + ratings.service_score + ratings.taste_score + ratings.price_score) : 0;
    const averageRating = ratings ? (totalRating / 4).toFixed(1) : '0.0';
    
    // 格式化日期
    const publishDate = new Date(post.createdAt).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // 限制內容顯示長度
    const contentPreview = truncateText(stripHtml(post.content_json), 120);

    div.innerHTML = `
        <div class="post-header">
            <h3>${escapeHtml(post.title)}</h3>
            <span class="post-date">發布於：${publishDate}</span>
        </div>
        <div class="post-content">
            <p class="restaurant-info">
                <i class="fas fa-utensils"></i> 餐廳ID: ${post.restaurantId}
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
            <p class="post-preview">${contentPreview}</p>
            ${post.tags && post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
        </div>
        <div class="post-stats">
            <span><i class="fas fa-eye"></i> 0</span>
            <span><i class="fas fa-heart"></i> 0</span>
        </div>
        <div class="post-actions">
            <button onclick="editPublishedPost(${post.id})" class="btn-edit">
                <i class="fas fa-edit"></i> 編輯
            </button>
            <button onclick="deletePublishedPost(${post.id})" class="btn-delete">
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
    if (!text) return '';
    
    // 移除HTML標籤
    const plainText = stripHtml(text);
    
    if (plainText.length <= maxLength) return plainText;
    
    // 在適當的位置截斷（避免截斷在單字中間）
    let truncated = plainText.substring(0, maxLength);
    
    // 嘗試在句號、逗號或空格處截斷
    const lastPeriod = truncated.lastIndexOf('。');
    const lastComma = truncated.lastIndexOf('，');
    const lastSpace = truncated.lastIndexOf(' ');
    
    let cutPoint = Math.max(lastPeriod, lastComma, lastSpace);
    
    if (cutPoint > maxLength * 0.7) { // 如果找到的截斷點在70%之後，使用它
        truncated = truncated.substring(0, cutPoint + 1);
    }
    
    return truncated + '...';
}

function collectRatings(sectionSelector = '') {
    const ratings = {};
    document.querySelectorAll(`${sectionSelector} .stars`).forEach(starsContainer => {
        const category = starsContainer.dataset.category;
        if (category) {
            ratings[category] = starsContainer.getAttribute('data-selected-rating') || '0';
        }
    });
    return ratings;
}
// ========== 更新總評分（支援區塊選擇器） ==========
function updateOverallRating(sectionSelector = '') {
    const categories = ['environment', 'service', 'taste', 'price'];
    let totalRating = 0;
    let validRatings = 0;
    
    categories.forEach(category => {
        const starsContainer = document.querySelector(`${sectionSelector} .stars[data-category="${category}"]`);
        if (starsContainer) {
            const rating = parseInt(starsContainer.getAttribute('data-selected-rating')) || 0;
            if (rating > 0) {
                totalRating += rating;
                validRatings++;
            }
        }
    });
    
    const averageRating = validRatings > 0 ? (totalRating / validRatings).toFixed(1) : '0.0';
    
    // 更新總評分顯示
    const overallStars = document.querySelector(`${sectionSelector} .overall-rating .stars`);
    const overallValue = document.querySelector(`${sectionSelector} .overall-rating .rating-value`);
    
    if (overallStars && overallValue) {
        const stars = overallStars.querySelectorAll('i');
        const ratingNum = parseFloat(averageRating);
        
        // 更新星星顯示
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < Math.floor(ratingNum));
        });
        
        // 更新數值顯示
        overallValue.textContent = averageRating;
        
        console.log(`更新總評分: ${averageRating} (${validRatings} 個有效評分)`);
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
            ('選擇顏色：', color); // 添加調試日誌
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
    
    ('處理顏色變更：', color, isPreview); // 添加調試日誌

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
    ('應用顏色到文字：', color); // 添加調試日誌
    
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
                // 更新總評分（支援編輯頁面）
                const sectionSelector = group.closest('#edit-section') ? '#edit-section' : '';
                updateOverallRating(sectionSelector);
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

function clearEditForm() {
    // 清空標題
    document.getElementById('postTitleEdit').value = '';
    
    // 清空編輯器內容
    document.getElementById('editorEdit').innerHTML = '';
    
    // 清空標籤
    document.getElementById('tagsEdit').value = '';
    
    // 重置所有評分
    const categories = ['environment', 'service', 'taste', 'price'];
    categories.forEach(category => {
        const starsContainer = document.querySelector(`#edit-section .stars[data-category="${category}"]`);
        if (starsContainer) {
            starsContainer.setAttribute('data-selected-rating', '0');
            updateStars(starsContainer, 0);
            const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
            if (ratingValue) ratingValue.textContent = '0.0';
        }
    });
    
    // 重置總評分
    const overallStars = document.querySelector('#edit-section .overall-rating .stars');
    const overallValue = document.querySelector('#edit-section .overall-rating .rating-value');
    if (overallStars && overallValue) {
        const stars = overallStars.querySelectorAll('i');
        stars.forEach(star => star.classList.remove('active'));
        overallValue.textContent = '0.0';
    }
    
    // 重置按鈕文字
    const saveDraftBtn = document.querySelector('#edit-section .btn-save-draft');
    const publishBtn = document.querySelector('#edit-section .btn-publish');
    
    if (saveDraftBtn) {
        saveDraftBtn.textContent = '儲存草稿';
        // 移除舊的事件監聽器
        saveDraftBtn.replaceWith(saveDraftBtn.cloneNode(true));
    }
    
    if (publishBtn) {
        publishBtn.textContent = '發布';
        // 移除舊的事件監聽器
        publishBtn.replaceWith(publishBtn.cloneNode(true));
    }
    
    // 清除當前編輯的草稿ID和文章ID
    window.currentEditingDraftId = null;
    window.currentEditingPostId = null;
    window.currentEditingDraft = null;
    window.currentEditingPost = null;
}

// 編輯已發布文章
async function editPublishedPost(postId) {
    try {
        // 獲取文章詳情
        const response = await fetch(`http://localhost:8080/api/reviews/user/1/published`);
        if (!response.ok) throw new Error('載入文章失敗');
        const publishedPosts = await response.json();
        const post = publishedPosts.find(p => p.id === postId);
        
        if (!post) {
            alert('文章不存在');
            return;
        }
        
        // 切換到編輯頁面
        showSectionWrapper('edit');
        
        // 填充表單
        document.getElementById('postTitleEdit').value = post.title;
        document.getElementById('editorEdit').innerHTML = post.content_json;
        document.getElementById('tagsEdit').value = post.tags ? post.tags.join(', ') : '';
        
        // 載入圖片到編輯器
        if (post.photos && post.photos.length > 0) {
            await loadImagesToEditor(post.photos, '#editorEdit');
        }
        
        // 設置評分
        if (post.ratings) {
            // 設置各項評分
            const ratingCategories = {
                environment: 'environment_score',
                service: 'service_score',
                taste: 'taste_score',
                price: 'price_score'
            };

            Object.entries(ratingCategories).forEach(([category, scoreKey]) => {
                const starsContainer = document.querySelector(`#edit-section .stars[data-category="${category}"]`);
                if (starsContainer && post.ratings[scoreKey]) {
                    const score = post.ratings[scoreKey];
                    starsContainer.setAttribute('data-selected-rating', score);
                    updateStars(starsContainer, score);
                    const ratingValue = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
                    if (ratingValue) ratingValue.textContent = score + '.0';
                }
            });

            // 更新總評分
            updateOverallRating('#edit-section');
        }
        
        // 儲存當前編輯的文章ID和相關資訊
        window.currentEditingPostId = postId;
        window.currentEditingPost = {
            userId: post.userId,
            restaurantId: post.restaurantId
        };
        window.currentEditingDraftId = null; // 清除草稿ID
        window.currentEditingDraft = null; // 清除草稿資訊
        
        // 更新按鈕文字和事件處理
        const saveDraftBtn = document.querySelector('#edit-section .btn-save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.textContent = '儲存成新草稿';
            // 移除舊的事件監聽器
            saveDraftBtn.replaceWith(saveDraftBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-save-draft').addEventListener('click', async function(e) {
                e.preventDefault();
                
                const imageData = collectImageData('#editorEdit');
                const postData = {
                    userId: window.currentEditingPost.userId,
                    restaurantId: window.currentEditingPost.restaurantId,
                    title: document.getElementById('postTitleEdit').value || '未命名草稿',
                    content_json: imageData.processedHtmlContent || document.getElementById('editorEdit').innerHTML || '',
                    status: 'draft',
                    ratings: {
                        environment_score: parseInt(document.querySelector('#edit-section .stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                        service_score: parseInt(document.querySelector('#edit-section .stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                        taste_score: parseInt(document.querySelector('#edit-section .stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                        price_score: parseInt(document.querySelector('#edit-section .stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                        overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
                    },
                    photoData: imageData.newImages, // 新圖片數據
                    photos: imageData.existingPhotoIds, // 已存在的圖片ID
                    tags: document.getElementById('tagsEdit').value.split(',').map(tag => tag.trim()).filter(Boolean)
                };

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    const response = await fetch('http://localhost:8080/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('後端錯誤回應:', errorText);
                        throw new Error(`儲存草稿失敗: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('儲存新草稿成功:', result);
                    alert('已儲存成新草稿');
                    clearEditForm();
                    loadDrafts();
                    showSectionWrapper('drafts');
                } catch (error) {
                    console.error('儲存草稿時發生錯誤：', error);
                    alert('儲存草稿失敗：' + error.message);
                }
            });
        }
        
        // 添加更新文章按鈕
        const updatePostBtn = document.querySelector('#edit-section .btn-publish');
        if (updatePostBtn) {
            updatePostBtn.textContent = '更新文章';
            // 移除舊的事件監聽器
            updatePostBtn.replaceWith(updatePostBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-publish').addEventListener('click', async function(e) {
                e.preventDefault();
                
                const imageData = collectImageData('#editorEdit');
                const postData = {
                    userId: window.currentEditingPost.userId,
                    restaurantId: window.currentEditingPost.restaurantId,
                    title: document.getElementById('postTitleEdit').value || '未命名文章',
                    content_json: imageData.processedHtmlContent || document.getElementById('editorEdit').innerHTML || '',
                    status: 'published',
                    ratings: {
                        environment_score: parseInt(document.querySelector('#edit-section .stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                        service_score: parseInt(document.querySelector('#edit-section .stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                        taste_score: parseInt(document.querySelector('#edit-section .stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                        price_score: parseInt(document.querySelector('#edit-section .stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                        overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
                    },
                    photoData: imageData.newImages, // 新圖片數據
                    photos: imageData.existingPhotoIds, // 已存在的圖片ID
                    tags: document.getElementById('tagsEdit').value.split(',').map(tag => tag.trim()).filter(Boolean)
                };

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:8080/api/reviews/published/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('後端錯誤回應:', errorText);
                        throw new Error(`更新文章失敗: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('更新文章成功:', result);
                    alert('文章已更新');
                    clearEditForm();
                    loadPublishedPosts();
                    showSectionWrapper('published');
                } catch (error) {
                    console.error('更新文章時發生錯誤：', error);
                    alert('更新文章失敗：' + error.message);
                }
            });
        }
    } catch (error) {
        console.error('載入文章時發生錯誤：', error);
        alert('載入文章失敗：' + error.message);
    }
}

// 刪除已發布文章
async function deletePublishedPost(postId) {
    if (!confirm('確定要刪除這個文章嗎？')) return;
    
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/published/${postId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('刪除文章失敗');
        
        alert('文章已刪除');
        loadPublishedPosts(); // 重新載入已發布文章列表
    } catch (error) {
        console.error('刪除文章時發生錯誤：', error);
        alert('刪除文章失敗：' + error.message);
    }
}

// 載入圖片到編輯器
async function loadImagesToEditor(photoUrls, editorSelector = '#editor') {
    const editor = document.querySelector(editorSelector);
    if (!editor || !photoUrls || photoUrls.length === 0) return;
    
    // 獲取編輯器的HTML內容
    let htmlContent = editor.innerHTML;
    
    for (let i = 0; i < photoUrls.length; i++) {
        try {
            const photoUrl = photoUrls[i];
            // 如果URL是圖片ID，則從後端獲取圖片
            if (photoUrl && !photoUrl.startsWith('data:') && !photoUrl.startsWith('http')) {
                const imageId = parseInt(photoUrl);
                if (!isNaN(imageId)) {
                    console.log(`嘗試載入圖片 ID: ${imageId}`);
                    
                    const response = await fetch(`http://localhost:8080/api/reviews/photos/${imageId}`);
                    if (response.ok) {
                        const imageBlob = await response.blob();
                        const imageUrl = URL.createObjectURL(imageBlob);
                        
                        // 創建完整的圖片容器結構
                        const wrapper = document.createElement('div');
                        wrapper.className = 'image-wrapper';
                        
                        const container = document.createElement('div');
                        container.className = 'image-container';
                        
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.setAttribute('data-photo-id', imageId.toString()); // 添加圖片ID屬性
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.draggable = false;
                        
                        // 嘗試從後端獲取圖片大小信息
                        try {
                            const infoResponse = await fetch(`http://localhost:8080/api/reviews/photos/${imageId}/info`);
                            if (infoResponse.ok) {
                                const photoInfo = await infoResponse.json();
                                if (photoInfo.width && photoInfo.height) {
                                    img.style.width = photoInfo.width;
                                    img.style.height = photoInfo.height;
                                    console.log('應用圖片大小:', photoInfo.width, photoInfo.height);
                                }
                            }
                        } catch (error) {
                            console.warn(`無法獲取圖片 ${imageId} 大小信息:`, error);
                        }
                        
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
                        
                        // 在HTML內容中尋找圖片佔位符並替換
                        const placeholder = `[IMAGE_PLACEHOLDER_${imageId}]`;
                        if (htmlContent.includes(placeholder)) {
                            // 將圖片容器轉換為HTML字符串
                            const wrapperHtml = wrapper.outerHTML;
                            htmlContent = htmlContent.replace(placeholder, wrapperHtml);
                            console.log(`成功替換圖片佔位符: ${placeholder}`);
                        } else {
                            // 如果沒有找到佔位符，在內容末尾添加圖片
                            htmlContent += wrapper.outerHTML;
                            console.log(`在內容末尾添加圖片 ID: ${imageId}`);
                        }
                        
                        // 初始化圖片縮放功能
                        setTimeout(() => {
                            const newContainer = editor.querySelector(`img[data-photo-id="${imageId}"]`)?.closest('.image-container');
                            if (newContainer) {
                                const newImg = newContainer.querySelector('img');
                                const newResizeInfo = newContainer.querySelector('.resize-info');
                                const newHandles = newContainer.querySelectorAll('.resize-handle');
                                initializeImageResize(newContainer, newImg, newResizeInfo, Array.from(newHandles));
                            }
                        }, 100);
                    } else {
                        console.warn(`圖片 ID ${imageId} 載入失敗: ${response.status} ${response.statusText}`);
                        // 如果圖片載入失敗，保留佔位符，不要中斷流程
                    }
                } else {
                    console.warn(`無效的圖片 ID: ${photoUrl}`);
                }
            } else {
                console.log(`跳過非圖片 ID 的 URL: ${photoUrl}`);
            }
        } catch (error) {
            console.error(`載入圖片時發生錯誤 (ID: ${photoUrls[i]}):`, error);
            // 繼續處理下一個圖片，不要中斷整個流程
        }
    }
    
    // 更新編輯器內容
    editor.innerHTML = htmlContent;
    console.log('圖片載入完成，編輯器內容已更新');
}