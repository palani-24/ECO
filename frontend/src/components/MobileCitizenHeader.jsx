import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../utils/mobileNative';

const MobileCitizenHeader = ({ 
  title, 
  showBack = false, 
  showSearch = false, 
  searchQuery = '', 
  onSearchChange = () => {}, 
  onOpenScanner = () => {},
  onOpenMenu = () => {} 
}) => {
  const navigate = useNavigate();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const [showNotificationModal, setShowNotificationModal] = useState(false);

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
                  onOpenMenu();
                }}
                className="p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer text-white"
                aria-label="Open menu"
              >
                <FaBars className="text-lg" />
              </button>
            )}

            {/* App Title */}
            <div 
              className="flex items-center space-x-1.5 cursor-pointer" 
              onClick={() => navigate('/dashboard')}
            >
              <span className="text-base font-black tracking-wider uppercase">
                ECOREWARD
              </span>
            </div>
          </div>

          {/* Right Controls: Language & Notification */}
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (setLang) setLang(lang === 'ta' ? 'en' : 'ta');
              }}
              className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/25 uppercase cursor-pointer transition active:scale-95"
              title="Switch Language"
            >
              {lang === 'ta' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Notification Bell */}
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer text-white"
              aria-label="Notifications"
            >
              <FaBell className="text-base" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-emerald-700 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* Optional Search Bar or Title Strip */}
        {showSearch && (
          <div className="px-4 pb-3">
            <div className="flex items-center bg-white dark:bg-slate-900 rounded-full px-3.5 py-2 shadow-inner border border-emerald-400/30 text-slate-800 dark:text-slate-100">
              <FaSearch className="text-slate-400 text-xs mr-2 flex-shrink-0" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search pickups or scrap..."
                className="w-full bg-transparent text-xs font-semibold placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button onClick={() => onSearchChange('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
                  <FaTimes className="text-xs" />
                </button>
              )}
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic(30);
                  onOpenScanner();
                }}
                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 active:scale-90 transition"
                title="Scan QR Code"
              >
                <FaQrcode className="text-sm" />
              </button>
            </div>
          </div>
        )}

        {title && !showSearch && (
          <div className="px-4 pb-2.5 flex items-center justify-between">
            <h1 className="text-sm font-extrabold text-white tracking-wide flex items-center space-x-1.5">
              <span>{title}</span>
            </h1>
          </div>
        )}
      </header>

      {/* Citizen Notification Modal */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FaBell className="text-emerald-500" />
                  <span>Citizen Notifications</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🔔 Welcome to EcoReward!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Turn your recyclable scrap into EcoPoints & direct bank cash payouts.</p>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🚚 Daily Pickup Service Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">EV Drivers are collecting dry scrap across Chennai zones.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileCitizenHeader;
