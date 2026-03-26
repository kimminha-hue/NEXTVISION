document.addEventListener("DOMContentLoaded", async () => {
    const detailContainer = document.getElementById('product-detail-container');

    // 로그인 확인
    const isLogin = localStorage.getItem("isLogin") === "true";
    const userName = isLogin ? localStorage.getItem("username") : "익명";

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
        detailContainer.innerHTML = `<p>상품을 찾을 수 없습니다.</p>`;
        return;
    }

    // 리뷰 저장/불러오기
    function getReviews() {
        return JSON.parse(localStorage.getItem("userData"))?.reviews || [];
    }
    function saveReviews(reviews) {
        const savedData = JSON.parse(localStorage.getItem("userData")) || {};
        savedData.reviews = reviews;
        localStorage.setItem("userData", JSON.stringify(savedData));
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
    // 평균 별점 계산
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
        return '★'.repeat(fullStars) + '⯨'.repeat(halfStar) + '☆'.repeat(emptyStars);
    }

    function renderAverageRating() {
        const avgRating = calculateAverageRating();
        const containers = document.querySelectorAll('.product-rating');
        containers.forEach(c => {
            c.innerHTML = avgRating == 0 ? "아직 별점이 없습니다." : `${renderStarsHTML(avgRating)} (평균: ${avgRating})`;
        });
    }

    // =========================
    // 대표 리뷰
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
            c.innerHTML = `<div class="review-header"><strong>${best.name}</strong> ${starsHtml}</div><p>${best.content}</p>`;
        });
    }

    // =========================
    // 리뷰 렌더링
    // =========================
    function renderReviews() {
        const list = document.querySelector('.review-list');
        if(!list) return;
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
            const starsHtml = Array.from({length:5}, (_, i) => `<span class="review-star ${i < r.rating ? 'active' : ''}">★</span>`).join('');
            let deleteBtn = "";
            if(r.name === userName){
                deleteBtn = `<button class="delete-review" data-id="${r.id}">삭제</button>`;
            }
            div.innerHTML = `<div class="review-header"><strong>${r.name}</strong> ${starsHtml} ${deleteBtn}</div><p>${r.content}</p>`;
            list.appendChild(div);
        });

        document.querySelectorAll('.delete-review').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.dataset.id);
                let reviews = getReviews();
                reviews = reviews.filter(r => r.id !== id);
                saveReviews(reviews);
                window.updateProductReviews();
            });
        });
    }

    // =========================
    // 리뷰 작성
    // =========================
    const submitBtn = document.getElementById('submit-review');
    if(submitBtn){
        submitBtn.addEventListener('click', () => {
            if(!isLogin || !userName){
                alert("리뷰 작성은 회원만 가능합니다. 로그인해주세요.");
                return;
            }
            const content = document.getElementById('review-content').value.trim();
            if(!content){ alert("리뷰를 입력하세요"); return; }
            if(selectedRating === 0){ alert("별점을 선택하세요"); return; }

            const reviews = getReviews();
            reviews.push({
                id: Date.now(),
                productId: productId,
                rating: selectedRating,
                content: content,
                name: userName
            });
            saveReviews(reviews);

            document.getElementById('review-content').value = "";
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));

            window.updateProductReviews();
            alert("리뷰가 등록되었습니다!");
        });
    }

    // =========================
    // 전역 함수
    // =========================
    window.updateProductReviews = function() {
        renderReviews();
        renderAverageRating();
        renderHighlightReview();
    };

    // 초기 렌더링
    window.updateProductReviews();
});