document.addEventListener("DOMContentLoaded", () => {

    // 🔥 예시: 로그인된 회원 이름 (실제 환경에서는 서버 세션/토큰)
    const userName = sessionStorage.getItem("userName") || "테스트회원";
    sessionStorage.setItem("userName", userName);
    console.log("사용자 이름:", userName);

    

    // 🔥 상품 ID
    const productId = new URLSearchParams(location.search).get("id") || 1;

    // =========================
    // 리뷰 저장 / 불러오기
    // =========================
    function getReviews() {
        return JSON.parse(localStorage.getItem("reviews") || "[]");
    }

    function saveReviews(reviews) {
        localStorage.setItem("reviews", JSON.stringify(reviews));
    }

    // =========================
    // ⭐ 별점 선택 기능
    // =========================
    let selectedRating = 0;
    const stars = document.querySelectorAll('#review-rating span');

    stars.forEach(star => {

        // 클릭
        star.addEventListener('click', () => {
            selectedRating = Number(star.dataset.value);

            stars.forEach(s => s.classList.remove('active'));
            stars.forEach(s => {
                if (Number(s.dataset.value) <= selectedRating) {
                    s.classList.add('active');
                }
            });
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

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {

            // 회원 체크
            if (!userName) {
                alert("리뷰 작성은 회원만 가능합니다. 로그인해주세요.");
                return;
            }

            const content = document.getElementById('review-content').value.trim();

            if (!content) {
                alert("리뷰를 입력하세요");
                return;
            }

            if (selectedRating === 0) {
                alert("별점을 선택하세요");
                return;
            }

            const reviews = getReviews();

            reviews.push({
                id: Date.now(),
                productId: productId,
                rating: selectedRating,
                content: content,
                name: userName // 🔥 작성자 이름 추가
            });

            saveReviews(reviews);

            // 초기화
            document.getElementById('review-content').value = "";
            selectedRating = 0;
            stars.forEach(s => s.classList.remove('active'));

            window.updateProductReviews();
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