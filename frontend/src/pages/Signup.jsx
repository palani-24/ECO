import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TAMIL_NADU_DISTRICTS } from '../context/DistrictContext';
import { 
  FaUser, FaEnvelope, FaPhoneAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaTruck, FaBars, FaTimes,
  FaMapMarkerAlt, FaLock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// In Registration: Citizen & Driver ONLY as strictly requested!
const REGISTRATION_ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    icon: FaUser,
    badge: 'Household & Community Recycler',
    desc: 'Doorstep scrap pickup, smart scale weighing & instant cash'
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: FaTruck,
    badge: 'Green EV Fleet Partner',
    desc: 'Route pickups, QR manifests & daily logistics incentives'
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

  // Role Selection (Citizen or Driver ONLY)
  const [selectedRole, setSelectedRole] = useState('user');

  // Input states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [districtId, setDistrictId] = useState('coimbatore');
  const [ward, setWard] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Driver specific
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeDistrict = TAMIL_NADU_DISTRICTS.find(d => d.id === districtId) || TAMIL_NADU_DISTRICTS[0];
  const activeRole = REGISTRATION_ROLES.find(r => r.id === selectedRole) || REGISTRATION_ROLES[0];

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
      ward: ward.trim() || `${activeDistrict.name} Ward 01`,
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
      
      {/* Background Mountain Vector Artwork Matching Reference Design */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/mountain_vector_auth_bg.jpg')",
          filter: 'brightness(1.01)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Reference Design */}
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
          <Link to="/landing#about" className="hover:text-slate-950 transition-colors drop-shadow-xs">ABOUT</Link>
          <Link to="/landing#features" className="hover:text-slate-950 transition-colors drop-shadow-xs">SERVICE</Link>
          <Link to="/landing#contact" className="hover:text-slate-950 transition-colors drop-shadow-xs">CONTACT</Link>
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
            <Link to="/landing#about" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
            <Link to="/landing#features" onClick={() => setMobileMenuOpen(false)}>SERVICE</Link>
            <Link to="/landing#contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
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
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[450px]"
        >
          {/* Frosted Glassmorphism Card Matching Reference Image */}
          <div className="relative rounded-[32px] p-7 sm:p-10 backdrop-blur-2xl bg-white/20 border border-white/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Title: REGISTRATION */}
            <h1 className="relative text-2xl sm:text-3xl font-black tracking-wider text-slate-900 text-center mb-5 drop-shadow-xs z-10">
              REGISTRATION
            </h1>

            {/* Role Selection: Citizen & Driver ONLY (strictly adhering to user request) */}
            <div className="mb-5 relative z-10">
              <div className="flex items-center justify-between p-1 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40">
                {REGISTRATION_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id);
                        setError('');
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        isSelected
                          ? 'bg-white/90 text-slate-900 shadow-sm font-black scale-102'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/20'
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{role.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-center text-slate-700 font-medium mt-1.5">
                Register as <span className="font-bold text-slate-900">{activeRole.name}</span> • {activeRole.badge}
              </p>
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

            {/* Registration Form with minimalist line inputs */}
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              
              {/* Full Name */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaUser className="absolute right-1 bottom-2.5 text-slate-700 text-sm pointer-events-none" />
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
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaPhoneAlt className="absolute right-1 bottom-2.5 text-slate-700 text-sm pointer-events-none" />
              </div>

              {/* Email Address */}
              <div className="relative pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-2.5 text-slate-700 text-sm pointer-events-none" />
              </div>

              {/* Citizen specific: District & Ward */}
              {selectedRole === 'user' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="relative">
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 font-medium text-xs outline-none transition-colors cursor-pointer"
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
                      placeholder="Ward / Area"
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-xs outline-none pr-6 transition-colors"
                    />
                    <FaMapMarkerAlt className="absolute right-1 bottom-2.5 text-slate-700 text-xs pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Driver specific: Vehicle Type & Plate Number */}
              {selectedRole === 'driver' && (
                <div className="space-y-3 pt-1">
                  <div className="relative">
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 font-medium text-xs outline-none transition-colors cursor-pointer"
                    >
                      {VEHICLE_TYPES.map((v, i) => (
                        <option key={i} value={v} className="text-slate-900 bg-white">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="Vehicle Plate (e.g. TN-38-ECO-9945)"
                      required
                      className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-xs outline-none pr-6 uppercase tracking-wider transition-colors"
                    />
                    <FaTruck className="absolute right-1 bottom-2.5 text-slate-700 text-xs pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (min 4 chars)"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bottom-2.5 text-slate-700 hover:text-slate-950 text-sm cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaLock className="absolute right-1 bottom-2.5 text-slate-700 text-sm pointer-events-none" />
              </div>

              {/* Agree to terms */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-400 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-xs text-slate-800 font-medium cursor-pointer">
                  I agree to the terms & conditions
                </label>
              </div>

              {/* Action Button (Frosted Rounded Pill Matching Image 1) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60 border border-white/30 backdrop-blur-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register as {activeRole.name}</span>
                )}
              </button>
            </form>

            {/* Bottom Link: Already have an Account? Login */}
            <div className="text-center pt-5 mt-2 relative z-10 flex items-center justify-center space-x-1.5 text-xs text-slate-800 font-medium">
              <span>Already have an Account?</span>
              <Link 
                to="/login" 
                className="font-bold text-slate-900 hover:underline"
              >
                Login
              </Link>
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

export default Signup;
