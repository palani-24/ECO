import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaCheck, 
  FaCalendarAlt, FaMapMarkerAlt, FaWeightHanging, FaChevronRight, 
  FaHome, FaClipboardList, FaPlus, FaUsers, FaUser, FaClock, FaTruck, FaLeaf
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

// Category Definitions with Custom Vector Illustrations matching user's photo
const CATEGORIES = [
  {
    id: 'plastic',
    name: 'PLASTIC',
    rate: '₹35/kg',
    color: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-900/30',
    borderColor: 'border-sky-200 dark:border-sky-800',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bottle 1 */}
        <rect x="10" y="16" width="13" height="26" rx="4" fill="#38BDF8" fillOpacity="0.8" stroke="#0284C7" strokeWidth="2" />
        <rect x="13" y="10" width="7" height="6" rx="2" fill="#0284C7" />
        <line x1="12" y1="24" x2="21" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="28" x2="21" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        {/* Bottle 2 */}
        <rect x="25" y="14" width="13" height="28" rx="4" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
        <rect x="28" y="8" width="7" height="6" rx="2" fill="#0369A1" />
        <line x1="27" y1="22" x2="36" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="27" y1="26" x2="36" y2="26" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'paper',
    name: 'PAPER',
    rate: '₹22/kg',
    color: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Back Sheet */}
        <rect x="16" y="8" width="22" height="30" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        {/* Front Sheet */}
        <rect x="10" y="12" width="22" height="30" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
        {/* Folded Corner */}
        <path d="M26 12L32 18H28C26.8954 18 26 17.1046 26 16V12Z" fill="#F59E0B" />
        {/* Lines */}
        <line x1="14" y1="22" x2="28" y2="22" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="26" x2="28" y2="26" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="30" x2="24" y2="30" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'metal',
    name: 'METAL',
    rate: '₹48/kg',
    color: 'from-slate-100 to-gray-100 dark:from-slate-800/40 dark:to-gray-800/30',
    borderColor: 'border-slate-300 dark:border-slate-700',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Can 1 */}
        <rect x="8" y="18" width="14" height="24" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        <ellipse cx="15" cy="18" rx="7" ry="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="15" cy="42" rx="7" ry="2" fill="#64748B" />
        {/* Can 2 */}
        <rect x="24" y="12" width="16" height="30" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        <ellipse cx="32" cy="12" rx="8" ry="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="32" cy="42" rx="8" ry="2.5" fill="#64748B" />
        <line x1="28" y1="26" x2="36" y2="26" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'e-waste',
    name: 'E-WASTE',
    rate: '₹65/kg',
    color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/30',
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="28" height="28" rx="4" fill="#10B981" stroke="#047857" strokeWidth="2" />
        <rect x="18" y="18" width="12" height="12" rx="2" fill="#047857" stroke="#A7F3D0" strokeWidth="1" />
        <line x1="14" y1="6" x2="14" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="6" x2="24" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="6" x2="34" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="38" x2="14" y2="42" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="38" x2="24" y2="42" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="38" x2="34" y2="42" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
];

const WEIGHT_OPTIONS = [
  { label: '2 - 5 kg (Small Bag)', value: 5 },
  { label: '5 - 10 kg (Standard Box)', value: 8 },
  { label: '10 - 20 kg (Bulk Scrap)', value: 15 },
  { label: '20+ kg (Commercial / Multi-Box)', value: 25 }
];

const MobileEcoHome = ({ pickups = [], onPickupCreated, onOpenScanner }) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // State Management
  const [selectedCategory, setSelectedCategory] = useState('plastic');
  const [selectedWeight, setSelectedWeight] = useState(8);
  const [customAddress, setCustomAddress] = useState(
    user?.addresses?.[0]?.street 
      ? `${user.addresses[0].street}, ${user.addresses[0].city}` 
      : '12-A Metro Heights, Anna Nagar, Chennai'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-slide hero banner every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handle Quick Request Submission
  const handleSubmitRequest = async (e) => {
    if (e) e.preventDefault();

    if (!customAddress.trim()) {
      addToast('Please enter a valid pickup address', 'warning', 'Address Required');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(40);

    const categoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
    const categoryName = categoryObj.name.charAt(0) + categoryObj.name.slice(1).toLowerCase();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pickupDate = tomorrow.toISOString().split('T')[0];

    const payload = {
      wasteCategory: `${categoryName} (${selectedWeight}kg)`,
      estimatedWeight: selectedWeight,
      pickupDate,
      pickupTimeSlot: '10:00 AM - 12:00 PM',
      pickupAddress: {
        street: customAddress,
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600040'
      },
      notes: 'Submitted via 1-Click Mobile Quick Request'
    };

    try {
      const res = await api.post('/user/pickups', payload);
      setIsSubmitting(false);

      if (res.data?.success) {
        triggerHaptic(70);
        triggerConfetti();
        soundFx.playSuccessChime();
        addToast(`🎉 Pickup request submitted for ${categoryName}! Driver will be dispatched soon.`, 'success', 'Pickup Booked');

        if (onPickupCreated) {
          onPickupCreated(res.data.data);
        }
      } else {
        addToast(res.data?.message || 'Failed to submit pickup request', 'error');
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.response?.data?.message || 'Could not submit pickup request. Please try again.';
      addToast(msg, 'error');
    }
  };

  // Filter pickups by search query
  const filteredPickups = pickups.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.wasteCategory && p.wasteCategory.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q)) ||
      (p.pickupAddress?.street && p.pickupAddress.street.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-24 font-sans select-none">
      
      {/* 1. TOP GREEN APP HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Hamburger Menu Icon */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              setShowDrawer(true);
            }}
            className="p-1.5 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
            aria-label="Open menu"
          >
            <FaBars className="text-xl" />
          </button>

          {/* Center App Logo Title */}
          <h1 className="text-lg font-black tracking-wider uppercase font-sans">
            ECOREWARD
          </h1>

          {/* Notification Bell with Red Badge */}
          <button 
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setShowNotificationModal(true);
            }}
            className="relative p-1.5 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
            aria-label="Notifications"
          >
            <FaBell className="text-lg" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-emerald-700 rounded-full animate-pulse"></span>
          </button>
        </div>

        {/* 2. SEARCH & QR SCANNER BAR */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-full px-3.5 py-2 shadow-inner border border-emerald-400/30 text-slate-800 dark:text-slate-100">
            <FaSearch className="text-slate-400 text-sm mr-2 flex-shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for pickup Request"
              className="w-full bg-transparent text-xs font-semibold placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600 mr-1">
                <FaTimes className="text-xs" />
              </button>
            )}
            <button 
              type="button"
              onClick={() => {
                triggerHaptic(30);
                if (onOpenScanner) onOpenScanner();
              }}
              className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition flex-shrink-0 cursor-pointer"
              title="Open AI Waste & QR Scanner"
            >
              <FaQrcode className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <div className="px-4 py-3.5 space-y-4 max-w-lg mx-auto">
        
        {/* 3. HERO PROMO BANNER (Matching the green card in screenshot) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-4 shadow-md">
          {/* Subtle background circles */}
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                Doorstep Scrap Pickup
              </span>
              <h2 className="text-sm sm:text-base font-black leading-snug">
                Schedule & track your doorstep pickup request
              </h2>
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  const el = document.getElementById('quick-submit-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3.5 py-1.5 rounded-full bg-white text-emerald-700 font-extrabold text-[11px] shadow-md hover:bg-emerald-50 active:scale-95 transition cursor-pointer"
              >
                Book Now
              </button>
            </div>

            {/* Recycling bin vector illustration matching photo */}
            <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
              <svg className="w-18 h-18 drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="18" y="24" width="28" height="34" rx="4" fill="#047857" />
                <rect x="14" y="18" width="36" height="6" rx="2" fill="#059669" />
                <rect x="26" y="14" width="12" height="4" rx="2" fill="#10B981" />
                <path d="M32 30L34 34H30L32 30Z" fill="white" />
                <path d="M36 36L38 40H34L36 36Z" fill="white" />
                <path d="M28 36L26 40H30L28 36Z" fill="white" />
                <circle cx="24" cy="52" r="3" fill="#022C22" />
                <circle cx="40" cy="52" r="3" fill="#022C22" />
              </svg>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex justify-center items-center space-x-1.5 pt-2">
            {[0, 1, 2].map(idx => (
              <span 
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  carouselIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 4. WASTE PICKUP REQUEST - CATEGORY HORIZONTAL SLIDER */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Waste Pickup Request
            </h3>
            <button 
              type="button" 
              onClick={() => navigate('/schedule-pickup')}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

          {/* Horizontal scroll container */}
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.div 
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerHaptic(20);
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="py-1">
                    {cat.icon}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                    isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.name}
                  </span>
                  <span className="text-[8px] font-semibold text-slate-400">
                    {cat.rate}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 5. QUICK REQUEST FORM CARD (Matching screen details in user photo) */}
        <div 
          id="quick-submit-box"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3"
        >
          {/* Estimated weight selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase flex items-center justify-between">
              <span>Estimated Weight</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedWeight} kg Selected</span>
            </label>
            <div className="relative">
              <select
                value={selectedWeight}
                onChange={(e) => setSelectedWeight(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              >
                {WEIGHT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pickup Address Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-400 uppercase">
              Pickup Address
            </label>
            <div className="relative flex items-center">
              <FaMapMarkerAlt className="absolute left-3 text-emerald-500 text-xs" />
              <input 
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Enter Doorstep Pickup Address"
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Big Green Pill Submit Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            onClick={handleSubmitRequest}
            className="w-full py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <FaLeaf className="text-xs text-emerald-200" />
                <span>Submit request</span>
              </>
            )}
          </motion.button>
        </div>

        {/* 6. WASTE REQUESTS / RECENT PICKUPS */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Waste Requests
            </h3>
            <button 
              type="button" 
              onClick={() => navigate('/my-pickups')}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>See All</span>
              <FaChevronRight className="text-[9px]" />
            </button>
          </div>

          {/* Pickups List or Empty State */}
          {filteredPickups.length > 0 ? (
            <div className="space-y-2">
              {filteredPickups.slice(0, 3).map(pickup => {
                const isCompleted = pickup.status === 'completed';
                const isEnRoute = pickup.status === 'in_transit' || pickup.status === 'accepted';
                return (
                  <div 
                    key={pickup._id}
                    onClick={() => navigate('/my-pickups')}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-400/50 transition"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base flex-shrink-0">
                        <FaTruck />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {pickup.wasteCategory || 'Mixed Recyclables'}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {pickup.pickupAddress?.street || 'Doorstep Pickup'} • {pickup.estimatedWeight || 5} kg
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : isEnRoute
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse'
                          : 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                      }`}>
                        {pickup.status}
                      </span>
                      {pickup.otpCode && (
                        <span className="block text-[9px] font-mono font-bold text-slate-400 mt-0.5">
                          OTP: {pickup.otpCode}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center space-y-1">
              <span className="text-2xl block">🌱</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No active pickup requests right now
              </p>
              <p className="text-[10px] text-slate-400">
                Choose a category above and tap Submit request to book!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* 7. FIXED MOBILE BOTTOM NAVIGATION BAR (Matching screenshot bottom bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-1.5 px-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between relative">
          
          {/* 1: Home (Active) */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              navigate('/dashboard');
            }}
            className="flex flex-col items-center text-emerald-600 dark:text-emerald-400 flex-1 py-1 cursor-pointer"
          >
            <FaHome className="text-lg" />
            <span className="text-[9px] font-black mt-0.5">Home</span>
          </button>

          {/* 2: Requests / Pickups */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              navigate('/my-pickups');
            }}
            className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-1 py-1 cursor-pointer"
          >
            <FaClipboardList className="text-lg" />
            <span className="text-[9px] font-bold mt-0.5">Pickups</span>
          </button>

          {/* 3: Center Elevated Floating Green Action Button */}
          <div className="flex flex-col items-center flex-1 -mt-6">
            <button 
              type="button" 
              onClick={() => {
                triggerHaptic(30);
                navigate('/schedule-pickup');
              }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition cursor-pointer border-3 border-white dark:border-slate-900"
              title="New Pickup Request"
            >
              <FaPlus className="text-base" />
            </button>
            <span className="text-[9px] font-bold text-slate-500 mt-1">My Orders</span>
          </div>

          {/* 4: Community / Alerts */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              navigate('/community');
            }}
            className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-1 py-1 cursor-pointer"
          >
            <FaUsers className="text-lg" />
            <span className="text-[9px] font-bold mt-0.5">Community</span>
          </button>

          {/* 5: More / Profile */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              navigate('/profile');
            }}
            className="flex flex-col items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-1 py-1 cursor-pointer"
          >
            <FaUser className="text-lg" />
            <span className="text-[9px] font-bold mt-0.5">More</span>
          </button>

        </div>
      </nav>

      {/* MOBILE DRAWER MODAL (When hamburger is clicked) */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDrawer(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <img src="/app-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="text-xs font-black text-emerald-600">EcoReward</span>
                  </div>
                  <button onClick={() => setShowDrawer(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                    <FaTimes />
                  </button>
                </div>

                {/* User Profile snippet */}
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-base">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {user?.name || 'Citizen User'}
                    </h4>
                    <span className="text-[10px] text-emerald-600 font-bold">
                      {user?.points || 0} EcoPoints Balance
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1.5 text-xs font-bold">
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/schedule-pickup'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5"
                  >
                    <FaCalendarAlt className="text-emerald-500" />
                    <span>Schedule Pickup</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/my-pickups'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5"
                  >
                    <FaClipboardList className="text-teal-500" />
                    <span>My Pickups</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/redeem'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5"
                  >
                    <FaLeaf className="text-amber-500" />
                    <span>Eco Store & Rewards</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/leaderboard'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5"
                  >
                    <FaUsers className="text-sky-500" />
                    <span>Leaderboard</span>
                  </button>
                  <button 
                    onClick={() => { setShowDrawer(false); navigate('/profile'); }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center space-x-2.5"
                  >
                    <FaUser className="text-indigo-500" />
                    <span>Profile & Settings</span>
                  </button>
                </div>
              </div>

              {/* Logout button */}
              <button 
                onClick={() => {
                  logout();
                  setShowDrawer(false);
                  navigate('/login');
                }}
                className="w-full py-2.5 bg-rose-500/10 text-rose-600 font-bold text-xs rounded-xl hover:bg-rose-500/20 transition"
              >
                Log Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FaBell className="text-emerald-500" />
                  <span>Notifications</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🔔 Welcome to EcoReward!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Turn your recyclable scrap into EcoPoints & direct cash payouts.</p>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🚚 Daily Pickup Service Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drivers are currently collecting across Chennai zones.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MobileEcoHome;
