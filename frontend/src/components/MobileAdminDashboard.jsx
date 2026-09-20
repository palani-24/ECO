import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaTruck, FaClipboardCheck, FaCoins, FaCheck, FaTimes, 
  FaShieldAlt, FaChartLine, FaCheckCircle, FaExclamationTriangle, 
  FaArrowRight, FaHeadset, FaGift, FaCog, FaBolt, FaClock, 
  FaMapMarkerAlt, FaRecycle, FaWeightHanging, FaFilter
} from 'react-icons/fa';
import { useDistrict } from '../context/DistrictContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const MobileAdminDashboard = ({
  analytics,
  drivers = [],
  pickups = [],
  supportMessages = [],
  basePoints = 5,
  setBasePoints,
  systemMaintenance = false,
  setSystemMaintenance,
  handleSaveSettings,
  handleApproveDriver,
  handleRejectDriver,
  handleSendReply,
  replyText,
  setReplyText,
  replyingMsgId,
  setReplyingMsgId,
  sendingReply = false
}) => {
  const navigate = useNavigate();
  const { currentDistrict, openDistrictModal } = useDistrict();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'drivers' | 'pickups' | 'support'

  const pendingDrivers = drivers.filter(d => !d.isApproved);
  const pendingSupport = supportMessages.filter(m => m.status === 'pending');
  const recentPickups = pickups.slice(0, 5);

  // Waste diversion calculations
  const totalWasteKg = analytics?.totalWeightRecycled || 14850;
  const landfillSavedInr = Math.round(totalWasteKg * 4.2);

  return (
    <div className="space-y-4 pb-4">
      {/* 🛡️ Executive Emerald Live Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-5 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                STATE SWM NETWORK: ONLINE
              </span>
            </div>
            
            <button
              onClick={() => {
                triggerHaptic(20);
                openDistrictModal();
              }}
              className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase flex items-center space-x-1 cursor-pointer active:scale-95 transition"
            >
              <FaMapMarkerAlt className="text-[8px]" />
              <span>{currentDistrict.name}</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>State Executive Command</span>
              <FaShieldAlt className="text-emerald-400 text-sm" />
            </h2>
            <p className="text-[11px] text-slate-300 font-medium">
              Tamil Nadu 38-District Solid Waste Resource & Fleet Telematics Management.
            </p>
          </div>

          {/* 4 Essential SWM Stat Cards */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black shrink-0">
                <FaRecycle />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block truncate">Waste Diverted</span>
                <span className="text-sm sm:text-base font-black text-white">{(totalWasteKg / 1000).toFixed(1)} MT</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-black shrink-0">
                <FaTruck />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block truncate">Active EV Fleet</span>
                <span className="text-sm sm:text-base font-black text-white">{drivers.length || 8} Units</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-black shrink-0">
                <FaClipboardCheck />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block truncate">Pickups Audited</span>
                <span className="text-sm sm:text-base font-black text-white">{analytics?.totalPickups || pickups.length || 42}</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black shrink-0">
                <FaCoins />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block truncate">Tipping Saved</span>
                <span className="text-sm sm:text-base font-black text-amber-300">₹{landfillSavedInr.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ Segment Navigation Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-2xl border border-slate-300/40 dark:border-slate-800 text-xs font-black">
        <button
          type="button"
          onClick={() => { triggerHaptic(15); setActiveTab('overview'); }}
          className={`flex-1 py-2 rounded-xl text-center transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => { triggerHaptic(15); setActiveTab('drivers'); }}
          className={`flex-1 py-2 rounded-xl text-center transition cursor-pointer relative ${
            activeTab === 'drivers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Fleet
          {pendingDrivers.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500 text-white font-black">
              {pendingDrivers.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => { triggerHaptic(15); setActiveTab('pickups'); }}
          className={`flex-1 py-2 rounded-xl text-center transition cursor-pointer ${
            activeTab === 'pickups'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Pickups
        </button>
        <button
          type="button"
          onClick={() => { triggerHaptic(15); setActiveTab('support'); }}
          className={`flex-1 py-2 rounded-xl text-center transition cursor-pointer relative ${
            activeTab === 'support'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Support
          {pendingSupport.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500 text-white font-black">
              {pendingSupport.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Quick Console Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/users'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center text-base">
                <FaUsers />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Citizens</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/drivers'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-base">
                <FaTruck />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Fleet</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/pickups'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center text-base">
                <FaClipboardCheck />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Pickups</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/settings'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base">
                <FaCog />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Rates</span>
            </button>
          </div>

          {/* Pending Driver Alert Card */}
          {pendingDrivers.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-base shrink-0">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                    {pendingDrivers.length} Drivers Awaiting Verification
                  </h4>
                  <p className="text-[10px] text-rose-700 dark:text-rose-400">
                    Review EV registration & commercial license documents.
                  </p>
                </div>
              </div>
              <button
                onClick={() => { triggerHaptic(15); setActiveTab('drivers'); }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-[10px] font-black cursor-pointer active:scale-95 shrink-0"
              >
                Review
              </button>
            </div>
          )}

          {/* Live Pickups Radar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <FaClipboardCheck className="text-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                  Live Dispatch Radar ({currentDistrict.name})
                </h3>
              </div>
              <button
                onClick={() => navigate('/admin/pickups')}
                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1"
              >
                <span>View All</span>
                <FaArrowRight className="text-[8px]" />
              </button>
            </div>

            <div className="space-y-2">
              {recentPickups.map((p) => (
                <div 
                  key={p._id}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {p.user?.name || 'Customer'}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {p.wasteCategory} • {p.estimatedWeight || 5}kg
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                    p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    p.status === 'assigned' ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' :
                    'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVERS */}
      {activeTab === 'drivers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Driver Roster ({drivers.length})
            </span>
            <button
              onClick={() => navigate('/admin/drivers')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              Full Fleet Console →
            </button>
          </div>

          <div className="space-y-2.5">
            {drivers.slice(0, 6).map((d) => (
              <div 
                key={d._id}
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img 
                    src={getAvatarUrl(d.user?.profileImage, d.user?.name)} 
                    onError={(e) => handleAvatarError(e, d.user?.name)}
                    alt={d.user?.name} 
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-emerald-500/30"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {d.user?.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {d.vehicleType || 'E-Rickshaw'} • {d.vehicleNumber || 'TN-38-ECO'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!d.isApproved ? (
                    <button
                      onClick={() => handleApproveDriver(d._id)}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black cursor-pointer active:scale-95 shadow-sm"
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[9px] uppercase">
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PICKUPS */}
      {activeTab === 'pickups' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Pickups Audit ({pickups.length})
            </span>
            <button
              onClick={() => navigate('/admin/pickups')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              Full Registry →
            </button>
          </div>

          <div className="space-y-2">
            {pickups.slice(0, 8).map((p) => (
              <div 
                key={p._id}
                className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {p.user?.name || 'Citizen'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    p.status === 'completed' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                    'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <span>{p.wasteCategory} ({p.estimatedWeight || 5}kg)</span>
                  <span>Driver: {p.driver?.user?.name || 'Unassigned'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPORT DESK */}
      {activeTab === 'support' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-900 dark:text-white">
              Live Support Inbox ({supportMessages.length})
            </span>
            <button
              onClick={() => navigate('/admin/support')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              Open Full Support Hub →
            </button>
          </div>

          <div className="space-y-2.5">
            {supportMessages.slice(0, 5).map((m) => (
              <div 
                key={m._id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {m.user?.name || 'User'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    m.status === 'replied' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-amber-500/20 text-amber-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-2">
                  {m.message}
                </p>
                <button
                  onClick={() => navigate('/admin/support')}
                  className="w-full py-1.5 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-xl cursor-pointer"
                >
                  Reply in Executive Hub
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAdminDashboard;
