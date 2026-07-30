import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton, ChartSkeleton } from '../../components/LoadingSkeleton';
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
  FaCalendarPlus, FaArrowRight, FaCheckCircle, FaRupeeSign
} from 'react-icons/fa';

const UserDashboard = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDriver, setTrackingDriver] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedQrPickup, setSelectedQrPickup] = useState(null);
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [coinPopup, setCoinPopup] = useState(null);

  // Sync Real-Time Socket Pickup Updates
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      const updatedPickup = realtimeData.latestPickup;
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updatedPickup._id);
        if (index !== -1) {
          const newPickups = [...prev];
          newPickups[index] = { ...newPickups[index], ...updatedPickup };
          return newPickups;
        }
        return [updatedPickup, ...prev];
      });
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

        // Aggregate local metrics matching the design mockup specs
        const completed = pickupList.filter(p => p.status === 'completed');
        const pending = pickupList.filter(p => p.status === 'pending');
        const active = pickupList.filter(p => p.status === 'assigned' || p.status === 'accepted');

        // Sum weight metrics
        let totalWeight = 0;
        completed.forEach(p => {
          totalWeight += p.actualWeight || p.estimatedWeight || 0;
        });

        const co2Reduced = totalWeight > 0 ? (totalWeight * 1.5).toFixed(1) : '56.5';
        const treesSaved = totalWeight > 0 ? (totalWeight * 0.017).toFixed(2) : '0.00';
        const energySaved = totalWeight > 0 ? (totalWeight * 2.8).toFixed(1) : '12.4';

        setAnalytics({
          completedCount: completed.length || 4,
          pendingCount: pending.length || 0,
          activeCount: active.length || 1,
          todayCount: 2,
          walletPoints: user?.points || 100,
          co2Reduced: co2Reduced,
          treesSaved: treesSaved,
          energySaved: energySaved,
          totalRewards: '120',
          categories: {
            Paper: 22.5,
            Plastic: 18.0,
            Glass: 10.5,
            Metal: 5.5
          }
        });
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } fontFinally: {
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Dashboard Panel */}
        <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Top Bar with Search & Notifications */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search anything... (Ctrl + K)"
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Notification Bell & Profile Dropdown */}
            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <button 
                onClick={() => addToast('You have 3 unread pickup notifications', 'info', 'Notifications')}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 rounded-2xl text-xs relative transition-colors"
                title="Notifications"
              >
                <FaBell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
              </button>

              <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <img 
                  src={user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Palani')}&background=10b981&color=fff`} 
                  alt="Avatar" 
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
                <div className="text-left hidden sm:block">
                  <p className="font-extrabold text-slate-900 dark:text-white text-xs">{user?.name || 'Palani M'}</p>
                  <span className="text-[10px] text-slate-400 font-bold block">Citizen Client</span>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 z-10">
              <h2 className="text-2xl sm:text-3xl font-black">
                Welcome back, {user?.name ? user.name.split(' ')[0] : 'Palani'}! 👋
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-lg">
                Together we make the environment better. Schedule pickups and turn household waste into rewards.
              </p>
            </div>
            
            <button 
              onClick={() => window.location.href = '/schedule-pickup'}
              className="z-10 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs shadow-xl transition-all flex items-center space-x-2 flex-shrink-0"
            >
              <FaCalendarPlus />
              <span>Book a Pickup</span>
            </button>
          </div>

          {/* 8 Metric Cards Grid (Matching Reference Mockup) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Wallet Points */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg flex-shrink-0 border border-emerald-500/20">
                <FaCoins />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{user?.points || 100}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wallet Points</span>
              </div>
            </div>

            {/* 2. Today's Pickups */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-lg flex-shrink-0 border border-sky-500/20">
                <FaTruck />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.todayCount || 2}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Today's Pickups</span>
              </div>
            </div>

            {/* 3. Active Requests */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg flex-shrink-0 border border-amber-500/20">
                <FaHourglassHalf />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.activeCount || 1}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Requests</span>
              </div>
            </div>

            {/* 4. CO₂ Reduced */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center text-lg flex-shrink-0 border border-teal-500/20">
                <FaLeaf />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.co2Reduced || '56.5'} kg</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">CO₂ Reduced</span>
              </div>
            </div>

            {/* 5. Completed */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg flex-shrink-0 border border-emerald-500/20">
                <FaCheckCircle />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.completedCount || 4}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
              </div>
            </div>

            {/* 6. Pending */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg flex-shrink-0 border border-rose-500/20">
                <FaHourglassHalf />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.pendingCount || 0}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending</span>
              </div>
            </div>

            {/* 7. Trees Saved */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-lime-500/10 text-lime-500 flex items-center justify-center text-lg flex-shrink-0 border border-lime-500/20">
                <FaTree />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{analytics?.treesSaved || '0.00'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Trees Saved</span>
              </div>
            </div>

            {/* 8. Total Rewards */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg flex-shrink-0 border border-purple-500/20">
                <FaGift />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">₹{analytics?.totalRewards || '120'}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Rewards</span>
              </div>
            </div>

          </div>

          {/* Environmental Impact & Live Pickup Tracking Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols - Environmental Impact Donut Chart & Cards */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Environmental Impact</h3>
                <span className="text-xs text-slate-400 font-bold">This Month ▾</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                
                {/* Donut Chart Simulation */}
                <div className="flex items-center space-x-6">
                  <div className="relative h-36 w-36 flex items-center justify-center flex-shrink-0">
                    <div className="h-36 w-36 rounded-full border-8 border-emerald-500 border-t-sky-500 border-r-amber-500 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-base font-black text-slate-900 dark:text-white block">56.5 kg</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">CO₂ Reduced</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
                      <span className="text-slate-600 dark:text-slate-400">Paper: <b className="text-slate-900 dark:text-white">22.5 kg</b></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-slate-600 dark:text-slate-400">Plastic: <b className="text-slate-900 dark:text-white">18.0 kg</b></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-slate-600 dark:text-slate-400">Glass: <b className="text-slate-900 dark:text-white">10.5 kg</b></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
                      <span className="text-slate-600 dark:text-slate-400">Metal: <b className="text-slate-900 dark:text-white">5.5 kg</b></span>
                    </div>
                  </div>
                </div>

                {/* Sub Cards: Trees Saved & Energy Saved */}
                <div className="space-y-3">
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg">
                      <FaTree />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Trees Saved</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">0.00 <span className="text-[10px] font-semibold text-slate-400">This Month</span></span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg">
                      <FaBolt />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-bold block">Energy Saved</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">12.4 kWh <span className="text-[10px] font-semibold text-slate-400">This Month</span></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Col - Live Pickup Tracking Widget */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Live Pickup Tracking</h3>
                <button 
                  onClick={() => setTrackingDriver(activePickup)}
                  className="text-xs font-bold text-emerald-500 hover:underline"
                >
                  View full
                </button>
              </div>

              {/* Map Preview Container */}
              <div className="relative h-40 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
                <GoogleRouteMap 
                  driverName={activePickup?.driver?.user?.name || 'Karthik M'} 
                  vehicleNumber="TN-38-ECO (ETA: 12 min)"
                  height="160px"
                />
                <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded-full text-[9px] font-black text-emerald-400 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Driver Karthik ⭐ 4.8 • 2.4 km away</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">Pickup ID: #PK123456</span>
                  <span className="text-emerald-500 font-black">Confirmed</span>
                </div>
                <p className="text-slate-400 text-[10px]">Paper, Plastic • Anna Nagar, Chennai</p>
                <span className="text-slate-400 text-[10px] block">Today, 10:30 AM</span>
              </div>
            </div>

          </div>

          {/* Charts Row & Recent Activity Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols - Weekly Activity Line Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Weekly Activity</h3>
              
              <div className="h-44 flex items-end justify-between space-x-3 pt-6 pb-2">
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
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-500">{item.kg}kg</span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl h-32 flex items-end p-1">
                      <div 
                        className={`w-full rounded-lg transition-all duration-500 ${item.active ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' : 'bg-teal-500/60'}`}
                        style={{ height: `${(item.kg / 90) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col - Recent Activity Stream */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Recent Activity</h3>
                <span className="text-xs text-emerald-500 font-bold cursor-pointer">View all</span>
              </div>

              <div className="space-y-3 text-xs">
                
                <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-sm">
                      <FaCheckCircle />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Pickup Completed</p>
                      <span className="text-[9px] text-slate-400">Paper, Plastic • 1h ago</span>
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
                      <p className="font-bold text-slate-900 dark:text-white">New Request Accepted</p>
                      <span className="text-[9px] text-slate-400">Glass • 3h ago</span>
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
                      <p className="font-bold text-slate-900 dark:text-white">Reward Redeemed</p>
                      <span className="text-[9px] text-slate-400">₹100 Voucher • 1d ago</span>
                    </div>
                  </div>
                  <span className="font-black text-rose-500">-100 pts</span>
                </div>

              </div>
            </div>

          </div>

          {/* Real-Time Community Eco Leaderboard Widget */}
          <LeaderboardWidget />

          {/* Bottom Eco Motivational Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow">
                🌱
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm">Keep it up! You are making our planet greener.</h4>
                <p className="text-slate-500 dark:text-slate-400 text-[10px]">Collect more • Earn more • Save more</p>
              </div>
            </div>
            <button 
              onClick={() => window.location.href = '/schedule-pickup'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition-all flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>Schedule Request</span>
              <FaArrowRight className="h-3 w-3" />
            </button>
          </div>

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

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
