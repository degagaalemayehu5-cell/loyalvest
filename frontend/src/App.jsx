import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import InstallButton from './components/InstallButton';

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

// Components
import BottomNav from './components/BottomNav';
import AIChatbot from './components/AIChatbot';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (isAuthenticated && user && user.isAdmin === true) {
    return children;
  }
  
  if (isAuthenticated && user && user.isAdmin !== true) {
    return <Navigate to="/" replace />;
  }
  
  return <Navigate to="/admin-login" replace />;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Check if current path is admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className={isAdminRoute ? "" : "pb-16"}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin-login" element={<AdminLogin />} />
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
      
      {isAuthenticated && !isAdminRoute && <BottomNav />}
      {isAuthenticated && !isAdminRoute && <AIChatbot />}
      
      {/* Install Button - shows on both user and admin areas */}
      <InstallButton />
      
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