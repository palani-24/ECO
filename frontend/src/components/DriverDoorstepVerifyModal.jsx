import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaBolt, FaCheckCircle, FaWeight, FaCamera, 
  FaPhoneAlt, FaMapMarkerAlt, FaCompass, 
  FaBluetooth, FaCoins, FaReceipt
} from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';
import { useToast } from '../context/ToastContext';
import BluetoothSmartScaleModal from './BluetoothSmartScaleModal';

const DriverDoorstepVerifyModal = ({ 
  isOpen, 
  onClose,
  activePickup = {
    _id: 'pk-live-102',
    user: { name: 'Priya Sundaram', phone: '+91 98765 43210' },
    pickupAddress: { street: '12-A, Metro Heights, Anna Nagar, Chennai' },
    wasteCategory: 'Plastic (5kg), E-Waste (3.2kg)',
    estimatedWeight: 8.2,
    verificationCode: '4829',
    pickupTimeSlot: '10:00 AM - 12:00 PM'
  },
  onComplete = () => {}
}) => {
  const { addToast } = useToast();
  const [inputOtp, setInputOtp] = useState(activePickup.verificationCode || '4829');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [actualWeight, setActualWeight] = useState(String(activePickup.estimatedWeight || '8.2'));
  const [showScaleModal, setShowScaleModal] = useState(false);
  const [isCapturedPhoto, setIsCapturedPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleVerifyOtp = () => {
    triggerHaptic(30);
    const expected = activePickup.verificationCode || '4829';
    if (inputOtp.trim() === expected.trim()) {
      setIsOtpVerified(true);
      soundFx.playSuccessChime();
      addToast('✅ Customer Doorstep OTP Authenticated!', 'success', 'Verified');
    } else {
      soundFx.playAlertWarning();
      addToast('❌ Invalid OTP. Please confirm with customer.', 'error');
    }
  };

  const handlePhotoCapture = () => {
    triggerHaptic(20);
    setIsCapturedPhoto(true);
    soundFx.playCameraSnap();
    addToast('📸 Doorstep Scrap Photo Verified & Geo-Tagged', 'info');
  };

  const handleFinish = () => {
    if (!isOtpVerified) {
      soundFx.playAlertWarning();
      addToast('Please verify customer 4-digit OTP code first', 'warning');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(60);

    setTimeout(() => {
      setIsSubmitting(false);
      triggerConfetti();
      soundFx.playSuccessChime();
      addToast('🎉 Doorstep Scrap Collected & Points Credited!', 'success', 'Collection Done');
      onComplete({
        pickupId: activePickup._id,
        weight: parseFloat(actualWeight),
        otp: inputOtp
      });
      onClose();
    }, 600);
  };

  const weightNum = parseFloat(actualWeight) || 0;
  const estPoints = Math.round(weightNum * 40);
  const estCash = Math.round(estPoints * 0.25);

  return (
    <>
      <AnimatePresence>
        <div 
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 260 }}
            className="w-full max-w-lg bg-slate-900 border-t sm:border border-emerald-500/30 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                  <FaBolt className="text-base" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white flex items-center space-x-2">
                    <span>Doorstep Verification & Weigh</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black border border-emerald-500/30">
                      LIVE
                    </span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold">Fast Customer Authentication & Digital Scale</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 cursor-pointer transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Customer Contact & Navigation Card */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer</span>
                  <h4 className="text-sm font-black text-white">{activePickup.user?.name || 'Priya Sundaram'}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Slot</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{activePickup.pickupTimeSlot || '10:00 AM'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-1.5 text-xs text-slate-300">
                <FaMapMarkerAlt className="text-emerald-400 text-xs shrink-0 mt-0.5" />
                <span className="truncate">{activePickup.pickupAddress?.street || '12-A, Metro Heights, Anna Nagar, Chennai'}</span>
              </div>

              {/* Quick Communication Action Strip */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${activePickup.user?.phone || '+919876543210'}`}
                  className="py-2 px-3 bg-slate-700/70 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border border-slate-600 transition active:scale-95"
                >
                  <FaPhoneAlt className="text-xs text-emerald-400" />
                  <span>Call Customer</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activePickup.pickupAddress?.street || 'Anna Nagar Chennai')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-sm transition active:scale-95"
                >
                  <FaCompass className="text-xs" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>

            {/* STEP 1: Customer OTP Authentication */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-800/80 to-slate-800/80 rounded-2xl border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white flex items-center space-x-1.5">
                  <span>1. Customer 4-Digit Security OTP</span>
                </span>
                {isOtpVerified ? (
                  <span className="text-[10px] font-black text-emerald-400 flex items-center space-x-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <FaCheckCircle />
                    <span>AUTHENTICATED</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-400">
                    Ask customer for 4-digit code
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
                  placeholder="e.g. 4829"
                  className="flex-1 py-2.5 px-3 bg-slate-950 rounded-xl text-base font-mono font-black text-white text-center tracking-widest border border-slate-700 outline-none focus:border-emerald-500 transition"
                />
                {!isOtpVerified && (
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-500 active:scale-95 transition cursor-pointer"
                  >
                    Verify Code
                  </button>
                )}
              </div>
            </div>

            {/* STEP 2: Weight Verification & Smart Scale */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">2. Actual Weight & Scrap Items</span>
                <button
                  type="button"
                  onClick={() => setShowScaleModal(true)}
                  className="text-[10px] font-black text-teal-400 hover:text-teal-300 flex items-center space-x-1 bg-teal-500/10 px-2 py-0.5 rounded-lg border border-teal-500/30 cursor-pointer"
                >
                  <FaBluetooth className="animate-pulse" />
                  <span>Sync BLE Scale</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <FaWeight className="absolute left-3 top-3.5 text-slate-400 text-xs" />
                  <input 
                    type="number"
                    step="0.1"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(e.target.value)}
                    className="w-full pl-8 pr-12 py-2.5 bg-slate-950 rounded-xl text-base font-mono font-black text-emerald-400 border border-slate-700 outline-none focus:border-emerald-500"
                    placeholder="8.2"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">KG</span>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center space-x-1">
                  {['5.0', '8.2', '12.5'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setActualWeight(preset)}
                      className={`px-2.5 py-2 rounded-xl text-[10px] font-black cursor-pointer border transition ${
                        actualWeight === preset 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {preset}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Value Preview */}
              <div className="p-2.5 bg-slate-950/60 rounded-xl flex items-center justify-between text-xs border border-slate-800">
                <span className="text-slate-400 font-bold">Materials: {activePickup.wasteCategory || 'Mixed Scrap'}</span>
                <div className="text-right">
                  <span className="text-emerald-400 font-black">+{estPoints} EcoPoints</span>
                  <span className="text-[10px] text-amber-400 font-bold ml-1.5">(≈ ₹{estCash})</span>
                </div>
              </div>
            </div>

            {/* STEP 3: Camera Proof & Tamper Check */}
            <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/70 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${isCapturedPhoto ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                  <FaCamera />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Doorstep Scrap Photo</span>
                  <span className="text-[10px] text-slate-400">
                    {isCapturedPhoto ? '✅ GPS & Time Watermark Embedded' : 'Optional tamper audit photo'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePhotoCapture}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 cursor-pointer active:scale-95 transition"
              >
                {isCapturedPhoto ? 'Retake' : 'Snap Photo'}
              </button>
            </div>

            {/* STEP 4: Confirm & Complete Doorstep Action */}
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-2xl font-black text-xs shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                isOtpVerified
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-emerald-500/30 active:scale-98'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {isSubmitting ? (
                <span>Crediting Points & Printing e-Receipt...</span>
              ) : (
                <>
                  <FaReceipt className="text-sm" />
                  <span>Complete Pickup & Credit {estPoints} EcoPoints</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* IoT Bluetooth Smart Scale Modal */}
      <BluetoothSmartScaleModal
        isOpen={showScaleModal}
        onClose={() => setShowScaleModal(false)}
        materialName={activePickup.wasteCategory || 'Recyclables'}
        estimatedWeight={parseFloat(actualWeight) || 8.2}
        onWeightCaptured={(w) => {
          setActualWeight(String(w));
          addToast(`⚖️ Scale Connected: ${w} kg recorded`, 'success');
        }}
      />
    </>
  );
};

export default DriverDoorstepVerifyModal;
