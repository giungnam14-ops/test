from flask import Blueprint, render_template, request, redirect, url_for, flash, g
from auth import login_required

report_bp = Blueprint("report", __name__, url_prefix="/report")

@report_bp.route("/approve", methods=["POST"])
@login_required
def approve_analysis():
    analysis_id = request.form["analysis_id"]
    summary = request.form["summary"]
    
    # Check if already approved? (Optional)
    
    cur = g.db.execute(
        "INSERT INTO reports (analysis_id, summary, is_approved) VALUES (?, ?, 1)",
        (analysis_id, summary)
    )
    report_id = cur.lastrowid
    g.db.commit()
    
    flash("점검 결과가 승인되었습니다.")
    return redirect(url_for('report.view_report', report_id=report_id))

@report_bp.route("/view/<int:report_id>", methods=["GET"])
@login_required
def view_report(report_id):
    sql = """
        SELECT r.*, a.*, i.image_path, b.name as building_name, b.location, b.construction_year, b.usage
        FROM reports r
        JOIN ai_analysis a ON r.analysis_id = a.id
        JOIN inspections i ON a.inspection_id = i.id
        JOIN buildings b ON i.building_id = b.id
        WHERE r.id = ?
    """
    cur = g.db.execute(sql, (report_id,))
    report = cur.fetchone()
    
    if not report:
        flash("리포트를 찾을 수 없습니다.")
        return redirect(url_for('report.list_reports'))
        
    # Parse JSONs
    import json
    chart_data = json.loads(report['chart_data_json']) if report['chart_data_json'] else {}
    expert_report = json.loads(report['expert_report_json']) if report['expert_report_json'] else {}
    
    return render_template("report/view.html", report=report, chart_data=chart_data, expert_report=expert_report)

@report_bp.route("/list", methods=["GET"])
@login_required
def list_reports():
    sql = """
        SELECT r.*, a.risk_level, b.name as building_name, i.created_at
        FROM reports r
        JOIN ai_analysis a ON r.analysis_id = a.id
        JOIN inspections i ON a.inspection_id = i.id
        JOIN buildings b ON i.building_id = b.id
        ORDER BY r.created_at DESC
    """
    cur = g.db.execute(sql)
    reports = cur.fetchall()
    return render_template("report/list.html", reports=reports)
