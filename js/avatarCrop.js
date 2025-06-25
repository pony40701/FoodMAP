// 頭像裁切功能
class AvatarCropModal {
    constructor() {
        this.apiBaseUrl = window.API_BASE_URL || 'http://localhost:8080/api';
        this.modal = null;
        this.cropContainer = null;
        this.cropImage = null;
        this.previewImage = null;
        this.currentFile = null;
        this.cropData = {
            scale: 1,
            x: 0,
            y: 0
        };
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        console.log('AvatarCropModal 初始化完成');
    }

    createModal() {
        // 創建彈窗 HTML
        const modalHTML = `
            <div id="avatarCropModal" class="avatar-crop-modal">
                <div class="avatar-crop-content">
                    <div class="avatar-crop-header">
                        <h3><i class="fas fa-crop"></i> 裁切頭像</h3>
                        <button class="avatar-crop-close" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="crop-tips">
                        <ul>
                            <li>支援 JPG、PNG、GIF、WebP 格式</li>
                            <li>檔案大小限制 5MB</li>
                            <li>建議上傳正方形圖片以獲得最佳效果</li>
                        </ul>
                    </div>
                    
                    <!-- 文件選擇區域 -->
                    <div class="file-input-area" id="fileInputArea">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <div class="file-input-text">點擊選擇圖片或拖拽到這裡</div>
                        <p>支援 JPG、PNG、GIF、WebP 格式，最大 5MB</p>
                        <input type="file" class="hidden-file-input" id="cropFileInput" accept="image/*">
                    </div>
                    
                    <!-- 裁切區域 -->
                    <div class="crop-container" id="cropContainer" style="display: none;">
                        <img class="crop-image" id="cropImage" alt="待裁切圖片">
                    </div>
                    
                    <!-- 控制項 -->
                    <div class="crop-controls" id="cropControls" style="display: none;">
                        <div class="crop-control-group">
                            <label for="scaleSlider">縮放大小</label>
                            <input type="range" id="scaleSlider" class="crop-slider" min="0.5" max="3" step="0.1" value="1">
                        </div>
                    </div>
                    
                    <!-- 預覽區域 -->
                    <div class="crop-preview" id="cropPreview" style="display: none;">
                        <h4>預覽效果</h4>
                        <div class="preview-container">
                            <img class="preview-image" id="previewImage" alt="頭像預覽">
                        </div>
                    </div>
                    
                    <!-- 載入中 -->
                    <div class="crop-loading" id="cropLoading">
                        <i class="fas fa-spinner"></i>
                        <div>正在上傳頭像...</div>
                    </div>
                    
                    <!-- 按鈕區域 -->
                    <div class="crop-buttons">
                        <button type="button" class="crop-btn crop-btn-cancel" id="cropCancel">取消</button>
                        <button type="button" class="crop-btn crop-btn-upload" id="cropUpload" style="display: none;">確認上傳</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加到頁面
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 獲取元素引用
        this.modal = document.getElementById('avatarCropModal');
        this.cropContainer = document.getElementById('cropContainer');
        this.cropImage = document.getElementById('cropImage');
        this.previewImage = document.getElementById('previewImage');
    }

    bindEvents() {
        const fileInput = document.getElementById('cropFileInput');
        const fileInputArea = document.getElementById('fileInputArea');
        const closeBtn = this.modal.querySelector('.avatar-crop-close');
        const cancelBtn = document.getElementById('cropCancel');
        const uploadBtn = document.getElementById('cropUpload');
        const scaleSlider = document.getElementById('scaleSlider');

        // 文件選擇
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        fileInputArea.addEventListener('click', () => fileInput.click());

        // 拖拽上傳
        fileInputArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileInputArea.classList.add('dragover');
        });

        fileInputArea.addEventListener('dragleave', () => {
            fileInputArea.classList.remove('dragover');
        });

        fileInputArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileInputArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0]);
            }
        });

        // 關閉彈窗
        closeBtn.addEventListener('click', () => this.close());
        cancelBtn.addEventListener('click', () => this.close());

        // 點擊背景關閉
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // 縮放控制
        scaleSlider.addEventListener('input', (e) => {
            this.cropData.scale = parseFloat(e.target.value);
            this.updateImageDisplay();
        });

        // 圖片拖拽
        this.cropImage.addEventListener('mousedown', (e) => this.startDrag(e));

        // 上傳按鈕
        uploadBtn.addEventListener('click', () => this.uploadCroppedImage());
    }

    // 顯示彈窗
    show() {
        this.modal.classList.add('show');
        this.reset();
        console.log('頭像裁切彈窗已顯示');
    }

    // 隱藏彈窗
    close() {
        this.modal.classList.remove('show');
        this.reset();
        console.log('頭像裁切彈窗已關閉');
    }

    // 重置狀態
    reset() {
        this.currentFile = null;
        this.cropData = { scale: 1, x: 0, y: 0 };
        
        // 隱藏所有區域
        document.getElementById('cropContainer').style.display = 'none';
        document.getElementById('cropControls').style.display = 'none';
        document.getElementById('cropPreview').style.display = 'none';
        document.getElementById('cropUpload').style.display = 'none';
        document.getElementById('cropLoading').classList.remove('show');
        
        // 顯示文件選擇區域
        document.getElementById('fileInputArea').style.display = 'block';
        
        // 重置滑桿
        document.getElementById('scaleSlider').value = 1;
    }

    // 處理文件選擇
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleFile(file);
        }
    }

    // 處理文件
    handleFile(file) {
        console.log('處理文件:', file.name, file.size, file.type);

        // 驗證文件
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.loadImage(file);
    }

    // 驗證文件
    validateFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            this.showToast('請選擇有效的圖片格式 (JPG, PNG, GIF, WebP)');
            return false;
        }

        if (file.size > maxSize) {
            this.showToast('圖片大小不能超過 5MB');
            return false;
        }

        return true;
    }

    // 載入圖片
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.cropImage.src = e.target.result;
            this.cropImage.onload = () => {
                this.showCropInterface();
                this.updateImageDisplay();
            };
        };
        reader.readAsDataURL(file);
    }

    // 顯示裁切界面
    showCropInterface() {
        // 隱藏文件選擇區域
        document.getElementById('fileInputArea').style.display = 'none';
        
        // 顯示裁切相關區域
        document.getElementById('cropContainer').style.display = 'block';
        document.getElementById('cropControls').style.display = 'block';
        document.getElementById('cropPreview').style.display = 'block';
        document.getElementById('cropUpload').style.display = 'inline-block';
    }

    // 更新圖片顯示
    updateImageDisplay() {
        if (!this.cropImage.src) return;

        const { scale, x, y } = this.cropData;
        
        // 應用變換
        this.cropImage.style.transform = `scale(${scale}) translate(${x}px, ${y}px)`;
        
        // 更新預覽
        this.updatePreview();
    }

    // 更新預覽
    updatePreview() {
        if (!this.cropImage.src) return;
        
        // 創建臨時 canvas 生成預覽
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 設置預覽尺寸
        const previewSize = 100; // 預覽圓形直徑
        canvas.width = previewSize;
        canvas.height = previewSize;
        
        // 創建臨時圖片元素來獲取當前圖片
        const tempImg = new Image();
        tempImg.onload = () => {
            // 清除畫布
            ctx.clearRect(0, 0, previewSize, previewSize);
            
            // 計算繪製參數
            const { scale, x, y } = this.cropData;
            
            // 計算圖片在裁切容器中的實際尺寸和位置
            const containerSize = 250; // 裁切容器大小（與CSS中的大小一致）
            const imgNaturalSize = Math.min(tempImg.naturalWidth, tempImg.naturalHeight);
            const displaySize = containerSize; // 圖片在容器中的基礎顯示尺寸
            
            // 計算縮放後的尺寸
            const scaledSize = displaySize * scale;
            
            // 計算在預覽中的位置和尺寸
            const previewScale = previewSize / containerSize;
            const previewScaledSize = scaledSize * previewScale;
            const previewX = (previewSize - previewScaledSize) / 2 + x * scale * previewScale;
            const previewY = (previewSize - previewScaledSize) / 2 + y * scale * previewScale;
            
            // 創建圓形裁切區域
            ctx.save();
            ctx.beginPath();
            ctx.arc(previewSize / 2, previewSize / 2, previewSize / 2, 0, Math.PI * 2);
            ctx.clip();
            
            // 繪製圖片
            ctx.drawImage(tempImg, previewX, previewY, previewScaledSize, previewScaledSize);
            ctx.restore();
            
            // 將 canvas 轉換為 data URL 並設置到預覽圖片
            this.previewImage.src = canvas.toDataURL('image/jpeg', 0.9);
        };
        
        tempImg.src = this.cropImage.src;
    }

    // 開始拖拽
    startDrag(e) {
        e.preventDefault();
        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = this.cropData.x;
        const initialY = this.cropData.y;

        const handleMouseMove = (e) => {
            const deltaX = (e.clientX - startX) / this.cropData.scale;
            const deltaY = (e.clientY - startY) / this.cropData.scale;
            
            this.cropData.x = initialX + deltaX;
            this.cropData.y = initialY + deltaY;
            
            this.updateImageDisplay();
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    // 上傳裁切後的圖片
    async uploadCroppedImage() {
        if (!this.currentFile) {
            this.showToast('請先選擇圖片');
            return;
        }

        try {
            // 顯示載入狀態
            document.getElementById('cropLoading').classList.add('show');
            document.getElementById('cropUpload').disabled = true;

            // 獲取用戶 ID
            const userId = this.getUserId();
            if (!userId) {
                throw new Error('請先登入');
            }

            // 創建 canvas 來生成裁切後的圖片
            const croppedBlob = await this.getCroppedImageBlob();
            
            // 上傳到後端
            const result = await this.uploadToServer(userId, croppedBlob);
            
            if (result.success) {
                this.showToast('頭像更新成功！');
                
                // 重新載入用戶資料
                await this.reloadUserData(userId);
                
                // 更新頁面上的頭像
                this.updateAvatars(result.avatar_url);
                
                // 觸發全域頭像更新事件
                this.triggerGlobalAvatarUpdate(userId);
                
                // 關閉彈窗
                setTimeout(() => {
                    this.close();
                }, 1000);
            } else {
                throw new Error(result.error || '上傳失敗');
            }

        } catch (error) {
            console.error('頭像上傳失敗:', error);
            this.showToast(error.message || '頭像上傳失敗');
        } finally {
            // 隱藏載入狀態
            document.getElementById('cropLoading').classList.remove('show');
            document.getElementById('cropUpload').disabled = false;
        }
    }

    // 重新載入用戶資料
    async reloadUserData(userId) {
        try {
            console.log('重新載入用戶資料，用戶ID:', userId);
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`);
            
            if (response.ok) {
                const userData = await response.json();
                
                // 更新localStorage中的所有用戶資料
                localStorage.setItem('userData', JSON.stringify(userData));
                localStorage.setItem('user', JSON.stringify(userData));
                
                console.log('用戶資料重新載入成功:', userData);
                return userData;
            } else {
                console.warn('重新載入用戶資料失敗:', response.status);
            }
        } catch (error) {
            console.error('重新載入用戶資料時發生錯誤:', error);
        }
        return null;
    }

    // 觸發全域頭像更新事件
    triggerGlobalAvatarUpdate(userId) {
        console.log('觸發全域頭像更新事件');
        
        // 發送自定義事件
        const event = new CustomEvent('avatarUpdated', {
            detail: { userId: userId }
        });
        window.dispatchEvent(event);
        
        // 如果有login.js的updateLoginStatus函數，直接調用
        if (typeof updateLoginStatus === 'function') {
            console.log('調用 updateLoginStatus 更新頭像');
            updateLoginStatus(true);
        }
        
        // 觸發其他可能的頭像更新函數
        if (window.login && typeof window.login.updateLoginStatus === 'function') {
            window.login.updateLoginStatus(true);
        }
        
        // 通知其他頁面（如果有）
        try {
            localStorage.setItem('avatarUpdateTimestamp', new Date().getTime().toString());
        } catch (e) {
            console.warn('設置頭像更新時間戳失敗:', e);
        }
    }

    // 獲取用戶 ID
    getUserId() {
        // 多重檢查用戶 ID
        let userId = null;
        
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userId = userData.id;
        } catch (e) {
            console.warn('解析 userData 失敗');
        }
        
        if (!userId) {
            userId = localStorage.getItem('userId');
        }
        
        // 開發環境預設
        if (!userId && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            userId = '38';
            console.warn('使用預設測試用戶 ID:', userId);
        }
        
        return userId;
    }

    // 獲取裁切後的圖片 Blob
    async getCroppedImageBlob() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 設置 canvas 尺寸為正方形
            const size = 300;
            canvas.width = size;
            canvas.height = size;
            
            // 創建臨時圖片元素
            const img = new Image();
            img.onload = () => {
                // 清除畫布
                ctx.clearRect(0, 0, size, size);
                
                // 計算繪製參數
                const { scale, x, y } = this.cropData;
                
                // 計算圖片在裁切容器中的實際尺寸和位置
                const containerSize = 250; // 裁切容器大小（與CSS中的大小一致）
                const displaySize = containerSize; // 圖片在容器中的基礎顯示尺寸
                
                // 計算縮放後的尺寸
                const scaledSize = displaySize * scale;
                
                // 計算在最終圖片中的位置和尺寸
                const finalScale = size / containerSize;
                const finalScaledSize = scaledSize * finalScale;
                const finalX = (size - finalScaledSize) / 2 + x * scale * finalScale;
                const finalY = (size - finalScaledSize) / 2 + y * scale * finalScale;
                
                // 創建圓形裁切區域
                ctx.save();
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.clip();
                
                // 繪製圖片
                ctx.drawImage(img, finalX, finalY, finalScaledSize, finalScaledSize);
                ctx.restore();
                
                // 轉換為 Blob
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.9);
            };
            
            img.src = this.cropImage.src;
        });
    }

    // 上傳到伺服器
    async uploadToServer(userId, blob) {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        const authToken = localStorage.getItem('authToken');
        const requestOptions = {
            method: 'POST',
            body: formData
        };

        if (authToken) {
            requestOptions.headers = {
                'Authorization': `Bearer ${authToken}`
            };
        }

        console.log('上傳到:', `${this.apiBaseUrl}/users/${userId}/avatar`);

        const response = await fetch(`${this.apiBaseUrl}/users/${userId}/avatar`, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    // 更新頁面頭像
    updateAvatars(avatarUrl) {
        const avatarElements = document.querySelectorAll('.avatar-img, .user-avatar img, img[alt="會員頭像"]');
        
        avatarElements.forEach((img) => {
            if (img) {
                img.src = avatarUrl;
                console.log('頭像已更新:', avatarUrl);
            }
        });

        // 更新 localStorage
        try {
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            userData.avatar_url = avatarUrl;
            localStorage.setItem('userData', JSON.stringify(userData));
        } catch (e) {
            console.warn('更新 userData 失敗:', e);
        }
    }

    // 顯示提示訊息
    showToast(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message);
        } else {
            alert(message);
        }
        console.log('Toast:', message);
    }
}

// 全域實例
let avatarCropModal = null;

// 初始化函數
function initAvatarCropModal() {
    if (!avatarCropModal) {
        avatarCropModal = new AvatarCropModal();
        console.log('AvatarCropModal 已初始化');
    }
}

// 顯示頭像裁切彈窗
function showAvatarCropModal() {
    if (!avatarCropModal) {
        initAvatarCropModal();
    }
    avatarCropModal.show();
}

// 頁面載入時初始化
document.addEventListener('DOMContentLoaded', () => {
    initAvatarCropModal();
});

// 導出到全域
window.showAvatarCropModal = showAvatarCropModal;
window.avatarCropModal = avatarCropModal; 