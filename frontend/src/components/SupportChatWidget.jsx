import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  FaComments, FaTimes, FaPaperPlane, FaUserShield, 
  FaClock, FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaChevronRight,
  FaSearch, FaPaperclip, FaRobot, FaCheck, FaVolumeUp, FaVolumeMute, 
  FaHome, FaRegCommentAlt, FaHeadset, FaKey, FaTruck, FaCoins, FaBalanceScale,
  FaArrowLeft, FaLeaf, FaExternalLinkAlt, FaCheckDouble, FaPhoneAlt, FaEnvelope
} from 'react-icons/fa';

const SupportChatWidget = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages' | 'help'
  const [activeChat, setActiveChat] = useState(null); // 'admin' | 'bot' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [liveMessages, setLiveMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);

  // EcoBot AI Thread State
  const [botMessages, setBotMessages] = useState([
    {
      id: 'bot-1',
      sender: 'bot',
      text: `Hello ${user?.name || 'Eco Warrior'}! 🌱 I am EcoBot, your 24/7 AI Assistant. Ask me about waste points rates, pickup verification, driver tracking, or account settings!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const messagesEndRef = useRef(null);

  // Knowledge Base FAQs
  const helpArticles = [
    {
      id: 'faq-1',
      title: 'Reset Your Password & Account Settings',
      category: 'Account',
      icon: <FaKey className="text-emerald-500" />,
      answer: 'Go to Profile Settings or click "Forgot Password" on the login screen. You will receive an OTP code on your registered email to reset your password securely.'
    },
    {
      id: 'faq-2',
      title: 'Scheduling Waste Pickup & Multi-Material Line Items',
      category: 'Pickups',
      icon: <FaTruck className="text-emerald-500" />,
      answer: 'You can add multiple materials (e.g. 10 kg Metal, 5 kg Plastic, 3.34 kg Paper) in a single request. Specify weights down to decimal precision (grams) and select your preferred collection date.'
    },
    {
      id: 'faq-3',
      title: 'EcoPoints Calculation (35 pts/kg) & Cash Vouchers',
      category: 'Points',
      icon: <FaCoins className="text-emerald-500" />,
      answer: 'Points are calculated at dynamic rates (Metal 20, Plastic 10, Paper 8, E-Waste 15 pts/kg). 1,000 EcoPoints can be redeemed for ₹250 cash via UPI, Amazon Vouchers, or Green Store coupons.'
    },
    {
      id: 'faq-4',
      title: 'Driver Scale Verification & Handover OTP Code',
      category: 'Pickups',
      icon: <FaBalanceScale className="text-emerald-500" />,
      answer: 'When the eco-driver arrives at your doorstep, provide the 4-digit Handover OTP displayed on your pickup card. The driver will re-weigh your items on their digital scale and instant points will transfer to your wallet.'
    },
    {
      id: 'faq-5',
      title: 'Driver Registration, Job Queue & Daily Pickup Limits',
      category: 'Drivers',
      icon: <FaUserShield className="text-emerald-500" />,
      answer: 'Registered drivers can accept open pickup jobs near their route. Demo accounts enjoy unlimited daily testing, while standard citizen accounts have 1 pickup collection limit per day.'
    }
  ];

  // Fetch real support messages from backend for current user
  const fetchMySupportMessages = async () => {
    if (!user) return;
    try {
      setLoadingMessages(true);
      const res = await api.get('/support/my-messages');
      if (res.data.success && Array.isArray(res.data.data)) {
        setLiveMessages(res.data.data);
      }
    } catch (err) {
      console.warn('Using local support thread fallback', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMySupportMessages();
      setUnreadAdminCount(0);
    }
  }, [isOpen]);

  // Real-time socket listener for Admin replies
  useEffect(() => {
    const handleAdminReply = (replyData) => {
      const targetUserId = replyData.user?._id || replyData.user;
      if (user && (targetUserId === user._id || replyData.senderRole === 'admin')) {
        setLiveMessages(prev => [replyData, ...prev]);
        if (!isOpen || activeChat !== 'admin') {
          setUnreadAdminCount(c => c + 1);
          addToast(`💬 Admin Response: "${replyData.message?.substring(0, 45)}..."`, 'info', 'New Support Message');
        }
      }
    };

    if (window.socket) {
      window.socket.on('support:replied', handleAdminReply);
    }

    return () => {
      if (window.socket) {
        window.socket.off('support:replied', handleAdminReply);
      }
    };
  }, [user, isOpen, activeChat]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages, botMessages, isBotTyping, activeChat]);

  // Handle Send Live Support Message to Admin
  const handleSendToAdmin = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() || sendingMessage) return;

    const currentText = messageText.trim();
    setMessageText('');
    setSendingMessage(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      user: { _id: user?._id, name: user?.name, email: user?.email, role: user?.role },
      senderRole: user?.role || 'user',
      subject: 'Citizen Live Support Chat',
      message: currentText,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setLiveMessages(prev => [optimisticMsg, ...prev]);

    try {
      const res = await api.post('/support/send', {
        subject: 'Citizen Live Support Chat',
        message: currentText
      });
      if (res.data.success) {
        setLiveMessages(prev => prev.map(m => m._id === tempId ? res.data.data : m));
        addToast('Message delivered to EcoReward Admin team!', 'success', 'Delivered');
      }
    } catch (err) {
      console.warn('Message queued offline', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle EcoBot AI Conversation
  const handleSendToBot = (e) => {
    e?.preventDefault();
    if (!messageText.trim() || isBotTyping) return;

    const userText = messageText.trim();
    setMessageText('');

    const newMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setBotMessages(prev => [...prev, newMsg]);
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      let botReply = "I am EcoBot AI! Your pickups, wallet points, and driver assignments are synced live with our platform.";
      const lower = userText.toLowerCase();

      if (lower.includes('point') || lower.includes('reward') || lower.includes('rate') || lower.includes('price')) {
        botReply = "💰 Material Exchange Rates:\n• Metal: 20 pts/kg\n• Plastic: 10 pts/kg\n• Paper: 8 pts/kg\n• E-Waste: 15 pts/kg\n• Glass: 6 pts/kg\n• Organic: 4 pts/kg\n1,000 Points = ₹250 UPI/Amazon Cashback!";
      } else if (lower.includes('pickup') || lower.includes('schedule') || lower.includes('weight')) {
        botReply = "🚛 You can schedule doorstep pickup from the 'Schedule Pickup' tab. Our EV drivers arrive with digital scales to weigh and credit points instantly!";
      } else if (lower.includes('driver') || lower.includes('otp') || lower.includes('handover')) {
        botReply = "🔐 When your driver arrives, share the 4-digit Handover OTP shown on your active pickup order card to verify collection.";
      } else if (lower.includes('admin') || lower.includes('human') || lower.includes('help')) {
        botReply = "🛡️ You can switch to the 'EcoReward Support Team' chat to speak directly with our human support team!";
      }

      setBotMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 800);
  };

  // Convert raw support messages list into chronological bubbles
  const getFlattenedLiveBubbles = () => {
    const bubbles = [];
    const sorted = [...liveMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    sorted.forEach(m => {
      if (m.senderRole === 'admin') {
        bubbles.push({
          id: m._id,
          sender: 'admin',
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'replied'
        });
      } else {
        bubbles.push({
          id: m._id,
          sender: 'user',
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: m.status
        });

        if (m.adminReply) {
          bubbles.push({
            id: `${m._id}-reply`,
            sender: 'admin',
            text: m.adminReply,
            time: new Date(m.repliedAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'replied'
          });
        }
      }
    });

    return bubbles;
  };

  // Filtered Help Articles
  const filteredArticles = helpArticles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Floating Action Button (FAB) in Bottom Right */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 flex items-center space-x-2.5 border border-emerald-400/40 group cursor-pointer"
        >
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              💬
            </div>
            {unreadAdminCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {unreadAdminCount}
              </span>
            ) : (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-300 rounded-full animate-ping"></span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-tight leading-none">Need Help?</p>
            <p className="text-[10px] text-emerald-200 font-bold leading-tight">Live Support & EcoBot</p>
          </div>
        </motion.button>
      )}

      {/* Main Support Floating Widget (WhatsApp Web Aesthetic) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[590px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden font-sans"
          >
            {/* Header Area */}
            <div className="relative p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              {activeChat ? (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{activeChat === 'admin' ? '🛡️' : '🤖'}</span>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {activeChat === 'admin' ? 'EcoReward Support Team' : 'EcoBot AI Assistant'}
                      </h3>
                      <p className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>{activeChat === 'admin' ? 'Live Support Officer' : 'AI Assistant 24/7'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                      🍃
                    </div>
                    <div>
                      <h2 className="text-base font-black tracking-tight text-white flex items-center space-x-1.5">
                        <span>EcoReward</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md border border-emerald-500/30">Help</span>
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-colors"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT VIEW */}
            <div className="flex-1 overflow-hidden bg-slate-900 flex flex-col">
              
              {/* CHAT THREAD VIEW (If user opened a chat with Admin or EcoBot) */}
              {activeChat === 'admin' ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0b141a]">
                  {/* WhatsApp Wallpaper Chat Stream */}
                  <div 
                    className="flex-1 p-4 overflow-y-auto space-y-3"
                    style={{
                      backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    <div className="text-center my-1">
                      <span className="px-3 py-1 bg-slate-800/80 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700">
                        🔒 End-to-End Live Admin Support
                      </span>
                    </div>

                    {loadingMessages ? (
                      <div className="text-center py-8 text-xs text-slate-400">Loading conversation...</div>
                    ) : getFlattenedLiveBubbles().length === 0 ? (
                      <div className="text-center py-10 space-y-2">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-2xl">
                          💬
                        </div>
                        <p className="text-xs font-bold text-slate-300">No support tickets yet</p>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                          Send a message below. Our admin team will receive and reply to your inquiry instantly!
                        </p>
                      </div>
                    ) : (
                      getFlattenedLiveBubbles().map((bubble) => {
                        const isMe = bubble.sender === 'user';
                        return (
                          <div
                            key={bubble.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-xs ${
                                isMe
                                  ? 'bg-[#005c4b] text-emerald-50 rounded-br-none border border-emerald-500/20'
                                  : 'bg-[#202c33] text-slate-100 rounded-bl-none border border-slate-700'
                              }`}
                            >
                              <p className="font-bold text-[10px] mb-0.5 text-emerald-300">
                                {isMe ? 'You' : '🛡️ EcoReward Admin'}
                              </p>
                              <p className="leading-relaxed whitespace-pre-wrap">{bubble.text}</p>
                              <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] text-slate-300">
                                <span>{bubble.time}</span>
                                {isMe && (
                                  bubble.status === 'replied' ? (
                                    <FaCheckDouble className="text-sky-400 h-2.5 w-2.5" />
                                  ) : (
                                    <FaCheck className="text-slate-400 h-2.5 w-2.5" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Bar */}
                  <form onSubmit={handleSendToAdmin} className="p-2.5 bg-[#202c33] border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message to Admin..."
                      className="flex-1 px-4 py-2.5 bg-[#2a3942] border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || sendingMessage}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : activeChat === 'bot' ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0b141a]">
                  <div 
                    className="flex-1 p-4 overflow-y-auto space-y-3"
                    style={{
                      backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.06) 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {botMessages.map((msg) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-md text-xs ${
                              isBot
                                ? 'bg-[#202c33] text-slate-100 rounded-bl-none border border-slate-700'
                                : 'bg-[#005c4b] text-emerald-50 rounded-br-none border border-emerald-500/20'
                            }`}
                          >
                            <p className="font-bold text-[10px] mb-0.5 text-emerald-300">
                              {isBot ? '🤖 EcoBot AI' : 'You'}
                            </p>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            <span className="block text-right text-[9px] text-slate-400 mt-1">
                              {msg.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isBotTyping && (
                      <div className="flex justify-start">
                        <div className="bg-[#202c33] rounded-2xl px-3.5 py-2 rounded-bl-none text-xs text-slate-400 flex items-center space-x-1.5 border border-slate-700">
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] text-slate-400 ml-1">EcoBot is typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendToBot} className="p-2.5 bg-[#202c33] border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Ask EcoBot anything..."
                      className="flex-1 px-4 py-2.5 bg-[#2a3942] border border-slate-700 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isBotTyping}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* TAB 1: HOME */}
                  {activeTab === 'home' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1">
                        <h1 className="text-xl font-extrabold text-white tracking-tight">
                          Hello {user?.name?.split(' ')[0] || 'Eco Warrior'}! 👋
                        </h1>
                        <p className="text-sm font-medium text-slate-400">
                          How can we support your recycling today?
                        </p>
                      </div>

                      {/* Status Card */}
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start space-x-3 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">Status: Fleet & Dispatch Operational</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Real-time socket sync connected
                          </p>
                        </div>
                      </div>

                      {/* Live Channels Cards */}
                      <div className="space-y-2.5">
                        {/* Live Admin Support Card */}
                        <div 
                          onClick={() => setActiveChat('admin')}
                          className="p-3.5 bg-gradient-to-r from-emerald-950/80 to-slate-800 hover:from-emerald-900/90 hover:to-slate-750 border border-emerald-500/30 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl">
                              🛡️
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                  Live Admin Support
                                </h4>
                                {unreadAdminCount > 0 && (
                                  <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[9px] font-black animate-pulse">
                                    {unreadAdminCount} NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-medium">
                                Direct messaging with support team
                              </p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>

                        {/* EcoBot AI Assistant Card */}
                        <div 
                          onClick={() => setActiveChat('bot')}
                          className="p-3.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-xl">
                              🤖
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                EcoBot AI Assistant
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium">
                                Instant rate & pickup calculation 24/7
                              </p>
                            </div>
                          </div>
                          <FaChevronRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>

                      {/* Quick FAQ Previews */}
                      <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-750">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Common Questions</p>
                        {helpArticles.slice(0, 3).map((art) => (
                          <div 
                            key={art.id}
                            onClick={() => {
                              setActiveTab('help');
                              setExpandedFaq(art.id);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs group"
                          >
                            <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                              {art.title}
                            </span>
                            <FaChevronRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MESSAGES */}
                  {activeTab === 'messages' && (
                    <div className="space-y-3 animate-fadeIn flex flex-col h-full justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h2 className="text-sm font-extrabold text-white">Active Channels</h2>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Real-Time
                          </span>
                        </div>

                        {/* Admin Channel Item */}
                        <div
                          onClick={() => setActiveChat('admin')}
                          className="p-3.5 bg-slate-800/80 hover:bg-slate-750 rounded-2xl cursor-pointer transition-all border border-slate-750 flex items-start justify-between group"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">🛡️</span>
                            <div>
                              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                EcoReward Support Team
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                {liveMessages[0]?.message || 'Start a conversation with admin support...'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                            {liveMessages[0] ? new Date(liveMessages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                          </span>
                        </div>

                        {/* EcoBot Channel Item */}
                        <div
                          onClick={() => setActiveChat('bot')}
                          className="p-3.5 bg-slate-800/80 hover:bg-slate-750 rounded-2xl cursor-pointer transition-all border border-slate-750 flex items-start justify-between group"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                EcoBot AI Assistant
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                {botMessages[botMessages.length - 1]?.text || 'Ask me about recycling & rates...'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                            {botMessages[botMessages.length - 1]?.time || 'Now'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-center">
                        <button
                          onClick={() => setActiveChat('admin')}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all border border-emerald-400/30 active:scale-98"
                        >
                          <span>Message Support Team</span>
                          <FaComments className="h-3.5 w-3.5 text-emerald-200" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: HELP (KNOWLEDGE BASE) */}
                  {activeTab === 'help' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="border-b border-slate-800 pb-2">
                        <h2 className="text-sm font-extrabold text-white">Help & Knowledge Base</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Browse answers or search for instant solutions.</p>
                      </div>

                      <div className="relative">
                        <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3 w-3" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search questions..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-800/90 text-white placeholder-slate-400 rounded-xl border border-slate-750 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-2">
                        {filteredArticles.map((art) => {
                          const isExpanded = expandedFaq === art.id;
                          return (
                            <div 
                              key={art.id} 
                              className="p-3 bg-slate-800/80 rounded-2xl border border-slate-750 transition-all space-y-2"
                            >
                              <div 
                                onClick={() => setExpandedFaq(isExpanded ? null : art.id)}
                                className="flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center space-x-2.5">
                                  <div className="p-1.5 bg-slate-750 rounded-lg">
                                    {art.icon}
                                  </div>
                                  <span className="text-xs font-extrabold text-white">{art.title}</span>
                                </div>
                                <FaChevronRight className={`h-3 w-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`} />
                              </div>

                              {isExpanded && (
                                <p className="text-xs text-slate-300 leading-relaxed font-medium pt-2 border-t border-slate-750 animate-fadeIn">
                                  {art.answer}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* BOTTOM NAVIGATION BAR */}
            <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-around">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1 rounded-xl transition-all ${
                  activeTab === 'home' && !activeChat
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaHome className="h-4 w-4" />
                <span className="text-[10px]">Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('messages');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1 rounded-xl transition-all ${
                  (activeTab === 'messages' || activeChat)
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaRegCommentAlt className="h-4 w-4" />
                <span className="text-[10px]">Messages</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('help');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1 rounded-xl transition-all ${
                  activeTab === 'help' && !activeChat
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaHeadset className="h-4 w-4" />
                <span className="text-[10px]">Help</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SupportChatWidget;

