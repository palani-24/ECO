import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaSun, FaMoon, FaBars, FaTimes, FaCoins, FaSignOutAlt, 
  FaSearch, FaBell, FaCogs, FaUserCircle, FaLeaf 
} from 'react-icons/fa';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link 
            to={user ? getDashboardLink() : '/'} 
            className="flex items-center space-x-2 flex-shrink-0" 
            onClick={() => setIsOpen(false)}
          >
            <FaRecycle className="h-8 w-8 text-emerald-500 animate-spin-slow" style={{ animationDuration: '8s' }} />
            <span className="font-black text-xl tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-300">
              EcoReward
            </span>
          </Link>

          {/* LANDING PAGE NAVIGATION (Only visible on Home/Landing page '/') */}
          {isLandingPage ? (
            <>
              {/* Desktop Menu Items */}
              <div className="hidden md:flex items-center space-x-6 text-xs font-extrabold">
                <Link to="/" className="text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors">Home</Link>
                <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">About</a>
                <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">Features</a>
                <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">How It Works</a>
                <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">Contact</a>
              </div>

              {/* Landing Auth Actions */}
              <div className="hidden md:flex items-center space-x-3">
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {darkMode ? <FaSun className="h-4 w-4 text-amber-400" /> : <FaMoon className="h-4 w-4" />}
                </button>

                {user ? (
                  <Link 
                    to={getDashboardLink()} 
                    className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md transition-all"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 text-xs font-extrabold">
                    <Link to="/login" className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors">
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="px-5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold shadow-md transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </>
          ) : (
            
            /* DASHBOARD HEADER LAYOUT (Active for all authenticated dashboard pages) */
            <div className="flex-1 flex items-center justify-between ml-4 sm:ml-8">
              
              {/* Search Bar */}
              <div className="relative w-full max-w-xs hidden sm:block">
                <FaSearch className="absolute left-3.5 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything... (Ctrl + K)"
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all border border-transparent dark:border-slate-700"
                />
              </div>

              {/* Right Side Dashboard Controls */}
              <div className="flex items-center space-x-3 ml-auto">
                
                {/* Live Sync Status Indicator */}
                {user && (
                  <div 
                    className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border ${
                      isConnected 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                    }`}
                    title={isConnected ? 'Connected to Live Socket Stream' : 'Connecting to Live Stream...'}
                  >
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                    <span className="uppercase">{isConnected ? 'Live Sync' : 'Connecting'}</span>
                  </div>
                )}

                {/* Wallet Points Badge */}
                {user && user.role === 'user' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-black">
                    <FaCoins className="h-3.5 w-3.5" />
                    <span>{user.points || 100} pts</span>
                  </div>
                )}

                {/* Notifications Bell */}
                {user && (
                  <button 
                    onClick={() => addToast('You have 3 unread pickup notifications', 'info', 'Notifications')}
                    className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 rounded-2xl text-xs relative transition-colors"
                    title="Notifications"
                  >
                    <FaBell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full animate-ping"></span>
                  </button>
                )}

                {/* Dark Mode Toggle */}
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-400 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <FaSun className="h-4 w-4 text-amber-400" /> : <FaMoon className="h-4 w-4" />}
                </button>

                {/* User Profile Info */}
                {user && (
                  <Link 
                    to={getSettingsLink()}
                    className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800 hover:opacity-90 transition-opacity"
                  >
                    <img 
                      src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`} 
                      alt="User Avatar" 
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/40"
                    />
                    <div className="text-left hidden xl:block">
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate max-w-[100px]">{user.name}</p>
                      <span className="text-[9px] text-emerald-500 font-bold block uppercase tracking-wider">{user.role}</span>
                    </div>
                  </Link>
                )}

                {/* Settings Gear */}
                {user && (
                  <Link
                    to={getSettingsLink()}
                    className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors hidden sm:block"
                    title="Account Settings"
                  >
                    <FaCogs className="h-4 w-4" />
                  </Link>
                )}

                {/* Logout Button */}
                {user && (
                  <button 
                    onClick={handleLogout}
                    className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors border border-rose-200/50 dark:border-rose-800/50"
                    title="Logout"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                  </button>
                )}

              </div>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
            >
              {isOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-all duration-300">
          <div className="px-4 pt-3 pb-5 space-y-2 text-xs font-extrabold">
            {isLandingPage ? (
              <>
                <Link to="/" className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>Home</Link>
                <a href="#about" className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>About</a>
                <a href="#features" className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>Features</a>
                <a href="#how-it-works" className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>How It Works</a>
                <a href="#contact" className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>Contact</a>
              </>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-900 dark:text-white font-black">{user?.name}</span>
                  <span className="text-emerald-500 font-bold">{user?.points || 0} Points</span>
                </div>
                <Link to={getDashboardLink()} className="block py-2 text-emerald-600 dark:text-emerald-400" onClick={() => setIsOpen(false)}>Dashboard Overview</Link>
                <Link to={getSettingsLink()} className="block py-2 text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(false)}>Settings & Profile</Link>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              {user ? (
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-600 text-white rounded-xl text-center font-black"
                >
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" className="py-2.5 text-center bg-slate-100 dark:bg-slate-800 rounded-xl" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/signup" className="py-2.5 text-center bg-emerald-600 text-white rounded-xl" onClick={() => setIsOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
