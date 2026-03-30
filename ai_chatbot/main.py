import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 1. 환경 변수에서 API 키 읽기
# 서버 시스템에 등록된 'GOOGLE_API_KEY'를 가져옵니다.
api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI(title="NextVision Gemini Chatbot")

# CORS 설정 (PUB 서버와 통신 허용) [cite: 16, 28]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    status: str

@app.post("/api/chat", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    try:
        # 제미나이 호출
        response = model.generate_content(request.message)
        return ChatResponse(reply=response.text, status="success")
    except Exception as e:
        return ChatResponse(reply=f"AI 서버 에러: {str(e)}", status="error")
