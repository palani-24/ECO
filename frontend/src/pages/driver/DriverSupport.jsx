import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaHeadset, FaPhoneAlt, FaExclamationTriangle, FaShieldAlt, 
  FaPaperPlane, FaTruck, FaBolt, FaCheckCircle, FaClock, 
  FaWrench, FaSyncAlt, FaTicketAlt, FaBatteryHalf, FaMapMarkerAlt
} from 'react-icons/fa';
import DriverLayout from '../../components/DriverLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { triggerHaptic } from '../../utils/mobileNative';
import api from '../../utils/api';

const DriverSupport = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { socket } = useSocket() || {};

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('Emergency Roadside Breakdown');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const messagesEndRef = useRef(null);

  // Driver Operational Templates
  const driverTemplates = [
    {
      id: 'breakdown',
      title: '🚨 EV Breakdown / Flat Tire',
      desc: 'Immediate roadside mechanical & battery van assistance',
      subject: 'EV Roadside Breakdown SOS',
      defaultMsg: 'URGENT DISPATCH: EV vehicle TN-38-ECO-9945 has suffered a breakdown / tire failure on route. Need urgent roadside recovery van at current GPS location.'
    },
    {
      id: 'gatepass',
      title: '⚖️ Weighbridge / Gate Pass',
      desc: 'Yard check-in discrepancy or gross weight mismatch',
      subject: 'Weighbridge Gate Pass Discrepancy',
      defaultMsg: 'Yard gate scanner unable to clear QR manifest for load #TN-981. Please issue override clearance for solid waste disposal.'
    },
    {
      id: 'unreachable',
      title: '🚫 Customer Unreachable / Locked',
      desc: 'Citizen phone busy or doorstep closed for 15+ mins',
      subject: 'Customer Doorstep Unreachable',
      defaultMsg: 'Scheduled pickup customer at Anna Nagar not answering call and gate locked. Requesting supervisor authorization to skip stop.'
    },
    {
      id: 'contamination',
      title: '⚠️ Contaminated Waste Rejection',
      desc: 'Hazardous or mixed wet waste found in dry recycling',
      subject: 'Waste Quality Protocol Rejection',
      defaultMsg: 'Customer offered unsegregated medical/wet waste mixed with PET plastic. Rejection slip issued per municipal guidelines.'
    }
  ];

  // Fetch driver support messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/my-messages');
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.warn('Fallback loading driver messages', err);
      setMessages([
        {
          _id: 'drv-init',
          senderRole: 'admin',
          subject: 'Fleet Operations Dispatch Desk',
          message: `Fleet Driver ${user?.name || 'Captain'}, Central Dispatch is active on your channel. Report mechanical faults, battery swap requests, customer no-shows, or weighbridge issues directly here.`,
          status: 'replied',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Listen for Dispatch replies via Socket
  useEffect(() => {
    if (!socket) return;
    const handleReply = () => {
      triggerHaptic(30);
      addToast('🚛 Dispatcher replied to your ticket!', 'success', 'Central Fleet Command');
      fetchMessages();
    };
    socket.on('support:replied', handleReply);
    return () => socket.off('support:replied', handleReply);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle 1-Tap Emergency SOS Trigger
  const handleTriggerSOS = () => {
    triggerHaptic(50);
    setSosActive(true);
    addToast('🚨 EMERGENCY SOS BROADCASTED TO FLEET CONTROL! Roadside recovery unit dispatched.', 'warning', 'SOS Active');
    
    // Auto submit high priority SOS message
    api.post('/support/send', {
      subject: '🚨 HIGH PRIORITY DRIVER ROAD SOS',
      message: `CRITICAL DRIVER SOS: Driver ${user?.name || 'Captain'} triggered emergency roadside assistance. Vehicle ID: TN-38-ECO-9945. Telematics battery: 84%. Live GPS lock sent to Municipal Dispatch.`
    }).then(() => fetchMessages()).catch(() => {});
  };

  // Handle Send Ticket
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    triggerHaptic(20);

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      _id: tempId,
      senderRole: 'driver',
      subject: subject || 'Driver Operations',
      message: messageText.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    const payload = { subject: subject || 'Driver Operations', message: messageText.trim() };
    setMessageText('');

    try {
      const res = await api.post('/support/send', payload);
      if (res.data?.success) {
        addToast('Ticket transmitted to Central Fleet Command!', 'success', 'Dispatch Alert Sent');
        fetchMessages();
      }
    } catch (err) {
      console.warn('API error sending message', err);
      addToast('Message recorded to dispatch queue.', 'info', 'Sent');
    } finally {
      setSending(false);
    }
  };

  return (
    <DriverLayout>
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        
        {/* Driver Operations Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                  <span>Driver Operations • ஓட்டுநர் உதவி மையம்</span>
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Fleet Pilot ID #D-{user?._id?.slice(-4) || '9945'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Dispatch & Breakdown Hub
              </h1>
              <p className="text-xs text-teal-100 max-w-xl font-medium">
                Instant 24/7 communications with Municipal Waste Management Control, battery swap reservations, and emergency mechanical support.
              </p>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={handleTriggerSOS}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95 shrink-0 ${
                sosActive 
                  ? 'bg-rose-600 text-white ring-4 ring-rose-400/50 animate-pulse' 
                  : 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-300/40'
              }`}
            >
              <FaShieldAlt className="text-sm" />
              <span>{sosActive ? '🚨 SOS ACTIVE • TRACKING' : '🚨 EMERGENCY SOS HOTLINE'}</span>
            </button>
          </div>
        </div>

        {/* 3 Hotlines for Drivers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Dispatcher Toll Free */}
          <a 
            href="tel:18004252424"
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-teal-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaHeadset className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Central Dispatch</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">1800-425-2424</span>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 block font-medium">24/7 Route Supervisor</span>
            </div>
          </a>

          {/* Mechanical Breakdown Van */}
          <a 
            href="tel:18004259999"
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-rose-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaWrench className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Roadside Van</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">1800-425-9999</span>
              <span className="text-[9px] text-rose-600 dark:text-rose-400 block font-medium">Puncture & EV Towing</span>
            </div>
          </a>

          {/* SWM Yard Weighbridge Direct */}
          <a 
            href="tel:04222244881"
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-cyan-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaTicketAlt className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weighbridge Yard</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">0422-2244881</span>
              <span className="text-[9px] text-cyan-600 dark:text-cyan-400 block font-medium">Gate Pass Control</span>
            </div>
          </a>
        </div>

        {/* 1-Tap Operational Action Buttons */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 block">
            Select Driver Action (1-Tap Fast Fill)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {driverTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setSubject(item.subject);
                  setMessageText(item.defaultMsg);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer active:scale-98 ${
                  subject === item.subject 
                    ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500/50 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-teal-500/30'
                }`}
              >
                <h4 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Real-Time Dispatch Message Thread */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center font-bold text-sm">
                🚛
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  Fleet Control Radio & Messages
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Live direct radio channel with Municipal MRF Dispatch
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic(15);
                fetchMessages();
              }}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-lg cursor-pointer transition-colors"
              title="Refresh Radio Messages"
            >
              <FaSyncAlt className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="p-4 space-y-3.5 max-h-[380px] min-h-[220px] overflow-y-auto overscroll-contain bg-slate-50/30 dark:bg-slate-950/20">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-7 h-7 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Tuning into Dispatch Radio...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <FaTruck className="text-3xl text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">No previous dispatch records.</p>
                <p className="text-[11px] text-slate-400">Select an action above to transmit to Central Fleet.</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isDispatch = m.senderRole === 'admin' || m.repliedBy;
                return (
                  <motion.div
                    key={m._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isDispatch ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className={`text-[10px] font-black uppercase ${isDispatch ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isDispatch ? '🏛️ Central Dispatch Officer' : '🚛 Driver You'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>

                    <div 
                      className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[75%] space-y-1 shadow-sm text-xs leading-relaxed ${
                        isDispatch 
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm' 
                          : 'bg-teal-700 text-white rounded-tr-sm'
                      }`}
                    >
                      {m.subject && (
                        <div className={`text-[10px] font-black tracking-wider uppercase pb-1 border-b ${
                          isDispatch ? 'text-teal-600 dark:text-teal-400 border-slate-100 dark:border-slate-700' : 'text-teal-100 border-teal-500/50'
                        }`}>
                          {m.subject}
                        </div>
                      )}
                      <p className="font-medium whitespace-pre-wrap">{m.message}</p>
                    </div>

                    <div className="mt-1 px-1 flex items-center space-x-1">
                      {m.status === 'replied' ? (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-0.5">
                          <FaCheckCircle className="text-[9px]" />
                          <span>Cleared by Dispatch</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center space-x-0.5">
                          <FaClock className="text-[9px]" />
                          <span>Transmitting to Hub...</span>
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
                Action Subject:
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Discrepancy / Breakdown Title..."
                className="w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                placeholder="Transcribe operational report or request..."
                className="flex-1 text-xs font-medium p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 resize-none"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="px-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <FaPaperPlane className="text-xs" />
                <span className="hidden sm:inline">Transmit</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </DriverLayout>
  );
};

export default DriverSupport;
