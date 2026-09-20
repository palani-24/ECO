import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaLeaf, FaTruck, FaShieldAlt, FaUser, FaPhoneAlt, FaEnvelope, 
  FaLock, FaEye, FaEyeSlash, FaMapMarkerAlt, FaCheckCircle, FaSpinner, 
  FaSignInAlt, FaUserPlus, FaHeadset, FaBuilding
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    tamil: 'குடிமகன்',
    icon: '🧑',
    badge: 'Doorstep Recycling & Rewards',
    activeStyle: 'bg-emerald-50 text-emerald-800 border-2 border-emerald-500 shadow-sm font-black'
  },
  {
    id: 'driver',
    name: 'Driver',
    tamil: 'ஓட்டுநர்',
    icon: '🚚',
    badge: 'Green EV Fleet & Weighbridge',
    activeStyle: 'bg-teal-50 text-teal-800 border-2 border-teal-500 shadow-sm font-black'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    tamil: 'நகராட்சி',
    icon: '🏛️',
    badge: 'Ward SWM & Facility Audit',
    activeStyle: 'bg-cyan-50 text-cyan-800 border-2 border-cyan-500 shadow-sm font-black'
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

  // Role
  const [role, setRole] = useState('user');

  // Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('chennai');
  const [wardOrAddress, setWardOrAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver fields
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Municipality fields
  const [officerDesignation, setOfficerDesignation] = useState('Sanitary Inspector / SWM In-Charge');

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === selectedDistrictId) || TAMIL_NADU_DISTRICTS[0];
  const activeRole = ROLES.find(r => r.id === role) || ROLES[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
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
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    if (role === 'driver' && !vehicleNumber.trim()) {
      setError('Please enter your vehicle registration number.');
      return;
    }

    setLoading(true);

    const finalEmail = email.trim() || `${cleanPhone}@ecoreward.tn`;

    const payload = {
      name: name.trim(),
      phone: cleanPhone,
      email: finalEmail,
      password,
      role,
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
          addToast(`Driver Account created! Welcome, ${name}.`, 'success', 'Registration Successful');
          navigate('/driver');
        } else if (role === 'municipality') {
          addToast(`Municipal Officer account created for ${activeDistrict.name}!`, 'success', 'Registration Successful');
          navigate('/municipality/dashboard');
        } else {
          addToast(`Welcome to EcoReward, ${name}! Your account is active.`, 'success', 'Account Created');
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
      
      {/* Decorative Luminous Color Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Navbar */}
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
          <Link 
            to="/login"
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold active:scale-95 transition shadow-xs"
          >
            <FaSignInAlt className="text-[11px]" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3.5 sm:p-6 py-5 sm:py-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Presentation (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-6 p-6">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 font-black text-xs rounded-full uppercase tracking-wider inline-block">
                Civil Registration & Onboarding
              </span>
              <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Create Your<br />Eco Account.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
                  Start Recycling Today.
                </span>
              </h1>
              <p className="text-sm text-slate-600 max-w-lg leading-relaxed font-medium">
                Join Tamil Nadu's smart solid waste management network. Schedule doorstep scrap collections, receive instant UPI payouts, and build a greener Tamil Nadu.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-white/90 border border-emerald-500/20 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xl shrink-0">
                  <FaLeaf />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block">Instant EcoPoints Credit</span>
                  <span className="text-xs text-slate-500">Welcome points credited automatically to your digital wallet.</span>
                </div>
              </div>

              <div className="p-4 bg-white/90 border border-teal-500/20 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 text-xl shrink-0">
                  <FaTruck />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block">Free Doorstep EV Pickups</span>
                  <span className="text-xs text-slate-500">Scheduled doorstep scrap pickup with digital weighbridge scales.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Elevated Glass Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-[500px] bg-white/95 backdrop-blur-2xl border border-emerald-500/25 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-emerald-950/10 space-y-4 relative overflow-hidden">
              
              {/* Top Accent Gradient Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

              {/* Mode Switcher Tabs (Sign In vs Create Account) */}
              <div className="flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/90">
                <Link
                  to="/login"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center justify-center space-x-1.5 transition active:scale-95"
                >
                  <FaSignInAlt className="text-slate-400" />
                  <span>Sign In</span>
                </Link>
                <button
                  type="button"
                  className="flex-1 py-2 rounded-xl text-xs font-black bg-white text-emerald-800 shadow-sm border border-emerald-200/80 flex items-center justify-center space-x-1.5 transition"
                >
                  <FaUserPlus className="text-emerald-600" />
                  <span>Create Account</span>
                </button>
              </div>

              {/* Card Header */}
              <div className="text-center space-y-1 pt-1">
                <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-xs mb-1">
                  <span className="text-2xl">{activeRole.icon}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
                  <span>Create Account</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
                    {activeRole.tamil}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeRole.badge}
                </p>
              </div>

              {/* 1. Account Role Switcher */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-0.5">
                  <span>Select Account Type</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-extrabold">Instant Activation</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
                  {ROLES.map((r) => {
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

              {/* Error Notice */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError('')} className="text-rose-500 font-black text-sm">×</button>
                </div>
              )}

              {/* 2. Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    {role === 'municipality' ? 'Officer Full Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="Enter your full name" 
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                </div>

                {/* Mobile Number */}
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
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      required 
                      maxLength={10}
                      placeholder="10-digit mobile number" 
                      className="flex-1 px-3 py-2.5 bg-slate-50/70 rounded-r-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    {role === 'municipality' ? 'Official Govt Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder={role === 'municipality' ? 'officer@corporation.tn.gov.in' : 'name@example.com'} 
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                </div>

                {/* Tamil Nadu 38 District Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Tamil Nadu District</span>
                    <span className="text-[9px] font-bold text-emerald-700">{activeDistrict.tamilName}</span>
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3.5 top-3.5 text-emerald-600 text-xs pointer-events-none" />
                    <select
                      value={selectedDistrictId}
                      onChange={(e) => setSelectedDistrictId(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 appearance-none cursor-pointer transition-all"
                    >
                      {TAMIL_NADU_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.tamilName})
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3.5 top-3 text-slate-400 text-xs pointer-events-none">▾</span>
                  </div>
                </div>

                {/* Role-Specific Fields */}
                {role === 'user' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Ward / Area / Address
                    </label>
                    <input 
                      type="text" 
                      value={wardOrAddress} 
                      onChange={(e) => setWardOrAddress(e.target.value)} 
                      placeholder="e.g. Ward 12, Anna Nagar" 
                      className="w-full px-3 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>
                )}

                {role === 'driver' && (
                  <div className="space-y-3 p-3 bg-slate-50/80 rounded-2xl border border-teal-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                        Vehicle Type
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-teal-500"
                      >
                        {VEHICLE_TYPES.map(vt => (
                          <option key={vt} value={vt}>{vt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                          Vehicle Number
                        </label>
                        <input 
                          type="text" 
                          value={vehicleNumber} 
                          onChange={(e) => setVehicleNumber(e.target.value)} 
                          required 
                          placeholder="TN-01-AB-1234" 
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 uppercase" 
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
                          className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 uppercase" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {role === 'municipality' && (
                  <div className="space-y-3 p-3 bg-slate-50/80 rounded-2xl border border-cyan-200">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                        Designation
                      </label>
                      <input 
                        type="text" 
                        value={officerDesignation} 
                        onChange={(e) => setOfficerDesignation(e.target.value)} 
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-cyan-800 uppercase tracking-wider">
                        Assigned Ward / Zone
                      </label>
                      <input 
                        type="text" 
                        value={wardOrAddress} 
                        onChange={(e) => setWardOrAddress(e.target.value)} 
                        placeholder="e.g. Zone 5 - Central Command" 
                        className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500" 
                      />
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                      className="w-full px-3 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Confirm
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="••••••••" 
                        className="w-full px-3 py-2.5 bg-slate-50/70 rounded-2xl border border-slate-300 text-xs font-extrabold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-2.5 top-3 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={agreeTerms} 
                      onChange={(e) => setAgreeTerms(e.target.checked)} 
                      className="h-4 w-4 rounded accent-emerald-600 shrink-0" 
                    />
                    <span className="text-[11px] leading-tight">
                      I agree to the Terms of Service & Privacy Policy
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1"
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

              {/* Bottom Switch to Sign In */}
              <div className="pt-2 border-t border-slate-100">
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/60 border border-emerald-200/80 flex items-center justify-between gap-2 shadow-xs">
                  <div>
                    <span className="text-xs font-black text-slate-900 block">Already registered?</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Sign in to your active account</span>
                  </div>
                  <Link 
                    to="/login" 
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition whitespace-nowrap flex items-center space-x-1"
                  >
                    <span>Sign In →</span>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center pt-0.5">
                <p className="text-[10px] text-slate-400 font-medium flex items-center justify-center space-x-1.5">
                  <FaShieldAlt className="text-emerald-600" />
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
