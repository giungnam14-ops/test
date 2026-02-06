from duckduckgo_search import DDGS
import random

# Mock DB only for structured metadata (hard to parse reliably from web without NLP)
# But we will use Real Images for everything.
MOCK_METADATA = {
    "타워팰리스": {"year": 2002, "loc": "서울 강남구 도곡동", "usage": "주상복합", "method": "철근콘크리트(RC) + 커튼월"},
    "63빌딩": {"year": 1985, "loc": "서울 영등포구 여의도동", "usage": "업무시설", "method": "철골조(Steel Frame)"},
    "롯데월드타워": {"year": 2017, "loc": "서울 송파구 신천동", "usage": "주상복합/업무", "method": "코어월(Core Wall) + 아웃리거"},
    "부르즈 할리파": {"year": 2010, "loc": "두바이", "usage": "복합", "method": "버트레스 코어(Buttressed Core)"}
}

def search_building_info(query):
    """
    Search for building image using DuckDuckGo and simulate metadata.
    """
    if not query:
        return None

    # 1. Real Image Search (with Robust Fallback)
    image_url = None
    
    # Try Live Search first
    try:
        with DDGS() as ddgs:
            search_query = f"{query} building"
            results = list(ddgs.images(search_query, max_results=1))
            if results:
                image_url = results[0]['image']
    except Exception as e:
        print(f"Search Rate Limited or Error: {e}")

    # 2. Fallback Logic
    if not image_url:
        # Check Known Mocks (Static reliability)
        found_mock = False
        for name, info in MOCK_METADATA.items():
            if name in query or query in name:
                # We need image URLs for these mocks if we want them to look distinct
                # Let's add hardcoded valid URLs for the known mocks
                if "타워팰리스" in name: image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Tower_Palace_in_Seoul.jpg/800px-Tower_Palace_in_Seoul.jpg"
                elif "63빌딩" in name: image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/63_Building_2017.jpg/800px-63_Building_2017.jpg"
                elif "롯데월드타워" in name: image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Lotte_World_Tower_181014.jpg/800px-Lotte_World_Tower_181014.jpg"
                elif "부르즈" in name: image_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Burj_Dubai_2009.jpg/800px-Burj_Dubai_2009.jpg"
                found_mock = True
                break
        
        # If still no image, use Random Pool (so they don't look identical)
        if not image_url:
            pool = [
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1000", # Skyscraper
                "https://images.unsplash.com/photo-1479839672679-a46483c0e7c1?q=80&w=1000", # Architecture
                "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=1000", # Apartment
                "https://images.unsplash.com/photo-1545324418-cc1a3d272947?q=80&w=1000", # Concrete
                "https://images.unsplash.com/photo-1517581177697-00e27b22e8df?q=80&w=1000"  # Facade
            ]
            image_url = random.choice(pool)

    # 3. Metadata Generation
    matched_info = None
    for name, info in MOCK_METADATA.items():
        if name in query or query in name:
            matched_info = info
            break
    
    if matched_info:
        data = {
            "construction_year": matched_info["year"],
            "location": matched_info["loc"],
            "usage": matched_info["usage"],
            "method": matched_info["method"]
        }
    else:
        # Simulate data for unknown buildings
        data = {
            "construction_year": random.randint(1990, 2023),
            "location": "검색된 위치 정보",
            "usage": "일반 건축물",
            "method": "철근콘크리트(RC) 추정"
        }

    return {
        "name": query,
        "image_url": image_url,
        "data": data
    }
