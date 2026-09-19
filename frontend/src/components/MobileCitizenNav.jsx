import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaCoins, FaBars, 
  FaTimes, FaUsers, FaLeaf, FaUser, FaSignOutAlt, FaAward, FaTruck, 
  FaStore, FaCamera, FaCertificate, FaShareAlt, FaBuilding, 
  FaExclamationTriangle, FaComments, FaTrophy, FaWallet
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

  const navItems = [
    { path: '/dashboard', label: 'Home', icon: FaHome },
    { path: '/schedule-pickup', label: 'Book Pickup', icon: FaCalendarAlt },
    { path: '/my-pickups', label: 'My Pickups', icon: FaClipboardList },
    { path: '/redeem', label: 'Wallet', icon: FaCoins },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleAction = (eventName) => {
    setShowDrawer(false);
    triggerHaptic(20);
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

  const walletPoints = user?.points || 0;
  const inrEquivalent = Math.round(walletPoints * 0.25);

  return (
    <>
      {/* Sticky Bottom 4-Tab Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-xl px-4 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => triggerHaptic(20)}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-emerald-500/15 scale-105' : ''}`}>
                  <Icon className="text-xl" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
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
              <div className="space-y-4 overflow-hidden flex flex-col">
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
                  
                  {/* Category 1: Doorstep Scrap Collection */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Recycling & Collections
                    </span>

                    <button 
                      onClick={() => handleNavigate('/dashboard')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaHome className="text-emerald-500 text-sm" />
                        <span>Home Dashboard</span>
                      </div>
                    </button>

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
                        <span>EcoPoints Wallet & UPI</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black">
                        CASH
                      </span>
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

                  {/* Category 2: Smart Green Tools (1-Tap Modal Actions) */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Smart AI Tools & Badges
                    </span>

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
                        <span>Report Illegal Dumping</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black">
                        ALERT
                      </span>
                    </button>

                    <button 
                      onClick={() => handleNavigate('/esg-portal')}
                      className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FaBuilding className="text-purple-500 text-sm" />
                        <span>ESG Corporate & City Audit</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-black">
                        PRO
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
