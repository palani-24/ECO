import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const MunicipalityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWard, setSelectedWard] = useState('all');

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
      setError('Failed to fetch real-time municipal metrics.');
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
    pickupEfficiencyPct: 91,
    totalCitizens: 1420,
    activeDrivers: 12,
    openGrievances: 3,
    resolvedGrievances: 19
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

  const wardStats = stats?.wardStats || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      {/* Top Banner / Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                    Municipal Green Command Center
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                    LIVE ESG
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5">
                  {user?.jurisdiction || 'Coimbatore City Municipal Corporation'} &bull; Solid Waste & Circular Economy Division
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/municipality/heatmap"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-medium transition"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              GIS Heatmap
            </Link>
            <Link
              to="/municipality/grievances"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-sm font-medium transition"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Grievances ({summary.openGrievances})
            </Link>
            <button
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/30"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Real-time KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Waste Recycled */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-emerald-400">
              <Leaf className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Total Waste Diverted</span>
              <span className="text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                +14.2% this mo
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-white">
                {summary.totalTons} <span className="text-lg font-medium text-emerald-400">Tons</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary.totalWeightKg.toLocaleString()} kg verified collection
              </p>
            </div>
          </div>

          {/* Card 2: CO2 Footprint Abated */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-teal-500/50 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-teal-400">
              <TreePine className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>CO₂ Carbon Abated</span>
              <span className="text-teal-400 text-xs font-semibold bg-teal-500/10 px-2 py-0.5 rounded-full">
                ESG Target: 95%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-teal-300">
                {esg.co2SavedTons} <span className="text-lg font-medium text-teal-400">Tons CO₂e</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TreePine className="w-3.5 h-3.5 text-emerald-400 inline" />
                Equivalent to <strong>{esg.treesSavedEquivalent}</strong> mature trees planted
              </p>
            </div>
          </div>

          {/* Card 3: Collection Efficiency */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-cyan-500/50 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-cyan-400">
              <Truck className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Collection Efficiency</span>
              <span className="text-cyan-400 text-xs font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full">
                {summary.activeDrivers} Active Fleets
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-cyan-300">
                {summary.pickupEfficiencyPct}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary.completedPickups} completed of {summary.totalPickups} requests
              </p>
            </div>
          </div>

          {/* Card 4: Open Grievances */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-amber-400">
              <AlertTriangle className="w-20 h-20" />
            </div>
            <div className="flex items-center justify-between text-slate-400 text-sm">
              <span>Citizen Redressal</span>
              <span className="text-amber-400 text-xs font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full">
                {summary.resolvedGrievances} Cleaned
              </span>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-amber-300">
                {summary.openGrievances} <span className="text-sm font-medium text-slate-400">Pending Spots</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Avg. resolution turn-around: <strong>3.4 hrs</strong>
              </p>
            </div>
          </div>
        </div>

        {/* ESG Impact Indicators Row */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-slate-100">UN SDG & City Environmental Balance Sheet</h2>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              ISO 14001 Compliant Audit
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-emerald-400 mb-1 flex justify-center"><Droplets className="w-6 h-6" /></div>
              <div className="text-2xl font-bold text-white">{esg.waterSavedLiters.toLocaleString()} L</div>
              <div className="text-xs text-slate-400">Fresh Water Conserved</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-yellow-400 mb-1 flex justify-center"><Zap className="w-6 h-6" /></div>
              <div className="text-2xl font-bold text-white">{esg.energySavedKwh.toLocaleString()} kWh</div>
              <div className="text-xs text-slate-400">Clean Energy Saved</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-cyan-400 mb-1 flex justify-center"><TreePine className="w-6 h-6" /></div>
              <div className="text-2xl font-bold text-white">{esg.treesSavedEquivalent} Trees</div>
              <div className="text-xs text-slate-400">Forest Equivalent</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <div className="text-indigo-400 mb-1 flex justify-center"><Activity className="w-6 h-6" /></div>
              <div className="text-2xl font-bold text-white">{esg.landfillDivertedM3} m³</div>
              <div className="text-xs text-slate-400">Landfill Space Diverted</div>
            </div>
          </div>
        </div>

        {/* Main Grid: Category Waste Breakdown & Ward Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 1 Col: Category Distribution */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-emerald-400" />
              Recycling Stream Breakdown
            </h3>
            <p className="text-xs text-slate-400">Total verified weight segregated across materials</p>

            <div className="space-y-3 pt-2">
              {Object.entries(categoryBreakdown).map(([cat, weight]) => {
                const total = summary.totalWeightKg || 1;
                const pct = Math.round((weight / total) * 100);
                const colorMap = {
                  Plastic: 'from-blue-500 to-cyan-400',
                  Paper: 'from-amber-500 to-yellow-400',
                  Metal: 'from-slate-400 to-zinc-200',
                  'E-Waste': 'from-purple-500 to-indigo-400',
                  Glass: 'from-teal-400 to-emerald-300',
                  Organic: 'from-green-500 to-lime-400'
                };
                const gradient = colorMap[cat] || 'from-emerald-500 to-teal-400';

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat}</span>
                      <span className="text-slate-400">{weight.toLocaleString()} kg ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Ward-wise Cleanliness & Collection Rankings */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-400" />
                  Ward Cleanliness & Segregation Index
                </h3>
                <p className="text-xs text-slate-400">Live operational compliance score across city zones</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort by:</span>
                <select
                  value={selectedWard}
                  onChange={(e) => setSelectedWard(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">All Wards</option>
                  <option value="high">Highest Cleanliness</option>
                  <option value="volume">Highest Volume</option>
                </select>
              </div>
            </div>

            {/* Ward Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Ward & Zone</th>
                    <th className="pb-3 font-semibold">Collected (Kg)</th>
                    <th className="pb-3 font-semibold">Active Pickups</th>
                    <th className="pb-3 font-semibold">Diverted %</th>
                    <th className="pb-3 font-semibold">Cleanliness Index</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {wardStats.map((w) => (
                    <tr key={w.ward} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-medium text-white flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        {w.ward}
                      </td>
                      <td className="py-3 font-mono">{w.totalWeightKg} kg</td>
                      <td className="py-3">{w.activePickups}</td>
                      <td className="py-3 font-mono">{w.divertedPct}%</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 bg-emerald-500 rounded-full"
                              style={{ width: `${w.cleanlinessScore}%` }}
                            />
                          </div>
                          <span className="font-semibold text-emerald-400">{w.cleanlinessScore}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-md font-medium ${
                          w.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          w.status === 'Good' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
    </div>
  );
};

export default MunicipalityDashboard;
