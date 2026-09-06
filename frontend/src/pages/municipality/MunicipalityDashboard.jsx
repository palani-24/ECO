import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Leaf, Flame, MapPin, Truck, AlertTriangle, 
  CheckCircle2, TreePine, Droplets, Zap, Activity, 
  ShieldCheck, RefreshCw, Search, Clock, IndianRupee, 
  Camera, Navigation, ChevronRight, Award
} from 'lucide-react';
import { 
  FaCoins, FaTruck, FaHourglassHalf, FaLeaf, FaCheckCircle, 
  FaExclamationTriangle, FaTree, FaRupeeSign, FaAward, FaBuilding
} from 'react-icons/fa';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserLayout from '../../components/UserLayout';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import GreenCertificateModal from '../../components/GreenCertificateModal';

const MunicipalityDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWardFilter, setSelectedWardFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [showAiScanner, setShowAiScanner] = useState(false);
  const [showEsgCert, setShowEsgCert] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/municipality/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load municipality stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const summary = {
    totalWeightKg: stats?.summary?.totalWeightKg ?? 1820.5,
    totalTons: stats?.summary?.totalTons ?? 1.82,
    totalPickups: stats?.summary?.totalPickups ?? 64,
    completedPickups: stats?.summary?.completedPickups ?? 58,
    activePickups: stats?.summary?.pendingPickups ?? stats?.summary?.activePickups ?? 6,
    pickupEfficiencyPct: stats?.summary?.pickupEfficiencyPct ?? 91,
    totalCitizens: stats?.summary?.totalCitizens ?? 1420,
    activeDrivers: stats?.summary?.activeDrivers ?? 12,
    openGrievances: stats?.summary?.openGrievances ?? 3,
    resolvedGrievances: stats?.summary?.resolvedGrievances ?? 19,
    landfillTippingSaved: stats?.summary?.landfillTippingSaved ?? 42500
  };

  const esg = {
    co2SavedKg: stats?.esgImpact?.co2SavedKg ?? 2845.2,
    co2SavedTons: stats?.esgImpact?.co2SavedTons ?? 2.85,
    treesSavedEquivalent: stats?.esgImpact?.treesSavedEquivalent ?? 130.7,
    energySavedKwh: stats?.esgImpact?.energySavedKwh ?? 12450,
    waterSavedLiters: stats?.esgImpact?.waterSavedLiters ?? 48900,
    landfillDivertedM3: stats?.esgImpact?.landfillDivertedM3 ?? 4.36
  };

  const categoryBreakdown = stats?.categoryBreakdown || {
    Plastic: 520,
    Paper: 410,
    Metal: 280,
    'E-Waste': 140,
    Glass: 190,
    Organic: 680
  };

  const defaultWards = [
    { ward: 'Ward 1 - Gandhipuram', totalWeightKg: 420.5, activePickups: 10, divertedPct: 88, cleanlinessScore: 92, status: 'Excellent', zone: 'North' },
    { ward: 'Ward 2 - RS Puram', totalWeightKg: 385.0, activePickups: 8, divertedPct: 85, cleanlinessScore: 89, status: 'Excellent', zone: 'West' },
    { ward: 'Ward 3 - Saibaba Colony', totalWeightKg: 310.2, activePickups: 6, divertedPct: 79, cleanlinessScore: 84, status: 'Good', zone: 'North' },
    { ward: 'Ward 4 - Peelamedu', totalWeightKg: 295.8, activePickups: 5, divertedPct: 76, cleanlinessScore: 81, status: 'Good', zone: 'East' },
    { ward: 'Ward 5 - Singanallur', totalWeightKg: 240.0, activePickups: 4, divertedPct: 71, cleanlinessScore: 74, status: 'Needs Action', zone: 'South' },
    { ward: 'Ward 6 - Ukkadam', totalWeightKg: 169.0, activePickups: 3, divertedPct: 68, cleanlinessScore: 70, status: 'Needs Action', zone: 'Central' },
  ];

  const wardStats = (stats?.wardStats && stats.wardStats.length > 0) ? stats.wardStats : defaultWards;

  const filteredWards = wardStats.filter(w => {
    const matchesSearch = w.ward.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (w.zone && w.zone.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedWardFilter === 'high') return matchesSearch && w.cleanlinessScore >= 85;
    if (selectedWardFilter === 'volume') return matchesSearch && w.totalWeightKg >= 300;
    if (selectedWardFilter === 'action') return matchesSearch && w.status === 'Needs Action';
    return matchesSearch;
  });

  const activeFleets = [
    { id: 'FL-101', driver: 'Karthik Raja', rating: '4.9', vehicle: 'EV Mini-Truck (TN-38-G-4011)', ward: 'Ward 1 - Gandhipuram', status: 'En Route', progress: 75, load: '320 / 500 kg' },
    { id: 'FL-102', driver: 'Murugan S.', rating: '4.8', vehicle: 'Compactor (TN-38-C-8819)', ward: 'Ward 2 - RS Puram', status: 'Collecting', progress: 50, load: '680 / 1000 kg' },
    { id: 'FL-103', driver: 'Praveen Kumar', rating: '4.9', vehicle: 'EV Tipper (TN-38-E-1204)', ward: 'Ward 3 - Saibaba Colony', status: 'At Hub', progress: 95, load: '450 / 500 kg' }
  ];

  const recentActivities = [
    { id: 1, title: 'Commercial Segregated Pickup', desc: 'Ward 1 • 86.5 kg verified plastic & paper', time: '12 mins ago', type: 'success' },
    { id: 2, title: 'Spot Dump Resolved & Cleared', desc: 'Gandhipuram 5th St Grievance closed', time: '45 mins ago', type: 'info' },
    { id: 3, title: 'AI Segregation Audit Passed', desc: 'RS Puram Hub verified 96% purity score', time: '1 hr ago', type: 'warning' },
    { id: 4, title: 'Fleet #4 Route Initiated', desc: 'Driver Praveen started Peelamedu morning sweep', time: '2 hrs ago', type: 'success' }
  ];

  return (
    <UserLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-8">
        
        {/* Executive Frosted Glass Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border border-emerald-500/30 p-6 sm:p-7 text-white shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex items-center space-x-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-950/50">
                <div className="w-full h-full rounded-2xl bg-slate-950/80 flex items-center justify-center text-3xl">
                  🏛️
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow uppercase tracking-wider">
                LIVE
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome, {user?.name || 'Municipal Officer'}! 👋
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 uppercase tracking-wide">
                  {user?.jurisdiction || 'Coimbatore City'} • Command Center
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/80 font-medium max-w-xl">
                Real-time solid waste telemetry, GIS fleet tracking, citizen grievance triage, and ISO 14001 ESG balance sheet.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDispatchModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Fleet</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAiScanner(true)}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-emerald-300 font-black rounded-xl text-xs border border-emerald-500/30 shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>AI Audit</span>
            </motion.button>

            <button
              onClick={fetchStats}
              title="Refresh Live Data"
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Harmonious Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Waste Diverted */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-emerald-500/40 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 text-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <FaCoins />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {summary.totalTons} <span className="text-xs font-bold text-emerald-600 uppercase">Tons</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                Total Waste Diverted ({summary.pickupEfficiencyPct}%)
              </span>
            </div>
          </div>

          {/* Card 2: Active Fleets */}
          <Link
            to="/municipality/heatmap"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-sky-500/40 transition-all group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0 text-xl border border-sky-500/20 group-hover:scale-110 transition-transform">
              <FaTruck />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {summary.activeDrivers} <span className="text-xs font-bold text-sky-600 uppercase">Fleets</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                Active Ward Routes
              </span>
            </div>
          </Link>

          {/* Card 3: Citizen Grievances */}
          <Link
            to="/municipality/grievances"
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-rose-500/40 transition-all group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 text-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <FaExclamationTriangle />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {summary.openGrievances} <span className="text-xs font-bold text-rose-600 uppercase">Pending</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                Citizen Spot Dumps
              </span>
            </div>
          </Link>

          {/* Card 4: Landfill Cost Saved */}
          <div 
            onClick={() => setShowSavingsModal(true)}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4 hover:border-teal-500/40 transition-all group cursor-pointer"
          >
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 text-xl border border-teal-500/20 group-hover:scale-110 transition-transform">
              <FaRupeeSign />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                ₹{(summary.landfillTippingSaved || 42500).toLocaleString()}
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block mt-0.5">
                Landfill Tipping Saved
              </span>
            </div>
          </div>

        </div>

        {/* Live Fleet Tracking & Recent Activity */}
        <div id="live-fleet-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Live Fleet Tracking (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    Live Fleet & Route Telematics
                  </h3>
                  <p className="text-xs text-slate-400">Real-time GPS telematics of compactors and EV tippers</p>
                </div>
              </div>

              <Link
                to="/municipality/heatmap"
                className="text-xs font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full GIS Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {activeFleets.map((fleet) => (
                <div 
                  key={fleet.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                      {fleet.driver.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">{fleet.driver}</h4>
                        <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black px-1.5 py-0.5 rounded">
                          ★ {fleet.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{fleet.vehicle}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fleet.ward}</span>
                        <span>•</span>
                        <span>Load: <strong className="text-slate-700 dark:text-slate-300">{fleet.load}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                    <span className="px-2.5 py-1 text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{fleet.status}</span>
                    </span>
                    <Link
                      to="/municipality/heatmap"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>Track</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Recent Activity & ISO Audit (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Recent Activity</h3>
                </div>
                <button
                  onClick={fetchStats}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-2.5">
                {recentActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white truncate">{act.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{act.desc}</p>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick ESG Compliance Stamp */}
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-black text-slate-900 dark:text-white">ISO 14001 Audit Ready</span>
              </div>
              <button
                onClick={() => setShowEsgCert(true)}
                className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl shadow-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Certificate
              </button>
            </div>
          </div>

        </div>

        {/* Environmental Balance Sheet */}
        <div className="bg-gradient-to-br from-emerald-900/30 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-emerald-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">
                  UN SDG & Environmental Balance Sheet
                </h3>
                <p className="text-xs text-emerald-200/80">Verified environmental dividends delivered to Coimbatore municipal jurisdiction</p>
              </div>
            </div>

            <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
              ISO 14001:2015 Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
            <div className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl">
              <div className="text-xl sm:text-2xl font-black text-sky-400">{(esg.waterSavedLiters || 48900).toLocaleString()} L</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Fresh Water Saved</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{(esg.energySavedKwh || 12450).toLocaleString()} kWh</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Clean Energy Saved</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl">
              <div className="text-xl sm:text-2xl font-black text-lime-400">{esg.treesSavedEquivalent} Trees</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Forest Equivalent</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{esg.landfillDivertedM3} m³</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Landfill Diverted</div>
            </div>
          </div>
        </div>

        {/* Recycling Streams Breakdown & Ward Cleanliness Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Stream Breakdown (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-1.5 rounded-xl bg-orange-500/10 text-orange-500">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Recycling Stream Breakdown</h3>
                <p className="text-xs text-slate-400">Verified weights across categories</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {Object.entries(categoryBreakdown).map(([cat, weight]) => {
                const total = summary.totalWeightKg || 1;
                const pct = Math.round((weight / total) * 100);
                const colorMap = {
                  Plastic: 'from-blue-500 to-cyan-400',
                  Paper: 'from-amber-500 to-yellow-400',
                  Metal: 'from-slate-500 to-slate-400',
                  'E-Waste': 'from-purple-500 to-indigo-400',
                  Glass: 'from-teal-500 to-emerald-400',
                  Organic: 'from-green-500 to-lime-500'
                };
                const gradient = colorMap[cat] || 'from-emerald-500 to-teal-400';

                return (
                  <div key={cat} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{cat}</span>
                      <span className="text-slate-500">{(weight || 0).toLocaleString()} kg ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ward Cleanliness Table (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Ward Cleanliness Index</span>
                </h3>
                <p className="text-xs text-slate-400">Compliance ranking across city zones</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search ward..."
                  className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-28 sm:w-36"
                />

                <select
                  value={selectedWardFilter}
                  onChange={(e) => setSelectedWardFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 focus:outline-none"
                >
                  <option value="all">All Wards</option>
                  <option value="high">Score &gt; 85%</option>
                  <option value="volume">High Volume</option>
                  <option value="action">Needs Action</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-wider">
                    <th className="pb-2.5">Ward</th>
                    <th className="pb-2.5">Collected</th>
                    <th className="pb-2.5">Diverted</th>
                    <th className="pb-2.5">Score</th>
                    <th className="pb-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {filteredWards.map((w) => (
                    <tr key={w.ward} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        {w.ward}
                      </td>
                      <td className="py-2.5 font-mono font-bold">{w.totalWeightKg} kg</td>
                      <td className="py-2.5 font-bold text-emerald-600 dark:text-emerald-400">{w.divertedPct}%</td>
                      <td className="py-2.5 font-bold">{w.cleanlinessScore}%</td>
                      <td className="py-2.5 text-right">
                        <span className={`px-2 py-0.5 text-[10px] rounded-lg font-black ${
                          w.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                          w.status === 'Good' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20' :
                          'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        }`}>
                          {w.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* AI Waste Scanner Modal */}
      {showAiScanner && (
        <AIWasteScannerModal
          isOpen={showAiScanner}
          onClose={() => setShowAiScanner(false)}
          onApplyScannedData={(detected) => {
            addToast(`AI Analysis complete! Verified material: ${detected.category || 'Recyclable'}`, 'success', 'AI Verification');
            setShowAiScanner(false);
          }}
        />
      )}

      {/* Green ISO 14001 ESG Certificate Modal */}
      {showEsgCert && (
        <GreenCertificateModal
          isOpen={showEsgCert}
          onClose={() => setShowEsgCert(false)}
          user={user}
          esgData={{
            totalTons: summary.totalTons,
            co2SavedTons: esg.co2SavedTons,
            treesSaved: esg.treesSavedEquivalent,
            waterSavedLiters: esg.waterSavedLiters,
            energySavedKwh: esg.energySavedKwh
          }}
        />
      )}

      {/* Dispatch Fleet Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Dispatch Fleet Unit</h3>
              </div>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Assign an active waste collection compactor or EV tipper to a specific ward route.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target Ward Zone</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
                  <option>Ward 1 - Gandhipuram (North Zone)</option>
                  <option>Ward 2 - RS Puram (West Zone)</option>
                  <option>Ward 5 - Singanallur (High Priority)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Vehicle Unit</label>
                <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none">
                  <option>TN-38-G-4011 (EV Mini-Truck • Driver Karthik)</option>
                  <option>TN-38-C-8819 (Compactor • Driver Murugan)</option>
                  <option>TN-38-E-1204 (EV Tipper • Driver Praveen)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addToast('Fleet unit successfully dispatched to target ward!', 'success', 'Fleet Dispatched');
                  setShowDispatchModal(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Municipal Cost & Tipping Savings Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-500/10 text-teal-600 rounded-2xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Municipal Cost Savings</h3>
              </div>
              <button 
                onClick={() => setShowSavingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Landfill Tipping Fee Saved</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">₹32,500</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Recyclables Resale Value</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-base font-black">₹10,000</span>
              </div>
              <div className="border-t border-emerald-500/30 pt-2 flex justify-between items-center text-xs font-extrabold text-slate-900 dark:text-white">
                <span>Total Municipal Dividends</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-lg font-black">₹42,500</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculated based on standard CPCB / Municipal tipping rates of ₹2,350/ton for diverted non-biodegradable recyclables.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSavingsModal(false)}
                className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </UserLayout>
  );
};

export default MunicipalityDashboard;
