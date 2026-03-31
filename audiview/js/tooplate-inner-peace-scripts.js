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

// ===== 🔥 챗봇 기능 (진짜 AI 서버 연동 버전) =====
document.addEventListener('DOMContentLoaded', async () => {
    // 1. DOM 요소 가져오기
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatBox = document.getElementById("chatbot-box");
    const closeBtn = document.getElementById("chat-close");
    
    if (!toggleBtn || !chatBox) return;

    const sendBtn = document.getElementById("send-btn");
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");
    const voiceBtn = document.getElementById("voice-btn"); 
    const fileInput = document.getElementById("chat-file-input"); 
    const imageBtn = document.getElementById("image-btn");

    if (imageBtn && fileInput) {
        imageBtn.addEventListener("click", () => {
            fileInput.click();
        });
    }

    // 대화 세션 관리
    // [수정됨] 사용하지 않는 isChatting 변수 삭제
    const sessionId = 'session_' + Date.now();
    let userType = 'blind'; // 기본값: 시각장애인 모드
    
    const params = new URLSearchParams(window.location.search);
    const currentProductId = params.get('id') || 'ITEM_001'; 
    const currentCategory = '의류'; 

    // 📢 TTS (읽어주기) 함수
    function readAloud(text) {
        if (!window.speechSynthesis) return; 
        if (window.speechSynthesis.isSpeaking) window.speechSynthesis.cancel();
        if (userType !== 'blind') return; 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
    }

    // 화면에 말풍선 그리기 함수
    function addMessage(type, textOrImg) {
        if (!messages) return;
        const div = document.createElement("div");
        div.classList.add("chat-message", type); 
        
        if (type === 'user-img') {
            const img = document.createElement('img');
            img.src = textOrImg;
            img.style.maxWidth = '100%';
            img.style.borderRadius = '8px';
            div.appendChild(img);
        } else {
            div.textContent = textOrImg;
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }
    function botReply(text) {
    addMessage('bot', text);
    readAloud(text);
}

    // ================= 모드 변경 로직 =================
    const modeBlindBtn = document.getElementById("mode-blind");
    const modeNormalBtn = document.getElementById("mode-normal");

    if (modeBlindBtn && modeNormalBtn) {
        modeBlindBtn.addEventListener("click", () => {
            userType = 'blind'; 
            modeBlindBtn.style.background = '#eee'; 
            modeNormalBtn.style.background = 'white'; 
            const msg = '시각장애인 모드로 전환되었습니다. 상세한 음성 묘사를 제공합니다.';
            botReply(msg);
        });

        modeNormalBtn.addEventListener("click", () => {
            userType = 'normal'; 
            modeNormalBtn.style.background = '#eee'; 
            modeBlindBtn.style.background = 'white'; 
            addMessage('bot', '일반 사용자 모드로 전환되었습니다. 핵심 정보 위주로 안내합니다.');
            if (window.speechSynthesis) window.speechSynthesis.cancel(); 
        });
    }

    // ✅ UI 토글 로직
    toggleBtn.addEventListener("click", () => {
        chatBox.classList.toggle("hidden");
        // [수정됨] 매번 클릭할 때마다 불필요하게 스타일을 덮어씌우는 로직 삭제 (CSS에서 처리 권장)
        
        if (!chatBox.classList.contains("hidden") && messages.children.length === 0) {
            const isDetailPage = window.location.pathname.includes('product.html');
            
            if (isDetailPage) {
                const productNameElem = document.querySelector('.detail-name');
                const productName = productNameElem ? productNameElem.innerText : '이 상품';
                const greeting = `현재 보고 계신 상품은 ${productName}입니다. 무엇이든 물어보세요.`;
                botReply(greeting);
            } else {
                const welcomeMsg = "안녕하세요! AUDIVIEW 챗봇입니다. 원하시는 상품을 말씀하시거나 사진을 올려주세요.";
                botReply(welcomeMsg);
            }
        }
    });
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatBox.classList.add("hidden");
            if (window.speechSynthesis) window.speechSynthesis.cancel(); 
        });
    }

    // 📷 1단계: 사진 업로드 시 서버로 발송
    if(fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => addMessage('user-img', e.target.result);
            reader.readAsDataURL(file);

            addMessage('bot', '사진을 분석 중입니다...');

            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('category', currentCategory);
            formData.append('user_type', userType);
            formData.append('product_id', currentProductId); 
            formData.append('image', file);

            try {
                // [수정됨] API 서버 주소 확인 (텍스트 전송과 동일한 서버인지 확인 필요)
                const response = await fetch('http://223.130.161.162:8000/api/chat/start', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) throw new Error("서버 응답 오류");
                const data = await response.json();
                
                botReply(data.response); 
            } catch (error) {
                console.error("챗봇 통신 에러:", error);
                addMessage('bot', '서버와 연결할 수 없습니다. 파이썬 서버가 켜져 있는지 확인해 주세요.');
            } finally {
                // [추가됨] 같은 사진을 연속으로 올릴 수 있도록 input 초기화
                event.target.value = '';
            }
        });
    }

    // ⌨️ 2단계: 텍스트 발송 로직
    async function sendQuestionToServer() {
        if (!input) return;
        
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text); 
        input.value = "";

        try {
            // [수정됨] 사진 업로드 API와 서버 주소(IP) 일치화 (localhost -> 실제 IP)
            const response = await fetch('http://223.130.161.162:8000/api/chat/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, user_message: text })
            });
            
            if (!response.ok) throw new Error("서버 응답 오류");
            
            const data = await response.json();
            botReply(data.response); 
        } catch (error) {
            console.error("질문 전송 에러:", error);
            addMessage('bot', '답변을 받아오는 데 실패했습니다.');
        }
    }

    if (sendBtn && input) {
        sendBtn.addEventListener("click", sendQuestionToServer);
        input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendQuestionToServer();
    }
});
    }

    // 🎤 3단계: STT 로직
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ko-KR";

        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                recognition.start();
                botReply('🎙️ (말씀해 주세요...)');
            });
            recognition.onend = () => {
            voiceBtn.classList.remove("recording");
            };
        }

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (input) input.value = text;
            sendQuestionToServer(); 
        };
    }
});
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
