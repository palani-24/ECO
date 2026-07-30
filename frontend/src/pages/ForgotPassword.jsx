import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaRecycle, FaEnvelope, FaChevronLeft, FaKey } from 'react-icons/fa';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mockToken, setMockToken] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setMockToken('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setLoading(false);
      if (res.data.success) {
        setSuccess('Simulated password reset email sent successfully!');
        if (res.data.resetToken) {
          setMockToken(res.data.resetToken);
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Password reset request failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          
          <div className="space-y-2">
            <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">
              <FaChevronLeft /> <span>Back to Login</span>
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white pt-2">Reset Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Enter your email and we'll simulate sending a reset key.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl space-y-3">
              <p className="font-semibold">{success}</p>
              {mockToken && (
                <div className="space-y-2 border-t border-emerald-200/30 pt-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Developer Mock Reset Key:</p>
                  <code className="block bg-white dark:bg-slate-950 p-2 rounded text-[10px] font-mono select-all overflow-x-auto border border-emerald-200/40">{mockToken}</code>
                  <Link 
                    to={`/reset-password?token=${mockToken}`}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <span>Click here to reset with Token</span>
                    <FaKey className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Sending...' : 'Request Reset Link'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
