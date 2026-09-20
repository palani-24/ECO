import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaUsers, FaTruck, FaClipboardCheck, FaBars, 
  FaTimes, FaUserShield, FaSignOutAlt, FaHeadset, FaGift,
  FaCog, FaShieldAlt, FaMapMarkerAlt, FaComments
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useDistrict } from '../context/DistrictContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const MobileAdminNav = () => {
  const { user, logout } = useAuth();
  const { currentDistrict, openDistrictModal } = useDistrict();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleToggle = () => setShowDrawer(prev => !prev);
    window.addEventListener('toggle-mobile-admin-drawer', handleToggle);
    return () => window.removeEventListener('toggle-mobile-admin-drawer', handleToggle);
  }, []);

  const navItems = [
    { path: '/admin', label: 'Command', icon: FaChartLine },
    { path: '/admin/drivers', label: 'Drivers', icon: FaTruck },
    { path: '/admin/pickups', label: 'Pickups', icon: FaClipboardCheck },
    { path: '/admin/support', label: 'Support', icon: FaComments },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    setShowDrawer(false);
    triggerHaptic(25);
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Sticky Bottom 5-Tab Navigation Bar */}
      <nav 
        aria-label="Admin Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={idx}
                to={item.path}
                onClick={() => triggerHaptic(15)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
                  active 
                    ? 'text-emerald-400 font-black' 
                    : 'text-slate-400 hover:text-slate-200 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-emerald-500/20 text-emerald-300 scale-105 border border-emerald-500/40 shadow-sm shadow-emerald-500/20' : ''}`}>
                  <Icon className="text-lg" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}

          {/* 5th Tab: Drawer Menu */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setShowDrawer(true);
            }}
            className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <div className="p-1.5 rounded-xl">
              <FaBars className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Menu</span>
          </button>
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
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[320px] bg-slate-900 text-white border-r border-slate-800 shadow-2xl p-5 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <FaUserShield className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-tight">Admin Executive</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase tracking-wider">State SWM Command</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Admin Profile Card */}
                <div className="p-3 bg-slate-800/80 rounded-2xl flex items-center space-x-3 border border-slate-700">
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt="Admin Avatar" 
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {user?.name || 'Super Administrator'}
                    </h4>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30 uppercase">
                        SUPER ADMIN
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>ONLINE</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tamil Nadu Active District Filter Bar */}
                <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Active Filter District</span>
                    <span className="text-xs font-black text-white truncate block">{currentDistrict.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDrawer(false);
                      openDistrictModal();
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl cursor-pointer active:scale-95 transition shadow-sm shrink-0"
                  >
                    38 Districts
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1.5 text-xs font-bold pt-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                    Management Consoles
                  </span>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaChartLine className="text-emerald-400 text-sm" />
                      <span>Executive Command</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/users'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaUsers className="text-teal-400 text-sm" />
                      <span>Citizen Accounts & Points</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/drivers'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaTruck className="text-cyan-400 text-sm" />
                      <span>Fleet & Driver Telematics</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/pickups'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaClipboardCheck className="text-amber-400 text-sm" />
                      <span>Pickups & Weighbridge Radar</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/support'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaHeadset className="text-rose-400 text-sm" />
                      <span>Support Desk & Tickets</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/settings'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaCog className="text-slate-400 text-sm" />
                      <span>Scrap Rates & System Settings</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/admin/coupons'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaGift className="text-indigo-400 text-sm" />
                      <span>Rewards & Partner Coupons</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Drawer Logout */}
              <div className="pt-3 border-t border-slate-800">
                <button 
                  onClick={handleLogout}
                  className="w-full p-2.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/30 text-rose-300 flex items-center justify-center space-x-2 text-xs font-black cursor-pointer active:scale-95 transition"
                >
                  <FaSignOutAlt />
                  <span>Logout Admin Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileAdminNav;
