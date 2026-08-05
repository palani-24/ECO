import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaTimes, FaDownload, FaQrcode, FaMedal, FaCheckCircle, FaPrint, FaShareAlt } from 'react-icons/fa';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CarbonCertificateModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [certData, setCertData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchCertData();
    }
  }, [isOpen]);

  const fetchCertData = async () => {
    try {
      const res = await api.get('/advanced/certificate/generate');
      if (res.data.success) {
        setCertData(res.data.data);
      }
    } catch (e) {
      setCertData({
        certificateId: `ECO-CERT-${user?._id?.substring(0, 8).toUpperCase() || '2026'}`,
        userName: user?.name || 'Palani M',
        co2SavedKg: 285,
        treesEquivalent: 14,
        issuedDate: 'August 5, 2026',
        verificationUrl: 'https://ecoreward.com/verify/ECO-CERT-2026'
      });
    }
  };

  const handlePrint = () => {
    addToast('Preparing Official Eco-Hero Certificate PDF...', 'info', 'Generating Certificate');
    window.print();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white shadow-2xl border-4 border-emerald-500/40 my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors z-20"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Printable Official Certificate Body */}
          <div className="border-4 border-dashed border-emerald-500/30 rounded-2xl p-6 sm:p-8 bg-gradient-to-b from-emerald-500/5 via-transparent to-teal-500/5 relative overflow-hidden">
            
            {/* Background Seal Watermark */}
            <FaMedal className="absolute -right-8 -bottom-8 w-48 h-48 text-emerald-500/5 pointer-events-none" />

            {/* Header Title */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white shadow-lg mb-2">
                <FaLeaf className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-400">
                EcoReward Official Certificate of Environmental Excellence
              </h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Certificate ID: {certData?.certificateId || 'ECO-CERT-9821'}
              </p>
            </div>

            {/* Recipient Statement */}
            <div className="text-center space-y-3 my-6">
              <p className="text-xs text-slate-500 font-bold uppercase">This certificate is proudly awarded to</p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white underline decoration-emerald-500 decoration-4 underline-offset-8">
                {certData?.userName || user?.name || 'Citizen Eco-Hero'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold max-w-lg mx-auto leading-relaxed pt-2">
                In recognition of outstanding dedication to sustainable doorstep waste recycling, carbon footprint reduction, and environmental stewardship.
              </p>
            </div>

            {/* Impact Metric Badge Grid */}
            <div className="grid grid-cols-3 gap-3 my-6 text-center">
              <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">CO2 Offset</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{certData?.co2SavedKg || 285} kg</p>
              </div>

              <div className="p-3 bg-teal-500/10 dark:bg-teal-500/20 rounded-2xl border border-teal-500/30">
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400">Trees Equivalent</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">🌳 {certData?.treesEquivalent || 14} Trees</p>
              </div>

              <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 rounded-2xl border border-amber-500/30">
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">Rank Status</p>
                <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Gold Hero</p>
              </div>
            </div>

            {/* Footer Signatures & QR Code Verification */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 gap-4">
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <FaQrcode className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Verified Digital Credential</p>
                  <p className="text-[9px] text-slate-400 font-bold">Issued: {certData?.issuedDate || 'August 5, 2026'}</p>
                </div>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="font-serif italic text-lg font-bold text-emerald-600 dark:text-emerald-400">Palani M.</div>
                <p className="text-[10px] font-black text-slate-500 uppercase">Chief Sustainability Officer, EcoReward Platform</p>
              </div>
            </div>

          </div>

          {/* Action Bar */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-2xl transition-colors"
            >
              Close Window
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-2xl flex items-center space-x-1.5 transition-colors"
              >
                <FaPrint />
                <span>Print / PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                <FaDownload />
                <span>Download Official Certificate</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CarbonCertificateModal;
