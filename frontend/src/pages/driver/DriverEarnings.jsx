import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaTruck, FaDollarSign, FaPassport, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const DriverEarnings = () => {
  const [driverProfile, setDriverProfile] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const [profileRes, pickupRes] = await Promise.all([
          api.get('/driver/profile'),
          api.get('/driver/pickups')
        ]);
        if (profileRes.data.success) setDriverProfile(profileRes.data.data);
        if (pickupRes.data.success) setPickups(pickupRes.data.data.filter(p => p.status === 'completed'));
      } catch (err) {
        setError('Failed to load earnings log.');
      } finally {
        setLoading(false);
      }
    };
    fetchEarningsData();
  }, []);

  const totalIncentive = pickups.length * 125;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Earnings & Vehicle</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Review collected jobs, incentives earned, and registered transport details.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
              {error}
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Vehicle & Registration Info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center space-x-2">
                    <FaTruck className="text-emerald-500" />
                    <span>Registered Vehicle</span>
                  </h3>
                  
                  {driverProfile && (
                    <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400">
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Vehicle Model / Category</span>
                        <p className="font-extrabold text-slate-800 dark:text-white text-sm">{driverProfile.vehicleType}</p>
                      </div>
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">License Plate Number</span>
                        <p className="font-extrabold text-slate-800 dark:text-white text-sm">{driverProfile.vehicleNumber}</p>
                      </div>
                      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Account Approval Status</span>
                        <span className="inline-flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
                          <FaCheckCircle /> <span>Approved & Active</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-tr from-emerald-600 to-primary-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <FaDollarSign className="h-32 w-32" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">Payout Incentives</span>
                  <h4 className="text-2xl font-black pt-1">₹{totalIncentive.toLocaleString()}</h4>
                  <p className="text-[10px] opacity-80 pt-4 font-semibold">Credits are transferred weekly to registered driver accounts.</p>
                </div>
              </div>

              {/* Right Columns - Jobs completed log */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Completed Pickup Ledger</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        <th className="py-3 px-4">Receipt</th>
                        <th className="py-3 px-4">Material</th>
                        <th className="py-3 px-4">Weight</th>
                        <th className="py-3 px-4 text-right">Incentive</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {pickups.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/25">
                          <td className="py-3 px-4 font-mono font-bold text-[10px] text-slate-500">{p.receiptUrl}</td>
                          <td className="py-3 px-4">{p.wasteCategory}</td>
                          <td className="py-3 px-4">{p.actualWeight} kg</td>
                          <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">₹125.00</td>
                        </tr>
                      ))}
                      {pickups.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-6 text-slate-400">No completed jobs registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DriverEarnings;
