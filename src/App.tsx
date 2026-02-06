import { useState, useEffect } from 'react'
import {
    Camera,
    ShieldCheck,
    History,
    LayoutDashboard,
    LogOut,
    AlertTriangle,
    FileText,
    X,
    Loader2
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

declare global {
    interface Window {
        google: any;
    }
}

export default function App() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isCameraOpen, setIsCameraOpen] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [inspections, setInspections] = useState<Inspection[]>([
        {
            id: '1',
            date: '2024-02-06',
            building: '강남구 테헤란로 123 빌딩',
            status: 'SAFE',
            image: 'https://images.unsplash.com/photo-1590069230005-db3263050121?q=80&w=500',
            analysis: '균열 없음. 구조 안정성 양호함.'
        }
    ])

    // Google Login Initialization
    useEffect(() => {
        const handleCredentialResponse = (response: any) => {
            // JWT 디코딩 (간단한 버전)
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const profile = JSON.parse(jsonPayload);
            setUser(profile);
            setIsLoggedIn(true);
        };

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // 사용자가 나중에 입력해야 함
                callback: handleCredentialResponse
            });

            const parent = document.getElementById('google-btn-parent');
            if (parent) {
                window.google.accounts.id.renderButton(
                    parent,
                    { theme: 'outline', size: 'large', width: '100%' }
                );
            }
        }
    }, [isLoggedIn]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setSelectedImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const startAnalysis = () => {
        if (!selectedImage) return
        setIsAnalyzing(true)

        // Simulate AI Analysis (Gemini API 연동 시 이 부분을 유료 API 호출로 교체 가능)
        setTimeout(() => {
            const newInspection: Inspection = {
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0],
                building: '점검 대상 건축물 (신규)',
                status: Math.random() > 0.7 ? 'WARNING' : 'SAFE',
                image: selectedImage,
                analysis: 'AI 분석 결과: 표면 미세 균열 감지됨. 정기 관찰 필요.'
            }
            setInspections([newInspection, ...inspections])
            setIsAnalyzing(false)
            setIsCameraOpen(false)
            setSelectedImage(null)
            setActiveTab('history')
        }, 3000)
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#020408]">
                <div className="w-full max-w-md space-y-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <div className="inline-flex p-4 rounded-3xl bg-blue-600/10 border border-blue-600/20 text-blue-500 mb-4">
                            <ShieldCheck size={48} />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">SafeAI Inspection</h1>
                        <p className="text-slate-400">전문가를 위한 AI 기반 지능형 안전 점검 솔루션</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-xl space-y-6 text-center"
                    >
                        <div id="google-btn-parent" className="w-full overflow-hidden rounded-xl"></div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#020408] px-2 text-slate-500 tracking-widest">또는</span></div>
                        </div>

                        <button onClick={() => setIsLoggedIn(true)} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 transition-all">
                            게스트 모드로 시작하기 (개발용)
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#020408] flex flex-col md:flex-row">
            {/* Sidebar - Same as before but with User profile */}
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
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <item.icon size={20} />
                                <span className="font-bold text-sm tracking-tight">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {user && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5">
                            <img src={user.picture} className="w-8 h-8 rounded-full" alt="Profile" />
                            <div className="text-xs truncate">
                                <div className="font-bold text-white">{user.name}</div>
                                <div className="text-slate-500">{user.email}</div>
                            </div>
                        </div>
                    )}
                    <button onClick={() => { setIsLoggedIn(false); setUser(null); }} className="w-full flex items-center gap-4 px-4 py-4 text-slate-500 hover:text-red-400 transition-colors rounded-2xl hover:bg-red-400/5 group">
                        <LogOut size={20} /><span className="font-bold text-sm">로그아웃</span>
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-6 md:p-12 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tighter mb-2">대시보드</h2>
                                    <p className="text-slate-500">현재 안전 점검 현황 및 최근 AI 분석 결과</p>
                                </div>
                                <button onClick={() => setIsCameraOpen(true)} className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center gap-3">
                                    <Camera size={20} />새로운 AI 점검 시작
                                </button>
                            </div>

                            {/* Stats & History - Same as before but linked to state */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: '전체 점검', value: `${inspections.length}건`, icon: ShieldCheck, color: 'blue' },
                                    { label: '주의 필요', value: `${inspections.filter(i => i.status !== 'SAFE').length}건`, icon: AlertTriangle, color: 'amber' },
                                    { label: '최근 등록', value: '오늘', icon: History, color: 'green' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                        <stat.icon size={24} className={`text-${stat.color}-500`} />
                                        <div className="text-3xl font-black text-white mt-1">{stat.value}</div>
                                        <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between"><h3 className="text-xl font-bold tracking-tight">최근 점검 현황</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {inspections.slice(0, 4).map((item) => (
                                        <div key={item.id} className="group p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className="flex gap-6">
                                                <img src={item.image} className="w-32 h-32 rounded-2xl object-cover border border-white/5" alt="Inspection" />
                                                <div className="flex-1 space-y-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${item.status === 'SAFE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{item.status}</span>
                                                    <h4 className="font-bold text-white leading-tight">{item.building}</h4>
                                                    <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2">{item.analysis}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8">
                            <h2 className="text-3xl font-black tracking-tighter">점검 전체 이력</h2>
                            <div className="space-y-4">
                                {inspections.map(item => (
                                    <div key={item.id} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <img src={item.image} className="w-16 h-16 rounded-xl object-cover" />
                                            <div>
                                                <p className="font-bold text-white">{item.building}</p>
                                                <p className="text-xs text-slate-500">{item.date} • {item.analysis}</p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-xl text-xs font-black ${item.status === 'SAFE' ? 'text-green-500' : 'text-red-500'}`}>{item.status}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Analysis Modal */}
            <AnimatePresence>
                {isCameraOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
                        <div className="w-full max-w-lg bg-[#0a0c10] border border-white/10 rounded-[3rem] p-8 space-y-8 relative overflow-hidden">
                            <button onClick={() => setIsCameraOpen(false)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><X size={24} /></button>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-black tracking-tighter">AI 안전 점검 촬영</h3>
                                <p className="text-slate-500 text-sm">균열이나 손상 부위가 잘 보이도록 촬영해 주세요.</p>
                            </div>

                            {!selectedImage ? (
                                <div className="aspect-square rounded-[2rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6 group hover:border-blue-500/50 hover:bg-blue-600/5 transition-all">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <Camera size={40} />
                                    </div>
                                    <label className="px-8 py-4 bg-blue-600 rounded-2xl font-bold cursor-pointer hover:bg-blue-500 transition-all">
                                        사진 촬영 또는 업로드
                                        <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 relative">
                                        <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
                                                <Loader2 size={48} className="text-blue-500 animate-spin" />
                                                <p className="text-white font-black tracking-widest animate-pulse">AI 분석 중...</p>
                                            </div>
                                        )}
                                    </div>
                                    {!isAnalyzing && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => setSelectedImage(null)} className="py-4 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-all">재촬영</button>
                                            <button onClick={startAnalysis} className="py-4 rounded-2xl bg-blue-600 font-bold hover:bg-blue-500 transition-all">분석 시작</button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
