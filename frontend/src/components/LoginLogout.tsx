import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Basic login/logout controls
 * No UI polish - functional only
 */
const LoginLogout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <div>
        <a
          href="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-700">
        Welcome, {user?.username} ({user?.role})
      </span>
      <button
        onClick={logout}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
      >
        Logout
      </button>
    </div>
  );
};

export default LoginLogout;
