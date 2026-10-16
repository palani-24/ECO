import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaHome, FaCalendarAlt, FaClipboardList, FaCoins, FaBars, 
  FaTimes, FaUser, FaSignOutAlt, FaTruck, 
  FaCamera, FaCertificate, FaBuilding, 
  FaExclamationTriangle, FaTrophy, FaPlus,
  FaMapMarkerAlt, FaChevronRight, FaPhoneAlt, FaChartLine,
  FaMapPin, FaShieldAlt, FaHeadset, FaStore, FaFire,
  FaLandmark
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useDistrict } from '../context/DistrictContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

// Core Scanner Modal
import AIWasteScannerModal from './AIWasteScannerModal';

const MobileCitizenNav = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { user, logout } = useAuth();
  const { currentDistrict, openDistrictModal } = useDistrict() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [internalDrawer, setInternalDrawer] = useState(false);
  const [showAiScanner, setShowAiScanner] = useState(false);

  // Controlled or uncontrolled drawer state
  const showDrawer = propIsOpen !== undefined ? propIsOpen : internalDrawer;
  
  const setShowDrawer = (val) => {
    if (typeof val === 'function') {
      setInternalDrawer(prev => {
        const next = val(prev);
        if (!next && propOnClose) propOnClose();
        return next;
      });
    } else {
      setInternalDrawer(val);
      if (!val && propOnClose) propOnClose();
    }
  };

  // Check if current user / screen is in Municipality Authority Mode
  const isMunicipality = user?.role === 'municipality' || location.pathname.startsWith('/municipality');

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false);
    if (propOnClose) propOnClose();
  }, [location.pathname, location.search]);

  // Global listener for hamburger drawer toggle
  useEffect(() => {
    let lastToggle = 0;

    const handleOpen = () => {
      lastToggle = Date.now();
      setShowDrawer(true);
    };

    const handleClose = () => {
      lastToggle = Date.now();
      setShowDrawer(false);
      if (propOnClose) propOnClose();
    };

    const handleToggle = () => {
      const now = Date.now();
      if (now - lastToggle < 250) return; // Prevent double toggle in same tick!
      lastToggle = now;
      setShowDrawer(prev => !prev);
    };

    const handleScanner = () => setShowAiScanner(true);

    window.addEventListener('open-mobile-citizen-drawer', handleOpen);
    window.addEventListener('open-mobile-menu', handleOpen);
    window.addEventListener('toggle-mobile-citizen-drawer', handleOpen); // Always open!
    window.addEventListener('toggle-mobile-menu', handleOpen); // Always open!
    window.addEventListener('close-mobile-citizen-drawer', handleClose);
    window.addEventListener('close-mobile-menu', handleClose);
    window.addEventListener('open-ai-scanner', handleScanner);

    return () => {
      window.removeEventListener('open-mobile-citizen-drawer', handleOpen);
      window.removeEventListener('open-mobile-menu', handleOpen);
      window.removeEventListener('toggle-mobile-citizen-drawer', handleOpen);
      window.removeEventListener('toggle-mobile-menu', handleOpen);
      window.removeEventListener('close-mobile-citizen-drawer', handleClose);
      window.removeEventListener('close-mobile-menu', handleClose);
      window.removeEventListener('open-ai-scanner', handleScanner);
    };
  }, [propOnClose]);

  const handleNavigate = (path) => {
    setShowDrawer(false);
    if (propOnClose) propOnClose();
    triggerHaptic(20);
    navigate(path);
  };

  const handleLogout = () => {
    setShowDrawer(false);
    if (propOnClose) propOnClose();
    logout();
    navigate('/login');
  };

  const isCurrent = (path) => {
    if (path === '/dashboard' || path === '/municipality/dashboard') {
      return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
    }
    return location.pathname.startsWith(path);
  };

  // Wallet points: defaults to 2242 if unauthenticated/default user matching image
  const walletPoints = (user?.points !== undefined && user?.points !== null && user?.points > 0) 
    ? user.points 
    : 2242;
  const inrEquivalent = Math.round(walletPoints * 0.25);
  const displayName = user?.name || 'Palani (Citizen Default)';

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

      {/* Backdrop Overlay */}
      {showDrawer && (
        <div 
          onClick={() => {
            setShowDrawer(false);
            if (propOnClose) propOnClose();
          }}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          style={{ position: 'fixed', inset: 0, zIndex: 99998 }}
        />
      )}

      {/* Slide-out Menu Panel (Exact match to target design) */}
      <div 
        className={`md:hidden fixed inset-y-0 left-0 w-[84vw] max-w-[340px] bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden transition-transform duration-300 ease-out ${
          showDrawer ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 99999,
          height: '100dvh'
        }}
      >
        {/* Drawer Top Header */}
        <div className="shrink-0 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <img 
                src="/app-logo.png" 
                alt="Logo" 
                className="h-8 w-auto object-contain" 
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <span className="text-sm font-black text-[#047857] dark:text-emerald-400 block leading-tight tracking-tight">
                  {isMunicipality ? 'MUNICIPALITY SWM' : 'ECOREWARD CITIZEN'}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                  {isMunicipality ? 'Authority Administration' : 'SOLID WASTE & RECYCLING'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowDrawer(false);
                if (propOnClose) propOnClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
              aria-label="Close menu"
            >
              <FaTimes className="text-base" />
            </button>
          </div>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3 overscroll-contain">
          
          {/* User Profile Card */}
          <div 
            onClick={() => handleNavigate('/profile')}
            className="p-3 bg-[#eefcf4] dark:bg-emerald-950/40 rounded-2xl flex items-center justify-between border border-emerald-200/70 dark:border-emerald-800/40 cursor-pointer active:scale-98 transition-all hover:bg-emerald-50/80 shadow-2xs"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <img 
                src={getAvatarUrl(user, displayName)} 
                onError={(e) => handleAvatarError(e, displayName)}
                alt="User Avatar" 
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {displayName}
                </h4>
                <div className="flex items-center space-x-2 pt-0.5">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black">
                    {walletPoints} EcoPoints (≈ ₹{inrEquivalent})
                  </span>
                </div>
              </div>
            </div>
            <FaChevronRight className="text-slate-400 text-xs shrink-0 ml-2" />
          </div>

          {/* Municipal Corporation Card */}
          <div 
            onClick={() => {
              setShowDrawer(false);
              if (propOnClose) propOnClose();
              if (openDistrictModal) openDistrictModal();
            }}
            className="p-3 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 flex items-center justify-between cursor-pointer active:scale-98 transition-all hover:border-emerald-300 shadow-2xs"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#0d9488] text-white flex items-center justify-center shrink-0 shadow-sm text-base">
                <FaLandmark />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate block">
                  {currentDistrict?.name || 'Coimbatore'}
                </span>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate font-medium">
                  {currentDistrict?.corporation || 'Coimbatore City Municipal Corporation'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowDrawer(false);
                if (propOnClose) propOnClose();
                if (openDistrictModal) openDistrictModal();
              }}
              className="px-3 py-1.5 bg-[#047857] hover:bg-emerald-800 text-white text-[10px] font-black rounded-full shrink-0 cursor-pointer active:scale-95 transition shadow-sm ml-2"
            >
              38 Districts
            </button>
          </div>

          {isMunicipality ? (
            /* ================= MUNICIPALITY AUTHORITY TOOLS ================= */
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block">
                MUNICIPAL ADMINISTRATION
              </span>

              <button 
                onClick={() => handleNavigate('/municipality/dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <FaBuilding className="text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Command Center</span>
                    <span className="text-[10px] text-slate-400 font-normal">Real-time waste & telemetry</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                  LIVE
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('/municipality/grievances')}
                className="w-full text-left p-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-[#fff1f2] dark:bg-rose-950/30 border border-[#fecdd3] dark:border-rose-900/50 shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fecdd3] text-[#e11d48] flex items-center justify-center">
                    <FaExclamationTriangle className="text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#be123c] dark:text-rose-300 block">Grievance & Dump Triage</span>
                    <span className="text-[10px] text-rose-500/80 font-normal">Dispatch sanitation squads</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f43f5e] text-white font-black">
                  ACTION
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('/municipality/heatmap')}
                className="w-full text-left py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <FaMapPin className="text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Live GIS Fleet Map</span>
                    <span className="text-[10px] text-slate-400 font-normal">Compactor GPS & route tracking</span>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black">
                  MAP
                </span>
              </button>

              <button 
                onClick={() => handleNavigate('/leaderboard')}
                className="w-full text-left py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <FaTrophy className="text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Ward Cleanliness Rank</span>
                </div>
              </button>

              <button 
                onClick={() => handleNavigate('/municipality/support')}
                className="w-full text-left py-2.5 px-3 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                    <FaHeadset className="text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Command & Support Hub</span>
                    <span className="text-[10px] text-slate-400 font-normal">SWM facility & technical desk</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 font-black">
                  DESK
                </span>
              </button>
            </div>
          ) : (
            /* ================= CITIZEN SERVICES (Exact match to target design) ================= */
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1 block">
                CITIZEN SERVICES
              </span>

              {/* 1. Book Doorstep Pickup */}
              <button 
                onClick={() => handleNavigate('/schedule-pickup')}
                className="w-full text-left py-2.5 px-2 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e6fbf2] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FaCalendarAlt className="text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Book Doorstep Pickup</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#d1fae5] dark:bg-emerald-900/50 text-[#059669] dark:text-emerald-300 font-black">
                  FAST
                </span>
              </button>

              {/* 2. My Pickups & Tracking */}
              <button 
                onClick={() => handleNavigate('/my-pickups')}
                className="w-full text-left py-2.5 px-2 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e0f2fe] dark:bg-sky-950/60 text-[#0284c7] dark:text-sky-400 flex items-center justify-center shrink-0">
                    <FaClipboardList className="text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">My Pickups & Tracking</span>
                </div>
              </button>

              {/* 3. EcoPoints Wallet & UPI */}
              <button 
                onClick={() => handleNavigate('/redeem')}
                className="w-full text-left py-2.5 px-2 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fef3c7] dark:bg-amber-950/60 text-[#d97706] dark:text-amber-400 flex items-center justify-center shrink-0">
                    <FaCoins className="text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">EcoPoints Wallet & UPI</span>
                </div>
              </button>

              {/* 4. Report Roadside Dump (HIGHLIGHTED ALERT CARD) */}
              <button 
                onClick={() => handleNavigate('/report-dump')}
                className="w-full text-left p-3 my-1 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-[#fff1f2] dark:bg-rose-950/30 border border-[#fecdd3] dark:border-rose-900/50 shadow-2xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#fecdd3] dark:bg-rose-900/60 text-[#e11d48] flex items-center justify-center shrink-0">
                    <FaExclamationTriangle className="text-sm" />
                  </div>
                  <span className="text-xs font-black text-[#be123c] dark:text-rose-300">Report Roadside Dump</span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f43f5e] text-white font-black shadow-2xs">
                  ALERT
                </span>
              </button>

              {/* 5. AI Waste Scanner */}
              <button 
                onClick={() => {
                  setShowDrawer(false);
                  if (propOnClose) propOnClose();
                  triggerHaptic(25);
                  setShowAiScanner(true);
                }}
                className="w-full text-left py-2.5 px-2 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#ccfbf1] dark:bg-teal-950/60 text-[#0d9488] dark:text-teal-400 flex items-center justify-center shrink-0">
                    <FaCamera className="text-sm" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Waste Scanner</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ccfbf1] dark:bg-teal-900/50 text-[#0d9488] dark:text-teal-300 font-bold">
                  AI
                </span>
              </button>

              {/* 6. Helpdesk & Message Hub */}
              <button 
                onClick={() => handleNavigate('/support')}
                className="w-full text-left py-2.5 px-2 rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#e6fbf2] dark:bg-emerald-950/60 text-[#059669] dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <FaHeadset className="text-sm" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Helpdesk & Message Hub</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal block">Pickup help & 24/7 helpline</span>
                  </div>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#d1fae5] dark:bg-emerald-900/50 text-[#059669] dark:text-emerald-300 font-black">
                  HELP
                </span>
              </button>
            </div>
          )}

          {/* Control Room Card */}
          <div className="p-3 bg-[#eefcf4] dark:bg-emerald-950/40 rounded-2xl border border-[#a7f3d0] dark:border-emerald-800/50 flex items-center justify-between shadow-2xs">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="text-emerald-600 dark:text-emerald-400 text-base shrink-0">
                <FaPhoneAlt />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {currentDistrict?.name || 'Coimbatore'} Control Room
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {currentDistrict?.helpline || '0422-2302323 / 1800-425-4123'}
                </p>
              </div>
            </div>
            <a 
              href={`tel:${((currentDistrict?.helpline || '0422-2302323').split('/')[0]).replace(/[^0-9]/g, '')}`}
              className="px-3.5 py-1.5 rounded-full bg-[#059669] hover:bg-[#047857] text-white font-black text-[10px] shrink-0 cursor-pointer shadow-sm active:scale-95 transition ml-2 inline-flex items-center justify-center"
            >
              CALL
            </a>
          </div>

        </div>

        {/* Drawer Bottom: Log Out Session */}
        <div className="shrink-0 p-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-[#fff1f2] dark:bg-rose-950/30 text-[#e11d48] dark:text-rose-400 font-black text-xs rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition flex items-center justify-center space-x-2 cursor-pointer border border-[#fecdd3] dark:border-rose-900/50 active:scale-98 shadow-2xs"
          >
            <FaSignOutAlt className="text-sm" />
            <span>Log Out Session</span>
          </button>
        </div>

      </div>

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
