// 全局變數
let editor;
let isEditingPost = false; // 添加編輯模式標記
let editingPostId = null; // 添加正在編輯的文章ID
let savedRange = null; // 保存游標範圍
let updateToolbarTimeout = null; // 防抖計時器
let currentUserId = null; // 全域用戶ID變數

// 餐廳資訊全域變數
let currentRestaurantId = null; // 當前餐廳ID
let currentRestaurantName = null; // 當前餐廳名稱
let currentRestaurantAddress = null; // 當前餐廳地址

// 防抖版本的 updateToolbarState
function debouncedUpdateToolbarState() {
    console.log('debouncedUpdateToolbarState: 被調用');
    if (updateToolbarTimeout) {
        console.log('debouncedUpdateToolbarState: 清除之前的超時');
        clearTimeout(updateToolbarTimeout);
    }
    updateToolbarTimeout = setTimeout(() => {
        console.log('debouncedUpdateToolbarState: 執行 updateToolbarState');
        updateToolbarState();
        updateToolbarTimeout = null;
    }, 5); // 減少到 5ms 的防抖延遲
}

// 保存當前游標範圍
function saveRange() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const editor = document.getElementById('editor');
        const editorEdit = document.getElementById('editorEdit');
        const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
        
        if (currentEditor && currentEditor.contains(range.commonAncestorContainer)) {
            savedRange = range.cloneRange();
            console.log('✅ 已保存游標範圍');
        } else {
            console.log('⚠️ 游標不在編輯器內，未保存');
        }
    }
}

// 還原游標範圍
function restoreRange() {
    if (savedRange) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(savedRange);
        const editor = document.getElementById('editor');
        const editorEdit = document.getElementById('editorEdit');
        const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
        
        if (currentEditor) currentEditor.focus(); // ✅ 還原後強制 focus
        console.log('✅ 還原游標範圍');
        return savedRange;
    }
    return null;
}

// 頁面載入完成後執行
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化編輯器功能
    initEditor();
    // 初始化評分系統
    initRatingSystem();
    // 載入用戶數據
    loadUserData();
    // 檢查URL參數中的餐廳資訊
    await getRestaurantInfoFromURL();
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

    // 設置編輯器的 active 類別
    const editor = document.getElementById('editor');
    const editorEdit = document.getElementById('editorEdit');
    
    if (sectionId === 'edit') {
        // 編輯頁面：設置 editorEdit 為 active
        if (editor) editor.classList.remove('active');
        if (editorEdit) editorEdit.classList.add('active');
        console.log('showSection: 設置 editorEdit 為 active');
    } else {
        // 其他頁面：設置 editor 為 active
        if (editor) editor.classList.add('active');
        if (editorEdit) editorEdit.classList.remove('active');
        console.log('showSection: 設置 editor 為 active');
    }

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
    const editorEdit = document.getElementById('editorEdit');
    
    // 為兩個編輯器都初始化功能
    [editor, editorEdit].forEach(editorElement => {
        if (!editorElement) return;
        
        // 設置編輯器預設字體大小
        editorElement.style.fontSize = `${currentFontSize}px`;
        
        // ✅ [REFACTORED] 統一的點擊事件處理，確保圖片選取可靠
        editorElement.addEventListener('click', function(e) {
            const clickedImageContainer = e.target.closest('.image-container');

            // 如果點擊了某個圖片容器，就選中它
            if (clickedImageContainer) {
                console.log('檢測到圖片容器點擊');
                
                // 阻止事件冒泡，防止文檔點擊事件清除 .selected 類別
                e.stopPropagation();
                
                // 首先，移除所有圖片的 .selected 狀態
                document.querySelectorAll('.image-container.selected').forEach(container => {
                    container.classList.remove('selected');
                });
                
                // 然後，選中當前點擊的圖片容器
                clickedImageContainer.classList.add('selected');
                
                // 將選擇範圍設定為 image-wrapper，以利於後續的樣式判斷
                const wrapper = clickedImageContainer.closest('.image-wrapper');
                if (wrapper) {
                    const range = document.createRange();
                    range.selectNode(wrapper);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                    console.log('圖片點擊：選擇 image-wrapper 容器');
                    
                    // ✅ 直接調用 updateToolbarState，確保工具列立即更新
                    setTimeout(() => {
                        updateToolbarState();
                    }, 0);
                }
            } else {
                // 如果點擊的不是圖片容器，清除所有選中狀態
                document.querySelectorAll('.image-container.selected').forEach(container => {
                    container.classList.remove('selected');
                });
            }
        });

        // 監聽輸入事件
        editorElement.addEventListener('input', debouncedUpdateToolbarState);

        // 監聽 blur 事件以保存游標
        editorElement.addEventListener('blur', saveRange);

        // 監聽鍵盤事件
        editorElement.addEventListener('keyup', debouncedUpdateToolbarState);
        editorElement.addEventListener('keydown', function(e) {
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
            
            // ✅ [FIXED] 處理點擊圖片後按 Enter 的情況
            if (e.key === 'Enter') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    
                    // ✅ [DEBUG] 添加調試信息
                    console.log('Enter 鍵處理 - 調試信息:', {
                        startContainer: range.startContainer.nodeType === 1 ? range.startContainer.tagName : 'TEXT_NODE',
                        startContainerClass: range.startContainer.nodeType === 1 ? range.startContainer.className : 'N/A',
                        startOffset: range.startOffset,
                        collapsed: range.collapsed
                    });
                    
                    // ✅ [FIX] 檢查游標是否在圖片後面的文字節點中（優先處理）
                    if (range.startContainer.nodeType === 3) { // TEXT_NODE
                        const parentElement = range.startContainer.parentNode;
                        console.log('Enter 鍵處理 - 文字節點父元素:', {
                            tagName: parentElement?.tagName,
                            className: parentElement?.className,
                            innerHTML: parentElement?.innerHTML?.substring(0, 50)
                        });
                        
                        if (parentElement && parentElement.tagName === 'P') {
                            const previousElement = parentElement.previousElementSibling;
                            console.log('Enter 鍵處理 - 文字節點前一個元素:', {
                                tagName: previousElement?.tagName,
                                className: previousElement?.className,
                                isImageWrapper: previousElement?.classList.contains('image-wrapper')
                            });
                            
                            if (previousElement && previousElement.classList.contains('image-wrapper')) {
                                // 游標在圖片後面的段落中的文字節點，按 Enter 創建新段落
                                e.preventDefault();
                                
                                const newParagraph = document.createElement('p');
                                newParagraph.innerHTML = '&#8203;'; // 零寬空白字元
                                
                                // 將新段落插入到當前段落後面
                                parentElement.parentNode.insertBefore(newParagraph, parentElement.nextSibling);
                                
                                // 將游標移動到新段落中
                                const newRange = document.createRange();
                                newRange.setStart(newParagraph, 0);
                                newRange.collapse(true);
                                selection.removeAllRanges();
                                selection.addRange(newRange);
                                
                                console.log('✅ 已處理在圖片後面文字節點中按 Enter 的情況');
                                return; // 阻止執行後續的 Enter 處理邏輯
                            }
                        }
                    }
                    
                    // 更穩固的判斷：只要游標在圖片容器內，就進行處理
                    const container = range.commonAncestorContainer;
                    
                    // ✅ [FIX] 更精確地檢測游標是否真的在圖片容器內
                    let imageWrapper = null;
                    let isInsideImageContainer = false;
                    
                    if (container.nodeType === 1) {
                        // 如果容器是元素節點，檢查它是否是圖片容器或其子元素
                        if (container.classList.contains('image-wrapper') || 
                            container.classList.contains('image-container') ||
                            container.classList.contains('resize-handle')) {
                            imageWrapper = container.closest('.image-wrapper');
                            isInsideImageContainer = true;
                        }
                    } else if (container.nodeType === 3) {
                        // 如果容器是文字節點，檢查其父元素
                        const parentElement = container.parentNode;
                        if (parentElement && (
                            parentElement.classList.contains('image-wrapper') || 
                            parentElement.classList.contains('image-container') ||
                            parentElement.classList.contains('resize-handle'))) {
                            imageWrapper = parentElement.closest('.image-wrapper');
                            isInsideImageContainer = true;
                        }
                    }
                    
                    console.log('Enter 鍵處理 - 圖片容器檢測:', {
                        containerType: container.nodeType === 1 ? 'ELEMENT' : 'TEXT_NODE',
                        containerClass: container.nodeType === 1 ? container.className : 'N/A',
                        isInsideImageContainer: isInsideImageContainer,
                        imageWrapper: imageWrapper ? 'found' : 'not found'
                    });

                    if (isInsideImageContainer && imageWrapper) {
                        e.preventDefault();
                        
                        const newParagraph = document.createElement('p');
                        newParagraph.innerHTML = '&#8203;'; // 零寬空白字元
                        
                        // 將新段落插入到圖片容器後面
                        imageWrapper.parentNode.insertBefore(newParagraph, imageWrapper.nextSibling);
                        
                        // 將游標移動到新段落中
                        const newRange = document.createRange();
                        newRange.setStart(newParagraph, 0);
                        newRange.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(newRange);
                        
                        console.log('✅ 已處理在圖片容器內按 Enter 的情況');
                    }
                }
            }
        });

        // 初始化時為編輯器添加零寬空白字元（如果編輯器為空）
        if (editorElement.innerHTML === '' || editorElement.innerHTML === '<br>') {
            editorElement.innerHTML = '\u200B';
            console.log('初始化編輯器：添加零寬空白字元');
        }
    });

    // 初始化顏色選擇器
    initColorPicker();

    // 監聽選取範圍變化
    document.addEventListener('selectionchange', function() {
        console.log('selectionchange: 事件觸發');
        // 只有在編輯器內有選取範圍變化時才更新工具列
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const editor = document.getElementById('editor');
            const editorEdit = document.getElementById('editorEdit');
            const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
            
            console.log('selectionchange: 調試信息:', {
                hasEditor: !!editor,
                hasEditorEdit: !!editorEdit,
                editorEditActive: editorEdit?.classList.contains('active'),
                currentEditor: currentEditor?.id,
                rangeContainer: range.commonAncestorContainer?.nodeType === 1 ? range.commonAncestorContainer.tagName : 'TEXT_NODE',
                rangeContainerClass: range.commonAncestorContainer?.nodeType === 1 ? range.commonAncestorContainer.className : 'N/A',
                editorContains: currentEditor?.contains(range.commonAncestorContainer)
            });
            
            if (currentEditor && currentEditor.contains(range.commonAncestorContainer)) {
                console.log('selectionchange: 選取範圍在當前編輯器內');
                // ✅ [FIX] 檢查是否有選中的圖片容器，如果有則不觸發 updateToolbarState
                // 因為圖片點擊事件會自己處理工具列更新
                const selectedImageContainers = document.querySelectorAll('.image-container.selected');
                if (selectedImageContainers.length === 0) {
                    console.log('selectionchange: 沒有選中的圖片容器，調用 debouncedUpdateToolbarState');
                    debouncedUpdateToolbarState();
                } else {
                    console.log('selectionchange: 檢測到選中的圖片容器，跳過 updateToolbarState');
                    // ✅ [DEBUG] 添加調試信息
                    console.log('selectionchange: 選中的圖片容器數量:', selectedImageContainers.length);
                    console.log('selectionchange: 選中的圖片容器:', selectedImageContainers[0]?.className);
                }
            } else {
                console.log('selectionchange: 選取範圍不在當前編輯器內');
            }
        } else {
            console.log('selectionchange: 沒有選取範圍');
        }
    });
}

// 監聽文檔點擊事件，取消圖片選中（但排除編輯器內的點擊）
document.addEventListener('click', function(e) {
    // 如果點擊的是編輯器內的元素，不處理
    if (e.target.closest('.editor') || e.target.closest('#editorEdit')) {
        return;
    }
    
    // 如果點擊的是圖片容器，不處理（由編輯器點擊事件處理）
    if (e.target.closest('.image-container')) {
        return;
    }
    
    // ✅ [FIX] 如果點擊的是對齊按鈕，不處理（避免在對齊操作時清除 .selected 類別）
    if (e.target.closest('button[onclick*="justify"]') || 
        e.target.closest('button[onclick*="formatText"]') ||
        e.target.closest('.toolbar-group') ||
        e.target.closest('.editor-toolbar')) {
        console.log('文檔點擊: 檢測到工具列按鈕點擊，跳過清除 .selected 類別');
        return;
    }
    
    // ✅ [DEBUG] 添加調試信息
    const selectedBefore = document.querySelectorAll('.image-container.selected').length;
    if (selectedBefore > 0) {
        console.log(`文檔點擊: 即將清除 ${selectedBefore} 個選中的圖片容器`);
    }
    
    // 只有在點擊編輯器外部時才清除選中狀態
    document.querySelectorAll('.image-container.selected').forEach(container => {
        container.classList.remove('selected');
    });
});

// 處理圖片上傳
const imageUpload = document.getElementById('imageUpload');
if (imageUpload) {
    imageUpload.addEventListener('change', handleImageUpload);
}

// 更新工具列狀態
function updateToolbarState() {
    const editor = document.getElementById('editor');
    const editorEdit = document.getElementById('editorEdit');
    const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
    
    if (!currentEditor) {
        console.log('updateToolbarState: 找不到當前編輯器');
        return;
    }

    const selection = window.getSelection();
    let container = null;
    
    // ✅ [FIX] 如果有選中的圖片容器，直接使用它作為容器
    const selectedImageContainers = document.querySelectorAll('.image-container.selected');
    console.log('updateToolbarState: 調試 - selectedImageContainers.length:', selectedImageContainers.length);
    if (selectedImageContainers.length > 0) {
        container = selectedImageContainers[0];
        console.log('updateToolbarState: 使用選中的圖片容器作為當前容器');
    } else if (selection.rangeCount > 0) {
        console.log('updateToolbarState: 沒有找到選中的圖片容器，使用選擇範圍的容器');
        const range = selection.getRangeAt(0);
        container = range.commonAncestorContainer;
        
        // 確保選取範圍在編輯器內
        if (!currentEditor.contains(container)) {
            console.log('updateToolbarState: 選取範圍不在當前編輯器內');
            return;
        }
        
        // 如果選中的是文字節點，獲取其父節點
        if (container.nodeType === 3) {
            container = container.parentNode;
        } else if (container.nodeName === 'IMG') {
            // 當點選圖片時，從圖片往外找 image-wrapper
            const wrapper = container.closest('.image-wrapper');
            if (wrapper) {
                container = wrapper;
                console.log('updateToolbarState: 檢測到圖片點擊，選擇 image-wrapper 容器');
            }
        }
    } else {
        console.log('updateToolbarState: 沒有選取範圍，嘗試使用編輯器本身作為容器');
        // 如果沒有選取範圍，使用編輯器本身作為容器來獲取預設樣式
        container = currentEditor;
    }

    if (!container) {
        console.log('updateToolbarState: 無法確定容器，退出');
        return;
    }

    console.log('updateToolbarState: 當前容器:', {
        tagName: container.tagName,
        className: container.className,
        isImageWrapper: container.classList.contains('image-wrapper'),
        isImageContainer: container.classList.contains('image-container'),
        isResizeHandle: container.classList.contains('resize-handle')
    });

    // 獲取當前游標位置的樣式
    const computedStyle = window.getComputedStyle(container);
    
    // 根據當前活躍的編輯器來選擇對應的工具列元素
    const isEditMode = editorEdit?.classList.contains('active');
    const currentSection = isEditMode ? '#edit-section' : '#write-section';
    
    // 更新字體大小選擇器
    const fontSize = parseInt(computedStyle.fontSize);
    const fontSizeSelect = document.querySelector(`${currentSection} #fontSize${isEditMode ? 'Edit' : ''}`);
    if (fontSizeSelect) {
        // 找到最接近的字體大小選項
        const availableSizes = Array.from(fontSizeSelect.options).map(option => parseInt(option.value));
        const closestSize = availableSizes.reduce((prev, curr) => {
            return (Math.abs(curr - fontSize) < Math.abs(prev - fontSize) ? curr : prev);
        });
        fontSizeSelect.value = closestSize;
    }

    // 更新粗體按鈕狀態
    const boldButton = document.querySelector(`${currentSection} button[onclick="formatText('bold')"]`);
    if (boldButton) {
        boldButton.classList.toggle('active', computedStyle.fontWeight >= 600);
    }

    // 更新斜體按鈕狀態
    const italicButton = document.querySelector(`${currentSection} button[onclick="formatText('italic')"]`);
    if (italicButton) {
        italicButton.classList.toggle('active', computedStyle.fontStyle === 'italic');
    }

    // 更新底線按鈕狀態和顏色
    const underlineButton = document.querySelector(`${currentSection} button[onclick="formatText('underline')"]`);
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
        'justifyLeft': document.querySelector(`${currentSection} button[onclick="formatText('justifyLeft')"]`),
        'justifyCenter': document.querySelector(`${currentSection} button[onclick="formatText('justifyCenter')"]`),
        'justifyRight': document.querySelector(`${currentSection} button[onclick="formatText('justifyRight')"]`)
    };

    Object.entries(alignButtons).forEach(([align, button]) => {
        if (button) {
            button.classList.remove('active');
        }
    });

    // 檢查當前對齊方式
    let textAlign = computedStyle.textAlign;
    
    // 增強圖片包裝器查找邏輯
    let imageWrapper = null;
    
    // ✅ [FIX] 優先檢查 .selected 圖片容器，這是最可靠的方法
    if (selectedImageContainers.length > 0) {
        imageWrapper = selectedImageContainers[0].parentElement;
        console.log('updateToolbarState: 方法6 (優先) - 從選中的圖片容器找到 image-wrapper');
    } else if (!imageWrapper) {
        // ✅ 新增方法0：檢查是否為調整大小的控制點
        if (container.classList.contains('resize-handle')) {
            const imageContainer = container.closest('.image-container');
            if (imageContainer) {
                imageWrapper = imageContainer.parentElement;
                console.log('updateToolbarState: 方法0 - 從 resize-handle 找到 image-wrapper');
            }
        }
        // 方法1：檢查當前容器是否為圖片包裝器
        else if (container.classList.contains('image-wrapper')) {
            imageWrapper = container;
            console.log('updateToolbarState: 方法1 - 當前容器是 image-wrapper');
        }
        // 方法2：直接查找最近的圖片包裝器
        else {
            imageWrapper = container.closest('.image-wrapper');
            if (imageWrapper) {
                console.log('updateToolbarState: 方法2 - 找到最近的 image-wrapper');
            }
        }
        
        // 方法3：如果沒有找到，檢查是否在圖片容器內
        if (!imageWrapper) {
            const imageContainer = container.closest('.image-container');
            if (imageContainer) {
                imageWrapper = imageContainer.parentElement;
                console.log('updateToolbarState: 方法3 - 從 image-container 找到 image-wrapper');
            }
        }
        
        // 方法4：如果容器本身就是圖片容器
        if (!imageWrapper && container.classList.contains('image-container')) {
            imageWrapper = container.parentElement;
            console.log('updateToolbarState: 方法4 - 容器本身是 image-container');
        }
        
        // 方法5：檢查選中的元素是否包含圖片 (這是比較籠統的方法)
        if (!imageWrapper) {
            const selectedImages = container.querySelectorAll('img');
            if (selectedImages.length > 0) {
                const img = selectedImages[0];
                const imageContainer = img.closest('.image-container');
                if (imageContainer) {
                    imageWrapper = imageContainer.parentElement;
                    console.log('updateToolbarState: 方法5 - 從選中圖片找到 image-wrapper');
                }
            }
        }
    }
    
    if (imageWrapper) {
        console.log('updateToolbarState: 找到 image-wrapper:', {
            className: imageWrapper.className,
            hasAlignLeft: imageWrapper.classList.contains('align-left'),
            hasAlignCenter: imageWrapper.classList.contains('align-center'),
            hasAlignRight: imageWrapper.classList.contains('align-right')
        });
        
        // 檢查圖片的對齊類別
        if (imageWrapper.classList.contains('align-left')) {
            textAlign = 'left';
            console.log('updateToolbarState: 檢測到圖片靠左對齊');
        } else if (imageWrapper.classList.contains('align-center')) {
            textAlign = 'center';
            console.log('updateToolbarState: 檢測到圖片置中對齊');
        } else if (imageWrapper.classList.contains('align-right')) {
            textAlign = 'right';
            console.log('updateToolbarState: 檢測到圖片靠右對齊');
        } else {
            console.log('updateToolbarState: 圖片無對齊設置');
        }
    } else {
        console.log('updateToolbarState: 未找到 image-wrapper');
    }
    
    if (alignButtons[`justify${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`]) {
        alignButtons[`justify${textAlign.charAt(0).toUpperCase() + textAlign.slice(1)}`].classList.add('active');
    }

    // 更新顏色選擇器
    // 根據當前活躍的編輯器來選擇對應的顏色預覽元素
    
    const colorPreview = isEditMode ? 
        document.querySelector('#edit-section .color-preview') : 
        document.querySelector('#write-section .color-preview');
    
    if (colorPreview) {
        let currentNode = container;
        let color = null;
        
        console.log('updateToolbarState: 開始處理顏色更新');
        console.log('updateToolbarState: 當前編輯模式:', isEditMode ? '編輯模式' : '新建模式');
        console.log('updateToolbarState: 當前容器:', {
            tagName: currentNode.tagName,
            className: currentNode.className,
            nodeType: currentNode.nodeType
        });
        
        // 向上遍歷節點樹，找到最近的顏色設定
        while (currentNode && currentNode !== document.body) {
            const style = window.getComputedStyle(currentNode);
            const currentColor = style.color;
            
            console.log('updateToolbarState: 檢查節點顏色:', {
                tagName: currentNode.tagName,
                className: currentNode.className,
                color: currentColor
            });
            
            // 檢查是否為有效的顏色值（不是透明或繼承）
            if (currentColor !== 'inherit' && 
                currentColor !== 'transparent' && 
                currentColor !== 'rgba(0, 0, 0, 0)' &&
                currentColor !== 'initial') {
                color = currentColor;
                console.log('updateToolbarState: 找到有效顏色:', color);
                break;
            }
            currentNode = currentNode.parentNode;
        }

        if (color) {
            console.log('updateToolbarState: 處理顏色:', color);
            // 轉換 rgb/rgba 為 hex
            if (color.startsWith('rgb')) {
                const rgb = color.match(/\d+/g);
                if (rgb) {
                    const hex = '#' + rgb.slice(0, 3).map(x => {
                        const hex = parseInt(x).toString(16);
                        return hex.length === 1 ? '0' + hex : hex;
                    }).join('');
                    colorPreview.style.backgroundColor = hex;
                    color = hex;
                    console.log('updateToolbarState: 轉換RGB為HEX:', hex);
                    console.log('updateToolbarState: 顏色預覽背景色已設置為:', colorPreview.style.backgroundColor);
                }
            } else {
                colorPreview.style.backgroundColor = color;
                console.log('updateToolbarState: 直接設置顏色:', color);
                console.log('updateToolbarState: 顏色預覽背景色已設置為:', colorPreview.style.backgroundColor);
            }
            
            // 更新自訂顏色輸入框
            const customColorInput = document.getElementById('customColor');
            if (customColorInput) {
                customColorInput.value = color;
                console.log('updateToolbarState: 更新顏色輸入框:', color);
                console.log('updateToolbarState: 顏色輸入框當前值:', customColorInput.value);
            }
        } else {
            console.log('updateToolbarState: 沒有找到有效顏色');
        }
    } else {
        console.log('updateToolbarState: 找不到顏色預覽元素');
        // 嘗試查找顏色預覽元素
        const colorPreviewElements = document.querySelectorAll('.color-preview');
        console.log('updateToolbarState: 頁面中的顏色預覽元素數量:', colorPreviewElements.length);
        colorPreviewElements.forEach((el, index) => {
            console.log(`updateToolbarState: 顏色預覽元素 ${index + 1}:`, {
                id: el.id,
                className: el.className,
                tagName: el.tagName,
                isVisible: el.offsetParent !== null
            });
        });
    }
}

// 文字格式化功能
window.formatText = function(command, value = null) {
    const editor = document.getElementById('editor');
    const editorEdit = document.getElementById('editorEdit');
    const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
    
    currentEditor.focus();

    // 保存當前游標範圍
    saveRange();

    // 檢查是否有選中的圖片容器
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (range) {
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) {
            container = container.parentNode;
        } else if (container.nodeName === 'IMG') {
            // 當點選圖片時，從圖片往外找 image-wrapper
            const wrapper = container.closest('.image-wrapper');
            if (wrapper) {
                container = wrapper;
                console.log('檢測到圖片點擊，選擇 image-wrapper 容器');
            }
        }
        
        // 增強圖片包裝器查找邏輯，包括縮放後的圖片
        let imageWrapper = null;
        
        // ✅ [FIX] 優先檢查 .selected 圖片容器，這是最可靠的方法
        const selectedImageContainers = document.querySelectorAll('.image-container.selected');
        if (selectedImageContainers.length > 0) {
            imageWrapper = selectedImageContainers[0].parentElement;
            console.log('formatText: 方法6 (優先) - 從選中的圖片容器找到 image-wrapper');
        }

        if (!imageWrapper) {
            // ✅ 新增方法0：檢查是否為調整大小的控制點
            if (container.classList.contains('resize-handle')) {
                const imageContainer = container.closest('.image-container');
                if (imageContainer) {
                    imageWrapper = imageContainer.parentElement;
                    console.log('formatText: 方法0 - 從 resize-handle 找到 image-wrapper');
                }
            }
            // 方法1：檢查當前容器是否為圖片包裝器
            else if (container.classList.contains('image-wrapper')) {
                imageWrapper = container;
            }
            // 方法2：直接查找最近的圖片包裝器
            else {
                imageWrapper = container.closest('.image-wrapper');
            }
            
            // 方法3：如果沒有找到，檢查是否在圖片容器內
            if (!imageWrapper) {
                const imageContainer = container.closest('.image-container');
                if (imageContainer) {
                    imageWrapper = imageContainer.parentElement;
                }
            }
            
            // 方法4：如果容器本身就是圖片容器
            if (!imageWrapper && container.classList.contains('image-container')) {
                imageWrapper = container.parentElement;
            }
            
            // 方法5：檢查選中的元素是否包含圖片 (這是比較籠統的方法)
            if (!imageWrapper) {
                const selectedImages = container.querySelectorAll('img');
                if (selectedImages.length > 0) {
                    const img = selectedImages[0];
                    const imageContainer = img.closest('.image-container');
                    if (imageContainer) {
                        imageWrapper = imageContainer.parentElement;
                    }
                }
            }
        }
        
        console.log('圖片對齊檢測:', {
            command: command,
            container: container.tagName,
            containerClass: container.className,
            imageWrapper: imageWrapper ? imageWrapper.className : 'null',
            isAlignmentCommand: ['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)
        });
        
        if (imageWrapper && ['justifyLeft', 'justifyCenter', 'justifyRight'].includes(command)) {
            // 移除所有對齊類別
            imageWrapper.classList.remove('align-left', 'align-center', 'align-right');
            
            switch(command) {
                case 'justifyLeft':
                    imageWrapper.classList.add('align-left');
                    console.log('設置圖片靠左對齊');
                    break;
                case 'justifyCenter':
                    imageWrapper.classList.add('align-center');
                    console.log('設置圖片置中對齊');
                    break;
                case 'justifyRight':
                    imageWrapper.classList.add('align-right');
                    console.log('設置圖片靠右對齊');
                    break;
            }
            
            // ✅ [DEBUG] 檢查 .selected 類別狀態
            const selectedBefore = document.querySelectorAll('.image-container.selected').length;
            console.log(`formatText: 對齊設置前，選中的圖片容器數量: ${selectedBefore}`);
            
            // ✅ [FIX] 直接調用 updateToolbarState，不使用防抖版本
            // 這樣可以確保工具列立即更新，並且 .selected 類別不會被清除
            setTimeout(() => {
                const selectedAfter = document.querySelectorAll('.image-container.selected').length;
                console.log(`formatText: 對齊設置後，選中的圖片容器數量: ${selectedAfter}`);
                updateToolbarState();
            }, 0);
            return;
        }
    }

    // 執行格式化命令
    document.execCommand(command, false, value);
    
    // 立即更新工具列狀態
    debouncedUpdateToolbarState();
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
    const editorEdit = document.getElementById('editorEdit');
    const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
    
    if (!currentEditor) {
        console.error('找不到編輯器元素');
        alert('編輯器初始化失敗，請重新載入頁面');
        return;
    }
    
    if (files.length === 0) {
        console.log('沒有選擇文件');
        return;
    }
    
    console.log(`開始處理 ${files.length} 個圖片文件`);
    
    for (const file of files) {
        try {
            console.log('處理文件:', {
                name: file.name,
                type: file.type,
                size: file.size
            });
            
            // 檢查文件類型
            if (!file.type.startsWith('image/')) {
                alert(`文件 "${file.name}" 不是圖片格式，請上傳圖片文件`);
                continue;
            }

            // 檢查文件大小
            if (file.size > MAX_IMAGE_SIZE) {
                console.log(`圖片太大，進行壓縮處理: ${file.name} (${file.size / 1024 / 1024}MB)`);
                const processedImage = await processImage(file);
                if (processedImage) {
                    await insertImageToEditor(processedImage, currentEditor);
                } else {
                    console.error('圖片壓縮失敗:', file.name);
                    alert(`圖片 "${file.name}" 壓縮失敗，請嘗試其他圖片`);
                }
            } else {
                console.log(`圖片大小正常，直接插入: ${file.name}`);
                await insertImageToEditor(file, currentEditor);
            }
        } catch (error) {
            console.error('處理圖片時發生錯誤：', error);
            alert(`處理圖片 "${file.name}" 時發生錯誤：${error.message}`);
        }
    }
    
    // 清除選擇的文件
    e.target.value = '';
    console.log('圖片上傳處理完成');
}

// 收集編輯器中的圖片數據
function collectImageData(editorSelector = '#editor') {
    const editor = document.querySelector(editorSelector);
    const images = editor.querySelectorAll('img');
    const imageData = [];
    const existingPhotoIds = [];
    
    console.log('開始收集圖片數據，編輯器選擇器:', editorSelector);
    console.log('找到圖片數量:', images.length);
    
    // 先保存完整的原始HTML內容（包含圖片）
    const originalHtmlContent = editor.innerHTML;
    
    // 創建一個臨時的容器來處理圖片替換
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = originalHtmlContent;
    
    // 在臨時容器中查找圖片
    const tempImages = tempContainer.querySelectorAll('img');
    console.log('臨時容器中找到圖片數量:', tempImages.length);
    
    tempImages.forEach((img, index) => {
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
            
            // 獲取圖片容器和包裝器
            const imgContainer = img.closest('.image-container');
            const imageWrapper = imgContainer ? imgContainer.closest('.image-wrapper') : null;
            
            // 保存圖片大小信息
            const imageSize = {
                width: img.style.width || (img.naturalWidth ? img.naturalWidth + 'px' : '300px'),
                height: img.style.height || (img.naturalHeight ? img.naturalHeight + 'px' : '200px')
            };
            
            // 如果圖片沒有設置樣式大小，但有自然尺寸，使用自然尺寸
            if (!img.style.width && img.naturalWidth) {
                imageSize.width = img.naturalWidth + 'px';
            }
            if (!img.style.height && img.naturalHeight) {
                imageSize.height = img.naturalHeight + 'px';
            }
            
            // 如果還是沒有尺寸，使用預設值
            if (!imageSize.width || imageSize.width === '0px') {
                imageSize.width = '300px';
            }
            if (!imageSize.height || imageSize.height === '0px') {
                imageSize.height = '200px';
            }
            
            // 保存對齊信息
            let alignment = 'none';
            if (imageWrapper) {
                if (imageWrapper.classList.contains('align-left')) {
                    alignment = 'left';
                } else if (imageWrapper.classList.contains('align-center')) {
                    alignment = 'center';
                } else if (imageWrapper.classList.contains('align-right')) {
                    alignment = 'right';
                }
            }
            
            imageData.push({
                fileName: fileName,
                contentType: contentType,
                imageData: Array.from(bytes),
                size: imageSize,
                alignment: alignment
            });
            
            // 在臨時容器中替換圖片容器為佔位符
            if (imgContainer) {
                const placeholder = `[NEW_IMAGE_PLACEHOLDER_${index}]`;
                const placeholderNode = document.createTextNode(placeholder);
                imgContainer.parentNode.replaceChild(placeholderNode, imgContainer);
                console.log(`替換新圖片容器為佔位符: ${placeholder}`);
            } else {
                // 如果沒有找到容器，檢查是否有 image-wrapper
                const imageWrapper = img.closest('.image-wrapper');
                if (imageWrapper) {
                    // 保留 image-wrapper 的對齊類別，只替換內容
                    const placeholder = `[NEW_IMAGE_PLACEHOLDER_${index}]`;
                    const placeholderNode = document.createTextNode(placeholder);
                    imageWrapper.innerHTML = '';
                    imageWrapper.appendChild(placeholderNode);
                    console.log(`替換新圖片為佔位符（保留對齊結構）: ${placeholder}`);
                } else {
                    // 如果沒有找到容器，直接替換圖片
                    const placeholder = `[NEW_IMAGE_PLACEHOLDER_${index}]`;
                    const placeholderNode = document.createTextNode(placeholder);
                    img.parentNode.replaceChild(placeholderNode, img);
                    console.log(`替換新圖片為佔位符: ${placeholder}`);
                }
            }
        }
        // 如果圖片是從資料庫載入的（有blob URL）
        else if (img.src && img.src.startsWith('blob:')) {
            // 從圖片的data屬性獲取圖片ID
            const photoId = img.getAttribute('data-photo-id');
            if (photoId) {
                console.log(`圖片 ${index + 1} 是已載入的圖片，ID: ${photoId}`);
                
                // 獲取圖片容器和包裝器
                const imgContainer = img.closest('.image-container');
                const imageWrapper = imgContainer ? imgContainer.closest('.image-wrapper') : null;
                
                // 保存對齊信息
                let alignment = 'none';
                if (imageWrapper) {
                    if (imageWrapper.classList.contains('align-left')) {
                        alignment = 'left';
                    } else if (imageWrapper.classList.contains('align-center')) {
                        alignment = 'center';
                    } else if (imageWrapper.classList.contains('align-right')) {
                        alignment = 'right';
                    }
                }
                
                // 保存圖片大小信息
                const imageSize = {
                    width: img.style.width || (img.naturalWidth ? img.naturalWidth + 'px' : '300px'),
                    height: img.style.height || (img.naturalHeight ? img.naturalHeight + 'px' : '200px')
                };
                
                // 如果圖片沒有設置樣式大小，但有自然尺寸，使用自然尺寸
                if (!img.style.width && img.naturalWidth) {
                    imageSize.width = img.naturalWidth + 'px';
                }
                if (!img.style.height && img.naturalHeight) {
                    imageSize.height = img.naturalHeight + 'px';
                }
                
                // 如果還是沒有尺寸，使用預設值
                if (!imageSize.width || imageSize.width === '0px') {
                    imageSize.width = '300px';
                }
                if (!imageSize.height || imageSize.height === '0px') {
                    imageSize.height = '200px';
                }
                
                // 將圖片信息添加到現有圖片ID中
                existingPhotoIds.push(photoId); // 只保存圖片ID，不保存額外信息
                
                // 保存圖片的大小和對齊信息到全局變數，供後端使用
                if (!window.existingImageInfo) {
                    window.existingImageInfo = {};
                }
                window.existingImageInfo[photoId] = {
                    size: imageSize,
                    alignment: alignment
                };
                
                console.log(`圖片 ${index + 1} 大小信息:`, {
                    photoId: photoId,
                    styleWidth: img.style.width,
                    styleHeight: img.style.height,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    finalWidth: imageSize.width,
                    finalHeight: imageSize.height,
                    alignment: alignment
                });
                
                // 在臨時容器中替換圖片容器為佔位符
                if (imgContainer) {
                    const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                    const placeholderNode = document.createTextNode(placeholder);
                    imgContainer.parentNode.replaceChild(placeholderNode, imgContainer);
                    console.log(`替換已存在圖片容器為佔位符: ${placeholder}`);
                } else {
                    // 如果沒有找到容器，檢查是否有 image-wrapper
                    const imageWrapper = img.closest('.image-wrapper');
                    if (imageWrapper) {
                        // 保留 image-wrapper 的對齊類別，只替換內容
                        const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                        const placeholderNode = document.createTextNode(placeholder);
                        imageWrapper.innerHTML = '';
                        imageWrapper.appendChild(placeholderNode);
                        console.log(`替換已存在圖片為佔位符（保留對齊結構）: ${placeholder}`);
                    } else {
                        // 如果沒有找到容器，直接替換圖片
                        const placeholder = `[IMAGE_PLACEHOLDER_${photoId}]`;
                        const placeholderNode = document.createTextNode(placeholder);
                        img.parentNode.replaceChild(placeholderNode, img);
                        console.log(`替換已存在圖片為佔位符: ${placeholder}`);
                    }
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
    if (tempImages.length === 0) {
        console.log('沒有找到圖片，檢查內容中是否有佔位符');
        const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
        const tempHtml = tempContainer.innerHTML;
        let match;
        while ((match = placeholderRegex.exec(tempHtml)) !== null) {
            const photoId = match[1];
            if (!existingPhotoIds.includes(photoId)) {
                existingPhotoIds.push(photoId); // 只保存圖片ID
                console.log(`從佔位符中提取圖片ID: ${photoId}`);
            }
        }
    }
    
    // 處理後的HTML內容（包含佔位符）
    const processedHtmlContent = tempContainer.innerHTML;
    
    // 檢查處理後的內容是否包含文字
    const textContent = tempContainer.textContent || tempContainer.innerText || '';
    const hasTextContent = textContent.trim().length > 0;
    
    console.log('收集到的圖片數據:', {
        newImages: imageData.length,
        existingPhotoIds: existingPhotoIds,
        originalHtmlLength: originalHtmlContent.length,
        processedHtmlLength: processedHtmlContent.length,
        hasTextContent: hasTextContent,
        textContentLength: textContent.length,
        originalHtmlPreview: originalHtmlContent.substring(0, 200) + '...',
        processedHtmlPreview: processedHtmlContent.substring(0, 200) + '...'
    });
    
    // 如果處理後的內容沒有文字，但有原始內容，則使用原始內容
    if (!hasTextContent && originalHtmlContent.trim().length > 0) {
        console.warn('處理後的內容沒有文字，使用原始HTML內容');
        return {
            newImages: imageData,
            existingPhotoIds: existingPhotoIds,
            existingImageInfo: window.existingImageInfo || {},
            processedHtmlContent: originalHtmlContent, // 使用原始內容
            originalHtmlContent: originalHtmlContent
        };
    }
    
    return {
        newImages: imageData,
        existingPhotoIds: existingPhotoIds,
        existingImageInfo: window.existingImageInfo || {},
        processedHtmlContent: processedHtmlContent, // 返回包含佔位符的HTML
        originalHtmlContent: originalHtmlContent    // 也返回原始HTML作為備用
    };
}

// 處理圖片（壓縮/調整大小）
function processImage(file) {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('無效的圖片文件'));
            return;
        }
        
        console.log('開始壓縮圖片:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const img = new Image();
        
        img.onload = function() {
            try {
                console.log('圖片載入成功，原始尺寸:', {
                    width: img.width,
                    height: img.height
                });
                
                // 計算新的尺寸
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_IMAGE_WIDTH) {
                    height = (MAX_IMAGE_WIDTH * height) / width;
                    width = MAX_IMAGE_WIDTH;
                    console.log('調整圖片尺寸:', { width, height });
                }

                // 創建 canvas 進行壓縮
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('無法創建 Canvas 上下文'));
                    return;
                }
                
                ctx.drawImage(img, 0, 0, width, height);
                
                // 轉換為 Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log('圖片壓縮成功:', {
                                originalSize: file.size,
                                compressedSize: blob.size,
                                compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1) + '%'
                            });
                            resolve(blob);
                        } else {
                            reject(new Error('圖片壓縮失敗'));
                        }
                    },
                    'image/jpeg',
                    IMAGE_QUALITY
                );
            } catch (error) {
                console.error('圖片處理過程中發生錯誤:', error);
                reject(error);
            }
        };
        
        img.onerror = function() {
            console.error('圖片載入失敗:', file.name);
            reject(new Error('圖片載入失敗'));
        };
        
        // 設置圖片來源
        img.src = URL.createObjectURL(file);
    });
}

// 將圖片插入編輯器
function insertImageToEditor(imageFile, editor) {
    return new Promise((resolve, reject) => {
        if (!imageFile || !editor) {
            reject(new Error('無效的參數'));
            return;
        }
        
        console.log('開始插入圖片到編輯器');
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const selection = window.getSelection();
                
                // ✅ 修正問題一：直接使用 restoreRange() 回傳的範圍物件
                let range = restoreRange() || (selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null);
                
                // ✅ 修正問題二：檢查游標是否在編輯器內或位於圖片容器中
                const editorContainsRange = range && editor.contains(range.commonAncestorContainer);
                const insideImage = range && range.commonAncestorContainer.closest?.('.image-container, .image-wrapper');
                
                if (!editorContainsRange || insideImage) {
                    console.warn('游標不在編輯器內或位於圖片容器中，強制將游標移動至編輯器末尾');
                    range = document.createRange();
                    range.selectNodeContents(editor);
                    range.collapse(false); // 尾端
                    selection.removeAllRanges();
                    selection.addRange(range);
                }

                // 創建圖片容器結構
                const wrapper = document.createElement('div');
                wrapper.className = 'image-wrapper'; // 移除預設對齊類別
                
                const container = document.createElement('div');
                container.className = 'image-container';
                container.style.position = 'relative'; // ✅ 新增：確保容器有相對定位
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.draggable = false;
                
                // 添加調整大小的控制點
                const handles = ['nw', 'ne', 'sw', 'se'].map(pos => {
                    const handle = document.createElement('div');
                    handle.className = `resize-handle resize-handle-${pos}`;
                    handle.contentEditable = false; // ✅ 新增：防止在控制點中輸入文字
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
                
                // 直接將容器添加到包裝器中，不添加換行符
                wrapper.appendChild(container);

                // 插入圖片到游標位置
                if (range) {
                    range.insertNode(wrapper);

                    // ✅ [FIX] Un-nest the image from any containing <p> tag.
                    // This ensures the DOM structure is clean and predictable.
                    if (wrapper.parentNode.nodeName === 'P') {
                        const p = wrapper.parentNode;
                        p.parentNode.insertBefore(wrapper, p.nextSibling);

                        // If the <p> is now empty (or only has whitespace), remove it.
                        if (p.textContent.trim() === '') {
                            p.remove();
                        }
                    }

                    // ✅ [FIX] 創建一個新段落來放置游標，確保游標在可編輯的文字區域
                    const newParagraph = document.createElement('p');
                    newParagraph.innerHTML = '&#8203;'; // 零寬空白字元，確保游標可以定位
                    
                    // 將新段落插入到圖片後面
                    wrapper.parentNode.insertBefore(newParagraph, wrapper.nextSibling);
                    
                    // 將游標移動到新段落中
                    const newRange = document.createRange();
                    newRange.setStart(newParagraph, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    
                    console.log('✅ 圖片插入後，游標已移動到新段落中');
                } else {
                    // 如果沒有選取範圍，在編輯器末尾添加圖片
                    // ✅ [FIX] 改進游標處理，避免游標被困在換行符之間
                    const newParagraph = document.createElement('p');
                    newParagraph.innerHTML = '&#8203;'; // 零寬空白字元，確保游標可以定位
                    
                    editor.appendChild(wrapper);
                    editor.appendChild(newParagraph);
                    
                    // 將游標移動到新段落中
                    const newRange = document.createRange();
                    newRange.setStart(newParagraph, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                
                // 強制聚焦編輯器
                editor.focus();
                
                // 立即初始化圖片縮放功能
                try {
                    initializeImageResize(container, img, resizeInfo, handles);
                    console.log('成功初始化圖片縮放功能');
                } catch (error) {
                    console.warn('圖片縮放功能初始化失敗:', error);
                }
                
                resolve();
            } catch (error) {
                console.error('插入圖片時發生錯誤:', error);
                reject(error);
            }
        };
        
        reader.onerror = function() {
            console.error('讀取圖片文件失敗');
            reject(new Error('讀取圖片文件失敗'));
        };
        
        reader.readAsDataURL(imageFile);
    });
}

// 初始化圖片縮放功能
function initializeImageResize(container, img, resizeInfo, handles) {
    if (!container || !img || !resizeInfo || !handles || handles.length === 0) {
        console.warn('初始化圖片縮放功能失敗：缺少必要參數', {
            container: !!container,
            img: !!img,
            resizeInfo: !!resizeInfo,
            handles: handles?.length
        });
        return;
    }

    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startWidth, startHeight;
    let savedAlignment = null; // 保存對齊信息

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

        // 保存當前的對齊信息
        if (container.closest('.image-wrapper')) {
            if (container.closest('.image-wrapper').classList.contains('align-left')) {
                savedAlignment = 'align-left';
            } else if (container.closest('.image-wrapper').classList.contains('align-center')) {
                savedAlignment = 'align-center';
            } else if (container.closest('.image-wrapper').classList.contains('align-right')) {
                savedAlignment = 'align-right';
            } else {
                savedAlignment = null;
            }
            console.log('保存對齊信息:', savedAlignment);
        }

        // 記錄初始值
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth || img.naturalWidth || 300;
        startHeight = img.offsetHeight || img.naturalHeight || 200;
        
        console.log('開始調整圖片大小:', {
            startX, startY, startWidth, startHeight,
            handle: handle.className,
            savedAlignment: savedAlignment
        });
        
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

        // 確保對齊信息不丟失
        const imageWrapper = container.closest('.image-wrapper');
        if (imageWrapper && savedAlignment) {
            // 移除所有對齊類別
            imageWrapper.classList.remove('align-left', 'align-center', 'align-right');
            // 恢復保存的對齊類別
            imageWrapper.classList.add(savedAlignment);
        }

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
        
        // 確保對齊信息最終保存
        const imageWrapper = container.closest('.image-wrapper');
        if (imageWrapper && savedAlignment) {
            imageWrapper.classList.remove('align-left', 'align-center', 'align-right');
            imageWrapper.classList.add(savedAlignment);
            console.log('恢復對齊信息:', savedAlignment);
        }
        
        console.log('停止調整圖片大小，對齊信息已保存');
        
        // 隱藏大小資訊
        setTimeout(() => {
            if (resizeInfo) {
                resizeInfo.style.display = 'none';
            }
        }, 1500);
        
        // 更新工具列狀態以反映當前的對齊狀態
        debouncedUpdateToolbarState();
    }

    function updateResizeInfo(width, height) {
        if (resizeInfo) {
            resizeInfo.textContent = `${Math.round(width)} × ${Math.round(height)} px`;
            resizeInfo.style.display = 'block';
        }
    }

    console.log('圖片縮放功能初始化成功');
}

// 創建圖片操作按鈕
// function createImageButton(text, onClick) {
//     const button = document.createElement('button');
//     button.textContent = text;
//     button.onclick = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         onClick();
//     };
//     return button;
// }

// 包裝選中的文字
// function wrapSelectedText(element) {
//     const selection = window.getSelection();
//     if (!selection.rangeCount) return;

//     const range = selection.getRangeAt(0);
//     const content = range.extractContents();
//     element.appendChild(content);
//     range.insertNode(element);
// }

// 初始化星級評分
// function initRating() {
//     const starsContainers = document.querySelectorAll('.stars');
//     if (!starsContainers.length) return;

//     starsContainers.forEach(container => {
//         const stars = container.querySelectorAll('i');
//         stars.forEach(star => {
//             star.addEventListener('click', function() {
//                 const rating = this.getAttribute('data-rating');
//                 updateStars(container, rating);
//             });

//             star.addEventListener('mouseover', function() {
//                 const rating = this.getAttribute('data-rating');
//                 highlightStars(container, rating);
//             });
//         });

//         container.addEventListener('mouseleave', function() {
//             const selectedRating = this.getAttribute('data-selected-rating') || 0;
//             updateStars(container, selectedRating);
//         });
//     });
// }

// 更新星星顯示
// function updateStars(starsContainer, rating) {
//     if (typeof starsContainer === 'string') {
//         rating = starsContainer;
//         starsContainer = document.querySelector('.stars');
//     }
    
//     const stars = starsContainer.querySelectorAll('i');
//     stars.forEach((star, index) => {
//         star.classList.toggle('active', index < rating);
//     });
    
//     // 更新評分數值顯示
//     const ratingValueElement = starsContainer.closest('.stars-container')?.querySelector('.rating-value');
//     if (ratingValueElement) {
//         ratingValueElement.textContent = rating + '.0';
//     }
    
//     starsContainer.setAttribute('data-selected-rating', rating);
    
//     // 更新總評分
//     updateOverallRating();
// }

// 高亮星星
// function highlightStars(starsContainer, rating) {
//     if (typeof starsContainer === 'string') {
//         rating = starsContainer;
//         starsContainer = document.querySelector('.stars');
//     }
    
//     const stars = starsContainer.querySelectorAll('i');
//     stars.forEach((star, index) => {
//         star.classList.toggle('active', index < rating);
//     });
// }

// 載入用戶數據
function loadUserData() {
    // 從 localStorage 獲取 login.js 儲存的用戶數據
    const userData = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userData) {
        console.log('用戶未登入或無用戶數據');
        return;
    }
    
    // 設置全域用戶ID
    currentUserId = userData.id;
    console.log('載入用戶數據:', userData);
    
    // 更新用戶資訊
    const userNameElement = document.getElementById('userName');
    const avatarImg = document.getElementById('userAvatar');
    document.getElementById('userBio').textContent = "熱愛美食的探索家:" + currentUserId;
    
    if (userNameElement) {
        userNameElement.textContent = userData.username || userData.fullName || userData.email || '美食探索家';
    }

    // 處理頭像載入
    if (avatarImg) {
        // 先設置預設頭像
        avatarImg.src = 'images/pig.jpg';
        
        // 從用戶數據中獲取頭像URL
        const avatarUrl = userData.image_url || userData.avatar_url;
        
        if (avatarUrl) {
            // 創建新的圖片物件來預載入用戶頭像
            const img = new Image();
            img.onload = function() {
                avatarImg.src = avatarUrl;
                console.log('用戶頭像載入成功:', avatarUrl);
            };
            img.onerror = function() {
                // 如果載入失敗，保持預設頭像
                console.log('頭像載入失敗，使用預設頭像');
            };
            img.src = avatarUrl;
        } else {
            console.log('用戶無頭像URL，使用預設頭像');
        }
    }
}

// 載入文章列表
// function loadPosts() {
//     // 這裡應該從後端 API 獲取文章列表
//     // 目前使用模擬數據
//     const posts = [
//         {
//             id: 1,
//             title: '台北最佳日式料理推薦',
//             status: 'published',
//             date: '2024-03-15',
//             views: 156,
//             likes: 23
//         },
//         {
//             id: 2,
//             title: '隱藏版美食小店分享',
//             status: 'draft',
//             date: '2024-03-14',
//             views: 0,
//             likes: 0
//         }
//     ];

//     // 更新已發布文章列表
//     const publishedList = document.getElementById('publishedList');
//     const draftsList = document.getElementById('draftsList');

//     if (publishedList && draftsList) {
//         posts.forEach(post => {
//             const postElement = createPostElement(post);
//             if (post.status === 'published') {
//                 publishedList.appendChild(postElement);
//             } else {
//                 draftsList.appendChild(postElement);
//             }
//         });
//     }
// }

// 創建文章元素
// function createPostElement(post) {
//     const div = document.createElement('div');
//     div.className = 'post-card';
//     div.innerHTML = `
//         <h3>${post.title}</h3>
//         <p>發布日期：${post.date}</p>
//         <p>觀看次數：${post.views} | 讚數：${post.likes}</p>
//         <div class="button-group">
//             <button onclick="editPost(${post.id})" class="btn-save-draft">編輯</button>
//             ${post.status === 'draft' ? 
//                 `<button onclick="publishPost(${post.id})" class="btn-publish">發布</button>` :
//                 `<button onclick="deletePost(${post.id})" class="btn-save-draft">刪除</button>`
//             }
//         </div>
//     `;
//     return div;
// }

// 初始化統計圖表
async function initStatsChart() {
    try {
        // 從後端API獲取用戶統計數據
        const response = await fetch(`http://localhost:8080/api/reviews/user/${currentUserId}/overview`); // 暫時使用固定用戶ID
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
        const response = await fetch(`http://localhost:8080/api/reviews/user/${currentUserId}/stats`); // 暫時使用固定用戶ID
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
        const response = await fetch(`http://localhost:8080/api/reviews/user/${currentUserId}/stats`); // 暫時使用固定用戶ID
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
    const ratings = collectRatings('#write-section');
    if (Object.values(ratings).every(rating => rating === '0')) {
        alert('請至少給出一個評分項目');
        return;
    }

    // 準備發布數據
    const imageData = collectImageData();
    const postData = {
        userId: currentUserId, // 使用當前登入用戶ID
        restaurantId: currentRestaurantId || 1, // 使用當前餐廳ID或預設值
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
        existingImageInfo: imageData.existingImageInfo, // 已存在圖片的大小和對齊信息
        tags: document.getElementById('tags').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
    };

    try {
        // 使用包含佔位符的HTML內容，這樣後端可以正確處理圖片
        postData.content_json = imageData.processedHtmlContent || content;
        
        console.log('發布文章使用的HTML內容（包含佔位符）:', postData.content_json);
        
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
        userId: window.currentEditingDraft?.userId || window.currentEditingPost?.userId || currentUserId,
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
        existingImageInfo: imageData.existingImageInfo,
        tags: document.getElementById('tagsEdit').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
    };

    try {
        // 使用包含佔位符的HTML內容，這樣後端可以正確處理圖片
        postData.content_json = imageData.processedHtmlContent || content;
        
        console.log('編輯文章使用的HTML內容（包含佔位符）:', postData.content_json);
        
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
// document.getElementById('blogPostForm')?.addEventListener('submit', function(e) {
//     const ratings = {
//         environment: document.querySelector('.stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0',
//         service: document.querySelector('.stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0',
//         taste: document.querySelector('.stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0',
//         price: document.querySelector('.stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0',
//         overall: document.querySelector('.overall-rating .rating-value')?.textContent || '0.0'
//     };
    
//     ('Ratings:', ratings);
// });

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
                userId: currentUserId, // 使用當前登入用戶ID
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
                existingImageInfo: imageData.existingImageInfo, // 已存在圖片的大小和對齊信息
                tags: document.getElementById('tags').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
            };

            console.log('儲存草稿資料', {
                title: postData.title,
                contentLength: postData.content_json.length,
                newImages: postData.photoData.length,
                existingPhotos: postData.photos.length,
                hasPlaceholders: postData.content_json.includes('[IMAGE_PLACEHOLDER_') || postData.content_json.includes('[NEW_IMAGE_PLACEHOLDER_')
            });
            
            // 驗證必填項目
            if (!postData.content_json) {
                alert('請至少填寫評論內容');
                return;
            }

            try {
                // 使用包含佔位符的HTML內容，這樣後端可以正確處理圖片
                console.log('儲存草稿的HTML內容（包含佔位符）:', postData.content_json);
                
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
// function cleanHtmlContent(htmlContent) {
//     if (!htmlContent) return '';
    
//     try {
//         console.log('原始HTML內容長度:', htmlContent.length);
//         console.log('原始HTML內容:', htmlContent);
        
//         // 創建一個臨時的div元素來處理HTML
//         const tempDiv = document.createElement('div');
//         tempDiv.innerHTML = htmlContent;
        
//         // 移除可能導致問題的零寬字符
//         const textContent = tempDiv.textContent || tempDiv.innerText || '';
//         const cleanedText = textContent.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
//         // 如果清理後沒有內容，返回原始HTML
//         if (!cleanedText.trim()) {
//             console.log('清理後沒有文字內容，返回原始HTML');
//             return htmlContent;
//         }
        
//         // 更溫和的HTML清理，保留文字格式
//         let cleanedHtml = htmlContent
//             // 移除零寬字符
//             .replace(/[\u200B-\u200D\uFEFF]/g, '')
//             // 移除可能的控制字符（但保留換行符和製表符）
//             .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
//             // 移除多餘的連續空格（但保留單個空格）
//             .replace(/[ ]{2,}/g, ' ')
//             .trim();
        
//         // 檢查是否有有效的HTML結構
//         const testDiv = document.createElement('div');
//         testDiv.innerHTML = cleanedHtml;
        
//         // 如果HTML結構有問題，嘗試修復
//         if (testDiv.innerHTML !== cleanedHtml) {
//             console.log('HTML結構有問題，嘗試修復...');
//             cleanedHtml = testDiv.innerHTML;
//         }
        
//         console.log('清理後HTML內容長度:', cleanedHtml.length);
//         console.log('清理後HTML內容:', cleanedHtml);
        
//         return cleanedHtml;
//     } catch (error) {
//         console.error('清理HTML內容時發生錯誤：', error);
//         // 如果清理失敗，返回原始內容
//         return htmlContent;
//     }
// }

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
        const response = await fetch(`http://localhost:8080/api/reviews/drafts/${currentUserId}`); // 使用currentUserId變數
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
        
        console.log('載入草稿詳情:', {
            id: draft.id,
            title: draft.title,
            contentLength: draft.content_json?.length || 0,
            photosCount: draft.photos?.length || 0,
            hasContent: !!draft.content_json,
            contentPreview: draft.content_json?.substring(0, 100) + '...'
        });
        
        // 切換到編輯頁面
        showSectionWrapper('edit');
        
        // 填充表單
        document.getElementById('postTitleEdit').value = draft.title;
        document.getElementById('tagsEdit').value = draft.tags.join(', ');
        
        // 設置餐廳名稱（如果有）
        const restaurantNameEdit = document.getElementById('restaurantNameEdit');
        if (restaurantNameEdit) {
            restaurantNameEdit.value = draft.restaurantName || `餐廳ID: ${draft.restaurantId}`;
        }
        
        // 先清空編輯器內容
        document.getElementById('editorEdit').innerHTML = '';
        
        // 載入內容到編輯器
        if (draft.content_json) {
            console.log('載入草稿HTML內容到編輯器');
            
            // 檢查內容是否包含佔位符
            const hasPlaceholders = draft.content_json.includes('[IMAGE_PLACEHOLDER_') || 
                                  draft.content_json.includes('[NEW_IMAGE_PLACEHOLDER_');
            
            console.log('內容分析:', {
                hasPlaceholders: hasPlaceholders,
                contentLength: draft.content_json.length,
                placeholderCount: (draft.content_json.match(/\[IMAGE_PLACEHOLDER_\d+\]/g) || []).length +
                                (draft.content_json.match(/\[NEW_IMAGE_PLACEHOLDER_\d+\]/g) || []).length
            });
            
            // 如果有圖片且內容包含佔位符，先載入HTML內容，然後載入圖片替換佔位符
            if (draft.photos && draft.photos.length > 0 && hasPlaceholders) {
                console.log('檢測到圖片和佔位符，先載入HTML內容再載入圖片');
                document.getElementById('editorEdit').innerHTML = draft.content_json;
                await loadImagesToEditor(draft.photos, '#editorEdit');
            } else if (draft.photos && draft.photos.length > 0 && !hasPlaceholders) {
                console.log('檢測到圖片但沒有佔位符，先載入HTML內容再在末尾添加圖片');
                document.getElementById('editorEdit').innerHTML = draft.content_json;
                await loadImagesToEditor(draft.photos, '#editorEdit');
            } else {
                console.log('沒有圖片或佔位符，直接使用HTML內容');
                document.getElementById('editorEdit').innerHTML = draft.content_json;
            }
        } else {
            console.log('草稿沒有內容，清空編輯器');
            document.getElementById('editorEdit').innerHTML = '';
            
            // 如果沒有內容但有圖片，直接載入圖片
            if (draft.photos && draft.photos.length > 0) {
                console.log('草稿沒有內容但有圖片，直接載入圖片');
                await loadImagesToEditor(draft.photos, '#editorEdit');
            }
        }
        
        // 設置評分
        if (draft.ratings) {
            console.log('設置評分:', draft.ratings);
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
        
        console.log('草稿載入完成，編輯器內容長度:', document.getElementById('editorEdit').innerHTML.length);
        
        // 初始化編輯器功能（確保圖片縮放功能正常工作）
        const editorEdit = document.getElementById('editorEdit');
        if (editorEdit) {
            // 設置編輯器預設字體大小
            editorEdit.style.fontSize = `${currentFontSize}px`;
            
            // 初始化時為編輯器添加零寬空白字元（如果編輯器為空）
            if (editorEdit.innerHTML === '' || editorEdit.innerHTML === '<br>') {
                editorEdit.innerHTML = '\u200B';
                console.log('初始化編輯器：添加零寬空白字元');
            }
        }
        
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
                    existingImageInfo: imageData.existingImageInfo,
                    tags: document.getElementById('tagsEdit').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
                };

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    console.log('準備更新草稿，發送數據:', {
                        draftId: draftId,
                        postData: {
                            userId: postData.userId,
                            restaurantId: postData.restaurantId,
                            title: postData.title,
                            contentLength: postData.content_json.length,
                            status: postData.status,
                            ratings: postData.ratings,
                            newImagesCount: postData.photoData.length,
                            existingPhotosCount: postData.photos.length,
                            existingImageInfoCount: postData.existingImageInfo ? Object.keys(postData.existingImageInfo).length : 0,
                            tags: postData.tags
                        }
                    });
                    
                    const response = await fetch(`http://localhost:8080/api/reviews/drafts/${draftId}`, {
                        method: 'PUT',
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
                        console.error('發送的數據:', JSON.stringify(postData, null, 2));
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
                    existingImageInfo: imageData.existingImageInfo,
                    tags: document.getElementById('tagsEdit').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
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
    if (!editor || !photoUrls || photoUrls.length === 0) {
        console.log('載入圖片到編輯器：參數無效', { editor: !!editor, photoUrls: photoUrls?.length });
        return;
    }
    
    console.log(`=== 開始載入圖片到編輯器 ===`);
    console.log(`編輯器選擇器: ${editorSelector}`);
    console.log(`圖片數量: ${photoUrls.length}`);
    console.log(`圖片URL列表:`, photoUrls);
    console.log(`編輯器初始內容長度: ${editor.innerHTML.length}`);
    console.log(`編輯器初始內容預覽: ${editor.innerHTML.substring(0, 200)}...`);
    
    // 檢查編輯器是否已經有內容
    const hasContent = editor.innerHTML.trim().length > 0;
    console.log('編輯器現有內容長度:', editor.innerHTML.length);
    
    // 創建一個臨時的容器來處理圖片載入
    const tempContainer = document.createElement('div');
    
    // 預提取所有對齊資訊，建立圖片ID對齊映射
    const alignmentMap = {};
    const sizeMap = {}; // ✅ [NEW] 新增：預提取圖片大小資訊
    const idMapping = {}; // ✅ [NEW] 新增：舊ID到新ID的映射關係
    if (hasContent) {
        tempContainer.innerHTML = editor.innerHTML;
        try {
            // 從HTML內容中解析對齊信息
            const htmlContent = tempContainer.innerHTML;
            console.log('解析HTML內容中的對齊和大小信息...');
            
            // 查找所有圖片佔位符及其對齊信息
            const placeholderRegex = /\[(?:IMAGE_PLACEHOLDER|NEW_IMAGE_PLACEHOLDER)_(\d+)\]/g;
            let match;
            let placeholderIndex = 0;
            
            while ((match = placeholderRegex.exec(htmlContent)) !== null) {
                const oldImageId = match[1];
                const placeholderStart = match.index;
                
                // 在佔位符前後查找對齊信息
                const beforePlaceholder = htmlContent.substring(Math.max(0, placeholderStart - 200), placeholderStart);
                const afterPlaceholder = htmlContent.substring(placeholderStart + match[0].length, Math.min(htmlContent.length, placeholderStart + match[0].length + 200));
                
                console.log(`=== 分析圖片 ${oldImageId} 的對齊和大小信息 ===`);
                console.log(`佔位符: ${match[0]}`);
                console.log(`佔位符前200字符: ${beforePlaceholder}`);
                console.log(`佔位符後200字符: ${afterPlaceholder}`);
                
                // 查找對齊類別 - 找到最接近佔位符的對齊信息
                let alignment = 'none';
                
                // 從後往前查找，找到最接近佔位符的對齊信息
                const alignLeftMatches = [...beforePlaceholder.matchAll(/align-left/g)];
                const alignCenterMatches = [...beforePlaceholder.matchAll(/align-center/g)];
                const alignRightMatches = [...beforePlaceholder.matchAll(/align-right/g)];
                
                console.log(`對齊匹配結果:`, {
                    left: alignLeftMatches.length,
                    center: alignCenterMatches.length,
                    right: alignRightMatches.length
                });
                
                // 找到最接近佔位符的對齊信息
                let closestAlignment = 'none';
                let closestDistance = Infinity;
                
                // 檢查 left 對齊
                alignLeftMatches.forEach(match => {
                    const distance = beforePlaceholder.length - match.index;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestAlignment = 'left';
                    }
                });
                
                // 檢查 center 對齊
                alignCenterMatches.forEach(match => {
                    const distance = beforePlaceholder.length - match.index;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestAlignment = 'center';
                    }
                });
                
                // 檢查 right 對齊
                alignRightMatches.forEach(match => {
                    const distance = beforePlaceholder.length - match.index;
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestAlignment = 'right';
                    }
                });
                
                if (closestAlignment !== 'none') {
                    alignment = closestAlignment;
                    console.log(`找到圖片 ${oldImageId} 最接近的對齊信息: ${alignment} (距離: ${closestDistance})`);
                } else {
                    console.log(`圖片 ${oldImageId} 未找到對齊信息`);
                }
                
                // ✅ [NEW] 查找圖片大小資訊
                let imageSize = { width: null, height: null };
                
                // 查找 style 屬性中的寬度和高度
                const widthMatch = beforePlaceholder.match(/width:\s*([^;]+)/i);
                const heightMatch = beforePlaceholder.match(/height:\s*([^;]+)/i);
                
                if (widthMatch) {
                    imageSize.width = widthMatch[1].trim();
                    console.log(`找到圖片 ${oldImageId} 的寬度: ${imageSize.width}`);
                }
                
                if (heightMatch) {
                    imageSize.height = heightMatch[1].trim();
                    console.log(`找到圖片 ${oldImageId} 的高度: ${imageSize.height}`);
                }
                
                if (alignment !== 'none') {
                    alignmentMap[oldImageId] = alignment;
                    console.log(`設置圖片 ${oldImageId} 的對齊信息: ${alignment}`);
                }
                
                if (imageSize.width || imageSize.height) {
                    sizeMap[oldImageId] = imageSize;
                    console.log(`設置圖片 ${oldImageId} 的大小信息:`, imageSize);
                }
                
                placeholderIndex++;
            }
            
            console.log('解析到的對齊映射:', alignmentMap);
            console.log('解析到的大小映射:', sizeMap);
            
            // ✅ [NEW] 建立舊ID到新ID的映射關係
            // 按順序將舊ID映射到新ID
            const oldIds = Object.keys(alignmentMap).map(id => parseInt(id)).sort((a, b) => a - b);
            const newIds = photoUrls.map(url => parseInt(url)).filter(id => !isNaN(id)).sort((a, b) => a - b);
            
            console.log('舊ID列表:', oldIds);
            console.log('新ID列表:', newIds);
            
            // 建立映射關係（按順序一一對應）
            const minLength = Math.min(oldIds.length, newIds.length);
            for (let i = 0; i < minLength; i++) {
                idMapping[newIds[i]] = oldIds[i];
                console.log(`建立ID映射: ${newIds[i]} -> ${oldIds[i]}`);
            }
            
            console.log('ID映射關係:', idMapping);
        } catch (error) {
            console.warn('預提取對齊和大小資訊失敗:', error);
        }
    }
    
    // 如果編輯器有內容，先檢查是否包含圖片佔位符
    if (hasContent) {
        tempContainer.innerHTML = editor.innerHTML;
        
        // 檢查是否已經有圖片佔位符
        const hasPlaceholders = photoUrls.some(photoUrl => {
            const imageId = parseInt(photoUrl);
            if (!isNaN(imageId)) {
                // 嘗試多種佔位符格式
                const placeholderFormats = [
                    `[IMAGE_PLACEHOLDER_${imageId}]`,
                    `[NEW_IMAGE_PLACEHOLDER_${imageId}]`,
                    `[IMAGE_PLACEHOLDER_${imageId - 1}]`, // 嘗試前一個ID
                    `[IMAGE_PLACEHOLDER_${imageId - 2}]`, // 嘗試前兩個ID
                    `[NEW_IMAGE_PLACEHOLDER_${imageId - 1}]`,
                    `[NEW_IMAGE_PLACEHOLDER_${imageId - 2}]`
                ];
                
                return placeholderFormats.some(format => 
                    tempContainer.innerHTML.includes(format)
                );
            }
            return false;
        });
        
        // 如果沒有找到精確匹配，檢查是否有任何佔位符格式
        let hasAnyPlaceholders = hasPlaceholders;
        if (!hasAnyPlaceholders) {
            const anyPlaceholderRegex = /\[(?:IMAGE_PLACEHOLDER|NEW_IMAGE_PLACEHOLDER)_\d+\]/g;
            const placeholders = tempContainer.innerHTML.match(anyPlaceholderRegex);
            if (placeholders && placeholders.length > 0) {
                console.log('檢測到佔位符但不匹配圖片ID，將按順序處理:', placeholders);
                hasAnyPlaceholders = true;
            }
        }
        
        if (hasAnyPlaceholders) {
            console.log('檢測到圖片佔位符，將進行替換');
        } else {
            console.log('沒有檢測到圖片佔位符，將在內容末尾添加圖片');
        }
    } else {
        console.log('編輯器為空，將直接添加圖片');
    }
    
    let successCount = 0;
    let failCount = 0;
    let skippedCount = 0;
    
    // 詳細記錄每個圖片的處理狀態
    const imageStatus = [];
    
    // 改進的佔位符替換邏輯
    const processedPlaceholders = new Set(); // 記錄已處理的佔位符
    
    for (let i = 0; i < photoUrls.length; i++) {
        try {
            const photoUrl = photoUrls[i];
            console.log(`處理圖片 ${i + 1}/${photoUrls.length}:`, photoUrl);
            
            // 如果URL是圖片ID，則從後端獲取圖片
            if (photoUrl && !photoUrl.startsWith('data:') && !photoUrl.startsWith('http')) {
                const imageId = parseInt(photoUrl);
                if (!isNaN(imageId)) {
                    console.log(`嘗試載入圖片 ID: ${imageId}`);
                    
                    // 添加重試機制
                    let retryCount = 0;
                    const maxRetries = 3;
                    let imageBlob = null;
                    
                    while (retryCount < maxRetries && !imageBlob) {
                        try {
                            const response = await fetch(`http://localhost:8080/api/reviews/photos/${imageId}`);
                            console.log(`圖片 ${imageId} 請求狀態:`, response.status, response.statusText);
                            
                            if (response.ok) {
                                imageBlob = await response.blob();
                                console.log(`圖片 ${imageId} 載入成功，大小:`, imageBlob.size, 'bytes');
                            } else {
                                console.warn(`圖片 ${imageId} 載入失敗 (嘗試 ${retryCount + 1}/${maxRetries}):`, response.status, response.statusText);
                                retryCount++;
                                if (retryCount < maxRetries) {
                                    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒後重試
                                }
                            }
                        } catch (fetchError) {
                            console.error(`圖片 ${imageId} 請求錯誤 (嘗試 ${retryCount + 1}/${maxRetries}):`, fetchError);
                            retryCount++;
                            if (retryCount < maxRetries) {
                                await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒後重試
                            }
                        }
                    }
                    
                    if (imageBlob) {
                        const imageUrl = URL.createObjectURL(imageBlob);
                        
                        // 創建完整的圖片容器結構
                        const wrapper = document.createElement('div');
                        wrapper.className = 'image-wrapper';
                        
                        const container = document.createElement('div');
                        container.className = 'image-container';
                        container.style.position = 'relative';
                        
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.setAttribute('data-photo-id', imageId.toString());
                        img.style.maxWidth = '100%';
                        img.style.height = 'auto';
                        img.draggable = false;
                        
                        // 立即應用對齊類別（根據ID映射）
                        const oldImageId = idMapping[imageId];
                        const alignment = oldImageId ? (alignmentMap[oldImageId] || 'none') : 'none';
                        if (alignment !== 'none') {
                            wrapper.classList.add(`align-${alignment}`);
                            console.log(`圖片 ${imageId} (原ID: ${oldImageId}) 應用對齊類別:`, `align-${alignment}`);
                        } else {
                            console.log(`圖片 ${imageId} 未找到對齊信息，使用預設對齊`);
                        }
                        
                        // ✅ [NEW] 立即應用HTML解析的大小資訊
                        const htmlSize = oldImageId ? sizeMap[oldImageId] : undefined;
                        if (htmlSize && (htmlSize.width || htmlSize.height)) {
                            if (htmlSize.width) {
                                img.style.width = htmlSize.width;
                                console.log(`圖片 ${imageId} (原ID: ${oldImageId}) 應用HTML解析的寬度:`, htmlSize.width);
                            }
                            if (htmlSize.height) {
                                img.style.height = htmlSize.height;
                                console.log(`圖片 ${imageId} (原ID: ${oldImageId}) 應用HTML解析的高度:`, htmlSize.height);
                            }
                        } else {
                            console.log(`圖片 ${imageId} 未找到HTML解析的大小資訊`);
                        }
                        
                        // 添加圖片載入錯誤處理
                        img.onerror = function() {
                            console.error(`圖片 ${imageId} 顯示失敗:`, img.src);
                            img.style.border = '2px solid red';
                            img.style.backgroundColor = '#f0f0f0';
                            img.alt = `圖片載入失敗 (ID: ${imageId})`;
                        };
                        
                        img.onload = function() {
                            console.log(`圖片 ${imageId} 顯示成功:`, img.naturalWidth, 'x', img.naturalHeight);
                        };
                        
                        // 嘗試從後端獲取圖片大小和對齊信息（作為備用）
                        try {
                            const infoResponse = await fetch(`http://localhost:8080/api/reviews/photos/${imageId}/info`);
                            if (infoResponse.ok) {
                                const photoInfo = await infoResponse.json();
                                console.log(`圖片 ${imageId} 信息:`, photoInfo);
                                
                                // ✅ [FIX] 只有在HTML中沒有大小資訊時才使用後端的大小資訊
                                if (!htmlSize || (!htmlSize.width && !htmlSize.height)) {
                                    // ✅ [DEBUG] 詳細記錄圖片大小處理過程
                                    console.log(`=== 圖片 ${imageId} 大小處理詳情 ===`);
                                    console.log(`後端返回的寬度: "${photoInfo.width}"`);
                                    console.log(`後端返回的高度: "${photoInfo.height}"`);
                                    console.log(`寬度是否有效: ${photoInfo.width && photoInfo.width !== '0px'}`);
                                    console.log(`高度是否有效: ${photoInfo.height && photoInfo.height !== '0px'}`);
                                    console.log(`圖片自然寬度: ${img.naturalWidth}`);
                                    console.log(`圖片自然高度: ${img.naturalHeight}`);
                                    
                                    // 應用圖片大小
                                    if (photoInfo.width && photoInfo.height && 
                                        photoInfo.width !== '0px' && photoInfo.height !== '0px') {
                                        img.style.width = photoInfo.width;
                                        img.style.height = photoInfo.height;
                                        console.log('✅ 成功應用後端圖片大小:', photoInfo.width, photoInfo.height);
                                        console.log('應用後的樣式寬度:', img.style.width);
                                        console.log('應用後的樣式高度:', img.style.height);
                                    } else {
                                        console.log('❌ 後端返回的圖片大小無效，使用備用方案');
                                        // 如果後端返回的大小無效，使用圖片的自然尺寸
                                        if (img.naturalWidth && img.naturalHeight) {
                                            img.style.width = img.naturalWidth + 'px';
                                            img.style.height = img.naturalHeight + 'px';
                                            console.log('✅ 使用圖片自然尺寸:', img.naturalWidth + 'px', img.naturalHeight + 'px');
                                        } else {
                                            // 如果沒有自然尺寸，使用預設值
                                            img.style.width = '300px';
                                            img.style.height = '200px';
                                            console.log('✅ 使用預設圖片尺寸: 300px x 200px');
                                        }
                                    }
                                } else {
                                    console.log(`圖片 ${imageId} 已使用HTML解析的大小資訊，跳過後端大小處理`);
                                }
                                
                                // ✅ [FIX] 優先使用HTML解析的對齊資訊，只有在後端明確提供對齊資訊時才覆蓋
                                if (photoInfo.alignment && photoInfo.alignment !== 'none') {
                                    // 移除現有的對齊類別
                                    wrapper.classList.remove('align-left', 'align-center', 'align-right');
                                    // 應用後端返回的對齊資訊
                                    wrapper.classList.add(`align-${photoInfo.alignment}`);
                                    console.log(`圖片 ${imageId} 应用後端對齊資訊:`, `align-${photoInfo.alignment}`);
                                } else {
                                    // 後端沒有提供對齊資訊，保持HTML解析的對齊資訊
                                    console.log(`圖片 ${imageId} 後端未提供對齊資訊，保持HTML解析的對齊資訊`);
                                }
                            } else {
                                console.warn(`無法獲取圖片 ${imageId} 信息:`, infoResponse.status, infoResponse.statusText);
                                // 如果無法獲取信息，且HTML中沒有大小資訊，使用圖片的自然尺寸
                                if (!htmlSize || (!htmlSize.width && !htmlSize.height)) {
                                    if (img.naturalWidth && img.naturalHeight) {
                                        img.style.width = img.naturalWidth + 'px';
                                        img.style.height = img.naturalHeight + 'px';
                                        console.log(`圖片 ${imageId} 使用自然尺寸:`, img.naturalWidth + 'px', img.naturalHeight + 'px');
                                    } else {
                                        img.style.width = '300px';
                                        img.style.height = '200px';
                                        console.log(`圖片 ${imageId} 使用預設尺寸: 300px x 200px`);
                                    }
                                }
                            }
                        } catch (error) {
                            console.error(`獲取圖片 ${imageId} 信息時發生錯誤:`, error);
                            // 如果獲取信息失敗，且HTML中沒有大小資訊，使用圖片的自然尺寸
                            if (!htmlSize || (!htmlSize.width && !htmlSize.height)) {
                                if (img.naturalWidth && img.naturalHeight) {
                                    img.style.width = img.naturalWidth + 'px';
                                    img.style.height = img.naturalHeight + 'px';
                                    console.log(`圖片 ${imageId} 使用自然尺寸:`, img.naturalWidth + 'px', img.naturalHeight + 'px');
                                } else {
                                    img.style.width = '300px';
                                    img.style.height = '200px';
                                    console.log(`圖片 ${imageId} 使用預設尺寸: 300px x 200px`);
                                }
                            }
                        }
                        
                        // 添加調整大小的控制點
                        const handles = ['nw', 'ne', 'sw', 'se'].map(pos => {
                            const handle = document.createElement('div');
                            handle.className = `resize-handle resize-handle-${pos}`;
                            handle.contentEditable = false;
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
                        
                        // 直接將容器添加到包裝器中，不添加換行符
                        wrapper.appendChild(container);
                        
                        // 改進的佔位符替換邏輯
                        let placeholderReplaced = false;
                        
                        if (hasContent) {
                            // 嘗試多種佔位符格式進行替換
                            const placeholderFormats = [
                                `[IMAGE_PLACEHOLDER_${imageId}]`,
                                `[NEW_IMAGE_PLACEHOLDER_${imageId}]`,
                                `[IMAGE_PLACEHOLDER_${imageId - 1}]`,
                                `[IMAGE_PLACEHOLDER_${imageId - 2}]`,
                                `[NEW_IMAGE_PLACEHOLDER_${imageId - 1}]`,
                                `[NEW_IMAGE_PLACEHOLDER_${imageId - 2}]`
                            ];
                            
                            // 查找所有可能的佔位符
                            const allPlaceholders = tempContainer.innerHTML.match(/\[(?:IMAGE_PLACEHOLDER|NEW_IMAGE_PLACEHOLDER)_\d+\]/g) || [];
                            console.log('找到的所有佔位符:', allPlaceholders);
                            
                            // 優先嘗試精確匹配
                            for (const format of placeholderFormats) {
                                if (tempContainer.innerHTML.includes(format) && !processedPlaceholders.has(format)) {
                                    console.log(`找到精確匹配的佔位符: ${format}`);
                                    tempContainer.innerHTML = tempContainer.innerHTML.replace(format, wrapper.outerHTML);
                                    processedPlaceholders.add(format);
                                    placeholderReplaced = true;
                                    successCount++;
                                    imageStatus.push({ id: imageId, status: 'success', method: 'exact_replace', placeholder: format });
                                    break;
                                }
                            }
                            
                            // 如果沒有精確匹配，嘗試按順序替換未處理的佔位符
                            if (!placeholderReplaced && allPlaceholders.length > 0) {
                                for (const placeholder of allPlaceholders) {
                                    if (!processedPlaceholders.has(placeholder)) {
                                        console.log(`按順序替換佔位符: ${placeholder} -> 圖片 ID ${imageId}`);
                                        tempContainer.innerHTML = tempContainer.innerHTML.replace(placeholder, wrapper.outerHTML);
                                        processedPlaceholders.add(placeholder);
                                        placeholderReplaced = true;
                                        successCount++;
                                        imageStatus.push({ id: imageId, status: 'success', method: 'sequential_replace', placeholder: placeholder });
                                        break;
                                    }
                                }
                            }
                        }
                        
                        // 如果沒有找到佔位符或替換失敗，在內容末尾添加圖片
                        if (!placeholderReplaced) {
                            console.log(`沒有找到可替換的佔位符，在內容末尾添加圖片 ID: ${imageId}`);
                            tempContainer.appendChild(wrapper);
                            successCount++;
                            imageStatus.push({ id: imageId, status: 'success', method: 'append' });
                        }
                    } else {
                        console.error(`圖片 ID ${imageId} 載入失敗，已重試 ${maxRetries} 次`);
                        failCount++;
                        imageStatus.push({ id: imageId, status: 'failed', method: 'fetch', reason: 'max_retries_exceeded' });
                        // 如果圖片載入失敗，保留佔位符，不要中斷流程
                    }
                } else {
                    console.warn(`無效的圖片 ID: ${photoUrl}`);
                    failCount++;
                    imageStatus.push({ id: photoUrl, status: 'failed', method: 'parse', reason: 'invalid_id' });
                }
            } else {
                console.log(`跳過非圖片 ID 的 URL: ${photoUrl}`);
                skippedCount++;
                imageStatus.push({ id: photoUrl, status: 'skipped', method: 'url_check', reason: 'not_image_id' });
            }
        } catch (error) {
            console.error(`載入圖片時發生錯誤 (ID: ${photoUrls[i]}):`, error);
            failCount++;
            imageStatus.push({ id: photoUrls[i], status: 'failed', method: 'exception', reason: error.message });
            // 繼續處理下一個圖片，不要中斷整個流程
        }
    }
    
    // 將處理後的內容移動到編輯器
    console.log(`=== 準備更新編輯器內容 ===`);
    console.log(`臨時容器內容長度: ${tempContainer.innerHTML.length}`);
    console.log(`臨時容器內容預覽: ${tempContainer.innerHTML.substring(0, 200)}...`);
    
    editor.innerHTML = '';
    while (tempContainer.firstChild) {
        editor.appendChild(tempContainer.firstChild);
    }
    
    console.log(`=== 編輯器內容更新完成 ===`);
    console.log(`最終編輯器內容長度: ${editor.innerHTML.length}`);
    console.log(`最終編輯器內容預覽: ${editor.innerHTML.substring(0, 200)}...`);
    
    // 詳細的載入統計
    console.log('圖片載入完成統計:', {
        總數: photoUrls.length,
        成功: successCount,
        失敗: failCount,
        跳過: skippedCount,
        成功率: `${((successCount / photoUrls.length) * 100).toFixed(1)}%`
    });
    
    // 詳細的圖片狀態報告
    console.log('詳細圖片狀態報告:', imageStatus);
    
    console.log('最終編輯器內容長度:', editor.innerHTML.length);
    console.log('最終編輯器文字內容:', editor.textContent?.substring(0, 100) + '...');
    
    // 檢查最終編輯器中的圖片數量
    const finalImages = editor.querySelectorAll('img');
    console.log('最終編輯器中的圖片數量:', finalImages.length);
    finalImages.forEach((img, index) => {
        console.log(`最終圖片 ${index + 1}:`, {
            src: img.src ? img.src.substring(0, 50) + '...' : 'null',
            dataPhotoId: img.getAttribute('data-photo-id'),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
        });
    });
    
    // 初始化所有載入圖片的縮放功能
    const imageContainers = editor.querySelectorAll('.image-container');
    console.log('找到圖片容器數量:', imageContainers.length);
    
    imageContainers.forEach((container, index) => {
        const img = container.querySelector('img');
        const resizeInfo = container.querySelector('.resize-info');
        const handles = container.querySelectorAll('.resize-handle');
        
        if (img && resizeInfo && handles.length > 0) {
            try {
                initializeImageResize(container, img, resizeInfo, Array.from(handles));
                console.log(`成功初始化圖片 ${index + 1} 的縮放功能`);
            } catch (error) {
                console.warn(`初始化圖片 ${index + 1} 縮放功能失敗:`, error);
            }
        } else {
            console.warn(`圖片 ${index + 1} 缺少縮放功能必要元素:`, {
                hasImg: !!img,
                hasResizeInfo: !!resizeInfo,
                handlesCount: handles.length
            });
        }
    });
    
    // 如果所有圖片都載入失敗，顯示警告
    if (successCount === 0 && photoUrls.length > 0) {
        console.warn('所有圖片載入失敗，請檢查後端服務和圖片ID是否正確');
    }
    
    // 如果成功數量與預期不符，顯示警告
    if (successCount !== photoUrls.length) {
        console.warn(`圖片載入數量不符：預期 ${photoUrls.length} 張，實際成功 ${successCount} 張`);
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

// 載入已發布文章
async function loadPublishedPosts() {
    const publishedList = document.getElementById('publishedList');
    if (!publishedList) return;

    publishedList.innerHTML = '<div class="loading">載入中...</div>';
    
    try {
        const response = await fetch(`http://localhost:8080/api/reviews/user/${currentUserId}/published`); // 暫時使用固定用戶ID
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
        for (const post of publishedPosts) {
            const postElement = await createPublishedPostElement(post);
            publishedList.appendChild(postElement);
        }
    } catch (error) {
        console.error('載入已發布文章時發生錯誤：', error);
        publishedList.innerHTML = '<div class="error">載入已發布文章失敗，請稍後再試</div>';
    }
}

// 創建已發布文章元素
async function createPublishedPostElement(post) {
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
    const contentPreview = truncateText(stripHtml(post.content_json), 80);

    // 根據餐廳ID獲取餐廳資訊
    const restaurantInfo = await getRestaurantInfoById(post.restaurantId);

    div.innerHTML = `
        <div class="post-header">
            <h3>${escapeHtml(post.title)}</h3>
            <span class="post-date">發布於：${publishDate}</span>
        </div>
        <div class="post-content">
            <p class="restaurant-info">
                <i class="fas fa-utensils"></i> 餐廳名稱: ${restaurantInfo.name}
            </p>
            <p class="restaurant-address">
                <i class="fas fa-map-marker-alt"></i> 地址: ${restaurantInfo.address}
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
    
    // 如果沒有指定區塊選擇器，自動檢測當前活動的區塊
    if (!sectionSelector) {
        const activeSection = document.querySelector('.content-section.active');
        if (activeSection) {
            if (activeSection.id === 'edit-section') {
                sectionSelector = '#edit-section';
            } else if (activeSection.id === 'new-post-section') {
                sectionSelector = '#new-post-section';
            }
        }
    }
    
    const starsElements = document.querySelectorAll(`${sectionSelector} .stars`);
    
    console.log(`收集評分：sectionSelector="${sectionSelector}", 找到 ${starsElements.length} 個評分元素`);
    
    starsElements.forEach((starsContainer, index) => {
        const category = starsContainer.dataset.category;
        const selectedRating = starsContainer.getAttribute('data-selected-rating') || '0';
        
        console.log(`評分元素 ${index + 1}: category="${category}", selectedRating="${selectedRating}"`);
        
        if (category) {
            ratings[category] = selectedRating;
        }
    });
    
    console.log('收集到的評分數據:', ratings);
    return ratings;
}

// 更新總評分（支援區塊選擇器）
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

// 初始化字型大小
function initFontSize() {
    const fontSizeSelect = document.getElementById('fontSize');
    const fontSizeSelectEdit = document.getElementById('fontSizeEdit');
    
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('change', function() {
            setFontSize(this.value);
        });
    }
    
    if (fontSizeSelectEdit) {
        fontSizeSelectEdit.addEventListener('change', function() {
            setFontSize(this.value);
        });
    }
}

// 設置字型大小
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

// 字型大小變更功能
window.changeFontSize = function(size) {
    const editor = document.getElementById('editor');
    if (!editor) return;
    
    currentFontSize = parseInt(size);
    editor.style.fontSize = `${currentFontSize}px`;
    
    // 更新選擇器顯示
    const fontSizeSelect = document.getElementById('fontSize');
    if (fontSizeSelect) {
        fontSizeSelect.value = currentFontSize;
    }
    
    console.log('字型大小已變更為:', currentFontSize + 'px');
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
            console.log('選擇顏色：', color);
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
    
    console.log('處理顏色變更：', color, isPreview);

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
    debouncedUpdateToolbarState();

    // 關閉調色板
    closeColorPalette();
}

// 應用顏色到文字
function applyColorToText(color) {
    console.log('應用顏色到文字：', color);
    
    const editor = document.getElementById('editor');
    const editorEdit = document.getElementById('editorEdit');
    const currentEditor = editorEdit?.classList.contains('active') ? editorEdit : editor;
    
    if (!currentEditor) return;

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
        debouncedUpdateToolbarState();

        // 恢復原始選擇範圍
        selection.removeAllRanges();
        selection.addRange(originalRange);
    } catch (error) {
        console.error('應用顏色時發生錯誤：', error);
    }
}

// 評分系統相關代碼
function initRatingSystem() {
    const starsGroups = document.querySelectorAll('.stars');
    console.log(`初始化評分系統：找到 ${starsGroups.length} 個評分組`);
    
    if (!starsGroups.length) {
        console.warn('沒有找到評分元素，請檢查 HTML 結構');
        return;
    }

    starsGroups.forEach((group, index) => {
        const category = group.dataset.category;
        const stars = group.querySelectorAll('i');
        const ratingValue = group.parentElement.querySelector('.rating-value');
        
        console.log(`初始化評分組 ${index + 1}: category="${category}", stars數量=${stars.length}`);

        // 初始化評分
        group.setAttribute('data-selected-rating', '0');

        stars.forEach((star, starIndex) => {
            const rating = star.getAttribute('data-rating');
            console.log(`  星星 ${starIndex + 1}: data-rating="${rating}"`);
            
            // 防止評分區干擾編輯器焦點
            star.addEventListener('mousedown', function(e) {
                e.preventDefault(); // 阻止 selection 被切換
            });
            
            star.addEventListener('click', function(e) {
                e.preventDefault(); // 阻止默認行為
                e.stopPropagation(); // 阻止事件冒泡
                
                const rating = this.getAttribute('data-rating');
                console.log(`點擊星星：category="${category}", rating="${rating}"`);
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
        
        // 為整個評分組添加防止焦點干擾
        group.addEventListener('mousedown', function(e) {
            e.preventDefault(); // 阻止 selection 被切換
        });
    });
    
    console.log('評分系統初始化完成');
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
    
    // 清空餐廳名稱
    const restaurantNameEdit = document.getElementById('restaurantNameEdit');
    if (restaurantNameEdit) {
        restaurantNameEdit.value = '';
    }
    
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
        console.log('=== 開始編輯已發布文章 ===');
        console.log('文章ID:', postId);
        
        // 獲取文章詳情
        const response = await fetch(`http://localhost:8080/api/reviews/user/${currentUserId}/published`);
        if (!response.ok) throw new Error('載入文章失敗');
        const publishedPosts = await response.json();
        const post = publishedPosts.find(p => p.id === postId);
        
        if (!post) {
            alert('文章不存在');
            return;
        }
        
        console.log('載入已發布文章詳情:', {
            id: post.id,
            title: post.title,
            contentLength: post.content_json?.length || 0,
            photosCount: post.photos?.length || 0,
            hasContent: !!post.content_json,
            contentPreview: post.content_json?.substring(0, 100) + '...',
            photos: post.photos
        });
        
        // 切換到編輯頁面
        showSectionWrapper('edit');
        
        // 填充表單
        document.getElementById('postTitleEdit').value = post.title;
        document.getElementById('tagsEdit').value = post.tags.join(', ');
        
        // 先清空編輯器內容
        document.getElementById('editorEdit').innerHTML = '';
        
        // 載入內容到編輯器
        if (post.content_json) {
            console.log('載入已發布文章HTML內容到編輯器');
            
            // 檢查內容是否包含佔位符
            const hasPlaceholders = post.content_json.includes('[IMAGE_PLACEHOLDER_') || 
                                  post.content_json.includes('[NEW_IMAGE_PLACEHOLDER_');
            
            // 統計佔位符數量
            const imagePlaceholders = (post.content_json.match(/\[IMAGE_PLACEHOLDER_\d+\]/g) || []).length;
            const newImagePlaceholders = (post.content_json.match(/\[NEW_IMAGE_PLACEHOLDER_\d+\]/g) || []).length;
            
            console.log('內容分析:', {
                hasPlaceholders: hasPlaceholders,
                contentLength: post.content_json.length,
                imagePlaceholders: imagePlaceholders,
                newImagePlaceholders: newImagePlaceholders,
                totalPlaceholders: imagePlaceholders + newImagePlaceholders,
                photosCount: post.photos?.length || 0
            });
            
            // 如果有圖片且內容包含佔位符，先載入HTML內容，然後載入圖片替換佔位符
            if (post.photos && post.photos.length > 0 && hasPlaceholders) {
                console.log('檢測到圖片和佔位符，先載入HTML內容再載入圖片');
                console.log('圖片ID列表:', post.photos);
                document.getElementById('editorEdit').innerHTML = post.content_json;
                
                // 等待一下確保DOM更新完成
                await new Promise(resolve => setTimeout(resolve, 100));
                
                console.log('開始載入圖片替換佔位符...');
                await loadImagesToEditor(post.photos, '#editorEdit');
                console.log('圖片載入完成');
            } else if (post.photos && post.photos.length > 0 && !hasPlaceholders) {
                console.log('檢測到圖片但沒有佔位符，先載入HTML內容再在末尾添加圖片');
                console.log('圖片ID列表:', post.photos);
                document.getElementById('editorEdit').innerHTML = post.content_json;
                
                // 等待一下確保DOM更新完成
                await new Promise(resolve => setTimeout(resolve, 100));
                
                console.log('開始在末尾添加圖片...');
                await loadImagesToEditor(post.photos, '#editorEdit');
                console.log('圖片添加完成');
            } else {
                console.log('沒有圖片或佔位符，直接使用HTML內容');
                document.getElementById('editorEdit').innerHTML = post.content_json;
            }
        } else {
            console.log('文章沒有內容，清空編輯器');
            document.getElementById('editorEdit').innerHTML = '';
            
            // 如果沒有內容但有圖片，直接載入圖片
            if (post.photos && post.photos.length > 0) {
                console.log('文章沒有內容但有圖片，直接載入圖片');
                console.log('圖片ID列表:', post.photos);
                await loadImagesToEditor(post.photos, '#editorEdit');
                console.log('圖片載入完成');
            }
        }
        
        // 設置評分
        if (post.ratings) {
            console.log('設置評分:', post.ratings);
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
        
        console.log('已發布文章載入完成，編輯器內容長度:', document.getElementById('editorEdit').innerHTML.length);
        
        // 檢查最終載入的圖片數量
        const finalImages = document.getElementById('editorEdit').querySelectorAll('img');
        console.log('最終編輯器中的圖片數量:', finalImages.length);
        finalImages.forEach((img, index) => {
            console.log(`最終圖片 ${index + 1}:`, {
                src: img.src ? img.src.substring(0, 50) + '...' : 'null',
                dataPhotoId: img.getAttribute('data-photo-id'),
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });
        });
        
        // 初始化編輯器功能（確保圖片縮放功能正常工作）
        const editorEdit = document.getElementById('editorEdit');
        if (editorEdit) {
            // 設置編輯器預設字體大小
            editorEdit.style.fontSize = `${currentFontSize}px`;
            
            // 初始化時為編輯器添加零寬空白字元（如果編輯器為空）
            if (editorEdit.innerHTML === '' || editorEdit.innerHTML === '<br>') {
                editorEdit.innerHTML = '\u200B';
                console.log('初始化編輯器：添加零寬空白字元');
            }
        }
        
        // 更新按鈕文字和事件處理
        const saveDraftBtn = document.querySelector('#edit-section .btn-save-draft');
        if (saveDraftBtn) {
            saveDraftBtn.textContent = '儲存成新草稿';
            // 移除舊的事件監聽器
            saveDraftBtn.replaceWith(saveDraftBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-save-draft').addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('=== 開始儲存新草稿 ===');
                console.log('當前編輯的文章信息:', window.currentEditingPost);
                
                const imageData = collectImageData('#editorEdit');
                console.log('收集到的圖片數據:', imageData);
                
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
                    existingImageInfo: imageData.existingImageInfo,
                    tags: document.getElementById('tagsEdit').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
                };

                console.log('準備發送的草稿數據:', {
                    userId: postData.userId,
                    restaurantId: postData.restaurantId,
                    title: postData.title,
                    contentLength: postData.content_json.length,
                    status: postData.status,
                    ratings: postData.ratings,
                    newImagesCount: postData.photoData.length,
                    existingPhotosCount: postData.photos.length,
                    existingImageInfoCount: postData.existingImageInfo ? Object.keys(postData.existingImageInfo).length : 0,
                    tags: postData.tags
                });

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    console.log('發送POST請求到後端...');
                    const response = await fetch('http://localhost:8080/api/reviews', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    console.log('後端回應狀態:', response.status, response.statusText);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('後端錯誤回應:', errorText);
                        throw new Error(`儲存草稿失敗: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
                    console.log('儲存新草稿成功:', result);
                    alert('已儲存成新草稿');
                    
                    console.log('清理表單並重新載入草稿列表...');
                    clearEditForm();
                    loadDrafts();
                    showSectionWrapper('drafts');
                    console.log('=== 草稿儲存完成 ===');
                } catch (error) {
                    console.error('儲存草稿時發生錯誤：', error);
                    alert('儲存草稿失敗：' + error.message);
                }
            });
        }
        
        // 更新發布按鈕事件處理
        const publishBtn = document.querySelector('#edit-section .btn-publish');
        if (publishBtn) {
            publishBtn.textContent = '更新文章';
            // 移除舊的事件監聽器
            publishBtn.replaceWith(publishBtn.cloneNode(true));
            // 添加新的事件監聽器
            document.querySelector('#edit-section .btn-publish').addEventListener('click', async function(e) {
                e.preventDefault();
                console.log('=== 開始更新已發布文章 ===');
                console.log('當前編輯的文章信息:', window.currentEditingPost);
                
                const imageData = collectImageData('#editorEdit');
                console.log('收集到的圖片數據:', imageData);
                
                const postData = {
                    userId: window.currentEditingPost.userId,
                    restaurantId: window.currentEditingPost.restaurantId,
                    title: document.getElementById('postTitleEdit').value || '未命名文章',
                    content_json: imageData.processedHtmlContent || document.getElementById('editorEdit').innerHTML || '',
                    ratings: {
                        environment_score: parseInt(document.querySelector('#edit-section .stars[data-category="environment"]')?.getAttribute('data-selected-rating') || '0'),
                        service_score: parseInt(document.querySelector('#edit-section .stars[data-category="service"]')?.getAttribute('data-selected-rating') || '0'),
                        taste_score: parseInt(document.querySelector('#edit-section .stars[data-category="taste"]')?.getAttribute('data-selected-rating') || '0'),
                        price_score: parseInt(document.querySelector('#edit-section .stars[data-category="price"]')?.getAttribute('data-selected-rating') || '0'),
                        overall_score: parseFloat(document.querySelector('#edit-section .overall-rating .rating-value')?.textContent || '0.0')
                    },
                    photoData: imageData.newImages, // 新圖片數據
                    photos: imageData.existingPhotoIds, // 已存在的圖片ID
                    existingImageInfo: imageData.existingImageInfo,
                    tags: document.getElementById('tagsEdit').value.split(/[,，、]/).map(tag => tag.trim()).filter(Boolean)
                };

                console.log('準備發送的更新數據:', {
                    userId: postData.userId,
                    restaurantId: postData.restaurantId,
                    title: postData.title,
                    contentLength: postData.content_json.length,
                    ratings: postData.ratings,
                    newImagesCount: postData.photoData.length,
                    existingPhotosCount: postData.photos.length,
                    existingImageInfoCount: postData.existingImageInfo ? Object.keys(postData.existingImageInfo).length : 0,
                    tags: postData.tags
                });

                if (!postData.content_json) {
                    alert('請至少填寫評論內容');
                    return;
                }

                try {
                    // 使用包含佔位符的HTML內容，這樣後端可以正確處理圖片
                    postData.content_json = imageData.processedHtmlContent || postData.content_json;
                    
                    console.log('更新文章使用的HTML內容（包含佔位符）:', postData.content_json);
                    
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
                        throw new Error(`更新文章失敗: ${response.status} ${response.statusText}`);
                    }

                    const publishedId = await response.json();
                    console.log('更新文章成功:', publishedId);
                    alert('文章更新成功！');
                    
                    // 清空表單並重置狀態
                    clearEditForm();
                    
                    // 更新文章列表並切換到已發布頁面
                    loadPublishedPosts();
                    showSectionWrapper('published');
                    
                } catch (error) {
                    console.error('更新文章時發生錯誤：', error);
                    alert('更新文章時發生錯誤：' + error.message);
                }
            });
        }
        
        console.log('=== 已發布文章編輯初始化完成 ===');
        
    } catch (error) {
        console.error('編輯已發布文章時發生錯誤：', error);
        alert('載入文章失敗：' + error.message);
    }
}




// 設置餐廳資訊的函數
function setRestaurantInfo(restaurantId, restaurantName, restaurantAddress) {
    currentRestaurantId = restaurantId;
    currentRestaurantName = restaurantName;
    currentRestaurantAddress = restaurantAddress;
    
    console.log('設置餐廳資訊:', {
        id: currentRestaurantId,
        name: currentRestaurantName,
        address: currentRestaurantAddress
    });
    
    // 如果餐廳名稱元素存在，自動填入
    const restaurantNameElement = document.getElementById('restaurantName');
    if (restaurantNameElement && currentRestaurantName) {
        restaurantNameElement.value = currentRestaurantName;
    }
    
    // 如果餐廳地址元素存在，自動填入
    const restaurantLocationElement = document.getElementById('restaurantLocation');
    if (restaurantLocationElement && currentRestaurantAddress) {
        restaurantLocationElement.value = currentRestaurantAddress;
    }
    
    // 如果餐廳名稱編輯元素存在，也自動填入
    const restaurantNameEditElement = document.getElementById('restaurantNameEdit');
    if (restaurantNameEditElement && currentRestaurantName) {
        restaurantNameEditElement.value = currentRestaurantName;
    }
    
    // 如果餐廳地址編輯元素存在，也自動填入
    const restaurantLocationEditElement = document.getElementById('restaurantLocationEdit');
    if (restaurantLocationEditElement && currentRestaurantAddress) {
        restaurantLocationEditElement.value = currentRestaurantAddress;
    }
}

// 從URL參數獲取餐廳資訊
async function getRestaurantInfoFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('restaurantId');
    
    if (restaurantId) {
        // 使用getRestaurantInfoById獲取完整的餐廳資訊
        const restaurantInfo = await getRestaurantInfoById(restaurantId);
        setRestaurantInfo(restaurantId, restaurantInfo.name, restaurantInfo.address);
        return true;
    } else {
        setRestaurantInfo("1", "等待餐廳資訊輸入...", "等待餐廳資訊輸入...");
    }
    
    return false;
}

// 根據餐廳ID獲取餐廳資訊
async function getRestaurantInfoById(restaurantId) {
    try {
        // 使用API查詢餐廳資料
        const response = await fetch(`http://localhost:8080/api/restaurants/${restaurantId}`);
        
        if (response.ok) {
            const restaurant = await response.json();
            return {
                name: restaurant.name || `餐廳ID: ${restaurantId}`,
                address: restaurant.address || restaurant.location || "地址資訊未提供"
            };
        } else if (response.status === 404) {
            // 如果餐廳不存在，返回預設值
            return { 
                name: `餐廳ID: ${restaurantId}`, 
                address: "餐廳資訊不存在" 
            };
        } else {
            throw new Error(`API錯誤: ${response.status}`);
        }
        
    } catch (error) {
        console.error('獲取餐廳資訊時發生錯誤：', error);
        
       
        // 最終備用方案
        return { 
            name: `餐廳ID: ${restaurantId}`, 
            address: "地址資訊未提供" 
        };
    }
}

// 暴露給全域的函數，供其他頁面調用
window.setRestaurantInfo = setRestaurantInfo;