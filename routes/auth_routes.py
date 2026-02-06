"""
로그인/로그아웃 라우트
"""
from flask import Blueprint, render_template, request, redirect, url_for, session

from auth import verify_password, login_required

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    """
    GET: 로그인 폼 표시
    POST: 로그인 처리 (세션에 user_id, role 저장)
    """
    if "user_id" in session:
        return redirect(url_for("main.dashboard"))
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "")

        if not username or not password:
            return render_template("login.html", error="사용자명과 비밀번호를 입력하세요.")

        user = verify_password(username, password)
        if user:
            session["user_id"] = user["id"]
            session["role"] = user["role"]
            return redirect(url_for("main.dashboard"))

        return render_template("login.html", error="사용자명 또는 비밀번호가 올바르지 않습니다.")

    return render_template("login.html")


@auth_bp.route("/logout")
def logout():
    """로그아웃: 세션 초기화 후 로그인 페이지로"""
    session.clear()
    return redirect(url_for("auth.login"))


@auth_bp.route("/auth/google", methods=["POST"])
def google_auth():
    """
    프론트엔드에서 전달받은 Google ID Token 검증 및 로그인 처리
    """
    from flask import jsonify
    from auth import verify_google_token
    import models

    data = request.get_json()
    id_token = data.get("id_token")

    if not id_token:
        return jsonify({"success": False, "message": "ID Token이 없습니다."}), 400

    user_info = verify_google_token(id_token)
    if not user_info:
        return jsonify({"success": False, "message": "유효하지 않은 Google 토큰입니다."}), 401

    # 사용자 DB 확인 및 필요시 생성
    conn = models.get_connection()
    try:
        # 이메일 기반 사용자 검색
        user = conn.execute(
            "SELECT id, username, role FROM users WHERE email = ?",
            (user_info["email"],)
        ).fetchone()

        if not user:
            # 신규 사용자 가입 (비밀번호 없음, role은 기본 inspector)
            username = user_info["email"].split("@")[0]
            cursor = conn.execute(
                "INSERT INTO users (username, email, role, password_hash) VALUES (?, ?, 'inspector', '')",
                (username, user_info["email"])
            )
            user_id = cursor.lastrowid
            role = "inspector"
            conn.commit()
        else:
            user_id = user["id"]
            role = user["role"]

        # 세션 저장
        session["user_id"] = user_id
        session["role"] = role

        return jsonify({"success": True, "redirect": url_for("main.dashboard")})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()
