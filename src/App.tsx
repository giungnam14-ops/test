import { useState } from 'react'
import {
    Camera,
    ShieldCheck,
    History,
    LayoutDashboard,
    LogOut,
    ChevronRight,
    AlertTriangle,
    FileText,
    Plus
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Types
interface Inspection {
    id: string;
    date: string;
    building: string;
    status: 'SAFE' | 'WARNING' | 'DANGER';
    image: string;
    analysis: string;
}

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Mock Data
    const [inspections] = useState<Inspection[]>([
        {
            id: '1',
            date: '2024-02-06',
            building: '강남구 테헤란로 123 빌딩',
            status: 'SAFE',
            image: 'https://images.unsplash.com/photo-1590069230005-db3263050121?q=80&w=500',
            analysis: '균열 없음. 구조 안정성 양호함.'
        }
    ])

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020408]">
                <div className="w-full max-w-md space-y-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <div className="inline-flex p-4 rounded-3xl bg-blue-600/10 border border-blue-600/20 text-blue-500 mb-4">
                            <ShieldCheck size={48} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">SafeAI Inspection</h1>
                        <p className="text-slate-400">전문가를 위한 AI 기반 지능형 안전 점검 솔루션</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl space-y-6"
                    >
                        <button
                            onClick={() => setIsLoggedIn(true)}
                            className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-200 transition-all transform active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                            구글 계정으로 로그인 (Demo)
                        </button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#020408] px-2 text-slate-500 tracking-widest">또는</span></div>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="아이디" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-colors" />
                            <input type="password" placeholder="비밀번호" className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500/50 transition-colors" />
                            <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">로그인</button>
                        </div>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020408] flex flex-col md:flex-row">
            {/* Navigation Sidebar */}
            <nav className="w-full md:w-72 bg-white/[0.01] border-r border-white/5 p-6 flex flex-col gap-2 justify-between">
                <div className="space-y-8">
                    <div className="flex items-center gap-3 px-2 mb-10">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck size={24} className="text-white" />
                        </div>
                        <span className="font-black text-xl tracking-tight">SafeAI</span>
                    </div>

                    <div className="space-y-1">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
                            { id: 'history', icon: History, label: '점검 이력' },
                            { id: 'reports', icon: FileText, label: '리포트 생성' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id
                                        ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                                        : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={() => setIsLoggedIn(false)}
                    className="flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-400 transition-colors rounded-2xl hover:bg-red-400/5 group"
                >
                    <LogOut size={20} />
                    <span className="font-bold text-sm">로그아웃</span>
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div
                            key="dashboard"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-6xl mx-auto space-y-12"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter mb-2">대시보드</h2>
                                    <p className="text-slate-500">현재 안전 점검 현황 및 최근 AI 분석 결과</p>
                                </div>
                                <button className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3">
                                    <Camera size={20} />
                                    새로운 AI 점검 시작
                                </button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: '전체 점검', value: '124건', icon: ShieldCheck, color: 'blue' },
                                    { label: '주의 필요', value: '12건', icon: AlertTriangle, color: 'amber' },
                                    { label: '위험 감지', value: '3건', icon: AlertTriangle, color: 'red' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                        <div className={`w-12 h-12 rounded-xl bg-${stat.color}-600/10 flex items-center justify-center text-${stat.color}-500`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div>
                                            <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                                            <div className="text-3xl font-black text-white mt-1">{stat.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold tracking-tight">최근 점검 이력</h3>
                                    <button className="text-blue-500 text-sm font-bold flex items-center gap-1 hover:underline">
                                        전체 보기 <ChevronRight size={16} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {inspections.map((item) => (
                                        <div key={item.id} className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className="flex gap-6">
                                                <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                                                    <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Inspection" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${item.status === 'SAFE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                        <span className="text-slate-600 text-[10px] font-bold">{item.date}</span>
                                                    </div>
                                                    <h4 className="font-bold text-white leading-tight">{item.building}</h4>
                                                    <p className="text-slate-500 text-xs leading-relaxed">{item.analysis}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Empty State / Add Card */}
                                    <button className="p-6 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-blue-500/20 hover:bg-blue-600/5 transition-all flex flex-col items-center justify-center gap-4 text-slate-500 group">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus size={24} />
                                        </div>
                                        <span className="text-sm font-bold">새로운 점검 대상 추가</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}
