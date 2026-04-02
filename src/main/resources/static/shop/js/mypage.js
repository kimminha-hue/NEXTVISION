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

// ===== 로그인 체크 및 유저 정보 =====
const isLogin = localStorage.getItem("isLogin");
const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};

if (isLogin !== "true") {
    localStorage.removeItem("userData");
    location.href = "index.html";
}

const API = "/api/account";

// ===== 회원정보 초기값 불러오기 =====
document.getElementById('name').value = loginUser.name || "";
document.getElementById('phone').value = loginUser.phone || "";    
document.getElementById('address').value = loginUser.address || "";
document.getElementById('voiceId').value = loginUser.voiceId || "voice_05";

// ===== 회원정보 저장 =====
document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim()
    const phone = document.getElementById('phone').value.trim();    
    const address = document.getElementById('address').value.trim();
	const voiceId = document.getElementById('voiceId').value;

    try {
        // ✅ DB API 호출
        const response = await fetch(`${API}/update/${loginUser.userIdx}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, address })
        });
        const data = await response.json();

        if (data.status === "success") {
            // ✅ localStorage도 업데이트
            loginUser.name = name;
            loginUser.phone = phone;
            loginUser.address = address;
			loginUser.voiceId = voiceId;
            localStorage.setItem("loginUser", JSON.stringify(loginUser));
            alert("회원정보가 저장되었습니다!");
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }
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
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    resetPasswordInputs();
});
window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
        resetPasswordInputs();
    }
});

// ✅ 비밀번호 변경 — DB 연동
document.getElementById("save-password").addEventListener("click", async () => {
    const current = document.getElementById("current-password").value;
    const newPw = document.getElementById("new-password").value;
    const confirmPw = document.getElementById("confirm-password").value;

    if (!current || !newPw || !confirmPw) {
        alert("모든 항목을 입력해주세요.");
        return;
    }
    if (newPw !== confirmPw) {
        alert("새 비밀번호가 일치하지 않습니다.");
        return;
    }
    if (newPw.length < 6) {
        alert("비밀번호는 6자 이상 입력해주세요.");
        return;
    }

    try {
        // ✅ 현재 비밀번호 확인 (로그인 API 재사용)
        const checkRes = await fetch(`${API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: loginUser.id,
                pw: current
            })
        });
        const checkData = await checkRes.json();

        if (checkData.status !== "success") {
            alert("현재 비밀번호가 틀립니다.");
            return;
        }

        // ✅ 새 비밀번호로 변경
        const updateRes = await fetch(`${API}/update/${loginUser.userIdx}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pw: newPw })
        });
        const updateData = await updateRes.json();

        if (updateData.status === "success") {
            alert("비밀번호가 변경되었습니다.");
            modal.style.display = "none";
            resetPasswordInputs();
        } else {
            alert(updateData.message);
        }

    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }
});

// ✅ 회원탈퇴 — DB 연동
document.getElementById('delete-account').addEventListener('click', async () => {
    if (!confirm("탈퇴 시 모든 정보가 삭제됩니다.\n정말 회원 탈퇴하시겠습니까?")) return;

    try {
        const response = await fetch(`${API}/delete/${loginUser.userIdx}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.status === "success") {
            // ✅ localStorage 초기화
            localStorage.removeItem("isLogin");
            localStorage.removeItem("loginUser");
            localStorage.removeItem("userData");
            alert("회원 탈퇴가 완료되었습니다.");
            location.href = "index.html";
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }
});

// ===== 주문내역 렌더링 =====
let userData = {
    orders: [
        { id:"ORDER_001", date:"2026-03-15", status:"배송중", total:54000,
          items:[{name:"상품1", qty:2, price:20000}, {name:"상품2", qty:1, price:14000}] },
        { id:"ORDER_002", date:"2026-02-10", status:"배송완료", total:32000,
          items:[{name:"상품3", qty:1, price:32000}] }
    ]
};

const ordersList = document.querySelector('.orders-list');
function renderOrders(filter="all") {
    ordersList.innerHTML = "";
    const filteredOrders = userData.orders.filter(o => filter==="all" || o.status === filter);
    if (filteredOrders.length === 0) {
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
            const itemsHTML = order.items.map(item =>
                `${item.name} x${item.qty} = ₩${item.price.toLocaleString()}`
            ).join("<br>");
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

// ===== 리뷰 관련 =====
const reviewsList = document.querySelector('.reviews-list');
const editModal = document.getElementById("edit-modal");
const editContent = document.getElementById("edit-content");
const editProductName = document.getElementById("edit-product-name");
const saveEditBtn = document.getElementById("save-edit");
const cancelEditBtn = document.getElementById("cancel-edit");
const starEls = document.querySelectorAll("#edit-stars span");
let editingReviewId = null;
let editRating = 0;

const currentUserEmail = loginUser.id || loginUser.email || "guest";
const currentUserName = loginUser.name || "알 수 없음";

function renderMyReviews() {
    if (!reviewsList) return;
    reviewsList.innerHTML = "";
    const allReviews = JSON.parse(localStorage.getItem("all_reviews")) || [];
    const myReviews = allReviews.filter(r =>
        r.userEmail === currentUserEmail
    );

    if (myReviews.length === 0) {
        reviewsList.innerHTML = "<p>작성한 리뷰가 없습니다.</p>";
        return;
    }

    myReviews.sort((a, b) => b.id - a.id);
    myReviews.forEach(review => {
        const div = document.createElement('div');
        div.className = 'review-card';
        div.innerHTML = `
            <div class="review-content">
                <strong>${review.product || "상품명 없음"}</strong><br>
                ⭐ ${review.rating} / 5 <br>
                <p>${review.content}</p>
                <small style="color:#999;">${review.date || ""}</small>
            </div>
            <div class="review-actions">
                <button class="btn btn-outline edit-review" data-id="${review.id}">수정</button>
                <button class="btn btn-outline delete-review" data-id="${review.id}">삭제</button>
            </div>
        `;
        reviewsList.appendChild(div);

        div.querySelector('.delete-review').onclick = () => {
            if (!confirm("리뷰를 삭제하시겠습니까?")) return;
            const updated = allReviews.filter(r => r.id !== review.id);
            localStorage.setItem("all_reviews", JSON.stringify(updated));
            renderMyReviews();
        };

        div.querySelector('.edit-review').onclick = () => {
            editingReviewId = review.id;
            editContent.value = review.content;
            editProductName.textContent = review.product || "상품명 없음";
            editRating = review.rating;
            starEls.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= editRating));
            editModal.classList.remove("hidden");
        };
    });
}
renderMyReviews();

starEls.forEach(star => {
    star.addEventListener("click", () => {
        editRating = Number(star.dataset.value);
        starEls.forEach(s => s.classList.toggle("active", Number(s.dataset.value) <= editRating));
    });
});

saveEditBtn.addEventListener("click", () => {
    const newContent = editContent.value.trim();
    if (!newContent) { alert("내용을 입력해주세요."); return; }
    const allReviews = JSON.parse(localStorage.getItem("all_reviews")) || [];
    const updatedReviews = allReviews.map(r =>
        r.id === editingReviewId ? { ...r, content: newContent, rating: editRating } : r
    );
    localStorage.setItem("all_reviews", JSON.stringify(updatedReviews));
    alert("수정 완료!");
    editModal.classList.add("hidden");
    renderMyReviews();
});

cancelEditBtn.addEventListener("click", () => editModal.classList.add("hidden"));

// ===== 로그아웃 =====
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}