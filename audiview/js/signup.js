

// 비밀번호 보기
function togglePassword(){
  const pw = document.getElementById("password");
  pw.type = pw.type === "password" ? "text" : "password";
}

// 음성 안내
function readGuide(){
  const text = "이름, 이메일, 비밀번호를 입력한 후 회원가입 버튼을 눌러주세요";
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "ko-KR";
  speechSynthesis.speak(speech);
}

// 회원가입 검증
document.getElementById("signupForm").addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pw = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  if(!name || !email || !pw || !confirm){
    showError("모든 항목을 입력해주세요");
    return;
  }

  if(pw !== confirm){
    showError("비밀번호가 일치하지 않습니다");
    return;
  }

  // ✅ 회원가입 성공
  showSuccess("회원가입 완료! 로그인 페이지로 이동합니다");

  setTimeout(() => {
    window.location.href = "login.html";
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

// 에러 출력
function showError(msg){
  document.getElementById("error-msg").innerText = msg;

  const speech = new SpeechSynthesisUtterance(msg);
  speech.lang = "ko-KR";
  speechSynthesis.speak(speech);
}

// =========================
// 🟡 카카오 회원가입
// =========================

// 페이지 로드시 카카오 초기화
window.onload = () => {
  document.getElementById("name").focus();

  if (typeof Kakao !== "undefined" && !Kakao.isInitialized()) {
    Kakao.init('320d54b8a22e567cf0605a271710dc3a');
  }

  // 🔥 구글 회원가입 처리
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

      const existingUser = localStorage.getItem(email);

      if(existingUser){
        alert("이미 가입된 사용자입니다. 로그인됩니다.");
      } else {
        localStorage.setItem(email, "googleUser");

        const speech = new SpeechSynthesisUtterance("회원가입이 완료되었습니다");
        speech.lang = "ko-KR";
        speechSynthesis.speak(speech);

        alert("회원가입 완료!");
      }

      localStorage.setItem("isLogin", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", name);

      location.href = "index.html";
    });
  }
};

// 카카오 회원가입
function kakaoSignup(){
  Kakao.Auth.login({
    scope: 'profile_nickname',

    success: function(){

      Kakao.API.request({
        url: '/v2/user/me',

        success: function(res){

          const nickname = res.kakao_account.profile.nickname;

          // 🔥 기존 회원 체크
          const existingUser = localStorage.getItem(nickname);

          if(existingUser){
            alert("이미 가입된 사용자입니다. 로그인됩니다.");
          } else {
            // 👉 회원가입 처리
            localStorage.setItem(nickname, "kakaoUser");

            const speech = new SpeechSynthesisUtterance("회원가입이 완료되었습니다");
            speech.lang = "ko-KR";
            speechSynthesis.speak(speech);

            alert("회원가입 완료!");
          }

          // 👉 로그인 처리
          localStorage.setItem("isLogin", "true");
          localStorage.setItem("userEmail", nickname);

          location.href = "index.html";
        }
      });

    },

    fail: function(err){
      console.error(err);
      alert("카카오 회원가입 실패");
    }
  });
}


// =========================
// 🔵 구글 로그인 (버튼 방식)
// =========================

function googleSignup() {

  const clientId = "622053074582-mul8bneofj0v5d7qsd8m4o3rullbp1sp.apps.googleusercontent.com";
  const redirectUri = "http://127.0.0.1:5500/audiview/signup.html";

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


// 👉 로그인 성공 처리
function handleGoogleLogin(response){

  const data = JSON.parse(atob(response.credential.split('.')[1]));
  const name = data.name;

  // 기존 회원 체크
  const existingUser = localStorage.getItem(name);

  if(existingUser){
    alert("이미 가입된 사용자입니다. 로그인됩니다.");
  } else {
    localStorage.setItem(name, "googleUser");

    const speech = new SpeechSynthesisUtterance("회원가입이 완료되었습니다");
    speech.lang = "ko-KR";
    speechSynthesis.speak(speech);

    alert("회원가입 완료!");
  }

  // 로그인 상태 저장
  localStorage.setItem("isLogin", "true");
  localStorage.setItem("userEmail", name);

  location.href = "index.html";
}