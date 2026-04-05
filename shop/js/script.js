document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('product-grid');
    const detailContainer = document.getElementById('product-detail-container');

    let products = [];
    try {
        const response = await fetch('/avw/api/product/list');
        if (!response.ok) throw new Error('백엔드 서버 응답 오류');

        const backendData = await response.json();

        products = backendData.map(item => ({
            id: item.p_idx || item.id,
            name: item.p_name || item.name,
            price: item.p_price || item.price,
            category: item.p_category || item.category,
            image: item.img1,
            description: item.p_desc || item.description,
            ingredients: [],
            detailImages: [item.img2, item.img3, item.img4].filter(Boolean)
        }));

        window.globalProductsList = products;
        console.log("백엔드에서 가져온 진짜 데이터:", products);

    } catch (error) {
        console.error("데이터 연동 실패:", error);
        const errMsg = `<p class="error-message">데이터를 불러오는 데 실패했습니다.</p>`;
        if (grid) grid.innerHTML = errMsg;
        else if (detailContainer) detailContainer.innerHTML = errMsg;
        return;
    }

    if (grid) {
        const renderProducts = (category) => {
            grid.innerHTML = '';
            const filtered = category === 'all'
                ? products
                : products.filter(p => p.category === category);

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
                            <div style="display:flex; align-items:center; gap:1rem;">
                                <button type="button" class="qty-ctrl-btn" onclick="const input=document.getElementById('qty'); if(input.value>1){input.value--;document.getElementById('total-price').innerText='₩'+(${product.price}*input.value).toLocaleString();}">-</button>
                                <input type="number" id="qty" value="1" min="1" max="99" readonly class="qty-input">
                                <button type="button" class="qty-ctrl-btn" onclick="const input=document.getElementById('qty'); if(input.value<99){input.value++;document.getElementById('total-price').innerText='₩'+(${product.price}*input.value).toLocaleString();}">+</button>
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

        async function fetchReviews() {
            try {
                const reviewRes = await fetch(`/avw/api/review/list?p_idx=${product.id}`);
                if (!reviewRes.ok) throw new Error("리뷰 데이터를 불러올 수 없습니다.");
                const reviews = await reviewRes.json();

                const ratingContainer = document.querySelector('.product-rating');
                const reviewContainer = document.querySelector('.highlight-review');

                if (reviews.length > 0) {
                    const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
                    if (ratingContainer) {
                        ratingContainer.innerHTML = `<span style="color:#FFD700;">★</span> <strong>${avgRating}</strong> <span style="font-size:0.9em; color:#ccc;">(${reviews.length}개의 리뷰)</span>`;
                    }
                    if (reviewContainer) {
                        reviewContainer.innerHTML = `<p style="font-style:italic;">"${reviews[0].revContent}"</p>`;
                    }
                } else {
                    if (ratingContainer) ratingContainer.innerHTML = "<span style='color:#888;'>아직 별점이 없습니다.</span>";
                    if (reviewContainer) reviewContainer.innerHTML = "<span style='color:#888;'>대표 리뷰가 없습니다.</span>";
                }
            } catch (error) {
                console.error("리뷰 연동 에러:", error);
            }
        }
        fetchReviews();

        const voiceBtn = document.getElementById('product-voice-btn');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', async () => {
                const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
                const voiceId = loginUser.voiceId || "voice_05";

                try {
                    const res = await fetch("/api/tts", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            text: product.description,
                            voiceId: voiceId
                        })
                    });

                    if (!res.ok) throw new Error("TTS 요청 실패");

                    const audioBlob = await res.blob();
                    const audioUrl = URL.createObjectURL(audioBlob);

                    const audio = new Audio(audioUrl);
                    await audio.play();
                } catch (err) {
                    console.error("상품 TTS 재생 실패:", err);
                    alert("음성 재생 실패");
                }
            });
        }

        if (product.category === "의류") {
            const sizeButtons = document.querySelectorAll(".size-btn");
            sizeButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    sizeButtons.forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                });
            });
        }

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

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("chatbot-toggle");
    const chatBox = document.getElementById("chatbot-box");
    const input = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const messages = document.getElementById("chat-messages");
    const voiceBtn = document.getElementById("voice-btn");
    const fileInput = document.getElementById("chat-file-input");
    const closeBtn = document.querySelector(".chatbot-close-btn, #chat-close");
    const imageBtn = document.getElementById("image-btn");

    if (!toggleBtn || !chatBox || !messages) return;

    if (imageBtn && fileInput) {
        imageBtn.addEventListener("click", () => fileInput.click());
    }

    const sessionId = 'session_' + Date.now();
    let userType = 'blind';

    const params = new URLSearchParams(window.location.search);
    const isDetailPage = window.location.pathname.includes('product.html');
    const currentProductId = isDetailPage ? params.get('id') : 'main';
    const currentCategory = isDetailPage ? params.get('category') : '전체';

    async function speakWithUserVoice(text) {
        const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
        const voiceId = loginUser.voiceId || "voice_05";

        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    text,
                    voiceId
                })
            });

            if (!res.ok) throw new Error("TTS 요청 실패");

            const audioBlob = await res.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            await audio.play();
        } catch (err) {
            console.error("챗봇 TTS 실패:", err);
        }
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

    const modeBlindBtn = document.getElementById("mode-blind");
    const modeNormalBtn = document.getElementById("mode-normal");

    if (modeBlindBtn && modeNormalBtn) {
        modeBlindBtn.addEventListener("click", async () => {
            userType = 'blind';
            modeBlindBtn.style.background = '#eee';
            modeNormalBtn.style.background = 'white';
            const msg = '시각장애인 모드로 전환되었습니다.';
            addMessage('bot', msg);
            await speakWithUserVoice(msg);
        });

        modeNormalBtn.addEventListener("click", () => {
            userType = 'normal';
            modeNormalBtn.style.background = '#eee';
            modeBlindBtn.style.background = 'white';
            addMessage('bot', '일반 사용자 모드로 전환되었습니다.');
        });
    }

    toggleBtn.addEventListener("click", async () => {
        chatBox.classList.toggle("hidden");
        chatBox.style.zIndex = "9999";

        if (!chatBox.classList.contains("hidden") && messages.children.length === 0) {
            if (isDetailPage) {
                const productName = document.querySelector('.detail-name')?.innerText || '이 상품';
                const greeting = `현재 보고 계신 상품은 ${productName}입니다. 무엇이든 물어보시거나 사진을 올려주세요.`;
                addMessage('bot', greeting);
                await speakWithUserVoice(greeting);
            } else {
                const welcomeMsg = "안녕하세요! NextVision 챗봇입니다.";
                addMessage('bot', welcomeMsg);
                await speakWithUserVoice(welcomeMsg);
            }
        }
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            chatBox.classList.add("hidden");
        });
    }

    async function sendQuestionToServer() {
        const text = input.value.trim();
        if (!text) return;

        addMessage("user", text);
        input.value = "";

        let targetProduct = null;
        if (isDetailPage && window.globalProductsList) {
            targetProduct = window.globalProductsList.find(
                p => String(p.id) === String(currentProductId)
            );
        }

        const payload = {
            session_id: String(sessionId),
            user_type: String(userType),
            product_id: parseInt(currentProductId) || 0,
            category: String(currentCategory || "전체"),
            question: String(text),
            product_name: String(targetProduct ? targetProduct.name : "메인페이지"),
            image_urls: targetProduct
                ? [targetProduct.image, ...(targetProduct.detailImages || [])].filter(Boolean)
                : []
        };

        try {
            const response = await fetch('/api/analyze-screen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorDetail = await response.json();
                console.error("서버 에러:", errorDetail);
                throw new Error("서버 응답 오류");
            }
            const data = await response.json();
            addMessage('bot', data.result);
            await speakWithUserVoice(data.result);
        } catch (error) {
            console.error("질문 전송 에러:", error);
            addMessage('bot', '답변을 받아오는 데 실패했습니다.');
        }
    }

    if (sendBtn) sendBtn.addEventListener("click", sendQuestionToServer);
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                sendQuestionToServer();
            }
        });
    }

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
                const res = await fetch('/api/analyze-screen-upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                addMessage('bot', data.result);
                await speakWithUserVoice(data.result);
            } catch (err) {
                addMessage('bot', '서버 연결 실패. 다시 시도해주세요.');
            }
        });
    }

    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = "ko-KR";
        recognition.interimResults = false;

        if (voiceBtn) {
            voiceBtn.addEventListener("click", () => {
                recognition.start();
                input.placeholder = "🎙️ 듣고 있습니다...";
                addMessage('bot', '🎙️ (말씀해 주세요...)');
            });

            recognition.addEventListener("result", (e) => {
                const transcript = e.results[0][0].transcript;
                input.value = transcript;

                const buyKeywords = ["결제", "살래", "구매", "사고 싶어", "주문"];
                const isBuyCommand = buyKeywords.some(k => transcript.includes(k));

                if (isBuyCommand && isDetailPage) {
                    addMessage('user', transcript);
                    const buyMsg = "결제 화면으로 이동합니다.";
                    addMessage('bot', buyMsg);
                    speakWithUserVoice(buyMsg);
                    setTimeout(() => {
                        document.getElementById("buy-btn")?.click();
                    }, 1500);
                    return;
                }
                sendQuestionToServer();
            });

            recognition.addEventListener("end", () => {
                input.placeholder = "상품에 대해 자유롭게 질문해 주세요";
            });

            recognition.addEventListener("error", (e) => {
                console.error("음성 인식 에러:", e.error);
                addMessage('bot', '음성을 인식하지 못했습니다.');
            });
        }
    }
});

function addToCart(name, price, image) {
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

let zoomLevel = 1;
let fontSize = 100;

function zoomIn() {
    zoomLevel += 0.1;
    if (zoomLevel > 1.5) zoomLevel = 1;
    document.body.style.zoom = zoomLevel;
}

function zoomOut() {
    zoomLevel -= 0.1;
    if (zoomLevel < 0.7) zoomLevel = 0.7;
    document.body.style.zoom = zoomLevel;
}

function increaseText() {
    fontSize += 10;
    if (fontSize > 150) fontSize = 150;
    document.documentElement.style.fontSize = fontSize + "%";
}

function decreaseText() {
    fontSize -= 10;
    if (fontSize < 70) fontSize = 70;
    document.documentElement.style.fontSize = fontSize + "%";
}

function toggleContrast() {
    document.body.classList.toggle("high-contrast");
}
S
function updateActiveNav() {
    const rawCurrentPage = window.location.pathname.split("/").pop() || "";
    const currentPage = rawCurrentPage.split("?")[0].split("#")[0];
    const pageAliasMap = { "product.html": "index.html", "checkout.html": "index.html" };
    const effectivePage = pageAliasMap[currentPage] || currentPage;

    document.querySelectorAll(".nav-links a").forEach((link) => {
        const href = link.getAttribute("href") || "";
        const linkPage = (() => {
            try {
                return new URL(href, window.location.href).pathname.split("/").pop() || "";
            } catch {
                return href.split("/").pop() || "";
            }
        })().split("?")[0].split("#")[0];

        link.classList.remove("active");
        link.removeAttribute("aria-current");
        if (effectivePage && linkPage === effectivePage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}
window.updateActiveNav = updateActiveNav;

document.addEventListener("DOMContentLoaded", () => {
    updateActiveNav();
});