import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { User } from '../types';

type OAuthPayload = {
  access_token: string;
  user: User;
  redirectPath?: string;
};

function decodePayload(raw: string): OAuthPayload | null {
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const json = atob(padded);
    const data = JSON.parse(json) as OAuthPayload;
    if (!data?.access_token || !data?.user?.id || !data?.user?.role) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function readOAuthPayload(): OAuthPayload | null {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) {
    const fromHash = decodePayload(hash);
    if (fromHash) return fromHash;
  }

  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get('data');
  if (dataParam) {
    const fromData = decodePayload(dataParam);
    if (fromData) return fromData;
  }

  const accessToken = params.get('access_token');
  const userStr = params.get('user');
  if (accessToken && userStr) {
    try {
      const user = JSON.parse(userStr) as User;
      if (user?.id && user?.role) {
        return { access_token: accessToken, user };
      }
    } catch {
      return null;
    }
  }

  return null;
}

function dashboardPathForRole(role: User['role']): string {
  if (role === 'doctor') return '/doctor';
  if (role === 'admin') return '/admin';
  return '/app';
}

const GoogleAuthCallback: React.FC = () => {
  const { handleAuthSuccess } = useAppContext();
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const payload = readOAuthPayload();

    if (!payload) {
      console.error('Missing or invalid Google auth callback params');
      navigate('/login?error=missing_data', { replace: true });
      return;
    }

    window.history.replaceState(null, '', '/auth/google/callback');
    const target =
      payload.redirectPath || dashboardPathForRole(payload.user.role);
    handleAuthSuccess(payload.access_token, payload.user, target);
  }, [handleAuthSuccess, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full mx-4">
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating</h2>
        <p className="text-gray-500 text-sm">We&apos;re completing your secure sign-in with Google. Please wait a moment...</p>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
