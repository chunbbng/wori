document.addEventListener("DOMContentLoaded", function () {
    const toggleLoginButton = document.getElementById("toggleLogin");
    const loginBanner = document.getElementById("loginBanner");
    const loginButton = document.getElementById("loginButton");
    const signupButton = document.getElementById("signupButton");
    const headerLogoutButton = document.getElementById("headerLogout");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const messageDiv = document.getElementById("message");

    // 요소들이 제대로 로드되었는지 확인
    if (!toggleLoginButton || !loginBanner || !loginButton || !signupButton || !headerLogoutButton || !messageDiv || !welcomeMessage) {
        console.error("필수 요소가 로드되지 않았습니다.");
        return;
    }

    // 로그인 상태 확인 요청
    fetch('/auth/status')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                welcomeMessage.style.display = "block";
                welcomeMessage.innerHTML = `${data.name}님 환영합니다!`;
                toggleLoginButton.textContent = "로그아웃";
                headerLogoutButton.style.display = "block"; // 로그아웃 버튼 표시
                loginButton.style.display = "none"; // 로그인 버튼 숨기기
                signupButton.style.display = "none"; // 회원가입 버튼 숨기기
            } else {
                toggleLoginButton.textContent = "로그인";
                headerLogoutButton.style.display = "none"; // 로그아웃 버튼 숨기기
            }
        })
        .catch(error => {
            console.error("오류 발생:", error);
            messageDiv.innerHTML = `오류 발생: ${error.message}`;
        });

    // 로그인/로그아웃 버튼 클릭 이벤트 리스너
    toggleLoginButton.addEventListener("click", function () {
        if (toggleLoginButton.textContent === "로그아웃") {
            // 로그아웃 처리
            fetch('/auth/logout', { method: 'POST' })
                .then(() => {
                    location.reload();  // 로그아웃 후 페이지 새로고침
                })
                .catch(error => {
                    console.error("로그아웃 오류:", error);
                    messageDiv.innerHTML = `로그아웃 오류: ${error.message}`;
                });
        } else {
            // 로그인 창 열기
            loginBanner.style.display = loginBanner.style.display === "block" ? "none" : "block";
        }
    });

    // 로그인 버튼 클릭 이벤트 리스너
    loginButton.addEventListener("click", function () {
        const formData = new FormData(document.getElementById("authForm"));
        fetch('/auth/login', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    welcomeMessage.style.display = "block"; // Show welcome message
                    welcomeMessage.innerHTML = `${data.message}님 환영합니다!`;
                    toggleLoginButton.textContent = "로그아웃";
                    headerLogoutButton.style.display = "block"; // Show logout button
                    loginBanner.style.display = "none";
                    loginButton.style.display = "none"; // Hide login button
                    signupButton.style.display = "none"; // Hide signup button
                } else {
                    messageDiv.innerHTML = `로그인 실패: ${data.message}`;
                }
            })
            .catch(error => {
                console.error("로그인 오류:", error);
                messageDiv.innerHTML = `로그인 오류: ${error.message}`;
            });
    });

    // 로그아웃 버튼 클릭 이벤트 리스너 추가
    headerLogoutButton.addEventListener("click", function () {
        fetch('/auth/logout', { method: 'POST' })
            .then(() => {
                location.reload();  // 로그아웃 후 페이지 새로고침
            })
            .catch(error => {
                console.error("로그아웃 오류:", error);
                messageDiv.innerHTML = `로그아웃 오류: ${error.message}`;
            });
    });
});
