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
            id: item.id || item.p_idx || item.pidx,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.img1,
            description: item.description,
            ingredients: [item.category + " 상품", "상세 정보는 AI 음성을 참고해주세요."],
            detailImages: [item.img2, item.img3].filter(img => img !== null && img !== undefined && img !== "")
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
                        </div>` : ''}
                        <div class="purchase-actions">
                            <div class="quantity-selector">
                                <span style="font-weight:500;">수량</span>
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <button type="button" class="qty-ctrl-btn" onclick="const input=document.getElementById('qty'); if(input.value>1) { input.value--; document.getElementById('total-price').innerText='₩'+(${product.price} * input.value).toLocaleString(); }">-</button>
                                    <input type="number" id="qty" value="1" readonly class="qty-input">
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
                    <img src="${img}" alt="상세이미지" class="long-detail-image" loading="lazy">
                `).join('') : ''}
            </div>
        `;

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
    const closeBtn = document.querySelector(".chatbot-close-btn"); // closeBtn 변수 추가
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
    const currentProductId = params.get('id') || '1';
    const currentCategory = params.get('category') || '기타';

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
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ko-KR";

        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                recognition.start();
                addMessage('bot', '🎙️ (말씀해 주세요...)');
            });
            // 인식 완료 시 자동 전송 로직이 필요하다면 여기에 추가
        }
    }
});

// 🔥 로그인 상태 UI 변경 (프론트 팀원 로직 유지)
document.addEventListener("DOMContentLoaded", () => {
    const isLogin = localStorage.getItem("isLogin");
    const loginBtn = document.querySelector('a[href="login.html"]');
    const signupBtn = document.querySelector('a[href="signup.html"]');
    const nav = document.querySelector('.nav-links');

    if (isLogin === "true") {
        if (loginBtn) loginBtn.style.display = "none";
        if (signupBtn) signupBtn.style.display = "none";

        const user = JSON.parse(localStorage.getItem("loginUser"));
        const username = user?.name || "사용자";

        const userLi = document.createElement("li");
        userLi.innerHTML = `<span>${username}님</span>`;

        const introLi = document.createElement("li");
        introLi.innerHTML = `<a href="../../audiview/index.html">소개페이지</a>`;

        const mypageLi = document.createElement("li");
        mypageLi.innerHTML = `<a href="mypage.html">👤마이페이지</a>`;

        const cartLi = document.createElement("li");
        cartLi.innerHTML = `<a href="cart.html">🛒장바구니</a>`;

        let adminLi = null;
        if (user && user.role === "admin") {
            adminLi = document.createElement("li");
            adminLi.innerHTML = `<a href="admin_test.html">🛠 상품등록</a>`;
        }

        const logoutLi = document.createElement("li");
        logoutLi.innerHTML = `<a href="#" id="logout-btn">로그아웃</a>`;

        const shopLink = document.querySelector('a[href="index.html"]');
        const shopLi = shopLink ? shopLink.closest('li') : null;

        if (shopLi) {
            nav.insertBefore(userLi, shopLi);    
            nav.insertBefore(introLi, shopLi);   
            nav.insertBefore(mypageLi, shopLi);  
            nav.insertBefore(cartLi, shopLi);    
            if (adminLi) nav.insertBefore(adminLi, shopLi);
            nav.insertBefore(logoutLi, shopLi);  
        } else {
            nav.append(userLi, introLi, mypageLi, cartLi);
            if (adminLi) nav.append(adminLi);
            nav.append(logoutLi);
        }   

        document.getElementById("logout-btn").addEventListener("click", () => {
            localStorage.removeItem("isLogin");
            localStorage.removeItem("loginUser");
            alert("로그아웃 되었습니다.");
            location.reload();
        });
    }
});