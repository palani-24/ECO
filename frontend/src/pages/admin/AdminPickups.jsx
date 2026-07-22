import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaClock } from 'react-icons/fa';

const AdminPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await api.get('/admin/pickups');
        if (res.data.success) {
          setPickups(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch pickups list.');
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      assigned: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      accepted: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
      completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
      cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Waste Pickup Registry</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Track and audit waste recycling activities, weights collected, and driver assignments.</p>
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
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Details</th>
                      <th className="py-4 px-6">Assigned Driver</th>
                      <th className="py-4 px-6">Weight (Est/Act)</th>
                      <th className="py-4 px-6">Points</th>
                      <th className="py-4 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                    {pickups.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                        <td className="py-4 px-6 font-bold">{p.user.name}</td>
                        <td className="py-4 px-6 font-bold flex items-center space-x-2">
                          <FaRecycle className="text-emerald-500" />
                          <span>{p.wasteCategory}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          <div className="space-y-0.5">
                            <p className="text-slate-800 dark:text-white">{new Date(p.pickupDate).toLocaleDateString()}</p>
                            <span className="text-[10px] text-slate-400 flex items-center space-x-1"><FaClock className="h-3 w-3" /> <span>{p.pickupTimeSlot}</span></span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {p.driver ? p.driver.user.name : <span className="text-slate-400">Unassigned</span>}
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {p.estimatedWeight}kg / {p.actualWeight ? `${p.actualWeight}kg` : '--'}
                        </td>
                        <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                          {p.pointsAwarded ? `+${p.pointsAwarded}` : '--'}
                        </td>
                        <td className="py-4 px-6 text-right">{getStatusBadge(p.status)}</td>
                      </tr>
                    ))}
                    {pickups.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-6 text-slate-400">No pickup requests registered.</td>
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

export default AdminPickups;
