import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaUserShield, FaServer, FaTimes, 
  FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaCheckCircle
} from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';

const MobileAdminHeader = ({ 
  title, 
  showBack = false, 
  pendingAlertsCount = 3 
}) => {
  const navigate = useNavigate();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg border-b border-indigo-500/20">
        <div className="px-4 py-2.5 flex items-center justify-between">
          
          {/* Left: Back or Drawer Menu Button */}
          <div className="flex items-center space-x-2">
            {showBack ? (
              <button 
                type="button" 
                onClick={() => {
                  triggerHaptic(20);
                  navigate(-1);
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition active:scale-95 cursor-pointer text-white"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-base" />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  triggerHaptic(20);
                  window.dispatchEvent(new CustomEvent('toggle-mobile-admin-drawer'));
                }}
                className="p-2 rounded-xl hover:bg-white/10 transition active:scale-95 cursor-pointer text-white"
                aria-label="Open Admin Command Drawer"
              >
                <FaBars className="text-lg" />
              </button>
            )}

            {/* App Title & Role Badge */}
            <div 
              className="flex items-center space-x-1.5 cursor-pointer" 
              onClick={() => navigate('/admin')}
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <FaUserShield className="text-xs" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-black tracking-wider uppercase block">
                  ECOREWARD
                </span>
                <span className="text-[9px] font-mono text-indigo-300 font-bold uppercase tracking-wider block">
                  Admin Command
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Server Heartbeat & Notifications */}
          <div className="flex items-center space-x-2">
            
            {/* Server Online Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE</span>
            </div>

            {/* Notification Bell */}
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl hover:bg-white/10 transition active:scale-95 cursor-pointer text-white"
              aria-label="Admin Notifications"
            >
              <FaBell className="text-base" />
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 border border-slate-900 rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {title && (
          <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between border-t border-white/10">
            <h1 className="text-xs font-black text-slate-200 tracking-wide flex items-center space-x-1.5">
              <span>{title}</span>
            </h1>
          </div>
        )}
      </header>

      {/* Admin Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-black text-white flex items-center space-x-1.5">
                  <FaUserShield className="text-indigo-400" />
                  <span>Admin System Alerts</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1 hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-indigo-950/40 rounded-xl border border-indigo-500/30">
                  <p className="font-bold text-indigo-200">👥 2 Drivers Pending Verification</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">EV documents submitted for driver licensing audit.</p>
                </div>
                <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/30">
                  <p className="font-bold text-amber-300">💬 3 Support Tickets Awaiting Reply</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Citizen inquiries regarding scrap rate payouts.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close Alerts
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAdminHeader;
