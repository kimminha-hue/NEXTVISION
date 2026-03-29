import os
from fastapi import FastAPI, UploadFile, File, Form
import uvicorn
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from llm_handler import VQAModelHandler
import asyncio

load_dotenv()

app = FastAPI(title="AudiView Comparison Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# 데이터 로딩
try:
    product_db = pd.read_csv("test001.csv", encoding="utf-8")
except:
    product_db = pd.DataFrame(columns=['product_id', 'blind_desc', 'general_tips', 'essential_info'])

# 페르소나 설정 (생략 방지를 위해 이전 코드 유지)
PERSONA_BLIND = "당신은 시각장애인을 위한 쇼핑 어시스턴트 'AudiView'입니다..."
CATEGORY_TONE_GUIDE = {"주방용품": "살림 전문가처럼 꼼꼼하게 설명하세요."} # 실제 가이드 유지하세요

# 3종 API 키 통합
keys = {
    "GEMINI": os.getenv("VQA_API_KEY"), # 기존 키 그대로 사용
    "GPT": os.getenv("GPT_API_KEY"),   # .env에 추가 필요
    "CLOVA": os.getenv("CLOVA_API_KEY") # .env에 추가 필요
}
vqa_handler = VQAModelHandler(keys=keys)

@app.get("/")
def read_root():
    return {"message": "비교 서버 작동 중!"}

@app.post("/api/chat/compare")
async def compare_models_api(
    session_id: str = Form(...),
    category: str = Form(...),
    user_type: str = Form(...),
    product_id: str = Form(...),
    image: UploadFile = File(...)
):
    # 팩트 데이터 추출 로직
    fact_text = "상품 정보 없음"
    matched_row = product_db[product_db['product_id'].astype(str) == str(product_id)]
    if not matched_row.empty:
        fact_text = matched_row.iloc[0].get('blind_desc', '정보 없음')

    selected_persona = PERSONA_BLIND
    initial_prompt = f"카테고리: {category}, 상품정보: {fact_text}. 이 상품을 설명해줘."

    # 🚀 3개 모델 동시 호출
    gemini_task = vqa_handler.get_gemini_res(image.file, selected_persona, initial_prompt)
    gpt_task = vqa_handler.get_gpt_res(image.file, selected_persona, initial_prompt)
    clova_task = vqa_handler.get_clova_res(selected_persona, initial_prompt)

    g_res, p_res, c_res = await asyncio.gather(gemini_task, gpt_task, clova_task)

    return {
        "gemini": g_res,
        "gpt": p_res,
        "clova": c_res
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)