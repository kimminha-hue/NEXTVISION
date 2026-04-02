import google.generativeai as genai
import PIL.Image
import asyncio

class VQAModelHandler:
    def __init__(self, keys: dict):
        self.keys = keys

        if keys.get("GEMINI"):
            genai.configure(api_key=keys.get("GEMINI"))
    
    # 프론트엔드에서 넘어온 사진과 프롬프트(질문)를 처리하는 핵심 함수
    async def get_gemini_res(self, image_file, system_persona, prompt):
        try:
            # system_instruction을 통해 시각장애인/일반 모드 페르소나를 모델에 주입
            model = genai.GenerativeModel('gemini-2.5-flash', system_instruction=system_persona)

            # 핵심 수정 사항 : NoneType 속성 에러(seek 에러)를 완벽하게 차단
            if image_file is not None:
                # 케이스1: 사진이 함께 들어온 경우 (멀티모달 가능)
                image_file.seek(0) # 파일 읽기 위치를 처음으로 초기화
                
                # 🚨 중요 수정: PIL.Image() 가 아니라 PIL.Image.open() 이어야 이미지를 정상적으로 엽니다!
                img = PIL.Image.open(image_file) 

                # 이미지와 텍스트를 함께 묶어서 제미나이에게 분석 요청
                response = await asyncio.to_thread(model.generate_content, [img, prompt])
            
            else:
                # 케이스2: 사진 없이 텍스트(질문)만 들어온 경우
                response = await asyncio.to_thread(model.generate_content, prompt)
            
            # 제미나이가 대답한 내용 중 텍스트 부분만 뽑아서 돌려보냄
            return response.text

        except Exception as e:
            # 혹시라도 에러가 발생하면 서버 뻗지 않고 에러 메시지를 프론트로 전달.
            return f"Gemini 호출 중 에러가 발생했습니다: {str(e)}"