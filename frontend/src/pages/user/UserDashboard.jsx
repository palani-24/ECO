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
import { FaCoins, FaCheckDouble, FaHourglassHalf, FaGift, FaCalendarCheck, FaUserCircle, FaCompass, FaMapPin, FaPaperPlane, FaLeaf, FaTree, FaTint, FaBolt, FaTruck, FaQrcode, FaAward, FaCamera, FaRoute, FaComments, FaPhoneAlt } from 'react-icons/fa';

const UserDashboard = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDriver, setTrackingDriver] = useState(null);
  const [monthlyRecycleKg, setMonthlyRecycleKg] = useState(25);
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

  // Sync Real-Time Coin Award Celebration Popup
  useEffect(() => {
    if (realtimeData?.lastPointsAwarded) {
      setCoinPopup({
        amount: realtimeData.lastPointsAwarded
      });
    }
  }, [realtimeData?.lastPointsAwarded]);

  // Daily Spin Wheel States
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    try {
      const res = await api.post('/user/spin');
      if (res.data.success) {
        const prize = res.data.prize;
        const prizes = [10, 25, 50, 100, 200];
        const prizeIndex = prizes.indexOf(prize) !== -1 ? prizes.indexOf(prize) : 2;
        const extraDegrees = 360 * 5 + prizeIndex * (360 / prizes.length);
        const newRotation = rotation + extraDegrees;

        setRotation(newRotation);

        setTimeout(() => {
          setSpinning(false);
          setWonPrize(prize);
          updateUserPoints(res.data.totalPoints);
          addToast(res.data.message, 'reward', 'Spin & Win');
        }, 3000);
      }
    } catch (err) {
      setSpinning(false);
      addToast(err.response?.data?.message || 'Spin failed', 'error', 'Spin & Win');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pickupRes, transRes] = await Promise.all([
          api.get('/user/pickups'),
          api.get('/user/transactions')
        ]);

        if (pickupRes.data.success) setPickups(pickupRes.data.data);
        if (transRes.data.success) setTransactions(transRes.data.data.slice(0, 5));

        // Generate local metrics aggregation for dashboard
        const completed = pickupRes.data.data.filter(p => p.status === 'completed');
        const pending = pickupRes.data.data.filter(p => p.status === 'pending' || p.status === 'assigned' || p.status === 'accepted');
        
        // Sum weights by category
        const categories = { Plastic: 0, Paper: 0, Metal: 0, Glass: 0, Organic: 0, 'E-Waste': 0 };
        completed.forEach(p => {
          if (p.wasteCategory in categories) {
            categories[p.wasteCategory] += p.actualWeight || p.estimatedWeight;
          }
        });

        // Calculate Ecology Metrics
        let totalCO2 = 0;
        let totalWater = 0;
        let totalTrees = 0;
        let totalEnergy = 0;
        let totalToxic = 0;
        let totalWeight = 0;

        completed.forEach(p => {
          const weight = p.actualWeight || p.estimatedWeight || 0;
          totalWeight += weight;
          if (p.wasteCategory === 'Plastic') {
            totalCO2 += weight * 1.5;
          } else if (p.wasteCategory === 'Paper') {
            totalCO2 += weight * 1.0;
            totalTrees += weight * 0.017;
            totalWater += weight * 26;
          } else if (p.wasteCategory === 'Metal') {
            totalCO2 += weight * 4.0;
            totalEnergy += weight * 14;
          } else if (p.wasteCategory === 'Glass') {
            totalCO2 += weight * 0.3;
          } else if (p.wasteCategory === 'Organic') {
            totalCO2 += weight * 0.8;
          } else if (p.wasteCategory === 'E-Waste') {
            totalCO2 += weight * 2.0;
            totalEnergy += weight * 8;
            totalToxic += weight * 0.5;
          }
        });

        setAnalytics({
          completedCount: completed.length,
          pendingCount: pending.length,
          totalEarned: user?.points || 0,
          categories,
          ecology: {
            co2: totalCO2,
            water: totalWater,
            trees: totalTrees,
            energy: totalEnergy,
            toxic: totalToxic,
            weight: totalWeight
          }
        });
      } catch (err) {
        console.error('Failed to load user dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const activePickup = pickups.find(p => p.status !== 'completed' && p.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Dashboard Panel */}
        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-emerald-600 to-primary-500 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-15 transform translate-x-10 translate-y-10">
              <FaCoins className="h-44 w-44" />
            </div>
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold">Welcome back, {user?.name.split(' ')[0]}! ♻️</h2>
              <p className="text-sm opacity-90 max-w-xl">
                Ready to make a difference today? Schedule a waste pickup, sorting items increases your point rates.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button 
                  onClick={() => setShowSpinWheel(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center space-x-1.5 animate-pulse"
                >
                  <span>🎰 Daily Bonus Spin Wheel</span>
                </button>
                <button 
                  onClick={() => setShowCertModal(true)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-extrabold rounded-xl text-xs backdrop-blur-md transition-all flex items-center space-x-1.5 border border-white/30"
                >
                  <FaAward className="text-amber-300" />
                  <span>View Official Eco Certificate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Quick Actions</span>
            <div className="grid grid-cols-4 gap-3 text-center">
              <button
                onClick={() => window.location.href = '/schedule-pickup'}
                className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-all hover:scale-105"
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-lg shadow">
                  <FaCalendarCheck />
                </div>
                <span className="text-xs font-extrabold">Book Pickup</span>
              </button>

              <button
                onClick={() => {
                  if (activePickup) setTrackingDriver(activePickup);
                  else addToast('No active pickup found for live tracking', 'info', 'Live Tracking');
                }}
                className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 transition-all hover:scale-105"
              >
                <div className="h-10 w-10 rounded-2xl bg-teal-500 text-white flex items-center justify-center text-lg shadow">
                  <FaRoute />
                </div>
                <span className="text-xs font-extrabold">Live Tracking</span>
              </button>

              <button
                onClick={() => setShowAiScanner(true)}
                className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 transition-all hover:scale-105"
              >
                <div className="h-10 w-10 rounded-2xl bg-cyan-500 text-white flex items-center justify-center text-lg shadow">
                  <FaCamera />
                </div>
                <span className="text-xs font-extrabold">Scan Waste</span>
              </button>

              <button
                onClick={() => window.location.href = '/redeem'}
                className="flex flex-col items-center space-y-2 p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all hover:scale-105"
              >
                <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-lg shadow">
                  <FaGift />
                </div>
                <span className="text-xs font-extrabold">Wallet</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            /* Stats Grid */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <FaCoins className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{user?.points}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Wallet Points</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                  <FaCheckDouble className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{analytics?.completedCount}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Pickups Done</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <FaHourglassHalf className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{analytics?.pendingCount}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Active Requests</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <FaGift className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200">{transactions.filter(t => t.type === 'redeem').length}</span>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Vouchers Claimed</p>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Impact Summary Section */}
          {!loading && analytics?.ecology && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🌿</span>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100">Your Environmental Impact Summary</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CO2 Saved */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-slate-900 dark:to-emerald-950/10 border border-emerald-200/40 dark:border-emerald-900/30 p-5 rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                    <FaLeaf className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                      {analytics.ecology.co2.toFixed(1)} kg
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">CO2 Reduced</p>
                  </div>
                </div>

                {/* Trees Saved */}
                <div className="bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-slate-900 dark:to-sky-950/10 border border-sky-200/40 dark:border-sky-900/30 p-5 rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-sky-500/20">
                    <FaTree className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-sky-700 dark:text-sky-400">
                      {analytics.ecology.trees.toFixed(2)}
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Trees Saved</p>
                  </div>
                </div>

                {/* Water Saved */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-slate-900 dark:to-blue-950/10 border border-blue-200/40 dark:border-blue-900/30 p-5 rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                    <FaTint className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-blue-700 dark:text-blue-400">
                      {analytics.ecology.water.toFixed(1)} L
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Water Preserved</p>
                  </div>
                </div>

                {/* Energy Saved */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-slate-900 dark:to-amber-950/10 border border-amber-200/40 dark:border-amber-900/30 p-5 rounded-2xl shadow-sm flex items-center space-x-4 relative overflow-hidden">
                  <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/20">
                    <FaBolt className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                      {analytics.ecology.energy.toFixed(1)} kWh
                    </span>
                    <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Energy Saved</p>
                  </div>
                </div>
              </div>

              {/* IoT Smart Bin Telemetry Widget & Carbon Footprint Slider */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* IoT Smart Bin Telemetry */}
                <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-3 shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                      <h4 className="font-extrabold text-xs text-white">📡 IoT Smart Bin Fleet Telemetry</h4>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-md font-bold">ONLINE</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="font-bold text-slate-200">SmartBin #08 (Eco Hub A)</p>
                        <span className="text-[10px] text-slate-400 font-mono">Fill: 88% • Battery: 94%</span>
                      </div>
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-[10px] rounded-lg border border-amber-500/30">
                        Dispatch Scheduled
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
                      <div>
                        <p className="font-bold text-slate-200">SmartBin #14 (Park Zone B)</p>
                        <span className="text-[10px] text-slate-400 font-mono">Fill: 42% • Battery: 99%</span>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-[10px] rounded-lg border border-emerald-500/30">
                        Optimal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Carbon Footprint Calculator Slider */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-5 rounded-3xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span>🌍 Annual Carbon Offset Calculator</span>
                    </h4>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{(monthlyRecycleKg * 2.8 * 12).toFixed(0)} kg CO2e / yr</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Recycling Target: {monthlyRecycleKg} kg / month</span>
                      <span>{(monthlyRecycleKg * 0.12).toFixed(1)} Trees Saved</span>
                    </div>
                    <input 
                      type="range"
                      min="5"
                      max="100"
                      value={monthlyRecycleKg}
                      onChange={(e) => setMonthlyRecycleKg(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    Recycling {monthlyRecycleKg} kg monthly prevents ~{(monthlyRecycleKg * 2.8 * 12).toFixed(0)} kg of greenhouse gas emissions annually!
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Secondary Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col - Active Pickup Info & Recent Activities */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Pickup Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <FaCalendarCheck className="text-emerald-500" />
                    <span>Upcoming Pickup Request</span>
                  </h3>
                  {activePickup && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                      {activePickup.status}
                    </span>
                  )}
                </div>

                {activePickup ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pickup Metadata */}
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-xs text-slate-400 block font-semibold">WASTE CATEGORY</span>
                        <p className="font-bold text-slate-800 dark:text-white">{activePickup.wasteCategory} ({activePickup.estimatedWeight} kg approx)</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-xs text-slate-400 block font-semibold">SCHEDULED SLOT</span>
                        <p className="font-bold text-slate-800 dark:text-white">{new Date(activePickup.pickupDate).toLocaleDateString()} at {activePickup.pickupTimeSlot}</p>
                      </div>
                      <div className="text-sm">
                        <span className="text-xs text-slate-400 block font-semibold">PICKUP ADDRESS</span>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">
                          {activePickup.pickupAddress.street}, {activePickup.pickupAddress.city}
                        </p>
                      </div>
                    </div>

                    {/* Driver details */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/30 dark:border-slate-800/60 flex flex-col justify-between items-center text-center space-y-2">
                      {activePickup.driver && (typeof activePickup.driver === 'object') ? (
                        <>
                          <img 
                            src={activePickup.driver.user?.profileImage || 'https://ui-avatars.com/api/?name=Driver&background=059669&color=fff'} 
                            alt="Driver profile" 
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{activePickup.driver.user?.name || 'Assigned Driver'}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{activePickup.driver.vehicleType || 'Vehicle'} ({activePickup.driver.vehicleNumber || 'TN-ECO'})</p>
                          </div>
                      <div className="pt-2">
                        <button
                          onClick={() => setSelectedQrPickup(activePickup)}
                          className="w-full py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5"
                        >
                          <FaQrcode />
                          <span>Show Digital QR Verification Pass</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => setTrackingDriver(activePickup.driver)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <FaCompass className="h-3.5 w-3.5" />
                        <span>Track Driver Live</span>
                      </button>
                        </>
                      ) : (
                        <div className="my-auto space-y-2">
                          <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                            <FaUserCircle className="h-6 w-6 animate-pulse" />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                            Finding nearby collection drivers. We'll update details shortly.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <p className="text-sm font-semibold">You have no active pending pickup requests.</p>
                    <a href="/schedule-pickup" className="inline-block text-xs font-bold text-emerald-500 hover:underline">Schedule New Waste Collection</a>
                  </div>
                )}
              </div>

              {/* Transactions Ledger list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Recent Wallet Ledger Activities</h3>
                <div className="space-y-2.5">
                  {transactions.map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="space-y-0.5 overflow-hidden pr-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{t.description}</p>
                        <span className="text-[10px] text-slate-400 font-bold block">{new Date(t.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`text-xs font-extrabold flex-shrink-0 ${t.type === 'earn' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.pointsChange > 0 ? `+${t.pointsChange}` : t.pointsChange} pts
                      </span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-4">No wallet transactions recorded yet.</p>
                  )}
                </div>
              </div>

            </div>

            {/* Right Col - Waste Distribution SVG and Trend */}
            <div className="space-y-6">
              
              {/* Waste Distribution circular chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Waste Recycled (kg)</h3>
                
                {analytics ? (
                  <div className="space-y-3.5">
                    {Object.entries(analytics.categories).map(([cat, val]) => {
                      const max = Math.max(...Object.values(analytics.categories)) || 1;
                      const percentage = Math.min(100, Math.round((val / max) * 100));
                      
                      const barColors = {
                        Plastic: 'bg-emerald-500',
                        Paper: 'bg-sky-500',
                        Metal: 'bg-indigo-500',
                        Glass: 'bg-amber-500',
                        Organic: 'bg-lime-500',
                        'E-Waste': 'bg-rose-500'
                      };

                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-300">
                            <span>{cat}</span>
                            <span>{val.toFixed(1)} kg</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${barColors[cat]} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ChartSkeleton />
                )}
              </div>

              {/* Points Trend SVG chart */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Monthly Recycling trend</h3>
                
                <svg viewBox="0 0 100 40" className="w-full overflow-visible">
                  <path
                    d="M 5 35 Q 20 28 35 30 T 65 15 T 95 5"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 5 35 Q 20 28 35 30 T 65 15 T 95 5 L 95 40 L 5 40 Z"
                    fill="url(#grad)"
                    opacity="0.12"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <circle cx="5" cy="35" r="2" fill="#10b981" />
                  <circle cx="35" cy="30" r="2" fill="#10b981" />
                  <circle cx="65" cy="15" r="2" fill="#10b981" />
                  <circle cx="95" cy="5" r="2" fill="#10b981" />
                </svg>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1 pt-1.5">
                  <span>APR</span>
                  <span>MAY</span>
                  <span>JUN</span>
                  <span>JUL</span>
                </div>
              </div>

              {/* Share Platform Card */}
              <div className="bg-gradient-to-tr from-emerald-500/10 to-primary-500/15 border border-emerald-500/20 p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📢</span>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Spread the word!</h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Invite your friends to join EcoReward and make the world a cleaner place.
                </p>
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 select-all truncate flex-1">
                    https://eco-liart-eta.vercel.app
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText('https://eco-liart-eta.vercel.app');
                      addToast('Platform link copied to clipboard!', 'success', 'Link Copied');
                    }}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-[10px] font-bold"
                  >
                    Copy
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Tracking Modal */}
          {trackingDriver && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-[420px] space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">Live Tracking Driver</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time GPS routing in municipal collection sector.
                  </p>
                </div>
                
                {/* Real Live Google Maps */}
                <GoogleRouteMap 
                  driverName={trackingDriver.user.name} 
                  vehicleNumber={trackingDriver.vehicleNumber}
                  driverLocation={realtimeData?.driverLocation}
                  height="260px"
                />
                
                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20 p-4 rounded-2xl space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-700 dark:text-slate-350">Driver: <span className="font-bold text-slate-900 dark:text-white">{trackingDriver.user.name}</span></p>
                  <p className="font-semibold text-slate-700 dark:text-slate-350">Vehicle: <span className="font-bold text-slate-900 dark:text-white">{trackingDriver.vehicleType} ({trackingDriver.vehicleNumber})</span></p>
                </div>

                <button 
                  onClick={() => setTrackingDriver(null)}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors"
                >
                  Close Tracker
                </button>
              </div>
            </div>
          )}

          {/* Daily Spin Wheel Modal */}
          {showSpinWheel && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-5 relative overflow-hidden">
                <div className="space-y-1">
                  <span className="text-2xl">🎰</span>
                  <h4 className="font-extrabold text-xl text-slate-900 dark:text-white">Daily Eco Spin & Win</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Spin the wheel every 24h to claim instant Eco Points!</p>
                </div>

                {/* Simulated Spinning Wheel */}
                <div className="relative mx-auto w-48 h-48 my-4 flex items-center justify-center">
                  <div className="absolute -top-2 z-20 text-xl font-bold text-rose-500 transform -rotate-180">▼</div>
                  <div 
                    className="w-44 h-44 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative transition-transform duration-[3000ms] cubic-bezier(0.15, 0.9, 0.2, 1)"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-amber-400 via-emerald-400 to-sky-400 flex items-center justify-center font-black text-slate-900 text-sm">
                      <div className="grid grid-cols-2 gap-2 p-4 text-center">
                        <span className="bg-white/80 px-2 py-1 rounded shadow">10 Pts</span>
                        <span className="bg-white/80 px-2 py-1 rounded shadow">25 Pts</span>
                        <span className="bg-white/80 px-2 py-1 rounded shadow">50 Pts</span>
                        <span className="bg-white/80 px-2 py-1 rounded shadow">200 Pts</span>
                      </div>
                    </div>
                  </div>
                </div>

                {wonPrize && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm border border-emerald-500/30 rounded-2xl animate-bounce">
                    🎉 You won +{wonPrize} Eco Points!
                  </div>
                )}

                <div className="flex gap-2">
                  <button 
                    disabled={spinning}
                    onClick={handleSpin}
                    className="flex-1 py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl text-xs transition-all disabled:opacity-50 shadow-md"
                  >
                    {spinning ? 'Spinning...' : 'SPIN NOW!'}
                  </button>
                  <button 
                    onClick={() => setShowSpinWheel(false)}
                    className="py-3 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QR Verification Pass Modal */}
          <QRPassModal
            isOpen={!!selectedQrPickup}
            onClose={() => setSelectedQrPickup(null)}
            pickup={selectedQrPickup}
          />

          {/* Official Eco Certificate Modal */}
          <EcoCertificateModal
            isOpen={showCertModal}
            onClose={() => setShowCertModal(false)}
            user={user}
            impactData={analytics?.ecology}
          />

          {/* Realtime Coins Received Celebration Modal */}
          {coinPopup && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-slate-900 border-2 border-amber-500/50 p-8 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl shadow-amber-500/20 transform animate-bounce-short">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-amber-500/30 rounded-full blur-xl animate-pulse"></div>
                  <div className="h-24 w-24 bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-yellow-200">
                    <FaCoins className="h-12 w-12 text-slate-950 animate-bounce" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">RECYCLING VERIFIED BY DRIVER</span>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                    +{coinPopup.amount} Coins!
                  </h3>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Driver has verified your recycling weight and AI quality metrics! EcoPoints credited to your wallet balance.
                  </p>
                </div>

                <button
                  onClick={() => setCoinPopup(null)}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95"
                >
                  Collect & Continue
                </button>
              </div>
            </div>
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
            recipientName={activePickup?.driver?.user?.name || 'Driver Ramesh Kumar'}
            recipientRole="driver"
          />

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
