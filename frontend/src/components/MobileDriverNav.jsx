import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaTruck, FaTicketAlt, FaCoins, FaBars, 
  FaTimes, FaUser, FaSignOutAlt, FaHistory, FaLeaf, FaShieldAlt,
  FaFileAlt, FaMapMarkedAlt, FaWrench, FaBell, FaBolt, FaWeight,
  FaClock, FaAward, FaExclamationTriangle, FaPhoneAlt, FaChevronRight,
  FaBatteryThreeQuarters
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { triggerHaptic } from '../utils/mobileNative';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';
import DriverDoorstepVerifyModal from './DriverDoorstepVerifyModal';
import BluetoothSmartScaleModal from './BluetoothSmartScaleModal';

const MobileDriverNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(84);

  // Modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setShowDrawer(false);
  }, [location.pathname, location.search]);

  const [customActivePickup, setCustomActivePickup] = useState(null);

  // Global listeners for drawer and modal events
  useEffect(() => {
    const handleToggleDrawer = () => setShowDrawer(prev => !prev);
    const handleOpenVerify = (e) => {
      if (e.detail?.activePickup) {
        setCustomActivePickup(e.detail.activePickup);
      }
      setShowVerifyModal(true);
    };
    const handleOpenScale = () => setShowScaleModal(true);

    window.addEventListener('toggle-mobile-driver-drawer', handleToggleDrawer);
    window.addEventListener('open-driver-quick-verify', handleOpenVerify);
    window.addEventListener('open-driver-scale', handleOpenScale);

    return () => {
      window.removeEventListener('toggle-mobile-driver-drawer', handleToggleDrawer);
      window.removeEventListener('open-driver-quick-verify', handleOpenVerify);
      window.removeEventListener('open-driver-scale', handleOpenScale);
    };
  }, []);

  const handleNavigate = (path) => {
    setShowDrawer(false);
    triggerHaptic(20);
    navigate(path);
  };

  const handleLogout = () => {
    setShowDrawer(false);
    triggerHaptic(25);
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/driver') {
      return location.pathname === '/driver' || location.pathname === '/driver/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. Elevated 5-Item Sticky Bottom Navigation Bar with Center Floating Action Button */}
      <nav 
        aria-label="Driver Mobile Navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 text-white backdrop-blur-md border-t border-slate-800 shadow-2xl px-2 py-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
          
          {/* Tab 1: Cockpit Dashboard */}
          <NavLink
            to="/driver"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              isActive('/driver')
                ? 'text-emerald-400 font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/driver') ? 'bg-emerald-500/20 text-emerald-400 scale-105 border border-emerald-500/30' : ''}`}>
              <FaChartLine className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Cockpit</span>
          </NavLink>

          {/* Tab 2: Assigned Pickups */}
          <NavLink
            to="/driver/pickups"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer relative ${
              isActive('/driver/pickups')
                ? 'text-teal-400 font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all relative ${isActive('/driver/pickups') ? 'bg-teal-500/20 text-teal-400 scale-105 border border-teal-500/30' : ''}`}>
              <FaTruck className="text-lg" />
              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-emerald-500 text-[8px] font-black text-slate-950 flex items-center justify-center">
                3
              </span>
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Pickups</span>
          </NavLink>

          {/* Tab 3: CENTER ELEVATED FLOATING '⚡ VERIFY' QUICK ACTION BUTTON */}
          <div className="flex-1 flex flex-col items-center justify-center relative -top-3">
            <button
              type="button"
              onClick={() => {
                triggerHaptic(30);
                setShowVerifyModal(true);
              }}
              className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 border-4 border-slate-900 active:scale-90 transition-transform cursor-pointer group"
              title="Quick Doorstep Verify & Scale"
            >
              {/* Outer Pulse Ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-ping pointer-events-none" />
              <FaBolt className="text-lg group-hover:scale-110 transition-transform duration-300" />
            </button>
            <span className="text-[9px] font-black text-emerald-400 tracking-tight mt-0.5">
              Verify
            </span>
          </div>

          {/* Tab 4: Earnings & Incentives */}
          <NavLink
            to="/driver/earnings"
            onClick={() => triggerHaptic(15)}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 cursor-pointer ${
              isActive('/driver/earnings')
                ? 'text-amber-400 font-black'
                : 'text-slate-400 hover:text-slate-200 font-bold'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/driver/earnings') ? 'bg-amber-500/20 text-amber-400 scale-105 border border-amber-500/30' : ''}`}>
              <FaCoins className="text-lg" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">Earnings</span>
          </NavLink>

          {/* Tab 5: Operations Menu Drawer Trigger */}
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

      {/* 2. Rich Citizen-Grade Driver Slide-out Operations Drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm md:hidden"
            />

            {/* Drawer Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 w-[86vw] max-w-[340px] bg-slate-900 text-slate-100 shadow-2xl flex flex-col md:hidden border-r border-slate-800"
            >
              {/* Sticky Top: EV Vehicle & Driver Profile HUD */}
              <div className="shrink-0 p-4 pb-3 border-b border-slate-800 space-y-3 bg-slate-900/95 backdrop-blur-md">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                      <FaTruck className="text-sm" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-white block leading-tight">ECOREWARD FLEET</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">EV-TRUCK #26 • TN-09-EV-2026</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDrawer(false)} 
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
                    aria-label="Close menu"
                  >
                    <FaTimes className="text-sm" />
                  </button>
                </div>

                {/* Driver Profile Card */}
                <div 
                  onClick={() => handleNavigate('/driver/profile')}
                  className="p-3 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-800/80 rounded-2xl border border-emerald-500/20 flex items-center space-x-3 cursor-pointer active:scale-98 transition-transform"
                >
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt="Driver Avatar" 
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {user?.name || 'Driver Captain Karthik'}
                    </h4>
                    <div className="flex items-center space-x-2 pt-0.5">
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <span>⭐ 4.98 Rating</span>
                      </span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black border border-emerald-500/30">
                        MASTER CAPTAIN
                      </span>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-400 text-xs shrink-0" />
                </div>

                {/* Live EV HUD & Shift Duty Bar */}
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                      <FaBatteryThreeQuarters />
                      <span>{batteryLevel}% SOC • 68 km Range</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic(25);
                        setIsOnDuty(!isOnDuty);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase transition cursor-pointer border ${
                        isOnDuty 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {isOnDuty ? '🟢 ON DUTY' : '🔴 STANDBY'}
                    </button>
                  </div>

                  {/* Battery Gauge */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" 
                      style={{ width: `${batteryLevel}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Scrollable Navigation Options Streamlined to Essential Working Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
                
                {/* Category 1: Live Missions & Radar */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                    Live Missions & Radar
                  </span>

                  {/* Quick Doorstep Verify Action */}
                  <button 
                    onClick={() => {
                      setShowDrawer(false);
                      triggerHaptic(25);
                      setShowVerifyModal(true);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-between cursor-pointer text-emerald-400 dark:text-emerald-300 active:scale-98 transition-transform"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaBolt className="text-emerald-400 text-sm animate-pulse" />
                      <span className="font-black text-xs">Doorstep Verify & Weigh</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black">
                      ⚡ FAST
                    </span>
                  </button>

                  {/* Cockpit Overview */}
                  <button 
                    onClick={() => handleNavigate('/driver')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaChartLine className="text-emerald-400 text-sm" />
                      <span className="text-xs font-bold">Cockpit Dashboard</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">
                      LIVE
                    </span>
                  </button>

                  {/* Assigned Pickups */}
                  <button 
                    onClick={() => handleNavigate('/driver/pickups')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaTruck className="text-teal-400 text-sm" />
                      <span className="text-xs font-bold">Assigned Pickups</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-black">
                      3 PENDING
                    </span>
                  </button>

                  {/* Live GPS Route Navigation */}
                  <button 
                    onClick={() => handleNavigate('/driver/navigation')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaMapMarkedAlt className="text-sky-400 text-sm" />
                      <span className="text-xs font-bold">Live GPS Route Map</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-black">
                      RADAR
                    </span>
                  </button>
                </div>

                {/* Category 2: EV Fleet & Financials */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                    EV Fleet & Financials
                  </span>

                  {/* Hub Gate Pass */}
                  <button 
                    onClick={() => handleNavigate('/driver/gate-pass')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaTicketAlt className="text-cyan-400 text-sm" />
                      <span className="text-xs font-bold">Hub Gate Pass (QR)</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-black">
                      QR PASS
                    </span>
                  </button>

                  {/* EV Battery & Telematics */}
                  <button 
                    onClick={() => handleNavigate('/driver/battery-telematics')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaLeaf className="text-green-400 text-sm" />
                      <span className="text-xs font-bold">EV Battery & Telematics</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 font-black">
                      84% SOC
                    </span>
                  </button>

                  {/* Earnings & Incentives */}
                  <button 
                    onClick={() => handleNavigate('/driver/earnings')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaCoins className="text-amber-400 text-sm" />
                      <span className="text-xs font-bold">Earnings & Daily Ledger</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black">
                      ₹1,450
                    </span>
                  </button>
                </div>

                {/* Category 3: Account & Safety */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-2 block">
                    Account & Safety
                  </span>

                  {/* Profile & Vehicle Specs */}
                  <button 
                    onClick={() => handleNavigate('/driver/profile')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaUser className="text-slate-400 text-sm" />
                      <span className="text-xs font-bold">Driver Profile & Vehicle Specs</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-black">
                      VERIFIED
                    </span>
                  </button>

                  {/* SOS Dispatch Hotline */}
                  <button 
                    onClick={() => handleNavigate('/driver/support')}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-800 flex items-center justify-between cursor-pointer text-slate-200 active:scale-98 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaPhoneAlt className="text-rose-400 text-sm" />
                      <span className="text-xs font-bold">Dispatch Support & SOS Hotline</span>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-black">
                      24/7 SOS
                    </span>
                  </button>
                </div>

              </div>

              {/* Sticky Drawer Bottom: Logout Button */}
              <div className="shrink-0 p-4 pt-2 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-500/15 text-rose-400 font-black text-xs rounded-xl hover:bg-rose-500/25 transition flex items-center justify-center space-x-2 cursor-pointer border border-rose-500/30 active:scale-98"
                >
                  <FaSignOutAlt />
                  <span>Log Out Driver Session</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Doorstep Quick Verification & Scale Modal */}
      <DriverDoorstepVerifyModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        activePickup={customActivePickup || undefined}
        onComplete={() => {
          // Trigger cockpit refresh
          window.dispatchEvent(new CustomEvent('driver-pickup-completed'));
        }}
      />

      {/* 4. IoT Bluetooth Smart Scale Modal */}
      <BluetoothSmartScaleModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        onWeightCaptured={(w) => {
          // Send event to any active form
          window.dispatchEvent(new CustomEvent('driver-scale-synced', { detail: { weight: w } }));
        }}
      />
    </>
  );
};

export default MobileDriverNav;
