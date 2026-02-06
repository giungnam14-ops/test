"""
인증 관련 유틸리티
- login_required: 로그인 필수 데코레이터
- get_current_user: 현재 로그인 사용자 정보
- verify_password: 비밀번호 검증
"""
from functools import wraps
from flask import session, redirect, url_for, g
from werkzeug.security import check_password_hash

from models import get_connection


def login_required(f):
    """로그인하지 않으면 /login으로 리다이렉트"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            return redirect(url_for("auth.login"))
        return f(*args, **kwargs)
    return decorated_function


def admin_required(f):
    """관리자만 접근 가능 (login_required 이후 사용)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("role") != "admin":
            return redirect(url_for("main.dashboard"))
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    """
    현재 로그인한 사용자 정보 반환
    - g.user에 저장 (템플릿에서 사용)
    - 없으면 None
    """
    if "user_id" not in session:
        return None
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, username, role FROM users WHERE id = ?",
            (session["user_id"],)
        ).fetchone()
        if row:
            return {"id": row["id"], "username": row["username"], "role": row["role"]}
    finally:
        conn.close()
    return None


def verify_password(username, password):
    """
    사용자명/비밀번호 검증
    - 성공 시 사용자 dict 반환
    - 실패 시 None
    """
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT id, username, password_hash, role FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        if row and check_password_hash(row["password_hash"], password):
            return {"id": row["id"], "username": row["username"], "role": row["role"]}
    finally:
        conn.close()
    return None


def verify_google_token(token):
    """
    Google ID Token 검증
    - 성공 시 사용자 정보 반환
    - 실패 시 None
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests
    from config import GOOGLE_CLIENT_ID

    try:
        # 토큰 검증
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)

        # 발급자(Issuer) 확인
        if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
            raise ValueError("Wrong issuer.")

        return {
            "sub": idinfo["sub"],
            "email": idinfo["email"],
            "name": idinfo.get("name"),
            "picture": idinfo.get("picture")
        }
    except ValueError:
        # 유효하지 않은 토큰
        return None
