import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  FaComments, FaTimes, FaPaperPlane, FaUserShield, 
  FaClock, FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaChevronDown 
} from 'react-icons/fa';

const SupportChatWidget = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('General Pickup Support');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'new'

  const messagesEndRef = useRef(null);

  // Fetch User Messages
  const fetchMyMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/support/my-messages');
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchMyMessages();
    }
  }, [user, isOpen]);

  // Socket listener for instant admin replies
  useEffect(() => {
    const handleSocketReply = (data) => {
      if (user && data && data.user && (data.user._id === user._id || data.user === user._id)) {
        addToast(`💬 Admin Response: ${data.adminReply.substring(0, 50)}...`, 'info', 'Admin Support Reply');
        setMessages(prev => {
          const exists = prev.some(m => m._id === data._id);
          if (exists) {
            return prev.map(m => m._id === data._id ? data : m);
          }
          return [data, ...prev];
        });
      }
    };

    if (window.socket) {
      window.socket.on('support:replied', handleSocketReply);
    }

    return () => {
      if (window.socket) {
        window.socket.off('support:replied', handleSocketReply);
      }
    };
  }, [user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const res = await api.post('/support/send', { subject, message: messageText });
      if (res.data.success) {
        addToast('Message sent to Admin! Admin will reply shortly.', 'success', 'Support Ticket Created');
        setMessageText('');
        setMessages(prev => [res.data.data, ...prev]);
        setActiveTab('chat');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message', 'error', 'Error');
    } finally {
      setSending(false);
    }
  };

  if (!user || user.role === 'admin') return null; // Only customers & drivers see this widget

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-2xl shadow-emerald-500/40 flex items-center space-x-2.5 transition-all duration-300 hover:scale-105 group border border-emerald-400/30"
        title="Contact EcoReward Admin Support"
      >
        <div className="relative">
          <FaComments className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
        </div>
        <span className="font-extrabold text-xs tracking-wide hidden sm:inline-block">Admin Support</span>
      </button>

      {/* Support Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px] transition-all animate-fadeIn">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-500/20">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg">
                <FaUserShield />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-1.5">
                  <span>EcoReward Admin Helpdesk</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-slate-300 font-medium">Direct Live Messaging with Support Team</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'chat' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              My Messages ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'new' 
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              + Send New Message
            </button>
          </div>

          {/* Tab 1: Messages History & Admin Replies */}
          {activeTab === 'chat' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <FaQuestionCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No support messages sent yet.</p>
                  <button
                    onClick={() => setActiveTab('new')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    Click to Message Admin
                  </button>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} className="space-y-2">
                    
                    {/* User's Sent Message Bubble */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{msg.subject}</span>
                        <span className="text-slate-400 font-medium flex items-center space-x-1">
                          <FaClock className="h-2.5 w-2.5" />
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">{msg.message}</p>
                      
                      <div className="flex justify-end pt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          msg.status === 'replied' 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        }`}>
                          {msg.status === 'replied' ? '✓ Replied by Admin' : '⏳ Waiting for Admin Response'}
                        </span>
                      </div>
                    </div>

                    {/* Admin Reply Bubble */}
                    {msg.adminReply && (
                      <div className="ml-4 p-3.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-500/30 rounded-2xl space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="flex items-center space-x-1.5">
                            <FaUserShield className="h-3 w-3 text-emerald-500" />
                            <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Admin Support Response</span>
                          </div>
                          <span className="text-slate-400 font-medium">
                            {msg.repliedAt ? new Date(msg.repliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-slate-100 font-bold leading-relaxed">{msg.adminReply}</p>
                      </div>
                    )}

                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Tab 2: Send New Support Message */}
          {activeTab === 'new' && (
            <form onSubmit={handleSendMessage} className="flex-1 p-5 flex flex-col justify-between space-y-4 bg-white dark:bg-slate-900">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Inquiry Category / Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="General Pickup Support">General Pickup Support</option>
                    <option value="EcoPoints & Wallet Query">EcoPoints & Wallet Query</option>
                    <option value="Driver Conduct & Feedback">Driver Conduct & Feedback</option>
                    <option value="App Technical Issue">App Technical Issue</option>
                    <option value="Redemption Coupon Problem">Redemption Coupon Problem</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">Your Message to Admin</label>
                  <textarea
                    rows="5"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                    placeholder="Describe your request or issue here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
              >
                <FaPaperPlane className="h-3.5 w-3.5" />
                <span>{sending ? 'Sending to Admin...' : 'Send Message to Admin'}</span>
              </button>
            </form>
          )}

        </div>
      )}
    </>
  );
};

export default SupportChatWidget;
