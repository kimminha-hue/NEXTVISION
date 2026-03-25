// 자동 포커스
window.onload = () => {
  document.getElementById("email").focus();
};

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