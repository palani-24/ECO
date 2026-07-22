import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaUsers, FaCoins } from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/admin/users');
        if (res.data.success) {
          setUsers(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch users list.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Registered Users</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage and audit registered recycling customers and point credits.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
              {error}
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/20">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email Address</th>
                      <th className="py-4 px-6">Points Balance</th>
                      <th className="py-4 px-6">Registered On</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                        <td className="py-4 px-6 font-bold flex items-center space-x-3">
                          <img 
                            src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=10b981&color=fff`} 
                            alt={u.name} 
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span>{u.name}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold">{u.email}</td>
                        <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                          <FaCoins /> <span>{u.points} pts</span>
                        </td>
                        <td className="py-4 px-6 font-semibold">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-6 text-slate-400">No users found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminUsers;
