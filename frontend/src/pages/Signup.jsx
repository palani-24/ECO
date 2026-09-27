import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaUser, FaEnvelope, FaPhoneAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaCheck, FaTruck, FaBuilding, FaBars, FaTimes,
  FaMapMarkerAlt, FaCar, FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    icon: FaUser,
    badge: 'Earn Rewards & Doorstep Pickup',
    desc: 'Schedule free EV scrap pickups and earn instant UPI cash'
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: FaTruck,
    badge: 'EV Fleet Partner',
    desc: 'Route navigation, Bluetooth weighing & daily pickup earnings'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    icon: FaBuilding,
    badge: 'SWM Ward Administration',
    desc: 'Grievance resolution & zonal waste analytics portal'
  }
];

const VEHICLE_TYPES = [
  'E-Rickshaw Tipper (EV)',
  'Tata Ace EV Mini Tipper',
  'Hydraulic Compactor Truck (14T)',
  'Battery Baler Carrier',
  'Three-Wheeler Doorstep Hopper'
];

const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Role Selection
  const [selectedRole, setSelectedRole] = useState('user');

  // Input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [districtId, setDistrictId] = useState('chennai');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver specific
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === districtId) || TAMIL_NADU_DISTRICTS[0];
  const activeRole = ROLES.find(r => r.id === selectedRole) || ROLES[0];

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
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the Terms of Service & Privacy Policy.');
      return;
    }

    if (selectedRole === 'driver' && !vehicleNumber.trim()) {
      setError('Please enter your EV vehicle registration number.');
      return;
    }

    setLoading(true);

    const finalEmail = email.trim() || `${cleanPhone}@ecoreward.tn`;

    const payload = {
      name: name.trim(),
      phone: cleanPhone,
      email: finalEmail,
      password,
      role: selectedRole,
      ward: ward.trim() || `${activeDistrict.name} Central Ward`,
      jurisdiction: activeDistrict.corporation || `${activeDistrict.name} Municipal Administration`,
      department: selectedRole === 'driver' ? 'Green Waste Logistics' : 'Solid Waste Management',
      address: {
        street: ward.trim() || `${activeDistrict.name} Main Road`,
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
        addToast(`Welcome to EcoReward, ${name}! Your account is ready.`, 'success', 'Account Registered');
        if (selectedRole === 'driver') navigate('/driver');
        else if (selectedRole === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Registration failed. Mobile or email may already be in use.');
      }
    } catch (err) {
      setLoading(false);
      setError('Failed to connect to registration server. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* Background Mountain Landscape Artwork */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_portal_ambient_bg.jpg')",
          filter: 'brightness(0.98)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Aesthetic */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
        
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

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider text-slate-800">
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">HOME</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">ABOUT</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">SERVICE</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors drop-shadow-xs">CONTACT</Link>
          <Link
            to="/login"
            className="px-6 py-1.5 rounded-full border border-white/70 bg-white/30 backdrop-blur-md text-slate-800 font-bold text-sm tracking-wider shadow-sm hover:bg-white/50 hover:shadow transition-all"
          >
            LOGIN
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
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>SERVICE</Link>
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md"
            >
              LOGIN
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
          {/* Frosted Glassmorphism Card */}
          <div className="relative rounded-[32px] p-7 sm:p-10 backdrop-blur-2xl bg-white/20 border border-white/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header Title */}
            <h1 className="relative text-2xl sm:text-3xl font-black tracking-wider text-slate-900 text-center mb-5 drop-shadow-xs">
              CREATE ACCOUNT
            </h1>

            {/* Role Selection Tabs */}
            <div className="mb-5">
              <div className="flex items-center justify-between p-1 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isActive = selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(r.id);
                        setError('');
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                        isActive
                          ? 'bg-white/90 text-slate-900 shadow-sm shadow-slate-900/10 scale-102 font-black'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/20'
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{r.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-center text-slate-700/80 font-medium mt-1.5">
                Register as <span className="font-bold text-slate-900">{activeRole.name}</span> • {activeRole.badge}
              </p>
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaUser className="absolute right-1 bottom-2.5 text-slate-700/80 text-sm pointer-events-none" />
              </div>

              {/* Mobile Number */}
              <div className="relative pt-1">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile Number (10 digits)"
                  required
                  maxLength={10}
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaPhoneAlt className="absolute right-1 bottom-2.5 text-slate-700/80 text-sm pointer-events-none" />
              </div>

              {/* Email Address */}
              <div className="relative pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-2.5 text-slate-700/80 text-sm pointer-events-none" />
              </div>

              {/* District & Ward Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="relative">
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 font-medium text-sm outline-none transition-colors cursor-pointer"
                  >
                    {TAMIL_NADU_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id} className="text-slate-900 bg-white">
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Ward / Street (optional)"
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-6 transition-colors"
                  />
                  <FaMapMarkerAlt className="absolute right-1 bottom-2.5 text-slate-700/80 text-xs pointer-events-none" />
                </div>
              </div>

              {/* Driver Special Fields */}
              {selectedRole === 'driver' && (
                <div className="space-y-3 pt-1 border-t border-white/30">
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="EV Vehicle Number (e.g. TN-38-EV-9945)"
                      required
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-8 transition-colors"
                    />
                    <FaCar className="absolute right-1 bottom-2.5 text-slate-700/80 text-sm pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 font-medium text-xs outline-none transition-colors cursor-pointer"
                    >
                      {VEHICLE_TYPES.map((t) => (
                        <option key={t} value={t} className="text-slate-900 bg-white">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-7 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 bottom-2.5 text-slate-700/80 hover:text-slate-950 text-xs"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    required
                    className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-sm outline-none pr-7 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-1 bottom-2.5 text-slate-700/80 hover:text-slate-950 text-xs"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="sr-only"
                />
                <div 
                  className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center transition-all flex-shrink-0 ${
                    agreeTerms 
                      ? 'bg-slate-800 border-slate-800 text-white shadow-xs' 
                      : 'border-slate-700/70 bg-white/40 hover:bg-white/60'
                  }`}
                >
                  {agreeTerms && <FaCheck className="text-[9px]" />}
                </div>
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  I agree to the <span className="underline">Terms of Service</span> & <span className="underline">Privacy Policy</span>
                </span>
              </label>

              {/* Gradient Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#5a8ee5] via-[#4679d4] to-[#366ac3] hover:from-[#4b82dc] hover:to-[#2c5caa] text-white font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/45 transition-all duration-200 active:scale-[0.98] text-center flex items-center justify-center space-x-2 cursor-pointer mt-4"
              >
                {loading ? (
                  <FaSpinner className="animate-spin text-lg" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Footer Switcher */}
              <p className="text-center text-sm text-slate-800 font-medium pt-2 drop-shadow-xs">
                Already have an Account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-slate-900 hover:underline ml-1"
                >
                  Sign In
                </Link>
              </p>
            </form>

          </div>

          {/* Bonus hint */}
          <div className="mt-3 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-[11px] font-semibold text-slate-800 shadow-xs">
              <span>🎁 Citizens receive <span className="font-bold text-emerald-800">50 Free Welcome Green Points</span></span>
            </div>
          </div>

        </motion.div>
      </main>

      {/* Subtle Bottom Credit */}
      <footer className="relative z-10 py-4 text-center text-xs font-semibold text-slate-700/80 drop-shadow-xs">
        © 2026 EcoReward TN • Smart Waste Management & Clean Energy Initiative
      </footer>

    </div>
  );
};

export default Signup;
