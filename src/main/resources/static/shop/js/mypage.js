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

// ===== 🔥 헤더 메뉴 렌더링 (추가된 핵심 기능) =====
function renderHeaderMenu() {
    const navLinks = document.getElementById("nav-links");
    if (!navLinks) {
        console.log("nav-links 못 찾음");
        return;
    }

    const isLoggedIn = localStorage.getItem("isLogin") === "true";
    const user = JSON.parse(localStorage.getItem("loginUser")) || {};

    console.log("헤더 렌더링", isLoggedIn, user);

    if (isLoggedIn && (user.userIdx || user.id)) {
        navLinks.innerHTML = `
            <li id="nav-intro"><a href="../../audiview/index.html">소개페이지</a></li>
            <li><a href="index.html" aria-current="page">쇼핑하기</a></li>
            <li><a href="mypage.html">마이페이지</a></li>
            <li><a href="#" id="logout-btn">로그아웃</a></li>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                logout();
            });
        }
    } else {
        navLinks.innerHTML = `
            <li id="nav-intro"><a href="../../audiview/index.html">소개페이지</a></li>
            <li><a href="index.html" aria-current="page">쇼핑하기</a></li>
            <li><a href="login.html">로그인</a></li>
            <li><a href="signup.html">회원가입</a></li>
        `;
    }
}

window.addEventListener("load", () => {
    renderHeaderMenu();
    setTimeout(renderHeaderMenu, 100);
    setTimeout(renderHeaderMenu, 500);
});

// ===== 회원정보 초기값 불러오기 =====
document.getElementById('name').value = loginUser.name || "";
document.getElementById('phone').value = loginUser.phone || "";
document.getElementById('address').value = loginUser.address || "";
document.getElementById('voiceId').value = loginUser.voiceId || "voice_05";

// ===== 회원정보 저장 =====
document.getElementById('profile-form').addEventListener('submit', async e => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const voiceId = document.getElementById('voiceId').value;

    try {
        const response = await fetch(`${API}/update/${loginUser.userIdx}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, address })
        });
        const data = await response.json();

        if (data.status === "success") {
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

function showPasswordError(message) {
    const errorBox = document.getElementById("password-error");
    if (!errorBox) {
        alert(message);
        return;
    }
    errorBox.textContent = message;
    errorBox.style.display = "block";
}

function hidePasswordError() {
    const errorBox = document.getElementById("password-error");
    if (errorBox) {
        errorBox.textContent = "";
        errorBox.style.display = "none";
    }
}

function resetPasswordInputs() {
    document.getElementById("current-password").value = "";
    document.getElementById("new-password").value = "";
    document.getElementById("confirm-password").value = "";
    hidePasswordError();
}

changeBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    resetPasswordInputs();
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
    const currentPassword = document.getElementById("current-password").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const newPasswordConfirm = document.getElementById("confirm-password").value.trim();

    hidePasswordError();

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
        showPasswordError("모든 항목을 입력해주세요.");
        return;
    }

    if (newPassword.length < 8) {
        showPasswordError("새 비밀번호는 8자 이상 입력해주세요.");
        return;
    }

    if (newPassword !== newPasswordConfirm) {
        showPasswordError("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        return;
    }

    try {
        const updateRes = await fetch(`${API}/update/${loginUser.userIdx}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPassword,
                newPassword,
                newPasswordConfirm
            })
        });

        const updateData = await updateRes.json();

        if (updateData.status === "success") {
            alert("비밀번호가 변경되었습니다.");
            modal.style.display = "none";
            resetPasswordInputs();
        } else {
            showPasswordError(updateData.message || "비밀번호 변경 실패");
        }

    } catch (err) {
        console.error(err);
        showPasswordError("서버 오류");
    }
});

// ===== 회원탈퇴 =====
document.getElementById('delete-account').addEventListener('click', async () => {
    if (!confirm("탈퇴 시 모든 정보가 삭제됩니다.\n정말 탈퇴하시겠습니까?")) return;

    try {
        const response = await fetch(`${API}/delete/${loginUser.userIdx}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (data.status === "success") {
            localStorage.clear();
            alert("회원 탈퇴 완료");
            location.href = "index.html";
        } else {
            alert(data.message);
        }

    } catch (err) {
        console.error(err);
        alert("서버 오류");
    }
});

// ===== 로그아웃 =====
function logout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.href = "index.html";
}