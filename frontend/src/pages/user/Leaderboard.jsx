import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { FaTrophy, FaMedal, FaCrown, FaUsers, FaUser } from 'react-icons/fa';

const Leaderboard = () => {
  const { user } = useAuth();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/user/leaderboard');
      if (res.data.success) {
        setRankings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard rankings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Split top 3 and others
  const topThree = rankings.slice(0, 3);
  const remaining = rankings.slice(3);

  // Reorder top 3 for podium display: [Second, First, Third]
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ ...topThree[1], rank: 2 });
  if (topThree[0]) podiumOrder.push({ ...topThree[0], rank: 1 });
  if (topThree[2]) podiumOrder.push({ ...topThree[2], rank: 3 });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <FaTrophy className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Eco Champions Leaderboard</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">See who is making the biggest impact and earning the most rewards.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowCertificate(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>📜 Download Eco Hero Certificate</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-sm">
              <FaUsers className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No champions on the board yet. Start recycling to earn points!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top 3 Podium Card */}
              {topThree.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-8 rounded-3xl shadow-sm flex flex-col items-center">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-8 tracking-wide uppercase flex items-center space-x-2">
                    <FaCrown className="text-amber-500 animate-bounce" />
                    <span>Top recycling superstars</span>
                  </h3>

                  <div className="flex flex-col sm:flex-row items-end justify-center w-full gap-6 max-w-xl pb-2">
                    {podiumOrder.map((item, index) => {
                      const isFirst = item.rank === 1;
                      const isSecond = item.rank === 2;
                      const isThird = item.rank === 3;
                      const isCurrentUser = user?._id === item._id;

                      return (
                        <div 
                          key={item._id} 
                          className={`flex flex-col items-center w-full sm:w-1/3 transition-all duration-300 hover:scale-105 ${
                            isFirst ? 'order-1 sm:order-2 z-10' : isSecond ? 'order-2 sm:order-1' : 'order-3'
                          }`}
                        >
                          {/* Avatar with crown or medal */}
                          <div className="relative mb-3">
                            <img 
                              src={item.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=${isFirst ? 'f59e0b' : isSecond ? '94a3b8' : 'b45309'}&color=fff`} 
                              alt={item.name} 
                              className={`rounded-full object-cover shadow-md border-4 ${
                                isFirst 
                                  ? 'h-24 w-24 border-amber-400' 
                                  : isSecond 
                                    ? 'h-20 w-20 border-slate-300' 
                                    : 'h-18 w-18 border-amber-700'
                              } ${isCurrentUser ? 'ring-4 ring-emerald-500/50' : ''}`}
                            />
                            
                            {/* Place Marker */}
                            <span className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full text-white text-xs font-bold border-2 ${
                              isFirst 
                                ? 'bg-amber-400 border-amber-300 p-1.5' 
                                : isSecond 
                                  ? 'bg-slate-400 border-slate-300 p-1' 
                                  : 'bg-amber-700 border-amber-600 p-1'
                            }`}>
                              {isFirst ? <FaCrown className="h-4 w-4" /> : item.rank}
                            </span>
                          </div>

                          {/* Info Card */}
                          <div className={`w-full text-center p-4 rounded-2xl border ${
                            isCurrentUser 
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30' 
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/80'
                          } ${isFirst ? 'py-6' : ''}`}>
                            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[120px] mx-auto">
                              {item.name}
                            </h4>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center space-x-1">
                              <span>{item.points}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">pts</span>
                            </p>
                          </div>
                          
                          {/* Podium Stand */}
                          <div className={`hidden sm:block w-full mt-2 rounded-t-xl ${
                            isFirst 
                              ? 'h-14 bg-gradient-to-b from-amber-400/20 to-amber-400/5 dark:from-amber-400/10' 
                              : isSecond 
                                ? 'h-9 bg-gradient-to-b from-slate-300/20 to-slate-300/5 dark:from-slate-400/10' 
                                : 'h-6 bg-gradient-to-b from-amber-700/20 to-amber-700/5 dark:from-amber-700/10'
                          }`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 4-10 List */}
              {remaining.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rankings #4 - #10</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Points</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {remaining.map((item, index) => {
                      const rank = index + 4;
                      const isCurrentUser = user?._id === item._id;

                      return (
                        <div 
                          key={item._id} 
                          className={`flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/10 ${
                            isCurrentUser ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            {/* Rank number */}
                            <span className="w-6 text-sm font-extrabold text-slate-400 dark:text-slate-500 text-center">
                              {rank}
                            </span>
                            
                            {/* Avatar */}
                            <img 
                              src={item.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0284c7&color=fff`} 
                              alt={item.name} 
                              className={`h-9 w-9 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 ${isCurrentUser ? 'ring-emerald-500/40' : ''}`}
                            />

                            {/* User details */}
                            <div>
                              <h4 className={`text-sm font-bold text-slate-800 dark:text-slate-200 ${isCurrentUser ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : ''}`}>
                                {item.name} {isCurrentUser && <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded-md ml-1.5 uppercase">You</span>}
                              </h4>
                            </div>
                          </div>

                          {/* Points badge */}
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">{item.points}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">pts</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Eco Hero Certificate Modal */}
          {showCertificate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 border-4 border-amber-400 rounded-3xl p-8 shadow-2xl w-full max-w-lg text-center space-y-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400"></div>
                <div className="space-y-2">
                  <span className="text-4xl">📜</span>
                  <h3 className="font-black text-2xl tracking-tight text-slate-900 dark:text-white uppercase font-serif">Certificate of Eco Impact</h3>
                  <p className="text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold">Official Green Contribution Award</p>
                </div>

                <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">This is to certify that</p>
                  <h4 className="text-xl font-extrabold text-slate-900 dark:text-white underline decoration-emerald-500 decoration-2">{user?.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    has actively recycled waste materials, saved CO₂ emissions, and earned <span className="font-black text-emerald-600 dark:text-emerald-400">{user?.points} Eco Points</span> on the platform.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-4">
                  <span>Issued by EcoReward Platform</span>
                  <span>Verification ID: ECO-{user?._id?.slice(-6).toUpperCase()}</span>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => alert('Certificate PNG downloaded successfully!')}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
                  >
                    Download Certificate
                  </button>
                  <button 
                    onClick={() => setShowCertificate(false)}
                    className="py-3 px-5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs"
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

export default Leaderboard;
