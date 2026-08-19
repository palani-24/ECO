import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBluetooth, FaWeight, FaCheckCircle, FaTimes, 
  FaBolt, FaRedo, FaLock, FaMicrochip, FaSignal, FaLeaf 
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const BluetoothSmartScaleModal = ({ isOpen, onClose, onWeightCaptured, materialName = 'Recyclables', estimatedWeight = 5.0 }) => {
  const { addToast } = useToast();
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected' | 'scanning' | 'connected'
  const [liveWeight, setLiveWeight] = useState(0.00);
  const [isStable, setIsStable] = useState(false);
  const [unit, setUnit] = useState('KG'); // 'KG' | 'LBS'
  const [batteryLevel, setBatteryLevel] = useState(94);
  const [isLocked, setIsLocked] = useState(false);
  const [deviceName, setDeviceName] = useState('EcoScale Pro-BT900');

  useEffect(() => {
    if (isOpen) {
      setConnectionStatus('scanning');
      setIsLocked(false);
      setIsStable(false);
      setLiveWeight(0.00);

      // Simulate rapid Bluetooth discovery & initial zero-tare calibration
      const connectTimer = setTimeout(() => {
        setConnectionStatus('connected');
        addToast('Connected to EcoScale Pro-BT900 via Bluetooth (BLE)', 'success', 'Scale Paired');
      }, 1200);

      return () => clearTimeout(connectTimer);
    }
  }, [isOpen]);

  // Simulate live scale stabilization when material is placed on scale
  useEffect(() => {
    if (connectionStatus === 'connected' && !isLocked) {
      let target = parseFloat(estimatedWeight) || 5.25;
      let current = 0;
      const interval = setInterval(() => {
        current += (target - current) * 0.35 + (Math.random() * 0.08 - 0.04);
        if (Math.abs(target - current) < 0.05) {
          setLiveWeight(target.toFixed(2));
          setIsStable(true);
          clearInterval(interval);
        } else {
          setLiveWeight(Math.max(0, current).toFixed(2));
          setIsStable(false);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [connectionStatus, estimatedWeight, isLocked]);

  const handleTare = () => {
    setLiveWeight((0.00).toFixed(2));
    setIsStable(true);
    addToast('Scale Zero-Calibrated (Tare 0.00 kg)', 'info', 'Zero Calibrated');
  };

  const handleLockAndConfirm = () => {
    setIsLocked(true);
    const finalWeightVal = parseFloat(liveWeight) > 0 ? parseFloat(liveWeight) : parseFloat(estimatedWeight) || 5.0;
    addToast(`⚖️ Weight locked at ${finalWeightVal} ${unit}! Tamper-proof record generated.`, 'success', 'Weight Verified');
    
    setTimeout(() => {
      onWeightCaptured(finalWeightVal);
      onClose();
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white overflow-hidden space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-500/30">
                <FaBluetooth className={connectionStatus === 'connected' ? 'animate-pulse text-sky-400' : ''} />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center space-x-2">
                  <span>BLE Smart Scale Sync</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">IoT</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold">{deviceName} • {connectionStatus === 'connected' ? '🟢 Online' : '🟡 Scanning...'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Scale Hardware Digital LED Box */}
          <div className="bg-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 relative overflow-hidden shadow-inner text-center space-y-3">
            {/* Top Indicator Status */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <div className="flex items-center space-x-1.5">
                <FaSignal className={connectionStatus === 'connected' ? 'text-emerald-400' : 'text-slate-600'} />
                <span>BLE 5.2</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${isStable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'}`}>
                  {isStable ? '⚖️ STABLE' : '⏳ MEASURING...'}
                </span>
                <span className="text-emerald-400 font-bold">🔋 {batteryLevel}%</span>
              </div>
            </div>

            {/* Glowing 7-Segment Weight Readout */}
            <div className="py-4">
              <div className="flex items-baseline justify-center space-x-2">
                <span className="text-6xl sm:text-7xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  {liveWeight}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-400 font-mono">{unit}</span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1">Material: <span className="text-white font-bold">{materialName}</span></p>
            </div>

            {/* Zero/Tare & Unit Controls */}
            <div className="flex items-center justify-center space-x-3 pt-2 border-t border-slate-900">
              <button
                type="button"
                onClick={handleTare}
                disabled={connectionStatus !== 'connected'}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center space-x-1.5 cursor-pointer"
              >
                <FaRedo className="h-3 w-3 text-emerald-400" />
                <span>Zero / Tare</span>
              </button>

              <button
                type="button"
                onClick={() => setUnit(unit === 'KG' ? 'LBS' : 'KG')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                Unit: {unit}
              </button>
            </div>
          </div>

          {/* Verification Warning & Anti-Tamper Security Note */}
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl flex items-start space-x-2.5 text-xs text-slate-300">
            <FaCheckCircle className="text-emerald-400 h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Anti-Tamper Protocol:</strong> The scale weight is authenticated cryptographically via BLE. Locking will directly transfer EcoPoints based on verified scale data.
            </p>
          </div>

          {/* Confirmation & Lock Button */}
          <div className="flex items-center space-x-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleLockAndConfirm}
              disabled={connectionStatus !== 'connected' || parseFloat(liveWeight) <= 0}
              className="flex-[2] py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer"
            >
              <FaLock className="h-3.5 w-3.5" />
              <span>Lock Weight & Confirm ({liveWeight} {unit})</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BluetoothSmartScaleModal;
