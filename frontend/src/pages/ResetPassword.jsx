import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaRecycle, FaLock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setResetToken(token);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        resetToken,
        newPassword
      });
      setLoading(false);
      if (res.data.success) {
        setSuccess('Password updated successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col transition-colors duration-300 overflow-hidden">
      {/* High-Quality Eco Background Video & Glassmorphic Backdrop */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-105 blur-[1px]"
          poster="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-emerald-950/90 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[420px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-emerald-950/40 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center text-primary-500 mb-2">
              <FaRecycle className="h-6 w-6 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Choose New Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete the fields below to update credentials.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20 flex items-start space-x-1.5">
              <FaExclamationTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-semibold border border-emerald-250/20 flex items-start space-x-1.5">
              <FaCheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Reset Token</label>
              <input 
                type="text" 
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
                placeholder="Paste your reset key token here" 
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">New Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
