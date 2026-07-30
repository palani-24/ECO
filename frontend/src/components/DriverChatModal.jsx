import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaPaperPlane, FaUser, FaTruck, FaPhoneAlt, FaCheckDouble } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const DriverChatModal = ({ isOpen, onClose, pickupId, recipientName, recipientRole }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: recipientRole === 'driver' ? 'driver' : 'user',
      senderName: recipientName || 'Ramesh Kumar',
      text: 'Hello! I am on my way to collect your waste pickup. Will reach in 5 minutes.',
      time: '10:18 AM'
    },
    {
      id: 2,
      sender: user?.role || 'user',
      senderName: user?.name || 'You',
      text: 'Thanks! The bags are kept near the security gate.',
      time: '10:19 AM'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: user?.role || 'user',
      senderName: user?.name || 'You',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // Emit live socket event if available
    if (window.socket) {
      window.socket.emit('chat:send', { pickupId, message: newMsg });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg font-black border border-emerald-500/20">
              {recipientRole === 'driver' ? <FaTruck /> : <FaUser />}
            </div>
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                <span>{recipientName || 'Driver Ramesh'}</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                {recipientRole === 'driver' ? 'Collection Driver • Assigned' : 'Customer Client'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a 
              href="tel:+919876543210" 
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              title="Call Phone"
            >
              <FaPhoneAlt className="h-3.5 w-3.5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => {
            const isMe = msg.sender === user?.role;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium space-y-1 shadow-sm ${
                  isMe 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-none'
                }`}>
                  <p>{msg.text}</p>
                  <span className={`text-[9px] font-bold block text-right ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center space-x-2">
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Type message to driver..."
            className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMsg.trim()}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl transition-all shadow disabled:opacity-40"
          >
            <FaPaperPlane className="h-3.5 w-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default DriverChatModal;
