import React, { useState, useEffect } from 'react';
import { FaTimes, FaCamera, FaExpand, FaCheckCircle, FaRecycle, FaRedo, FaCalendarPlus, FaCoins, FaInfoCircle, FaCheck } from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const AIWasteScannerModal = ({ isOpen, onClose, onSchedulePickup }) => {
  const { addToast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // Mock AI detection presets for realistic interactive scanning
  const aiSamples = [
    {
      item: 'Plastic PET Water Bottle',
      category: 'Plastic',
      recyclable: true,
      confidence: 98.4,
      pointsPerKg: 15,
      estimatedWeightKg: 0.5,
      co2SavedKg: 1.2,
      tips: 'Rinse out liquid residue and remove cap before placing in green recycling bin.',
      image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500'
    },
    {
      item: 'Corrugated Cardboard Packaging Box',
      category: 'Paper',
      recyclable: true,
      confidence: 96.8,
      pointsPerKg: 10,
      estimatedWeightKg: 1.8,
      co2SavedKg: 2.5,
      tips: 'Flatten boxes completely to save bin space and prevent moisture contamination.',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500'
    },
    {
      item: 'Aluminum Beverage Can',
      category: 'Metal',
      recyclable: true,
      confidence: 99.1,
      pointsPerKg: 25,
      estimatedWeightKg: 0.4,
      co2SavedKg: 3.1,
      tips: 'Aluminum is 100% infinitely recyclable. Crush for compact storage.',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'
    }
  ];

  const handleSimulateScan = (sample) => {
    setSelectedImage(sample.image);
    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      setScanResult(sample);
      addToast(`AI Detection Complete: ${sample.item} (${sample.confidence}% Confidence)`, 'success', 'AI Neural Scanner');
    }, 2500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setScanning(true);
      setScanResult(null);

      const randomSample = aiSamples[Math.floor(Math.random() * aiSamples.length)];
      setTimeout(() => {
        setScanning(false);
        setScanResult(randomSample);
        addToast(`AI Detected: ${randomSample.item}`, 'success', 'AI Neural Scanner');
      }, 2800);
    }
  };

  const resetScanner = () => {
    setScanning(false);
    setScanResult(null);
    setSelectedImage(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg">
              <FaCamera className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Neural AI Waste Scanner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scan items for instant material classification & rewards</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          
          {/* Camera Viewfinder Box */}
          <div className="relative h-64 w-full rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border-2 border-emerald-500/30 shadow-inner group">
            
            {/* Viewfinder Target Bracket Corners */}
            <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-emerald-400 rounded-tl"></div>
            <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-emerald-400 rounded-tr"></div>
            <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-emerald-400 rounded-bl"></div>
            <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-emerald-400 rounded-br"></div>

            {selectedImage ? (
              <img src={selectedImage} alt="Scanned item" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl border border-emerald-500/30">
                  <FaExpand className="animate-spin-slow" />
                </div>
                <p className="text-xs font-extrabold text-slate-300">Point camera at waste item or select a sample image below</p>
              </div>
            )}

            {/* Laser Sweep Line */}
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laserSweep"></div>
            )}

            {/* Scanning Indicator Badge */}
            {scanning && (
              <div className="absolute top-4 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>AI Neural Classifying...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Samples Selector */}
          {!scanning && !scanResult && (
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">Try Test Sample Scans:</span>
              <div className="grid grid-cols-3 gap-2">
                {aiSamples.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSimulateScan(sample)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-500/10 rounded-xl border border-slate-200 dark:border-slate-700 text-left transition-all group"
                  >
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 text-[10px] truncate group-hover:text-emerald-500">{sample.item}</p>
                    <span className="text-[9px] text-slate-400 font-bold block">{sample.category} • {sample.pointsPerKg} pts/kg</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-colors">
                  <FaCamera />
                  <span>Upload Photo from Device</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Detection Result Card */}
          {scanResult && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-4 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    {scanResult.category} • Recyclable
                  </span>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base pt-1">{scanResult.item}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-500 flex items-center justify-end space-x-1">
                    <FaCheckCircle className="h-3.5 w-3.5" />
                    <span>{scanResult.confidence}%</span>
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold block">AI Confidence</span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-800 text-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block">+{scanResult.pointsPerKg}</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Pts / kg</span>
                </div>
                <div>
                  <span className="font-extrabold text-emerald-500 block">~{scanResult.estimatedWeightKg} kg</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Est. Weight</span>
                </div>
                <div>
                  <span className="font-extrabold text-sky-500 block">{scanResult.co2SavedKg} kg</span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">CO₂ Saved</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                <FaInfoCircle className="text-emerald-500 flex-shrink-0" />
                <span>{scanResult.tips}</span>
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FaRedo className="h-3 w-3" />
                  <span>Scan Another</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onSchedulePickup) onSchedulePickup(scanResult.category);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FaCalendarPlus className="h-3 w-3" />
                  <span>Schedule Pickup</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AIWasteScannerModal;
