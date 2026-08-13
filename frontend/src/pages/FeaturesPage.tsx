import React from 'react';
import {
  Brain, Camera, Shield, MessageCircle, Activity,
  Users, Sparkles, ChevronRight,
  Zap, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <MarketingNav active="features" />

      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 sm:py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 sm:mb-8">
            <Sparkles size={16} />
            <span>Powerful Features for Mental Wellness</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 max-w-4xl mx-auto mb-6">
            Everything you need for a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">healthier mind</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto">
            From AI-powered mood tracking to professional consultations, we've built the complete toolkit for mental wellness.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              icon: Brain,
              title: "AI Companion",
              desc: "24/7 empathetic chat support that learns from your conversations and adapts to your emotional patterns.",
              color: "bg-purple-100 text-purple-600",
              features: ["Natural conversations", "Emotional pattern recognition", "Personalized responses"]
            },
            {
              icon: Camera,
              title: "Mood Scanning",
              desc: "Advanced facial recognition that detects micro-expressions and tracks your emotional trends over time.",
              color: "bg-blue-100 text-blue-600",
              features: ["Real-time mood detection", "Weekly trend analysis", "Emotional insights"]
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "Bank-level encryption ensures your conversations and health data remain completely confidential.",
              color: "bg-green-100 text-green-600",
              features: ["End-to-end encryption", "Anonymous sessions", "GDPR compliant"]
            },
            {
              icon: MessageCircle,
              title: "Journal & Reflections",
              desc: "Digital journal with prompts and insights to help you understand your thoughts and feelings better.",
              color: "bg-amber-100 text-amber-600",
              features: ["Guided journaling", "Mood-based prompts", "Progress tracking"]
            },
            {
              icon: Activity,
              title: "Progress Tracking",
              desc: "Visualize your mental health journey with detailed charts and milestone celebrations.",
              color: "bg-cyan-100 text-cyan-600",
              features: ["Mood timelines", "Achievement badges", "Weekly reports"]
            },
            {
              icon: Users,
              title: "Doctor Connect",
              desc: "Seamlessly share your mental health summaries with certified professionals for deeper care.",
              color: "bg-indigo-100 text-indigo-600",
              features: ["Secure sharing", "Professional network", "Consultation scheduling"]
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all p-6 sm:p-8 group">
              <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-500 mb-6 leading-relaxed">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.features.map((item, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <ChevronRight size={16} className="text-blue-500 mr-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Smart Features for Better Care</h2>
            <p className="text-gray-500">Leveraging AI to provide insights you won't find anywhere else.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center text-white shrink-0">
                  <Zap size={24} />
                </div>
                <h3 className="text-xl font-bold">Real-time Analysis</h3>
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-gray-50 rounded-xl flex items-center px-4">
                  <span className="text-sm text-gray-600">Detected mood: <span className="font-semibold text-blue-600">Calm</span></span>
                </div>
                <div className="h-16 bg-gray-50 rounded-xl flex items-center px-4">
                  <span className="text-sm text-gray-600">Stress level: <span className="font-semibold text-green-600">Low</span></span>
                </div>
                <div className="h-16 bg-gray-50 rounded-xl flex items-center px-4">
                  <span className="text-sm text-gray-600">Engagement score: <span className="font-semibold text-purple-600">85%</span></span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center text-white shrink-0">
                  <TrendingUp size={24} />
                </div>
                <h3 className="text-xl font-bold">Weekly Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
                  <span className="text-sm">Mood stability</span>
                  <span className="text-sm font-semibold text-green-600">+23%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
                  <span className="text-sm">Sleep quality</span>
                  <span className="text-sm font-semibold text-blue-600">+15%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-2">
                  <span className="text-sm">Activity level</span>
                  <span className="text-sm font-semibold text-purple-600">+31%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-6 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-4xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-base sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who've found clarity with Zehnify.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 min-h-11"
          >
            Get Started Free
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default FeaturesPage;
