import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  FaRecycle, FaUser, FaEnvelope, FaLock, FaTruck, FaPhone, 
  FaIdCard, FaCheckCircle, FaCloudUploadAlt, FaEye, FaEyeSlash, 
  FaSpinner, FaLeaf, FaTimes, FaShieldAlt, FaClock 
} from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Signup = () => {
  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Role: 'user' or 'driver'
  const [role, setRole] = useState('user');
  
  // Shared Fields
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
  const [profilePhotoName, setProfilePhotoName] = useState('');
  const [licenseDocName, setLicenseDocName] = useState('');
  const [rcDocName, setRcDocName] = useState('');

  // UI States
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Password Strength Meter
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-sky-500' };
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
      if (!vehicleNumber || !vehicleType || !licenseNumber) {
        setError('Please complete all required driver credential fields.');
        setLoading(false);
        return;
      }
      payload.vehicleNumber = vehicleNumber;
      payload.vehicleType = vehicleType;
      payload.licenseNumber = licenseNumber;
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
    <div className="relative min-h-screen bg-slate-950 flex flex-col transition-colors duration-300 overflow-hidden font-sans">
      
      {/* Ambient Eco Glow Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-950 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/85 to-emerald-950/90 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-[540px] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-800 p-6 sm:p-9 rounded-3xl shadow-2xl shadow-emerald-950/50 space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-1">
              <FaRecycle className="h-7 w-7 animate-spin-slow" style={{ animationDuration: '12s' }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Join EcoReward & play your part in circular green recycling.</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaLeaf />
              <span>Recycling User</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('driver')}
              className={`py-3 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center space-x-2 ${
                role === 'driver'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FaTruck />
              <span>Collection Driver</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 rounded-2xl animate-fadeIn">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Arjun Sharma" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <FaPhone className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    required 
                    placeholder="+91 98765 43210" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="name@example.com" 
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                />
              </div>
            </div>

            {/* Passwords & Strength Meter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400">
                    {showPassword ? <FaEyeSlash className="h-3.5 w-3.5" /> : <FaEye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500" 
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-black">
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
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 space-y-3 animate-fadeIn">
                <span className="text-xs font-extrabold text-emerald-500 flex items-center space-x-1">
                  <FaTruck />
                  <span>Driver Vehicle Details</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Vehicle License Plate Number</label>
                    <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} required placeholder="TN-38-ECO-9945" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-extrabold" />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Vehicle Category</label>
                    <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-extrabold">
                      <option value="E-Rickshaw Heavy Loader">E-Rickshaw Heavy Loader</option>
                      <option value="Mini Pickup Truck">Mini Pickup Truck</option>
                      <option value="Electric Van">Electric Van</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 text-xs pt-1">
              <input 
                type="checkbox" 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)} 
                className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500" 
              />
              <span className="text-slate-700 dark:text-slate-300 font-bold">
                I agree to the <a href="#" className="text-emerald-500 hover:underline">Terms of Service</a> & <a href="#" className="text-emerald-500 hover:underline">Privacy Policy</a>
              </span>
            </div>

            {/* Register Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="h-4 w-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Call to Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-black hover:underline">
                Sign In Instead
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Driver Verification Pending Modal Banner */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mx-auto border border-amber-500/20">
              <FaClock className="animate-spin-slow" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-slate-900 dark:text-white text-lg">Verification Pending</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Your driver profile and credentials have been submitted for municipal admin verification. You will be notified once approved.
              </p>
            </div>
            <button 
              onClick={() => navigate('/login')} 
              className="w-full py-3 bg-emerald-600 text-white font-black text-xs rounded-2xl shadow"
            >
              Go to Login Screen
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Signup;
