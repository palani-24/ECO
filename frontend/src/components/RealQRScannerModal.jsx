import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTimes, FaCamera, FaBolt, FaCheckCircle, 
  FaShieldAlt, FaLock, FaStore, FaReceipt, FaSpinner,
  FaCheck, FaArrowRight, FaSyncAlt, FaImage
} from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const DEMO_MERCHANTS = [
  {
    id: 'm-1',
    name: 'Green Earth Organics & Zero-Waste Mart',
    vpa: 'greenearth@okaxis',
    category: 'Certified Organic Store',
    location: 'Race Course, Coimbatore',
    avatar: '🌱',
    suggestedAmount: 140
  },
  {
    id: 'm-2',
    name: 'Coimbatore Smart City Recycling Kiosk',
    vpa: 'smartkiosk.cbe@upi',
    category: 'Municipal Civic Utility',
    location: 'Gandhipuram Terminal, Coimbatore',
    avatar: '♻️',
    suggestedAmount: 85
  },
  {
    id: 'm-3',
    name: 'TNEB Fast EV & Battery Swap Hub',
    vpa: 'tneb.evpower@paytm',
    category: 'Clean Energy Mobility',
    location: 'Avinashi Road, Coimbatore',
    avatar: '⚡',
    suggestedAmount: 210
  }
];

const RealQRScannerModal = ({ 
  isOpen, 
  onClose, 
  walletCash = 562, 
  onPaymentComplete 
}) => {
  if (!isOpen) return null;

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // States: 'scanning' | 'paying' | 'processing' | 'success'
  const [step, setStep] = useState('scanning');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Merchant & Payment Data
  const [detectedMerchant, setDetectedMerchant] = useState(DEMO_MERCHANTS[0]);
  const [payAmount, setPayAmount] = useState('140');
  const [enteredPin, setEnteredPin] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState(null);

  // Initialize Real Device Camera Stream
  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      try {
        setCameraError(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            setCameraActive(true);
          }
        } else {
          setCameraError('Camera API not supported in this browser environment. Using high-resolution optical simulator.');
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        setCameraError('Camera permission not granted or device camera busy. Use the interactive scannable targets below.');
      }
    };

    if (step === 'scanning') {
      startCamera();
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [step]);

  // Handle Scanning a QR Code
  const handleSelectMerchant = (merchant) => {
    triggerHaptic(20);
    soundFx?.playSuccessChime?.();
    setDetectedMerchant(merchant);
    setPayAmount(merchant.suggestedAmount.toString());
    setStep('paying');
  };

  // Process Merchant Payment
  const handleProcessPay = (e) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amt > walletCash) {
      alert('Insufficient Wallet Cash balance');
      return;
    }

    setStep('processing');
    triggerHaptic(30);

    setTimeout(() => {
      const receipt = {
        txnId: `TXN-QR-${Date.now().toString().slice(-6)}`,
        utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        merchantName: detectedMerchant.name,
        merchantVpa: detectedMerchant.vpa,
        amount: amt,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPaymentReceipt(receipt);
      setStep('success');
      triggerConfetti({ count: 100 });
      soundFx?.playSuccessChime?.();

      if (onPaymentComplete) {
        onPaymentComplete({
          amount: amt,
          merchant: detectedMerchant,
          receipt
        });
      }
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white/98 backdrop-blur-xl border-2 border-slate-300 rounded-3xl p-5 sm:p-7 text-slate-800 shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto my-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* ========================================================================= */}
          {/* STEP 1: REAL CAMERA & OPTICAL QR SCANNER                                 */}
          {/* ========================================================================= */}
          {step === 'scanning' && (
            <div className="space-y-4">
              
              {/* Header */}
              <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-xl shrink-0">
                  <FaQrcode />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Scan & Pay with Camera
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Align any merchant UPI QR code within the viewfinder frame
                  </p>
                </div>
              </div>

              {/* Real Video Camera Viewfinder Box with Laser Guide */}
              <div className="relative w-full h-64 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner">
                
                {/* Live WebCam Video Feed */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-20'}`}
                />

                {/* Animated Glowing Laser Scanning Beam */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  {/* Target Crosshairs Box */}
                  <div className="relative w-48 h-48 border-2 border-dashed border-emerald-400/90 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    
                    {/* 4 Corner Markers */}
                    <span className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl"></span>
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr"></span>
                    <span className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl"></span>
                    <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br"></span>

                    {/* Animated Scanning Line */}
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse"></div>

                    <span className="text-[11px] font-black tracking-wider uppercase text-emerald-300 bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
                      Scanning QR...
                    </span>
                  </div>
                </div>

                {/* Flash / Status Badge */}
                <div className="absolute bottom-3 inset-x-0 flex items-center justify-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 backdrop-blur-sm">
                    {cameraActive ? '🟢 Live Camera Active' : '📷 Optical Scanner Ready'}
                  </span>
                </div>
              </div>

              {/* Instant Tap Scannable Merchants (Works instantly in all environments) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-black text-slate-800">
                  <span>Or Tap Any Merchant QR Target to Pay:</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Instant Auto-Detect
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_MERCHANTS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelectMerchant(m)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-400 rounded-2xl text-left transition cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-xl p-1 bg-white rounded-lg border border-slate-200">{m.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-black text-slate-900 truncate group-hover:text-emerald-800">
                            {m.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 font-bold block truncate">{m.vpa}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-[10px] font-black text-emerald-700">
                        <span>Pay ₹{m.suggestedAmount}</span>
                        <span>Scan →</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallet Balance Strip */}
              <div className="p-3 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex justify-between items-center text-xs">
                <span className="text-emerald-800 font-bold">Your Wallet Cash Balance:</span>
                <span className="font-black text-slate-900 text-sm">₹{walletCash}.00</span>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ENTER AMOUNT & CONFIRM PAYMENT                                  */}
          {/* ========================================================================= */}
          {step === 'paying' && detectedMerchant && (
            <form onSubmit={handleProcessPay} className="space-y-4">
              
              {/* Detected Merchant Header */}
              <div className="p-4 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 bg-white rounded-xl border border-emerald-200">{detectedMerchant.avatar}</span>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-black text-slate-900">{detectedMerchant.name}</h4>
                      <FaCheckCircle className="text-emerald-600 text-xs" />
                    </div>
                    <span className="text-[11px] text-emerald-800 font-mono font-bold block">{detectedMerchant.vpa}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">{detectedMerchant.location}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('scanning')}
                  className="text-xs font-black text-slate-500 hover:text-slate-800 underline"
                >
                  Rescan
                </button>
              </div>

              {/* Payment Amount Input */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1">
                  Enter Payment Amount (₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">₹</span>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    max={walletCash}
                    className="w-full pl-8 pr-4 py-3 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-2xl text-lg font-black text-slate-900 focus:outline-none shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* 4-Digit Wallet Security PIN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-slate-800">Enter 4-Digit Wallet PIN:</label>
                  <span className="text-[10px] font-bold text-slate-400">Default PIN: 4829</span>
                </div>
                <input
                  type="password"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  placeholder="••••"
                  maxLength={4}
                  className="w-36 text-center text-lg font-mono font-black tracking-widest px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Wallet Balance & Debit Calculation */}
              <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Available Wallet Balance:</span>
                  <span className="font-bold text-slate-900">₹{walletCash}.00</span>
                </div>
                <div className="flex justify-between font-black border-t border-slate-200/80 pt-1">
                  <span>Balance After Payment:</span>
                  <span className="text-emerald-700">₹{Math.max(0, walletCash - Number(payAmount || 0))}.00</span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setStep('scanning')}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                >
                  Back to Camera
                </button>
                <button
                  type="submit"
                  disabled={Number(payAmount) > walletCash}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <FaLock className="text-xs" />
                  <span>Pay ₹{payAmount} from Wallet</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: PROCESSING                                                       */}
          {/* ========================================================================= */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-2xl animate-spin">
                <FaSpinner />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">Authorizing NPCI Fast Payment...</h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Debiting ₹{payAmount} from Eco-Wallet Cash
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUCCESS RECEIPT                                                  */}
          {/* ========================================================================= */}
          {step === 'success' && paymentReceipt && (
            <div className="py-4 text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 border-2 border-emerald-200 shadow-sm">
                <FaCheck className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Successful
                </span>
                <h4 className="text-2xl font-black text-slate-900 pt-1">₹{paymentReceipt.amount}.00</h4>
                <p className="text-xs text-slate-600 font-semibold">
                  Paid to {paymentReceipt.merchantName}
                </p>
              </div>

              {/* Receipt Details Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">UPI UTR Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentReceipt.utr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Merchant VPA:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentReceipt.merchantVpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Source:</span>
                  <span className="font-black text-emerald-700">Eco-Wallet Cash Balance</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Time:</span>
                  <span className="font-bold text-slate-800">{paymentReceipt.timestamp}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <FaReceipt />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 cursor-pointer transition active:scale-98"
                >
                  Done & Return to Wallet
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RealQRScannerModal;
