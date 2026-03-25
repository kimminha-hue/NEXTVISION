// ===== 탭 전환 =====
const menuItems = document.querySelectorAll('.menu-item');
const tabPanels = document.querySelectorAll('.tab-panel');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const tab = item.dataset.tab;
        tabPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
    });
});

// ===== 더미 사용자 데이터 =====
let userData = {
    name: "홍길동",
    email: "user@example.com",
    phone: "010-1234-5678",
    address: "서울시 강남구 OO로 123",
    orders: [
        {
            id:"ORDER_001", date:"2026-03-15", status:"배송중", total:54000,
            items:[{name:"상품1", qty:2, price:20000}, {name:"상품2", qty:1, price:14000}]
        },
        {
            id:"ORDER_002", date:"2026-02-10", status:"배송완료", total:32000,
            items:[{name:"상품3", qty:1, price:32000}]
        }
    ],
    reviews: [
        {id:"REVIEW_001", product:"상품명1", rating:5, content:"좋아요!", date:"2026-03-18"}
    ],
    coupons:[
        {id:"COUPON_01", discount:10, status:"active", expiry:"2026-06-30"}
    ]
};

// ===== 회원정보 초기값 =====
document.getElementById('name').value = userData.name;
document.getElementById('email').value = userData.email;
document.getElementById('phone').value = userData.phone;
document.getElementById('address').value = userData.address;

// ===== 회원정보 저장 =====
document.getElementById('profile-form').addEventListener('submit', e => {
    e.preventDefault();
    userData.name = document.getElementById('name').value;
    userData.email = document.getElementById('email').value;
    userData.phone = document.getElementById('phone').value;
    userData.address = document.getElementById('address').value;
    alert("회원정보가 저장되었습니다!");
});

const changeBtn = document.getElementById("change-password");
const modal = document.getElementById("password-modal");
const closeBtn = document.querySelector(".modal .close");

// 입력값 초기화 함수
function resetPasswordInputs() {
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

// 모달 열기
changeBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

// × 버튼 클릭 시 모달 닫기 + 초기화
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetPasswordInputs(); // 🔥 초기화 추가
});

// 모달 외부 클릭 시 모달 닫기 + 초기화
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        resetPasswordInputs(); // 🔥 초기화 추가
    }
});

// 비밀번호 변경 완료 버튼
document.getElementById("save-password").addEventListener("click", () => {
    const current = document.getElementById("current-password").value;
    const newPw = document.getElementById("new-password").value;
    const confirmPw = document.getElementById("confirm-password").value;

    const savedPw = localStorage.getItem("password");

    if (current !== savedPw) {
        alert("현재 비밀번호가 틀립니다.");
        return;
    }

    if (newPw !== confirmPw) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
    }

    localStorage.setItem("password", newPw);
    alert("비밀번호가 변경되었습니다.");

    // 초기화 + 모달 닫기
    modal.style.display = "none";
    resetPasswordInputs(); // 🔥 초기화
});

// ===== 회원탈퇴 렌더링 =====
document.getElementById('delete-account').addEventListener('click', () => {
    const confirmDelete = confirm("탈퇴 시 모든 정보가 삭제됩니다.\n정말 회원 탈퇴하시겠습니까?");

    if (!confirmDelete) return;

    // 🔥 사용자 데이터 삭제
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    localStorage.removeItem("password");

    alert("회원 탈퇴가 완료되었습니다.");

    // 🔥 메인 페이지 이동
    location.href = "index.html";
});

// ===== 주문내역 렌더링 =====
const ordersList = document.querySelector('.orders-list');

function renderOrders(filter="all"){
    ordersList.innerHTML = "";
    const filteredOrders = userData.orders.filter(o => filter==="all" || o.status === filter);
    if(filteredOrders.length === 0){
        ordersList.innerHTML = "<p>해당 주문이 없습니다.</p>";
        return;
    }
    filteredOrders.forEach(order => {
        const div = document.createElement('div');
        div.className = 'order-card';
        div.innerHTML = `
            <strong>${order.id}</strong> | ${order.date} | 상태: ${order.status} | ₩${order.total.toLocaleString()}
            <button class="btn btn-outline view-details">상세보기</button>
        `;
        ordersList.appendChild(div);

        div.querySelector('.view-details').addEventListener('click', () => {
            const itemsHTML = order.items.map(item => `${item.name} x${item.qty} = ₩${item.price.toLocaleString()}`).join("<br>");
            alert(`주문 상세\n${itemsHTML}`);
        });
    });
}

// 필터 버튼
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOrders(btn.dataset.status);
    });
});

// 초기 렌더
renderOrders();

// ===== 리뷰 렌더링 =====
const reviewsList = document.querySelector('.reviews-list');

function renderReviews(){
    reviewsList.innerHTML = "";

    if(userData.reviews.length === 0){
        reviewsList.innerHTML = "<p>작성한 리뷰가 없습니다.</p>";
        return;
    }

    userData.reviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-card';

        // ⭐ 구조 변경 부분
        div.innerHTML = `
            <div class="review-content">
                <strong>${review.product}</strong> | 별점: ${review.rating} | ${review.content}
            </div>
            <div class="review-actions">
                <button class="btn btn-outline edit-review">수정</button>
                <button class="btn btn-outline delete-review">삭제</button>
            </div>
        `;

        reviewsList.appendChild(div);

        // 수정 버튼
        div.querySelector('.edit-review').addEventListener('click', () => {
            const newContent = prompt("리뷰 수정", review.content);
            if(newContent !== null){
                review.content = newContent;
                renderReviews();
            }
        });

        // 삭제 버튼
        div.querySelector('.delete-review').addEventListener('click', () => {
            if(confirm("리뷰를 삭제하시겠습니까?")){
                userData.reviews = userData.reviews.filter(r => r.id !== review.id);
                renderReviews();
            }
        });
    });
}

// 초기 렌더
renderReviews();

// ===== 쿠폰 렌더링 + 등록 =====
const couponList = document.querySelector('.coupon-list');
const applyCouponBtn = document.getElementById('apply-coupon');
const couponCodeInput = document.getElementById('coupon-code');

function renderCoupons(){
    couponList.innerHTML = "";
    if(userData.coupons.length===0){
        couponList.innerHTML = "<p>등록된 쿠폰이 없습니다.</p>";
        return;
    }
    userData.coupons.forEach(c => {
        const div = document.createElement('div');
        div.className = 'coupon-card';
        div.innerHTML = `쿠폰: ${c.id} | 할인: ${c.discount}% | 상태: ${c.status} | 만료: ${c.expiry}`;
        couponList.appendChild(div);
    });
}

// 초기 렌더
renderCoupons();

// 쿠폰 등록
applyCouponBtn.addEventListener('click', () => {
    const code = couponCodeInput.value.trim();
    if(!code) return alert("쿠폰 코드를 입력해주세요.");
    const exists = userData.coupons.some(c => c.id === code);
    if(exists) return alert("이미 등록된 쿠폰입니다.");
    userData.coupons.push({id:code, discount:5, status:"active", expiry:"2026-12-31"});
    couponCodeInput.value = "";
    renderCoupons();
    alert("쿠폰이 등록되었습니다!");
});