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

  // 기준 위치
  const shopLink = document.querySelector('a[href*="index.html"]');
  const shopLi = shopLink?.closest("li");

  if (shopLi) {
    nav.insertBefore(userLi, shopLi.nextSibling);
    nav.insertBefore(mypageLi, userLi.nextSibling);
    nav.insertBefore(cartLi, mypageLi.nextSibling);

    if (adminLi) nav.insertBefore(adminLi, cartLi.nextSibling);
    if (adminManageLi) nav.insertBefore(adminManageLi, adminLi?.nextSibling || cartLi.nextSibling);

    nav.insertBefore(logoutLi, adminManageLi?.nextSibling || cartLi.nextSibling);
  } else {
    nav.append(userLi, mypageLi, cartLi);
    if (adminLi) nav.append(adminLi);
    if (adminManageLi) nav.append(adminManageLi);
    nav.append(logoutLi);
  }

  // 로그아웃
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("loginUser");
    alert("로그아웃 되었습니다.");
    location.reload();
  });

});