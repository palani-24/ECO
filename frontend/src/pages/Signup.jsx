import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaLeaf, FaTruck, FaShieldAlt, FaUser, FaPhoneAlt, FaEnvelope, 
  FaLock, FaEye, FaEyeSlash, FaMapMarkerAlt, FaCheckCircle, FaSpinner, 
  FaSignInAlt, FaBuilding, FaHeadset, FaChevronRight, FaGift, FaPlay, FaPause, FaIdCard
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const SIGNUP_ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    tamil: 'குடிமகன்',
    icon: '🧑',
    perk: '+50 Free EcoPoints Bonus',
    subtitle: 'Doorstep Recycling & Instant UPI Cashout',
    activeStyle: 'bg-emerald-500/20 text-emerald-400 border-emerald-400'
  },
  {
    id: 'driver',
    name: 'Driver',
    tamil: 'ஓட்டுநர்',
    icon: '🚚',
    perk: 'EV Fleet Dispatch & Daily Pay',
    subtitle: 'Pickup Routes, Gate Passes & Weighbridge',
    activeStyle: 'bg-teal-500/20 text-teal-400 border-teal-400'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    tamil: 'நகராட்சி',
    icon: '🏛️',
    perk: 'Ward SWM & Grievance Desk',
    subtitle: 'Urban Local Body Operations & TNPCB Audit',
    activeStyle: 'bg-cyan-500/20 text-cyan-400 border-cyan-400'
  }
];

const VEHICLE_TYPES = [
  'E-Rickshaw Tipper (EV)',
  'Tata Ace EV Mini Tipper',
  'Hydraulic Compactor Truck (14T)',
  'Battery Operated Commercial Baler Carrier',
  'Three-Wheeler Doorstep Hopper'
];

const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active Role
  const [role, setRole] = useState('user');

  // Common Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('chennai');
  const [wardOrAddress, setWardOrAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver-specific fields
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Municipality-specific fields
  const [officerDesignation, setOfficerDesignation] = useState('Sanitary Inspector / SWM In-Charge');
  const [department, setDepartment] = useState('Solid Waste Management Department');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Ambient Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === selectedDistrictId) || TAMIL_NADU_DISTRICTS[0];

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
      if (isVideoPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Quick Demo fill for fast testing
  const handleQuickFillDemo = () => {
    if (role === 'user') {
      setName('Karthik Raja');
      setPhone('9876500111');
      setEmail('karthik.citizen@ecoreward.tn');
      setWardOrAddress('Ward 104 - Anna Nagar West');
      setPassword('1234');
      setConfirmPassword('1234');
      setSelectedDistrictId('chennai');
    } else if (role === 'driver') {
      setName('Murugan Pandian');
      setPhone('9876500222');
      setEmail('murugan.driver@ecoreward.tn');
      setVehicleType('E-Rickshaw Tipper (EV)');
      setVehicleNumber('TN-01-EV-4820');
      setLicenseNumber('DL-TN01-2022-8849');
      setPassword('1234');
      setConfirmPassword('1234');
      setSelectedDistrictId('chennai');
    } else {
      setName('Selvam Sundaram');
      setPhone('9876500333');
      setEmail('selvam.swm@chennaicorporation.gov.in');
      setWardOrAddress('Zone 8 - Central SWM Command');
      setPassword('1234');
      setConfirmPassword('1234');
      setSelectedDistrictId('chennai');
    }
    addToast(`⚡ Demo ${role} details filled!`, 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!phone || phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Tamil Nadu SWM Rules & Terms.');
      return;
    }

    if (role === 'driver' && (!vehicleNumber.trim())) {
      setError('Please enter your vehicle registration number.');
      return;
    }

    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, '');
    const finalEmail = email.trim() || `${cleanPhone}@ecoreward.tn`;

    const payload = {
      name: name.trim(),
      phone: cleanPhone,
      email: finalEmail,
      password,
      role,
      ward: wardOrAddress.trim() || `${activeDistrict.name} Ward 01`,
      jurisdiction: activeDistrict.corporation || `${activeDistrict.name} District Administration`,
      department: department,
      address: {
        street: wardOrAddress.trim() || `${activeDistrict.name} Main Road`,
        city: activeDistrict.name,
        state: 'Tamil Nadu',
        zipCode: '600001',
        isDefault: true
      }
    };

    if (role === 'driver') {
      payload.vehicleNumber = vehicleNumber.trim().toUpperCase();
      payload.vehicleType = vehicleType;
      payload.licenseNumber = licenseNumber.trim().toUpperCase() || `DL-${payload.vehicleNumber}`;
    }

    try {
      const res = await signup(payload);
      setLoading(false);

      if (res.success) {
        if (role === 'driver') {
          addToast(`🚚 Driver Account Registered! Welcome ${name}.`, 'success', 'Registration Successful');
          navigate('/driver');
        } else if (role === 'municipality') {
          addToast(`🏛️ Municipal Officer Account Created for ${activeDistrict.name}!`, 'success', 'Registration Successful');
          navigate('/municipality/dashboard');
        } else {
          addToast(`🎉 Welcome to EcoReward, ${name}! +50 EcoPoints credited to your wallet.`, 'success', 'Account Activated');
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

  const activeRoleObj = SIGNUP_ROLES.find(r => r.id === role);

  return (
    <div className="relative min-h-screen bg-[#050e18] flex flex-col font-sans text-slate-100 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* High-Definition Ambient Video Background */}
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
      
      {/* Dark Slate & Emerald Mesh Vignette Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050e18]/95 via-[#061424]/90 to-[#030911]/98 pointer-events-none" />

      {/* Floating Video Controls (Desktop) */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-40 items-center space-x-2 bg-[#08182b]/90 border border-emerald-500/30 px-3 py-1.5 rounded-full backdrop-blur-md shadow-2xl">
        <button 
          type="button" 
          onClick={toggleVideoPlay}
          className="p-1 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
          title={isVideoPlaying ? "Pause Video" : "Play Video"}
        >
          {isVideoPlaying ? <FaPause className="h-3 w-3" /> : <FaPlay className="h-3 w-3" />}
        </button>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Ambient Stream</span>
      </div>

      {/* Desktop Standard Navbar */}
      <div className="hidden lg:block relative z-20">
        <Navbar />
      </div>

      {/* Native Mobile App Header (Mobile & Tablet) */}
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
            to="/login"
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black active:scale-95 transition shadow"
          >
            <FaSignInAlt className="text-[11px]" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Top Ticker Bar */}
      <div className="relative z-10 bg-emerald-950/40 border-b border-emerald-500/20 py-1 px-3 text-center">
        <p className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 tracking-wide truncate">
          ⚡ JOIN 25,840+ CITIZENS: Free Doorstep EV Pickups • Scrap Buyback • Tamil Nadu SWM 2026
        </p>
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center w-full">
          
          {/* Left Column: Mission & Impact Presentation (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 text-white p-4">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs rounded-full uppercase tracking-wider inline-block">
                Civil Registration & Green Onboarding
              </span>
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
                Create Your<br />Eco Account.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                  Earn Real Rewards.
                </span>
              </h1>
              <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                Join Tamil Nadu's smart solid waste management network. Schedule doorstep scrap collections, receive instant UPI payouts, and help build a zero-landfill state.
              </p>
            </div>

            {/* Perks Cards */}
            <div className="space-y-3">
              <div className="p-4 bg-[#08182b]/85 border border-emerald-500/30 rounded-2xl flex items-center space-x-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xl shrink-0">
                  <FaGift />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">+50 Welcome EcoPoints</span>
                  <span className="text-xs text-slate-400">Instant credit upon signup redeemable for real cash or tree planting.</span>
                </div>
              </div>

              <div className="p-4 bg-[#08182b]/85 border border-teal-500/30 rounded-2xl flex items-center space-x-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 text-xl shrink-0">
                  <FaTruck />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">Free Doorstep EV Pickups</span>
                  <span className="text-xs text-slate-400">Calibrated Bluetooth weighing scales with digital receipts.</span>
                </div>
              </div>

              <div className="p-4 bg-[#08182b]/85 border border-cyan-500/30 rounded-2xl flex items-center space-x-3.5 shadow-lg">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 text-xl shrink-0">
                  <FaBuilding />
                </div>
                <div>
                  <span className="text-sm font-black text-white block">38 Districts SWM Integration</span>
                  <span className="text-xs text-slate-400">Directly synchronized with Tamil Nadu Municipal Corporations.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Native Mobile Signup Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-[520px] bg-[#071729]/95 sm:bg-[#071729]/90 backdrop-blur-2xl border border-emerald-500/30 p-4 sm:p-7 rounded-3xl shadow-2xl space-y-4">
              
              {/* Card Header */}
              <div className="text-center space-y-1">
                <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-1">
                  <span className="text-2xl">{activeRoleObj?.icon}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {activeRoleObj?.tamil}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  {activeRoleObj?.subtitle}
                </p>
              </div>

              {/* 1. ROLE SELECTOR CHIPS */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 px-1">
                  <span>Choose Account Type</span>
                  <button 
                    type="button" 
                    onClick={handleQuickFillDemo}
                    className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <span>⚡ Quick Demo Fill</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#040c16] rounded-2xl border border-slate-800/80">
                  {SIGNUP_ROLES.map((r) => {
                    const isActive = role === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRole(r.id);
                          setError('');
                        }}
                        className={`py-2 px-1 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                          isActive 
                            ? `${r.activeStyle} shadow-lg` 
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

              {/* Instant Perk Tag */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between">
                <span className="text-[11px] font-black text-emerald-300 flex items-center space-x-1.5">
                  <FaGift className="text-xs shrink-0" />
                  <span>{activeRoleObj?.perk}</span>
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  TN 2026
                </span>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-2xl animate-fadeIn flex items-center justify-between">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-rose-400 text-sm">×</button>
                </div>
              )}

              {/* 2. REGISTRATION FORM */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {role === 'municipality' ? 'Officer Full Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder={role === 'municipality' ? 'e.g. Selvam Sundaram (SWM)' : 'e.g. Karthik Raja'} 
                      className="w-full pl-9 pr-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Mobile Number</span>
                    <span className="text-[9px] font-mono text-emerald-400">10-Digit OTP Capable</span>
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-slate-700 bg-slate-800 text-xs font-bold text-slate-300">
                      🇮🇳 +91
                    </span>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                      maxLength={10}
                      placeholder="9876543210" 
                      className="flex-1 px-3 py-2.5 bg-[#040c16] rounded-r-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    {role === 'municipality' ? 'Official Govt Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder={role === 'municipality' ? 'officer@corporation.tn.gov.in' : 'name@example.com'} 
                      className="w-full pl-9 pr-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                {/* Tamil Nadu 38 District Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Tamil Nadu District (38 Districts)</span>
                    <span className="text-[9px] font-mono text-teal-400">{activeDistrict.tamilName}</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-emerald-400 text-xs pointer-events-none" />
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
                    >
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id} className="bg-[#071729] text-white">
                          {d.name} ({d.tamilName}) • {d.corporation ? 'Municipal Corp' : 'District'}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-3 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </div>

                {/* Role-Specific Fields */}
                {role === 'user' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Ward / Street Address
                    </label>
                    <input 
                      type="text" 
                      value={wardOrAddress} 
                      onChange={(e) => setWardOrAddress(e.target.value)} 
                      placeholder="e.g. Ward 104 - Anna Nagar West" 
                      className="w-full px-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                    />
                  </div>
                )}

                {role === 'driver' && (
                  <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-teal-500/30">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                        Green EV Fleet Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#040c16] rounded-xl border border-slate-700 text-xs font-extrabold text-white focus:outline-none focus:border-teal-500"
                      >
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt} value={vt} className="bg-[#071729] text-white">{vt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                          Vehicle Number
                        </label>
                        <input 
                          type="text" 
                          value={vehicleNumber} 
                          onChange={(e) => setVehicleNumber(e.target.value)} 
                          required 
                          placeholder="TN-01-EV-1234" 
                          className="w-full px-3 py-2 bg-[#040c16] rounded-xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 uppercase" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
                          Driving License No.
                        </label>
                        <input 
                          type="text" 
                          value={licenseNumber} 
                          onChange={(e) => setLicenseNumber(e.target.value)} 
                          placeholder="DL-TN..." 
                          className="w-full px-3 py-2 bg-[#040c16] rounded-xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 uppercase" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'municipality' && (
                  <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-cyan-500/30">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                        Designation / Department
                      </label>
                      <input 
                        type="text" 
                        value={officerDesignation} 
                        onChange={(e) => setOfficerDesignation(e.target.value)} 
                        className="w-full px-3 py-2 bg-[#040c16] rounded-xl border border-slate-700 text-xs font-extrabold text-white focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
                        Assigned Ward / Zone
                      </label>
                      <input 
                        type="text" 
                        value={wardOrAddress} 
                        onChange={(e) => setWardOrAddress(e.target.value)} 
                        placeholder="e.g. Zone 8 - Central SWM Command" 
                        className="w-full px-3 py-2 bg-[#040c16] rounded-xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Create Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2.5 bg-[#040c16] rounded-2xl border border-slate-700 text-xs font-extrabold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-1">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreeTerms} 
                      onChange={(e) => setAgreeTerms(e.target.checked)} 
                      className="h-4 w-4 rounded accent-emerald-500 shrink-0" 
                    />
                    <span className="text-[11px] leading-tight">
                      I agree to the Tamil Nadu SWM Rules 2016 & Civic Privacy Terms
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="h-4 w-4" />
                      <span>Complete Registration ({activeRoleObj?.name})</span>
                    </>
                  )}
                </button>

              </form>

              {/* 3. ALREADY HAVE AN ACCOUNT? SIGN IN BANNER */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-3 shadow-inner">
                <div>
                  <span className="text-xs font-black text-white block">Already registered?</span>
                  <span className="text-[10px] text-slate-400 font-medium block">Sign in to your wallet & active bookings</span>
                </div>
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow hover:scale-105 active:scale-95 transition whitespace-nowrap flex items-center space-x-1"
                >
                  <FaSignInAlt className="text-xs" />
                  <span>Sign In →</span>
                </Link>
              </div>

              {/* Footer Helpline */}
              <div className="text-center pt-0.5">
                <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center space-x-2">
                  <FaShieldAlt className="text-emerald-400" />
                  <span>Tamil Nadu Urban Local Bodies • 1913 Toll-Free Helpline</span>
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default Signup;
