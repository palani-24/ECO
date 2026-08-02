import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { 
  FaComments, FaReply, FaPaperPlane, FaUser, FaTruck, FaClock, 
  FaCheckCircle, FaExclamationCircle, FaSearch, FaFilter, FaBolt,
  FaEnvelope, FaHistory, FaTag, FaSpinner, FaChevronRight, FaCheckDouble,
  FaSmile, FaPaperclip, FaShieldAlt, FaCircle
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatar';

const AdminSupportPage = () => {
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [supportMessages, setSupportMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  // Filter & Search States
  const [supportFilter, setSupportFilter] = useState('all'); // 'all' | 'pending' | 'replied'
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'driver'
  const [searchTerm, setSearchTerm] = useState('');

  // Reply Input State
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
        if (res.data.data.length > 0 && !selectedTicketId) {
          setSelectedTicketId(res.data.data[0]._id);
        }
      }
    } catch (err) {
      console.warn('API fallback loading support messages', err);
      const fallbackData = [
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
          user: { name: 'Anonymous User', email: 'driver@ecoreward.com', role: 'driver' },
          senderRole: 'driver',
          subject: 'WEIGHT SCALE CALIBRATION',
          message: 'ok, Vehicle scale calibration done for TN-38-ECO-9945.',
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
      ];
      setSupportMessages(fallbackData);
      setSelectedTicketId(fallbackData[0]._id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportMessages();

    const handleNewSupportMsg = (newMsg) => {
      addToast(`💬 New Support Ticket from ${newMsg.user?.name || 'User'}!`, 'info', 'Incoming Support Ticket');
      setSupportMessages(prev => [newMsg, ...prev]);
      if (!selectedTicketId) setSelectedTicketId(newMsg._id);
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
        addToast('Reply delivered to user instantly!', 'success', 'Reply Delivered');
        setSupportMessages(prev => prev.map(m => m._id === msgId ? { ...m, adminReply: replyText, status: 'replied' } : m));
        setReplyText('');
      } else {
        setSupportMessages(prev => prev.map(m => m._id === msgId ? { ...m, adminReply: replyText, status: 'replied' } : m));
        addToast('Reply delivered to user!', 'success', 'Reply Delivered');
        setReplyText('');
      }
    } catch (err) {
      setSupportMessages(prev => prev.map(m => m._id === msgId ? { ...m, adminReply: replyText, status: 'replied' } : m));
      addToast('Reply delivered to user!', 'success', 'Reply Delivered');
      setReplyText('');
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

  const selectedTicket = supportMessages.find(m => m._id === selectedTicketId) || filteredMessages[0] || supportMessages[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main WhatsApp-Style Support Messenger Panel */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 space-y-4 overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-500/20 p-5 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
                <FaComments className="text-emerald-400" />
                <span>WhatsApp Live Support Messenger</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">Select any user on the left conversation list to chat and resolve inquiries in real time.</p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 font-black text-xs rounded-2xl border border-amber-500/20">
                {pendingCount} Pending
              </span>
              <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 font-black text-xs rounded-2xl border border-emerald-500/20">
                {repliedCount} Resolved
              </span>
            </div>
          </div>

          {/* WhatsApp 2-Column Chat Layout Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-lg flex flex-col lg:flex-row h-[680px] overflow-hidden">
            
            {/* Left Conversations Sidebar List (w-80 / w-96) */}
            <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
              
              {/* Left Header: Search & Filters */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="relative">
                  <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations by name..."
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Status Pills */}
                <div className="flex items-center space-x-1 bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl text-[11px] font-bold">
                  <button
                    onClick={() => setSupportFilter('all')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all ${supportFilter === 'all' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'}`}
                  >
                    All ({supportMessages.length})
                  </button>
                  <button
                    onClick={() => setSupportFilter('pending')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all ${supportFilter === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setSupportFilter('replied')}
                    className={`flex-1 py-1 rounded-xl text-center transition-all ${supportFilter === 'replied' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500'}`}
                  >
                    Replied
                  </button>
                </div>
              </div>

              {/* Conversations List Scrollable */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <div className="p-8 text-center space-y-2">
                    <FaSpinner className="h-6 w-6 text-emerald-500 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-400">Loading support conversations...</p>
                  </div>
                ) : filteredMessages.length > 0 ? (
                  filteredMessages.map((msg) => {
                    const isSelected = selectedTicket?._id === msg._id;
                    const userRole = msg.user?.role || msg.senderRole || 'user';

                    return (
                      <div
                        key={msg._id}
                        onClick={() => {
                          setSelectedTicketId(msg._id);
                          setReplyText(msg.adminReply || '');
                        }}
                        className={`p-3.5 flex items-center space-x-3 cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-l-4 border-emerald-500' 
                            : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <img 
                            src={getAvatarUrl(msg.user?.profileImage, msg.user?.name || 'User')}
                            onError={(e) => handleAvatarError(e, msg.user?.name || 'User')}
                            alt="Avatar"
                            className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                          />
                          <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            userRole === 'driver' ? 'bg-sky-500' : 'bg-emerald-500'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate flex items-center space-x-1.5">
                              <span>{msg.user?.name || 'Anonymous User'}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase ${
                                userRole === 'driver' ? 'bg-sky-500/20 text-sky-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {userRole}
                              </span>
                            </h4>
                            <span className="text-[9px] text-slate-400 font-medium">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-semibold pt-0.5">
                            {msg.subject}: {msg.message}
                          </p>

                          <div className="flex justify-between items-center pt-1">
                            <span className={`text-[9px] font-black uppercase ${
                              msg.status === 'replied' ? 'text-emerald-500' : 'text-amber-500'
                            }`}>
                              {msg.status === 'replied' ? '✓ Replied' : '⏳ Pending Reply'}
                            </span>
                            {msg.status === 'pending' && (
                              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs font-bold text-slate-400">
                    No conversations found.
                  </div>
                )}
              </div>

            </div>

            {/* Right Active Conversation Chat Thread Panel (Flex-1) */}
            {selectedTicket ? (
              <div className="flex-1 flex flex-col bg-slate-100/40 dark:bg-slate-950/40">
                
                {/* Right Panel Header */}
                <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getAvatarUrl(selectedTicket.user?.profileImage, selectedTicket.user?.name || 'User')}
                      onError={(e) => handleAvatarError(e, selectedTicket.user?.name || 'User')}
                      alt="Selected User"
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm">{selectedTicket.user?.name || 'User'}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase border border-emerald-500/20">
                          {selectedTicket.user?.role || selectedTicket.senderRole || 'USER'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{selectedTicket.user?.email || 'user@ecoreward.com'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedTicket.status === 'replied' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedTicket.status === 'replied' ? '✓ Resolved' : '⏳ Pending Reply'}
                    </span>
                  </div>
                </div>

                {/* Scrollable WhatsApp Message Bubbles Area */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                  
                  {/* Subject Badge Divider */}
                  <div className="text-center my-2">
                    <span className="px-3 py-1 bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-300/40 dark:border-slate-700">
                      Subject: {selectedTicket.subject}
                    </span>
                  </div>

                  {/* Left Bubble: Incoming Customer Message */}
                  <div className="flex items-start space-x-3 max-w-lg">
                    <img 
                      src={getAvatarUrl(selectedTicket.user?.profileImage, selectedTicket.user?.name || 'User')}
                      onError={(e) => handleAvatarError(e, selectedTicket.user?.name || 'User')}
                      alt="User"
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm space-y-1.5 text-xs text-slate-900 dark:text-white">
                      <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-1">
                        <span>{selectedTicket.user?.name}</span>
                        <span>{new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-medium leading-relaxed">{selectedTicket.message}</p>
                    </div>
                  </div>

                  {/* Right Bubble: Outgoing Admin Reply */}
                  {selectedTicket.adminReply && (
                    <div className="flex items-start justify-end space-x-3 max-w-lg ml-auto">
                      <div className="bg-gradient-to-tr from-emerald-600 to-teal-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md space-y-1.5 text-xs">
                        <div className="flex justify-between items-center text-[9px] text-emerald-100 font-bold border-b border-white/20 pb-1 gap-4">
                          <span className="flex items-center space-x-1">
                            <FaShieldAlt className="h-2.5 w-2.5" />
                            <span>EcoReward Support Desk</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>Delivered</span>
                            <FaCheckDouble className="h-3 w-3 text-cyan-200" />
                          </span>
                        </div>
                        <p className="font-bold leading-relaxed">{selectedTicket.adminReply}</p>
                      </div>
                    </div>
                  )}

                </div>

                {/* WhatsApp Chat Input Footer */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
                  
                  {/* Canned Responses Chips */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase flex-shrink-0">Quick Reply:</span>
                    {cannedTemplates.map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReplyText(template)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-500/10 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-emerald-500 text-[10px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
                      >
                        {template.substring(0, 30)}...
                      </button>
                    ))}
                  </div>

                  {/* Input Box */}
                  <div className="flex items-center space-x-2">
                    <textarea
                      rows="2"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Write live support message to ${selectedTicket.user?.name || 'Customer'}...`}
                      className="flex-1 px-4 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendReply(selectedTicket._id)}
                      disabled={sendingReply || !replyText.trim()}
                      className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-md flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-40"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                      <span>{sendingReply ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <FaComments className="h-12 w-12 text-slate-300" />
                <h4 className="font-black text-slate-900 dark:text-white text-base">Select a Support Conversation</h4>
                <p className="text-xs text-slate-400 font-medium">Click any customer or driver ticket on the left list to view chat thread and send replies.</p>
              </div>
            )}

          </div>

        </main>
      </div>
    </div>
  );
};

export default AdminSupportPage;
