import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaTruck, FaCheck, FaInfoCircle } from 'react-icons/fa';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/admin/drivers');
      if (res.data.success) {
        setDrivers(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch drivers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await api.put(`/admin/drivers/${id}/approve`);
      if (res.data.success) {
        fetchDrivers();
      }
    } catch (err) {
      setError('Failed to approve driver.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Registered Drivers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify driver profiles, vehicle specs, and accept licensing requests.</p>
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
                      <th className="py-4 px-6">Driver Name</th>
                      <th className="py-4 px-6">Vehicle details</th>
                      <th className="py-4 px-6">Vehicle Number</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Pickups</th>
                      <th className="py-4 px-6 text-right">Approval</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                    {drivers.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                        <td className="py-4 px-6 font-bold flex items-center space-x-3">
                          <img 
                            src={d.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.user.name)}&background=059669&color=fff`} 
                            alt={d.user.name} 
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <span>{d.user.name}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold">{d.vehicleType}</td>
                        <td className="py-4 px-6 font-mono font-bold text-slate-500">{d.vehicleNumber}</td>
                        <td className="py-4 px-6 capitalize">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                            d.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                              : d.status === 'busy' 
                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/20' 
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-bold">{d.totalPickupsCount} jobs</td>
                        <td className="py-4 px-6 text-right">
                          {d.isApproved ? (
                            <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <FaCheck /> <span>Approved</span>
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleApprove(d._id)}
                              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {drivers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-slate-400">No driver registrations found.</td>
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

export default AdminDrivers;
