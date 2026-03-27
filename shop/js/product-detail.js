document.addEventListener("DOMContentLoaded", async () => {
    const detailContainer = document.getElementById('product-detail-container');

    // 로그인 확인
    const isLogin = localStorage.getItem("isLogin") === "true";
    const userName = isLogin ? localStorage.getItem("username") : "익명";
    const userEmail = localStorage.getItem("userEmail") || "guest";

    // productId 가져오기
    const productId = new URLSearchParams(location.search).get("id");

    // 데이터 가져오기 (data.json)
    let products = [];
    try {
        const res = await fetch('../data.json');
        if(!res.ok) throw new Error('Failed to fetch data.json');
        products = await res.json();
    } catch(e) {
        console.error(e);
        if(detailContainer) detailContainer.innerHTML = "<p>상품 데이터를 불러올 수 없습니다.</p>";
        return;
    }

    const product = products.find(p => String(p.id) === String(productId));
    if(!product){
        if(detailContainer) detailContainer.innerHTML = `<p>상품을 찾을 수 없습니다.</p>`;
        return;
    }

    // [수정] 통합 리뷰 저장소('all_reviews') 사용 함수
    function getReviews() {
        return JSON.parse(localStorage.getItem("all_reviews")) || [];
    }
    function saveReviews(reviews) {
        localStorage.setItem("all_reviews", JSON.stringify(reviews));
    }

    // =========================
    // 별점 선택
    // =========================
    let selectedRating = 0;
    const stars = document.querySelectorAll('#review-rating span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = Number(star.dataset.value);
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= selectedRating));
        });
        star.addEventListener('mouseover', () => {
            const val = Number(star.dataset.value);
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= val));
        });
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= selectedRating));
        });
    });

    // =========================
    // 📷 이미지 업로드
    // =========================
    const imageInput = document.getElementById("review-image");

    imageDataList = [];

    imageInput.addEventListener("change", () => {
        const files = Array.from(imageInput.files);
        const previewWrap = document.getElementById("preview-wrap");

        imageDataList = [];
        previewWrap.innerHTML = "";

        files.forEach(file => {
            const reader = new FileReader();

            reader.onload = (e) => {
                imageDataList.push(e.target.result);

                const img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "60px";
                img.style.marginRight = "5px";

                previewWrap.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
    });


    // =========================
    // 평균 별점 계산 (통합 저장소 기준)
    // =========================
    function calculateAverageRating() {
        const reviews = getReviews().filter(r => String(r.productId) === String(productId));
        if(reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    function renderStarsHTML(avgRating) {
        const fullStars = Math.floor(avgRating);
        const halfStar = avgRating - fullStars >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        return '★'.repeat(fullStars) + (halfStar ? '⯨' : '') + '☆'.repeat(emptyStars);
    }

    function renderAverageRating() {
        const avgRating = calculateAverageRating();
        const containers = document.querySelectorAll('.product-rating');
        containers.forEach(c => {
            c.innerHTML = avgRating == 0 ? "아직 별점이 없습니다." : `${renderStarsHTML(avgRating)} (평균: ${avgRating})`;
        });
    }

    // =========================
    // 대표 리뷰 (통합 저장소 기준)
    // =========================
    function renderHighlightReview() {
        const reviews = getReviews().filter(r => String(r.productId) === String(productId));
        const containers = document.querySelectorAll('.highlight-review');
        containers.forEach(c => {
            if(reviews.length === 0){
                c.innerHTML = "<p>대표 리뷰가 없습니다.</p>";
                return;
            }
            const best = reviews.reduce((best, r) => {
                if(r.rating > best.rating) return r;
                if(r.rating === best.rating && r.id > best.id) return r;
                return best;
            }, reviews[0]);
            const starsHtml = Array.from({length:5}, (_, i) => `<span class="review-star ${i < best.rating ? 'active' : ''}">★</span>`).join('');
            c.innerHTML = `<div class="review-header"><strong>${best.user || best.name}</strong> ${starsHtml}</div><p>${best.content}</p>`;
        });
    }

    // =========================
    // 리뷰 렌더링 (통합 저장소 기준)
    // =========================
    function renderReviews() {
        const list = document.querySelector('.review-list');
        if(!list) return;
        
        // 현재 상품 아이디와 일치하는 리뷰만 필터링
        const reviews = getReviews().filter(r => String(r.productId) === String(productId));
        list.innerHTML = "";

        if(reviews.length === 0){
            list.innerHTML = "<p>아직 리뷰가 없습니다.</p>";
            return;
        }

        reviews.sort((a,b) => b.id - a.id);
        reviews.forEach(r => {
            const div = document.createElement('div');
            div.className = "review-item";

            const imagesHTML = (r.images || []).map(img => 
                `<img src="${img}" class="review-img">`
            ).join('');

            const starsHtml = Array.from({length:5}, (_, i) => `<span class="review-star ${i < r.rating ? 'active' : ''}">★</span>`).join('');
            
            // 본인 확인 (이름 또는 이메일)
            let deleteBtn = "";
            if(r.user === userName || r.userEmail === userEmail){
                deleteBtn = `<button class="delete-review" data-id="${r.id}">삭제</button>`;
            }

            div.innerHTML = `
                <div class="review-header">
                    <strong>${r.user || r.name}</strong> ${starsHtml} ${deleteBtn}
                </div>
                <p>${r.content}</p>

                <div class="review-images">
                    ${imagesHTML}
                </div>

                <small style="color:#999;">${r.date || ""}</small>
            `;
            list.appendChild(div);
        });

        // 삭제 버튼 이벤트 연결
        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                if(confirm("리뷰를 삭제하시겠습니까?")) {
                    let reviews = getReviews();
                    reviews = reviews.filter(r => r.id !== id);
                    saveReviews(reviews);
                    window.updateProductReviews();
                }
            });
        });


    }

    // =========================
    // 리뷰 작성 (통합 저장소로 저장)
    // =========================
    const submitBtn = document.getElementById('submit-review');
    if(submitBtn){
        submitBtn.addEventListener('click', () => {
            if (!isLogin) {
                alert("리뷰 작성은 회원만 가능합니다. 로그인해주세요.");
                return;
            }
            const content = document.getElementById('review-content').value.trim();
            if(!content){ alert("리뷰를 입력하세요"); return; }
            if(selectedRating === 0){ alert("별점을 선택하세요"); return; }

            const allReviews = getReviews();
            
            const newReview = {
                id: Date.now(),
                productId: productId,
                product: document.getElementById('product-name')?.textContent || product.name, 
                rating: selectedRating,
                content: content,
                user: userName,
                userEmail: userEmail,
                date: new Date().toLocaleDateString(),
                images: imageDataList

            };

            allReviews.push(newReview);
            saveReviews(allReviews);

            // 입력창 초기화
            document.getElementById('review-content').value = "";
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));

            imageData = [];
            if(imageInput) imageInput.value = "";

            window.updateProductReviews();
            alert("리뷰가 등록되었습니다!");
        });
    }

    // =========================
    // 전역 함수 및 초기화
    // =========================
    window.updateProductReviews = function() {
        renderReviews();
        renderAverageRating();
        renderHighlightReview();
    };

    window.updateProductReviews();

    let currentImages = [];
    let currentIndex = 0;

    const modal = document.getElementById("slider-modal");
    const sliderImg = document.getElementById("slider-image");

    // 이미지 클릭 → 슬라이드 열기
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("review-img")) {
            const parent = e.target.closest(".review-images");
            const imgs = parent.querySelectorAll("img");

            currentImages = Array.from(imgs).map(img => img.src);
            currentIndex = currentImages.indexOf(e.target.src);

            sliderImg.src = currentImages[currentIndex];
            modal.style.display = "flex";
        }
    });

    // 다음
    document.getElementById("next-btn").onclick = () => {
        currentIndex = (currentIndex + 1) % currentImages.length;
        sliderImg.src = currentImages[currentIndex];
    };

    // 이전
    document.getElementById("prev-btn").onclick = () => {
        currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
        sliderImg.src = currentImages[currentIndex];
    };

    // 닫기
    document.getElementById("close-slider").onclick = () => {
        modal.style.display = "none";
    };

    // 바깥 클릭 닫기
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
        }
    });
});