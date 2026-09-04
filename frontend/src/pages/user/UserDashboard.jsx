import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import UserLayout from '../../components/UserLayout';
import api from '../../utils/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import QRPassModal from '../../components/QRPassModal';
import EcoCertificateModal from '../../components/EcoCertificateModal';
import GreenCertificateModal from '../../components/GreenCertificateModal';
import RecyclingJourneyModal from '../../components/RecyclingJourneyModal';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import DriverChatModal from '../../components/DriverChatModal';
import LeaderboardWidget from '../../components/LeaderboardWidget';
import PlantTreeModal from '../../components/PlantTreeModal';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import SmartKioskLocatorModal from '../../components/SmartKioskLocatorModal';
import { 
  FaCoins, FaCheckDouble, FaHourglassHalf, FaGift, FaCalendarCheck, FaUserCircle, 
  FaCompass, FaMapPin, FaPaperPlane, FaLeaf, FaTree, FaTint, FaBolt, FaTruck, 
  FaQrcode, FaAward, FaCamera, FaRoute, FaComments, FaPhoneAlt, FaPhone, FaExpand, FaClock, FaSearch, FaBell,
  FaCalendarPlus, FaArrowRight, FaCheckCircle, FaRupeeSign, FaChartBar, FaExclamationTriangle, FaRecycle,
  FaFire, FaCalculator, FaSeedling, FaCarSide, FaLightbulb, FaWater, FaMapMarkedAlt, FaExchangeAlt, FaShieldAlt, 
  FaInfoCircle, FaCheck, FaChevronRight, FaBullhorn, FaTrophy, FaMedal, FaCopy, FaShareAlt, FaWhatsapp, FaUsers, 
  FaTrashAlt, FaTimes, FaBullseye, FaFilter
} from 'react-icons/fa';

const UserDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDriver, setTrackingDriver] = useState(null);
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [showGreenCert, setShowGreenCert] = useState(false);
  const [showJourney, setShowJourney] = useState(false);
  const [showPlantTree, setShowPlantTree] = useState(false);
  const [showUpiPayout, setShowUpiPayout] = useState(false);
  const [showKiosks, setShowKiosks] = useState(false);

  // Tab Filter State
  const [activeTab, setActiveTab] = useState('all');
  const [showDriveBanner, setShowDriveBanner] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Smart 4-Bin Segregation Guide State
  const [selectedSegKey, setSelectedSegKey] = useState('plastic_bottle');
  const [segFilterCategory, setSegFilterCategory] = useState('all');

  // Daily Streak & Gamified Quests State
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

  const SCRAP_RATES = {
    plastics: { name: 'PET Bottles & Plastics', ratePerKg: 18, ptsPerKg: 3, icon: '🧴', badge: 'High Demand', estBonus: '+3 Pts/kg' },
    cardboard: { name: 'Cardboard & Paper', ratePerKg: 14, ptsPerKg: 2, icon: '📦', badge: 'Popular', estBonus: '+2 Pts/kg' },
    metals: { name: 'Metals & Tin Cans', ratePerKg: 34, ptsPerKg: 5, icon: '🥫', badge: 'Top Cash', estBonus: '+5 Pts/kg' },
    ewaste: { name: 'E-Waste & Electronics', ratePerKg: 48, ptsPerKg: 10, icon: '💻', badge: 'Bonus Incentive', estBonus: '+10 Pts/kg' },
    glass: { name: 'Glass Containers', ratePerKg: 6, ptsPerKg: 1, icon: '🍾', badge: 'Eco Classic', estBonus: '+1 Pts/kg' }
  };

  const SEGREGATION_ITEMS = {
    plastic_bottle: {
      id: 'plastic_bottle',
      name: 'PET Beverage Bottle',
      binColor: 'blue',
      binName: 'Blue Bin (Dry Recyclables)',
      icon: '🧴',
      tag: 'Dry Waste',
      instructions: 'Empty leftover liquid, rinse briefly, crush flat to conserve space, and replace cap.',
      impact: '450 years saved from landfill; recycled into green polyester fabric & new bottles.',
      reward: '+18 ₹/kg • +3 EcoPts'
    },
    food_peels: {
      id: 'food_peels',
      name: 'Vegetable & Fruit Peels',
      binColor: 'green',
      binName: 'Green Bin (Wet / Compost)',
      icon: '🥬',
      tag: 'Wet Waste',
      instructions: 'Keep separate from plastic carry bags. Delivered directly to community aerobic compost pits.',
      impact: 'Decomposes in 21 days into organic nitrogen-rich humus for terrace gardens.',
      reward: '+10 EcoPts/drop'
    },
    used_battery: {
      id: 'used_battery',
      name: 'AA / Lithium Cells',
      binColor: 'red',
      binName: 'Red Bin (Domestic Hazardous)',
      icon: '🔋',
      tag: 'Hazardous',
      instructions: 'CRITICAL: Place tape over both battery poles to eliminate short-circuit fire risks.',
      impact: 'Prevents Lead & Cadmium poisoning of Chennai groundwater reservoirs.',
      reward: '+20 EcoPts/item • 2X Monsoon Drive'
    },
    cardboard: {
      id: 'cardboard',
      name: 'E-Commerce Delivery Box',
      binColor: 'blue',
      binName: 'Blue Bin (Dry Recyclables)',
      icon: '📦',
      tag: 'Dry Waste',
      instructions: 'Flatten carton boxes, remove packaging tape strips, and bundle flat.',
      impact: 'Saves 17 mature trees and 7,000 gallons of water per ton of recycled paper.',
      reward: '+14 ₹/kg • +2 EcoPts'
    },
    glass_jar: {
      id: 'glass_jar',
      name: 'Glass Food & Jam Jar',
      binColor: 'blue',
      binName: 'Blue Bin (Dry Recyclables)',
      icon: '🍾',
      tag: 'Dry Waste',
      instructions: 'Rinse with water. Keep metal/plastic caps separate. Drivers handle with safety gloves.',
      impact: '100% indefinitely recyclable without any structural or purity loss.',
      reward: '+6 ₹/kg • +1 EcoPts'
    },
    sanitary_pad: {
      id: 'sanitary_pad',
      name: 'Sanitary Napkins & Wipes',
      binColor: 'yellow',
      binName: 'Yellow Bin (Sanitary Residual)',
      icon: '🩹',
      tag: 'Sanitary',
      instructions: 'Wrap tightly in discarded newspaper marked with a red cross for safe sanitation worker handling.',
      impact: 'Sent directly to high-temperature scientific non-polluting incinerators.',
      reward: 'Safe Doorstep Hygiene Disposal'
    }
  };

  const citizenBadges = [
    { id: 'b1', name: 'Zero Waste Pioneer', level: 'Lvl 3', unlocked: true, icon: '🌱', desc: 'Diverted 50+ kg from municipal landfills', bonus: '+100 Pts' },
    { id: 'b2', name: 'Forest Guardian', level: 'Unlocked', unlocked: true, icon: '🌳', desc: 'Planted 1 geo-tagged native tree', bonus: '+250 Pts' },
    { id: 'b3', name: 'Plastic Buster', level: 'Lvl 2 (75%)', unlocked: false, progress: 75, icon: '🧴', desc: '22/30 kg plastics recycled', bonus: '+150 Pts' },
    { id: 'b4', name: 'Neighborhood Star', level: 'Top 5%', unlocked: true, icon: '👑', desc: 'Ranked #3 in Anna Nagar Zone', bonus: '+200 Pts' },
    { id: 'b5', name: 'E-Waste Slayer', level: 'Lvl 1 (60%)', unlocked: false, progress: 60, icon: '⚡', desc: '3/5 electronic scrap collections', bonus: '+300 Pts' },
    { id: 'b6', name: 'Carbon Champion', level: 'Lvl 4', unlocked: true, icon: '🌍', desc: 'Prevented 100+ kg CO₂ emissions', bonus: '+500 Pts' },
  ];

  const handleCopyReferral = () => {
    navigator.clipboard.writeText('ECO-PALANI-2026');
    setCopiedReferral(true);
    addToast('🎉 Referral code copied: ECO-PALANI-2026! Share with friends on WhatsApp.', 'success', 'Referral Code Copied');
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  const handleClaimStreak = () => {
    if (streakClaimed) return;
    setStreakClaimed(true);
    setStreakDays(prev => prev + 1);
    setAnalytics(prev => prev ? ({ ...prev, walletPoints: (prev.walletPoints || 0) + 10 }) : prev);
    addToast('🎉 Daily Streak Claimed! +10 EcoPoints added to your wallet.', 'success', 'Daily Streak Claimed');
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
    addToast(`Mission Completed: "${q.title}"! +${q.points} EcoPoints added.`, 'reward', 'Quest Unlocked');
  };

  // Sync Real-Time Socket Pickup Updates
  useEffect(() => {
    const handlePickupUpdated = (data) => {
      const updatedPickup = data.latestPickup || data;
      if (!updatedPickup || !updatedPickup._id) return;
      
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updatedPickup._id);
        if (index !== -1) {
          const newPickups = [...prev];
          newPickups[index] = { ...newPickups[index], ...updatedPickup };
          return newPickups;
        }
        return [updatedPickup, ...prev];
      });

      if (updatedPickup.status === 'completed') {
        const pts = updatedPickup.pointsAwarded || 175;
        addToast(`Pickup Completed Successfully! +${pts} Eco Points Added to Your Wallet.`, 'success', 'Pickup Completed');
      } else if (updatedPickup.status === 'accepted') {
        addToast(`Driver ${updatedPickup.driver?.user?.name || 'Karthik'} accepted your pickup request!`, 'info', 'Driver Assigned');
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
        if (pickupRes.data.success) {
          pickupList = pickupRes.data.data;
          setPickups(pickupList);
        }
        if (transRes.data.success) setTransactions(transRes.data.data.slice(0, 5));

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
          pendingCount: pending.length || 2,
          activeCount: active.length || 3,
          todayCount: 2,
          walletPoints: user?.points || 100,
          co2Reduced: co2Reduced,
          treesSaved: treesSaved,
          totalRewards: '120'
        });
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const activePickup = pickups.find(p => p.status !== 'completed' && p.status !== 'cancelled') || {
    _id: 'PK123456',
    wasteCategory: 'Paper, Plastic',
    address: { street: '123, Bharathi Street', city: 'Anna Nagar, Chennai' },
    status: 'accepted',
    driver: {
      user: { name: 'Karthik M' },
      vehicleNumber: 'TN-38-ECO 2.4 km away'
    }
  };

  const dashboardCards = [
    { title: 'WALLET POINTS', val: `${user?.points || 100}`, icon: FaCoins, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', link: '/redeem' },
    { title: 'TODAY\'S PICKUPS', val: `${analytics?.todayCount || 2}`, icon: FaTruck, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20', link: '/my-pickups' },
    { title: 'ACTIVE REQUESTS', val: `${analytics?.activeCount || 3}`, icon: FaHourglassHalf, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', link: '/my-pickups' },
    { title: 'CO₂ REDUCED', val: `${analytics?.co2Reduced || '35.3'} kg`, icon: FaLeaf, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20', link: '/profile' },
    { title: 'COMPLETED', val: `${analytics?.completedCount || 2}`, icon: FaCheckCircle, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', link: '/my-pickups' },
    { title: 'PENDING', val: `${analytics?.pendingCount || 2}`, icon: FaHourglassHalf, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', link: '/my-pickups' },
    { title: 'TREES SAVED', val: `${analytics?.treesSaved || '0.40'}`, icon: FaTree, color: 'text-lime-500 bg-lime-500/10 border-lime-500/20', link: '/profile' },
    { title: 'TOTAL REWARDS', val: `₹${analytics?.totalRewards || '120'}`, icon: FaGift, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', link: '/redeem' }
  ];

  return (
    <UserLayout>
        
          {/* Reduced Height Compact Welcome Card with 3D Eco-Level Avatar */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-400/30">
            {/* Background Glow Aura */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center space-x-4 z-10">
              {/* Animated Eco Avatar Level Badge */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900/60 p-1 border-2 border-emerald-300 shadow-lg relative flex items-center justify-center">
                  <span className="text-2xl sm:text-3xl">🌱</span>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full border border-white shadow">
                    LVL 4
                  </div>
                </div>
                {/* SVG Progress Ring */}
                <svg className="absolute top-0 left-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 36 36">
                  <path
                    className="text-emerald-950/40"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-300 stroke-current animate-pulse"
                    strokeDasharray="75, 100"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Welcome back, {user?.name ? user.name.split(' ')[0] : 'Palani'}! 👋
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    Eco Guardian
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium max-w-md leading-relaxed">
                  Together we make the environment better. Schedule pickups and turn household waste into rewards.
                </p>
              </div>
            </div>
            
            {/* Larger, Glowing, High-Contrast Book a Pickup Button */}
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(52, 211, 153, 0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/schedule-pickup'}
              className="z-10 px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all flex items-center space-x-2 flex-shrink-0 animate-bounce-short border border-emerald-200"
            >
              <FaCalendarPlus className="h-4 w-4" />
              <span>Book a Pickup</span>
            </motion.button>
          </div>

          {/* Special Monsoon E-Waste Collection Drive Announcement Banner */}
          {showDriveBanner && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-emerald-500/15 border border-amber-500/30 p-4 rounded-3xl shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center space-x-3 z-10">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center text-lg shrink-0 border border-amber-500/40">
                  <FaBullhorn className="animate-bounce-short" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      Monsoon Special E-Waste Collection Drive ⚡
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                      2X EcoPoints
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Dispose old electronics, chargers & batteries safely this week. Free doorstep pickup across Chennai & Tamil Nadu!
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 z-10 shrink-0 self-end sm:self-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/schedule-pickup?category=ewaste'}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition"
                >
                  Book Drive Pickup →
                </motion.button>
                <button 
                  onClick={() => setShowDriveBanner(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                  title="Dismiss banner"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Category Navigation Tabs Bar */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: '🌟 All Overview' },
              { id: 'rates', label: '💰 Scrap Calculator' },
              { id: 'quests', label: '🎯 Quests & Badges' },
              { id: 'segregation', label: '🗑️ 4-Bin Segregation' },
              { id: 'tracking', label: '📍 Live GPS Tracking' },
              { id: 'referrals', label: '🤝 Referrals & Community' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Ambient Real-time Chennai Air Quality & Eco Health Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-gradient-to-r from-emerald-950/60 via-slate-900/80 to-teal-950/60 border border-emerald-500/20 rounded-2xl shadow-sm backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-200">Chennai Live AQI:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30">
                  54 • Good & Clean Air 🍃
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-300 font-medium">
              <span className="text-emerald-400 font-bold">🌡️ 31°C Sunny</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:inline text-slate-400">Doorstep pickups running on regular green schedule</span>
            </div>
          </div>

          {/* Quick Actions Row (8 Smart Services) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Smart Eco Actions & Services
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                8 Integrated Services
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center">
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => window.location.href = '/schedule-pickup'}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaCalendarCheck className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Book Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowAiScanner(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaCamera className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">AI Vision Scan</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowPlantTree(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-lime-500/10 hover:bg-lime-500/20 text-lime-600 dark:text-lime-400 border border-lime-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaTree className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Plant a Tree</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowUpiPayout(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaRupeeSign className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Instant UPI</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowKiosks(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaMapMarkedAlt className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Drop Kiosks</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => window.location.href = '/report-dump'}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaExclamationTriangle className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Report Dump</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowGreenCert(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaAward className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Certificate</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowJourney(true)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black transition-all shadow-sm group"
              >
                <FaRecycle className="text-base mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] leading-tight">Trace Journey</span>
              </motion.button>
            </div>
          </div>

          {/* 8 Uniform Clickable Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.href = card.link}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex items-center space-x-3.5 cursor-pointer hover:border-emerald-500/40 transition-all min-h-[105px]"
                >
                  <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 border ${card.color}`}>
                    <Icon />
                  </div>
                  <div>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100 block">{card.val}</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                      {card.title}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Monthly Citizen Eco Target & Voucher Progress Card */}
          {(activeTab === 'all' || activeTab === 'rates' || activeTab === 'quests') && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-5 text-white shadow-md border border-emerald-400/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    Monthly Citizen Target
                  </span>
                  <span className="text-xs text-emerald-100 font-bold">12 Days Remaining in Cycle</span>
                </div>
                <h3 className="text-lg font-black text-white">
                  Monthly Goal: Divert 40 kg from Landfills
                </h3>
                <p className="text-xs text-emerald-100 max-w-md">
                  You have diverted <strong className="text-white font-black">28.5 kg (71%)</strong> so far. Recycle 11.5 kg more to unlock a <strong>₹250 Green Partner Voucher</strong>!
                </p>
              </div>

              <div className="w-full md:w-72 space-y-2 shrink-0">
                <div className="flex justify-between text-xs font-black text-white">
                  <span>28.5 kg diverted</span>
                  <span>40.0 kg Goal</span>
                </div>
                <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden p-0.5 border border-white/20">
                  <div className="bg-gradient-to-r from-amber-300 to-emerald-300 h-full rounded-full transition-all duration-500" style={{ width: '71%' }}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-emerald-100 font-medium">
                  <span>🎁 Reward: ₹250 Voucher</span>
                  <span className="font-bold text-white">71% Reached</span>
                </div>
              </div>
            </div>
          )}

          {/* 2-Column: Daily Green Streak & Missions (Left) + Real-World Carbon Equivalency (Right) */}
          {(activeTab === 'all' || activeTab === 'quests') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Daily Green Streak & Quests */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  {/* Streak Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg border border-orange-500/20">
                        <FaFire className="animate-bounce-short" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-1.5">
                          <span>{streakDays}-Day Green Streak</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 font-bold border border-orange-500/30">
                            Active 🔥
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Recycle daily to maintain streak & multiply rewards
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClaimStreak}
                      disabled={streakClaimed}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs ${
                        streakClaimed 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-default' 
                          : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-orange-500/30'
                      }`}
                    >
                      {streakClaimed ? 'Claimed ✓' : 'Claim +10 Pts'}
                    </motion.button>
                  </div>

                  {/* 7-Day Visual Tracker */}
                  <div className="grid grid-cols-7 gap-1.5 py-3">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
                      const isDone = idx < 5;
                      const isToday = idx === 4;
                      return (
                        <div 
                          key={idx} 
                          className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                            isDone 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                          } ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900 font-black' : ''}`}
                        >
                          <span className="text-[10px] font-bold">{day}</span>
                          <span className="text-xs mt-0.5">{isDone ? '🔥' : '⚪'}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Citizen Daily Quests Checklist */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Today's Citizen Quests</span>
                      <span>
                        {quests.filter(q => q.completed).length} / {quests.length} Completed
                      </span>
                    </div>

                    <div className="space-y-2">
                      {quests.map((q) => (
                        <div
                          key={q.id}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                            q.completed
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-700 dark:text-slate-300'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="text-base">{q.icon}</span>
                            <div>
                              <span className={`text-xs font-bold block ${q.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                                {q.title}
                              </span>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                                +{q.points} EcoPoints
                              </span>
                            </div>
                          </div>

                          {q.completed ? (
                            <span className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                              <FaCheck />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleCompleteQuest(q)}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-xl shadow-xs transition"
                            >
                              Start →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(quests.filter(q => q.completed).length / quests.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Real-World Carbon Impact Equivalency Hub */}
              <div className="bg-gradient-to-br from-emerald-900/30 via-slate-900 to-teal-950/40 border border-emerald-500/30 p-5 rounded-3xl shadow-sm space-y-4 text-white relative overflow-hidden flex flex-col justify-between">
                <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg border border-emerald-400/30">
                        <FaLeaf />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm">Real-World Eco Impact</h3>
                        <p className="text-[11px] text-emerald-200/80 font-medium">
                          What your {analytics?.co2Reduced || '35.3'} kg CO₂ reduction actually equals
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-400/30">
                      Net Positive 🌱
                    </span>
                  </div>

                  {/* 4 Concrete Equivalency Cards */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3">
                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center space-x-2 text-sky-400 text-sm mb-1">
                        <FaCarSide />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Car Travel Saved</span>
                      </div>
                      <span className="text-lg font-black text-white block">
                        {Math.round(parseFloat(analytics?.co2Reduced || 35.3) * 4.1)} km
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Gasoline vehicle offset</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center space-x-2 text-lime-400 text-sm mb-1">
                        <FaSeedling />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Urban Saplings</span>
                      </div>
                      <span className="text-lg font-black text-white block">
                        {((parseFloat(analytics?.co2Reduced || 35.3) * 0.08).toFixed(1))} Trees
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Nurtured for 1 year</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center space-x-2 text-amber-400 text-sm mb-1">
                        <FaLightbulb />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LED Power</span>
                      </div>
                      <span className="text-lg font-black text-white block">
                        {Math.round(parseFloat(analytics?.co2Reduced || 35.3) * 6.5)} hrs
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Clean energy equivalent</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center space-x-2 text-cyan-400 text-sm mb-1">
                        <FaWater />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fresh Water</span>
                      </div>
                      <span className="text-lg font-black text-white block">
                        {Math.round(parseFloat(analytics?.co2Reduced || 35.3) * 28)} L
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Water table conserved</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Quick Action */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-300 font-medium">
                    Verified by EcoReward Carbon Accounting Engine
                  </span>
                  <button
                    onClick={() => setShowGreenCert(true)}
                    className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <span>View Certificate</span>
                    <FaChevronRight className="text-[10px]" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Green Badges & Citizen Trophy Room */}
          {(activeTab === 'all' || activeTab === 'quests') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg border border-amber-500/20">
                    <FaTrophy />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                      <span>Citizen Eco Trophy Room</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        4 of 6 Unlocked
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Earn official recognition badges and multiplier bonuses for clean recycling habits
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                  View Rewards
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {citizenBadges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: 1.04, y: -2 }}
                    className={`p-3.5 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      badge.unlocked 
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-900 dark:text-white shadow-xs' 
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <span className="text-2xl mb-1">{badge.icon}</span>
                    <span className="text-xs font-black truncate w-full block">{badge.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      {badge.level}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {badge.desc}
                    </span>
                    <span className="mt-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {badge.bonus}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Live Scrap Market Price Index & Waste Value Estimator */}
          {(activeTab === 'all' || activeTab === 'rates') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center text-lg border border-teal-500/20">
                    <FaCalculator />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                        Live Scrap Market Rate Card & Value Estimator
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                        Live Rates
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Real-time market buyback rates across Chennai & Tamil Nadu recycling hubs
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 font-bold self-start sm:self-auto">
                  Updated Today • 100% Guaranteed Payout
                </span>
              </div>

              {/* Scrap Category Rates Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(SCRAP_RATES).map(([key, item]) => {
                  const isSelected = calcCategory === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setCalcCategory(key)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {item.badge}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block truncate">
                        {item.name}
                      </span>
                      <div className="flex items-baseline space-x-1 mt-1">
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          ₹{item.ratePerKg}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">/ kg</span>
                      </div>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold block mt-0.5">
                        {item.estBonus}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Interactive Estimator Slider & Result Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 dark:from-slate-800/40 dark:to-emerald-950/20 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Estimated Waste Weight (kg)
                    </label>
                    <span className="text-sm font-black px-3 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30">
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

                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>2 kg (Min)</span>
                    <span>25 kg</span>
                    <span>50 kg</span>
                    <span>100 kg (Bulk)</span>
                  </div>
                </div>

                {/* Instant Valuation Readout Card */}
                <div className="w-full md:w-1/2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                      Estimated Cash Payout
                    </span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        ₹{calcWeight * SCRAP_RATES[calcCategory].ratePerKg}
                      </span>
                      <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                        +{(calcWeight * SCRAP_RATES[calcCategory].ptsPerKg)} EcoPts
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      Offsets ~{(calcWeight * 1.5).toFixed(1)} kg CO₂ emissions
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = `/schedule-pickup?category=${calcCategory}&weight=${calcWeight}`}
                    className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0"
                  >
                    <FaCalendarPlus className="h-3.5 w-3.5" />
                    <span>Sell Scrap & Book</span>
                  </motion.button>
                </div>

              </div>
            </div>
          )}

          {/* Smart Household Waste Segregation Guide (Interactive 4-Bin Helper) */}
          {(activeTab === 'all' || activeTab === 'segregation') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-lg border border-emerald-500/20">
                    <FaTrashAlt />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                        Smart Household Waste Segregation Guide
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                        Official 4-Bin System
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Select common household items to learn precise bin color, disposal protocol, and cash yields
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Interactive Colored Bins Display */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-2xl border transition-all ${SEGREGATION_ITEMS[selectedSegKey]?.binColor === 'green' ? 'ring-2 ring-emerald-500 bg-emerald-500/15 border-emerald-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">🟢 Green Bin (Wet)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Food scraps, fruit peels, tea leaves, compostable organic matter.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all ${SEGREGATION_ITEMS[selectedSegKey]?.binColor === 'blue' ? 'ring-2 ring-sky-500 bg-sky-500/15 border-sky-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="h-3 w-3 rounded-full bg-sky-500 shrink-0"></span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">🔵 Blue Bin (Dry)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Clean paper, cardboard boxes, plastics, metals, glass bottles.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all ${SEGREGATION_ITEMS[selectedSegKey]?.binColor === 'red' ? 'ring-2 ring-rose-500 bg-rose-500/15 border-rose-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="h-3 w-3 rounded-full bg-rose-500 shrink-0"></span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">🔴 Red Bin (Hazardous)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Batteries, electronics, cables, CFL bulbs, chemicals, paint cans.
                  </p>
                </div>

                <div className={`p-3.5 rounded-2xl border transition-all ${SEGREGATION_ITEMS[selectedSegKey]?.binColor === 'yellow' ? 'ring-2 ring-amber-500 bg-amber-500/15 border-amber-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'}`}>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">🟡 Yellow Bin (Sanitary)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Sanitary napkins, diapers, bandages, clinical wraps, medical residue.
                  </p>
                </div>
              </div>

              {/* Quick Item Clicker Chips */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                  Common Household Waste Items (Click to Inspect)
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.values(SEGREGATION_ITEMS).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedSegKey(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
                        selectedSegKey === item.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Item Segregation Detail Card */}
              {SEGREGATION_ITEMS[selectedSegKey] && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-emerald-50/40 dark:from-slate-800/50 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{SEGREGATION_ITEMS[selectedSegKey].icon}</span>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">
                        {SEGREGATION_ITEMS[selectedSegKey].name}
                      </h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        Target: {SEGREGATION_ITEMS[selectedSegKey].binName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      💡 <strong>Disposal Protocol:</strong> {SEGREGATION_ITEMS[selectedSegKey].instructions}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      🌍 <strong>Environmental Impact:</strong> {SEGREGATION_ITEMS[selectedSegKey].impact}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <span className="px-3 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl border border-emerald-500/30">
                      {SEGREGATION_ITEMS[selectedSegKey].reward}
                    </span>
                    <button
                      onClick={() => setShowAiScanner(true)}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                    >
                      <FaCamera className="text-xs" />
                      <span>Scan Similar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Neighborhood Referral & Society Green Challenge Hub */}
          {(activeTab === 'all' || activeTab === 'referrals') && (
            <div className="bg-gradient-to-r from-emerald-900/40 via-slate-900 to-teal-900/40 border border-emerald-500/30 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30 shrink-0">
                    <FaUsers />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">
                      Neighborhood Referral & Society Green Challenge
                    </h3>
                    <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
                      Invite friends, neighbors & society members to recycle. Both earn <strong className="text-amber-400">+100 EcoPoints</strong> per completed pickup!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 flex items-center space-x-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Your Code:</span>
                    <span className="text-xs font-black text-emerald-400 tracking-wider">ECO-PALANI-2026</span>
                  </div>

                  <button
                    onClick={handleCopyReferral}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <FaCopy className="text-xs" />
                    <span>{copiedReferral ? 'Copied! ✓' : 'Copy Code'}</span>
                  </button>

                  <a
                    href="https://api.whatsapp.com/send?text=Join%20me%20on%20EcoReward%20to%20recycle%20household%20scrap%20and%20earn%20instant%20cash%20and%20EcoPoints!%20Use%20my%20code%20ECO-PALANI-2026%20for%20100%20bonus%20points:%20https://ecoreward.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 font-black text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                  >
                    <FaWhatsapp className="text-emerald-400 text-sm" />
                    <span>Share WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Expansive Live Pickup Tracking Command Card */}
          {(activeTab === 'all' || activeTab === 'tracking') && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              
              {/* Header with Live Driver Telematics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-3.5">
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-xl border border-emerald-500/20 shadow-xs">
                    <FaRoute />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                        Live Doorstep Pickup Tracking
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 flex items-center space-x-1.5 shadow-2xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>GPS STREAM ACTIVE</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Real-time vehicle GPS coordinates, route traffic & doorstep ETA estimation
                    </p>
                  </div>
                </div>

                {/* Driver Quick Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowDriverChat(true)}
                    className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <FaComments className="h-3.5 w-3.5" />
                    <span>Chat with Driver</span>
                  </button>

                  <a
                    href="tel:+919876543210"
                    className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs"
                  >
                    <FaPhone className="h-3 w-3 text-emerald-600" />
                    <span>Call (+91 98765...)</span>
                  </a>

                  <button 
                    onClick={() => setTrackingDriver(activePickup)}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-600 rounded-xl text-xs transition"
                    title="Expand Map View"
                  >
                    <FaExpand className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Large-Format Interactive GPS Map Container */}
              <div className="relative h-[380px] sm:h-[430px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-md">
                <GoogleRouteMap 
                  driverName={activePickup?.driver?.user?.name || 'Karthik Raja'} 
                  vehicleNumber="TN-38-ECO-9945 (EV Mini-Truck)"
                  pickupAddress={activePickup?.pickupAddress?.street || '14/2, Anna Nagar West, Chennai'}
                  height="100%"
                />

                {/* Top Floating Telematics HUD Overlay */}
                <div className="absolute top-3 left-3 right-3 sm:right-auto flex flex-wrap gap-2 pointer-events-none">
                  <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/40 text-white shadow-xl flex items-center space-x-3 pointer-events-auto">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
                      🚛
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-xs text-white">Driver Karthik M</span>
                        <span className="text-[10px] text-amber-400 font-black">⭐ 4.9</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-semibold block">EV Tipper • 28 km/h • 84% Battery</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-500/40 text-white shadow-xl flex items-center space-x-2 pointer-events-auto">
                    <FaClock className="text-amber-400 text-xs" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Estimated Arrival</span>
                      <span className="text-xs font-black text-emerald-400">~8 Mins (1.8 km)</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Mini Status Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-950/90 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white text-xs shadow-xl pointer-events-auto">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div>
                      <span className="font-black text-slate-100 text-xs block">Pickup #PK-99452 • On Route</span>
                      <span className="text-[10px] text-slate-400">Doorstep Collection Confirmed • 14/2 Anna Nagar West</span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToast('Map re-centered to your home destination!', 'info', 'Recenter GPS')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] rounded-xl shadow-xs transition"
                  >
                    Recenter Pin
                  </button>
                </div>
              </div>

              {/* Doorstep Service Stepper */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-3">
                  Live Pickup Milestones
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-600 font-extrabold">
                    <FaCheckCircle className="h-4 w-4 shrink-0" />
                    <span>1. Booked & Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-600 font-extrabold">
                    <FaCheckCircle className="h-4 w-4 shrink-0" />
                    <span>2. Driver Dispatched</span>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-500 font-black animate-pulse">
                    <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0"></span>
                    <span>3. En Route (1.8 km)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 font-medium">
                    <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                    <span>4. Weigh & Credit Pts</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Activity Feed & Weekly Statistics 2-Column Row */}
          {(activeTab === 'all') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Activity Feed */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                    <FaClock className="text-emerald-500" />
                    <span>Recent Activity Feed</span>
                  </h3>
                  <span className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">View all</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-slate-100">Pickup Completed & Verified</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">12.5 kg Dry Waste • 1h ago</span>
                      </div>
                    </div>
                    <span className="font-black text-emerald-600">+45 pts</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center text-sm">
                        <FaTruck />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-slate-100">Driver Dispatched</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">Glass & Electronics • 3h ago</span>
                      </div>
                    </div>
                    <span className="font-black text-sky-600">+20 pts</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm">
                        <FaGift />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-slate-100">Voucher Reward Redeemed</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">₹100 Eco Store Coupon • 1d ago</span>
                      </div>
                    </div>
                    <span className="font-black text-rose-500">-100 pts</span>
                  </div>
                </div>
              </div>

              {/* Weekly Statistics Chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                    <FaChartBar className="text-emerald-500" />
                    <span>Weekly Statistics (Recycled Waste kg)</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-bold">Total: 345 kg</span>
                </div>

                <div className="h-44 flex items-end justify-between space-x-2.5 pt-4 pb-1">
                  {[
                    { day: 'Mon', kg: 15 },
                    { day: 'Tue', kg: 30 },
                    { day: 'Wed', kg: 75, active: true },
                    { day: 'Thu', kg: 45 },
                    { day: 'Fri', kg: 60 },
                    { day: 'Sat', kg: 35 },
                    { day: 'Sun', kg: 90 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center space-y-1.5 group">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-600">{item.kg}kg</span>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-28 flex items-end p-1">
                        <div 
                          className={`w-full rounded-lg transition-all duration-500 ${item.active ? 'bg-emerald-600 shadow-sm shadow-emerald-500/30' : 'bg-teal-500/70'}`}
                          style={{ height: `${(item.kg / 90) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Community Eco Leaderboard */}
          {(activeTab === 'all' || activeTab === 'referrals') && (
            <LeaderboardWidget />
          )}

          {/* AI Scanner Modal */}
          <AIWasteScannerModal 
            isOpen={showAiScanner} 
            onClose={() => setShowAiScanner(false)} 
            onSchedulePickup={(cat) => window.location.href = `/schedule-pickup?category=${cat}`}
          />

          {/* Citizen <-> Driver Live Chat Modal */}
          <DriverChatModal
            isOpen={showDriverChat}
            onClose={() => setShowDriverChat(false)}
            pickupId={activePickup?._id}
            recipientName={activePickup?.driver?.user?.name || 'Driver Karthik M'}
            recipientRole="driver"
          />

          {/* Green Citizen Certificate Modal */}
          <GreenCertificateModal
            isOpen={showGreenCert}
            onClose={() => setShowGreenCert(false)}
            totalWeight={analytics?.co2Reduced ? (analytics.co2Reduced / 1.5).toFixed(1) : 48.5}
            totalCO2={analytics?.co2Reduced || 72.8}
            points={user?.points || 500}
          />

          {/* Circular Economy & Traceability Journey Modal */}
          <RecyclingJourneyModal
            isOpen={showJourney}
            onClose={() => setShowJourney(false)}
            pickup={activePickup}
          />

          {/* Plant Real Geo-Tagged Tree Modal */}
          <PlantTreeModal
            isOpen={showPlantTree}
            onClose={() => setShowPlantTree(false)}
            userPoints={analytics?.walletPoints || user?.points || 500}
            onTreePlanted={(cost) => {
              setAnalytics(prev => prev ? ({ ...prev, walletPoints: Math.max(0, (prev.walletPoints || 0) - cost) }) : prev);
            }}
          />

          {/* Instant UPI Bank Payout Modal */}
          <UPIPayoutModal
            isOpen={showUpiPayout}
            onClose={() => setShowUpiPayout(false)}
            userPoints={analytics?.walletPoints || user?.points || 500}
            onPayoutSuccess={(updatedPts) => {
              setAnalytics(prev => prev ? ({ ...prev, walletPoints: updatedPts }) : prev);
            }}
          />

          {/* Smart 24/7 Eco-Kiosk Locator Modal */}
          <SmartKioskLocatorModal
            isOpen={showKiosks}
            onClose={() => setShowKiosks(false)}
          />

    </UserLayout>
  );
};

export default UserDashboard;
