import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaUsers, FaTruck, FaClipboardCheck, FaCoins, FaCheck, FaTimes, FaTools, FaAngleRight } from 'react-icons/fa';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [analytics, setAnalytics] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState(null);

  // Settings Forms
  const [basePoints, setBasePoints] = useState(5);
  const [systemMaintenance, setSystemMaintenance] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [analyticsRes, driverRes, settingsRes, pickupRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/drivers'),
        api.get('/admin/settings'),
        api.get('/admin/pickups')
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (driverRes.data.success) setDrivers(driverRes.data.data);
      if (settingsRes.data.success) {
        setSettings(settingsRes.data.data);
        setBasePoints(settingsRes.data.data.basePoints || 5);
        setSystemMaintenance(settingsRes.data.data.systemMaintenance || false);
      }
      if (pickupRes.data.success) setPickups(pickupRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Real-Time Socket Refresh for Admin
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      fetchAdminData();
    }
  }, [realtimeData?.latestPickup]);

  const handleApproveDriver = async (id) => {
    try {
      const res = await api.put(`/admin/drivers/${id}/approve`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve driver.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/settings', {
        basePoints,
        systemMaintenance
      });
      if (res.data.success) {
        setSettings(res.data.data);
        addToast('System configurations saved successfully!', 'success', 'Settings Saved');
      }
    } catch (err) {
      setError('Failed to save settings.');
    }
  };

  const pendingDrivers = drivers.filter(d => !d.isApproved);
  const totalWeight = analytics?.metrics?.totalWeightCollected || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitor global waste quantities, B2B revenues, driver registrations, and point systems.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            /* Admin Metrics Cards */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <FaUsers className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                    {analytics?.metrics?.totalUsers.toLocaleString()}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Recycling Users</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                  <FaTruck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                    {analytics?.metrics?.totalDrivers.toLocaleString()}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Registered Drivers</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FaClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                    {analytics?.metrics?.totalPickups.toLocaleString()}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Total Pickups</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <FaCoins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                    ₹{analytics?.metrics?.totalRevenue.toLocaleString()}
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Eco Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin charts & approval grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Cols - Waste collected stats and recent history */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Waste Bar Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <FaRecycle className="text-emerald-500 animate-spin-slow" />
                  <span>Waste Collected by Category (kg)</span>
                </h3>
                
                {analytics ? (
                  <div className="h-48 flex items-end justify-between space-x-2 pt-6 overflow-visible">
                    {Object.entries(analytics.wasteCollected).map(([cat, val]) => {
                      const maxVal = Math.max(...Object.values(analytics.wasteCollected)) || 1;
                      const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));

                      const barColors = {
                        Plastic: 'bg-emerald-500',
                        Paper: 'bg-sky-500',
                        Metal: 'bg-indigo-500',
                        Glass: 'bg-amber-500',
                        Organic: 'bg-lime-500',
                        'E-Waste': 'bg-rose-500'
                      };

                      return (
                        <div key={cat} className="flex-1 flex flex-col items-center group relative">
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 bg-slate-950 text-white text-[9px] font-bold px-2 py-0.5 rounded transition-opacity pointer-events-none">{val} kg</span>
                          <div className={`w-full rounded-t-lg ${barColors[cat]} transition-all duration-700`} style={{ height: `${heightPercent || 5}%` }}></div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pt-2 truncate max-w-[45px]">{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                )}
              </div>

              {/* Drivers Approval Queue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Pending Driver Approvals ({pendingDrivers.length})</h3>
                
                <div className="space-y-3">
                  {pendingDrivers.map((driver) => (
                    <div key={driver._id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-850 dark:text-slate-250 text-sm">{driver.user.name}</p>
                        <p className="text-slate-400 font-semibold">{driver.user.email}</p>
                        <span className="text-[10px] text-slate-400 block pt-1 font-semibold">{driver.vehicleType} • Code: {driver.vehicleNumber}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleApproveDriver(driver._id)}
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                      >
                        Approve License
                      </button>
                    </div>
                  ))}
                  {pendingDrivers.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-4">No driver registration files pending review.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col - Settings & Operations configs */}
            <div className="space-y-6">
              
              {/* Configuration panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                  <FaTools className="text-primary-500" />
                  <span>Configure Settings</span>
                </h3>
                
                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 font-bold uppercase tracking-wider block">Base Reward Points</label>
                    <input 
                      type="number" 
                      value={basePoints} 
                      onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                    />
                  </div>
                  
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={systemMaintenance} 
                      onChange={(e) => setSystemMaintenance(e.target.checked)}
                      className="h-4.5 w-4.5 rounded border-slate-350 text-primary-500 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">Set System Maintenance Mode</span>
                  </label>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>

              {/* Recent Activity list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">Recent Pickup Activities</h3>
                <div className="space-y-3">
                  {pickups.map((p) => (
                    <div key={p._id} className="text-xs p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{p.user.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'}`}>
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{p.wasteCategory} • Est. {p.estimatedWeight}kg</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
