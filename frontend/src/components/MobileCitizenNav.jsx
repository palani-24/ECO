import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaCoins, FaBars, 
  FaTimes, FaUsers, FaLeaf, FaUser, FaSignOutAlt, FaAward, FaTruck, FaStore
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';

const MobileCitizenNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);

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

  return (
    <>
      {/* Sticky Bottom 5-Tab Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => triggerHaptic(20)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                }`}
              >
                <div className={`p-1 rounded-lg ${active ? 'bg-emerald-500/15' : ''}`}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-[9px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}

          {/* 5th Button: All Menu Drawer */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(25);
              setShowDrawer(true);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
              showDrawer
                ? 'text-emerald-600 dark:text-emerald-400 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
            }`}
            aria-label="Open Navigation Drawer"
          >
            <div className={`p-1 rounded-lg ${showDrawer ? 'bg-emerald-500/15' : ''}`}>
              <FaBars className="text-lg" />
            </div>
            <span className="text-[9px] tracking-tight mt-0.5">All Menu</span>
          </button>
        </div>
      </nav>

      {/* Slide-out Drawer Modal */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <img src="/app-logo.png" alt="Logo" className="h-7 w-auto object-contain" />
                    <span className="text-xs font-black text-emerald-600">Citizen Portal</span>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Profile snippet */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center space-x-3 border border-emerald-500/20">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user?.name || 'Citizen User'}
                    </h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {user?.points || 0} EcoPoints (≈ ₹{Math.round((user?.points || 0) * 0.25)})
                    </span>
                  </div>
                </div>

                {/* Citizen Core Menu Links */}
                <div className="space-y-1 text-xs font-bold">
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/dashboard'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaHome className="text-emerald-500 text-sm" />
                    <span>Home Dashboard</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/schedule-pickup'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaCalendarAlt className="text-teal-500 text-sm" />
                    <span>Book Doorstep Pickup</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/my-pickups'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaClipboardList className="text-sky-500 text-sm" />
                    <span>My Pickup History</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/redeem'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaCoins className="text-amber-500 text-sm" />
                    <span>Redeem Rewards & UPI</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/store'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaStore className="text-emerald-500 text-sm" />
                    <span>Eco-Store Products</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/leaderboard'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaUsers className="text-indigo-500 text-sm" />
                    <span>Citizen Leaderboard</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/community'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaLeaf className="text-green-500 text-sm" />
                    <span>Community Challenges</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/profile'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-700 dark:text-slate-200"
                  >
                    <FaUser className="text-slate-500 text-sm" />
                    <span>Profile & Addresses</span>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={() => {
                  logout();
                  setShowDrawer(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FaSignOutAlt />
                <span>Log Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileCitizenNav;
