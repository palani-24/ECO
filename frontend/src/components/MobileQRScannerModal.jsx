import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaQrcode, FaTimes, FaBolt, FaCamera, FaCheckCircle, 
  FaSyncAlt, FaImage, FaKeyboard, FaMapMarkerAlt, FaShieldAlt
} from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const MobileQRScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(true);
  const [torchOn, setTorchOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedResult, setScannedResult] = useState(null);
  const [mode, setMode] = useState('scanner'); // 'scanner' | 'manual'
  const [manualCode, setManualCode] = useState('');
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Start Camera Stream
  const startCamera = async (facing = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } else {
        setCameraError('Camera API not supported in this browser.');
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access unavailable or permission denied.');
      setCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    triggerHaptic(40);
    const newTorchState = !torchOn;
    setTorchOn(newTorchState);

    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      if (track && typeof track.applyConstraints === 'function') {
        try {
          const capabilities = track.getCapabilities ? track.getCapabilities() : {};
          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: newTorchState }]
            });
          }
        } catch (err) {
          console.warn('Torch constraint error:', err);
        }
      }
    }
  };

  // Flip Camera
  const toggleFacingMode = () => {
    triggerHaptic(40);
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setScannedResult(null);
      setMode('scanner');
      setManualCode('');
      triggerHaptic(50);
      startCamera('environment');
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const executeSuccessfulScan = (qrData) => {
    soundFx.playScanBeep();
    triggerHaptic(80);
    setIsScanning(false);
    setScannedResult(qrData);

    if (onScanSuccess) {
      onScanSuccess(qrData);
    }
  };

  const handleScanAction = () => {
    const mockQRData = {
      code: `ECO-KIOSK-${Math.floor(1000 + Math.random() * 9000)}`,
      location: 'Anna Nagar Smart Bin Hub #4',
      type: '24/7 Dropoff Kiosk',
      bonusPoints: 50,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    executeSuccessfulScan(mockQRData);
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate instant QR extraction from image
    const reader = new FileReader();
    reader.onload = () => {
      const parsedData = {
        code: `ECO-PASS-${Math.floor(2000 + Math.random() * 8000)}`,
        location: 'Eco Recycling Center - Bay 2',
        type: 'Verified Gate Pass',
        bonusPoints: 75,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      executeSuccessfulScan(parsedData);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const manualData = {
      code: manualCode.toUpperCase().trim(),
      location: 'Manual Verified Station',
      type: 'Direct Entry Pass',
      bonusPoints: 40,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    executeSuccessfulScan(manualData);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-sm bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-white shadow-2xl overflow-hidden flex flex-col items-center"
        >
          {/* Close Button */}
          <button
            onClick={() => { triggerHaptic(30); onClose(); }}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-30"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="text-center space-y-1 mb-3">
            <h3 className="text-base font-black flex items-center justify-center space-x-2 text-white">
              <FaQrcode className="text-emerald-400 text-lg" />
              <span>Smart QR Scanner</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Point camera at Kiosk, Driver Pass or Bin QR</p>
          </div>

          {/* Tab Selector: Live Camera vs Manual Entry */}
          <div className="flex items-center p-1 bg-slate-950/70 border border-slate-800 rounded-xl mb-3 text-xs w-full">
            <button
              onClick={() => { setMode('scanner'); triggerHaptic(20); }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'scanner' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaCamera className="text-xs" />
              <span>Live Scanner</span>
            </button>
            <button
              onClick={() => { setMode('manual'); triggerHaptic(20); }}
              className={`flex-1 py-1.5 font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                mode === 'manual' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaKeyboard className="text-xs" />
              <span>Manual Code</span>
            </button>
          </div>

          {mode === 'scanner' ? (
            /* Camera Viewfinder Box */
            <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-emerald-500/50 overflow-hidden flex flex-col items-center justify-center shadow-inner my-1">
              {/* Live Video Feed or Fallback */}
              <video
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                autoPlay
                playsInline
                muted
              />

              {!cameraActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
                  <FaCamera className="w-10 h-10 text-emerald-500/40 mb-2 animate-pulse" />
                  <p className="text-[11px] text-slate-400 font-semibold leading-tight">
                    {cameraError ? cameraError : 'Initializing camera stream...'}
                  </p>
                </div>
              )}

              {/* Floating Overlaid Action Icons on Viewfinder */}
              <div className="absolute top-2.5 right-2.5 z-20 flex space-x-1.5">
                <button
                  type="button"
                  title="Toggle Flashlight"
                  onClick={toggleTorch}
                  className={`p-2 rounded-xl text-xs backdrop-blur-md border transition-all ${
                    torchOn 
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)]' 
                      : 'bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <FaBolt className={torchOn ? 'animate-bounce' : ''} />
                </button>
                <button
                  type="button"
                  title="Switch Front/Back Camera"
                  onClick={toggleFacingMode}
                  className="p-2 rounded-xl text-xs bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:text-white backdrop-blur-md"
                >
                  <FaSyncAlt />
                </button>
              </div>

              {isScanning ? (
                <>
                  {/* Viewfinder Corner Framing Lines */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none z-10" />
                  <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none z-10" />
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none z-10" />
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none z-10" />

                  {/* Laser Scanning Line Animation */}
                  <motion.div
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
                    className="w-56 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(52,211,153,1)] z-10 pointer-events-none"
                  />

                  <div className="absolute bottom-2.5 text-[10px] font-mono text-emerald-300 bg-slate-950/80 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 z-10 backdrop-blur-sm pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ALIGN QR IN FRAME</span>
                  </div>
                </>
              ) : (
                <div className="relative z-20 p-4 text-center space-y-2 animate-fadeIn bg-slate-950/90 rounded-xl border border-emerald-500/50 backdrop-blur-md m-3">
                  <FaCheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <p className="text-xs font-black text-emerald-300">QR Code Verified!</p>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                    <p className="font-extrabold text-emerald-400">{scannedResult?.code}</p>
                    <p className="text-[10px] text-slate-400 flex items-center justify-center space-x-1 mt-0.5">
                      <FaMapMarkerAlt className="text-rose-400 text-[9px]" />
                      <span>{scannedResult?.location}</span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Manual PIN Entry Form */
            <form onSubmit={handleManualSubmit} className="w-64 h-64 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-center space-y-3 my-1">
              <div className="text-center">
                <FaShieldAlt className="w-8 h-8 text-emerald-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-white">Enter Pass or Kiosk ID</p>
                <p className="text-[10px] text-slate-400">e.g. ECO-KIOSK-4081 or GATE-99</p>
              </div>

              <input
                type="text"
                placeholder="Enter Code (e.g. ECO-1024)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs font-mono text-center text-emerald-300 placeholder-slate-500 focus:outline-none focus:border-emerald-400 uppercase"
                autoFocus
              />

              <button
                type="submit"
                disabled={!manualCode.trim()}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95"
              >
                Verify Code
              </button>
            </form>
          )}

          {/* Hidden File Input for Gallery Upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleGalleryUpload}
            accept="image/*"
            className="hidden"
          />

          {/* Controls Footer */}
          <div className="w-full flex items-center space-x-2 mt-3.5">
            <button
              onClick={() => { triggerHaptic(30); fileInputRef.current?.click(); }}
              className="px-3 py-2.5 rounded-2xl text-xs font-bold bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center space-x-1.5 transition-colors"
              title="Upload QR photo from gallery"
            >
              <FaImage className="text-teal-400" />
              <span>Gallery</span>
            </button>

            {isScanning ? (
              <button
                onClick={handleScanAction}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-transform active:scale-95"
              >
                <FaQrcode />
                <span>Scan QR Now</span>
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
