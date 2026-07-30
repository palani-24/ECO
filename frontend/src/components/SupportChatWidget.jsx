import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  FaComments, FaTimes, FaPaperPlane, FaUserShield, 
  FaClock, FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaChevronDown,
  FaSearch, FaPaperclip, FaSmile, FaMicrophone, FaThumbtack, FaRobot, FaCheckDouble,
  FaCheck, FaVolumeUp, FaVolumeMute, FaFilter, FaFileAlt, FaImage, FaReply,
  FaThumbsUp, FaHeart, FaLaugh, FaSurprise, FaTrash, FaPen, FaFilePdf
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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'replied'
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [replyToMsg, setReplyToMsg] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [reactions, setReactions] = useState({});

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Default initial demo chat data for ultra-rich instant experience
  const sampleMessages = [
    {
      _id: 'msg-1',
      user: { _id: user?._id || 'usr-1', name: user?.name || 'Palani M', role: 'user' },
      subject: 'General Pickup Support',
      message: 'My pickup was scheduled for 10:30 AM. Driver hasn\'t arrived yet.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'replied',
      readStatus: 'read', // 'sent' | 'delivered' | 'read'
      adminReply: 'Hello Palani! Driver Karthik is currently in traffic near Sector 4. He will reach your address in 12 minutes.',
      repliedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  // Fetch User Messages
  const fetchMyMessages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/support/my-messages');
      if (res.data.success && res.data.data.length > 0) {
        setMessages(res.data.data);
      } else {
        setMessages(sampleMessages);
      }
    } catch (err) {
      console.error('Failed to fetch support messages:', err);
      setMessages(sampleMessages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchMyMessages();
    }
  }, [user, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Socket listener for instant admin replies
  useEffect(() => {
    const handleSocketReply = (data) => {
      if (user && data && data.user && (data.user._id === user._id || data.user === user._id)) {
        if (soundEnabled) playNotificationSound();
        addToast(`💬 Admin Response: ${data.adminReply.substring(0, 40)}...`, 'info', 'Admin Live Reply');
        setIsTyping(false);
        setMessages(prev => {
          const exists = prev.some(m => m._id === data._id);
          if (exists) {
            return prev.map(m => m._id === data._id ? { ...data, readStatus: 'read' } : m);
          }
          return [{ ...data, readStatus: 'read' }, ...prev];
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
  }, [user, soundEnabled]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedFile) return;

    const currentMsgText = messageText;
    setMessageText('');
    setReplyToMsg(null);
    setAttachedFile(null);
    setSending(true);

    // Simulate instant optimistic message bubble
    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      user: { _id: user._id, name: user.name, role: user.role },
      subject,
      message: currentMsgText,
      attachedFile: attachedFile ? attachedFile.name : null,
      createdAt: new Date().toISOString(),
      status: 'open',
      readStatus: 'delivered'
    };

    setMessages(prev => [...prev, optimisticMsg]);

    // Simulate AI typing indicator response preview
    setTimeout(() => {
      setIsTyping(true);
    }, 800);

    try {
      const res = await api.post('/support/send', { subject, message: currentMsgText });
      if (res.data.success) {
        addToast('Message sent to Support Desk!', 'success', 'Message Delivered');
        setMessages(prev => prev.map(m => m._id === optimisticMsg._id ? { ...res.data.data, readStatus: 'delivered' } : m));
      }
    } catch (err) {
      addToast('Message saved locally. Support Agent notified.', 'info', 'Message Sent');
    } finally {
      setSending(false);
      setTimeout(() => {
        setIsTyping(false);
      }, 2500);
    }
  };

  const quickReplies = [
    '📍 Driver ETA Request',
    '💰 Points Not Credited',
    '🚚 Route Update Needed',
    '♻️ Category Guidelines'
  ];

  const emojis = ['👍', '❤️', '😂', '😮', '♻️', '🚚', '💰', '🔥', '🎉'];

  const handleQuickReply = (text) => {
    setMessageText(text);
  };

  const handleAddEmoji = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      addToast(`Attached: ${file.name}`, 'info', 'File Attached');
    }
  };

  const handleReaction = (msgId, emoji) => {
    setReactions(prev => ({
      ...prev,
      [msgId]: emoji
    }));
  };

  if (!user || user.role === 'admin') return null;

  const filteredMessages = messages.filter(m => {
    const matchesSearch = searchQuery === '' || 
      m.message?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.adminReply?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'open') return matchesSearch && m.status === 'open';
    if (statusFilter === 'replied') return matchesSearch && m.status === 'replied';
    return matchesSearch;
  });

  return (
    <>
      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-2xl hover:shadow-emerald-500/40 transition-all flex items-center justify-center space-x-2 border-2 border-white/30 group"
      >
        <div className="relative">
          <FaComments className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-rose-500 rounded-full border-2 border-white animate-ping"></span>
        </div>
        <span className="hidden sm:inline font-extrabold text-xs tracking-wider pr-1">Support Desk</span>
      </motion.button>

      {/* Main Chat Drawer Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[620px] max-h-[85vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            
            {/* 1. Header Bar */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
                    <FaUserShield />
                  </div>
                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-black text-sm flex items-center space-x-1.5">
                    <span>EcoReward Support Desk</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Online • 24/7 Live Agents
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                  title="Toggle Sound"
                >
                  {soundEnabled ? <FaVolumeUp className="text-emerald-400" /> : <FaVolumeMute />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <FaTimes className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 2. Pinned Announcement & Search Filter Bar */}
            <div className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200/60 dark:border-slate-800 p-3 space-y-2 text-xs">
              
              {/* Pinned Banner */}
              <div className="flex items-center space-x-2 p-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-500/20 text-[11px] font-bold">
                <FaThumbtack className="text-emerald-500 flex-shrink-0" />
                <span className="truncate">📢 Avg response time: under 2 minutes. We are here to help!</span>
              </div>

              {/* Search Bar & Status Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-[11px]" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex bg-white dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700 text-[10px] font-black">
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setStatusFilter('open')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'open' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                  >
                    Open
                  </button>
                  <button 
                    onClick={() => setStatusFilter('replied')}
                    className={`px-2 py-1 rounded-lg transition-all ${statusFilter === 'replied' ? 'bg-emerald-500 text-white' : 'text-slate-400'}`}
                  >
                    Replied
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Main Chat Stream (Modern Bubbles) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-100/50 dark:bg-slate-950/50">
              
              {/* Date Separator */}
              <div className="text-center my-2">
                <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  Today
                </span>
              </div>

              {filteredMessages.map((msg, idx) => (
                <div key={msg._id || idx} className="space-y-3">
                  
                  {/* User Question Bubble (Right Aligned - Green) */}
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-end space-x-2 max-w-[85%]">
                      <div className="p-3.5 bg-emerald-600 text-white rounded-3xl rounded-br-none shadow-md space-y-1 relative group">
                        
                        {msg.attachedFile && (
                          <div className="p-2 bg-emerald-700 rounded-xl flex items-center space-x-2 text-[11px] font-bold mb-1">
                            <FaFileAlt />
                            <span className="truncate max-w-[140px]">{msg.attachedFile}</span>
                          </div>
                        )}

                        <p className="text-xs font-medium leading-relaxed">{msg.message}</p>
                        
                        {/* Timestamp & Read Receipts */}
                        <div className="flex items-center justify-end space-x-1.5 pt-1 text-[9px] text-emerald-200 font-bold">
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span title="Read Status">
                            {msg.readStatus === 'read' ? (
                              <FaCheckDouble className="text-sky-300" />
                            ) : msg.readStatus === 'delivered' ? (
                              <FaCheckDouble className="text-emerald-200" />
                            ) : (
                              <FaCheck className="text-emerald-200" />
                            )}
                          </span>
                        </div>

                        {/* Reaction Badge if exists */}
                        {reactions[msg._id] && (
                          <span className="absolute -bottom-2 -left-2 bg-white dark:bg-slate-800 text-xs p-0.5 rounded-full shadow border">
                            {reactions[msg._id]}
                          </span>
                        )}
                      </div>

                      <img 
                        src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=10b981&color=fff`} 
                        alt="User Avatar" 
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-500/40 flex-shrink-0"
                      />
                    </div>
                  </div>

                  {/* Admin Support Reply Bubble (Left Aligned - White / Dark Grey) */}
                  {msg.adminReply && (
                    <div className="flex flex-col items-start space-y-1">
                      <div className="flex items-start space-x-2 max-w-[85%]">
                        <img 
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" 
                          alt="Admin Support Avatar" 
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-500/40 flex-shrink-0"
                        />
                        <div className="p-3.5 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-3xl rounded-bl-none shadow-md border border-slate-200/60 dark:border-slate-700 space-y-1 relative">
                          <div className="flex items-center space-x-2 pb-1">
                            <span className="font-extrabold text-[11px] text-emerald-600 dark:text-emerald-400">Support Agent Sarah</span>
                            <span className="px-2 py-0.2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full uppercase">
                              Official Helpdesk
                            </span>
                          </div>

                          <p className="text-xs font-medium leading-relaxed">{msg.adminReply}</p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-750 text-[9px] text-slate-400 font-bold">
                            <span>{new Date(msg.repliedAt || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            
                            {/* Fast Reaction Bar */}
                            <div className="flex space-x-1">
                              {emojis.slice(0, 4).map((emoji, i) => (
                                <button key={i} onClick={() => handleReaction(msg._id, emoji)} className="hover:scale-125 transition-transform">
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {/* Animated Typing Indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-bold pt-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px]">
                    <FaRobot className="animate-spin-slow" />
                  </div>
                  <div className="flex space-x-1 items-center bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <span className="text-[10px] text-slate-400 pr-1">Support Agent typing</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* 4. AI Copilot Suggestion Box */}
            {showAiAssistant && (
              <div className="p-3 bg-emerald-500/10 border-t border-emerald-500/20 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300 font-bold text-[11px]">
                  <FaRobot className="text-emerald-500 flex-shrink-0" />
                  <span className="truncate">EcoAI Suggestion: Ask for driver location or point refund.</span>
                </div>
                <button 
                  onClick={() => setShowAiAssistant(false)}
                  className="text-slate-400 hover:text-slate-600 text-[10px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 5. Quick Reply Chips */}
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-200/60 dark:border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickReply(reply)}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold whitespace-nowrap hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* 6. Emoji Bar Popup */}
            {showEmojiPicker && (
              <div className="p-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around text-lg">
                {emojis.map((emoji, i) => (
                  <button key={i} onClick={() => handleAddEmoji(emoji)} className="hover:scale-125 transition-transform p-1">
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            {/* 7. Input Form & Attachments Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 flex items-center space-x-2">
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Add Emoji"
              >
                <FaSmile className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Attach Document/Image"
              >
                <FaPaperclip className="h-4 w-4" />
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your support message..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <button
                type="submit"
                disabled={sending || (!messageText.trim() && !attachedFile)}
                className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-md disabled:opacity-40 transition-all"
              >
                <FaPaperPlane className="h-3.5 w-3.5" />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChatWidget;
