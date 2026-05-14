import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'rm' | 'mo' | 'dealer' | 'contractor' | 'merchant')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Checking Authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to the appropriate login page based on the current path
    const path = location.pathname;
    if (path.startsWith('/dealer')) return <Navigate to="/dealer/login" replace />;
    if (path.startsWith('/contractor')) return <Navigate to="/contractor/login" replace />;
    if (path.startsWith('/merchant')) return <Navigate to="/merchant/login" replace />;
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // If user is logged in but doesn't have the right role, redirect to their home
    if (role === 'admin') return <Navigate to="/dashboard" replace />;
    if (role === 'dealer') return <Navigate to="/dealer/home" replace />;
    if (role === 'contractor') return <Navigate to="/contractor/home" replace />;
    if (role === 'merchant') return <Navigate to="/merchant/home" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
