import React, { useEffect, useState } from 'react'
import { Brain, Camera, Shield, ArrowRight, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoredSession } from '../utils/auth';
import { dashboardPathForRole } from '../utils/authUrls';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const fullText = "AI Mood Analysis Active"
  const [typedText, setTypedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)

  useEffect(() => {
    const session = getStoredSession();
    if (session?.user) {
      navigate(dashboardPathForRole(session.user.role), { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let index = 0

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setIsTypingComplete(true)
      }
    }, 60)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <MarketingNav />

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-16 sm:pb-24 md:pt-24 md:pb-32 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span>AI-Powered Mental Health</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-gray-900">
            Find clarity in the{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">chaos.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-lg">
            Your personal mental wellness companion. Track moods with AI, chat safely, and connect with professionals—all in one secure space.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <button className="px-8 py-4 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-full font-bold text-lg transition-all border border-gray-200">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
          <div className="relative bg-white/50 backdrop-blur-xl border border-white/40 rounded-3xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <Smile size={20} />
                  </div>
                  <div>
                    <div className="h-2 w-24 bg-gray-200 rounded-full mb-1"></div>
                    <div className="h-2 w-16 bg-gray-100 rounded-full"></div>
                  </div>
                </div>
                <div className="h-8 w-8 bg-gray-50 rounded-lg"></div>
              </div>
              <div className="h-32 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                <span className="text-xs text-gray-900 font-medium uppercase tracking-widest">
                  {typedText}
                  {!isTypingComplete && (
                    <span className="ml-1 animate-pulse">|</span>
                  )}
                </span>
              </div>


              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                <div className="h-2 w-5/6 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Complete Mental Wellness Toolkit</h2>
            <p className="text-gray-500">Everything you need to maintain a healthy mind, accessible from anywhere.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: 'AI Companion', desc: '24/7 empathetic chat support that learns and adapts to your emotional needs.' },
              { icon: Camera, title: 'Mood Scanning', desc: 'Advanced facial recognition technology to detect micro-expressions and track trends.' },
              { icon: Shield, title: 'Doctor Connect', desc: 'Seamlessly share your summaries with certified professionals for deeper care.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default LandingPage;