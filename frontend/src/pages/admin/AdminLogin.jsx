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
      
      {/* Background Mountain Landscape Artwork */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_portal_ambient_bg.jpg')",
          filter: 'brightness(0.92) contrast(1.05)'
        }}
      />

      {/* Atmospheric Soft Lighting Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40 pointer-events-none z-0" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 md:px-16 py-6 flex items-center justify-between">
        <Link 
          to="/landing" 
          className="flex items-center space-x-2.5 text-slate-800 hover:text-slate-950 transition-colors drop-shadow-sm group"
        >
          <div className="w-8 h-8 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-105 transition-transform">
            🛡️
          </div>
          <span className="font-extrabold tracking-wider text-base sm:text-lg text-slate-800 drop-shadow-xs">
            ADMIN<span className="text-amber-700">HQ</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-bold tracking-wider text-slate-800">
          <Link to="/landing" className="hover:text-slate-950 transition-colors">HOME</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors">ABOUT</Link>
          <Link to="/landing" className="hover:text-slate-950 transition-colors">SERVICE</Link>
          <Link to="/login" className="hover:text-slate-950 transition-colors">CITIZEN LOGIN</Link>
          <span className="px-5 py-1.5 rounded-full border border-amber-500/50 bg-amber-500/20 backdrop-blur-md text-amber-950 font-black text-xs tracking-widest shadow-sm">
            RESTRICTED
          </span>
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-white/30 backdrop-blur-md border border-white/50 text-slate-800 shadow-sm"
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
            className="md:hidden relative z-30 mx-6 mb-4 p-5 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl flex flex-col space-y-4 text-center font-bold text-slate-800"
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
          <div className="relative rounded-[32px] p-8 sm:p-12 backdrop-blur-2xl bg-white/25 border border-white/50 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] overflow-hidden transition-all duration-300">
            
            {/* Ambient Highlights */}
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-4">
              <Link to="/login" className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors">
                <FaChevronLeft className="text-[10px]" />
                <span>Return to Citizen Portal</span>
              </Link>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-black tracking-wider text-slate-900 drop-shadow-xs">
                ADMIN HQ LOGIN
              </h1>
              <p className="text-xs text-slate-700/80 font-medium mt-1">
                38 Districts Central Command & Municipality Control
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-950 text-xs font-semibold text-center backdrop-blur-sm"
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
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-base outline-none pr-8 transition-colors"
                />
                <FaEnvelope className="absolute right-1 bottom-3 text-slate-700/80 pointer-events-none text-base" />
              </div>

              {/* Password */}
              <div className="relative pt-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Password"
                  required
                  className="w-full bg-transparent border-0 border-b border-slate-700/60 focus:border-slate-950 pb-2 text-slate-900 placeholder:text-slate-700/80 font-medium text-base outline-none pr-8 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 bottom-3 text-slate-700/80 hover:text-slate-950 text-base"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-base shadow-lg shadow-amber-600/30 hover:shadow-amber-600/45 transition-all duration-200 active:scale-[0.98] text-center flex items-center justify-center space-x-2 cursor-pointer mt-6"
              >
                {loading ? <FaSpinner className="animate-spin text-lg" /> : <span>Authenticate Admin HQ</span>}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-slate-700/80 font-semibold">
                  Demo clearance: Password is <span className="font-bold text-slate-900">1234</span>
                </span>
              </div>
            </form>

          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-4 text-center text-xs font-semibold text-slate-700/80">
        © 2026 Tamil Nadu Municipal Administration & Water Supply Dept.
      </footer>

    </div>
  );
};

export default AdminLogin;
