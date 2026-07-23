import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton, ChartSkeleton } from '../../components/LoadingSkeleton';
import { FaCoins, FaCheckDouble, FaHourglassHalf, FaGift, FaCalendarCheck, FaUserCircle, FaCompass, FaMapPin, FaPaperPlane, FaLeaf, FaTree, FaTint, FaBolt, FaTruck } from 'react-icons/fa';


const LiveMap = ({ driverName, vehicleInfo }) => {
  const [position, setPosition] = useState({ x: 15, y: 20 });
  const [eta, setEta] = useState(12);
  const [progress, setProgress] = useState(0);

  const path = [
    { x: 15, y: 20 },
    { x: 15, y: 60 },
    { x: 75, y: 60 },
    { x: 75, y: 80 }
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setProgress(p => {
        const nextProgress = p + 1;
        if (nextProgress >= 100) {
          clearInterval(interval);
          setEta(0);
          return 100;
        }
        
        const totalSegments = path.length - 1;
        const segmentProgress = 100 / totalSegments;
        const currentSegment = Math.floor(nextProgress / segmentProgress);
        
        if (currentSegment < totalSegments) {
          const start = path[currentSegment];
          const end = path[currentSegment + 1];
          const segmentPercent = (nextProgress % segmentProgress) / segmentProgress;
          
          const curX = start.x + (end.x - start.x) * segmentPercent;
          const curY = start.y + (end.y - start.y) * segmentPercent;
          
          setPosition({ x: curX, y: curY });
        }
        
        setEta(Math.max(1, Math.round(12 * (1 - nextProgress / 100))));
        return nextProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Live Map Frame */}
      <div className="relative w-full h-52 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Main Grid Roads */}
          <line x1="0" y1="60" x2="100" y2="60" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.25" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6" />
          
          <line x1="15" y1="0" x2="15" y2="100" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.25" />
          <line x1="15" y1="0" x2="15" y2="100" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6" />

          <line x1="75" y1="0" x2="75" y2="100" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" opacity="0.25" />
          <line x1="75" y1="0" x2="75" y2="100" stroke="#64748b" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.6" />

          {/* Glowing collection route */}
          <path
            d="M 15 20 L 15 60 L 75 60 L 75 80"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4,4"
            className="animate-pulse"
          />

          {/* User Home Location Pin */}
          <circle cx="75" cy="80" r="5" fill="#f43f5e" className="animate-ping" opacity="0.4" />
          <circle cx="75" cy="80" r="3.5" fill="#f43f5e" />
        </svg>

        <div className="absolute top-[82%] left-[73%] flex flex-col items-center">
          <span className="text-[8px] font-black bg-rose-500 text-white px-1.5 py-0.5 rounded-md shadow whitespace-nowrap">Your Home</span>
        </div>

        {/* Live Moving Truck marker */}
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-linear"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur animate-pulse"></div>
            <div className="relative h-7 w-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border border-emerald-400">
              <FaTruck className="h-3.5 w-3.5" />
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md">
              {driverName}
            </div>
          </div>
        </div>
      </div>

      {/* ETA Stats row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20 p-3 rounded-xl text-center">
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {eta > 0 ? `${eta} mins` : 'Arrived!'}
          </span>
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">ETA</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/20 p-3 rounded-xl text-center">
          <span className="text-xl font-black text-primary-600 dark:text-primary-400">
            {progress}%
          </span>
          <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Progress</p>
        </div>
      </div>
    </div>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingDriver, setTrackingDriver] = useState(null);
  const [monthlyRecycleKg, setMonthlyRecycleKg] = useState(25);

  // Daily Spin Wheel States
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    const prizes = [10, 25, 50, 100, 200];
    const randomIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[randomIndex];
    const extraDegrees = 360 * 5 + randomIndex * (360 / prizes.length);
    const newRotation = rotation + extraDegrees;

    setRotation(newRotation);

    setTimeout(async () => {
      setSpinning(false);
      setWonPrize(prize);
      user.points = (user.points || 0) + prize;
    }, 3000);
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
              </div>
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
                      {activePickup.driver ? (
                        <>
                          <img 
                            src={activePickup.driver.user.profileImage || 'https://ui-avatars.com/api/?name=Driver&background=059669&color=fff'} 
                            alt="Driver profile" 
                            className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/20"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{activePickup.driver.user.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">{activePickup.driver.vehicleType} ({activePickup.driver.vehicleNumber})</p>
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
                      alert('Platform link copied to clipboard!');
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
                
                {/* Live Animated Map */}
                <LiveMap driverName={trackingDriver.user.name} vehicleInfo={trackingDriver.vehicleType} />
                
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

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
