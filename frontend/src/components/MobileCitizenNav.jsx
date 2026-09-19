import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaCoins, FaBars, 
  FaTimes, FaUsers, FaLeaf, FaUser, FaSignOutAlt, FaAward, FaTruck, 
  FaStore, FaCamera, FaCertificate, FaShareAlt, FaBuilding, 
  FaExclamationTriangle, FaComments, FaTrophy, FaWallet, FaPlus,
  FaGift, FaBolt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const MobileCitizenNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname, location.search]);

  // Global listener for top 3-line hamburger menu toggle
  useEffect(() => {
    const handleToggle = () => setShowDrawer(prev => !prev);
    window.addEventListener('toggle-mobile-citizen-drawer', handleToggle);
    return () => window.removeEventListener('toggle-mobile-citizen-drawer', handleToggle);
  }, []);

  const handleAction = (eventName) => {
    setShowDrawer(false);
    triggerHaptic(25);
    window.dispatchEvent(new CustomEvent(eventName));
  };

  const handleNavigate = (path) => {
    setShowDrawer(false);
    triggerHaptic(20);
    navigate(path);
  };

  const handleLogout = () => {
    setShowDrawer(false);
    logout();
    navigate('/login');
  };

  const isCurrent = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const walletPoints = user?.points || 0;
  const inrEquivalent = Math.round(walletPoints * 0.25);

  return (
    <>
      {/* Elevated 5-Item Sticky Bottom Navigation Bar with Center FAB */}
      <nav 
        aria-label="Citizen Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-2xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
          
          {/* Tab 1: Home Dashboard */}
          <NavLink
            to="/dashboard"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              isCurrent('/dashboard')
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/dashboard') ? 'bg-emerald-500/15 scale-105' : ''}`}>
              <FaHome className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </NavLink>

          {/* Tab 2: My Pickups & Tracking */}
          <NavLink
            to="/my-pickups"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              isCurrent('/my-pickups')
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/my-pickups') ? 'bg-emerald-500/15 scale-105' : ''}`}>
              <FaClipboardList className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Orders</span>
          </NavLink>

          {/* Tab 3: CENTER ELEVATED FLOATING '+' QUICK BOOK BUTTON */}
          <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(30);
                navigate('/schedule-pickup');
              }}
              className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-white dark:border-slate-900 active:scale-90 transition-transform cursor-pointer group"
              title="Book Scrap Pickup"
            >
              {/* Outer Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
              <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
              Book
            </span>
          </div>

          {/* Tab 4: Wallet & Rewards */}
          <NavLink
            to="/redeem"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              isCurrent('/redeem')
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/redeem') ? 'bg-emerald-500/15 scale-105' : ''}`}>
              <FaCoins className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Wallet</span>
          </NavLink>

          {/* Tab 5: All Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setShowDrawer(true);
            }}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <div className="p-1.5 rounded-xl">
              <FaBars className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>

        </div>
      </nav>

      {/* Complete Citizen Slide-out Drawer Modal */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl p-5 flex flex-col justify-between md:hidden border-r border-slate-200 dark:border-slate-800"
            >
              <div className="space-y-3.5 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="flex items-center space-x-2">
                    <img src="/app-logo.png" alt="Logo" className="h-7 w-auto object-contain" />
                    <div>
                      <span className="text-xs font-black text-emerald-600 block leading-tight">ECOREWARD CITIZEN</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">All Options & Services</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Profile snippet */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl flex items-center space-x-3 border border-emerald-500/20 shrink-0">
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt="Citizen Avatar" 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user?.name || 'Citizen User'}
                    </h4>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                        {walletPoints} EcoPoints (≈ ₹{inrEquivalent})
                      </span>
                      <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-black">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete Citizen Navigation Categories (Scrollable) */}
                <div className="space-y-4 text-xs font-bold overflow-y-auto max-h-[62vh] pr-1">
                  
                  {/* Category 1: Smart AI & Gamification */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Daily Games & Smart AI Tools
                    </span>

                    {/* Daily Spin & Win Wheel */}
                    <button 
                      onClick={() => handleAction('open-spin-wheel')}
                      className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-500/30 flex items-center justify-between cursor-pointer text-amber-900 dark:text-amber-300"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaGift className="text-amber-500 text-sm animate-bounce" />
                        <span className="font-black">Daily Eco Spin & Win</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black">
                        FREE
                      </span>
                    </button>

                    {/* AI Waste Scanner */}
                    <button 
                      onClick={() => handleAction('open-ai-scanner')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaCamera className="text-teal-500 text-sm" />
                        <span>AI Waste & Item Scanner</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black">
                        AI
                      </span>
                    </button>

                    {/* Green Impact Certificate */}
                    <button 
                      onClick={() => handleAction('open-green-certificate')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaCertificate className="text-indigo-500 text-sm" />
                        <span>Official Green Certificate</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black">
                        ISO
                      </span>
                    </button>

                    {/* Social Story */}
                    <button 
                      onClick={() => handleAction('open-eco-story')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaShareAlt className="text-pink-500 text-sm" />
                        <span>Share 9:16 Social Story</span>
                      </div>
                    </button>
                  </div>

                  {/* Category 2: Doorstep Collections & Store */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Recycling & Marketplace
                    </span>

                    <button 
                      onClick={() => handleNavigate('/schedule-pickup')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaCalendarAlt className="text-teal-500 text-sm" />
                        <span>Book Doorstep Pickup</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                        FAST
                      </span>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/my-pickups')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaClipboardList className="text-sky-500 text-sm" />
                        <span>My Pickups & Live Tracking</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/redeem')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaCoins className="text-amber-500 text-sm" />
                        <span>EcoPoints Wallet & UPI Cashout</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/store')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaStore className="text-emerald-500 text-sm" />
                        <span>Eco-Store Marketplace</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                        NEW
                      </span>
                    </button>
                  </div>

                  {/* Category 3: Community & Grievances */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Community & Governance
                    </span>

                    <button 
                      onClick={() => handleNavigate('/leaderboard')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaTrophy className="text-amber-500 text-sm" />
                        <span>Citizen Ward Leaderboard</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/community')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaLeaf className="text-green-500 text-sm" />
                        <span>Community Challenges</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/report-dump')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaExclamationTriangle className="text-rose-500 text-sm" />
                        <span>Report Illegal Roadside Dump</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black">
                        ALERT
                      </span>
                    </button>
                  </div>

                  {/* Category 4: Profile & Help Desk */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Account & Assistance
                    </span>

                    <button 
                      onClick={() => handleNavigate('/profile')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaUser className="text-slate-500 text-sm" />
                        <span>Profile & Saved Addresses</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => handleAction('open-support-chat')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaComments className="text-blue-500 text-sm" />
                        <span>Citizen Support Desk</span>
                      </div>
                    </button>
                  </div>

                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-xs rounded-xl hover:bg-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer border border-rose-500/20 shrink-0"
              >
                <FaSignOutAlt />
                <span>Log Out Citizen Session</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileCitizenNav;
