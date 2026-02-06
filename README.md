# 산업현장 안전성 측정 앱

산업현장의 안전 상태를 점검·기록·점수화·이력 관리하는 웹 앱입니다.

## 기술 스택

- Python 3.x
- Flask
- SQLite
- Jinja2 (HTML 템플릿)
- fpdf2 (PDF 보고서)

## 설치 및 실행

```bash
cd safety-inspection-app
python -m venv venv
.\venv\Scripts\Activate.ps1   # Windows PowerShell
# 또는: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```

브라우저에서 http://127.0.0.1:5000 접속

## 초기 계정

- **관리자**: admin / admin123
- **점검자**: inspector / inspector123

## 기능

- 로그인 및 권한 관리 (관리자 / 점검자)
- 사업장(현장) 관리 (관리자만 등록/수정/삭제)
- 산업안전 점검 체크리스트
- 안전 점수 자동 계산 (안전=2점, 주의=1점, 위험=0점)
- 위험 항목 요약
- 점검 이력 저장 및 조회
- 점검 결과 PDF 보고서 출력
