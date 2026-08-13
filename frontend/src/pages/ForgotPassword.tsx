import React, { useState } from 'react';
import { ChevronRight, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { getUserByEmail } from '../utils/storage';

interface ForgotPasswordProps {
    onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const user = getUserByEmail(email);
        if (!user) {
            setError('No account found with this email address.');
            return;
        }
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
            <div className="w-full max-w-md">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-gray-800 mb-6 flex items-center text-sm font-medium transition-colors"
                >
                    <ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Back to Login
                </button>

                <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

                    {!submitted ? (
                        <>
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                </div>
                            </div>

                            <div className="text-center mb-7">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    Enter the email address linked to your account and we'll send you a reset link.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-3.5 rounded-xl text-white font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transform transition-all hover:-translate-y-0.5"
                                >
                                    Send Reset Link
                                </button>
                            </form>
                        </>
                    ) : (
                        /* Success State */
                        <div className="text-center py-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h2>
                            <p className="text-gray-500 text-sm leading-relaxed mb-2">
                                A password reset link has been sent to
                            </p>
                            <p className="font-semibold text-blue-600 text-sm mb-6">{email}</p>
                            <p className="text-xs text-gray-400 mb-8">
                                Didn't receive it? Check your spam folder or try again.
                            </p>
                            <button
                                onClick={onBack}
                                className="w-full py-3.5 rounded-xl text-white font-bold text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transform transition-all hover:-translate-y-0.5"
                            >
                                Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;