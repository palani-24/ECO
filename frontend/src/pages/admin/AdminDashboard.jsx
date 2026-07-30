import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { 
  FaRecycle, FaUsers, FaTruck, FaClipboardCheck, 
  FaCoins, FaCheck, FaTimes, FaTools, FaComments, FaReply, FaPaperPlane, FaUserShield 
} from 'react-icons/fa';

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

  // Admin Support Messages Inbox State
  const [supportMessages, setSupportMessages] = useState([]);
  const [replyingMsgId, setReplyingMsgId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [supportFilter, setSupportFilter] = useState('all'); // 'all' | 'pending' | 'replied'

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

  const fetchSupportMessages = async () => {
    try {
      const res = await api.get('/support/admin/all');
      if (res.data.success) {
        setSupportMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchSupportMessages();

    // Socket listener for new incoming support messages
    const handleNewSupportMsg = (newMsg) => {
      addToast(`💬 New Support Message from ${newMsg.user?.name || 'User'}!`, 'info', 'Incoming Support Ticket');
      setSupportMessages(prev => [newMsg, ...prev]);
    };

    if (window.socket) {
      window.socket.on('support:new', handleNewSupportMsg);
    }

    return () => {
      if (window.socket) {
        window.socket.off('support:new', handleNewSupportMsg);
      }
    };
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
        addToast('Driver approved successfully!', 'success', 'Driver Approved');
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

  const handleSendReply = async (msgId) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await api.put(`/support/admin/reply/${msgId}`, { replyText });
      if (res.data.success) {
        addToast('Reply sent to user successfully!', 'success', 'Reply Delivered');
        setReplyText('');
        setReplyingMsgId(null);
        fetchSupportMessages();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send reply', 'error', 'Error');
    } finally {
      setSendingReply(false);
    }
  };

  const pendingDrivers = drivers.filter(d => !d.isApproved);
  const pendingSupportCount = supportMessages.filter(m => m.status === 'pending').length;

  const filteredSupportMessages = supportMessages.filter(m => {
    if (supportFilter === 'pending') return m.status === 'pending';
    if (supportFilter === 'replied') return m.status === 'replied';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Dashboard & Command Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitor global recycling metrics, user support inquiries, driver licenses, and system settings.</p>
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
                  <FaComments className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">
                    {pendingSupportCount} <span className="text-xs font-normal text-slate-400">/ {supportMessages.length}</span>
                  </span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Support Inquiries</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Cols - Waste chart, Driver approvals, & Live User Support Inbox */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* ADMIN USER SUPPORT MESSAGES & REPLIES INBOX */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
                      <FaComments />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">User Support Messages & Live Replies</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Respond to user inquiries in real time</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setSupportFilter('all')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        supportFilter === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      All ({supportMessages.length})
                    </button>
                    <button
                      onClick={() => setSupportFilter('pending')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        supportFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      Pending ({pendingSupportCount})
                    </button>
                    <button
                      onClick={() => setSupportFilter('replied')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        supportFilter === 'replied' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                      }`}
                    >
                      Replied
                    </button>
                  </div>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                  {filteredSupportMessages.map((msg) => (
                    <div key={msg._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={msg.user?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'} 
                            alt="User Avatar"
                            className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700" 
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center space-x-2">
                              <span>{msg.user?.name || 'Anonymous User'}</span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-750 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">{msg.user?.role || msg.senderRole}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold">{msg.user?.email || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            msg.status === 'replied' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                            {msg.status === 'replied' ? '✓ Replied' : '⏳ Pending Admin Reply'}
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium block">
                            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-1 text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                          Subject: {msg.subject}
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium">{msg.message}</p>
                      </div>

                      {/* Existing Reply display if present */}
                      {msg.adminReply && (
                        <div className="ml-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                          <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                            <FaReply className="h-3 w-3" />
                            <span>Your Admin Reply:</span>
                          </span>
                          <p className="text-slate-900 dark:text-slate-100 font-bold">{msg.adminReply}</p>
                        </div>
                      )}

                      {/* Reply Action Button / Form */}
                      {replyingMsgId === msg._id ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/40 space-y-2 animate-fadeIn">
                          <textarea
                            rows="2"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type reply message to ${msg.user?.name}...`}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingMsgId(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReply(msg._id)}
                              disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-lg shadow flex items-center space-x-1.5 disabled:opacity-40"
                            >
                              <FaPaperPlane className="h-3 w-3" />
                              <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingMsgId(msg._id);
                              setReplyText(msg.adminReply || '');
                            }}
                            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5"
                          >
                            <FaReply className="h-3 w-3 text-emerald-500" />
                            <span>{msg.adminReply ? 'Edit Reply' : 'Reply to User'}</span>
                          </button>
                        </div>
                      )}

                    </div>
                  ))}

                  {filteredSupportMessages.length === 0 && (
                    <div className="text-center py-8 text-xs font-bold text-slate-400">
                      No support inquiries found in this category.
                    </div>
                  )}
                </div>
              </div>

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

            </div>

            {/* Right Col - Settings & Pending Drivers */}
            <div className="space-y-6">
              
              {/* Top Drivers Leaderboard Widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-2">
                    <FaTruck className="text-emerald-500" />
                    <span>Top Performing Drivers</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase text-emerald-500">Live Ranks</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" alt="Driver" className="h-8 w-8 rounded-xl object-cover" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">Ramesh Kumar</p>
                        <span className="text-[10px] text-slate-400 font-semibold">250 Orders Completed</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-black text-[10px]">
                      ⭐ 4.9
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Driver" className="h-8 w-8 rounded-xl object-cover" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">Karthik M</p>
                        <span className="text-[10px] text-slate-400 font-semibold">210 Orders Completed</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-black text-[10px]">
                      ⭐ 4.8
                    </span>
                  </div>
                </div>
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

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
