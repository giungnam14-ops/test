import { useState, useEffect } from 'react'
import {
    Search,
    MapPin,
    ShieldCheck,
    History,
    LayoutDashboard,
    LogOut,
    AlertTriangle,
    FileText,
    X,
    Loader2,
    Building2,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    Activity,
    Eye,
    Maximize2,
    Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface Marker {
    x: number;
    y: number;
    label: string;
    type: 'SAFE' | 'CRACK' | 'LEAK' | 'CORROSION';
}

interface Building {
    id: string;
    name: string;
    address: string;
    type: string;
    year: string;
    image: string;
    score: number;
    expertAnalysis: string;
    recommendations: string[];
    markers: Marker[];
}

interface Inspection {
    id: string;
    date: string;
    building: string;
    status: 'SAFE' | 'WARNING' | 'DANGER';
    image: string;
    score: number;
    expertAnalysis: string;
    recommendations: string[];
    markers: Marker[];
}

declare global {
    interface Window {
        google: any;
        Kakao: any;
    }
}

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
    const [currentReport, setCurrentReport] = useState<Inspection | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [hoveredMarker, setHoveredMarker] = useState<Marker | null>(null)
    const [isManualEntry, setIsManualEntry] = useState(false)
    const [manualData, setManualData] = useState({ name: '', address: '', image: '' })
    const [isSearchingList, setIsSearchingList] = useState(false)
    const [searchPerformed, setSearchPerformed] = useState(false)
    const [searchResults, setSearchResults] = useState<Building[]>([])

    // Mock Data: Professional Buildings for Search
    const [buildings] = useState<Building[]>([
        {
            id: 'b5',
            name: '송파구 롯데월드타워 (LWT-123)',
            address: '서울시 송파구 올림픽로 300',
            type: '랜드마크 (초고층 빌딩)',
            year: '2017',
            image: 'https://images.unsplash.com/photo-1578130860806-78e70a6a7065?q=80&w=1000',
            score: 98,
            expertAnalysis: '대상 건축물은 국내 최고층 랜드마크로서 최신 지진 격리 시스템 및 동적 변위 제어 기술이 적용되어 있습니다. 코어벽체 및 메가 칼럼의 응력 분포는 설계 범위를 완벽히 충족하며, 고층부 수직 변위 역시 정밀 GPS 계측 결과 오차 범위 이내에서 안정화되었습니다. 외벽 커튼월 유닛의 풍압 저항 성능 및 기밀성 또한 우수하며, 하부 기초 매트의 부동 침하 가능성은 영(Zero)에 가깝습니다.',
            recommendations: [
                '초고층부 GPS 변위 모니터링 시스템 정기 캘리브레이션',
                '수직 수송 시스템(엘리베이터) 가이드 레일 정밀 하중 점검',
                '전망대 부근 클리닝 로봇 구동 경로 유격 보정'
            ],
            markers: [
                { x: 50, y: 10, label: "최상층부 첨탑부 풍압 안정성 양호", type: 'SAFE' as any },
                { x: 50, y: 50, label: "중층부 벨트 트러스 구간 구조 연결점 건전", type: 'SAFE' as any }
            ]
        },
        {
            id: 'b1',
            name: '강남구 테헤란로 엔타워 (GA-152)',
            address: '서울시 강남구 테헤란로 152',
            type: '업무시설 (초고층 빌딩)',
            year: '2015',
            image: 'https://images.unsplash.com/photo-1541904845547-0e6962060134?q=80&w=1000',
            score: 94,
            expertAnalysis: '대상 건축물의 구조적 동적 거동 분석 결과, 설계 허용치 이내의 안정성을 확보하고 있습니다. 지하 4층 기초 인근의 지반 반력 계수는 설계 기준(250kN/m²)을 만족하며, 코어벽체의 수직 변위 역시 시간 의존적 변형 모델 내에서 안정화 단계에 진입한 것으로 판단됩니다. 다만, 상층부 외벽 글라스월의 풍압 저항 성능에 대해 체결 부위의 미세한 피로도가 감지되오니 정기 유지보수 시 확인이 필요합니다.',
            recommendations: [
                '상부층 외벽 커튼월 체결 유닛 전수 조사 및 토크 조절',
                '지하 저수조 인근 구조체 미세 균열 에폭시 주입 보강',
                'BIM 데이터 기반의 실시간 변위 계측 시스템 캘리브레이션'
            ],
            markers: [
                { x: 30, y: 25, label: "상층부 커튼월 체결 피로도 감지 (풍압 영향)", type: 'CRACK' },
                { x: 55, y: 70, label: "B1층 기둥-보 접합부 미세 응력 집중", type: 'CRACK' }
            ]
        },
        {
            id: 'b2',
            name: '서초구 아크로리버파크 (AR-19)',
            address: '서울시 서초구 신반포로15길 19',
            type: '공동주택 (대단지 아파트)',
            year: '2016',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1000',
            score: 82,
            expertAnalysis: '한강 연접부에 위치한 지반 특성을 고려할 때, 기초 슬래브의 부동 침하 징후는 관찰되지 않습니다. 그러나 지하 주차장 최하층부(B3)의 일부 기둥 베이스에서 모세관 현상에 의한 누수 및 백화현상이 관찰되었습니다. 이는 방수층의 노후보다는 수압 변화에 따른 틈새 누수로 보이며, 즉각적인 배수 유도판 설치 및 배면 그라우팅 작업이 동반되어야 구조적 안정성을 장기적으로 보존할 수 있습니다.',
            recommendations: [
                '지하 주차장 B3층 기둥 베이스 배면 그라우팅 보강공사',
                '한강 유량 변화에 따른 지반 하중 분석 모델 업데이트',
                '단지 내 공동구 내부 방습 및 환기 시스템 전면 점검'
            ],
            markers: [
                { x: 45, y: 80, label: "지하 3층 기둥 베이스 누수 및 백화 구간", type: 'LEAK' },
                { x: 20, y: 35, label: "외벽 도장 탈락 및 중성화 징후", type: 'CORROSION' }
            ]
        },
        {
            id: 'b3',
            name: '성동구 트리마제 (TM-16)',
            address: '서울시 성동구 왕십리로 16',
            type: '주상복합 (랜드마크)',
            year: '2017',
            image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f776?q=80&w=1000',
            score: 91,
            expertAnalysis: '내진 1등급 설계가 적용된 대상 건축물은 최근의 인근 지성 데이터 분석 시 구조체 손상이 전무한 것으로 나타났습니다. 특히 지진 하중 전이 시스템(Transfer System)의 건전성이 매우 양호하며, 주철근의 피복 두께 및 탄성 계수 측정값 또한 설계 강도를 상회하고 있습니다. 기계실 인근의 진동 절연 장치(Isolator)의 상태도 양호하여 기계적 진동에 의한 구조 피로도는 낮은 것으로 분석됩니다.',
            recommendations: [
                '초고층부 GPS 기반 수평 변위 정밀 모니터링',
                '내진 장치(Oil Damper) 유압 및 실링 상태 분기 점검',
                '지진 알림 시스템과 연동된 엘리베이터 비상 정지 로직 테스트'
            ],
            markers: [
                { x: 75, y: 15, label: "최상층부 댐퍼 설치 구역 구조 건전성 양호", type: 'SAFE' },
                { x: 40, y: 55, label: "트랜스퍼 거더 구간 상부 변위 계측 포인트", type: 'CRACK' }
            ]
        },
        {
            id: 'b4',
            name: '인천 송도 포스코 타워 (ST-23)',
            address: '인천시 연수구 송도동 23-4',
            type: '랜드마크 오피스',
            year: '2019',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1000',
            score: 74,
            expertAnalysis: '대상 건축물의 외벽 시스템에서 염해(Salt Attack)에 의한 알루미늄 프레임 부식 징후가 국부적으로 관찰되었습니다. 송도 해안가 특유의 고염 농도 대기 노출로 인해 실란트 박리 및 배수부 막힘 현상이 발생하였으며, 이를 방치할 경우 창호 주변의 구조체로 수분이 침투하여 철근 부식을 가속화할 위험이 있습니다. 또한 로비 층 결로 방지 시스템의 효율 저하로 인한 실내 마감재 오염이 우려되므로 개선 조치가 필요합니다.',
            recommendations: [
                '염해 방지 특수 코팅제를 활용한 창호 프레임 전면 재코팅',
                '외벽 시스템 배수 경로 전수 조사 및 세척 작업',
                '로비 공조 시스템(AHU)의 습도 제어 알고리즘 최적화'
            ],
            markers: [
                { x: 60, y: 40, label: "염해에 의한 알루미늄 프레임 부식 진행 부위", type: 'CORROSION' },
                { x: 35, y: 65, label: "창호 하부 실란트 박리 및 침투 누수 우려", type: 'LEAK' }
            ]
        }
    ])

    const [inspections, setInspections] = useState<Inspection[]>([])

    // Unified Backend Storage Logic (DBeaver Integration)
    const saveUserToBackend = async (userData: any, provider: string) => {
        try {
            console.log(`[Beaver Sync] Sending ${provider} user data to backend server...`, userData);

            // 실제 로컬 서버(http://localhost:3000)로 데이터 전송 시도
            const response = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log("[Beaver Sync] Success:", result);
                alert(`[DBeaver 실시간 연동 성공]\n${userData.name}님의 정보가 SQLite DB에 저장되었습니다.\n\n지금 DBeaver에서 확인해 보세요!`);
            } else {
                // 서버가 실행 중이지 않을 때를 대비한 시뮬레이션 유지
                console.warn("[Beaver Sync] Server not reachable. Check if 'node server.js' is running.");
                await new Promise(resolve => setTimeout(resolve, 1000));
                alert(`[시뮬레이션 모드]\n백엔드 서버(node server.js)가 실행되지 않아 데이터가 로컬에만 저장되었습니다.\n실제 DBeaver 연동을 위해 터미널에서 서버를 실행해 주세요.`);
            }
        } catch (error) {
            console.error("[Beaver Sync] Connection failed:", error);
            alert(`[DBeaver 연동 알림]\n로컬 백엔드 서버(http://localhost:3000)가 응답하지 않습니다.\n데이터를 기록하려면 'node server.js'를 실행해야 합니다.`);
        }
    };

    // Quick Mock Login for Testing (Bypasses OAuth errors)
    const loginWithTestMode = () => {
        const testUser = {
            name: "테스트 분석 전문가",
            email: "test_expert@safety.ai",
            picture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
            provider: "test_mode"
        };
        setUser(testUser);
        setIsLoggedIn(true);
        saveUserToBackend(testUser, "test_mode");
    };

    // Kakao Login Handler
    const loginWithKakao = () => {
        if (!window.Kakao) {
            alert("카카오 SDK가 아직 로드되지 않았습니다. 몇 초 후 다시 시도해 주세요.");
            return;
        }

        try {
            if (!window.Kakao.isInitialized()) {
                window.Kakao.init('8080f339665bc83109a1501c379f6655');
            }
        } catch (e) {
            console.error("Kakao re-init error:", e);
        }

        console.log("[Auth] Attempting Kakao Login...");
        window.Kakao.Auth.login({
            success: () => {
                console.log("[Auth] Kakao Login Success, requesting info...");
                window.Kakao.API.request({
                    url: '/v2/user/me',
                    success: (res: any) => {
                        const profile = {
                            name: res.kakao_account.profile.nickname,
                            email: res.kakao_account.email || `${res.id}@kakao.user`,
                            picture: res.kakao_account.profile.thumbnail_image_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
                            provider: 'kakao'
                        };
                        setUser(profile);
                        setIsLoggedIn(true);
                        saveUserToBackend(profile, 'kakao');
                    },
                    fail: (error: any) => {
                        console.error("[Auth] Kakao API request failed:", error);
                        alert("카카오 로그인은 성공했으나 정보를 가져오지 못했습니다. 앱 설정을 확인해 주세요.");
                    }
                });
            },
            fail: (err: any) => {
                console.error("[Auth] Kakao Login failed:", err);
                // Detail error handling for domain mismatch
                if (err.error === 'misconfigured' || err.error_description?.includes('mismatch')) {
                    alert("카카오 앱의 '내 패치' > '플랫폼'에 현재 도메인이 등록되어 있지 않습니다. Kakao Developers 설정을 확인해 주세요.");
                } else {
                    alert("카카오 로그인 도중 오류가 발생했습니다. (팝업 차단 여부 또는 도메인 등록을 확인해 주세요)");
                }
            }
        });
    };

    // Unified Google Logic with Retry
    const renderGoogleButton = () => {
        if (window.google && !isLoggedIn) {
            const parent = document.getElementById('google-btn-parent');
            if (parent) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: "732049580459-f80e0jkf6n2n7m9k8m8r9.apps.googleusercontent.com",
                        callback: (response: any) => {
                            const base64Url = response.credential.split('.')[1];
                            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                            }).join(''));

                            const profile = JSON.parse(jsonPayload);
                            const unifiedProfile = { ...profile, provider: 'google' };
                            setUser(unifiedProfile);
                            setIsLoggedIn(true);
                            saveUserToBackend(unifiedProfile, 'google');
                        }
                    });
                    window.google.accounts.id.renderButton(
                        parent,
                        { theme: 'outline', size: 'large', width: '100%', shape: 'rectangular' }
                    );
                } catch (e) {
                    console.error("Google button render failed:", e);
                }
            }
        }
    };

    // Initialize Kakao & Google
    useEffect(() => {
        // Kakao Init with Polling
        const checkKakaoInterval = setInterval(() => {
            if (window.Kakao) {
                if (!window.Kakao.isInitialized()) {
                    try {
                        // NOTE: Check if the Javascript Key is valid and Domain is registered in Kakao Developers
                        window.Kakao.init('8080f339665bc83109a1501c379f6655');
                        console.log("[Auth] Kakao initialized.");
                    } catch (e) {
                        console.error("[Auth] Kakao init failed:", e);
                    }
                }
                clearInterval(checkKakaoInterval);
            }
        }, 500);

        // Google Init with Polling
        const checkGoogleInterval = setInterval(() => {
            if (window.google) {
                renderGoogleButton();
                clearInterval(checkGoogleInterval);
            }
        }, 500);

        return () => {
            clearInterval(checkKakaoInterval);
            clearInterval(checkGoogleInterval);
        };
    }, [isLoggedIn]);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;

        setIsSearchingList(true);
        setSearchPerformed(false);
        setSearchResults([]);

        // Simulate AI Intelligence Search / List Generation
        setTimeout(() => {
            const query = searchQuery.toLowerCase().replace(/\s+/g, '');
            const results = buildings.filter(b => {
                const name = b.name.toLowerCase().replace(/\s+/g, '');
                const address = b.address.toLowerCase().replace(/\s+/g, '');

                // 1. Full/Partial match after removing spaces
                if (name.includes(query) || address.includes(query) || query.includes(name)) return true;

                // 2. Keyword split match
                const queryParts = searchQuery.toLowerCase().split(/\s+/).filter(p => p.length > 0);
                if (queryParts.some(part => name.includes(part) || address.includes(part))) return true;

                // 3. Reverse match: check if building name keywords are in query
                const nameParts = b.name.toLowerCase().split(/\s+/).filter(p => p.length > 1);
                if (nameParts.some(part => query.includes(part))) return true;

                return false;
            });
            setSearchResults(results);
            setIsSearchingList(false);
            setSearchPerformed(true);
        }, 1200);
    }

    const startAutomaticAnalysis = (building: Building) => {
        setIsAnalyzing(true)
        setSelectedBuilding(building)

        // Simulate Deep Technical Scanning
        setTimeout(() => {
            const status: 'SAFE' | 'WARNING' | 'DANGER' = building.score > 90 ? 'SAFE' : (building.score > 80 ? 'WARNING' : 'DANGER');
            const newInspection: Inspection = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                building: building.name,
                status,
                image: building.image,
                score: building.score,
                expertAnalysis: building.expertAnalysis,
                recommendations: building.recommendations,
                markers: building.markers
            }
            setInspections([newInspection, ...inspections])
            setCurrentReport(newInspection)
            setIsAnalyzing(false)
            setIsSearchOpen(false)
            setSelectedBuilding(null)
            setSearchQuery('')
            setSearchResults([])
            setSearchPerformed(false)
            setActiveTab('report-detail')
        }, 4500)
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020408]">
                <div className="w-full max-w-md space-y-12 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="inline-flex p-6 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-600/30 mb-6">
                            <ShieldCheck size={64} className="text-white" />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter text-white">SafeAI <span className="text-blue-500">Expert</span></h1>
                        <p className="text-slate-400 font-bold text-lg">건축물 구조 진단 및 데이터 사이언스 플랫폼</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                    >
                        <div className="space-y-4">
                            <button
                                onClick={loginWithKakao}
                                className="w-full py-5 bg-[#FEE500] text-[#191919] font-black rounded-2xl hover:bg-[#FADA0A] transition-all flex items-center justify-center gap-4 shadow-xl"
                            >
                                <svg viewBox="0 0 32 32" className="w-6 h-6 fill-current">
                                    <path d="M16 4C9.37258 4 4 8.29124 4 13.5855C4 16.944 6.22383 19.8643 9.5843 21.6521C9.35121 22.5072 8.44111 25.8118 8.35515 26.2163C8.24921 26.7118 8.55592 26.7329 8.76106 26.5982C8.92211 26.4925 11.233 24.9664 12.8718 23.8617C13.8837 24.0628 14.9288 24.1711 16 24.1711C22.6274 24.1711 28 19.8798 28 14.5855C28 9.29124 22.6274 4 16 4Z" />
                                </svg>
                                카카오톡 계정으로 로그인
                            </button>

                            <div id="google-btn-parent" className="min-h-[50px] w-full overflow-hidden rounded-2xl shadow-xl bg-white/5 border border-white/10"></div>
                        </div>

                        <div className="relative flex items-center gap-6 text-slate-700 uppercase text-[11px] font-black tracking-[0.3em]">
                            <div className="flex-1 h-px bg-white/5"></div>
                            Secure Access or Test Mode
                            <div className="flex-1 h-px bg-white/5"></div>
                        </div>

                        <div className="space-y-3">
                            <button onClick={loginWithTestMode} className="group w-full py-6 bg-blue-600/20 border border-blue-600/30 text-blue-400 font-black rounded-3xl hover:bg-blue-600/30 transition-all flex flex-col items-center gap-1 shadow-2xl">
                                <span className="text-sm">실습용 테스트 로그인</span>
                                <span className="text-[9px] opacity-60 uppercase tracking-widest">(OAuth 설정 없이 DBeaver 연동 테스트)</span>
                            </button>

                            <button onClick={() => setIsLoggedIn(true)} className="group w-full py-4 text-slate-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                                게스트 모드로 둘러보기
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020408] flex flex-col md:flex-row text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-[#05070a] border-r border-white/5 p-10 flex flex-col justify-between relative z-40">
                <div className="space-y-16">
                    <div className="flex items-center gap-5 px-2">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-xl shadow-blue-600/20">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-3xl tracking-tighter text-white block leading-none">SafeAI</span>
                            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Pro System</span>
                        </div>
                    </div>

                    <nav className="space-y-4">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
                            { id: 'history', icon: History, label: '진단 기록' },
                            { id: 'archives', icon: FileText, label: '프로젝트 함' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-6 px-7 py-5 rounded-[2rem] transition-all duration-500 group ${activeTab === item.id
                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-lg shadow-blue-600/5'
                                    : 'text-slate-600 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <item.icon size={22} className="group-hover:scale-110 transition-transform" />
                                <span className="font-black text-sm uppercase tracking-widest leading-none">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-8">
                    {user && (
                        <div className="flex items-center gap-5 px-2">
                            <img src={user.picture} className="w-12 h-12 rounded-2xl ring-2 ring-blue-600/20 shadow-xl" alt="Profile" />
                            <div className="text-xs truncate flex-1">
                                <div className="font-black text-white text-sm mb-1">{user.name}</div>
                                <div className="text-slate-500 font-bold uppercase tracking-widest text-[9px] opacity-70 truncate">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { setIsLoggedIn(false); setUser(null); }} className="w-full flex items-center gap-5 px-7 py-5 text-slate-600 hover:text-red-400 transition-all rounded-[2rem] hover:bg-red-400/5 group font-black">
                        <LogOut size={22} /><span className="text-sm uppercase tracking-widest">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 md:p-20 overflow-y-auto relative bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_50%)]">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-7xl mx-auto space-y-24">
                            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 text-blue-500 font-black text-xs uppercase tracking-[0.4em]">
                                        <div className="w-12 h-px bg-blue-500"></div>
                                        Safety Control Center
                                    </div>
                                    <h2 className="text-7xl font-black tracking-tighter leading-[0.9] text-white">스마트 분석<br /><span className="text-blue-600">통제 대시보드</span></h2>
                                    <p className="text-slate-500 font-bold text-xl max-w-2xl leading-relaxed">전 국토의 건축물 데이터를 실시간으로 스캔하고 AI 전문가 수준의 정밀 진단을 수행합니다.</p>
                                </div>
                                <div className="flex flex-col gap-4 w-full lg:w-auto">
                                    <button onClick={() => setIsSearchOpen(true)} className="group px-12 py-8 bg-white text-black font-black rounded-[2.5rem] transition-all shadow-[0_30px_60px_rgba(255,255,255,0.1)] hover:scale-[1.02] flex items-center justify-center gap-5 border border-white">
                                        <Search size={28} />
                                        정밀 진단 건물 서치
                                    </button>
                                    <div className="flex gap-4">
                                        <div className="flex-1 p-4 bg-white/5 rounded-2xl border border-white/5 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">Core Engine v4.1</div>
                                        <div className="flex-1 p-4 bg-blue-600/10 rounded-2xl border border-blue-600/20 text-center text-[10px] font-black uppercase tracking-widest text-blue-500">Auth Priority: High</div>
                                    </div>
                                </div>
                            </header>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                {[
                                    { label: 'Total Analyses', value: `${inspections.length + 1248}`, sub: '+12% from last month', icon: Building2, color: 'blue' },
                                    { label: 'Critical Detected', value: '23 CASES', sub: 'Monitoring Active', icon: AlertTriangle, color: 'amber' },
                                    { label: 'Diagnostic Score', value: '99.98%', sub: 'Real-time Reliability', icon: ShieldCheck, color: 'green' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden group hover:bg-white/[0.04] transition-all shadow-2xl">
                                        <div className={`w-16 h-16 rounded-2xl bg-${stat.color}-600/10 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                            <stat.icon size={32} />
                                        </div>
                                        <div>
                                            <div className="text-5xl font-black text-white tracking-tighter mb-2">{stat.value}</div>
                                            <div className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{stat.label}</div>
                                            <div className="text-slate-400 text-xs font-bold leading-none">{stat.sub}</div>
                                        </div>
                                        <div className={`absolute top-0 right-0 p-10 text-${stat.color}-600/5 opacity-0 group-hover:opacity-100 transition-opacity`}><stat.icon size={120} /></div>
                                    </div>
                                ))}
                            </div>

                            {/* Promotional Tech Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                <div className="p-16 rounded-[4.5rem] bg-gradient-to-br from-blue-600/20 to-transparent border border-white/10 relative overflow-hidden group h-full flex flex-col justify-center">
                                    <div className="relative z-10 space-y-10">
                                        <div className="inline-flex px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-lg">Core Technology</div>
                                        <h3 className="text-5xl font-black text-white tracking-tight leading-tight">BIM 연동형<br />디지털 트윈 진단</h3>
                                        <p className="text-slate-400 text-xl font-medium leading-relaxed">
                                            단순 시각 데이터 분석을 넘어, 설계 도면(BIM)과 실시간 계측 센서 데이터를 융합하여 건축물의 내구 수명을 정밀하게 예측합니다.
                                        </p>
                                        <button className="flex items-center gap-3 text-blue-500 font-black uppercase tracking-widest text-sm hover:gap-5 transition-all outline-none">
                                            자세히 알아보기 <ArrowRight size={20} />
                                        </button>
                                    </div>
                                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1000')] bg-cover opacity-10 grayscale mix-blend-overlay"></div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-4">
                                        <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                                            <TrendingUp size={24} className="text-blue-500" />
                                            최신 진단 프로젝트
                                        </h3>
                                        <button onClick={() => setActiveTab('history')} className="text-slate-600 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">See All 기록</button>
                                    </div>
                                    <div className="space-y-6">
                                        {inspections.length > 0 ? inspections.slice(0, 3).map((item) => (
                                            <button key={item.id} onClick={() => { setCurrentReport(item); setActiveTab('report-detail'); }} className="w-full p-8 rounded-[3rem] bg-white/[0.01] border border-white/5 hover:border-blue-600/30 transition-all duration-500 group flex items-center gap-8">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Building" />
                                                </div>
                                                <div className="flex-1 text-left space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`px-3 py-1 rounded-md text-[9px] font-black ${item.status === 'SAFE' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'}`}>{item.status}</span>
                                                        <span className="text-slate-600 font-bold text-[10px]">{item.date}</span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-white leading-tight group-hover:text-blue-500 transition-colors">{item.building}</h4>
                                                    <p className="text-slate-500 text-xs font-medium line-clamp-1">{item.expertAnalysis}</p>
                                                </div>
                                                <div className="p-4 rounded-full bg-white/5 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <ArrowRight size={20} />
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="p-20 text-center rounded-[3rem] border border-white/5 border-dashed space-y-6 bg-white/[0.01]">
                                                <Activity size={48} className="text-slate-800 mx-auto" />
                                                <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[10px]">진단 기록이 아직 없습니다</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'report-detail' && currentReport && (
                        <motion.div key="report-detail" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-16 pb-20">
                            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-3 text-slate-600 hover:text-white transition-colors font-black text-xs uppercase tracking-widest group">
                                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-2 transition-transform" />
                                Back to Control Center
                            </button>

                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-16">
                                {/* Left Content: Main Analysis (Col 8) */}
                                <div className="xl:col-span-8 space-y-20">
                                    {/* Header Banner */}
                                    <div className="flex flex-col md:flex-row items-center gap-12 p-12 rounded-[5rem] bg-white/[0.01] border border-white/5 relative overflow-hidden">
                                        <div className="text-left space-y-6 relative z-10 flex-1">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] ${currentReport.status === 'SAFE' ? 'bg-green-600/20 text-green-500' : (currentReport.status === 'WARNING' ? 'bg-amber-600/20 text-amber-500' : 'bg-red-600/20 text-red-500')}`}>
                                                    System Status: {currentReport.status}
                                                </span>
                                                <div className="h-6 w-px bg-white/10"></div>
                                                <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest">{currentReport.date} DIAGNOSTICS</span>
                                            </div>
                                            <h2 className="text-7xl font-black text-white tracking-tighter leading-[0.9]">{currentReport.building}</h2>
                                            <div className="flex items-center gap-4 text-slate-400 font-bold text-lg">
                                                <MapPin size={20} className="text-blue-600" />
                                                <span>관할구역 정밀 안전 등급 심의 결과</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 p-12 text-white/5 -rotate-12 pointer-events-none"><ShieldCheck size={280} /></div>
                                    </div>

                                    {/* Visual Problems Map (HIGHLIGHT FEATURE) */}
                                    <div className="space-y-10">
                                        <div className="flex items-center justify-between px-4">
                                            <h3 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">
                                                <Target size={32} className="text-red-600" />
                                                구조적 결함 시각화 맵
                                            </h3>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-600"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Sensor Point</div>
                                            </div>
                                        </div>

                                        <div className="aspect-[16/10] w-full rounded-[4.5rem] overflow-hidden border border-white/10 relative shadow-[0_40px_100px_rgba(0,0,0,0.6)] group">
                                            <img src={currentReport.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Building Scan" />
                                            <div className="absolute inset-0 bg-blue-900/10 backdrop-contrast-125 mix-blend-overlay"></div>

                                            {/* Data Overlay Grid */}
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                                            {/* Interactive Markers */}
                                            {currentReport.markers.map((marker, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute"
                                                    style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                                                    onMouseEnter={() => setHoveredMarker(marker)}
                                                    onMouseLeave={() => setHoveredMarker(null)}
                                                >
                                                    <motion.div
                                                        animate={{ scale: [1, 1.3, 1] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className={`w-10 h-10 rounded-full border-2 border-white flex items-center justify-center cursor-pointer shadow-2xl relative z-10 ${marker.type === 'SAFE' ? 'bg-green-600' : 'bg-red-600'}`}
                                                    >
                                                        {marker.type === 'SAFE' ? <ShieldCheck size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
                                                    </motion.div>

                                                    {/* Ripple Animation */}
                                                    <div className={`absolute top-0 left-0 w-10 h-10 rounded-full animate-ping opacity-50 ${marker.type === 'SAFE' ? 'bg-green-600' : 'bg-red-600'}`}></div>

                                                    {/* Hover Tooltip */}
                                                    <AnimatePresence>
                                                        {hoveredMarker === marker && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                                                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-64 p-6 bg-black/95 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 text-center pointer-events-none"
                                                            >
                                                                <div className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-2">{marker.type} POINT</div>
                                                                <p className="text-white font-bold leading-tight text-sm">{marker.label}</p>
                                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/95"></div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}

                                            <div className="absolute bottom-10 left-10 p-6 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center gap-6">
                                                <div className="flex -space-x-3">
                                                    {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-blue-600 border-2 border-black flex items-center justify-center text-[10px] font-black">AI</div>)}
                                                </div>
                                                <div className="text-xs">
                                                    <p className="text-white font-black uppercase tracking-widest">Active Scanning</p>
                                                    <p className="text-slate-500 font-bold">87.4% Structural Match</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expert Technical Analysis */}
                                    <div className="space-y-12">
                                        <div className="flex items-center gap-6 border-b border-white/5 pb-8">
                                            <div className="w-16 h-16 rounded-[2rem] bg-blue-600/10 flex items-center justify-center text-blue-500"><Eye size={32} /></div>
                                            <h3 className="text-4xl font-black text-white tracking-tight">구조 엔지니어링 정밀 소견</h3>
                                        </div>
                                        <div className="p-16 rounded-[4.5rem] bg-white/[0.01] border border-white/5 relative shadow-inner group overflow-hidden">
                                            <div className="relative z-10">
                                                <p className="text-slate-300 text-2xl font-medium leading-[1.6] tracking-tight">
                                                    {currentReport.expertAnalysis}
                                                </p>
                                            </div>
                                            <div className="absolute bottom-0 right-0 p-16 text-blue-600/5 rotate-45 pointer-events-none"><FileText size={400} /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Sidebar Sidebar (Col 4) */}
                                <div className="xl:col-span-4 space-y-10">
                                    {/* Score Card */}
                                    <div className="p-16 rounded-[4.5rem] bg-gradient-to-br from-blue-600 to-blue-900 border border-white/20 text-center space-y-10 shadow-[0_50px_100px_rgba(37,99,235,0.25)] relative overflow-hidden group">
                                        <div className="relative z-10 space-y-10">
                                            <div className="text-white/60 text-[11px] font-black uppercase tracking-[0.4em]">Final Structural Score</div>
                                            <div className="relative inline-block scale-110">
                                                <svg className="w-64 h-64 transform -rotate-90">
                                                    <circle cx="128" cy="128" r="118" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-white/5" />
                                                    <motion.circle
                                                        cx="128" cy="128" r="118" stroke="currentColor" strokeWidth="16" fill="transparent"
                                                        strokeDasharray={2 * Math.PI * 118}
                                                        initial={{ strokeDashoffset: 2 * Math.PI * 118 }}
                                                        animate={{ strokeDashoffset: 2 * Math.PI * 118 * (1 - currentReport.score / 100) }}
                                                        transition={{ duration: 2, ease: "easeOut" }}
                                                        className="text-white" strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                    <span className="text-8xl font-black text-white tracking-tighter leading-none">{currentReport.score}</span>
                                                    <span className="text-2xl font-bold text-white/50 block tracking-widest mt-1">PERCENT</span>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-3xl font-black text-white tracking-tight uppercase">Safety Level: <span className="text-sky-300 underline decoration-sky-300/30 underline-offset-8">{currentReport.status}</span></p>
                                                <p className="text-white/50 font-bold text-base leading-relaxed px-6">
                                                    본 건축물은 국가 표준 안전 데이터베이스 분석 결과 {currentReport.score > 85 ? '관리 우수 등급' : '중점 관리 대상'}으로 분류됩니다.
                                                </p>
                                            </div>
                                            <button className="w-full py-7 bg-white text-blue-900 font-black rounded-3xl hover:bg-slate-100 transition-all shadow-2xl uppercase tracking-widest text-sm outline-none">
                                                전문가 공인 리포트 (PDF)
                                            </button>
                                        </div>
                                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 blur-3xl rounded-full"></div>
                                    </div>

                                    {/* Action items */}
                                    <div className="p-12 rounded-[4rem] bg-white/[0.02] border border-white/5 space-y-10">
                                        <h4 className="text-lg font-black text-white tracking-tight flex items-center gap-4">
                                            <CheckCircle2 size={24} className="text-green-500" />
                                            긴급 유지보수 권고 (Actions)
                                        </h4>
                                        <div className="space-y-4">
                                            {currentReport.recommendations.map((rec, i) => (
                                                <div key={i} className="flex gap-6 items-start p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-blue-600/5 hover:border-blue-600/20 transition-all">
                                                    <div className="w-3 h-3 rounded-full bg-blue-600 mt-2 shrink-0 group-hover:scale-125 transition-transform"></div>
                                                    <p className="text-slate-400 font-bold leading-snug group-hover:text-white transition-colors">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Technical Specs */}
                                    <div className="p-12 rounded-[4rem] bg-white/[0.01] border border-white/10 space-y-8">
                                        <h4 className="text-sm font-black text-slate-600 uppercase tracking-widest leading-none">Technical Indicators</h4>
                                        <div className="space-y-6">
                                            {[
                                                { label: '지반 침하 계수', val: '0.002mm', color: 'blue' },
                                                { label: '내진 설계 등급', val: '내진 1등급(특)', color: 'blue' },
                                                { label: '콘크리트 중성화', val: '비위험 (pH 11.2)', color: 'green' },
                                                { label: '유지보수 우선순위', val: currentReport.score > 90 ? 'LOW' : 'HIGH', color: currentReport.score > 90 ? 'slate' : 'amber' }
                                            ].map((spec, i) => (
                                                <div key={i} className="flex justify-between items-center group">
                                                    <span className="text-slate-500 font-bold text-sm tracking-tight">{spec.label}</span>
                                                    <span className={`text-${spec.color}-500 font-black text-xs uppercase tracking-widest`}>{spec.val}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-16 pb-20">
                            <h2 className="text-6xl font-black tracking-tighter text-white">진단 프로젝트 <span className="text-blue-600">아카이브</span></h2>
                            <div className="grid grid-cols-1 gap-8">
                                {inspections.length > 0 ? inspections.map(item => (
                                    <button key={item.id} onClick={() => { setCurrentReport(item); setActiveTab('report-detail'); }} className="w-full text-left p-10 rounded-[4rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center gap-12 hover:bg-white/[0.04] transition-all group shadow-2xl">
                                        <div className="w-48 h-48 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 shrink-0">
                                            <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Building" />
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-4">
                                                <span className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase ${item.status === 'SAFE' ? 'text-green-400 border border-green-400/30' : (item.status === 'WARNING' ? 'text-amber-400 border border-amber-400/30' : 'text-red-400 border border-red-400/30')}`}>Level: {item.status}</span>
                                                <span className="text-slate-600 font-black text-xs uppercase tracking-widest">{item.date}</span>
                                            </div>
                                            <div>
                                                <p className="text-4xl font-black text-white mb-2 leading-none tracking-tighter">{item.building}</p>
                                                <p className="text-slate-500 font-medium text-lg line-clamp-2 max-w-2xl">{item.expertAnalysis}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="text-center">
                                                <div className="text-4xl font-black text-white tracking-tighter">{item.score}</div>
                                                <div className="text-slate-600 font-black text-[10px] uppercase tracking-widest">Score</div>
                                            </div>
                                            <div className="w-20 h-20 rounded-full bg-white/5 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all flex items-center justify-center">
                                                <Maximize2 size={32} />
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="py-48 text-center space-y-10 bg-white/[0.01] rounded-[5rem] border border-white/5 border-dashed">
                                        <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mx-auto"><Activity size={48} className="text-slate-800" /></div>
                                        <div className="space-y-4">
                                            <p className="text-slate-600 font-black uppercase tracking-[0.6em] text-xs">Archives is currently empty</p>
                                            <p className="text-slate-700 font-medium text-lg">새로운 진단을 시작하여 기록을 채워보세요.</p>
                                        </div>
                                        <button onClick={() => setActiveTab('dashboard')} className="px-10 py-5 bg-white text-black font-black rounded-3xl hover:scale-105 transition-transform shadow-2xl">대시보드로 가기</button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Advanced Search Modal (IMPROVED SEARCH EXPERIENCE) */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl">
                        <div className="w-full max-w-5xl bg-[#0a0c10] border border-white/10 rounded-[5rem] p-16 space-y-12 relative shadow-[0_0_200px_rgba(37,99,235,0.2)]">
                            <button onClick={() => { setIsSearchOpen(false); setSelectedBuilding(null); setIsAnalyzing(false); setSearchPerformed(false); setSearchResults([]); }} className="absolute top-12 right-12 p-5 text-slate-600 hover:text-white transition-all bg-white/5 rounded-[2rem] hover:rotate-90"><X size={32} /></button>

                            <div className="text-center space-y-6">
                                <div className="inline-flex px-4 py-2 bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-lg border border-blue-600/20">AI Search Engine v3</div>
                                <h3 className="text-5xl font-black tracking-tighter text-white">건축물 데이터 통합 검색</h3>
                                <p className="text-slate-500 font-bold text-xl tracking-tight leading-relaxed max-w-3xl mx-auto">
                                    분석 대상을 입력하고 검색 버튼을 클릭하여 관련 건물 리스트를 확인하십시오.
                                </p>
                            </div>

                            {!selectedBuilding ? (
                                <div className="space-y-12">
                                    <div className="relative group flex items-center gap-4 bg-white/[0.03] border-2 border-white/5 rounded-[3.5rem] p-4 pr-6 focus-within:border-blue-600/50 transition-all">
                                        <div className="pl-6 text-slate-500">
                                            {isSearchingList ? <Loader2 size={32} className="animate-spin text-blue-500" /> : <Search size={32} />}
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="건물 이름 또는 주소 입력 (예: 롯데, 테헤란로...)"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSearch();
                                            }}
                                            className="flex-1 py-6 bg-transparent text-3xl font-black text-white outline-none placeholder:text-slate-800"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSearch}
                                            className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/30 flex items-center gap-3 group whitespace-nowrap"
                                        >
                                            <span className="font-black text-xl tracking-widest uppercase">Search</span>
                                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="min-h-[400px] max-h-[600px] overflow-y-auto space-y-6 pr-6 custom-scrollbar scroll-smooth">
                                        {isSearchingList ? (
                                            <div className="py-32 text-center space-y-8">
                                                <Loader2 size={64} className="animate-spin text-blue-500 mx-auto" />
                                                <p className="text-slate-500 font-black uppercase tracking-[0.5em] text-sm animate-pulse">AI 데이터베이스에서 관련 건축물 탐색 중...</p>
                                            </div>
                                        ) : searchPerformed ? (
                                            searchResults.length > 0 ? (
                                                <div className="space-y-8">
                                                    <div className="flex items-center justify-between px-4">
                                                        <p className="text-blue-500 font-black uppercase tracking-[0.3em] text-xs">AI 추천 검색 결과 ({searchResults.length})</p>
                                                        <p className="text-slate-600 font-bold text-xs">분석할 건물을 클릭하십시오</p>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {searchResults.map((b, idx) => (
                                                            <motion.button
                                                                key={b.id}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: idx * 0.1 }}
                                                                onClick={() => startAutomaticAnalysis(b)}
                                                                className="text-left group bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden hover:border-blue-600/50 hover:bg-blue-600/5 transition-all"
                                                            >
                                                                <div className="aspect-[21/9] w-full overflow-hidden relative">
                                                                    <img src={b.image} className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" alt={b.name} />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                                                    <div className="absolute bottom-4 left-6 flex items-center gap-3">
                                                                        <div className={`w-2 h-2 rounded-full ${b.score > 90 ? 'bg-green-500' : 'bg-amber-500'} animate-pulse`}></div>
                                                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{b.type}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="p-8 space-y-2">
                                                                    <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors leading-none">{b.name}</h4>
                                                                    <p className="text-slate-500 font-bold text-sm truncate flex items-center gap-2">
                                                                        <MapPin size={14} />
                                                                        {b.address}
                                                                    </p>
                                                                </div>
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-32 text-center space-y-8">
                                                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-700"><X size={48} /></div>
                                                    <div className="space-y-4 text-slate-700">
                                                        <p className="font-black uppercase tracking-[0.4em] text-sm text-red-500/50">검색 결과가 없습니다</p>
                                                        <p className="font-bold text-base">입력하신 '{searchQuery}'와 일치하는 데이터가 데이터베이스에 존재하지 않습니다.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setIsManualEntry(true)}
                                                        className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all"
                                                    >
                                                        현장 직접 등록 및 분석 수행
                                                    </button>
                                                </div>
                                            )
                                        ) : (
                                            <div className="py-24 text-center space-y-10">
                                                <div className="flex justify-center gap-6 flex-wrap max-w-3xl mx-auto">
                                                    {['롯데월드타워', '테헤란로', '아크로리버', '트리마제', '송도 타워'].map(suggest => (
                                                        <button
                                                            key={suggest}
                                                            onClick={() => { setSearchQuery(suggest); handleSearch(); }}
                                                            className="group relative px-8 py-4 rounded-3xl bg-white/[0.03] border border-white/10 text-slate-500 hover:text-white hover:border-blue-600/50 transition-all overflow-hidden"
                                                        >
                                                            <span className="relative z-10 font-black text-sm uppercase tracking-widest">#{suggest}</span>
                                                            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors"></div>
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-slate-700 font-black uppercase tracking-[0.6em] text-[10px]">Quick Selection Suggestions</p>
                                                    <button
                                                        onClick={() => setIsManualEntry(true)}
                                                        className="px-8 py-3 rounded-2xl border border-dashed border-white/10 text-slate-600 hover:text-blue-500 hover:border-blue-500/50 transition-all text-xs font-bold"
                                                    >
                                                        또는 직접 사진을 업로드하여 분석하기
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : isManualEntry ? (
                                <div className="space-y-12">
                                    <div className="text-center space-y-4">
                                        <h4 className="text-2xl font-black text-white tracking-tighter">현장 데이터 수동 등록</h4>
                                        <p className="text-slate-500 font-bold">건물 명칭과 주소, 그리고 분석할 사진 URL을 입력해 주세요.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 uppercase tracking-widest px-2">건물 명칭</label>
                                                <input
                                                    type="text"
                                                    value={manualData.name}
                                                    onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
                                                    placeholder="Building Name..."
                                                    className="w-full px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-600/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 uppercase tracking-widest px-2">상세 주소 (선택)</label>
                                                <input
                                                    type="text"
                                                    value={manualData.address}
                                                    onChange={(e) => setManualData({ ...manualData, address: e.target.value })}
                                                    placeholder="Address..."
                                                    className="w-full px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-600/50 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-600 uppercase tracking-widest px-2">이미지 URL (건물 전경)</label>
                                                <input
                                                    type="text"
                                                    value={manualData.image}
                                                    onChange={(e) => setManualData({ ...manualData, image: e.target.value })}
                                                    placeholder="https://images.unsplash.com/..."
                                                    className="w-full px-8 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white outline-none focus:border-blue-600/50 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="aspect-square rounded-[3rem] bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center group relative overflow-hidden">
                                            {manualData.image ? (
                                                <img src={manualData.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Preview" />
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-700 mx-auto"><Maximize2 size={32} /></div>
                                                    <p className="text-slate-600 font-bold">이미지 미리보기</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-8">
                                        <button
                                            onClick={() => { setIsManualEntry(false); setManualData({ name: '', address: '', image: '' }); }}
                                            className="flex-1 py-6 bg-white/5 text-slate-400 font-black rounded-3xl hover:bg-white/10 transition-all"
                                        >
                                            취소
                                        </button>
                                        <button
                                            disabled={!manualData.name || !manualData.image}
                                            onClick={() => {
                                                const manualBuilding: Building = {
                                                    id: 'manual-' + Date.now(),
                                                    name: manualData.name,
                                                    address: manualData.address || '정보 없음',
                                                    type: '신규 분석 대상',
                                                    year: '2024 (분석일자)',
                                                    image: manualData.image,
                                                    score: 88,
                                                    expertAnalysis: `[AI 매뉴얼 분석] ${manualData.name} 건축물에 대한 외부 비전 알고리즘 분석 결과, 가시적인 구조적 결함은 인지되지 않았습니다. 사용자가 제공한 이미지를 기반으로 추정된 구조체의 건전성은 '양호' 등급으로 분류되나, 기초 지반 및 내부 철근 부식 상태 확인을 위해 주기적인 현장 정밀 안전 점검이 동반되어야 합니다.`,
                                                    recommendations: [
                                                        '고해상도 균열 측정 사진 추가 업로드',
                                                        '분기별 수직/수평 변위 계측 관리',
                                                        '외벽 방수 상태 정기 검사 수행'
                                                    ],
                                                    markers: [
                                                        { x: 50, y: 50, label: "구조물 건전성 확인 포인트 (양호)", type: 'SAFE' as any }
                                                    ]
                                                };
                                                setIsManualEntry(false);
                                                startAutomaticAnalysis(manualBuilding);
                                            }}
                                            className="flex-[2] py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-500 transition-all disabled:opacity-30 shadow-2xl shadow-blue-600/20"
                                        >
                                            분석 시작하기
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-12 py-10">
                                    <div className="aspect-[21/9] w-full rounded-[4rem] overflow-hidden border border-white/10 relative shadow-[0_50px_150px_rgba(0,0,0,0.8)]">
                                        <img src={selectedBuilding?.image} className="w-full h-full object-cover scale-110" alt="Building Preview" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-16">
                                            <div className="flex items-center gap-6 mb-4">
                                                <span className="px-6 py-2 bg-blue-600 rounded-xl text-xs font-black tracking-[0.3em] uppercase text-white shadow-2xl">Digital Twin Active</span>
                                                <span className="text-white/40 text-sm font-black uppercase tracking-widest px-6 border-l border-white/10">Established in {selectedBuilding?.year}</span>
                                            </div>
                                            <h4 className="text-8xl font-black text-white tracking-tighter leading-none">{selectedBuilding?.name}</h4>
                                        </div>

                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl flex flex-col items-center justify-center gap-16">
                                                <div className="relative">
                                                    <motion.div
                                                        animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                                        className="w-[300px] h-[300px] rounded-full border-t-2 border-r-2 border-blue-600 opacity-40 shadow-[0_0_80px_rgba(37,99,235,0.2)]"
                                                    />
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-6">
                                                        <ShieldCheck size={80} className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-pulse" />
                                                        <div className="text-center">
                                                            <p className="text-white font-black text-3xl tracking-[0.5em] uppercase leading-none mb-2">Technical Scan</p>
                                                            <p className="text-blue-500 font-black text-sm uppercase tracking-widest opacity-80">Processing LiDAR & Deep Data...</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="w-full max-w-lg space-y-6">
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 4 }}
                                                            className="h-full bg-gradient-to-r from-blue-700 to-blue-400"
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
                                                        <span>Struct Analysis</span>
                                                        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity }}>Synchronizing BIM</motion.span>
                                                        <span>100% Core</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white/[0.02] p-12 rounded-[4rem] border border-white/5 shadow-inner flex flex-col md:flex-row gap-12 justify-between items-center px-20">
                                        <div className="space-y-4 text-center md:text-left">
                                            <div className="text-slate-600 text-xs font-black uppercase tracking-[0.4em]">AI Deep Diagnostic</div>
                                            <div className="text-blue-600 font-black text-4xl tracking-tighter">분석 알고리즘 가동 중</div>
                                        </div>
                                        <div className="w-px h-16 bg-white/5 hidden md:block"></div>
                                        <div className="space-y-4 text-center md:text-right">
                                            <div className="text-slate-600 text-xs font-black uppercase tracking-[0.4em]">Target Location</div>
                                            <div className="text-slate-300 font-black text-2xl tracking-tighter">{selectedBuilding?.address}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    )
}
