import React, { useState, useEffect } from 'react';
import { FaTrophy, FaCrown, FaSyncAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const LeaderboardWidget = () => {
  const { user } = useAuth();
  const { realtimeData } = useSocket() || {};
  const [filter, setFilter] = useState('monthly'); // 'monthly' | 'allTime'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/leaderboard');
      if (res.data.success && res.data.data.length > 0) {
        setLeaderboardData(res.data.data);
      } else {
        // Fallback default list
        setLeaderboardData([
          { rank: 1, name: 'Ananya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', points: 2850, recycledKg: 142.5, tier: 'Recycling Champion', badge: '🏆 Gold Recycler' },
          { rank: 2, name: 'Vikram Singh', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', points: 2140, recycledKg: 107.0, tier: 'Eco Hero', badge: '🥇 Silver Recycler' },
          { rank: 3, name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', points: 1780, recycledKg: 89.0, tier: 'Planet Saver', badge: '🥈 Bronze Recycler' },
          { rank: 4, name: user?.name || 'Arjun Sharma', avatar: user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Arjun')}&background=10b981&color=fff`, points: user?.points || 470, recycledKg: 28.5, tier: 'Green Warrior', badge: '🎖️ Rising Star', isCurrentUser: true },
          { rank: 5, name: 'Suresh Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', points: 420, recycledKg: 21.0, tier: 'Eco Scout', badge: '🌱 Green Scout' }
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

  // Real-Time Socket Updates (refreshes leaderboard dynamically when points/pickups arrive)
  useEffect(() => {
    if (realtimeData?.latestPickup || realtimeData?.lastPointsAwarded) {
      fetchLeaderboard();
    }
  }, [realtimeData?.latestPickup, realtimeData?.lastPointsAwarded]);

  const top3 = leaderboardData.slice(0, 3);
  const remaining = leaderboardData.slice(3);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
      
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl border border-amber-500/20">
            <FaTrophy className="animate-bounce" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center space-x-2">
              <span>Real-Time Eco Leaderboard</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] uppercase tracking-wider font-extrabold border border-emerald-500/20 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>LIVE SOCKET STREAM</span>
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Updated live as citizens recycle waste & earn points</p>
          </div>
        </div>

        {/* Filter Switcher & Manual Refresh */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchLeaderboard}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors text-xs"
            title="Refresh Live Data"
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-extrabold">
            <button
              onClick={() => setFilter('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'monthly' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilter('allTime')}
              className={`px-3 py-1.5 rounded-xl transition-all ${filter === 'allTime' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400'}`}
            >
              All Time
            </button>
          </div>
        </div>
      </div>

      {/* Podium Top 3 Highlights */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 text-center pt-2">
          {/* Rank 2 */}
          <div className="p-3 bg-gradient-to-b from-slate-100/80 to-slate-200/50 dark:from-slate-800/80 dark:to-slate-850/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center space-y-2 relative">
            <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black shadow">
              #2 Silver
            </span>
            <img 
              src={getAvatarUrl(top3[1].avatar, top3[1].name)} 
              onError={(e) => handleAvatarError(e, top3[1].name)}
              alt="2nd" 
              className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-300 mt-2" 
            />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[90px]">{top3[1].name}</p>
              <span className="text-[10px] font-black text-emerald-500">{top3[1].points} Pts</span>
            </div>
          </div>

          {/* Rank 1 Gold */}
          <div className="p-3 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-amber-500/5 rounded-2xl border-2 border-amber-400/60 flex flex-col items-center space-y-2 relative shadow-lg transform -translate-y-2">
            <span className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-md flex items-center space-x-1">
              <FaCrown className="h-3 w-3" />
              <span>#1 Gold</span>
            </span>
            <img 
              src={getAvatarUrl(top3[0].avatar, top3[0].name)} 
              onError={(e) => handleAvatarError(e, top3[0].name)}
              alt="1st" 
              className="h-14 w-14 rounded-full object-cover ring-4 ring-amber-400 mt-2 shadow-md" 
            />
            <div>
              <p className="font-black text-slate-900 dark:text-white text-xs truncate max-w-[100px]">{top3[0].name}</p>
              <span className="text-xs font-black text-amber-500">{top3[0].points} Pts</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="p-3 bg-gradient-to-b from-amber-900/10 to-amber-800/5 dark:from-amber-950/40 dark:to-amber-900/20 rounded-2xl border border-amber-700/40 flex flex-col items-center space-y-2 relative">
            <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-700 text-white text-[10px] font-black shadow">
              #3 Bronze
            </span>
            <img 
              src={getAvatarUrl(top3[2].avatar, top3[2].name)} 
              onError={(e) => handleAvatarError(e, top3[2].name)}
              alt="3rd" 
              className="h-12 w-12 rounded-full object-cover ring-2 ring-amber-700 mt-2" 
            />
            <div>
              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[90px]">{top3[2].name}</p>
              <span className="text-[10px] font-black text-emerald-500">{top3[2].points} Pts</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Leaderboard Table List */}
      <div className="space-y-2 pt-2">
        {leaderboardData.map((item, idx) => {
          const isMe = item.isCurrentUser || item._id === user?._id;
          return (
            <div 
              key={item._id || idx}
              className={`p-3.5 rounded-2xl flex items-center justify-between transition-all ${
                isMe 
                  ? 'bg-emerald-500/15 border-2 border-emerald-500/40 shadow-sm' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`h-7 w-7 rounded-xl font-black text-xs flex items-center justify-center ${
                  item.rank === 1 ? 'bg-amber-400 text-slate-950' :
                  item.rank === 2 ? 'bg-slate-300 text-slate-900' :
                  item.rank === 3 ? 'bg-amber-700 text-white' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.rank}
                </span>

                <img 
                  src={getAvatarUrl(item.avatar, item.name)} 
                  onError={(e) => handleAvatarError(e, item.name)}
                  alt={item.name} 
                  className="h-9 w-9 rounded-xl object-cover" 
                />

                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-xs flex items-center space-x-1.5">
                    <span>{item.name}</span>
                    {isMe && (
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-black">YOU</span>
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-bold block">{item.badge} • {item.recycledKg || (item.points * 0.15).toFixed(1)} kg Recycled</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-emerald-500 block">+{item.points}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{item.tier}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default LeaderboardWidget;
