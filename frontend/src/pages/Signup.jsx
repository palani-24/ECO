import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaUser, FaEnvelope, FaLock, FaTruck, FaPhone, 
  FaCheckCircle, FaEye, FaEyeSlash, FaSpinner, FaLeaf, FaTimes, 
  FaShieldAlt, FaClock, FaSignInAlt, FaVolumeUp, FaVolumeMute, FaPlay, FaPause, FaGift, FaRoute, FaUserPlus
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Role: 'user' or 'driver'
  const [role, setRole] = useState('user');
  
  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);

  // Driver Fields
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('E-Rickshaw Heavy Loader');

  // UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Background Video State
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef(null);

  const toggleVideoMute = () => {
    if (videoRef.current) {
      const nextMuted = !isVideoMuted;
      videoRef.current.muted = nextMuted;
      setIsVideoMuted(nextMuted);
    }
  };

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

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.muted = true;
        } catch (e) {}
      }
    };
  }, []);

  // Password Strength Meter
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 33, text: 'Fair', color: 'bg-amber-500' };
    if (score === 2) return { score: 66, text: 'Good', color: 'bg-sky-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms & Privacy Policy to register.');
      return;
    }

    setLoading(true);

    const payload = {
      name,
      phone,
      email,
      password,
      role
    };

    if (role === 'driver') {
      if (!vehicleNumber || !vehicleType) {
        setError('Please complete all required driver vehicle details.');
        setLoading(false);
        return;
      }
      payload.vehicleNumber = vehicleNumber;
      payload.vehicleType = vehicleType;
      payload.licenseNumber = licenseNumber || `DL-${vehicleNumber.replace(/\s+/g, '-').toUpperCase()}`;
      payload.aadhaarNumber = aadhaarNumber;
    }

    try {
      const res = await signup(payload);
      setLoading(false);

      if (res.success) {
        if (role === 'driver') {
          setShowPendingModal(true);
        } else {
          addToast('Account created successfully! Welcome to EcoReward.', 'success', 'Registration Successful');
          navigate('/dashboard');
        }
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setLoading(false);
      setError('Connection failed. Please check network and try again.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#06121e] flex flex-col transition-colors duration-300 overflow-hidden font-sans text-slate-100">
      
      {/* High-Definition Full Video Background Stream */}
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted={isVideoMuted} 
        playsInline
        preload="auto"
        className="fixed inset-0 w-full h-full object-cover opacity-60 filter contrast-125 brightness-100 pointer-events-none z-0" 
        src="/videos/eco-waste-management.mp4" 
      />

      {/* Ambient Dark Glass Overlay Vignette */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#06121e]/90 via-[#06121e]/70 to-emerald-950/80 backdrop-blur-[2px] pointer-events-none" />

      {/* Floating Video Control Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-[#091b2e]/90 border border-emerald-500/40 px-3.5 py-2 rounded-2xl backdrop-blur-md shadow-2xl">
        <button 
          type="button" 
          onClick={toggleVideoPlay}
          className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          title={isVideoPlaying ? "Pause HD Video" : "Play HD Video"}
        >
          {isVideoPlaying ? <FaPause className="h-3.5 w-3.5" /> : <FaPlay className="h-3.5 w-3.5" />}
        </button>
        <button 
          type="button" 
          onClick={toggleVideoMute}
          className="p-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          title={isVideoMuted ? "Unmute HD Video Sound" : "Mute Sound"}
        >
          {isVideoMuted ? <FaVolumeMute className="h-3.5 w-3.5 text-amber-400" /> : <FaVolumeUp className="h-3.5 w-3.5" />}
        </button>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase hidden sm:inline">1080p HD Video</span>
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      {/* Live Eco Network Ticker Bar */}
      <div className="relative z-10 bg-emerald-500/10 border-b border-emerald-500/20 py-1 px-4 text-center">
        <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
          ⚡ LIVE ECO NETWORK: 25,840 Citizens • 15.3K Pickups • 8.2 Tons CO₂ Saved
        </span>
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 py-6">
        <div className="w-full max-w-[460px] bg-white/95 dark:bg-[#091b2e]/95 backdrop-blur-2xl border border-emerald-500/30 dark:border-emerald-500/40 p-4 sm:p-7 rounded-3xl shadow-2xl space-y-4">
          
          {/* Header with Official Logo */}
          <div className="text-center space-y-1.5">
            <img src="/app-logo.png" alt="EcoReward Emblem Logo" className="h-11 sm:h-13 w-auto mx-auto object-contain mb-1 drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">Join EcoReward & play your part in circular green recycling.</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 dark:bg-[#06121e] rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 ${
                role === 'user'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaLeaf className="h-3.5 w-3.5" />
              <span>Recycling User</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('driver')}
              className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-1.5 ${
                role === 'driver'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaTruck className="h-3.5 w-3.5" />
              <span>Collection Driver</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 rounded-2xl animate-fadeIn">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-slate-400 h-3 w-3" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Arjun Sharma" 
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-3 text-slate-400 h-3 w-3" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    placeholder="+91 98765 43210" 
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3 text-slate-400 h-3 w-3" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com" 
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
            </div>

            {/* Passwords & Strength Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-slate-400 h-3 w-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-3 text-slate-400">
                    {showPassword ? <FaEyeSlash className="h-3 w-3" /> : <FaEye className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-3 text-slate-400 h-3 w-3" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[9px] font-black">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className={strength.color.replace('bg-', 'text-')}>{strength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                </div>
              </div>
            )}

            {/* DRIVER SPECIFIC FIELDS */}
            {role === 'driver' && (
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-2.5 animate-fadeIn">
                <span className="text-xs font-extrabold text-emerald-500 flex items-center space-x-1">
                  <FaTruck />
                  <span>Driver Vehicle Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Vehicle License Plate Number</label>
                    <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required placeholder="TN-38-ECO-9945" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold" />
                  </div>

                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Vehicle Category</label>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold">
                      <option value="E-Rickshaw Heavy Loader">E-Rickshaw Heavy Loader</option>
                      <option value="Mini Pickup Truck">Mini Pickup Truck</option>
                      <option value="Electric Cargo Van">Electric Cargo Van</option>
                      <option value="Heavy Industrial Truck">Heavy Industrial Truck</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Driving License No.</label>
                    <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="DL-TN38-2024-XXXX" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold" />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-slate-400 uppercase block mb-0.5">Aadhaar Card No.</label>
                    <input type="text" value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value)} placeholder="1234 5678 9012" className="w-full px-3 py-2 bg-slate-50 dark:bg-[#06121e] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-extrabold" />
                  </div>
                </div>
              </div>
            )}

            {/* Terms Agreement Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)} 
                className="h-3.5 w-3.5 rounded accent-emerald-500 cursor-pointer" 
              />
              <label htmlFor="terms" className="text-[10px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-emerald-500 underline font-extrabold">Terms of Service & Privacy Policy</button>
              </label>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-3.5 w-3.5" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="h-3.5 w-3.5" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>

          </form>

          {/* Prominent High-Visibility Sign In Card */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-md">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-black text-slate-900 dark:text-white block">Already registered with EcoReward?</span>
                <span className="text-[9px] text-slate-500 dark:text-slate-300 font-bold block pt-0.5">Access your dashboard, wallet points & pickup bookings</span>
              </div>
              <Link 
                to="/login" 
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] shadow-lg flex items-center justify-center space-x-1.5 hover:scale-105 transition-all whitespace-nowrap"
              >
                <FaSignInAlt className="h-3 w-3" />
                <span>Sign In Instead →</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Driver Pending Approval Modal */}
      <AnimatePresence>
        {showPendingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#091b2e] border border-emerald-500/40 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl text-white">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl border border-emerald-500/30">
                <FaClock className="animate-pulse" />
              </div>
              <h3 className="text-2xl font-black">Driver Account Pending Approval</h3>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Thank you for registering as a Collection Driver! Your vehicle credentials have been submitted for admin verification.
              </p>
              <button 
                onClick={() => {
                  setShowPendingModal(false);
                  navigate('/login');
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-lg"
              >
                Go to Login Page
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms of Service Modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-[#091b2e] border border-slate-700 p-6 sm:p-8 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl text-white max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                <h3 className="text-lg font-black text-white">Terms of Service & Privacy</h3>
                <button onClick={() => setShowTermsModal(false)} className="text-slate-400 hover:text-white">
                  <FaTimes />
                </button>
              </div>
              <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
                <p><strong>1. Account Responsibilities:</strong> Users agree to provide accurate waste weights and categories. Misrepresentation may result in point forfeiture.</p>
                <p><strong>2. EcoPoints & Payouts:</strong> Earned EcoPoints can be swapped for cash vouchers or UPI transfers subject to minimum threshold validation.</p>
                <p><strong>3. Driver Operations:</strong> Drivers must maintain valid license credentials and inspect collected materials for purity rating before approval.</p>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg"
              >
                Accept & Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Signup;
