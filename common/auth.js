document.addEventListener("DOMContentLoaded", () => {

  const isLogin = localStorage.getItem("isLogin");
  const userData = localStorage.getItem("loginUser");

  if (isLogin !== "true" || !userData) return;

  const user = JSON.parse(userData);

  const nav = document.querySelector(".nav-links");

  // 로그인 / 회원가입 숨기기
  const loginBtn = document.querySelector('a[href*="login"]')?.parentElement;
  const signupBtn = document.querySelector('a[href*="signup"]')?.parentElement;

  if (loginBtn) loginBtn.style.display = "none";
  if (signupBtn) signupBtn.style.display = "none";

  // 🔥 메뉴 생성
  const userLi = document.createElement("li");
  userLi.innerHTML = `<span>${user.name}님</span>`;

  const mypageLi = document.createElement("li");
  mypageLi.innerHTML = `<a href="/shop/html/mypage.html">👤마이페이지</a>`;

  const cartLi = document.createElement("li");
  cartLi.innerHTML = `<a href="/shop/html/cart.html">🛒장바구니</a>`;

  const logoutLi = document.createElement("li");
  logoutLi.innerHTML = `<a href="#" id="logout-btn">로그아웃</a>`;

  // 관리자 전용
  let adminLi = null;
  let adminManageLi = null;

  if (user.role === "admin") {
    adminLi = document.createElement("li");
    adminLi.innerHTML = `<a href="/shop/html/admin_test.html">🛠 상품등록</a>`;

    adminManageLi = document.createElement("li");
    adminManageLi.innerHTML = `<a href="/shop/html/admin_products.html">📦 상품관리</a>`;
  }

// ⭐ 항상 맨 뒤에 추가
if (adminLi) nav.append(adminLi);
if (adminManageLi) nav.append(adminManageLi);

nav.append(userLi);
nav.append(mypageLi);
nav.append(logoutLi);

  // 동적으로 메뉴가 추가된 뒤 현재 페이지 밑줄(aria-current) 갱신
  if (typeof window.updateActiveNav === "function") {
    window.updateActiveNav();
  }

  // 로그아웃
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.reload();
  });

});