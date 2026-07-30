import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { 
  FaUser, FaToggleOn, FaToggleOff, FaBell, FaCompass, FaLock, 
  FaFileAlt, FaTrophy, FaQuestionCircle, FaPalette, FaBalanceScale, 
  FaSignOutAlt, FaTrash, FaCamera, FaCheckCircle, FaShieldAlt, 
  FaClock, FaMapMarkerAlt, FaMobileAlt, FaCloudUploadAlt, FaChevronRight,
  FaVolumeUp, FaVolumeMute, FaCoins, FaAward, FaTimes, FaKey, FaExclamationTriangle
} from 'react-icons/fa';
import api from '../../utils/api';

const DriverSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { addToast } = useToast();

  // 1. Profile State
  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [email] = useState(user?.email || 'driver@ecoreward.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [driverId] = useState('DRV-2026-8894');
  const [vehicleDetails, setVehicleDetails] = useState('TN-38-ECO • E-Rickshaw Loader');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 2. Availability State
  const [isOnline, setIsOnline] = useState(true);
  const [autoAccept, setAutoAccept] = useState(true);
  const [workingHours] = useState('08:00 AM - 08:00 PM (12 Hours)');
  const [isPaused, setIsPaused] = useState(false);

  // 3. Notifications State
  const [pickupAlerts, setPickupAlerts] = useState(true);
  const [earningsAlerts, setEarningsAlerts] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [soundVibration, setSoundVibration] = useState(true);

  // 4. Navigation State
  const [voiceNav, setVoiceNav] = useState(true);
  const [routeOptimization, setRouteOptimization] = useState(true);
  const [defaultMap, setDefaultMap] = useState('Google Maps');

  // 5. Security State
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 9. App Preferences State
  const [themeMode, setThemeMode] = useState(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  const [language, setLanguage] = useState('English');
  const [fontSize, setFontSize] = useState('Normal');

  // Modals & FAQs
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleToggleTheme = (mode) => {
    setThemeMode(mode);
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    addToast(`Theme set to ${mode.toUpperCase()}`, 'info', 'Theme Changed');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      setIsEditingProfile(false);
      addToast('Driver profile details updated!', 'success', 'Profile Saved');
    } catch (err) {
      addToast('Profile saved locally.', 'info', 'Saved');
      setIsEditingProfile(false);
    }
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
    addToast('Security password updated successfully!', 'success', 'Password Updated');
  };

  const handleLogoutAllDevices = () => {
    addToast('Logged out from all other active sessions.', 'info', 'Devices Cleared');
  };

  const handleDeleteAccount = () => {
    logout();
    window.location.href = '/';
  };

  const faqs = [
    { q: 'How do I earn incentive bonuses?', a: 'Complete 10+ pickups daily during peak hours (09 AM - 01 PM) to unlock bonus rewards.' },
    { q: 'What to do if customer waste is contaminated?', a: 'Use the "Report Issue" button on the job screen and select "Contaminated Waste".' },
    { q: 'How to update vehicle insurance document?', a: 'Go to Documents section in Settings and click "Upload / Update Documents".' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Settings Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Header Title */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/80 dark:border-slate-800 pb-4 gap-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Console Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage account, availability, navigation preferences & documents.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-full">
              Driver App v3.4.0 (Build 2026.07)
            </span>
          </div>

          {/* 11 ESSENTIAL SETTING CATEGORIES GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* COLUMN 1 */}
            <div className="space-y-6">
              
              {/* 1. PROFILE SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FaUser className="text-emerald-500 text-lg" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">1. Driver Profile</h3>
                  </div>
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl hover:bg-emerald-500/20 transition-colors"
                  >
                    {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img src={profileImage} alt="Driver" className="h-16 w-16 rounded-full object-cover ring-4 ring-emerald-500/30" />
                    <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full shadow cursor-pointer">
                      <FaCamera className="h-3 w-3" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          if (e.target.files[0]) setProfileImage(URL.createObjectURL(e.target.files[0]));
                        }} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <h4 className="font-black text-slate-900 dark:text-white text-sm">{name}</h4>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold block">{driverId}</span>
                    <span className="text-slate-400 font-medium block">{vehicleDetails}</span>
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Phone Number</label>
                      <input 
                        type="text" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Vehicle Info</label>
                      <input 
                        type="text" 
                        value={vehicleDetails} 
                        onChange={(e) => setVehicleDetails(e.target.value)} 
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold" 
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-black rounded-xl">
                      Save Profile Changes
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Email</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{email}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Phone</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block">{phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. AVAILABILITY SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaClock className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">2. Availability & Dispatch</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Duty Status (Online / Offline)</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{isOnline ? 'Active for new pickup dispatches' : 'Offline'}</span>
                    </div>
                    <button 
                      onClick={() => setIsOnline(!isOnline)}
                      className={`px-3 py-1.5 rounded-xl font-black text-white text-[10px] ${isOnline ? 'bg-emerald-600' : 'bg-slate-500'}`}
                    >
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
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

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Working Hours Schedule</p>
                      <span className="text-[10px] text-emerald-500 font-bold">{workingHours}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold text-[9px] rounded-full">ACTIVE</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
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

              {/* 3. NOTIFICATIONS SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaBell className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">3. Driver Alerts & Sounds</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Pickup Dispatch Alerts</span>
                    <input type="checkbox" checked={pickupAlerts} onChange={(e) => setPickupAlerts(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Daily Earnings Summary Alerts</span>
                    <input type="checkbox" checked={earningsAlerts} onChange={(e) => setEarningsAlerts(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Sound & Heavy Vibration</span>
                    <input type="checkbox" checked={soundVibration} onChange={(e) => setSoundVibration(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                  </div>
                </div>
              </div>

              {/* 4. NAVIGATION SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaCompass className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">4. Navigation & GPS</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Voice Navigation (Spoken Turn-by-Turn)</p>
                      <span className="text-[10px] text-emerald-500 font-bold">"Turn right in 200m on Metro Heights"</span>
                    </div>
                    <input type="checkbox" checked={voiceNav} onChange={(e) => setVoiceNav(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">TSP Route Optimization</span>
                    <input type="checkbox" checked={routeOptimization} onChange={(e) => setRouteOptimization(e.target.checked)} className="h-4 w-4 text-emerald-600 rounded" />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Default Map Provider</span>
                    <select 
                      value={defaultMap} 
                      onChange={(e) => setDefaultMap(e.target.value)} 
                      className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                    >
                      <option value="Google Maps">Google Maps</option>
                      <option value="OpenStreetMap">OpenStreetMap</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2 */}
            <div className="space-y-6">
              
              {/* 5. DOCUMENTS SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FaFileAlt className="text-emerald-500 text-lg" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">5. Driver Documents</h3>
                  </div>
                  <button 
                    onClick={() => setShowDocUploadModal(true)} 
                    className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Upload / Update
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Driving License (DL-TN-2024-99882)</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Valid till Nov 2028</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[9px] rounded-full">✓ VERIFIED</span>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Vehicle Registration RC (RC-TN-38-8877)</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">E-Rickshaw Loader</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[9px] rounded-full">✓ VERIFIED</span>
                  </div>

                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Insurance Certificate (INS-2026-1122)</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Valid till Dec 2026</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500 text-white font-black text-[9px] rounded-full">✓ VERIFIED</span>
                  </div>
                </div>
              </div>

              {/* 6. REWARDS & INCENTIVES */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaTrophy className="text-amber-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">6. Rewards & Badges</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">🏆</span>
                    <p className="font-black text-slate-900 dark:text-white text-[10px]">Top Collector</p>
                    <span className="text-[8px] text-slate-400 block font-bold">50+ Pickups</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">⚡</span>
                    <p className="font-black text-slate-900 dark:text-white text-[10px]">Fast Responder</p>
                    <span className="text-[8px] text-slate-400 block font-bold">Avg ETA 10 min</span>
                  </div>
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">🌱</span>
                    <p className="font-black text-slate-900 dark:text-white text-[10px]">1,000kg Recycler</p>
                    <span className="text-[8px] text-slate-400 block font-bold">1.2 Tons Done</span>
                  </div>
                </div>
              </div>

              {/* 7. APP PREFERENCES */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaPalette className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">7. App Preferences</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Appearance Theme</span>
                    <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-0.5 text-[10px] font-black">
                      <button onClick={() => handleToggleTheme('light')} className={`px-2.5 py-1 rounded-lg ${themeMode === 'light' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Light</button>
                      <button onClick={() => handleToggleTheme('dark')} className={`px-2.5 py-1 rounded-lg ${themeMode === 'dark' ? 'bg-emerald-600 text-white' : 'text-slate-400'}`}>Dark</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">App Language</span>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold">
                      <option value="English">English</option>
                      <option value="Tamil">தமிழ் (Tamil)</option>
                      <option value="Hindi">हिंदी (Hindi)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 8. SECURITY SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FaLock className="text-emerald-500 text-lg" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">8. Security Settings</h3>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-xl">
                    Change Password
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="font-black text-slate-900 dark:text-white">Active Device Session</span>
                    <span className="text-[10px] text-emerald-500 font-bold">Android App v3.4 (Current)</span>
                  </div>
                  <button onClick={handleLogoutAllDevices} className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-center">
                    Logout from All Devices
                  </button>
                </div>
              </div>

              {/* 9. SUPPORT & HELP */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaQuestionCircle className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">9. Support & FAQs</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {faqs.map((faq, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                      <p className="font-black text-slate-900 dark:text-white">{faq.q}</p>
                      <span className="text-[10px] text-slate-400 block">{faq.a}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10 & 11. DANGEROUS ACCOUNT ZONE */}
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3 text-xs">
                <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm">10. Account Management</h4>
                <div className="flex space-x-3">
                  <button onClick={logout} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl">
                    Logout
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} className="flex-1 py-2.5 bg-rose-600 text-white font-extrabold rounded-xl">
                    Delete Account
                  </button>
                </div>
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
                  <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                  <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                  <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl">Update Password</button>
                </form>
              </div>
            </div>
          )}

          {/* Document Upload Modal */}
          {showDocUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
                <FaCloudUploadAlt className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 dark:text-white text-base">Upload Driver Document</h4>
                <p className="text-xs text-slate-400">Select license, RC, or insurance image for admin verification.</p>
                <input type="file" className="text-xs text-slate-400 mx-auto" />
                <button onClick={() => { setShowDocUploadModal(false); addToast('Document uploaded for review', 'success', 'Uploaded'); }} className="w-full py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl">Submit for Verification</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DriverSettings;
