import React, { useEffect, useState } from 'react';
import { ChevronRight, AlertCircle, Loader2, HelpCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ForgotPassword from './ForgotPassword';
import GuideModal from '../components/GuideModal';
import { DOCTOR_GUIDE_STEPS, DOCTOR_GUIDE_TITLE } from '../content/doctorGuide';

import { Link, useNavigate } from 'react-router-dom';
import { getGoogleAuthUrl, dashboardPathForRole } from '../utils/authUrls';
import { getStoredSession } from '../utils/auth';

const Login: React.FC = () => {
  const { handleLogin, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showDoctorGuide, setShowDoctorGuide] = useState(false);

  useEffect(() => {
    const session = currentUser ?? getStoredSession()?.user ?? null;
    if (session) {
      navigate(dashboardPathForRole(session.role), { replace: true });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setError(decodeURIComponent(err));
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.endsWith('@umt.edu.pk')) {
      setError('Only UMT email addresses (@umt.edu.pk) are allowed.');
      return;
    }
    setIsSubmitting(true);
    try {
      const err = await handleLogin(email, password, role === 'patient' ? 'user' : 'doctor');
      if (err) setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = getGoogleAuthUrl();
  };

  const isBusy = isSubmitting || isGoogleLoading;

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <GuideModal
        open={showDoctorGuide}
        onClose={() => setShowDoctorGuide(false)}
        title={DOCTOR_GUIDE_TITLE}
        subtitle="How to use the clinical portal after admin promotes your account."
        steps={DOCTOR_GUIDE_STEPS}
      />
      <div className="w-full max-w-md">
        <Link to="/" className="text-gray-400 hover:text-gray-800 mb-6 flex items-center text-sm font-medium transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Home
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-5 sm:p-8 md:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

          <div className="text-center mb-7">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Please sign in to your account</p>
          </div>

          <div className="flex bg-gray-50 p-1 rounded-xl mb-6">
            <button
              type="button"
              disabled={isBusy}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'patient' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-60`}
              onClick={() => setRole('patient')}
            >Patient</button>
            <button
              type="button"
              disabled={isBusy}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${role === 'doctor' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500 hover:text-gray-700'} disabled:opacity-60`}
              onClick={() => setRole('doctor')}
            >Doctor</button>
          </div>

          {role === 'doctor' && (
            <button
              type="button"
              onClick={() => setShowDoctorGuide(true)}
              className="w-full mb-5 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 text-sm font-semibold hover:bg-cyan-100 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              Doctor portal guide
            </button>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isBusy}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-5 font-medium text-gray-700 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {isGoogleLoading ? 'Redirecting to Google...' : 'Login with Google'}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100"></div>
            <span className="text-xs text-gray-400 font-medium">or login with email</span>
            <div className="flex-1 h-px bg-gray-100"></div>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" required disabled={isBusy}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-60"
                placeholder={role === 'patient' ? 'user@example.com' : 'dr.strange@hospital.com'}
                value={email} onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password" required disabled={isBusy}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm disabled:opacity-60"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className={`w-full py-3.5 rounded-xl text-white font-bold text-base shadow-lg transform transition-all mt-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${role === 'patient' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' : 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/30'
                }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
            </p>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-400 hover:text-blue-600 transition-colors font-medium"
            >
              Forgot your password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
