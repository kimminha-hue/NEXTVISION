document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');
    
    let products = [];
    try {
        const response = await fetch('../data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        products = await response.json();
    } catch (error) {
        console.error("Failed to load data.json:", error);
        const errMsg = `<p class="error-message">데이터를 불러오는 데 실패했습니다. 개발 서버를 확인하세요.</p>`;
        if (grid) grid.innerHTML = errMsg;
        else if (detailContainer) detailContainer.innerHTML = errMsg;
        return;
    }

    // --- [1] Index Page Logic (메인 페이지) ---
    if (grid) {
        const renderProducts = (category) => {
            grid.innerHTML = '';
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            
            if (filtered.length === 0) {
                grid.innerHTML = `<p class="no-products-msg">해당 카테고리의 상품이 없습니다.</p>`;
                return;
            }
            
            filtered.forEach(product => {
                const card = document.createElement('article');
                card.classList.add('product-card');
                card.innerHTML = `
                    <a href="product.html?id=${product.id}&category=${product.category}" class="product-link">
                        <div class="product-image-wrapper">
                            <img src="../${product.image}" alt="${product.name}" class="product-image">
                        </div>
                        <div class="product-info">
                            <span class="product-category">${product.category}</span>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-price">₩${product.price.toLocaleString()}</p>
                        </div>
                    </a>
                `;
                grid.appendChild(card);
            });
        };
        renderProducts('all');

        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts(e.target.dataset.category);
            });
        });
    }

    // --- [2] Detail Page Logic (상세 페이지) ---
    if (detailContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = products.find(p => String(p.id) === String(productId));
        // 🔥 여기부터 추가
        const category = params.get('category');

        const breadcrumbCategory = document.getElementById('breadcrumb-category');

        if (breadcrumbCategory && category) {
            breadcrumbCategory.textContent = category;
        }
        // 🔥 여기까지 추가

        if (!product) {
            detailContainer.innerHTML = `
                <div class="error-state no-products-msg">
                    <h2>상품을 찾을 수 없습니다</h2>
                    <a href="index.html" class="btn btn-primary">쇼핑 홈으로 돌아가기</a>
                </div>
            `;
            return;
        }

        document.title = `${product.name} | AURA`;
        
        // 🚨 안전 장치: 요소가 있을 때만 텍스트 넣기
        const breadcrumbCurrent = document.getElementById('breadcrumb-current');
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

        const ingredientsList = product.ingredients.map(i => `<li>${i}</li>`).join('');

        // 클래스 기반의 깨끗한 HTML 구조
        detailContainer.innerHTML = `
            <div class="product-summary">
                <div class="detail-image-wrapper">
                    <img src="../${product.image}" alt="${product.name}" class="detail-image">
                </div>
                <div class="detail-content">
                    <div class="detail-header">
                        <span class="detail-category">${product.category || '기타'}</span>
                        <h1 class="detail-name">${product.name}</h1>
                        <p class="detail-price">₩${product.price.toLocaleString()}</p>

                        <!-- 평균 별점 + 대표 리뷰 -->
                        <div class="review-summary">
                            <div class="product-rating"></div>
                            <div class="highlight-review"></div>
                        </div>
                    </div>

                    <div class="purchase-actions">

                    <!-- ⭐ 여기 사이즈 들어감 -->
                        ${product.category === "의류" ? `
                        <div class="size-options">
                            <span class="size-label">사이즈 선택:</span>
                            <button class="size-btn">S</button>
                            <button class="size-btn">M</button>
                            <button class="size-btn">L</button>
                            <button class="size-btn">XL</button>
                        </div>
                        ` : ""}

                        <div class="quantity-selector">
                            <span style="font-weight:500;">수량</span>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <button type="button" class="qty-ctrl-btn" onclick="const input=document.getElementById('qty'); if(input.value>1) { input.value--; document.getElementById('total-price').innerText='₩'+(${product.price} * input.value).toLocaleString(); }">-</button>
                                <input type="number" id="qty" value="1" min="1" max="99" readonly class="qty-input">
                                <button type="button" class="qty-ctrl-btn" onclick="const input=document.getElementById('qty'); if(input.value<99) { input.value++; document.getElementById('total-price').innerText='₩'+(${product.price} * input.value).toLocaleString(); }">+</button>
                            </div>
                        </div>

                        <div class="total-price-wrapper">
                            <span>총 상품 금액</span>
                            <span id="total-price" class="total-price-value">₩${product.price.toLocaleString()}</span>
                        </div>

                        <div class="btn-group">
                            <button class="btn btn-outline" onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">장바구니</button>
                             <button class="btn btn-primary" id="buy-btn">구매하기</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="product-long-description">
                <section class="detail-section" style="display: none;">
                    <h2 class="section-title">상품 상세 설명</h2>
                    <p class="detail-description">${product.description}</p>
                </section>
                <section class="detail-section">
                    <h2 class="section-title">소재 및 정보</h2>
                    <ul class="features-list">${ingredientsList}</ul>
                </section>
                ${product.detailImages ? product.detailImages.map(img => `
                    <img src="../${img}" alt="상세이미지" class="long-detail-image" loading="lazy">
                `).join('') : ''}
            </div>
        `;

        // ⭐ 사이즈 선택 이벤트
        if (product.category === "의류") {
            const sizeButtons = document.querySelectorAll(".size-btn");

            sizeButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    sizeButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                });
            });
        }

        // ⭐ 구매 버튼 (사이즈 체크 포함)
        const buyBtn = document.getElementById("buy-btn");

        if (buyBtn) {
            buyBtn.addEventListener("click", () => {
                const qty = document.getElementById('qty').value;

                let selectedSize = "";

                // 의류일 경우 사이즈 체크
                if (product.category === "의류") {
                    const activeBtn = document.querySelector(".size-options .size-btn.active");

                    if (!activeBtn) {
                        alert("사이즈를 선택해주세요");
                        return;
                    }

                    selectedSize = activeBtn.textContent; // ✅ 정상
                }

                const totalPrice = product.price * qty;

                location.href = `checkout.html?price=${totalPrice}&name=${encodeURIComponent(product.name)}&qty=${qty}&size=${selectedSize}&image=${product.image}`;
            });
        }

            // 데이터 로드 후 product-detail.js의 함수를 이용해 별점 및 리뷰 렌더링 업데이트
            if (typeof window.updateProductReviews === 'function') {
                window.updateProductReviews();
            }

            // =========================
            // ⭐ 리뷰 작성 기능 추가
            // =========================
           function initReviewForm(productName) {
                const submitBtn = document.getElementById('submit-review');
                if (!submitBtn) return;

                let selectedRating = 0;
                const stars = document.querySelectorAll('#review-rating span');

                // 별점 선택
                stars.forEach(star => {
                    star.addEventListener('click', () => {
                        selectedRating = parseInt(star.dataset.value);
                        stars.forEach(s => s.classList.remove('active'));
                        star.classList.add('active');
                    });
                });

                // 리뷰 제출
                submitBtn.addEventListener('click', () => {
                    const content = document.getElementById('review-content').value.trim();
                    if (!content) return alert("리뷰를 입력하세요");
                    if (selectedRating === 0) return alert("별점을 선택하세요");

                    const savedData = localStorage.getItem("userData");
                    let userData = savedData ? JSON.parse(savedData) : { reviews: [] };

                    const newReview = {
                        id: Date.now(),
                        product: productName,
                        rating: selectedRating,
                        content: content
                    };

                    userData.reviews = userData.reviews || [];
                    userData.reviews.push(newReview);
                    localStorage.setItem("userData", JSON.stringify(userData));

                    alert("리뷰가 등록되었습니다!");

                    // 초기화
                    document.getElementById('review-content').value = "";
                    selectedRating = 0;
                    stars.forEach(s => s.classList.remove('active'));

                    // 리뷰 렌더링 업데이트
                    window.updateProductReviews(productName);
                });
            }

    }
});

// ===== 🔥 챗봇 기능 (진짜 AI 서버 연동 버전) =====
document.addEventListener('DOMContentLoaded', async () => {
    // 1. DOM 요소 가져오기
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatBox = document.getElementById("chatbot-box");
    const closeBtn = document.getElementById("chat-close");
    
    if (!toggleBtn || !chatBox) return; // 요소가 없으면 안전하게 중단

    const sendBtn = document.getElementById("send-btn");
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");
    const voiceBtn = document.getElementById("voice-btn"); 
    const fileInput = document.getElementById("chat-file-input"); 
    
    // 대화 세션 관리
    let isChatting = true; // 🚨 사진 없이도 바로 질문 가능하도록 무조건 true로 변경!
    const sessionId = 'session_' + Date.now();
    let userType = 'blind'; // 기본값: 시각장애인 모드
    
    const params = new URLSearchParams(window.location.search);
    const currentProductId = params.get('id') || 'ITEM_001'; 
    const currentCategory = '의류'; 

    // 📢 TTS (읽어주기) 함수 - 위쪽으로 이동시켜서 어디서든 쓸 수 있게 배치
    function readAloud(text) {
        if (!window.speechSynthesis) return; 
        if (window.speechSynthesis.isSpeaking) window.speechSynthesis.cancel();
        if (userType !== 'blind') return; // 일반 모드일 때는 읽어주지 않음
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

    // ================= 모드 변경 로직 =================
    const modeBlindBtn = document.getElementById("mode-blind");
    const modeNormalBtn = document.getElementById("mode-normal");

    if (modeBlindBtn && modeNormalBtn) {
        modeBlindBtn.addEventListener("click", () => {
            userType = 'blind'; 
            modeBlindBtn.style.background = '#eee'; 
            modeNormalBtn.style.background = 'white'; 
            const msg = '시각장애인 모드로 전환되었습니다. 상세한 음성 묘사를 제공합니다.';
            addMessage('bot', msg);
            readAloud(msg);
        });

        modeNormalBtn.addEventListener("click", () => {
            userType = 'normal'; 
            modeNormalBtn.style.background = '#eee'; 
            modeBlindBtn.style.background = 'white'; 
            addMessage('bot', '일반 사용자 모드로 전환되었습니다. 핵심 정보 위주로 안내합니다.');
            if (window.speechSynthesis) window.speechSynthesis.cancel(); // 말하던 것 즉시 멈춤
        });
    }

    // ✅ UI 토글 로직 (창 열 때 상황에 맞춰 자동 인사!)
    toggleBtn.addEventListener("click", () => {
        chatBox.classList.toggle("hidden");
        chatBox.style.zIndex = "9999"; 
        
        // 창이 닫혀있다가 처음 열렸고, 대화 기록이 없을 때만 인사
        if (!chatBox.classList.contains("hidden") && messages.children.length === 0) {
            const isDetailPage = window.location.pathname.includes('product.html');
            
            if (isDetailPage) {
                // 상세 페이지면 상품명을 화면에서 읽어와서 맞춤형 인사
                const productNameElem = document.querySelector('.detail-name');
                const productName = productNameElem ? productNameElem.innerText : '이 상품';
                const greeting = `현재 보고 계신 상품은 ${productName}입니다. 무엇이든 물어보세요.`;
                addMessage('bot', greeting);
                readAloud(greeting);
            } else {
                // 메인 페이지면 기본 인사
                const welcomeMsg = "안녕하세요! AUDIVIEW 챗봇입니다. 원하시는 상품을 말씀하시거나 사진을 올려주세요.";
                addMessage('bot', welcomeMsg);
                readAloud(welcomeMsg);
            }
        }
    });
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatBox.classList.add("hidden");
            if (window.speechSynthesis) window.speechSynthesis.cancel(); // 창 닫으면 조용히
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
                const response = await fetch('http://localhost:8000/api/chat/start', {
                    method: 'POST',
                    body: formData
                });
                if (!response.ok) throw new Error("서버 응답 오류");
                const data = await response.json();
                
                addMessage('bot', data.response);
                readAloud(data.response); 
            } catch (error) {
                console.error("챗봇 통신 에러:", error);
                addMessage('bot', '서버와 연결할 수 없습니다. 파이썬 서버가 켜져 있는지 확인해 주세요.');
            }
        });
    }

    // ⌨️ 2단계: 텍스트 발송 로직 (🚨 사진 업로드 강제 조건 삭제 완료)
    async function sendQuestionToServer() {
        if (!input || !sendBtn) return;
        
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text); 
        input.value = "";

        try {
<<<<<<< Updated upstream
            const response = await fetch('http://localhost:8000/api/chat/ask', {
=======
            const response = await fetch('http:localhost:8000/api/chat/ask', {
>>>>>>> Stashed changes
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId, user_message: text })
            });
            
            if (!response.ok) throw new Error("서버 응답 오류");
            
            const data = await response.json();
            addMessage('bot', data.response);
            readAloud(data.response); 
        } catch (error) {
            console.error("질문 전송 에러:", error);
            addMessage('bot', '답변을 받아오는 데 실패했습니다.');
        }
    }

    if (sendBtn && input) {
        sendBtn.addEventListener("click", sendQuestionToServer);
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendQuestionToServer();
        });
    }

    // 🎤 3단계: STT 로직
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ko-KR";

        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                recognition.start();
                addMessage('bot', '🎙️ (말씀해 주세요...)');
            });
        }

        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            if (input) input.value = text;
            sendQuestionToServer(); 
        };
    }
});


// 🔥 로그인 상태 UI 변경
document.addEventListener("DOMContentLoaded", () => {
    const isLogin = localStorage.getItem("isLogin");

    const loginBtn = document.querySelector('a[href="login.html"]');
    const signupBtn = document.querySelector('a[href="signup.html"]');
    const nav = document.querySelector('.nav-links');

    if (isLogin === "true") {
        // 기존 버튼 숨기기
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";

        // 사용자 이름 가져오기
        const username = localStorage.getItem("username");

        // 상단 네비게이션에 사용자 이름, 마이페이지, 장바구니, 로그아웃 버튼 추가
    const userLi = document.createElement("li");
    userLi.innerHTML = `<span>${username}님</span>`;

    const mypageLi = document.createElement("li");
    mypageLi.innerHTML = `<a href="mypage.html">👤마이페이지</a>`;

    const cartLi = document.createElement("li");
    cartLi.innerHTML = `<a href="cart.html">🛒장바구니</a>`;

    const logoutLi = document.createElement("li");
    logoutLi.innerHTML = `<a href="#" id="logout-btn">로그아웃</a>`;

    // 👉 순서대로 추가
    nav.appendChild(userLi);
    nav.appendChild(mypageLi);
    nav.appendChild(cartLi);
    nav.appendChild(logoutLi);    

        // 로그아웃 기능
        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("isLogin");
            localStorage.removeItem("username");
            alert("로그아웃 되었습니다.");
            location.reload();
        });
    }
});


// ===== 장바구니 기능 =====
function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            qty: 1,
            image: image   // 👈 이거 꼭 있어야 함
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("장바구니에 담겼습니다 🛒");
}