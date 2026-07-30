import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { 
  FaCogs, FaClock, FaPalette, FaLock, FaSignOutAlt, FaTimes, FaToggleOn, FaToggleOff 
} from 'react-icons/fa';

const DriverSettings = () => {
  const { logout } = useAuth();
  const { addToast } = useToast();

  // Availability State
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(true);
  const [workingHours] = useState('08:00 AM - 08:00 PM (12 Hours)');
  const [isPaused, setIsPaused] = useState(false);

  // App Preferences State
  const [themeMode, setThemeMode] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Normal');

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleToggleTheme = (mode) => {
    setThemeMode(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    addToast(`Theme mode set to ${mode.toUpperCase()}`, 'info', 'Theme Preference');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error', 'Validation Error');
      return;
    }
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    addToast('Driver password updated successfully!', 'success', 'Password Updated');
  };

  const handleDeleteAccount = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Settings Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 dark:border-slate-800 pb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver System Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage dispatch availability, app theme preferences & security password.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-full">
              Driver App v3.4.0
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Availability & Dispatch */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaClock className="text-emerald-500 text-lg" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Availability & Dispatch</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Duty Status (Online / Offline)</p>
                    <span className="text-[10px] text-slate-400 font-semibold">{isOnline ? 'Active for new pickup dispatches' : 'Offline'}</span>
                  </div>
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`px-3.5 py-1.5 rounded-xl font-black text-white text-[10px] ${isOnline ? 'bg-emerald-600' : 'bg-slate-500'}`}
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Auto Accept Assigned Jobs</p>
                    <span className="text-[10px] text-slate-400 font-semibold">Automatically accept jobs within 2km</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoAccept} 
                    onChange={(e) => setAutoAccept(e.target.checked)} 
                    className="h-4 w-4 text-emerald-600 rounded" 
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Working Hours Schedule</p>
                    <span className="text-[10px] text-emerald-500 font-bold">{workingHours}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold text-[9px] rounded-full">ACTIVE</span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <div>
                    <p className="font-black text-slate-900 dark:text-white">Pause Receiving Jobs</p>
                    <span className="text-[10px] text-slate-400 font-semibold">Temporary break mode</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isPaused} 
                    onChange={(e) => setIsPaused(e.target.checked)} 
                    className="h-4 w-4 text-amber-500 rounded" 
                  />
                </div>
              </div>
            </div>

            {/* 2. App Preferences */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaPalette className="text-emerald-500 text-lg" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">App Preferences</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-black text-slate-900 dark:text-white">Appearance Theme</span>
                  <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-0.5 text-[10px] font-black">
                    <button onClick={() => handleToggleTheme('light')} className={`px-3 py-1 rounded-lg ${themeMode === 'light' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Light</button>
                    <button onClick={() => handleToggleTheme('dark')} className={`px-3 py-1 rounded-lg ${themeMode === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Dark</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-black text-slate-900 dark:text-white">App Language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs">
                    <option value="English">English</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-black text-slate-900 dark:text-white">Font Size</span>
                  <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs">
                    <option value="Normal">Normal</option>
                    <option value="Large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="font-black text-slate-900 dark:text-white">Security Password</span>
                  <button onClick={() => setShowPasswordModal(true)} className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl text-xs">
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Account Zone */}
            <div className="md:col-span-2 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3 text-xs">
              <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm">Account Actions</h4>
              <div className="flex space-x-3">
                <button onClick={logout} className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl">
                  Logout
                </button>
                <button onClick={() => setShowDeleteModal(true)} className="flex-1 py-3 bg-rose-600 text-white font-extrabold rounded-xl">
                  Delete Driver Account
                </button>
              </div>
            </div>

          </div>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-black text-slate-900 dark:text-white text-base">Change Driver Password</h4>
                  <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white"><FaTimes /></button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                  <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
                  <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl">Update Password</button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DriverSettings;
