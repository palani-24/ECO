import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaBars, FaBell, FaSearch, FaQrcode, FaTimes, FaCheck, 
  FaCalendarAlt, FaMapMarkerAlt, FaWeightHanging, FaChevronRight, 
  FaHome, FaClipboardList, FaPlus, FaUsers, FaUser, FaClock, FaTruck, FaLeaf,
  FaCoins, FaWallet, FaAward, FaComments, FaPhone, FaArrowRight, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';
import MobileCitizenNav from './MobileCitizenNav';

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
      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="16" width="13" height="26" rx="4" fill="#38BDF8" fillOpacity="0.8" stroke="#0284C7" strokeWidth="2" />
        <rect x="13" y="10" width="7" height="6" rx="2" fill="#0284C7" />
        <line x1="12" y1="24" x2="21" y2="24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="28" x2="21" y2="28" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
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
      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="8" width="22" height="30" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        <rect x="10" y="12" width="22" height="30" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
        <path d="M26 12L32 18H28C26.8954 18 26 17.1046 26 16V12Z" fill="#F59E0B" />
        <line x1="14" y1="22" x2="28" y2="22" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="14" y1="26" x2="28" y2="26" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
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
      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="18" width="14" height="24" rx="4" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        <ellipse cx="15" cy="18" rx="7" ry="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="15" cy="42" rx="7" ry="2" fill="#64748B" />
        <rect x="24" y="12" width="16" height="30" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        <ellipse cx="32" cy="12" rx="8" ry="3.5" fill="#E2E8F0" stroke="#475569" strokeWidth="1.5" />
        <ellipse cx="32" cy="42" rx="8" ry="2.5" fill="#64748B" />
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
      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="28" height="28" rx="4" fill="#10B981" stroke="#047857" strokeWidth="2" />
        <rect x="18" y="18" width="12" height="12" rx="2" fill="#047857" stroke="#A7F3D0" strokeWidth="1" />
        <line x1="14" y1="6" x2="14" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="24" y1="6" x2="24" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        <line x1="34" y1="6" x2="34" y2="10" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
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

const MobileEcoHome = ({ 
  pickups = [], 
  analytics = null, 
  activePickup = null,
  onPickupCreated, 
  onOpenScanner,
  onOpenUpi,
  onOpenCert,
  onOpenStory
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { lang, setLang } = useLanguage() || { lang: 'en', setLang: () => {} };
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

  // Dynamic user points calculation
  const walletPoints = analytics?.walletPoints ?? user?.points ?? 0;
  const inrValue = Math.round(walletPoints * 0.25);

  // Auto-slide hero banner
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
        <div className="px-4 py-2.5 flex items-center justify-between">
          
          {/* Hamburger Menu Icon */}
          <button 
            type="button" 
            onClick={() => {
              triggerHaptic(20);
              setShowDrawer(true);
            }}
            className="p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
            aria-label="Open menu"
          >
            <FaBars className="text-lg" />
          </button>

          {/* Center App Logo Title */}
          <div className="flex items-center space-x-1.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <span className="text-base font-black tracking-wider uppercase">
              ECOREWARD
            </span>
          </div>

          {/* Right Controls: Language Selector & Notifications */}
          <div className="flex items-center space-x-1.5">
            {/* Language Toggle Pill */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (setLang) setLang(lang === 'ta' ? 'en' : 'ta');
              }}
              className="text-[10px] font-black px-2 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/20 uppercase cursor-pointer"
              title="Switch Language"
            >
              {lang === 'ta' ? 'தமிழ்' : 'EN'}
            </button>

            {/* Notification Bell with Red Badge */}
            <button 
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setShowNotificationModal(true);
              }}
              className="relative p-2 rounded-xl hover:bg-emerald-500/30 transition active:scale-95 cursor-pointer"
              aria-label="Notifications"
            >
              <FaBell className="text-base" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-emerald-700 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>

        {/* 2. SEARCH & QR SCANNER BAR */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-full px-3.5 py-2 shadow-inner border border-emerald-400/30 text-slate-800 dark:text-slate-100">
            <FaSearch className="text-slate-400 text-xs mr-2 flex-shrink-0" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for pickup request..."
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
              className="p-1 text-emerald-600 dark:text-emerald-400 hover:scale-110 active:scale-95 transition flex-shrink-0 cursor-pointer"
              title="Open AI Waste & QR Scanner"
            >
              <FaQrcode className="text-base" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER */}
      <div className="px-4 py-3 space-y-3.5 max-w-lg mx-auto">
        
        {/* 3. CITIZEN REWARDS & WALLET CARD (From Image 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm border border-amber-500/20">
                <FaCoins />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block leading-tight">EcoPoints Wallet</span>
                <span className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {walletPoints} <span className="text-xs text-emerald-600 dark:text-emerald-400">pts</span>
                  <span className="text-[10px] font-medium text-slate-400 ml-1.5">(≈ ₹{inrValue})</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  if (onOpenUpi) onOpenUpi();
                }}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black shadow-sm transition flex items-center space-x-1 cursor-pointer"
              >
                <FaWallet className="text-[9px]" />
                <span>Withdraw UPI</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/redeem')}
                className="px-2 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition hover:bg-slate-200 cursor-pointer"
              >
                Rewards
              </button>
            </div>
          </div>
        </div>

        {/* 4. HERO PROMO BANNER (Matching Green Card in Screenshot 1) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white p-4 shadow-md">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-2 flex-1">
              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                Doorstep Scrap Pickup
              </span>
              <h2 className="text-sm font-black leading-snug">
                Schedule & track your doorstep pickup request
              </h2>
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic(20);
                  const el = document.getElementById('quick-submit-box');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-3 py-1.5 rounded-full bg-white text-emerald-700 font-extrabold text-[10px] shadow hover:bg-emerald-50 active:scale-95 transition cursor-pointer"
              >
                Book Now
              </button>
            </div>

            {/* Vector Illustration */}
            <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 drop-shadow" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="18" y="24" width="28" height="34" rx="4" fill="#047857" />
                <rect x="14" y="18" width="36" height="6" rx="2" fill="#059669" />
                <rect x="26" y="14" width="12" height="4" rx="2" fill="#10B981" />
                <path d="M32 30L34 34H30L32 30Z" fill="white" />
                <path d="M36 36L38 40H34L36 36Z" fill="white" />
                <path d="M28 36L26 40H30L28 36Z" fill="white" />
              </svg>
            </div>
          </div>

          {/* Carousel Dots */}
          <div className="flex justify-center items-center space-x-1.5 pt-2">
            {[0, 1, 2].map(idx => (
              <span 
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  carouselIndex === idx ? 'w-3.5 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 5. WASTE PICKUP REQUEST - CATEGORY HORIZONTAL SLIDER (Image 1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Waste Pickup Request
            </h3>
            <button 
              type="button" 
              onClick={() => navigate('/schedule-pickup')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              See All
            </button>
          </div>

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
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-slate-900 shadow-sm ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="py-0.5">
                    {cat.icon}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 ${
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

        {/* 6. QUICK REQUEST FORM CARD (Image 1) */}
        <div 
          id="quick-submit-box"
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5"
        >
          {/* Estimated weight selector */}
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-400 uppercase flex items-center justify-between">
              <span>Estimated Weight</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">{selectedWeight} kg Selected</span>
            </label>
            <select
              value={selectedWeight}
              onChange={(e) => setSelectedWeight(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              {WEIGHT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Address Input */}
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 dark:text-slate-400 uppercase">
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

          {/* Submit Request Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            onClick={handleSubmitRequest}
            className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
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

        {/* 7. LIVE ACTIVE PICKUP TELEMATICS (If citizen has an active pickup) */}
        {activePickup && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                  Live Active Pickup
                </h4>
              </div>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {activePickup.status}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div>
                <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                  {activePickup.driver?.user?.name || 'Driver Assigned'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  {activePickup.driver?.vehicleNumber || 'EV Green Fleet'} • {activePickup.wasteCategory}
                </p>
              </div>
              {activePickup.otpCode && (
                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-400 block">OTP Code</span>
                  <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {activePickup.otpCode}
                  </span>
                </div>
              )}
            </div>

            {/* 4-Step Milestone Progress */}
            <div className="grid grid-cols-4 gap-1 text-center pt-1 border-t border-emerald-500/20 text-[9px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400 font-black">1. Booked</span>
              <span className={activePickup.status !== 'pending' ? 'text-emerald-600 font-black' : 'text-slate-400'}>2. Assigned</span>
              <span className={activePickup.status === 'in_transit' || activePickup.status === 'accepted' ? 'text-amber-500 font-black animate-pulse' : 'text-slate-400'}>3. En Route</span>
              <span className={activePickup.status === 'completed' ? 'text-emerald-600 font-black' : 'text-slate-400'}>4. Paid</span>
            </div>
          </div>
        )}

        {/* 8. VERIFIED ENVIRONMENTAL IMPACT BENTO (From Image 2) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Verified Environmental Impact
            </h3>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (onOpenCert) onOpenCert();
              }}
              className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1 cursor-pointer"
            >
              <FaAward className="text-[10px]" />
              <span>Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="text-base block">🌳</span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {analytics?.treesSaved || '0.4'}
              </span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">Trees Saved</span>
            </div>

            <div className="p-2 bg-teal-500/10 rounded-xl border border-teal-500/20">
              <span className="text-base block">⚖️</span>
              <span className="text-xs font-black text-teal-600 dark:text-teal-400 block mt-0.5">
                {analytics?.totalRecycledKg || '0'} kg
              </span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">Recycled Scrap</span>
            </div>

            <div className="p-2 bg-sky-500/10 rounded-xl border border-sky-500/20">
              <span className="text-base block">🌍</span>
              <span className="text-xs font-black text-sky-600 dark:text-sky-400 block mt-0.5">
                {analytics?.co2Reduced || '0'} kg
              </span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">CO₂ Offset</span>
            </div>
          </div>
        </div>

        {/* 9. WASTE REQUESTS / RECENT BOOKINGS (Image 1) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Waste Requests
            </h3>
            <button 
              type="button" 
              onClick={() => navigate('/my-pickups')}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <span>See All</span>
              <FaChevronRight className="text-[8px]" />
            </button>
          </div>

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
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-sm flex-shrink-0">
                        <FaTruck />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {pickup.wasteCategory || 'Mixed Recyclables'}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {pickup.pickupAddress?.street || 'Doorstep Collection'} • {pickup.estimatedWeight || 5} kg
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center space-y-1">
              <span className="text-xl block">🌱</span>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No active pickup requests right now
              </p>
              <p className="text-[10px] text-slate-400">
                Choose a category above and tap Submit request to book doorstep collection!
              </p>
            </div>
          )}
        </div>

      </div>

      {/* UNIFIED CITIZEN BOTTOM NAVIGATION BAR */}
      <MobileCitizenNav />

      {/* NOTIFICATION MODAL */}
      <AnimatePresence>
        {showNotificationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FaBell className="text-emerald-500" />
                  <span>Citizen Notifications</span>
                </h3>
                <button onClick={() => setShowNotificationModal(false)} className="text-slate-400 p-1">
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🔔 Welcome to EcoReward!</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Turn your recyclable scrap into EcoPoints & direct bank cash payouts.</p>
                </div>
                <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-500/20">
                  <p className="font-bold text-slate-900 dark:text-white">🚚 Daily Pickup Service Active</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drivers are collecting recyclables across Chennai zones.</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNotificationModal(false)}
                className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs cursor-pointer"
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
