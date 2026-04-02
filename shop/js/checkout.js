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

function kakaoPayDemo() {
    // 1단계 — 음성 안내 및 로딩 시작
    const speech = new SpeechSynthesisUtterance("카카오톡으로 이동합니다. 결제창을 확인해주세요.");
    speech.lang = "ko-KR";
    window.speechSynthesis.speak(speech);

    const overlay = document.createElement('div');
    overlay.id = "kakao-loading";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.85);
        display: flex; align-items: center; justify-content: center;
        z-index: 9999; font-family: 'Pretendard', sans-serif;
    `;
    
    // 초기 로딩 화면
    overlay.innerHTML = `
        <div id="kakao-step-container" style="text-align:center; color:white;">
            <img src="../images/kakao.png" style="width:70px; height:70px; border-radius:16px; margin-bottom:20px;">
            <p style="font-size:1.3rem; font-weight:600;">카카오페이 결제 요청 중...</p>
            <div class="spinner" style="width:40px; height:40px; border:4px solid #FEE500; border-top-color:transparent; border-radius:50%; animation:spin 0.8s linear infinite; margin:20px auto;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 2단계 — 1.5초 후 '가짜 결제 대기창' 표시 (이게 "결제 시늉"의 핵심입니다)
    setTimeout(() => {
        const container = document.getElementById("kakao-step-container");
        container.innerHTML = `
            <div style="background:#fff; color:#000; padding:30px; border-radius:20px; width:320px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                <div style="display:flex; justify-content:center; align-items:center; gap:8px; margin-bottom:20px;">
                    <img src="../images/kakao_pay_logo.png" alt="kakaopay" style="height:20px;"> <span style="font-weight:bold; font-size:1.1rem;">결제하기</span>
                </div>
                <div style="background:#f9f9f9; padding:20px; border-radius:12px; margin-bottom:20px;">
                    <p style="font-size:0.9rem; color:#666; margin-bottom:5px;">결제 금액</p>
                    <p style="font-size:1.5rem; font-weight:800; color:#000;">${document.getElementById('total-price')?.innerText || '연습용'}원</p>
                </div>
                <div style="border:2px dashed #ddd; padding:20px; border-radius:10px; margin-bottom:20px;">
                    <p style="font-size:0.85rem; color:#888;">스마트폰에서<br><b>결제 승인</b>을 완료해주세요.</p>
                </div>
                <button id="fake-confirm-btn" style="width:100%; padding:12px; background:#FEE500; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">결제 완료 테스트</button>
                <p style="font-size:0.8rem; color:#aaa; margin-top:15px; cursor:pointer;" onclick="kakaoPayFinish()">취소하기</p>
            </div>
        `;

        // 가짜 결제 완료 버튼 클릭 시 최종 단계로 이동
        document.getElementById("fake-confirm-btn").onclick = () => {
            showFinalStep(overlay);
        };
    }, 1500);
}

function showFinalStep(overlay) {
    // 3단계 — 최종 완료 화면
    overlay.innerHTML = `
        <div style="background: #111; border: 2px solid #FEE500; border-radius: 20px; padding: 2.5rem 2rem; text-align: center; max-width: 340px; width: 90%; display: flex; flex-direction: column; align-items: center; gap: 16px;">
            <div style="font-size:3.5rem;">✅</div>
            <p style="font-size:1.4rem; font-weight:700; color:#FEE500;">결제가 완료되었습니다!</p>
            <p style="font-size:0.95rem; color:#aaa;">정상적으로 주문이 접수되었습니다.</p>
            <button onclick="kakaoPayFinish()" style="width: 100%; padding: 0.9rem; background: #FEE500; color: #000; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 8px;">확인</button>
        </div>
    `;

    const doneSpeech = new SpeechSynthesisUtterance("결제가 정상적으로 완료되었습니다. 감사합니다.");
    doneSpeech.lang = "ko-KR";
    window.speechSynthesis.speak(doneSpeech);
}