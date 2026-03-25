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

