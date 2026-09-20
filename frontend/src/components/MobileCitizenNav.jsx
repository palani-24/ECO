import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaCoins, FaBars, 
  FaTimes, FaUser, FaSignOutAlt, FaTruck, 
  FaCamera, FaCertificate, FaBuilding, 
  FaExclamationTriangle, FaTrophy, FaPlus,
  FaMapMarkerAlt, FaChevronRight, FaPhoneAlt, FaChartLine,
  FaMapPin, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useDistrict } from '../context/DistrictContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

// Core Scanner Modal
import AIWasteScannerModal from './AIWasteScannerModal';

const MobileCitizenNav = () => {
  const { user, logout } = useAuth();
  const { currentDistrict, openDistrictModal } = useDistrict();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAiScanner, setShowAiScanner] = useState(false);

  // Check if current user / screen is in Municipality Authority Mode
  const isMunicipality = user?.role === 'municipality' || location.pathname.startsWith('/municipality');

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname, location.search]);

  // Global listener for hamburger drawer toggle
  useEffect(() => {
    const handleToggle = () => setShowDrawer(prev => !prev);
    const handleScanner = () => setShowAiScanner(true);

    window.addEventListener('toggle-mobile-citizen-drawer', handleToggle);
    window.addEventListener('open-ai-scanner', handleScanner);

    return () => {
      window.removeEventListener('toggle-mobile-citizen-drawer', handleToggle);
      window.removeEventListener('open-ai-scanner', handleScanner);
    };
  }, []);

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
    if (path === '/dashboard' || path === '/municipality/dashboard') {
      return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
    }
    return location.pathname.startsWith(path);
  };

  const walletPoints = user?.points || 0;
  const inrEquivalent = Math.round(walletPoints * 0.25);

  return (
    <>
      {/* 📱 5-Item Sticky Bottom Navigation Bar (Tailored to Role) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-2xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
          
          {isMunicipality ? (
            /* ================= MUNICIPALITY AUTHORITY BOTTOM TABS ================= */
            <>
              {/* Tab 1: Municipal Command Center */}
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

              {/* Tab 2: Citizen Grievances & Dump Triage */}
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

              {/* Tab 3: CENTER ELEVATED GIS MAP BUTTON */}
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

              {/* Tab 4: ESG & Wards */}
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

              {/* Tab 5: Menu */}
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
            </>
          ) : (
            /* ================= CITIZEN BOTTOM TABS ================= */
            <>
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
                  title="Book Doorstep Scrap Pickup"
                >
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

              {/* Tab 5: Menu */}
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
            </>
          )}

        </div>
      </nav>

      {/* 🧭 Minimalist, Focused Slide-out Drawer Panel */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[330px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col md:hidden border-r border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Top Header */}
              <div className="shrink-0 p-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 space-y-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img src="/app-logo.png" alt="Logo" className="h-7 w-auto object-contain" />
                    <div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block leading-tight">
                        {isMunicipality ? 'MUNICIPALITY SWM' : 'ECOREWARD CITIZEN'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {isMunicipality ? 'Authority Administration' : 'Solid Waste & Recycling'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>

                {/* Profile Card */}
                {isMunicipality ? (
                  /* Municipality Officer Profile */
                  <div 
                    onClick={() => handleNavigate('/profile')}
                    className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl flex items-center space-x-3 border border-emerald-500/20 cursor-pointer active:scale-98 transition-transform"
                  >
                    <img 
                      src={getAvatarUrl(user, user?.name)} 
                      onError={(e) => handleAvatarError(e, user?.name)}
                      alt="Officer Avatar" 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.name || `${currentDistrict.name} Municipal Officer`}
                      </h4>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold truncate">
                        {currentDistrict.corporation}
                      </p>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-black inline-block mt-0.5">
                        🏛️ {currentDistrict.wards} WARDS • ACTIVE
                      </span>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </div>
                ) : (
                  /* Citizen Profile */
                  <div 
                    onClick={() => handleNavigate('/profile')}
                    className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl flex items-center space-x-3 border border-emerald-500/20 cursor-pointer active:scale-98 transition-transform"
                  >
                    <img 
                      src={getAvatarUrl(user, user?.name)} 
                      onError={(e) => handleAvatarError(e, user?.name)}
                      alt="Citizen Avatar" 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.name || 'Citizen User'}
                      </h4>
                      <div className="flex items-center space-x-2 pt-0.5">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                          {walletPoints} EcoPoints (≈ ₹{inrEquivalent})
                        </span>
                      </div>
                    </div>
                    <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                  </div>
                )}

                {/* Tamil Nadu Active District Bar */}
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm font-black text-xs">
                      🏛️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {currentDistrict.name}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          {currentDistrict.tamilName}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-400 truncate">
                        {currentDistrict.corporation}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDrawer(false);
                      openDistrictModal();
                    }}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black rounded-xl shrink-0 cursor-pointer active:scale-95 transition shadow-sm"
                  >
                    38 Districts
                  </button>
                </div>
              </div>

              {/* Streamlined Menu Options (Only 5 Essential Items per role) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 overscroll-contain">
                
                {isMunicipality ? (
                  /* ================= MUNICIPALITY ONLY 5 CORE OPTIONS ================= */
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Municipal Administration Tools
                    </span>

                    {/* 1. Command Center */}
                    <button 
                      onClick={() => handleNavigate('/municipality/dashboard')}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                        isCurrent('/municipality/dashboard')
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-black border border-emerald-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <FaBuilding className="text-sm" />
                        </div>
                        <div>
                          <span className="text-xs block">Command Center</span>
                          <span className="text-[10px] text-slate-400 font-normal">Real-time waste & telemetry</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                        LIVE
                      </span>
                    </button>

                    {/* 2. Citizen Grievances & Dump Triage */}
                    <button 
                      onClick={() => handleNavigate('/municipality/grievances')}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                        isCurrent('/municipality/grievances')
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 font-black border border-rose-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                          <FaExclamationTriangle className="text-sm" />
                        </div>
                        <div>
                          <span className="text-xs block">Grievance & Dump Triage</span>
                          <span className="text-[10px] text-slate-400 font-normal">Dispatch sanitation squads</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black">
                        ACTION
                      </span>
                    </button>

                    {/* 3. GIS Fleet & Hotspots */}
                    <button 
                      onClick={() => handleNavigate('/municipality/heatmap')}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                        isCurrent('/municipality/heatmap')
                          ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-black border border-teal-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                          <FaMapPin className="text-sm" />
                        </div>
                        <div>
                          <span className="text-xs block">Live GIS Fleet Map</span>
                          <span className="text-[10px] text-slate-400 font-normal">Compactor GPS & route tracking</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black">
                        MAP
                      </span>
                    </button>

                    {/* 4. Ward Cleanliness Ranking */}
                    <button 
                      onClick={() => handleNavigate('/leaderboard')}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                        isCurrent('/leaderboard')
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-black border border-amber-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <FaTrophy className="text-sm" />
                        </div>
                        <div>
                          <span className="text-xs block">Ward Cleanliness Rank</span>
                          <span className="text-[10px] text-slate-400 font-normal">Segregation & audit index</span>
                        </div>
                      </div>
                    </button>

                    {/* 5. TNPCB & ESG Balance Sheet */}
                    <button 
                      onClick={() => handleNavigate('/esg-portal')}
                      className={`w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all ${
                        isCurrent('/esg-portal')
                          ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-black border border-indigo-500/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                          <FaShieldAlt className="text-sm" />
                        </div>
                        <div>
                          <span className="text-xs block">TNPCB / ISO 14001 ESG</span>
                          <span className="text-[10px] text-slate-400 font-normal">Methane offset & dividends</span>
                        </div>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black">
                        ISO
                      </span>
                    </button>
                  </div>
                ) : (
                  /* ================= CITIZEN ONLY 5 CORE OPTIONS ================= */
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                      Citizen Services
                    </span>

                    {/* 1. Book Scrap Pickup */}
                    <button 
                      onClick={() => handleNavigate('/schedule-pickup')}
                      className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200 active:scale-98 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <FaCalendarAlt className="text-sm" />
                        </div>
                        <span className="text-xs font-bold">Book Doorstep Pickup</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                        FAST
                      </span>
                    </button>

                    {/* 2. My Pickups & Tracking */}
                    <button 
                      onClick={() => handleNavigate('/my-pickups')}
                      className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200 active:scale-98 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
                          <FaClipboardList className="text-sm" />
                        </div>
                        <span className="text-xs font-bold">My Pickups & Tracking</span>
                      </div>
                    </button>

                    {/* 3. Wallet & UPI */}
                    <button 
                      onClick={() => handleNavigate('/redeem')}
                      className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200 active:scale-98 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                          <FaCoins className="text-sm" />
                        </div>
                        <span className="text-xs font-bold">EcoPoints Wallet & UPI</span>
                      </div>
                    </button>

                    {/* 4. Report Illegal Dump */}
                    <button 
                      onClick={() => handleNavigate('/report-dump')}
                      className="w-full text-left p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-between cursor-pointer text-rose-700 dark:text-rose-300 active:scale-98 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
                          <FaExclamationTriangle className="text-sm" />
                        </div>
                        <span className="text-xs font-bold">Report Roadside Dump</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-black">
                        ALERT
                      </span>
                    </button>

                    {/* 5. AI Waste Scanner */}
                    <button 
                      onClick={() => {
                        setShowDrawer(false);
                        triggerHaptic(25);
                        setShowAiScanner(true);
                      }}
                      className="w-full text-left p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-800 dark:text-slate-200 active:scale-98 transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                          <FaCamera className="text-sm" />
                        </div>
                        <span className="text-xs font-bold">AI Waste Scanner</span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black">
                        AI
                      </span>
                    </button>
                  </div>
                )}

                {/* Direct Call to Municipal Sanitation Control Room */}
                <div className="pt-2">
                  <a 
                    href={`tel:${currentDistrict.helpline.split('/')[0].trim()}`}
                    className="w-full p-3 rounded-2xl bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaPhoneAlt className="text-emerald-600 dark:text-emerald-400 text-sm" />
                      <div>
                        <span className="text-xs font-black block">{currentDistrict.name} Control Room</span>
                        <span className="text-[10px] text-slate-400">{currentDistrict.helpline}</span>
                      </div>
                    </div>
                    <span className="text-[9px] px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-black">
                      CALL
                    </span>
                  </a>
                </div>

              </div>

              {/* Drawer Bottom: Log Out */}
              <div className="shrink-0 p-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-black text-xs rounded-xl hover:bg-rose-500/20 transition flex items-center justify-center space-x-2 cursor-pointer border border-rose-500/20 active:scale-98"
                >
                  <FaSignOutAlt />
                  <span>Log Out Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Waste & Item Scanner Modal */}
      <AIWasteScannerModal 
        isOpen={showAiScanner} 
        onClose={() => setShowAiScanner(false)} 
        onApplyScannedData={(data) => {
          navigate(`/schedule-pickup?category=${encodeURIComponent(data.category)}&weight=${data.estimatedWeight}`);
        }}
      />
    </>
  );
};

export default MobileCitizenNav;
