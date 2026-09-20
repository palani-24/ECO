import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaUserShield, FaTimes, 
  FaArrowLeft, FaShieldAlt, FaMapMarkerAlt, FaExclamationTriangle
} from 'react-icons/fa';
import { useDistrict } from '../context/DistrictContext';
import { triggerHaptic } from '../utils/mobileNative';

const MobileAdminHeader = ({ 
  title, 
  showBack = false, 
  pendingAlertsCount = 2 
}) => {
  const navigate = useNavigate();
  const { currentDistrict, openDistrictModal } = useDistrict();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-lg border-b border-emerald-500/20">
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
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/admin')}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <FaUserShield className="text-sm" />
              </div>
              <div className="leading-tight">
                <span className="text-xs font-black tracking-wider uppercase block text-white">
                  ECOREWARD ADMIN
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  State Command Center
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Tamil Nadu District Switcher & Notifications */}
          <div className="flex items-center space-x-2">
            
            {/* District Pill Button */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                openDistrictModal();
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 transition active:scale-95 cursor-pointer shadow-sm"
              title="Filter by Tamil Nadu District"
            >
              <FaMapMarkerAlt className="text-[9px] text-emerald-400" />
              <span className="truncate max-w-[70px] sm:max-w-[100px]">{currentDistrict.name}</span>
            </button>

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
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-400 border-2 border-slate-900 rounded-full animate-ping"></span>
              )}
            </button>
          </div>
        </div>

        {title && (
          <div className="px-4 pb-2 pt-0.5 flex items-center justify-between border-t border-emerald-500/15">
            <h1 className="text-xs font-black text-slate-200 tracking-wide flex items-center space-x-1.5">
              <span>{title}</span>
            </h1>
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase">
              🏛️ TN SWM NETWORK ACTIVE
            </span>
          </div>
        )}
      </header>

      {/* Admin Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-black text-white flex items-center space-x-1.5">
                  <FaShieldAlt className="text-emerald-400" />
                  <span>Executive Operations Alerts</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1 hover:text-white">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 space-y-1">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <FaUserShield />
                    <span>2 Drivers Pending KYC Verification</span>
                  </div>
                  <p className="text-[10px] text-slate-400">EV licenses & background documentation submitted for onboarding.</p>
                </div>
                
                <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-500/30 space-y-1">
                  <div className="flex items-center space-x-2 text-amber-300 font-bold">
                    <FaExclamationTriangle />
                    <span>Doorstep Pickup SLA Alert</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Tiruppur Ward 14 pickup delayed by 20 mins. Reassignment available.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs cursor-pointer transition active:scale-95 shadow-md"
              >
                Acknowledge Alerts
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAdminHeader;
