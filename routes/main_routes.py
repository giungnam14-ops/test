"""
메인/대시보드 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, session, g
from auth import login_required

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def index():
    if "user_id" in session:
        return redirect(url_for("main.dashboard"))
    return redirect(url_for("auth.login"))

@main_bp.route("/dashboard")
@login_required
def dashboard():
    # 1. Total Buildings
    cur = g.db.execute("SELECT COUNT(*) FROM buildings")
    total_buildings = cur.fetchone()[0]

    # 2. Danger Count (Detected but likely not resolved/approved yet? Or just total detected)
    # Let's show "Danger" risks found in last 30 days
    cur = g.db.execute("SELECT COUNT(*) FROM ai_analysis WHERE risk_level = 'Danger'")
    cnt_danger = cur.fetchone()[0]

    # 3. Recent Analyses
    sql = """
        SELECT a.risk_level, b.name as building_name, a.analyzed_at, a.id as analysis_id
        FROM ai_analysis a
        JOIN inspections i ON a.inspection_id = i.id
        JOIN buildings b ON i.building_id = b.id
        ORDER BY a.analyzed_at DESC
        LIMIT 5
    """
    cur = g.db.execute(sql)
    recent_analyses = cur.fetchall()

    return render_template("dashboard.html", 
                         total_buildings=total_buildings,
                         cnt_danger=cnt_danger,
                         recent_analyses=recent_analyses)
