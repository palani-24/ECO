import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes, FaFileInvoice, FaEye } from 'react-icons/fa';

const MyPickups = () => {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await api.get('/user/pickups');
        if (res.data.success) {
          setPickups(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch pickup records.');
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
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Pickup History</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track and review all recycling requests scheduled on your account.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20 flex items-center space-x-1">
              <FaExclamationTriangle /> <span>{error}</span>
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40">
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Scheduled Details</th>
                      <th className="py-4 px-6">Est. Weight</th>
                      <th className="py-4 px-6">Actual Weight</th>
                      <th className="py-4 px-6">Points Awarded</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                    {pickups.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
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
                        <td className="py-4 px-6 font-semibold">{p.estimatedWeight} kg</td>
                        <td className="py-4 px-6 font-semibold">{p.actualWeight ? `${p.actualWeight} kg` : '--'}</td>
                        <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                          {p.pointsAwarded ? `+${p.pointsAwarded}` : '--'}
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                        <td className="py-4 px-6 text-right">
                          {p.status === 'completed' ? (
                            <button 
                              onClick={() => setSelectedReceipt(p)}
                              className="p-2 text-slate-400 hover:text-emerald-500 transition-colors inline-flex items-center space-x-1"
                              title="View Receipt"
                            >
                              <FaFileInvoice />
                              <span className="text-[10px] font-bold">Receipt</span>
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[10px]">--</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {pickups.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">No scheduled pickup requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Receipt Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-[420px] space-y-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">Recycling Receipt</h3>
                    <span className="text-[10px] font-bold text-slate-400">{selectedReceipt.receiptUrl}</span>
                  </div>
                  <FaRecycle className="h-8 w-8 text-emerald-500" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Customer:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Collector Driver:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedReceipt.driver?.user?.name || 'Assigned Driver'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Processed Waste:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{selectedReceipt.wasteCategory} ({selectedReceipt.actualWeight} kg)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Material Purity Code:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedReceipt.wasteAnalysis?.qualityScore}% Pure</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-400">Completion Time:</span>
                    <span className="font-bold text-slate-850 dark:text-white">{new Date(selectedReceipt.completedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-400">
                  <span className="font-extrabold">Points Credited:</span>
                  <span className="font-black text-lg">+{selectedReceipt.pointsAwarded} Points</span>
                </div>

                <button 
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MyPickups;
