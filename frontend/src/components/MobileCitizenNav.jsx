import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaClipboardList, FaCoins, FaBars, 
  FaBuilding, FaExclamationTriangle, FaPlus,
  FaMapPin, FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';
import MobileCitizenDrawer from './MobileCitizenDrawer';

const MobileCitizenNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);

  // Check if current user / screen is in Municipality Authority Mode
  const isMunicipality = user?.role === 'municipality' || location.pathname.startsWith('/municipality');

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname, location.search]);

  // Global listeners for hamburger drawer toggle
  useEffect(() => {
    const handleOpen = () => setShowDrawer(true);
    const handleClose = () => setShowDrawer(false);
    const handleToggle = () => setShowDrawer(prev => !prev);

    window.addEventListener('open-mobile-citizen-drawer', handleOpen);
    window.addEventListener('open-mobile-menu', handleOpen);
    window.addEventListener('toggle-mobile-citizen-drawer', handleToggle);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    window.addEventListener('close-mobile-citizen-drawer', handleClose);
    window.addEventListener('close-mobile-menu', handleClose);

    return () => {
      window.removeEventListener('open-mobile-citizen-drawer', handleOpen);
      window.removeEventListener('open-mobile-menu', handleOpen);
      window.removeEventListener('toggle-mobile-citizen-drawer', handleToggle);
      window.removeEventListener('toggle-mobile-menu', handleToggle);
      window.removeEventListener('close-mobile-citizen-drawer', handleClose);
      window.removeEventListener('close-mobile-menu', handleClose);
    };
  }, []);

  const isCurrent = (path) => {
    if (path === '/dashboard' || path === '/municipality/dashboard') {
      return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 5-Item Sticky Bottom Navigation Bar */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-2xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
          {isMunicipality ? (
            /* ================= MUNICIPALITY AUTHORITY BOTTOM TABS ================= */
            <>
              <NavLink
                to="/municipality/dashboard"
                onClick={() => triggerHaptic(15)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
                  isCurrent('/municipality/dashboard')
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/municipality/dashboard') ? 'bg-emerald-500/15 scale-105' : ''}`}>
                  <FaBuilding className="text-lg" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Command</span>
              </NavLink>

              <NavLink
                to="/municipality/grievances"
                onClick={() => triggerHaptic(15)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer relative ${
                  isCurrent('/municipality/grievances')
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/municipality/grievances') ? 'bg-emerald-500/15 scale-105' : ''}`}>
                  <FaExclamationTriangle className="text-lg" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">Grievance</span>
              </NavLink>

              <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(30);
                    navigate('/municipality/heatmap');
                  }}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-white dark:border-slate-900 active:scale-90 transition-transform cursor-pointer group"
                  title="Live GIS Fleet & Hotspot Map"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                  <FaMapPin className="text-lg group-hover:scale-110 transition-transform duration-300" />
                </button>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                  GIS Map
                </span>
              </div>

              <NavLink
                to="/esg-portal"
                onClick={() => triggerHaptic(15)}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
                  isCurrent('/esg-portal')
                    ? 'text-emerald-600 dark:text-emerald-400 font-black'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isCurrent('/esg-portal') ? 'bg-emerald-500/15 scale-105' : ''}`}>
                  <FaChartLine className="text-lg" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">ESG Audit</span>
              </NavLink>

              <button
                type="button"
                id="mobile-bottom-menu-btn"
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
            </>
          ) : (
            /* ================= CITIZEN BOTTOM TABS ================= */
            <>
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

              {/* Elevated Floating '+' Quick Book Button */}
              <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(30);
                    navigate('/schedule-pickup');
                  }}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-white dark:border-slate-900 active:scale-90 transition-transform cursor-pointer group"
                  title="Book Doorstep Scrap Pickup"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                  <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                </button>
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 tracking-tight mt-0.5">
                  Book
                </span>
              </div>

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

              <button
                type="button"
                id="mobile-bottom-menu-btn"
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
            </>
          )}
        </div>
      </nav>

      {/* Mobile Citizen Drawer Portal */}
      <MobileCitizenDrawer 
        isOpen={showDrawer} 
        onClose={() => setShowDrawer(false)} 
      />
    </>
  );
};

export default MobileCitizenNav;
