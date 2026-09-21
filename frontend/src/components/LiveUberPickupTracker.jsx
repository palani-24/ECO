import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTruck, FaMapMarkerAlt, FaPhoneAlt, FaComments, FaCheckCircle, 
  FaClock, FaShieldAlt, FaBolt, FaLeaf, FaCoins, FaWeightHanging, 
  FaQrcode, FaArrowRight, FaRoute, FaStar, FaVolumeUp, FaShareAlt,
  FaCheck, FaPlay, FaSyncAlt, FaTimes
} from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';

const STAGES = [
  {
    id: 'assigned',
    title: 'Driver Assigned',
    tamil: 'ஓட்டுநர் நியமிக்கப்பட்டார்',
    subtitle: 'EV Fleet Driver accepted your doorstep pickup request',
    badge: 'ASSIGNED',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    etaMin: 12,
    progress: 25,
    icon: '📋'
  },
  {
    id: 'en_route',
    title: 'Driver En Route',
    tamil: 'ஓட்டுநர் வந்து கொண்டுள்ளார்',
    subtitle: 'Driver is moving toward your location via Avinashi Road',
    badge: 'LIVE GPS',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    etaMin: 5,
    progress: 68,
    icon: '🚚'
  },
  {
    id: 'arrived',
    title: 'Arrived at Doorstep',
    tamil: 'வீட்டு வாசலில் உள்ளார்',
    subtitle: 'Driver has reached your gate. Please share your 4-digit OTP',
    badge: 'DOORSTEP',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    etaMin: 0,
    progress: 92,
    icon: '🔔'
  },
  {
    id: 'completed',
    title: 'Weighed & Credited',
    tamil: 'எடை சரிபார்க்கப்பட்டு புள்ளிகள் வரவு',
    subtitle: '8.5 kg waste verified! +180 EcoPts added to your green balance',
    badge: 'COMPLETED',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    etaMin: 0,
    progress: 100,
    icon: '🎉'
  }
];

const LiveUberPickupTracker = ({ 
  pickup: externalPickup = null,
  onOpenChat = null,
  onViewMap = null,
  className = '' 
}) => {
  // Current active stage
  const [currentStageIndex, setCurrentStageIndex] = useState(1); // Default to 'Driver En Route'
  const [etaCountdown, setEtaCountdown] = useState(5);
  const [liveSpeed, setLiveSpeed] = useState(24);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const activeStage = STAGES[currentStageIndex];

  // Map external status to stage index if provided
  useEffect(() => {
    if (externalPickup?.status) {
      const s = externalPickup.status.toLowerCase();
      if (s === 'pending' || s === 'assigned') setCurrentStageIndex(0);
      else if (s === 'accepted' || s === 'en_route') setCurrentStageIndex(1);
      else if (s === 'arrived') setCurrentStageIndex(2);
      else if (s === 'completed') setCurrentStageIndex(3);
    }
  }, [externalPickup?.status]);

  // Live ETA and speed micro-fluctuation for realism
  useEffect(() => {
    if (currentStageIndex === 1) {
      const interval = setInterval(() => {
        setLiveSpeed(prev => 20 + Math.floor(Math.random() * 8));
        setEtaCountdown(prev => (prev > 1 ? prev - 1 : 1));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [currentStageIndex]);

  // Handle stage change manually or via simulation
  const handleSelectStage = (index) => {
    setCurrentStageIndex(index);
    if (soundEnabled) {
      if (index === 3) {
        soundFx.playSuccessChime();
        triggerConfetti({ count: 90 });
      } else {
        soundFx.playScanBeep();
      }
    }
  };

  // Run full automated demo walkthrough
  const handleRunDemo = () => {
    setIsDemoRunning(true);
    setCurrentStageIndex(0);
    soundFx.playScanBeep();

    setTimeout(() => {
      setCurrentStageIndex(1);
      soundFx.playScanBeep();
    }, 2500);

    setTimeout(() => {
      setCurrentStageIndex(2);
      soundFx.playScanBeep();
    }, 5500);

    setTimeout(() => {
      setCurrentStageIndex(3);
      soundFx.playSuccessChime();
      triggerConfetti({ count: 100 });
      setIsDemoRunning(false);
    }, 8500);
  };

  // Driver details
  const driverName = externalPickup?.driver?.name || externalPickup?.assignedDriver?.name || 'Palani (Fleet Driver)';
  const driverPhone = externalPickup?.driver?.phone || '+91 93610 99771';
  const vehicleNumber = externalPickup?.driver?.vehicleNumber || 'TN-38-PL-9971';
  const vehicleType = externalPickup?.driver?.vehicleType || 'Electric Auto-rickshaw (EV)';
  const otpCode = externalPickup?.otpCode || '8419';
  const wasteType = externalPickup?.wasteType || 'Plastics & E-Waste';
  const estimatedWeight = externalPickup?.estimatedWeight || '8.5 kg';
  const pickupId = externalPickup?._id ? externalPickup._id.substring(0, 8).toUpperCase() : 'ECO-9945';

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-emerald-500/25 p-5 sm:p-6 text-white shadow-2xl shadow-emerald-950/40 backdrop-blur-xl ${className}`}>
      
      {/* Background Ambient Glow Orbs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Live Badge + ETA + Interactive Demo Button */}
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center h-11 w-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <FaTruck className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Doorstep Pickup Tracker</span>
                <span className={`px-2 py-0.5 text-[9px] font-black tracking-wider uppercase rounded-full border ${activeStage.badgeColor}`}>
                  {activeStage.badge}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Order #{pickupId} • {wasteType} (~{estimatedWeight})
            </p>
          </div>
        </div>

        {/* ETA & Interactive Demo Button */}
        <div className="flex items-center space-x-2">
          {currentStageIndex < 2 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center space-x-1.5 text-emerald-400 text-xs font-black">
              <FaClock className="text-xs" />
              <span>ETA {etaCountdown} Mins</span>
            </div>
          )}

          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            title="Preview all 4 live pickup steps"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center space-x-1 cursor-pointer disabled:opacity-50"
          >
            <FaPlay className="text-[10px] text-emerald-400" />
            <span className="hidden sm:inline">Simulate Flow</span>
          </button>
        </div>
      </div>

      {/* Interactive Step Timeline (Uber / Swiggy Style) */}
      <div className="relative z-10 py-5">
        <div className="grid grid-cols-4 gap-2 relative">
          
          {/* Connecting Progress Line */}
          <div className="absolute top-4 left-6 right-6 h-1 bg-slate-800/90 rounded-full z-0 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${activeStage.progress}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>

          {STAGES.map((stage, idx) => {
            const isPassed = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                {/* Node Circle */}
                <div 
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent 
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/25 shadow-lg shadow-emerald-500/50 scale-110' 
                      : isPassed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700/50'
                  }`}
                >
                  {isPassed ? <FaCheck className="text-xs" /> : idx + 1}
                </div>

                {/* Node Label */}
                <span className={`mt-2 text-[10px] sm:text-xs font-bold truncate max-w-full ${
                  isCurrent ? 'text-emerald-400 font-black' : isPassed ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {stage.title}
                </span>

                <span className="hidden sm:block text-[9px] text-slate-500 font-medium truncate max-w-full">
                  {stage.tamil}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulated Live Animated GPS Mini-Route Map */}
      <div className="relative z-10 my-1 rounded-2xl bg-slate-950/90 border border-slate-800 p-4 overflow-hidden">
        
        {/* Animated Radar Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        {/* Telematics Bar Top */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-bold text-slate-400 pb-3 border-b border-slate-800/60">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200">{activeStage.subtitle}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <FaBolt className="text-[10px]" /> Zero Emission EV
            </span>
            <span className="hidden sm:inline font-mono text-slate-300">{liveSpeed} km/h</span>
          </div>
        </div>

        {/* Route Animation Track */}
        <div className="relative py-7 px-4 sm:px-8">
          
          {/* Glowing Animated Highway Route */}
          <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
              style={{ width: `${activeStage.progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* Citizen Home Gate Marker (Left side) */}
          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg">
              <FaMapMarkerAlt className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black text-emerald-400 mt-1 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Your Gate
            </span>
          </div>

          {/* Moving EV Tipper Vehicle (Interpolates along track) */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
            style={{ left: `calc(${Math.min(88, Math.max(12, activeStage.progress))}% - 16px)` }}
            transition={{ type: 'spring', stiffness: 60 }}
          >
            <div className="relative h-9 w-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white animate-bounce">
              <FaTruck className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-slate-950" />
            </div>
            <span className="text-[9px] font-black text-amber-300 mt-1 bg-slate-900/95 px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap shadow-md">
              {currentStageIndex === 3 ? 'Completed' : currentStageIndex === 2 ? 'At Doorstep' : `${etaCountdown} min`}
            </span>
          </motion.div>

          {/* Scrap Recycling Micro-Hub Destination (Right side) */}
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="h-8 w-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg">
              <FaLeaf className="h-4 w-4" />
            </div>
            <span className="text-[9px] font-black text-cyan-400 mt-1 whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-500/20">
              Eco Hub
            </span>
          </div>
        </div>
      </div>

      {/* Driver Card + Doorstep OTP + Quick Actions Bar */}
      <div className="relative z-10 mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Driver Profile (8 cols) */}
        <div className="md:col-span-8 flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
                <div className="h-full w-full rounded-2xl bg-slate-900 flex items-center justify-center text-lg font-black text-emerald-400">
                  {driverName.charAt(0)}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 rounded-full text-slate-950 text-[10px]" title="Eco Verified Driver">
                <FaCheckCircle />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-white">{driverName}</h4>
                <div className="flex items-center text-amber-400 text-xs font-black">
                  <FaStar className="mr-0.5 text-[10px]" /> 4.9
                </div>
              </div>
              <p className="text-xs text-slate-400 font-mono font-medium">
                {vehicleNumber} • <span className="text-emerald-400">{vehicleType}</span>
              </p>
            </div>
          </div>

          {/* Quick Call & Chat Buttons */}
          <div className="flex items-center space-x-2">
            <a 
              href={`tel:${driverPhone}`}
              className="p-2.5 rounded-xl bg-slate-700/70 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-600 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="Direct Call Driver"
            >
              <FaPhoneAlt className="h-3.5 w-3.5" />
            </a>

            <button 
              onClick={() => onOpenChat ? onOpenChat() : alert(`Starting Live In-App Chat with Driver: ${driverName}`)}
              className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/40 transition flex items-center justify-center cursor-pointer shadow-sm"
              title="Live Chat with Driver"
            >
              <FaComments className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Security Doorstep OTP Box (4 cols) */}
        <div className="md:col-span-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-slate-800/50 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
              Doorstep Pickup OTP
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Share upon driver arrival
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-inner">
            <span className="font-mono text-base font-black tracking-widest text-emerald-300">
              {otpCode}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Banner (shown on Completed Stage) */}
      <AnimatePresence>
        {currentStageIndex === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="relative z-10 mt-3 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
              <FaCheckCircle className="text-emerald-400 text-sm" />
              <span>Waste Picked Up: 8.5 kg • +180 EcoPoints Credited to Wallet!</span>
            </div>
            <a 
              href="/rewards" 
              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black hover:bg-emerald-400 transition"
            >
              Redeem Rewards →
            </a>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LiveUberPickupTracker;
