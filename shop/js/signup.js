function validateForm() {
    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    const errorMessage = document.getElementById("error-message");

    // 🔥 1. 빈값 체크 (추가된 부분)
    if (!name || !username || !password || !confirmPassword) {
        alert("모든 항목을 입력해주세요.");
        return false; // 제출 막기
    }

    // 🔥 2. 비밀번호 불일치 체크 (기존 코드 유지)
    if (password !== confirmPassword) {
        errorMessage.style.display = "block";
        return false;
    } else {
        errorMessage.style.display = "none";

        // 🔥 3. 회원 정보 저장
        localStorage.setItem("name", name);
        localStorage.setItem("username", username);
        localStorage.setItem("password", password);

        alert("회원가입이 완료되었습니다!");
        
        // 🔥 4. 페이지 이동
        window.location.href = "login.html";

        return false; // 👉 중요: 폼 submit 막고 JS로 처리
    }
}

// =========================
// 🔵 구글 회원가입
// =========================

function googleLogin() {
  const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";

  const redirectUri = "http://127.0.0.1:5500/shop/html/signup.html";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "token",
    scope: "profile email",
    prompt: "select_account"
  });

  window.location.href =
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}


// =========================
// 🔥 구글 회원가입/로그인 처리
// =========================

window.onload = () => {

  const hash = window.location.hash;

  if(hash.includes("access_token")){

    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(res => res.json())
    .then(data => {

      const email = data.email;
      const name = data.name;

      // 🔥 기존 회원 체크
      const existingUser = localStorage.getItem(email);

      if(existingUser){
        alert("이미 가입된 계정입니다. 로그인됩니다!");
      } else {
        // 👉 회원가입 처리
        localStorage.setItem(email, "googleUser");
        alert("회원가입 완료!");
      }

      // 👉 로그인 처리
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("username", name);

      location.href = "index.html";
    });
  }
};