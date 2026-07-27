import React from 'react';
import { FaQrcode, FaTimes, FaShieldAlt, FaDownload, FaRecycle } from 'react-icons/fa';

const QRPassModal = ({ isOpen, onClose, pickup }) => {
  if (!isOpen || !pickup) return null;

  const qrToken = pickup.qrToken || `ECO-QR-${pickup._id.toString().substring(18).toUpperCase()}`;

  // SVG QR Code simulation generator
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/20">
              <FaQrcode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Eco Verification Pass</h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Show to driver upon arrival for verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
          >
            <FaTimes />
          </button>
        </div>

        {/* Digital Pass Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FaRecycle className="h-5 w-5 text-emerald-300" />
              <span className="font-black text-xs uppercase tracking-widest text-emerald-200">EcoReward Official Pass</span>
            </div>
            <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-bold">VERIFIED PASS</span>
          </div>

          {/* QR Code Graphic Box */}
          <div className="bg-white p-4 rounded-2xl shadow-inner max-w-[200px] mx-auto flex flex-col items-center justify-center space-y-2">
            <svg viewBox="0 0 100 100" className="w-40 h-40">
              {/* QR outer border & positioning squares */}
              <rect x="5" y="5" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
              <rect x="11" y="11" width="16" height="16" fill="#0f172a" />

              <rect x="67" y="5" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
              <rect x="73" y="11" width="16" height="16" fill="#0f172a" />

              <rect x="5" y="67" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
              <rect x="11" y="73" width="16" height="16" fill="#0f172a" />

              {/* Data modules pattern simulation */}
              <rect x="40" y="8" width="8" height="8" fill="#10b981" />
              <rect x="50" y="18" width="8" height="8" fill="#0f172a" />
              <rect x="40" y="28" width="8" height="8" fill="#0f172a" />

              <rect x="8" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="18" y="50" width="8" height="8" fill="#10b981" />
              <rect x="28" y="40" width="8" height="8" fill="#0f172a" />

              <rect x="40" y="40" width="20" height="20" fill="#10b981" />
              <rect x="45" y="45" width="10" height="10" fill="#ffffff" />

              <rect x="68" y="40" width="8" height="8" fill="#0f172a" />
              <rect x="78" y="50" width="8" height="8" fill="#10b981" />
              <rect x="88" y="40" width="8" height="8" fill="#0f172a" />

              <rect x="40" y="68" width="8" height="8" fill="#0f172a" />
              <rect x="50" y="78" width="8" height="8" fill="#10b981" />
              <rect x="60" y="68" width="8" height="8" fill="#0f172a" />

              <rect x="78" y="78" width="12" height="12" fill="#0f172a" />
            </svg>
            <p className="text-[10px] font-mono font-bold text-slate-800 text-center tracking-widest">{qrToken}</p>
          </div>

          <div className="space-y-1 text-center">
            <h4 className="font-extrabold text-sm">{pickup.wasteCategory} Recycling Pickup</h4>
            <p className="text-xs text-emerald-100">{new Date(pickup.pickupDate).toLocaleDateString()} ({pickup.pickupTimeSlot})</p>
          </div>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Driver scans this token to record verified weight and award points directly to your account.</p>
        </div>
      </div>
    </div>
  );
};

export default QRPassModal;
