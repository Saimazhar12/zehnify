import {
    Users,
    ArrowRight, Brain, TrendingUp, Shield, Check, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const ForDoctorsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-clip">
            <MarketingNav active="doctors" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
                <div className="space-y-6 sm:space-y-8">
                    <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        <span>For Healthcare Professionals</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900">
                        Empowering better care through{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">AI insights.</span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg">
                        A comprehensive clinical dashboard designed to give you deeper emotional context and data-driven summaries before every session.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                            onClick={() => navigate('/signup')}
                            className="px-6 sm:px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-base sm:text-lg shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center min-h-11"
                        >
                            Get Started as Provider <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="relative bg-white border border-gray-100 rounded-3xl p-4 shadow-2xl lg:scale-105">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-4 gap-2">
                                <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                                        <Users size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold truncate">Patient Roster</p>
                                        <p className="text-xs text-gray-400">Clinical overview</p>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                    <Activity size={16} className="text-blue-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { label: 'Patient A', status: 'Needs Attention', urgent: true },
                                    { label: 'Patient B', status: 'Stable', urgent: false },
                                    { label: 'Patient C', status: 'Stable', urgent: false },
                                ].map((row) => (
                                    <div key={row.label} className="bg-gray-50 p-3 rounded-xl flex items-center justify-between gap-2">
                                        <div className="flex items-center space-x-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0">
                                                {row.label.slice(-1)}
                                            </div>
                                            <p className="text-sm font-medium text-gray-700 truncate">{row.label}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 ${row.urgent ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                            }`}>
                                            {row.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                                <Brain size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">Session Summaries</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Save time with AI-generated summaries of your patients' mood trends and self-reported issues since their last visit.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-cyan-600">
                                <TrendingUp size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">Visual Analytics</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Track patient progress through beautiful, easy-to-read charts that visualize mood cycles and emotional triggers.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-2xl font-bold">HIPAA Compliant</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Experience peace of mind with enterprise-grade security and full compliance with healthcare privacy regulations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Providers Choose Zehnify</h2>
                    <p className="text-gray-500">Transforming clinical workflows with intelligent automation.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="border border-gray-100 rounded-3xl p-6 sm:p-8 space-y-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Traditional Observation</h4>
                        <div className="space-y-4 opacity-50">
                            <p className="text-gray-800 line-through">Self-reported history only</p>
                            <p className="text-gray-800 line-through">Manually tracking mood patterns</p>
                            <p className="text-gray-800 line-through">Lengthy administrative paperwork</p>
                        </div>
                    </div>
                    <div className="bg-blue-600 rounded-3xl p-6 sm:p-8 space-y-6 text-white shadow-xl shadow-blue-600/20">
                        <h4 className="text-sm font-bold text-blue-200 uppercase tracking-widest">Zehnify Advantage</h4>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div>
                                <p className="font-medium">Continuous 24/7 patient insights</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div>
                                <p className="font-medium">Pattern recognition for risk factors</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shrink-0"><Check size={12} /></div>
                                <p className="font-medium">1-click clinical notes & exports</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
};

export default ForDoctorsPage;
