import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaPaperPlane, FaMagic, FaCoins, FaTruck, FaLeaf, FaMicrophone } from 'react-icons/fa';

const EcoAIVirtualAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hello! I am EcoAI, your 24/7 Smart Waste Assistant. How can I assist you today?',
      time: 'Just now'
    }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const presetQuestions = [
    { label: '💰 Point Calculation Rate', q: 'How are EcoPoints calculated per kg?' },
    { label: '🔋 E-Waste Guidelines', q: 'What items count as E-Waste?' },
    { label: '📍 Track Driver GPS', q: 'How do I track my assigned pickup driver?' },
    { label: '💸 UPI Cash Withdrawal', q: 'Can I convert EcoPoints directly to GPay cash?' }
  ];

  const handleSendMessage = (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI smart response engine
    setTimeout(() => {
      let botReply = 'I am analyzing your request...';
      const q = query.toLowerCase();

      if (q.includes('point') || q.includes('rate') || q.includes('calculat')) {
        botReply = '💰 EcoPoints Rate: Plastics earn 25 pts/kg, E-Waste earns 50 pts/kg, Paper earns 15 pts/kg, and Metal Cans earn 30 pts/kg. You can convert 2 EcoPoints = ₹1 Cash!';
      } else if (q.includes('e-waste') || q.includes('battery') || q.includes('gadget')) {
        botReply = '🔋 E-Waste includes old laptop batteries, phone chargers, circuit boards, and appliances. Please tape battery terminals before handover!';
      } else if (q.includes('driver') || q.includes('track') || q.includes('gps')) {
        botReply = '📍 Go to "My Pickups & History" and click "Track Live GPS" on any active pickup to see your driver approaching in real-time with ETA countdown!';
      } else if (q.includes('upi') || q.includes('cash') || q.includes('gpay') || q.includes('paytm')) {
        botReply = '💸 Yes! Go to "Wallet & Points", click "Withdraw Cash (UPI)", enter your GPay/PhonePe UPI ID, and transfer funds instantly to your bank account!';
      } else {
        botReply = '♻️ EcoReward is certified ISO 14001 zero-landfill. You can schedule a doorstep pickup anytime or scan waste with our AI Vision Scanner!';
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-50 no-print">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative p-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-full shadow-2xl border-2 border-white/30 flex items-center justify-center group"
          title="Ask EcoAI Assistant"
        >
          <FaRobot className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-amber-400 rounded-full border-2 border-slate-900 animate-ping" />
        </motion.button>
      )}

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[340px] sm:w-[380px] h-[480px] bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Widget Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border-b border-emerald-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <FaRobot className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xs flex items-center space-x-1.5">
                    <span>EcoAI Virtual Assistant</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[8px] font-black rounded-full">24/7 ONLINE</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium">Instant AI Answers & Recycling Guidance</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-950/60">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    <p className="text-[9px] text-right opacity-60 font-bold">{msg.time}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none border border-slate-700 text-xs flex items-center space-x-1">
                    <span>EcoAI typing</span>
                    <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce"></span>
                    <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Chips */}
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto flex space-x-1.5">
              {presetQuestions.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(pq.q)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 text-[10px] font-bold rounded-xl border border-slate-700 whitespace-nowrap transition-colors"
                >
                  {pq.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask EcoAI anything..."
                className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-2xl transition-transform active:scale-95 disabled:opacity-40"
              >
                <FaPaperPlane className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EcoAIVirtualAssistant;
