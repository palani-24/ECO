import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaPhoneAlt, FaCheckCircle, FaHeadset, FaShieldAlt, FaLeaf, FaUserPlus,
  FaTruck, FaCoins, FaBuilding, FaMapMarkerAlt, FaCheck, FaCar, FaCrown,
  FaBars, FaTimes, FaBolt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    icon: '🧑',
    defaultPhone: '9876543211',
    defaultEmail: 'user@ecoreward.com',
    badge: 'Doorstep Recycling',
    portalDesc: 'Doorstep EV scrap collection & instant rewards',
    destination: '/dashboard'
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: '🚚',
    defaultPhone: '9876543212',
    defaultEmail: 'driver@ecoreward.com',
    badge: 'EV Fleet & Dispatch',
    portalDesc: 'Digital Bluetooth scale pickups & automated route navigation',
    destination: '/driver'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    icon: '🏛️',
    defaultPhone: '9876543213',
    defaultEmail: 'municipality@ecoreward.com',
    badge: 'Ward SWM Grievances',
    portalDesc: 'Direct integration with Municipal Local Bodies',
    destination: '/municipality/dashboard'
  },
  {
    id: 'admin',
    name: 'Admin HQ',
    icon: '👑',
    defaultPhone: '9876543210',
    defaultEmail: 'admin@ecoreward.com',
    badge: '38 Districts Command',
    portalDesc: 'Statewide centralized waste analytics & ESG command HQ',
    destination: '/admin'
  }
];

const VEHICLE_TYPES = [
  'E-Rickshaw Tipper (EV)',
  'Tata Ace EV Mini Tipper',
  'Hydraulic Compactor Truck (14T)',
  'Battery Baler Carrier',
  'Three-Wheeler Doorstep Hopper'
];

const Login = ({ initialMode = 'signin' }) => {
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState(
    location.pathname === '/signup' ? 'signup' : initialMode
  );

  // Active Role
  const [selectedRole, setSelectedRole] = useState('user');

  // Sign In inputs
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [emailOrPhone, setEmailOrPhone] = useState(ROLES[0].defaultPhone);
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('coimbatore');
  const [wardOrAddress, setWardOrAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === selectedDistrictId) || TAMIL_NADU_DISTRICTS[0];

  // Role change handler
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

  // Switch Auth Mode (OTP vs Password)
  const handleAuthModeChange = (newAuthMode) => {
    setAuthMode(newAuthMode);
    setError('');
    const target = ROLES.find(r => r.id === selectedRole) || ROLES[0];
    if (newAuthMode === 'otp') {
      setEmailOrPhone(target.defaultPhone);
    } else {
      setEmailOrPhone(target.defaultEmail);
    }
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
    if (!emailOrPhone || emailOrPhone.trim().length < 4) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode('1234');
    addToast(`SMS OTP generated for ${emailOrPhone}! Demo Code: 1234`, 'info', 'OTP Generated');
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const targetInput = emailOrPhone.trim() || activeRole.defaultPhone;
    const targetPass = authMode === 'otp' ? '1234' : (password || '1234');

    if (authMode === 'otp' && otpSent && otpCode.length < 4) {
      setLoading(false);
      setError('Please enter the 4-digit OTP code (Demo: 1234).');
      return;
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
      setError('Connection issue. Automatically proceeding in demo mode...');
      navigate(activeRole.destination);
    }
  };

  // 1-Click Instant Demo Login (Zero typing needed!)
  const handleInstantDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login(activeRole.defaultEmail, '1234', selectedRole);
      setLoading(false);
      if (res.success) {
        addToast(`Signed in instantly as ${activeRole.name}!`, 'success', 'Demo Login Successful');
        navigate(activeRole.destination);
      } else {
        navigate(activeRole.destination);
      }
    } catch (err) {
      setLoading(false);
      navigate(activeRole.destination);
    }
  };

  // Handle Registration Submit
  const handleSignupSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!signupName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (selectedRole === 'driver' && !vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number.');
      return;
    }

    setLoading(true);

    const finalEmail = signupEmail.trim() || `${cleanPhone}@ecoreward.tn`;

    const payload = {
      name: signupName.trim(),
      phone: cleanPhone,
      email: finalEmail,
      password: signupPassword,
      role: selectedRole === 'admin' ? 'user' : selectedRole,
      ward: wardOrAddress.trim() || `${activeDistrict.name} Ward 01`,
      jurisdiction: activeDistrict.corporation || `${activeDistrict.name} Municipal Administration`,
      department: 'Solid Waste Management',
      address: {
        street: wardOrAddress.trim() || `${activeDistrict.name} Main Road`,
        city: activeDistrict.name,
        state: 'Tamil Nadu',
        zipCode: '600001',
        isDefault: true
      }
    };

    if (selectedRole === 'driver') {
      payload.vehicleNumber = vehicleNumber.trim().toUpperCase();
      payload.vehicleType = vehicleType;
      payload.licenseNumber = `DL-${payload.vehicleNumber}`;
    }

    try {
      const res = await signup(payload);
      setLoading(false);

      if (res.success) {
        addToast(`Welcome to EcoReward, ${signupName}! Account created.`, 'success', 'Account Created');
        if (selectedRole === 'driver') navigate('/driver');
        else if (selectedRole === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Email or phone may already exist.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* Background Mountain Landscape Artwork */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/mountain_landscape_bg.jpg')",
          filter: 'brightness(0.98)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Image 2 */}
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
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">ABOUT</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">SERVICE</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">CONTACT</Link>
          <button
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`px-6 py-1.5 rounded-full border border-white/70 bg-white/30 backdrop-blur-md text-slate-800 font-bold text-sm tracking-wider shadow-sm hover:bg-white/50 hover:shadow transition-all ${
              mode === 'signin' ? 'ring-2 ring-blue-400/40 bg-white/40 font-black' : ''
            }`}
          >
            LOGIN
          </button>
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
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>SERVICE</Link>
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
            <button
              onClick={() => {
                setMode('signin');
                setMobileMenuOpen(false);
              }}
              className="py-2 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
            >
              LOGIN
            </button>
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
          {/* Frosted Glassmorphism Card */}
          <div className="relative rounded-[32px] p-6 sm:p-9 backdrop-blur-2xl bg-white/20 border border-white/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Mode Switcher Tabs: Sign In vs Create Account */}
            <div className="relative mb-5 p-1 rounded-2xl bg-white/35 backdrop-blur-md border border-white/50 flex items-center shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FaSignInAlt className="text-xs" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center space-x-1.5 ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-sm font-black'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <FaUserPlus className="text-xs" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Role Avatar & Greeting */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60 text-2xl shadow-sm mb-2">
                {activeRole.icon}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome Back, <span className="text-emerald-800">{activeRole.name}</span>
              </h2>
              <p className="text-xs text-slate-700/85 font-medium mt-0.5">
                {activeRole.badge} • Smart Waste Management Portal
              </p>
            </div>

            {/* Select Portal Role Header & Cards */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2 px-1">
                <span>Select Portal Role:</span>
                <span className="text-[11px] text-emerald-800 font-extrabold">38 Districts Active</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {ROLES.map((r) => {
                  const isSelected = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleChange(r.id)}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-white/95 text-slate-900 shadow-sm border-2 border-emerald-500 scale-102 font-black'
                          : 'bg-white/25 hover:bg-white/45 text-slate-700 border border-white/40'
                      }`}
                    >
                      <span className="text-base">{r.icon}</span>
                      <span className="text-[11px] mt-0.5 font-bold tracking-tight">{r.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-950 text-xs font-semibold text-center backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {/* SIGN IN FORM */}
            {mode === 'signin' ? (
              <div className="space-y-4">
                
                {/* Auth Mode Toggle Tabs (Mobile OTP vs Password) */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleAuthModeChange('otp')}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      authMode === 'otp'
                        ? 'bg-emerald-600 text-white shadow-sm font-black'
                        : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    <FaPhoneAlt className="text-xs" />
                    <span>Mobile OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAuthModeChange('password')}
                    className={`py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                      authMode === 'password'
                        ? 'bg-slate-800 text-white shadow-sm font-black'
                        : 'text-slate-800 hover:text-slate-950'
                    }`}
                  >
                    <FaLock className="text-xs" />
                    <span>Password</span>
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                  
                  {/* Field 1: Mobile Number or Email */}
                  <div className="relative">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                      {authMode === 'otp' ? 'Mobile Number' : 'Email or Mobile'}
                    </label>
                    <div className="flex items-center border-b border-slate-700/60 focus-within:border-slate-950 transition-colors pb-1.5">
                      {authMode === 'otp' && (
                        <span className="text-xs font-bold text-slate-800 bg-white/40 px-2 py-0.5 rounded-md mr-2 border border-white/60">
                          +91
                        </span>
                      )}
                      <input
                        type={authMode === 'otp' ? 'tel' : 'text'}
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder={authMode === 'otp' ? '9876543211' : activeRole.defaultEmail}
                        required
                        className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-600/70 font-semibold text-sm outline-none"
                      />
                      {authMode === 'otp' ? (
                        <FaPhoneAlt className="text-slate-700 text-xs ml-2 pointer-events-none" />
                      ) : (
                        <FaEnvelope className="text-slate-700 text-xs ml-2 pointer-events-none" />
                      )}
                    </div>
                  </div>

                  {/* Field 2 (OTP Mode): 4-Digit OTP */}
                  {authMode === 'otp' ? (
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                        <span>4-Digit OTP</span>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpTimer > 0}
                          className="text-emerald-800 font-extrabold hover:underline capitalize"
                        >
                          {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Send OTP'}
                        </button>
                      </div>
                      <div className="flex items-center border-b border-slate-700/60 focus-within:border-slate-950 transition-colors pb-1.5">
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="••••"
                          maxLength={4}
                          className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-600/70 font-mono tracking-widest text-center text-lg outline-none font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-center text-slate-700/80 font-medium mt-1">
                        💡 Demo auto-verification: enter <span className="font-bold text-slate-900">1234</span>
                      </p>
                    </div>
                  ) : (
                    /* Field 2 (Password Mode): Password */
                    <div className="relative pt-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">
                        Password
                      </label>
                      <div className="flex items-center border-b border-slate-700/60 focus-within:border-slate-950 transition-colors pb-1.5">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••"
                          required
                          className="w-full bg-transparent border-0 text-slate-900 placeholder:text-slate-600/70 font-semibold text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-700 hover:text-slate-950 ml-2"
                        >
                          {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                        </button>
                      </div>

                      {/* Forgot Password Link */}
                      <div className="flex justify-end mt-1.5">
                        <Link 
                          to="/forgot-password" 
                          className="text-xs text-slate-800 hover:text-slate-950 transition-colors"
                        >
                          Forgot <span className="font-bold underline decoration-slate-700/40">Password?</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Remember Me Checkbox */}
                  <label className="flex items-center space-x-2.5 pt-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        rememberMe 
                          ? 'bg-slate-800 border-slate-800 text-white shadow-xs' 
                          : 'border-slate-700/70 bg-white/40'
                      }`}
                    >
                      {rememberMe && <FaCheck className="text-[9px]" />}
                    </div>
                    <span className="text-xs font-semibold text-slate-800">
                      Remember Me on this device
                    </span>
                  </label>

                  {/* Dynamic Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/45 transition-all duration-200 active:scale-[0.98] text-center flex items-center justify-center space-x-2 cursor-pointer mt-4"
                  >
                    {loading ? (
                      <FaSpinner className="animate-spin text-lg" />
                    ) : (
                      <>
                        <FaSignInAlt className="text-sm" />
                        <span>Sign In as {activeRole.name}</span>
                      </>
                    )}
                  </button>

                  {/* 1-Click Instant Demo Button */}
                  <button
                    type="button"
                    onClick={handleInstantDemoLogin}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/50 hover:bg-white/80 border border-white/60 text-slate-900 font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FaBolt className="text-amber-500 text-xs" />
                    <span>Instant 1-Click Demo Login as {activeRole.name}</span>
                  </button>

                </form>
              </div>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                
                {/* Full Name */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-1.5 text-slate-900 placeholder:text-slate-600/70 font-semibold text-sm outline-none"
                  />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    required
                    maxLength={10}
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-1.5 text-slate-900 placeholder:text-slate-600/70 font-semibold text-sm outline-none"
                  />
                </div>

                {/* District & Ward */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">District</label>
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1.5 text-slate-900 font-semibold text-xs outline-none cursor-pointer"
                    >
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id} className="text-slate-900 bg-white">
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">Ward / Address</label>
                    <input
                      type="text"
                      value={wardOrAddress}
                      onChange={(e) => setWardOrAddress(e.target.value)}
                      placeholder="Ward 12"
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1.5 text-slate-900 font-semibold text-xs outline-none"
                    />
                  </div>
                </div>

                {/* Driver Fields */}
                {selectedRole === 'driver' && (
                  <div className="space-y-2 pt-1 border-t border-white/40">
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="EV Vehicle No (e.g. TN-38-EV-9945)"
                      required
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1.5 text-slate-900 font-semibold text-xs outline-none"
                    />
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1 text-slate-900 font-semibold text-xs outline-none cursor-pointer"
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t} className="text-slate-900 bg-white">{t}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">Password</label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1.5 text-slate-900 font-semibold text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-700 block mb-1">Confirm</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••"
                      required
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 pb-1.5 text-slate-900 font-semibold text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Terms Checkbox */}
                <label className="flex items-center space-x-2 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="sr-only"
                  />
                  <div 
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      agreeTerms 
                        ? 'bg-slate-800 border-slate-800 text-white' 
                        : 'border-slate-700 bg-white/40'
                    }`}
                  >
                    {agreeTerms && <FaCheck className="text-[9px]" />}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-800">
                    I agree to the Terms of Service & Privacy Policy
                  </span>
                </label>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] text-center flex items-center justify-center space-x-2 cursor-pointer mt-3"
                >
                  {loading ? <FaSpinner className="animate-spin text-base" /> : <span>Create Account</span>}
                </button>
              </form>
            )}

            {/* Compliance Note */}
            <div className="mt-5 pt-3 border-t border-white/30 text-center">
              <p className="text-[10px] font-bold text-slate-700/80 flex items-center justify-center space-x-1">
                <FaShieldAlt className="text-emerald-700 text-xs" />
                <span>Swachh Bharat 2.0 • SWM Rules 2016 Compliant • Toll-Free 1913</span>
              </p>
            </div>

          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs font-semibold text-slate-700/80 drop-shadow-xs">
        © 2026 EcoReward TN • Smart Waste Management & Clean Energy Initiative
      </footer>

    </div>
  );
};

export default Login;
