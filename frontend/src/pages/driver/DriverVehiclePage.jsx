import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaTruck, FaBolt, FaCheckCircle } from 'react-icons/fa';

const DriverVehiclePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Assigned Driver Vehicle Details</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View vehicle specifications, battery telematics, and registration information.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-4 max-w-lg">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-2xl">
                <FaTruck />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">E-Rickshaw Heavy Loader</h3>
                <span className="text-xs font-mono font-bold text-emerald-500">TN-38-ECO-9945</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Battery Telematics</span>
                <span className="font-extrabold text-emerald-500 flex items-center space-x-1">
                  <FaBolt /> <span>88% (Est. 65 km range)</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                <span className="text-[9px] text-slate-400 font-bold block uppercase">Max Payload</span>
                <span className="font-extrabold text-slate-900 dark:text-white">500 kg Capacity</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverVehiclePage;
