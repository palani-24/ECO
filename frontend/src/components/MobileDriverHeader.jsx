import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaTruck, FaBolt, FaTimes, 
  FaArrowLeft, FaCheckCircle, FaBatteryThreeQuarters,
  FaSun, FaMoon
} from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';
import { useToast } from '../context/ToastContext';

const MobileDriverHeader = ({ 
  title, 
  showBack = false, 
  isOnline = true, 
  onToggleDuty = () => {},
  batteryLevel = 84 
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('eco_driver_theme') || 'light');

  const handleToggleTheme = () => {
    triggerHaptic(20);
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('eco_driver_theme', next);
    window.dispatchEvent(new CustomEvent('driver-theme-change', { detail: { theme: next } }));
    if (next === 'light') {
      document.documentElement.classList.remove('dark');
      addToast('☀️ Eco Daylight White Theme Activated', 'info', 'Theme Changed');
    } else {
      document.documentElement.classList.add('dark');
      addToast('🌙 Night Dark Theme Activated', 'info', 'Theme Changed');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md">
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
                className="p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer text-white"
                aria-label="Go back"
              >
                <FaArrowLeft className="text-base" />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  triggerHaptic(20);
                  window.dispatchEvent(new CustomEvent('toggle-mobile-driver-drawer'));
                }}
                className="p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer text-white"
                aria-label="Open Driver Operations Menu"
              >
                <FaBars className="text-lg" />
              </button>
            )}

            {/* App Title & Role Badge */}
            <div 
              className="flex items-center space-x-2 cursor-pointer" 
              onClick={() => navigate('/driver')}
            >
              <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center text-white shadow-inner">
                <FaTruck className="text-sm" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-black tracking-wider uppercase block">
                  ECOREWARD
                </span>
                <span className="text-[9px] font-mono text-emerald-100 font-bold uppercase tracking-wider block">
                  EV Fleet Driver
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Duty Toggle, Battery & Notifications */}
          <div className="flex items-center space-x-2">
            
            {/* Online / Offline Duty Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(25);
                onToggleDuty();
              }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer border ${
                isOnline 
                  ? 'bg-white/20 text-white border-white/30' 
                  : 'bg-rose-500/30 text-rose-100 border-rose-400/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-white animate-pulse' : 'bg-rose-300'}`}></span>
              <span>{isOnline ? 'ON DUTY' : 'OFF DUTY'}</span>
            </button>

            {/* EV Battery Indicator */}
            <div className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded-lg bg-white/15 border border-white/20 text-[10px] font-mono font-bold text-white">
              <FaBatteryThreeQuarters className="text-emerald-200" />
              <span>{batteryLevel}%</span>
            </div>

            {/* Double Theme (White / Dark) Toggle Pill */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition active:scale-95 cursor-pointer text-white flex items-center justify-center text-xs"
              title={theme === 'dark' ? 'Switch to Eco Daylight Theme' : 'Switch to Night Dark Mode'}
            >
              {theme === 'dark' ? <FaSun className="text-amber-300 text-sm" /> : <FaMoon className="text-white text-sm" />}
            </button>

            {/* Notification Bell */}
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer text-white"
              aria-label="Driver Notifications"
            >
              <FaBell className="text-base" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-300 border border-emerald-700 rounded-full animate-ping"></span>
            </button>
          </div>
        </div>

        {title && (
          <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between border-t border-white/15">
            <h1 className="text-xs font-black text-white/95 tracking-wide flex items-center space-x-1.5">
              <span>{title}</span>
            </h1>
          </div>
        )}
      </header>

      {/* Driver Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FaBell className="text-emerald-500" />
                  <span>Dispatch Alerts</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">📦 New Pickup In Anna Nagar</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Plastic & E-Waste (~8kg) requested for 11:00 AM collection.</p>
                </div>
                <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">⚡ Fast Charger Hub Available</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">CMRL Koyambedu Fast Charger 60kW slot open now.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Dismiss Alerts
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDriverHeader;
