import React, { useState } from 'react';
import UserLayout from '../../components/UserLayout';
import LeaderboardWidget from '../../components/LeaderboardWidget';
import { 
  FaTrophy, FaFire, FaBullseye, FaGift, FaCheckCircle, 
  FaStar, FaAward, FaBuilding, FaCrown, FaUsers, FaLeaf, FaMedal, FaBolt, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('individual'); // 'individual' | 'societies' | 'badges'

  const userStreakWeeks = 4; // 4 Weeks active recycling streak
  const streakMultiplier = '1.5x Multiplier';

  const weeklyChallenges = [
    {
      id: 1,
      title: 'Plastic Hero Challenge',
      desc: 'Recycle 5 kg of plastic PET materials this week.',
      progress: 4.2,
      target: 5.0,
      reward: 150,
      unit: 'kg'
    },
    {
      id: 2,
      title: 'Zero E-Waste Week',
      desc: 'Handover 1 old gadget or battery for safe recycling.',
      progress: 1,
      target: 1,
      completed: true,
      reward: 250,
      unit: 'item'
    },
    {
      id: 3,
      title: 'Cardboard & Paper Stacker',
      desc: 'Collect & recycle 10 kg clean carton boxes.',
      progress: 6.8,
      target: 10.0,
      reward: 200,
      unit: 'kg'
    }
  ];

  const societyLeaderboard = [
    { rank: 1, name: 'Metro Heights Eco Society', area: 'Anna Nagar, Chennai', members: 142, totalKg: 1840, points: 64400, badge: '🏆 Green Champion' },
    { rank: 2, name: 'Hiranandani Parks Green Club', area: 'Oragadam', members: 98, totalKg: 1420, points: 49700, badge: '🥈 Silver Warrior' },
    { rank: 3, name: 'Appaswamy Trellis Community', area: 'Vadapalani', members: 76, totalKg: 990, points: 34650, badge: '🥉 Bronze Crusader' },
    { rank: 4, name: 'Ceebros Boulevard Green Team', area: 'Adyar', members: 64, totalKg: 850, points: 29750, badge: '⭐ Eco Star' },
    { rank: 5, name: 'Olympia Opaline Recyclers', area: 'Navalur OMR', members: 51, totalKg: 710, points: 24850, badge: '🌱 Rising Leaf' }
  ];

  const unlockedBadges = [
    { id: 'b1', name: 'Zero-Waste Hero', desc: 'Recycled over 50 kg waste', icon: '🛡️', unlocked: true, date: '12 Aug 2026' },
    { id: 'b2', name: '4-Week Streak Flame', desc: 'Maintained 4 consecutive weeks', icon: '🔥', unlocked: true, date: '18 Aug 2026' },
    { id: 'b3', name: 'Tree Guardian', desc: 'Planted real living tree', icon: '🌳', unlocked: true, date: '19 Aug 2026' },
    { id: 'b4', name: 'Metal Titan', desc: 'Recycled 25 kg metal & scrap', icon: '⚙️', unlocked: false, progress: '18/25 kg' },
    { id: 'b5', name: 'ESG Master', desc: 'Offset over 100 kg CO2 emissions', icon: '🌍', unlocked: false, progress: '78/100 kg' },
    { id: 'b6', name: 'E-Waste Savior', desc: 'Safe disposal of 5 electronics', icon: '💻', unlocked: false, progress: '3/5 items' }
  ];

  return (
    <UserLayout>
      <div className="space-y-6 min-w-0">
        
        {/* Header Banner with Active Streak & Multiplier */}
        <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="relative z-10 space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur border border-white/20 inline-flex items-center space-x-1">
              <FaTrophy className="text-amber-300" />
              <span>Citizen Gamification & Leaderboards</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">Eco Champions & Society Battles</h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Compete with neighbors, keep your weekly recycling streak alive, and win community reward pools!
            </p>
          </div>

          {/* Active Streak Flame Card */}
          <div className="bg-slate-950/60 border border-white/20 p-4 rounded-2xl backdrop-blur-md flex items-center space-x-3.5 shadow-lg shrink-0">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-2xl animate-pulse shadow-md">
              🔥
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg text-white">{userStreakWeeks} Weeks</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                  {streakMultiplier}
                </span>
              </div>
              <p className="text-[10px] text-emerald-300 font-bold">Streak Active • Next Goal: 5 Weeks (2.0x)</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center space-x-2 bg-slate-200/80 dark:bg-slate-800/80 p-1.5 rounded-2xl text-xs font-black max-w-md">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'individual'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FaCrown className="h-3.5 w-3.5" />
            <span>City Top Recyclers</span>
          </button>

          <button
            onClick={() => setActiveTab('societies')}
            className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'societies'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FaBuilding className="h-3.5 w-3.5" />
            <span>Society Battles</span>
          </button>

          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-2 rounded-xl text-center transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'badges'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <FaMedal className="h-3.5 w-3.5" />
            <span>My Badges</span>
          </button>
        </div>

        {/* TAB 1: INDIVIDUAL CITIZEN LEADERBOARD */}
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            <div className="lg:col-span-2 space-y-6">
              <LeaderboardWidget />
            </div>

            {/* Weekly Quests */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="h-9 w-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
                    <FaFire />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">Weekly Eco Quests</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Resets every Sunday midnight</span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {weeklyChallenges.map((challenge) => {
                    const percent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
                    return (
                      <div key={challenge.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                              <span>{challenge.title}</span>
                              {challenge.completed && <FaCheckCircle className="text-emerald-500 text-xs" />}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-medium pt-0.5">{challenge.desc}</p>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-black text-[10px]">
                            +{challenge.reward} Pts
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[9px] font-bold text-slate-400">
                            <span>Progress: {challenge.progress} / {challenge.target} {challenge.unit}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${challenge.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-400 to-emerald-500'}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIETY VS SOCIETY BATTLES */}
        {activeTab === 'societies' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <FaBuilding className="text-emerald-500" />
                    <span>Apartment & Gated Society Championship</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rankings based on collective monthly recycling volume (KG) and active citizen participation.</p>
                </div>

                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-full border border-emerald-500/20">
                  Monthly Pool: ₹25,000 Green Fund
                </span>
              </div>

              {/* Societies Table */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {societyLeaderboard.map((soc) => (
                  <div key={soc.rank} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 rounded-2xl px-3 transition-colors">
                    <div className="flex items-center space-x-3.5">
                      <div className={`h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                        soc.rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md' :
                        soc.rank === 2 ? 'bg-slate-300 text-slate-900' :
                        soc.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        #{soc.rank}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{soc.name}</span>
                          <span className="px-2 py-0.2 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full">
                            {soc.badge}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">{soc.area} • {soc.members} Active Households</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 sm:text-right">
                      <div>
                        <span className="font-black text-sm text-slate-900 dark:text-white block">{(soc.totalKg || 0).toLocaleString()} KG</span>
                        <span className="text-[10px] text-slate-400 font-bold">Waste Diverted</span>
                      </div>

                      <div>
                        <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 block">{(soc.points || 0).toLocaleString()} pts</span>
                        <span className="text-[10px] text-slate-400 font-bold">Total Pool</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BADGES & HONORS SHOWCASE */}
        {activeTab === 'badges' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <FaMedal className="text-amber-500" />
                  <span>Achievement Badges & Eco Honors</span>
                </h3>
                <p className="text-xs text-slate-400">Unlock special digital badges and level up your citizen sustainability tier.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedBadges.map((b) => (
                  <div
                    key={b.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      b.unlocked
                        ? 'bg-gradient-to-br from-emerald-500/10 via-slate-50 to-teal-500/10 dark:from-emerald-950/20 dark:to-slate-900 border-emerald-500/40 shadow-sm'
                        : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-200/60 dark:border-slate-700">
                        {b.icon}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${b.unlocked ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        {b.unlocked ? '✓ Unlocked' : 'In Progress'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{b.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{b.desc}</p>
                    </div>

                    <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold pt-1 border-t border-slate-200/40 dark:border-slate-800">
                      {b.unlocked ? `Achieved on ${b.date}` : `Goal Progress: ${b.progress}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
};

export default Leaderboard;
