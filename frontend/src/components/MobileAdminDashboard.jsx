import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaTruck, FaClipboardCheck, FaCoins, FaCheck, FaTimes, 
  FaReply, FaPaperPlane, FaShieldAlt, FaChartLine, FaCheckCircle, 
  FaExclamationTriangle, FaArrowRight, FaHeadset, FaGift, FaCog, 
  FaBolt, FaClock, FaFilter
} from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'drivers' | 'pickups' | 'support'

  const pendingDrivers = drivers.filter(d => !d.isApproved);
  const pendingSupport = supportMessages.filter(m => m.status === 'pending');
  const recentPickups = pickups.slice(0, 6);

  return (
    <div className="space-y-4 pb-4">
      {/* 🛡️ Executive Cyber Live Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-500/30 p-5 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase">
                CORE SYSTEM: LIVE
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 uppercase">
              SUPER ADMIN
            </span>
          </div>

          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Cyber Command</span>
              <FaShieldAlt className="text-indigo-400 text-sm" />
            </h2>
            <p className="text-[11px] text-slate-300 font-medium">
              Real-time municipality operations, smart scrap routing & point audit.
            </p>
          </div>

          {/* Quick Stat Pill Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-black">
                <FaUsers />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Citizens</span>
                <span className="text-base font-black text-white">{analytics?.totalUsers || 0}</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center text-sm font-black">
                <FaTruck />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Active Fleet</span>
                <span className="text-base font-black text-white">{drivers.length || 0}</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
                <FaClipboardCheck />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Pickups Done</span>
                <span className="text-base font-black text-white">{analytics?.totalPickups || 0}</span>
              </div>
            </div>

            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-black">
                <FaCoins />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Circulation</span>
                <span className="text-base font-black text-amber-300">{analytics?.totalPointsAwarded || 0} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ Executive Segment Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-slate-200/60 dark:bg-slate-900 rounded-2xl border border-slate-300/40 dark:border-slate-800 text-xs font-black">
        <button
          type="button"
          onClick={() => { triggerHaptic(15); setActiveTab('overview'); }}
          className={`flex-1 py-2 rounded-xl text-center transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
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
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Drivers
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
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
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
              ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
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
          {/* Quick Action Matrix */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/users'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center text-base">
                <FaUsers />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Users</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/drivers'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center text-base">
                <FaTruck />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Fleet</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/coupons'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-base">
                <FaGift />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Coupons</span>
            </button>

            <button
              onClick={() => { triggerHaptic(20); navigate('/admin/settings'); }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-1.5 shadow-sm active:scale-95 transition"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center text-base">
                <FaCog />
              </div>
              <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">Rates</span>
            </button>
          </div>

          {/* Pending Driver Alert Card */}
          {pendingDrivers.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <FaExclamationTriangle className="text-base" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-rose-900 dark:text-rose-200">
                    {pendingDrivers.length} Drivers Pending Approval
                  </h4>
                  <p className="text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                    Review commercial licenses & EV verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => { triggerHaptic(15); setActiveTab('drivers'); }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow hover:bg-rose-500 cursor-pointer"
              >
                Review
              </button>
            </div>
          )}

          {/* Quick System Rates Card */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/70 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FaBolt className="text-amber-500" />
                <span>Base EcoPoint Setting</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Current: {basePoints} pts/kg</span>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={basePoints}
                  onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none font-bold text-xs"
                />
                <button
                  type="submit"
                  onClick={() => triggerHaptic(20)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Update
                </button>
              </div>

              <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={systemMaintenance} 
                  onChange={(e) => setSystemMaintenance(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Maintenance Mode Active
                </span>
              </label>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: DRIVERS MANAGEMENT */}
      {activeTab === 'drivers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Fleet Verification ({drivers.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">
              {pendingDrivers.length} Pending
            </span>
          </div>

          {drivers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No registered drivers found.
            </div>
          ) : (
            drivers.map((driver) => (
              <div
                key={driver._id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={getAvatarUrl(driver, driver?.name)}
                      onError={(e) => handleAvatarError(e, driver?.name)}
                      alt={driver?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                    />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {driver?.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {driver?.vehicleNumber || driver?.email}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                    driver?.isApproved
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {driver?.isApproved ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>

                {!driver?.isApproved && (
                  <div className="flex items-center space-x-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        triggerHaptic(25);
                        handleApproveDriver(driver._id);
                      }}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <FaCheck />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic(20);
                        handleRejectDriver(driver._id);
                      }}
                      className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-xs font-black flex items-center justify-center space-x-1 cursor-pointer border border-rose-500/20"
                    >
                      <FaTimes />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PICKUPS AUDIT */}
      {activeTab === 'pickups' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Recent Pickups Stream ({pickups.length})
            </h3>
            <button
              onClick={() => navigate('/admin/pickups')}
              className="text-[10px] font-bold text-indigo-500 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All</span>
              <FaArrowRight className="text-[8px]" />
            </button>
          </div>

          {recentPickups.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No pickup records available.
            </div>
          ) : (
            recentPickups.map((pickup) => (
              <div
                key={pickup._id}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 font-bold">
                    #{pickup._id?.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    pickup.status === 'completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : pickup.status === 'assigned'
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {pickup.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-black text-slate-900 dark:text-white">
                      {pickup.wasteType || 'Scrap Material'}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      User: {pickup.user?.name || 'Citizen'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-emerald-500 text-xs">
                      {pickup.weight ? `${pickup.weight} kg` : 'Weight Pending'}
                    </span>
                    <p className="text-[10px] text-amber-500 font-bold">
                      {pickup.pointsAwarded ? `+${pickup.pointsAwarded} pts` : ''}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: CITIZEN SUPPORT DESK */}
      {activeTab === 'support' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Citizen Help Desk
            </h3>
            <span className="text-[10px] font-bold text-amber-500">
              {pendingSupport.length} Pending
            </span>
          </div>

          {supportMessages.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold text-xs bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              No support tickets found.
            </div>
          ) : (
            supportMessages.slice(0, 8).map((msg) => (
              <div
                key={msg._id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      {msg.userName || 'Citizen'}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.category || 'General Query'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    msg.status === 'replied'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {msg.status}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">
                  {msg.message}
                </div>

                {msg.reply && (
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/30 text-[11px] text-indigo-900 dark:text-indigo-200">
                    <span className="font-bold block text-[10px] text-indigo-500">Admin Response:</span>
                    {msg.reply}
                  </div>
                )}

                {msg.status === 'pending' && (
                  <div>
                    {replyingMsgId === msg._id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type official reply to citizen..."
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none font-medium"
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            disabled={sendingReply}
                            onClick={() => handleSendReply(msg._id)}
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                          >
                            <FaPaperPlane className="text-[10px]" />
                            <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingMsgId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(15);
                          setReplyingMsgId(msg._id);
                          setReplyText('');
                        }}
                        className="w-full py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer border border-indigo-200 dark:border-indigo-800"
                      >
                        <FaReply className="text-[10px]" />
                        <span>Reply Ticket</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MobileAdminDashboard;
