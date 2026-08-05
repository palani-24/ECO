import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTruck, FaTimes, FaPhoneAlt, FaComments, FaMapMarkerAlt, FaClock, FaShieldAlt, FaBolt, FaCheckCircle } from 'react-icons/fa';

const DriverLiveTrackingModal = ({ isOpen, onClose, pickup }) => {
  const [etaMinutes, setEtaMinutes] = useState(8);
  const [progressPercent, setProgressPercent] = useState(65);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setEtaMinutes(prev => (prev > 1 ? prev - 1 : 1));
      setProgressPercent(prev => (prev < 95 ? prev + 4 : 95));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !pickup) return null;

  const driverName = pickup.assignedDriver?.name || 'Ramesh Kumar';
  const driverPhone = pickup.assignedDriver?.phone || '+91 98123 45678';
  const vehicleNo = 'TN-38-ECO-9945 (Heavy E-Rickshaw Loader)';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-20"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Modal Title */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <FaTruck className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <span>Live GPS Driver Tracking</span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-500/30">LIVE GPS</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">Pickup Request #{pickup._id?.substring(0, 8) || 'PK-9821'}</p>
            </div>
          </div>

          {/* Simulated Animated GPS Map Container */}
          <div className="relative h-56 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden mb-4 p-4 flex flex-col justify-between">
            {/* Map Grid Background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
            
            {/* Route Line */}
            <div className="absolute inset-x-8 top-1/2 h-1.5 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                style={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* User House Marker */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-lg border border-white/20">
                <FaMapMarkerAlt className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-emerald-500/20">Your Address</span>
            </div>

            {/* Moving Driver Marker */}
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
              style={{ left: `${progressPercent - 8}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            >
              <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-xl border-2 border-white animate-pulse">
                <FaTruck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-amber-300 mt-1 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/30 whitespace-nowrap">
                {driverName} ({etaMinutes} min)
              </span>
            </motion.div>

            {/* Map Top Status Bar */}
            <div className="relative z-10 flex justify-between items-center bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-emerald-400">Driver En Route</span>
              </div>
              <div className="flex items-center space-x-1 text-xs font-bold text-amber-300">
                <FaClock className="w-3.5 h-3.5" />
                <span>ETA: ~{etaMinutes} Mins</span>
              </div>
            </div>

            {/* Map Bottom Address Bar */}
            <div className="relative z-10 bg-slate-900/90 p-2 rounded-xl border border-slate-800 backdrop-blur-md text-[11px] text-slate-300 truncate">
              📍 <strong className="text-white">Destination:</strong> {pickup.pickupAddress || '12-A Metro Heights, Anna Nagar, Chennai'}
            </div>
          </div>

          {/* Driver Profile & Vehicle Info */}
          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driverName}`}
                  alt="Driver Avatar"
                  className="w-11 h-11 rounded-full bg-slate-700 object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <h4 className="font-extrabold text-white text-sm">{driverName}</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">{vehicleNo}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-xl border border-emerald-500/20">
                  ★ 4.9 Rating
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300 font-medium">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <FaCheckCircle />
                <span>Electronic Scale Calibrated</span>
              </span>
              <span className="flex items-center space-x-1.5 text-teal-400">
                <FaShieldAlt />
                <span>Insulated Safety Loader</span>
              </span>
            </div>
          </div>

          {/* Direct Action Buttons */}
          <div className="flex items-center space-x-3">
            <a
              href={`tel:${driverPhone}`}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl border border-slate-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaPhoneAlt className="text-emerald-400" />
              <span>Call Driver</span>
            </a>

            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <FaComments />
              <span>Chat with Driver</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DriverLiveTrackingModal;
