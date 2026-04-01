# =========== compare_test.py (클로바 제거 버전) =======================
import os
import base64
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai
from PIL import Image

# 🚨 우리의 소중한 프롬프트 파일 불러오기
from prompts import get_final_prompt

# .env 파일에서 키 불러오기 (클로바 제외)
load_dotenv()
OPENAI_API_KEY = os.getenv("GPT_API_KEY")
GEMINI_API_KEY = os.getenv("VQA_API_KEY")

# ==========================================
# 🧪 1. VLM (이미지 인식) 테스트 세팅
# ==========================================
IMAGE_PATH = "냉장고통이미지.png" 

# ==========================================
# 🧪 2. 카테고리를 "가전/디지털"로 설정합니다!
# ==========================================
TEST_CATEGORY = "가전/디지털"

# 중앙 관리되는 프롬프트 결합
vlm_prompt = get_final_prompt(TEST_CATEGORY)

# ==========================================
# 🤖 2. 모델별 VLM 지원 함수
# ==========================================
def test_openai_vlm():
    """GPT-4o 이미지 분석"""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        with open(IMAGE_PATH, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "user", "content": [
                    {"type": "text", "text": vlm_prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]}
            ]
        )
        return response.choices[0].message.content
    except Exception as e: return f"GPT VLM 에러: {e}"

def test_gemini_vlm():
    """Gemini 2.5 Flash 이미지 분석"""
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        img = Image.open(IMAGE_PATH)
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([vlm_prompt, img])
        return response.text
    except Exception as e: return f"Gemini VLM 에러: {e}"

# ==========================================
# 🚀 3. 결과 동시 출력
# ==========================================
if __name__ == "__main__":
    if not os.path.exists(IMAGE_PATH):
        print(f"🚨 에러: '{IMAGE_PATH}' 파일을 찾을 수 없습니다.")
        exit()

    print("=" * 60)
    print("VLM (이미지 인식) 모델 1:1 비교 테스트")
    print("-" * 60)
    print(f"📷 테스트 이미지: {IMAGE_PATH}")
    print("=" * 60)
    
    print("\n[🤖 1. GPT-4o VLM 결과]\n", test_openai_vlm())
    print("-" * 60)
    print("\n[✨ 2. Gemini 2.5 Flash VLM 결과]\n", test_gemini_vlm())
    print("=" * 60)