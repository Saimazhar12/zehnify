import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { getStoredSession } from '../utils/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('user' | 'doctor' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { currentUser, authReady } = useAppContext();
    const sessionUser = currentUser ?? getStoredSession()?.user ?? null;

    if (!authReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!sessionUser) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
        const target = sessionUser.role === 'doctor' ? '/doctor' : sessionUser.role === 'admin' ? '/admin' : '/app';
        return <Navigate to={target} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
