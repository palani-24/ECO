import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaGoogle, FaApple, FaShieldAlt, FaUserPlus, FaSpinner, FaLeaf, 
  FaTruck, FaMapMarkerAlt, FaGlobeAmericas, FaKey, FaChevronRight 
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Login = () => {
  const { user, login, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStoryStep, setCurrentStoryStep] = useState(0);

  // 11-Step Eco Background Story Milestones
  const storySteps = [
    { title: '1. Waste Segregation', text: 'User separates plastic, paper, and metal waste.', icon: '♻️' },
    { title: '2. Pickup Booking', text: 'User schedules waste collection on EcoReward.', icon: '📅' },
    { title: '3. Real-Time Dispatch', text: 'Nearby collection driver receives dispatch alert.', icon: '🔔' },
    { title: '4. Driver Accept', text: 'Verified driver accepts pickup assignment.', icon: '✅' },
    { title: '5. Live GPS Tracking', text: 'Real-time route navigation to customer location.', icon: '📍' },
    { title: '6. Doorstep Collection', text: 'Driver weighs and collects recyclables.', icon: '🚚' },
    { title: '7. Transport to Facility', text: 'Waste dispatched to certified recycling plant.', icon: '🏭' },
    { title: '8. Material Processing', text: 'Waste processed into reusable raw material.', icon: '⚡' },
    { title: '9. Instant Eco Points', text: 'User wallet credited with reward points.', icon: '🪙' },
    { title: '10. Environmental Impact', text: '1.2 Tons Waste Saved • 450 Trees Preserved.', icon: '🌍' },
    { title: 'EcoReward Vision', text: 'Recycle Smart. Earn Rewards. Build a Greener Future.', icon: '🌿' },
  ];

  // Auto Cycle Background Story Carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStoryStep((prev) => (prev + 1) % storySteps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [storySteps.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(emailOrPhone, password);
      setLoading(false);

      if (res.success) {
        addToast(`Welcome back, ${res.user.name}!`, 'success', 'Login Successful');
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'driver') navigate('/driver');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid email/phone or password');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  const fillDemoAccount = (role) => {
    if (role === 'user') {
      setEmailOrPhone('demo.user@ecoreward.com');
      setPassword('User@123');
      addToast('Demo Customer credentials loaded', 'info', 'Demo Login');
    } else {
      setEmailOrPhone('demo.driver@ecoreward.com');
      setPassword('Driver@123');
      addToast('Demo Driver credentials loaded', 'info', 'Demo Login');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col transition-colors duration-300 overflow-hidden font-sans">
      
      {/* High-Quality Ambient Eco Glow & Looping Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-105 filter brightness-75 contrast-110 opacity-30"
          src="/videos/eco-waste-management.mp4"
        />
        
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-500/25 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-teal-500/25 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-emerald-950/95 backdrop-blur-[3px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: 11-Step Eco Background Story Banner (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-white p-6">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs rounded-full uppercase tracking-wider inline-block">
                Circular Recycling Platform 2026
              </span>
              <h1 className="text-4xl font-black tracking-tight leading-tight">
                Recycle Smart.<br />Earn Rewards.<br /><span className="text-emerald-400">Build a Greener Future.</span>
              </h1>
            </div>

            {/* Story Milestone Card */}
            <div className="p-5 bg-slate-900/80 border border-emerald-500/30 backdrop-blur-xl rounded-3xl space-y-2 shadow-2xl animate-fadeIn">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-emerald-400 font-extrabold flex items-center space-x-2">
                  <span className="text-xl">{storySteps[currentStoryStep].icon}</span>
                  <span>{storySteps[currentStoryStep].title}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{currentStoryStep + 1} / 11</span>
              </div>
              <p className="text-xs text-slate-300 font-medium">{storySteps[currentStoryStep].text}</p>
            </div>

            {/* Environmental Impact Counters */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2">
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-emerald-400 block">4.8 Tons</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">CO₂ Reduced</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-teal-400 block">1,250</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Trees Saved</span>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-cyan-400 block">12.5 Tons</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Recycled</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Glassmorphic Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[440px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 p-7 sm:p-9 rounded-3xl shadow-2xl shadow-emerald-950/50 space-y-6">
              
              {/* Logged in state */}
              {user && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Logged in as <strong>{user.name}</strong> ({user.role})</span>
                  <button 
                    type="button"
                    onClick={() => logout()}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-1">
                  <FaRecycle className="h-7 w-7 animate-spin-slow" style={{ animationDuration: '12s' }} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sign in to manage waste recycling and redeem points.</p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 rounded-2xl animate-fadeIn">
                  {error}
                </div>
              )}

              {/* OAuth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => addToast('Google Login initialized', 'info', 'OAuth')}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
                >
                  <FaGoogle className="text-rose-500 text-sm" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => addToast('Apple Login initialized', 'info', 'OAuth')}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-sm"
                >
                  <FaApple className="text-slate-900 dark:text-white text-sm" />
                  <span>Apple</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] uppercase tracking-widest font-black text-slate-400">or sign in with email</span>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email / Mobile */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email or Mobile Number</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    <input 
                      type="text" 
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      required
                      placeholder="name@example.com or +91..." 
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide Toggle */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-3.5 text-slate-400 h-4 w-4" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••" 
                      className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Remember Me</span>
                  </label>
                </div>

                {/* Sign In Button */}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="h-4 w-4 animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="h-4 w-4" />
                      <span>Sign In</span>
                    </>
                  )}
                </button>
              </form>

              {/* Sample Credentials Quick One-Click Card */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block text-center">Sample Testing Credentials (1-Click Fill)</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-black">
                  <button 
                    type="button" 
                    onClick={() => { setEmailOrPhone('user@ecoreward.com'); setPassword('1234'); addToast('Customer credentials filled (password: 1234)', 'info', 'Auto Filled'); }}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 transition-all text-center"
                  >
                    👤 Customer (1234)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setEmailOrPhone('driver@ecoreward.com'); setPassword('1234'); addToast('Driver credentials filled (password: 1234)', 'info', 'Auto Filled'); }}
                    className="p-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-500/20 transition-all text-center"
                  >
                    🚛 Driver (1234)
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center space-y-2">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-center space-x-2">
                  <span>Don't have an account?</span>
                  <Link 
                    to="/signup" 
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black rounded-xl border border-emerald-500/30 transition-all hover:scale-105 inline-flex items-center space-x-1"
                  >
                    <span>Register Now</span>
                    <FaUserPlus className="h-3 w-3" />
                  </Link>
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
