import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaTrophy, FaCoins, FaGift } from 'react-icons/fa';

const DriverRewards = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Rewards & Achievement Badges</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track your eco points, weekly completion bonuses, and achievement milestones.</p>
          </div>

          <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl text-white flex justify-between items-center shadow-lg">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block text-emerald-100">Total Eco Points Earned</span>
              <h3 className="text-3xl font-black">1,450 pts</h3>
            </div>
            <FaCoins className="h-12 w-12 text-emerald-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-3xl block">🏆</span>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">Top Collector</h4>
              <span className="text-[10px] text-slate-400 font-bold block">50+ Pickups Completed</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-3xl block">⚡</span>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">Fast Responder</h4>
              <span className="text-[10px] text-slate-400 font-bold block">Avg ETA Under 10 Mins</span>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <span className="text-3xl block">🌱</span>
              <h4 className="font-black text-slate-900 dark:text-white text-sm">1,000kg Recycler</h4>
              <span className="text-[10px] text-slate-400 font-bold block">1.2 Tons Total Waste</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverRewards;
