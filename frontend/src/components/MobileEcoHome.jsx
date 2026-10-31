import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaCheck, 
  FaCalendarAlt, FaMapMarkerAlt, FaChevronRight, FaChevronDown,
  FaHome, FaClipboardList, FaUsers, FaUser, FaClock, FaTruck, FaLeaf,
  FaCoins, FaWallet, FaAward, FaComments, FaPhone, FaArrowRight, FaCamera,
  FaStore, FaTrophy, FaCertificate, FaShareAlt, FaCalculator, FaFire,
  FaSeedling, FaTrashAlt, FaExclamationTriangle, FaBolt, FaRedo, FaGift,
  FaSun, FaMoon, FaCheckCircle, FaStar, FaPlay, FaGraduationCap
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useDistrict } from '../context/DistrictContext';
import MobileCitizenNav from './MobileCitizenNav';
import LiveUberPickupTracker from './LiveUberPickupTracker';
import { 
  setupMorningWasteReminder, 
  triggerMorningWasteNotification, 
  isMorningReminderEnabled, 
  setMorningReminderEnabled 
} from '../utils/morningWasteReminder';
import UPIPayoutModal from './UPIPayoutModal';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

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
    plastics: { name: 'PET Bottles & Plastics', ratePerKg: 18, ptsPerKg: 3, icon: '🧴', badge: 'High Demand' },
    cardboard: { name: 'Cardboard & Paper', ratePerKg: 14, ptsPerKg: 2, icon: '📦', badge: 'Popular' },
    metals: { name: 'Metals & Tin Cans', ratePerKg: 34, ptsPerKg: 5, icon: '🥫', badge: 'Top Cash' },
    ewaste: { name: 'E-Waste & Gadgets', ratePerKg: 48, ptsPerKg: 10, icon: '💻', badge: '2X Bonus' },
    glass: { name: 'Glass Containers', ratePerKg: 6, ptsPerKg: 1, icon: '🍾', badge: 'Eco Classic' }
  },
  SEGREGATION_ITEMS = {
    plastic_bottle: { id: 'plastic_bottle', name: 'PET Bottle', binColor: 'blue', binName: 'Blue Bin (Dry Recyclables)', icon: '🧴', instructions: 'Rinse lightly, crush flat, leave cap on.', reward: '+₹18/kg • +3 EcoPts' },
    food_peels: { id: 'food_peels', name: 'Food Peels', binColor: 'green', binName: 'Green Bin (Wet Compost)', icon: '🥬', instructions: 'Keep free from plastic; send to aerobic compost.', reward: '+10 EcoPts' },
    used_battery: { id: 'used_battery', name: 'Batteries', binColor: 'red', binName: 'Red Bin (Hazardous E-Waste)', icon: '🔋', instructions: 'Wrap terminals with tape to prevent short circuits.', reward: '+₹48/kg • +10 EcoPts' },
    cardboard_box: { id: 'cardboard_box', name: 'Cardboard Box', binColor: 'blue', binName: 'Blue Bin (Dry Paper)', icon: '📦', instructions: 'Flatten boxes to save storage space.', reward: '+₹14/kg • +2 EcoPts' }
  },
  selectedSegKey = 'plastic_bottle',
  setSelectedSegKey
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const { currentDistrict, openDistrictModal } = useDistrict() || {
    currentDistrict: { name: 'Coimbatore', corporation: 'Coimbatore City Municipal Corporation' },
    openDistrictModal: () => {}
  };
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showMorningWasteBanner, setShowMorningWasteBanner] = useState(false);
  const [morningReminderActive, setMorningReminderActive] = useState(isMorningReminderEnabled());
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    triggerHaptic(15);
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

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

  // Dynamic user points sync
  const [bonusPoints, setBonusPoints] = useState(0);
  const [localUpiOpen, setLocalUpiOpen] = useState(false);

  useEffect(() => {
    const handlePointsRefresh = (e) => {
      const delta = e?.detail?.points || 0;
      setBonusPoints(prev => prev + delta);
    };
    window.addEventListener('refresh-wallet-points', handlePointsRefresh);
    return () => window.removeEventListener('refresh-wallet-points', handlePointsRefresh);
  }, []);

  const basePoints = analytics?.walletPoints ?? user?.points ?? 2634;
  const walletPoints = Math.max(0, basePoints + bonusPoints);
  const inrValue = Math.round(walletPoints * 0.25);
  const displayName = user?.name || 'Palani';

  const handleWithdrawUpi = () => {
    triggerHaptic(25);
    if (onOpenUpi) {
      onOpenUpi();
    } else {
      setLocalUpiOpen(true);
    }
  };

  const handleOpenSpinWheel = () => {
    triggerHaptic(25);
    if (onOpenSpin) onOpenSpin();
  };

  const searchableCatalog = [
    { title: 'PET Bottles & Plastics', subtitle: '₹18/kg • +3 EcoPoints', icon: '🧴', action: () => { updateCategory('plastics'); setSearchQuery(''); addToast('Selected PET Plastics in calculator', 'info'); } },
    { title: 'Cardboard & Paper Scrap', subtitle: '₹14/kg • +2 EcoPoints', icon: '📦', action: () => { updateCategory('cardboard'); setSearchQuery(''); addToast('Selected Cardboard in calculator', 'info'); } },
    { title: 'Metals & Beverage Tins', subtitle: '₹34/kg • +5 EcoPoints', icon: '🥫', action: () => { updateCategory('metals'); setSearchQuery(''); addToast('Selected Metals in calculator', 'info'); } },
    { title: 'E-Waste & Electronics', subtitle: '₹48/kg • +10 EcoPoints', icon: '💻', action: () => { updateCategory('ewaste'); setSearchQuery(''); addToast('Selected E-Waste in calculator', 'info'); } },
    { title: 'Glass Bottles & Containers', subtitle: '₹6/kg • +1 EcoPoints', icon: '🍾', action: () => { updateCategory('glass'); setSearchQuery(''); addToast('Selected Glass in calculator', 'info'); } },
    { title: 'Book Doorstep Scrap Pickup', subtitle: 'Schedule EV green fleet pickup', icon: '🚚', action: () => { setSearchQuery(''); navigate('/schedule-pickup'); } },
    { title: 'Instant UPI Bank Cashout', subtitle: 'Transfer EcoPoints to GPay/PhonePe', icon: '💳', action: () => { setSearchQuery(''); handleWithdrawUpi(); } },
    { title: 'Daily Eco Spin & Win Wheel', subtitle: 'Win up to 50 EcoPoints daily', icon: '🎡', action: () => { setSearchQuery(''); handleOpenSpinWheel(); } },
    { title: 'AI Waste & Item Scanner', subtitle: 'Instant camera recognition & prices', icon: '📷', action: () => { setSearchQuery(''); if (onOpenScanner) onOpenScanner(); } },
    { title: 'Official Green Certificate', subtitle: 'Download ISO verified impact cert', icon: '📜', action: () => { setSearchQuery(''); if (onOpenCert) onOpenCert(); } },
    { title: 'Track Active Pickups', subtitle: 'Live map & Driver ETA telematics', icon: '📍', action: () => { setSearchQuery(''); navigate('/my-pickups?track=live'); } },
    { title: 'Report Illegal Roadside Dump', subtitle: 'Alert municipality with geo photo', icon: '⚠️', action: () => { setSearchQuery(''); navigate('/report-dump'); } },
  ];

  const searchResults = searchQuery.trim() 
    ? searchableCatalog.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const currentScrap = SCRAP_RATES[activeCategory] || SCRAP_RATES.plastics;
  const calculatedEarnings = (activeWeight * currentScrap.ratePerKg).toFixed(0);
  const calculatedPoints = activeWeight * currentScrap.ptsPerKg;

  // Last completed pickup for 1-Click Reorder
  const lastCompletedPickup = pickups.find(p => p.status === 'completed') || {
    wasteCategory: 'Plastics & Paper Scrap',
    weight: 8.5,
    pointsAwarded: 145,
    categoryKey: 'plastics'
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#eaf4ee] via-[#f1f7f3] to-[#e6f3eb] dark:from-[#06141a] dark:via-[#091e19] dark:to-[#06141a] text-slate-900 dark:text-slate-100 pb-32 font-sans select-none overflow-x-hidden">
      
      {/* Background Cinematic Texture Layer matching screenshot */}
      <div 
        className="fixed inset-0 bg-cover bg-center pointer-events-none z-0 opacity-20 dark:opacity-25"
        style={{
          backgroundImage: "url('/images/cinematic_eco_dashboard_bg.jpg')",
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.02) saturate(1.15)'
        }}
      />

      {/* Ambient Luminous Green Glow Orbs */}
      <div className="fixed top-[-50px] left-[5%] w-[320px] h-[320px] bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[120px] right-[5%] w-[280px] h-[280px] bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* ============================================================== */}
      {/* 1. TOP HEADER: Matching Screenshot Pixel-for-Pixel             */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/92 dark:bg-[#07161b]/92 backdrop-blur-xl border-b border-emerald-100/90 dark:border-emerald-500/20 shadow-xs transition-colors duration-300">
        
        {/* Top Navbar Row */}
        <div className="px-3.5 py-2.5 flex items-center justify-between gap-2">
          
          {/* Brand Logo & Tagline */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 cursor-pointer active:scale-98 transition shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
              <FaLeaf className="text-base" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase text-emerald-800 dark:text-emerald-400 leading-none block">
                ECOREWARD
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 dark:text-emerald-300/80 tracking-tight block">
                recycle today, reward tomorrow
              </span>
            </div>
          </div>

          {/* Right Action Icons Row */}
          <div className="flex items-center space-x-1.5 shrink-0">
            
            {/* Coimbatore District Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(15);
                openDistrictModal();
              }}
              className="px-2.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-[10px] font-black flex items-center space-x-1 transition active:scale-95 cursor-pointer"
              title="Change District"
            >
              <FaMapMarkerAlt className="text-emerald-600 text-[9px]" />
              <span className="truncate max-w-[70px] sm:max-w-none">{currentDistrict?.name || 'Coimbatore'}</span>
              <FaChevronDown className="text-[8px] opacity-70" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer text-xs"
              aria-label="Toggle Theme"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <FaSun className="text-amber-400" /> : <FaMoon />}
            </button>

            {/* Notification Bell with Red Badge 1 */}
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer text-xs"
              aria-label="Notifications"
            >
              <FaBell />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-pulse">
                1
              </span>
            </button>

            {/* Hamburger Button (Green Solid Square matching screenshot) */}
            <button 
              type="button" 
              id="mobile-top-hamburger-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerHaptic(25);
                window.dispatchEvent(new CustomEvent('open-mobile-citizen-drawer'));
              }}
              className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md shadow-emerald-700/25"
              aria-label="Open Portal Menu"
              title="Menu"
            >
              <FaBars className="text-sm" />
            </button>
          </div>
        </div>

        {/* Search & Scanner Pill Bar matching screenshot */}
        <div className="px-3.5 pb-2.5 relative">
          <div className="flex items-center bg-[#ebf5ef] dark:bg-slate-900/90 rounded-full px-3 py-1.5 border border-emerald-500/25 text-slate-800 dark:text-slate-100 shadow-inner">
            <FaSearch className="text-slate-400 text-xs mr-2 flex-shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pickups, points, locations, recyclables... (Ctrl+K)"
              className="w-full bg-transparent text-xs font-semibold placeholder-slate-400 outline-none truncate"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')} 
                className="p-1 text-slate-400 hover:text-slate-600 mr-1 cursor-pointer"
              >
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
              <FaCamera className="text-sm" />
            </button>
          </div>

          {/* Live Search Auto-complete Dropdown */}
          <AnimatePresence>
            {searchQuery.trim().length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-3.5 right-3.5 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-emerald-500/30 overflow-hidden max-h-72 overflow-y-auto"
              >
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black uppercase text-slate-400">
                  <span>Quick Results ({searchResults.length})</span>
                  <button onClick={() => setSearchQuery('')} className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                    Clear
                  </button>
                </div>
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        triggerHaptic(20);
                        item.action();
                      }}
                      className="p-3 hover:bg-emerald-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between border-b border-slate-100/60 dark:border-slate-800/60 last:border-0 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white">{item.title}</h5>
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{item.subtitle}</p>
                        </div>
                      </div>
                      <FaChevronRight className="text-slate-300 text-xs" />
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 font-medium">
                    No results for "{searchQuery}". Try "plastic", "metals", or "pickup".
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN BODY CONTAINER                                            */}
      {/* ============================================================== */}
      <main className="px-3.5 py-3 space-y-4 max-w-lg mx-auto relative z-10">

        {/* 2. CITIZEN PROFILE & LEVEL CARD (From Left Sidebar of screenshot) */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-3 border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between">
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2.5 cursor-pointer active:scale-98 transition flex-1 min-w-0"
          >
            <div className="relative shrink-0">
              <img 
                src={getAvatarUrl(user, displayName)} 
                onError={(e) => handleAvatarError(e, displayName)}
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/60 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {displayName}
                </h4>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md border border-emerald-300/40">
                  🌿 Eco Guardian
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">Level 6 Citizen</span>
                <div className="w-20 sm:w-28 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[72%]" />
                </div>
                <span className="text-[8px] font-bold text-slate-400">777 to Lvl 7</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => navigate('/redeem')}
            className="shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-black text-xs text-right cursor-pointer active:scale-95 transition"
          >
            <span className="block leading-none">{walletPoints} pts</span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 block mt-0.5">₹{inrValue} cash</span>
          </div>
        </div>

        {/* 3. HERO WELCOME BANNER (Exact reproduction of desktop hero banner) */}
        <div className="relative overflow-hidden rounded-3xl p-4 sm:p-5 text-slate-900 dark:text-white shadow-md border border-white/90 dark:border-emerald-500/20 bg-white/95 dark:bg-slate-900/90">
          
          {/* Panoramic Eco City Skyline Background with Soft Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 dark:opacity-20 pointer-events-none"
            style={{ backgroundImage: "url('/images/eco_city_skyline_banner.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 via-teal-50/80 to-transparent dark:from-slate-950/95 dark:via-slate-900/90 dark:to-transparent pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 space-y-3">
            
            {/* Top row: Sprout badge + Greeting + EV Green Truck Artwork */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start space-x-2.5">
                {/* Sprout in Hand Badge with LVL 4 indicator */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden ring-2 ring-emerald-500 shadow-md bg-emerald-100">
                    <img 
                      src="/images/hand_holding_sprout.jpg" 
                      alt="Eco Seedling" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full border border-white dark:border-slate-900 shadow-xs">
                    LVL 4
                  </span>
                </div>

                <div>
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    Welcome back, <span className="text-emerald-600 dark:text-emerald-400">{displayName}!</span> 👋
                  </h2>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium mt-0.5 leading-snug">
                    Turn household scrap into verified environmental impact & instant rewards.
                  </p>
                </div>
              </div>

              {/* Modern EV Recycling Truck Image */}
              <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 border border-emerald-400/30 shadow-sm bg-white dark:bg-slate-800">
                <img 
                  src="/images/eco_green_truck.jpg" 
                  alt="EV Green Fleet" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Environmental Telematics Pills (Matching Screenshot) */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <span className="shrink-0 px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black rounded-full flex items-center gap-1">
                <FaLeaf className="text-[8px] text-emerald-600" /> Eco Guardian
              </span>
              <span className="shrink-0 px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black rounded-full flex items-center gap-1">
                <FaMapMarkerAlt className="text-[8px] text-emerald-600" /> {currentDistrict?.name || 'Coimbatore'} Live AQI: 54
              </span>
              <span className="shrink-0 px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black rounded-full flex items-center gap-1">
                🍃 Good & Clean Air
              </span>
              <span className="shrink-0 px-2 py-0.5 bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-black rounded-full flex items-center gap-1">
                ☀️ 29°C Pleasant
              </span>
            </div>

            {/* Banner Action Buttons */}
            <div className="flex items-center space-x-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  navigate('/schedule-pickup');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <span>+ Schedule Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenScanner) onOpenScanner();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 font-black text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <FaCamera className="text-[10px]" />
                <span>AI Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenStory) onOpenStory();
                }}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center space-x-1"
              >
                <FaLeaf className="text-[10px]" />
                <span>Story</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. DOORSTEP PICKUP TRACKER (LIVE GPS) - Directly in Mobile View */}
        <div className="w-full">
          <LiveUberPickupTracker 
            pickup={activePickup}
            onOpenChat={() => {
              if (onOpenChat) onOpenChat();
              else addToast('Starting chat with Driver Karthik Raja', 'info');
            }}
          />
        </div>

        {/* 5. PORTAL QUICK SERVICES GRID (Directly from Left Sidebar Menu) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Portal Menu & Quick Tools
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Eco Grid: Net Positive
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            
            {/* Book a Pickup */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                navigate('/schedule-pickup');
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm">
                  <FaCalendarAlt />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Book Pickup</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[8px] font-black">
                FAST
              </span>
            </div>

            {/* Live GPS Tracking */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                navigate('/my-pickups?track=live');
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-sm">
                  <FaMapMarkerAlt />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Live Tracking</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[8px] font-black animate-pulse">
                LIVE
              </span>
            </div>

            {/* Eco-Store */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                navigate('/store');
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-sm">
                  <FaStore />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Eco-Store</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[8px] font-black">
                NEW
              </span>
            </div>

            {/* AI Waste Scanner */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                if (onOpenScanner) onOpenScanner();
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center text-sm">
                  <FaCamera />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Waste Scanner</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[8px] font-black">
                AI
              </span>
            </div>

            {/* Report Roadside Dump */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                navigate('/report-dump');
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-rose-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center text-sm">
                  <FaExclamationTriangle />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">Report Dump</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 text-[8px] font-black">
                ALERT
              </span>
            </div>

            {/* Eco Education */}
            <div 
              onClick={() => {
                triggerHaptic(20);
                navigate('/support');
              }}
              className="p-3 bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition hover:border-emerald-300"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-sm">
                  <FaGraduationCap />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">Eco Education</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[8px] font-black">
                LEARN
              </span>
            </div>
          </div>
        </div>

        {/* 6. ECOPOINTS WALLET & INSTANT UPI CASHOUT */}
        <div className="bg-white/95 dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
          <div 
            onClick={() => {
              triggerHaptic(15);
              navigate('/redeem');
            }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-base border border-amber-500/20">
              <FaCoins />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block leading-tight">EcoPoints Wallet</span>
              <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {walletPoints} <span className="text-xs text-emerald-600 font-bold">pts</span>
                <span className="text-[11px] font-semibold text-slate-400 ml-1.5">(₹{inrValue})</span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleWithdrawUpi}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center space-x-1 cursor-pointer active:scale-95"
            >
              <FaWallet className="text-[10px]" />
              <span>Withdraw UPI</span>
            </button>
            <button
              type="button"
              onClick={handleOpenSpinWheel}
              className="px-2.5 py-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-bold border border-amber-500/20 transition cursor-pointer active:scale-95"
              title="Daily Spin Wheel"
            >
              🎡 Spin
            </button>
          </div>
        </div>

        {/* 7. FAST SCRAP RATE CALCULATOR (With exact rates from screenshot) */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-500/20 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600 text-sm">⚖️</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Live Scrap Rate Calculator
              </h4>
            </div>
            <span className="text-[9px] font-bold text-slate-400">Coimbatore Verified</span>
          </div>

          {/* Scrap Categories Pills */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
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
                  className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-2xs ring-1 ring-emerald-500/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-base leading-none mb-1">
                    <span>{item.icon}</span>
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400">
                      ₹{item.ratePerKg}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold block truncate">{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Weight Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Estimated Weight:</span>
              <span className="font-black text-emerald-700 dark:text-emerald-400">{activeWeight} kg</span>
            </div>
            <input 
              type="range"
              min="1"
              max="50"
              value={activeWeight}
              onChange={(e) => updateWeight(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Payout & Points Summary */}
          <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block leading-tight">Instant Cash + Points</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                ₹{calculatedEarnings} <span className="text-xs text-slate-400 font-normal">cash</span> + {calculatedPoints} <span className="text-xs text-slate-400 font-normal">pts</span>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                navigate(`/schedule-pickup?category=${activeCategory}&weight=${activeWeight}`);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer"
            >
              Book for ₹{calculatedEarnings}
            </button>
          </div>
        </div>

        {/* 8. WASTE SEGREGATION GUIDE */}
        <div className="bg-white/95 dark:bg-slate-900/90 rounded-2xl p-3.5 border border-emerald-100 dark:border-emerald-500/20 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">🗑️</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Tamil Nadu 3-Bin Segregation Guide
              </h4>
            </div>
            <span className="text-[9px] font-bold text-emerald-600">SWM Rule 2016</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {Object.entries(SEGREGATION_ITEMS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  updateSeg(key);
                }}
                className={`p-2 rounded-xl text-left border transition cursor-pointer ${
                  activeSeg === key
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="text-base mb-0.5">{item.icon}</div>
                <h5 className="text-[10px] font-black text-slate-900 dark:text-white truncate">{item.name}</h5>
                <span className="text-[8px] font-bold text-emerald-600 block truncate">{item.reward}</span>
              </button>
            ))}
          </div>

          {SEGREGATION_ITEMS[activeSeg] && (
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                {SEGREGATION_ITEMS[activeSeg].binName}
              </div>
              <p>{SEGREGATION_ITEMS[activeSeg].instructions}</p>
            </div>
          )}
        </div>

        {/* 9. 1-CLICK REORDER CARD */}
        <div className="p-3 bg-white/95 dark:bg-slate-900/90 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2.5 flex-1 pr-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs border border-emerald-200 shrink-0 bg-emerald-50">
              <img 
                src="/images/citizen/rebook_pickup_card.jpg" 
                alt="Rebook" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 block leading-tight">
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
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition cursor-pointer flex items-center space-x-1"
          >
            <FaRedo className="text-[9px]" />
            <span>Rebook</span>
          </button>
        </div>

      </main>

      {/* ============================================================== */}
      {/* 10. NOTIFICATIONS MODAL                                        */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
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
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1 cursor-pointer">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {/* Morning Reminder Notification */}
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-2xl border border-amber-400/40 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🌅</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">காலை 6:00 AM குப்பை நினைவூட்டல்</h4>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block">Daily Waste Segregation & Doorstep Pickup</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !morningReminderActive;
                        setMorningReminderActive(next);
                        setMorningReminderEnabled(next);
                        triggerHaptic(15);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                        morningReminderActive 
                          ? 'bg-emerald-500 text-white shadow-xs' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {morningReminderActive ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    காலை வணக்கம்! இன்று உங்கள் மக்கும் & மறுசுழற்சி குப்பைகளை தரம் பிரித்து வெளியே வைக்கவும். எங்களின் தூய்மை வாகனம் விரைவில் உங்கள் பகுதிக்கு வரும்! ♻️
                  </p>

                  <div className="pt-1.5 flex items-center justify-between border-t border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[9px] text-slate-400 font-bold">அடுத்த அலாரம்: 6:00 AM</span>
                    <button
                      type="button"
                      onClick={async () => {
                        triggerHaptic(25);
                        setShowMorningWasteBanner(true);
                        await triggerMorningWasteNotification({ isTest: true, addToast });
                      }}
                      className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white rounded-xl font-black text-[10px] flex items-center space-x-1 shadow-sm cursor-pointer"
                    >
                      <span>⚡ Test Alert</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🔔 Welcome to EcoReward!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Turn household scrap into EcoPoints & direct bank cash payouts.</p>
                </div>
                
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🚚 Daily Doorstep Pickup Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">EV Drivers are collecting dry scrap across Coimbatore zones.</p>
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

      {/* Guaranteed Self-contained Modals */}
      <UPIPayoutModal
        isOpen={localUpiOpen}
        onClose={() => setLocalUpiOpen(false)}
        userPoints={walletPoints}
        onPayoutSuccess={(updatedPts) => {
          setBonusPoints(prev => prev - (walletPoints - updatedPts));
        }}
      />
    </div>
  );
};

export default MobileEcoHome;
