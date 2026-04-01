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
document.getElementById('postcode').value = loginUser.postcode || "";
document.getElementById('detail-address').value = loginUser.detailAddress || "";

// ===== 주소 검색 =====
function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function(data) {
            const addr = data.userSelectedType === 'R'
                ? data.roadAddress
                : data.jibunAddress;
            document.getElementById('postcode').value = data.zonecode;
            document.getElementById('address').value = addr;
            document.getElementById('detail-address').focus();
        }
    }).open();
}

// ===== 회원정보 저장 =====
document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const postcode = document.getElementById('postcode').value.trim();
    const detailAddress = document.getElementById('detail-address').value.trim();

    try {
        const response = await fetch(`${API}/update/${loginUser.userIdx}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                phone,
                postcode,
                address,
                detailAddress
            })
        });
        const data = await response.json();

        if (data.status === "success") {
            loginUser.name = name;
            loginUser.phone = phone;
            loginUser.address = address;
            loginUser.postcode = postcode;
            loginUser.detailAddress = detailAddress;
            localStorage.setItem("loginUser", JSON.stringify(loginUser));
            alert("회원정보가 저장되었습니다!");
        } else {
            alert(data.message || "회원정보 저장에 실패했습니다.");
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

// ===== 비밀번호 변경 =====
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
            alert(updateData.message || "비밀번호 변경에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("서버 연결 오류가 발생했습니다.");
    }
});

// ===== 회원탈퇴 =====
document.getElementById('delete-account').addEventListener('click', async () => {
    if (!confirm("탈퇴 시 모든 정보가 삭제됩니다.\n정말 회원 탈퇴하시겠습니까?")) return;

    try {
        const response = await fetch(`${API}/delete/${loginUser.userIdx}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.status === "success") {
            localStorage.removeItem("isLogin");
            localStorage.removeItem("loginUser");
            localStorage.removeItem("userData");
            alert("회원 탈퇴가 완료되었습니다.");
            location.href = "index.html";
        } else {
            alert(data.message || "회원 탈퇴에 실패했습니다.");
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
let currentMyReviews = [];
let currentProductMap = {};

function buildStars(rating) {
    return Array.from({ length: 5 }, (_, i) => {
        const active = i < (rating || 0);
        return `<span style="color:${active ? '#f5a623' : '#cfcfcf'}; font-size:18px;">★</span>`;
    }).join("");
}

function openEditModal(review) {
    editingReviewId = review.revIdx;
    editContent.value = review.revContent || "";
    editRating = review.rating || 0;

    const product = currentProductMap[String(review.pIdx)] || {};
    editProductName.textContent = product.name || product.productName || "상품명 없음";

    starEls.forEach(s => {
        s.classList.toggle("active", Number(s.dataset.value) <= editRating);
    });

    editModal.classList.remove("hidden");
    editModal.style.display = "flex";
}

function closeEditModal() {
    editingReviewId = null;
    editRating = 0;
    editContent.value = "";
    starEls.forEach(s => s.classList.remove("active"));
    editModal.classList.add("hidden");
    editModal.style.display = "none";
}

async function fetchMyReviews() {
    const reviewRes = await fetch(`/api/review/my?user_idx=${loginUser.userIdx}`);
    if (!reviewRes.ok) throw new Error("내 리뷰 조회 실패");
    return await reviewRes.json();
}

async function fetchProducts() {
    const productRes = await fetch(`/api/product/list`);
    if (!productRes.ok) throw new Error("상품 목록 조회 실패");
    return await productRes.json();
}

async function renderMyReviews() {
    if (!reviewsList) return;

    reviewsList.innerHTML = `<p style="color:#ddd;">리뷰를 불러오는 중입니다...</p>`;

    if (!loginUser.userIdx) {
        reviewsList.innerHTML = `<p style="color:#ddd;">로그인 정보가 올바르지 않습니다.</p>`;
        return;
    }

    try {
        const [reviews, products] = await Promise.all([
            fetchMyReviews(),
            fetchProducts()
        ]);

        currentMyReviews = reviews;

        currentProductMap = {};
        products.forEach(p => {
            const key = String(p.id ?? p.pIdx ?? "");
            currentProductMap[key] = p;
        });

        if (!reviews.length) {
            reviewsList.innerHTML = `<p style="color:#ddd;">작성한 리뷰가 없습니다.</p>`;
            return;
        }

        reviewsList.innerHTML = "";

        reviews.forEach(review => {
            const product = currentProductMap[String(review.pIdx)] || {};
            const productName = product.name || product.productName || "상품명 없음";
            const productImage = product.img1 || product.image || "";
            const dateText = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "";

            const reviewImages = [review.revImg1, review.revImg2, review.revImg3]
                .filter(Boolean)
                .map(img => `
                    <img src="${img}" alt="리뷰 이미지"
                         style="width:70px; height:70px; object-fit:cover; border-radius:8px; margin-right:8px;">
                `).join("");

            const card = document.createElement("div");
            card.className = "review-card";
            card.style.background = "#fff";
            card.style.color = "#111";
            card.style.borderRadius = "16px";
            card.style.padding = "16px";
            card.style.marginBottom = "18px";
            card.style.display = "flex";
            card.style.justifyContent = "space-between";
            card.style.alignItems = "center";
            card.style.gap = "16px";

            card.innerHTML = `
                <div style="display:flex; align-items:center; gap:16px; flex:1;">
                    <img src="${productImage}" alt="${productName}"
                         style="width:92px; height:92px; object-fit:cover; border-radius:12px; background:#f5f5f5; flex-shrink:0;">

                    <div style="flex:1; min-width:0;">
                        <div style="font-size:20px; font-weight:700; color:#111; margin-bottom:6px;">
                            ${productName}
                        </div>

                        <div style="margin-bottom:6px;">
                            ${buildStars(review.rating)}
                        </div>

                        <div style="font-size:14px; color:#666; margin-bottom:10px;">
                            ${dateText}
                        </div>

                        <div style="font-size:16px; color:#222; line-height:1.6; word-break:break-word; margin-bottom:10px;">
                            ${review.revContent || ""}
                        </div>

                        <div>${reviewImages}</div>
                    </div>
                </div>

                <div class="review-actions" style="display:flex; flex-direction:column; gap:8px; flex-shrink:0;">
                    <button class="btn btn-outline edit-review" data-id="${review.revIdx}">수정</button>
                    <button class="btn btn-outline delete-review" data-id="${review.revIdx}">삭제</button>
                </div>
            `;

            card.querySelector(".edit-review").addEventListener("click", () => {
                openEditModal(review);
            });

            card.querySelector(".delete-review").addEventListener("click", async () => {
                if (!confirm("리뷰를 삭제하시겠습니까?")) return;

                try {
                    const res = await fetch(`/api/review/delete/${review.revIdx}`, {
                        method: "DELETE"
                    });

                    const data = await res.json();

                    if (data.status === "success") {
                        alert("리뷰가 삭제되었습니다.");
                        await renderMyReviews();
                    } else {
                        alert(data.message || "리뷰 삭제에 실패했습니다.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("리뷰 삭제 중 오류가 발생했습니다.");
                }
            });

            reviewsList.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        reviewsList.innerHTML = `<p style="color:#ddd;">내 리뷰를 불러오지 못했습니다.</p>`;
    }
}

starEls.forEach(star => {
    star.addEventListener("click", () => {
        editRating = Number(star.dataset.value);
        starEls.forEach(s => {
            s.classList.toggle("active", Number(s.dataset.value) <= editRating);
        });
    });
});

saveEditBtn.addEventListener("click", async () => {
    const newContent = editContent.value.trim();

    if (!newContent) {
        alert("내용을 입력해주세요.");
        return;
    }

    if (editRating === 0) {
        alert("별점을 선택해주세요.");
        return;
    }

    try {
        const res = await fetch(`/api/review/update/${editingReviewId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                rating: editRating,
                rev_content: newContent
            })
        });

        const data = await res.json();

        if (data.status === "success") {
            alert("수정 완료!");
            closeEditModal();
            await renderMyReviews();
        } else {
            alert(data.message || "리뷰 수정에 실패했습니다.");
        }
    } catch (err) {
        console.error(err);
        alert("리뷰 수정 중 오류가 발생했습니다.");
    }
});

cancelEditBtn.addEventListener("click", closeEditModal);

window.addEventListener("click", (e) => {
    if (e.target === editModal) {
        closeEditModal();
    }
});

renderMyReviews();

// ===== 로그아웃 =====
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}