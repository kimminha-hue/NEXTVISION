document.addEventListener("DOMContentLoaded", async () => {
    const detailContainer = document.getElementById('product-detail-container');

    // 로그인 확인
    const isLogin = localStorage.getItem("isLogin") === "true";
    const loginUser = JSON.parse(localStorage.getItem("loginUser")) || {};
    // ✅ 로그인 상태에서만 값 설정
    const userName = isLogin
        ? (loginUser.name || loginUser.id || "알 수 없음")
        : "";
    const userEmail = isLogin
        ? (loginUser.id || "")
        : "";

    // productId 가져오기
    const productId = new URLSearchParams(location.search).get("id");

    // 데이터 가져오기 (data.json)
    let products = [];
    try {
        const res = await fetch('http://localhost:8088/avw/api/product/list');
        if (!res.ok) throw new Error('API 호출 실패');
        const apiProducts = await res.json();

        products = apiProducts.map(p => ({
            id: String(p.id),
            name: p.name,
            price: p.price,
            description: p.description,
            category: p.category,
            image: p.img1,
            detailImages: [p.img2, p.img3, p.img4].filter(Boolean),
            ingredients: []
        }));

    } catch(e) {
        // ✅ API 실패 시 에러 메시지만 표시 (data.json 백업 없음)
        console.error(e);
        if(detailContainer)
            detailContainer.innerHTML = "<p>서버에 연결할 수 없습니다. 서버가 켜져 있는지 확인해 주세요.</p>";
        return;
    }

    const product = products.find(p => String(p.id) === String(productId));
    if(!product){
        if(detailContainer) detailContainer.innerHTML = `<p>상품을 찾을 수 없습니다.</p>`;
        return;
    }

    // =========================================================================
    // 🔥 1. 백엔드(스프링부트)에서 찐 리뷰 데이터를 가져오는 함수 (비동기)
    // =========================================================================
    async function getReviews() {
        try {
            const res = await fetch(`http://localhost:8088/avw/api/review/list?p_idx=${productId}`);
            if (!res.ok) throw new Error("리뷰 API 호출 실패");
            const dbReviews = await res.json();
            
            return dbReviews.map(r => ({
                id: r.revIdx,
                productId: String(r.pIdx),
                rating: r.rating || 5,
                content: r.revContent,
                user: r.userName || "알 수 없음", 
                date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "최근",
                images: [r.revImg1, r.revImg2, r.revImg3].filter(Boolean)
            }));
        } catch (error) {
            console.error("DB 리뷰 로드 실패:", error);
            return [];
        }
    }

    // =========================
    // 별점 선택 및 이미지 업로드 UI (프론트 팀원 로직 유지)
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

    const imageInput = document.getElementById("review-image");
    let imageDataList = [];
    if(imageInput){
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
    }

    // =========================================================================
    // 🔥 2. 상/하단 리뷰 UI를 한 번에 렌더링하는 통합 함수
    // =========================================================================
    function renderAverageRating(reviews) {
        let avgRating = 0;
        if(reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            avgRating = (sum / reviews.length).toFixed(1);
        }

        const fullStars = Math.floor(avgRating);
        const halfStar = avgRating - fullStars >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        const starsHTML = '★'.repeat(fullStars) + (halfStar ? '⯨' : '') + '☆'.repeat(emptyStars);

        const containers = document.querySelectorAll('.product-rating');
        containers.forEach(c => {
            c.innerHTML = avgRating == 0 ? "아직 별점이 없습니다." : `${starsHTML} <strong style="color:#333;">${avgRating}</strong> <span style="font-size: 0.9em; color: #ccc;">(${reviews.length}개의 리뷰)</span>`;
        });
    }

    function renderHighlightReview(reviews) {
        const containers = document.querySelectorAll('.highlight-review');
        containers.forEach(c => {
            if(reviews.length === 0){
                c.innerHTML = "<p>대표 리뷰가 없습니다.</p>";
                return;
            }
            const best = reviews.reduce((best, r) => (r.rating > best.rating ? r : best), reviews[0]);
            const starsHtml = Array.from({length:5}, (_, i) => `<span class="review-star ${i < best.rating ? 'active' : ''}">★</span>`).join('');
            c.innerHTML = `<div class="review-header"><strong>${best.user}</strong> ${starsHtml}</div><p style="font-style: italic;">"${best.content}"</p>`;
        });
    }

    function renderReviews(reviews) {
        const list = document.querySelector('.review-list');
        if(!list) return;

        list.innerHTML = "";
        if(reviews.length === 0){
            list.innerHTML = "<p style='color:#888; padding: 20px 0;'>아직 작성된 리뷰가 없습니다.</p>";
            return;
        }

        reviews.forEach(r => {
            const div = document.createElement('div');
            div.className = "review-item";
            const imagesHTML = (r.images || []).map(img => `<img src="${img}" class="review-img">`).join('');
            const starsHtml = Array.from({length:5}, (_, i) => `<span class="review-star ${i < r.rating ? 'active' : ''}">★</span>`).join('');
            
            div.innerHTML = `
                <div class="review-header">
                    <strong>${r.user}</strong> ${starsHtml}
                </div>
                <p>${r.content}</p>
                <div class="review-images">${imagesHTML}</div>
                <small style="color:#999;">${r.date}</small>
            `;
            list.appendChild(div);
        });
    }

// =========================================================================
    // =========================================================================
    // 🔥 3. 진짜 스프링부트 DB에 리뷰와 이미지를 쾅! 저장하는 기능
    // =========================================================================
    const submitBtn = document.getElementById('submit-review');
    if(submitBtn){
        submitBtn.addEventListener('click', async () => {
            
            // 🚨 [핵심 수정] 호성님이 캐치하신 '로그인 필수' 방어막 추가!
            if (!isLogin) {
                alert("리뷰 작성은 회원만 가능합니다. 로그인해주세요.");
                return; // 여기서 코드를 멈춰서 DB로 넘어가지 않게 막습니다.
            }

            const content = document.getElementById('review-content').value.trim();
            if(!content){ alert("리뷰 내용을 입력해주세요!"); return; }
            if(selectedRating === 0){ alert("별점을 선택해주세요!"); return; }

            // 폼 데이터 생성 (이하 기존 코드 동일)
            const formData = new FormData();
            formData.append('p_idx', productId);
            formData.append('rating', selectedRating);
            formData.append('rev_content', content);
            formData.append('user_idx', loginUser.userIdx || "");  
            formData.append('user_name', loginUser.name || "");    

            // 파일이 있다면 최대 3개까지 첨부
            const imageInput = document.getElementById("review-image");
            if (imageInput && imageInput.files.length > 0) {
                const files = imageInput.files;
                if(files[0]) formData.append('img1', files[0]);
                if(files[1]) formData.append('img2', files[1]);
                if(files[2]) formData.append('img3', files[2]);
            }

            try {
                // 스프링부트로 데이터 쏘기!
                const res = await fetch('http://localhost:8088/avw/api/review/register', {
                    method: 'POST',
                    body: formData 
                });

                if (!res.ok) throw new Error("서버 응답 오류");
                
                alert("리뷰가 DB에 성공적으로 저장되었습니다! 🎉");

                // 입력창 초기화
                document.getElementById('review-content').value = "";
                selectedRating = 0;
                document.querySelectorAll('#review-rating span').forEach(s => s.classList.remove('active'));
                if(imageInput) imageInput.value = "";
                document.getElementById("preview-wrap").innerHTML = "";

                // 즉시 하단 리뷰 리스트 갱신
                window.updateProductReviews();

            } catch (error) {
                console.error("리뷰 등록 실패:", error);
                alert("리뷰 등록에 실패했습니다. 서버가 켜져 있는지 확인해 주세요.");
            }
        });
    }

    // =========================================================================
    // 🔥 4. 최종 실행 (DB에서 한 번만 가져와서 상,하단에 싹 뿌리기)
    // =========================================================================
    window.updateProductReviews = async function() {
        const allReviews = await getReviews(); // DB에서 딱 한 번 호출!
        renderReviews(allReviews);
        renderAverageRating(allReviews);
        renderHighlightReview(allReviews);
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