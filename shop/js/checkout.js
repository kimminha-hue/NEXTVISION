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

// ✅ 카카오페이 데모 시작 (결제 대기 창)
function kakaoPayDemo() {
    const totalPriceEl = document.getElementById("checkout-total-price");
    const totalAmount = totalPriceEl ? totalPriceEl.innerText : "0";

    // 1. 음성 및 진동
    const speech = new SpeechSynthesisUtterance(`카카오페이 결제창이 열렸습니다. 결제 금액은 ${totalAmount}입니다.`);
    speech.lang = "ko-KR";
    window.speechSynthesis.speak(speech);
    if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);

    // 2. 오버레이 생성
    const overlay = document.createElement('div');
    overlay.id = "kakao-loading";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 9999;
    `;

    // 3. UI 구성 (QR 코드가 들어갈 빈 div: qrcode-real 포함)
    overlay.innerHTML = `
        <style>
            @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
            .kakao-card { animation: fadeIn 0.3s ease; background:#fff; border-radius:20px; width:340px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,0.5); }
            .pulse { animation: pulse 1.5s infinite; }
            @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        </style>
        <div class="kakao-card">
            <div style="background:#FEE500; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700;">카카오페이</span>
                <span style="font-size:0.8rem;">보안결제</span>
            </div>
            <div style="padding:24px 20px;">
                <div style="background:#f8f8f8; border-radius:12px; padding:16px; text-align:center; margin-bottom:16px;">
                    <p style="font-size:0.85rem; color:#888;">결제 금액</p>
                    <p style="font-size:1.8rem; font-weight:800;">${totalAmount}</p>
                </div>
                
                <div style="border:2px solid #FEE500; border-radius:12px; padding:20px; text-align:center; background:#fff; margin-bottom:16px;">
                    <div id="qrcode-real" style="display:flex; justify-content:center; margin-bottom:10px;"></div>
                    <p style="font-size:0.85rem; color:#555; font-weight:700;">카카오톡으로 QR코드를 스캔하세요</p>
                    <p class="pulse" style="font-size:0.75rem; color:#ffb400; font-weight:bold;">결제 승인 대기 중...</p>
                </div>

                <button id="fake-confirm-btn" style="width:100%; padding:14px; background:#FEE500; border:none; border-radius:10px; font-weight:700; cursor:pointer; margin-bottom:10px;">✓ 결제 완료</button>
                <button onclick="kakaoPayCancel()" style="width:100%; padding:10px; background:transparent; border:1px solid #ddd; border-radius:10px; color:#888; cursor:pointer;">취소</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // 🚀 [중요] QR 코드 생성 로직 (반드시 appendChild 다음에 실행)
    setTimeout(() => {
        const qrContainer = document.getElementById("qrcode-real");
        if (qrContainer) {
            new QRCode(qrContainer, {
                text: `https://www.kakaopay.com/payment/${Date.now()}`,
                width: 150,
                height: 150
            });
        }
    }, 50);

    document.getElementById("fake-confirm-btn").onclick = () => showFinalStep(overlay);
}

// ✅ 결제 완료 화면
function showFinalStep(overlay) {
    const totalAmount = document.getElementById("checkout-total-price")?.innerText || "0";
    
    // 음성 안내
    const doneSpeech = new SpeechSynthesisUtterance("결제가 완료되었습니다.");
    doneSpeech.lang = "ko-KR";
    window.speechSynthesis.speak(doneSpeech);

    overlay.innerHTML = `
        <div class="kakao-card" style="text-align:center; padding:32px 24px; background:#fff; border-radius:20px; width:340px;">
            <div style="width:70px; height:70px; background:#FEE500; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:2rem;">✓</div>
            <p style="font-size:1.3rem; font-weight:800; margin-bottom:8px;">결제 완료!</p>
            <div style="background:#f8f8f8; border-radius:12px; padding:16px; text-align:left; margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span style="color:#888;">총 결제금액</span>
                    <span style="font-weight:800;">${totalAmount}</span>
                </div>
            </div>
            <button onclick="kakaoPayFinish()" style="width:100%; padding:14px; background:#FEE500; border:none; border-radius:10px; font-weight:700; cursor:pointer;">확인</button>
        </div>
    `;
}

function kakaoPayCancel() {
    document.getElementById("kakao-loading")?.remove();
    window.speechSynthesis.cancel();
}

function kakaoPayFinish() {
    document.getElementById("kakao-loading")?.remove();
    window.location.href = 'index.html';
}