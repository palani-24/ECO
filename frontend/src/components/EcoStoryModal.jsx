import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTimes, FaDownload, FaWhatsapp, FaShareAlt, FaLeaf, 
  FaTree, FaAward, FaQrcode, FaCheck, FaRecycle, FaShieldAlt
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import { useToast } from '../context/ToastContext';
import { triggerHaptic } from '../utils/mobileNative';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';

const EcoStoryModal = ({ isOpen, onClose, user, stats }) => {
  const { addToast } = useToast();
  const storyCardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalKg = stats?.totalRecycledKg || '48.5';
  const co2Saved = stats?.co2Reduced || '35.3';
  const treesSaved = stats?.treesSaved || '0.40';
  const points = stats?.walletPoints || user?.points || 120;
  const userName = user?.name || 'Eco Warrior';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shareText = `🌱 I've diverted ${totalKg} kg of waste from landfills and offset ${co2Saved} kg of CO2 with EcoReward! Join the movement: https://ecoreward.org`;

  const handleDownloadImage = async () => {
    if (!storyCardRef.current) return;
    try {
      setDownloading(true);
      triggerHaptic(40);
      const canvas = await html2canvas(storyCardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#06121e'
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `EcoReward-Story-${userName.replace(/\s+/g, '_')}.png`;
      link.click();
      
      triggerConfetti();
      soundFx.playSuccessChime();
      addToast('🎉 Eco Story card downloaded! Ready to post on Instagram or WhatsApp Status.', 'success', 'Story Saved');
    } catch (err) {
      console.error('Failed to generate story image', err);
      addToast('Failed to generate image. Please try again.', 'error', 'Export Failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleShareWhatsApp = () => {
    triggerHaptic(30);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
    addToast('Opening WhatsApp to share your eco achievement!', 'info', 'WhatsApp Share');
  };

  const handleCopyText = () => {
    triggerHaptic(30);
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    addToast('📋 Impact story summary copied to clipboard!', 'success', 'Copied');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#071322] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col my-auto"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-500 text-lg">📸</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">Eco-Story Card</h3>
                <p className="text-[10px] text-slate-400 font-medium">9:16 Instagram & WhatsApp Status Ready</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic(20);
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Story Preview Container */}
          <div className="p-4 sm:p-5 flex justify-center bg-slate-100/50 dark:bg-slate-950/50 overflow-y-auto max-h-[68vh]">
            
            {/* The 9:16 Visual Card to Capture */}
            <div 
              ref={storyCardRef}
              className="w-[280px] sm:w-[310px] aspect-[9/16] rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl text-white select-none border border-emerald-500/20"
              style={{
                background: 'linear-gradient(165deg, #05141e 0%, #062828 40%, #031e28 75%, #05101c 100%)'
              }}
            >
              {/* Background Aesthetic Ambient Glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Story Header */}
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <FaRecycle className="text-slate-950 text-sm" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 block leading-tight">EcoReward</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-mono">Monthly Impact</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300">
                    {currentDate}
                  </span>
                </div>

                {/* User Identity */}
                <div className="mt-4 flex items-center space-x-3 bg-white/5 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-lg font-black text-emerald-400 shadow-inner">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">{userName}</h4>
                    <span className="text-[9px] text-emerald-300 font-medium flex items-center gap-1">
                      <FaShieldAlt className="text-[8px]" /> Verified Eco Citizen
                    </span>
                  </div>
                </div>
              </div>

              {/* Center Impact Showcase */}
              <div className="relative z-10 my-auto text-center space-y-3">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30">
                  <FaLeaf className="text-emerald-400 text-xs animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Clean Planet Hero</span>
                </div>

                <div className="py-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                    {totalKg}
                  </span>
                  <span className="text-sm font-bold text-emerald-400 ml-1">kg</span>
                  <p className="text-[11px] font-bold text-slate-300 mt-0.5">Total Waste Diverted from Dumpsites</p>
                </div>

                {/* Key Metric Tiles */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-md">
                    <span className="text-[9px] text-slate-400 font-mono block">CO₂ AVOIDED</span>
                    <span className="text-sm font-black text-teal-300">{co2Saved} kg</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-2 rounded-xl backdrop-blur-md">
                    <span className="text-[9px] text-slate-400 font-mono block">TREES SAVED</span>
                    <span className="text-sm font-black text-emerald-300">{treesSaved} eq.</span>
                  </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 py-1.5 px-3 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] text-slate-300 font-semibold">EcoPoints Earned:</span>
                  <span className="text-xs font-black text-emerald-400">+{points} Pts</span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <FaQrcode className="text-slate-400 text-base" />
                  <span className="text-[8px] text-slate-400 font-mono">scan to verify impact</span>
                </div>
                <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                  #ZeroWasteHero
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#071322] space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadImage}
                disabled={downloading}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <FaDownload className="text-xs" />
                <span>{downloading ? 'Generating...' : 'Download Image'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <FaWhatsapp className="text-sm" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
            >
              {copied ? <FaCheck className="text-emerald-500" /> : <FaShareAlt className="text-slate-400 text-xs" />}
              <span>{copied ? 'Impact Text Copied!' : 'Copy Share Text'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EcoStoryModal;
