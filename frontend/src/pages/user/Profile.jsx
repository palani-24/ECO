import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/UserLayout';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import { 
  FaUser, FaLock, FaMapMarkerAlt, FaTrash, FaCheck, FaExclamationTriangle, 
  FaCamera, FaSun, FaMoon, FaBell, FaPhone, FaCalendarAlt, FaGlobe, 
  FaShieldAlt, FaAward, FaHistory, FaCheckCircle, FaExclamationCircle, FaTimes,
  FaEnvelope, FaStar, FaChevronRight, FaKey
} from 'react-icons/fa';
import api from '../../utils/api';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatar';
import { triggerHaptic } from '../../utils/mobileNative';

const Profile = () => {
  const { user, updateProfile, addAddress, removeAddress, setDefaultAddress, logout } = useAuth();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'addresses' | 'security' | 'preferences'

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
    if (user?.name || name) score += 25;
    if (user?.email || email) score += 25;
    if (phone) score += 20;
    if (user?.addresses && user.addresses.length > 0) score += 20;
    if (user?.profileImage || profileImage) score += 10;
    return Math.min(100, score);
  };

  const completionPct = calculateCompletion();

  const handleToggleDarkMode = () => {
    triggerHaptic(20);
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

  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setProfileError('Image size should be less than 15MB.');
      return;
    }

    try {
      setProfileError('');
      setProfileSuccess('Compressing & processing profile picture...');
      const compressedDataUrl = await compressImage(file, 400, 400, 0.85);
      setProfileImage(compressedDataUrl);
      setProfileSuccess('Photo processed! Click "Save Personal Details" below to persist.');
      setShowAvatarSelector(false);
      triggerHaptic(25);
    } catch (err) {
      setProfileError('Failed to process image file. Please try another photo.');
    }
  };

  const handleSelectPreset = (url) => {
    triggerHaptic(15);
    setProfileImage(url);
    setProfileSuccess('Avatar preset selected! Remember to click Save.');
    setShowAvatarSelector(false);
  };

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    triggerHaptic(30);
    setProfileError('');
    setProfileSuccess('');
    setLoading(true);

    try {
      const payload = { name, phone, dob, profileImage, avatar: profileImage };
      const res = await updateProfile(payload);
      if (res.success) {
        setProfileSuccess('Personal details & DP photo saved successfully across all devices!');
        setTimeout(() => setProfileSuccess(''), 4000);
      } else {
        setProfileError(res.message || 'Failed to update profile');
      }
    } catch (err) {
      setProfileError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    triggerHaptic(20);
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
        setTimeout(() => setProfileSuccess(''), 4000);
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
    triggerHaptic(25);
    setAddrError('');
    setAddrSuccess('');

    if (!street || !city || !state || !zipCode) {
      setAddrError('Please fill all address fields');
      return;
    }

    try {
      const res = await addAddress({ street, city, state, zipCode, isDefault: user?.addresses?.length === 0 });
      if (res.success) {
        setAddrSuccess('New location added successfully!');
        setStreet(''); setCity(''); setState(''); setZipCode('');
        setTimeout(() => setAddrSuccess(''), 4000);
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

  const navTabs = [
    { id: 'personal', label: 'Personal', icon: <FaUser /> },
    { id: 'addresses', label: 'Addresses', icon: <FaMapMarkerAlt /> },
    { id: 'security', label: 'Security', icon: <FaShieldAlt /> },
    { id: 'preferences', label: 'Preferences', icon: <FaAward /> }
  ];

  return (
    <UserLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        
        {/* Header Hero Banner (Curved Glassmorphism Card) */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-emerald-400/20">
          <div className="flex items-center space-x-4 z-10">
            <div className="relative group shrink-0">
              <img 
                src={getAvatarUrl(profileImage || user?.profileImage, name)} 
                onError={(e) => handleAvatarError(e, name)}
                alt="Profile" 
                className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30 shadow-lg"
              />
              <button 
                onClick={() => {
                  triggerHaptic(15);
                  setShowAvatarSelector(!showAvatarSelector);
                }}
                className="absolute bottom-0 right-0 p-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                title="Change Profile Photo"
              >
                <FaCamera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-2xl font-black text-white">{name || 'Citizen'}</h2>
                <FaCheckCircle className="text-emerald-300 text-sm" title="Verified Account" />
              </div>
              <p className="text-xs text-emerald-100 font-medium">{email || 'citizen@ecoreward.com'}</p>
              <div className="pt-0.5">
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/20 shadow-inner">
                  ECO WARRIOR 🌿
                </span>
              </div>
            </div>
          </div>

          {/* Profile Completion Progress Bar */}
          <div className="w-full sm:w-64 bg-white/15 backdrop-blur-md border border-white/25 p-4 rounded-2xl space-y-2 z-10">
            <div className="flex justify-between text-xs font-black">
              <span>Profile Completion</span>
              <span className="text-amber-300">{completionPct}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-900/40 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-500 shadow-sm" 
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="text-[10px] text-emerald-100 font-bold block">
              {completionPct === 100 ? (
                <span className="text-yellow-200">🎉 100% Complete! All citizen perks active</span>
              ) : (
                'Add saved address & phone to hit 100%'
              )}
            </span>
          </div>
        </div>

        {/* Avatar Preset Selector Dropdown Modal */}
        <AnimatePresence>
          {showAvatarSelector && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl space-y-3"
            >
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-900 dark:text-white">Choose Avatar Preset or Upload Photo:</span>
                <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-sm transition-all active:scale-95">
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>
              <div className="flex space-x-3 overflow-x-auto py-1">
                {presetAvatars.map((url, i) => (
                  <button 
                    key={i} 
                    type="button"
                    onClick={() => handleSelectPreset(url)}
                    className="hover:scale-110 transition-transform shrink-0"
                  >
                    <img src={url} alt="Preset" className="h-12 w-12 rounded-full border-2 border-emerald-500 object-cover shadow-md" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Feedback Toasts */}
        {profileSuccess && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
            <FaCheckCircle className="h-4 w-4 shrink-0" />
            <span>{profileSuccess}</span>
          </motion.div>
        )}
        {profileError && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
            <FaExclamationTriangle className="h-4 w-4 shrink-0" />
            <span>{profileError}</span>
          </motion.div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm flex items-center space-x-1 overflow-x-auto">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic(15);
                  setActiveTab(tab.id);
                }}
                className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleUpdatePersonal} 
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5"
          >
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FaUser className="text-emerald-500 text-base" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Full Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Email Address</label>
                <div className="relative">
                  <input 
                    type="email"
                    value={email}
                    disabled
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full">
                    VERIFIED
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</label>
                <input 
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Date of Birth</label>
                <input 
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-black text-slate-400 uppercase tracking-wider text-[10px]">Language Preference</label>
              <select 
                value={language}
                onChange={(e) => { 
                  setLanguage(e.target.value); 
                  localStorage.setItem('pref_language', e.target.value); 
                  triggerHaptic(10);
                }}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all active:scale-98 cursor-pointer"
            >
              {loading ? 'Saving Changes...' : 'Save Personal Details'}
            </button>
          </motion.form>
        )}

        {/* TAB 2: SAVED ADDRESSES */}
        {activeTab === 'addresses' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-emerald-500 text-base" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">My Saved Locations</h3>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {user?.addresses?.length || 0} Saved
              </span>
            </div>

            {/* Google Map Location Preview */}
            <div className="h-36 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-inner">
              <GoogleRouteMap height="144px" />
            </div>

            {addrSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
                <FaCheckCircle className="h-4 w-4 shrink-0" />
                <span>{addrSuccess}</span>
              </div>
            )}
            {addrError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-2xl flex items-center space-x-2">
                <FaExclamationTriangle className="h-4 w-4 shrink-0" />
                <span>{addrError}</span>
              </div>
            )}

            {/* Saved Address List */}
            <div className="space-y-2.5 text-xs">
              {user?.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr._id} className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{addr.street}</p>
                      <span className="text-[11px] text-slate-400 font-medium">{addr.city}, {addr.state} - {addr.zipCode}</span>
                      {addr.isDefault ? (
                        <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-500 font-black text-[9px] rounded-full">DEFAULT</span>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => setDefaultAddress(addr._id)}
                          className="ml-2 text-[10px] text-emerald-500 hover:underline font-bold"
                        >
                          Set Default
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => {
                        triggerHaptic(20);
                        removeAddress(addr._id);
                      }} 
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      title="Delete Location"
                    >
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  No addresses saved yet. Add your home or office address below for 1-tap booking!
                </div>
              )}
            </div>

            {/* Add Address Form */}
            <form onSubmit={handleAddAddressSubmit} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-black text-slate-400 uppercase tracking-wider text-[10px] block">Add New Collection Address:</span>
              <input 
                type="text" 
                placeholder="Street Address, Flat / House No." 
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
              <div className="grid grid-cols-3 gap-2">
                <input 
                  type="text" 
                  placeholder="City" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium" 
                />
                <input 
                  type="text" 
                  placeholder="State" 
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium" 
                />
                <input 
                  type="text" 
                  placeholder="Zip Code" 
                  value={zipCode} 
                  onChange={(e) => setZipCode(e.target.value)} 
                  className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium" 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow transition-all active:scale-98 cursor-pointer"
              >
                Save New Location
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 3: SECURITY & SESSIONS */}
        {activeTab === 'security' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-emerald-500 text-base" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Security Settings</h3>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(true)}
                className="px-3.5 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-black text-xs rounded-xl border border-emerald-500/20 transition-colors cursor-pointer"
              >
                Change Password
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm">Two-Factor Authentication (2FA)</p>
                  <span className="text-[11px] text-slate-400 font-medium block">Secure your wallet payouts with instant OTP verification</span>
                </div>
                <input 
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => {
                    triggerHaptic(15);
                    setTwoFactorEnabled(e.target.checked);
                  }}
                  className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm">Active Login Sessions</p>
                  <span className="text-[11px] text-slate-400 font-medium block">Mobile App / Chrome PWA • Active right now</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-black text-[10px] rounded-full border border-emerald-500/20">
                  CURRENT
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PREFERENCES & BADGES */}
        {activeTab === 'preferences' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Preferences Box */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaBell className="text-emerald-500 text-base" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Preferences & Appearance</h3>
              </div>

              <div className="space-y-3 text-xs">
                {/* Dark Mode Switch */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    {darkMode ? <FaMoon className="text-amber-400 text-base" /> : <FaSun className="text-amber-500 text-base" />}
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">Theme Mode</p>
                      <span className="text-[10px] text-slate-400">Toggle between dark and light aesthetics</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleToggleDarkMode}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black rounded-xl text-[10px] cursor-pointer"
                  >
                    {darkMode ? 'DARK MODE' : 'LIGHT MODE'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm block">Email Notifications</span>
                    <span className="text-[10px] text-slate-400">Weekly waste balance & cashback statements</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={emailNotification}
                    onChange={(e) => {
                      triggerHaptic(15);
                      setEmailNotification(e.target.checked);
                      localStorage.setItem('pref_email_notif', String(e.target.checked));
                    }}
                    className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white text-sm block">SMS Pickup Alerts</span>
                    <span className="text-[10px] text-slate-400">Live driver location & scale verification OTP</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => {
                      triggerHaptic(15);
                      setSmsAlerts(e.target.checked);
                    }}
                    className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Achievement Badges Showcase */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FaAward className="text-amber-500 text-base" />
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Earned Eco Badges</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-1">
                  <span className="text-2xl block">🏆</span>
                  <p className="font-black text-slate-900 dark:text-white text-[11px]">Gold Recycler</p>
                  <span className="text-[9px] text-slate-400 font-bold">100+ kg Recycled</span>
                </div>
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                  <span className="text-2xl block">🌱</span>
                  <p className="font-black text-slate-900 dark:text-white text-[11px]">Zero Waste</p>
                  <span className="text-[9px] text-slate-400 font-bold">5 Pickups Done</span>
                </div>
                <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl space-y-1">
                  <span className="text-2xl block">⚡</span>
                  <p className="font-black text-slate-900 dark:text-white text-[11px]">Speed Recycler</p>
                  <span className="text-[9px] text-slate-400 font-bold">Same-Day Pickup</span>
                </div>
              </div>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3">
              <h4 className="font-black text-rose-600 dark:text-rose-400 text-sm">Danger Zone</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Permanently delete your EcoReward profile and clear all points history.</p>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        )}

      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-black text-slate-900 dark:text-white text-base">Change Password</h4>
              <button onClick={() => setShowChangePasswordModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <input 
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              />
              <input 
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              />
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl shadow hover:bg-emerald-500 cursor-pointer">
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
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className="flex-1 py-2.5 bg-rose-600 text-white font-extrabold text-xs rounded-xl cursor-pointer">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </UserLayout>
  );
};

export default Profile;
