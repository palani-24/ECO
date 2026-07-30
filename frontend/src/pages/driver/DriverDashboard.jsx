import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import QRScannerModal from '../../components/QRScannerModal';
import DriverChatModal from '../../components/DriverChatModal';
import { 
  FaToggleOn, FaToggleOff, FaTruck, FaClock, FaCheck, FaWeight, FaCamera, 
  FaRobot, FaExclamationTriangle, FaCheckCircle, FaComments, FaPhoneAlt, 
  FaCoins, FaBell, FaQrcode, FaCheckDouble, FaTimesCircle, FaMapMarkerAlt, FaLocationArrow
} from 'react-icons/fa';

const DriverDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  
  // States
  const [driverProfile, setDriverProfile] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCitizenChat, setShowCitizenChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);

  // Active Collection Inputs & Checklist
  const [actualWeight, setActualWeight] = useState('');
  const [wasteImageUrl, setWasteImageUrl] = useState('/uploads/default_waste.jpg');
  const [inputOtp, setInputOtp] = useState('4829');
  const [isScanning, setIsScanning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [aiAnalysisPreview, setAiAnalysisPreview] = useState(null);

  // Sync Real-Time Socket Pickups
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      const updatedPickup = realtimeData.latestPickup;
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updatedPickup._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...updatedPickup };
          return updated;
        }
        return [updatedPickup, ...prev];
      });
    }
  }, [realtimeData?.latestPickup]);

  const fetchDriverData = async () => {
    try {
      const [profileRes, pickupRes] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/pickups')
      ]);

      if (profileRes.data.success) setDriverProfile(profileRes.data.data);
      if (pickupRes.data.success) setPickups(pickupRes.data.data);
    } catch (err) {
      console.error('Failed to load driver data', err);
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
        addToast(newStatus === 'active' ? '🟢 Driver is now ONLINE & accepting jobs' : '🔴 Driver is now OFFLINE', 'info', 'Status Updated');
      }
    } catch (err) {
      addToast('Failed to update online status', 'error', 'Error');
    }
  };

  const handleAccept = async (id) => {
    try {
      const res = await api.put(`/driver/pickups/${id}/accept`);
      if (res.data.success) {
        fetchDriverData();
        setCheckedIn(false);
        setAiAnalysisPreview(null);
        addToast('Pickup Accepted! Navigation active.', 'success', 'Job Accepted');
      }
    } catch (err) {
      addToast('Failed to accept pickup', 'error', 'Error');
    }
  };

  const handleRunAiAnalysis = async () => {
    if (!actualWeight || parseFloat(actualWeight) <= 0) {
      addToast('Please enter verified collection weight (e.g. 5kg)', 'error', 'Weight Required');
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const weightNum = parseFloat(actualWeight);
      const calculatedPoints = Math.round(weightNum * 35);
      setAiAnalysisPreview({
        wasteType: activePickup?.wasteCategory || 'Plastic / Paper',
        weight: weightNum,
        purityScore: 96.4,
        grade: 'Grade A Clean',
        pointsToAward: calculatedPoints
      });
      addToast(`AI Scan Passed! Points to award: +${calculatedPoints}`, 'success', 'AI Verification Complete');
    }, 1500);
  };

  const handleConfirmPickup = async (id) => {
    try {
      const res = await api.put(`/driver/pickups/${id}/complete`, {
        actualWeight: parseFloat(actualWeight),
        wasteImageUrl
      });
      if (res.data.success) {
        setAiAnalysisPreview(null);
        setActualWeight('');
        fetchDriverData();
        addToast(`🏆 Job Completed! +${aiAnalysisPreview?.pointsToAward || 175} EcoPoints transferred to customer.`, 'success', 'Pickup Completed');
      }
    } catch (err) {
      addToast('Failed to complete pickup', 'error', 'Error');
    }
  };

  const activePickup = pickups.find(p => p.status === 'accepted') || pickups.find(p => p.status === 'assigned');
  const upcomingPickups = pickups.filter(p => p.status === 'assigned' || p.status === 'pending').slice(0, 3);
  const recentCompleted = pickups.filter(p => p.status === 'completed').slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Streamlined Driver Panel */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 space-y-5 overflow-hidden">
          
          {/* Top Bar: Status Toggle, SOS Emergency & Notifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl flex-shrink-0 border border-emerald-500/20">
                <FaTruck />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Driver Console</h3>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider block">
                  {driverProfile?.status === 'active' ? '🟢 Active & Dispatch Ready' : '🔴 Standby Offline'}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
              
              {/* Notifications Drawer Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs relative hover:bg-slate-200 transition-colors"
                  title="Notifications"
                >
                  <FaBell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 text-white font-black text-[9px] rounded-full flex items-center justify-center">3</span>
                </button>

                {showNotifications && (
                  <div className="absolute top-12 right-0 z-50 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 text-xs animate-fadeIn">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-slate-900 dark:text-white">Driver Notifications</span>
                      <span className="text-[10px] text-emerald-500 font-bold">3 new</span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">New Pickup Assigned!</p>
                        <span className="text-[10px] text-slate-400 block">Anna Nagar • 10kg Paper</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white">Weekly Incentive Active</p>
                        <span className="text-[10px] text-slate-400 block">₹500 bonus (8/10 done)</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SOS Emergency Button */}
              <button 
                onClick={() => setShowSosModal(true)}
                className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs flex items-center space-x-1 shadow-md animate-pulse"
              >
                <span>🚨 SOS</span>
              </button>

              {/* Online/Offline Toggle */}
              <button 
                onClick={toggleOnline}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm ${
                  driverProfile?.status === 'active' || driverProfile?.status === 'busy'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {driverProfile?.status === 'active' || driverProfile?.status === 'busy' ? (
                  <>
                    <FaToggleOn className="h-5 w-5" />
                    <span>ONLINE</span>
                  </>
                ) : (
                  <>
                    <FaToggleOff className="h-5 w-5" />
                    <span>OFFLINE</span>
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Earnings & Pickups Today Compact Summary Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-lg flex-shrink-0 border border-emerald-500/20">
                <FaCoins />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">₹1,250</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Today's Earnings</span>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center text-lg flex-shrink-0 border border-sky-500/20">
                <FaCheckCircle />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white block">{recentCompleted.length || 8}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Pickups Completed</span>
              </div>
            </div>
          </div>

          {/* Main Grid: Active Pickup & Route Navigation Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols - Single Clean Google Route Map & Active Job */}
            <div className="lg:col-span-2 space-y-5">
              
              {/* Single Clean Live Google Route Map */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <FaLocationArrow className="text-emerald-500" />
                    <span>Live Collection Navigation</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase">
                    GPS Active
                  </span>
                </div>

                <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
                  <GoogleRouteMap 
                    pickups={activePickup ? [activePickup] : []} 
                    height="224px" 
                    isDriver={true}
                  />
                </div>
              </div>

              {/* Current Active Assigned Job Card */}
              {activePickup ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">Current Assigned Job</h4>
                      <span className="text-[10px] text-slate-400 font-bold">Slot: {activePickup.pickupTimeSlot || '10:00 AM - 12:00 PM'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setShowCitizenChat(true)}
                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-black text-xs rounded-xl flex items-center space-x-1 border border-emerald-500/20"
                      >
                        <FaComments />
                        <span>Chat</span>
                      </button>
                      <a 
                        href="tel:+919876543210"
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-emerald-500 rounded-xl text-xs"
                        title="Call Customer"
                      >
                        <FaPhoneAlt />
                      </a>
                    </div>
                  </div>

                  {/* Address & Material Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Customer</span>
                      <p className="font-extrabold text-slate-900 dark:text-white">{activePickup.user?.name || 'Arjun Sharma'}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Material & Weight</span>
                      <p className="font-extrabold text-emerald-600 dark:text-emerald-400">{activePickup.wasteCategory} (Est. {activePickup.estimatedWeight || 5}kg)</p>
                    </div>
                    <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                      <span className="text-[9px] text-slate-400 font-black uppercase">Pickup Address</span>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {activePickup.pickupAddress?.street || '123, Bharathi Street'}, {activePickup.pickupAddress?.city || 'Anna Nagar, Chennai'}
                      </p>
                    </div>
                  </div>

                  {/* Pickup Checklist & Completion Inputs */}
                  <div className="pt-2 space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer select-none p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                      <input 
                        type="checkbox" 
                        checked={checkedIn} 
                        onChange={(e) => setCheckedIn(e.target.checked)} 
                        className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-black text-slate-900 dark:text-white">1. Reached Customer Address</span>
                    </label>

                    {checkedIn && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs animate-fadeIn">
                        <span className="font-black text-slate-900 dark:text-white block">2. Enter Verified Weight & Complete</span>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase block mb-1">Actual Weight (kg)</label>
                            <input 
                              type="number"
                              value={actualWeight}
                              onChange={(e) => setActualWeight(e.target.value)}
                              placeholder="e.g. 5.0"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-black text-amber-500 uppercase block mb-1">Handover OTP</label>
                            <input 
                              type="text"
                              value={inputOtp}
                              onChange={(e) => setInputOtp(e.target.value)}
                              className="w-full px-3 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-300 font-mono font-bold rounded-xl border border-amber-500/30 text-xs"
                            />
                          </div>
                        </div>

                        {!aiAnalysisPreview ? (
                          <button
                            type="button"
                            onClick={handleRunAiAnalysis}
                            disabled={isScanning}
                            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold text-xs rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5"
                          >
                            <FaRobot />
                            <span>{isScanning ? 'AI Verifying Material...' : 'Run AI Inspection Scan'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleConfirmPickup(activePickup._id)}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-1.5"
                          >
                            <FaCheckCircle />
                            <span>Confirm Pickup & Credit Points (+{aiAnalysisPreview.pointsToAward})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2 text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-white text-sm">No Active Job Currently</p>
                  <span className="text-slate-400 font-medium">Toggle status to ONLINE to receive automatic job dispatches.</span>
                </div>
              )}
            </div>

            {/* Right Col - Upcoming Sequence (Max 3) & Recent Completed (Max 3) */}
            <div className="space-y-5">
              
              {/* Upcoming Pickup Sequence (Next 3 Jobs) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Next 3 Assigned Jobs</h4>
                  <span className="text-[10px] text-emerald-500 font-black">{upcomingPickups.length} queued</span>
                </div>

                <div className="space-y-2 text-xs">
                  {upcomingPickups.map((pickup, idx) => (
                    <div key={pickup._id || idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{pickup.user?.name || 'Customer'}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">{pickup.wasteCategory} • {pickup.estimatedWeight || 5}kg</span>
                        </div>
                        <button 
                          onClick={() => handleAccept(pickup._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] rounded-xl shadow"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}

                  {upcomingPickups.length === 0 && (
                    <p className="text-center text-[10px] text-slate-400 py-3 font-semibold">No pending jobs in queue.</p>
                  )}
                </div>
              </div>

              {/* Recent Completed Pickups (Max 3) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Recent Completed Pickups</h4>
                  <span className="text-[10px] text-emerald-500 font-black">History</span>
                </div>

                <div className="space-y-2 text-xs">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">Sector 4 Pickup #{i + 101}</p>
                        <span className="text-[9px] text-slate-400 font-semibold">Paper, Plastic • 5.0 kg</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-500">+175 pts</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* SOS Emergency Modal */}
          {showSosModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center space-y-4">
                <FaExclamationTriangle className="h-12 w-12 text-rose-500 mx-auto animate-bounce" />
                <h4 className="font-black text-slate-900 dark:text-white text-lg">SOS Dispatch Alert</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Emergency support & municipal authorities notified with your live GPS location.</p>
                <button 
                  onClick={() => setShowSosModal(false)}
                  className="w-full py-3 bg-rose-600 text-white font-black text-xs rounded-2xl"
                >
                  Return to Console
                </button>
              </div>
            </div>
          )}

          {/* Citizen <-> Driver Live Chat Modal */}
          <DriverChatModal
            isOpen={showCitizenChat}
            onClose={() => setShowCitizenChat(false)}
            pickupId={activePickup?._id}
            recipientName={activePickup?.user?.name || 'Customer Arjun Sharma'}
            recipientRole="user"
          />

        </main>
      </div>
    </div>
  );
};

export default DriverDashboard;
