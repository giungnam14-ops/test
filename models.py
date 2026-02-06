"""
DB 테이블 정의 및 초기화
- sqlite3 사용
- init_db() 호출 시 기존 테이블 삭제(Project Pivot) 후 신규 생성
"""
import sqlite3
import os
from werkzeug.security import generate_password_hash

from config import DATABASE_PATH, DATA_DIR


def get_connection():
    """DB 연결 반환"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    DB 재설계 (Project Pivot):
    - 기존 테이블(checklist 관련) 모두 삭제
    - 신규 테이블(AI 점검 관련) 생성
    - 시드 데이터(관리자/점검자) 재생성
    """
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = get_connection()

    try:
        # 0. 기존 테이블 정리 (Pivot)
        # 만약 기존 앱이 실행 중이었다면 테이블이 남아있을 수 있음
        drop_tables = [
            "inspection_result_items", "inspection_records", "inspection_items", "sites",  # Old tables
            "reports", "ai_analysis", "inspections", "buildings", "users"  # New tables (to ensure clean slate)
        ]
        for table in drop_tables:
            conn.execute(f"DROP TABLE IF EXISTS {table}")

        # 1. 사용자 테이블
        conn.execute("""
            CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('admin', 'inspector'))
            )
        """)

        # 2. 건축물 정보 (Buildings)
        conn.execute("""
            CREATE TABLE buildings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                location TEXT,
                usage TEXT,
                construction_year INTEGER,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 3. 점검 데이터 (Inspections - Raw Image)
        conn.execute("""
            CREATE TABLE inspections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                building_id INTEGER NOT NULL,
                image_path TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
            )
        """)

        # 4. AI 분석 결과 (AI Analysis)
        conn.execute("""
            CREATE TABLE ai_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                inspection_id INTEGER NOT NULL,
                crack_detected INTEGER DEFAULT 0,  -- 0: False, 1: True
                crack_score REAL,                  -- 0.0 ~ 100.0 (균열 심각도)
                risk_level TEXT CHECK(risk_level IN ('Safe', 'Caution', 'Danger')),
                construction_method TEXT,          -- 예: 철근콘크리트, 조적조
                structural_stability TEXT,         -- 안정성 분석 텍스트
                processed_image_path TEXT,         -- 균열 시각화 이미지 경로
                chart_data_json TEXT,              -- 차트 데이터 (JSON)
                internal_risks_json TEXT,          -- 내부 위험 요소 (JSON)
                expert_report_json TEXT,           -- 전문가 리포트 (JSON)
                analyzed_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (inspection_id) REFERENCES inspections(id) ON DELETE CASCADE
            )
        """)

        # 5. 결과 리포트 (Reports - Human Verification)
        conn.execute("""
            CREATE TABLE reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                analysis_id INTEGER NOT NULL,
                summary TEXT,
                is_approved INTEGER DEFAULT 0,     -- 0: 미승인, 1: 승인
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (analysis_id) REFERENCES ai_analysis(id) ON DELETE CASCADE
            )
        """)

        # 시드 데이터: 사용자
        conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            ("admin", generate_password_hash("admin123"), "admin")
        )
        conn.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)",
            ("inspector", generate_password_hash("inspector123"), "inspector")
        )

        # 시드 데이터: 테스트용 건물
        conn.execute(
            "INSERT INTO buildings (name, location, usage, construction_year) VALUES (?, ?, ?, ?)",
            ("성수동 A오피스", "서울 성동구 성수동", "업무시설", 1995)
        )
        conn.execute(
            "INSERT INTO buildings (name, location, usage, construction_year) VALUES (?, ?, ?, ?)",
            ("강남 B아파트", "서울 강남구 역삼동", "주거시설", 2010)
        )

        conn.commit()
    finally:
        conn.close()
