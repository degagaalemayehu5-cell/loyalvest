import React from 'react';
import { useAuth } from '../context/AuthContext';

const TestAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <div className="space-y-2">
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>User: {user ? JSON.stringify(user, null, 2) : 'No user'}</p>
        <p>Is Admin: {user?.isAdmin ? 'Yes' : 'No'}</p>
        <p>LocalStorage User: {localStorage.getItem('user')}</p>
        <p>LocalStorage Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
      </div>
    </div>
  );
};

export default TestAuth;