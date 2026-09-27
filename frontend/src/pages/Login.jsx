import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaPhoneAlt, FaLeaf, FaTruck, FaBuilding, FaCrown,
  FaBars, FaTimes, FaMapMarkerAlt, FaKey
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  {
    id: 'user',
    name: 'Citizen',
    icon: '🧑',
    badge: 'Doorstep Recycling',
    portalDesc: 'Doorstep scrap pickup & instant UPI cash rewards',
    destination: '/dashboard',
    defaultPhone: '9876543211',
    defaultEmail: 'user@ecoreward.com'
  },
  {
    id: 'driver',
    name: 'Driver',
    icon: '🚚',
    badge: 'EV Fleet Partner',
    portalDesc: 'Route pickups, QR weighing & daily logistics earnings',
    destination: '/driver',
    defaultPhone: '9876543212',
    defaultEmail: 'driver@ecoreward.com'
  },
  {
    id: 'municipality',
    name: 'Municipal',
    icon: '🏛️',
    badge: 'Ward SWM Admin',
    portalDesc: 'Zonal waste command, GIS heatmap & grievance hub',
    destination: '/municipality/dashboard',
    defaultPhone: '9876543213',
    defaultEmail: 'municipality@ecoreward.com'
  },
  {
    id: 'admin',
    name: 'Admin HQ',
    icon: '👑',
    badge: '38 Districts HQ',
    portalDesc: 'Centralized state recycling analytics & ESG control',
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

  // Input states matching Image 1
  const [emailOrPhone, setEmailOrPhone] = useState('user@ecoreward.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

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
    setEmailOrPhone(target.defaultEmail);
  };

  // Handle Login Submission
  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!emailOrPhone.trim()) {
      setError('Please enter your email or mobile number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(emailOrPhone.trim(), password || '1234', selectedRole);
      setLoading(false);

      if (res.success) {
        addToast(`Welcome back, ${res.user.name || activeRole.name}!`, 'success', 'Login Successful');
        const role = res.user.role || selectedRole;
        if (role === 'admin') navigate('/admin');
        else if (role === 'driver') navigate('/driver');
        else if (role === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid credentials. Please verify your email or password.');
      }
    } catch (err) {
      setLoading(false);
      setError('Authentication failed. Please verify credentials and try again.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* Background Mountain Vector Artwork Matching Image 1 Exactly */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/mountain_vector_auth_bg.jpg')",
          filter: 'brightness(1.01)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/10 via-transparent to-slate-950/20 pointer-events-none z-0" />

      {/* Top Navigation Bar Matching Image 1 */}
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

        {/* Desktop Nav Items Matching Image 1 */}
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
          className="w-full max-w-[420px]"
        >
          {/* Frosted Glassmorphism Card Matching Reference Image 1 Exactly */}
          <div className="relative rounded-[32px] p-7 sm:p-10 backdrop-blur-2xl bg-white/20 border border-white/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Title Matching Image 1: LOGIN in bold uppercase */}
            <h1 className="relative text-2xl sm:text-3xl font-black tracking-wider text-slate-900 text-center mb-6 drop-shadow-xs z-10">
              LOGIN
            </h1>

            {/* Role Switcher Pills (Citizen, Driver, Municipal, Admin) */}
            <div className="mb-6 relative z-10">
              <div className="flex items-center justify-between p-1 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                        isSelected
                          ? 'bg-white/90 text-slate-900 shadow-sm font-black scale-102'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-white/20'
                      }`}
                    >
                      <span className="text-xs leading-none">{role.icon}</span>
                      <span className="truncate">{role.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-center text-slate-700 font-medium mt-1.5">
                Signing into <span className="font-bold text-slate-900">{activeRole.name} Portal</span> • {activeRole.badge}
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

            {/* Login Form with minimalist line inputs matching Image 1 */}
            <form onSubmit={handleLoginSubmit} className="space-y-5 relative z-10">
              
              {/* Email / Mobile Line Input with Envelope Icon on the Right */}
              <div className="relative pt-1">
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700 font-medium text-sm outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-2.5 text-slate-700 text-sm pointer-events-none" />
              </div>

              {/* Password Line Input with Eye Toggle on the Right */}
              <div className="relative pt-1">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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

              {/* Forgot Password Link right below password on the right side (matching Image 1) */}
              <div className="flex justify-end -mt-3">
                <Link 
                  to="/forgot-password"
                  className="text-xs text-slate-700 hover:text-slate-950 transition-colors font-normal"
                >
                  Forgot <span className="font-bold">Password?</span>
                </Link>
              </div>

              {/* Remember Me Checkbox (matching Image 1) */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 border-slate-400 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-800 font-medium cursor-pointer">
                  Remember Me
                </label>
              </div>

              {/* Login Button (Frosted Rounded Pill Matching Image 1) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-500/80 via-blue-600/80 to-indigo-600/80 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all active:scale-98 cursor-pointer disabled:opacity-60 border border-white/30 backdrop-blur-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            {/* Bottom Link Matching Image 1: Don't have an Account? Register */}
            <div className="text-center pt-6 mt-2 relative z-10 flex items-center justify-center space-x-1.5 text-xs text-slate-800 font-medium">
              <span>Don't have an Account?</span>
              <Link 
                to="/signup" 
                className="font-bold text-slate-900 hover:underline"
              >
                Register
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

export default Login;
