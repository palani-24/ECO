import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaBell, FaCheckCircle, FaTruck, FaCoins } from 'react-icons/fa';

const DriverNotifications = () => {
  const notifs = [
    { title: 'New Pickup Dispatch Assigned', text: 'Sector 4 • 10kg Paper • 2 mins ago', icon: FaTruck, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Weekly Incentive Goal Unlocked', text: '₹500 bonus goal active (8/10 done)', icon: FaCoins, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'System Dispatch Update', text: 'Collection route optimized for minimal traffic', icon: FaCheckCircle, color: 'text-sky-500 bg-sky-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver System Notifications</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">All real-time job dispatches, incentive alerts, and system notifications.</p>
          </div>

          <div className="space-y-3">
            {notifs.map((n, i) => {
              const Icon = n.icon;
              return (
                <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl flex items-center space-x-4 shadow-sm">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-lg ${n.color}`}>
                    <Icon />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{n.title}</h4>
                    <span className="text-xs text-slate-400 font-semibold">{n.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverNotifications;
