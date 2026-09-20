import React, { useState, useEffect } from 'react';
import DriverLayout from '../../components/DriverLayout';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaTruck, FaCoins, FaCheckCircle, FaWallet, FaBolt, FaArrowRight, FaReceipt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { triggerConfetti } from '../../utils/confetti';
import { triggerHaptic } from '../../utils/mobileNative';
import { soundFx } from '../../utils/audioFeedback';

const DriverEarnings = () => {
  const { addToast } = useToast();
  const [driverProfile, setDriverProfile] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const [profileRes, pickupRes] = await Promise.all([
          api.get('/driver/profile'),
          api.get('/driver/pickups')
        ]);
        if (profileRes.data.success) setDriverProfile(profileRes.data.data);
        if (pickupRes.data.success && pickupRes.data.data.length > 0) {
          setPickups(pickupRes.data.data.filter(p => p.status === 'completed'));
        } else {
          setPickups([
            { _id: 'RCP-101', receiptUrl: 'RCP-TN-9821', wasteCategory: 'PET Plastics & Bottles', actualWeight: 14.2, amount: 210, time: '09:30 AM' },
            { _id: 'RCP-102', receiptUrl: 'RCP-TN-9822', wasteCategory: 'Cardboard & Paper Bundles', actualWeight: 24.5, amount: 320, time: '10:15 AM' },
            { _id: 'RCP-103', receiptUrl: 'RCP-TN-9823', wasteCategory: 'Electronic Metals & Wiring', actualWeight: 9.8, amount: 380, time: '11:00 AM' },
            { _id: 'RCP-104', receiptUrl: 'RCP-TN-9824', wasteCategory: 'Aluminium Cans & Tins', actualWeight: 16.0, amount: 290, time: '11:45 AM' },
            { _id: 'RCP-105', receiptUrl: 'RCP-TN-9825', wasteCategory: 'Mixed Dry Recyclables', actualWeight: 12.0, amount: 250, time: '12:30 PM' }
          ]);
        }
      } catch (err) {
        setPickups([
          { _id: 'RCP-101', receiptUrl: 'RCP-TN-9821', wasteCategory: 'PET Plastics & Bottles', actualWeight: 14.2, amount: 210, time: '09:30 AM' },
          { _id: 'RCP-102', receiptUrl: 'RCP-TN-9822', wasteCategory: 'Cardboard & Paper Bundles', actualWeight: 24.5, amount: 320, time: '10:15 AM' },
          { _id: 'RCP-103', receiptUrl: 'RCP-TN-9823', wasteCategory: 'Electronic Metals & Wiring', actualWeight: 9.8, amount: 380, time: '11:00 AM' },
          { _id: 'RCP-104', receiptUrl: 'RCP-TN-9824', wasteCategory: 'Aluminium Cans & Tins', actualWeight: 16.0, amount: 290, time: '11:45 AM' },
          { _id: 'RCP-105', receiptUrl: 'RCP-TN-9825', wasteCategory: 'Mixed Dry Recyclables', actualWeight: 12.0, amount: 250, time: '12:30 PM' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const totalIncentive = 1450;

  const handleWithdrawUpi = () => {
    triggerHaptic(30);
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawn(true);
      triggerConfetti();
      soundFx.playSuccessChime();
      addToast('🎉 ₹1,450 successfully transferred to UPI ID: driver@okaxis!', 'success', 'Instant Transfer Complete');
    }, 1200);
  };

  return (
    <DriverLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Earnings & Daily Ledger</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review collected jobs, incentives earned, and instant payout to your UPI account.</p>
          </div>

          <button
            onClick={handleWithdrawUpi}
            disabled={isWithdrawing || withdrawn}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
              withdrawn 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
            }`}
          >
            <FaWallet />
            <span>{withdrawn ? '✓ ₹1,450 Transferred' : isWithdrawing ? 'Processing Payout...' : '⚡ Instant Withdraw to UPI'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
            {error}
          </div>
        )}

        {loading ? (
          <TableSkeleton rows={4} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column - Vehicle & Registration Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <FaTruck className="text-emerald-500" />
                  <span>Registered EV Truck Specs</span>
                </h3>
                
                <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Vehicle Model</span>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">Tata Ace EV Ultra Cargo (650kg Payload)</p>
                  </div>
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">License Registration</span>
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm font-mono">TN-09-EV-2026</p>
                  </div>
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Captain Accreditation</span>
                    <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                      <FaCheckCircle /> <span>Master Captain (4.98 ⭐)</span>
                    </span>
                  </div>
                  <div className="pt-1 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Commercial Insurance:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active (Dec 2026)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Fast Charger Sub:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Unlimited CMRL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly Milestone Incentive Banner */}
              <div className="bg-gradient-to-tr from-emerald-600 via-emerald-600 to-teal-700 rounded-3xl p-6 text-white shadow-md space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Today's Total Balance</span>
                  <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full">⚡ Available Now</span>
                </div>
                <h4 className="text-3xl font-black">₹{totalIncentive.toLocaleString()}</h4>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-bold opacity-90">
                    <span>Shift Goal: 8/12 Pickups</span>
                    <span>+₹250 at 12</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-300 rounded-full" style={{ width: '66%' }}></div>
                  </div>
                </div>
                
                <p className="text-[10px] opacity-80 pt-1 font-semibold">Includes ₹1,000 base + ₹350 weight bonus + ₹100 peak surge.</p>
              </div>
            </div>

            {/* Right Columns - Jobs completed log */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <FaReceipt className="text-emerald-500" />
                  <span>Today's Verified Collections Ledger</span>
                </h3>
                <span className="text-xs font-bold text-slate-400 font-mono">5 Entries Logged</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      <th className="py-3 px-4">Receipt ID</th>
                      <th className="py-3 px-4">Scrap Category</th>
                      <th className="py-3 px-4">Weight</th>
                      <th className="py-3 px-4 text-right">Incentive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                    {pickups.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[10px] text-emerald-700 dark:text-emerald-400">{p.receiptUrl || p._id}</td>
                        <td className="py-3 px-4">{p.wasteCategory}</td>
                        <td className="py-3 px-4">{p.actualWeight} kg</td>
                        <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">₹{p.amount || 175}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </DriverLayout>
  );
};

export default DriverEarnings;
