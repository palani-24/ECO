import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaCheck, 
  FaCalendarAlt, FaMapMarkerAlt, FaChevronRight, 
  FaHome, FaClipboardList, FaUsers, FaUser, FaClock, FaTruck, FaLeaf,
  FaCoins, FaWallet, FaAward, FaComments, FaPhone, FaArrowRight, FaCamera,
  FaStore, FaTrophy, FaCertificate, FaShareAlt, FaCalculator, FaFire,
  FaSeedling, FaTrashAlt, FaExclamationTriangle, FaBolt, FaRedo, FaGift,
  FaBluetooth, FaCompass, FaCheckCircle
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
  onOpenStory,
  onOpenChat,
  onOpenSpin,
  streakDays = 5,
  streakClaimed = false,
  onClaimStreak,
  todayFormattedName = 'Saturday',
  todayFormattedDate = '19 Sep',
  weekDays = [],
  quests = [],
  onCompleteQuest,
  treeStage = { name: 'Young Sapling', stageTag: 'Level 2', icon: '🌱', pct: 65, remaining: 8.5 },
  totalKgNumber = '18.5',
  calcCategory = 'plastics',
  setCalcCategory,
  calcWeight = 12,
  setCalcWeight,
  SCRAP_RATES = {
    plastics: { name: 'PET Plastics', ratePerKg: 18, ptsPerKg: 3, icon: '🧴' },
    cardboard: { name: 'Cardboard', ratePerKg: 14, ptsPerKg: 2, icon: '📦' },
    metals: { name: 'Metals / Tins', ratePerKg: 34, ptsPerKg: 5, icon: '🥫' },
    ewaste: { name: 'E-Waste', ratePerKg: 48, ptsPerKg: 10, icon: '💻' },
    glass: { name: 'Glass Bottles', ratePerKg: 6, ptsPerKg: 1, icon: '🍾' }
  },
  SEGREGATION_ITEMS = {
    plastic_bottle: { id: 'plastic_bottle', name: 'PET Bottle', binName: 'Blue Bin (Dry Recyclables)', icon: '🧴', instructions: 'Rinse lightly, crush flat, leave cap on.', reward: '+18 ₹/kg • +3 EcoPts' },
    food_peels: { id: 'food_peels', name: 'Food Peels', binName: 'Green Bin (Wet Compost)', icon: '🥬', instructions: 'Keep free from plastic; send to aerobic compost.', reward: '+10 EcoPts' },
    used_battery: { id: 'used_battery', name: 'Batteries', binName: 'Red Bin (Hazardous E-Waste)', icon: '🔋', instructions: 'Wrap terminals with tape to prevent short circuits.', reward: '+48 ₹/kg • +10 EcoPts' },
    cardboard_box: { id: 'cardboard_box', name: 'Cardboard Box', binName: 'Blue Bin (Dry Paper)', icon: '📦', instructions: 'Flatten boxes to save storage space.', reward: '+14 ₹/kg • +2 EcoPts' }
  },
  selectedSegKey = 'plastic_bottle',
  setSelectedSegKey
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Local fallback state if setters are not passed
  const [internalCat, setInternalCat] = useState(calcCategory);
  const [internalWeight, setInternalWeight] = useState(calcWeight);
  const [internalSeg, setInternalSeg] = useState(selectedSegKey);

  const activeCategory = setCalcCategory ? calcCategory : internalCat;
  const updateCategory = setCalcCategory || setInternalCat;

  const activeWeight = setCalcWeight ? calcWeight : internalWeight;
  const updateWeight = setCalcWeight || setInternalWeight;

  const activeSeg = setSelectedSegKey ? selectedSegKey : internalSeg;
  const updateSeg = setSelectedSegKey || setInternalSeg;

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
      title: 'Schedule & track doorstep pickup at your convenience',
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

  const currentScrap = SCRAP_RATES[activeCategory] || SCRAP_RATES.plastics;

  // Last completed pickup for 1-Click Reorder
  const lastCompletedPickup = pickups.find(p => p.status === 'completed') || {
    wasteCategory: 'Plastics & Paper Scrap',
    weight: 8.5,
    pointsAwarded: 145,
    categoryKey: 'plastics'
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. TOP GREEN APP HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md">
        <div className="px-4 py-2.5 flex items-center justify-between">
          
          {/* Hamburger Menu Icon */}
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
              placeholder="Search scrap rates, pickups..."
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
        
        {/* 3. CITIZEN WALLET & UPI CASHOUT CARD */}
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

        {/* 4. DAILY ECO SPIN & WIN WHEEL BANNER (High Engagement Gamification) */}
        <div 
          onClick={() => {
            triggerHaptic(25);
            if (onOpenSpin) onOpenSpin();
          }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-3.5 shadow-md flex items-center justify-between cursor-pointer active:scale-98 transition"
        >
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              <FaGift className="animate-bounce" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-wider block">
                  Daily Eco Spin & Win
                </span>
                <span className="px-1.5 py-0.2 bg-white text-orange-600 text-[9px] font-black rounded-full uppercase">
                  Free
                </span>
              </div>
              <p className="text-[11px] text-amber-100 font-medium">
                Win up to 50 EcoPoints, rate boosters & vouchers!
              </p>
            </div>
          </div>

          <button 
            type="button"
            className="px-3 py-1.5 rounded-xl bg-white text-orange-600 font-black text-xs shadow-md shrink-0 pointer-events-none"
          >
            Spin Now
          </button>
        </div>

        {/* 5. 1-CLICK "REPEAT LAST PICKUP" REORDER CARD */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-base border border-teal-500/20">
              <FaRedo />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                1-Click Fast Rebook
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                Repeat {lastCompletedPickup.weight || 8.5} kg {lastCompletedPickup.wasteCategory || 'Plastics & Paper'}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              navigate(`/schedule-pickup?category=${lastCompletedPickup.categoryKey || 'plastics'}&weight=${lastCompletedPickup.weight || 8.5}`);
            }}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer shrink-0"
          >
            Rebook
          </button>
        </div>

        {/* 6. HERO PROMO CAROUSEL */}
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

        {/* 7. LIVE ACTIVE PICKUP TELEMATICS + BLUETOOTH DIGITAL SCALE & ETA */}
        {activePickup && (
          <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-3xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Doorstep Telematics
                </h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {activePickup.status || 'PENDING'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {activePickup.driver?.user?.name ? `Driver ${activePickup.driver.user.name}` : 'Driver Karthik Raja'}
                </h4>
                <p className="text-[11px] text-slate-500 font-bold">
                  EV Green Fleet • {activePickup.wasteCategory || `${activePickup.estimatedWeight || 5} kg scrap`}
                </p>
              </div>

              {/* OTP Code */}
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                  Customer OTP
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {activePickup.verificationCode || activePickup.otp || '4829'}
                </span>
              </div>
            </div>

            {/* Live Driver ETA & Bluetooth Certified Scale Pill */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-500/20 text-xs font-bold">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <FaCompass className="text-emerald-500 animate-spin" />
                  <span>Driver is 1.4 km away • ETA 12 mins</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black">
                  ON TIME
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-400/20 text-xs font-bold text-blue-900 dark:text-blue-300">
                <div className="flex items-center space-x-1.5 text-[11px]">
                  <FaBluetooth className="text-blue-500" />
                  <span>Bluetooth Digital Scale: Live Sync Ready</span>
                </div>
                <span className="text-[9px] font-mono text-blue-600 font-black">CERTIFIED</span>
              </div>
            </div>

            {/* Contact Driver Controls */}
            <div className="flex items-center space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenChat) onOpenChat();
                }}
                className="flex-1 py-1.5 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <FaComments />
                <span>Chat Driver</span>
              </button>
              <a
                href="tel:+919876543210"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1 shadow-xs cursor-pointer"
              >
                <FaPhone />
                <span>Call</span>
              </a>
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

            <button
              type="button"
              onClick={() => navigate('/my-pickups')}
              className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center space-x-1.5 active:scale-98 transition cursor-pointer"
            >
              <FaTruck />
              <span>Open Detailed Live Route Map</span>
            </button>
          </div>
        )}

        {/* 8. SMART SCRAP BUYBACK CALCULATOR & LIVE RATES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center text-sm">
                <FaCalculator />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Scrap Calculator
                </h4>
                <p className="text-[10px] text-slate-400">Current Market Rates / kg</p>
              </div>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
              Chennai Spot Rates
            </span>
          </div>

          {/* Category Chips */}
          <div className="grid grid-cols-3 gap-1.5">
            {Object.entries(SCRAP_RATES).map(([key, item]) => {
              const isSelected = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    updateCategory(key);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500 text-slate-900 dark:text-white shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400">
                      ₹{item.ratePerKg}
                    </span>
                  </div>
                  <span className="text-[10px] font-black block truncate mt-0.5">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Weight Range Slider */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs font-black">
              <span className="text-slate-600 dark:text-slate-300">Weight:</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-[11px]">
                {activeWeight} kg
              </span>
            </div>
            <input 
              type="range"
              min="2"
              max="100"
              step="1"
              value={activeWeight}
              onChange={(e) => updateWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[8px] font-bold text-slate-400">
              <span>2 kg (Min)</span>
              <span>25 kg</span>
              <span>50 kg</span>
              <span>100 kg (Bulk)</span>
            </div>
          </div>

          {/* Instant Estimation and 1-Click Sell Scrap */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-500/30">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Estimated Payout</span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                ₹{activeWeight * currentScrap.ratePerKg}
              </span>
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 ml-1.5">
                +{(activeWeight * currentScrap.ptsPerKg)} pts
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate(`/schedule-pickup?category=${activeCategory}&weight=${activeWeight}`);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1 cursor-pointer active:scale-95"
            >
              <span>Sell Scrap</span>
              <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>

        {/* 9. 7-DAY GREEN STREAK & MISSIONS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center text-sm">
                <FaFire className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {streakDays}-Day Green Streak
                </h4>
                <p className="text-[10px] text-slate-400">Today: {todayFormattedName}, {todayFormattedDate}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic(30);
                if (onClaimStreak) onClaimStreak();
              }}
              disabled={streakClaimed}
              className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                streakClaimed 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
                  : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-sm'
              }`}
            >
              {streakClaimed ? 'Claimed ✓' : 'Claim +10 Pts'}
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
              <div 
                key={idx}
                className="p-1 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col items-center"
              >
                <span className="text-[8px] font-bold text-slate-400">{day}</span>
                <span className="text-xs mt-0.5">
                  {idx < streakDays ? '🔥' : '⚪'}
                </span>
              </div>
            ))}
          </div>

          {quests && quests.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Daily Eco Quests</span>
              {quests.slice(0, 2).map((q) => (
                <div 
                  key={q.id}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className="text-xs">{q.icon || '🌱'}</span>
                    <div className="min-w-0">
                      <span className={`text-[11px] font-bold block truncate ${q.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {q.title}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-extrabold">+{q.points} EcoPoints</span>
                    </div>
                  </div>

                  {q.completed ? (
                    <span className="text-emerald-500 text-xs font-black">✓</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(20);
                        if (onCompleteQuest) onCompleteQuest(q);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black cursor-pointer active:scale-95"
                    >
                      Start
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 10. UNIFIED VIRTUAL TREE & ENVIRONMENTAL IMPACT BENTO */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-4 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">
                <FaSeedling className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Virtual Tree & Verified Impact
                </h4>
                <p className="text-[10px] text-emerald-300 font-medium">{treeStage.stageTag || 'Level 2'}: {treeStage.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenCert) onOpenCert();
                }}
                className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-[10px] font-black border border-amber-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <FaCertificate />
                <span>Cert</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenStory) onOpenStory();
                }}
                className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-black border border-emerald-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <FaShareAlt />
                <span>Story</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/60 p-3 rounded-2xl border border-emerald-500/20">
            <div className="w-14 h-14 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                <ellipse cx="50" cy="88" rx="38" ry="8" fill="#14532d" />
                <path d="M50 86 Q48 64 50 50" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
                <circle cx="50" cy="40" r="14" fill="#10b981" />
                <circle cx="50" cy="34" r="9" fill="#34d399" />
              </svg>
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[10px] font-black text-emerald-300">
                <span>Tree Maturity Progress</span>
                <span>{treeStage.pct || 65}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-emerald-500/30">
                <div 
                  className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full" 
                  style={{ width: `${treeStage.pct || 65}%` }}
                />
              </div>
              <p className="text-[9px] text-slate-300 pt-0.5">
                Total Diverted: <strong className="text-white font-black">{totalKgNumber} kg</strong>
              </p>
            </div>
          </div>

          {/* 4 Core Environmental Badges Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="text-base">🌳</span>
              <div>
                <span className="text-xs font-black text-white block">{analytics?.treesPlanted || 142} Trees</span>
                <span className="text-[8px] text-slate-400 font-bold">Planted</span>
              </div>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="text-base">🌊</span>
              <div>
                <span className="text-xs font-black text-white block">{analytics?.plasticRecoveredKg || 380} kg</span>
                <span className="text-[8px] text-slate-400 font-bold">Ocean Plastic</span>
              </div>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="text-base">🚇</span>
              <div>
                <span className="text-xs font-black text-white block">{analytics?.metroKm || '1,250'} km</span>
                <span className="text-[8px] text-slate-400 font-bold">Clean Commute</span>
              </div>
            </div>
            <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="text-base">⚡</span>
              <div>
                <span className="text-xs font-black text-white block">{analytics?.co2Reduced || '24.5'} kg</span>
                <span className="text-[8px] text-slate-400 font-bold">CO2 Offset</span>
              </div>
            </div>
          </div>
        </div>

        {/* 11. REPORT ROADSIDE DUMPING BANNER */}
        <div className="p-3.5 bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center text-sm">
              <FaExclamationTriangle />
            </div>
            <div>
              <h5 className="text-xs font-black text-rose-900 dark:text-rose-200">
                Spotted Roadside Trash?
              </h5>
              <p className="text-[10px] text-rose-700 dark:text-rose-400">
                Snap geo-tagged photo & alert municipality
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              navigate('/report-dump');
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95"
          >
            Report
          </button>
        </div>

      </div>

      {/* 12. ELEVATED STICKY BOTTOM NAVIGATION BAR WITH CENTER FAB */}
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
