import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { 
  FaCoins, FaGift, FaTicketAlt, FaPaypal, FaCheckCircle, 
  FaExclamationTriangle, FaMobileAlt, FaUniversity, FaAmazon, FaShoppingCart 
} from 'react-icons/fa';

const RedeemRewards = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Forms
  const [cashbackEmail, setCashbackEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processLoading, setProcessLoading] = useState(false);

  const fetchRewardsData = async () => {
    try {
      const [couponRes, redeemRes] = await Promise.all([
        api.get('/admin/coupons'), // accessible to all logged in users
        api.get('/user/redemptions')
      ]);

      if (couponRes.data.success) setCoupons(couponRes.data.data.filter(c => c.isActive));
      if (redeemRes.data.success) setRedemptions(redeemRes.data.data);
    } catch (err) {
      console.error('Failed to load rewards details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const handleRedeem = async (type, details = {}) => {
    setError('');
    setSuccess('');
    setProcessLoading(true);

    const payload = {
      rewardType: type,
      ...details
    };

    try {
      const res = await api.post('/user/redeem', payload);
      setProcessLoading(false);
      if (res.data.success) {
        setSuccess(`Redeemed successfully! Details: ${res.data.data.details.title}. Voucher code: ${res.data.data.details.code}`);
        // Refresh local user points
        user.points = res.data.remainingPoints;
        // Refresh listings
        fetchRewardsData();
        setCashbackEmail('');
        setUpiId('');
        setBankName('');
        setAccountNumber('');
        setIfsc('');
        setAccountHolderName('');
        setSelectedCoupon(null);
      }
    } catch (err) {
      setProcessLoading(false);
      setError(err.response?.data?.message || 'Failed to process redemption request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Redeem Points</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Exchange your points for digital vouchers, cashback or product deals.</p>
            </div>
            
            {/* Points Badge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250/20 text-emerald-700 dark:text-emerald-400 font-extrabold rounded-2xl">
              <FaCoins className="h-5 w-5 animate-bounce" />
              <span>{user?.points} Points</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-1.5 animate-fadeIn">
              <FaExclamationTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-start space-x-1.5 animate-fadeIn">
              <FaCheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Cols - Point Redemption Options */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Direct Point Claims (Amazon GC & EcoStore Coupon) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <FaGift className="text-emerald-500" />
                    <span>Instant Digital Vouchers</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amazon Gift Card */}
                    <div className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between h-44 hover:border-primary-500/50 transition-colors bg-slate-50/20">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-1.5">
                          <FaAmazon className="text-amber-600" />
                          <span>$10 Amazon Gift Card</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Get a $10 digital gift card sent directly to your registered email address.
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">1000 pts</span>
                        <button 
                          onClick={() => handleRedeem('giftcard', { email: user?.email })}
                          disabled={processLoading || (user?.points < 1000)}
                          className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-[10px] transition-colors disabled:opacity-50"
                        >
                          Claim Card
                        </button>
                      </div>
                    </div>

                    {/* EcoStore Coupon */}
                    <div className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between h-44 hover:border-primary-500/50 transition-colors bg-slate-50/20">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-1.5">
                          <FaShoppingCart className="text-emerald-500" />
                          <span>15% Off EcoStore Voucher</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Unlock a 15% discount code valid on organic and eco-friendly products.
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">300 pts</span>
                        <button 
                          onClick={() => handleRedeem('discount')}
                          disabled={processLoading || (user?.points < 300)}
                          className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-[10px] transition-colors disabled:opacity-50"
                        >
                          Claim Coupon
                        </button>
                      </div>
                    </div>

                    {/* Plant 5 Trees Donation */}
                    <div className="p-5 border border-emerald-500/30 rounded-2xl flex flex-col justify-between h-44 hover:border-emerald-500 transition-colors bg-emerald-500/5 sm:col-span-2">
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm flex items-center space-x-1.5">
                          <span className="text-lg">🌱</span>
                          <span>Plant 5 Real Trees (Green Impact Donation)</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                          Convert 400 points into a verified Reforestation Certificate planting 5 trees in endangered forest reserves.
                        </p>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">400 pts</span>
                        <button 
                          onClick={() => handleRedeem('discount', { email: user?.email, title: 'Plant 5 Trees Certificate' })}
                          disabled={processLoading || (user?.points < 400)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] transition-colors disabled:opacity-50"
                        >
                          Plant Trees Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cashback Claims (PayPal, UPI, Bank Transfer) */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <FaCoins className="text-amber-500 animate-pulse" />
                    <span>Cashout & Bank Transfers</span>
                  </h3>
                  
                  {/* PayPal */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/10">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <FaPaypal className="text-sky-500" />
                      <span>PayPal Transfer ($5.00) — 500 points</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input 
                        type="email" 
                        value={cashbackEmail}
                        onChange={(e) => setCashbackEmail(e.target.value)}
                        placeholder="paypal-email@example.com" 
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => handleRedeem('cashback', { email: cashbackEmail })}
                        disabled={processLoading || !cashbackEmail || (user?.points < 500)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                      >
                        Claim
                      </button>
                    </div>
                  </div>

                  {/* UPI Cashback */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/10">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <FaMobileAlt className="text-indigo-500" />
                      <span>UPI Cashback Transfer (₹100) — 400 points</span>
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input 
                        type="text" 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@upi / mobile@ybl" 
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                      <button 
                        onClick={() => handleRedeem('upi', { upiId })}
                        disabled={processLoading || !upiId || (user?.points < 400)}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                      >
                        Claim
                      </button>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-3 bg-slate-50/10">
                    <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <FaUniversity className="text-amber-600" />
                      <span>Direct Bank Account Transfer (₹250) — 800 points</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <input 
                        type="text" 
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        placeholder="Account Holder Name" 
                        className="px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="Bank Name" 
                        className="px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="Account Number" 
                        className="px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                      <input 
                        type="text" 
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value)}
                        placeholder="IFSC Code" 
                        className="px-3 py-2 rounded-xl border border-slate-350 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                      />
                    </div>
                    <button 
                      onClick={() => handleRedeem('bank_transfer', { bankName, accountNumber, ifsc, accountHolderName })}
                      disabled={processLoading || !bankName || !accountNumber || !ifsc || !accountHolderName || (user?.points < 800)}
                      className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
                    >
                      Redeem ₹250 Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Coupons Catalog */}
                {coupons.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <FaTicketAlt className="text-amber-500" />
                      <span>Administrative Coupons & Vouchers</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {coupons.map((coupon) => (
                        <div key={coupon._id} className="p-5 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex flex-col justify-between h-44 hover:border-primary-500/50 transition-colors bg-slate-50/20">
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{coupon.title}</h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{coupon.description}</p>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{coupon.pointsCost} pts</span>
                            <button 
                              onClick={() => handleRedeem('coupon', { couponId: coupon._id })}
                              disabled={processLoading || (user?.points < coupon.pointsCost)}
                              className="px-3.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-[10px] transition-colors disabled:opacity-50"
                            >
                              Claim
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Right Col - Redemption History (Vouchers list) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <FaGift className="text-indigo-500" />
                  <span>My Claims & Codes</span>
                </h3>
                
                <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                  {redemptions.map((red) => (
                    <div key={red._id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{red.details.title}</h4>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{red.details.provider}</span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${red.status === 'completed' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20'}`}>
                          {red.status}
                        </span>
                      </div>
                      
                      {red.details.code && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-200/30 text-[10px] font-mono select-all">
                          <span className="text-slate-500 font-bold">CODE:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{red.details.code}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {redemptions.length === 0 && (
                    <p className="text-center text-xs text-slate-400 py-6">You haven't claimed any rewards yet.</p>
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

export default RedeemRewards;
