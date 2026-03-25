

// 비밀번호 보기
function togglePassword(){
  const pw = document.getElementById("password");
  pw.type = pw.type === "password" ? "text" : "password";
}

// 음성 안내
function readGuide(){
  const text = "이메일과 비밀번호를 입력한 후 로그인 버튼을 눌러주세요";
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "ko-KR";
  speechSynthesis.speak(speech);
}

// 로그인 검증
document.getElementById("loginForm").addEventListener("submit", function(e){
  e.preventDefault();

  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;

  if(!email || !pw){
    showError("이메일과 비밀번호를 입력해주세요");
    return;
  }

// ✅ 로그인 성공 처리
localStorage.setItem("isLogin", "true");
localStorage.setItem("userEmail", email);

showSuccess("로그인 성공! 메인으로 이동합니다");

setTimeout(() => {
  window.location.href = "index.html";
}, 1500);
});

// 공통 함수
function showError(msg){
  document.getElementById("error-msg").innerText = msg;

  const speech = new SpeechSynthesisUtterance(msg);
  speech.lang = "ko-KR";
  speechSynthesis.speak(speech);
}

function showSuccess(msg){
  document.getElementById("error-msg").style.color = "#4CAF50";
  document.getElementById("error-msg").innerText = msg;

  const speech = new SpeechSynthesisUtterance(msg);
  speech.lang = "ko-KR";
  speechSynthesis.speak(speech);
}


// =========================
// 🟡 카카오 로그인 (최종 완성)
// =========================
// =========================
// 🚀 페이지 로드시 실행
// =========================
window.onload = () => {
  document.getElementById("email").focus();

  // 카카오 초기화
  if (typeof Kakao !== "undefined" && !Kakao.isInitialized()) {
    Kakao.init('320d54b8a22e567cf0605a271710dc3a');
  }

  // 🔥🔥🔥 구글 로그인 후 처리 추가
  const hash = window.location.hash;

  if (hash.includes("access_token")) {

    const token = new URLSearchParams(hash.substring(1)).get("access_token");

    // 사용자 정보 가져오기
    fetch("https://www.googleapis.com/oauth2/v1/userinfo?alt=json", {
      headers: {
        Authorization: "Bearer " + token
      }
    })
    .then(res => res.json())
    .then(data => {

      const email = data.email;
      const name = data.name;

      const existingUser = localStorage.getItem(email);

      if(existingUser){
        alert("로그인 성공!");
      } else {
        localStorage.setItem(email, "googleUser");
        alert("로그인 성공!");
      }

      localStorage.setItem("isLogin", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      // 🔥 URL 깔끔하게
      window.location.href = "index.html";
    });
  }
};

// 👉 카카오 로그인 함수
function kakaoLogin(){
  Kakao.Auth.login({
    scope: 'profile_nickname',
    throughTalk: false, // 🔥 중요

    success: function(authObj){

      Kakao.API.request({
        url: '/v2/user/me',
        success: function(res){

          const nickname = res.kakao_account.profile.nickname;

          localStorage.setItem("isLogin", "true");
          localStorage.setItem("userEmail", nickname);

          alert(nickname + "님 로그인 성공!");

          location.href = "index.html";
        }
      });

    },

    fail: function(err){
      console.error(err);
      alert("카카오 로그인 실패");
    }
  });
}

// =========================
// 🔵 구글 로그인 (버튼 방식)
// =========================

function googleLogin() {
  const clientId =
    "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";
  const redirectUri = "http://127.0.0.1:5500/audiview/login.html";

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


