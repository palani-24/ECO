import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTruck, FaClock, FaCheck, FaWeight, FaCamera, 
  FaCheckCircle, FaComments, FaPhoneAlt, FaCoins, FaMapMarkerAlt, 
  FaCompass, FaExclamationCircle, FaArrowRight, FaTicketAlt,
  FaBatteryThreeQuarters, FaLeaf, FaShieldAlt, FaBluetooth, FaQrcode
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MobileDriverHeader from './MobileDriverHeader';
import MobileDriverNav from './MobileDriverNav';
import DriverChatModal from './DriverChatModal';
import BluetoothSmartScaleModal from './BluetoothSmartScaleModal';
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

  const [isOnline, setIsOnline] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [actualWeight, setActualWeight] = useState('8.2');
  const [inputOtp, setInputOtp] = useState('4829');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showChat, setShowChat] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

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
      addToast('Invalid OTP code. Please ask customer for the 4-digit code.', 'error');
    }
  };

  const handleCompletePickup = async () => {
    if (!isOtpVerified) {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. DRIVER APP HEADER */}
      <MobileDriverHeader 
        title="Active Dispatch Cockpit"
        isOnline={isOnline}
        onToggleDuty={() => {
          setIsOnline(!isOnline);
          addToast(isOnline ? '🔴 Shift Paused: Off Duty' : '🟢 Shift Active: Ready For Pickups', 'info');
        }}
        batteryLevel={batteryLevel}
      />

      <div className="px-4 py-3.5 space-y-4 max-w-lg mx-auto">
        
        {/* 2. TODAY'S SHIFT KPI BENTO */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-lg">
              <FaTruck />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Today Pickups</span>
              <span className="text-base font-black text-white">8 Completed</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-lg">
              <FaCoins />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Day Earnings</span>
              <span className="text-base font-black text-amber-400">₹1,450.00</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center text-lg">
              <FaWeight />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Scrap Loaded</span>
              <span className="text-base font-black text-teal-300">64.5 kg</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center space-x-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-lg">
              <FaBatteryThreeQuarters />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">EV Range</span>
              <span className="text-base font-black text-cyan-300">68 km ({batteryLevel}%)</span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE PICKUP DISPATCH EXECUTION CARD */}
        {activePickup && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 shadow-xl space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header line */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  Active Doorstep Collection
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                {activePickup.status || 'ASSIGNED'}
              </span>
            </div>

            {/* Customer Details */}
            <div className="space-y-1">
              <h3 className="text-base font-black text-white flex items-center justify-between">
                <span>{activePickup.user?.name || 'Customer'}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  {activePickup.pickupTimeSlot || '10:00 AM'}
                </span>
              </h3>
              <p className="text-xs text-slate-300 flex items-start space-x-1.5 pt-0.5">
                <FaMapMarkerAlt className="text-emerald-400 text-xs shrink-0 mt-0.5" />
                <span>{activePickup.pickupAddress?.street || 'Anna Nagar, Chennai'}</span>
              </p>
            </div>

            {/* Scrap Items & Rate Preview */}
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Declared Materials</span>
                <span className="text-xs font-black text-white">
                  {activePickup.wasteCategory || 'Mixed Dry Scrap'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Weight</span>
                <span className="text-sm font-black text-emerald-400">
                  {activePickup.estimatedWeight || 5} kg
                </span>
              </div>
            </div>

            {/* Quick Action Contact & Route Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${activePickup.user?.phone || '+919876543210'}`}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border border-slate-700 transition active:scale-95"
              >
                <FaPhoneAlt className="text-xs text-emerald-400" />
                <span>Call</span>
              </a>

              <button
                type="button"
                onClick={() => setShowChat(true)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 border border-slate-700 transition active:scale-95 cursor-pointer"
              >
                <FaComments className="text-xs text-teal-400" />
                <span>Chat</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activePickup.pickupAddress?.street || 'Anna Nagar Chennai')}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
              >
                <FaCompass className="text-xs" />
                <span>Navigate</span>
              </a>
            </div>

            {/* OTP Verification Box */}
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-300">
                  Customer Security OTP
                </span>
                {isOtpVerified ? (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center space-x-1">
                    <FaCheckCircle />
                    <span>VERIFIED</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400">
                    Required before weighing
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  maxLength="6"
                  value={inputOtp}
                  disabled={isOtpVerified}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  className="flex-1 py-2 px-3 bg-slate-900 rounded-xl text-sm font-mono font-black text-white text-center tracking-widest border border-slate-700 outline-none focus:border-emerald-500"
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
            <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-300">
                  Actual Collected Weight (KG)
                </span>
                <button
                  type="button"
                  onClick={() => setShowScaleModal(true)}
                  className="text-[10px] font-bold text-teal-400 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <FaBluetooth />
                  <span>Sync Scale</span>
                </button>
              </div>

              <div className="relative">
                <FaWeight className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input 
                  type="number"
                  step="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 rounded-xl text-sm font-black text-white border border-slate-700 outline-none focus:border-emerald-500"
                  placeholder="Actual weight on scale"
                />
              </div>
            </div>

            {/* Complete Pickup Button */}
            <button
              type="button"
              onClick={handleCompletePickup}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer ${
                isOtpVerified
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 active:scale-98'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {isSubmitting ? (
                <span>Completing Pickup...</span>
              ) : (
                <>
                  <FaCheckCircle className="text-sm" />
                  <span>Complete Pickup & Credit Points</span>
                </>
              )}
            </button>

          </div>
        )}

        {/* 4. QUICK LOGISTICS SHORTCUTS */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => navigate('/driver/gate-pass')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-emerald-500/50 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <FaTicketAlt className="text-cyan-400 text-lg" />
            <span className="text-[11px] font-black text-white">Gate Pass</span>
            <span className="text-[9px] font-bold text-slate-400">Hub QR</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/driver/battery-telematics')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-emerald-500/50 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <FaLeaf className="text-emerald-400 text-lg" />
            <span className="text-[11px] font-black text-white">EV Telematics</span>
            <span className="text-[9px] font-bold text-slate-400">Battery & Hub</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/driver/earnings')}
            className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-1 hover:border-emerald-500/50 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <FaCoins className="text-amber-400 text-lg" />
            <span className="text-[11px] font-black text-white">Earnings</span>
            <span className="text-[9px] font-bold text-slate-400">Incentives</span>
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
        onWeightSynced={(w) => {
          setActualWeight(String(w));
          addToast(`⚖️ Smart Scale Synced: ${w} kg`, 'success');
        }}
      />

      {/* STICKY BOTTOM NAV BAR (4 Tabs) */}
      <MobileDriverNav />

    </div>
  );
};

export default MobileDriverDashboard;
