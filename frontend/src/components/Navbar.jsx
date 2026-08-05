import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaSun, FaMoon, FaBars, FaTimes, FaCoins, FaSignOutAlt, 
  FaSearch, FaBell, FaCogs, FaUserCircle, FaLeaf 
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'driver') return '/driver';
    return '/dashboard';
  };

  const getSettingsLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/settings';
    if (user.role === 'driver') return '/driver';
    return '/profile';
  };

  // Determine if current page is the public Landing page
  const isLandingPage = location.pathname === '/';

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link 
            to={user ? getDashboardLink() : '/'} 
            className="flex items-center space-x-2 flex-shrink-0" 
            onClick={() => setIsOpen(false)}
          >
            <img 
              src="/app-logo.png" 
              alt="EcoReward Logo" 
              className="h-8 w-8 rounded-xl object-cover shadow-sm ring-1 ring-emerald-500/30 hover:scale-105 transition-transform" 
            />
            <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
              EcoReward
            </span>
          </Link>

          {/* LANDING PAGE NAVIGATION */}
          {isLandingPage ? (
            <>
              <div className="hidden md:flex items-center space-x-6 text-xs font-extrabold">
                <Link to="/" className="text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors">Home</Link>
                <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">About</a>
                <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">Features</a>
                <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">How It Works</a>
                <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">Contact</a>
              </div>

              <div className="hidden md:flex items-center space-x-3">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {darkMode ? <FaSun className="h-4 w-4 text-amber-400" /> : <FaMoon className="h-4 w-4" />}
                </button>

                {user ? (
                  <Link 
                    to={getDashboardLink()} 
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow transition-all"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-extrabold">
                    <Link to="/login" className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors">
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            
              {/* Header Right Action Controls */}
              <div className="flex items-center space-x-1.5 sm:space-x-2.5 ml-auto">
                
                {/* Language Switcher Selector */}
                <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => {
                      const nextLang = lang === 'en' ? 'ta' : lang === 'ta' ? 'hi' : 'en';
                      setLang(nextLang);
                      const labels = { en: 'English', ta: 'தமிழ்', hi: 'हिंदी' };
                      addToast(`🌐 Language switched to ${labels[nextLang]}!`, 'info', 'Language Updated');
                    }}
                    className="px-2 py-1 flex items-center space-x-1 hover:text-emerald-500 transition-colors text-[11px]"
                    title="Switch Language (English / தமிழ் / हिंदी)"
                  >
                    <FaGlobe className="text-emerald-500 text-xs" />
                    <span className="font-black uppercase">{lang}</span>
                  </button>
                </div>

                {/* Notifications Bell */}
                {user && (
                  <button 
                    onClick={() => addToast('You have 3 unread pickup notifications', 'info', 'Notifications')}
                    className="p-2 sm:p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 rounded-xl text-xs relative transition-colors"
                    title="Notifications"
                  >
                    <FaBell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                  </button>
                )}

                {/* Dark Mode Toggle */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 sm:p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-400 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <FaSun className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" /> : <FaMoon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                </button>

                {/* User Profile Avatar & Name */}
                {user && (
                  <Link 
                    to={getSettingsLink()}
                    className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={getAvatarUrl(user, user?.name)} 
                      onError={(e) => handleAvatarError(e, user?.name)}
                      alt="User Avatar" 
                      className="h-7 w-7 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs hidden md:inline truncate max-w-[90px]">{user?.name || 'Driver'}</span>
                  </Link>
                )}

                {/* Desktop Logout Button */}
                {user && (
                  <button 
                    onClick={handleLogout}
                    className="hidden sm:flex p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors border border-rose-200/50 dark:border-rose-800/50"
                    title="Logout"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                  </button>
                )}

                {/* Mobile Side Menu Hamburger Drawer Toggle */}
                <button
                  onClick={() => {
                    if (user) {
                      window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
                    } else {
                      setIsOpen(!isOpen);
                    }
                  }}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                  aria-label="Open Menu"
                >
                  <FaBars className="h-4 w-4" />
                </button>

              </div>
            </div>
          )}

        </div>
      </nav>

      {/* Floating 24/7 EcoAI Virtual Assistant Widget */}
      <EcoAIVirtualAssistant />
    </>
  );
};

export default Navbar;
