import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { 
  FaCogs, FaPaypal, FaCheck, FaExclamationTriangle, 
  FaTruck, FaShieldAlt, FaToggleOn, FaToggleOff, FaLock, 
  FaCoins, FaSlidersH, FaSave, FaTools, FaUserCheck, FaGift, FaCheckCircle
} from 'react-icons/fa';

const AdminSettings = () => {
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('rates'); // 'rates' | 'driver' | 'system' | 'permissions'

  // System Settings State
  const [basePoints, setBasePoints] = useState(5);
  const [minPickupWeight, setMinPickupWeight] = useState(2.0);
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [rewardRates, setRewardRates] = useState({
    Plastic: 10,
    Paper: 8,
    Metal: 20,
    Glass: 6,
    Organic: 4,
    'E-Waste': 15
  });

  // Driver Fleet & Dispatch Controls
  const [driverCommissionRate, setDriverCommissionRate] = useState(80);
  const [driverAutoDispatch, setDriverAutoDispatch] = useState(true);
  const [requirePhotoAudit, setRequirePhotoAudit] = useState(true);

  // Admin Permission Matrix
  const [permissions, setPermissions] = useState({
    canApproveDrivers: true,
    canManageCoupons: true,
    canApprovePayouts: true,
    canEditRates: true,
    canViewAuditLogs: true
  });

  // Pending Rewards Cashouts
  const [pendingCashouts, setPendingCashouts] = useState([]);

  const fetchSettingsAndRewards = async () => {
    try {
      const [settingsRes, rewardsRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/rewards/pending')
      ]);

      if (settingsRes.data.success) {
        const data = settingsRes.data.data;
        setBasePoints(data.basePoints ?? 5);
        setMinPickupWeight(data.minPickupWeight ?? 2.0);
        setSystemMaintenance(data.systemMaintenance ?? false);
        setDriverCommissionRate(data.driverCommissionRate ?? 80);
        setDriverAutoDispatch(data.driverAutoDispatch ?? true);
        setRequirePhotoAudit(data.requirePhotoAudit ?? true);
        if (data.rewardRates) setRewardRates(data.rewardRates);
        if (data.permissions) setPermissions(data.permissions);
      }

      if (rewardsRes.data.success) {
        setPendingCashouts(rewardsRes.data.data);
      }
    } catch (err) {
      setError('Failed to load system configurations from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndRewards();
  }, []);

  // Sync real-time socket updates when another admin updates settings
  useEffect(() => {
    if (realtimeData?.latestSettings) {
      const data = realtimeData.latestSettings;
      setBasePoints(data.basePoints ?? 5);
      setMinPickupWeight(data.minPickupWeight ?? 2.0);
      setSystemMaintenance(data.systemMaintenance ?? false);
      setDriverCommissionRate(data.driverCommissionRate ?? 80);
      setDriverAutoDispatch(data.driverAutoDispatch ?? true);
      setRequirePhotoAudit(data.requirePhotoAudit ?? true);
      if (data.rewardRates) setRewardRates(data.rewardRates);
      if (data.permissions) setPermissions(data.permissions);
      addToast('⚡ Live System Settings Synced across session!', 'info', 'Real-Time Sync');
    }
  }, [realtimeData?.latestSettings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const res = await api.put('/admin/settings', {
        basePoints,
        minPickupWeight,
        systemMaintenance,
        driverCommissionRate,
        driverAutoDispatch,
        requirePhotoAudit,
        rewardRates,
        permissions
      });

      if (res.data.success) {
        setSuccess('System configurations & permissions updated and broadcasted live!');
        addToast('✅ Admin Settings & Permission Rules Saved Successfully!', 'success', 'Settings Updated');
        fetchSettingsAndRewards();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save system settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveCashout = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/rewards/${id}/approve`);
      if (res.data.success) {
        setSuccess('Cashback redemption approved and dispatched successfully!');
        addToast('💸 Cashback payout approved & sent to customer email!', 'success', 'Payout Dispatched');
        fetchSettingsAndRewards();
      }
    } catch (err) {
      setError('Failed to process payout approval.');
    }
  };

  const handleRateChange = (category, value) => {
    setRewardRates(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 border border-emerald-500/30 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">System Settings & Governance</h2>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold border border-emerald-500/30">
                  v2.4 Live Core
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium max-w-xl">
                Configure recycling reward formulas, material rates, driver commissions, system maintenance modes, and admin role permissions linked live to User and Driver apps.
              </p>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-xs shadow-lg flex items-center space-x-2 border border-emerald-300 flex-shrink-0 transition-transform active:scale-95"
            >
              <FaSave className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving Rules...' : 'Save All Settings'}</span>
            </button>
          </div>

          {/* Maintenance Mode Warning Banner Preview */}
          {systemMaintenance && (
            <div className="p-4 bg-amber-500/15 border border-amber-500/40 rounded-3xl text-amber-300 text-xs font-bold flex items-center justify-between shadow">
              <div className="flex items-center space-x-2">
                <FaTools className="h-5 w-5 text-amber-400 animate-bounce" />
                <span>🚨 SYSTEM MAINTENANCE MODE IS CURRENTLY ACTIVE! User booking is temporarily paused.</span>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 rounded-full text-[10px] uppercase font-black text-amber-200">
                LIVE ON USER & DRIVER PORTALS
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 text-rose-500 text-xs rounded-2xl font-bold border border-rose-500/30 flex items-center space-x-2">
              <FaExclamationTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 text-emerald-400 text-xs rounded-2xl font-bold border border-emerald-500/30 flex items-center space-x-2">
              <FaCheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Columns: Tabbed Interactive Settings & Formulas */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Navigation Tabs Bar */}
                <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('rates')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all ${
                      activeTab === 'rates'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <FaCoins />
                    <span>Material Rates & Formula</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('driver')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all ${
                      activeTab === 'driver'
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <FaTruck />
                    <span>Driver Fleet Rules</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('system')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all ${
                      activeTab === 'system'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <FaTools />
                    <span>System Modes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('permissions')}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all ${
                      activeTab === 'permissions'
                        ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800'
                    }`}
                  >
                    <FaShieldAlt />
                    <span>Admin Permissions</span>
                  </button>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* TAB 1: Material Rates & Formula Constants */}
                  {activeTab === 'rates' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                          <FaCoins className="text-emerald-500" />
                          <span>Reward Points Formula & Exchange Rates</span>
                        </h3>
                        <span className="text-[10px] text-emerald-500 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          Linked to User & Driver Calculations
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <label className="text-slate-400 font-black uppercase text-[9px] tracking-wider block">
                            Base Points per Booking
                          </label>
                          <input 
                            type="number" 
                            value={basePoints} 
                            onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-mono font-black border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-sm"
                          />
                          <span className="text-[9px] text-slate-400 font-medium block">Bonus EcoPoints granted automatically per request.</span>
                        </div>

                        <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <label className="text-slate-400 font-black uppercase text-[9px] tracking-wider block">
                            Minimum Pickup Weight (kg)
                          </label>
                          <input 
                            type="number" 
                            step="0.5"
                            value={minPickupWeight} 
                            onChange={(e) => setMinPickupWeight(parseFloat(e.target.value) || 1.0)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl font-mono font-black border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 text-sm"
                          />
                          <span className="text-[9px] text-slate-400 font-medium block">Minimum collection threshold for citizens.</span>
                        </div>
                      </div>

                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                          Material Exchange Rates (Points Credited / kg)
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(rewardRates).map(([cat, rate]) => (
                            <div key={cat} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                              <label className="text-[10px] text-slate-400 font-black uppercase block">{cat}</label>
                              <div className="flex items-center space-x-1">
                                <input 
                                  type="number"
                                  value={rate}
                                  onChange={(e) => handleRateChange(cat, e.target.value)}
                                  className="w-full bg-white dark:bg-slate-900 px-3 py-1.5 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-black rounded-xl text-sm focus:outline-none"
                                />
                                <span className="text-[10px] text-slate-400 font-bold">pts/kg</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Driver Fleet Rules */}
                  {activeTab === 'driver' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                          <FaTruck className="text-cyan-500" />
                          <span>Driver Operational & Financial Controls</span>
                        </h3>
                        <span className="text-[10px] text-cyan-500 font-mono font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                          Applied to Driver Console
                        </span>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="font-black text-slate-900 dark:text-white text-xs">
                              Driver Payout Commission Rate ({driverCommissionRate}%)
                            </label>
                            <span className="text-cyan-500 font-mono font-black">{driverCommissionRate}% Driver / {100 - driverCommissionRate}% Platform</span>
                          </div>
                          <input 
                            type="range"
                            min="50"
                            max="95"
                            value={driverCommissionRate}
                            onChange={(e) => setDriverCommissionRate(parseInt(e.target.value))}
                            className="w-full accent-cyan-500 cursor-pointer"
                          />
                          <p className="text-[10px] text-slate-400">Percentage of recycling material payout transferred directly to driver earnings wallet.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block text-xs">Auto Driver Dispatch</span>
                              <span className="text-[10px] text-slate-400 block">Auto-assign nearest online EV driver.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDriverAutoDispatch(!driverAutoDispatch)}
                              className={`text-2xl transition-colors ${driverAutoDispatch ? 'text-emerald-500' : 'text-slate-400'}`}
                            >
                              {driverAutoDispatch ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </div>

                          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block text-xs">Waste Photo Audit</span>
                              <span className="text-[10px] text-slate-400 block">Require photo upload before completion.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRequirePhotoAudit(!requirePhotoAudit)}
                              className={`text-2xl transition-colors ${requirePhotoAudit ? 'text-emerald-500' : 'text-slate-400'}`}
                            >
                              {requirePhotoAudit ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: System Operational Modes */}
                  {activeTab === 'system' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                          <FaTools className="text-amber-500" />
                          <span>Platform Maintenance & Operational Modes</span>
                        </h3>
                      </div>

                      <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-black text-slate-900 dark:text-white text-sm block">System Maintenance Mode</span>
                            <span className="text-slate-400 font-medium block">
                              When enabled, citizens and drivers see an active maintenance banner, and new pickup requests are temporarily paused.
                            </span>
                          </div>

                          <select 
                            value={systemMaintenance ? 'yes' : 'no'}
                            onChange={(e) => setSystemMaintenance(e.target.value === 'yes')}
                            className={`px-4 py-2.5 border rounded-2xl font-black text-xs transition-colors ${
                              systemMaintenance 
                                ? 'bg-amber-500 text-slate-950 border-amber-400' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            }`}
                          >
                            <option value="no">🟢 Active Operational</option>
                            <option value="yes">🚨 Under Maintenance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Admin Permissions Matrix */}
                  {activeTab === 'permissions' && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                          <FaShieldAlt className="text-purple-500" />
                          <span>Admin Role & Permission Access Controls</span>
                        </h3>
                        <span className="text-[10px] text-purple-500 font-mono font-bold bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                          Role Security Controls
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        {[
                          { key: 'canApproveDrivers', label: 'Approve & License Driver Accounts', desc: 'Allows administrator to verify & approve new EV driver registrations.' },
                          { key: 'canManageCoupons', label: 'Manage & Issue Store Coupons', desc: 'Allows creating discount promo vouchers and adjusting point prices.' },
                          { key: 'canApprovePayouts', label: 'Approve Payouts & Cashbacks', desc: 'Allows processing PayPal/UPI cashback claims.' },
                          { key: 'canEditRates', label: 'Edit Material Rate Formulas', desc: 'Allows modifying point rates per kg for Plastic, Paper, Metal, Glass.' },
                          { key: 'canViewAuditLogs', label: 'View Real-Time Audit Logs', desc: 'Grants access to driver photo logs & user transaction audit history.' }
                        ].map((perm) => (
                          <div key={perm.key} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white block">{perm.label}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{perm.desc}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => togglePermission(perm.key)}
                              className={`text-2xl transition-colors ${permissions[perm.key] ? 'text-emerald-500' : 'text-slate-400'}`}
                            >
                              {permissions[perm.key] ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl transition-all shadow-lg flex items-center justify-center space-x-2 text-xs"
                  >
                    <FaSave className="h-4 w-4" />
                    <span>{isSubmitting ? 'Saving Configurations...' : 'Save & Broadcast All Settings'}</span>
                  </button>
                </form>

              </div>

              {/* Right Column - Pending Cashouts (PayPal / UPI) */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-black text-slate-900 dark:text-white text-sm flex items-center space-x-2">
                      <FaPaypal className="text-sky-500" />
                      <span>Pending Cashouts ({pendingCashouts.length})</span>
                    </h3>
                  </div>

                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {pendingCashouts.map((pc) => (
                      <div key={pc._id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-black text-slate-900 dark:text-white">{pc.user?.name || 'Customer'}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block">Payout Email: {pc.details?.email}</span>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200/40 dark:border-slate-700">
                          <span className="font-mono font-black text-emerald-500">₹{pc.pointsRedeemed} pts</span>
                          <button 
                            onClick={() => handleApproveCashout(pc._id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-[10px] shadow transition-transform active:scale-95"
                          >
                            Approve Payout
                          </button>
                        </div>
                      </div>
                    ))}
                    {pendingCashouts.length === 0 && (
                      <div className="p-6 text-center space-y-2">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto text-lg">
                          <FaCheckCircle />
                        </div>
                        <p className="text-xs font-black text-slate-800 dark:text-white">All Payouts Dispatched</p>
                        <span className="text-[10px] text-slate-400 font-medium block">No pending cashback transfers to resolve.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
