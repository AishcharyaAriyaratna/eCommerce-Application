import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Suppliers: React.FC = () => {
  const { user } = useAuth();

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Suppliers</h2>
              <p className="text-gray-600">
                Supplier management functionality will be implemented here.
              </p>
              {user && (
                <p className="text-sm text-gray-500 mt-2">
                  Logged in as: {user.username} ({user.role})
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Suppliers;