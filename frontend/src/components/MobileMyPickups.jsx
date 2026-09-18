import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCalendarAlt, FaTruck, FaClock, FaCheckCircle, 
  FaPhone, FaComments, FaRoute, FaCertificate, FaTimes, 
  FaExclamationTriangle, FaLeaf, FaCoins, FaMapMarkerAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import MobileCitizenHeader from './MobileCitizenHeader';
import MobileCitizenNav from './MobileCitizenNav';
import DriverChatModal from './DriverChatModal';
import GreenCertificateModal from './GreenCertificateModal';
import api from '../utils/api';
import { triggerHaptic } from '../utils/mobileNative';

const MobileMyPickups = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showChat, setShowChat] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);

  // Sync real-time updates
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      const updated = realtimeData.latestPickup;
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updated._id);
        if (index !== -1) {
          const arr = [...prev];
          arr[index] = { ...arr[index], ...updated };
          return arr;
        }
        return [updated, ...prev];
      });
    }
  }, [realtimeData?.latestPickup]);

  const fetchPickups = async () => {
    try {
      const res = await api.get('/user/pickups');
      if (res.data?.success) {
        setPickups(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load pickups', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  // Find the single active pickup
  const activePickup = pickups.find(p => ['pending', 'assigned', 'accepted', 'in_progress', 'en_route'].includes(p.status?.toLowerCase()));

  // Filter list
  const filteredPickups = pickups.filter(p => {
    if (filter === 'active') {
      return ['pending', 'assigned', 'accepted', 'in_progress', 'en_route'].includes(p.status?.toLowerCase());
    }
    if (filter === 'completed') {
      return p.status?.toLowerCase() === 'completed';
    }
    return true;
  }).filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.wasteCategory && p.wasteCategory.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    if (s === 'completed') {
      return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-black uppercase">COMPLETED</span>;
    }
    if (s === 'cancelled') {
      return <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 text-[10px] font-black uppercase">CANCELLED</span>;
    }
    return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 text-[10px] font-black uppercase">IN PROGRESS</span>;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. GREEN APP HEADER */}
      <MobileCitizenHeader 
        title="My Pickups & Tracking" 
        showBack={true}
        showSearch={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* 2. ACTIVE PICKUP CARD (If active pickup exists) */}
        {activePickup && (
          <div className="p-4 rounded-3xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-500/30 shadow-sm space-y-3">
            
            {/* Card Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Live Active Pickup
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase border border-emerald-500/30">
                {activePickup.status || 'PENDING'}
              </span>
            </div>

            {/* Driver & OTP Details */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {activePickup.driver?.user?.name ? `Driver ${activePickup.driver.user.name}` : 'Driver Assigned'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                  EV Green Fleet • {activePickup.wasteCategory || `${activePickup.estimatedWeight || 5} kg scrap`}
                </p>
              </div>

              {/* OTP Code Display */}
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-400 block leading-tight">
                  OTP Code
                </span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {activePickup.verificationCode || activePickup.otp || '4829'}
                </span>
              </div>
            </div>

            {/* 4-Step Progress Stepper */}
            <div className="pt-2 border-t border-emerald-500/20">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">1. Booked</span>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 rounded-full bg-emerald-500"></div>
                  <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400">2. Assigned</span>
                </div>
                <div className="space-y-1">
                  <div className={`h-1.5 rounded-full ${['accepted', 'en_route', 'in_progress', 'completed'].includes(activePickup.status) ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <span className="text-[9px] font-bold text-slate-500">3. En Route</span>
                </div>
                <div className="space-y-1">
                  <div className={`h-1.5 rounded-full ${activePickup.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                  <span className="text-[9px] font-bold text-slate-500">4. Collected</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Chat with Driver & Call */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  setSelectedPickup(activePickup);
                  setShowChat(true);
                }}
                className="flex-1 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs font-black text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 cursor-pointer"
              >
                <FaComments className="text-xs" />
                <span>Chat Driver</span>
              </button>

              <a
                href={`tel:${activePickup.driver?.user?.phone || '+919876543210'}`}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-sm active:scale-98 cursor-pointer"
              >
                <FaPhone className="text-xs" />
                <span>Call Driver</span>
              </a>
            </div>

          </div>
        )}

        {/* 3. FILTER CHIPS */}
        <div className="flex items-center space-x-2">
          {['all', 'active', 'completed'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setFilter(f);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all cursor-pointer ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {f === 'all' ? 'All Pickups' : f}
            </button>
          ))}
        </div>

        {/* 4. PICKUP CARDS LIST */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-400">Loading pickups...</p>
            </div>
          ) : filteredPickups.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-500 text-2xl">
                <FaTruck />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">No pickups found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Schedule your doorstep waste collection and start turning scrap into cash & points!
              </p>
              <button
                type="button"
                onClick={() => navigate('/schedule-pickup')}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-md cursor-pointer inline-flex items-center space-x-1.5"
              >
                <FaCalendarAlt />
                <span>Book a Pickup</span>
              </button>
            </div>
          ) : (
            filteredPickups.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5"
              >
                {/* Header line */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">♻️</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {item.wasteCategory || 'Mixed Dry Recyclables'}
                    </span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Details */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center space-x-1">
                    <FaCalendarAlt className="text-slate-400 text-[10px]" />
                    <span>{item.pickupDate ? new Date(item.pickupDate).toLocaleDateString() : 'Today'} • {item.pickupTimeSlot || 'Morning'}</span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    +{item.pointsEarned || Math.round((item.estimatedWeight || 5) * 35)} EcoPts
                  </span>
                </div>

                {/* Address snippet */}
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 truncate pt-1 border-t border-slate-100 dark:border-slate-800">
                  <FaMapMarkerAlt className="text-slate-400 text-[10px] shrink-0" />
                  <span className="truncate">{item.pickupAddress?.street || 'Anna Nagar, Chennai'}</span>
                </div>

                {/* Completed actions */}
                {item.status === 'completed' && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                      <FaCheckCircle />
                      <span>Verified Recycled</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCert(true)}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-[10px] font-bold border border-emerald-500/20 flex items-center space-x-1 cursor-pointer"
                    >
                      <FaCertificate />
                      <span>Certificate</span>
                    </button>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>

      {/* MODALS */}
      <DriverChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        pickupId={selectedPickup?._id}
        recipientName={selectedPickup?.driver?.user?.name || 'Driver Karthik Raja'}
        recipientRole="driver"
      />

      <GreenCertificateModal
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        totalWeight={user?.totalRecycledKg || 18}
        totalCO2={user?.co2Reduced || 24}
        points={user?.points || 1758}
      />

      {/* STICKY BOTTOM NAV BAR */}
      <MobileCitizenNav />

    </div>
  );
};

export default MobileMyPickups;
