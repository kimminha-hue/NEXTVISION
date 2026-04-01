// 1. 로그인 체크
const isLogin = localStorage.getItem("isLogin");
if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
}

// ✅ loginUser에서 정보 가져오기
const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
const currentUserName = loginUser.name || loginUser.username || "";
const userId = loginUser.id || loginUser.username || "guest";
const cartKey = `cart_${userId}`;  // ✅ 사용자별 장바구니 키

document.addEventListener("DOMContentLoaded", () => {
    const isLogin = localStorage.getItem("isLogin");
    const username = loginUser.name || loginUser.id || "";

    

    // ✅ 결제페이지 배송정보 자동입력
    const buyerNameInput = document.querySelector('input[placeholder="이름"]');
    const buyerTelInput = document.querySelector('input[placeholder="연락처"]');

    if (buyerNameInput && loginUser.name) {
        buyerNameInput.value = loginUser.name;
    }
    if (buyerTelInput && loginUser.phone) {
        buyerTelInput.value = loginUser.phone;
    }


});


// 2. 주소 검색 (카카오 우편번호)
function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
            document.getElementById('postcode').value = data.zonecode;
            document.getElementById('address').value = addr;
            document.getElementById('detailAddress').focus();
        }
    }).open();
}

// 3. 결제 초기화 (포트원)
var IMP = window.IMP;
IMP.init("imp14397622");

let currentPayMethod = null;
let itemsToCheckout = []; // [중요] 결제할 상품들을 담을 전역 변수

// 4. 페이지 로드 시 상품 정보 렌더링
document.addEventListener('DOMContentLoaded', () => {
    const orderListEl = document.getElementById("order-list");
    const totalPriceEl = document.getElementById("checkout-total-price");
    orderListEl.innerHTML = "";

    if (loginUser.name) {
        document.querySelector('input[placeholder="이름"]').value = loginUser.name;
    }
    if (loginUser.phone) {
        document.querySelector('input[placeholder="연락처"]').value = loginUser.phone;
    }
    if (loginUser.postcode) {
        document.getElementById("postcode").value = loginUser.postcode;
    }
    if (loginUser.address) {
        document.getElementById("address").value = loginUser.address;
    }
    if (loginUser.detailAddress) {
        document.getElementById("detailAddress").value = loginUser.detailAddress;
    }

    // ✅ 사용자별 장바구니 키로 읽기
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const params = new URLSearchParams(window.location.search);
    const singleItemName = params.get('name');

    // [로직 수정] URL 파라미터가 있으면 단독 상품, 없으면 장바구니 데이터를 itemsToCheckout에 할당
    if (singleItemName) {
        // 단독 상품 결제일 때
        const rawPrice = parseInt(params.get('price'), 10) || 0;
        const rawQty = parseInt(params.get('qty'), 10) || 1;

        itemsToCheckout = [{
            name: decodeURIComponent(singleItemName),
            // [수정] 만약 이전 페이지에서 이미 수량이 곱해진 금액을 보냈다면 
            // 여기서 qty로 나눠서 '단가'를 저장하거나, 
            // 아래 계산식에서 qty를 곱하지 않아야 합니다.
            price: rawPrice / rawQty, // 금액을 수량으로 나눠서 '단가'로 강제 변환
            qty: rawQty,
            size: params.get('size') || "",
            image: params.get('image') || ""
        }];
    } else {
        itemsToCheckout = cart;
    }

    // 상품이 없는 경우 처리
    if (itemsToCheckout.length === 0) {
        orderListEl.innerHTML = "<p class='empty-msg'>결제할 상품이 없습니다.</p>";
        return;
    }

    let totalPrice = 0;
    itemsToCheckout.forEach(item => {
        const itemTotal = item.price * item.qty;
        totalPrice += itemTotal;

        const div = document.createElement('div');
        div.className = "order-item";
        div.innerHTML = `
            <img src="${item.image}" alt="상품 이미지">
            <div class="order-info">
                <p class="order-name">${item.name}</p>
                <p class="order-option">
                    수량: <span>${item.qty}</span>
                    ${item.size ? `/ 사이즈: <span>${item.size}</span>` : ''}
                </p>
            </div>
            <div class="order-price">₩${itemTotal.toLocaleString()}</div>
        `;
        orderListEl.appendChild(div);
    });

    totalPriceEl.textContent = "₩" + totalPrice.toLocaleString();
});

// 5. 결제 수단 선택
function selectPayMethod(btn, method) {
    currentPayMethod = method;
    const btns = document.querySelectorAll('#pay-methods button');
    btns.forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--accent-color)';
    });
    btn.style.background = 'var(--accent-color)';
    btn.style.color = 'var(--bg-color)';
}

// 6. 결제 요청 (실제 결제 버튼 클릭 시)
function requestPay() {
    if (!currentPayMethod) {
        alert("결제 수단을 선택해주세요.");
        return;
    }

    if (itemsToCheckout.length === 0) {
        alert("결제할 상품이 없습니다.");
        return;
    }

    const buyerName = document.querySelector('input[placeholder="이름"]').value || "테스트 구매자";
    const buyerTel = document.querySelector('input[placeholder="연락처"]').value || "010-0000-0000";
    const postcode = document.getElementById('postcode').value || "";
    const address = document.getElementById('address').value || "";
    const detailAddress = document.getElementById('detailAddress').value || "";
    const fullAddress = (address + " " + detailAddress).trim();

    // [로직 수정] 전역 변수 itemsToCheckout을 기준으로 결제 정보 생성
    let finalTotalPrice = 0;
    itemsToCheckout.forEach(item => finalTotalPrice += (item.price * item.qty));

    const orderName = itemsToCheckout.length > 1 
        ? `${itemsToCheckout[0].name} 외 ${itemsToCheckout.length - 1}건` 
        : itemsToCheckout[0].name;

    IMP.request_pay({
        pg: "html5_inicis",
        pay_method: currentPayMethod,
        merchant_uid: "order_" + new Date().getTime(),
        name: orderName,
        amount: finalTotalPrice, // 이제 단독 상품 가격이 정상 반영됩니다.
        buyer_email: "test@portone.io",
        buyer_name: buyerName,
        buyer_tel: buyerTel,
        buyer_addr: fullAddress || "주소 미입력",
        buyer_postcode: postcode || "00000"
    }, function (rsp) {
        if (rsp.success) {
            alert('결제가 완료되었습니다.');
            
            // [로직 추가] 장바구니 결제였을 때만 장바구니를 비움
            const params = new URLSearchParams(window.location.search);
            if (!params.get('name')) {
                localStorage.removeItem(cartKey);
            }
            
            window.location.href = 'index.html';
        } else {
            alert('결제에 실패하였습니다: ' + rsp.error_msg);
        }
    });
}