import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import { 
  FaUser, FaLock, FaMapMarkerAlt, FaTrash, FaCheck, FaExclamationTriangle, 
  FaCamera, FaSun, FaMoon, FaBell, FaPhone, FaCalendarAlt, FaGlobe, 
  FaShieldAlt, FaAward, FaHistory, FaCheckCircle, FaExclamationCircle, FaTimes
} from 'react-icons/fa';
import api from '../../utils/api';

const Profile = () => {
  const { user, updateProfile, addAddress, removeAddress, setDefaultAddress, logout } = useAuth();

  // Personal Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [dob, setDob] = useState(user?.dob || '1998-06-15');
  const [language, setLanguage] = useState(localStorage.getItem('pref_language') || 'English');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Preferences
  const [emailNotification, setEmailNotification] = useState(() => localStorage.getItem('pref_email_notif') !== 'false');
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(() => localStorage.getItem('pref_weekly_report') !== 'false');
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Address Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  // Modals & Feedback
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  ];

  // Calculate Profile Completion %
  const calculateCompletion = () => {
    let score = 0;
    if (user?.name) score += 25;
    if (user?.email) score += 25;
    if (phone) score += 20;
    if (user?.addresses && user.addresses.length > 0) score += 20;
    if (user?.profileImage) score += 10;
    return score;
  };

  const completionPct = calculateCompletion();

  const handleToggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        const fullUrl = res.data.imageUrl.startsWith('http') ? res.data.imageUrl : `${api.defaults.baseURL.replace('/api', '')}${res.data.imageUrl}`;
        setProfileImage(fullUrl);
        await updateProfile({ profileImage: fullUrl });
        setProfileSuccess('Profile picture uploaded successfully!');
        setShowAvatarSelector(false);
      }
    } catch (err) {
      setProfileError('Failed to upload profile picture.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setLoading(true);

    try {
      const payload = { name, phone, dob, profileImage };
      const res = await updateProfile(payload);
      if (res.success) {
        setProfileSuccess('Personal details updated successfully!');
      } else {
        setProfileError(res.message);
      }
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (newPassword !== confirmPassword) {
      setProfileError('New passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      setProfileError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfile({ password: newPassword });
      if (res.success) {
        setProfileSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setShowChangePasswordModal(false);
      } else {
        setProfileError(res.message);
      }
    } catch (err) {
      setProfileError('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrSuccess('');

    if (!street || !city || !state || !zipCode) {
      setAddrError('Please fill all address fields');
      return;
    }

    try {
      const res = await addAddress({ street, city, state, zipCode, isDefault: user?.addresses?.length === 0 });
      if (res.success) {
        setAddrSuccess('Location added successfully!');
        setStreet(''); setCity(''); setState(''); setZipCode('');
      } else {
        setAddrError(res.message);
      }
    } catch (err) {
      setAddrError('Failed to add address');
    }
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

        {/* Main Profile Panel */}
        <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Header Banner (Clean & Non-Duplicate) */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4 z-10">
              <div className="relative group">
                <img 
                  src={profileImage || user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`} 
                  alt="Profile" 
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30 shadow-md"
                />
                <button 
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0 right-0 p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full shadow-lg transition-transform hover:scale-110"
                  title="Change Profile Photo"
                >
                  <FaCamera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl font-black text-white">{name}</h2>
                <p className="text-xs text-emerald-100 font-medium">{email}</p>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur">
                  Eco Warrior 🌿
                </span>
              </div>
            </div>

            {/* Profile Completion Progress Bar */}
            <div className="w-full sm:w-64 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-2 z-10">
              <div className="flex justify-between text-xs font-black">
                <span>Profile Completion</span>
                <span>{completionPct}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500" 
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              <span className="text-[9px] text-emerald-100 font-medium block">Add saved address & phone to hit 100%</span>
            </div>
          </div>

          {/* Avatar Preset Selector Dropdown Modal */}
          {showAvatarSelector && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-900 dark:text-white">Choose Avatar Preset or Upload Photo:</span>
                <label className="cursor-pointer px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="flex space-x-3">
                {presetAvatars.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setProfileImage(url); updateProfile({ profileImage: url }); setShowAvatarSelector(false); }}
                    className="hover:scale-110 transition-transform"
                  >
                    <img src={url} alt="Preset" className="h-12 w-12 rounded-full border-2 border-emerald-500" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Feedback Messages */}
          {profileSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
              <FaCheckCircle className="h-4 w-4" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
              <FaExclamationTriangle className="h-4 w-4" />
              <span>{profileError}</span>
            </div>
          )}

          {/* Grid Layout: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: Personal Info & Security */}
            <div className="space-y-6">
              
              {/* Personal Information Form */}
              <form onSubmit={handleUpdatePersonal} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaUser className="text-emerald-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Personal Information</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Full Name</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Email Address</label>
                    <input 
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Date of Birth</label>
                    <input 
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Language Preference</label>
                  <select 
                    value={language}
                    onChange={(e) => { setLanguage(e.target.value); localStorage.setItem('pref_language', e.target.value); }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">தமிழ் (Tamil)</option>
                    <option value="Hindi">हिंदी (Hindi)</option>
                    <option value="Spanish">Español (Spanish)</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition-all"
                >
                  {loading ? 'Saving...' : 'Save Personal Details'}
                </button>
              </form>

              {/* Security & Password Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FaShieldAlt className="text-emerald-500" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Security Settings</h3>
                  </div>
                  <button 
                    onClick={() => setShowChangePasswordModal(true)}
                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-black text-xs rounded-xl border border-emerald-500/20 transition-colors"
                  >
                    Change Password
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</p>
                      <span className="text-[10px] text-slate-400 font-bold block">Secure your account with OTP verification</span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white">Active Login Sessions</p>
                      <span className="text-[10px] text-slate-400 font-bold block">Windows 11 • Chrome Browser (Current)</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-black text-[9px] rounded-full">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Preferences & Notifications Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaBell className="text-emerald-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Preferences & Appearance</h3>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Dark Mode Switch */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      {darkMode ? <FaMoon className="text-amber-400" /> : <FaSun className="text-amber-500" />}
                      <span className="font-black text-slate-900 dark:text-white">Theme Mode</span>
                    </div>
                    <button 
                      onClick={handleToggleDarkMode}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl text-[10px]"
                    >
                      {darkMode ? 'DARK MODE' : 'LIGHT MODE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="font-black text-slate-900 dark:text-white">Email Notifications</span>
                    <input 
                      type="checkbox"
                      checked={emailNotification}
                      onChange={(e) => setEmailNotification(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="font-black text-slate-900 dark:text-white">SMS Pickup Alerts</span>
                    <input 
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Saved Locations, Badges, Recent Activity & Dangerous Zone */}
            <div className="space-y-6">
              
              {/* Saved Locations & Interactive Map */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaMapMarkerAlt className="text-emerald-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">My Saved Locations</h3>
                </div>

                {/* Google Map Location Preview */}
                <div className="h-32 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
                  <GoogleRouteMap height="128px" />
                </div>

                {/* Saved Address List */}
                <div className="space-y-2 text-xs">
                  {user?.addresses?.map((addr) => (
                    <div key={addr._id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-black text-slate-900 dark:text-white">{addr.street}</p>
                        <span className="text-[10px] text-slate-400 font-semibold">{addr.city}, {addr.state} {addr.zipCode}</span>
                        {addr.isDefault && <span className="ml-2 px-2 py-0.2 bg-emerald-500/10 text-emerald-500 font-black text-[9px] rounded-full">DEFAULT</span>}
                      </div>
                      <button onClick={() => removeAddress(addr._id)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl">
                        <FaTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Address Form */}
                <form onSubmit={handleAddAddressSubmit} className="space-y-2 pt-2 text-xs">
                  <span className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Add New Address:</span>
                  <input 
                    type="text" 
                    placeholder="Street Address" 
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                    <input type="text" placeholder="Zip Code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                  </div>
                  <button type="submit" className="w-full py-2 bg-emerald-600 text-white font-extrabold rounded-xl">
                    Save Location
                  </button>
                </form>
              </div>

              {/* Achievement Badges Showcase */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaAward className="text-amber-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Achievement Badges</h3>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">🏆</span>
                    <p className="font-black text-slate-900 dark:text-white text-[11px]">Gold Recycler</p>
                    <span className="text-[9px] text-slate-400 font-bold">100+ kg Recycled</span>
                  </div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">🌱</span>
                    <p className="font-black text-slate-900 dark:text-white text-[11px]">Zero Waste</p>
                    <span className="text-[9px] text-slate-400 font-bold">5 Pickups Done</span>
                  </div>
                  <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-1">
                    <span className="text-xl block">⚡</span>
                    <p className="font-black text-slate-900 dark:text-white text-[11px]">Speed Recycler</p>
                    <span className="text-[9px] text-slate-400 font-bold">Same-Day Pickup</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <FaHistory className="text-emerald-500" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Recent Activity</h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center space-x-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Account Logged In</p>
                      <span className="text-[9px] text-slate-400 font-semibold">Today • 2 hours ago</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Updated Delivery Address</p>
                      <span className="text-[9px] text-slate-400 font-semibold">Yesterday • 04:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dangerous Zone: Delete Account */}
              <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3">
                <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm">Dangerous Zone</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Permanently delete your EcoReward profile and all associated data.</p>
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors"
                >
                  Delete Account
                </button>
              </div>

            </div>

          </div>

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h4 className="font-black text-slate-900 dark:text-white text-base">Change Password</h4>
                  <button onClick={() => setShowChangePasswordModal(false)} className="text-slate-400 hover:text-white">
                    <FaTimes />
                  </button>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
                  <input 
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <input 
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl">
                    Update Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center space-y-4">
                <FaExclamationTriangle className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
                <h4 className="font-black text-slate-900 dark:text-white text-lg">Are you sure?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">This action cannot be undone. All EcoPoints and pickup data will be deleted.</p>
                <div className="flex space-x-2 pt-2">
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl">
                    Cancel
                  </button>
                  <button onClick={handleDeleteAccount} className="flex-1 py-2.5 bg-rose-600 text-white font-extrabold text-xs rounded-xl">
                    Yes, Delete
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

export default Profile;
