document.addEventListener("DOMContentLoaded", () => {
    renderCart();
});

function renderCart() {
    const cartList = document.getElementById("cart-list");
    const totalPriceEl = document.getElementById("total-price");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

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
            <img src="../${item.image}" class="cart-img">

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
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}

function goCheckout() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        alert("장바구니가 비어있습니다.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    window.location.href = `checkout.html?price=${total}&name=장바구니상품`;
}

function changeQty(index, amount) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart[index].qty += amount;

    if (cart[index].qty < 1) cart[index].qty = 1;

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
}