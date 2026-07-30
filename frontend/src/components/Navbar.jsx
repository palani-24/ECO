import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { FaRecycle, FaSun, FaMoon, FaBars, FaTimes, FaCoins, FaSignOutAlt, FaWifi } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket() || {};
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <nav className="sticky top-0 z-50 glass-panel shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0" onClick={() => setIsOpen(false)}>
            <FaRecycle className="h-8 w-8 text-primary-500 animate-spin-slow" style={{ animationDuration: '8s' }} />
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-emerald-300">
              EcoReward
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">Home</Link>
            <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">About</a>
            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">How It Works</a>
            <a href="#contact" className="text-slate-600 dark:text-slate-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors font-medium">Contact</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Realtime Connection Status Pill */}
            {user && (
              <div 
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${
                  isConnected 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                }`}
                title={isConnected ? 'Connected to Real-Time Data Stream' : 'Connecting to Live Data Stream...'}
              >
                <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`}></span>
                <span className="text-[10px] tracking-wide uppercase">{isConnected ? 'Live Sync' : 'Connecting'}</span>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <FaSun className="h-5 w-5 text-amber-400" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'user' && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                    <FaCoins className="h-4 w-4" />
                    <span>{user.points} pts</span>
                  </div>
                )}
                
                <Link 
                  to={getDashboardLink()} 
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 transition-all text-sm"
                >
                  Dashboard
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-primary-500 dark:hover:text-primary-400 font-semibold transition-colors text-sm">
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 transition-all text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <FaSun className="h-5 w-5 text-amber-400" /> : <FaMoon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none transition-colors"
            >
              {isOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 shadow-lg">
            <Link to="/" className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setIsOpen(false)}>Home</Link>
            <a href="#about" className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setIsOpen(false)}>About</a>
            <a href="#features" className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setIsOpen(false)}>Features</a>
            <a href="#how-it-works" className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setIsOpen(false)}>How It Works</a>
            <a href="#contact" className="block px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50" onClick={() => setIsOpen(false)}>Contact</a>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-2">
              {user ? (
                <div className="space-y-2 px-3">
                  {user.role === 'user' && (
                    <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold mb-3">
                      <FaCoins className="h-4 w-4" />
                      <span>{user.points} points</span>
                    </div>
                  )}
                  <Link 
                    to={getDashboardLink()} 
                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-primary-600 text-white font-semibold shadow-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900/30"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3">
                  <Link 
                    to="/login" 
                    className="text-center py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/signup" 
                    className="text-center py-2.5 rounded-xl bg-primary-600 text-white font-semibold"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
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
