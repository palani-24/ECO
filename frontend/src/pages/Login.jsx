import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, 
  FaGoogle, FaApple, FaShieldAlt, FaUserPlus, FaSpinner, FaLeaf, 
  FaTruck, FaMapMarkerAlt, FaGlobeAmericas, FaKey, FaChevronRight, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaMagic
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

  // Background Silent Ambient Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch(() => {});
    }
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
        } catch (e) {}
      }
    };
  }, []);

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

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
        else if (res.user.role === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid email/phone or password');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  // INSTANT 1-CLICK DEMO AUTO-LOGIN HANDLER
  const handleInstantDemoLogin = async (roleType) => {
    setLoading(true);
    setError('');

    const demoEmail = roleType === 'driver' 
      ? 'demo.driver@ecoreward.com' 
      : roleType === 'municipality' 
      ? 'demo.municipality@ecoreward.com' 
      : 'demo.user@ecoreward.com';
    const demoPass = '123456';

    setEmailOrPhone(demoEmail);
    setPassword(demoPass);

    try {
      const res = await login(demoEmail, demoPass);
      setLoading(false);

      if (res.success) {
        const roleLabel = roleType === 'driver' ? 'Driver' : roleType === 'municipality' ? 'Municipality Officer' : 'User';
        addToast(`⚡ Instant Demo ${roleLabel} Login Successful!`, 'success', 'Welcome to EcoReward');
        if (res.user.role === 'admin') navigate('/admin');
        else if (res.user.role === 'driver') navigate('/driver');
        else if (res.user.role === 'municipality') navigate('/municipality/dashboard');
        else navigate('/dashboard');
      } else {
        setError(res.message || 'Demo login failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Demo login connection error. Please try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06121e] flex flex-col transition-colors duration-300 overflow-hidden font-sans text-slate-100">
      
      {/* High-Definition Ambient Video Background - Permanently Silent & Smooth Autoplay */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        defaultMuted
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover opacity-60 filter contrast-125 brightness-100 pointer-events-none z-0"
        src="/videos/eco-waste-management.mp4"
      />
      
      {/* Ambient Dark Glass Vignette Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#06121e]/90 via-[#06121e]/70 to-emerald-950/80 backdrop-blur-[2px] pointer-events-none" />

      {/* Floating Video Controls */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-[#091b2e]/90 border border-emerald-500/40 px-3.5 py-2 rounded-2xl backdrop-blur-md shadow-2xl">
        <button 
          type="button" 
          onClick={toggleVideoPlay}
          className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          title={isVideoPlaying ? "Pause Ambient Video" : "Play Ambient Video"}
        >
          {isVideoPlaying ? <FaPause className="h-3.5 w-3.5" /> : <FaPlay className="h-3.5 w-3.5" />}
        </button>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">1080p Ambient Video</span>
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Live Eco Network Ticker Bar */}
      <div className="relative z-10 bg-emerald-500/10 border-b border-emerald-500/20 py-1.5 px-4 text-center">
        <span className="text-xs font-mono font-bold text-emerald-400 tracking-wider">
          ⚡ LIVE ECO NETWORK: 25,840 Citizens • 15.3K Pickups • 8.2 Tons CO₂ Saved
        </span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: 11-Step Eco Background Story Banner */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-between space-y-6 text-white p-6">
            <div className="space-y-3">
              <span className="px-3.5 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold text-xs rounded-full uppercase tracking-wider inline-block">
                Circular Recycling Platform 2026
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
                Recycle Smart.<br />Earn Rewards.<br /><span className="text-emerald-400">Build a Greener Future.</span>
              </h1>
            </div>

            {/* Story Milestone Card */}
            <div className="p-5 bg-[#091b2e]/90 border border-emerald-500/30 backdrop-blur-xl rounded-3xl space-y-2 shadow-2xl animate-fadeIn">
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
              <div className="p-3 bg-[#091b2e]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-emerald-400 block">4.8 Tons</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">CO₂ Reduced</span>
              </div>
              <div className="p-3 bg-[#091b2e]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-teal-400 block">1,250</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Trees Saved</span>
              </div>
              <div className="p-3 bg-[#091b2e]/80 border border-slate-800 rounded-2xl">
                <span className="text-lg font-black text-cyan-400 block">12.5 Tons</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Recycled</span>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-[460px] bg-white/95 dark:bg-[#091b2e]/95 backdrop-blur-2xl border border-emerald-500/30 dark:border-emerald-500/40 p-6 sm:p-9 rounded-3xl shadow-2xl space-y-6">
              
              {/* Header with Official Logo */}
              <div className="text-center space-y-2">
                <img src="/app-logo.png" alt="EcoReward Emblem Logo" className="h-12 sm:h-14 w-auto mx-auto object-contain mb-1 drop-shadow-md" />
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">Log in to manage your eco pickups and reward balance.</p>
              </div>

              {/* 1-Click Instant Demo Login Bar */}
              <div className="p-2.5 bg-emerald-500/10 dark:bg-[#06121e] rounded-2xl border border-emerald-500/30 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pl-1">
                  <FaMagic className="text-emerald-500" />
                  <span>Instant 1-Click Demo:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleInstantDemoLogin('user')}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[10px] shadow hover:scale-105 transition-all"
                  >
                    Citizen
                  </button>
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleInstantDemoLogin('driver')}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black text-[10px] shadow hover:scale-105 transition-all"
                  >
                    Driver
                  </button>
                  <button 
                    type="button" 
                    disabled={loading}
                    onClick={() => handleInstantDemoLogin('municipality')}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[10px] shadow hover:scale-105 transition-all"
                  >
                    Municipality
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 rounded-2xl animate-fadeIn">
                  {error}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email or Phone</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                    <input 
                      type="text" 
                      value={emailOrPhone} 
                      onChange={(e) => setEmailOrPhone(e.target.value)} 
                      required 
                      placeholder="user@ecoreward.com or +91..." 
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#06121e] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <Link to="/forgot-password" className="text-[10px] font-bold text-emerald-500 hover:underline">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      placeholder="••••••••" 
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-[#06121e] rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                      {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)} 
                      className="h-4 w-4 rounded accent-emerald-500" 
                    />
                    <span>Remember Login Session</span>
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      <span>Logging In...</span>
                    </>
                  ) : (
                    <>
                      <FaSignInAlt className="h-4 w-4" />
                      <span>Sign In to Dashboard</span>
                    </>
                  )}
                </button>

              </form>

              {/* Prominent High-Visibility Signup Card */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="text-center sm:text-left">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">New to EcoReward?</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-300 font-bold block pt-0.5">Create your free account & start earning cash rewards</span>
                  </div>
                  <Link 
                    to="/signup" 
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center space-x-2 hover:scale-105 transition-all whitespace-nowrap"
                  >
                    <FaUserPlus className="h-3.5 w-3.5" />
                    <span>Create Account →</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Login;
