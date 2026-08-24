import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserLayout from '../../components/UserLayout';
import AIWasteScanner from '../../components/AIWasteScanner';
import AIWasteScannerModal from '../../components/AIWasteScannerModal';
import GPSLocationPicker from '../../components/GPSLocationPicker';
import api from '../../utils/api';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, 
  FaCoins, FaInfoCircle, FaArrowRight, FaArrowLeft, 
  FaMagic, FaCheckCircle, FaMicrophone, FaSearch, 
  FaBuilding, FaHome, FaSlidersH, FaShieldAlt, FaLeaf, 
  FaTimes, FaPlus, FaMinus, FaCamera, FaImage, FaTrash, 
  FaCrosshairs, FaLock, FaQrcode, FaTruck, FaUpload
} from 'react-icons/fa';

const SchedulePickup = () => {
  const { user, addAddress } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [systemSettings, setSystemSettings] = useState(null);

  // Fetch Live Admin Settings (Material rates & Maintenance status)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data.success) {
          setSystemSettings(res.data.data);
        }
      } catch (err) {
        console.warn('Loading fallback material exchange rates');
      }
    };
    fetchSettings();
  }, []);

  const [step, setStep] = useState(1);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [customGPSAddress, setCustomGPSAddress] = useState(null);
  const [showGPSModal, setShowGPSModal] = useState(false);
  const [driverNotes, setDriverNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [pickupType, setPickupType] = useState('household'); // 'household' | 'bulk'
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showSegregationModal, setShowSegregationModal] = useState(false);
  const [segregationQuery, setSegregationQuery] = useState('');
  const [showAIScanner, setShowAIScanner] = useState(false);

  // Waste Photo Upload State
  const [wastePhoto, setWastePhoto] = useState(null);
  const [wastePhotoPreview, setWastePhotoPreview] = useState('');
  const [photoFileSize, setPhotoFileSize] = useState('');

  // Multi-Category Configuration State
  const [multiItems, setMultiItems] = useState([
    { category: 'Plastic', estimatedWeight: 5.0, rate: 10 },
    { category: 'Paper', estimatedWeight: 3.0, rate: 8 }
  ]);

  const categories = [
    { 
      name: 'Plastic', 
      rate: systemSettings?.rewardRates?.Plastic || 10, 
      desc: 'Bottles, containers, caps, polythene', 
      icon: '🥤', 
      badge: 'Popular', 
      gradient: 'from-pink-500/10 via-rose-500/5 to-purple-500/10 border-pink-500/30 text-pink-500',
      activeBorder: 'border-pink-500 ring-4 ring-pink-500/20'
    },
    { 
      name: 'Paper', 
      rate: systemSettings?.rewardRates?.Paper || 8, 
      desc: 'Newspapers, boxes, cartons, magazines', 
      icon: '📦', 
      badge: 'High Volume', 
      gradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-amber-500/30 text-amber-500',
      activeBorder: 'border-amber-500 ring-4 ring-amber-500/20'
    },
    { 
      name: 'Metal', 
      rate: systemSettings?.rewardRates?.Metal || 20, 
      desc: 'Aluminum cans, brass, copper, iron scrap', 
      icon: '🥫', 
      badge: 'Top Value', 
      gradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/30 text-emerald-500',
      activeBorder: 'border-emerald-500 ring-4 ring-emerald-500/20'
    },
    { 
      name: 'Glass', 
      rate: systemSettings?.rewardRates?.Glass || 6, 
      desc: 'Beverage bottles, jars, unbroken glassware', 
      icon: '🍼', 
      badge: '100% Recyclable', 
      gradient: 'from-blue-500/10 via-sky-500/5 to-indigo-500/10 border-blue-500/30 text-blue-500',
      activeBorder: 'border-blue-500 ring-4 ring-blue-500/20'
    },
    { 
      name: 'Organic', 
      rate: systemSettings?.rewardRates?.Organic || 4, 
      desc: 'Bio waste, kitchen vegetable peels, leaves', 
      icon: '🍎', 
      badge: 'Eco Compost', 
      gradient: 'from-lime-500/10 via-green-500/5 to-emerald-500/10 border-lime-500/30 text-lime-500',
      activeBorder: 'border-lime-500 ring-4 ring-lime-500/20'
    },
    { 
      name: 'E-Waste', 
      rate: systemSettings?.rewardRates?.['E-Waste'] || 15, 
      desc: 'Cables, laptop parts, batteries, gadgets', 
      icon: '💻', 
      badge: 'Hazardous AI', 
      gradient: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-violet-500/30 text-violet-500',
      activeBorder: 'border-violet-500 ring-4 ring-violet-500/20'
    }
  ];

  // Helper to toggle a category in Multi-Category mode
  const handleToggleCategory = (cat) => {
    const exists = multiItems.some(i => i.category === cat.name);
    if (exists) {
      if (multiItems.length === 1) {
        addToast('Please keep at least one waste material in your pickup bundle.', 'warning', 'Minimum 1 Material');
        return;
      }
      setMultiItems(prev => prev.filter(i => i.category !== cat.name));
    } else {
      setMultiItems(prev => [...prev, { category: cat.name, estimatedWeight: 5.0, rate: cat.rate }]);
      addToast(`➕ Added ${cat.name} (${cat.rate} pts/kg) to your pickup bundle!`, 'success', 'Material Added');
    }
  };

  const handleUpdateItemWeight = (index, val) => {
    const num = parseFloat(val);
    setMultiItems(prev => prev.map((item, idx) => 
      idx === index ? { ...item, estimatedWeight: isNaN(num) ? '' : Math.max(0.1, num) } : item
    ));
  };

  const handleAdjustWeightDelta = (index, delta) => {
    setMultiItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const current = parseFloat(item.estimatedWeight) || 1.0;
        const updated = Math.max(0.5, parseFloat((current + delta).toFixed(1)));
        return { ...item, estimatedWeight: updated };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index) => {
    if (multiItems.length <= 1) {
      addToast('At least one waste material category is required.', 'warning', 'Minimum 1 Required');
      return;
    }
    setMultiItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Image Upload & Camera Handler
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please upload a valid image file (JPG, PNG, WebP).', 'error', 'Invalid File');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB.', 'warning', 'File Too Large');
      return;
    }

    setPhotoFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target.result;
      setWastePhoto(file);
      setWastePhotoPreview(base64);
      addToast('📸 Waste pile photo attached successfully!', 'success', 'Photo Uploaded');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setWastePhoto(null);
    setWastePhotoPreview('');
    setPhotoFileSize('');
  };

  // Smart Segregation Database
  const segregationItems = [
    { item: 'TetraPak Juice Box', category: 'Paper', prep: 'Rinse, flatten, and separate plastic straw.' },
    { item: 'Plastic Water Bottle', category: 'Plastic', prep: 'Crush bottle, cap can stay on if plastic.' },
    { item: 'Laptop Battery / Charger', category: 'E-Waste', prep: 'Tape battery terminals with electrical tape.' },
    { item: 'Aluminum Soda Can', category: 'Metal', prep: 'Rinse thoroughly and crush flat.' },
    { item: 'Glass Jam Jar', category: 'Glass', prep: 'Wash out food residue, remove metal lid.' },
    { item: 'Cardboard Shipping Box', category: 'Paper', prep: 'Remove plastic tape and fold flat.' },
    { item: 'Vegetable Skins & Food Waste', category: 'Organic', prep: 'Drain liquid residue, keep in bio-degradable bag.' }
  ];

  const handleVoiceBooking = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
      setMultiItems([
        { category: 'Plastic', estimatedWeight: 10, rate: 10 },
        { category: 'Metal', estimatedWeight: 4, rate: 20 }
      ]);
      addToast('🎙️ Voice Command: "10 kg plastic and 4 kg metal scrap". Configured bundle!', 'info', 'Voice Booking');
    }, 2000);
  };

  const handleApplyAiData = (scannedData) => {
    if (scannedData.category) {
      const cat = scannedData.category.toLowerCase();
      let matchedName = 'Plastic';
      if (cat.includes('paper') || cat.includes('cardboard')) matchedName = 'Paper';
      else if (cat.includes('metal') || cat.includes('can')) matchedName = 'Metal';
      else if (cat.includes('e-waste') || cat.includes('electronic')) matchedName = 'E-Waste';
      else if (cat.includes('glass')) matchedName = 'Glass';
      else if (cat.includes('organic')) matchedName = 'Organic';

      const catObj = categories.find(c => c.name === matchedName);
      const wt = parseFloat(scannedData.estimatedWeight) || 5.0;

      setMultiItems(prev => {
        if (prev.some(i => i.category === matchedName)) {
          return prev.map(i => i.category === matchedName ? { ...i, estimatedWeight: wt } : i);
        }
        return [...prev, { category: matchedName, estimatedWeight: wt, rate: catObj?.rate || 10 }];
      });

      if (scannedData.previewUrl) {
        setWastePhotoPreview(scannedData.previewUrl);
      }
    }
    addToast(`AI Vision Auto-Filled: ${scannedData.category} (${scannedData.estimatedWeight || 5} kg)!`, 'success', 'Form Auto-Filled');
  };

  // Address creation form states
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '08:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 02:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM'
  ];

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await addAddress({ street: newStreet, city: newCity, state: newState, zipCode: newZipCode });
    setLoading(false);
    if (res.success) {
      setShowAddressForm(false);
      setNewStreet('');
      setNewCity('');
      setNewState('');
      setNewZipCode('');
      addToast('New address saved to your profile!', 'success', 'Address Saved');
    } else {
      setError(res.message);
    }
  };

  // Location handler from GPSLocationPicker modal
  const handleGPSLocationSelected = async (locData) => {
    setCustomGPSAddress(locData);
    setShowGPSModal(false);
    // Add to user profile automatically
    await addAddress({
      street: locData.street,
      city: locData.city,
      state: locData.state,
      zipCode: locData.zipCode
    });
    setSelectedAddressIndex(user?.addresses ? user.addresses.length : 0);
    addToast('📍 GPS Location detected and set for pickup collection!', 'success', 'GPS Location Set');
  };

  // Calculations
  const totalCalculatedWeight = parseFloat(multiItems.reduce((acc, curr) => acc + (parseFloat(curr.estimatedWeight) || 0), 0).toFixed(2));
  const totalCalculatedPoints = multiItems.reduce((acc, curr) => {
    const rate = categories.find(c => c.name === curr.category)?.rate || 10;
    return acc + Math.round((parseFloat(curr.estimatedWeight) || 0) * rate);
  }, 0);
  const estimatedCashbackRs = (totalCalculatedPoints * 0.25).toFixed(2);
  const estimatedCO2 = (totalCalculatedWeight * 1.5).toFixed(1);

  // Submit Handler
  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const activeAddress = customGPSAddress || (user?.addresses && user.addresses[selectedAddressIndex]);
    if (!activeAddress) {
      setError('Please provide or select a pickup address first.');
      setLoading(false);
      return;
    }

    const maxWeightLimit = pickupType === 'bulk' ? 500 : 100;
    if (totalCalculatedWeight <= 0 || totalCalculatedWeight > maxWeightLimit) {
      setError(`Estimated weight must be between 0.1 kg and ${maxWeightLimit} kg per request.`);
      setLoading(false);
      return;
    }

    const payload = {
      wasteCategory: multiItems.map(i => `${i.category} (${i.estimatedWeight}kg)`).join(', '),
      items: multiItems.map(i => ({
        category: i.category,
        estimatedWeight: parseFloat(i.estimatedWeight),
        ratePerKg: categories.find(c => c.name === i.category)?.rate || 10
      })),
      estimatedWeight: totalCalculatedWeight,
      pickupDate,
      pickupTimeSlot,
      pickupAddress: {
        street: activeAddress.street,
        city: activeAddress.city || 'Chennai',
        state: activeAddress.state || 'Tamil Nadu',
        zipCode: activeAddress.zipCode || '600001'
      },
      wasteImageUrl: wastePhotoPreview || undefined,
      notes: driverNotes,
      isRecurring,
      pickupType
    };

    try {
      const res = await api.post('/user/pickups', payload);
      setLoading(false);
      if (res.data.success) {
        addToast(`🚚 Pickup Order Dispatched! (${totalCalculatedWeight} kg • +${totalCalculatedPoints} EcoPoints est.)`, 'success', 'Order Confirmed');
        navigate('/my-pickups');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit pickup request.');
    }
  };

  return (
    <UserLayout>
      {/* Header Banner */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-2xl border border-emerald-500/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <FaLeaf className="h-3 w-3 animate-bounce" />
              <span>Smart Waste Scheduling & AI Dispatch Engine</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
              Schedule Waste Collection
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Mix & match multiple waste materials, pinpoint live GPS doorstep location, attach waste photos, and earn instant cash & EcoPoints!
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-800/60 backdrop-blur-md p-2 rounded-2xl border border-slate-700/60">
            <button 
              type="button"
              onClick={() => setPickupType('household')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                pickupType === 'household' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FaHome className="h-3.5 w-3.5" />
              <span>Household</span>
            </button>
            <button 
              type="button"
              onClick={() => setPickupType('bulk')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
                pickupType === 'bulk' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FaBuilding className="h-3.5 w-3.5" />
              <span>Bulk / NGO</span>
            </button>
            <button 
              type="button"
              onClick={() => setShowAIScanner(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md border border-emerald-400/30"
            >
              <FaMagic className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
              <span>AI Scanner</span>
            </button>
            <button 
              type="button"
              onClick={handleVoiceBooking}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
            >
              <FaMicrophone className={`h-3.5 w-3.5 ${isVoiceListening ? 'animate-pulse text-rose-600' : ''}`} />
              <span>Voice</span>
              {isVoiceListening && <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping"></span>}
            </button>
            <button 
              type="button"
              onClick={() => setShowSegregationModal(true)}
              className="px-3.5 py-2 bg-slate-700/70 hover:bg-slate-700 text-emerald-300 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 border border-emerald-500/30"
            >
              <FaSearch className="h-3 w-3" />
              <span>Guidelines</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper Navigation Indicator */}
      <div className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800">
        <div className="max-w-xl mx-auto flex items-center justify-between relative">
          {/* Step 1 */}
          <div 
            onClick={() => setStep(1)}
            className={`flex items-center space-x-2.5 cursor-pointer transition-all ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-md ${
              step === 1 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/20 scale-105' 
                : step > 1 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {step > 1 ? <FaCheck className="h-4 w-4" /> : '1'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">Materials</p>
              <p className="text-[10px] text-slate-400 font-bold">Multi-Category</p>
            </div>
          </div>

          <div className={`flex-1 h-1 mx-3 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

          {/* Step 2 */}
          <div 
            onClick={() => multiItems.length > 0 && setStep(2)}
            className={`flex items-center space-x-2.5 cursor-pointer transition-all ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-md ${
              step === 2 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/20 scale-105' 
                : step > 2 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {step > 2 ? <FaCheck className="h-4 w-4" /> : '2'}
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">Details</p>
              <p className="text-[10px] text-slate-400 font-bold">GPS, Photo & Weight</p>
            </div>
          </div>

          <div className={`flex-1 h-1 mx-3 rounded-full transition-all ${step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

          {/* Step 3 */}
          <div 
            onClick={() => multiItems.length > 0 && pickupDate && setStep(3)}
            className={`flex items-center space-x-2.5 cursor-pointer transition-all ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}
          >
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all shadow-md ${
              step === 3 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white ring-4 ring-emerald-500/20 scale-105' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              3
            </div>
            <div>
              <p className="text-xs font-black text-slate-800 dark:text-slate-200">Confirm</p>
              <p className="text-[10px] text-slate-400 font-bold">Dispatch Order</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center space-x-2 animate-shake">
          <FaInfoCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* ================= STEP 1: MULTI-CATEGORY SELECTION ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Select Waste Categories</span>
                  <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-0.5 rounded-full border border-emerald-500/30">
                    Multi-Selection Enabled
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Tap materials to add or remove them from your single pickup collection request.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl">
                  {multiItems.length} Material{multiItems.length !== 1 ? 's' : ''} Selected
                </span>
              </div>
            </div>

            {/* Category Cards Grid with Multi-Select toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const isSelected = multiItems.some(i => i.category === cat.name);
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`group relative p-6 rounded-3xl text-left transition-all duration-300 flex flex-col justify-between h-44 overflow-hidden border ${
                      isSelected
                        ? `bg-gradient-to-br ${cat.gradient} ${cat.activeBorder} shadow-xl scale-[1.02]`
                        : 'bg-slate-50/70 dark:bg-slate-850/50 border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:shadow-lg'
                    }`}
                  >
                    {/* Glow accent */}
                    {isSelected && (
                      <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="h-14 w-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/10 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {cat.badge}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-500/30">
                          +{cat.rate} PTS/KG
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {cat.name}
                        </h3>
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'border-2 border-slate-300 dark:border-slate-700'
                        }`}>
                          {isSelected && <FaCheck className="h-3 w-3" />}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Neural AI Scanner Trigger Bar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAIScanner(!showAIScanner)}
                className="w-full p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-3xl flex items-center justify-between font-bold text-xs shadow-xl shadow-emerald-600/20 hover:brightness-110 transition-all border border-emerald-400/30"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
                    <FaMagic className="text-emerald-200 animate-spin-slow" style={{ animationDuration: '6s' }} />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm">Scan Photo with Neural AI Waste Inspector</p>
                    <p className="text-xs text-emerald-100 font-medium">Auto-classify material, measure purity grade, and estimate points instantly</p>
                  </div>
                </div>
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl text-xs uppercase font-black tracking-wider shadow-inner">
                  {showAIScanner ? 'Close Scanner' : 'Open AI Scanner'}
                </span>
              </button>

              {showAIScanner && (
                <div className="pt-4 animate-fadeIn">
                  <AIWasteScanner
                    initialCategory={multiItems[0]?.category || 'Plastic'}
                    onAnalysisComplete={handleApplyAiData}
                  />
                </div>
              )}
            </div>

            {/* Step 1 Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Selected:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {multiItems.map(i => i.category).join(', ')}
                </span>
              </div>

              <button
                disabled={multiItems.length === 0}
                onClick={() => setStep(2)}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl transition-all disabled:opacity-40 flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                <span>Proceed to Weights & Location</span>
                <FaArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: WEIGHTS, LIVE GPS LOCATION & PHOTO UPLOAD ================= */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Configure Pickup Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Specify weights, drop GPS location pin, and attach waste photo.</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl">
                  {multiItems.length} Materials
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Multi-Category Itemized Weight Breakdowns */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Itemized Materials Weight List */}
                <div className="space-y-4 p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-black text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <FaLeaf className="text-emerald-500" />
                      <span>Itemized Material Weights (kg)</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Custom Decimal Supported (e.g. 3.5kg)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {multiItems.map((item, idx) => {
                      const catObj = categories.find(c => c.name === item.category);
                      const rate = catObj?.rate || 10;
                      const currentWeight = parseFloat(item.estimatedWeight) || 0;
                      const pts = Math.round(currentWeight * rate);
                      const cashVal = (pts * 0.25).toFixed(2);

                      return (
                        <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{catObj?.icon || '📦'}</span>
                              <div>
                                <h4 className="font-black text-sm text-slate-900 dark:text-white">{item.category}</h4>
                                <span className="text-[10px] font-mono font-bold text-emerald-500">
                                  {rate} pts/kg • Est. +{pts} pts (₹{cashVal})
                                </span>
                              </div>
                            </div>

                            {multiItems.length > 1 && (
                              <button 
                                type="button" 
                                onClick={() => handleRemoveItem(idx)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                                title="Remove Material"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Weight Stepper & Direct Input */}
                          <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center space-x-1.5">
                              {[1, 5, 10, 20].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleUpdateItemWeight(idx, preset)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                    currentWeight === preset
                                      ? 'bg-emerald-500 text-white border-emerald-500'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                  }`}
                                >
                                  {preset}kg
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdjustWeightDelta(idx, -1)}
                                className="h-8 w-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                              >
                                <FaMinus className="h-2.5 w-2.5" />
                              </button>
                              <input 
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={item.estimatedWeight}
                                onChange={(e) => handleUpdateItemWeight(idx, e.target.value)}
                                className="w-20 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                              <span className="text-xs font-bold text-slate-400">kg</span>
                              <button
                                type="button"
                                onClick={() => handleAdjustWeightDelta(idx, 1)}
                                className="h-8 w-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-colors"
                              >
                                <FaPlus className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Extra Category Inline */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <span className="text-[10px] font-bold text-slate-400">Add More Materials:</span>
                    {categories.filter(c => !multiItems.some(i => i.category === c.name)).map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => handleToggleCategory(cat)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-colors flex items-center space-x-1 shadow-sm"
                      >
                        <FaPlus className="h-2 w-2 text-emerald-500" />
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Total Weight & Rewards Bar */}
                  <div className="p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Total Weight</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{totalCalculatedWeight} kg</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Est. EcoPoints</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">+{totalCalculatedPoints} pts</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 block uppercase">Cash Value</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">₹{estimatedCashbackRs}</span>
                    </div>
                  </div>
                </div>

                {/* Waste Photo Upload Section */}
                <div className="p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-2">
                        <FaCamera className="text-emerald-500" />
                        <span>Attach Waste Photos (Camera / Gallery)</span>
                      </h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Upload waste pile photo so the collection driver brings appropriate weight sacks.
                      </p>
                    </div>
                    {wastePhotoPreview && (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                        <FaCheckCircle /> Photo Attached
                      </span>
                    )}
                  </div>

                  {wastePhotoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 p-2 shadow-xl group">
                      <img 
                        src={wastePhotoPreview} 
                        alt="Waste Pile Preview" 
                        className="w-full h-48 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                        <label className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer hover:bg-emerald-700 flex items-center space-x-1.5">
                          <FaUpload className="h-3 w-3" />
                          <span>Change Photo</span>
                          <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-rose-700 flex items-center space-x-1.5"
                        >
                          <FaTrash className="h-3 w-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                        {photoFileSize ? `Size: ${photoFileSize}` : 'Attached'}
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 p-6 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/50 dark:bg-slate-900/50 group">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform mb-2">
                        <FaCamera />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Click to take photo with mobile camera or upload from gallery
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WebP (Max 5MB)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  )}
                </div>

              </div>

              {/* Right Column: Date, Time Window & Live GPS Address */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Date & Time Slot */}
                <div className="p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <FaCalendarAlt className="text-emerald-500" />
                      <span>Pickup Date *</span>
                    </label>
                    <input 
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <FaClock className="text-emerald-500" />
                      <span>Preferred Time Window *</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setPickupTimeSlot(slot)}
                          className={`p-2.5 rounded-xl text-xs font-extrabold text-left transition-all border ${
                            pickupTimeSlot === slot
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Location Address with GPS Satellite Pin Drop */}
                <div className="p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      <span>Doorstep Location *</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowGPSModal(true)}
                      className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-[11px] rounded-xl shadow flex items-center space-x-1.5 transition-all"
                    >
                      <FaCrosshairs className="h-3 w-3" />
                      <span>📍 Drop GPS Pin</span>
                    </button>
                  </div>

                  {/* Active GPS Custom Selected Location */}
                  {customGPSAddress && (
                    <div className="p-4 bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-black text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                          <span>Live GPS Pin Drop Address</span>
                        </span>
                        <span className="text-[10px] font-mono uppercase bg-emerald-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{customGPSAddress.street}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{customGPSAddress.city}, {customGPSAddress.state} - {customGPSAddress.zipCode}</p>
                    </div>
                  )}

                  {/* Saved User Addresses List */}
                  {user?.addresses && user.addresses.length > 0 && !customGPSAddress && (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {user.addresses.map((addr, i) => (
                        <div 
                          key={i}
                          onClick={() => {
                            setSelectedAddressIndex(i);
                            setCustomGPSAddress(null);
                          }}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border flex items-start justify-between ${
                            selectedAddressIndex === i && !customGPSAddress
                              ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                              : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white">{addr.street}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{addr.city}, {addr.state} - {addr.zipCode}</p>
                          </div>
                          {selectedAddressIndex === i && !customGPSAddress && <FaCheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Form to manual add address */}
                  <div className="flex justify-between items-center pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <FaPlus className="h-3 w-3" />
                      <span>{showAddressForm ? 'Close Address Form' : 'Type New Address Manually'}</span>
                    </button>
                  </div>

                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-3 animate-fadeIn">
                      <input
                        type="text"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="Street Address (e.g. 12-A Metro Heights)"
                        required
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="City"
                          required
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850"
                        />
                        <input
                          type="text"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          placeholder="State"
                          required
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850"
                        />
                        <input
                          type="text"
                          value={newZipCode}
                          onChange={(e) => setNewZipCode(e.target.value)}
                          placeholder="ZIP Code"
                          required
                          className="w-full px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button type="button" onClick={() => setShowAddressForm(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-black rounded-xl shadow">Save</button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Additional Notes & Recurring Toggle */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Instructions for Collection Driver
                    </label>
                    <textarea
                      rows="2"
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                      placeholder="e.g. Ring bell 302, bags placed outside doorstep..."
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Automated Weekly Recurrence</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Automatically dispatch driver every week for this slot</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isRecurring} 
                        onChange={(e) => setIsRecurring(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

              </div>

            </div>

            {/* Step 2 Action Bar */}
            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors flex items-center space-x-2"
              >
                <FaArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!pickupDate || (!customGPSAddress && (!user?.addresses || user.addresses.length === 0))}
                onClick={() => setStep(3)}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl transition-all disabled:opacity-40 flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
              >
                <span>Review Order Summary</span>
                <FaArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: CONFIRM & DISPATCH ORDER ================= */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Review Recycling Order Summary</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify your multi-material collection details before dispatching driver request.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl">
                Step 3 of 3
              </span>
            </div>

            {/* Digital Receipt Card */}
            <div className="p-6 md:p-8 bg-slate-50/90 dark:bg-slate-850/80 rounded-3xl border border-slate-200/80 dark:border-slate-750 space-y-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex justify-between items-start border-b border-slate-200/60 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">EcoReward Order Spec</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Multi-Material Recycling Collection</h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider">
                  {pickupType.toUpperCase()}
                </span>
              </div>

              {/* Itemized Materials Table */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Configured Materials ({multiItems.length}):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {multiItems.map((item, idx) => {
                    const catObj = categories.find(c => c.name === item.category);
                    const rate = catObj?.rate || 10;
                    const pts = Math.round(parseFloat(item.estimatedWeight) * rate);
                    return (
                      <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{catObj?.icon || '📦'}</span>
                          <div>
                            <p className="font-extrabold text-xs text-slate-900 dark:text-white">{item.category}</p>
                            <p className="text-[10px] font-mono text-emerald-500">+{pts} pts ({rate} pts/kg)</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.estimatedWeight} kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Meta Data Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Weight</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">{totalCalculatedWeight} kg</span>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Collection Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">{pickupDate}</span>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Slot</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base">{pickupTimeSlot}</span>
                </div>
              </div>

              {/* Photo Preview & Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Pickup Address:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white text-right">
                      {customGPSAddress ? `${customGPSAddress.street}, ${customGPSAddress.city} (${customGPSAddress.zipCode})` : `${user?.addresses[selectedAddressIndex]?.street}, ${user?.addresses[selectedAddressIndex]?.city} (${user?.addresses[selectedAddressIndex]?.zipCode})`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                    <span className="font-bold text-slate-400">Driver Notes:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{driverNotes || 'No custom instructions provided.'}</span>
                  </div>
                </div>

                {wastePhotoPreview && (
                  <div className="md:col-span-5 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 flex items-center space-x-3">
                    <img src={wastePhotoPreview} alt="Attached Waste" className="h-16 w-16 object-cover rounded-xl border border-emerald-500/30" />
                    <div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase block">📸 Photo Attached</span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Waste Pile Verified</p>
                      <p className="text-[10px] text-slate-400">Visible to dispatched driver</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Impact & Reward Estimate Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg flex items-center space-x-3">
                  <FaCoins className="h-8 w-8 text-amber-300 animate-pulse flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 block">Reward Estimate</span>
                    <span className="text-2xl font-black">+{totalCalculatedPoints} EcoPoints</span>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg flex items-center space-x-3">
                  <span className="text-3xl">💵</span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 block">Estimated Cashback</span>
                    <span className="text-2xl font-black">₹{estimatedCashbackRs}</span>
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl shadow-lg flex items-center space-x-3">
                  <FaLeaf className="h-8 w-8 text-emerald-300 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100 block">CO2 Offset</span>
                    <span className="text-2xl font-black">-{estimatedCO2} kg CO2</span>
                  </div>
                </div>
              </div>

              {/* Handover OTP Security Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center space-x-3 text-xs">
                <FaLock className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  <span className="font-black text-emerald-600 dark:text-emerald-400">Secure Handover OTP: </span> 
                  A 4-digit verification code will be generated upon dispatch. Share it only after the driver weighs your waste to instantly receive your EcoPoints.
                </p>
              </div>

            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors flex items-center space-x-2"
              >
                <FaArrowLeft className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-emerald-500/25 flex items-center space-x-2"
              >
                <FaCheck className="h-4 w-4" />
                <span>{loading ? 'Dispatching Eco Driver...' : 'Confirm & Schedule Pickup'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Segregation Guide Modal */}
      {showSegregationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-xl space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                  ♻️
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Smart Segregation Guide</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Search items to check how to prepare waste before collection.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSegregationModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-4 top-3.5 text-slate-400 h-4 w-4" />
              <input 
                type="text"
                placeholder="Search item (e.g., TetraPak, Water Bottle, Charger)..."
                value={segregationQuery}
                onChange={(e) => setSegregationQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {segregationItems
                .filter(i => i.item.toLowerCase().includes(segregationQuery.toLowerCase()) || i.category.toLowerCase().includes(segregationQuery.toLowerCase()))
                .map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50/80 dark:bg-slate-850/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white">{item.item}</span>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-[10px] rounded-full uppercase tracking-wider border border-emerald-500/20">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.prep}</p>
                  </div>
                ))}
            </div>

            <button 
              onClick={() => setShowSegregationModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-emerald-600/20"
            >
              Done / Return to Scheduling
            </button>
          </div>
        </div>
      )}

      {/* Live GPS Satellite Pin Drop Modal */}
      {showGPSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl">
            <GPSLocationPicker 
              onLocationSelected={handleGPSLocationSelected}
              onClose={() => setShowGPSModal(false)}
              initialAddress={customGPSAddress || user?.addresses?.[selectedAddressIndex]}
            />
          </div>
        </div>
      )}

      {/* AI Vision Waste Scanner Modal */}
      <AIWasteScannerModal 
        isOpen={showAIScanner} 
        onClose={() => setShowAIScanner(false)} 
        onApplyScannedData={handleApplyAiData} 
      />
    </UserLayout>
  );
};

export default SchedulePickup;
