import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaLock, FaShieldAlt, FaMobileAlt, FaTimes } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const DriverSecurity = () => {
  const { addToast } = useToast();
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Security & Account Protection</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage two-factor authentication, active login devices, and security password.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaShieldAlt className="text-emerald-500 text-lg" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Authentication Controls</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                    <span className="text-[10px] text-slate-400">SMS OTP on login</span>
                  </div>
                  <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                </div>

                <button 
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full py-3 bg-emerald-600 text-white font-extrabold rounded-2xl shadow"
                >
                  Change Account Password
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaMobileAlt className="text-emerald-500 text-lg" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Active Devices</h3>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-900 dark:text-white">Android App v3.4 (Current)</p>
                  <span className="text-[10px] text-emerald-500 font-bold">Chennai • Active Now</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500 text-white font-bold text-[9px] rounded-full">ACTIVE</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverSecurity;
