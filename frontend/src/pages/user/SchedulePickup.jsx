import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import AIWasteScanner from '../../components/AIWasteScanner';
import api from '../../utils/api';
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, 
  FaCoins, FaInfoCircle, FaArrowRight, FaArrowLeft, 
  FaMagic, FaCheckCircle, FaMicrophone, FaSearch, 
  FaBuilding, FaHome, FaSlidersH, FaShieldAlt, FaLeaf, FaTimes, FaPlus
} from 'react-icons/fa';

const SchedulePickup = () => {
  const { user, addAddress } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [wasteCategory, setWasteCategory] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState(5);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeSlot, setPickupTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [driverNotes, setDriverNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [pickupType, setPickupType] = useState('household'); // 'household' | 'bulk'
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [showSegregationModal, setShowSegregationModal] = useState(false);
  const [segregationQuery, setSegregationQuery] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAIScanner, setShowAIScanner] = useState(false);

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
      setWasteCategory('Plastic');
      setEstimatedWeight(10);
      addToast('🎙️ Voice Command Detected: "10 kg plastic waste collection". Selected Plastic (10 kg)!', 'info', 'Voice Booking');
    }, 2000);
  };

  const [itemCounts, setItemCounts] = useState({
    Plastic: 0,
    Paper: 0,
    Metal: 0,
    Glass: 0,
    Organic: 0,
    'E-Waste': 0
  });

  const calculatorSpecs = {
    Plastic: { label: 'Plastic Bottles / Containers', weight: 0.05, unit: 'pcs' },
    Paper: { label: 'Cardboard Boxes / Bundles', weight: 2.0, unit: 'items' },
    Metal: { label: 'Metal Cans / Scrap Parts', weight: 0.1, unit: 'pcs' },
    Glass: { label: 'Glass Bottles / Jars', weight: 0.3, unit: 'pcs' },
    Organic: { label: 'Bio Waste Bags (2L)', weight: 1.5, unit: 'bags' },
    'E-Waste': { label: 'Chargers / Cables / Gadgets', weight: 0.8, unit: 'items' }
  };

  const guidelines = {
    Plastic: [
      'Wash and rinse containers to remove food residues.',
      'Crush plastic bottles to reduce bulk volume.',
      'Remove metal caps or non-plastic seals.'
    ],
    Paper: [
      'Keep newspapers and cardboards dry.',
      'Remove plastic wrappers or glossy bindings.',
      'Flatten all cardboard boxes before collection.'
    ],
    Metal: [
      'Rinse beverage and food cans.',
      'Separate aluminum items from iron or steel scraps.',
      'Crush cans if possible to optimize space.'
    ],
    Glass: [
      'Rinse bottles and jars completely.',
      'Remove metal caps, lids, and corks.',
      'Do NOT include window panes, mirrors, or ceramics.'
    ],
    Organic: [
      'Only include food remains, vegetable skins, and leaves.',
      'Do not mix plastic bags or metal wires.',
      'Drain excess liquid residue before bagging.'
    ],
    'E-Waste': [
      'Remove dry batteries/cells from gadgets.',
      'Wrap cables neatly to prevent tangling.',
      'Handle glass displays carefully to avoid cracks.'
    ]
  };

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { 
      name: 'Plastic', 
      rate: 10, 
      desc: 'Bottles, containers, caps', 
      icon: '🥤', 
      badge: 'Popular', 
      gradient: 'from-pink-500/10 via-rose-500/5 to-purple-500/10 border-pink-500/30 text-pink-500',
      activeBg: 'from-pink-500 to-rose-600'
    },
    { 
      name: 'Paper', 
      rate: 8, 
      desc: 'Newspapers, boxes, cartons', 
      icon: '📦', 
      badge: 'High Volume', 
      gradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10 border-amber-500/30 text-amber-500',
      activeBg: 'from-amber-500 to-orange-600'
    },
    { 
      name: 'Metal', 
      rate: 20, 
      desc: 'Aluminum cans, iron scrap', 
      icon: '🥫', 
      badge: 'Top Value', 
      gradient: 'from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border-emerald-500/30 text-emerald-500',
      activeBg: 'from-emerald-500 to-teal-600'
    },
    { 
      name: 'Glass', 
      rate: 6, 
      desc: 'Bottles, jars, glassware', 
      icon: '🍼', 
      badge: '100% Recyclable', 
      gradient: 'from-blue-500/10 via-sky-500/5 to-indigo-500/10 border-blue-500/30 text-blue-500',
      activeBg: 'from-blue-500 to-indigo-600'
    },
    { 
      name: 'Organic', 
      rate: 4, 
      desc: 'Bio waste, garden scraps', 
      icon: '🍎', 
      badge: 'Eco Compost', 
      gradient: 'from-lime-500/10 via-green-500/5 to-emerald-500/10 border-lime-500/30 text-lime-500',
      activeBg: 'from-lime-500 to-emerald-600'
    },
    { 
      name: 'E-Waste', 
      rate: 15, 
      desc: 'Cables, gadgets, batteries', 
      icon: '💻', 
      badge: 'Hazardous', 
      gradient: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 border-violet-500/30 text-violet-500',
      activeBg: 'from-violet-500 to-purple-600'
    }
  ];

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
    } else {
      setError(res.message);
    }
  };

  const currentCategory = categories.find(c => c.name === wasteCategory);
  const estimatedPoints = currentCategory ? currentCategory.rate * estimatedWeight : 0;
  const estimatedCO2 = (estimatedWeight * 1.5).toFixed(1);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (user.addresses.length === 0) {
      setError('Please add a pickup address first');
      setLoading(false);
      return;
    }

    const maxWeightLimit = pickupType === 'bulk' ? 500 : 100;
    if (estimatedWeight <= 0 || estimatedWeight > maxWeightLimit) {
      setError(`Estimated weight must be between 0.1 kg and ${maxWeightLimit} kg per request.`);
      setLoading(false);
      return;
    }

    const payload = {
      wasteCategory,
      estimatedWeight,
      pickupDate,
      pickupTimeSlot,
      pickupAddress: user.addresses[selectedAddressIndex],
      notes: driverNotes,
      isRecurring,
      pickupType
    };

    try {
      const res = await api.post('/user/pickups', payload);
      setLoading(false);
      if (res.data.success) {
        navigate('/my-pickups');
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit pickup request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 space-y-6">
          
          {/* Header Banner */}
          <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-2xl border border-emerald-500/20">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <FaLeaf className="h-3 w-3 animate-bounce" />
                  <span>EcoReward Scheduling Engine</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-emerald-100 to-teal-200 bg-clip-text text-transparent">
                  Schedule Waste Collection
                </h1>
                <p className="text-xs md:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                  Turn household waste into instant EcoPoints rewards. Choose material categories, configure weight specs, and dispatch nearby eco-drivers.
                </p>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center gap-2.5 bg-slate-800/60 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/60">
                <button 
                  type="button"
                  onClick={() => setPickupType('household')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
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
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 ${
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
                  onClick={handleVoiceBooking}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <FaMicrophone className={`h-3.5 w-3.5 ${isVoiceListening ? 'animate-pulse text-rose-600' : ''}`} />
                  <span>Voice Booking</span>
                  {isVoiceListening && <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping"></span>}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowSegregationModal(true)}
                  className="px-3.5 py-2 bg-slate-700/70 hover:bg-slate-700 text-emerald-300 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 border border-emerald-500/30"
                >
                  <FaSearch className="h-3 w-3" />
                  <span>What Goes Where?</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stepper Navigation Indicator */}
          <div className="glass-panel p-4 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800">
            <div className="max-w-xl mx-auto flex items-center justify-between relative">
              
              {/* Stepper Step 1 */}
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
                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">Category</p>
                  <p className="text-[10px] text-slate-400 font-bold">Select Material</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-3 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Stepper Step 2 */}
              <div 
                onClick={() => wasteCategory && setStep(2)}
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
                  <p className="text-[10px] text-slate-400 font-bold">Weight & Slot</p>
                </div>
              </div>

              <div className={`flex-1 h-1 mx-3 rounded-full transition-all ${step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>

              {/* Stepper Step 3 */}
              <div 
                onClick={() => wasteCategory && pickupDate && setStep(3)}
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
            
            {/* STEP 1: CATEGORY SELECTION */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Select Waste Category</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Choose material type to view EcoPoints rate per kilogram.</p>
                  </div>
                  {wasteCategory && (
                    <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl self-start sm:self-auto">
                      Selected: {wasteCategory} ({categories.find(c => c.name === wasteCategory)?.rate} pts/kg)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {categories.map((cat) => {
                    const isSelected = wasteCategory === cat.name;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => setWasteCategory(cat.name)}
                        className={`group relative p-6 rounded-3xl text-left transition-all duration-300 flex flex-col justify-between h-44 overflow-hidden border ${
                          isSelected
                            ? 'bg-gradient-to-br ' + cat.gradient + ' border-emerald-500 ring-4 ring-emerald-500/20 shadow-xl scale-[1.02]'
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
                            {isSelected && <FaCheckCircle className="h-5 w-5 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{cat.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Neural AI Scanner Bar */}
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
                        initialCategory={wasteCategory || 'Plastic'}
                        onAnalysisComplete={(report) => {
                          setWasteCategory(report.category);
                          setEstimatedWeight(report.estimatedWeight);
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Segregation Tips */}
                {wasteCategory && guidelines[wasteCategory] && (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl space-y-3 animate-fadeIn">
                    <h4 className="font-black text-xs text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-2">
                      <span className="text-base">♻️</span>
                      <span>{wasteCategory} Preparation & Sorting Rules</span>
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {guidelines[wasteCategory].map((tip, idx) => (
                        <li key={idx} className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-slate-200/50 dark:border-slate-750 flex items-start space-x-2">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={!wasteCategory}
                    onClick={() => setStep(2)}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl transition-all disabled:opacity-40 flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
                  >
                    <span>Proceed to Details</span>
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: WEIGHT & TIME SLOT DETAILS */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Configure Pickup Details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Specify waste weight estimations, pickup slot, and address location.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl">
                    Selected: {wasteCategory}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Weight Control Card */}
                  <div className="space-y-4 p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <FaSlidersH className="text-emerald-500" />
                        <span>Estimated Quantity (kg)</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setShowCalculator(!showCalculator)} 
                        className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                      >
                        <span>{showCalculator ? 'Hide Calculator' : '⚡ Quick Weight Calculator'}</span>
                      </button>
                    </div>

                    {/* Interactive Weight Slider */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                          {estimatedWeight} <span className="text-sm font-bold text-slate-400">kg</span>
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs rounded-xl">
                          ≈ {estimatedPoints} Points
                        </span>
                      </div>

                      <input 
                        type="range"
                        min="0.1"
                        max={pickupType === 'bulk' ? 500 : 100}
                        step="0.5"
                        value={estimatedWeight}
                        onChange={(e) => setEstimatedWeight(parseFloat(e.target.value))}
                        className="w-full h-3 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />

                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>0.1 kg</span>
                        <span>{pickupType === 'bulk' ? '250 kg' : '50 kg'}</span>
                        <span>{pickupType === 'bulk' ? '500 kg (Bulk Cap)' : '100 kg (Household Cap)'}</span>
                      </div>

                      {/* Weight Preset Quick Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                        {[2, 5, 10, 25, 50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setEstimatedWeight(preset)}
                            className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                              estimatedWeight === preset 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {preset} kg
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculator Dropdown */}
                    {showCalculator && calculatorSpecs[wasteCategory] && (
                      <div className="mt-3 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-lg animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>{calculatorSpecs[wasteCategory].label}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                            {calculatorSpecs[wasteCategory].weight} kg per {calculatorSpecs[wasteCategory].unit}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between space-x-2">
                          <button 
                            type="button"
                            onClick={() => setItemCounts({ ...itemCounts, [wasteCategory]: Math.max(0, itemCounts[wasteCategory] - 5) })}
                            className="h-9 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs"
                          >-5</button>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({ ...itemCounts, [wasteCategory]: Math.max(0, itemCounts[wasteCategory] - 1) })}
                            className="h-9 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs"
                          >-1</button>
                          <span className="flex-1 text-center font-extrabold text-slate-900 dark:text-white text-sm">
                            {itemCounts[wasteCategory]} {calculatorSpecs[wasteCategory].unit}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({ ...itemCounts, [wasteCategory]: itemCounts[wasteCategory] + 1 })}
                            className="h-9 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs"
                          >+1</button>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({ ...itemCounts, [wasteCategory]: itemCounts[wasteCategory] + 5 })}
                            className="h-9 w-10 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-xl text-xs"
                          >+5</button>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                          <span className="text-xs font-bold text-slate-500">Calculated: <strong className="text-slate-900 dark:text-white">{(itemCounts[wasteCategory] * calculatorSpecs[wasteCategory].weight).toFixed(1)} kg</strong></span>
                          <button 
                            type="button"
                            onClick={() => {
                              const calculated = Math.max(0.1, parseFloat((itemCounts[wasteCategory] * calculatorSpecs[wasteCategory].weight).toFixed(1)));
                              setEstimatedWeight(calculated);
                              setShowCalculator(false);
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md"
                          >
                            Apply Calculated Weight
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date & Time Slot Card */}
                  <div className="space-y-4 p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
                    
                    {/* Date Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <FaCalendarAlt className="text-emerald-500" />
                        <span>Preferred Collection Date</span>
                      </label>
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Time Slot Selection */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <FaClock className="text-emerald-500" />
                        <span>Preferred Time Window</span>
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
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Location Address Selection */}
                <div className="p-6 bg-slate-50/80 dark:bg-slate-850/60 rounded-3xl border border-slate-200/70 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <FaMapMarkerAlt className="text-emerald-500" />
                      <span>Pickup Address Location</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
                    >
                      <FaPlus className="h-3 w-3" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  {showAddressForm ? (
                    <form onSubmit={handleAddAddress} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-750 space-y-3 animate-fadeIn">
                      <input
                        type="text"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        placeholder="Street Address (e.g. 12-A Metro Heights)"
                        required
                        className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="City"
                          required
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          placeholder="State"
                          required
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={newZipCode}
                          onChange={(e) => setNewZipCode(e.target.value)}
                          placeholder="ZIP Code"
                          required
                          className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-1">
                        <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl shadow">Save Address</button>
                      </div>
                    </form>
                  ) : (
                    user.addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {user.addresses.map((addr, i) => (
                          <div 
                            key={i}
                            onClick={() => setSelectedAddressIndex(i)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border flex items-start justify-between ${
                              selectedAddressIndex === i
                                ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                                : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <p className="font-extrabold text-xs text-slate-900 dark:text-white">{addr.street}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{addr.city}, {addr.state} - {addr.zipCode}</p>
                            </div>
                            {selectedAddressIndex === i && <FaCheckCircle className="h-5 w-5 text-emerald-500" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-500 font-bold py-2">No pickup addresses registered. Click "+ Add New Address" above.</p>
                    )
                  )}
                </div>

                {/* Additional Notes & Recurring Toggle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Instructions for Collection Driver
                    </label>
                    <textarea
                      rows="2"
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                      placeholder="e.g. Ring bell, leave bags at security gate..."
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
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

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors flex items-center space-x-2"
                  >
                    <FaArrowLeft className="h-3.5 w-3.5" />
                    <span>Back</span>
                  </button>
                  <button
                    disabled={!pickupDate || user.addresses.length === 0}
                    onClick={() => setStep(3)}
                    className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl transition-all disabled:opacity-40 flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
                  >
                    <span>Review & Confirm</span>
                    <FaArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRM & DISPATCH ORDER */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Review Recycling Order Summary</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verify your collection details before dispatching driver request.</p>
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
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{wasteCategory} Recycling Request</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase tracking-wider">
                      {pickupType.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Material Category</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{wasteCategory}</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Est. Weight</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{estimatedWeight} kg</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Collection Date</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{pickupDate}</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Window</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">{pickupTimeSlot}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-400">Pickup Location:</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-right">
                        {user.addresses[selectedAddressIndex]?.street}, {user.addresses[selectedAddressIndex]?.city} ({user.addresses[selectedAddressIndex]?.zipCode})
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2">
                      <span className="font-bold text-slate-400">Driver Notes:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{driverNotes || 'No custom instructions provided.'}</span>
                    </div>
                  </div>

                  {/* Impact & Reward Estimate Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg flex items-center space-x-3">
                      <FaCoins className="h-8 w-8 text-amber-300 animate-pulse flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 block">Reward Estimate</span>
                        <span className="text-2xl font-black">{estimatedPoints} EcoPoints</span>
                      </div>
                    </div>

                    <div className="p-5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl shadow-lg flex items-center space-x-3">
                      <FaLeaf className="h-8 w-8 text-emerald-300 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-sky-100 block">Environmental Offset</span>
                        <span className="text-2xl font-black">-{estimatedCO2} kg CO2</span>
                      </div>
                    </div>
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
                    <span>{loading ? 'Dispatching Pickup Request...' : 'Confirm & Schedule Pickup'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
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
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
    </div>
  );
};

export default SchedulePickup;
