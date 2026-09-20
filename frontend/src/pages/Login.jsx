import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaUserPlus, FaSpinner, FaLeaf, FaTruck, FaPhoneAlt, FaFingerprint,
  FaShieldAlt, FaPlay, FaPause, FaBolt, FaCheckCircle, FaHeadset, FaBuilding
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const ROLE_PRESETS = {
  user: {
    id: 'user',
    name: 'Citizen',
    tamil: 'குடிமகன்',
    icon: '🧑',
    email: 'user@ecoreward.com',
    phone: '9876543211',
    pass: '1234',
    route: '/dashboard',
    tag: 'Doorstep Recycling',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/40',
    activeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-400'
  },
  driver: {
    id: 'driver',
    name: 'Driver',
    tamil: 'ஓட்டுநர்',
    icon: '🚚',
    email: 'driver@ecoreward.com',
    phone: '9876543212',
    pass: '1234',
    route: '/driver',
    tag: 'EV Fleet & Pickup',
    color: 'from-teal-500 to-cyan-600',
    border: 'border-teal-500/40',
    activeBg: 'bg-teal-500/20 text-teal-400 border-teal-400'
  },
  municipality: {
    id: 'municipality',
    name: 'Municipal',
    tamil: 'நகராட்சி',
    icon: '🏛️',
    email: 'municipality@ecoreward.com',
    phone: '9876543213',
    pass: '1234',
    route: '/municipality/dashboard',
    tag: 'Ward & SWM Plant',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/40',
    activeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-400'
  },
  admin: {
    id: 'admin',
    name: 'Admin HQ',
    tamil: 'நிர்வாகம்',
    icon: '👑',
    email: 'admin@ecoreward.com',
    phone: '9876543210',
    pass: '1234',
    route: '/admin',
    tag: 'Tamil Nadu 38-Dist Command',
    color: 'from-amber-500 to-orange-600',
    border: 'border-amber-500/40',
    activeBg: 'bg-amber-500/20 text-amber-400 border-amber-400'
  }
};

const Login = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Role selector
  const [selectedRole, setSelectedRole] = useState('user');

  // Auth mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('otp');

  // Form states
  const [emailOrPhone, setEmailOrPhone] = useState(ROLE_PRESETS.user.phone);
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP states
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // General loading & errors
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  // Background Story carousel for desktop
  const [currentStoryStep, setCurrentStoryStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  // When selected role changes, update default email/phone
  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setError('');
    const preset = ROLE_PRESETS[roleKey];
    if (preset) {
      if (authMode === 'otp') {
        setEmailOrPhone(preset.phone);
      } else {
        setEmailOrPhone(preset.email);
      }
      setPassword(preset.pass);
    }
  };

  // Video autoplay
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch (e) {}
      }
    };
  }, []);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // 11-Step Eco Background Story Milestones
  const storySteps = [
    { title: '1. Waste Segregation', text: 'Citizen segregates plastic, paper, and metal scrap at source.', icon: '♻️' },
    { title: '2. Doorstep Scheduling', text: 'Instant booking with scheduled GPS collection slots.', icon: '📅' },
    { title: '3. Smart EV Dispatch', text: 'Automated radius matching to nearest municipal EV tipper.', icon: '🔔' },
    { title: '4. Driver Verification', text: 'Licensed driver confirms pickup assignment & digital manifest.', icon: '✅' },
    { title: '5. Turn-by-Turn GPS', text: 'Live vehicle tracking with geofenced arrival alerts.', icon: '📍' },
    { title: '6. Digital Weighbridge', text: 'Calibrated Bluetooth scale weight recording & instant receipt.', icon: '🚚' },
    { title: '7. Material Recovery Facility', text: 'Sorted recyclables dispatched to certified TNPCB balers.', icon: '🏭' },
    { title: '8. Circular Reprocessing', text: 'Clean flake granules supplied to local manufacturing hubs.', icon: '⚡' },
    { title: '9. Instant EcoPoints', text: 'Reward points credited instantly with 1-click UPI withdrawal.', icon: '🪙' },
    { title: '10. Climate Impact Ledger', text: 'Immutable carbon offset tracking for smart municipal audits.', icon: '🌍' },
    { title: 'EcoReward Mission', text: 'Zero Landfill Tamil Nadu • Powered by Civic Participation.', icon: '🌿' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStoryStep((prev) => (prev + 1) % storySteps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [storySteps.length]);

  // Timer countdown for OTP
  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Handle Send OTP
  const handleSendOtp = () => {
    if (!emailOrPhone || emailOrPhone.trim().length < 4) {
      setError('Please enter a valid mobile number or email');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode('1234'); // Preload demo OTP for 1-tap UX
    addToast(`SMS OTP sent to ${emailOrPhone}! Demo OTP: 1234`, 'info', 'OTP Generated');
  };

  // Unified redirect helper
  const handlePostLoginRedirect = (userData, roleKey) => {
    const preset = ROLE_PRESETS[roleKey] || ROLE_PRESETS.user;
    addToast(`Welcome back, ${userData?.name || preset.name}!`, 'success', 'Login Successful');
    
    const role = userData?.role || roleKey;
    if (role === 'admin') navigate('/admin');
    else if (role === 'driver') navigate('/driver');
    else if (role === 'municipality') navigate('/municipality/dashboard');
    else navigate('/dashboard');
  };

  // Handle Standard / OTP Form Submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const preset = ROLE_PRESETS[selectedRole];
      const targetIdentifier = emailOrPhone || preset.phone;
      const targetPassword = authMode === 'otp' ? '1234' : password;

      if (authMode === 'otp' && otpCode !== '1234' && otpCode !== '0000' && otpCode.length < 4) {
        setLoading(false);
        setError('Invalid OTP code. Please use demo code 1234.');
        return;
      }

      const res = await login(targetIdentifier, targetPassword);
      setLoading(false);

      if (res.success) {
        handlePostLoginRedirect(res.user, selectedRole);
      } else {
        // Fallback demo login if user isn't yet created
        const fallbackRes = await login(preset.email, preset.pass);
        if (fallbackRes.success) {
          handlePostLoginRedirect(fallbackRes.user, selectedRole);
        } else {
          setError(res.message || 'Login failed. Please check credentials.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  // 1-Tap Biometric Fingerprint / FaceID Simulator
  const handleBiometricUnlock = async () => {
    setIsBiometricScanning(true);
    setError('');

    // Haptic pulse simulation
    if (window.navigator?.vibrate) {
      window.navigator.vibrate([40, 60, 40]);
    }

    setTimeout(async () => {
      setIsBiometricScanning(false);
      const preset = ROLE_PRESETS[selectedRole];
      setLoading(true);
      try {
        const res = await login(preset.email, preset.pass);
        setLoading(false);
        if (res.success) {
          addToast(`🔐 Biometric Verified: ${res.user.name}`, 'success', 'Instant Mobile Auth');
          handlePostLoginRedirect(res.user, selectedRole);
        } else {
          setError('Biometric authentication failed. Please use PIN or OTP.');
        }
      } catch (e) {
        setLoading(false);
        setError('Biometric sensor timed out.');
      }
    }, 600);
  };

  // 1-Click Instant Demo Login directly by clicking role badge
  const handleFastRoleDemo = async (roleKey) => {
    handleRoleChange(roleKey);
    const preset = ROLE_PRESETS[roleKey];
    setLoading(true);
    setError('');

    try {
      const res = await login(preset.email, preset.pass);
      setLoading(false);
      if (res.success) {
        handlePostLoginRedirect(res.user, roleKey);
      } else {
        setError('Demo login temporarily unavailable.');
      }
    } catch (err) {
      setLoading(false);
      setError('Demo login connection failed.');
    }
  };

  const activePreset = ROLE_PRESETS[selectedRole];

  return (
    <div className="relative min-h-screen bg-[#050e18] flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* High-Definition Ambient Silent Video (Desktop & Tablet) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover opacity-35 filter contrast-125 brightness-90 pointer-events-none z-0"
        src="/videos/eco-waste-management.mp4"
      />
      
      {/* Ambient Dark Slate & Emerald Mesh Vignette Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050e18]/95 via-[#061424]/90 to-[#030911]/98 pointer-events-none" />

      {/* Floating Video Controls (Desktop only) */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-40 items-center space-x-2 bg-[#08182b]/90 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-2xl">
        <button 
          type="button" 
          onClick={toggleVideoPlay}
          className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          title={isVideoPlaying ? "Pause Video" : "Play Video"}
        >
          {isVideoPlaying ? <FaPause className="h-3 w-3" /> : <FaPlay className="h-3 w-3" />}
        </button>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">1080p Ambient Stream</span>
      </div>

      {/* Desktop Standard Navbar */}
      <div className="hidden lg:block relative z-20">
        <Navbar />
      </div>

      {/* Native Mobile App Header (Visible on Mobile & Tablet) */}
      <header className="lg:hidden relative z-20 bg-[#061424]/90 backdrop-blur-xl border-b border-emerald-500/20 px-4 py-3 sticky top-0 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <img 
            src="/app-logo.png" 
            alt="EcoReward Logo" 
            className="h-8 w-8 object-contain drop-shadow"
            onError={(e) => { e.currentTarget.src = '/app-logo.svg'; }}
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-white">EcoReward</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                TN 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Tamil Nadu Circular SWM Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link 
            to="/support"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-bold active:scale-95 transition"
            title="Helpline & Support"
          >
            <FaHeadset className="text-emerald-400 text-xs" />
            <span>1913</span>
          </Link>
        </div>
      </header>

      {/* Top Ticker Bar */}
      <div className="relative z-10 bg-emerald-950/40 border-b border-emerald-500/20 py-1 px-3 text-center overflow-hidden">
        <p className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 tracking-wide truncate">
          ⚡ TN GREEN PORTAL: 38 Districts • 15.3K Smart Pickups • 8.2 Tons CO₂ Offset Today
        </p>
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
          
          {/* Left Column: 11-Step Eco Background Story Banner (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-white p-4">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs rounded-full uppercase tracking-wider inline-block">
                Circular Waste Management System
              </span>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                Recycle Smart.<br />Earn Rewards.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Build a Greener Tamil Nadu.
                </span>
              </h1>
              <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                Connect directly with doorstep EV collection, certified municipal recycling facilities, and instant UPI scrap buyback rewards across 38 districts.
              </p>
            </div>

            {/* Story Milestone Card */}
            <div className="p-5 bg-[#08182b]/85 border border-emerald-500/30 backdrop-blur-xl rounded-3xl space-y-2 shadow-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-emerald-400 font-extrabold flex items-center space-x-2">
                  <span className="text-xl">{storySteps[currentStoryStep].icon}</span>
                  <span>{storySteps[currentStoryStep].title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold font-mono">{currentStoryStep + 1} / 11</span>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">{storySteps[currentStoryStep].text}</p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-1">
              <div className="p-3 bg-[#08182b]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-emerald-400 block">4.8 Tons</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">CO₂ Offset</span>
              </div>
              <div className="p-3 bg-[#08182b]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-teal-400 block">38</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">TN Districts</span>
              </div>
              <div className="p-3 bg-[#08182b]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-cyan-400 block">₹250 / 500 Pts</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Instant Cashout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Native Mobile Login Experience */}
          <div className="lg:col-span-6 flex justify-center w-full">
            <div className="w-full max-w-[480px] bg-[#071729]/95 sm:bg-[#071729]/90 backdrop-blur-2xl border border-emerald-500/30 p-4 sm:p-7 rounded-3xl shadow-2xl space-y-4">
              
              {/* Card Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
                  <span className="text-2xl">{activePreset.icon}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {activePreset.tamil}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {activePreset.tag} • Tamil Nadu SWM Portal
                </p>
              </div>

              {/* 1. NATIVE SEGMENTED ROLE SWITCHER */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span>Select Account Role</span>
                  <span className="text-[10px] font-mono text-emerald-400">1-Tap Switch</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#040c16] rounded-2xl border border-slate-800/80">
                  {Object.keys(ROLE_PRESETS).map((roleKey) => {
                    const r = ROLE_PRESETS[roleKey];
                    const isActive = selectedRole === roleKey;
                    return (
                      <button
                        key={roleKey}
                        type="button"
                        onClick={() => handleRoleChange(roleKey)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                          isActive 
                            ? `${r.activeBg} shadow-lg` 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                        }`}
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="text-[10px] font-black leading-tight">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. AUTH MODE TOGGLE (OTP vs Password) */}
              <div className="flex bg-[#040c16] p-1 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('otp');
                    setEmailOrPhone(activePreset.phone);
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    authMode === 'otp'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FaPhoneAlt className="text-[11px]" />
                  <span>Mobile OTP Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password');
                    setEmailOrPhone(activePreset.email);
                    setPassword(activePreset.pass);
                    setError('');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                    authMode === 'password'
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FaLock className="text-[11px]" />
                  <span>Password Login</span>
                </button>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-2xl animate-fadeIn flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-rose-400 text-sm">×</button>
                </div>
              )}

              {/* 3. LOGIN FORMS */}
              {authMode === 'otp' ? (
                /* --- MOBILE OTP FORM --- */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Registered Mobile Number</span>
                      <span className="text-[9px] font-mono text-emerald-400">Demo: {activePreset.phone}</span>
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        value={emailOrPhone}
                        onChange={(e) => setEmailOrPhone(e.target.value)}
                        placeholder="10-digit mobile number"
                        required
                        className="flex-1 px-3 py-2.5 bg-[#040c16] rounded-r-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* OTP Code Row */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Enter 4-Digit OTP
                      </label>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpTimer > 0}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 disabled:text-slate-500 cursor-pointer"
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
                        placeholder="•••• (Demo: 1234)"
                        required
                        className="w-full tracking-[0.5em] text-center font-mono py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-base font-black text-emerald-400 placeholder:tracking-normal placeholder:font-sans placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode('1234');
                          addToast('Demo OTP 1234 applied!', 'info');
                        }}
                        className="absolute right-2.5 top-2 px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold hover:bg-emerald-500/25 active:scale-95 transition"
                      >
                        Auto 1234
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="h-4 w-4" />
                        <span>Verify OTP & Enter ({activePreset.name})</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* --- PASSWORD FORM --- */
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Email or Phone</span>
                      <span className="text-[9px] font-mono text-emerald-400">Demo: {activePreset.email}</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                      <input 
                        type="text" 
                        value={emailOrPhone} 
                        onChange={(e) => setEmailOrPhone(e.target.value)} 
                        required 
                        placeholder="user@ecoreward.com or phone" 
                        className="w-full pl-9 pr-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-[10px] font-bold text-emerald-400 hover:underline">
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
                        placeholder="•••••••• (Demo: 1234)" 
                        className="w-full pl-9 pr-9 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                      >
                        {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center space-x-2 font-bold text-slate-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        className="h-3.5 w-3.5 rounded accent-emerald-500" 
                      />
                      <span className="text-[11px]">Remember Login</span>
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400">PIN: 1234</span>
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <FaSignInAlt className="h-4 w-4" />
                        <span>Sign In as {activePreset.name}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 4. BIOMETRIC / 1-TAP QUICK UNLOCK SIMULATOR */}
              <div className="pt-1">
                <button
                  type="button"
                  disabled={loading || isBiometricScanning}
                  onClick={handleBiometricUnlock}
                  className="w-full py-2.5 px-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 text-slate-200 text-xs font-bold transition flex items-center justify-between group active:scale-[0.98] cursor-pointer shadow-md"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                      <FaFingerprint className={`h-4 w-4 ${isBiometricScanning ? 'animate-pulse text-cyan-400' : ''}`} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black block">
                        {isBiometricScanning ? 'Scanning Touch ID...' : `1-Tap Biometric Instant Unlock`}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">Touch ID / Fast Pass for {activePreset.name}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                    Fast Pass ⚡
                  </span>
                </button>
              </div>

              {/* 6. SIGNUP PROMOTION BANNER */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 shadow-inner">
                <div>
                  <span className="text-xs font-black text-white block">New to EcoReward?</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Create free citizen account & earn rewards</span>
                </div>
                <Link 
                  to="/signup" 
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow hover:scale-105 active:scale-95 transition whitespace-nowrap flex items-center space-x-1"
                >
                  <FaUserPlus className="text-xs" />
                  <span>Register →</span>
                </Link>
              </div>

              {/* TN Municipal Helpline badge */}
              <div className="text-center pt-1">
                <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center space-x-2">
                  <FaShieldAlt className="text-emerald-400" />
                  <span>Tamil Nadu SWM Portal • Swachh Bharat 2.0 • 1913 Toll-Free</span>
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
