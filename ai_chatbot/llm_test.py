import os
import requests
import json
import uuid
from openai import OpenAI
from dotenv import load_dotenv


# .env 파일 로드
load_dotenv()

# ==========================================
# 1. API 키 설정 (여기에 발급받은 키를 넣어주세요)
# ==========================================
OpenAI_API= os.getenv("GPT_API_KEY")
# 방금 [API 키] 메뉴에서 생성한 키를 넣어주세요. (Bearer 단어는 제외하고 키값만)
CLOVA_API_KEY = os.getenv("CLOVA_API_KEY")

# ==========================================
# 2. RAG 시뮬레이션용 데이터
# ==========================================
retrieved_product_info = """
상품명: 에어 텀블러 500ml
특징: 스테인리스 스틸 재질로 가볍고 튼튼함. 겉면은 무광 처리되어 만졌을 때 부드럽고 미끄러지지 않음.
크기: 지름 7cm, 높이 22cm. 성인 남성 한 손에 딱 잡히는 크기.
사용법: 뚜껑을 시계 반대 방향으로 돌려 엽니다.
주의사항: 뜨거운 물을 넣었을 때 뚜껑을 열면 화상의 위험이 있으니 주의하세요.
"""

user_query = "이 텀블러 만졌을 때 느낌이 어때? 그리고 뜨거운 물 넣어도 돼?"

system_prompt = """
당신은 시각장애인을 위한 쇼핑 도우미 플랫폼 'NextVision'의 친절한 AI 어시스턴트입니다.
사용자는 화면을 볼 수 없으므로, 제공된 상품 정보를 바탕으로 시각적 요소를 촉각, 질감, 크기 등 
이해하기 쉬운 말로 풀어서 음성으로 안내하듯 자연스럽게 설명해야 합니다.
제공된 정보 외의 내용을 지어내지 마세요. 문장은 음성 출력(TTS)을 위해 너무 길지 않게 끊어서 말하세요.
"""

# ==========================================
# 3. 모델별 호출 함수
# ==========================================

def test_openai():
    """OpenAI GPT-4o 호출"""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt + f"\n\n[상품정보]\n{retrieved_product_info}"},
                {"role": "user", "content": user_query}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"OpenAI 에러 발생: {e}"

def test_clova_x():
    """Naver HyperCLOVA X (HCX-005) v3 호출"""
    host = 'https://clovastudio.stream.ntruss.com'
    # Request ID는 호출마다 고유해야 하므로 uuid를 사용해 자동 생성되게 만들었습니다.
    request_id = str(uuid.uuid4()) 
    
    headers = {
        'Authorization': f'Bearer {CLOVA_API_KEY}',
        'X-NCP-CLOVASTUDIO-REQUEST-ID': request_id,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json' # 텍스트를 한 번에 받기 위해 json으로 설정
    }
    
    # 방금 확인하신 코드의 최신 v3 페이로드 구조를 반영했습니다.
    payload = {
        "messages": [
            {
                "role": "system",
                "content": [{"type": "text", "text": system_prompt + f"\n\n[상품정보]\n{retrieved_product_info}"}]
            },
            {
                "role": "user",
                "content": [{"type": "text", "text": user_query}]
            }
        ],
        "topP": 0.8,
        "topK": 0,
        "maxTokens": 256,
        "temperature": 0.3, # 공정한 비교를 위해 온도 통일
        "repetitionPenalty": 1.1,
        "includeAiFilters": True
    }
    
    try:
        response = requests.post(f"{host}/v3/chat-completions/HCX-005", headers=headers, json=payload)
        response.raise_for_status()
        result_data = response.json()
        
        # v3 API의 응답 구조에서 텍스트 추출
        return result_data['result']['message']['content']
    except Exception as e:
        return f"Clova X 에러 발생: {e}\n응답 내용: {response.text if 'response' in locals() else ''}"

# ==========================================
# 4. 실행
# ==========================================
if __name__ == "__main__":
    print("=" * 60)
    print("[테스트 시작] 시각장애인 맞춤형 상품 안내 (OpenAI vs Clova X)")
    print("=" * 60)
    
    print("\n🗣️ 사용자 질문:", user_query)
    
    print("\n" + "-" * 60)
    print("🤖 1. OpenAI (ChatGPT) 응답 결과:")
    print("-" * 60)
    print(test_openai())
    
    print("\n" + "-" * 60)
    print("🍀 2. Naver Clova X (HCX-005) 응답 결과:")
    print("-" * 60)
    print(test_clova_x())
    print("\n" + "=" * 60)