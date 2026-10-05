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
      
      {/* Background Hands Planting Seedling Artwork */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_signup_bg.jpg')",
          filter: 'brightness(0.96) contrast(1.02)'
        }}
      />

      {/* Atmospheric Soft Lighting / Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Reference Design */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link 
          to="/landing" 
          className="flex items-center space-x-2.5 text-white hover:text-emerald-200 transition-colors drop-shadow-md group"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-emerald-300 shadow-sm group-hover:scale-105 transition-transform">
            🌱
          </div>
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-white drop-shadow-sm">
            ECO<span className="text-emerald-400">REWARD</span>
          </span>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider text-white/90 drop-shadow-sm">
          <Link to="/landing" className="hover:text-white transition-colors">HOME</Link>
          <Link to="/landing#about" className="hover:text-white transition-colors">ABOUT</Link>
          <Link to="/landing#features" className="hover:text-white transition-colors">SERVICE</Link>
          <Link to="/landing#contact" className="hover:text-white transition-colors">CONTACT</Link>
          <Link
            to="/login"
            className="px-6 py-1.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-md text-white font-bold text-sm tracking-wider shadow-sm hover:bg-white/30 hover:shadow transition-all"
          >
            LOGIN
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-sm"
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
            className="md:hidden relative z-30 mx-6 mb-4 p-5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col space-y-4 text-center font-bold text-white"
          >
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link to="/landing#about" onClick={() => setMobileMenuOpen(false)}>ABOUT</Link>
            <Link to="/landing#features" onClick={() => setMobileMenuOpen(false)}>SERVICE</Link>
            <Link to="/landing#contact" onClick={() => setMobileMenuOpen(false)}>CONTACT</Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md"
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
          {/* Frosted Glassmorphism Card */}
          <div className="relative rounded-[32px] p-7 sm:p-9 backdrop-blur-xl bg-white/15 border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Title: REGISTRATION */}
            <h1 className="relative text-2xl sm:text-3xl font-black tracking-wider text-white text-center mb-5 drop-shadow-md z-10">
              REGISTRATION
            </h1>

            {/* Role Selection: Citizen & Driver ONLY (strictly adhering to user request) */}
            <div className="mb-5 relative z-10">
              <div className="flex items-center justify-between p-1 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20">
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
                          ? 'bg-white text-slate-900 shadow-md font-black scale-102'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="text-xs" />
                      <span>{role.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-center text-white/80 font-medium mt-2 drop-shadow-xs">
                Register as <span className="font-bold text-white">{activeRole.name}</span> • {activeRole.badge}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/30 border border-rose-400/50 text-white text-xs font-semibold text-center backdrop-blur-md z-10 shadow-sm"
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
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaUser className="absolute right-1 bottom-2.5 text-white/70 text-sm pointer-events-none" />
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
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaPhoneAlt className="absolute right-1 bottom-2.5 text-white/70 text-sm pointer-events-none" />
              </div>

              {/* Email Address */}
              <div className="relative pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-2.5 text-white/70 text-sm pointer-events-none" />
              </div>

              {/* Citizen specific: District & Ward */}
              {selectedRole === 'user' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="relative">
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white font-medium text-xs outline-none transition-colors cursor-pointer"
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
                      className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-xs outline-none pr-6 transition-colors"
                    />
                    <FaMapMarkerAlt className="absolute right-1 bottom-2.5 text-white/70 text-xs pointer-events-none" />
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
                      className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white font-medium text-xs outline-none transition-colors cursor-pointer"
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
                      className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-xs outline-none pr-6 uppercase tracking-wider transition-colors"
                    />
                    <FaTruck className="absolute right-1 bottom-2.5 text-white/70 text-xs pointer-events-none" />
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
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bottom-2.5 text-white/70 hover:text-white text-sm cursor-pointer"
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
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaLock className="absolute right-1 bottom-2.5 text-white/70 text-sm pointer-events-none" />
              </div>

              {/* Agree to terms */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-white/40 bg-white/20 text-emerald-500 focus:ring-emerald-400 h-4 w-4 cursor-pointer accent-emerald-500"
                />
                <label htmlFor="agreeTerms" className="text-xs text-white/90 font-medium cursor-pointer">
                  I agree to the terms & conditions
                </label>
              </div>

              {/* Action Button (Frosted Rounded Pill) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-emerald-600/90 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60 border border-white/30 backdrop-blur-md"
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
            <div className="text-center pt-5 mt-2 relative z-10 flex items-center justify-center space-x-1.5 text-xs text-white/90 font-medium">
              <span>Already have an Account?</span>
              <Link 
                to="/login" 
                className="font-bold text-white hover:underline drop-shadow-sm ml-1"
              >
                Login
              </Link>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="relative z-20 w-full px-6 py-4 text-center text-xs font-semibold text-white/75 drop-shadow-xs">
        <p>© 2026 EcoReward Platform • Tamil Nadu Smart Waste & EV Recycling Grid</p>
      </footer>

    </div>
  );
};

export default Signup;
