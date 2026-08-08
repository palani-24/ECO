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
  FaArrowLeft, FaLeaf, FaExternalLinkAlt
} from 'react-icons/fa';

const SupportChatWidget = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'messages' | 'help'
  const [activeChat, setActiveChat] = useState(null); // Null or selected chat object
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'chat-ecobot',
      sender: 'EcoBot AI Assistant',
      role: 'bot',
      avatar: '🤖',
      time: 'Just now',
      preview: 'How can I help you get the most out of your recycling today?',
      unread: false,
      thread: [
        {
          id: 'm1',
          sender: 'bot',
          text: 'Hello! I am EcoBot, your 24/7 AI Assistant. You can ask me about waste rates, driver verification, points redemption, or account settings!',
          time: 'Just now'
        }
      ]
    },
    {
      id: 'chat-admin',
      sender: 'EcoReward Support Team',
      role: 'admin',
      avatar: '🛡️',
      time: '3d ago',
      preview: 'Your driver scale adjustment (+350 EcoPoints) was approved.',
      unread: false,
      thread: [
        {
          id: 'm2',
          sender: 'user',
          text: 'Can you verify why my pickup weight showed 10kg metal?',
          time: '3d ago'
        },
        {
          id: 'm3',
          sender: 'admin',
          text: 'Hello! Your driver scale verified 10.0kg of Metal waste. Your wallet was credited with +350 EcoPoints.',
          time: '3d ago'
        }
      ]
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
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
      answer: 'Points are calculated at 35 EcoPoints per kilogram of verified waste. 1,000 EcoPoints can be redeemed for ₹250 cash via UPI, Amazon Vouchers, or Green Store coupons.'
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

  // Auto-scroll chat window
  useEffect(() => {
    if (activeChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat, isTyping]);

  // AI Response Simulation
  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    const userText = messageText.trim();
    setMessageText('');

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update active chat thread
    const updatedThread = [...activeChat.thread, newMsg];
    const updatedChat = { ...activeChat, thread: updatedThread, preview: userText, time: 'Just now' };
    
    setActiveChat(updatedChat);
    setChatHistory(prev => prev.map(c => c.id === activeChat.id ? updatedChat : c));

    // Generate AI Bot response if chatting with EcoBot
    if (activeChat.role === 'bot') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        let botReply = "Thank you for asking! I'm EcoBot AI. Your pickup request, points, and wallet balance are synchronized live with MongoDB.";
        
        const lower = userText.toLowerCase();
        if (lower.includes('point') || lower.includes('reward') || lower.includes('rate')) {
          botReply = "EcoPoints are awarded at 35 EcoPoints per kilogram. For example, 10kg Metal = 350 EcoPoints (₹250 cash value)! You can redeem them anytime under Rewards.";
        } else if (lower.includes('pickup') || lower.includes('schedule') || lower.includes('weight')) {
          botReply = "You can schedule multi-material pickups (e.g. 10kg Metal, 5kg Plastic, 3.34kg Paper) from the 'Schedule Pickup' page with decimal weight precision.";
        } else if (lower.includes('driver') || lower.includes('otp') || lower.includes('handover')) {
          botReply = "The 4-digit Handover OTP is shown on your active pickup order card. Share it with your driver when they arrive to verify the collection.";
        } else if (lower.includes('password') || lower.includes('login') || lower.includes('account')) {
          botReply = "You can update your account password under Profile Settings or click 'Forgot Password' on the Login page.";
        }

        const botMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const finalThread = [...updatedThread, botMsg];
        const finalChat = { ...updatedChat, thread: finalThread, preview: botReply, time: 'Just now' };
        setActiveChat(finalChat);
        setChatHistory(prev => prev.map(c => c.id === activeChat.id ? finalChat : c));
      }, 1000);
    }
  };

  // Start new question chat
  const handleStartNewQuestion = () => {
    const newChatId = `chat-${Date.now()}`;
    const newChatObj = {
      id: newChatId,
      sender: 'EcoBot AI Assistant',
      role: 'bot',
      avatar: '🤖',
      time: 'Just now',
      preview: 'How can I assist you with your recycling inquiry?',
      unread: false,
      thread: [
        {
          id: `m-${Date.now()}`,
          sender: 'bot',
          text: `Hello ${user?.name || 'there'}! I am EcoBot AI. Ask me any question about your waste pickups, points, or driver verification.`,
          time: 'Just now'
        }
      ]
    };
    setChatHistory(prev => [newChatObj, ...prev]);
    setActiveChat(newChatObj);
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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-full shadow-2xl hover:shadow-emerald-500/30 flex items-center space-x-2.5 border border-emerald-400/40 group"
        >
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-lg">
              🌱
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-300 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-black tracking-tight leading-none">Need Help?</p>
            <p className="text-[10px] text-emerald-200 font-bold leading-tight">Ask EcoBot AI</p>
          </div>
        </motion.button>
      )}

      {/* Main Support Floating Widget (Matching MongoDB Atlas Reference Screenshots) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[410px] h-[580px] bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden font-sans"
          >
            {/* Header Area */}
            <div className="relative p-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800/80 flex items-center justify-between">
              
              {activeChat ? (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setActiveChat(null)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <FaArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{activeChat.avatar}</span>
                    <div>
                      <h3 className="text-sm font-black text-white">{activeChat.sender}</h3>
                      <p className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Active Support Channel</span>
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
            <div className="flex-1 overflow-y-auto bg-slate-900 p-5 space-y-4">
              
              {/* CHAT THREAD VIEW (If user opened a chat) */}
              {activeChat ? (
                <div className="flex flex-col h-full space-y-4">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {activeChat.thread.map((m) => {
                      const isMe = m.sender === 'user';
                      return (
                        <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-1 shadow-md ${
                            isMe 
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none font-medium' 
                              : 'bg-slate-800/90 text-slate-200 border border-slate-750 rounded-bl-none font-medium'
                          }`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                            <span className="text-[9px] text-slate-400 block text-right font-mono">{m.time}</span>
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="p-3 bg-slate-800 rounded-2xl rounded-bl-none text-xs text-slate-400 flex items-center space-x-1.5">
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce"></span>
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSendMessage} className="pt-2 border-t border-slate-800 flex items-center space-x-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type your question..."
                      className="flex-1 px-4 py-2.5 bg-slate-800/90 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!messageText.trim()}
                      className="p-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black rounded-xl transition-all shadow-md"
                    >
                      <FaPaperPlane className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  {/* TAB 1: HOME (MATCHING SCREENSHOT 1) */}
                  {activeTab === 'home' && (
                    <div className="space-y-5 animate-fadeIn">
                      {/* Greeting Header */}
                      <div className="space-y-1">
                        <h1 className="text-2xl font-extrabold text-white tracking-tight">
                          Hello {user?.name?.split(' ')[0] || 'Kings111'}!
                        </h1>
                        <p className="text-xl font-bold text-slate-300">
                          How can we help?
                        </p>
                      </div>

                      {/* Status Card (Matching Screenshot 1) */}
                      <div className="p-4 bg-slate-800/80 border border-slate-750 rounded-2xl flex items-start space-x-3 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <FaCheck className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">Status: All Systems Operational</p>
                          <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                            Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>

                      {/* Search Bar (Matching Screenshot 1) */}
                      <div className="relative">
                        <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for help"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 text-white placeholder-slate-400 rounded-xl border border-slate-750 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Quick Help Accordion Items (Matching Screenshot 1) */}
                      <div className="space-y-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-750">
                        {filteredArticles.slice(0, 4).map((art) => (
                          <div 
                            key={art.id}
                            onClick={() => {
                              setActiveTab('help');
                              setExpandedFaq(art.id);
                            }}
                            className="p-3 bg-slate-800 hover:bg-slate-750 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs group"
                          >
                            <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors flex items-center space-x-2">
                              <span>{art.title}</span>
                            </span>
                            <FaChevronRight className="h-3 w-3 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        ))}
                      </div>

                      {/* Ask EcoBot Quick Card */}
                      <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🤖</span>
                          <div>
                            <p className="text-xs font-black text-white">Have a specific question?</p>
                            <p className="text-[10px] text-emerald-300 font-medium">Ask EcoBot AI for 24/7 instant guidance</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('messages');
                            handleStartNewQuestion();
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-md transition-all"
                        >
                          Ask AI
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: MESSAGES (MATCHING SCREENSHOT 2) */}
                  {activeTab === 'messages' && (
                    <div className="space-y-4 animate-fadeIn flex flex-col h-full justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <h2 className="text-lg font-extrabold text-white">Messages</h2>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active Chats
                          </span>
                        </div>

                        {/* List of Messages */}
                        <div className="space-y-2">
                          {chatHistory.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => setActiveChat(c)}
                              className="p-3.5 bg-slate-800/80 hover:bg-slate-750 rounded-2xl cursor-pointer transition-all border border-slate-750 flex items-start justify-between group"
                            >
                              <div className="flex items-start space-x-3">
                                <span className="text-2xl">{c.avatar}</span>
                                <div>
                                  <h4 className="text-xs font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                                    {c.sender}
                                  </h4>
                                  <p className="text-[11px] text-slate-400 font-medium line-clamp-1 mt-0.5">
                                    {c.preview}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                                {c.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Primary Floating "Ask a question" Button (Matching Screenshot 2) */}
                      <div className="pt-4 flex justify-center">
                        <button
                          onClick={handleStartNewQuestion}
                          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all border border-emerald-400/30 active:scale-98"
                        >
                          <span>Ask a question</span>
                          <FaQuestionCircle className="h-4 w-4 text-emerald-200" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: HELP (KNOWLEDGE BASE) */}
                  {activeTab === 'help' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="border-b border-slate-800 pb-2">
                        <h2 className="text-lg font-extrabold text-white">Help & Knowledge Base</h2>
                        <p className="text-[10px] text-slate-400 font-medium">Browse articles or search for instant solutions.</p>
                      </div>

                      {/* Search Bar */}
                      <div className="relative">
                        <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filter help articles..."
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 text-white placeholder-slate-400 rounded-xl border border-slate-750 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {/* FAQs Expanders */}
                      <div className="space-y-2">
                        {filteredArticles.map((art) => {
                          const isExpanded = expandedFaq === art.id;
                          return (
                            <div 
                              key={art.id} 
                              className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-750 transition-all space-y-2"
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
                </>
              )}

            </div>

            {/* BOTTOM NAVIGATION BAR (MATCHING SCREENSHOT 1 & SCREENSHOT 2) */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-around">
              
              {/* Home Tab Button */}
              <button
                onClick={() => {
                  setActiveTab('home');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1.5 rounded-xl transition-all ${
                  activeTab === 'home' && !activeChat
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaHome className="h-5 w-5" />
                <span className="text-[10px]">Home</span>
              </button>

              {/* Messages Tab Button */}
              <button
                onClick={() => {
                  setActiveTab('messages');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1.5 rounded-xl transition-all ${
                  (activeTab === 'messages' || activeChat)
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaRegCommentAlt className="h-5 w-5" />
                <span className="text-[10px]">Messages</span>
              </button>

              {/* Help Tab Button */}
              <button
                onClick={() => {
                  setActiveTab('help');
                  setActiveChat(null);
                }}
                className={`flex flex-col items-center space-y-1 px-4 py-1.5 rounded-xl transition-all ${
                  activeTab === 'help' && !activeChat
                    ? 'text-emerald-400 font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
              >
                <FaHeadset className="h-5 w-5" />
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
