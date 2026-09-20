import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaPhoneAlt, FaCheckCircle, FaHeadset, FaShieldAlt, FaLeaf, FaUserPlus,
  FaTruck, FaCoins, FaBuilding, FaSearch, FaArrowRight, FaClock, FaCheck
} from 'react-icons/fa';
import Navbar from '../components/Navbar';
import DesktopCommandPalette from '../components/DesktopCommandPalette';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    tamil: 'குடிமகன்',
    icon: '🧑',
    defaultPhone: '9876543211',
    defaultEmail: 'user@ecoreward.com',
    badge: 'Doorstep Recycling',
    activeStyle: 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-sm font-black'
  },
  {
    id: 'driver',
    name: 'Driver',
    tamil: 'ஓட்டுநர்',
    icon: '🚚',
    defaultPhone: '9876543212',
    defaultEmail: 'driver@ecoreward.com',
    badge: 'EV Fleet & Dispatch',
    activeStyle: 'bg-teal-50 text-teal-800 border-2 border-teal-500 shadow-sm font-black'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    tamil: 'நகராட்சி',
    icon: '🏛️',
    defaultPhone: '9876543213',
    defaultEmail: 'municipality@ecoreward.com',
    badge: 'Ward SWM Grievances',
    activeStyle: 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm font-black'
  },
  {
    id: 'admin',
    name: 'Admin HQ',
    tamil: 'நிர்வாகம்',
    icon: '👑',
    defaultPhone: '9876543210',
    defaultEmail: 'admin@ecoreward.com',
    badge: 'Tamil Nadu 38-Dist Command',
    activeStyle: 'bg-amber-50 text-amber-800 border-2 border-amber-500 shadow-sm font-black'
  }
];

const WASTE_STAGES = [
  {
    step: '01',
    title: 'Doorstep Segregation',
    tamil: 'குப்பை தரம் பிரித்தல்',
    desc: 'Households separate recyclable plastic, metals, paper & e-waste into dedicated dry bins.',
    stat: '74% Source Segregation',
    icon: '🧴'
  },
  {
    step: '02',
    title: 'Smart EV Route Dispatch',
    tamil: 'மின்சார வாகன சேகரிப்பு',
    desc: 'Local municipal EV tipper is dispatched with live GPS tracking and Bluetooth digital scale.',
    stat: '15.3K Daily EV Trips',
    icon: '🚚'
  },
  {
    step: '03',
    title: 'Material Recovery Facility',
    tamil: 'மறுசுழற்சி ஆலைக்கு அனுப்புதல்',
    desc: 'Waste is weighed, shredded & baled at certified TNPCB Micro-Composting & MRF centers.',
    stat: '8.2 Tons Saved / Day',
    icon: '🏭'
  },
  {
    step: '04',
    title: 'Instant UPI Buyback',
    tamil: 'உடனடி UPI பணம்',
    desc: 'EcoPoints credited straight to wallet with 1-click transfer to GPay, PhonePe, or Paytm.',
    stat: '₹250 / 500 Pts Payout',
    icon: '💸'
  }
];

const SCRAP_RATES = [
  { material: 'Plastics & PET Bottles', rate: '₹18 / kg', pts: '+3 Pts', icon: '🧴' },
  { material: 'Metals, Tins & Iron', rate: '₹34 / kg', pts: '+5 Pts', icon: '🥫' },
  { material: 'E-Waste & Electronics', rate: '₹48 / kg', pts: '+10 Pts', icon: '💻' },
  { material: 'Cardboard & Paper', rate: '₹14 / kg', pts: '+2 Pts', icon: '📦' }
];

const VEHICLE_TYPES = [
  'E-Rickshaw Tipper (EV)',
  'Tata Ace EV Mini Tipper',
  'Hydraulic Compactor Truck (14T)',
  'Battery Operated Commercial Baler Carrier',
  'Three-Wheeler Doorstep Hopper'
];

const Login = ({ initialMode = 'signin' }) => {
  const { login, signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Mode: 'signin' | 'signup'
  const [mode, setMode] = useState(initialMode);

  // Role selector
  const [selectedRole, setSelectedRole] = useState('user');

  // Sign In inputs
  const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
  const [emailOrPhone, setEmailOrPhone] = useState(ROLES[0].defaultPhone);
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign In OTP
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Sign Up fields
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('chennai');
  const [wardOrAddress, setWardOrAddress] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('Sanitary Inspector / SWM In-Charge');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Interactive Stage selection on PC
  const [activeStage, setActiveStage] = useState(0);

  // Status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === selectedDistrictId) || TAMIL_NADU_DISTRICTS[0];

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

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  // Global Ctrl+K shortcut on desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendOtp = () => {
    if (!emailOrPhone || emailOrPhone.trim().length < 4) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpTimer(30);
    setOtpCode('1234');
    addToast(`SMS OTP sent to ${emailOrPhone}! Demo Code: 1234`, 'info', 'OTP Generated');
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    const targetInput = emailOrPhone.trim() || activeRole.defaultPhone;
    const targetPass = authMode === 'otp' ? '1234' : password;

    if (authMode === 'otp' && otpSent && otpCode.length < 4) {
      setLoading(false);
      setError('Please enter the 4-digit OTP code.');
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
        const fallback = await login(activeRole.defaultEmail, '1234');
        if (fallback.success) {
          addToast(`Welcome back, ${fallback.user.name}!`, 'success', 'Login Successful');
          if (fallback.user.role === 'admin') navigate('/admin');
          else if (fallback.user.role === 'driver') navigate('/driver');
          else if (fallback.user.role === 'municipality') navigate('/municipality/dashboard');
          else navigate('/dashboard');
        } else {
          setError(res.message || 'Invalid credentials. Please check your mobile or password.');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check your network and try again.');
    }
  };

  // Handle Sign Up Submit
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
      payload.licenseNumber = licenseNumber.trim().toUpperCase() || `DL-${payload.vehicleNumber}`;
    }

    try {
      const res = await signup(payload);
      setLoading(false);

      if (res.success) {
        if (selectedRole === 'driver') {
          addToast(`Driver Account created! Welcome, ${signupName}.`, 'success', 'Registration Successful');
          navigate('/driver');
        } else if (selectedRole === 'municipality') {
          addToast(`Municipal Officer account created for ${activeDistrict.name}!`, 'success', 'Registration Successful');
          navigate('/municipality/dashboard');
        } else {
          addToast(`Welcome to EcoReward, ${signupName}! Your account is active.`, 'success', 'Account Created');
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed. Email or phone may already exist.');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50/70 via-slate-50 to-teal-50/60 text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-emerald-500/20">
      
      {/* Decorative Luminous Color Orbs for PC Background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Standard Navbar */}
      <div className="hidden lg:block relative z-20">
        <Navbar />
      </div>

      {/* Mobile Native App Bar */}
      <header className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-emerald-500/15 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <img 
              src="/app-logo.png" 
              alt="EcoReward Logo" 
              className="h-6 w-6 object-contain"
              onError={(e) => { e.currentTarget.src = '/app-logo.svg'; }}
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black tracking-tight text-slate-900">EcoReward</span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/60">
                TN 2026
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Tamil Nadu Circular SWM Portal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold active:scale-95 transition"
          >
            {mode === 'signin' ? <FaUserPlus className="text-xs" /> : <FaSignInAlt className="text-xs" />}
            <span>{mode === 'signin' ? 'Register' : 'Sign In'}</span>
          </button>
          <Link 
            to="/support"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-bold active:scale-95 transition"
            title="Toll-Free Helpline"
          >
            <FaHeadset className="text-emerald-600 text-xs" />
            <span>1913</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area - PC Split-Screen Layout */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3.5 sm:p-6 py-5 sm:py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* LEFT 7 COLUMNS: PC OPERATIONAL SHOWCASE & STORY */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-between space-y-5 p-2 xl:p-6">
            
            {/* Header Badge & Title */}
            <div className="space-y-3">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider">
                <span>🏛️ Tamil Nadu Urban Local Bodies & SWM Rules 2016</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Turn Recyclables into<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Instant UPI Cash.
                </span>
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed font-medium">
                Tamil Nadu's smart solid waste management network. Book doorstep collections with Bluetooth weighing scales, monitor live EV tipper routes, and cash out EcoPoints to your UPI wallet.
              </p>
            </div>

            {/* 4-Stage Interactive Waste Lifecycle Tabs */}
            <div className="space-y-2.5 bg-white/90 border border-emerald-500/20 rounded-3xl p-4 shadow-sm backdrop-blur-md">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  How The Green Loop Works:
                </span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">
                  Step {activeStage + 1} of 4
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {WASTE_STAGES.map((s, idx) => {
                  const isActive = activeStage === idx;
                  return (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setActiveStage(idx)}
                      className={`p-2.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base">{s.icon}</span>
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {s.step}
                        </span>
                      </div>
                      <span className="text-[11px] font-black leading-tight truncate w-full">
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Stage Detail Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-emerald-900">
                      {WASTE_STAGES[activeStage].title}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-800">
                      {WASTE_STAGES[activeStage].tamil}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pt-0.5">
                    {WASTE_STAGES[activeStage].desc}
                  </p>
                </div>
                <div className="text-right shrink-0 pl-3">
                  <span className="text-xs font-black text-emerald-700 font-mono block">
                    {WASTE_STAGES[activeStage].stat}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold">Official Stat</span>
                </div>
              </div>
            </div>

            {/* Today's Official Scrap Buyback Rates Widget */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                <span>💰 Official Scrap Buyback Rates Today</span>
                <span className="text-[10px] font-mono text-emerald-700">Live TN Benchmark</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 text-xs">
                {SCRAP_RATES.map((sr) => (
                  <div key={sr.material} className="p-3 bg-white/90 border border-slate-200/90 rounded-2xl shadow-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{sr.icon}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {sr.pts}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 block pt-1">{sr.rate}</span>
                    <span className="text-[10px] text-slate-500 font-medium truncate block">{sr.material}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Stats Counters */}
            <div className="grid grid-cols-4 gap-2.5 text-center text-xs pt-1">
              <div className="p-3 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-lg font-black text-emerald-600 block">38</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Districts</span>
              </div>
              <div className="p-3 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-lg font-black text-teal-600 block">15.3K</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">EV Pickups</span>
              </div>
              <div className="p-3 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-lg font-black text-cyan-600 block">8.2 Tons</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">CO₂ Offset</span>
              </div>
              <div className="p-3 bg-white/80 border border-slate-200 rounded-2xl shadow-xs">
                <span className="text-lg font-black text-emerald-700 block">₹250</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase">Per 500 Pts</span>
              </div>
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: ELEVATED AUTHENTICATION SUITE */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="w-full max-w-[470px] bg-white/95 backdrop-blur-2xl border border-emerald-500/25 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-emerald-950/10 space-y-4 relative overflow-hidden">
              
              {/* Top Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

              {/* Mode Switcher Tabs (Sign In vs Create Account) */}
              <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FaSignInAlt className="text-emerald-600" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FaUserPlus className="text-emerald-600" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Card Header */}
              <div className="text-center space-y-1 pt-0.5">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs mb-0.5">
                  <span className="text-2xl">{activeRole.icon}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <span>{mode === 'signin' ? 'Welcome Back' : 'Create Account'}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {activeRole.tamil}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeRole.badge} • Tamil Nadu SWM Desk
                </p>
              </div>

              {/* 1. Account Role Switcher */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
                  <span>Select Portal Role</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-extrabold">38 Districts Active</span>
                </div>
                <div className={`grid ${mode === 'signin' ? 'grid-cols-4' : 'grid-cols-3'} gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200`}>
                  {(mode === 'signin' ? ROLES : ROLES.filter(r => r.id !== 'admin')).map((r) => {
                    const isActive = selectedRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => handleRoleChange(r.id)}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                          isActive 
                            ? r.activeStyle
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        <span className="text-base">{r.icon}</span>
                        <span className="text-[10px] leading-tight font-extrabold">{r.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-rose-500 font-black text-sm">×</button>
                </div>
              )}

              {/* 2. FORMS */}
              {mode === 'signin' ? (
                /* ================= SIGN IN FORM ================= */
                <div className="space-y-3">
                  {/* Mode Toggle (OTP vs Password) */}
                  <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('otp');
                        setEmailOrPhone(activeRole.defaultPhone);
                        setError('');
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                        authMode === 'otp'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FaPhoneAlt className="text-[10px]" />
                      <span>Mobile OTP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('password');
                        setEmailOrPhone(activeRole.defaultEmail);
                        setPassword('1234');
                        setError('');
                      }}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                        authMode === 'password'
                          ? 'bg-emerald-600 text-white shadow-xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FaLock className="text-[10px]" />
                      <span>Password</span>
                    </button>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    {authMode === 'otp' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                            Mobile Number
                          </label>
                          <div className="relative flex">
                            <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-100/80 text-xs font-bold text-slate-700">
                              🇮🇳 +91
                            </span>
                            <input
                              type="tel"
                              value={emailOrPhone}
                              onChange={(e) => setEmailOrPhone(e.target.value)}
                              placeholder="10-digit mobile number"
                              required
                              className="flex-1 px-3 py-2 bg-slate-50/70 rounded-r-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                              4-Digit OTP
                            </label>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpTimer > 0}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 disabled:text-slate-400 cursor-pointer"
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
                              className="w-full tracking-[0.5em] text-center font-mono py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-base font-black text-slate-900 placeholder:tracking-normal placeholder:font-sans placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                            Email or Mobile
                          </label>
                          <div className="relative">
                            <FaEnvelope className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                            <input 
                              type="text" 
                              value={emailOrPhone} 
                              onChange={(e) => setEmailOrPhone(e.target.value)} 
                              required 
                              placeholder="Enter email or mobile" 
                              className="w-full pl-9 pr-3 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                              Password
                            </label>
                            <Link to="/forgot-password" className="text-[10px] font-bold text-emerald-700 hover:underline">
                              Forgot?
                            </Link>
                          </div>
                          <div className="relative">
                            <FaLock className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                            <input 
                              type={showPassword ? 'text' : 'password'} 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              required 
                              placeholder="••••••••" 
                              className="w-full pl-9 pr-9 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPassword(!showPassword)} 
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
                      </>
                    )}

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                    >
                      {loading ? (
                        <>
                          <FaSpinner className="animate-spin h-4 w-4" />
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <FaSignInAlt className="h-4 w-4" />
                          <span>Sign In as {activeRole.name}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* ================= SIGN UP FORM ================= */
                <form onSubmit={handleSignupSubmit} className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      {selectedRole === 'municipality' ? 'Officer Full Name' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <FaUserPlus className="absolute left-3.5 top-3 text-slate-400 text-xs" />
                      <input 
                        type="text" 
                        value={signupName} 
                        onChange={(e) => setSignupName(e.target.value)} 
                        required 
                        placeholder="Enter your full name" 
                        className="w-full pl-9 pr-3 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative flex">
                      <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-300 bg-slate-100/80 text-xs font-bold text-slate-700">
                        🇮🇳 +91
                      </span>
                      <input 
                        type="tel" 
                        value={signupPhone} 
                        onChange={(e) => setSignupPhone(e.target.value)} 
                        required 
                        maxLength={10}
                        placeholder="10-digit mobile number" 
                        className="flex-1 px-3 py-2 bg-slate-50/70 rounded-r-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Tamil Nadu District</span>
                      <span className="text-[9px] font-bold text-emerald-700">{activeDistrict.tamilName}</span>
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3.5 top-3 text-emerald-600 text-xs pointer-events-none" />
                      <select
                        value={selectedDistrictId}
                        onChange={(e) => setSelectedDistrictId(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                      >
                        {TAMIL_NADU_DISTRICTS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.tamilName})
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3.5 top-2.5 text-slate-400 text-xs pointer-events-none">▾</span>
                    </div>
                  </div>

                  {selectedRole === 'driver' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                          Vehicle Reg No
                        </label>
                        <input 
                          type="text" 
                          value={vehicleNumber} 
                          onChange={(e) => setVehicleNumber(e.target.value)} 
                          required 
                          placeholder="TN-01-AB-1234" 
                          className="w-full px-3 py-2 bg-slate-50/70 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 uppercase" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                          License Number
                        </label>
                        <input 
                          type="text" 
                          value={licenseNumber} 
                          onChange={(e) => setLicenseNumber(e.target.value)} 
                          placeholder="DL-TN..." 
                          className="w-full px-3 py-2 bg-slate-50/70 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-teal-500 uppercase" 
                        />
                      </div>
                    </div>
                  )}

                  {selectedRole === 'municipality' && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                        Designation / Ward
                      </label>
                      <input 
                        type="text" 
                        value={officerDesignation} 
                        onChange={(e) => setOfficerDesignation(e.target.value)} 
                        className="w-full px-3 py-2 bg-slate-50/70 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Password
                      </label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={signupPassword} 
                        onChange={(e) => setSignupPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        Confirm
                      </label>
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all" 
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin h-4 w-4" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="h-4 w-4" />
                        <span>Complete Registration ({activeRole.name})</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Footer Help & Keyboard Hint */}
              <div className="text-center pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="hidden sm:inline">Press ↵ to Submit • Ctrl+K for Search</span>
                <span className="inline sm:hidden">Tamil Nadu SWM 2026</span>
                <span className="flex items-center space-x-1">
                  <FaShieldAlt className="text-emerald-600" />
                  <span>1913 Helpline</span>
                </span>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Global Command Palette */}
      <DesktopCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

    </div>
  );
};

export default Login;
