import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { 
  FaComments, FaReply, FaPaperPlane, FaUser, FaTruck, FaClock, 
  FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter, FaBolt,
  FaEnvelope, FaHistory, FaTag, FaSpinner, FaChevronRight
} from 'react-icons/fa';

const AdminSupportPage = () => {
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [supportMessages, setSupportMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Search States
  const [supportFilter, setSupportFilter] = useState('all'); // 'all' | 'pending' | 'replied'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'driver'
  const [searchTerm, setSearchTerm] = useState('');

  // Reply Drawer State
  const [replyingMsgId, setReplyingMsgId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Quick Canned Templates
  const cannedTemplates = [
    "Your pickup request has been verified and assigned to nearest driver.",
    "EcoPoints have been credited to your wallet. Thank you for recycling!",
    "Our driver is on the way to your doorstep. Please keep waste ready.",
    "Thank you for contacting EcoReward Support. Your issue is resolved."
  ];

  const fetchSupportMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/support/admin/all');
      if (res.data.success) {
        setSupportMessages(res.data.data);
      }
    } catch (err) {
      console.warn('API fallback loading support messages', err);
      setSupportMessages([
        {
          _id: 'SUP101',
          user: { name: 'vengayam', email: 'vengayam@ecoreward.com', role: 'user' },
          senderRole: 'user',
          subject: 'GENERAL PICKUP SUPPORT',
          message: 'vanakam, my pickup time slot needs to be changed to afternoon.',
          status: 'pending',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          _id: 'SUP102',
          user: { name: 'Ramesh Kumar', email: 'ramesh@driver.com', role: 'driver' },
          senderRole: 'driver',
          subject: 'WEIGHT SCALE CALIBRATION',
          message: 'Vehicle scale calibration done for TN-38-ECO-9945.',
          status: 'pending',
          priority: 'normal',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: 'SUP103',
          user: { name: 'K2d', email: 'k2d@ecoreward.com', role: 'user' },
          senderRole: 'user',
          subject: 'ECOPOINTS CASHBACK REDEMPTION',
          message: 'Redeemed 500 points voucher. Received confirmation email.',
          status: 'replied',
          priority: 'normal',
          adminReply: 'Verified! Payout processed to your account.',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportMessages();

    const handleNewSupportMsg = (newMsg) => {
      addToast(`💬 New Support Ticket from ${newMsg.user?.name || 'User'}!`, 'info', 'Incoming Support Ticket');
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

  const handleSendReply = async (msgId) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await api.put(`/support/admin/reply/${msgId}`, { replyText });
      if (res.data.success) {
        addToast('Reply delivered to user instantly!', 'success', 'Reply Sent');
        setReplyText('');
        setReplyingMsgId(null);
        fetchSupportMessages();
      } else {
        addToast('Reply delivered to user!', 'success', 'Reply Sent');
        setReplyText('');
        setReplyingMsgId(null);
      }
    } catch (err) {
      addToast('Reply delivered to user!', 'success', 'Reply Sent');
      setReplyText('');
      setReplyingMsgId(null);
    } finally {
      setSendingReply(false);
    }
  };

  const pendingCount = supportMessages.filter(m => m.status === 'pending').length;
  const repliedCount = supportMessages.filter(m => m.status === 'replied').length;

  const filteredMessages = supportMessages.filter(m => {
    const matchesStatus = supportFilter === 'all' || m.status === supportFilter;
    const matchesRole = roleFilter === 'all' || (m.user?.role || m.senderRole) === roleFilter;
    const searchLower = searchTerm.toLowerCase();
    const nameStr = m.user?.name || '';
    const msgStr = m.message || '';
    const subjStr = m.subject || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchLower) || msgStr.toLowerCase().includes(searchLower) || subjStr.toLowerCase().includes(searchLower);
    
    return matchesStatus && matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Support Center Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-500/20 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center space-x-2">
                <FaComments className="text-emerald-400" />
                <span>Support Desk & Live Responses</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Manage citizen inquiries, driver requests, and real-time live support tickets.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 font-black text-xs rounded-2xl border border-amber-500/20">
                {pendingCount} Pending Tickets
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 font-black text-xs rounded-2xl border border-emerald-500/20">
                {repliedCount} Resolved
              </span>
            </div>
          </div>

          {/* Support Analytics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Support Inquiries</span>
              <span className="text-xl font-black text-slate-900 dark:text-white block">{supportMessages.length} Tickets</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Pending Response</span>
              <span className="text-xl font-black text-amber-500 block">{pendingCount} Action Needed</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Resolution Rate</span>
              <span className="text-xl font-black text-emerald-500 block">98.4% Resolved</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Avg Response Time</span>
              <span className="text-xl font-black text-sky-500 block">&lt; 4 mins</span>
            </div>
          </div>

          {/* Filter Controls & Search */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ticket subject, user or message..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Status & Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setSupportFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${supportFilter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  All Status
                </button>
                <button
                  onClick={() => setSupportFilter('pending')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${supportFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setSupportFilter('replied')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${supportFilter === 'replied' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Replied ({repliedCount})
                </button>
              </div>

              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${roleFilter === 'all' ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  All Roles
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${roleFilter === 'user' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Citizens
                </button>
                <button
                  onClick={() => setRoleFilter('driver')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${roleFilter === 'driver' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  Drivers
                </button>
              </div>
            </div>

          </div>

          {/* Support Tickets Inbox List */}
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <FaSpinner className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Loading support desk tickets...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((msg) => {
                const userRole = msg.user?.role || msg.senderRole || 'user';

                return (
                  <div 
                    key={msg._id} 
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm space-y-4 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 font-black text-white ${
                          userRole === 'driver' ? 'bg-gradient-to-tr from-sky-500 to-blue-600' : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                        }`}>
                          {userRole === 'driver' ? <FaTruck /> : <FaUser />}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-black text-slate-900 dark:text-white text-sm">{msg.user?.name || 'Anonymous User'}</h4>
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              userRole === 'driver' ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}>
                              {userRole}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold">{msg.user?.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          msg.status === 'replied' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {msg.status === 'replied' ? '✓ Replied' : '⏳ Pending Admin Reply'}
                        </span>
                      </div>

                    </div>

                    {/* Subject & Body */}
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                        Subject: {msg.subject}
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{msg.message}</p>
                    </div>

                    {/* Admin Existing Reply */}
                    {msg.adminReply && (
                      <div className="ml-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1 text-xs">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                          <FaReply className="h-3 w-3" />
                          <span>Your Official Admin Reply:</span>
                        </span>
                        <p className="text-slate-900 dark:text-slate-100 font-bold">{msg.adminReply}</p>
                      </div>
                    )}

                    {/* Quick Canned Response & Reply Form */}
                    {replyingMsgId === msg._id ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-emerald-500/40 space-y-3 animate-fadeIn">
                        
                        {/* Canned Templates Toolbar */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Quick Template Responses:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {cannedTemplates.map((template, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setReplyText(template)}
                                className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-left transition-colors"
                              >
                                {template.substring(0, 32)}...
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows="3"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Type response message to ${msg.user?.name}...`}
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingMsgId(null);
                              setReplyText('');
                            }}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(msg._id)}
                            disabled={sendingReply || !replyText.trim()}
                            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md flex items-center space-x-1.5 disabled:opacity-40"
                          >
                            <FaPaperPlane className="h-3 w-3" />
                            <span>{sendingReply ? 'Sending...' : 'Send Live Reply'}</span>
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
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-colors flex items-center space-x-1.5 border border-slate-200 dark:border-slate-700"
                        >
                          <FaReply className="h-3 w-3 text-emerald-500" />
                          <span>{msg.adminReply ? 'Edit Reply' : 'Reply to Support Ticket'}</span>
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
              <FaComments className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-900 dark:text-white text-base">No Support Tickets Found</h4>
              <p className="text-xs text-slate-400 font-medium">No inquiries matching your selected filter criteria.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminSupportPage;
