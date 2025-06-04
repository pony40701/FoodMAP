document.addEventListener('DOMContentLoaded', function() {
    // 初始化 Quill 編輯器
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'direction': 'rtl' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean'],
                ['link', 'image']
            ]
        }
    });

    // 評分功能
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;

    stars.forEach(star => {
        star.addEventListener('mouseover', function() {
            const rating = this.dataset.rating;
            updateStars(rating);
        });

        star.addEventListener('mouseout', function() {
            updateStars(currentRating);
        });

        star.addEventListener('click', function() {
            currentRating = this.dataset.rating;
            updateStars(currentRating);
        });
    });

    function updateStars(rating) {
        stars.forEach(star => {
            star.style.color = star.dataset.rating <= rating ? '#ffd700' : '#ccc';
        });
    }

    // 標籤功能
    const tagInput = document.getElementById('tagInput');
    const tagsList = document.getElementById('tagsList');
    const tags = new Set();

    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = this.value.trim();
            if (tag && !tags.has(tag)) {
                tags.add(tag);
                updateTagsList();
            }
            this.value = '';
        }
    });

    function updateTagsList() {
        tagsList.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <span class="remove-tag" data-tag="${tag}">&times;</span>
            `;
            tagsList.appendChild(tagElement);
        });

        // 添加刪除標籤功能
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', function() {
                const tagToRemove = this.dataset.tag;
                tags.delete(tagToRemove);
                updateTagsList();
            });
        });
    }

    // 圖片上傳預覽
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const uploadedImages = [];

    imageUpload.addEventListener('change', function(e) {
        const files = e.target.files;
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('div');
                    img.className = 'preview-image';
                    img.innerHTML = `
                        <img src="${e.target.result}">
                        <button class="remove-image">&times;</button>
                    `;
                    imagePreview.appendChild(img);
                    uploadedImages.push(e.target.result);

                    // 添加刪除圖片功能
                    img.querySelector('.remove-image').addEventListener('click', function() {
                        const index = Array.from(imagePreview.children).indexOf(img);
                        uploadedImages.splice(index, 1);
                        img.remove();
                    });
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // 表單提交
    const reviewForm = document.getElementById('reviewForm');
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // 檢查是否登入
        if (!localStorage.getItem('isLoggedIn')) {
            alert('請先登入！');
            window.location.href = '../HTML/userLogin.html';
            return;
        }

        const review = {
            id: Date.now(),
            storeName: document.getElementById('storeName').value,
            title: document.getElementById('title').value,
            content: quill.root.innerHTML,
            rating: currentRating,
            tags: Array.from(tags),
            images: uploadedImages,
            author: localStorage.getItem('userEmail'),
            date: new Date().toISOString()
        };

        // 儲存心得
        let reviews = JSON.parse(localStorage.getItem('reviews')) || [];
        reviews.push(review);
        localStorage.setItem('reviews', JSON.stringify(reviews));

        alert('心得發布成功！');
        window.location.href = '../HTML/foodReviewList.html';
    });
});

// 儲存草稿
function saveAsDraft() {
    const draft = {
        storeName: document.getElementById('storeName').value,
        title: document.getElementById('title').value,
        content: quill.root.innerHTML,
        rating: currentRating,
        tags: Array.from(tags),
        images: uploadedImages,
        date: new Date().toISOString()
    };

    localStorage.setItem('reviewDraft', JSON.stringify(draft));
    alert('草稿已儲存！');
} 