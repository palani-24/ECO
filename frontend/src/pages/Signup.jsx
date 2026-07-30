import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaRecycle, FaUser, FaEnvelope, FaLock, FaTruck, FaMapPin, FaClipboardCheck, FaInfoCircle, FaSignInAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // user or driver
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Driver fields
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  // Customer Address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role
    };

    if (role === 'driver') {
      if (!vehicleNumber || !vehicleType) {
        setError('Vehicle details are required for drivers');
        setLoading(false);
        return;
      }
      payload.vehicleNumber = vehicleNumber;
      payload.vehicleType = vehicleType;
    } else {
      // customer default address config
      if (street || city || state || zipCode) {
        if (!street || !city || !state || !zipCode) {
          setError('Please complete all address fields or leave them all blank.');
          setLoading(false);
          return;
        }
        payload.address = { street, city, state, zipCode };
      }
    }

    const res = await signup(payload);
    setLoading(false);

    if (res.success) {
      if (role === 'driver') {
        setSuccess('Registration successful! Driver profile is pending Admin Approval.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-16">
        <div className="w-full max-w-[500px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-8 rounded-3xl shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 items-center justify-center text-primary-500 mb-2">
              <FaRecycle className="h-6 w-6 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold font-medium">Join EcoReward and play your part in circular green recycling.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button 
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'user' 
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Recycling User
            </button>
            <button 
              type="button"
              onClick={() => setRole('driver')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                role === 'driver' 
                  ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              Collection Driver
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-2">
              <FaInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-100 dark:border-emerald-900/30 rounded-2xl">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Arjun Sharma" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3.5 text-slate-400 h-3.5 w-3.5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="arjun@example.com" 
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-slate-400 h-3.5 w-3.5" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Role Conditional Fields */}
            {role === 'driver' ? (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5"><FaTruck /> <span>Vehicle Specifications</span></span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">License Plate Number</label>
                    <input 
                      type="text" 
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. TN-01-AX-9945"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Vehicle Type</label>
                    <input 
                      type="text" 
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      placeholder="e.g. Cargo Minivan"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5"><FaMapPin /> <span>Default Address (Optional)</span></span>
                
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Street Address</label>
                    <input 
                      type="text" 
                      value={street} 
                      onChange={(e) => setStreet(e.target.value)} 
                      placeholder="12-A, Metro Heights, Anna Nagar"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">City</label>
                      <input 
                        type="text" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)} 
                        placeholder="Chennai"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">State</label>
                      <input 
                        type="text" 
                        value={state} 
                        onChange={(e) => setState(e.target.value)} 
                        placeholder="Tamil Nadu"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-1 col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">ZIP Code</label>
                      <input 
                        type="text" 
                        value={zipCode} 
                        onChange={(e) => setZipCode(e.target.value)} 
                        placeholder="600040"
                        className="w-full px-3 py-2 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-primary-500/10 flex items-center justify-center space-x-2"
            >
              <FaClipboardCheck className="h-4 w-4" />
              <span>{loading ? 'Creating Account...' : 'Register'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center space-x-2">
              <span>Already have an account?</span>
              <Link 
                to="/login" 
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold border border-emerald-500/30 transition-all hover:scale-105 shadow-sm inline-flex items-center space-x-1.5"
              >
                <span>Sign In</span>
                <FaSignInAlt className="h-3 w-3" />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;
