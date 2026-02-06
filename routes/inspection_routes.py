import os
import time
import json
from flask import Blueprint, render_template, request, redirect, url_for, flash, g, current_app, jsonify
from werkzeug.utils import secure_filename
from auth import login_required
from ai_engine import detect_cracks
from search_service import search_building_info

inspection_bp = Blueprint("inspection", __name__, url_prefix="/inspection")

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@inspection_bp.route("/new", methods=["GET"])
@login_required
def new_inspection():
    cur = g.db.execute("SELECT id, name FROM buildings")
    buildings = cur.fetchall()
    return render_template("inspection/upload.html", buildings=buildings)

@inspection_bp.route("/search_building", methods=["POST"])
@login_required
def search_building():
    query = request.json.get("query")
    if not query:
        return jsonify({"success": False, "message": "검색어를 입력하세요."})
    
    result = search_building_info(query)
    if result:
        return jsonify({"success": True, "data": result})
    else:
        return jsonify({"success": False, "message": "건물 정보를 찾을 수 없습니다."})

import requests

# ... (Previous imports)

@inspection_bp.route("/process", methods=["POST"])
@login_required
def process_inspection():
    # Helper to create building if not exists (Auto-Lookup case)
    building_id = request.form.get('building_id')
    
    # If using Auto-Lookup, building_id might be empty but we have building_name
    if not building_id and request.form.get('building_name'):
        name = request.form.get('building_name')
        location = request.form.get('building_location', '정보 없음')
        usage = request.form.get('building_usage', '정보 없음')
        year = request.form.get('building_year', 0)
        
        # Check if already exists?
        cur = g.db.execute("SELECT id FROM buildings WHERE name = ?", (name,))
        row = cur.fetchone()
        if row:
            building_id = row[0]
        else:
            cur = g.db.execute(
                "INSERT INTO buildings (name, location, usage, construction_year) VALUES (?, ?, ?, ?)",
                (name, location, usage, year)
            )
            building_id = cur.lastrowid
            g.db.commit()

    # Image Handling: Check File OR URL
    filepath = None
    
    if 'file' in request.files and request.files['file'].filename != '':
        file = request.files['file']
        if allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filename = f"{int(time.time())}_{filename}"
            upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
            os.makedirs(upload_folder, exist_ok=True)
            filepath = os.path.join(upload_folder, filename)
            file.save(filepath)
            
    elif 'image_url' in request.form and request.form['image_url']:
        # Download from URL
        image_url = request.form['image_url']
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(image_url, headers=headers, timeout=10)
            if response.status_code == 200:
                filename = f"{int(time.time())}_downloaded.jpg"
                upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
                os.makedirs(upload_folder, exist_ok=True)
                filepath = os.path.join(upload_folder, filename)
                with open(filepath, 'wb') as f:
                    f.write(response.content)
            else:
                print(f"Image download failed: Status {response.status_code}")
                flash(f"이미지 다운로드 실패 (상태 코드: {response.status_code})")
                return redirect(url_for('inspection.new_inspection'))
        except Exception as e:
            print(f"Image download error: {e}")
            flash(f"이미지 다운로드 오류: {e}")
            return redirect(url_for('inspection.new_inspection'))
            
    if not filepath:
        flash('이미지를 업로드하거나 검색된 이미지를 선택해주세요.')
        return redirect(url_for('inspection.new_inspection'))
        
    # 1. Save Inspection
    # Note: filepath is absolute for saving, but relative for DB
    relative_path = f"uploads/{os.path.basename(filepath)}"
    
    cur = g.db.execute(
        "INSERT INTO inspections (building_id, image_path) VALUES (?, ?)",
        (building_id, relative_path)
    )
    inspection_id = cur.lastrowid
    
    # 2. Trigger Deep AI Analysis
    score, risk_level, method, stability, processed_path, chart_data, unstable_zones, expert_report = detect_cracks(filepath)
    crack_detected = 1 if risk_level != "Safe" else 0
    
    cur = g.db.execute(
        """INSERT INTO ai_analysis 
            (inspection_id, crack_detected, crack_score, risk_level, construction_method, structural_stability, processed_image_path, chart_data_json, internal_risks_json, expert_report_json) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (inspection_id, crack_detected, score, risk_level, method, stability, processed_path, json.dumps(chart_data), json.dumps(unstable_zones), json.dumps(expert_report))
    )
    analysis_id = cur.lastrowid
    
    g.db.commit()
    
    flash("AI 심층/내부 분석이 완료되었습니다.")
    return redirect(url_for('inspection.view_result', analysis_id=analysis_id))

@inspection_bp.route("/result/<int:analysis_id>", methods=["GET"])
@login_required
def view_result(analysis_id):
    sql = """
        SELECT a.*, i.image_path, i.created_at, b.name as building_name, b.construction_year
        FROM ai_analysis a
        JOIN inspections i ON a.inspection_id = i.id
        JOIN buildings b ON i.building_id = b.id
        WHERE a.id = ?
    """
    cur = g.db.execute(sql, (analysis_id,))
    result = cur.fetchone()
    
    if not result:
        flash("분석 결과를 찾을 수 없습니다.")
        return redirect(url_for('main.index'))
    
    # Parse JSON chart data
    chart_data = json.loads(result['chart_data_json']) if result['chart_data_json'] else {}
    internal_risks = json.loads(result['internal_risks_json']) if result['internal_risks_json'] else []
    expert_report = json.loads(result['expert_report_json']) if result['expert_report_json'] else {}
        
    return render_template("inspection/result.html", result=result, chart_data=chart_data, internal_risks=internal_risks, expert_report=expert_report)
