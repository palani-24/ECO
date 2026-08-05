import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBolt, FaTimes, FaDirections, FaBatteryQuarter, FaExclamationTriangle } from 'react-icons/fa';

const DriverBatteryAlertModal = ({ isOpen, onClose, batteryPercentage = 14 }) => {
  if (!isOpen) return null;

  const chargingHubs = [
    { name: 'Anna Nagar Metro Fast-Charge Hub #1', dist: '1.2 km', slotsAvailable: 3 },
    { name: 'Velachery Bypass E-Rickshaw Charging Station', dist: '2.8 km', slotsAvailable: 5 }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 text-white shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 animate-pulse">
              <FaBatteryQuarter className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-400 flex items-center space-x-2">
                <span>E-Vehicle Battery Warning!</span>
              </h3>
              <p className="text-xs text-slate-300 font-bold">Charge Level: {batteryPercentage}% Remaining</p>
            </div>
          </div>

          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-xs text-rose-300 space-y-1 mb-4">
            <div className="flex items-center space-x-1.5 font-bold">
              <FaExclamationTriangle className="text-rose-400 shrink-0" />
              <span>Route to nearest charging hub before accepting next bulk pickup.</span>
            </div>
          </div>

          <h4 className="text-xs font-black uppercase text-slate-400 mb-2">Nearest EV Charging Stations:</h4>
          <div className="space-y-2 mb-5">
            {chargingHubs.map((hub, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-white">{hub.name}</p>
                  <p className="text-[10px] text-slate-400">{hub.dist} away • {hub.slotsAvailable} Fast-Plugs Free</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(hub.name)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-[11px] flex items-center space-x-1"
                >
                  <FaDirections />
                  <span>Navigate</span>
                </a>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 text-slate-200 font-bold text-xs rounded-2xl hover:bg-slate-700"
          >
            Acknowledge & Return to Dashboard
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DriverBatteryAlertModal;
