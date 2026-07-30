import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import { FaCompass, FaVolumeUp, FaRoute } from 'react-icons/fa';

const DriverNavigationPage = () => {
  const [voiceNav, setVoiceNav] = useState(true);
  const [tspOptimized, setTspOptimized] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Navigation & GPS Controls</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live GPS tracking, spoken turn-by-turn guidance, and TSP route optimization.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => setVoiceNav(!voiceNav)} className={`px-3 py-1.5 rounded-xl text-xs font-black ${voiceNav ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {voiceNav ? '🔊 Voice Guidance ON' : '🔇 Voice Guidance OFF'}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <FaCompass className="text-emerald-500" />
              <span>Live Collection Route Optimization</span>
            </h3>
            <div className="h-80 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
              <GoogleRouteMap height="320px" isDriver={true} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverNavigationPage;
