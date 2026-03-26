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

// ===== 더미 사용자 데이터 (초기값) =====
let userData = {
    name: "홍길동",
    email: "user@example.com",
    phone: "010-1234-5678",
    address: "서울시 강남구 OO로 123",
    orders: [
        { id:"ORDER_001", date:"2026-03-15", status:"배송중", total:54000,
          items:[{name:"상품1", qty:2, price:20000}, {name:"상품2", qty:1, price:14000}] },
        { id:"ORDER_002", date:"2026-02-10", status:"배송완료", total:32000,
          items:[{name:"상품3", qty:1, price:32000}] }
    ],
    reviews: [],
    coupons:[{id:"COUPON_01", discount:10, status:"active", expiry:"2026-06-30"}]
};

// 🔥 localStorage에 저장된 데이터가 있으면 불러오기
const isLogin = localStorage.getItem("isLogin");
// 🔥 현재 로그인 유저 이메일 가져오기
const email = localStorage.getItem("userEmail");
if(isLogin === "true"){
    const savedData = localStorage.getItem("userData_" + email);
    if(savedData){
        userData = JSON.parse(savedData);
    }
} else {
    // 🔥 로그아웃 상태면 데이터 초기화
    localStorage.removeItem("userData");
    location.href = "index.html";
}

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

    localStorage.setItem("userData_" + email, JSON.stringify(userData));
    alert("회원정보가 저장되었습니다!");
});

// ===== 비밀번호 모달 =====
const changeBtn = document.getElementById("change-password");
const modal = document.getElementById("password-modal");
const closeBtn = document.querySelector(".modal .close");

function resetPasswordInputs() {
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
}

changeBtn.addEventListener("click", () => modal.style.display = "flex");
closeBtn.addEventListener("click", () => { modal.style.display = "none"; resetPasswordInputs(); });
window.addEventListener("click", (e) => { if(e.target === modal){ modal.style.display = "none"; resetPasswordInputs(); }});

document.getElementById("save-password").addEventListener("click", () => {
    const current = document.getElementById("current-password").value;
    const newPw = document.getElementById("new-password").value;
    const confirmPw = document.getElementById("confirm-password").value;
    const savedPw = localStorage.getItem("password");

    if(current !== savedPw){ alert("현재 비밀번호가 틀립니다."); return; }
    if(newPw !== confirmPw){ alert("새 비밀번호가 일치하지 않습니다."); return; }

    localStorage.setItem("password", newPw);
    alert("비밀번호가 변경되었습니다.");
    modal.style.display = "none";
    resetPasswordInputs();
});

// ===== 회원탈퇴 =====
document.getElementById('delete-account').addEventListener('click', () => {
    if(!confirm("탈퇴 시 모든 정보가 삭제됩니다.\n정말 회원 탈퇴하시겠습니까?")) return;
    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    localStorage.removeItem("userData");
    alert("회원 탈퇴가 완료되었습니다.");
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
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderOrders(btn.dataset.status);
    });
});
renderOrders();

// ===== 리뷰 렌더링 & 작성/삭제/수정 =====
function getReviews() { return userData.reviews || []; }
function saveReviews(reviews){ userData.reviews = reviews; localStorage.setItem("userData", JSON.stringify(userData)); }

function renderReviews(){
    const reviewsList = document.querySelector('.reviews-list');
    reviewsList.innerHTML = "";
    const reviews = getReviews();
    if(reviews.length===0){ reviewsList.innerHTML="<p>작성한 리뷰가 없습니다.</p>"; return; }

    reviews.sort((a,b)=>b.id - a.id);
    reviews.forEach(review=>{
        const div = document.createElement('div');
        div.className='review-card';
        div.innerHTML = `
            <div class="review-content">
                <strong>${review.product || "상품명 없음"}</strong> | 작성자: ${review.user || '알 수 없음'}<br>
                ⭐ ${review.rating} / 5 <br>
                ${review.content}
            </div>
            <div class="review-actions">
                <button class="btn btn-outline edit-review">수정</button>
                <button class="btn btn-outline delete-review">삭제</button>
            </div>
        `;
        reviewsList.appendChild(div);

        // 수정
        div.querySelector('.edit-review').addEventListener('click', () => {
            const newContent = prompt("리뷰 수정", review.content);
            if(newContent !== null && newContent.trim() !== ""){
                review.content = newContent;
                localStorage.setItem("userData_" + email, JSON.stringify(userData));
                renderReviews();
            }
        });

        // 삭제
        div.querySelector('.delete-review').addEventListener('click', ()=>{
            if(confirm("리뷰를 삭제하시겠습니까?")){
                saveReviews(getReviews().filter(r=>r.id!==review.id));
                renderReviews();
            }
        });
    });
}

// ===== 리뷰 작성 버튼 연동 =====
const submitBtn = document.getElementById('submit-review');
if(submitBtn){
    const stars = document.querySelectorAll('#review-rating span');
    let selectedRating = 0;

    stars.forEach(star=>{
        star.addEventListener('click', ()=>{
            selectedRating = Number(star.dataset.value);
            stars.forEach(s=>s.classList.toggle('active', Number(s.dataset.value)<=selectedRating));
        });
    });

    submitBtn.addEventListener('click', ()=>{
        const content = document.getElementById('review-content').value.trim();
        if(!localStorage.getItem("isLogin") || !localStorage.getItem("username")){ alert("로그인 후 작성 가능합니다."); return; }
        if(!content){ alert("리뷰 내용을 입력해주세요."); return; }
        if(selectedRating===0){ alert("별점을 선택해주세요."); return; }

        const reviews = getReviews();
        reviews.push({
            id: Date.now(),
            product: document.getElementById('product-name')?.textContent || "상품명 없음",
            rating: selectedRating,
            content: content,
            user: localStorage.getItem("username")
        });
        saveReviews(reviews);

        document.getElementById('review-content').value="";
        selectedRating=0;
        stars.forEach(s=>s.classList.remove('active'));

        renderReviews();
        alert("리뷰가 등록되었습니다!");
    });
}

// 초기 리뷰 렌더링
renderReviews();

// ===== 쿠폰 렌더링 =====
const couponList = document.querySelector('.coupon-list');
const applyCouponBtn = document.getElementById('apply-coupon');
const couponCodeInput = document.getElementById('coupon-code');

function renderCoupons(){
    couponList.innerHTML = "";
    if(userData.coupons.length===0){ couponList.innerHTML="<p>등록된 쿠폰이 없습니다.</p>"; return; }
    userData.coupons.forEach(c=>{
        const div = document.createElement('div');
        div.className='coupon-card';
        div.innerHTML=`쿠폰: ${c.id} | 할인: ${c.discount}% | 상태: ${c.status} | 만료: ${c.expiry}`;
        couponList.appendChild(div);
    });
}
renderCoupons();

applyCouponBtn.addEventListener('click', ()=>{
    const code = couponCodeInput.value.trim();
    if(!code){ alert("쿠폰 코드를 입력해주세요."); return; }
    if(userData.coupons.some(c=>c.id===code)){ alert("이미 등록된 쿠폰입니다."); return; }
    userData.coupons.push({id:code, discount:5, status:"active", expiry:"2026-12-31"});
    couponCodeInput.value="";
    renderCoupons();
    localStorage.setItem("userData_" + email, JSON.stringify(userData));
    alert("쿠폰이 등록되었습니다!");
});

// ===== 로그아웃 후 정보 초기화=====
function logout(){
  localStorage.removeItem("isLogin");
  localStorage.removeItem("username");

  alert("로그아웃 되었습니다.");
  location.href = "index.html";
}