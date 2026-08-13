import React from 'react';
import {
    Heart, Target, Users, Globe, Award,
    Quote, Mail,
    Sparkles, Shield, ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const AboutUsPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-clip">
            <MarketingNav active="about" />

            <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50 py-12 sm:py-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
                        We're on a mission to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">democratize mental healthcare</span>
                    </h1>
                    <p className="text-base sm:text-xl text-gray-500 leading-relaxed">
                        Zehnify was born from a simple idea: everyone deserves access to quality mental health support, regardless of their circumstances.
                    </p>
                </div>
            </section>

            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
                            <Sparkles size={16} />
                            <span>Our Story</span>
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-6">From personal struggle to global mission</h2>
                        <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-6">
                            Zehnify began with a simple observation: many people struggle to find timely, affordable mental health support when they need it most.
                        </p>
                        <p className="text-gray-500 text-base sm:text-lg leading-relaxed">
                            Built by a team of clinicians, researchers, and engineers, Zehnify combines the power of AI with human expertise to provide support when and where it's needed most.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl p-6 sm:p-8 text-white">
                            <Quote className="w-12 h-12 mb-4 opacity-50" />
                            <p className="text-xl sm:text-2xl italic mb-6">
                                "Mental health shouldn't be a luxury. With AI, we can scale empathy and make support available to everyone."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="font-bold">The Zehnify Team</p>
                                    <p className="text-sm text-blue-100">Clinicians & builders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Our core values</h2>
                        <p className="text-gray-500">The principles that guide everything we do.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                        {[
                            { icon: Heart, title: 'Empathy First', desc: 'We put human connection at the center of everything we build.' },
                            { icon: Shield, title: 'Privacy by Design', desc: 'Your data is yours alone. We built our platform with privacy as the foundation.' },
                            { icon: Target, title: 'Evidence-Based', desc: 'All our features are backed by the latest research in psychology and AI.' },
                            { icon: Users, title: 'Inclusive Access', desc: 'We believe mental health support should be accessible to everyone.' },
                            { icon: Award, title: 'Continuous Improvement', desc: 'We never stop learning and evolving to serve you better.' },
                            { icon: Globe, title: 'Global Community', desc: 'Building a worldwide network of support and understanding.' }
                        ].map((value, i) => (
                            <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                    <value.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-500">{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-gray-900 text-white py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16">
                        <div>
                            <h2 className="text-2xl sm:text-4xl font-bold mb-6">Get in touch</h2>
                            <p className="text-gray-300 text-base sm:text-lg mb-8">
                                Have questions about Zehnify? We'd love to hear from you.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <Mail className="text-blue-400 shrink-0" />
                                    <span className="break-all">hello@zehnify.com</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 rounded-3xl p-6 sm:p-8">
                            <h3 className="text-xl sm:text-2xl font-bold mb-4">Join our mission</h3>
                            <p className="text-gray-300 mb-6">
                                We're always looking for passionate people to join our team.
                            </p>
                            <button
                                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center min-h-11"
                                onClick={() => navigate('/signup')}
                            >
                                Become a Member <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </div>
    );
};

export default AboutUsPage;
