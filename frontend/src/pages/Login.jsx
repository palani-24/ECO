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
      
      {/* Background Seedling & Nature Artwork matching user image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_sprout_auth_bg.jpg')",
          filter: 'brightness(0.96) contrast(1.02)'
        }}
      />

      {/* Atmospheric Soft Lighting / Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link 
          to="/landing" 
          className="flex items-center space-x-2.5 text-white hover:text-emerald-200 transition-colors drop-shadow-md group"
        >
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-emerald-300 shadow-sm group-hover:scale-105 transition-transform text-lg">
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
            className="px-6 py-1.5 rounded-full border border-white/40 bg-white/20 backdrop-blur-md text-white font-bold text-sm tracking-wider shadow-sm hover:bg-white/30 transition-all"
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
          {/* Frosted Glassmorphism Card Matching Reference Image Exactly */}
          <div className="relative rounded-[32px] p-7 sm:p-9 backdrop-blur-xl bg-white/15 border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights inside Card */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-white/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            {/* Title Matching Reference: Login in bold white font */}
            <h1 className="relative text-3xl sm:text-4xl font-extrabold tracking-normal text-white text-center mb-6 drop-shadow-md z-10">
              Login
            </h1>

            {/* Role Switcher Pills (Citizen, Driver, Municipal, Admin) */}
            <div className="mb-6 relative z-10">
              <div className="flex items-center justify-between p-1 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20">
                {ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleChange(role.id)}
                      className={`flex-1 py-1.5 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow-md font-black scale-102'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs leading-none">{role.icon}</span>
                      <span className="truncate">{role.name}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-center text-white/80 font-medium mt-2 drop-shadow-xs">
                Signing into <span className="font-bold text-white">{activeRole.name} Portal</span> • {activeRole.badge}
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

            {/* Login Form with Rounded Pill Inputs Matching Reference Image */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 relative z-10">
              
              {/* Username / Email Pill Input */}
              <div className="relative">
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Username"
                  required
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/35 focus:border-white rounded-full py-3 px-5 text-white placeholder:text-white/70 font-medium text-sm outline-none transition-all backdrop-blur-md shadow-inner"
                />
              </div>

              {/* Password Pill Input with Eye Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/35 focus:border-white rounded-full py-3 px-5 pr-12 text-white placeholder:text-white/70 font-medium text-sm outline-none transition-all backdrop-blur-md shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-sm cursor-pointer transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Remember Me & Forgot Password Row Matching Reference Image */}
              <div className="flex items-center justify-between text-xs text-white/90 px-1 pt-0.5">
                <label htmlFor="rememberMe" className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-white/40 bg-white/20 text-emerald-600 focus:ring-emerald-400 h-3.5 w-3.5 cursor-pointer accent-emerald-500"
                  />
                  <span className="font-normal text-white/90">remember me</span>
                </label>
                <Link 
                  to="/forgot-password"
                  className="text-white/80 hover:text-white transition-colors hover:underline text-xs"
                >
                  Forgot password
                </Link>
              </div>

              {/* Login Button (Solid White Pill with Black Text Matching Reference Image) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-white hover:bg-white/90 active:scale-98 text-slate-900 font-bold text-sm tracking-wide shadow-xl shadow-black/25 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin text-slate-900 text-sm" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <span>Login</span>
                  )}
                </button>
              </div>
            </form>

            {/* Bottom Link Matching Reference Image: Don't have an account? Register */}
            <div className="text-center pt-5 relative z-10 flex items-center justify-center space-x-1.5 text-xs text-white/90">
              <span>Don't have an account?</span>
              <Link 
                to="/signup" 
                className="font-bold text-white hover:underline drop-shadow-sm"
              >
                Register
              </Link>
            </div>

          </div>
        </motion.div>
      </main>

      {/* Modern Compact Footer */}
      <footer className="relative z-20 w-full px-6 py-4 text-center text-xs font-semibold text-white/80 drop-shadow-sm">
        <p>© 2026 EcoReward Platform • Tamil Nadu Smart Waste & EV Recycling Grid</p>
      </footer>

    </div>
  );
};

export default Login;
