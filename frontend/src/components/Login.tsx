import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [selectedUsername, setSelectedUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  const users = [
    { username: 'customer1', role: 'Customer' },
    { username: 'customer2', role: 'Customer' },
    { username: 'supplier1', role: 'Supplier' },
    { username: 'supplier2', role: 'Supplier' },
    { username: 'steward1', role: 'Data Steward' },
    { username: 'steward2', role: 'Data Steward' },
  ];

  const handleLogin = async () => {
    if (selectedUsername && selectedRole) {
      await login(selectedUsername, selectedRole);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to eCommerce Platform
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select a user to continue
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <select
                id="username"
                name="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={selectedUsername}
                onChange={(e) => {
                  const selectedUser = users.find(u => u.username === e.target.value);
                  setSelectedUsername(e.target.value);
                  setSelectedRole(selectedUser?.role || '');
                }}
              >
                <option value="">Select a user...</option>
                {users.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.username} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleLogin}
              disabled={!selectedUsername || !selectedRole || isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;