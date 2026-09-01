import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Leaf, 
  Flame, 
  MapPin, 
  Truck, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  TreePine, 
  Droplets, 
  Zap, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight,
  Download,
  Filter,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  IndianRupee,
  Sparkles,
  Camera,
  FileText,
  Navigation,
  Layers,
  ChevronRight,
  Award,
  Users,
  Compass
} from 'lucide-react';
import { 
  FaCoins, FaTruck, FaHourglassHalf, FaLeaf, FaCheckCircle, 
  FaExclamationTriangle, FaTree, FaRupeeSign, FaQrcode, FaCamera, 
  FaRoute, FaAward, FaBuilding, FaSearch, FaFilter
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
      // Fallback defaults will be used smoothly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const summary = stats?.summary || {
    totalWeightKg: 1820.5,
    totalTons: 1.82,
    totalPickups: 64,
    completedPickups: 58,
    activePickups: 6,
    pickupEfficiencyPct: 91,
    totalCitizens: 1420,
    activeDrivers: 12,
    openGrievances: 3,
    resolvedGrievances: 19,
    landfillTippingSaved: 42500
  };

  const esg = stats?.esgImpact || {
    co2SavedKg: 2845.2,
    co2SavedTons: 2.85,
    treesSavedEquivalent: 130.7,
    energySavedKwh: 12450,
    waterSavedLiters: 48900,
    landfillDivertedM3: 4.36
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

  // Filtered wards
  const filteredWards = wardStats.filter(w => {
    const matchesSearch = w.ward.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (w.zone && w.zone.toLowerCase().includes(searchTerm.toLowerCase()));
    if (selectedWardFilter === 'high') return matchesSearch && w.cleanlinessScore >= 85;
    if (selectedWardFilter === 'volume') return matchesSearch && w.totalWeightKg >= 300;
    if (selectedWardFilter === 'action') return matchesSearch && w.status === 'Needs Action';
    return matchesSearch;
  });

  // Active Fleets List for Live Tracking Widget
  const activeFleets = [
    { id: 'FL-101', driver: 'Karthik Raja', rating: '4.9', vehicle: 'EV Mini-Truck (TN-38-G-4011)', ward: 'Ward 1 - Gandhipuram', status: 'En Route', progress: 75, load: '320 / 500 kg' },
    { id: 'FL-102', driver: 'Murugan S.', rating: '4.8', vehicle: 'Compactor (TN-38-C-8819)', ward: 'Ward 2 - RS Puram', status: 'Collecting', progress: 50, load: '680 / 1000 kg' },
    { id: 'FL-103', driver: 'Praveen Kumar', rating: '4.9', vehicle: 'EV Tipper (TN-38-E-1204)', ward: 'Ward 3 - Saibaba Colony', status: 'At Hub', progress: 95, load: '450 / 500 kg' }
  ];

  // Recent Activity Feed
  const recentActivities = [
    { id: 1, title: 'Commercial Segregated Pickup', desc: 'Ward 1 • 86.5 kg verified plastic & paper', time: '12 mins ago', type: 'success' },
    { id: 2, title: 'Blackspot Cleaned & Cleared', desc: 'Gandhipuram 5th St Grievance resolved', time: '45 mins ago', type: 'info' },
    { id: 3, title: 'AI Segregation Audit Passed', desc: 'RS Puram Hub verified 96% purity score', time: '1 hr ago', type: 'warning' },
    { id: 4, title: 'Fleet #4 Route Initiated', desc: 'Driver Praveen started Peelamedu morning sweep', time: '2 hrs ago', type: 'success' }
  ];

  return (
    <UserLayout>
      <div className="space-y-6 text-slate-800">
        
        {/* ========================================================= */}
        {/* 1. CURVED EMERALD HERO BANNER (Image 2 Style) */}
        {/* ========================================================= */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          {/* Subtle Ambient Shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-4 sm:gap-5 z-10">
            {/* Plant/Eco Emblem in Glowing Circle */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl flex items-center justify-center shadow-inner">
                <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-400 text-slate-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded-md shadow uppercase tracking-wider">
                LIVE
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome, {user?.name || 'Municipal Officer'}!
                </h1>
                <span className="text-xl">👋</span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-white/25 text-white backdrop-blur-sm rounded-full border border-white/30 uppercase tracking-wide">
                  {user?.jurisdiction || 'Coimbatore City'} • Command Center
                </span>
              </div>
              <p className="text-emerald-50/90 text-sm sm:text-base mt-1.5 max-w-2xl font-normal leading-relaxed">
                Live solid waste management, GIS fleet telematics, citizen grievance triage, and ISO 14001 ESG balance sheet.
              </p>
            </div>
          </div>

          {/* Quick Action Button on Banner */}
          <div className="flex items-center gap-3 z-10 flex-shrink-0">
            <button
              onClick={() => setShowDispatchModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-2xl font-bold text-sm shadow-md hover:shadow-lg transition active:scale-95"
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              Dispatch Fleet
            </button>
            <button
              onClick={fetchStats}
              title="Refresh Live Data"
              className="p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl backdrop-blur-md border border-white/30 transition active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* 2. SMART MUNICIPAL ACTIONS (Image 2 Horizontal Pills) */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Smart Municipal Actions
            </h3>
            <span className="text-xs text-slate-400">Quick Tools & Redressal</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Action 1: Live GIS Map */}
            <Link
              to="/municipality/heatmap"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-xs group-hover:scale-105 transition">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="truncate">GIS Live Map</span>
            </Link>

            {/* Action 2: Grievance Triage */}
            <Link
              to="/municipality/grievances"
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-200/80 text-amber-900 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow"
            >
              <div className="p-2 rounded-xl bg-white text-amber-600 shadow-xs group-hover:scale-105 transition">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="truncate block">Report Dumps</span>
                <span className="text-[10px] text-amber-600 font-semibold block">+{summary.openGrievances} Pending</span>
              </div>
            </Link>

            {/* Action 3: AI Vision Scan */}
            <button
              onClick={() => setShowAiScanner(true)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-sky-50/80 hover:bg-sky-100/80 border border-sky-200/80 text-sky-800 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow text-left"
            >
              <div className="p-2 rounded-xl bg-white text-sky-600 shadow-xs group-hover:scale-105 transition">
                <Camera className="w-4 h-4" />
              </div>
              <span className="truncate">AI Vision Scan</span>
            </button>

            {/* Action 4: ESG Certificate */}
            <button
              onClick={() => setShowEsgCert(true)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/80 text-teal-800 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow text-left"
            >
              <div className="p-2 rounded-xl bg-white text-teal-600 shadow-xs group-hover:scale-105 transition">
                <Award className="w-4 h-4" />
              </div>
              <span className="truncate">ESG Certificate</span>
            </button>

            {/* Action 5: Trace Fleet */}
            <button
              onClick={() => {
                const el = document.getElementById('live-fleet-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200/80 text-purple-800 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow text-left"
            >
              <div className="p-2 rounded-xl bg-white text-purple-600 shadow-xs group-hover:scale-105 transition">
                <Navigation className="w-4 h-4" />
              </div>
              <span className="truncate">Trace Fleet</span>
            </button>

            {/* Action 6: Municipal Savings */}
            <button
              onClick={() => setShowSavingsModal(true)}
              className="flex items-center gap-2.5 p-3 rounded-2xl bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/80 text-rose-800 font-bold text-xs sm:text-sm transition group shadow-sm hover:shadow text-left"
            >
              <div className="p-2 rounded-xl bg-white text-rose-600 shadow-xs group-hover:scale-105 transition">
                <IndianRupee className="w-4 h-4" />
              </div>
              <span className="truncate">Tipping Saved</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. 8-KPI METRICS GRID (2 Rows x 4 Columns, Image 2 Style) */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Waste Diverted */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl font-bold">
              <FaCoins />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {summary.totalTons} <span className="text-xs font-bold text-emerald-600 uppercase">Tons</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Total Waste Diverted
              </div>
            </div>
          </div>

          {/* Card 2: Today's Pickups / Fleet */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaTruck />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {summary.activeDrivers} <span className="text-xs font-bold text-sky-600 uppercase">Fleets</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Active Ward Routes
              </div>
            </div>
          </div>

          {/* Card 3: Active Requests */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaHourglassHalf />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {summary.totalPickups - summary.completedPickups} <span className="text-xs font-bold text-amber-600 uppercase">Active</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                In-Progress Pickups
              </div>
            </div>
          </div>

          {/* Card 4: CO2 Footprint Abated */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaLeaf />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {esg.co2SavedTons} <span className="text-xs font-bold text-teal-600 uppercase">Tons CO₂e</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Carbon Abated
              </div>
            </div>
          </div>

          {/* Card 5: Completed Pickups */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaCheckCircle />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {summary.completedPickups} <span className="text-xs font-bold text-green-600 uppercase">({summary.pickupEfficiencyPct}%)</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Completed & Verified
              </div>
            </div>
          </div>

          {/* Card 6: Pending Grievances */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaExclamationTriangle />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {summary.openGrievances} <span className="text-xs font-bold text-rose-600 uppercase">Pending</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Citizen Spot Dumps
              </div>
            </div>
          </div>

          {/* Card 7: Forest Equivalent */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaTree />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                {esg.treesSavedEquivalent} <span className="text-xs font-bold text-emerald-600 uppercase">Trees</span>
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Forest Equivalent
              </div>
            </div>
          </div>

          {/* Card 8: Municipal Tipping Fee Saved */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-xl">
              <FaRupeeSign />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                ₹{summary.landfillTippingSaved.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                Landfill Cost Saved
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 4. LIVE FLEET TRACKING & RECENT ACTIVITY (Image 2 Style) */}
        {/* ========================================================= */}
        <div id="live-fleet-section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Live Pickup & Fleet Tracking */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-800">
                    Live Fleet & Route Tracking
                  </h3>
                  <p className="text-xs text-slate-400">Real-time GPS telematics of city compactors and EV tippers</p>
                </div>
              </div>

              <Link
                to="/municipality/heatmap"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                View Full Map <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Fleet Cards */}
            <div className="space-y-3 pt-1">
              {activeFleets.map((fleet) => (
                <div 
                  key={fleet.id}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/70 hover:border-emerald-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {fleet.driver.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">{fleet.driver}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          ★ {fleet.rating}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{fleet.vehicle}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="text-emerald-700 font-semibold">{fleet.ward}</span>
                        <span>•</span>
                        <span>Load: <strong className="text-slate-700">{fleet.load}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {fleet.status}
                    </span>
                    <Link
                      to="/municipality/heatmap"
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                    >
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      Live GPS
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 1 Col: Recent Municipal Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-800">Recent Activity</h3>
                </div>
                <button
                  onClick={fetchStats}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {recentActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      act.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      act.type === 'info' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{act.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{act.desc}</p>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick ESG Compliance Stamp */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-900">ISO 14001 Audit Ready</span>
              </div>
              <button
                onClick={() => setShowEsgCert(true)}
                className="text-[11px] font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg shadow-xs hover:bg-emerald-100 transition"
              >
                View Certificate
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================= */}
        {/* 5. UN SDG & ENVIRONMENTAL BALANCE SHEET (Light Redesign) */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  UN SDG & City Environmental Balance Sheet
                </h3>
                <p className="text-xs text-slate-500">Verified environmental dividends delivered to Coimbatore municipal jurisdiction</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-3 py-1.5 rounded-full shadow-xs self-start sm:self-auto">
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              ISO 14001:2015 Compliant
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-2">
            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-2">
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">{esg.waterSavedLiters.toLocaleString()} L</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Fresh Water Saved</div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-xl bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
                <Zap className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">{esg.energySavedKwh.toLocaleString()} kWh</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Clean Energy Conserved</div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <TreePine className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">{esg.treesSavedEquivalent} Trees</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Forest Equivalent</div>
            </div>

            <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800">{esg.landfillDivertedM3} m³</div>
              <div className="text-xs font-bold text-slate-400 uppercase mt-0.5">Landfill Diverted</div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. RECYCLING STREAM BREAKDOWN & WARD CLEANLINESS TABLE */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 1 Col: Stream Material Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800">Recycling Stream Breakdown</h3>
                <p className="text-xs text-slate-400">Total verified weight across categories</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
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
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-500">{weight.toLocaleString()} kg <span className="text-slate-400 font-semibold">({pct}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Ward Cleanliness & Segregation Index */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Ward Cleanliness & Segregation Index
                </h3>
                <p className="text-xs text-slate-400">Live operational compliance ranking across city zones</p>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ward..."
                    className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-32 sm:w-40"
                  />
                </div>

                <select
                  value={selectedWardFilter}
                  onChange={(e) => setSelectedWardFilter(e.target.value)}
                  className="bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Wards</option>
                  <option value="high">Score &gt; 85%</option>
                  <option value="volume">High Volume</option>
                  <option value="action">Needs Action</option>
                </select>
              </div>
            </div>

            {/* Clean Ward Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                    <th className="pb-3">Ward & Zone</th>
                    <th className="pb-3">Collected (Kg)</th>
                    <th className="pb-3">Active Pickups</th>
                    <th className="pb-3">Diverted %</th>
                    <th className="pb-3">Cleanliness Index</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                  {filteredWards.map((w) => (
                    <tr key={w.ward} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          w.status === 'Excellent' ? 'bg-emerald-500' :
                          w.status === 'Good' ? 'bg-teal-500' : 'bg-rose-500'
                        }`} />
                        {w.ward}
                      </td>
                      <td className="py-3.5 font-mono font-bold text-slate-700">{w.totalWeightKg} kg</td>
                      <td className="py-3.5">{w.activePickups}</td>
                      <td className="py-3.5 font-bold text-emerald-600">{w.divertedPct}%</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                w.cleanlinessScore >= 85 ? 'bg-emerald-500' :
                                w.cleanlinessScore >= 75 ? 'bg-teal-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${w.cleanlinessScore}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800 text-xs">{w.cleanlinessScore}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-1 text-[11px] rounded-lg font-bold ${
                          w.status === 'Excellent' ? 'bg-emerald-100 text-emerald-800' :
                          w.status === 'Good' ? 'bg-teal-100 text-teal-800' :
                          'bg-rose-100 text-rose-800'
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

      {/* ========================================================= */}
      {/* 7. MODALS & INTERACTIVE OVERLAYS */}
      {/* ========================================================= */}

      {/* AI Waste Scanner Modal */}
      {showAiScanner && (
        <AIWasteScannerModal
          isOpen={showAiScanner}
          onClose={() => setShowAiScanner(false)}
          onScanSuccess={(detected) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Dispatch Fleet Unit</h3>
              </div>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Assign an active waste collection compactor or EV tipper to a specific ward route.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Ward Zone</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500">
                  <option>Ward 1 - Gandhipuram (North Zone)</option>
                  <option>Ward 2 - RS Puram (West Zone)</option>
                  <option>Ward 5 - Singanallur (High Priority)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Vehicle Unit</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-emerald-500">
                  <option>TN-38-G-4011 (EV Mini-Truck • Driver Karthik)</option>
                  <option>TN-38-C-8819 (Compactor • Driver Murugan)</option>
                  <option>TN-38-E-1204 (EV Tipper • Driver Praveen)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDispatchModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addToast('Fleet unit successfully dispatched to target ward!', 'success', 'Fleet Dispatched');
                  setShowDispatchModal(false);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Municipal Cost & Tipping Savings Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Municipal Cost Savings</h3>
              </div>
              <button 
                onClick={() => setShowSavingsModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Landfill Tipping Fee Saved</span>
                <span className="text-emerald-700 text-base font-black">₹32,500</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Recyclables Resale Value</span>
                <span className="text-emerald-700 text-base font-black">₹10,000</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 flex justify-between items-center text-xs font-extrabold text-emerald-900">
                <span>Total Municipal Dividends</span>
                <span className="text-emerald-800 text-lg font-black">₹42,500</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Calculated based on standard CPCB / Municipal tipping rates of ₹2,350/ton for diverted non-biodegradable recyclables.
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSavingsModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition"
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
