   
   // 🔥 로그인 체크 추가
const isLogin = localStorage.getItem("isLogin");

if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
}
   
   
    function execDaumPostcode() {
            new daum.Postcode({
                oncomplete: function(data) {
                    var addr = ''; // 주소 변수

                    //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                    if (data.userSelectedType === 'R') { // 도로명 주소
                        addr = data.roadAddress;
                    } else { // 지번 주소
                        addr = data.jibunAddress;
                    }

                    // 우편번호와 주소 정보를 해당 필드에 넣는다.
                    document.getElementById('postcode').value = data.zonecode;
                    document.getElementById('address').value = addr;
                    // 커서를 상세주소 필드로 이동한다.
                    document.getElementById('detailAddress').focus();
                }
            }).open();
        }
   
   
    var IMP = window.IMP; 
    IMP.init("imp14397622"); // 포트원 공용 테스트 가맹점 식별코드

    // 기본 결제 수단은 null로 설정 (자동 카드 선택 방지)
    let currentPayMethod = null;
    let checkoutPrice = 0;
    let checkoutName = "All-In-Shop 상품 결제";

    document.addEventListener('DOMContentLoaded', () => {
        const params = new URLSearchParams(window.location.search);
        const price = params.get('price');
        const name = params.get('name');
        const qty = params.get('qty');      // ⭐ 추가
        const size = params.get('size');    // ⭐ 추가
        const nameEl = document.getElementById("order-name");

        if (nameEl && name) {
        nameEl.textContent = decodeURIComponent(name);
        }

        if (price) {
        checkoutPrice = parseInt(price, 10);
        const priceElement = document.getElementById('checkout-total-price');
        if (priceElement) {
            priceElement.textContent = '₩' + checkoutPrice.toLocaleString();
        }
        }
        if (name) {
            checkoutName = size ? `${name} (${size})` : name;
        }

        // ⭐ 화면 표시 (있을 때만)
        if (qty) {
            const qtyEl = document.getElementById("product-qty");
            if (qtyEl) qtyEl.textContent = qty;
        }

        
        const sizeEl = document.getElementById("product-size");
            
        if (sizeEl) {
            if (size) {
                sizeEl.textContent = size;
            } else {
                sizeEl.parentElement.style.display = "none";
            }
        }

        // ⭐ 이미지 추가
        const image = params.get('image');
        const imgEl = document.getElementById("order-image");

        if (imgEl && image) {
            imgEl.src = "../" + image;
        }

        // ⭐ 가격 표시 (주문상품 카드용)
        const orderPriceEl = document.getElementById("order-price");

        if (orderPriceEl && price) {
            orderPriceEl.textContent = '₩' + parseInt(price).toLocaleString();
        }
            

    });

    // 결제 수단 선택 함수
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

    // 결제 요청 함수
    function requestPay() {
    if (!currentPayMethod) {
        alert("결제 수단을 선택해주세요.");
        return;
    }

    const buyerName = document.querySelector('input[placeholder="이름"]').value || "테스트 구매자";
    const buyerTel = document.querySelector('input[placeholder="연락처"]').value || "010-0000-0000";
    
    const postcode = document.getElementById('postcode').value || "";
    const address = document.getElementById('address').value || "";
    const detailAddress = document.getElementById('detailAddress').value || "";
    const fullAddress = address + " " + detailAddress;

    IMP.request_pay({
        pg: "html5_inicis",
        pay_method: currentPayMethod,
        merchant_uid: "order_" + new Date().getTime(),
        name: checkoutName,      // DOMContentLoaded에서 설정된 값 사용
        amount: checkoutPrice,   // DOMContentLoaded에서 설정된 값 사용
        buyer_email: "test@portone.io",
        buyer_name: buyerName,
        buyer_tel: buyerTel,
        buyer_addr: fullAddress.trim() === "" ? "서울특별시 강남구 삼성동" : fullAddress,
        buyer_postcode: postcode === "" ? "123-456" : postcode
    }, function (rsp) {
        if (rsp.success) {
            alert('결제가 완료되었습니다. (주문번호: ' + rsp.merchant_uid + ')');
            window.location.href = 'index.html';
        } else {
            alert('결제에 실패하였습니다.\n에러 내용: ' + rsp.error_msg);
        }
    });
}