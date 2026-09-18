import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaCheck, 
  FaCalendarAlt, FaMapMarkerAlt, FaChevronRight, 
  FaHome, FaClipboardList, FaUsers, FaUser, FaClock, FaTruck, FaLeaf,
  FaCoins, FaWallet, FaAward, FaComments, FaPhone, FaArrowRight, FaCamera,
  FaStore, FaTrophy, FaCertificate, FaShareAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import MobileCitizenNav from './MobileCitizenNav';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const MobileEcoHome = ({ 
  analytics, 
  activePickup, 
  pickups = [], 
  onPickupCreated,
  onOpenScanner,
  onOpenUpi,
  onOpenCert,
  onOpenStory
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Dynamic user points calculation
  const walletPoints = analytics?.walletPoints ?? user?.points ?? 1758;
  const inrValue = Math.round(walletPoints * 0.25);

  // Auto-slide hero banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = [
    {
      badge: 'DOORSTEP SCRAP PICKUP',
      title: 'Schedule & track your doorstep pickup request',
      desc: 'Certified EV green fleet drivers with digital scales collect scrap at your home.',
      cta: 'Book Now',
      action: () => navigate('/schedule-pickup')
    },
    {
      badge: 'AI WASTE SCANNER',
      title: 'Scan trash items to verify recyclability & bonus rates',
      desc: 'Point your phone camera to instantly classify plastic, paper, and e-waste.',
      cta: 'Try Scanner',
      action: () => { if (onOpenScanner) onOpenScanner(); }
    },
    {
      badge: 'INSTANT UPI PAYOUT',
      title: 'Convert EcoPoints directly into real bank cash',
      desc: 'Zero-delay UPI payout directly to GPay, PhonePe, or Paytm account.',
      cta: 'Redeem Cash',
      action: () => { if (onOpenUpi) onOpenUpi(); }
    }
  ];

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. TOP GREEN APP HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md">
        <div className="px-4 py-2.5 flex items-center justify-between">
          
          {/* Hamburger Menu Icon (Tapping opens the All Menu slide-out drawer) */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              window.dispatchEvent(new CustomEvent('toggle-mobile-citizen-drawer'));
            }}
            className="p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
            aria-label="Open Citizen Portal Menu"
            title="Open Menu"
          >
            <FaBars className="text-lg" />
          </button>

          {/* Center App Logo Title */}
          <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-base font-black tracking-wider uppercase">
              ECOREWARD
            </span>
          </div>

          {/* Right Controls: Language Selector & Notifications */}
          <div className="flex items-center space-x-1.5">
            {/* Language Toggle Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (setLang) setLang(lang === 'ta' ? 'en' : 'ta');
              }}
              className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 uppercase cursor-pointer"
              title="Switch Language"
            >
              {lang === 'ta' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Notification Bell with Red Badge */}
            <button 
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
              aria-label="Notifications"
            >
              <FaBell className="text-base" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-emerald-700 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* 2. SEARCH & QR SCANNER BAR */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-full px-3.5 py-2 shadow-inner border border-emerald-400/30 text-slate-800 dark:text-slate-100">
            <FaSearch className="text-slate-400 text-xs mr-2 flex-shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickups, scrap rates..."
              className="w-full bg-transparent text-xs font-semibold placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
                <FaTimes className="text-xs" />
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                triggerHaptic(30);
                if (onOpenScanner) onOpenScanner();
              }}
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition flex-shrink-0 cursor-pointer"
              title="Open AI Waste & QR Scanner"
            >
              <FaQrcode className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <div className="px-4 py-3.5 space-y-4 max-w-lg mx-auto">
        
        {/* 3. CITIZEN REWARDS & WALLET CARD */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg border border-amber-500/20">
                <FaCoins />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block leading-tight">EcoPoints Wallet</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  {walletPoints} <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">pts</span>
                  <span className="text-[11px] font-semibold text-slate-400 ml-1.5">(≈ ₹{inrValue})</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenUpi) onOpenUpi();
                }}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1 cursor-pointer"
              >
                <FaWallet className="text-[10px]" />
                <span>Withdraw UPI</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/redeem')}
                className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition hover:bg-slate-200 cursor-pointer"
              >
                Rewards
              </button>
            </div>
          </div>
        </div>

        {/* 4. HERO PROMO BANNER (Doorstep Scrap Pickup with Direct CTA) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white p-4 shadow-md">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-2 flex-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                {heroSlides[carouselIndex].badge}
              </span>
              <h2 className="text-sm font-black leading-snug">
                {heroSlides[carouselIndex].title}
              </h2>
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  heroSlides[carouselIndex].action();
                }}
                className="px-4 py-2 rounded-full bg-white text-emerald-700 font-black text-xs shadow-md hover:bg-emerald-50 active:scale-95 transition cursor-pointer inline-flex items-center space-x-1.5"
              >
                <span>{heroSlides[carouselIndex].cta}</span>
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>

            {/* Vector Illustration */}
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 drop-shadow" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="18" y="24" width="28" height="34" rx="4" fill="#047857" />
                <rect x="14" y="18" width="36" height="6" rx="2" fill="#059669" />
                <rect x="26" y="14" width="12" height="4" rx="2" fill="#10B981" />
                <path d="M32 30L34 34H30L32 30Z" fill="white" />
                <path d="M36 36L38 40H34L36 36Z" fill="white" />
                <path d="M28 36L26 40H30L28 36Z" fill="white" />
              </svg>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center items-center space-x-1.5 pt-3">
            {heroSlides.map((_, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setCarouselIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  carouselIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 5. QUICK ECO SERVICES & SERVICES GRID */}
        <div className="space-y-2">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Quick Eco Services
          </h3>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Service 1: Book Doorstep Pickup */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate('/schedule-pickup');
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center text-lg">
                <FaTruck />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                Book Pickup
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Scrap at Home
              </span>
            </button>

            {/* Service 2: AI Waste Scanner */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (onOpenScanner) onOpenScanner();
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center text-lg">
                <FaCamera />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                AI Scanner
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Camera Scan
              </span>
            </button>

            {/* Service 3: Citizen Leaderboard */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate('/leaderboard');
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center text-lg">
                <FaTrophy />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                Leaderboard
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Rank & Badges
              </span>
            </button>

            {/* Service 4: Eco-Store Products */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate('/store');
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center text-lg">
                <FaStore />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                Eco-Store
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Redeem Items
              </span>
            </button>

            {/* Service 5: Community Challenges */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate('/community');
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center text-lg">
                <FaLeaf />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                Challenges
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Green Drives
              </span>
            </button>

            {/* Service 6: Green Certificate */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (onOpenCert) onOpenCert();
              }}
              className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-1.5 hover:border-emerald-500 transition active:scale-95 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center text-lg">
                <FaCertificate />
              </div>
              <span className="text-[11px] font-black text-slate-900 dark:text-white">
                Certificate
              </span>
              <span className="text-[9px] font-bold text-slate-400 text-center">
                Carbon Offset
              </span>
            </button>
          </div>
        </div>

        {/* 6. LIVE ACTIVE PICKUP TELEMATICS (If citizen has active request) */}
        {activePickup && (
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Active Pickup
                </h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {activePickup.status || 'PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {activePickup.driver?.user?.name ? `Driver ${activePickup.driver.user.name}` : 'Driver Assigned'}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  EV Green Fleet • {activePickup.wasteCategory || `${activePickup.estimatedWeight || 5} kg scrap`}
                </p>
              </div>

              {/* OTP Code */}
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                  OTP Code
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {activePickup.verificationCode || activePickup.otp || '4829'}
                </span>
              </div>
            </div>

            {/* 4-Step Stepper */}
            <div className="pt-2 border-t border-emerald-500/20">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div>
                  <div className="h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 mt-1 block">1. Booked</span>
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 mt-1 block">2. Assigned</span>
                </div>
                <div>
                  <div className={`h-1.5 rounded-full ${['accepted', 'en_route', 'in_progress', 'completed'].includes(activePickup.status) ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">3. En Route</span>
                </div>
                <div>
                  <div className={`h-1.5 rounded-full ${activePickup.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <span className="text-[9px] font-bold text-slate-500 mt-1 block">4. Collected</span>
                </div>
              </div>
            </div>

            {/* Track Button */}
            <button
              type="button"
              onClick={() => navigate('/my-pickups')}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center space-x-1.5 active:scale-98 transition cursor-pointer"
            >
              <FaTruck />
              <span>Track Live Driver Status</span>
            </button>
          </div>
        )}

        {/* 7. VERIFIED ENVIRONMENTAL IMPACT BENTO */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Verified Environmental Impact
            </h4>
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(20);
                if (onOpenCert) onOpenCert();
              }}
              className="text-[10px] font-black text-amber-600 hover:text-amber-700 flex items-center space-x-1 cursor-pointer"
            >
              <FaCertificate />
              <span>Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/20">
              <span className="text-xl">🌳</span>
              <p className="text-base font-black text-slate-900 dark:text-white pt-1">
                {analytics?.treesPlanted || 142}+ Trees
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Geo-tagged & Planted</span>
            </div>

            <div className="p-3 bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl border border-sky-500/20">
              <span className="text-xl">🌊</span>
              <p className="text-base font-black text-slate-900 dark:text-white pt-1">
                {analytics?.plasticRecoveredKg || 380} kg
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Ocean Plastic Saved</span>
            </div>

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-500/20">
              <span className="text-xl">🚇</span>
              <p className="text-base font-black text-slate-900 dark:text-white pt-1">
                {analytics?.metroKm || '1,250'} km
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Clean Metro Commute</span>
            </div>

            <div className="p-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-2xl border border-teal-500/20">
              <span className="text-xl">⚡</span>
              <p className="text-base font-black text-slate-900 dark:text-white pt-1">
                {analytics?.co2Reduced || '24.5'} kg
              </p>
              <span className="text-[10px] text-slate-400 font-medium">Net CO2 Sequestered</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              if (onOpenStory) onOpenStory();
            }}
            className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <FaShareAlt className="text-[10px]" />
            <span>Generate 9:16 Instagram & WhatsApp Story</span>
          </button>
        </div>

      </div>

      {/* 8. STICKY BOTTOM 4-TAB NAVIGATION BAR */}
      <MobileCitizenNav />

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FaBell className="text-emerald-500" />
                  <span>Citizen Notifications</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🔔 Welcome to EcoReward!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Turn household scrap into EcoPoints & direct bank cash payouts.</p>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🚚 Daily Doorstep Pickup Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">EV Drivers are collecting dry scrap across Chennai zones.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MobileEcoHome;
