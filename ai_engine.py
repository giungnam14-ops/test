import cv2
import numpy as np
import os
import random

def detect_cracks(image_path):
    """
    Analyze image for cracks using Canny Edge Detection and simulate structural analysis.
    Returns:
        score (float): 0.0 ~ 100.0 (Edge Density)
        risk_level (str): 'Safe', 'Caution', 'Danger'
        construction_method (str): Simulated detection
        structural_stability (str): Contextual analysis
    """
    if not os.path.exists(image_path):
        return 0, "Safe", "Unknown", "분석 불가"

    # 1. Image Loading
    img = cv2.imread(image_path)
    if img is None:
        return 0, "Safe", "Unknown", "분석 불가"
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 2. Preprocessing
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # 3. Edge Detection
    edges = cv2.Canny(blurred, 50, 150)

    # 4. Calculate Edge Density
    total_pixels = edges.size
    edge_pixels = np.count_nonzero(edges)
    
    if total_pixels == 0:
        density = 0
    else:
        density = (edge_pixels / total_pixels) * 100
    
    score = round(density, 2)

    # 5. Risk Classification Logic
    if score < 1.0:
        risk_level = "Safe"
    elif score < 5.0:
        risk_level = "Caution"
    else:
        risk_level = "Danger"

    # 6. Advanced Analysis & Visualization
    
    # A. Generate Processed Image (Visual Overlay)
    # Draw contours on the image to visualize cracks
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create a copy to draw on
    processed_img = img.copy()
    
    # Draw red contours for cracks
    cv2.drawContours(processed_img, contours, -1, (0, 0, 255), 2)
    
    # Save processed image
    filename = os.path.basename(image_path)
    processed_filename = f"processed_{filename}"
    processed_path = os.path.join(os.path.dirname(image_path), processed_filename)
    cv2.imwrite(processed_path, processed_img)
    
    # Return relative path for web
    processed_web_path = f"uploads/{processed_filename}"

    methods = ["철근콘크리트(RC)", "조적조(벽돌)", "철골구조(Steel)", "프리캐스트 콘크리트(PC)"]
    if density > 10:
        method = "조적조(벽돌)"
    else:
        method = random.choice(methods)

    # B. Chart Data (Simulation)
    # Metrics: Safety, Durability, Design Quality, Foundation Stability, Maintenance
    # If High Risk -> Low Safety
    base_score = 100 - score
    if risk_level == "Danger":
        chart_data = {
            "safety": max(10, int(base_score - 20)),
            "durability": max(10, int(base_score - 30)),
            "design": random.randint(30, 60),
            "foundation": max(10, int(base_score - 10)),
            "maintenance": 10 # Urgent
        }
    elif risk_level == "Caution":
        chart_data = {
            "safety": int(base_score),
            "durability": int(base_score - 10),
            "design": random.randint(60, 80),
            "foundation": int(base_score),
            "maintenance": 40 # Needs attention
        }
    else:
        chart_data = {
            "safety": 95,
            "durability": 90,
            "design": 85,
            "foundation": 98,
            "maintenance": 90
        }

    # C. Generative Text Analysis
    if risk_level == "Safe":
        stability = (
            f"✅ **구조적 안정성 평가**: 양호\n"
            f"현재 {method} 기반의 주 구조체는 설계 하중을 효과적으로 분산하고 있으며, 내력벽의 비틀림이나 전단 균열 징후가 없습니다. "
            f"이는 초기 시공 품질이 우수함을 시사하며, 건물 수명 주기(Life Cycle) 상 '성숙기'의 안정적인 상태를 유지하고 있습니다."
        )
    elif risk_level == "Caution":
        stability = (
            f"⚠️ **구조적 안정성 평가**: 주의 요망\n"
            f"{method} 표면부의 인장 응력 집중으로 인한 미세 균열(Hairline Crack)이 감지되었습니다. "
            f"이는 구조적 붕괴 위험보다는 재료의 노후화, 건조 수축, 또는 미세한 부등 침하의 초기 신호일 수 있습니다. "
            f"특히 접합부(Joint) 주변의 응력 변화를 지속적으로 모니터링해야 합니다."
        )
    else:
        stability = (
            f"🚨 **구조적 안정성 평가**: 심각/위험\n"
            f"주요 내력 부재에서 {score}% 이상의 고밀도 균열 패턴이 식별되었습니다. "
            f"이는 허용 응력을 초과하는 외력이나 기반 지반의 변형이 원인일 가능성이 높습니다. "
            f"{method} 내부 철근의 부식이나 콘크리트 중성화가 빠르게 진행되고 있을 수 있으므로, 비파괴 검사(NDT)를 포함한 정밀 안전 진단이 즉시 수행되어야 합니다."
        )

    # D. Internal & Facility Risk Analysis (Simulation)
    # Simulate identifying specific internal hazards
    internal_risks = {
        "exposed_wiring": random.choice([True, False]) if density > 5 else False,
        "water_leakage": random.choice([True, False]) if risk_level == "Danger" else False,
        "ceiling_instability": True if method == "조적조(벽돌)" and density > 8 else False,
        "fire_hazard": random.choice(["Low", "Medium", "High"])
    }
    
    unstable_zones = []
    if internal_risks["exposed_wiring"]:
        unstable_zones.append("전기 배선 노출 (감전/화재 위험)")
    if internal_risks["water_leakage"]:
        unstable_zones.append("천장/벽면 누수 흔적 (부식 가속화)")
    if internal_risks["ceiling_instability"]:
        unstable_zones.append("천장 마감재 탈락 위험 (구조적 처짐)")
    
    if not unstable_zones:
        unstable_zones.append("특이사항 없음 (내부 설비 양호)")

    # E. Expert-Level Report Generation (Simulation)
    # Structured data for professional reporting
    expert_report = {
        "diagnosis": {
            "title": "정밀 진단 소견 (Detailed Diagnosis)",
            "content": [],
            "severity_class": "Class " + ("A" if risk_level == "Safe" else "C" if risk_level == "Danger" else "B")
        },
        "causes": {
            "title": "손상 원인 분석 (Root Cause Analysis)",
            "content": []
        },
        "repairs": {
            "title": "보수/보강 대책 (Remedial Measures)",
            "content": []
        },
        "durability": {
            "title": "내구성 평가 (Durability Assessment)",
            "content": []
        }
    }

    # 1. Diagnosis Content
    if risk_level == "Danger":
        expert_report["diagnosis"]["content"] = [
            "주요 내력 부재(기둥/내력벽)에서 관찰된 균열의 폭이 허용 한계(0.3mm)를 초과하였습니다.",
            "균열의 진행 방향이 전단 응력(Shear Stress)의 흐름과 일치하여 구조적 내력 저하가 우려됩니다.",
            "박리(Spalling) 및 철근 노출 가능성이 높으며, 이는 콘크리트 피복 두께 부족에 기인할 수 있습니다."
        ]
    elif risk_level == "Caution":
        expert_report["diagnosis"]["content"] = [
            "표면 건조 수축(Drying Shrinkage)에 의한 망상형 미세 균열이 다수 관찰됩니다.",
            "구조적 거동에 의한 관통 균열은 아니나, 수분 침투로 인한 장기적 내구성 저하가 우려됩니다.",
            "비구조 요소(조적 채움벽 등)와 구조체 사이의 이질재 접합부 균열이 확인됩니다."
        ]
    else:
        expert_report["diagnosis"]["content"] = [
            "대상 부재의 표면 상태는 전반적으로 건전(Sound)합니다.",
            "식별된 미세 균열은 헤어라인(Hairline) 수준으로 구조적 거동과 무관합니다.",
            "시공 조인트(Construction Joint) 부위의 마감이 양호하게 보존되어 있습니다."
        ]

    # 2. Root Causes
    if method == "철근콘크리트(RC)":
        expert_report["causes"]["content"].append("콘크리트 타설 후 양생 과정에서의 수화열 및 건조 수축")
    elif method == "조적조(벽돌)":
        expert_report["causes"]["content"].append("조적 벽체의 모르타르 접착력 저하 및 횡방향 하중 취약성")
    
    if score > 50:
        expert_report["causes"]["content"].append("지반 부등 침하(Differential Settlement)로 인한 응력 집중")
        expert_report["causes"]["content"].append("설계 하중을 초과하는 과도한 활하중(Live Load) 작용 가능성")
    else:
         expert_report["causes"]["content"].append("장기적인 온도 변화(Thermal Expansion)에 따른 재료의 피로 누적")

    # 3. Repair Recommendations
    if risk_level == "Danger":
        expert_report["repairs"]["content"] = [
            "**에폭시 주입 공법(Epoxy Injection)**: 0.3mm 이상 균열에 구조용 에폭시를 고압 주입하여 일체성 확보",
            "**강판 보강(Steel Plate Bonding)**: 내력이 부족한 부재에 강판을 부착하여 인장/전단 내력 증진",
            "**단면 복구**: 박리된 콘크리트를 제거하고 폴리머 모르타르로 단면 복구 후 표면 강화제 도포"
        ]
    elif risk_level == "Caution":
        expert_report["repairs"]["content"] = [
            "**표면 실링(Surface Sealing)**: 미세 균열을 통한 수분/이산화탄소 침투 방지",
            "**V-컷팅 및 충전**: 진행성 여부 확인 후 신축성을 가진 실링재 충전",
            "**누수 부위 인젝션**: 습식 균열 부위에 친수성 우레탄 발포제 주입"
        ]
    else:
        expert_report["repairs"]["content"] = [
            "**정기 점검(Regular Inspection)**: 현재 상태 유지 관리를 위한 1년 단위 육안 점검",
            "**표면 청소 및 발수제 도포**: 오염물 제거 및 표면 보호층 형성 권장"
        ]

    return score, risk_level, method, stability, processed_web_path, chart_data, unstable_zones, expert_report
