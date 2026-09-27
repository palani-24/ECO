import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaPhoneAlt, FaLeaf, FaTruck, FaBuilding, FaCrown,
  FaBars, FaTimes, FaMapMarkerAlt, FaKey, FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    icon: '🧑',
    badge: 'Doorstep Recycling',
    portalDesc: 'Doorstep scrap pickup, smart scale & UPI cash rewards',
    destination: '/dashboard',
    defaultPhone: '9876543211',
    defaultEmail: 'user@ecoreward.com'
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: '🚚',
    badge: 'EV Fleet Logistics',
    portalDesc: 'Route pickups, QR weighing & daily logistics incentives',
    destination: '/driver',
    defaultPhone: '9876543212',
    defaultEmail: 'driver@ecoreward.com'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    icon: '🏛️',
    badge: 'Ward SWM Admin',
    portalDesc: 'Direct municipal command, GIS heatmaps & citizen grievances',
    destination: '/municipality/dashboard',
    defaultPhone: '9876543213',
    defaultEmail: 'municipality@ecoreward.com'
  },
  {
    id: 'admin',
    name: 'Admin HQ',
    icon: '👑',
    badge: '38 Districts HQ',
    portalDesc: 'Centralized state recycling analytics, ESG & system control',
    destination: '/admin',
    defaultPhone: '9876543210',
    defaultEmail: 'admin@ecoreward.com'
  }
];

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active Role selection (All 4 available for Login)
  const [selectedRole, setSelectedRole] = useState('user');

  // Sign In method: 'otp' | 'password'
  const [authMode, setAuthMode] = useState('otp');
  const [phone, setPhone] = useState('9876543211');
  const [emailOrUser, setEmailOrUser] = useState('user@ecoreward.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];

  // Sync sample credentials on role toggle
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    const target = ROLES.find(r => r.id === roleId) || ROLES[0];
    setPhone(target.defaultPhone);
    setEmailOrUser(target.defaultEmail);
    setOtpSent(false);
    setOtpCode('');
  };

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Send OTP
  const handleSendOtp = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode('1234');
    addToast(`Verification OTP sent to +91 ${cleanPhone}. Demo Code: 1234`, 'info', 'OTP Transmitted');
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const targetInput = authMode === 'otp' ? phone.trim() : emailOrUser.trim();
    const targetPass = authMode === 'otp' ? '1234' : (password || '1234');

    if (authMode === 'otp') {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        setLoading(false);
        setError('Please enter a valid 10-digit mobile number.');
        return;
      }
      if (!otpSent) {
        setLoading(false);
        setError('Please click "Send OTP" to receive your verification code.');
        return;
      }
      if (otpCode.trim().length < 4) {
        setLoading(false);
        setError('Please enter the 4-digit OTP code (Demo: 1234).');
        return;
      }
    } else {
      if (!emailOrUser.trim()) {
        setLoading(false);
        setError('Please enter your email or mobile number.');
        return;
      }
      if (!password) {
        setLoading(false);
        setError('Please enter your password.');
        return;
      }
    }

    try {
      const res = await login(targetInput, targetPass, selectedRole);
      setLoading(false);

      if (res.success) {
        addToast(`Welcome back, ${res.user.name || activeRole.name}!`, 'success', 'Login Successful');
        const role = res.user.role || selectedRole;
        if (role === 'admin') navigate('/admin');
        else if (role === 'driver') navigate('/driver');
        else if (role === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please verify your mobile or password.');
      }
    } catch (err) {
      setLoading(false);
      setError('Authentication failed. Please verify credentials and try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* Background Ambient Modern Eco Landscape */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_portal_ambient_bg.jpg')",
          filter: 'brightness(0.98)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Reference Design */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-5 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link 
          to="/landing" 
          className="flex items-center space-x-2.5 text-slate-800 hover:text-slate-950 transition-colors drop-shadow-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
            🌱
          </div>
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-800 drop-shadow-xs">
            ECO<span className="text-emerald-700">REWARD</span>
          </span>
        </Link>

        {/* District & Location Badge in Header */}
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-xs font-semibold text-slate-800 shadow-xs">
          <FaMapMarkerAlt className="text-emerald-600 text-xs" />
          <span>Coimbatore District</span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-800 font-bold">38 Districts Active</span>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider text-slate-800">
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">HOME</Link>
          <Link to="/landing#about" className="hover:text-slate-950 transition-colors drop-shadow-xs">ABOUT</Link>
          <Link to="/landing#features" className="hover:text-slate-950 transition-colors drop-shadow-xs">SERVICE</Link>
          <Link to="/landing#contact" className="hover:text-slate-950 transition-colors drop-shadow-xs">CONTACT</Link>
          <Link
            to="/signup"
            className="px-6 py-1.5 rounded-full border border-white/70 bg-white/30 backdrop-blur-md text-slate-800 font-bold text-sm tracking-wider shadow-sm hover:bg-white/50 hover:shadow transition-all"
          >
            REGISTER
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/50 text-slate-800 shadow-sm"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden relative z-30 mx-6 mb-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl flex flex-col space-y-4 text-center font-bold text-slate-800"
          >
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link to="/landing#about" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
            <Link to="/landing#features" onClick={() => setMobileMenuOpen(false)}>SERVICE</Link>
            <Link to="/landing#contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
            >
              REGISTER
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Center Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[480px]"
        >
          {/* Frosted Glassmorphism Card Matching Reference Image 3 */}
          <div className="relative rounded-[32px] p-6 sm:p-9 backdrop-blur-2xl bg-white/40 border border-white/60 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.25)] overflow-hidden transition-all duration-300">
            
            {/* Close Button 'X' at Top Right (Navigates to Home) */}
            <button
              onClick={() => navigate('/landing')}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-white/40 transition-colors z-20"
              aria-label="Close to Home"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>

            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Role Avatar & Greeting */}
            <div className="text-center mb-5 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/60 backdrop-blur-md border border-white/70 text-2xl shadow-sm mb-2">
                {activeRole.icon}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back, <span className="text-emerald-700">{activeRole.name}</span>
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {activeRole.portalDesc}
              </p>
            </div>

            {/* Select Portal Role Header & Cards (Citizen, Driver, Municipal, Admin) */}
            <div className="mb-5 relative z-10">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-2 px-1">
                <span>Select Portal Role:</span>
                <span className="text-emerald-700 font-extrabold">Combined Portal</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`p-2 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all duration-200 border cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-102'
                          : 'bg-white/40 hover:bg-white/70 text-slate-600 border-white/60 hover:text-slate-900'
                      }`}
                    >
                      <span className="text-lg leading-none">{role.icon}</span>
                      <span className="text-[10px] font-black tracking-tight">{role.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth Mode Tabs: Mobile OTP vs Password */}
            <div className="relative mb-5 p-1 rounded-2xl bg-white/40 backdrop-blur-md border border-white/50 flex items-center shadow-2xs z-10">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('otp');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  authMode === 'otp'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FaPhoneAlt className="text-[10px]" />
                <span>Mobile OTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('password');
                  setError('');
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  authMode === 'password'
                    ? 'bg-emerald-600 text-white shadow-sm font-black'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FaLock className="text-[10px]" />
                <span>Password</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-950 text-xs font-semibold text-center backdrop-blur-sm z-10"
              >
                {error}
              </motion.div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
              
              {authMode === 'otp' ? (
                <>
                  {/* Mobile Number Input with right icon matching Image 3 */}
                  <div className="relative pt-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-700 block mb-1">
                      Mobile Number
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-slate-700 px-2 py-2 rounded-xl bg-white/50 border border-white/60">
                        +91
                      </span>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="10-digit mobile number"
                          required
                          maxLength={10}
                          className="w-full bg-white/40 border border-slate-300/70 focus:border-emerald-600 focus:bg-white rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-500 font-semibold text-sm outline-none pr-8 transition-all"
                        />
                        <FaPhoneAlt className="absolute right-3 top-3 text-slate-500 text-xs pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* 4-Digit OTP */}
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-700">
                        4-Digit OTP Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpTimer > 0}
                        className="text-xs font-black text-emerald-700 hover:text-emerald-800 disabled:opacity-50 cursor-pointer"
                      >
                        {otpTimer > 0 ? `Resend in ${otpTimer}s` : (otpSent ? 'Resend OTP' : 'Send OTP')}
                      </button>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="• • • •"
                        maxLength={4}
                        className="w-full bg-white/40 border border-slate-300/70 focus:border-emerald-600 focus:bg-white rounded-xl py-2 px-3 text-slate-900 placeholder:text-slate-400 font-black text-center tracking-widest text-base outline-none pr-8 transition-all"
                      />
                      <FaKey className="absolute right-3 top-3 text-slate-500 text-xs pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-1">
                      💡 Demo verification: enter <span className="font-mono font-bold text-slate-800">1234</span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Email or Phone Input with right icon matching Image 3 */}
                  <div className="relative pt-1">
                    <label className="text-[10px] uppercase font-black tracking-wider text-slate-700 block mb-1">
                      Email or Mobile
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={emailOrUser}
                        onChange={(e) => setEmailOrUser(e.target.value)}
                        placeholder="Registered Email or Mobile"
                        required
                        className="w-full bg-white/40 border border-slate-300/70 focus:border-emerald-600 focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-900 placeholder:text-slate-500 font-semibold text-sm outline-none pr-9 transition-all"
                      />
                      <FaEnvelope className="absolute right-3.5 top-3.5 text-slate-500 text-xs pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Input with show/hide eye & lock icon */}
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] uppercase font-black tracking-wider text-slate-700">
                        Password
                      </label>
                      <Link 
                        to="/forgot-password"
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-white/40 border border-slate-300/70 focus:border-emerald-600 focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-900 placeholder:text-slate-500 font-semibold text-sm outline-none pr-16 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-800 text-xs"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Remember Me on this device
                </label>
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-md shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="text-sm" />
                    <span>Sign In as {activeRole.name}</span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Link to Registration Page */}
            <div className="text-center pt-5 mt-4 border-t border-slate-200/60 relative z-10">
              <p className="text-xs text-slate-700 font-medium">
                Don't have an account?{' '}
                <Link to="/signup" className="font-black text-emerald-800 hover:text-emerald-950 underline underline-offset-2">
                  Create Account / Register
                </Link>
              </p>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="relative z-20 w-full px-6 py-4 text-center text-xs font-semibold text-slate-700/80">
        <p>© 2026 EcoReward Platform • Tamil Nadu Smart Waste & EV Recycling Grid</p>
      </footer>

    </div>
  );
};

export default Login;
