document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("signup-form");
	const passwordInput = document.getElementById("password");
	const confirmPasswordInput = document.getElementById("confirm-password");
	const errorMessage = document.getElementById("error-message");

	const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

	function showError(message) {
		errorMessage.textContent = message;
		errorMessage.style.display = "block";
		errorMessage.style.color = "red";
	}

	function showSuccess(message) {
		errorMessage.textContent = message;
		errorMessage.style.display = "block";
		errorMessage.style.color = "green";
	}

	function hideMessage() {
		errorMessage.textContent = "";
		errorMessage.style.display = "none";
	}

	function validatePasswordUI() {
		const password = passwordInput.value;
		const confirmPassword = confirmPasswordInput.value;

		if (!password && !confirmPassword) {
			hideMessage();
			return;
		}

		if (password && password.length < 8) {
			showError("비밀번호는 8자 이상이어야 합니다.");
			return;
		}

		if (password && !passwordRegex.test(password)) {
			showError("비밀번호는 영문과 숫자를 모두 포함한 8자 이상이어야 합니다. (예: abcd1234)");
			return;
		}

		if (confirmPassword && password !== confirmPassword) {
			showError("비밀번호가 일치하지 않습니다.");
			return;
		}

		if (password && confirmPassword && password === confirmPassword) {
			showSuccess("사용 가능한 비밀번호입니다.");
			return;
		}

		hideMessage();
	}

	passwordInput.addEventListener("input", validatePasswordUI);
	confirmPasswordInput.addEventListener("input", validatePasswordUI);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const name = document.getElementById("name").value.trim();
		const username = document.getElementById("username").value.trim();
		const password = passwordInput.value;
		const confirmPassword = confirmPasswordInput.value;
		const role = document.getElementById("signup-role").value;

		if (!name || !username || !password || !confirmPassword) {
			alert("모든 항목을 입력해주세요.");
			return;
		}

		if (username.length < 4) {
			alert("아이디는 4자 이상 입력해주세요.");
			return;
		}

		if (password.length < 8) {
			showError("비밀번호는 8자 이상이어야 합니다.");
			return;
		}

		if (!passwordRegex.test(password)) {
			showError("비밀번호는 영문과 숫자를 모두 포함한 8자 이상이어야 합니다. (예: abcd1234)");
			return;
		}

		if (password !== confirmPassword) {
			showError("비밀번호가 일치하지 않습니다.");
			return;
		}

		hideMessage();

		try {
			const response = await fetch("/api/account/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					loginId: username,
					password: password,
					confirmPassword: confirmPassword,
					name: name,
					role: role
				})
			});

			const data = await response.json();

			if (data.status === "success") {
				alert("회원가입이 완료되었습니다.");
				window.location.replace("login.html");
			} else {
				showError(data.message || "회원가입에 실패했습니다.");
			}
		} catch (err) {
			console.error(err);
			alert("서버 연결 오류가 발생했습니다.");
		}
	});
});