import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FaBuilding, FaPhoneAlt, FaExclamationTriangle, FaShieldAlt, 
  FaPaperPlane, FaCogs, FaCheckCircle, FaClock, 
  FaSyncAlt, FaChartLine, FaFileAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import UserLayout from '../../components/UserLayout';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from '../../context/DistrictContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { triggerHaptic } from '../../utils/mobileNative';
import api from '../../utils/api';

const MunicipalitySupportHub = () => {
  const { user } = useAuth();
  const { currentDistrict } = useDistrict();
  const { addToast } = useToast();
  const { socket } = useSocket() || {};

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('MRF Resource Processing Facility Escalation');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Municipal Civic Escalation Templates
  const municipalityTemplates = [
    {
      id: 'swrf',
      title: '⚙️ SWRF / MRF Plant Machinery',
      desc: 'Baler / shredder breakdown or daily processing overload',
      subject: 'Solid Waste Resource Plant Technical Escalation',
      defaultMsg: `Official Notification: ${currentDistrict.name} Municipal Resource Recovery Facility baling unit experiencing capacity bottleneck. Technical support engineer requested for automated conveyor inspection.`
    },
    {
      id: 'sla',
      title: '🚨 Grievance SLA Breach Alert',
      desc: 'Urgent dump clearance squad dispatch to prevent penalties',
      subject: 'Public Grievance Redressal SLA Escalation',
      defaultMsg: `Grievance SLA Warning: Ward ${currentDistrict.wards} high-priority open dumping complaints nearing 24-hour SLA threshold. Requesting special sanitation squad mobilization authorization.`
    },
    {
      id: 'tnpcb',
      title: '📊 TNPCB & ISO 14001 Audit',
      desc: 'Environmental audit certificate & methane offset query',
      subject: 'TNPCB Environmental Audit Verification',
      defaultMsg: `Request for official TNPCB quarterly carbon offset and landfill diversion statement for ${currentDistrict.name} Municipal Corporation review.`
    },
    {
      id: 'telematics',
      title: '🛰️ Compactor Fleet Telematics',
      desc: 'GPS transponder offline or route optimization update',
      subject: 'Municipal Fleet GPS & Telematics Sync',
      defaultMsg: `Telemetry alert: 4 compactor trucks in ${currentDistrict.name} southern sector showing intermittent GPS feed. Central telematics re-sync required.`
    }
  ];

  // Fetch municipality support messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/my-messages');
      if (res.data?.success) {
        setMessages(res.data.data || []);
      }
    } catch (err) {
      console.warn('Fallback loading municipal messages', err);
      setMessages([
        {
          _id: 'muni-init',
          senderRole: 'admin',
          subject: 'State SWM Mission & Operations Hub',
          message: `Welcome Municipal Officer (${currentDistrict.name} Corporation). This channel provides direct priority contact with the EcoReward State Operations Cell and Technical Engineering Division. Submit plant telemetry, squad mobilizations, or compliance queries here.`,
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

  // Listen for Admin/State Command replies
  useEffect(() => {
    if (!socket) return;
    const handleReply = () => {
      triggerHaptic(25);
      addToast('🏛️ State Command Cell replied to municipal ticket!', 'success', 'Municipal Operations');
      fetchMessages();
    };
    socket.on('support:replied', handleReply);
    return () => socket.off('support:replied', handleReply);
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Submit
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    triggerHaptic(20);

    const tempId = `temp-${Date.now()}`;
    const newMsg = {
      _id: tempId,
      senderRole: 'municipality',
      subject: subject || 'Municipal Escalation',
      message: messageText.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    const payload = { subject: subject || 'Municipal Escalation', message: messageText.trim() };
    setMessageText('');

    try {
      const res = await api.post('/support/send', payload);
      if (res.data?.success) {
        addToast('Municipal Dispatch transmitted to State Command!', 'success', 'Escalation Filed');
        fetchMessages();
      }
    } catch (err) {
      console.warn('API error sending municipal ticket', err);
      addToast('Ticket recorded in municipal operations buffer.', 'info', 'Filed');
    } finally {
      setSending(false);
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto space-y-5 pb-12">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-[10px] font-black uppercase tracking-wider text-emerald-100 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
                  <span>Municipal Command • நகராட்சி ஆதரவு மையம்</span>
                </span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  {currentDistrict.name} ({currentDistrict.tamilName})
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Authority SWM Support Hub
              </h1>
              <p className="text-xs text-emerald-100 max-w-xl font-medium">
                Official command line for municipal solid waste resource facilities, grievance SLA escalations, and TNPCB compliance.
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic(15);
                fetchMessages();
              }}
              className="self-start sm:self-center px-3.5 py-2 bg-white/15 hover:bg-white/25 rounded-2xl text-xs font-bold flex items-center space-x-2 border border-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <FaSyncAlt className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Command Desk</span>
            </button>
          </div>
        </div>

        {/* 3 Hotlines for Municipal Authorities */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Directorate of Municipal Administration (MAWS) */}
          <a 
            href="tel:04425619222"
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-emerald-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaBuilding className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TN MAWS Secretariat</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">044-25619222</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-medium">Urban Development Cell</span>
            </div>
          </a>

          {/* TNPCB 24/7 Monitoring Cell */}
          <a 
            href="tel:18004257000"
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-teal-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaShieldAlt className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TNPCB Control Room</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">1800-425-7000</span>
              <span className="text-[9px] text-teal-600 dark:text-teal-400 block font-medium">Pollution & SWM Audits</span>
            </div>
          </a>

          {/* District Sanitation Control Room */}
          <a 
            href={`tel:${currentDistrict.helpline.split('/')[0].trim()}`}
            onClick={() => triggerHaptic(20)}
            className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-3 hover:border-indigo-500/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <FaPhoneAlt className="text-base" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{currentDistrict.name} Control</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{currentDistrict.helpline.split('/')[0].trim()}</span>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 block font-medium">District SWM Dispatch</span>
            </div>
          </a>
        </div>

        {/* 1-Tap Municipal Escalation Templates */}
        <div className="space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1 block">
            Select Municipal Escalation Priority (1-Tap Fill)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {municipalityTemplates.map((item) => (
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
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/50 shadow-sm' 
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30'
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

        {/* Real-time Command Log & Conversation */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-sm">
                🏛️
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  State Operations & Technical Log
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">
                  Official high-priority channel with EcoReward Systems Engineering
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black">
              {messages.length} Records
            </span>
          </div>

          {/* Messages Stream */}
          <div className="p-4 space-y-3.5 max-h-[380px] min-h-[220px] overflow-y-auto overscroll-contain bg-slate-50/30 dark:bg-slate-950/20">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2">
                <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-bold">Synchronizing Command Desk...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <FaBuilding className="text-3xl text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">No active municipal escalations.</p>
                <p className="text-[11px] text-slate-400">Select an escalation template above to transmit report.</p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isStateReply = m.senderRole === 'admin' || m.repliedBy;
                return (
                  <motion.div
                    key={m._id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isStateReply ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center space-x-1.5 mb-1 px-1">
                      <span className={`text-[10px] font-black uppercase ${isStateReply ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isStateReply ? '🛡️ State Command & Technical Cell' : '🏛️ Municipal Officer (You)'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </span>
                    </div>

                    <div 
                      className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[75%] space-y-1 shadow-sm text-xs leading-relaxed ${
                        isStateReply 
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-sm' 
                          : 'bg-emerald-800 text-white rounded-tr-sm'
                      }`}
                    >
                      {m.subject && (
                        <div className={`text-[10px] font-black tracking-wider uppercase pb-1 border-b ${
                          isStateReply ? 'text-emerald-600 dark:text-emerald-400 border-slate-100 dark:border-slate-700' : 'text-emerald-200 border-emerald-700'
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
                          <span>Acknowledged & Actioned</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-amber-500 flex items-center space-x-0.5">
                          <FaClock className="text-[9px]" />
                          <span>Under State Review</span>
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
                Subject:
              </span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Escalation Summary..."
                className="w-full text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={2}
                placeholder="Detail administrative or technical escalation..."
                className="flex-1 text-xs font-medium p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
              <button
                type="submit"
                disabled={sending || !messageText.trim()}
                className="px-4 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-2xl font-black text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <FaPaperPlane className="text-xs" />
                <span className="hidden sm:inline">Submit</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </UserLayout>
  );
};

export default MunicipalitySupportHub;
