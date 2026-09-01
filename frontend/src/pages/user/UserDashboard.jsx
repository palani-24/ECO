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
import { 
  FaCoins, FaCheckDouble, FaHourglassHalf, FaGift, FaCalendarCheck, FaUserCircle, 
  FaCompass, FaMapPin, FaPaperPlane, FaLeaf, FaTree, FaTint, FaBolt, FaTruck, 
  FaQrcode, FaAward, FaCamera, FaRoute, FaComments, FaPhoneAlt, FaSearch, FaBell,
  FaCalendarPlus, FaArrowRight, FaCheckCircle, FaRupeeSign, FaChartBar, FaExclamationTriangle, FaRecycle
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

          {/* Quick Actions Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Smart Eco Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-center">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/schedule-pickup'}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaCalendarCheck />
                <span>Book Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAiScanner(true)}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaCamera />
                <span>AI Vision Scan</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/report-dump'}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaExclamationTriangle />
                <span>Report Dump (+50)</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowGreenCert(true)}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaAward />
                <span>Eco Certificate</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowJourney(true)}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaRecycle />
                <span>Trace Journey</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/redeem'}
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-black transition-all shadow-sm"
              >
                <FaGift />
                <span>Redeem Shop</span>
              </motion.button>
            </div>
          </div>

          {/* 8 Uniform Clickable Cards Grid with Equal Spacing & Animations */}
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

          {/* Expansive Live Pickup Tracking Command Card */}
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

          {/* Activity Feed & Weekly Statistics 2-Column Row */}
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

          {/* Community Eco Leaderboard */}
          <LeaderboardWidget />

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

    </UserLayout>
  );
};

export default UserDashboard;
