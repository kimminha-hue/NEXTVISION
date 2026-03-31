document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

// ✅ 사용자별 장바구니 키 가져오기
function getCartKey() {
    const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
    const userId = loginUser.id || loginUser.username || "guest";
    return `cart_${userId}`;
}

document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

function renderCart() {
    const cartList = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");

    // ✅ 사용자별 키 사용
    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="cart-item empty-cart">
                <p>장바구니가 비어있습니다.</p>
            </div>
        `;
        totalPriceEl.textContent = "총 금액: ₩0";
        return;
    }

    let total = 0;

    cartList.innerHTML = cart.map((item, index) => {
        total += item.price * item.qty;
        return `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img">
                <div class="cart-info">
                    <h3>${item.name}</h3>
                    <p>₩${(item.price * item.qty).toLocaleString()}</p>
                    <div class="qty-box">
                        <button onclick="changeQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="cart-actions">
                    <button onclick="removeItem(${index})">삭제</button>
                </div>
            </div>
        `;
    }).join("");

    totalPriceEl.textContent = "총 금액: ₩" + total.toLocaleString();
}

function removeItem(index) {
    // ✅ 사용자별 키 사용
    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    cart.splice(index, 1);
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    renderCart();
}

function goCheckout() {
    // ✅ 사용자별 키 사용
    const cart = JSON.parse(localStorage.getItem(getCartKey())) || [];

    if (cart.length === 0) {
        alert("장바구니가 비어있습니다.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    localStorage.setItem("checkoutTotal", total);
    window.location.href = "checkout.html";
}

function changeQty(index, amount) {
    // ✅ 사용자별 키 사용
    let cart = JSON.parse(localStorage.getItem(getCartKey())) || [];
    cart[index].qty += amount;
    if (cart[index].qty < 1) cart[index].qty = 1;
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
    renderCart();
}