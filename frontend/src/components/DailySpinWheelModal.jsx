import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCoins, FaGift, FaBolt, FaLeaf, FaTrophy, FaRedo } from 'react-icons/fa';
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
  const [timeRemaining, setTimeRemaining] = useState('');

  // Check 24-hr spin cooldown
  useEffect(() => {
    try {
      const lastSpin = localStorage.getItem('ecoreward_last_spin_time');
      if (lastSpin) {
        const diffMs = Date.now() - parseInt(lastSpin, 10);
        const cooldownMs = 24 * 60 * 60 * 1000;
        if (diffMs < cooldownMs) {
          setCanSpin(false);
          const hoursLeft = Math.ceil((cooldownMs - diffMs) / (60 * 60 * 1000));
          setTimeRemaining(`${hoursLeft} hours`);
        } else {
          setCanSpin(true);
        }
      }
    } catch {}
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (spinning || !canSpin) return;

    triggerHaptic(40);
    setSpinning(true);
    setWinningSegment(null);

    // Pick a random segment (0 to 7)
    const prizeIndex = Math.floor(Math.random() * SEGMENTS.length);
    const segmentAngle = 360 / SEGMENTS.length; // 45 degrees
    
    // We want the selected slice to stop at the top pointer (90deg offset adjustment)
    // 5 full rotations (1800 deg) + angle to target segment
    const extraRotations = 360 * 5;
    const targetAngle = extraRotations + (360 - (prizeIndex * segmentAngle) - segmentAngle / 2);

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
      setCanSpin(false);

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

      addToast(`🎉 Congratulations! You won "${won.label}" from Daily Eco Spin!`, 'success', 'Daily Reward Unlocked');
    }, 4000);
  };

  const handleClaimAndClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
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
            disabled={spinning}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer"
          >
            <FaTimes />
          </button>

          {/* Title Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <FaGift />
              <span>Daily Eco Spin & Win</span>
            </div>
            <h3 className="text-lg font-black text-white">Spin Daily for Free Rewards</h3>
            <p className="text-xs text-slate-400 font-medium">
              Win EcoPoints, scrap rate boosters, and partner discount vouchers.
            </p>
          </div>

          {/* SPIN WHEEL CONTAINER */}
          <div className="relative w-64 h-64 my-2 flex items-center justify-center">
            
            {/* Top Pointer Indicator */}
            <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_6px_rgba(245,158,11,0.8)]" />
            </div>

            {/* Rotating SVG Wheel */}
            <motion.div
              animate={{ rotate: rotation }}
              transition={{
                duration: 4,
                ease: [0.15, 0.9, 0.25, 1], // Realistic spin deceleration
              }}
              className="w-60 h-60 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.3)] border-4 border-amber-400/80 overflow-hidden relative"
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {SEGMENTS.map((seg, i) => {
                  const angle = 360 / SEGMENTS.length;
                  const startAngle = (i * angle) * (Math.PI / 180);
                  const endAngle = ((i + 1) * angle) * (Math.PI / 180);

                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text rotation angle (midpoint of segment)
                  const textAngle = i * angle + angle / 2;

                  return (
                    <g key={i}>
                      <path d={pathData} fill={seg.color} stroke="#0f172a" strokeWidth="1" />
                      <g transform={`rotate(${textAngle} 50 50)`}>
                        <text
                          x="76"
                          y="52"
                          fill={seg.textColor}
                          fontSize="5.2"
                          fontWeight="900"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(90 76 52)`}
                        >
                          {seg.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </motion.div>

            {/* Center Spinning Hub Button */}
            <button
              onClick={handleSpin}
              disabled={spinning || !canSpin}
              className={`absolute z-20 w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-xs shadow-xl border-4 transition-transform active:scale-95 cursor-pointer ${
                spinning
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : canSpin
                  ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 border-white text-slate-950 hover:scale-105 shadow-amber-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {spinning ? (
                <FaRedo className="animate-spin text-sm" />
              ) : canSpin ? (
                <span className="text-[11px] font-black uppercase tracking-wider">SPIN</span>
              ) : (
                <span className="text-[9px] font-bold">USED</span>
              )}
            </button>
          </div>

          {/* RESULT OR STATUS CARD */}
          {winningSegment ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full p-3.5 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-center space-y-2"
            >
              <span className="text-2xl">{winningSegment.icon}</span>
              <h4 className="text-sm font-black text-emerald-300">
                You Won: {winningSegment.label}!
              </h4>
              <p className="text-[11px] text-slate-300 font-medium">
                +{winningSegment.points} EcoPoints added to your wallet.
              </p>
              <button
                onClick={handleClaimAndClose}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
              >
                Claim & Continue
              </button>
            </motion.div>
          ) : (
            <div className="w-full text-center space-y-2">
              <button
                onClick={handleSpin}
                disabled={spinning || !canSpin}
                className={`w-full py-3 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  spinning
                    ? 'bg-slate-800 text-slate-500'
                    : canSpin
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black shadow-emerald-500/30 active:scale-98'
                    : 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed'
                }`}
              >
                <FaBolt />
                <span>
                  {spinning
                    ? 'Spinning the Wheel...'
                    : canSpin
                    ? 'Spin Daily Wheel (Free)'
                    : `Next Spin in ${timeRemaining || '24 hrs'}`}
                </span>
              </button>

              {!canSpin && (
                <p className="text-[10px] text-slate-400 font-medium">
                  Free spin refreshes every 24 hours. Keep recycling to earn more perks!
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DailySpinWheelModal;
