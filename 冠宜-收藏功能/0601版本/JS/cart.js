document.addEventListener('DOMContentLoaded', function() {
    const cartItems = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryFeeElement = document.getElementById('deliveryFee');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // 從 localStorage 獲取購物車數據
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 更新購物車顯示
    function updateCart() {
        cartItems.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price} 元</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem(${index})">刪除</button>
            `;
            cartItems.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });

        const deliveryFee = subtotal > 0 ? 60 : 0;
        const total = subtotal + deliveryFee;

        subtotalElement.textContent = `$${subtotal}`;
        deliveryFeeElement.textContent = `$${deliveryFee}`;
        totalElement.textContent = `$${total}`;

        // 更新 localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // 更新商品數量
    window.updateQuantity = function(index, change) {
        cart[index].quantity = Math.max(1, cart[index].quantity + change);
        updateCart();
    };

    // 移除商品
    window.removeItem = function(index) {
        cart.splice(index, 1);
        updateCart();
    };

    // 結帳
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('購物車是空的！');
            return;
        }

        // 檢查是否登入
        if (!localStorage.getItem('isLoggedIn')) {
            alert('請先登入！');
            window.location.href = '../HTML/userLogin.html';
            return;
        }

        // 創建訂單
        const order = {
            id: Date.now(),
            items: cart,
            total: parseFloat(totalElement.textContent.replace('$', '')),
            status: 'pending',
            date: new Date().toISOString()
        };

        // 儲存訂單
        let orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));

        // 清空購物車
        cart = [];
        localStorage.removeItem('cart');

        alert('訂單已建立！');
        window.location.href = '../HTML/orders.html';
    });

    // 初始化購物車
    updateCart();
}); 