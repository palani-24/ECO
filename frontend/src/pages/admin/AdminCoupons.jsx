import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaTicketAlt, FaPlus, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add Coupon Form States
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);

  const [formLoading, setFormLoading] = useState(false);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/admin/coupons');
      if (res.data.success) {
        setCoupons(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFormLoading(true);

    try {
      const res = await api.post('/admin/coupons', {
        code,
        title,
        description,
        discountAmount: parseInt(discountAmount),
        pointsCost: parseInt(pointsCost),
        expiryDays: parseInt(expiryDays)
      });
      setFormLoading(false);
      if (res.data.success) {
        setSuccess('Coupon created successfully!');
        setCode('');
        setTitle('');
        setDescription('');
        setDiscountAmount('');
        setPointsCost('');
        fetchCoupons();
      }
    } catch (err) {
      setFormLoading(false);
      setError(err.response?.data?.message || 'Failed to create coupon.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(`/admin/coupons/${id}/toggle`);
      if (res.data.success) {
        fetchCoupons();
      }
    } catch (err) {
      setError('Failed to toggle coupon status.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Coupons Catalog</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create and manage vouchers that customers purchase using reward points.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-semibold border border-emerald-250/20">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Add Coupon Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-850 dark:text-slate-250 flex items-center space-x-2">
                <FaTicketAlt className="text-emerald-500" />
                <span>Create New Coupon</span>
              </h3>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase block">Coupon Code</label>
                  <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    placeholder="e.g. AMZN500"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase block">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. ₹500 Amazon Gift Card"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold uppercase block">Description</label>
                  <textarea 
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Provide details about the coupon benefits"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase block">Points Cost</label>
                    <input 
                      type="number" 
                      value={pointsCost}
                      onChange={(e) => setPointsCost(e.target.value)}
                      required
                      placeholder="500"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 font-bold uppercase block">Discount Value (₹)</label>
                    <input 
                      type="number" 
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      required
                      placeholder="500"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow flex items-center justify-center space-x-1.5"
                >
                  <FaPlus />
                  <span>{formLoading ? 'Creating...' : 'Create Coupon'}</span>
                </button>
              </form>
            </div>

            {/* Right Columns - Coupon catalog list */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Catalog Registry</h3>
              
              {loading ? (
                <TableSkeleton rows={4} />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/20">
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Points Cost</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                      {coupons.map((coupon) => (
                        <tr key={coupon._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                          <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase">{coupon.code}</td>
                          <td className="py-3 px-4 font-semibold">{coupon.title}</td>
                          <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">{coupon.pointsCost} pts</td>
                          <td className="py-3 px-4 font-semibold">₹{coupon.discountAmount}</td>
                          <td className="py-3 px-4 text-right">
                            <button 
                              onClick={() => handleToggleStatus(coupon._id)}
                              className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all shadow-sm ${
                                coupon.isActive 
                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400' 
                                  : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              }`}
                            >
                              {coupon.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {coupons.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-slate-400">No coupons registered in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCoupons;
