import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginLogout from '../components/LoginLogout';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">eCommerce Platform</h1>
              </div>
            </div>
            <div className="flex items-center">
              <LoginLogout />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to the eCommerce Platform
              </h2>
              {user && (
                <div className="mb-6">
                  <p className="text-lg text-gray-700">
                    Hello, <span className="font-semibold">{user.username}</span>!
                  </p>
                  <p className="text-sm text-gray-500">
                    Role: <span className="font-medium">{user.role}</span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {hasRole('Customer') && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900">Products</h3>
                    <p className="text-blue-700">Browse and purchase products</p>
                  </div>
                )}

                {hasRole('Customer') && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900">Orders</h3>
                    <p className="text-green-700">View your order history</p>
                  </div>
                )}

                {hasRole('Supplier') && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900">Suppliers</h3>
                    <p className="text-purple-700">Manage supplier operations</p>
                  </div>
                )}

                {hasRole('Data Steward') && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900">Users</h3>
                    <p className="text-red-700">Manage user accounts</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <p className="text-gray-600">
                  This is a microservices-based eCommerce platform with role-based access control.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Use the navigation above to explore different sections based on your role.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;