/*

Tooplate 2143 Inner Peace

https://www.tooplate.com/view/2143-inner-peace

Free HTML CSS Template

*/

// JavaScript Document

// Mobile menu toggle
        function toggleMenu() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            if (menuToggle && navLinks) {
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
            }
        }

        // Close mobile menu when clicking a link
        document.addEventListener('DOMContentLoaded', function() {
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const menuToggle = document.querySelector('.menu-toggle');
                    const navLinksContainer = document.querySelector('.nav-links');
                    if (menuToggle && navLinksContainer) {
                        menuToggle.classList.remove('active');
                        navLinksContainer.classList.remove('active');
                    }
                });
            });

            // Active menu highlighting
            const sections = document.querySelectorAll('section');
            const menuLinks = document.querySelectorAll('.nav-link');

            if (sections.length && menuLinks.length) {
                window.addEventListener('scroll', () => {
                    let current = '';
                    sections.forEach(section => {
                        const sectionTop = section.offsetTop;
                        const sectionHeight = section.clientHeight;
                        if (window.scrollY >= (sectionTop - 200)) {
                            current = section.getAttribute('id');
                        }
                    });

                    menuLinks.forEach(link => {
                        link.classList.remove('active');
                        const href = link.getAttribute('href');
                        if (href && href.slice(1) === current) {
                            link.classList.add('active');
                        }
                    });
                });
            }

            // Smooth scrolling for anchor links
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            anchorLinks.forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href && href !== '#') {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            target.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }
                });
            });

            // Header scroll effect
            const header = document.querySelector('header');
            if (header) {
                window.addEventListener('scroll', () => {
                    if (window.scrollY > 100) {
                        header.style.background = 'rgba(255, 255, 255, 0.98)';
                        header.style.boxShadow = '0 2px 30px rgba(0, 0, 0, 0.1)';
                    } else {
                        header.style.background = 'rgba(255, 255, 255, 0.95)';
                        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.05)';
                    }
                });
            }

            // Tab functionality
            window.showTab = function(tabName) {
                const tabs = document.querySelectorAll('.tab-content');
                const buttons = document.querySelectorAll('.tab-btn');
                
                tabs.forEach(tab => {
                    tab.classList.remove('active');
                });
                
                buttons.forEach(btn => {
                    btn.classList.remove('active');
                });
                
                const targetTab = document.getElementById(tabName);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
                
                // Find and activate the clicked button
                buttons.forEach(btn => {
                    if (btn.textContent.toLowerCase().includes(tabName.toLowerCase())) {
                        btn.classList.add('active');
                    }
                });
            };

            // Form submission handler
            const contactForm = document.querySelector('.contact-form form');
            if (contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    alert('Thank you for reaching out! We will get back to you soon.');
                    e.target.reset();
                });
            }
        });

function sendMessage(){

const input = document.getElementById("chatInput");

const chatBody = document.getElementById("chatBody");

const text = input.value.trim();

if(text==="") return;

chatBody.innerHTML +=
'<div class="user-message">'+ text.replace(/\n/g, "<br>") +'</div>';

input.value="";
input.style.height = "auto";

chatBody.scrollTop = chatBody.scrollHeight;

}



function quickQuestion(text){

const input = document.getElementById("chatInput");

input.value = text;

sendMessage();

}



function startVoice(){

const recognition = new webkitSpeechRecognition();

recognition.lang="ko-KR";

recognition.start();

recognition.onresult = function(event){

const voice = event.results[0][0].transcript;

document.getElementById("chatInput").value = voice;

};

}

document.addEventListener("DOMContentLoaded", () => {

  const chatbotBtn = document.querySelector(".chatbot-toggle");

  if(chatbotBtn){
    chatbotBtn.addEventListener("keydown", function(e){
      if(e.key==="Enter" || e.key===" "){
        e.preventDefault();
        toggleChat();
      }
    });
  }

  // 🔥 여기 추가
  const chatInput = document.getElementById("chatInput");

  if(chatInput){
    chatInput.addEventListener("keydown", function(e){

      // Enter → 전송
      if(e.key === "Enter" && !e.shiftKey){
        e.preventDefault();
        sendMessage();
      }

      // Shift+Enter → 줄바꿈 (자동 허용)
    });

    // 🔥 자동 높이 조절 (선택 but 추천)
    chatInput.addEventListener("input", function(){
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

});


// 음성 출력 효과
document.addEventListener("DOMContentLoaded", () => {

  let lastSpoken = "";

  document.querySelectorAll('[tabindex="0"]').forEach(el => {

    el.addEventListener("focus", () => {

      const text = el.innerText || el.getAttribute("aria-label");

      if(!text || text === lastSpoken) return;

      lastSpoken = text;

      window.speechSynthesis.cancel();

      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = "ko-KR";

      window.speechSynthesis.speak(speech);

    });

  });

});

function toggleChat(){

const chat = document.getElementById("chatbot");

if(chat.style.display==="flex"){
chat.style.display="none";
}else{
chat.style.display="flex";

setTimeout(()=>{
document.getElementById("chatInput").focus();
},100);

}

}


// 페이지 로드시 로그인 상태 확인
window.addEventListener("DOMContentLoaded", () => {

  const isLogin = localStorage.getItem("isLogin");

  if(isLogin === "true"){
    showLoggedInUI();
  }

});

// 로그인 상태 UI 변경
function showLoggedInUI(){

  const email = localStorage.getItem("userEmail");

  document.getElementById("authArea").innerHTML = `
    <span class="user-email">${email}</span>
    <button onclick="logout()" class="logout-btn">로그아웃</button>
  `;
}

// 로그아웃
function logout(){
  localStorage.removeItem("isLogin");
  localStorage.removeItem("userEmail");

  alert("로그아웃 되었습니다");
  location.reload();
}

function goService(){
  const isLogin = localStorage.getItem("isLogin");

  if(isLogin !== "true"){
    alert("로그인 후 이용해주세요");
    location.href = "login.html";
    return;
  }

  alert("서비스 페이지로 이동!");
}


// 🔥 전역 변수 (이게 핵심)
let zoomLevel = 1;
let fontSize = 100;

// 🔍 확대 기능
function zoomIn(){
  zoomLevel += 0.1;
  if(zoomLevel > 1.5) zoomLevel = 1;
  document.body.style.zoom = zoomLevel;
}
// 🔍 화면 축소
function zoomOut(){
  zoomLevel -= 0.1;

  if(zoomLevel < 0.7) zoomLevel = 0.7; // 최소 제한

  document.body.style.zoom = zoomLevel;
}
// 🔠 글씨 확대
function increaseText(){
  fontSize += 10;
  document.body.style.fontSize = fontSize + "%";
}

// 🔠 글씨 축소
function decreaseText(){
  fontSize -= 10;
  document.body.style.fontSize = fontSize + "%";
}

// 🎨 고대비 모드
function toggleContrast(){
  document.body.classList.toggle("high-contrast");
}
