import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaUsers, FaTruck, FaClipboardCheck, FaBars, 
  FaTimes, FaUserShield, FaSignOutAlt, FaHeadset, FaGift,
  FaCog, FaShieldAlt, FaServer, FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const MobileAdminNav = () => {
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
    window.addEventListener('toggle-mobile-admin-drawer', handleToggle);
    return () => window.removeEventListener('toggle-mobile-admin-drawer', handleToggle);
  }, []);

  const navItems = [
    { path: '/admin', label: 'Overview', icon: FaChartLine },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/drivers', label: 'Drivers', icon: FaTruck },
    { path: '/admin/pickups', label: 'Pickups', icon: FaClipboardCheck },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
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
        aria-label="Admin Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 text-white backdrop-blur-md border-t border-indigo-900/40 shadow-2xl px-3 py-2 pb-[calc(0.6rem+env(safe-area-inset-bottom,0px))]"
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
                    ? 'text-indigo-400 font-black' 
                    : 'text-slate-400 hover:text-slate-200 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-indigo-500/20 text-indigo-300 scale-105 border border-indigo-500/40 shadow-sm shadow-indigo-500/20' : ''}`}>
                  <Icon className="text-xl" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Admin Command Slide-out Drawer Modal */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white border-r border-indigo-500/20 shadow-2xl p-5 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                      <FaUserShield className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-tight">Admin Console</span>
                      <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-wider">Super Control</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Admin Profile snippet */}
                <div className="p-3 bg-slate-900/80 rounded-2xl flex items-center space-x-3 border border-indigo-500/20">
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt="Admin Avatar" 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/40"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {user?.name || 'Administrator'}
                    </h4>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-black border border-indigo-500/30 uppercase">
                        {user?.role || 'Admin'}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ONLINE</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 text-xs font-bold overflow-y-auto max-h-[55vh] pr-1">
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaChartLine className="text-indigo-400 text-sm" />
                    <span>Command Overview</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/users'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaUsers className="text-blue-400 text-sm" />
                    <span>Citizen Accounts</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/drivers'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaTruck className="text-teal-400 text-sm" />
                    <span>Driver Fleet Approval</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/pickups'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaClipboardCheck className="text-emerald-400 text-sm" />
                    <span>Scrap Pickups Audit</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/support'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaHeadset className="text-pink-400 text-sm" />
                    <span>Citizen Help Desk</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/coupons'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaGift className="text-amber-400 text-sm" />
                    <span>Reward Coupons</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/settings'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center space-x-2.5 cursor-pointer text-slate-200"
                  >
                    <FaCog className="text-slate-400 text-sm" />
                    <span>System Settings & Rates</span>
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="w-full py-2.5 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/30 border border-rose-500/30 transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FaSignOutAlt />
                <span>Log Out Admin Session</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAdminNav;
