import React from 'react';
import { useCommerce } from '../contexts/CommerceContext';

const Users: React.FC = () => {
  const { users, toggleUserStatus } = useCommerce();

  const roleCounts = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-3xl font-bold text-slate-900">User Administration</h2>
            <p className="mt-1 text-slate-600">Manage Food.com customer, supplier, and steward accounts.</p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-slate-100 p-3">
                <p className="text-xs text-slate-500">Customers</p>
                <p className="text-xl font-bold text-slate-900">{roleCounts.Customer || 0}</p>
              </div>
              <div className="rounded-md bg-slate-100 p-3">
                <p className="text-xs text-slate-500">Suppliers</p>
                <p className="text-xl font-bold text-slate-900">{roleCounts.Supplier || 0}</p>
              </div>
              <div className="rounded-md bg-slate-100 p-3">
                <p className="text-xs text-slate-500">Data Stewards</p>
                <p className="text-xl font-bold text-slate-900">{roleCounts['Data Steward'] || 0}</p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Username</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Role</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-3 py-2 text-sm text-slate-900">{user.username}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">{user.email}</td>
                      <td className="px-3 py-2 text-sm text-slate-600">{user.role}</td>
                      <td className="px-3 py-2 text-sm">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-100"
                        >
                          {user.status === 'active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Users;