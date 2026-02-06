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
    Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface Building {
    id: string;
    name: string;
    address: string;
    type: string;
    year: string;
    image: string;
    score: number;
    details: string;
    recommendations: string[];
}

interface Inspection {
    id: string;
    date: string;
    building: string;
    status: 'SAFE' | 'WARNING' | 'DANGER';
    image: string;
    analysis: string;
    score: number;
    details: string;
    recommendations: string[];
}

declare global {
    interface Window {
        google: any;
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

    // Mock Data: Buildings for Search
    const [buildings] = useState<Building[]>([
        {
            id: 'b1',
            name: '강남구 테헤란로 엔타워',
            address: '서울시 강남구 테헤란로 152',
            type: '상업용 빌딩',
            year: '2015',
            image: 'https://images.unsplash.com/photo-1541904845547-0e6962060134?q=80&w=500',
            score: 94,
            details: '지반 침하 및 전단벽 구조 상태가 매우 안정적입니다. 내진 설계가 기준치(성능 1.2배) 이상으로 적용되어 있으며, 최근 3년 내 유지보수 이력이 완벽합니다.',
            recommendations: ['옥상 부근 미세 균열 코팅 보강', '소방 펌프실 밸브 센서 교체 권고', '정기 안전 점검 주기 1년 유지']
        },
        {
            id: 'b2',
            name: '서초구 아크로리버파크',
            address: '서울시 서초구 신반포로15길 19',
            type: '공동주택',
            year: '2016',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=500',
            score: 88,
            details: '단지 전반의 구조적 결함은 발견되지 않았으나, 지하 주차장 2층 기둥 인근에서 경미한 결로 흔적이 발견되었습니다. 지반 배수 시스템 점검이 필요합니다.',
            recommendations: ['지하 주차장 B2층 누수 정밀 내부 탐사', '통합 관제 시스템 소프트웨어 업데이트', '지하 지반 배수 관로 필터 청소']
        },
        {
            id: 'b3',
            name: '성동구 트리마제',
            address: '서울시 성동구 왕십리로 16',
            type: '공동주택',
            year: '2017',
            image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f776?q=80&w=500',
            score: 91,
            details: '한강 인근 지반 특성에 따른 변위 계측 데이터가 양호합니다. 고층부 외벽 글라스 월 프레임의 체결 상태가 견고하며 고풍압 설계가 효과적으로 작동 중입니다.',
            recommendations: ['글라스 월 실란트 보완 작업 (일부 구역)', '강풍 대비 계측 센서 주기적 캘리브레이션', '입주민 커뮤니티 시설 안전 관리 강화']
        },
        {
            id: 'b4',
            name: '인천 연수구 송도 타워',
            address: '인천시 연수구 송도동 23-4',
            type: '오피스',
            year: '2019',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=500',
            score: 76,
            details: '지층부 로비 인근 대리석 마감재 탈락 징후가 보입니다. 해풍에 의한 부식 가능성이 있는 노출 철강 부위의 방청 처리가 시급합니다. 중점 관리가 필요한 등급입니다.',
            recommendations: ['노출 철구조물 전면 방청 재도장', '로비 외벽 마감재 긴급 체결 상태 전수 조사', '염분 농도 계측 시스템 도입 권고']
        }
    ])

    const [inspections, setInspections] = useState<Inspection[]>([])

    const filteredBuildings = buildings.filter(b =>
        b.name.includes(searchQuery) || b.address.includes(searchQuery)
    )

    // Google Login Initialization
    useEffect(() => {
        const handleCredentialResponse = (response: any) => {
            try {
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));

                const profile = JSON.parse(jsonPayload);
                setUser(profile);
                setIsLoggedIn(true);
            } catch (error) {
                console.error("Login processing failed:", error);
            }
        };

        if (window.google) {
            try {
                window.google.accounts.id.initialize({
                    client_id: "732049580459-f80e0jkf6n2n7m9k8m8r9.apps.googleusercontent.com",
                    callback: handleCredentialResponse
                });

                const parent = document.getElementById('google-btn-parent');
                if (parent && !isLoggedIn) {
                    window.google.accounts.id.renderButton(
                        parent,
                        { theme: 'outline', size: 'large', width: '100%' }
                    );
                }
            } catch (error) {
                console.error("Google script initialization failed:", error);
            }
        }
    }, [isLoggedIn]);

    const startAutomaticAnalysis = (building: Building) => {
        setSelectedBuilding(building)
        setIsAnalyzing(true)

        // Simulate AI Analysis
        setTimeout(() => {
            const status: 'SAFE' | 'WARNING' | 'DANGER' = building.score > 90 ? 'SAFE' : (building.score > 80 ? 'WARNING' : 'DANGER');
            const newInspection: Inspection = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                building: building.name,
                status,
                image: building.image,
                analysis: building.details,
                score: building.score,
                details: building.details,
                recommendations: building.recommendations
            }
            setInspections([newInspection, ...inspections])
            setCurrentReport(newInspection)
            setIsAnalyzing(false)
            setIsSearchOpen(false)
            setSelectedBuilding(null)
            setSearchQuery('')
            setActiveTab('report-detail')
        }, 4000)
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020408]">
                <div className="w-full max-w-md space-y-12 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="inline-flex p-6 rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 shadow-2xl shadow-blue-600/20 mb-4">
                            <ShieldCheck size={56} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white">SafeAI <span className="text-blue-500">Pro</span></h1>
                        <p className="text-slate-400 font-medium">건물 검색으로 시작하는 스마트 안전 진단</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl space-y-8"
                    >
                        <div id="google-btn-parent" className="w-full overflow-hidden rounded-2xl"></div>
                        <div className="relative flex items-center gap-4 text-slate-600 uppercase text-[10px] font-black tracking-[0.2em]">
                            <div className="flex-1 h-px bg-white/5"></div>
                            또는
                            <div className="flex-1 h-px bg-white/5"></div>
                        </div>
                        <button onClick={() => setIsLoggedIn(true)} className="group w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20">
                            게스트 모드로 바로 입장
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020408] flex flex-col md:flex-row text-slate-100">
            {/* Sidebar */}
            <aside className="w-full md:w-80 bg-[#05070a] border-r border-white/5 p-8 flex flex-col justify-between">
                <div className="space-y-12">
                    <div className="flex items-center gap-4 px-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck size={28} className="text-white" />
                        </div>
                        <span className="font-black text-2xl tracking-tighter text-white">SafeAI</span>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
                            { id: 'history', icon: History, label: '진단 이력' },
                            { id: 'archives', icon: FileText, label: '아카이브' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20 shadow-lg shadow-blue-600/5'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <item.icon size={22} />
                                <span className="font-black text-sm uppercase tracking-wider">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="pt-8 border-t border-white/5 space-y-6">
                    {user && (
                        <div className="flex items-center gap-4 px-2">
                            <img src={user.picture} className="w-10 h-10 rounded-full ring-2 ring-blue-600/20" alt="Profile" />
                            <div className="text-xs truncate">
                                <div className="font-bold text-white mb-0.5">{user.name}</div>
                                <div className="text-slate-500 font-medium text-[10px] uppercase tracking-widest">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { setIsLoggedIn(false); setUser(null); }} className="w-full flex items-center gap-4 px-6 py-4 text-slate-600 hover:text-red-400 transition-all rounded-2xl hover:bg-red-400/5 group font-bold">
                        <LogOut size={20} /><span className="text-sm">시스템 로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-16 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-6xl mx-auto space-y-16">
                            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                                <div className="space-y-4">
                                    <h2 className="text-6xl font-black tracking-tighter leading-tight text-white">AI 안전 진단<br /><span className="text-blue-600">통제 센터</span></h2>
                                    <p className="text-slate-500 font-medium text-lg">점검할 건축물을 검색하여 지능형 구조 분석을 시작하세요.</p>
                                </div>
                                <button onClick={() => setIsSearchOpen(true)} className="group px-10 py-6 bg-white text-black font-black rounded-3xl transition-all shadow-2xl hover:scale-[1.02] flex items-center gap-4">
                                    <Search size={24} />
                                    진단 대상 건물 검색
                                </button>
                            </header>

                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: '누적 분석 건수', value: `${inspections.length + 120}건`, icon: Building2, color: 'blue' },
                                    { label: '위험군 탐지', value: '14건', icon: AlertTriangle, color: 'amber' },
                                    { label: 'AI 분석 정확도', value: '99.8%', icon: ShieldCheck, color: 'green' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6 group hover:bg-white/[0.04] transition-colors shadow-2xl">
                                        <stat.icon size={32} className={`text-${stat.color}-500 group-hover:scale-110 transition-transform`} />
                                        <div>
                                            <div className="text-4xl font-black text-white tracking-tighter mb-2">{stat.value}</div>
                                            <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Profile Info */}
                            <div className="p-12 rounded-[4rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 relative overflow-hidden group">
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-48 h-48 rounded-[3rem] bg-white/5 flex items-center justify-center p-8 backdrop-blur-xl border border-white/10 group-hover:scale-105 transition-transform duration-500">
                                        <Activity size={80} className="text-blue-500" />
                                    </div>
                                    <div className="flex-1 space-y-6 text-center md:text-left">
                                        <h3 className="text-4xl font-black text-white tracking-tight">지능형 안전 진단 알고리즘 <span className="text-blue-500">v2.4</span></h3>
                                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-2xl">
                                            SafeAI Pro는 수천 건의 구조적 결함 데이터를 학습하여 건축물의 외관뿐만 아니라 연식, 용도에 따른 잠재적 위험 요소를 99.8%의 정확도로 예측합니다.
                                        </p>
                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            {['위성 스캔', '구조 변위 해석', '열화상 시뮬레이션'].map(tag => (
                                                <span key={tag} className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-slate-300 uppercase tracking-widest">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'report-detail' && currentReport && (
                        <motion.div key="report-detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-12">
                            <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold group mb-4">
                                <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                                대시보드로 돌아가기
                            </button>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                {/* Left: Info Card */}
                                <div className="lg:col-span-2 space-y-12">
                                    <div className="flex flex-col md:flex-row items-center gap-10 p-10 rounded-[4rem] bg-white/[0.02] border border-white/5 relative overflow-hidden shadow-2xl">
                                        <div className="w-56 h-56 rounded-[3rem] overflow-hidden border border-white/10 shrink-0 shadow-2xl">
                                            <img src={currentReport.image} className="w-full h-full object-cover" alt="Building" />
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${currentReport.status === 'SAFE' ? 'bg-green-500 text-white' : (currentReport.status === 'WARNING' ? 'bg-amber-500 text-black' : 'bg-red-600 text-white')}`}>
                                                    {currentReport.status} LEVEL
                                                </span>
                                                <span className="text-slate-500 font-bold text-sm tracking-tighter px-4 border-l border-white/10">{currentReport.date}</span>
                                            </div>
                                            <h2 className="text-5xl font-black text-white tracking-tighter">{currentReport.building}</h2>
                                            <div className="flex items-center gap-2 text-slate-400 font-medium">
                                                <MapPin size={16} />
                                                <span>지능형 구조 정밀 진단 시스템 분석 완료</span>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 p-8 text-blue-600/20"><ShieldCheck size={120} /></div>
                                    </div>

                                    {/* Detailed Analysis Section */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                            <FileText size={24} className="text-blue-500" />
                                            <h3 className="text-2xl font-black text-white tracking-tight">구조 정밀 분석 리포트</h3>
                                        </div>
                                        <div className="p-10 rounded-[3rem] bg-white/[0.01] border border-white/5 leading-relaxed text-slate-300 text-lg font-medium space-y-6 shadow-inner">
                                            <div className="flex items-start gap-4">
                                                <Info size={24} className="text-blue-500 shrink-0 mt-1" />
                                                <p>{currentReport.details}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 border-b border-white/5 pb-4 mt-12">
                                                <TrendingUp size={24} className="text-green-500" />
                                                <h3 className="text-2xl font-black text-white tracking-tight">AI 권고 개선 방안</h3>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {currentReport.recommendations.map((rec, i) => (
                                                    <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-blue-600/30 transition-all group">
                                                        <div className="flex gap-5">
                                                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                                <CheckCircle2 size={24} />
                                                            </div>
                                                            <p className="text-slate-300 font-bold leading-tight group-hover:text-white transition-colors">{rec}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Scoring Card */}
                                <div className="space-y-8">
                                    <div className="p-12 rounded-[4rem] bg-gradient-to-br from-blue-600 to-blue-900 border border-white/10 text-center space-y-8 shadow-[0_30px_100px_rgba(37,99,235,0.3)]">
                                        <div className="text-white/60 text-xs font-black uppercase tracking-[0.3em]">AI Total Score</div>
                                        <div className="relative inline-block">
                                            <svg className="w-48 h-48 transform -rotate-90">
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                                                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 88} strokeDashoffset={2 * Math.PI * 88 * (1 - currentReport.score / 100)} className="text-white" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                <span className="text-6xl font-black text-white tracking-tighter">{currentReport.score}</span>
                                                <span className="text-xl font-bold text-white/60 ml-1">pt</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-2xl font-black text-white tracking-tight">최종 안전 등급 <span className="text-sky-300">{currentReport.status === 'SAFE' ? '우수' : (currentReport.status === 'WARNING' ? '보통' : '주의')}</span></p>
                                            <p className="text-white/60 font-medium text-sm">상업용 건축물 평균 대비 {currentReport.score > 90 ? '상위 5%' : (currentReport.score > 80 ? '평균 수준' : '하위 15%')}</p>
                                        </div>
                                        <button className="w-full py-5 bg-white text-blue-900 font-black rounded-3xl hover:bg-slate-100 transition-all shadow-xl">
                                            공식 인증서 PDF 발행
                                        </button>
                                    </div>

                                    {/* Stats List */}
                                    <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                                        <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">세부 평가 항목</h4>
                                        {[
                                            { label: '지반 침하 가능성', val: '2.4%', color: 'blue' },
                                            { label: '균열 밀집도', val: '매우 낮음', color: 'green' },
                                            { label: '연식 대비 노후도', val: '양호', color: 'green' },
                                            { label: '보강 필요성', val: currentReport.score > 85 ? '낮음' : '높음', color: currentReport.score > 85 ? 'blue' : 'amber' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center group">
                                                <span className="text-slate-400 font-bold text-sm group-hover:text-slate-300 transition-colors">{item.label}</span>
                                                <span className={`text-${item.color}-500 font-black text-sm uppercase tracking-wider`}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-12">
                            <h2 className="text-5xl font-black tracking-tighter text-white">진단 <span className="text-blue-600">아카이브</span></h2>
                            <div className="space-y-6">
                                {inspections.length > 0 ? inspections.map(item => (
                                    <button key={item.id} onClick={() => { setCurrentReport(item); setActiveTab('report-detail'); }} className="w-full text-left p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.04] transition-all group shadow-xl">
                                        <div className="flex items-center gap-10">
                                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                                                <img src={item.image} className="w-full h-full object-cover" alt="Building" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white mb-2">{item.building}</p>
                                                <p className="text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-md">{item.date} • {item.analysis}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <span className={`px-6 py-3 rounded-2xl text-xs font-black tracking-widest uppercase ${item.status === 'SAFE' ? 'text-green-400 border border-green-400/30' : (item.status === 'WARNING' ? 'text-amber-400 border border-amber-400/30' : 'text-red-400 border border-red-400/30')}`}>{item.status}</span>
                                            <div className="p-4 rounded-xl bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-inner">
                                                <ArrowRight size={24} />
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="py-32 text-center space-y-6 bg-white/[0.01] rounded-[4rem] border border-white/5 border-dashed">
                                        <Activity size={64} className="text-slate-700 mx-auto" />
                                        <p className="text-slate-600 font-black uppercase tracking-[0.4em] text-sm">기록된 진단 데이터가 없습니다</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Search & Analysis Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
                        <div className="w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[4rem] p-12 space-y-10 relative shadow-[0_0_150px_rgba(37,99,235,0.15)]">
                            <button onClick={() => { setIsSearchOpen(false); setSelectedBuilding(null); setIsAnalyzing(false); }} className="absolute top-10 right-10 p-4 text-slate-600 hover:text-white transition-colors bg-white/5 rounded-2xl"><X size={28} /></button>

                            <div className="text-center space-y-4">
                                <h3 className="text-3xl font-black tracking-tighter text-white">AI 구조분석 검색</h3>
                                <p className="text-slate-500 font-medium tracking-tight">대상 건물을 선택하여 AI 위성 스캔 및 데이터 분석을 시작하십시오.</p>
                            </div>

                            {!selectedBuilding ? (
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={24} />
                                        <input
                                            type="text"
                                            placeholder="점검할 건물명 또는 주소 입력..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-20 pr-8 py-8 bg-white/[0.03] border border-white/10 rounded-3xl text-xl font-bold text-white outline-none focus:border-blue-600/50 focus:bg-white/[0.05] transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="max-h-80 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                        {filteredBuildings.length > 0 ? filteredBuildings.map(b => (
                                            <button
                                                key={b.id}
                                                onClick={() => startAutomaticAnalysis(b)}
                                                className="w-full p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 hover:border-blue-600/50 hover:bg-blue-600/5 flex items-center gap-8 transition-all group"
                                            >
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-600/10 transition-all shrink-0">
                                                    <Building2 size={32} />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="font-black text-white text-xl group-hover:text-blue-400 transition-colors">{b.name}</p>
                                                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mt-1">
                                                        <MapPin size={14} />
                                                        {b.address}
                                                    </div>
                                                </div>
                                                <ArrowRight size={24} className="text-slate-700 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                                            </button>
                                        )) : (
                                            <div className="py-20 text-center text-slate-600 font-black uppercase tracking-[0.3em] text-xs">검색 데이터가 없습니다</div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    <div className="aspect-video w-full rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl">
                                        <img src={selectedBuilding.image} className="w-full h-full object-cover scale-110" alt="Building Preview" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-12">
                                            <div className="flex items-center gap-4 mb-3">
                                                <span className="px-4 py-2 bg-blue-600 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase text-white shadow-lg">Target Active</span>
                                                <span className="text-white/40 text-xs font-black uppercase tracking-widest">Built in {selectedBuilding.year}</span>
                                            </div>
                                            <h4 className="text-5xl font-black text-white tracking-tighter">{selectedBuilding.name}</h4>
                                        </div>

                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-10">
                                                <div className="relative">
                                                    <Loader2 size={100} className="text-blue-600 animate-spin opacity-50" />
                                                    <ShieldCheck size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-pulse" />
                                                </div>
                                                <div className="text-center space-y-6">
                                                    <p className="text-3xl font-black text-white tracking-[0.2em] animate-pulse">AI 구조적 스캔 중...</p>
                                                    <div className="flex gap-3 justify-center">
                                                        {[0, 1, 2].map(i => (
                                                            <motion.div
                                                                key={i}
                                                                initial={{ scaleY: 0.2 }}
                                                                animate={{ scaleY: 1 }}
                                                                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.1 }}
                                                                className="w-1.5 h-8 bg-blue-600 rounded-full"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-white/[0.02] p-10 rounded-[3rem] border border-white/5 shadow-inner">
                                        <div className="flex justify-between items-center px-4">
                                            <div className="space-y-3">
                                                <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">구조 안정성 분석</div>
                                                <div className="text-blue-600 font-black text-2xl tracking-tighter">데이터 처리 중...</div>
                                            </div>
                                            <div className="space-y-3 text-right">
                                                <div className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">현재 위협 수준</div>
                                                <div className="text-blue-600 font-black text-2xl tracking-tighter">계산 완료 대기</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
