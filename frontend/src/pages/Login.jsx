import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaRecycle, FaEnvelope, FaLock, FaSignInAlt, FaInfoCircle, FaUserPlus } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Login = () => {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'driver') navigate('/driver');
      else navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  // Pre-fill helper for customer & driver testing
  const prefill = (role) => {
    if (role === 'driver') {
      setEmail('driver@ecoreward.com');
      setPassword('EcoDriver#2026!Pass');
    } else {
      setEmail('user@ecoreward.com');
      setPassword('EcoUser#2026!Pass');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col transition-colors duration-300 overflow-hidden">
      {/* High-Quality Eco Background Video, Unsplash Fallback & Ambient Aura Glows */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-105 filter brightness-70 contrast-110 blur-[1px]"
          poster="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4" type="video/mp4" />
        </video>
        {/* Electric Green & Cyan Glow Auras */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/25 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-emerald-950/90 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[420px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-emerald-950/40 space-y-6">
          
          {user && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-semibold">
              <span>Logged in as <strong>{user.name}</strong> ({user.role})</span>
              <button 
                type="button"
                onClick={() => logout()}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black transition-colors"
              >
                Log Out
              </button>
            </div>
          )}

          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center text-primary-500 mb-2">
              <FaRecycle className="h-6 w-6 animate-spin-slow" style={{ animationDuration: '10s' }} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Welcome Back</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Sign in to manage waste and redeem points.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-2">
              <FaInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary-500 hover:text-primary-600">Forgot?</Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-slate-400 h-4 w-4" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-primary-500/10 flex items-center justify-center space-x-2"
            >
              <FaSignInAlt className="h-4 w-4" />
              <span>{loading ? 'Logging in...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500 block text-center">Quick Demo Login</span>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => prefill('user')} className="px-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold rounded-xl text-slate-600 dark:text-slate-300">Customer Demo</button>
              <button onClick={() => prefill('driver')} className="px-2 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-[10px] font-bold rounded-xl text-slate-600 dark:text-slate-300">Driver Demo</button>
            </div>
            <p className="text-[9px] text-center text-slate-400 font-bold">🔒 Admin Login requires typing email & password explicitly.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-2">
              <span>Don't have an account?</span>
              <Link 
                to="/signup" 
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 transition-all hover:scale-105 shadow-sm inline-flex items-center space-x-1.5"
              >
                <span>Register Now</span>
                <FaUserPlus className="h-3 w-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
