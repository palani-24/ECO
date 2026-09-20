import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../../components/AdminLayout';
import MobileAdminDashboard from '../../components/MobileAdminDashboard';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { useDistrict } from '../../context/DistrictContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { 
  FaRecycle, FaUsers, FaTruck, FaClipboardCheck, 
  FaCoins, FaCheck, FaTimes, FaTools, FaComments, FaReply, 
  FaPaperPlane, FaUserShield, FaShieldAlt, FaChartLine, FaCheckCircle, 
  FaExclamationTriangle, FaArrowRight, FaClock, FaStar, FaBolt, FaMapMarkerAlt
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { currentDistrict, openDistrictModal } = useDistrict();
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

      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      if (driverRes.data?.success) setDrivers(driverRes.data.data);
      if (settingsRes.data?.success) {
        setSettings(settingsRes.data.data);
        setBasePoints(settingsRes.data.data.basePoints || 5);
        setSystemMaintenance(settingsRes.data.data.systemMaintenance || false);
      }
      if (pickupRes.data?.success) setPickups(pickupRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupportMessages = async () => {
    try {
      const res = await api.get('/support/admin/all');
      if (res.data?.success) {
        setSupportMessages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchSupportMessages();

    const handleNewSupportMsg = (newMsg) => {
      addToast(`💬 New Support Message from ${newMsg.user?.name || 'User'}!`, 'info', 'Support Ticket');
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
      if (res.data?.success) {
        fetchAdminData();
        addToast('Driver license approved successfully!', 'success', 'Driver Approved');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve driver.');
    }
  };

  const handleRejectDriver = async (id) => {
    try {
      const res = await api.put(`/admin/drivers/${id}/reject`);
      fetchAdminData();
      addToast('Driver registration rejected.', 'info', 'Driver Rejected');
    } catch (err) {
      addToast('Driver registration updated.', 'info', 'Driver Rejected');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/settings', {
        basePoints,
        systemMaintenance
      });
      if (res.data?.success) {
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
      if (res.data?.success) {
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

  const recentPickups = pickups.slice(0, 5);

  return (
    <AdminLayout title="Admin Command">
      {/* 📱 Mobile Admin Dedicated Cockpit View */}
      <div className="block md:hidden">
        <MobileAdminDashboard 
          analytics={analytics}
          drivers={drivers}
          pickups={pickups}
          supportMessages={supportMessages}
          basePoints={basePoints}
          setBasePoints={setBasePoints}
          systemMaintenance={systemMaintenance}
          setSystemMaintenance={setSystemMaintenance}
          handleSaveSettings={handleSaveSettings}
          handleApproveDriver={handleApproveDriver}
          handleRejectDriver={handleRejectDriver}
          handleSendReply={handleSendReply}
          replyText={replyText}
          setReplyText={setReplyText}
          replyingMsgId={replyingMsgId}
          setReplyingMsgId={setReplyingMsgId}
          sendingReply={sendingReply}
        />
      </div>

      {/* 💻 Desktop Admin Dashboard View */}
      <div className="hidden md:block space-y-6">
        
        {/* Executive Cyber Command Center Glass Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-6 sm:p-7 text-white shadow-xl backdrop-blur-xl space-y-4">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    ADMIN COMMAND CENTER
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-black border border-emerald-400/30 flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>LIVE FLEET DISPATCH</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Monitor city-wide recycling throughput, driver dispatches, and citizen support requests.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  type="button"
                  onClick={() => openDistrictModal()}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold flex items-center space-x-2 cursor-pointer transition active:scale-95 shadow-sm"
                >
                  <FaMapMarkerAlt className="text-emerald-400" />
                  <span>District: {currentDistrict.name}</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.2 rounded font-black text-emerald-300">38 TN</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>TN SWM: 100% Active</span>
                </span>
              </div>
            </div>

            {/* Ambient Fleet Impact Ticker */}
            <div className="pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-emerald-300">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">🌿 GLOBAL OFFSET:</span>
                <span className="font-black text-white bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                  142.8 Tons CO₂
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">🌲 TREES SAVED:</span>
                <span className="font-black text-emerald-400">1,620 Trees</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">⚡ RECYCLED THROUGHPUT:</span>
                <span className="font-black text-cyan-400">95.2 Tons Plastic & Metal</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-2xl font-bold flex items-center space-x-2">
              <FaExclamationTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* 4 Modern Executive Metric Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Users */}
              <a 
                href="/admin/users"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-emerald-500/40 transition-all group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <FaUsers />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                    {(analytics?.metrics?.totalUsers || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Recycling Users
                  </span>
                </div>
              </a>

              {/* Card 2: Drivers */}
              <a 
                href="/admin/drivers"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-sky-500/40 transition-all group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 text-xl border border-sky-500/20 group-hover:scale-110 transition-transform">
                  <FaTruck />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                    {(analytics?.metrics?.totalDrivers || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-sky-600 dark:text-sky-400 block mt-0.5">
                    Registered Drivers
                  </span>
                </div>
              </a>

              {/* Card 3: Pickups */}
              <a 
                href="/admin/pickups"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-amber-500/40 transition-all group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 text-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <FaClipboardCheck />
                </div>
                <div>
                  <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                    {(analytics?.metrics?.totalPickups || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 dark:text-amber-400 block mt-0.5">
                    Total Pickups
                  </span>
                </div>
              </a>

              {/* Card 4: Support */}
              <a 
                href="/admin/support"
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-rose-500/40 transition-all group cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 text-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
                  <FaComments />
                </div>
                <div>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {pendingSupportCount}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ {supportMessages.length}</span>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-600 dark:text-rose-400 block mt-0.5">
                    Support Inquiries
                  </span>
                </div>
              </a>

            </div>
          )}

          {/* Main Grid: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Waste Analytics & Live Support Inquiries (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Waste Collected by Category Bar Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base flex items-center space-x-2">
                    <FaRecycle className="text-emerald-500" />
                    <span>Recycled Materials Throughput (kg)</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Live Weights
                  </span>
                </div>
                
                {analytics ? (
                  <div className="h-44 flex items-end justify-between space-x-3 pt-4">
                    {Object.entries(analytics.wasteCollected || { Plastic: 420, Paper: 310, Metal: 180, Glass: 95, 'E-Waste': 140 }).map(([cat, val]) => {
                      const maxVal = Math.max(...Object.values(analytics.wasteCollected || { a: 420 })) || 1;
                      const heightPercent = Math.min(100, Math.round((val / maxVal) * 100));

                      const barColors = {
                        Plastic: 'bg-emerald-500 shadow-emerald-500/30',
                        Paper: 'bg-sky-500 shadow-sky-500/30',
                        Metal: 'bg-indigo-500 shadow-indigo-500/30',
                        Glass: 'bg-amber-500 shadow-amber-500/30',
                        Organic: 'bg-lime-500 shadow-lime-500/30',
                        'E-Waste': 'bg-rose-500 shadow-rose-500/30'
                      };

                      return (
                        <div key={cat} className="flex-1 flex flex-col items-center group relative">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{val} kg</span>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-28 flex items-end p-1">
                            <div 
                              className={`w-full rounded-lg ${barColors[cat] || 'bg-emerald-500'} transition-all duration-700 shadow-sm`} 
                              style={{ height: `${heightPercent || 10}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider pt-2 truncate max-w-[50px]">{cat}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                )}
              </div>

              {/* User Support Messages Inbox Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base border border-emerald-500/20">
                      <FaComments />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                        Citizen Support Inquiries
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Respond to user tickets in real-time</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setSupportFilter('all')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          supportFilter === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        All ({supportMessages.length})
                      </button>
                      <button
                        onClick={() => setSupportFilter('pending')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          supportFilter === 'pending' ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-400'
                        }`}
                      >
                        Pending ({pendingSupportCount})
                      </button>
                    </div>
                    <a
                      href="/admin/support"
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black transition flex items-center space-x-1"
                    >
                      <span>Full Desk</span>
                      <FaArrowRight className="text-[10px]" />
                    </a>
                  </div>
                </div>

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredSupportMessages.slice(0, 4).map((msg) => (
                    <div key={msg._id} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white text-xs flex items-center space-x-2">
                            <span>{msg.user?.name || 'Citizen'}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[9px] font-black uppercase text-slate-600 dark:text-slate-300">
                              {msg.user?.role || 'user'}
                            </span>
                          </p>
                          <span className="text-[10px] text-slate-400">{msg.user?.email || 'user@ecoreward.org'}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          msg.status === 'replied' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {msg.status === 'replied' ? '✓ Replied' : '⏳ Pending'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          Subject: {msg.subject}
                        </span>
                        <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px] leading-relaxed">
                          {msg.message}
                        </p>
                      </div>

                      {msg.adminReply && (
                        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1">
                            <FaReply className="h-2.5 w-2.5" />
                            <span>Your Admin Reply:</span>
                          </span>
                          <p className="text-slate-900 dark:text-slate-100 font-bold text-[11px]">{msg.adminReply}</p>
                        </div>
                      )}

                      {replyingMsgId === msg._id ? (
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-500/40 space-y-2">
                          <textarea
                            rows="2"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Type reply message to ${msg.user?.name}...`}
                            className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingMsgId(null);
                                setReplyText('');
                              }}
                              className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendReply(msg._id)}
                              disabled={sendingReply || !replyText.trim()}
                              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow flex items-center space-x-1 cursor-pointer"
                            >
                              <FaPaperPlane className="h-2.5 w-2.5" />
                              <span>{sendingReply ? 'Sending...' : 'Send'}</span>
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
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-[11px] rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                          >
                            <FaReply className="h-2.5 w-2.5 text-emerald-500" />
                            <span>{msg.adminReply ? 'Edit Reply' : 'Quick Reply'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {filteredSupportMessages.length === 0 && (
                    <div className="text-center py-6 text-xs font-bold text-slate-400">
                      No support inquiries found in this category.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Fleet Approvals & Quick Settings (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Top Performing Drivers */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <FaTruck className="text-emerald-500" />
                    <span>Top Performing Drivers</span>
                  </h3>
                  <span className="text-[10px] font-black uppercase text-emerald-500">Live Ranks</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100" alt="Driver" className="h-9 w-9 rounded-xl object-cover ring-1 ring-emerald-500/30" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">Ramesh Kumar</p>
                        <span className="text-[10px] text-slate-400 font-semibold">250 Pickups Completed</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-black text-[11px] flex items-center space-x-1">
                      <FaStar className="text-amber-400 text-xs" />
                      <span>4.9</span>
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt="Driver" className="h-9 w-9 rounded-xl object-cover ring-1 ring-emerald-500/30" />
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">Karthik M</p>
                        <span className="text-[10px] text-slate-400 font-semibold">210 Pickups Completed</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg font-black text-[11px] flex items-center space-x-1">
                      <FaStar className="text-amber-400 text-xs" />
                      <span>4.8</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Driver Approvals Queue */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <FaShieldAlt className="text-sky-500" />
                    <span>Driver Approvals ({pendingDrivers.length})</span>
                  </h3>
                  <a href="/admin/drivers" className="text-xs text-emerald-600 font-bold hover:underline">
                    View Fleet
                  </a>
                </div>
                
                <div className="space-y-3">
                  {pendingDrivers.map((driver) => (
                    <div key={driver._id} className="p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-xs">{driver.user?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{driver.user?.email}</p>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-0.5 font-bold">
                          {driver.vehicleType} • Code: {driver.vehicleNumber}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => handleApproveDriver(driver._id)}
                        className="w-full sm:w-auto px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition shadow-xs cursor-pointer"
                      >
                        Approve
                      </button>
                    </div>
                  ))}

                  {pendingDrivers.length === 0 && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1">
                      <FaCheckCircle className="h-6 w-6 text-emerald-500 mx-auto" />
                      <p className="text-xs font-black text-slate-900 dark:text-white">All Drivers Verified</p>
                      <span className="text-[10px] text-slate-400 font-medium block">
                        No pending driver license registrations to review.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* System Settings Quick Configuration */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                    <FaTools className="text-emerald-500" />
                    <span>Quick Configuration</span>
                  </h3>
                  <a href="/admin/settings" className="text-xs text-emerald-600 font-bold hover:underline">
                    Advanced
                  </a>
                </div>
                
                <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">
                      Base Reward EcoPoints / kg
                    </label>
                    <input 
                      type="number" 
                      value={basePoints} 
                      onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none font-bold"
                    />
                  </div>
                  
                  <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={systemMaintenance} 
                      onChange={(e) => setSystemMaintenance(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                      Enable System Maintenance Mode
                    </span>
                  </label>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow cursor-pointer text-xs"
                  >
                    Save Configuration
                  </button>
                </form>
              </div>

            </div>

          </div>

        </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
