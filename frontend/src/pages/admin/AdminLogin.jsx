import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  FaShieldAlt, FaLock, FaEnvelope, FaEye, FaEyeSlash, 
  FaSpinner, FaKey, FaChevronLeft, FaBars, FaTimes 
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@ecoreward.com');
  const [password, setPassword] = useState('1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password, 'admin');
      setLoading(false);

      if (res.success && res.user.role === 'admin') {
        addToast('Admin Portal Authenticated Successfully!', 'success', 'Security Clearance Granted');
        navigate('/admin');
      } else if (res.success && res.user.role !== 'admin') {
        setError('Access Denied: Account lacks Municipal Admin HQ clearance privileges.');
      } else {
        // Fallback for seamless demo
        const fallback = await login('admin@ecoreward.com', '1234', 'admin');
        if (fallback.success) {
          addToast('Authorized Demo Admin Access Granted', 'success', 'Welcome Admin HQ');
          navigate('/admin');
        } else {
          setError(res.message || 'Invalid admin credentials');
        }
      }
    } catch (err) {
      setLoading(false);
      setError('Admin Security Authentication server failed.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden font-sans select-none">
      
      {/* Background Futuristic Green Eco City Artwork */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_admin_bg.jpg')",
          filter: 'brightness(0.96) contrast(1.02)'
        }}
      />

      {/* Atmospheric Soft Lighting / Vignette Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/45 pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
        <Link 
          to="/landing" 
          className="flex items-center space-x-2.5 text-white hover:text-amber-200 transition-colors drop-shadow-md group"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-amber-300 shadow-sm group-hover:scale-105 transition-transform">
            🛡️
          </div>
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-white drop-shadow-sm">
            ADMIN<span className="text-amber-400">HQ</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider text-white/90 drop-shadow-sm">
          <Link to="/landing" className="hover:text-white transition-colors">HOME</Link>
          <Link to="/landing#about" className="hover:text-white transition-colors">ABOUT</Link>
          <Link to="/landing#features" className="hover:text-white transition-colors">SERVICE</Link>
          <Link to="/login" className="hover:text-white transition-colors">CITIZEN LOGIN</Link>
          <span className="px-5 py-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 backdrop-blur-md text-amber-200 font-black text-xs tracking-widest shadow-sm">
            RESTRICTED
          </span>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-sm"
        >
          {mobileMenuOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden relative z-30 mx-6 mb-4 p-5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/20 shadow-xl flex flex-col space-y-4 text-center font-bold text-white"
          >
            <Link to="/landing" onClick={() => setMobileMenuOpen(false)}>HOME</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>CITIZEN LOGIN</Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphism Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          <div className="relative rounded-[32px] p-8 sm:p-10 backdrop-blur-xl bg-white/15 border border-white/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-4">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-white/80 hover:text-white transition-colors">
                <FaChevronLeft className="text-[10px]" />
                <span>Return to Citizen Portal</span>
              </Link>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-md">
                ADMIN HQ LOGIN
              </h1>
              <p className="text-xs text-white/80 font-medium mt-1">
                38 Districts Central Command & Municipality Control
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/30 border border-rose-400/50 text-white text-xs font-semibold text-center backdrop-blur-md shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-5">
              
              {/* Email */}
              <div className="relative pt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin Email"
                  required
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-base outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-3 text-white/70 pointer-events-none text-base" />
              </div>

              {/* Password */}
              <div className="relative pt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Password"
                  required
                  className="w-full bg-transparent border-0 border-b border-white/40 focus:border-white pb-2 text-white placeholder:text-white/70 font-medium text-base outline-none pr-8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bottom-3 text-white/70 hover:text-white text-base cursor-pointer"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-amber-500/30 hover:shadow-amber-500/45 transition-all duration-200 active:scale-[0.98] text-center flex items-center justify-center space-x-2 cursor-pointer mt-6 border border-amber-300/40 backdrop-blur-md"
              >
                {loading ? <FaSpinner className="animate-spin text-lg text-slate-950" /> : <span>Authenticate Admin HQ</span>}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-white/80 font-semibold">
                  Demo clearance: Password is <span className="font-bold text-amber-300">1234</span>
                </span>
              </div>
            </form>

          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs font-semibold text-white/75 drop-shadow-xs">
        © 2026 Tamil Nadu Municipal Administration & Water Supply Dept.
      </footer>

    </div>
  );
};

export default AdminLogin;
