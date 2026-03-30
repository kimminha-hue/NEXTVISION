import json
import pandas as pd
import re

# 1. JSON 파일 읽기 (파일명이 data.json이라고 가정)
# 기존 코드: 같은 폴더에서 찾기
# with open('data.json', 'r', encoding='utf-8') as f:

# 수정된 코드: 한 칸 위(../)의 shop 폴더 안에서 찾기
with open('../shop/data.json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

csv_data = []

for item in raw_data:
    # 줄바꿈 문자(\n)나 불필요한 공백을 깔끔하게 제거
    clean_desc = re.sub(r'\n+', ' ', item['description']).replace('&nbsp;', ' ').replace('-', '').strip()
    
    # 성분/구성(ingredients) 배열을 하나의 자연스러운 문장으로 합치기
    ingredients_text = ", ".join(item['ingredients'])
    
    # 💡 [핵심] 제미나이가 읽기 좋게 description과 ingredients를 합쳐서 blind_desc 생성
    blind_desc = f"{clean_desc} 주요 소재 및 구성은 [{ingredients_text}] 입니다."
    
    # CSV에 들어갈 한 줄(row) 데이터 조립
    csv_row = {
        "product_id": item['id'],
        "blind_desc": blind_desc,
        "general_tips": f"{item['category']} 상품에 맞는 일반적인 팁",
        "essential_info": f"가격: {item['price']}원, 상품명: {item['name']}"
    }
    csv_data.append(csv_row)

# 2. 판다스(Pandas)를 이용해 데이터프레임으로 변환
df = pd.DataFrame(csv_data)

# 3. test001.csv 파일로 예쁘게 저장
df.to_csv('test001.csv', index=False, encoding='utf-8-sig')

print("🎉 성공적으로 test001.csv 파일이 생성되었습니다! (총 {}개 상품)".format(len(df)))