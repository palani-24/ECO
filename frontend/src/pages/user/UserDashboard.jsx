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
import GoogleRouteMap from '../../components/GoogleRouteMap';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import DriverChatModal from '../../components/DriverChatModal';
import LeaderboardWidget from '../../components/LeaderboardWidget';
import { 
  FaCoins, FaCheckDouble, FaHourglassHalf, FaGift, FaCalendarCheck, FaUserCircle, 
  FaCompass, FaMapPin, FaPaperPlane, FaLeaf, FaTree, FaTint, FaBolt, FaTruck, 
  FaQrcode, FaAward, FaCamera, FaRoute, FaComments, FaPhoneAlt, FaSearch, FaBell,
  FaCalendarPlus, FaArrowRight, FaCheckCircle, FaRupeeSign, FaChartBar
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
        
          {/* Reduced Height Compact Welcome Card */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 z-10">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Palani'}! 👋
              </h2>
              <p className="text-xs text-emerald-100 font-medium max-w-md leading-relaxed">
                Together we make the environment better. Schedule pickups and turn household waste into rewards.
              </p>
            </div>
            
            {/* Larger, Glowing, High-Contrast Book a Pickup Button */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/schedule-pickup'}
              className="z-10 px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all flex items-center space-x-2 flex-shrink-0 animate-bounce-short"
            >
              <FaCalendarPlus className="h-4 w-4" />
              <span>Book a Pickup</span>
            </motion.button>
          </div>

          {/* Quick Actions Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/schedule-pickup'}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black transition-all"
              >
                <FaCalendarCheck />
                <span>Book Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (activePickup) setTrackingDriver(activePickup);
                  else addToast('No active pickup found for live tracking', 'info', 'Live Tracking');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 text-xs font-black transition-all"
              >
                <FaRoute />
                <span>Track Pickup</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAiScanner(true)}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-xs font-black transition-all"
              >
                <FaCamera />
                <span>Scan Waste</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.location.href = '/redeem'}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-black transition-all"
              >
                <FaGift />
                <span>Redeem Rewards</span>
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

          {/* Pickup Tracking & Recent Activity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Pickup Tracking Card */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
                  <FaRoute className="text-emerald-500" />
                  <span>Live Pickup Tracking</span>
                </h3>
                <button 
                  onClick={() => setTrackingDriver(activePickup)}
                  className="text-xs font-extrabold text-emerald-500 hover:underline"
                >
                  View Map
                </button>
              </div>

              {/* Map Preview */}
              <div className="relative h-40 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
                <GoogleRouteMap 
                  driverName={activePickup?.driver?.user?.name || 'Karthik M'} 
                  vehicleNumber="TN-38-ECO (ETA: 12 min)"
                  height="160px"
                />
                <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black text-emerald-400 flex items-center space-x-1.5 shadow">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Driver Karthik ⭐ 4.8 • 2.4 km away</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-900 dark:text-slate-100">Pickup ID: #PK123456</p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Paper, Plastic • Anna Nagar, Chennai</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-black text-[10px] rounded-full">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Recent Activity</h3>
                <span className="text-xs text-emerald-500 font-bold cursor-pointer">View all</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Pickup Completed</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">Paper, Plastic • 1h ago</span>
                    </div>
                  </div>
                  <span className="font-black text-emerald-500">+30 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-sm">
                      <FaTruck />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Request Accepted</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">Glass • 3h ago</span>
                    </div>
                  </div>
                  <span className="font-black text-sky-500">+20 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-sm">
                      <FaGift />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">Reward Redeemed</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">₹100 Voucher • 1d ago</span>
                    </div>
                  </div>
                  <span className="font-black text-rose-500">-100 pts</span>
                </div>
              </div>
            </div>

          </div>

          {/* Weekly Statistics Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center space-x-2">
              <FaChartBar className="text-emerald-500" />
              <span>Weekly Statistics (Recycled Waste kg)</span>
            </h3>

            <div className="h-40 flex items-end justify-between space-x-3 pt-6 pb-2">
              {[
                { day: 'Mon', kg: 15 },
                { day: 'Tue', kg: 30 },
                { day: 'Wed', kg: 75, active: true },
                { day: 'Thu', kg: 45 },
                { day: 'Fri', kg: 60 },
                { day: 'Sat', kg: 35 },
                { day: 'Sun', kg: 90 }
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center space-y-2 group">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-emerald-500">{item.kg}kg</span>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-28 flex items-end p-1">
                    <div 
                      className={`w-full rounded-lg transition-all duration-500 ${item.active ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-teal-500/60'}`}
                      style={{ height: `${(item.kg / 90) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{item.day}</span>
                </div>
              ))}
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

    </UserLayout>
  );
};

export default UserDashboard;
