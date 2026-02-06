"""
Flask 앱 진입점
- DB 연결: before_request에서 g.db 설정, teardown에서 닫기
- 라우트 등록
"""
import os

from flask import Flask, g

from config import SECRET_KEY, DATABASE_PATH
from models import init_db, get_connection

from routes.auth_routes import auth_bp
from routes.main_routes import main_bp
from routes.building_routes import building_bp
from routes.inspection_routes import inspection_bp
from routes.report_routes import report_bp


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = SECRET_KEY

    # DB 초기화 (최초 실행 시 테이블 + 시드 데이터 생성)
    # models.py에서 init_db는 기존 테이블 삭제 후 재생성 로직 포함됨
    init_db()

    # 요청 시작 시 DB 연결, 종료 시 닫기
    @app.before_request
    def before_request():
        g.db = get_connection()

    @app.teardown_request
    def teardown_request(exception=None):
        db = getattr(g, "db", None)
        if db is not None:
            db.close()

    # 현재 사용자 정보를 g에 저장 (템플릿에서 사용)
    @app.before_request
    def load_user():
        from auth import get_current_user
        g.user = get_current_user()

    # Blueprint 등록
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(building_bp)
    app.register_blueprint(inspection_bp)
    app.register_blueprint(report_bp)

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
