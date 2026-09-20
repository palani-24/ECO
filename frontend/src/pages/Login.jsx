import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaPhoneAlt, FaCheckCircle, FaHeadset, FaShieldAlt, FaLeaf
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    tamil: 'குடிமகன்',
    icon: '🧑',
    defaultPhone: '9876543211',
    defaultEmail: 'user@ecoreward.com',
    route: '/dashboard',
    desc: 'Doorstep Scrap Collection & UPI Cashout'
  },
  {
    id: 'driver',
    name: 'Driver',
    tamil: 'ஓட்டுநர்',
    icon: '🚚',
    defaultPhone: '9876543212',
    defaultEmail: 'driver@ecoreward.com',
    route: '/driver',
    desc: 'EV Fleet Routes & Weighbridge Dispatch'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    tamil: 'நகராட்சி',
    icon: '🏛️',
    defaultPhone: '9876543213',
    defaultEmail: 'municipality@ecoreward.com',
    route: '/municipality/dashboard',
    desc: 'Ward SWM Monitoring & Grievance Desk'
  },
  {
    id: 'admin',
    name: 'Admin HQ',
    tamil: 'நிர்வாகம்',
    icon: '👑',
    defaultPhone: '9876543210',
    defaultEmail: 'admin@ecoreward.com',
    route: '/admin',
    desc: 'Tamil Nadu 38-District Command Center'
  }
];

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Role selector
  const [selectedRole, setSelectedRole] = useState('user');

  // Auth mode: 'otp' | 'password'
  const [authMode, setAuthMode] = useState('otp');

  // Inputs
  const [emailOrPhone, setEmailOrPhone] = useState(ROLES[0].defaultPhone);
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Active role details
  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  // Role switch handler
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    const target = ROLES.find(r => r.id === roleId) || ROLES[0];
    if (authMode === 'otp') {
      setEmailOrPhone(target.defaultPhone);
    } else {
      setEmailOrPhone(target.defaultEmail);
    }
  };

  // OTP Timer countdown
  React.useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Send OTP handler
  const handleSendOtp = () => {
    if (!emailOrPhone || emailOrPhone.trim().length < 4) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode('1234');
    addToast(`SMS OTP sent to ${emailOrPhone}! (OTP: 1234)`, 'info', 'OTP Generated');
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const targetInput = emailOrPhone.trim() || activeRole.defaultPhone;
    const targetPass = authMode === 'otp' ? '1234' : password;

    if (authMode === 'otp' && otpSent && otpCode.length < 4) {
      setLoading(false);
      setError('Please enter the 4-digit OTP.');
      return;
    }

    try {
      const res = await login(targetInput, targetPass);
      setLoading(false);

      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
        const role = res.user.role || selectedRole;
        if (role === 'admin') navigate('/admin');
        else if (role === 'driver') navigate('/driver');
        else if (role === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        // Fallback demo account login
        const fallback = await login(activeRole.defaultEmail, '1234');
        if (fallback.success) {
          addToast(`Welcome back, ${fallback.user.name}!`, 'success', 'Login Successful');
          if (fallback.user.role === 'admin') navigate('/admin');
          else if (fallback.user.role === 'driver') navigate('/driver');
          else if (fallback.user.role === 'municipality') navigate('/municipality/dashboard');
          else navigate('/dashboard');
        } else {
          setError(res.message || 'Invalid credentials. Please try again.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      {/* Native Mobile App Header (Clean White Theme) */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <img 
            src="/app-logo.png" 
            alt="EcoReward Logo" 
            className="h-8 w-8 object-contain drop-shadow-xs"
            onError={(e) => { e.currentTarget.src = '/app-logo.svg'; }}
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900">EcoReward</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                TN 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Tamil Nadu Circular SWM Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link 
            to="/support"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold active:scale-95 transition"
            title="Helpline & Support"
          >
            <FaHeadset className="text-emerald-600 text-xs" />
            <span>1913</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-6 sm:py-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Presentation (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 p-6">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 font-black text-xs rounded-full uppercase tracking-wider inline-block">
                Circular Recycling Platform 2026
              </span>
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Recycle Smart.<br />Earn Rewards.<br />
                <span className="text-emerald-600">Build a Greener Future.</span>
              </h1>
              <p className="text-sm text-slate-600 max-w-lg leading-relaxed">
                Connect with doorstep EV collection tippers, certified municipal recycling centers, and instant UPI scrap buyback rewards across 38 districts of Tamil Nadu.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-xl font-black text-emerald-600 block">4.8 Tons</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">CO₂ Offset</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-xl font-black text-teal-600 block">38</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">TN Districts</span>
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-xl font-black text-emerald-600 block">₹250 / 500 Pts</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Instant Cashout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean White Authentication Card */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[460px] bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-8 shadow-xl shadow-slate-200/50 space-y-4">
              
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-50 border border-emerald-100 mb-1">
                  <span className="text-2xl">{activeRole.icon}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                    {activeRole.tamil}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeRole.desc}
                </p>
              </div>

              {/* 1. Account Role Switcher */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Select Account Role
                </label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  {ROLES.map((r) => {
                    const isActive = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                          isActive 
                            ? 'bg-white text-emerald-700 font-black shadow-xs border border-emerald-200' 
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="text-[10px] leading-tight font-bold">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Login Mode Tabs (OTP vs Password) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setEmailOrPhone(activeRole.defaultPhone);
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    authMode === 'otp'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FaPhoneAlt className="text-[11px]" />
                  <span>Mobile OTP Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setEmailOrPhone(activeRole.defaultEmail);
                    setPassword('1234');
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    authMode === 'password'
                      ? 'bg-emerald-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FaLock className="text-[11px]" />
                  <span>Password Login</span>
                </button>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-rose-500 font-black text-sm">×</button>
                </div>
              )}

              {/* 3. Form */}
              {authMode === 'otp' ? (
                /* --- MOBILE OTP FORM --- */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-100 text-xs font-bold text-slate-700">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="flex-1 px-3 py-2.5 bg-white rounded-r-2xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Enter 4-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpTimer > 0}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 cursor-pointer"
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : (otpSent ? 'Resend OTP' : 'Send OTP')}
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="••••"
                        required
                        className="w-full tracking-[0.5em] text-center font-mono py-2.5 bg-white rounded-2xl border border-slate-300 text-base font-black text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="h-4 w-4" />
                        <span>Verify & Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* --- PASSWORD FORM --- */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Email or Mobile
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input 
                        type="text" 
                        value={emailOrPhone} 
                        onChange={(e) => setEmailOrPhone(e.target.value)} 
                        required 
                        placeholder="Enter email or mobile" 
                        className="w-full pl-9 pr-3 py-2.5 bg-white rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-[10px] font-bold text-emerald-600 hover:underline">
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <FaLock className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full pl-9 pr-9 py-2.5 bg-white rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center space-x-2 font-bold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        className="h-3.5 w-3.5 rounded accent-emerald-600" 
                      />
                      <span className="text-[11px]">Remember Login</span>
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="h-4 w-4" />
                        <span>Sign In as {activeRole.name}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 4. Link to Register */}
              <div className="pt-2 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">New to EcoReward?</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Create free citizen or partner account</span>
                  </div>
                  <Link 
                    to="/signup" 
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 active:scale-95 transition whitespace-nowrap"
                  >
                    Register →
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-1">
                <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center space-x-1.5">
                  <FaShieldAlt className="text-emerald-600" />
                  <span>Tamil Nadu SWM Portal • Swachh Bharat 2.0 • 1913 Helpline</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Login;
