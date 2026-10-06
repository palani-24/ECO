import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useDistrict } from '../context/DistrictContext';
import MobileQRScannerModal from './MobileQRScannerModal';
import DesktopCommandPalette from './DesktopCommandPalette';
import { triggerHaptic, requestPushPermission } from '../utils/mobileNative';
import { 
  FaRecycle, FaSun, FaMoon, FaBars, FaTimes, FaCoins, FaSignOutAlt, 
  FaSearch, FaBell, FaCogs, FaUserCircle, FaLeaf, FaGlobe, FaQrcode, FaArrowRight,
  FaMapMarkerAlt, FaCalendarAlt, FaClipboardList, FaStore, FaTrophy, FaBuilding, 
  FaExclamationTriangle, FaTruck, FaChartLine, FaUser, FaComments
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket() || {};
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
  const { currentDistrict, openDistrictModal } = useDistrict() || {};
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Default to clean White Mode
    return false;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

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

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, location.search]);

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
    if (user.role === 'driver') return '/driver/settings';
    if (user.role === 'municipality') return '/profile';
    return '/profile';
  };

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Dashboard', icon: FaChartLine },
        { path: '/admin/users', label: 'Users', icon: FaUser },
        { path: '/admin/drivers', label: 'Drivers', icon: FaTruck },
        { path: '/admin/pickups', label: 'Pickups', icon: FaClipboardList },
        { path: '/admin/coupons', label: 'Coupons', icon: FaCoins },
        { path: '/admin/support', label: 'Support Desk', icon: FaComments },
        { path: '/admin/settings', label: 'Settings', icon: FaCogs },
      ];
    }
    if (user.role === 'municipality') {
      return [
        { path: '/municipality/dashboard', label: 'Command Center', icon: FaChartLine },
        { path: '/municipality/heatmap', label: 'GIS Heatmap', icon: FaMapMarkerAlt },
        { path: '/municipality/grievances', label: 'Grievances', icon: FaExclamationTriangle },
        { path: '/esg-portal', label: 'ESG Portal', icon: FaBuilding },
        { path: '/leaderboard', label: 'Ward Leaderboard', icon: FaTrophy },
        { path: '/municipality/support', label: 'Support Hub', icon: FaComments },
        { path: '/profile', label: 'Officer Profile', icon: FaUser },
      ];
    }
    if (user.role === 'driver') {
      return [
        { path: '/driver', label: 'Cockpit', icon: FaChartLine },
        { path: '/driver/pickups', label: 'Pickups', icon: FaTruck },
        { path: '/driver/gate-pass', label: 'Gate Pass', icon: FaQrcode },
        { path: '/driver/battery-telematics', label: 'EV Telematics', icon: FaLeaf },
        { path: '/driver/history', label: 'History', icon: FaClipboardList },
        { path: '/driver/earnings', label: 'Earnings', icon: FaCoins },
        { path: '/driver/support', label: 'SOS Hub', icon: FaComments },
        { path: '/driver/profile', label: 'Profile', icon: FaUser },
      ];
    }
    // Citizen
    return [
      { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
      { path: '/schedule-pickup', label: 'Book Pickup', icon: FaCalendarAlt },
      { path: '/my-pickups', label: 'My Pickups', icon: FaClipboardList },
      { path: '/redeem', label: 'Wallet & UPI', icon: FaCoins },
      { path: '/store', label: 'Eco-Store', icon: FaStore },
      { path: '/report-dump', label: 'Report Dump', icon: FaExclamationTriangle },
      { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
      { path: '/esg-portal', label: 'ESG Portal', icon: FaBuilding },
      { path: '/support', label: 'Helpdesk', icon: FaComments },
      { path: '/profile', label: 'Profile', icon: FaUser },
    ];
  };

  // Determine if current page is the public Landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border-b border-white/60 dark:border-white/10 shadow-sm shadow-emerald-950/5 transition-colors duration-300">
        <div className="w-full px-3 sm:px-6 lg:px-8">
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
              <div className="hidden sm:flex flex-col border-l border-slate-300 dark:border-slate-700/60 pl-2.5 ml-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 leading-none">EcoReward</span>
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
                  {/* Global Command Palette Trigger (Ctrl + K) */}
                  <button
                    type="button"
                    onClick={() => setShowCommandPalette(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:hover:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer transition shadow-xs"
                    title="Search Districts, Actions & Portals (Ctrl + K)"
                  >
                    <FaSearch className="text-emerald-500 text-xs" />
                    <span className="text-[11px]">Search</span>
                    <span className="text-[10px] font-mono font-bold bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                      Ctrl K
                    </span>
                  </button>

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
              <div className="flex-1 flex items-center justify-between ml-3 sm:ml-6 min-w-0">
                
                {/* Desktop Search Bar (Rounded Pill matching screenshot) */}
                <div 
                  onClick={() => setShowCommandPalette(true)}
                  className="hidden sm:relative sm:block w-56 md:w-72 lg:w-80 cursor-pointer group"
                >
                  <FaSearch className="absolute left-3.5 top-2.5 text-slate-400 group-hover:text-emerald-500 text-xs transition-colors" />
                  <input
                    type="text"
                    readOnly
                    onClick={() => setShowCommandPalette(true)}
                    placeholder="Search anything... (Ctrl + K)"
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-100/90 hover:bg-slate-200/60 dark:bg-slate-800 dark:hover:bg-slate-700/60 rounded-full text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all border border-slate-200/80 dark:border-slate-700 shadow-2xs cursor-pointer"
                  />
                </div>

                {/* Header Right Action Controls */}
                <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
                  
                  {/* Tamil Nadu District Selector Pill Button */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20);
                      if (openDistrictModal) openDistrictModal();
                    }}
                    className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-full border border-slate-200/90 dark:border-slate-700 text-xs font-bold cursor-pointer active:scale-95 transition shadow-2xs"
                    title="Select Location (38 Districts)"
                  >
                    <FaMapMarkerAlt className="text-slate-800 dark:text-emerald-400 text-xs shrink-0" />
                    <span className="truncate">{currentDistrict?.name || 'Coimbatore'}</span>
                    <span className="text-[10px] text-slate-500">⌵</span>
                  </button>

                  {/* QR Scan Button (Green Soft Pill) */}
                  <button
                    onClick={() => {
                      triggerHaptic(40);
                      setShowQRScanner(true);
                    }}
                    className="px-3 py-1.5 bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] rounded-xl text-xs font-bold border border-[#a7f3d0] flex items-center space-x-1.5 transition-all shadow-2xs cursor-pointer"
                    title="Scan QR Code"
                  >
                    <FaQrcode className="h-3.5 w-3.5 text-[#059669]" />
                    <span className="hidden sm:inline font-black">QR Scan</span>
                  </button>

                  {/* Notifications Bell with Red Badge "1" */}
                  {user && (
                    <button 
                      onClick={() => {
                        triggerHaptic(30);
                        requestPushPermission(addToast);
                      }}
                      className="p-2 bg-slate-100/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 rounded-full text-xs relative transition-colors cursor-pointer shadow-2xs"
                      title="Notifications"
                    >
                      <FaBell className="h-3.5 w-3.5 text-slate-700 dark:text-slate-200" />
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                        1
                      </span>
                    </button>
                  )}

                  {/* Light / Dark Mode Toggle Pill */}
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-1 rounded-full bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-2xs flex items-center space-x-1 text-xs transition-all cursor-pointer"
                    aria-label="Toggle Theme"
                    title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
                  >
                    <div className="flex items-center space-x-1 px-1.5 py-0.5">
                      <span className="text-[11px] flex items-center gap-1 font-bold bg-[#fefce8] text-[#854d0e] px-2 py-0.5 rounded-full border border-[#fef08a] shadow-2xs">
                        <FaSun className="h-2.5 w-2.5 text-amber-500" />
                        <span>Light</span>
                      </span>
                      <span className="p-1 rounded-full text-slate-400">
                        <FaMoon className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </button>

                  {/* User Profile Avatar & Name with Caret */}
                  {user && (
                    <button 
                      type="button"
                      onClick={() => setIsOpen(prev => !prev)}
                      className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity cursor-pointer"
                      title="Toggle Portal Navigation Menu"
                    >
                      <div className="relative">
                        <img 
                          src={getAvatarUrl(user, user?.name)} 
                          onError={(e) => handleAvatarError(e, user?.name)}
                          alt="User Avatar" 
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/50 shadow-xs"
                        />
                        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
                      </div>
                      <div className="hidden lg:flex flex-col text-left">
                        <span className="font-black text-slate-900 dark:text-white text-xs leading-none">
                          {user?.name?.replace(/\s*\([^)]*\)/g, '') || user?.name || 'Palani'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold leading-none mt-0.5 flex items-center gap-0.5">
                          <span className="capitalize">{user.role || 'Citizen'}</span>
                          <span className="text-[9px]">⌵</span>
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Menu Hamburger Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(20);
                      setIsOpen(prev => !prev);
                      window.dispatchEvent(new CustomEvent('toggle-mobile-citizen-drawer'));
                      window.dispatchEvent(new CustomEvent('toggle-mobile-driver-drawer'));
                      window.dispatchEvent(new CustomEvent('toggle-mobile-admin-drawer'));
                      window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
                    }}
                    className={`p-2 rounded-xl text-white transition-all shadow-sm cursor-pointer active:scale-95 ${
                      isOpen ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                    aria-label="Toggle Portal Menu List"
                    title="Menu List"
                  >
                    {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
                  </button>

                </div>
              </div>
            )}

          </div>

          {/* AUTHENTICATED PORTAL DROP-DOWN / SLIDE-DOWN DRAWER MENU */}
          {!isLandingPage && user && isOpen && (
            <div className="py-4 px-3 sm:px-6 border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-[#071518]/98 backdrop-blur-xl shadow-2xl animate-fadeIn">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* User Info Strip */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3 shrink-0 md:w-72 shadow-xs">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={getAvatarUrl(user, user?.name)} 
                      onError={(e) => handleAvatarError(e, user?.name)}
                      alt="Avatar" 
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.name || 'Eco Member'}
                      </h4>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold capitalize block">
                        {user.role} Portal
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-black rounded-lg border border-emerald-500/30 shrink-0">
                    {user.points || 0} pts
                  </span>
                </div>

                {/* Grid of Navigation Links */}
                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {getNavLinks().map((link, idx) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={idx}
                        to={link.path}
                        onClick={() => setIsOpen(false)}
                        className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'
                        }`}
                      >
                        <Icon className={`text-sm shrink-0 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        <span className="truncate">{link.label}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Logout Button */}
                <div className="shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={handleLogout}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 font-black text-xs border border-rose-300 dark:border-rose-800 flex items-center justify-center space-x-2 cursor-pointer active:scale-95 transition"
                  >
                    <FaSignOutAlt className="text-xs" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

      {/* Desktop Command Palette (Ctrl + K) */}
      <DesktopCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />
    </>
  );
};

export default Navbar;
