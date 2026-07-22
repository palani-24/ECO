import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUser, FaLock, FaMapMarkerAlt, FaTrash, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const Profile = () => {
  const { user, updateProfile, addAddress, removeAddress, setDefaultAddress } = useAuth();

  // Profile Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (password && password !== confirmPassword) {
      setProfileError('Passwords do not match');
      return;
    }

    setLoading(true);
    const payload = { name, email };
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

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profile Settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage your profile details, passwords, and delivery addresses.</p>
          </div>

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
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="City"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      placeholder="State"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
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
        </main>
      </div>
    </div>
  );
};

export default Profile;
