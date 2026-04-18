import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Account from './pages/Account';
import Profit from './pages/Profit';
import Settings from './pages/Settings';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import TestAuth from './pages/TestAuth';

// Components
import BottomNav from './components/BottomNav';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // NEW LOGIC: If authenticated but IS an admin, kick them to the admin dashboard
  if (isAuthenticated && user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  console.log('AdminRoute - Auth State:', { isAuthenticated, user, loading });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Check if user is admin
  if (isAuthenticated && user && user.isAdmin === true) {
    console.log('Admin access granted');
    return children;
  }
  
  // If authenticated but not admin, redirect to home
  if (isAuthenticated && user && user.isAdmin !== true) {
    console.log('User is not admin, redirecting to home');
    return <Navigate to="/" replace />;
  }
  
  // Not authenticated, redirect to admin login
  console.log('Not authenticated, redirecting to admin login');
  return <Navigate to="/admin-login" replace />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  
  // Check if current path is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  
  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      });
    }
  };
  
  return (
    <div className={isAdminRoute ? "" : "pb-16"}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/test" element={<TestAuth />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/profit" element={
          <ProtectedRoute>
            <Profit />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />
        <Route path="/recharge" element={
          <ProtectedRoute>
            <Recharge />
          </ProtectedRoute>
        } />
        <Route path="/withdraw" element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        } />
      </Routes>
      
      {/* Only show bottom nav and chatbot if authenticated AND not on admin route */}
      {isAuthenticated && !isAdminRoute && <BottomNav />}
      {isAuthenticated && !isAdminRoute && <AIChatbot />}
      
      {showInstallPrompt && (
        <div className="install-prompt">
          <p className="text-sm text-gray-600 mb-2">Install Loyalvest App</p>
          <div className="flex gap-2">
            <button onClick={handleInstall} className="btn-primary flex-1">Install</button>
            <button onClick={() => setShowInstallPrompt(false)} className="btn-secondary flex-1">Later</button>
          </div>
        </div>
      )}
      
      <Toaster position="top-center" />
    </div>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;