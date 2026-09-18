import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, 
  FaCamera, FaLeaf, FaCoins, FaTrash, FaCheckCircle,
  FaWeightHanging, FaArrowRight, FaCrosshairs, FaPlus, FaMinus
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MobileCitizenHeader from './MobileCitizenHeader';
import MobileCitizenNav from './MobileCitizenNav';
import api from '../utils/api';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

// Expanded Categories with illustrations and scrap rates
const CATEGORIES = [
  {
    id: 'plastic',
    name: 'PLASTIC',
    rateNum: 35,
    rateText: '₹35/kg',
    desc: 'Bottles, containers, poly',
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
    desc: 'Newspapers, cartons, books',
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
    desc: 'Iron, cans, brass, copper',
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
    desc: 'Laptops, cables, batteries',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="12" width="24" height="26" rx="4" fill="#A7F3D0" stroke="#059669" strokeWidth="2" />
        <circle cx="24" cy="25" r="4" fill="#047857" />
        <path d="M19 8C19 6.89543 19.8954 6 21 6H27C28.1046 6 29 6.89543 29 8V12H19V8Z" fill="#059669" />
      </svg>
    )
  },
  {
    id: 'glass',
    name: 'GLASS',
    rateNum: 15,
    rateText: '₹15/kg',
    desc: 'Bottles, glass jars, cullet',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="17" y="18" width="14" height="24" rx="3" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2" />
        <rect x="20" y="10" width="8" height="8" rx="2" fill="#38BDF8" />
        <line x1="21" y1="26" x2="27" y2="26" stroke="#0369A1" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'cardboard',
    name: 'CARDBOARD',
    rateNum: 18,
    rateText: '₹18/kg',
    desc: 'Delivery cartons, corrugated',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 18L24 10L36 18L24 26L12 18Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
        <path d="M12 18V32L24 40V26L12 18Z" fill="#D97706" />
        <path d="M36 18V32L24 40V26L36 18Z" fill="#B45309" />
      </svg>
    )
  },
  {
    id: 'rubber',
    name: 'RUBBER',
    rateNum: 20,
    rateText: '₹20/kg',
    desc: 'Scrap tyres, tubes, rubber',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" fill="#475569" stroke="#1E293B" strokeWidth="3" />
        <circle cx="24" cy="24" r="8" fill="#F8FAFC" stroke="#334155" strokeWidth="2" />
      </svg>
    )
  },
  {
    id: 'clothes',
    name: 'TEXTILES',
    rateNum: 12,
    rateText: '₹12/kg',
    desc: 'Old clothes, linens, fabrics',
    icon: (
      <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10L24 16L30 10L38 16L34 24L30 22V38H18V22L14 24L10 16L18 10Z" fill="#C084FC" stroke="#7E22CE" strokeWidth="2" />
      </svg>
    )
  }
];

const PRESET_WEIGHTS = [5, 10, 20, 50];

const TIME_SLOTS = [
  '10:00 AM - 12:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const MobileSchedulePickup = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCategories, setSelectedCategories] = useState(['plastic']);
  const [weightInput, setWeightInput] = useState('8');
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

  // Parse numeric weight safely
  const numericWeight = Math.max(0.5, parseFloat(weightInput) || 5);

  const toggleCategory = (catId) => {
    triggerHaptic(20);
    setSelectedCategories(prev => {
      if (prev.includes(catId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(c => c !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const adjustWeight = (delta) => {
    triggerHaptic(15);
    const curr = parseFloat(weightInput) || 5;
    const nextVal = Math.max(1, Math.min(200, Math.round((curr + delta) * 10) / 10));
    setWeightInput(String(nextVal));
  };

  // Calculate estimated earnings
  const averageRate = selectedCategories.reduce((acc, catId) => {
    const item = CATEGORIES.find(c => c.id === catId);
    return acc + (item ? item.rateNum : 30);
  }, 0) / (selectedCategories.length || 1);

  const estimatedPoints = Math.round(numericWeight * averageRate);
  const estimatedCash = Math.round(estimatedPoints * 0.25);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast('Please select a photo under 5MB', 'warning');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        addToast('Scrap photo attached successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!address.trim()) {
      addToast('Please enter your doorstep pickup address', 'warning');
      return;
    }

    if (numericWeight <= 0) {
      addToast('Please enter a valid weight in KG', 'warning');
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
      wasteCategory: `${catNames} (${numericWeight}kg)`,
      estimatedWeight: numericWeight,
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
        addToast(`🎉 Pickup request submitted for ${catNames}! Driver assigned shortly.`, 'success', 'Pickup Booked');
        setTimeout(() => navigate('/my-pickups'), 1000);
      } else {
        addToast(res.data?.message || 'Failed to submit pickup request', 'error');
      }
    } catch (err) {
      setIsSubmitting(false);
      const msg = err.response?.data?.message || 'Could not schedule pickup. Please try again.';
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

      <div className="px-4 py-3.5 space-y-4 max-w-lg mx-auto">

        {/* 2. PROMO BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20">
              DOORSTEP SCRAP PICKUP
            </span>
            <h2 className="text-sm font-black leading-snug pt-0.5">
              Mix & match scrap categories, earn EcoPoints & instant cash!
            </h2>
            <p className="text-[10px] text-emerald-100 font-medium">
              Verified EV green fleet drivers with certified digital scales collect at your doorstep.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* 3. EXPANDED CATEGORY SELECTION (Grid of 8 Scrap Types) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              1. Select Waste Categories
            </h3>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
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
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-900 transition-all border shadow-sm cursor-pointer ${
                    isSelected 
                      ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02] bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-slate-800 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="h-10 flex items-center justify-center">
                    {cat.icon}
                  </div>
                  <span className={`text-[9px] font-black mt-1 leading-tight ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {cat.name}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">
                    {cat.rateText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MANUAL & PRESET WEIGHT SELECTOR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              2. Estimated Weight (KG)
            </label>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {numericWeight} KG TOTAL
            </span>
          </div>

          {/* Manual Input with Stepper (+ / -) */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => adjustWeight(-1)}
              className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-base flex items-center justify-center transition active:scale-90 cursor-pointer"
              aria-label="Decrease weight"
            >
              <FaMinus />
            </button>

            <div className="flex-1 relative">
              <input 
                type="number"
                step="0.5"
                min="0.5"
                max="500"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="Enter weight in kg"
                className="w-full py-2.5 px-3 text-center bg-slate-50 dark:bg-slate-800 rounded-xl text-base font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                kg
              </span>
            </div>

            <button
              type="button"
              onClick={() => adjustWeight(1)}
              className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center transition active:scale-90 cursor-pointer shadow-sm shadow-emerald-600/30"
              aria-label="Increase weight"
            >
              <FaPlus />
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Presets:</span>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {PRESET_WEIGHTS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setWeightInput(String(w));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                    numericWeight === w 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {w} kg
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. DATE & TIME SLOT */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
            3. Pickup Slot & Schedule
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Pickup Date</span>
              <input 
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 block mb-1">Pickup Time</span>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 outline-none focus:ring-1 focus:ring-emerald-500"
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
              4. Doorstep Address
            </label>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(20);
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    () => {
                      setAddress('Flat 3B, Green Residency, Anna Nagar West, Chennai');
                      addToast('📍 GPS Location detected!', 'success');
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
              className="w-full pl-8 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
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
              <p className="text-[10px] text-slate-400">Helps EV driver bring the right bag sizes</p>
            </div>
          </div>

          <label className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition">
            {photoPreview ? 'Change' : 'Attach'}
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </label>
        </div>

        {/* 8. ESTIMATED EARNINGS SUMMARY */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FaCoins className="text-amber-500 text-xl" />
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Estimated Value: +{estimatedPoints} EcoPoints
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">
                ≈ ₹{estimatedCash} direct UPI bank payout value
              </span>
            </div>
          </div>
        </div>

        {/* 9. SUBMIT BUTTON */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-600/30 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Scheduling Driver Dispatch...</span>
          ) : (
            <>
              <FaLeaf />
              <span>Submit Pickup Request</span>
            </>
          )}
        </button>

      </div>

      {/* STICKY BOTTOM NAV BAR (4 Tabs) */}
      <MobileCitizenNav />

    </div>
  );
};

export default MobileSchedulePickup;
