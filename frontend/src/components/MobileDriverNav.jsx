import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaTruck, FaTicketAlt, FaCoins, FaBars, 
  FaTimes, FaUser, FaSignOutAlt, FaHistory, FaLeaf, FaShieldAlt,
  FaFileAlt, FaMapMarkedAlt, FaWrench, FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const MobileDriverNav = () => {
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
    window.addEventListener('toggle-mobile-driver-drawer', handleToggle);
    return () => window.removeEventListener('toggle-mobile-driver-drawer', handleToggle);
  }, []);

  const navItems = [
    { path: '/driver', label: 'Cockpit', icon: FaChartLine },
    { path: '/driver/pickups', label: 'Pickups', icon: FaTruck },
    { path: '/driver/gate-pass', label: 'Gate Pass', icon: FaTicketAlt },
    { path: '/driver/earnings', label: 'Earnings', icon: FaCoins },
  ];

  const isActive = (path) => {
    if (path === '/driver') {
      return location.pathname === '/driver' || location.pathname === '/driver/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setShowDrawer(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sticky Bottom 4-Tab Navigation Bar */}
      <nav 
        aria-label="Driver Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl px-4 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]"
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
                    ? 'text-emerald-400 font-black' 
                    : 'text-slate-400 hover:text-slate-200 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-emerald-500/20 text-emerald-400 scale-105 border border-emerald-500/30' : ''}`}>
                  <Icon className="text-xl" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Driver Operations Slide-out Drawer Modal */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-white border-r border-slate-800 shadow-2xl p-5 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <FaTruck className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-tight">Driver Cockpit</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">TN-09-EV-2026</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Driver Profile snippet */}
                <div className="p-3 bg-slate-800/80 rounded-2xl flex items-center space-x-3 border border-slate-700/60">
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt="Driver Avatar" 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {user?.name || 'Driver Karthik Raja'}
                    </h4>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <span>⭐ 4.9 Rating</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                </div>

                {/* Driver Navigation Links */}
                <div className="space-y-1 text-xs font-bold overflow-y-auto max-h-[55vh] pr-1">
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaChartLine className="text-emerald-400 text-sm" />
                    <span>Cockpit Dashboard</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/pickups'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaTruck className="text-teal-400 text-sm" />
                    <span>Assigned Pickups</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/gate-pass'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaTicketAlt className="text-cyan-400 text-sm" />
                    <span>Hub Gate Pass (QR)</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/battery-telematics'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaLeaf className="text-green-400 text-sm" />
                    <span>EV & Battery Telematics</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/earnings'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaCoins className="text-amber-400 text-sm" />
                    <span>Earnings & Incentives</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/history'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaHistory className="text-indigo-400 text-sm" />
                    <span>Pickup History</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/driver/profile'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaUser className="text-slate-400 text-sm" />
                    <span>Driver Profile</span>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/30 border border-rose-500/30 transition flex items-center justify-center space-x-2 cursor-pointer"
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

export default MobileDriverNav;
