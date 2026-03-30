document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');
    
    let products = [];
    try {
        // 🚨 [복구 1] 가짜 data.json 대신 진짜 스프링부트 DB 데이터를 가져옵니다.
        const response = await fetch('http://localhost:8088/avw/api/product/list');
        if (!response.ok) throw new Error('Network response was not ok');
        const dbData = await response.json();
        
        // DB 데이터를 화면 구조에 맞게 매핑 (../ 경로 제거 포함)
        products = dbData.map(item => ({
            id: item.pidx || item.p_idx || item.pIdx || item.id, 
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description,
            image: item.img1, 
            img2: item.img2,
            img3: item.img3,
            ingredients: [item.category + " 상품", "상세 정보는 AI 음성을 참고해주세요."]
        }));
    } catch (error) {
        console.error("Failed to load DB data:", error);
        const errMsg = `<p class="error-message">데이터를 불러오는 데 실패했습니다. 서버를 확인하세요.</p>`;
        if (grid) grid.innerHTML = errMsg;
        else if (detailContainer) detailContainer.innerHTML = errMsg;
        return;
    }

    // --- [1] Index Page Logic ---
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

        if (product) {
            document.title = `${product.name} | NextVision`;
            const breadcrumbCategory = document.getElementById('breadcrumb-category');
            if (breadcrumbCategory) breadcrumbCategory.textContent = category;
            const breadcrumbCurrent = document.getElementById('breadcrumb-current');
            if (breadcrumbCurrent) breadcrumbCurrent.textContent = product.name;

            const ingredientsList = product.ingredients.map(i => `<li>${i}</li>`).join('');

            detailContainer.innerHTML = `
                <div class="product-summary">
                    <div class="detail-image-wrapper">
                        <img src="${product.image}" alt="${product.name}" class="detail-image">
                    </div>
                    <div class="detail-content">
                        <div class="detail-header">
                            <span class="detail-category">${product.category || '기타'}</span>
                            <h1 class="detail-name">${product.name}</h1>
                            <p class="detail-price">₩${product.price.toLocaleString()}</p>
                            
                            <button id="read-desc-btn" class="btn btn-outline" style="width: 100%; margin-top: 15px; border: 2px solid #00d2d3; color: #00d2d3; font-weight: bold;">
                                🔊 상품 상세 설명 AI 음성으로 듣기
                            </button>
                        </div>
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
                <div class="product-long-description">
                    <section class="detail-section">
                        <h2 class="section-title">소재 및 정보</h2>
                        <ul class="features-list">${ingredientsList}</ul>
                    </section>
                    ${product.img2 ? `<img src="${product.img2}" class="long-detail-image">` : ''}
                    ${product.img3 ? `<img src="${product.img3}" class="long-detail-image">` : ''}
                </div>
            `;

            // 🚨 [복구 3] AI 음성 듣기 버튼 클릭 이벤트
            document.getElementById('read-desc-btn').addEventListener('click', () => {
                if (!window.speechSynthesis) return;
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(product.description);
                utterance.lang = 'ko-KR';
                window.speechSynthesis.speak(utterance);
            });
        }
    }
});

// ===== 🔥 챗봇 기능 (진짜 AI 서버 연동 및 엔터키 복구 버전) =====
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatBox = document.getElementById("chatbot-box");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn"); // 🚨 추가됨
    const messages = document.getElementById("chat-messages");
    const fileInput = document.getElementById("chat-file-input");
    const sessionId = 'session_' + Date.now();
    let userType = 'blind'; // 기본값

    // URL에서 카테고리와 상품 ID 동적 추출
    const params = new URLSearchParams(window.location.search);
    const currentProductId = params.get('id') || '1';
    const currentCategory = params.get('category') || '기타';

    // 음성 출력 함수
    function readAloud(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
    }

    // 메시지창에 말풍선 추가 함수
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

    // ⌨️ [복구] 텍스트 질문 서버 전송 함수
    async function sendQuestionToServer() {
        const text = input.value.trim();
        if (!text) return;

        // 1. 화면에 내 질문 띄우기
        addMessage("user", text);
        input.value = ""; // 입력창 비우기

        // 2. 백엔드로 보낼 데이터 포장 (사진 없이 텍스트만 보냄)
        const formData = new FormData();
        formData.append('session_id', sessionId);
        formData.append('category', currentCategory);
        formData.append('user_type', userType);
        formData.append('product_id', currentProductId);
        formData.append('user_message', text); // 텍스트 질문 담기

        try {
            const response = await fetch('http://localhost:8000/api/chat/ask', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error("서버 응답 오류");
            const data = await response.json();
            
            // 3. 제미나이 답변 출력 및 읽어주기
            addMessage('bot', data.result);
            readAloud(data.result);
        } catch (error) {
            console.error("질문 전송 에러:", error);
            addMessage('bot', '답변을 받아오는 데 실패했습니다.');
        }
    }

    // 🚀 [복구] 이벤트 연결 (클릭 & 엔터)
    if (sendBtn) {
        sendBtn.addEventListener("click", sendQuestionToServer);
    }
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault(); // 엔터 시 줄바꿈 방지
                sendQuestionToServer();
            }
        });
    }

    // UI 토글 (첫 인사)
    toggleBtn.addEventListener("click", () => {
        chatBox.classList.toggle("hidden");
        if (!chatBox.classList.contains("hidden") && messages.children.length === 0) {
            const isDetailPage = window.location.pathname.includes('product.html');
            const welcomeMsg = isDetailPage 
                ? `현재 상품에 대해 궁금한 점을 물어보시거나 사진을 올려주세요.`
                : `안녕하세요! NextVision입니다. 무엇을 도와드릴까요?`;
            addMessage('bot', welcomeMsg);
            readAloud(welcomeMsg);
        }
    });

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
                const res = await fetch('http://localhost:8000/api/chat/ask', { method: 'POST', body: formData });
                const data = await res.json();
                addMessage('bot', data.result);
                readAloud(data.result);
            } catch (err) { addMessage('bot', '서버 연결 실패'); }
        });
    }
});