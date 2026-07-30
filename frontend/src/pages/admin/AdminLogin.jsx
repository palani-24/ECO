import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  FaShieldAlt, FaLock, FaEnvelope, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaKey, FaBuilding 
} from 'react-icons/fa';

const AdminLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@ecoreward.com');
  const [password, setPassword] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);

      if (res.success && res.user.role === 'admin') {
        addToast('Admin Portal Authenticated Successfully!', 'success', 'Security Clearance Granted');
        navigate('/admin');
      } else if (res.success && res.user.role !== 'admin') {
        setError('Access Denied: 403 Forbidden. User account lacks Municipal Admin privileges.');
      } else {
        setError(res.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setLoading(false);
      setError('Admin Security Authentication server failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Dark Security Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] bg-slate-900/90 backdrop-blur-2xl border border-emerald-500/30 p-8 rounded-3xl shadow-2xl shadow-emerald-950/80 space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-1 border border-emerald-400/30">
            <FaShieldAlt className="h-7 w-7 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Municipal Admin Portal</h2>
          <p className="text-[11px] text-slate-400 font-medium">Restricted Access • Authorized Operations Personnel Only</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/10 text-rose-400 font-semibold text-xs border border-rose-500/20 rounded-2xl animate-fadeIn">
            {error}
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          
          {/* Admin Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Admin Email ID</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3.5 top-3.5 text-emerald-500 h-4 w-4" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@ecoreward.com" 
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Admin Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Master Password</label>
            <div className="relative">
              <FaLock className="absolute left-3.5 top-3.5 text-emerald-500 h-4 w-4" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••" 
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
              >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* 2FA Pin */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">2FA Security PIN (Optional)</label>
            <div className="relative">
              <FaKey className="absolute left-3.5 top-3.5 text-slate-500 h-3.5 w-3.5" />
              <input 
                type="password" 
                value={securityPin}
                onChange={(e) => setSecurityPin(e.target.value)}
                placeholder="6-digit PIN" 
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FaSpinner className="h-4 w-4 animate-spin" />
                <span>Authenticating Portal Access...</span>
              </>
            ) : (
              <>
                <FaSignInAlt className="h-4 w-4" />
                <span>Authenticate Admin Clearance</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-semibold flex items-center justify-center space-x-1">
            <FaBuilding className="text-emerald-500" />
            <span>EcoReward Municipal Command Center • 256-Bit Encrypted</span>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
