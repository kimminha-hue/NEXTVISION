import os
import requests 
from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from llm_handler import VQAModelHandler

# 🚨 우리의 핵심 무기!
from prompts import get_final_prompt 

load_dotenv()

app = FastAPI(title="NextVision AI Server - 100% DB 연동")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 💡 [핵심] pandas와 csv 코드는 영원히 삭제되었습니다!

PERSONA_NORMAL = """당신은 스마트한 쇼핑 어시스턴트입니다. 
제공된 상품정보와 리뷰를 기반으로 사용자의 질문에 핵심 정보만 쏙 뽑아서 2문장 이내로 아주 간결하게 답변하세요. 
장황한 인사말이나 미사여구는 모두 생략하세요."""

keys = {
    "GEMINI": os.getenv("VQA_API_KEY")
}
vqa_handler = VQAModelHandler(keys=keys)

# 스프링부트 백엔드 주소
SPRING_BOOT_BASE_URL = "http://localhost:8088/avw/api"

@app.get("/")
def read_root():
    return {"message": "NextVision 제미나이 전용 서버 작동 중! (100% DB 연동 완료)"}


@app.post("/api/chat/ask")
async def chat_ask_api(
    session_id: str = Form(...),
    category: str = Form(...),
    user_type: str = Form(...),
    product_id: str = Form(...),
    user_message: str = Form(None), 
    image: UploadFile = File(None)  
):
    # 1. 통신 시작점 확인 (가장중요함)
    print(f"🔥 [DEBUG 1] 프론트 요청 도착! 질문: {user_message}, 상품ID: {product_id}")
    # =========================================================================
    # 💡 1. 스프링부트 DB에서 실시간 데이터 가져오기 (이제 무조건 DB만 봅니다!)
    # =========================================================================
    product_name = category 
    fact_text_desc = "상세 설명 없음"
    fact_text_price = "가격 정보 없음"

    try:
        # 스프링부트 상품 리스트 API 호출
        prod_response = requests.get(f"{SPRING_BOOT_BASE_URL}/product/list", timeout=3)
        if prod_response.ok:
            products_data = prod_response.json()
            
            # 🌟 1. 메인 페이지에서 질문이 들어온 경우 (전체 요약)
            if product_id == 'main':
                categories = list(set([p.get("category", p.get("pCategory", "기타")) for p in products_data]))
                item_names = [p.get("name", p.get("pName", "상품")) for p in products_data][:7] # 대표상품 7개만
                
                product_name = "쇼핑몰 메인 안내"
                fact_text_price = "다양함"
                fact_text_desc = f"이 쇼핑몰은 {', '.join(categories)} 카테고리를 취급합니다. 대표 상품으로 {', '.join(item_names)} 등이 있습니다. 원하시는 상품을 말씀하시면 안내해 드리겠습니다."
                
            # 🌟 2. 특정 상품 상세 페이지에서 질문이 들어온 경우 (기존 로직 유지)
            else:
                matched_product = next((p for p in products_data if str(p.get("pIdx", p.get("p_idx", p.get("id", "")))) == str(product_id)), None)
                
                if matched_product:
                    product_name = matched_product.get("pName", matched_product.get("p_name", matched_product.get("name", category)))
                    fact_text_desc = matched_product.get("pDesc", matched_product.get("p_desc", matched_product.get("description", "상세 설명 없음")))
                    
                    p_price_val = matched_product.get("pPrice", matched_product.get("p_price", matched_product.get("price")))
                    if p_price_val is not None and isinstance(p_price_val, (int, float)):
                        fact_text_price = f"{p_price_val:,}원"

    except Exception as e:
        print(f"DEBUG: 상품 DB 연동 실패 - {e}")

    # 🔥 복구된 핵심 코드! (이 줄이 없으면 에러가 납니다)
    fact_text = f"상품명: {product_name}, 가격: {fact_text_price}, 설명: {fact_text_desc}"

    # =========================================================================
    # 💡 2. 스프링부트 DB에서 실시간 '리뷰' 가져오기 (이름표 완벽 매칭 및 디버깅 추가)
    # =========================================================================
    review_context = "현재 등록된 리뷰가 없습니다."
    try:
        # 스프링부트 리뷰 API 찌르기
        review_response = requests.get(f"{SPRING_BOOT_BASE_URL}/review/list", params={"p_idx": product_id}, timeout=3)
        
        if review_response.ok:
            reviews_data = review_response.json()
            
            # 만약 스프링부트가 데이터를 {"data": [...]} 처럼 딕셔너리로 감싸서 보냈을 경우를 대비
            if isinstance(reviews_data, dict):
                reviews_data = reviews_data.get("data", reviews_data.get("list", reviews_data.get("items", [])))

            # 데이터가 리스트 형태로 잘 들어왔다면?
            if reviews_data and isinstance(reviews_data, list) and len(reviews_data) > 0:
                review_contents = []
                for r in reviews_data:
                    # 🚨 핵심! DB 컬럼(rev_content)이 스프링부트를 거쳐 나올 수 있는 모든 이름표를 검사합니다.
                    rev_text = r.get("revContent", r.get("rev_content", r.get("reviewContent", r.get("content", ""))))
                    if rev_text:
                        review_contents.append(str(rev_text))
                
                # 하나라도 리뷰를 건졌다면 컨텍스트에 추가!
                if review_contents:
                    review_context = "실제 구매자들의 최신 리뷰 요약: " + " | ".join(review_contents)
                    print(f"✅ [성공] 리뷰를 찾았습니다: {review_context}") # 터미널 확인용
        else:
            print(f"❌ [에러] 스프링부트가 응답하지 않습니다. 상태 코드: {review_response.status_code}")
            
    except Exception as e:
        print(f"❌ [에러] 스프링부트 리뷰 서버와 통신 실패 - {e}")
    
    # 2. 스프링부트 응답 확인
    print(f"🔥 [DEBUG 2] 스프링부트 DB 팩트 세팅 완료")

    # =========================================================================
    # 💡 3. 프롬프트 조립
    # =========================================================================
    if user_type == "blind":
        selected_persona = get_final_prompt(category)
    else:
        selected_persona = PERSONA_NORMAL

    base_prompt = f"카테고리: {category}, {fact_text}. {review_context}. "
    
    if user_message:
        if "리뷰" in user_message or "후기" in user_message:
            initial_prompt = f"{base_prompt} 사용자의 질문: '{user_message}'. 제공된 '실제 구매자들의 최신 리뷰'를 바탕으로 답변해줘."
        else:
            initial_prompt = f"{base_prompt} 사용자의 질문: '{user_message}'. 이 질문에 정확하게 답변해줘."
    else:
        initial_prompt = f"{base_prompt} 이 상품의 디자인, 색상, 특징을 눈앞에 있는 것처럼 자세히 설명해줘."


    
    # =========================================================================
    # 💡 4. 제미나이 2.5 Flash 호출
    # =========================================================================
    image_data = image.file if (image and hasattr(image, 'file')) else None

    # 3. 제미나이 호출 직전 확인
    print("🔥 [DEBUG 3] 제미나이 API 호출 시작...")

    try:
        gemini_answer = await vqa_handler.get_gemini_res(image_data, selected_persona, initial_prompt)
        return {"result": gemini_answer}
    except Exception as e:
        print(f"Gemini API 에러: {e}")
        return {"result": "제미나이 연결 중 문제가 발생했습니다. 에러 로그를 확인해주세요."}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)