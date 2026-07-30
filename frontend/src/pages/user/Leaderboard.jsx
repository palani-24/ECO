import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import LeaderboardWidget from '../../components/LeaderboardWidget';
import Footer from '../../components/Footer';
import { FaTrophy, FaFire, FaBullseye, FaGift, FaCheckCircle, FaStar, FaAward } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  
  const weeklyChallenges = [
    {
      id: 1,
      title: 'Plastic Hero Challenge',
      desc: 'Recycle 5 kg of plastic PET materials this week.',
      progress: 3.5,
      target: 5.0,
      reward: 150,
      unit: 'kg'
    },
    {
      id: 2,
      title: 'Weekly Pickup Streak',
      desc: 'Complete 2 scheduled waste pickups in 7 days.',
      progress: 1,
      target: 2,
      reward: 100,
      unit: 'pickups'
    },
    {
      id: 3,
      title: 'AI Scanner Master',
      desc: 'Scan 3 items using the Neural AI Waste Scanner.',
      progress: 3,
      target: 3,
      reward: 75,
      unit: 'scans',
      completed: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-600 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest backdrop-blur">
                🏆 Citizen Leaderboard & Challenges
              </span>
              <h2 className="text-2xl md:text-3xl font-black">Eco Champions Ranking</h2>
              <p className="text-xs sm:text-sm text-emerald-100 max-w-xl font-medium">
                Recycle household waste, unlock weekly challenges, earn EcoPoints, and reach rank #1 in your city!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols - Main Leaderboard Widget */}
            <div className="lg:col-span-2 space-y-6">
              <LeaderboardWidget />
            </div>

            {/* Right Col - Weekly Challenges */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="h-9 w-9 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center text-lg">
                    <FaFire />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">Weekly Eco Quests</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Resets in 3 days</span>
                  </div>
                </div>

                <div className="space-y-4">
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

        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Leaderboard;
