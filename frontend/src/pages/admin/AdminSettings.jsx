import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import { FaCogs, FaPaypal, FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings
  const [basePoints, setBasePoints] = useState(5);
  const [systemMaintenance, setSystemMaintenance] = useState(false);
  const [rewardRates, setRewardRates] = useState({});

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
        setBasePoints(data.basePoints);
        setSystemMaintenance(data.systemMaintenance);
        setRewardRates(data.rewardRates || {});
      }

      if (rewardsRes.data.success) {
        setPendingCashouts(rewardsRes.data.data);
      }
    } catch (err) {
      setError('Failed to fetch configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndRewards();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await api.put('/admin/settings', {
        basePoints,
        systemMaintenance,
        rewardRates
      });
      if (res.data.success) {
        setSuccess('System configurations updated successfully!');
        fetchSettingsAndRewards();
      }
    } catch (err) {
      setError('Failed to save settings.');
    }
  };

  const handleApproveCashout = async (id) => {
    setError('');
    setSuccess('');
    try {
      const res = await api.put(`/admin/rewards/${id}/approve`);
      if (res.data.success) {
        setSuccess('Cashback redemption approved and dispatched successfully!');
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">System Settings & Vouchers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Configure recycling weights points rates and approve customer cashback transfers.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20 flex items-center space-x-1">
              <FaExclamationTriangle /> <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-semibold border border-emerald-250/20 flex items-center space-x-1">
              <FaCheck /> <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - System configurations & Rates */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                    <FaCogs className="text-primary-500" />
                    <span>Reward Points Formula Constants</span>
                  </h3>

                  <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold uppercase tracking-wider">Base Points</label>
                        <input 
                          type="number" 
                          value={basePoints} 
                          onChange={(e) => setBasePoints(parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2.5 border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold uppercase tracking-wider">Maintenance Mode</label>
                        <select 
                          value={systemMaintenance ? 'yes' : 'no'}
                          onChange={(e) => setSystemMaintenance(e.target.value === 'yes')}
                          className="w-full px-3 py-2.5 border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none font-bold"
                        >
                          <option value="no">Active Operational</option>
                          <option value="yes">Under Maintenance</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block uppercase tracking-wider">Material Exchange Rates (Points/kg)</span>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {Object.entries(rewardRates).map(([cat, rate]) => (
                          <div key={cat} className="space-y-1 bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                            <label className="text-[10px] text-slate-400 font-bold uppercase block">{cat}</label>
                            <input 
                              type="number"
                              value={rate}
                              onChange={(e) => handleRateChange(cat, e.target.value)}
                              className="w-full bg-white dark:bg-slate-900 px-2 py-1 border border-slate-300 dark:border-slate-750 text-slate-900 dark:text-white rounded-lg focus:outline-none font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow"
                    >
                      Save formula variables
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Column - Pending Cash outs (PayPal) */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                  <FaPaypal className="text-sky-500" />
                  <span>Pending Cashouts ({pendingCashouts.length})</span>
                </h3>

                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {pendingCashouts.map((pc) => (
                    <div key={pc._id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{pc.user.name}</h4>
                        <span className="text-[10px] text-slate-400 block">Payout Email: {pc.details.email}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/40">
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{pc.pointsRedeemed} pts</span>
                        <button 
                          onClick={() => handleApproveCashout(pc._id)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] shadow"
                        >
                          Approve Payout
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingCashouts.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">No pending cashback transfers to resolve.</p>
                  )}
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
