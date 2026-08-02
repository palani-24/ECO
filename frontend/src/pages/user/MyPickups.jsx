import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes, FaFileInvoice, FaEye } from 'react-icons/fa';

const MyPickups = () => {
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  // Real-Time Socket Updates Sync
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      const updatedPickup = realtimeData.latestPickup;
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updatedPickup._id);
        if (index !== -1) {
          const newPickups = [...prev];
          newPickups[index] = { ...newPickups[index], ...updatedPickup };
          return newPickups;
        }
        return [updatedPickup, ...prev];
      });
    }
  }, [realtimeData?.latestPickup]);

  // In-App Chat Modal States
  const [chatPickup, setChatPickup] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Hello! I am on my way for your waste pickup. / வணக்கம்! சேகரிக்க வந்து கொண்டு இருக்கிறேன்.', time: '10:15 AM' }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput, time: 'Just now' }]);
    setChatInput('');
  };

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

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">My Pickups & History</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track active recycling requests and review past completed history in one place.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              {['all', 'active', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab === 'all' ? `All (${pickups.length})` : tab === 'active' ? `Active (${pickups.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length})` : `Completed (${pickups.filter(p => p.status === 'completed').length})`}
                </button>
              ))}
            </div>
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
                        <th className="py-4 px-6">Handover OTP</th>
                        <th className="py-4 px-6">Est. Weight</th>
                        <th className="py-4 px-6">Points</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                      {pickups
                        .filter(p => {
                          if (statusFilter === 'all') return true;
                          if (statusFilter === 'active') return p.status === 'pending' || p.status === 'assigned' || p.status === 'accepted';
                          if (statusFilter === 'completed') return p.status === 'completed';
                          return true;
                        })
                        .map((p) => (
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
                          <td className="py-4 px-6 font-mono font-bold">
                            {p.status !== 'completed' && p.status !== 'cancelled' ? (
                              <span className="px-2 py-1 bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-black">
                                OTP: 4829
                              </span>
                            ) : (
                              <span className="text-slate-400">Verified</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold">{p.estimatedWeight} kg</td>
                          <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {p.pointsAwarded ? `+${p.pointsAwarded}` : '--'}
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                          <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                            {p.driver && p.status !== 'completed' && (
                              <button 
                                onClick={() => setChatPickup(p)}
                                className="px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 rounded-lg text-[10px] font-bold"
                              >
                                💬 Chat Driver
                              </button>
                            )}
                            {p.status === 'completed' && (
                              <button 
                                onClick={() => setSelectedReceipt(p)}
                                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors inline-flex items-center space-x-1"
                                title="View Receipt"
                              >
                                <FaFileInvoice />
                                <span className="text-[10px] font-bold">Receipt</span>
                              </button>
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

                <div className="flex gap-2">
                  <button 
                    onClick={() => addToast('📄 Official Eco Receipt PDF downloaded successfully!', 'success', 'PDF Export')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-colors text-xs"
                  >
                    Download PDF Receipt
                  </button>
                  <button 
                    onClick={() => setSelectedReceipt(null)}
                    className="py-3 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Driver Chat Modal */}
          {chatPickup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💬</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Collector Driver Chat</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{chatPickup.driver?.user?.name || 'Driver'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatPickup(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Messages Box */}
                <div className="h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender === 'user' 
                            ? 'bg-emerald-600 text-white font-medium rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-bold">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Preset Tamil / English Quick Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button 
                    type="button"
                    onClick={() => setChatMessages(prev => [...prev, { sender: 'user', text: 'கதவு அருகே பை வைத்துள்ளேன் (Left bag near security gate)', time: 'Just now' }])}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    📍 Left at Gate
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChatMessages(prev => [...prev, { sender: 'user', text: 'நான் வீட்டில் உள்ளேன் (I am at home)', time: 'Just now' }])}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    🏠 I am at Home
                  </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Type message in Tamil or English..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default MyPickups;
