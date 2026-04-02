// 서버(Node.js) 코드 예시
const axios = require('axios');

async function getKakaoPayUrl(amount) {
    const response = await axios.post('https://open-api.kakaopay.com/share/v1/payment/ready', {
        cid: "TC0ONETIME", // 테스트용 가맹점 아이디
        partner_order_id: "order_id_1234",
        partner_user_id: "user_id_5678",
        item_name: "테스트 상품",
        quantity: 1,
        total_amount: amount,
        tax_free_amount: 0,
        approval_url: "https://yourdomain.com/success", // 결제 성공 시 이동할 주소
        cancel_url: "https://yourdomain.com/cancel",   // 취소 시
        fail_url: "https://yourdomain.com/fail",       // 실패 시
    }, {
        headers: {
            Authorization: `SECRET_KEY ${YOUR_KAKAOPAY_SECRET_KEY}`, // 내 애플리케이션 키
            'Content-Type': 'application/json'
        }
    });
    return response.data.next_redirect_pc_url; // 실제 결제 페이지 주소 반환
}