import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaChevronRight, FaCheck, FaTruck } from 'react-icons/fa';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const SwipeButton = ({ 
  onConfirm, 
  text = 'Slide to Confirm Pickup', 
  confirmedText = 'Pickup Verified & Completed',
  disabled = false,
  className = '' 
}) => {
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const containerRef = useRef(null);
  const startXRef = useRef(0);

  const handleDragStart = (clientX) => {
    if (disabled || isConfirmed) return;
    setIsDragging(true);
    startXRef.current = clientX;
    triggerHaptic(20);
  };

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging || !containerRef.current || isConfirmed) return;

    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 52;
    const maxDistance = rect.width - handleWidth;
    const currentDelta = Math.max(0, Math.min(clientX - startXRef.current, maxDistance));
    const progress = currentDelta / maxDistance;

    setDragProgress(progress);

    if (progress >= 0.9) {
      setIsDragging(false);
      setIsConfirmed(true);
      setDragProgress(1);
      triggerHaptic(60);
      soundFx.playSuccessChime();
      if (onConfirm) onConfirm();
    }
  }, [isDragging, isConfirmed, onConfirm]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || isConfirmed) return;
    setIsDragging(false);
    if (dragProgress < 0.9) {
      setDragProgress(0);
    }
  }, [isDragging, isConfirmed, dragProgress]);

  useEffect(() => {
    const onMouseMove = (e) => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e) => {
      if (e.touches[0]) handleDragMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleDragEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const rectWidth = containerRef.current?.getBoundingClientRect().width || 300;
  const maxSlide = Math.max(0, rectWidth - 56);
  const thumbTranslateX = dragProgress * maxSlide;

  return (
    <div
      ref={containerRef}
      className={`relative select-none h-14 rounded-2xl overflow-hidden p-1.5 flex items-center transition-all ${
        isConfirmed 
          ? 'bg-emerald-600 shadow-lg shadow-emerald-600/30' 
          : disabled 
            ? 'bg-slate-200 dark:bg-slate-800 opacity-60 cursor-not-allowed'
            : 'bg-slate-900 border border-slate-700/80 shadow-md'
      } ${className}`}
    >
      {/* Background Fill on Swipe */}
      <div 
        className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 transition-all pointer-events-none rounded-xl"
        style={{ width: `${Math.min(100, dragProgress * 100 + 15)}%` }}
      />

      {/* Label Text in Track */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
        {isConfirmed ? (
          <span className="text-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-2 animate-pulse">
            <FaCheck className="text-sm" /> {confirmedText}
          </span>
        ) : (
          <span className="text-slate-300 text-xs sm:text-sm font-extrabold tracking-wide flex items-center gap-1.5 opacity-80">
            {text}
            <span className="inline-flex space-x-0.5 text-emerald-400 font-black animate-pulse">
              <FaChevronRight className="text-[10px]" />
              <FaChevronRight className="text-[10px]" />
              <FaChevronRight className="text-[10px]" />
            </span>
          </span>
        )}
      </div>

      {/* Draggable Slider Thumb */}
      <div
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onTouchStart={(e) => e.touches[0] && handleDragStart(e.touches[0].clientX)}
        className={`relative z-10 w-11 h-11 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg transition-transform touch-none ${
          isConfirmed 
            ? 'bg-white text-emerald-600 scale-105' 
            : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 hover:scale-105 active:scale-95'
        }`}
        style={{
          transform: `translateX(${thumbTranslateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s ease-out'
        }}
      >
        {isConfirmed ? (
          <FaCheck className="text-emerald-600 text-base" />
        ) : (
          <FaTruck className="text-slate-950 text-base" />
        )}
      </div>
    </div>
  );
};

export default SwipeButton;
