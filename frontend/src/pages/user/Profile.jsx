import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUser, FaLock, FaMapMarkerAlt, FaTrash, FaCheck, FaExclamationTriangle, FaCamera, FaSlidersH, FaSun, FaMoon, FaBell } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, addAddress, removeAddress, setDefaultAddress } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  // Preference switches
  const [emailNotification, setEmailNotification] = useState(() => {
    return localStorage.getItem('pref_email_notif') !== 'false';
  });
  const [weeklyReport, setWeeklyReport] = useState(() => {
    return localStorage.getItem('pref_weekly_report') !== 'false';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

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

  const handleToggleNotification = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, value.toString());
  };

  const presetAvatars = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=leaf&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/bottts/svg?seed=earth&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/bottts/svg?seed=recycle&backgroundColor=d1f4ff',
    'https://api.dicebear.com/7.x/bottts/svg?seed=solar&backgroundColor=ffd5d5',
    'https://api.dicebear.com/7.x/bottts/svg?seed=nature&backgroundColor=fbe3b5',
    'https://api.dicebear.com/7.x/bottts/svg?seed=green&backgroundColor=d5ffd5'
  ];

  const getEcoRank = (points) => {
    const pts = points || 0;
    if (pts >= 3000) return { title: 'Recycle Master 👑', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20' };
    if (pts >= 1500) return { title: 'Earth Protector 🌳', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border-indigo-500/20' };
    if (pts >= 500) return { title: 'Green Catalyst 🌿', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20' };
    return { title: 'Eco Novice 🌱', color: 'text-slate-650 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200/50' };
  };

  const ecoRank = getEcoRank(user?.points);

  // Address Form States
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [addrError, setAddrError] = useState('');
  const [addrSuccess, setAddrSuccess] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [addrLoading, setAddrLoading] = useState(false);

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
        setProfileSuccess('Profile picture uploaded and saved successfully!');
        setShowAvatarSelector(false);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }

    setLoading(true);
    const payload = { name, email, profileImage };
    if (password) payload.password = password;

    const res = await updateProfile(payload);
    setLoading(false);

    if (res.success) {
      setProfileSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } else {
      setProfileError(res.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddrError('');
    setAddrSuccess('');
    
    if (!street || !city || !state || !zipCode) {
      setAddrError('All fields are required');
      return;
    }

    setAddrLoading(true);
    const res = await addAddress({ street, city, state, zipCode });
    setAddrLoading(false);

    if (res.success) {
      setAddrSuccess('Address added successfully!');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
    } else {
      setAddrError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your profile details, passwords, and delivery addresses.</p>
          </div>

          {/* Top Profile Summary Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {/* DP Avatar container */}
              <div className="relative group">
                <img 
                  src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`} 
                  alt={name} 
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-500/20"
                />
                <button 
                  type="button"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-transform group-hover:scale-110"
                  title="Change Profile Picture"
                >
                  <FaCamera className="h-3 w-3" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                  <span>{name}</span>
                </h3>
                <p className="text-xs text-slate-400 capitalize font-bold tracking-wide mt-0.5">{user?.role} Profile Account</p>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${ecoRank.color}`}>
                  {ecoRank.title}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 px-5 py-4 rounded-2xl border border-slate-100 dark:border-slate-800/60 text-center sm:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">ECO POINTS BALANCE</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{user?.points || 0} pts</span>
            </div>
          </div>

          {/* Avatar Selector Panel */}
          {showAvatarSelector && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-805">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Choose Eco Avatar Preset</h4>
                <button 
                  onClick={() => setShowAvatarSelector(false)} 
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {presetAvatars.map((url, i) => (
                  <button 
                    key={i}
                    type="button"
                    onClick={() => {
                      setProfileImage(url);
                      setShowAvatarSelector(false);
                    }}
                    className={`p-1.5 rounded-2xl border-2 transition-all hover:scale-105 ${profileImage === url ? 'border-primary-500 bg-emerald-50/10' : 'border-transparent bg-slate-50 dark:bg-slate-800/40'}`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="h-12 w-12 rounded-xl object-cover mx-auto" />
                  </button>
                ))}
              </div>

              {/* File Upload Option */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload Image from Device</label>
                <label className="cursor-pointer px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2">
                  <FaCamera className="h-3.5 w-3.5" />
                  <span>Choose Photo File</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-500 uppercase">Or Enter Custom Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowAvatarSelector(false)}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs rounded-xl"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Box - Profile Info */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <FaUser className="text-primary-500" />
                <span>Account Credentials</span>
              </h3>

              {profileError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-1.5">
                  <FaExclamationTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {profileSuccess && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
                  {profileSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-colors shadow-md shadow-primary-500/10 flex items-center justify-center space-x-1.5"
                >
                  <FaCheck />
                  <span>{loading ? 'Saving updates...' : 'Save Profile'}</span>
                </button>
              </form>
            </div>

            {/* Right Box - Addresses */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <FaMapMarkerAlt className="text-emerald-500" />
                <span>My Saved Locations</span>
              </h3>

              {addrError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
                  {addrError}
                </div>
              )}

              {addrSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-semibold border border-emerald-250/20">
                  {addrSuccess}
                </div>
              )}

              {/* Saved Address list */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {user?.addresses.map((addr) => (
                  <div key={addr._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{addr.street}</p>
                      <p className="text-slate-500 dark:text-slate-400">{addr.city}, {addr.state} {addr.zipCode}</p>
                      {addr.isDefault ? (
                        <span className="inline-block px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[8px] bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20">Default</span>
                      ) : (
                        <button 
                          onClick={() => setDefaultAddress(addr._id)}
                          className="text-[9px] font-bold text-primary-500 hover:underline"
                        >
                          Make Default
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={() => removeAddress(addr._id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Address"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {user?.addresses.length === 0 && (
                  <p className="text-slate-400 py-4 text-center">No addresses registered. Save a new location below.</p>
                )}
              </div>

              {/* Add Address Form */}
              <form onSubmit={handleAddAddress} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">Add New Location</span>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    placeholder="Street Address"
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addrLoading}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-colors text-xs"
                >
                  {addrLoading ? 'Saving...' : 'Add Address'}
                </button>
              </form>
            </div>
          </div>

          {/* Preferences & UI Settings Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <FaSlidersH className="text-primary-500" />
              <span>System & UI Preferences</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Theme Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Visual Theme Mode</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Toggle light or dark theme mode</p>
                </div>
                <button 
                  onClick={handleToggleDarkMode}
                  className="h-9 w-9 bg-white dark:bg-slate-950 text-slate-700 dark:text-amber-400 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm"
                  title="Toggle Visual Theme"
                >
                  {darkMode ? <FaSun className="h-4 w-4 animate-spin-slow" /> : <FaMoon className="h-4 w-4" />}
                </button>
              </div>

              {/* Alert Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Real-time Pickup Alerts</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Get emails when drivers update status</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={emailNotification}
                    onChange={(e) => handleToggleNotification('pref_email_notif', e.target.checked, setEmailNotification)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* Report Settings */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs">Weekly Eco Newsletter</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Receive summary of total carbon saved</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={weeklyReport}
                    onChange={(e) => handleToggleNotification('pref_weekly_report', e.target.checked, setWeeklyReport)}
                    className="sr-only peer" 
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
