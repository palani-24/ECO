import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCoins, FaGift, FaBolt, FaLeaf, FaTrophy, FaRedo, FaCheckCircle, FaStar } from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';
import { useToast } from '../context/ToastContext';

const SEGMENTS = [
  { label: '+10 Pts', points: 10, color: '#10B981', textColor: '#FFFFFF', icon: '🌱' },
  { label: '+25 Pts', points: 25, color: '#06B6D4', textColor: '#FFFFFF', icon: '⚡' },
  { label: '+₹2/kg Boost', points: 20, isBooster: true, color: '#8B5CF6', textColor: '#FFFFFF', icon: '🚀' },
  { label: '+50 Pts', points: 50, color: '#F59E0B', textColor: '#000000', icon: '🏆' },
  { label: '+15 Pts', points: 15, color: '#14B8A6', textColor: '#FFFFFF', icon: '🌿' },
  { label: '₹25 Voucher', points: 30, isVoucher: true, color: '#EC4899', textColor: '#FFFFFF', icon: '🎁' },
  { label: '1 Tree Planted', points: 20, isTree: true, color: '#059669', textColor: '#FFFFFF', icon: '🌳' },
  { label: '2X Bonus Day', points: 25, isBonus: true, color: '#F97316', textColor: '#FFFFFF', icon: '🔥' },
];

const DailySpinWheelModal = ({ isOpen, onClose, onRewardWon }) => {
  const { addToast } = useToast();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningSegment, setWinningSegment] = useState(null);
  const [canSpin, setCanSpin] = useState(true);
  const [totalSpinsToday, setTotalSpinsToday] = useState(0);

  // Always keep spin available for demo/live testing
  useEffect(() => {
    if (isOpen) {
      setCanSpin(true);
      setWinningSegment(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning) return;

    triggerHaptic(40);
    setSpinning(true);
    setWinningSegment(null);

    // Pick a random segment (0 to 7)
    const prizeIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length; // 45 degrees
    
    // 5 full rotations (1800 deg) + angle to target segment
    const extraRotations = 360 * 5;
    const targetAngle = rotation + extraRotations + (360 - (prizeIndex * segmentAngle) - segmentAngle / 2);

    setRotation(targetAngle);

    // Play ticking sound while spinning
    const tickInterval = setInterval(() => {
      triggerHaptic(10);
      soundFx.playTick();
    }, 180);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      const won = SEGMENTS[prizeIndex];
      setWinningSegment(won);
      setTotalSpinsToday(prev => prev + 1);

      try {
        localStorage.setItem('ecoreward_last_spin_time', Date.now().toString());
      } catch {}

      // Victory celebrations
      triggerHaptic(60);
      triggerConfetti();
      soundFx.playSuccessChime();

      if (onRewardWon) {
        onRewardWon(won.points, won);
      }

      window.dispatchEvent(new CustomEvent('refresh-wallet-points', { detail: { points: won.points } }));

      addToast(`🎉 Congratulations! You won "${won.label}" from Daily Eco Spin!`, 'success', 'Daily Reward Unlocked');
    }, 4000);
  };

  const handleClaimAndClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-emerald-500/30 shadow-2xl relative overflow-hidden flex flex-col items-center space-y-4"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <FaTimes className="w-3.5 h-3.5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1 z-10">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
              <FaGift className="animate-bounce" />
              <span>Daily Eco Wheel • Free Spin</span>
            </div>
            <h3 className="text-lg font-black text-white">Daily Eco Spin & Win</h3>
            <p className="text-[11px] text-slate-400">Spin the wheel to win bonus EcoPoints & rate boosters!</p>
          </div>

          {/* Wheel Container */}
          <div className="relative w-64 h-64 flex items-center justify-center my-2 select-none">
            
            {/* Top Pointer Indicator */}
            <div className="absolute -top-2 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
              <div className="w-2.5 h-2.5 bg-amber-300 rounded-full -mt-1 shadow-md" />
            </div>

            {/* Rotating SVG Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{
                duration: 4,
                ease: [0.15, 0.95, 0.35, 1], // Realistic slowing-down spin cubic-bezier
              }}
              className="w-full h-full rounded-full shadow-2xl overflow-hidden border-4 border-amber-400/80 bg-slate-950 ring-4 ring-emerald-500/30"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {SEGMENTS.map((seg, i) => {
                  const total = SEGMENTS.length;
                  const angle = (2 * Math.PI) / total;
                  const startAngle = i * angle - Math.PI / 2;
                  const endAngle = (i + 1) * angle - Math.PI / 2;

                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Correctly convert text midpoint angle from radians to DEGREES for SVG transform
                  const textAngleDeg = (((i * angle + angle / 2) - Math.PI / 2) * 180) / Math.PI;

                  return (
                    <g key={i}>
                      <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="0.8" />
                      <g transform={`rotate(${textAngleDeg} 50 50)`}>
                        <text
                          x="75"
                          y="50"
                          fill={seg.textColor}
                          fontSize="4"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="drop-shadow-sm font-sans"
                        >
                          {seg.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Golden Casino Pegs around the Rim */}
                {Array.from({ length: 16 }).map((_, pegIdx) => {
                  const pegAngle = (pegIdx * (360 / 16)) * (Math.PI / 180);
                  const cx = 50 + 47.5 * Math.cos(pegAngle);
                  const cy = 50 + 47.5 * Math.sin(pegAngle);
                  return (
                    <circle 
                      key={`peg-${pegIdx}`} 
                      cx={cx} 
                      cy={cy} 
                      r="1.2" 
                      fill="#FDE047" 
                      stroke="#B45309" 
                      strokeWidth="0.4" 
                    />
                  );
                })}
              </svg>
            </motion.div>

            {/* Center Spinning Hub Button */}
            <button
              onClick={handleSpin}
              disabled={spinning}
              className={`absolute z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-xs shadow-xl border-4 transition-transform active:scale-95 cursor-pointer ${
                spinning
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-white text-slate-950 hover:scale-105 shadow-amber-500/50'
              }`}
            >
              {spinning ? (
                <FaRedo className="animate-spin text-sm" />
              ) : (
                <span className="text-[11px] font-black uppercase tracking-wider">SPIN</span>
              )}
            </button>
          </div>

          {/* RESULT OR STATUS CARD */}
          {winningSegment ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-center space-y-2.5"
            >
              <div className="flex items-center justify-center space-x-1.5">
                <span className="text-2xl">{winningSegment.icon}</span>
                <span className="text-sm font-black text-emerald-300">
                  Prize Unlocked: {winningSegment.label}!
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                +{winningSegment.points} EcoPoints deposited directly to your wallet!
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleClaimAndClose}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer active:scale-95"
                >
                  Claim & Keep
                </button>
                <button
                  onClick={() => {
                    setWinningSegment(null);
                    handleSpin();
                  }}
                  className="px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-black border border-amber-500/30 cursor-pointer active:scale-95 flex items-center space-x-1"
                >
                  <FaRedo className="text-[10px]" />
                  <span>Spin Again</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="w-full text-center space-y-2">
              <button
                onClick={handleSpin}
                disabled={spinning}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  spinning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black shadow-orange-500/40 active:scale-98'
                }`}
              >
                <FaBolt />
                <span>
                  {spinning
                    ? 'Spinning the Wheel...'
                    : 'Spin Daily Wheel (Free)'}
                </span>
              </button>

              <p className="text-[10px] text-slate-400 font-medium">
                ⚡ 100% Free Daily Spin • Win EcoPoints, Rate Boosters & Vouchers!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DailySpinWheelModal;
