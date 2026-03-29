import google.generativeai as genai
import PIL.Image
from openai import OpenAI
import requests
import uuid
import base64
import asyncio

class VQAModelHandler:
    def __init__(self, keys: dict):
        self.keys = keys
        # Gemini 설정
        if keys.get("GEMINI"):
            genai.configure(api_key=keys.get("GEMINI"))
        # GPT 설정
        if keys.get("GPT"):
            self.gpt_client = OpenAI(api_key=keys.get("GPT"))

    def _encode_image(self, image_file):
        image_file.seek(0)
        return base64.b64encode(image_file.read()).decode('utf-8')

    async def get_gemini_res(self, image_file, system_persona, prompt):
        try:
            image_file.seek(0)
            img = PIL.Image.open(image_file)
            model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_persona)
            response = await asyncio.to_thread(model.generate_content, [img, prompt])
            return response.text
        except Exception as e:
            return f"Gemini 에러: {str(e)}"

    async def get_gpt_res(self, image_file, system_persona, prompt):
        try:
            image_file.seek(0)
            base64_image = self._encode_image(image_file)
            response = await asyncio.to_thread(
                self.gpt_client.chat.completions.create,
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": system_persona},
                    {"role": "user", "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"GPT 에러: {str(e)}"

    async def get_clova_res(self, system_persona, prompt):
        try:
            host = 'https://clovastudio.stream.ntruss.com'
            headers = {
                'Authorization': f'Bearer {self.keys.get("CLOVA")}',
                'X-NCP-CLOVASTUDIO-REQUEST-ID': str(uuid.uuid4()),
                'Content-Type': 'application/json'
            }
            payload = {
                "messages": [
                    {"role": "system", "content": system_persona},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.3
            }
            res = await asyncio.to_thread(requests.post, f"{host}/v3/chat-completions/HCX-005", headers=headers, json=payload)
            return res.json()['result']['message']['content']
        except Exception as e:
            return f"Clova X 에러: {str(e)}"