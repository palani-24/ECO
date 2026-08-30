import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import MobileQRScannerModal from './MobileQRScannerModal';
import { triggerHaptic, requestPushPermission } from '../utils/mobileNative';
import { 
  FaRecycle, FaSun, FaMoon, FaBars, FaTimes, FaCoins, FaSignOutAlt, 
  FaSearch, FaBell, FaCogs, FaUserCircle, FaLeaf, FaGlobe, FaQrcode, FaArrowRight
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Default to Light Mode on first visit
    return false;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

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
    if (user.role === 'municipality') return '/municipality/dashboard';
    return '/dashboard';
  };

  const getSettingsLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/settings';
    if (user.role === 'driver') return '/driver';
    if (user.role === 'municipality') return '/municipality/dashboard';
    return '/profile';
  };

  // Determine if current page is the public Landing page
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-[#06121e]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo */}
            <Link 
              to={user ? getDashboardLink() : '/'} 
              className="flex items-center space-x-2.5 flex-shrink-0 group" 
              onClick={() => setIsOpen(false)}
            >
              <img 
                src="/app-logo.png" 
                alt="EcoReward Official Logo" 
                className="h-9 w-auto max-w-[140px] sm:max-w-[160px] object-contain shadow-sm group-hover:scale-105 transition-transform" 
              />
              <div className="hidden xl:flex flex-col border-l border-slate-700/50 pl-2.5 ml-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400 leading-none">EcoReward</span>
                <span className="text-[8px] font-mono text-slate-500 dark:text-slate-400 leading-none mt-0.5">Recycle Today, Reward Tomorrow</span>
              </div>
            </Link>

            {/* LANDING PAGE NAVIGATION */}
            {isLandingPage ? (
              <>
                <div className="hidden md:flex items-center space-x-6 text-xs font-extrabold">
                  <Link to="/" className="text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors">Home</Link>
                  <a href="#about" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">About</a>
                  <a href="#features" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">Features</a>
                  <a href="#how-it-works" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">How It Works</a>
                  <a href="#contact" className="text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors">Contact</a>
                </div>

                <div className="hidden md:flex items-center space-x-3">
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="relative flex items-center p-1 rounded-full bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700/80 transition-all shadow-sm group"
                    title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
                    aria-label="Toggle Theme"
                  >
                    <div className="flex items-center space-x-1.5 px-2 py-0.5">
                      <div className={`p-1 rounded-full transition-all duration-300 ${!darkMode ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-110' : 'text-slate-400 opacity-60'}`}>
                        <FaSun className="h-3 w-3" />
                      </div>
                      <div className={`p-1 rounded-full transition-all duration-300 ${darkMode ? 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-110' : 'text-slate-400 opacity-60'}`}>
                        <FaMoon className="h-3 w-3" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider font-mono pr-1 text-slate-700 dark:text-slate-200">
                        {darkMode ? 'Dark' : 'Light'}
                      </span>
                    </div>
                  </button>

                  {user ? (
                    <Link 
                      to={getDashboardLink()} 
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow transition-all hover:scale-105"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs font-extrabold">
                      <Link to="/login" className="px-3.5 py-1.5 text-slate-800 dark:text-slate-200 hover:text-emerald-600 transition-colors">
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold shadow transition-all hover:scale-105"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>

                {/* Mobile Header Controls */}
                <div className="flex md:hidden items-center space-x-2">
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-400 shadow-sm transition-all"
                    aria-label="Toggle Theme"
                  >
                    {darkMode ? <FaSun className="h-4 w-4 text-amber-400" /> : <FaMoon className="h-4 w-4 text-slate-700" />}
                  </button>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl bg-emerald-600 text-white font-bold"
                    aria-label="Open Navigation Menu"
                  >
                    {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
                  </button>
                </div>
              </>
            ) : (
              
              /* DASHBOARD HEADER LAYOUT */
              <div className="flex-1 flex items-center justify-between ml-2 sm:ml-6 min-w-0">
                
                {/* Desktop Search Bar */}
                <div className="hidden sm:relative sm:block w-44 md:w-60">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-[11px]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search... (Ctrl + K)"
                    className="w-full pl-8 pr-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all border border-transparent dark:border-slate-700"
                  />
                </div>

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

                  {/* Mobile Camera QR Scanner Trigger */}
                  <button
                    onClick={() => {
                      triggerHaptic(40);
                      setShowQRScanner(true);
                    }}
                    className="p-2 sm:px-2.5 sm:py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/30 rounded-xl text-xs font-black border border-emerald-500/30 flex items-center space-x-1 transition-all"
                    title="Scan QR Code"
                  >
                    <FaQrcode className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">QR Scan</span>
                  </button>

                  {/* Notifications Bell */}
                  {user && (
                    <button 
                      onClick={() => {
                        triggerHaptic(30);
                        requestPushPermission(addToast);
                      }}
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
                    className="p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm flex items-center space-x-1.5 text-xs transition-all"
                    aria-label="Toggle Dark Mode"
                    title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  >
                    {darkMode ? <FaSun className="h-3.5 w-3.5 text-amber-400" /> : <FaMoon className="h-3.5 w-3.5 text-slate-700" />}
                    <span className="hidden sm:inline text-[10px] font-mono font-bold">{darkMode ? 'Dark' : 'Light'}</span>
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

          {/* MOBILE LANDING PAGE SLIDE-DOWN DRAWER MENU */}
          {isLandingPage && isOpen && (
            <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 px-2 bg-white dark:bg-[#06121e] animate-fadeIn">
              <div className="flex flex-col space-y-2 text-sm font-extrabold">
                <Link 
                  to="/" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  Home
                </Link>
                <a 
                  href="#about" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  About
                </a>
                <a 
                  href="#features" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Features
                </a>
                <a 
                  href="#how-it-works" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  How It Works
                </a>
                <a 
                  href="#contact" 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  Contact
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center space-x-2"
                >
                  {darkMode ? <FaSun className="text-amber-400 h-4 w-4" /> : <FaMoon className="text-slate-700 h-4 w-4" />}
                  <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                </button>

                {user ? (
                  <Link 
                    to={getDashboardLink()}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 text-white text-center font-bold text-xs"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <Link 
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-2 text-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-2 text-center rounded-xl bg-emerald-600 text-white font-bold text-xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Expandable Mobile Search Bar */}
          {!isLandingPage && showMobileSearch && (
            <div className="sm:hidden px-2 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog, pickups, orders..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-transparent dark:border-slate-700"
                  autoFocus
                />
              </div>
            </div>
          )}

        </div>
      </nav>

      {/* Mobile Camera QR Scanner Modal */}
      <MobileQRScannerModal
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScanSuccess={(data) => {
          addToast(`📷 QR Code Scanned: ${data.code} (${data.location})`, 'success', 'QR Verified');
        }}
      />
    </>
  );
};

export default Navbar;
