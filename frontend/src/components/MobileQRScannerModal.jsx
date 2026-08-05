import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQrcode, FaTimes, FaBolt, FaCamera, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';

const MobileQRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScannedResult(null);
      triggerHaptic(50);
    }
  }, [isOpen]);

  const handleSimulateScan = () => {
    triggerHaptic(75);
    setIsScanning(false);
    const mockQRData = {
      code: `ECO-KIOSK-${Math.floor(1000 + Math.random() * 9000)}`,
      location: 'Anna Nagar Smart Bin Hub #4',
      type: '24/7 Dropoff Kiosk',
      bonusPoints: 50
    };
    setScannedResult(mockQRData);

    if (onScanSuccess) {
      onScanSuccess(mockQRData);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-white shadow-2xl overflow-hidden flex flex-col items-center"
        >
          {/* Close Button */}
          <button
            onClick={() => { triggerHaptic(30); onClose(); }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 z-20"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 mb-4">
            <h3 className="text-base font-black flex items-center justify-center space-x-2 text-white">
              <FaQrcode className="text-emerald-400" />
              <span>Mobile QR Code Scanner</span>
            </h3>
            <p className="text-xs text-slate-400">Point phone camera at Smart Kiosk or Gate Pass QR</p>
          </div>

          {/* Camera Viewfinder Frame */}
          <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-emerald-500/50 overflow-hidden flex flex-col items-center justify-center shadow-inner my-2">
            {isScanning ? (
              <>
                {/* Viewfinder Corner Framing Lines */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                {/* Laser Scanning Line Animation */}
                <motion.div
                  animate={{ y: [-90, 90, -90] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                  className="w-56 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)]"
                />

                <div className="absolute bottom-3 text-[10px] font-mono text-emerald-400/80 bg-slate-900/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <FaCamera className="animate-pulse text-xs" />
                  <span>ALIGN QR INSIDE FRAME</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-2 animate-fadeIn">
                <FaCheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <p className="text-xs font-black text-emerald-300">QR Code Scanned!</p>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  <p className="font-extrabold text-emerald-400">{scannedResult?.code}</p>
                  <p className="text-[10px] text-slate-400">{scannedResult?.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="w-full flex items-center justify-between space-x-2 mt-4">
            <button
              onClick={() => { triggerHaptic(30); setTorchOn(!torchOn); }}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-colors flex items-center space-x-1.5 ${
                torchOn ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <FaBolt className={torchOn ? 'animate-bounce' : ''} />
              <span>{torchOn ? 'Torch ON' : 'Torch OFF'}</span>
            </button>

            {isScanning ? (
              <button
                onClick={handleSimulateScan}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
              >
                <FaQrcode />
                <span>Simulate QR Scan</span>
              </button>
            ) : (
              <button
                onClick={() => { triggerHaptic(30); setIsScanning(true); }}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700"
              >
                Scan Another QR
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MobileQRScannerModal;
