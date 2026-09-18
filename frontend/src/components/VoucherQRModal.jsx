import React, { useState } from 'react';
import { FaTimes, FaCopy, FaCheck, FaQrcode, FaBarcode, FaShieldAlt, FaExternalLinkAlt } from 'react-icons/fa';

const VoucherQRModal = ({ isOpen, onClose, voucher }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !voucher) return null;

  const code = voucher.voucherCode || voucher.details?.code || 'ECO-SAMPLE-CODE';
  const title = voucher.title || voucher.details?.title || 'EcoReward Voucher';
  const provider = voucher.provider || voucher.details?.provider || 'EcoReward Partner';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(code)}&color=064e3b&bgcolor=ffffff`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2 mt-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-bold uppercase tracking-wider">
            <FaShieldAlt />
            <span>Official Eco Voucher</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Provider: <span className="font-bold text-slate-700 dark:text-slate-300">{provider}</span>
          </p>
        </div>

        {/* QR Code Presentation */}
        <div className="my-5 flex flex-col items-center justify-center p-5 bg-gradient-to-b from-emerald-50/50 to-slate-50 dark:from-slate-850 dark:to-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/60 inline-block">
            <img 
              src={qrUrl} 
              alt={`QR for ${code}`} 
              className="w-44 h-44 object-contain rounded-lg"
              loading="lazy"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 flex items-center space-x-1 font-medium">
            <FaQrcode className="text-emerald-500" />
            <span>Scan at Metro gate, EV station, or POS counter</span>
          </p>
        </div>

        {/* Code Box with 1-Click Copy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Voucher / Token Code</span>
              <span className="font-mono font-black text-slate-900 dark:text-emerald-400 text-sm tracking-wider select-all">
                {code}
              </span>
            </div>
            <button
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                copied 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <FaCheck className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FaCopy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Status: <strong className="text-emerald-500 uppercase">{voucher.status || 'Active'}</strong></span>
          <span>{voucher.expiryDate || 'Valid for 60 Days'}</span>
        </div>
      </div>
    </div>
  );
};

export default VoucherQRModal;
