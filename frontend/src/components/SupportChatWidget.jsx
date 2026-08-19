import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  FaArrowLeft, FaLeaf, FaExternalLinkAlt, FaCheckDouble, FaPhoneAlt, FaEnvelope,
  FaCopy, FaSmile, FaShieldAlt, FaTrashAlt, FaRedo, FaInfoCircle
} from 'react-icons/fa';

// Audio chime generator using Web Audio API
const playChime = (isMuted = false) => {
  if (isMuted) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
    
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) {
    // AudioContext autoplay restriction fallback
  }
};

// Date label helper ("Today", "Yesterday", "19 Aug 2026")
const getDateLabel = (dateString) => {
  if (!dateString) return 'Today';
  const d = new Date(dateString);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

const POPULAR_EMOJIS = ['👍', '🌱', '♻️', '🙏', '🚛', '💰', '😊', '🔥', '⚡', '📦'];

const SupportChatWidget = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket() || {};
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages' | 'help'
  const [activeChat, setActiveChat] = useState(null); // 'admin' | 'bot' | null
  
  // Search & input states
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  
  // Preferences & sound
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('ecoreward_chat_muted') === 'true';
  });
  const [copiedBubbleId, setCopiedBubbleId] = useState(null);

  // Live messages state
  const [liveMessages, setLiveMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [unreadAdminCount, setUnreadAdminCount] = useState(0);

  // EcoBot AI Thread State - Isolated per logged-in user account
  const defaultBotGreeting = (userName) => [
    {
      id: `bot-1-${userName || 'user'}`,
      sender: 'bot',
      text: `Hello ${userName || 'Eco Warrior'}! 🌱 I am EcoBot, your 24/7 AI Assistant. Ask me about waste points rates, pickup verification, driver tracking, or account settings!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    }
  ];

  const [botMessages, setBotMessages] = useState(() => defaultBotGreeting(user?.name));
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Toggle Mute
  const toggleSound = () => {
    const nextState = !isSoundMuted;
    setIsSoundMuted(nextState);
    localStorage.setItem('ecoreward_chat_muted', String(nextState));
    if (!nextState) playChime(false);
  };

  // Reset chat & bot messages when switching user accounts
  useEffect(() => {
    if (user?._id) {
      const saved = sessionStorage.getItem(`ecobot_history_${user._id}`);
      if (saved) {
        try {
          setBotMessages(JSON.parse(saved));
        } catch (e) {
          setBotMessages(defaultBotGreeting(user.name));
        }
      } else {
        setBotMessages(defaultBotGreeting(user.name));
      }
      fetchMySupportMessages();
    } else {
      setLiveMessages([]);
      setBotMessages(defaultBotGreeting('Guest'));
    }
  }, [user?._id, user?.name]);

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
        // Deduplicate messages by _id
        const uniqueMap = new Map();
        res.data.data.forEach(item => {
          if (item._id && !uniqueMap.has(item._id)) {
            uniqueMap.set(item._id, item);
          }
        });
        setLiveMessages(Array.from(uniqueMap.values()));
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

  // Real-time socket listener for Admin replies & user messages (Instant sync without duplicates)
  useEffect(() => {
    const activeSocket = socket || window.socket;
    if (!activeSocket) return;

    const handleAdminReply = (replyData) => {
      const targetUserId = replyData.user?._id || replyData.user;
      const isForMe = user && (
        targetUserId?.toString() === user._id?.toString() || 
        replyData.user?.email === user.email ||
        replyData.senderRole === 'admin'
      );

      if (isForMe) {
        setLiveMessages(prev => {
          if (prev.some(m => m._id === replyData._id)) return prev;
          return [replyData, ...prev];
        });

        // Instant audio notification chime
        playChime(isSoundMuted);

        if (!isOpen || activeChat !== 'admin') {
          setUnreadAdminCount(c => c + 1);
          addToast(`💬 Admin Response: "${replyData.message?.substring(0, 45)}..."`, 'info', 'New Support Message');
        }
      }
    };

    const handleNewTicket = (newMsg) => {
      const msgUserId = newMsg.user?._id || newMsg.user;
      if (user && msgUserId && msgUserId.toString() === user._id.toString()) {
        setLiveMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [newMsg, ...prev];
        });
      }
    };

    activeSocket.on('support:replied', handleAdminReply);
    activeSocket.on('support:new', handleNewTicket);

    return () => {
      activeSocket.off('support:replied', handleAdminReply);
      activeSocket.off('support:new', handleNewTicket);
    };
  }, [socket, user, isOpen, activeChat, isSoundMuted]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveMessages, botMessages, isBotTyping, activeChat]);

  // Handle Send Live Support Message to Admin
  const handleSendToAdmin = async (e) => {
    e?.preventDefault();
    if ((!messageText.trim() && !attachedFile) || sendingMessage) return;

    let fullText = messageText.trim();
    if (attachedFile) {
      fullText = fullText ? `${fullText}\n📎 [Attachment: ${attachedFile.name}]` : `📎 [Attachment: ${attachedFile.name}]`;
    }

    setMessageText('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    setSendingMessage(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      _id: tempId,
      user: { _id: user?._id, name: user?.name, email: user?.email, role: user?.role },
      senderRole: user?.role || 'user',
      subject: 'Citizen Live Support Chat',
      message: fullText,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setLiveMessages(prev => [optimisticMsg, ...prev]);

    try {
      const res = await api.post('/support/send', {
        subject: 'Citizen Live Support Chat',
        message: fullText
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
  const handleSendToBot = (textToSend = null) => {
    const rawText = typeof textToSend === 'string' ? textToSend : messageText;
    if (!rawText.trim() || isBotTyping) return;

    const userText = rawText.trim();
    setMessageText('');
    setShowEmojiPicker(false);

    const newMsg = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    setBotMessages(prev => [...prev, newMsg]);
    setIsBotTyping(true);

    setTimeout(() => {
      setIsBotTyping(false);
      let botReply = "I am EcoBot AI! Your pickups, wallet points, and driver assignments are synced live with our platform.";
      const lower = userText.toLowerCase();

      if (lower.includes('point') || lower.includes('reward') || lower.includes('rate') || lower.includes('price')) {
        botReply = "💰 Material Exchange Rates:\n• Metal: 20 pts/kg\n• Plastic: 10 pts/kg\n• Paper: 8 pts/kg\n• E-Waste: 15 pts/kg\n• Glass: 6 pts/kg\n• Organic: 4 pts/kg\n\n🎁 1,000 EcoPoints = ₹250 UPI/Amazon Cashback!";
      } else if (lower.includes('pickup') || lower.includes('schedule') || lower.includes('weight') || lower.includes('track')) {
        botReply = "🚛 You can schedule doorstep pickup from the 'Schedule Pickup' tab. Our EV drivers arrive with digital scales to weigh and credit points instantly!";
      } else if (lower.includes('driver') || lower.includes('otp') || lower.includes('handover')) {
        botReply = "🔐 When your driver arrives, share the 4-digit Handover OTP shown on your active pickup order card to verify collection.";
      } else if (lower.includes('admin') || lower.includes('human') || lower.includes('help') || lower.includes('officer')) {
        botReply = "🛡️ You can switch to the 'EcoReward Support Team' chat to speak directly with our human support officer!";
      }

      playChime(isSoundMuted);

      setBotMessages(prev => {
        const updated = [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: botReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            createdAt: new Date().toISOString()
          }
        ];
        if (user?._id) {
          sessionStorage.setItem(`ecobot_history_${user._id}`, JSON.stringify(updated));
        }
        return updated;
      });
    }, 450);
  };

  // Convert raw support messages list into single-source-of-truth chronological bubbles without duplicates
  const flattenedLiveBubbles = useMemo(() => {
    const bubbles = [];
    // Sort chronologically (oldest first)
    const sorted = [...liveMessages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Track standalone admin message texts to avoid duplicate rendering of legacy adminReply
    const standaloneAdminTexts = new Set(
      sorted.filter(m => m.senderRole === 'admin').map(m => m.message?.trim())
    );

    sorted.forEach(m => {
      if (m.senderRole === 'admin') {
        bubbles.push({
          id: m._id,
          sender: 'admin',
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateLabel: getDateLabel(m.createdAt),
          rawDate: m.createdAt,
          status: 'replied'
        });
      } else {
        bubbles.push({
          id: m._id,
          sender: 'user',
          text: m.message,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          dateLabel: getDateLabel(m.createdAt),
          rawDate: m.createdAt,
          status: m.status
        });

        // Only add legacy adminReply if no standalone admin document already has this text
        if (m.adminReply && m.adminReply.trim() && !standaloneAdminTexts.has(m.adminReply.trim())) {
          bubbles.push({
            id: `${m._id}-legacy-reply`,
            sender: 'admin',
            text: m.adminReply,
            time: new Date(m.repliedAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateLabel: getDateLabel(m.repliedAt || m.createdAt),
            rawDate: m.repliedAt || m.createdAt,
            status: 'replied'
          });
        }
      }
    });

    // Final safety deduplication by ID
    const seenIds = new Set();
    return bubbles.filter(b => {
      if (seenIds.has(b.id)) return false;
      seenIds.add(b.id);
      return true;
    });
  }, [liveMessages]);

  // Filtered live bubbles if search is active
  const displayedLiveBubbles = useMemo(() => {
    if (!chatSearchQuery.trim()) return flattenedLiveBubbles;
    const q = chatSearchQuery.toLowerCase();
    return flattenedLiveBubbles.filter(b => b.text.toLowerCase().includes(q));
  }, [flattenedLiveBubbles, chatSearchQuery]);

  // Copy bubble text helper
  const handleCopyText = (bubbleId, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedBubbleId(bubbleId);
    setTimeout(() => setCopiedBubbleId(null), 2000);
  };

  // Filtered Help Articles
  const filteredArticles = helpArticles.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Quick Action Prompts
  const quickPrompts = [
    { label: '📦 Pickup Status', action: () => setMessageText('Hi Admin, can you please check the status of my waste pickup?') },
    { label: '💰 Rates & Points', action: () => {
      if (activeChat === 'bot') {
        handleSendToBot('What are the EcoPoints exchange rates?');
      } else {
        setMessageText('What are the latest recycling rates per kg?');
      }
    }},
    { label: '🔐 OTP Verification', action: () => setMessageText('How do I share the handover OTP with the driver?') },
    { label: '🛡️ Contact Support', action: () => setActiveChat('admin') }
  ];

  return (
    <>
      {/* Floating Action Button (FAB) in Bottom Right */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 flex items-center space-x-3 border border-emerald-400/40 group cursor-pointer"
        >
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center text-lg backdrop-blur-sm">
              💬
            </div>
            {unreadAdminCount > 0 ? (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {unreadAdminCount}
              </span>
            ) : (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-emerald-300 rounded-full animate-ping"></span>
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-tight leading-none">Need Help?</p>
            <p className="text-[10px] text-emerald-200 font-bold leading-tight mt-0.5">Live Support & EcoBot AI</p>
          </div>
        </motion.button>
      )}

      {/* Main Support Floating Widget (Ultra-Clean Professional Messenger) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[440px] h-[610px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden font-sans backdrop-blur-xl"
          >
            {/* Header Area */}
            <div className="relative p-3.5 sm:p-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
              {activeChat ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2.5">
                    <button 
                      onClick={() => {
                        setActiveChat(null);
                        setShowChatSearch(false);
                        setChatSearchQuery('');
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title="Back"
                    >
                      <FaArrowLeft className="h-4 w-4" />
                    </button>
                    
                    <div className="relative">
                      <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-lg shadow-md">
                        {activeChat === 'admin' ? '🛡️' : '🤖'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse"></span>
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-white flex items-center space-x-1">
                        <span>{activeChat === 'admin' ? 'EcoReward Support Team' : 'EcoBot AI Assistant'}</span>
                        <FaCheckCircle className="text-emerald-400 h-3 w-3" />
                      </h3>
                      <p className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                        <span>{activeChat === 'admin' ? '🟢 Live Support Officer • Active Now' : '⚡ AI Assistant 24/7'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Header Action Tools */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setShowChatSearch(!showChatSearch)}
                      className={`p-2 rounded-xl transition-colors ${showChatSearch ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                      title="Search in chat"
                    >
                      <FaSearch className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={toggleSound}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isSoundMuted ? <FaVolumeMute className="h-3.5 w-3.5 text-rose-400" /> : <FaVolumeUp className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title="Close"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                      🍃
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center space-x-1.5">
                        <span>EcoReward</span>
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md border border-emerald-500/30">Support Hub</span>
                      </h2>
                      <p className="text-[10px] text-slate-400 font-semibold">24/7 Live Desk & Knowledge Base</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={toggleSound}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title={isSoundMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                      {isSoundMuted ? <FaVolumeMute className="h-3.5 w-3.5 text-rose-400" /> : <FaVolumeUp className="h-3.5 w-3.5 text-emerald-400" />}
                    </button>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <FaTimes className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* In-Chat Search Bar Dropdown */}
            {activeChat && showChatSearch && (
              <div className="px-3 py-2 bg-slate-950 border-b border-slate-800 flex items-center space-x-2 animate-fadeIn">
                <FaSearch className="h-3.5 w-3.5 text-slate-400 ml-1" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search in this conversation..."
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
                {chatSearchQuery && (
                  <button onClick={() => setChatSearchQuery('')} className="text-slate-400 hover:text-white text-xs">
                    <FaTimes className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* TAB CONTENT VIEW */}
            <div className="flex-1 overflow-hidden bg-slate-900 flex flex-col">
              
              {/* CHAT THREAD 1: ADMIN LIVE CONVERSATION */}
              {activeChat === 'admin' ? (
                <div className="flex-1 flex flex-col overflow-hidden bg-[#091116]">
                  {/* Message Stream */}
                  <div 
                    className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3"
                    style={{
                      backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {/* Security Notice */}
                    <div className="text-center my-1">
                      <span className="px-3 py-1 bg-slate-800/80 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700/80 inline-flex items-center space-x-1 shadow-sm">
                        <FaShieldAlt className="text-emerald-400 h-2.5 w-2.5" />
                        <span>Official EcoReward Support Channel</span>
                      </span>
                    </div>

                    {loadingMessages ? (
                      <div className="text-center py-12 space-y-2">
                        <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-xs text-slate-400">Loading conversation history...</p>
                      </div>
                    ) : displayedLiveBubbles.length === 0 ? (
                      <div className="text-center py-10 space-y-3">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl border border-emerald-500/20">
                          🛡️
                        </div>
                        <p className="text-xs font-bold text-slate-200">Start a conversation with Admin</p>
                        <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                          Our support team typically responds within a few minutes. Send your question or request below!
                        </p>
                      </div>
                    ) : (
                      displayedLiveBubbles.map((bubble, idx) => {
                        const isMe = bubble.sender === 'user';
                        const prevBubble = displayedLiveBubbles[idx - 1];
                        const showDateSeparator = !prevBubble || prevBubble.dateLabel !== bubble.dateLabel;
                        const isSameSenderAsPrev = prevBubble && prevBubble.sender === bubble.sender && !showDateSeparator;

                        return (
                          <React.Fragment key={bubble.id}>
                            {/* Date Badge Divider */}
                            {showDateSeparator && (
                              <div className="flex justify-center my-2">
                                <span className="px-2.5 py-0.5 bg-slate-800/90 text-slate-400 border border-slate-750 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm">
                                  {bubble.dateLabel}
                                </span>
                              </div>
                            )}

                            {/* Message Bubble Item */}
                            <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSameSenderAsPrev ? 'mt-1' : 'mt-2.5'} group`}>
                              <div
                                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-xs transition-all ${
                                  isMe
                                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-sm border border-emerald-400/20'
                                    : 'bg-[#1b2730] text-slate-100 rounded-bl-sm border border-slate-750'
                                }`}
                              >
                                {/* Header badge for admin sender */}
                                {!isMe && !isSameSenderAsPrev && (
                                  <div className="flex items-center space-x-1.5 mb-1 pb-1 border-b border-slate-700/60">
                                    <span className="font-extrabold text-[10px] text-emerald-400 flex items-center space-x-1">
                                      <FaShieldAlt className="h-2.5 w-2.5" />
                                      <span>EcoReward Admin</span>
                                    </span>
                                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[8px] font-black rounded">SUPPORT</span>
                                  </div>
                                )}

                                {/* Message text */}
                                <p className="leading-relaxed whitespace-pre-wrap font-normal select-text">
                                  {bubble.text}
                                </p>

                                {/* Footer: Time + Status Tick + Quick Copy */}
                                <div className="flex items-center justify-end space-x-1.5 mt-1 text-[9px] text-slate-300/80">
                                  <span>{bubble.time}</span>
                                  {isMe && (
                                    bubble.status === 'replied' ? (
                                      <FaCheckDouble className="text-sky-300 h-2.5 w-2.5" title="Read by Admin" />
                                    ) : (
                                      <FaCheck className="text-emerald-200 h-2.5 w-2.5" title="Delivered" />
                                    )
                                  )}
                                  
                                  {/* Copy Button */}
                                  <button
                                    onClick={() => handleCopyText(bubble.id, bubble.text)}
                                    className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-0.5 ml-1"
                                    title="Copy message"
                                  >
                                    {copiedBubbleId === bubble.id ? (
                                      <span className="text-emerald-300 font-bold text-[8px]">Copied!</span>
                                    ) : (
                                      <FaCopy className="h-2.5 w-2.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Action Prompts Tray */}
                  <div className="px-3 py-1.5 bg-[#111c24] border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                    {quickPrompts.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={qp.action}
                        className="px-2.5 py-1 bg-slate-800/90 hover:bg-emerald-600/20 hover:text-emerald-300 hover:border-emerald-500/40 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
                      >
                        {qp.label}
                      </button>
                    ))}
                  </div>

                  {/* Attachment Preview Chip */}
                  {attachedFile && (
                    <div className="px-3 py-1 bg-emerald-950/80 border-t border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
                      <span className="truncate flex items-center space-x-1">
                        <FaPaperclip className="h-3 w-3" />
                        <span>{attachedFile.name}</span>
                      </span>
                      <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-rose-400 ml-2">
                        <FaTimes className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* Popular Emoji Tray Popup */}
                  {showEmojiPicker && (
                    <div className="p-2 bg-[#1b2730] border-t border-slate-800 flex items-center justify-around animate-fadeIn">
                      {POPULAR_EMOJIS.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setMessageText(prev => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="text-base hover:scale-125 transition-transform p-1"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Bar */}
                  <form onSubmit={handleSendToAdmin} className="p-2.5 bg-[#111c24] border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setAttachedFile(e.target.files[0]);
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-full transition-colors"
                      title="Attach file"
                    >
                      <FaPaperclip className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className={`p-2 rounded-full transition-colors ${showEmojiPicker ? 'text-emerald-400 bg-slate-800' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}
                      title="Insert emoji"
                    >
                      <FaSmile className="h-3.5 w-3.5" />
                    </button>

                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message to Admin..."
                      className="flex-1 px-4 py-2.5 bg-[#1b2730] border border-slate-700/80 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />

                    <button
                      type="submit"
                      disabled={(!messageText.trim() && !attachedFile) || sendingMessage}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : activeChat === 'bot' ? (
                /* CHAT THREAD 2: ECOBOT AI ASSISTANT */
                <div className="flex-1 flex flex-col overflow-hidden bg-[#091116]">
                  <div 
                    className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3"
                    style={{
                      backgroundImage: `radial-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px)`,
                      backgroundSize: '16px 16px'
                    }}
                  >
                    {botMessages.map((msg) => {
                      const isBot = msg.sender === 'bot';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isBot ? 'justify-start' : 'justify-end'} group`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-md text-xs relative ${
                              isBot
                                ? 'bg-[#1b2730] text-slate-100 rounded-bl-sm border border-slate-750'
                                : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-sm border border-emerald-400/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1 pb-0.5 border-b border-slate-700/50">
                              <p className="font-extrabold text-[10px] text-emerald-400 flex items-center space-x-1">
                                <span>{isBot ? '🤖 EcoBot AI' : 'You'}</span>
                              </p>
                              <span className="text-[9px] text-slate-400 font-mono">{msg.time}</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                            <div className="flex justify-end mt-1">
                              <button
                                onClick={() => handleCopyText(msg.id, msg.text)}
                                className="opacity-0 group-hover:opacity-100 hover:text-white text-slate-400 transition-opacity p-0.5"
                                title="Copy"
                              >
                                {copiedBubbleId === msg.id ? (
                                  <span className="text-emerald-300 text-[8px] font-bold">Copied!</span>
                                ) : (
                                  <FaCopy className="h-2.5 w-2.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isBotTyping && (
                      <div className="flex justify-start animate-fadeIn">
                        <div className="bg-[#1b2730] rounded-2xl px-3.5 py-2.5 rounded-bl-sm text-xs text-slate-400 flex items-center space-x-2 border border-slate-750 shadow-md">
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                          <span className="text-[10px] text-emerald-400 font-bold ml-1">EcoBot is thinking...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* AI Quick Suggestion Chips */}
                  <div className="px-3 py-1.5 bg-[#111c24] border-t border-slate-800 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => handleSendToBot('What are the recycling rates per kg?')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-300 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
                    >
                      💰 Points Rates
                    </button>
                    <button
                      onClick={() => handleSendToBot('How does driver OTP verification work?')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-300 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
                    >
                      🔐 Handover OTP
                    </button>
                    <button
                      onClick={() => handleSendToBot('How can I schedule a bulk waste pickup?')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-300 text-slate-300 text-[10px] font-bold rounded-lg border border-slate-700 whitespace-nowrap transition-colors"
                    >
                      🚛 Bulk Pickups
                    </button>
                    <button
                      onClick={() => setActiveChat('admin')}
                      className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-[10px] font-bold rounded-lg border border-emerald-500/40 whitespace-nowrap transition-colors"
                    >
                      🛡️ Human Officer
                    </button>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSendToBot(); }} className="p-2.5 bg-[#111c24] border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Ask EcoBot anything..."
                      className="flex-1 px-4 py-2.5 bg-[#1b2730] border border-slate-700/80 rounded-full text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim() || isBotTyping}
                      className="h-9 w-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                /* MAIN OVERVIEW TABS (Home, Messages, Knowledge Base) */
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* TAB 1: HOME */}
                  {activeTab === 'home' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1">
                        <h1 className="text-xl font-black text-white tracking-tight">
                          Hello {user?.name?.split(' ')[0] || 'Eco Warrior'}! 👋
                        </h1>
                        <p className="text-xs font-semibold text-slate-400">
                          How can we support your recycling today?
                        </p>
                      </div>

                      {/* Status Card */}
                      <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-start space-x-3 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">System Status: All Services Online</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Real-time socket sync & Live Admin support active
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
                          className="p-3.5 bg-slate-800/80 hover:bg-slate-750 border border-slate-750 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm"
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-1">Common Questions</p>
                        {helpArticles.slice(0, 3).map((art) => (
                          <div 
                            key={art.id}
                            onClick={() => {
                              setActiveTab('help');
                              setExpandedFaq(art.id);
                            }}
                            className="p-2.5 bg-slate-800 hover:bg-slate-750 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs group"
                          >
                            <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate pr-2">
                              {art.title}
                            </span>
                            <FaChevronRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
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
                          <div className="flex items-start space-x-3 min-w-0">
                            <span className="text-2xl shrink-0">🛡️</span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                EcoReward Support Team
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {flattenedLiveBubbles[flattenedLiveBubbles.length - 1]?.text || 'Start a conversation with admin support...'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-2">
                            {flattenedLiveBubbles[flattenedLiveBubbles.length - 1]?.time || 'Live'}
                          </span>
                        </div>

                        {/* EcoBot Channel Item */}
                        <div
                          onClick={() => setActiveChat('bot')}
                          className="p-3.5 bg-slate-800/80 hover:bg-slate-750 rounded-2xl cursor-pointer transition-all border border-slate-750 flex items-start justify-between group"
                        >
                          <div className="flex items-start space-x-3 min-w-0">
                            <span className="text-2xl shrink-0">🤖</span>
                            <div className="min-w-0">
                              <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                EcoBot AI Assistant
                              </h4>
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                {botMessages[botMessages.length - 1]?.text || 'Ask me about recycling & rates...'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0 ml-2">
                            {botMessages[botMessages.length - 1]?.time || 'Now'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-center">
                        <button
                          onClick={() => setActiveChat('admin')}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all border border-emerald-400/30 active:scale-98 cursor-pointer"
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
                                  <div className="p-1.5 bg-slate-750 rounded-lg shrink-0">
                                    {art.icon}
                                  </div>
                                  <span className="text-xs font-extrabold text-white">{art.title}</span>
                                </div>
                                <FaChevronRight className={`h-3 w-3 text-slate-400 transition-transform shrink-0 ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`} />
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
            <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-around shrink-0">
              <button
                onClick={() => {
                  setActiveTab('home');
                  setActiveChat(null);
                  setShowChatSearch(false);
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
                  setShowChatSearch(false);
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
                  setShowChatSearch(false);
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
