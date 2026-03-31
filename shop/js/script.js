document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');
    
    let products = [];
    try {
        // 호성님의 스프링부트 DB 데이터 연동
        const response = await fetch('http://localhost:8088/avw/api/product/list');
        if (!response.ok) throw new Error('백엔드 서버 응답 오류');
        
        const backendData = await response.json();
        
        // 프론트엔드 UI와 백엔드 데이터 매핑 (둘의 장점 결합)
        products = backendData.map(item => ({
            id: item.id || item.p_idx, // 백엔드의 식별자 (엔티티 설정에 따라 id 또는 p_idx)
            name: item.name,           // 상품명
            price: item.price,         // 가격
            category: item.category,   // 카테고리
            image: item.img1,          // 🌟 백엔드의 img1을 프론트의 image로 연결
            description: item.description, // 상세 설명
            ingredients: [],           // (임시) 성분이나 특징 데이터가 비어있을 때 에러 방지용
            // 🌟 img2, img3가 존재할 경우에만 배열로 묶어서 상세 이미지 란에 넣어줍니다.
            detailImages: [item.img2, item.img3,item.img4].filter(Boolean)
        }));

        console.log("백엔드에서 가져온 진짜 데이터:", products); 
        
    } catch (error) {
        console.error("데이터 연동 실패:", error);
        const errMsg = `<p class="error-message">데이터를 불러오는 데 실패했습니다. 서버가 켜져 있는지 확인해 주세요.</p>`;
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
                            <img src="${product.image}" alt="${product.name}" class="product-image">
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

    // --- [2] Detail Page Logic ---
    if (detailContainer) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');
        const product = products.find(p => String(p.id) === String(productId));
        const category = params.get('category');

        if (!product) {
            detailContainer.innerHTML = `
                <div class="error-state no-products-msg">
                    <h2>상품을 찾을 수 없습니다</h2>
                    <a href="index.html" class="btn btn-primary">쇼핑 홈으로 돌아가기</a>
                </div>
            `;
            return;
        }

        document.title = `${product.name} | NextVision`;
        
        const breadcrumbCategory = document.getElementById('breadcrumb-category');
        if (breadcrumbCategory) breadcrumbCategory.textContent = category;
        const breadcrumbCurrent = document.getElementById('breadcrumb-current');
        if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

        const ingredientsList = product.ingredients.map(i => `<li>${i}</li>`).join('');

        // 프론트엔드의 세련된 HTML 구조 유지
        detailContainer.innerHTML = `
            <div class="product-summary">
                <div class="detail-image-wrapper">
                    <img src="${product.image}" alt="${product.name}" class="detail-image">
                </div>
                <div class="detail-content">
                    <div class="detail-header detail-header-compact">
                        <span class="detail-category">${product.category || '기타'}</span>
                        <h1 class="detail-name">${product.name}</h1>
                        <p class="detail-price">₩${product.price.toLocaleString()}</p>

                        <div class="review-summary">
                            <div class="product-rating"></div>
                            <div class="highlight-review"></div>
                        </div>
                        
                        <div class="voice-audio-section-inline">
                            <p class="voice-guide">버튼을 누르면 상품의 특징과 소재를 AI가 설명해 드립니다.</p>
                            <button id="product-voice-btn" class="btn-voice-command-small">
                                <span class="voice-icon">🔊</span>
                                <span class="voice-text">상품 음성 설명 듣기</span>
                            </button>
                        </div>
                    </div>

                    <div class="purchase-actions actions-compact">
                        ${product.category === "의류" ? `
                        <div class="size-options">
                            <span class="size-label">사이즈 선택:</span>
                            <button class="size-btn">S</button>
                            <button class="size-btn">M</button>
                            <button class="size-btn">L</button>
                            <button class="size-btn">XL</button>
                            <button class="size-btn">FREE</button>
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
                    </div>
                </div>
            </div>
            <div class="product-long-description">
                <section class="detail-section" >
                    <h2 class="section-title">상품 상세 설명</h2>
                    <p class="detail-description">${product.description}</p>
                </section>
                <section class="detail-section">
                    <h2 class="section-title">소재 및 정보</h2>
                    <ul class="features-list">${ingredientsList}</ul>
                </section>
                ${product.detailImages ? product.detailImages.map(img => `
                    <img src="${img}" alt="상세이미지" class="long-detail-image" loading="lazy">
                `).join('') : ''}
            </div>
        `;
        // ==========================================
        // 🔥 여기부터 복사해서 붙여넣으세요!
        // ==========================================
        async function fetchReviews() {
            try {
                // p_idx에 현재 상품의 ID를 넣어서 호출합니다.
                const reviewRes = await fetch(`http://localhost:8088/avw/api/review/list?p_idx=${product.id}`);
                if (!reviewRes.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");
                
                const reviews = await reviewRes.json();
                
                // 위에서 만든 '빈 바구니'들을 찾아옵니다.
                const ratingContainer = document.querySelector('.product-rating');
                const reviewContainer = document.querySelector('.highlight-review');

                if (reviews.length > 0) {
                    // 리뷰가 있다면 별점 계산해서 넣기
                    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
                    if (ratingContainer) {
                        ratingContainer.innerHTML = `<span style="color:#FFD700; font-size: 1.2rem;">★</span> <strong>${avgRating}</strong> <span style="font-size: 0.9em; color: #ccc;">(${reviews.length}개의 리뷰)</span>`;
                    }
                    if (reviewContainer) {
                        reviewContainer.innerHTML = `<p style="font-style: italic; margin-top: 10px;">"${reviews[0].revContent}"</p>`;
                    }
                } else {
                    // 리뷰가 없을 때 문구
                    if (ratingContainer) ratingContainer.innerHTML = "<span style='color: #888;'>아직 별점이 없습니다.</span>";
                    if (reviewContainer) reviewContainer.innerHTML = "<span style='color: #888;'>대표 리뷰가 없습니다.</span>";
                }
            } catch (error) {
                console.error("프론트엔드 리뷰 연동 에러:", error);
            }
        }
        fetchReviews(); // 만든 함수를 바로 실행!
        // ==========================================

        // 이후 기존 코드 (voiceBtn 등...) 계속...

        // 🔥 호성님의 AI 음성 듣기 버튼 클릭 이벤트 연결
        const voiceBtn = document.getElementById('product-voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                if (!window.speechSynthesis) return;
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(product.description);
                utterance.lang = 'ko-KR';
                window.speechSynthesis.speak(utterance);
            });
        }

        // 사이즈 선택 이벤트
        if (product.category === "의류") {
            const sizeButtons = document.querySelectorAll(".size-btn");
            sizeButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    sizeButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                });
            });
        }

        // 구매 버튼 이벤트
        const buyBtn = document.getElementById("buy-btn");
        if (buyBtn) {
            buyBtn.addEventListener("click", () => {
                const qty = document.getElementById('qty').value;
                let selectedSize = "";

                if (product.category === "의류") {
                    const activeBtn = document.querySelector(".size-options .size-btn.active");
                    if (!activeBtn) {
                        alert("사이즈를 선택해주세요");
                        return;
                    }
                    selectedSize = activeBtn.textContent; 
                }

                const totalPrice = product.price * qty;
                location.href = `checkout.html?price=${totalPrice}&name=${encodeURIComponent(product.name)}&qty=${qty}&size=${selectedSize}&image=${product.image}`;
            });
        }

        if (typeof window.updateProductReviews === 'function') {
            window.updateProductReviews();
        }
    }
});

// ===== 🔥 챗봇 기능 (진짜 AI 서버 연동 및 통합 버전) =====
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatBox = document.getElementById("chatbot-box");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn"); 
    const messages = document.getElementById("chat-messages");
    const voiceBtn = document.getElementById("voice-btn"); 
    const fileInput = document.getElementById("chat-file-input"); 
    // 메인 홈페이지의 클래스(.)와 상세 페이지의 아이디(#)를 둘 다 찾도록 콤마(,)로 연결!
    const closeBtn = document.querySelector(".chatbot-close-btn, #chat-close");
    const imageBtn = document.getElementById("image-btn");

    if (imageBtn && fileInput) {
        imageBtn.addEventListener("click", () => {
            fileInput.click();
        });
    }

    let isChatting = true; 
    const sessionId = 'session_' + Date.now();
    let userType = 'blind'; 

    const params = new URLSearchParams(window.location.search);
    const isDetailPage = window.location.pathname.includes('product.html');
    
    // 🌟 메인 페이지면 'main', 상세 페이지면 해당 상품 id를 보냄
    const currentProductId = isDetailPage ? params.get('id') : 'main'; 
    const currentCategory = isDetailPage ? params.get('category') : '전체';

    function readAloud(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
    }

    function addMessage(type, textOrImg) {
        const div = document.createElement("div");
        div.classList.add("chat-message", type);
        if (type === 'user-img') {
            const img = document.createElement('img');
            img.src = textOrImg;
            img.style.maxWidth = '100%';
            div.appendChild(img);
        } else {
            div.textContent = textOrImg;
        }
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    // 모드 변경 로직
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
            if (window.speechSynthesis) window.speechSynthesis.cancel(); 
        });
    }

    // UI 토글 (호성님 첫 인사 로직 결합)
    toggleBtn.addEventListener("click", () => {
        chatBox.classList.toggle("hidden");
        chatBox.style.zIndex = "9999"; 
        
        if (!chatBox.classList.contains("hidden") && messages.children.length === 0) {
            const isDetailPage = window.location.pathname.includes('product.html');
            
            if (isDetailPage) {
                const productNameElem = document.querySelector('.detail-name');
                const productName = productNameElem ? productNameElem.innerText : '이 상품';
                const greeting = `현재 보고 계신 상품은 ${productName}입니다. 무엇이든 물어보시거나 사진을 올려주세요.`;
                addMessage('bot', greeting);
                readAloud(greeting);
            } else {
                const welcomeMsg = "안녕하세요! NextVision 챗봇입니다. 원하시는 상품을 말씀하시거나 사진을 올려주세요.";
                addMessage('bot', welcomeMsg);
                readAloud(welcomeMsg);
            }
        }
    });
    
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatBox.classList.add("hidden");
            if (window.speechSynthesis) window.speechSynthesis.cancel(); 
        });
    }

    // ⌨️ 텍스트 전송 로직
    async function sendQuestionToServer() {
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text);
        input.value = ""; 

        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('category', currentCategory);
        formData.append('user_type', userType);
        formData.append('product_id', currentProductId);
        formData.append('user_message', text); 

        try {
            const response = await fetch('http://localhost:8000/api/chat/ask', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error("서버 응답 오류");
            const data = await response.json();
            
            addMessage('bot', data.result);
            readAloud(data.result);
        } catch (error) {
            console.error("질문 전송 에러:", error);
            addMessage('bot', '답변을 받아오는 데 실패했습니다.');
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener("click", sendQuestionToServer);
    }
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); 
                sendQuestionToServer();
            }
        });
    }

    // 📷 사진 업로드 로직
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (ev) => addMessage('user-img', ev.target.result);
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('session_id', sessionId);
            formData.append('category', currentCategory);
            formData.append('user_type', userType);
            formData.append('product_id', currentProductId);
            formData.append('image', file);

            addMessage('bot', '사진을 분석 중입니다...');
            try {
                // 호성님의 로컬 파이썬 AI 서버 주소 사용
                const res = await fetch('http://localhost:8000/api/chat/ask', { method: 'POST', body: formData });
                const data = await res.json();
                addMessage('bot', data.result);
                readAloud(data.result);
            } catch (err) { 
                addMessage('bot', '서버 연결 실패. 파이썬 서버가 켜져 있는지 확인해주세요.'); 
            }
        });
    }

    // 🎤 STT 로직
    // 🎤 STT 로직 (음성 인식 완벽 적용)
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ko-KR";
        recognition.interimResults = false; // 말이 끝날 때까지 기다렸다가 한 번에 텍스트로 변환

        if (voiceBtn) {
            // 1. 마이크 버튼을 눌렀을 때
            voiceBtn.addEventListener("click", () => {
                recognition.start();
                input.placeholder = "🎙️ 듣고 있습니다..."; // 입력창 힌트 변경
                addMessage('bot', '🎙️ (말씀해 주세요...)');
            });

            // 2. 🌟 핵심: 음성 인식이 완료되어 텍스트가 나왔을 때
            recognition.addEventListener("result", (e) => {
                const transcript = e.results[0][0].transcript; // 인식된 텍스트 추출
                input.value = transcript; // 채팅 입력창에 텍스트 쏙 넣기
                
                // 시각장애인 플랫폼이므로, 텍스트 변환 후 자동으로 전송버튼을 눌러주면 훨씬 편합니다!
                sendQuestionToServer(); 
            });

            // 3. 마이크가 꺼졌을 때 (정상 종료든 에러든) 원래대로 복구
            recognition.addEventListener("end", () => {
                input.placeholder = "상품에 대해 자유롭게 질문해 주세요";
            });

            // 4. 혹시라도 에러가 났을 때
            recognition.addEventListener("error", (e) => {
                console.error("음성 인식 에러:", e.error);
                addMessage('bot', '음성을 인식하지 못했습니다. 마이크 권한을 확인하고 다시 시도해 주세요.');
            });
        }
    }
});




// ===== 장바구니 기능 =====
function addToCart(name, price, image) {
    // ✅ 사용자별 장바구니 키 사용
    const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
    const userId = loginUser.id || loginUser.username || "guest";
    const cartKey = `cart_${userId}`;

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existing = cart.find(item => item.name === name);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, qty: 1, image });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert("장바구니에 담겼습니다 🛒");
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
  if (fontSize > 150) fontSize = 150;
  document.documentElement.style.fontSize = fontSize + "%";
}

// 🔠 글씨 축소
function decreaseText(){
  fontSize -= 10;
  if (fontSize < 70) fontSize = 70; 
  document.documentElement.style.fontSize = fontSize + "%";
}

// 🎨 고대비 모드
function toggleContrast(){
  document.body.classList.toggle("high-contrast");
}
