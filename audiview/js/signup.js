// 자동 포커스
window.onload = () => {
  document.getElementById("name").focus();
};

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