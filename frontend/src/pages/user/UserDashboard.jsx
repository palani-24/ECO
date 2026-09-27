import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDistrict } from '../../context/DistrictContext';
import UserLayout from '../../components/UserLayout';
import api from '../../utils/api';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import DriverChatModal from '../../components/DriverChatModal';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import EcoStoryModal from '../../components/EcoStoryModal';
import MobileEcoHome from '../../components/MobileEcoHome';
import DailySpinWheelModal from '../../components/DailySpinWheelModal';
import LiveUberPickupTracker from '../../components/LiveUberPickupTracker';
import { triggerConfetti } from '../../utils/confetti';
import { soundFx } from '../../utils/audioFeedback';
import { triggerHaptic } from '../../utils/mobileNative';
import { 
  FaCoins, FaTruck, FaLeaf, FaCheckCircle, FaCalendarPlus, FaCamera, 
  FaComments, FaPhone, FaFire, FaCalculator, FaSeedling, FaCarSide, 
  FaLightbulb, FaWater, FaCheck, FaAward, FaTrashAlt, FaChevronRight,
  FaArrowRight, FaWallet, FaShieldAlt, FaClock, FaRoute, FaBolt, FaShareAlt
} from 'react-icons/fa';

const SCRAP_RATES = {
  plastics: { name: 'PET Bottles & Plastics', ratePerKg: 18, ptsPerKg: 3, icon: '🧴', badge: 'High Demand' },
  cardboard: { name: 'Cardboard & Paper', ratePerKg: 14, ptsPerKg: 2, icon: '📦', badge: 'Popular' },
  metals: { name: 'Metals & Tin Cans', ratePerKg: 34, ptsPerKg: 5, icon: '🥫', badge: 'Top Cash' },
  ewaste: { name: 'E-Waste & Gadgets', ratePerKg: 48, ptsPerKg: 10, icon: '💻', badge: '2X Monsoon Bonus' },
  glass: { name: 'Glass Containers', ratePerKg: 6, ptsPerKg: 1, icon: '🍾', badge: 'Eco Classic' }
};

const SEGREGATION_ITEMS = {
  plastic_bottle: {
    id: 'plastic_bottle',
    name: 'PET Beverage Bottle',
    binColor: 'blue',
    binName: 'Blue Bin (Dry Recyclables)',
    icon: '🧴',
    tag: 'Dry Recyclable',
    instructions: 'Empty leftover liquid, rinse lightly, crush flat, and keep caps on.',
    impact: 'Diverted from ocean landfill; recycled into green textiles & bottles.',
    reward: '+18 ₹/kg • +3 EcoPts'
  },
  food_peels: {
    id: 'food_peels',
    name: 'Vegetable & Fruit Peels',
    binColor: 'green',
    binName: 'Green Bin (Wet / Compost)',
    icon: '🥬',
    tag: 'Wet Compostable',
    instructions: 'Keep separate from plastic bags; sent directly to community aerobic compost pits.',
    impact: 'Decomposes in 21 days into rich organic fertilizer.',
    reward: '+10 EcoPts / drop'
  },
  used_battery: {
    id: 'used_battery',
    name: 'Batteries & Lithium Cells',
    binColor: 'red',
    binName: 'Red Bin (Domestic Hazardous)',
    icon: '🔋',
    tag: 'Hazardous Waste',
    instructions: 'Place tape over both terminals to prevent short-circuit sparks.',
    impact: 'Prevents toxic heavy metal leaching into groundwater.',
    reward: '+20 EcoPts / item'
  },
  cardboard_box: {
    id: 'cardboard_box',
    name: 'E-Commerce Delivery Carton',
    binColor: 'blue',
    binName: 'Blue Bin (Dry Recyclables)',
    icon: '📦',
    tag: 'Dry Recyclable',
    instructions: 'Flatten carton boxes, remove packing tape, and bundle flat.',
    impact: 'Saves 17 mature trees and 7,000 gallons of water per ton recycled.',
    reward: '+14 ₹/kg • +2 EcoPts'
  }
};

const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useLanguage() || { t: (k) => k };
  const { currentDistrict } = useDistrict() || {};

  // Modals state
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [showGreenCert, setShowGreenCert] = useState(false);
  const [showUpiPayout, setShowUpiPayout] = useState(false);
  const [showEcoStory, setShowEcoStory] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);

  // Virtual Tree Growth Stage Calculation
  const totalKgNumber = parseFloat(analytics?.totalRecycledKg || '48.5') || 48.5;
  const treeStage = useMemo(() => {
    if (totalKgNumber < 20) {
      return { level: 1, name: 'Sprouting Seedling', stageTag: 'Stage 1/5', icon: '🌱', nextGoal: 20, pct: Math.min(100, Math.round((totalKgNumber / 20) * 100)), remaining: (20 - totalKgNumber).toFixed(1) };
    }
    if (totalKgNumber < 50) {
      return { level: 2, name: 'Vibrant Sprout', stageTag: 'Stage 2/5', icon: '🌿', nextGoal: 50, pct: Math.min(100, Math.round(((totalKgNumber - 20) / 30) * 100)), remaining: (50 - totalKgNumber).toFixed(1) };
    }
    if (totalKgNumber < 100) {
      return { level: 3, name: 'Young Sapling', stageTag: 'Stage 3/5', icon: '🌳', nextGoal: 100, pct: Math.min(100, Math.round(((totalKgNumber - 50) / 50) * 100)), remaining: (100 - totalKgNumber).toFixed(1) };
    }
    if (totalKgNumber < 250) {
      return { level: 4, name: 'Flourishing Tree', stageTag: 'Stage 4/5', icon: '🌲', nextGoal: 250, pct: Math.min(100, Math.round(((totalKgNumber - 100) / 150) * 100)), remaining: (250 - totalKgNumber).toFixed(1) };
    }
    return { level: 5, name: 'Ancient Forest Guardian', stageTag: 'Max Stage', icon: '🏞️', nextGoal: 500, pct: 100, remaining: '0' };
  }, [totalKgNumber]);

  // Real-Time Dynamic Date & 7-Day Week Calculation
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // Monday = 0, Tuesday = 1, ..., Sunday = 6
  const todayFormattedName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const todayFormattedDate = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

  // Check if today's streak has been claimed today in this browser
  const [streakClaimed, setStreakClaimed] = useState(() => {
    try {
      return localStorage.getItem('ecoreward_streak_claimed_date') === new Date().toDateString();
    } catch {
      return false;
    }
  });

  const baseStreakDays = Math.max(1, currentDayIndex);
  const [streakDays, setStreakDays] = useState(() => {
    const isClaimed = localStorage.getItem('ecoreward_streak_claimed_date') === new Date().toDateString();
    return baseStreakDays + (isClaimed ? 1 : 0);
  });

  // Dynamically compute the 7 days of the current week (Monday to Sunday) with actual dates
  const weekDays = useMemo(() => {
    const monday = new Date(now);
    monday.setDate(now.getDate() - currentDayIndex);
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const shortNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return dayLabels.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isToday = idx === currentDayIndex;
      const isPast = idx < currentDayIndex;
      const isDone = isPast || (isToday && streakClaimed);

      return {
        label,
        shortName: shortNames[idx],
        dateNum: d.getDate(),
        isToday,
        isPast,
        isDone
      };
    });
  }, [currentDayIndex, streakClaimed]);

  const [quests, setQuests] = useState([
    { id: 1, title: 'Segregate Dry & Wet Household Waste', points: 15, completed: true, icon: '♻️' },
    { id: 2, title: 'Scan 1 Scrap Item with AI Vision', points: 20, completed: false, icon: '📷', action: 'scanner' },
    { id: 3, title: 'Book Doorstep Eco Collection', points: 50, completed: false, icon: '🚛', action: 'pickup' },
  ]);

  // Scrap Calculator State
  const [calcWeight, setCalcWeight] = useState(12);
  const [calcCategory, setCalcCategory] = useState('plastics');

  // Segregation Helper
  const [selectedSegKey, setSelectedSegKey] = useState('plastic_bottle');

  // Real-time Socket Listener
  useEffect(() => {
    const handlePickupUpdated = (data) => {
      const updatedPickup = data?.latestPickup || data;
      if (!updatedPickup || !updatedPickup._id) return;

      setPickups(prev => {
        const idx = prev.findIndex(p => p._id === updatedPickup._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...updatedPickup };
          return updated;
        }
        return [updatedPickup, ...prev];
      });

      if (updatedPickup.status === 'completed') {
        const pts = updatedPickup.pointsAwarded || 175;
        addToast(`🎉 Pickup Completed! +${pts} EcoPoints credited to your wallet.`, 'success', 'Pickup Verified');
      } else if (updatedPickup.status === 'accepted') {
        addToast(`Driver ${updatedPickup.driver?.user?.name || 'Karthik'} accepted your collection request!`, 'info', 'Driver Assigned');
      }
    };

    if (realtimeData?.latestPickup) {
      handlePickupUpdated(realtimeData.latestPickup);
    }
  }, [realtimeData?.latestPickup]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pickupRes, transRes] = await Promise.all([
          api.get('/user/pickups'),
          api.get('/user/transactions')
        ]);

        let pickupList = [];
        if (pickupRes.data?.success) {
          pickupList = pickupRes.data.data;
          setPickups(pickupList);
        }
        if (transRes.data?.success) {
          setTransactions(transRes.data.data.slice(0, 4));
        }

        const completed = pickupList.filter(p => p.status === 'completed');
        const pending = pickupList.filter(p => p.status === 'pending');
        const active = pickupList.filter(p => p.status === 'assigned' || p.status === 'accepted');

        let totalWeight = 0;
        completed.forEach(p => {
          totalWeight += p.actualWeight || p.estimatedWeight || 0;
        });

        const co2Reduced = (totalWeight * 1.5).toFixed(1);
        const treesSaved = (totalWeight * 0.017).toFixed(2);

        setAnalytics({
          completedCount: completed.length,
          pendingCount: pending.length,
          activeCount: active.length,
          todayCount: pickupList.filter(p => new Date(p.pickupDate || p.createdAt).toDateString() === new Date().toDateString()).length,
          walletPoints: user?.points || 0,
          co2Reduced,
          treesSaved,
          totalRewards: (user?.points || 0).toString(),
          totalRecycledKg: totalWeight.toFixed(1)
        });
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    try {
      localStorage.setItem('ecoreward_streak_claimed_date', new Date().toDateString());
    } catch {}
    setStreakClaimed(true);
    setStreakDays(prev => prev + 1);
    setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + 10 }) : prev);
    triggerHaptic(50);
    triggerConfetti();
    soundFx.playSuccessChime();
    addToast(`🎉 ${todayFormattedName} Streak Bonus Claimed! +10 EcoPoints added to your wallet.`, 'success', 'Daily Streak Claimed');
  };

  const handleCompleteQuest = (q) => {
    if (q.completed) return;
    if (q.action === 'scanner') {
      setShowAiScanner(true);
    } else if (q.action === 'pickup') {
      navigate('/schedule-pickup');
      return;
    }
    setQuests(prev => prev.map(item => item.id === q.id ? { ...item, completed: true } : item));
    setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + q.points }) : prev);
    triggerHaptic(40);
    triggerConfetti();
    soundFx.playSuccessChime();
    addToast(`Mission Completed: "${q.title}"! +${q.points} EcoPoints added.`, 'success', 'Quest Unlocked');
  };

  const activePickup = pickups.find(p => p.status !== 'completed' && p.status !== 'cancelled') || null;

  const currentPoints = analytics?.walletPoints ?? user?.points ?? 0;
  const inrEquivalent = Math.round(currentPoints * 0.25);

  // Global modal triggers from MobileCitizenNav or other components
  useEffect(() => {
    const handleScanner = () => setShowAiScanner(true);
    const handleCert = () => setShowGreenCert(true);
    const handleStory = () => setShowEcoStory(true);
    const handleUpi = () => setShowUpiPayout(true);
    const handleChat = () => setShowDriverChat(true);

    window.addEventListener('open-ai-scanner', handleScanner);
    window.addEventListener('open-green-certificate', handleCert);
    window.addEventListener('open-eco-story', handleStory);
    window.addEventListener('open-upi-payout', handleUpi);
    window.addEventListener('open-driver-chat', handleChat);
    const handleSpin = () => setShowSpinWheel(true);
    window.addEventListener('open-spin-wheel', handleSpin);

    return () => {
      window.removeEventListener('open-ai-scanner', handleScanner);
      window.removeEventListener('open-green-certificate', handleCert);
      window.removeEventListener('open-eco-story', handleStory);
      window.removeEventListener('open-upi-payout', handleUpi);
      window.removeEventListener('open-driver-chat', handleChat);
      window.removeEventListener('open-spin-wheel', handleSpin);
    };
  }, []);

  return (
    <>
      {/* 📱 MOBILE VIEW: Exact Native Screen with complete options */}
      <div className="block md:hidden">
        <MobileEcoHome 
          pickups={pickups} 
          analytics={analytics}
          activePickup={activePickup}
          onPickupCreated={(newPickup) => {
            setPickups(prev => [newPickup, ...prev]);
            handlePickupUpdated(newPickup);
          }}
          onOpenScanner={() => setShowAiScanner(true)}
          onOpenUpi={() => setShowUpiPayout(true)}
          onOpenCert={() => setShowGreenCert(true)}
          onOpenStory={() => setShowEcoStory(true)}
          onOpenChat={() => setShowDriverChat(true)}
          onOpenSpin={() => setShowSpinWheel(true)}
          streakDays={streakDays}
          streakClaimed={streakClaimed}
          onClaimStreak={handleClaimStreak}
          todayFormattedName={todayFormattedName}
          todayFormattedDate={todayFormattedDate}
          weekDays={weekDays}
          quests={quests}
          onCompleteQuest={handleCompleteQuest}
          treeStage={treeStage}
          totalKgNumber={totalKgNumber}
          calcCategory={calcCategory}
          setCalcCategory={setCalcCategory}
          calcWeight={calcWeight}
          setCalcWeight={setCalcWeight}
          SCRAP_RATES={SCRAP_RATES}
          SEGREGATION_ITEMS={SEGREGATION_ITEMS}
          selectedSegKey={selectedSegKey}
          setSelectedSegKey={setSelectedSegKey}
        />
      </div>

      {/* 💻 DESKTOP WORKSPACE VIEW */}
      <div className="hidden md:block">
        <UserLayout>
          <div className="space-y-6 w-full pb-8">
        
        {/* Modern Executive Hero White Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 text-slate-900 shadow-sm">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Greeting & Status */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-0.5 shadow-md shadow-emerald-500/20">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center text-3xl">
                    🌱
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-white shadow-xs">
                  LVL 4
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome back, {user?.name ? user.name.split(' ')[0] : 'Citizen'}! 👋
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-500/30">
                    Eco Guardian
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-xl">
                  Turn household scrap into verified environmental impact & instant rewards.
                </p>

                {/* Ambient Real-time Chennai Air Quality Strip */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {currentDistrict?.name || 'Coimbatore'} Live AQI: <span className="text-emerald-600 font-black">54 • Good & Clean Air 🍃</span> (29°C Pleasant)
                  </span>
                </div>
              </div>
            </div>

            {/* High-Contrast Primary CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/schedule-pickup')}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <FaCalendarPlus className="h-4 w-4" />
                <span>Schedule Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAiScanner(true)}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-black text-xs border border-slate-300 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
              >
                <FaCamera className="h-4 w-4 text-emerald-600" />
                <span>AI Waste Scanner</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic(30);
                  setShowEcoStory(true);
                }}
                className="flex-1 sm:flex-initial px-4 py-3 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-black text-xs border border-teal-200 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                title="Generate 9:16 Instagram & WhatsApp Story Card"
              >
                <FaLeaf className="h-4 w-4 text-teal-600" />
                <span>Eco Story</span>
              </motion.button>
            </div>

          </div>
        </div>

        {/* Live Uber/Swiggy-Style Doorstep Pickup Tracker */}
        <LiveUberPickupTracker 
          pickup={activePickup}
          onOpenChat={() => setShowDriverChat(true)}
        />

        {/* Dynamic 4-Metric Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Wallet Balance & EcoPoints */}
          <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 shadow-md dark:shadow-emerald-950/20 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-emerald-400/80">
                EcoPoints Balance
              </span>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base border border-emerald-500/20 group-hover:scale-110 transition-transform shadow-xs">
                <FaCoins />
              </div>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {currentPoints}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">pts</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                ≈ ₹{inrEquivalent} direct bank / UPI cash value
              </span>
            </div>
            <button
              onClick={() => setShowUpiPayout(true)}
              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl border border-emerald-500/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FaWallet className="text-xs" />
              <span>Redeem UPI Cash</span>
            </button>
          </div>

          {/* Card 2: Active Pickup & Status */}
          <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 shadow-md dark:shadow-emerald-950/20 flex flex-col justify-between space-y-4 hover:border-sky-500/40 hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-sky-400/80">
                Active Doorstep Pickup
              </span>
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-base border border-sky-500/20 group-hover:scale-110 transition-transform shadow-xs">
                <FaTruck />
              </div>
            </div>
            {activePickup ? (
              <>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-base font-black text-slate-900 dark:text-white truncate">
                      {activePickup.driver?.user?.name || 'Driver Assigned'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                    {activePickup.driver?.vehicleNumber || 'Vehicle Assigned'} • Status: {activePickup.status}
                  </span>
                </div>
                <Link
                  to="/my-pickups"
                  className="flex items-center justify-between py-2 px-3 bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-extrabold text-xs rounded-xl border border-sky-500/20 transition cursor-pointer"
                >
                  <span className="flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="capitalize">{activePickup.status} • Track Live →</span>
                  </span>
                  {activePickup.otpCode && (
                    <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">OTP: {activePickup.otpCode}</span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                      No Active Pickup
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                    Ready to recycle scrap & earn rewards?
                  </span>
                </div>
                <Link
                  to="/schedule-pickup"
                  className="w-full py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-black text-xs rounded-xl border border-sky-500/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <FaCalendarPlus className="text-xs" />
                  <span>Schedule Pickup</span>
                </Link>
              </>
            )}
          </div>

          {/* Card 3: Carbon Diverted & Monthly Target */}
          <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 shadow-md dark:shadow-emerald-950/20 flex flex-col justify-between space-y-4 hover:border-teal-500/40 hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-teal-400/80">
                Carbon Diverted
              </span>
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center text-base border border-teal-500/20 group-hover:scale-110 transition-transform shadow-xs">
                <FaLeaf />
              </div>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {analytics?.co2Reduced || '35.3'}
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">kg CO₂</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                  <span>Goal: 40 kg</span>
                  <span className="text-emerald-500 font-black">71% Reached</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
            </div>
            <Link 
              to="/redeem"
              className="flex items-center justify-between py-2 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-extrabold text-xs rounded-xl border border-teal-500/20 transition cursor-pointer"
            >
              <span className="truncate">Reward Goal</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300">
                11.5 kg to ₹250 Voucher →
              </span>
            </Link>
          </div>

          {/* Card 4: Total Waste Recycled & Certificate */}
          <div className="p-5 rounded-3xl bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 shadow-md dark:shadow-emerald-950/20 flex flex-col justify-between space-y-4 hover:border-amber-500/40 hover:-translate-y-0.5 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-amber-400/80">
                Total Recycled
              </span>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-base border border-amber-500/20 group-hover:scale-110 transition-transform shadow-xs">
                <FaAward />
              </div>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {analytics?.totalRecycledKg || 0}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">kg diverted</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                Across {analytics?.completedCount || 0} verified door collections
              </span>
            </div>
            <button
              onClick={() => setShowGreenCert(true)}
              className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs rounded-xl border border-amber-500/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <FaAward className="text-xs" />
              <span>Official Green Certificate</span>
            </button>
          </div>

        </div>

        {/* 2-Column Balanced Core Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Active Telematics & Scrap Market Estimator (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Doorstep Telematics Tracking Card or Empty State */}
            {activePickup ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg border border-emerald-500/20">
                      <FaRoute />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                          Live Doorstep Telematics
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[9px] font-black uppercase tracking-wider flex items-center space-x-1 border border-emerald-500/30">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>GPS Live</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Real-time EV coordinates & doorstep arrival tracking
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowDriverChat(true)}
                      className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    >
                      <FaComments className="text-xs" />
                      <span>Chat</span>
                    </button>
                    {activePickup?.driver?.user?.phone && (
                      <a
                        href={`tel:${activePickup.driver.user.phone}`}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      >
                        <FaPhone className="text-xs text-emerald-600" />
                        <span>Call Driver</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Map View */}
                <div className="relative h-[280px] sm:h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                  <GoogleRouteMap 
                    driverName={activePickup?.driver?.user?.name || 'Assigned Driver'} 
                    vehicleNumber={activePickup?.driver?.vehicleNumber || 'EV Collection Vehicle'}
                    pickupAddress={activePickup?.address?.street ? `${activePickup.address.street}, ${activePickup.address.city || ''}` : 'Scheduled Address'}
                    height="100%"
                  />

                  {/* Floating Telematics Pill */}
                  <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-white shadow-lg flex items-center space-x-2 text-xs pointer-events-none">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-[11px]">{activePickup.driver?.vehicleNumber || 'EV Green Fleet'} • Status: {activePickup.status}</span>
                  </div>
                </div>

                {/* Connected Milestone Stepper */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/70 dark:border-slate-800">
                  <div className="relative grid grid-cols-4 gap-2">
                    <div className="absolute top-3 left-8 right-8 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0 hidden sm:block"></div>
                    <div className="absolute top-3 left-8 w-[62%] h-0.5 bg-emerald-500 -z-0 hidden sm:block"></div>

                    <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </div>
                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">1. Booked</span>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-black shadow-sm ${activePickup.status !== 'pending' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        {activePickup.status !== 'pending' ? '✓' : '2'}
                      </div>
                      <span className={`text-[11px] font-black ${activePickup.status !== 'pending' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>2. Assigned</span>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                      <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-black shadow-md ${activePickup.status === 'in_transit' || activePickup.status === 'accepted' ? 'bg-amber-500 ring-4 ring-amber-500/20 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                        3
                      </div>
                      <span className={`text-[11px] font-black ${activePickup.status === 'in_transit' || activePickup.status === 'accepted' ? 'text-amber-500' : 'text-slate-400'}`}>3. En Route</span>
                    </div>

                    <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-black">
                        4
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">4. Paid</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl mx-auto border border-emerald-500/20">
                  <FaTruck />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">
                    No Active Pickups Scheduled
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">
                    Turn your recyclable paper, plastics, and scrap into instant EcoPoints & cash. Schedule a doorstep pickup anytime!
                  </p>
                </div>
                <button
                  onClick={() => navigate('/schedule-pickup')}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition cursor-pointer"
                >
                  <FaCalendarPlus className="h-4 w-4" />
                  <span>Book Doorstep Pickup</span>
                </button>
              </div>
            )}

            {/* Smart Scrap Value Estimator & Live Rates */}
            <div className="bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-emerald-950/20 space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-lg border border-teal-500/20">
                    <FaCalculator />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                      Live Scrap Buyback Calculator
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Real-time market rates across Chennai & Tamil Nadu recycling centers
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Live Rates
                </span>
              </div>

              {/* Scrap Category Selector Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {Object.entries(SCRAP_RATES).map(([key, item]) => {
                  const isSelected = calcCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCalcCategory(key)}
                      className={`p-2.5 rounded-2xl border text-left transition-all relative cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          ₹{item.ratePerKg}/kg
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold block mt-0.5">
                        +{item.ptsPerKg} Pts/kg
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slider & Instant Calculation */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="w-full sm:w-1/2 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Estimated Weight:
                    </span>
                    <span className="text-xs font-black px-2.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/30">
                      {calcWeight} kg
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="2"
                    max="100"
                    step="1"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400">
                    <span>2 kg (Min)</span>
                    <span>25 kg</span>
                    <span>50 kg</span>
                    <span>100 kg (Bulk)</span>
                  </div>
                </div>

                <div className="w-full sm:w-1/2 flex items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-sm">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                      Estimated Payout
                    </span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{calcWeight * SCRAP_RATES[calcCategory].ratePerKg}
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        +{(calcWeight * SCRAP_RATES[calcCategory].ptsPerKg)} Pts
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/schedule-pickup?category=${calcCategory}&weight=${calcWeight}`)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Sell Scrap</span>
                    <FaArrowRight className="text-[10px]" />
                  </motion.button>
                </div>
              </div>

            </div>

            {/* 4-Bin Waste Segregation Protocol Guide (Moved to Left Column for Perfect Height Balance) */}
            <div className="bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg border border-emerald-500/20">
                    <FaTrashAlt />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">
                      4-Bin Segregation Guide
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Official Tamil Nadu Solid Waste Management Protocol
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  Standard Protocol
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.values(SEGREGATION_ITEMS).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSegKey(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border cursor-pointer ${
                      selectedSegKey === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/30'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              {SEGREGATION_ITEMS[selectedSegKey] && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {SEGREGATION_ITEMS[selectedSegKey].binName}
                    </span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      {SEGREGATION_ITEMS[selectedSegKey].reward}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {SEGREGATION_ITEMS[selectedSegKey].instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity Feed (Balanced in Left Column) */}
            <div className="bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-emerald-950/20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-lg border border-teal-500/20">
                    <FaClock />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider">
                      Recent Activity & History
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Your latest waste diversion logs & transactions
                    </p>
                  </div>
                </div>
                <Link to="/my-pickups" className="text-xs font-black text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center space-x-1">
                  <span>View All Pickups</span>
                  <FaArrowRight className="text-[10px]" />
                </Link>
              </div>

              <div className="space-y-2.5 text-xs">
                {pickups && pickups.length > 0 ? (
                  pickups.slice(0, 3).map((p, idx) => (
                    <Link
                      key={p._id || idx}
                      to="/my-pickups"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-500/5 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 transition group cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm group-hover:scale-110 transition-transform">
                          <FaTruck />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs capitalize">
                            {p.wasteType || 'Scrap Material'} Collection
                          </p>
                          <span className="text-[11px] text-slate-400">
                            {p.estimatedWeight || 5} kg • {new Date(p.pickupDate || p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full capitalize ${
                          p.status === 'completed' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'completed' && (
                          <span className="block text-[11px] font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            +{p.pointsAwarded || 50} pts
                          </span>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <>
                    <Link
                      to="/my-pickups"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-500/5 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm">
                          <FaCheckCircle />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Pickup Verified & Weighed</p>
                          <span className="text-[11px] text-slate-400">12.5 kg Dry Waste • Verified</span>
                        </div>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">+45 pts</span>
                    </Link>

                    <Link
                      to="/schedule-pickup"
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-sky-500/5 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-800 transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-sm">
                          <FaTruck />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">Doorstep Recycling Fleet</p>
                          <span className="text-[11px] text-slate-400">EV fleet available in your ward</span>
                        </div>
                      </div>
                      <span className="font-black text-sky-600 dark:text-sky-400 text-xs">Book Now →</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Green Streak, Quests & Equivalencies (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dynamic Virtual Tree Growth & Impact Progression Widget */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden text-slate-900">
              
              {/* Background ambient lighting */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-500/30 text-emerald-600 flex items-center justify-center text-lg shadow-xs">
                    <FaSeedling className="animate-bounce" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 text-sm sm:text-base">
                        {t('plantTree') || 'Virtual Tree Growth'}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-500/30">
                        {treeStage.stageTag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Grows with every kilogram you recycle
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerHaptic(30);
                    setShowEcoStory(true);
                  }}
                  className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[11px] font-black border border-slate-200 transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <FaShareAlt className="text-[10px] text-emerald-600" />
                  <span>Story</span>
                </button>
              </div>

              {/* Center Interactive Tree Canvas */}
              <div className="relative z-10 my-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                
                {/* SVG Tree Stage Graphic */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {/* Ground Mound */}
                    <ellipse cx="50" cy="88" rx="38" ry="8" fill="#14532d" opacity="0.4" />
                    <ellipse cx="50" cy="86" rx="28" ry="6" fill="#166534" />
                    
                    {treeStage.level === 1 && (
                      <g className="animate-pulse">
                        <path d="M50 86 Q49 70 50 62" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" />
                        <path d="M50 62 Q38 52 42 42 Q50 50 50 62" fill="#34d399" />
                        <path d="M50 62 Q62 52 58 42 Q50 50 50 62" fill="#10b981" />
                      </g>
                    )}

                    {treeStage.level === 2 && (
                      <g>
                        <path d="M50 86 Q48 64 50 50" stroke="#059669" strokeWidth="4" strokeLinecap="round" fill="none" />
                        <path d="M50 65 Q35 55 38 42 Q48 52 50 65" fill="#34d399" />
                        <path d="M50 60 Q65 50 62 38 Q52 48 50 60" fill="#10b981" />
                        <circle cx="50" cy="46" r="10" fill="#059669" />
                        <circle cx="50" cy="42" r="7" fill="#34d399" />
                      </g>
                    )}

                    {treeStage.level >= 3 && (
                      <g>
                        <path d="M50 86 L48 56 L44 48 M50 64 L56 50" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
                        <circle cx="42" cy="40" r="15" fill="#059669" opacity="0.9" />
                        <circle cx="58" cy="40" r="15" fill="#10b981" opacity="0.9" />
                        <circle cx="50" cy="30" r="18" fill="#34d399" />
                        <circle cx="50" cy="26" r="12" fill="#6ee7b7" opacity="0.7" />
                        {treeStage.level >= 4 && (
                          <>
                            <circle cx="40" cy="32" r="3" fill="#f59e0b" />
                            <circle cx="58" cy="34" r="3" fill="#f59e0b" />
                            <circle cx="48" cy="22" r="2.5" fill="#f59e0b" />
                          </>
                        )}
                      </g>
                    )}
                  </svg>
                </div>

                {/* Tree Metrics & Level Description */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <span className="text-lg">{treeStage.icon}</span>
                    <h4 className="text-sm font-black text-slate-900">{treeStage.name}</h4>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                    {treeStage.level === 5 
                      ? 'Congratulations! You have reached maximum tree maturity and diverted hundreds of kilograms.'
                      : `Recycle ${treeStage.remaining} kg more waste to evolve your tree to the next maturity rank.`}
                  </p>

                  {/* Growth Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-600">
                      <span>Maturity Progress</span>
                      <span className="text-emerald-700 font-black">{treeStage.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-xs" 
                        style={{ width: `${treeStage.pct}%` }}
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Mini quick nudge */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Total Diverted: <strong className="text-slate-900 font-black">{totalKgNumber} kg</strong></span>
                <button
                  onClick={() => navigate('/schedule-pickup')}
                  className="font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Water Tree with Scrap</span>
                  <FaChevronRight className="text-[9px]" />
                </button>
              </div>

            </div>

            {/* Daily Green Streak & Quests */}
            <div className="bg-white/95 dark:bg-[#0c1822]/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-500/20 rounded-3xl p-5 sm:p-6 shadow-md dark:shadow-emerald-950/20 space-y-5">
              
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-orange-500 flex items-center justify-center text-lg border border-orange-500/30 shadow-inner">
                    <FaFire className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {streakDays}-Day Green Streak
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
                        {todayFormattedName} 🔥
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Today: <strong className="text-emerald-600 dark:text-emerald-400">{todayFormattedName}, {todayFormattedDate}</strong>
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleClaimStreak}
                  disabled={streakClaimed}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    streakClaimed 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default border border-slate-200 dark:border-slate-700' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-md shadow-orange-500/20'
                  }`}
                >
                  {streakClaimed ? 'Claimed ✓' : 'Claim +10 Pts'}
                </motion.button>
              </div>

              {/* Dynamic 7-Day Visual Track with Real Dates */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                  <span>Week of {weekDays[0]?.dateNum} – {weekDays[6]?.dateNum} {todayFormattedDate.split(' ')[1]}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Today is {todayFormattedName}</span>
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                  {weekDays.map((day, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-center border transition-all ${
                        day.isToday
                          ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 font-black bg-emerald-500/10 border-emerald-500/40 shadow-sm'
                          : day.isDone
                          ? 'bg-gradient-to-b from-emerald-500/15 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-black">{day.label}</span>
                      <span className="text-[9px] font-mono font-bold opacity-75">{day.dateNum}</span>
                      <span className="text-xs mt-1">
                        {day.isDone ? '🔥' : day.isToday ? (streakClaimed ? '🔥' : '⚡') : '⚪'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Missions */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <span>Daily Missions</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black">
                      {Math.round((quests.filter(q => q.completed).length / quests.length) * 100)}% Complete
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {quests.filter(q => q.completed).length}/{quests.length} Done
                  </span>
                </div>

                <div className="space-y-2">
                  {quests.map((q) => (
                    <div
                      key={q.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        q.completed
                          ? 'bg-emerald-500/5 border-emerald-500/25'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-sm shadow-xs border border-slate-200/60 dark:border-slate-700 shrink-0">
                          {q.icon}
                        </div>
                        <div className="min-w-0">
                          <span className={`text-xs font-black block truncate ${q.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                            {q.title}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                            +{q.points} EcoPoints
                          </span>
                        </div>
                      </div>

                      {q.completed ? (
                        <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm">
                          <FaCheck />
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteQuest(q)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-xl shadow-xs transition shrink-0 cursor-pointer active:scale-95"
                        >
                          Start
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Real-World Impact Equivalencies */}
            <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-3xl shadow-sm text-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm border border-emerald-500/30 shadow-xs">
                    <FaLeaf />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Real-World Equivalencies</h3>
                    <p className="text-[10px] text-slate-500">From your 35.3 kg CO₂ reduction</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-500/30">
                  Net Positive
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-sky-600 text-xs mb-1">
                    <FaCarSide />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Car Travel</span>
                  </div>
                  <span className="text-base font-black text-slate-900 block">145 km</span>
                  <span className="text-[9px] text-slate-400">Gasoline offset</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-lime-600 text-xs mb-1">
                    <FaSeedling />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Saplings</span>
                  </div>
                  <span className="text-base font-black text-slate-900 block">2.8 Trees</span>
                  <span className="text-[9px] text-slate-400">Nurtured 1 yr</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-amber-600 text-xs mb-1">
                    <FaLightbulb />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Clean Power</span>
                  </div>
                  <span className="text-base font-black text-slate-900 block">230 hrs</span>
                  <span className="text-[9px] text-slate-400">LED power saved</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center space-x-1.5 text-teal-600 text-xs mb-1">
                    <FaWater />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Fresh Water</span>
                  </div>
                  <span className="text-base font-black text-slate-900 block">988 L</span>
                  <span className="text-[9px] text-slate-400">Conserved</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* AI Scanner Modal */}
      <AIWasteScannerModal 
        isOpen={showAiScanner} 
        onClose={() => setShowAiScanner(false)} 
        onApplyScannedData={(data) => {
          window.location.href = `/schedule-pickup?category=${data.category}&weight=${data.estimatedWeight}`;
        }}
      />

      {/* Citizen <-> Driver Live Chat Modal */}
      <DriverChatModal
        isOpen={showDriverChat}
        onClose={() => setShowDriverChat(false)}
        pickupId={activePickup?._id}
        recipientName={activePickup?.driver?.user?.name || 'Driver Karthik Raja'}
        recipientRole="driver"
      />

      {/* Official Green Citizen Certificate Modal */}
      <GreenCertificateModal
        isOpen={showGreenCert}
        onClose={() => setShowGreenCert(false)}
        totalWeight={analytics?.totalRecycledKg || 0}
        totalCO2={analytics?.co2Reduced || 0}
        points={currentPoints}
      />

      {/* Instant UPI Bank Payout Modal */}
      <UPIPayoutModal
        isOpen={showUpiPayout}
        onClose={() => setShowUpiPayout(false)}
        userPoints={currentPoints}
        onPayoutSuccess={(updatedPts) => {
          setAnalytics(prev => prev ? ({ ...prev, walletPoints: updatedPts }) : prev);
        }}
      />

      {/* Shareable 9:16 Instagram & WhatsApp Story Modal */}
      <EcoStoryModal
        isOpen={showEcoStory}
        onClose={() => setShowEcoStory(false)}
        user={user}
        stats={analytics}
      />

      {/* Daily Spin & Win Wheel Modal */}
      <DailySpinWheelModal
        isOpen={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onRewardWon={(pts) => {
          setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + pts }) : prev);
        }}
      />

        </UserLayout>
      </div>
    </>
  );
};

export default UserDashboard;
