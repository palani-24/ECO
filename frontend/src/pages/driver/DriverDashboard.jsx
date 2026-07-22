import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton, TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaToggleOn, FaToggleOff, FaClipboardList, FaMapMarkerAlt, FaTruck, FaClock, FaCheck, FaWeight, FaCamera, FaRobot, FaExclamationTriangle } from 'react-icons/fa';

const DriverDashboard = () => {
  const { user } = useAuth();
  
  // States
  const [driverProfile, setDriverProfile] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Collection Inputs
  const [actualWeight, setActualWeight] = useState('');
  const [wasteImageUrl, setWasteImageUrl] = useState('/uploads/default_waste.jpg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  
  // Interactive Step Tracker
  const [checkedIn, setCheckedIn] = useState(false);
  const [collected, setCollected] = useState(false);
  const [aiReport, setAiReport] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setWasteImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchDriverData = async () => {
    try {
      const [profileRes, pickupRes] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/pickups')
      ]);

      if (profileRes.data.success) setDriverProfile(profileRes.data.data);
      if (pickupRes.data.success) setPickups(pickupRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load driver dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, []);

  const toggleOnline = async () => {
    if (!driverProfile) return;
    const newStatus = driverProfile.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put('/driver/status', { status: newStatus });
      if (res.data.success) {
        setDriverProfile(prev => prev ? { ...prev, status: res.data.data.status } : null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update online status.');
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/driver/pickups/${id}/accept`);
      if (res.data.success) {
        fetchDriverData();
        // Reset interactive check steps
        setCheckedIn(false);
        setCollected(false);
        setAiReport(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept pickup.');
    }
  };

  const handleComplete = async (id) => {
    if (!actualWeight) {
      setError('Please enter verified collection weight.');
      return;
    }
    setError('');
    setIsScanning(true);

    const steps = [
      'Initializing AI Vision Recognition...',
      'Analyzing composition & color patterns...',
      'Measuring impurity & moisture index...',
      'Computing weight validation...',
      'Finalizing transaction record & rewards...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setScanStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    try {
      const res = await api.put(`/driver/pickups/${id}/complete`, {
        actualWeight: parseFloat(actualWeight),
        wasteImageUrl
      });
      setIsScanning(false);
      if (res.data.success) {
        setAiReport(res.data.data.aiReport);
        setActualWeight('');
        fetchDriverData();
      }
    } catch (err) {
      setIsScanning(false);
      setError(err.response?.data?.message || 'Failed to process pickup completion.');
    }
  };

  const activePickup = pickups.find(p => p.status === 'accepted');
  const assignedPickups = pickups.filter(p => p.status === 'assigned');
  const completedPickups = pickups.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          
          {/* Header & Toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Driver Console</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View routes, weigh recycled waste, and process AI verification metrics.</p>
            </div>

            {driverProfile?.isApproved && (
              <button 
                onClick={toggleOnline}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-bold transition-all shadow-sm ${
                  driverProfile.status === 'active' || driverProfile.status === 'busy'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}
              >
                {driverProfile.status === 'active' || driverProfile.status === 'busy' ? (
                  <>
                    <FaToggleOn className="h-5 w-5" />
                    <span>ONLINE (ONLINE TO ASSIGN)</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="h-5 w-5" />
                    <span>OFFLINE (OFFLINE)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-2">
              <FaExclamationTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {driverProfile && !driverProfile.isApproved && (
            <div className="p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-250/20 rounded-3xl text-amber-800 dark:text-amber-400 text-sm space-y-2">
              <h3 className="font-extrabold text-base">Account Awaiting Approval</h3>
              <p className="text-xs">
                Your driver account registration is received. Admin must review your vehicle credentials before you can go online to accept assignments.
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CardSkeleton /><CardSkeleton />
            </div>
          ) : (
            driverProfile?.isApproved && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Columns - Active Job & Assigned Pickups */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Active Accepted Job panel */}
                  {activePickup ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-md space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="space-y-0.5">
                          <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">Active Collection Job</h3>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled for: {activePickup.pickupTimeSlot}</span>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/20">Accepted</span>
                      </div>

                      {/* Customer Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="text-sm">
                            <span className="text-xs text-slate-400 block font-semibold">CUSTOMER NAME</span>
                            <p className="font-bold text-slate-800 dark:text-white">{activePickup.user.name}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-xs text-slate-400 block font-semibold">MATERIAL TO COLLECT</span>
                            <p className="font-bold text-slate-800 dark:text-white">{activePickup.wasteCategory} (Est. {activePickup.estimatedWeight}kg)</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-xs text-slate-400 block font-semibold">COLLECTION ADDRESS</span>
                            <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">
                              {activePickup.pickupAddress.street}, {activePickup.pickupAddress.city}
                            </p>
                          </div>
                        </div>

                        {/* Navigation simulated */}
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-36 border border-slate-200/40 dark:border-slate-700 overflow-hidden relative">
                          <svg className="w-full h-full object-cover" viewBox="0 0 100 100">
                            {/* Mock Grid Lines */}
                            <path d="M 0 20 H 100 M 0 50 H 100 M 0 80 H 100 M 20 0 V 100 M 50 0 V 100 M 80 0 V 100" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5" />
                            {/* Route Path */}
                            <path d="M 10 90 L 40 90 L 40 40 L 80 40" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeDasharray="3" />
                            {/* Driver Icon */}
                            <circle cx="10" cy="90" r="4" fill="#0284c7" />
                            {/* User Location */}
                            <circle cx="80" cy="40" r="4" fill="#ef4444" />
                          </svg>
                          <div className="absolute bottom-2 left-2 bg-slate-900/70 text-white font-bold text-[9px] px-2 py-0.5 rounded-full flex items-center space-x-1">
                            <FaMapMarkerAlt className="text-rose-500" />
                            <span>Routing map simulation</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Step-by-Step Collection Workflow */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Collection Checklist</span>
                        
                        <div className="space-y-3">
                          {/* Step 1: Reached location */}
                          <label className="flex items-center space-x-3 cursor-pointer select-none p-3.5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-850">
                            <input 
                              type="checkbox" 
                              checked={checkedIn} 
                              onChange={(e) => setCheckedIn(e.target.checked)} 
                              className="h-4.5 w-4.5 text-primary-600 focus:ring-emerald-500 rounded border-slate-300"
                            />
                            <div className="text-xs">
                              <p className="font-bold text-slate-850 dark:text-slate-200">1. Reached Customer's Address</p>
                              <span className="text-[10px] text-slate-400">Confirm presence on location to unlock waste scales.</span>
                            </div>
                          </label>

                          {/* Step 2: Weigh waste */}
                          {checkedIn && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl space-y-4 animate-fadeIn">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">2. Enter Material Weight & Photo</span>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center space-x-1">
                                    <FaWeight className="h-3 w-3" /> <span>Actual Weight (kg)</span>
                                  </label>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={actualWeight}
                                    onChange={(e) => setActualWeight(e.target.value)}
                                    placeholder="Enter final weight"
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-350 dark:border-slate-750 bg-white dark:bg-slate-900 focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center space-x-1">
                                    <FaCamera className="h-3 w-3" /> <span>Upload Waste Photo</span>
                                  </label>
                                  <div className="flex items-center space-x-3">
                                    <label className="flex-1 flex items-center justify-center px-3 py-2 border border-dashed border-slate-300 dark:border-slate-750 rounded-xl cursor-pointer bg-white dark:bg-slate-900 hover:border-emerald-500 hover:text-emerald-500 transition-colors text-xs text-slate-500 font-bold">
                                      <FaCamera className="h-3.5 w-3.5 mr-2 text-slate-400" />
                                      <span>Select Photo</span>
                                      <input 
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                      />
                                    </label>
                                    {wasteImageUrl && (
                                      <img 
                                        src={wasteImageUrl} 
                                        alt="Waste Preview" 
                                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-800"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <button 
                                onClick={() => handleComplete(activePickup._id)}
                                disabled={isScanning || !actualWeight}
                                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow"
                              >
                                <FaRobot className="h-4 w-4 animate-pulse" />
                                <span>Run AI Quality Check & Complete</span>
                              </button>
                            </div>
                          )}

                          {/* Futuristic AI Scanning Screen Overlay */}
                          {isScanning && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-8 shadow-2xl w-full max-w-[400px] text-center space-y-6 relative overflow-hidden">
                                {/* Grid Scan Visual Container */}
                                <div className="relative h-44 w-44 mx-auto rounded-2xl overflow-hidden ring-4 ring-emerald-500/20 shadow-inner flex items-center justify-center bg-slate-100 dark:bg-slate-950">
                                  <img 
                                    src={wasteImageUrl} 
                                    alt="Scanning..." 
                                    className="h-full w-full object-cover"
                                  />
                                  {/* Scanning Green Laser Sweep */}
                                  <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981] animate-laserSweep"></div>
                                  {/* Matrix-like glow overlay */}
                                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent)] pointer-events-none"></div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center justify-center space-x-2 text-emerald-500 font-bold text-xs">
                                    <FaRobot className="h-4 w-4 animate-bounce" />
                                    <span className="tracking-widest uppercase text-[10px]">AI Computer Vision Scan</span>
                                  </div>
                                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white transition-all duration-350 min-h-[40px] flex items-center justify-center px-4 leading-relaxed">
                                    {scanStep}
                                  </h4>
                                </div>

                                {/* Scanning Progress Bar */}
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full animate-progressLoad"></div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* AI Verification Report Modal details */}
                          {aiReport && (
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 rounded-2xl space-y-3 text-xs animate-fadeIn text-emerald-800 dark:text-emerald-400">
                              <h4 className="font-extrabold text-sm flex items-center space-x-1.5">
                                <FaRobot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span>AI Analysis Verified</span>
                              </h4>
                              <p className="text-[10px] leading-relaxed opacity-90">{aiReport.remarks}</p>
                              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                                <div className="bg-white dark:bg-slate-900 border border-emerald-100 p-2 rounded-xl">
                                  <span className="text-[9px] text-slate-400 block">WEIGHT</span>
                                  <span className="font-bold text-slate-800 dark:text-white">{aiReport.estimatedWeight} kg</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-emerald-100 p-2 rounded-xl">
                                  <span className="text-[9px] text-slate-400 block">PURITY</span>
                                  <span className="font-bold text-slate-800 dark:text-white">{aiReport.qualityScore}%</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 border border-emerald-100 p-2 rounded-xl">
                                  <span className="text-[9px] text-slate-400 block">POINTS</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+{aiReport.pointsAwarded}</span>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  ) : (
                    /* Display waiting card */
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-8 rounded-3xl text-center space-y-3 text-slate-500">
                      <FaTruck className="h-10 w-10 text-slate-350 dark:text-slate-700 mx-auto" />
                      <p className="text-sm font-semibold">You do not have any accepted active collection jobs.</p>
                      <p className="text-xs text-slate-400">Accept assigned tasks from the checklist below to begin routing.</p>
                    </div>
                  )}

                  {/* Assigned Jobs queue */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                      <FaClipboardList className="text-emerald-500" />
                      <span>Available Assigned Requests ({assignedPickups.length})</span>
                    </h3>

                    <div className="space-y-3">
                      {assignedPickups.map((p) => (
                        <div key={p._id} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-800 dark:text-white text-sm">{p.user.name}</span>
                              <span className="px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] bg-sky-50 text-sky-600 dark:bg-sky-950/20">{p.wasteCategory}</span>
                            </div>
                            <p className="text-slate-400 font-semibold">{p.pickupAddress.street}, {p.pickupAddress.city}</p>
                            <span className="text-[10px] text-slate-400 flex items-center space-x-1 pt-1"><FaClock className="h-3 w-3" /> <span>{p.pickupTimeSlot}</span></span>
                          </div>
                          
                          <button 
                            onClick={() => handleAccept(p._id)}
                            className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-colors shadow"
                          >
                            Accept Job
                          </button>
                        </div>
                      ))}
                      {assignedPickups.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-4">No new pickup requests assigned currently.</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right Columns - Metrics & Completion History */}
                <div className="space-y-6">
                  
                  {/* Driver Stats */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Collector Earnings</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">TOTAL PICKUPS COMPLETED</span>
                        <span className="text-2xl font-black text-slate-850 dark:text-white">{driverProfile.totalPickupsCount}</span>
                      </div>
                      <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center font-bold">♻️</div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block font-semibold">ESTIMATED INCENTIVES</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{(driverProfile.totalPickupsCount * 125).toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">₹125/job</span>
                    </div>
                  </div>

                  {/* Completed Pickups Log */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200">Recent Completed Jobs ({completedPickups.length})</h3>
                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {completedPickups.map((p) => (
                        <div key={p._id} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{p.user.name}</span>
                            <span className="text-[9px] text-slate-400 font-bold">{p.receiptUrl}</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span>{p.wasteCategory} • {p.actualWeight}kg</span>
                            <span className="text-emerald-600 font-bold">+{p.pointsAwarded} pts awarded</span>
                          </div>
                        </div>
                      ))}
                      {completedPickups.length === 0 && (
                        <p className="text-center text-[11px] text-slate-400 py-4">No completed pickups registered yet.</p>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )
          )}

        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
