// ===== 탭 전환 =====
const menuItems = document.querySelectorAll(".menu-item");
const tabPanels = document.querySelectorAll(".tab-panel");

menuItems.forEach((item) => {
    item.addEventListener("click", () => {
        menuItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        const tab = item.dataset.tab;
        tabPanels.forEach((panel) => panel.classList.remove("active"));

        const targetPanel = document.getElementById(tab);
        if (targetPanel) targetPanel.classList.add("active");
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
document.getElementById("name").value = loginUser.name || "";
document.getElementById("phone").value = loginUser.phone || "";
document.getElementById("address").value = loginUser.address || "";
document.getElementById("postcode").value = loginUser.postcode || "";
document.getElementById("detail-address").value = loginUser.detailAddress || "";

// ===== 주소 검색 =====
function execDaumPostcode() {
    new daum.Postcode({
        oncomplete: function (data) {
            const addr = data.userSelectedType === "R"
                ? data.roadAddress
                : data.jibunAddress;

            document.getElementById("postcode").value = data.zonecode;
            document.getElementById("address").value = addr;
            document.getElementById("detail-address").focus();
        }
    }).open();
}

// ===== 회원정보 저장 =====
document.getElementById("profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const postcode = document.getElementById("postcode").value.trim();
    const detailAddress = document.getElementById("detail-address").value.trim();

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

changeBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

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

// ===== 회원 탈퇴 =====
document.getElementById("delete-account").addEventListener("click", async () => {
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
        {
            id: "ORDER_001",
            date: "2026-03-15",
            status: "배송중",
            total: 54000,
            items: [
                { name: "상품1", qty: 2, price: 20000 },
                { name: "상품2", qty: 1, price: 14000 }
            ]
        },
        {
            id: "ORDER_002",
            date: "2026-02-10",
            status: "배송완료",
            total: 32000,
            items: [
                { name: "상품3", qty: 1, price: 32000 }
            ]
        }
    ]
};

const ordersList = document.querySelector(".orders-list");

function renderOrders(filter = "all") {
    ordersList.innerHTML = "";

    const filteredOrders = userData.orders.filter(
        (o) => filter === "all" || o.status === filter
    );

    if (filteredOrders.length === 0) {
        ordersList.innerHTML = "<p>해당 주문이 없습니다.</p>";
        return;
    }

    filteredOrders.forEach((order) => {
        const div = document.createElement("div");
        div.className = "order-card";
        div.innerHTML = `
            <strong>${order.id}</strong> | ${order.date} | 상태: ${order.status} | ₩${order.total.toLocaleString()}
            <button class="btn btn-outline view-details">상세보기</button>
        `;
        ordersList.appendChild(div);

        div.querySelector(".view-details").addEventListener("click", () => {
            const itemsHTML = order.items
                .map((item) => `${item.name} x${item.qty} = ₩${item.price.toLocaleString()}`)
                .join("<br>");
            alert(`주문 상세\n${itemsHTML}`);
        });
    });
}

document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderOrders(btn.dataset.status);
    });
});

renderOrders();

// ===== 리뷰관리: 내가 쓴 리뷰 조회 =====
const reviewsList = document.querySelector(".reviews-list");

async function renderMyReviews() {
    if (!reviewsList) return;

    reviewsList.innerHTML = "<p>리뷰를 불러오는 중입니다...</p>";

    if (!loginUser.userIdx) {
        reviewsList.innerHTML = "<p>로그인 정보가 올바르지 않습니다.</p>";
        return;
    }

    try {
        const [reviewRes, productRes] = await Promise.all([
            fetch(`/api/review/my?user_idx=${loginUser.userIdx}`),
            fetch(`/api/product/list`)
        ]);

        if (!reviewRes.ok) throw new Error("내 리뷰 조회 실패");
        if (!productRes.ok) throw new Error("상품 목록 조회 실패");

        const reviews = await reviewRes.json();
        const products = await productRes.json();

        const productMap = {};
        products.forEach((p) => {
            const key = String(p.id ?? p.pIdx ?? "");
            productMap[key] = p;
        });

        if (!reviews.length) {
            reviewsList.innerHTML = "<p>작성한 리뷰가 없습니다.</p>";
            return;
        }

        reviewsList.innerHTML = reviews.map((review) => {
            const product = productMap[String(review.pIdx)] || {};
            const productName = product.name || product.productName || "상품명 없음";
            const productImage = product.img1 || product.image || "";
            const dateText = review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "";

            const stars = Array.from({ length: 5 }, (_, i) => {
                return `<span style="color:${i < (review.rating || 0) ? "#f5a623" : "#ccc"};">★</span>`;
            }).join("");

            const reviewImages = [review.revImg1, review.revImg2, review.revImg3]
                .filter(Boolean)
                .map((img) => `<img src="${img}" alt="리뷰 이미지" style="width:70px; height:70px; object-fit:cover; border-radius:8px; margin-right:8px;">`)
                .join("");

            return `
                <div class="review-card" style="border:1px solid #e5e5e5; border-radius:12px; padding:16px; margin-bottom:16px; background:#fff;">
                    <div style="display:flex; gap:14px; align-items:center; margin-bottom:12px;">
                        <img src="${productImage}" alt="${productName}" style="width:90px; height:90px; object-fit:cover; border-radius:10px; background:#f5f5f5;">
                        <div>
                            <strong style="display:block; font-size:16px; margin-bottom:6px;">${productName}</strong>
                            <div style="margin-bottom:6px;">${stars}</div>
                            <small style="color:#888;">${dateText}</small>
                        </div>
                    </div>

                    <p style="margin:10px 0 12px; line-height:1.6;">${review.revContent || ""}</p>

                    <div>${reviewImages}</div>
                </div>
            `;
        }).join("");
    } catch (err) {
        console.error(err);
        reviewsList.innerHTML = "<p>내 리뷰를 불러오지 못했습니다.</p>";
    }
}

renderMyReviews();

// ===== 로그아웃 =====
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}