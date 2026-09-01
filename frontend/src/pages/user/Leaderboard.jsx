import React, { useState } from 'react';
import UserLayout from '../../components/UserLayout';
import { 
  FaTrophy, FaFire, FaBullseye, FaGift, FaCheckCircle, 
  FaStar, FaAward, FaBuilding, FaCrown, FaUsers, FaLeaf, FaMedal, FaBolt, FaShieldAlt,
  FaSearch, FaFilter, FaArrowUp, FaRecycle, FaTree
} from 'react-icons/fa';
import { Building2, Award, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('wards'); // 'wards' | 'societies' | 'individual' | 'badges'
  const [searchQuery, setSearchQuery] = useState('');

  const userStreakWeeks = 4;
  const streakMultiplier = '1.5x Multiplier';

  // 1. Municipal Ward-Wise Performance Ranking
  const wardLeaderboard = [
    { rank: 1, name: 'Ward 1 - Gandhipuram', zone: 'North Zone', totalKg: 4850.5, cleanliness: 94, purity: '96%', households: 3420, badge: '👑 Cleanest Ward 2026', points: 145000, trend: '+12%' },
    { rank: 2, name: 'Ward 2 - RS Puram', zone: 'West Zone', totalKg: 4210.0, cleanliness: 91, purity: '94%', households: 2890, badge: '🥈 Silver Eco Zone', points: 126000, trend: '+8%' },
    { rank: 3, name: 'Ward 3 - Saibaba Colony', zone: 'North Zone', totalKg: 3650.2, cleanliness: 88, purity: '91%', households: 2450, badge: '🥉 Bronze Segregator', points: 109500, trend: '+15%' },
    { rank: 4, name: 'Ward 4 - Peelamedu', zone: 'East Zone', totalKg: 3120.8, cleanliness: 84, purity: '88%', households: 2180, badge: '⭐ High Volume Hub', points: 93600, trend: '+5%' },
    { rank: 5, name: 'Ward 5 - Singanallur', zone: 'South Zone', totalKg: 2840.0, cleanliness: 79, purity: '82%', households: 1950, badge: '🌱 Rising Zone', points: 85200, trend: '+18%' },
    { rank: 6, name: 'Ward 6 - Saravanampatti', zone: 'East Zone', totalKg: 2490.0, cleanliness: 76, purity: '79%', households: 1680, badge: '🔄 Fast Improving', points: 74700, trend: '+22%' }
  ];

  // 2. Top Residential Societies
  const societyLeaderboard = [
    { rank: 1, name: 'Metro Heights Eco Society', area: 'Anna Nagar, Chennai', members: 142, totalKg: 1840, points: 64400, badge: '🏆 Green Champion', purity: '98%' },
    { rank: 2, name: 'Hiranandani Parks Green Club', area: 'Oragadam, Chennai', members: 98, totalKg: 1420, points: 49700, badge: '🥈 Silver Warrior', purity: '95%' },
    { rank: 3, name: 'Appaswamy Trellis Community', area: 'Vadapalani, Chennai', members: 76, totalKg: 990, points: 34650, badge: '🥉 Bronze Crusader', purity: '92%' },
    { rank: 4, name: 'Ceebros Boulevard Green Team', area: 'Adyar, Chennai', members: 64, totalKg: 850, points: 29750, badge: '⭐ Eco Star', purity: '90%' },
    { rank: 5, name: 'Olympia Opaline Recyclers', area: 'Navalur OMR', members: 51, totalKg: 710, points: 24850, badge: '🌱 Rising Leaf', purity: '89%' }
  ];

  // 3. Top Individual Citizens
  const individualLeaderboard = [
    { rank: 1, name: 'Karthik Raja', area: 'Gandhipuram', pickups: 42, totalKg: 420.5, points: 14850, badge: '👑 Master Recycler', avatar: 'K' },
    { rank: 2, name: 'Priya Sundaram', area: 'RS Puram', pickups: 38, totalKg: 385.0, points: 13200, badge: '🥈 Eco Warrior', avatar: 'P' },
    { rank: 3, name: 'Palani M (You)', area: 'Anna Nagar', pickups: 31, totalKg: 310.2, points: 10052, badge: '🥉 Top 3 Guardian', avatar: 'P', isCurrent: true },
    { rank: 4, name: 'Ramesh Babu', area: 'Peelamedu', pickups: 27, totalKg: 280.0, points: 9400, badge: '⭐ Star Recycler', avatar: 'R' },
    { rank: 5, name: 'Ananya Sharma', area: 'Saibaba Colony', pickups: 24, totalKg: 245.0, points: 8200, badge: '🌱 Eco Advocate', avatar: 'A' }
  ];

  // 4. Badges List
  const unlockedBadges = [
    { id: 'b1', name: 'Zero-Waste Hero', desc: 'Recycled over 50 kg waste verified', icon: '🛡️', unlocked: true, date: '12 Aug 2026' },
    { id: 'b2', name: '4-Week Streak Flame', desc: 'Maintained 4 consecutive weeks recycling', icon: '🔥', unlocked: true, date: '18 Aug 2026' },
    { id: 'b3', name: 'Tree Guardian', desc: 'Saved 5 trees equivalent carbon offset', icon: '🌳', unlocked: true, date: '19 Aug 2026' },
    { id: 'b4', name: 'Metal Titan', desc: 'Recycled 25 kg metal & scrap items', icon: '⚙️', unlocked: true, date: '25 Aug 2026' },
    { id: 'b5', name: 'ESG Master', desc: 'Offset over 100 kg CO2 emissions', icon: '🌍', unlocked: false, progress: '78/100 kg' },
    { id: 'b6', name: 'E-Waste Savior', desc: 'Safe disposal of 5 hazardous electronics', icon: '💻', unlocked: false, progress: '3/5 items' }
  ];

  // Filtered list based on search
  const filteredWards = wardLeaderboard.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.zone.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSocieties = societyLeaderboard.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.area.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredIndividuals = individualLeaderboard.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.area.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <UserLayout>
      <div className="space-y-6 text-slate-800">
        
        {/* Curved Emerald Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm border border-white/30 inline-flex items-center gap-1.5 shadow-sm">
              <FaTrophy className="text-amber-300" />
              <span>City Cleanliness & Segregation Rankings</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ward Leaderboard & Eco Champions Arena
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed">
              Track real-time ward segregation performance, residential society championships, and individual citizen recycling streaks!
            </p>
          </div>

          {/* Active Streak Badge */}
          <div className="bg-white/20 border border-white/30 p-4 rounded-2xl backdrop-blur-md flex items-center gap-3.5 shadow-md shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center text-2xl font-black shadow-inner">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white">{userStreakWeeks} Weeks Streak</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase">
                  {streakMultiplier}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-semibold">Keep recycling to unlock 2.0x bonus pool</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Search Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('wards')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'wards'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Ward Rankings ({wardLeaderboard.length})
            </button>
            <button
              onClick={() => setActiveTab('societies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'societies'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FaUsers className="w-4 h-4" />
              Society Battles
            </button>
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'individual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FaTrophy className="w-4 h-4" />
              Top Citizens
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'badges'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              Badges & Milestones
            </button>
          </div>

          <div className="relative">
            <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, area, or zone..."
              className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-60"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: MUNICIPAL WARD LEADERBOARD (Top Priority) */}
        {/* ========================================================= */}
        {activeTab === 'wards' && (
          <div className="space-y-6">
            
            {/* Top 3 Ward Podium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Rank 2 (Silver) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm order-2 md:order-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 font-black text-sm flex items-center justify-center border border-slate-200">
                    2
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                    {wardLeaderboard[1].badge}
                  </span>
                </div>
                <div className="my-4">
                  <h3 className="text-lg font-black text-slate-800">{wardLeaderboard[1].name}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{wardLeaderboard[1].zone} • {wardLeaderboard[1].households} Households</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Waste Diverted:</span>
                    <span className="text-slate-800 font-black">{wardLeaderboard[1].totalKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Cleanliness Score:</span>
                    <span className="text-emerald-600 font-black">{wardLeaderboard[1].cleanliness}%</span>
                  </div>
                </div>
              </div>

              {/* Rank 1 (Gold Winner Podium) */}
              <div className="bg-gradient-to-br from-amber-500 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl order-1 md:order-2 flex flex-col justify-between relative overflow-hidden transform md:-translate-y-2">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between z-10">
                  <span className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                    1 👑
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-extrabold rounded-full border border-white/30">
                    {wardLeaderboard[0].badge}
                  </span>
                </div>
                <div className="my-4 z-10">
                  <h3 className="text-xl font-black text-white">{wardLeaderboard[0].name}</h3>
                  <p className="text-xs text-emerald-100 font-bold mt-0.5">{wardLeaderboard[0].zone} • {wardLeaderboard[0].households} Households</p>
                </div>
                <div className="p-3.5 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 space-y-2 text-xs z-10">
                  <div className="flex justify-between font-bold">
                    <span className="text-emerald-100">Waste Diverted:</span>
                    <span className="text-white font-black text-sm">{wardLeaderboard[0].totalKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-emerald-100">Cleanliness Index:</span>
                    <span className="text-amber-300 font-black text-sm">{wardLeaderboard[0].cleanliness}% ({wardLeaderboard[0].purity} Purity)</span>
                  </div>
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm order-3 md:order-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center border border-amber-200">
                    3
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">
                    {wardLeaderboard[2].badge}
                  </span>
                </div>
                <div className="my-4">
                  <h3 className="text-lg font-black text-slate-800">{wardLeaderboard[2].name}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{wardLeaderboard[2].zone} • {wardLeaderboard[2].households} Households</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Waste Diverted:</span>
                    <span className="text-slate-800 font-black">{wardLeaderboard[2].totalKg.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Cleanliness Score:</span>
                    <span className="text-emerald-600 font-black">{wardLeaderboard[2].cleanliness}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ward Detailed Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  All Municipal Wards Performance Table
                </h3>
                <span className="text-xs text-slate-400 font-medium">Updated 15 mins ago</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                      <th className="pb-3">Rank & Ward</th>
                      <th className="pb-3">Zone</th>
                      <th className="pb-3">Total Diverted</th>
                      <th className="pb-3">Purity %</th>
                      <th className="pb-3">Cleanliness Score</th>
                      <th className="pb-3 text-right">Pool Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredWards.map((w) => (
                      <tr key={w.rank} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            w.rank === 1 ? 'bg-amber-400 text-slate-900' :
                            w.rank === 2 ? 'bg-slate-200 text-slate-800' :
                            w.rank === 3 ? 'bg-amber-200 text-amber-900' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {w.rank}
                          </span>
                          <span>{w.name}</span>
                        </td>
                        <td className="py-3.5 text-slate-500 font-semibold">{w.zone}</td>
                        <td className="py-3.5 font-mono font-bold text-slate-800">{(w.totalKg || 0).toLocaleString()} kg</td>
                        <td className="py-3.5 font-bold text-emerald-600">{w.purity}</td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-2 rounded-full bg-emerald-500"
                                style={{ width: `${w.cleanliness}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 text-xs">{w.cleanliness}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-black text-emerald-700">
                          +{(w.points || 0).toLocaleString()} pts
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RESIDENTIAL SOCIETIES */}
        {/* ========================================================= */}
        {activeTab === 'societies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSocieties.map((soc) => (
              <div key={soc.rank} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center ${
                    soc.rank === 1 ? 'bg-amber-400 text-slate-900' : 'bg-slate-100 text-slate-700'
                  }`}>
                    #{soc.rank}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {soc.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-slate-800 text-base">{soc.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{soc.area} • {soc.members} Households</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Total Waste:</span>
                    <span className="text-slate-800 font-black">{(soc.totalKg || 0).toLocaleString()} KG</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-500">Purity Score:</span>
                    <span className="text-emerald-600 font-black">{soc.purity}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Reward Pool:</span>
                    <span className="text-emerald-700 font-black">+{(soc.points || 0).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: INDIVIDUAL ECO-WARRIORS */}
        {/* ========================================================= */}
        {activeTab === 'individual' && (
          <div className="space-y-4">
            {filteredIndividuals.map((ind) => (
              <div 
                key={ind.rank} 
                className={`bg-white rounded-2xl p-4 border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  ind.isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-md' : 'border-slate-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center flex-shrink-0 ${
                    ind.rank === 1 ? 'bg-amber-400 text-slate-900' :
                    ind.rank === 2 ? 'bg-slate-200 text-slate-800' :
                    ind.rank === 3 ? 'bg-amber-200 text-amber-900' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {ind.rank}
                  </span>
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {ind.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm">{ind.name}</h4>
                      {ind.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white font-bold text-[10px] rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{ind.area} • {ind.pickups} Pickups Verified</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-800 block">{(ind.totalKg || 0).toLocaleString()} kg</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Recycled</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-emerald-700 block">+{(ind.points || 0).toLocaleString()} pts</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Points</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BADGES & MILESTONES */}
        {/* ========================================================= */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {unlockedBadges.map((b) => (
              <div 
                key={b.id} 
                className={`rounded-3xl p-6 border transition flex items-start gap-4 ${
                  b.unlocked 
                    ? 'bg-white border-slate-100 shadow-sm hover:shadow-md' 
                    : 'bg-slate-50/80 border-dashed border-slate-200 opacity-60'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl flex-shrink-0 border border-emerald-100 shadow-xs">
                  {b.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-800 text-sm">{b.name}</h4>
                    {b.unlocked ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Unlocked</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Locked</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{b.desc}</p>
                  <span className="text-[10px] font-bold text-slate-400 mt-2 block">
                    {b.unlocked ? `Achieved on ${b.date}` : `Progress: ${b.progress}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </UserLayout>
  );
};

export default Leaderboard;
