from flask import Blueprint, render_template, request, redirect, url_for, flash, g
from auth import login_required, admin_required

building_bp = Blueprint("building", __name__, url_prefix="/buildings")

@building_bp.route("/", methods=["GET"])
@login_required
def list_buildings():
    cur = g.db.execute("SELECT * FROM buildings ORDER BY created_at DESC")
    buildings = cur.fetchall()
    return render_template("building/list.html", buildings=buildings)

@building_bp.route("/add", methods=["GET", "POST"])
@login_required
@admin_required
def add_building():
    if request.method == "POST":
        name = request.form["name"]
        location = request.form["location"]
        usage = request.form["usage"]
        construction_year = request.form["construction_year"]

        g.db.execute(
            "INSERT INTO buildings (name, location, usage, construction_year) VALUES (?, ?, ?, ?)",
            (name, location, usage, construction_year)
        )
        g.db.commit()
        flash("건축물이 등록되었습니다.")
        return redirect(url_for("building.list_buildings"))
    
    return render_template("building/add.html")

@building_bp.route("/delete/<int:building_id>", methods=["POST"])
@login_required
@admin_required
def delete_building(building_id):
    g.db.execute("DELETE FROM buildings WHERE id = ?", (building_id,))
    g.db.commit()
    flash("건축물이 삭제되었습니다.")
    return redirect(url_for("building.list_buildings"))
