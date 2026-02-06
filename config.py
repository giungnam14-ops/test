"""
설정 파일
- DB 경로, 시크릿 키 등 앱 설정
"""
import os

# 프로젝트 루트 경로
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# SQLite DB 파일 경로 (data 폴더에 생성)
DATA_DIR = os.path.join(BASE_DIR, "data")
DATABASE_PATH = os.path.join(DATA_DIR, "inspection.db")

# Flask 세션 암호화용 키 (실제 운영 시 환경변수로 설정 권장)
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")

# Google OAuth 클라이언트 ID
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com")
