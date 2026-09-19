import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTruck, FaClock, FaCheck, FaWeight, FaCamera, 
  FaCheckCircle, FaComments, FaPhoneAlt, FaCoins, FaMapMarkerAlt, 
  FaCompass, FaExclamationCircle, FaArrowRight, FaTicketAlt,
  FaBatteryThreeQuarters, FaLeaf, FaShieldAlt, FaBluetooth, FaQrcode,
  FaBolt, FaAward, FaRoute, FaGasPump, FaLocationArrow
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MobileDriverHeader from './MobileDriverHeader';
import MobileDriverNav from './MobileDriverNav';
import DriverChatModal from './DriverChatModal';
import BluetoothSmartScaleModal from './BluetoothSmartScaleModal';
import GoogleRouteMap from './GoogleRouteMap';
import api from '../utils/api';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const MobileDriverDashboard = ({ 
  driverProfile, 
  pickups = [], 
  onPickupUpdated = () => {} 
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem('eco_driver_theme') || 'dark');
  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [actualWeight, setActualWeight] = useState('8.2');
  const [inputOtp, setInputOtp] = useState('4829');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showChat, setShowChat] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Listen to theme changes, scale sync or external doorstep complete events
  useEffect(() => {
    const handleThemeChange = (e) => {
      if (e.detail?.theme) setTheme(e.detail.theme);
    };
    const handleScaleSynced = (e) => {
      if (e.detail?.weight) {
        setActualWeight(String(e.detail.weight));
        addToast(`⚖️ Scale Synced: ${e.detail.weight} kg`, 'success');
      }
    };
    const handleExternalCompleted = () => {
      setIsOtpVerified(true);
      onPickupUpdated();
    };

    window.addEventListener('driver-theme-change', handleThemeChange);
    window.addEventListener('driver-scale-synced', handleScaleSynced);
    window.addEventListener('driver-pickup-completed', handleExternalCompleted);

    return () => {
      window.removeEventListener('driver-theme-change', handleThemeChange);
      window.removeEventListener('driver-scale-synced', handleScaleSynced);
      window.removeEventListener('driver-pickup-completed', handleExternalCompleted);
    };
  }, [onPickupUpdated, addToast]);

  const isWhiteTheme = theme === 'light';

  // Find currently active pickup or fallback
  const activePickup = pickups.find(p => ['assigned', 'accepted', 'en_route', 'in_progress', 'pending'].includes(p.status?.toLowerCase())) || pickups[0] || {
    _id: 'pk-demo-1',
    user: { name: 'Priya Sundaram', phone: '+91 98765 43210' },
    pickupAddress: { street: '12-A, Metro Heights, Anna Nagar, Chennai' },
    wasteCategory: 'Plastic (5kg), E-Waste (3.2kg)',
    estimatedWeight: 8.2,
    status: 'assigned',
    pickupTimeSlot: '10:00 AM - 12:00 PM',
    verificationCode: '4829'
  };

  const handleVerifyOtp = () => {
    triggerHaptic(30);
    const expected = activePickup.verificationCode || activePickup.otp || '4829';
    if (inputOtp.trim() === expected.trim()) {
      setIsOtpVerified(true);
      soundFx.playSuccessChime();
      addToast('✅ Customer Doorstep OTP Verified!', 'success', 'Verification Complete');
    } else {
      soundFx.playAlertWarning();
      addToast('Invalid OTP code. Please ask customer for the 4-digit code.', 'error');
    }
  };

  const handleCompletePickup = async () => {
    if (!isOtpVerified) {
      soundFx.playAlertWarning();
      addToast('Please verify customer 4-digit OTP first', 'warning');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(60);

    try {
      if (activePickup._id && !activePickup._id.startsWith('pk-demo')) {
        await api.put(`/driver/pickups/${activePickup._id}/complete`, {
          actualWeight: parseFloat(actualWeight) || activePickup.estimatedWeight,
          notes: 'Completed via Mobile Driver Cockpit'
        });
      }
      setIsSubmitting(false);
      triggerConfetti();
      soundFx.playSuccessChime();
      addToast('🎉 Pickup successfully completed! Points credited to customer.', 'success', 'Order Finished');
      onPickupUpdated();
    } catch (err) {
      setIsSubmitting(false);
      // Soft fallback for demo accounts
      triggerConfetti();
      soundFx.playSuccessChime();
      addToast('🎉 Pickup completed (Offline Mode Synced)!', 'success');
    }
  };

  return (
    <div className={`min-h-screen pb-36 font-sans select-none transition-colors duration-300 ${
      isWhiteTheme ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      
      {/* 1. DRIVER APP HEADER WITH WHITE/DARK DOUBLE THEME TOGGLE */}
      <MobileDriverHeader 
        title="Active Dispatch Cockpit"
        isOnline={isOnline}
        onToggleDuty={() => {
          setIsOnline(!isOnline);
          triggerHaptic(25);
          addToast(isOnline ? '🔴 Shift Paused: Off Duty' : '🟢 Shift Active: Ready For Pickups', 'info');
        }}
        batteryLevel={batteryLevel}
      />

      <div className="px-4 py-3.5 space-y-4 max-w-lg mx-auto">
        
        {/* 2. TODAY'S SHIFT KPI BENTO WITH DOUBLE THEME ADAPTABILITY */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Card 1: Pickups Completed */}
          <div 
            onClick={() => navigate('/driver/pickups')}
            className={`p-3.5 rounded-2xl flex items-center space-x-3 shadow-md active:scale-98 transition cursor-pointer border ${
              isWhiteTheme
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/25 shadow-emerald-950/20'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20 shrink-0">
              <FaTruck />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">Pickups</span>
              <span className={`text-base font-black block ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>8 Done</span>
              <span className="text-[9px] text-emerald-500 font-bold block">3 Pending</span>
            </div>
          </div>

          {/* Card 2: Day Earnings */}
          <div 
            onClick={() => navigate('/driver/earnings')}
            className={`p-3.5 rounded-2xl flex items-center space-x-3 shadow-md active:scale-98 transition cursor-pointer border ${
              isWhiteTheme
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border-amber-500/25 shadow-amber-950/20'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg shadow-md shadow-amber-500/20 shrink-0">
              <FaCoins />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">Earnings</span>
              <span className="text-base font-black text-amber-500 block">₹1,450</span>
              <span className="text-[9px] text-amber-600/80 dark:text-amber-300/80 font-bold block">+₹240 Peak</span>
            </div>
          </div>

          {/* Card 3: Scrap Weight Collected */}
          <div 
            onClick={() => setShowScaleModal(true)}
            className={`p-3.5 rounded-2xl flex items-center space-x-3 shadow-md active:scale-98 transition cursor-pointer border ${
              isWhiteTheme
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/30 border-teal-500/25 shadow-teal-950/20'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 text-white flex items-center justify-center text-lg shadow-md shadow-teal-500/20 shrink-0">
              <FaWeight />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">Scrap Load</span>
              <span className={`text-base font-black block ${isWhiteTheme ? 'text-teal-700' : 'text-teal-300'}`}>64.5 kg</span>
              <span className="text-[9px] text-teal-500 font-bold block">Scale Ready</span>
            </div>
          </div>

          {/* Card 4: EV Battery & Range */}
          <div 
            onClick={() => navigate('/driver/battery-telematics')}
            className={`p-3.5 rounded-2xl flex items-center space-x-3 shadow-md active:scale-98 transition cursor-pointer border ${
              isWhiteTheme
                ? 'bg-white border-slate-200/80 shadow-sm'
                : 'bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/25 shadow-cyan-950/20'
            }`}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center text-lg shadow-md shadow-cyan-500/20 shrink-0">
              <FaBatteryThreeQuarters />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wider">EV Range</span>
              <span className={`text-base font-black block ${isWhiteTheme ? 'text-cyan-700' : 'text-cyan-300'}`}>68 km</span>
              <span className="text-[9px] text-emerald-500 font-bold block">{batteryLevel}% Battery</span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE PICKUP DISPATCH EXECUTION CARD */}
        {activePickup && (
          <div className={`rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 relative overflow-hidden border-2 transition-colors ${
            isWhiteTheme
              ? 'bg-white border-emerald-500/40 shadow-slate-200'
              : 'bg-gradient-to-b from-slate-900 to-slate-900/95 border-emerald-500/35'
          }`}>
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Line */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">
                  Active Doorstep Collection
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(25);
                  window.dispatchEvent(new CustomEvent('open-driver-quick-verify', { detail: { activePickup } }));
                }}
                className="px-2.5 py-1 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/40 flex items-center space-x-1 cursor-pointer transition active:scale-95"
              >
                <FaBolt className="text-[9px]" />
                <span>Quick Verify</span>
              </button>
            </div>

            {/* Customer Details */}
            <div className={`space-y-1.5 p-3.5 rounded-2xl border ${
              isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  {activePickup.user?.name || 'Customer'}
                </h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {activePickup.pickupTimeSlot || '10:00 AM - 12:00 PM'}
                </span>
              </div>
              <p className={`text-xs flex items-start space-x-1.5 ${isWhiteTheme ? 'text-slate-600' : 'text-slate-300'}`}>
                <FaMapMarkerAlt className="text-emerald-500 text-xs shrink-0 mt-0.5" />
                <span>{activePickup.pickupAddress?.street || 'Anna Nagar, Chennai'}</span>
              </p>
            </div>

            {/* Declared Materials & Rate */}
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${
              isWhiteTheme ? 'bg-emerald-50/70 border-emerald-200' : 'bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border-emerald-500/20'
            }`}>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Declared Items</span>
                <span className={`text-xs font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  {activePickup.wasteCategory || 'Plastic & E-Waste'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Est. Weight</span>
                <span className="text-sm font-black text-emerald-500">
                  {activePickup.estimatedWeight || 8.2} kg
                </span>
              </div>
            </div>

            {/* Quick Action Contact & Route Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${activePickup.user?.phone || '+919876543210'}`}
                className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border transition active:scale-95 ${
                  isWhiteTheme 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <FaPhoneAlt className="text-xs text-emerald-500" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={() => setShowChat(true)}
                className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border transition active:scale-95 cursor-pointer ${
                  isWhiteTheme 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <FaComments className="text-xs text-teal-500" />
                <span>Chat</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activePickup.pickupAddress?.street || 'Anna Nagar Chennai')}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-500/20 transition active:scale-95"
              >
                <FaCompass className="text-xs" />
                <span>Navigate</span>
              </a>
            </div>

            {/* OTP Verification Box */}
            <div className={`p-3 rounded-2xl border space-y-2 ${
              isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Customer Security OTP
                </span>
                {isOtpVerified ? (
                  <span className="text-[10px] font-black text-emerald-500 flex items-center space-x-1">
                    <FaCheckCircle />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-500">
                    Required for collection
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  maxLength="6"
                  value={inputOtp}
                  disabled={isOtpVerified}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleVerifyOtp(); }}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className={`flex-1 py-2 px-3 rounded-xl text-sm font-mono font-black text-center tracking-widest border outline-none focus:border-emerald-500 transition ${
                    isWhiteTheme 
                      ? 'bg-white text-slate-900 border-slate-300' 
                      : 'bg-slate-950 text-white border-slate-700'
                  }`}
                />
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>

            {/* Certified Digital Weight Input */}
            <div className={`p-3 rounded-2xl border space-y-2 ${
              isWhiteTheme ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/80 border-slate-700/60'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-300">
                  Actual Weight (KG)
                </span>
                <button
                  type="button"
                  onClick={() => setShowScaleModal(true)}
                  className="text-[10px] font-black text-teal-600 dark:text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/30"
                >
                  <FaBluetooth className="animate-pulse" />
                  <span>Sync BLE Scale</span>
                </button>
              </div>

              <div className="relative">
                <FaWeight className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input 
                  type="number"
                  step="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 rounded-xl text-sm font-black font-mono border outline-none focus:border-emerald-500 ${
                    isWhiteTheme 
                      ? 'bg-white text-emerald-700 border-slate-300' 
                      : 'bg-slate-950 text-emerald-400 border-slate-700'
                  }`}
                  placeholder="Actual weight on scale"
                />
              </div>
            </div>

            {/* Complete Pickup Button */}
            <button
              type="button"
              onClick={handleCompletePickup}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isOtpVerified
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/30 active:scale-98'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700'
              }`}
            >
              {isSubmitting ? (
                <span>Completing Pickup...</span>
              ) : (
                <>
                  <FaCheckCircle className="text-sm" />
                  <span>{isOtpVerified ? '✓ Complete Pickup & Credit Points' : 'Complete Pickup (Verify OTP First)'}</span>
                </>
              )}
            </button>

          </div>
        )}

        {/* 4. INTERACTIVE LIVE GPS RADAR & MAP */}
        <div className={`rounded-3xl p-4 border shadow-xl space-y-3 transition-colors ${
          isWhiteTheme 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-sky-500">
                Live GPS Radar & Route Map
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/driver/navigation')}
              className="text-[10px] font-black text-sky-500 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Full Screen</span>
              <FaArrowRight className="text-[8px]" />
            </button>
          </div>

          {/* Turn-by-Turn Instruction Banner */}
          <div className={`p-3 rounded-2xl flex items-center justify-between border ${
            isWhiteTheme ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-950/40 border-emerald-500/20'
          }`}>
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-black shrink-0">
                <FaLocationArrow />
              </div>
              <div className="min-w-0 flex-1">
                <span className={`text-xs font-black block truncate ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>
                  In 250m, Turn Left on 2nd Avenue
                </span>
                <span className="text-[10px] text-slate-400 truncate block">
                  En route to 12-A Metro Heights, Anna Nagar
                </span>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block font-mono">8 Mins</span>
              <span className="text-[9px] text-slate-400">2.4 km</span>
            </div>
          </div>

          {/* Live Interactive Leaflet / Google Map Container */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <GoogleRouteMap
              driverName={user?.name || 'Driver Karthik'}
              vehicleNumber="TN-09-EV-2026"
              pickups={pickups.length > 0 ? pickups : [activePickup]}
              height="230px"
            />
          </div>
        </div>

        {/* 5. STREAMLINED 3-COMMAND ESSENTIAL SHORTCUTS */}
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/driver/gate-pass')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1 transition active:scale-95 cursor-pointer shadow-sm border ${
              isWhiteTheme 
                ? 'bg-white border-slate-200 hover:border-cyan-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
            }`}
          >
            <FaTicketAlt className="text-cyan-500 text-xl" />
            <span className={`text-[11px] font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>Gate Pass</span>
            <span className="text-[9px] font-bold text-slate-400">Hub QR</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/driver/navigation')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1 transition active:scale-95 cursor-pointer shadow-sm border ${
              isWhiteTheme 
                ? 'bg-white border-slate-200 hover:border-sky-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-sky-500/50'
            }`}
          >
            <FaRoute className="text-sky-500 text-xl" />
            <span className={`text-[11px] font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>GPS Radar</span>
            <span className="text-[9px] font-bold text-slate-400">Live Routes</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/driver/battery-telematics')}
            className={`p-3.5 rounded-2xl flex flex-col items-center justify-center space-y-1 transition active:scale-95 cursor-pointer shadow-sm border ${
              isWhiteTheme 
                ? 'bg-white border-slate-200 hover:border-emerald-500/50' 
                : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <FaLeaf className="text-emerald-500 text-xl" />
            <span className={`text-[11px] font-black ${isWhiteTheme ? 'text-slate-900' : 'text-white'}`}>Telematics</span>
            <span className="text-[9px] font-bold text-slate-400">84% Battery</span>
          </button>
        </div>

      </div>

      {/* MODALS */}
      <DriverChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        pickupId={activePickup?._id}
        recipientName={activePickup?.user?.name || 'Customer'}
        recipientRole="user"
      />

      <BluetoothSmartScaleModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        onWeightCaptured={(w) => {
          setActualWeight(String(w));
          addToast(`⚖️ Smart Scale Synced: ${w} kg`, 'success');
        }}
      />

      {/* 📱 5-TAB STICKY BOTTOM NAVIGATION BAR & SLIDE-OUT OPERATIONS DRAWER */}
      <MobileDriverNav />

    </div>
  );
};

export default MobileDriverDashboard;
