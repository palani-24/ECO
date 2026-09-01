import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { 
  FaTrophy, FaFire, FaBullseye, FaGift, FaCheckCircle, 
  FaStar, FaAward, FaBuilding, FaCrown, FaUsers, FaLeaf, FaMedal, FaBolt, FaShieldAlt,
  FaSearch, FaSyncAlt, FaArrowUp, FaRecycle, FaTree
} from 'react-icons/fa';
import { Award, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../utils/api';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatar';

const Leaderboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'societies' | 'badges'
  const [filter, setFilter] = useState('monthly'); // 'monthly' | 'allTime'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const userStreakWeeks = 4;
  const streakMultiplier = '1.5x Multiplier';

  // Fetch real users from backend API
  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/leaderboard');
      if (res.data?.success && res.data.data?.length > 0) {
        setLeaderboardData(res.data.data);
      } else {
        // Fallback default list with current user
        setLeaderboardData([
          { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, recycledKg: 142.5, tier: 'Recycling Champion', badge: '🏆 Gold Recycler' },
          { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, recycledKg: 107.0, tier: 'Eco Hero', badge: '🥇 Silver Recycler' },
          { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, recycledKg: 89.0, tier: 'Planet Saver', badge: '🥈 Bronze Recycler' },
          { rank: 4, name: user?.name || 'Palani M', avatar: user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Palani')}&background=10b981&color=fff`, points: user?.points || 10052, recycledKg: 310.2, tier: 'Eco Warrior', badge: '🎖️ Top Guardian', isCurrentUser: true },
          { rank: 5, name: 'Suresh Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', points: 1420, recycledKg: 71.0, tier: 'Eco Scout', badge: '🌱 Green Scout' },
          { rank: 6, name: 'Karthik Raja', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', points: 1150, recycledKg: 57.5, tier: 'Green Crusader', badge: '⭐ Rising Leaf' }
        ]);
      }
    } catch (err) {
      console.error('Failed to load real-time leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  // Real-Time Socket Updates
  useEffect(() => {
    if (realtimeData?.latestPickup || realtimeData?.lastPointsAwarded) {
      fetchLeaderboard();
    }
  }, [realtimeData?.latestPickup, realtimeData?.lastPointsAwarded]);

  // Society Leaderboard Data
  const societyLeaderboard = [
    { rank: 1, name: 'Metro Heights Eco Society', area: 'Anna Nagar, Chennai', members: 142, totalKg: 1840, points: 64400, badge: '🏆 Green Champion', purity: '98%' },
    { rank: 2, name: 'Hiranandani Parks Green Club', area: 'Oragadam, Chennai', members: 98, totalKg: 1420, points: 49700, badge: '🥈 Silver Warrior', purity: '95%' },
    { rank: 3, name: 'Appaswamy Trellis Community', area: 'Vadapalani, Chennai', members: 76, totalKg: 990, points: 34650, badge: '🥉 Bronze Crusader', purity: '92%' },
    { rank: 4, name: 'Ceebros Boulevard Green Team', area: 'Adyar, Chennai', members: 64, totalKg: 850, points: 29750, badge: '⭐ Eco Star', purity: '90%' },
    { rank: 5, name: 'Olympia Opaline Recyclers', area: 'Navalur OMR', members: 51, totalKg: 710, points: 24850, badge: '🌱 Rising Leaf', purity: '89%' }
  ];

  // Badges Data
  const unlockedBadges = [
    { id: 'b1', name: 'Zero-Waste Hero', desc: 'Recycled over 50 kg waste verified', icon: '🛡️', unlocked: true, date: '12 Aug 2026' },
    { id: 'b2', name: '4-Week Streak Flame', desc: 'Maintained 4 consecutive weeks recycling', icon: '🔥', unlocked: true, date: '18 Aug 2026' },
    { id: 'b3', name: 'Tree Guardian', desc: 'Saved 5 trees equivalent carbon offset', icon: '🌳', unlocked: true, date: '19 Aug 2026' },
    { id: 'b4', name: 'Metal Titan', desc: 'Recycled 25 kg metal & scrap items', icon: '⚙️', unlocked: true, date: '25 Aug 2026' },
    { id: 'b5', name: 'ESG Master', desc: 'Offset over 100 kg CO2 emissions', icon: '🌍', unlocked: false, progress: '78/100 kg' },
    { id: 'b6', name: 'E-Waste Savior', desc: 'Safe disposal of 5 hazardous electronics', icon: '💻', unlocked: false, progress: '3/5 items' }
  ];

  const filteredUsers = leaderboardData.filter(i => 
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.tier?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSocieties = societyLeaderboard.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredUsers.slice(0, 3);
  const remaining = filteredUsers.slice(3);

  return (
    <UserLayout>
      <div className="space-y-6 text-slate-800">
        
        {/* Curved Emerald Hero Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-sm border border-white/30 inline-flex items-center gap-1.5 shadow-sm">
              <FaTrophy className="text-amber-300" />
              <span>Real-Time Citizen Gamification</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Real User Eco Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 font-medium leading-relaxed">
              Live rankings of verified recycling citizens, residential societies, and active recycling streaks!
            </p>
          </div>

          {/* Active Streak Flame Card */}
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
              <p className="text-[11px] text-emerald-100 font-semibold">Streak Active • Next Goal: 5 Weeks (2.0x)</p>
            </div>
          </div>
        </div>

        {/* Tab Controls & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'individual'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FaTrophy className="w-4 h-4 text-amber-400" />
              Real Users Leaderboard ({leaderboardData.length})
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

          <div className="flex items-center gap-2">
            <button 
              onClick={fetchLeaderboard}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:text-emerald-600 border border-slate-200 text-xs transition"
              title="Refresh Live Data"
            >
              <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="relative">
              <FaSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name..."
                className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: REAL USER LEADERBOARD (Primary View) */}
        {/* ========================================================= */}
        {activeTab === 'individual' && (
          <div className="space-y-6">
            
            {/* Real User Top 3 Podium Highlights */}
            {top3.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                
                {/* Rank 2 (Silver) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm order-2 md:order-1 flex flex-col items-center text-center space-y-3 relative">
                  <span className="px-3 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-black shadow-xs">
                    #2 Silver Recycler
                  </span>
                  <img 
                    src={getAvatarUrl(top3[1].avatar, top3[1].name)} 
                    onError={(e) => handleAvatarError(e, top3[1].name)}
                    alt={top3[1].name} 
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-200 shadow-md" 
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{top3[1].name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{top3[1].tier || 'Eco Hero'}</p>
                  </div>
                  <div className="w-full p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-around text-xs font-bold">
                    <span className="text-slate-600">{(top3[1].recycledKg || top3[1].points * 0.15).toFixed(1)} kg</span>
                    <span className="text-emerald-600 font-black">+{(top3[1].points || 0).toLocaleString()} pts</span>
                  </div>
                </div>

                {/* Rank 1 (Gold Winner Podium) */}
                <div className="bg-gradient-to-br from-amber-400 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-xl order-1 md:order-2 flex flex-col items-center text-center space-y-3 relative transform md:-translate-y-2">
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
                  <span className="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md flex items-center gap-1">
                    <FaCrown className="w-3.5 h-3.5" />
                    <span>#1 Gold Champion</span>
                  </span>
                  <img 
                    src={getAvatarUrl(top3[0].avatar, top3[0].name)} 
                    onError={(e) => handleAvatarError(e, top3[0].name)}
                    alt={top3[0].name} 
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-300 shadow-xl" 
                  />
                  <div>
                    <h3 className="font-black text-white text-lg">{top3[0].name}</h3>
                    <p className="text-xs text-emerald-100 font-bold">{top3[0].tier || 'Recycling Master'}</p>
                  </div>
                  <div className="w-full p-3 bg-black/25 backdrop-blur-md rounded-2xl border border-white/20 flex justify-around text-xs font-extrabold text-white">
                    <span>{(top3[0].recycledKg || top3[0].points * 0.15).toFixed(1)} kg Recycled</span>
                    <span className="text-amber-300 font-black">+{(top3[0].points || 0).toLocaleString()} Pts</span>
                  </div>
                </div>

                {/* Rank 3 (Bronze) */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm order-3 md:order-3 flex flex-col items-center text-center space-y-3 relative">
                  <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                    #3 Bronze Recycler
                  </span>
                  <img 
                    src={getAvatarUrl(top3[2].avatar, top3[2].name)} 
                    onError={(e) => handleAvatarError(e, top3[2].name)}
                    alt={top3[2].name} 
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-200 shadow-md" 
                  />
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-base">{top3[2].name}</h3>
                    <p className="text-xs text-slate-400 font-bold">{top3[2].tier || 'Planet Saver'}</p>
                  </div>
                  <div className="w-full p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-around text-xs font-bold">
                    <span className="text-slate-600">{(top3[2].recycledKg || top3[2].points * 0.15).toFixed(1)} kg</span>
                    <span className="text-emerald-600 font-black">+{(top3[2].points || 0).toLocaleString()} pts</span>
                  </div>
                </div>

              </div>
            )}

            {/* Real User Leaderboard Full List */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <FaTrophy className="w-4 h-4 text-emerald-600" />
                  Real-Time Verified Eco-Warriors
                </h3>
                <span className="text-xs text-slate-400 font-semibold">Live Socket Sync Active</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {filteredUsers.map((item, idx) => {
                  const isMe = item.isCurrentUser || item._id === user?._id || item.name === user?.name;
                  return (
                    <div 
                      key={item._id || idx}
                      className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                        isMe 
                          ? 'bg-emerald-50 border-2 border-emerald-500/50 shadow-sm' 
                          : 'bg-slate-50 hover:bg-slate-100/80 border border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                          item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                          item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                          item.rank === 3 ? 'bg-amber-700 text-white' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {item.rank}
                        </span>

                        <img 
                          src={getAvatarUrl(item.avatar, item.name)} 
                          onError={(e) => handleAvatarError(e, item.name)}
                          alt={item.name} 
                          className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/20 shadow-xs" 
                        />

                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                            <span>{item.name}</span>
                            {isMe && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black">YOU</span>
                            )}
                          </h4>
                          <span className="text-xs text-slate-400 font-medium block">
                            {item.badge || '🌱 Eco Citizen'} • {item.recycledKg || (item.points * 0.15).toFixed(1)} kg Verified
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700 block">+{(item.points || 0).toLocaleString()} pts</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.tier || 'Eco Warrior'}</span>
                      </div>
                    </div>
                  );
                })}
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
        {/* TAB 3: BADGES & MILESTONES */}
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
