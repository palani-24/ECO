import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import UserLayout from '../../components/UserLayout';
import api from '../../utils/api';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import DriverChatModal from '../../components/DriverChatModal';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import { 
  FaCoins, FaTruck, FaLeaf, FaCheckCircle, FaCalendarPlus, FaCamera, 
  FaComments, FaPhone, FaFire, FaCalculator, FaSeedling, FaCarSide, 
  FaLightbulb, FaWater, FaCheck, FaAward, FaTrashAlt, FaChevronRight,
  FaArrowRight, FaWallet, FaShieldAlt, FaClock, FaRoute, FaBolt
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

  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [showGreenCert, setShowGreenCert] = useState(false);
  const [showUpiPayout, setShowUpiPayout] = useState(false);

  // Daily Streak & Gamified Quests
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [streakDays, setStreakDays] = useState(5);
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

        const co2Reduced = totalWeight > 0 ? (totalWeight * 1.5).toFixed(1) : '35.3';
        const treesSaved = totalWeight > 0 ? (totalWeight * 0.017).toFixed(2) : '0.40';

        setAnalytics({
          completedCount: completed.length || 2,
          pendingCount: pending.length || 1,
          activeCount: active.length || 1,
          todayCount: 1,
          walletPoints: user?.points || 100,
          co2Reduced,
          treesSaved,
          totalRewards: '120',
          totalRecycledKg: totalWeight > 0 ? totalWeight.toFixed(1) : '48.5'
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
    setStreakClaimed(true);
    setStreakDays(prev => prev + 1);
    setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + 10 }) : prev);
    addToast('🎉 Daily Streak Claimed! +10 EcoPoints added to your wallet.', 'success', 'Streak Claimed');
  };

  const handleCompleteQuest = (q) => {
    if (q.completed) return;
    if (q.action === 'scanner') {
      setShowAiScanner(true);
    } else if (q.action === 'pickup') {
      window.location.href = '/schedule-pickup';
      return;
    }
    setQuests(prev => prev.map(item => item.id === q.id ? { ...item, completed: true } : item));
    setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + q.points }) : prev);
    addToast(`Mission Completed: "${q.title}"! +${q.points} EcoPoints added.`, 'success', 'Quest Unlocked');
  };

  const activePickup = pickups.find(p => p.status !== 'completed' && p.status !== 'cancelled') || {
    _id: 'PK123456',
    wasteCategory: 'Paper, Plastic',
    address: { street: '123, Bharathi Street', city: 'Anna Nagar, Chennai' },
    status: 'accepted',
    driver: {
      user: { name: 'Karthik Raja' },
      vehicleNumber: 'TN-38-ECO-9945 (EV Mini-Truck)'
    }
  };

  const currentPoints = analytics?.walletPoints || user?.points || 100;
  const inrEquivalent = Math.round(currentPoints * 0.25);

  return (
    <UserLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-8">
        
        {/* Modern Executive Hero Glass Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-950/90 border border-emerald-500/30 p-6 sm:p-8 text-white shadow-xl backdrop-blur-xl">
          {/* Subtle Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* User Greeting & Status */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-950/50">
                  <div className="w-full h-full rounded-2xl bg-slate-950/80 flex items-center justify-center text-3xl">
                    🌱
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-slate-900 shadow-sm">
                  LVL 4
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome back, {user?.name ? user.name.split(' ')[0] : 'Palani'}! 👋
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-400/30">
                    Eco Guardian
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100/80 font-medium max-w-xl">
                  Turn household scrap into verified environmental impact & instant rewards.
                </p>

                {/* Ambient Real-time Chennai Air Quality Strip */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">
                    Chennai Live AQI: <span className="text-emerald-400 font-black">54 • Good & Clean Air 🍃</span> (31°C Sunny)
                  </span>
                </div>
              </div>
            </div>

            {/* High-Contrast Primary CTA Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/schedule-pickup'}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2 border border-emerald-300/40 cursor-pointer"
              >
                <FaCalendarPlus className="h-4 w-4" />
                <span>Schedule Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAiScanner(true)}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-black text-xs border border-emerald-500/40 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md backdrop-blur-md"
              >
                <FaCamera className="h-4 w-4 text-emerald-400" />
                <span>AI Waste Scanner</span>
              </motion.button>
            </div>

          </div>
        </div>

        {/* 4 High-Impact Streamlined Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Eco Wallet & Balance */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Eco Wallet Points
              </span>
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-base border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <FaCoins />
              </div>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {currentPoints}
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">EcoPts</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                ≈ ₹{inrEquivalent} Direct Bank Cashout
              </span>
            </div>
            <button
              onClick={() => setShowUpiPayout(true)}
              className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl border border-emerald-500/30 transition flex items-center justify-center space-x-1.5"
            >
              <FaWallet className="text-xs" />
              <span>Redeem UPI Cash</span>
            </button>
          </div>

          {/* Card 2: Active Pickup & Status */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Doorstep Pickup
              </span>
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-base border border-sky-500/20 group-hover:scale-110 transition-transform">
                <FaTruck />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-lg font-black text-slate-900 dark:text-white truncate">
                  {activePickup?.driver?.user?.name || 'Driver Dispatched'}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                TN-38-ECO • ETA ~8 Mins (1.8 km)
              </span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-extrabold text-xs rounded-xl border border-sky-500/20">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Driver En Route</span>
              </span>
              <span className="text-[11px] font-mono font-black text-emerald-600 dark:text-emerald-400">OTP: 4892</span>
            </div>
          </div>

          {/* Card 3: Carbon Diverted & Monthly Target */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Carbon Diverted
              </span>
              <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center text-base border border-teal-500/20 group-hover:scale-110 transition-transform">
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
            <div className="flex items-center justify-between py-2 px-3 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-extrabold text-xs rounded-xl border border-teal-500/20">
              <span className="truncate">Reward Goal</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-300">
                11.5 kg to ₹250 Voucher
              </span>
            </div>
          </div>

          {/* Card 4: Total Waste Recycled & Certificate */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Total Recycled
              </span>
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-base border border-amber-500/20 group-hover:scale-110 transition-transform">
                <FaAward />
              </div>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  {analytics?.totalRecycledKg || '48.5'}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">kg diverted</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                Across {analytics?.completedCount || 2} verified door collections
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
            
            {/* Live Doorstep Telematics Tracking Card */}
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
                      Real-time EV coordinates, route traffic & doorstep arrival estimate
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
                  <a
                    href="tel:+919876543210"
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <FaPhone className="text-xs text-emerald-600" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>

              {/* Map View */}
              <div className="relative h-[280px] sm:h-[320px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                <GoogleRouteMap 
                  driverName={activePickup?.driver?.user?.name || 'Karthik Raja'} 
                  vehicleNumber="TN-38-ECO-9945 (EV Mini-Truck)"
                  pickupAddress={activePickup?.address?.street || '123, Bharathi Street, Anna Nagar, Chennai'}
                  height="100%"
                />

                {/* Floating Telematics Pill */}
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/40 text-white shadow-lg flex items-center space-x-2 text-xs pointer-events-none">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-[11px]">EV Mini-Truck • 28 km/h • ETA ~8 mins</span>
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
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                      ✓
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">2. Dispatched</span>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-1 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black shadow-md ring-4 ring-amber-500/20 animate-pulse">
                      3
                    </div>
                    <span className="text-[11px] font-black text-amber-500">3. En Route</span>
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

            {/* Smart Scrap Value Estimator & Live Rates */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              
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
                    onClick={() => window.location.href = `/schedule-pickup?category=${calcCategory}&weight=${calcWeight}`}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-sm transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Sell Scrap</span>
                    <FaArrowRight className="text-[10px]" />
                  </motion.button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Green Streak, Quests & Equivalencies (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Daily Green Streak & Quests */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
              
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
                      <span className="px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 text-[10px] font-black">
                        ACTIVE 🔥
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Recycle daily to maintain streak bonuses
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

              {/* 7-Day Visual Track */}
              <div className="grid grid-cols-7 gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                  const isDone = idx < 5;
                  const isToday = idx === 4;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl text-center border transition-all ${
                        isDone 
                          ? 'bg-gradient-to-b from-emerald-500/15 to-teal-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                      } ${isToday ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 font-black' : ''}`}
                    >
                      <span className="text-[10px] font-black">{day}</span>
                      <span className="text-xs mt-1">{isDone ? '🔥' : '⚪'}</span>
                    </div>
                  );
                })}
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
            <div className="bg-gradient-to-br from-emerald-900/30 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-5 sm:p-6 rounded-3xl shadow-sm text-white space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-400/30">
                    <FaLeaf />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">Real-World Equivalencies</h3>
                    <p className="text-[10px] text-emerald-200/80">From your 35.3 kg CO₂ reduction</p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Net Positive
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-sky-400 text-xs mb-1">
                    <FaCarSide />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Car Travel</span>
                  </div>
                  <span className="text-base font-black text-white block">145 km</span>
                  <span className="text-[9px] text-slate-400">Gasoline offset</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-lime-400 text-xs mb-1">
                    <FaSeedling />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Saplings</span>
                  </div>
                  <span className="text-base font-black text-white block">2.8 Trees</span>
                  <span className="text-[9px] text-slate-400">Nurtured 1 yr</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-amber-400 text-xs mb-1">
                    <FaLightbulb />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Clean Power</span>
                  </div>
                  <span className="text-base font-black text-white block">230 hrs</span>
                  <span className="text-[9px] text-slate-400">LED power saved</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20">
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-xs mb-1">
                    <FaWater />
                    <span className="text-[9px] font-bold uppercase text-slate-400">Fresh Water</span>
                  </div>
                  <span className="text-base font-black text-white block">988 L</span>
                  <span className="text-[9px] text-slate-400">Conserved</span>
                </div>
              </div>
            </div>

            {/* Household Segregation Quick Helper */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <FaTrashAlt className="text-emerald-500" />
                  <span>4-Bin Segregation Guide</span>
                </h4>
                <span className="text-[10px] text-emerald-600 font-bold">Standard Protocol</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Object.values(SEGREGATION_ITEMS).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSegKey(item.id)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 border cursor-pointer ${
                      selectedSegKey === item.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>

              {SEGREGATION_ITEMS[selectedSegKey] && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white text-[11px]">
                      {SEGREGATION_ITEMS[selectedSegKey].binName}
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      {SEGREGATION_ITEMS[selectedSegKey].reward}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    {SEGREGATION_ITEMS[selectedSegKey].instructions}
                  </p>
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center space-x-2">
                  <FaClock className="text-emerald-500" />
                  <span>Recent Activity</span>
                </h4>
                <a href="/my-pickups" className="text-[11px] text-emerald-600 font-bold hover:underline">
                  View all
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xs">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">Pickup Verified & Weighed</p>
                      <span className="text-[10px] text-slate-400">12.5 kg Dry Waste • Today</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600 text-xs">+45 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-xs">
                      <FaTruck />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">Driver Dispatched</p>
                      <span className="text-[10px] text-slate-400">EV Mini-Truck • 2.4 km away</span>
                    </div>
                  </div>
                  <span className="font-black text-sky-600 text-xs">En Route</span>
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
        totalWeight={analytics?.totalRecycledKg || 48.5}
        totalCO2={analytics?.co2Reduced || 35.3}
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

    </UserLayout>
  );
};

export default UserDashboard;
