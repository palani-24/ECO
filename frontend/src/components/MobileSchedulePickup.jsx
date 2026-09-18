import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, 
  FaCamera, FaLeaf, FaCoins, FaTrash, FaCheckCircle,
  FaWeightHanging, FaArrowRight, FaCrosshairs
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MobileCitizenHeader from './MobileCitizenHeader';
import MobileCitizenNav from './MobileCitizenNav';
import api from '../utils/api';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const CATEGORIES = [
  {
    id: 'plastic',
    name: 'PLASTIC',
    rateNum: 35,
    rateText: '₹35/kg',
    color: 'from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-900/30',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="16" width="13" height="26" rx="4" fill="#38BDF8" fillOpacity="0.8" stroke="#0284C7" strokeWidth="2" />
        <rect x="13" y="10" width="7" height="6" rx="2" fill="#0284C7" />
        <rect x="25" y="14" width="13" height="28" rx="4" fill="#0EA5E9" stroke="#0369A1" strokeWidth="2" />
        <rect x="28" y="8" width="7" height="6" rx="2" fill="#0369A1" />
      </svg>
    )
  },
  {
    id: 'paper',
    name: 'PAPER',
    rateNum: 22,
    rateText: '₹22/kg',
    color: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-900/30',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="8" width="22" height="30" rx="3" fill="#FDE68A" stroke="#D97706" strokeWidth="2" />
        <rect x="10" y="12" width="22" height="30" rx="3" fill="#FEF3C7" stroke="#B45309" strokeWidth="2" />
        <path d="M26 12L32 18H28C26.8954 18 26 17.1046 26 16V12Z" fill="#F59E0B" />
      </svg>
    )
  },
  {
    id: 'metal',
    name: 'METAL',
    rateNum: 48,
    rateText: '₹48/kg',
    color: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="20" width="13" height="22" rx="3" fill="#94A3B8" stroke="#475569" strokeWidth="2" />
        <ellipse cx="16.5" cy="20" rx="6.5" ry="3" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
        <rect x="25" y="14" width="14" height="28" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
        <ellipse cx="32" cy="14" rx="7" ry="3" fill="#94A3B8" stroke="#334155" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'ewaste',
    name: 'E-WASTE',
    rateNum: 65,
    rateText: '₹65/kg',
    color: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-900/30',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="24" height="26" rx="4" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
        <circle cx="24" cy="25" r="4" fill="#047857" />
        <path d="M19 8C19 6.89543 19.8954 6 21 6H27C28.1046 6 29 6.89543 29 8V12H19V8Z" fill="#059669" />
      </svg>
    )
  }
];

const WEIGHT_OPTIONS = [
  { label: '1 - 5 kg (Small Bag)', value: 3 },
  { label: '5 - 10 kg (Standard Box)', value: 8 },
  { label: '10 - 25 kg (Medium Sacks)', value: 15 },
  { label: '25+ kg (Bulk Pickup)', value: 30 }
];

const TIME_SLOTS = [
  '10:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const MobileSchedulePickup = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState(['plastic']);
  const [selectedWeight, setSelectedWeight] = useState(8);
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[0]);
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [address, setAddress] = useState(
    user?.addresses?.[0]?.street || '12-A, Metro Heights, Anna Nagar, Chennai'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const toggleCategory = (catId) => {
    triggerHaptic(20);
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // keep at least 1
        return prev.filter(c => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  // Estimate earnings
  const averageRate = selectedCategories.reduce((acc, catId) => {
    const item = CATEGORIES.find(c => c.id === catId);
    return acc + (item ? item.rateNum : 30);
  }, 0) / (selectedCategories.length || 1);

  const estimatedPoints = Math.round(selectedWeight * averageRate);
  const estimatedCash = Math.round(estimatedPoints * 0.25);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Please choose a photo under 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        addToast('Waste photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!address.trim()) {
      addToast('Please enter your pickup address', 'warning');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic(40);

    const catNames = selectedCategories
      .map(cid => {
        const c = CATEGORIES.find(it => it.id === cid);
        return c ? c.name : cid;
      })
      .join(', ');

    const payload = {
      wasteCategory: `${catNames} (${selectedWeight}kg)`,
      estimatedWeight: selectedWeight,
      pickupDate,
      pickupTimeSlot: selectedSlot,
      pickupAddress: {
        street: address,
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600040'
      },
      wasteImageUrl: photoPreview || undefined,
      notes: 'Scheduled via Mobile App'
    };

    try {
      const res = await api.post('/user/pickups', payload);
      setIsSubmitting(false);

      if (res.data?.success) {
        triggerHaptic(70);
        triggerConfetti();
        soundFx.playSuccessChime();
        addToast(`🎉 Pickup booked for ${catNames}! Driver assigned shortly.`, 'success', 'Request Confirmed');
        setTimeout(() => navigate('/my-pickups'), 1200);
      } else {
        addToast(res.data?.message || 'Failed to submit pickup request', 'error');
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.response?.data?.message || 'Could not submit request. Please try again.';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. GREEN APP HEADER */}
      <MobileCitizenHeader 
        title="Schedule Waste Pickup" 
        showBack={true} 
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* 2. PROMO BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              DOORSTEP SCRAP PICKUP
            </span>
            <h2 className="text-base font-black leading-tight pt-1">
              Mix & match scrap, earn EcoPoints & instant cash!
            </h2>
            <p className="text-[11px] text-emerald-100 font-medium">
              Verified EV drivers with digital weight scales collect right at your doorstep.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 3. CATEGORY SELECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Waste Materials
            </h3>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {selectedCategories.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-2xl bg-white dark:bg-slate-900 transition-all border shadow-sm cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]' 
                      : 'border-slate-200 dark:border-slate-800 opacity-80'
                  }`}
                >
                  <div className="h-11 flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className={`text-[11px] font-black mt-1 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                    {cat.rateText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. WEIGHT SELECTOR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              2. Estimated Weight
            </label>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {selectedWeight} KG SELECTED
            </span>
          </div>

          <select
            value={selectedWeight}
            onChange={(e) => {
              triggerHaptic(20);
              setSelectedWeight(Number(e.target.value));
            }}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {WEIGHT_OPTIONS.map((opt, i) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 5. DATE & TIME SLOT */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
            3. Date & Time Slot
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Pickup Date</span>
              <input 
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Pickup Time</span>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none"
              >
                {TIME_SLOTS.map((slot, idx) => (
                  <option key={idx} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 6. PICKUP ADDRESS */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              4. Pickup Address
            </label>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setAddress('Flat 3B, Green Residency, Anna Nagar West, Chennai');
                      addToast('📍 Location detected via GPS!', 'success');
                    },
                    () => addToast('GPS permission denied. Using default address.', 'info')
                  );
                }
              }}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 cursor-pointer"
            >
              <FaCrosshairs />
              <span>Use GPS</span>
            </button>
          </div>

          <div className="relative">
            <FaMapMarkerAlt className="absolute left-3 top-3 text-emerald-500 text-xs" />
            <input 
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Flat No, Street, Landmark, Chennai"
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 7. OPTIONAL WASTE PHOTO */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-sm border border-emerald-500/20">
              <FaCamera />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900 dark:text-white">Waste Photo (Optional)</p>
              <p className="text-[10px] text-slate-400">Helps driver prepare adequate bag size</p>
            </div>
          </div>

          <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition">
            {photoPreview ? 'Change' : 'Attach'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        {/* 8. ESTIMATED VALUE SUMMARY */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaCoins className="text-amber-500 text-base" />
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Estimated Earnings: +{estimatedPoints} EcoPoints
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                ≈ ₹{estimatedCash} direct bank cash / UPI value
              </span>
            </div>
          </div>
        </div>

        {/* 9. SUBMIT BUTTON */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Scheduling Driver...</span>
          ) : (
            <>
              <FaLeaf />
              <span>Confirm & Schedule Pickup</span>
            </>
          )}
        </button>

      </div>

      {/* STICKY BOTTOM NAV BAR */}
      <MobileCitizenNav />

    </div>
  );
};

export default MobileSchedulePickup;
