import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTruck, FaMapMarkerAlt, FaPhoneAlt, FaComments, FaCheckCircle, 
  FaClock, FaBolt, FaLeaf, FaStar, FaPlay, FaCheck, FaHome, FaShoppingCart
} from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';

const STAGES = [
  {
    id: 'assigned',
    title: 'Driver Assigned',
    subtitle: 'Driver accepted your pickup request',
    time: '10:12 AM',
    badge: 'ASSIGNED',
    progress: 25,
    icon: FaCheck
  },
  {
    id: 'en_route',
    title: 'Driver En Route',
    subtitle: 'Driver is moving toward your location via Avinashi Road',
    time: '10:18 AM',
    badge: 'LIVE GPS',
    progress: 62,
    icon: FaTruck
  },
  {
    id: 'arrived',
    title: 'Arrived at Doorstep',
    subtitle: 'Driver has reached your gate. Please share your 4-digit OTP',
    time: '--:--',
    badge: 'DOORSTEP',
    progress: 88,
    icon: FaHome
  },
  {
    id: 'completed',
    title: 'Weighed & Credited',
    subtitle: '8.5 kg waste verified! +180 EcoPoints added to green wallet',
    time: '--:--',
    badge: 'COMPLETED',
    progress: 100,
    icon: FaShoppingCart
  }
];

const LiveUberPickupTracker = ({ 
  pickup: externalPickup = null,
  onOpenChat = null,
  className = '' 
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(1); // Default to 'Driver En Route'
  const [etaCountdown, setEtaCountdown] = useState(5);
  const [liveSpeed, setLiveSpeed] = useState(24);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const activeStage = STAGES[currentStageIndex];

  useEffect(() => {
    if (externalPickup?.status) {
      const s = externalPickup.status.toLowerCase();
      if (s === 'pending' || s === 'assigned') setCurrentStageIndex(0);
      else if (s === 'accepted' || s === 'en_route') setCurrentStageIndex(1);
      else if (s === 'arrived') setCurrentStageIndex(2);
      else if (s === 'completed') setCurrentStageIndex(3);
    }
  }, [externalPickup?.status]);

  useEffect(() => {
    if (currentStageIndex === 1) {
      const interval = setInterval(() => {
        setLiveSpeed(prev => 22 + Math.floor(Math.random() * 5));
        setEtaCountdown(prev => (prev > 1 ? prev - 1 : 1));
      }, 9000);
      return () => clearInterval(interval);
    }
  }, [currentStageIndex]);

  const handleSelectStage = (index) => {
    setCurrentStageIndex(index);
    if (index === 3) {
      soundFx.playSuccessChime();
      triggerConfetti({ count: 90 });
    } else {
      soundFx.playScanBeep();
    }
  };

  const handleRunDemo = () => {
    setIsDemoRunning(true);
    setCurrentStageIndex(0);
    soundFx.playScanBeep();

    setTimeout(() => {
      setCurrentStageIndex(1);
      soundFx.playScanBeep();
    }, 2200);

    setTimeout(() => {
      setCurrentStageIndex(2);
      soundFx.playScanBeep();
    }, 5000);

    setTimeout(() => {
      setCurrentStageIndex(3);
      soundFx.playSuccessChime();
      triggerConfetti({ count: 100 });
      setIsDemoRunning(false);
    }, 7800);
  };

  // Driver details
  const driverName = externalPickup?.driver?.name || externalPickup?.assignedDriver?.name || 'Palani Driver';
  const driverPhone = externalPickup?.driver?.phone || '+91 93610 99771';
  const vehicleNumber = externalPickup?.driver?.vehicleNumber || 'TN-01-AX-9945';
  const vehicleType = externalPickup?.driver?.vehicleType || 'E-Rickshaw Tipper (EV)';
  const otpCode = externalPickup?.otpCode || '4829';
  const wasteType = externalPickup?.wasteType || 'Plastics & E-Waste';
  const estimatedWeight = externalPickup?.estimatedWeight || '8';
  const pickupId = externalPickup?._id ? externalPickup._id.substring(0, 8).toUpperCase() : '6AB7D28F';

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 text-slate-800 shadow-sm ${className}`}>
      
      {/* Top Header: Badge, Title & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] flex items-center justify-center text-xl shadow-xs">
            <FaTruck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Doorstep Pickup Tracker
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                LIVE GPS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Order #{pickupId} - {wasteType} (~{estimatedWeight})
            </p>
          </div>
        </div>

        {/* ETA & Interactive Demo Button */}
        <div className="flex items-center space-x-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] flex items-center space-x-1.5 text-[#059669] text-xs font-bold shadow-xs">
            <FaClock className="text-xs" />
            <span>ETA {etaCountdown} Mins</span>
          </div>

          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FaPlay className="text-[10px] text-slate-800" />
            <span>Simulate Flow</span>
          </button>
        </div>
      </div>

      {/* 4-Step Milestone Progress Bar */}
      <div className="relative py-5">
        <div className="grid grid-cols-4 gap-2 relative">
          
          {/* Connecting Cyan/Teal Progress Line */}
          <div className="absolute top-5 left-10 right-10 h-1 bg-slate-100 rounded-full z-0 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#059669] via-[#0d9488] to-[#06b6d4] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${activeStage.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {STAGES.map((stage, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                {/* Node Circle */}
                <div 
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent 
                      ? 'bg-[#0f9f6e] text-white ring-4 ring-[#0f9f6e]/20 shadow-md scale-105' 
                      : isPassed 
                        ? 'bg-[#0f9f6e] text-white shadow-xs' 
                        : 'bg-white text-slate-400 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className="text-sm" />
                </div>

                <span className={`mt-2.5 text-xs font-bold truncate max-w-full ${
                  isCurrent ? 'text-slate-900 font-extrabold' : isPassed ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                }`}>
                  {stage.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {stage.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stylized Live GPS Route Map Container */}
      <div className="relative my-2 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-xs">
        
        {/* Telematics Bar Top */}
        <div className="flex items-center justify-between text-xs font-semibold px-4 py-2.5 bg-[#f8fafc]/90 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-slate-800 font-bold">{activeStage.subtitle}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex items-center gap-1.5 text-[#059669] font-bold">
              <FaLeaf className="text-xs" /> Zero Emission EV
            </span>
            <span className="font-mono text-slate-700 font-bold">{liveSpeed} km/h</span>
          </div>
        </div>

        {/* Map Canvas with City Streets Background & Glowing Route */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden flex items-center justify-center">
          {/* Real City Vector Map Image Background */}
          <img 
            src="/images/gps_city_map_bg.jpg" 
            alt="Live GPS Navigation Map" 
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />

          {/* Glowing Green Curved Highway Path SVG Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Base Road Shadow */}
            <path
              d="M 60 140 Q 250 160, 420 130 T 740 135"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {/* Glowing Green Eco Route */}
            <path
              d="M 60 140 Q 250 160, 420 130 T 740 135"
              fill="none"
              stroke="#10b981"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Dashed Center Route Line */}
            <path
              d="M 60 140 Q 250 160, 420 130 T 740 135"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 6"
              strokeLinecap="round"
            />
          </svg>

          {/* Citizen Home Gate Marker (Left side) */}
          <div className="absolute left-8 sm:left-14 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="h-10 w-10 rounded-full bg-white text-[#059669] border-2 border-[#10b981] flex items-center justify-center shadow-md">
              <FaMapMarkerAlt className="h-5 w-5 text-[#059669]" />
            </div>
            <span className="text-[10px] font-black text-slate-800 mt-1 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
              Your Gate
            </span>
          </div>

          {/* Moving EV Tipper Vehicle on Route */}
          <motion.div 
            className="absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
            style={{ left: `calc(${Math.min(84, Math.max(16, activeStage.progress))}% - 22px)` }}
            transition={{ type: 'spring', stiffness: 50 }}
          >
            {/* 5 Min ETA Pill Tooltip on top of truck */}
            <div className="px-2.5 py-0.5 bg-slate-900/95 text-white rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-md mb-1 whitespace-nowrap">
              <FaClock className="text-[9px] text-[#34d399]" />
              <span>{etaCountdown} min</span>
            </div>

            {/* Green Recycling EV Truck Icon */}
            <div className="relative h-11 w-11 rounded-2xl bg-[#0f9f6e] text-white flex items-center justify-center shadow-xl border-2 border-white ring-2 ring-[#0f9f6e]/30">
              <FaTruck className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-400 border border-white" />
            </div>
          </motion.div>

          {/* Scrap Recycling Micro-Hub Destination (Right side) */}
          <div className="absolute right-8 sm:right-14 top-1/2 -translate-y-1/2 flex flex-col items-center z-20">
            <div className="h-10 w-10 rounded-full bg-white text-[#059669] border-2 border-[#10b981] flex items-center justify-center shadow-md">
              <FaLeaf className="h-5 w-5 text-[#059669]" />
            </div>
            <span className="text-[10px] font-black text-slate-800 mt-1 whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
              Eco Hub
            </span>
          </div>
        </div>
      </div>

      {/* Driver Card + Doorstep OTP Bar */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Driver Profile (8 cols) */}
        <div className="md:col-span-8 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#f0fdfa]/40 border border-slate-200/80">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#10b981] shadow-xs">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                  alt="Palani Driver" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-slate-900">{driverName}</h4>
                <div className="flex items-center text-amber-500 text-xs font-black">
                  <FaStar className="mr-0.5 text-[10px]" /> 4.9
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {vehicleNumber} • <span className="text-[#059669] font-bold">{vehicleType}</span>
              </p>
            </div>
          </div>

          {/* Quick Call & Chat Buttons */}
          <div className="flex items-center space-x-2.5">
            <a 
              href={`tel:${driverPhone}`}
              className="h-9 w-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Call Driver"
            >
              <FaPhoneAlt className="h-3.5 w-3.5 text-slate-800" />
            </a>

            <button 
              onClick={() => onOpenChat ? onOpenChat() : alert(`Starting Live In-App Chat with Driver: ${driverName}`)}
              className="h-9 w-9 rounded-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] border border-[#a7f3d0] transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Chat with Driver"
            >
              <FaComments className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security Doorstep OTP Box (4 cols) */}
        <div className="md:col-span-4 p-3.5 sm:p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">
              DOORSTEP PICKUP OTP
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Share upon driver arrival
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl font-black tracking-wider text-[#065f46]">
              {otpCode}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveUberPickupTracker;
