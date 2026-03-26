document.addEventListener("DOMContentLoaded", () => {

    const detailContainer = document.getElementById('product-detail-container');

    // 로그인 확인 (localStorage 기반)
    const isLogin = localStorage.getItem("isLogin") === "true";
    const userName = isLogin ? localStorage.getItem("username") : "익명";

    const newReview = {
    id: Date.now(),
    product: product.name,
    rating: selectedRating,
    content: content,
    user: username    // ✅ 사용자 이름 추가
};
    // 상품 ID 가져오기
    const productId = new URLSearchParams(location.search).get("id") || 1;

    // 리뷰 저장소 가져오기
    function getReviews() {
        return JSON.parse(localStorage.getItem("userData"))?.reviews || [];
    }

    function saveReviews(reviews) {
        const savedData = JSON.parse(localStorage.getItem("userData")) || {};
        savedData.reviews = reviews;
        localStorage.setItem("userData", JSON.stringify(savedData));
    }

    // =========================
    // ⭐ 별점 선택 기능
    // =========================
    let selectedRating = 0;
    const stars = document.querySelectorAll('#review-rating span');

    stars.forEach(star => {
        const value = Number(star.dataset.value);

        // 클릭
        star.addEventListener('click', () => {
            selectedRating = value;
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= selectedRating));
        });

        // hover
        star.addEventListener('mouseover', () => {
            const value = Number(star.dataset.value);
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= value));
        });

        // hover 해제
        star.addEventListener('mouseout', () => {
            stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= selectedRating));
        });

    });

    // =========================
    // 평균 별점 계산
    // =========================
    function calculateAverageRating() {
        const reviews = getReviews().filter(r => r.productId == productId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1); // 소수점 한자리
    }

    // 평균 별점 HTML 렌더링
    function renderAverageRating() {
        const avgRating = calculateAverageRating();
        const avgStars = renderStarsHTML(avgRating);
        const ratingContainers = document.querySelectorAll('.product-rating');

        ratingContainers.forEach(container => {
            if (avgRating == 0) {
                container.innerHTML = "아직 별점이 없습니다.";
            } else {
                container.innerHTML = `${avgStars} (평균: ${avgRating})`;
            }
        });
    }

    // 대표 리뷰 렌더링
    function renderHighlightReview() {
        const reviews = getReviews().filter(r => r.productId == productId);
        const highlightContainers = document.querySelectorAll('.highlight-review');
        
        highlightContainers.forEach(highlight => {
            if (reviews.length === 0) {
                highlight.innerHTML = "<p>대표 리뷰가 없습니다.</p>";
                return;
            }

            // 별점이 가장 높은 리뷰(동점일 경우 최신 작성순)를 대표로 표시
            const r = reviews.reduce((best, current) => {
                if (current.rating > best.rating) return current;
                if (current.rating === best.rating && current.id > best.id) return current;
                return best;
            }, reviews[0]);

            const starHtml = Array.from({length: 5}, (_, i) =>
                `<span class="review-star ${i < r.rating ? 'active' : ''}">★</span>`
            ).join('');

            highlight.innerHTML = `
                <div class="review-header">
                    <strong>${r.name}</strong> ${starHtml}
                </div>
                <p>${r.content}</p>
            `;
        });
    }

    // ⭐ 별점 HTML 생성 (정수/소수점 반별 표현)
    function renderStarsHTML(avgRating) {
        const fullStars = Math.floor(avgRating);
        const halfStar = avgRating - fullStars >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        return '★'.repeat(fullStars) + '⯨'.repeat(halfStar) + '☆'.repeat(emptyStars);
    }

    // =========================
    // 리뷰 렌더링 (삭제 버튼 포함)
    // =========================
    function renderReviews() {
        const list = document.querySelector('.review-list');
        if (!list) return;

        const reviews = getReviews().filter(r => r.productId == productId);

        list.innerHTML = "";

        if (reviews.length === 0) {
            list.innerHTML = "<p>아직 리뷰가 없습니다.</p>";
            return;
        }

        reviews.forEach(r => {
            const div = document.createElement('div');
            div.className = 'review-item';

            // ⭐ 별점 표시
            const starHtml = Array.from({length: 5}, (_, i) => {
                return `<span class="review-star ${i < r.rating ? 'active' : ''}">★</span>`;
            }).join('');

            // 삭제 버튼 (자신 리뷰만 표시)
            let deleteBtn = "";
            if (r.name === userName) {
                // inline 스타일 제거하고 클래스만 남김
                deleteBtn = `<button class="delete-review" data-id="${r.id}">삭제</button>`;
            }

            div.innerHTML = `
                <div class="review-header">
                    <strong>${r.name}</strong> ${starHtml} ${deleteBtn}
                </div>
                <p>${r.content}</p>
            `;

            list.appendChild(div);
        });

         // 삭제 버튼 이벤트 연결
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

            if(!isLogin || !userName){
                alert("리뷰 작성은 회원만 가능합니다. 로그인해주세요.");
                return;
            }

            const content = document.getElementById('review-content').value.trim();
            if(!content){
                alert("리뷰를 입력하세요");
                return;
            }

            if(selectedRating === 0){
                alert("별점을 선택하세요");
                return;
            }

            // 리뷰 저장
            const reviews = getReviews();
            reviews.push({
                id: Date.now(),
                productId: productId,
                rating: selectedRating,
                content: content,
                name: userName
            });
            saveReviews(reviews);

            // 초기화
            document.getElementById('review-content').value = "";
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));

            // 리뷰 렌더링 업데이트
            if(typeof window.updateProductReviews === "function"){
                window.updateProductReviews();
            }

            alert("리뷰가 등록되었습니다!");
        });
    }

    // 전역 노출하여 외부(script.js)에서 새로고침 후 호출 가능하게 함
    window.updateProductReviews = function() {
        renderReviews();
        renderAverageRating();
        renderHighlightReview();
    };

    // 초기 실행
    window.updateProductReviews();
});