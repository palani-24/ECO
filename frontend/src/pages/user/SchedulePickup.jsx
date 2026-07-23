import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { FaTrash, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheck, FaCoins, FaInfoCircle, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const SchedulePickup = () => {
  const { user, addAddress } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [wasteCategory, setWasteCategory] = useState('');
  const [estimatedWeight, setEstimatedWeight] = useState(1);
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
      alert('🎙️ Voice Command Detected: "10 kg plastic waste collection". Auto-selected Plastic (10 kg)!');
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
    Paper: { label: 'Cardboard Boxes / Paper Bundles', weight: 2.0, unit: 'items' },
    Metal: { label: 'Metal Cans / Scrap Parts', weight: 0.1, unit: 'pcs' },
    Glass: { label: 'Glass Bottles / Jars', weight: 0.3, unit: 'pcs' },
    Organic: { label: 'Bio Waste Bags (approx 2L)', weight: 1.5, unit: 'bags' },
    'E-Waste': { label: 'Old Chargers / Cables / Gadgets', weight: 0.8, unit: 'items' }
  };

  const guidelines = {
    Plastic: [
      'Wash and rinse containers to remove food residues.',
      'Crush plastic bottles to reduce bulk.',
      'Remove metal caps or non-plastic seals.'
    ],
    Paper: [
      'Keep newspapers and cardboards dry.',
      'Remove plastic wrappers, bindings, or glossy coatings.',
      'Flatten all cardboard boxes before collection.'
    ],
    Metal: [
      'Rinse beverage/food cans.',
      'Separate aluminum items from iron or steel scraps.',
      'Crush cans if possible to save space.'
    ],
    Glass: [
      'Rinse bottles and jars completely.',
      'Remove metal caps, lids, and corks.',
      'Do NOT include window panes, mirrors, or ceramics.'
    ],
    Organic: [
      'Only include food remains, vegetable skins, and dry leaves.',
      'Do not mix plastic bags, metal wires, or glass scraps.',
      'Drain excess water to keep it dry.'
    ],
    'E-Waste': [
      'Remove dry batteries/cells from gadgets.',
      'Wrap cables neatly to avoid tangling.',
      'Handle glass displays carefully to avoid cracks.'
    ]
  };

  // New address helper if none exist
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newZipCode, setNewZipCode] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    { name: 'Plastic', rate: 10, desc: 'Bottles, containers, bags', icon: '🥤' },
    { name: 'Paper', rate: 8, desc: 'Newspapers, boxes, folders', icon: '📦' },
    { name: 'Metal', rate: 20, desc: 'Aluminum cans, iron scrap', icon: '🥫' },
    { name: 'Glass', rate: 6, desc: 'Bottles, jars, glassware', icon: '🍼' },
    { name: 'Organic', rate: 4, desc: 'Food waste, dry leaves', icon: '🍎' },
    { name: 'E-Waste', rate: 15, desc: 'Cables, old electronics', icon: '💻' }
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

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (user.addresses.length === 0) {
      setError('Please add a pickup address first');
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
      isRecurring
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

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Schedule Waste Pickup</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reduce landfill dump and earn reward points on recycled materials.</p>
          </div>

          {/* Premium Tools Bar: Voice Booking, Bulk Mode & Segregation Guide */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-2xl border border-emerald-500/20">
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={() => setPickupType('household')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pickupType === 'household' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🏠 Household
              </button>
              <button 
                type="button"
                onClick={() => setPickupType('bulk')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  pickupType === 'bulk' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                🏢 Apartment / NGO / Bulk
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={handleVoiceBooking}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-sm"
              >
                <span>🎙️ Voice Booking (Tamil/English)</span>
                {isVoiceListening && <span className="h-2 w-2 bg-rose-600 rounded-full animate-ping"></span>}
              </button>
              <button 
                type="button"
                onClick={() => setShowSegregationModal(true)}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs transition-colors"
              >
                🔍 What Goes Where?
              </button>
            </div>
          </div>

          {/* Stepper Indicators */}
          <div className="flex items-center space-x-4 max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>1</span>
              <span className={step >= 1 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}>Category</span>
            </div>
            <div className="h-0.5 bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>2</span>
              <span className={step >= 2 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}>Details</span>
            </div>
            <div className="h-0.5 bg-slate-200 dark:bg-slate-800 flex-1"></div>
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>3</span>
              <span className={step >= 3 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400'}>Confirm</span>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-start space-x-1.5">
              <FaInfoCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 md:p-8 rounded-3xl shadow-sm max-w-3xl space-y-6">
            
            {/* Step 1: Waste Type */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">Select Waste Material Category</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => setWasteCategory(cat.name)}
                      className={`p-5 rounded-2xl text-left border transition-all flex flex-col justify-between h-32 ${
                        wasteCategory === cat.name
                          ? 'border-primary-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-2 ring-primary-500/20'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{cat.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{cat.rate} pts/kg</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* AI Waste Scan Simulation Banner */}
                {wasteCategory && (
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl animate-bounce">🤖</span>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">AI Material Purity Scanner</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Scan your item for instant purity rating & 15% bonus point multiplier!</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('AI Scan Activated: High Purity Grade (98%) confirmed! +15% Points Bonus Applied.')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                      Run AI Scan
                    </button>
                  </div>
                )}

                {/* Guidelines Tips */}
                {wasteCategory && guidelines[wasteCategory] && (
                  <div className="p-5 bg-primary-50/50 dark:bg-primary-950/10 border border-primary-500/20 rounded-2xl space-y-2.5 animate-fadeIn">
                    <h4 className="font-extrabold text-xs text-primary-700 dark:text-primary-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <span>♻️ {wasteCategory} Sorting Guidelines</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-semibold list-disc list-inside">
                      {guidelines[wasteCategory].map((tip, idx) => (
                        <li key={idx} className="leading-normal">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button
                    disabled={!wasteCategory}
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>Next step</span>
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Pickup Details */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">Configure Pickup Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Weight Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                        <span>Estimated Weight (kg)</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setShowCalculator(!showCalculator)} 
                        className="text-[10px] font-extrabold text-primary-500 hover:underline"
                      >
                        {showCalculator ? 'Hide Calculator' : 'Weight Calculator'}
                      </button>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={estimatedWeight}
                      onChange={(e) => setEstimatedWeight(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                    />

                    {showCalculator && calculatorSpecs[wasteCategory] && (
                      <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-fadeIn">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-350">
                          <span>{calculatorSpecs[wasteCategory].label}</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            {calculatorSpecs[wasteCategory].weight} kg per {calculatorSpecs[wasteCategory].unit}
                          </span>
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <button 
                            type="button"
                            onClick={() => setItemCounts({
                              ...itemCounts,
                              [wasteCategory]: Math.max(0, itemCounts[wasteCategory] - 5)
                            })}
                            className="h-8 w-8 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                          >
                            -5
                          </button>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({
                              ...itemCounts,
                              [wasteCategory]: Math.max(0, itemCounts[wasteCategory] - 1)
                            })}
                            className="h-8 w-8 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                          >
                            -1
                          </button>
                          <span className="flex-1 text-center font-bold text-slate-800 dark:text-white text-xs">
                            {itemCounts[wasteCategory]} {calculatorSpecs[wasteCategory].unit}
                          </span>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({
                              ...itemCounts,
                              [wasteCategory]: itemCounts[wasteCategory] + 1
                            })}
                            className="h-8 w-8 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                          >
                            +1
                          </button>
                          <button 
                            type="button"
                            onClick={() => setItemCounts({
                              ...itemCounts,
                              [wasteCategory]: itemCounts[wasteCategory] + 5
                            })}
                            className="h-8 w-8 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-xs"
                          >
                            +5
                          </button>
                        </div>
                        
                        <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-750 pt-2.5">
                          <span className="text-[11px] font-bold text-slate-500">Approx. Total: <span className="text-slate-850 dark:text-slate-200">{(itemCounts[wasteCategory] * calculatorSpecs[wasteCategory].weight).toFixed(2)} kg</span></span>
                          <button 
                            type="button"
                            onClick={() => {
                              const calculated = Math.max(1, Math.round(itemCounts[wasteCategory] * calculatorSpecs[wasteCategory].weight));
                              setEstimatedWeight(calculated);
                              setShowCalculator(false);
                            }}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-750 text-white font-bold text-[10px] rounded-lg"
                          >
                            Apply Weight
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <FaCalendarAlt className="text-slate-400" />
                      <span>Preferred Date</span>
                    </label>
                    <input
                      type="date"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Time slot selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <FaClock className="text-slate-400" />
                      <span>Preferred Time Slot</span>
                    </label>
                    <select
                      value={pickupTimeSlot}
                      onChange={(e) => setPickupTimeSlot(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  {/* Address select */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-slate-400" />
                        <span>Pickup Location</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setShowAddressForm(!showAddressForm)}
                        className="text-xs font-bold text-primary-500 hover:underline"
                      >
                        + Add Address
                      </button>
                    </div>

                    {showAddressForm ? (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <input
                          type="text"
                          value={newStreet}
                          onChange={(e) => setNewStreet(e.target.value)}
                          placeholder="Street Address"
                          required
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={newCity}
                            onChange={(e) => setNewCity(e.target.value)}
                            placeholder="City"
                            required
                            className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newState}
                            onChange={(e) => setNewState(e.target.value)}
                            placeholder="State"
                            required
                            className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                          />
                          <input
                            type="text"
                            value={newZipCode}
                            onChange={(e) => setNewZipCode(e.target.value)}
                            placeholder="ZIP Code"
                            required
                            className="w-full px-2 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-1">
                          <button type="button" onClick={() => setShowAddressForm(false)} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-[10px] font-bold rounded-lg text-slate-700 dark:text-slate-300">Cancel</button>
                          <button type="button" onClick={handleAddAddress} className="px-3 py-1.5 bg-primary-600 text-white text-[10px] font-bold rounded-lg shadow">Save</button>
                        </div>
                      </div>
                    ) : (
                      user.addresses.length > 0 ? (
                        <select
                          value={selectedAddressIndex}
                          onChange={(e) => setSelectedAddressIndex(parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                        >
                          {user.addresses.map((addr, i) => (
                            <option key={i} value={i}>{addr.street}, {addr.city}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-xs text-rose-500 font-bold py-2">No addresses configured. Click "+ Add Address" to proceed.</p>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 dark:border-slate-805/60 pt-6">
                  {/* Driver Notes input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Instructions for Collection Driver
                    </label>
                    <textarea
                      rows="3"
                      value={driverNotes}
                      onChange={(e) => setDriverNotes(e.target.value)}
                      placeholder="e.g. Ring bell, leave bags at the gate, lift available..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                    />
                  </div>

                  {/* Recurring pickup toggle */}
                  <div className="space-y-3.5 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/85">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Recurring collection service</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Pick up waste every week automatically</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={isRecurring} 
                          onChange={(e) => setIsRecurring(e.target.checked)} 
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <FaArrowLeft />
                    <span>Back</span>
                  </button>
                  <button
                    disabled={!pickupDate || user.addresses.length === 0}
                    onClick={() => setStep(3)}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <span>Confirm details</span>
                    <FaArrowRight />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm Details */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">Confirm Your Recycling Request</h3>
                
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/40 dark:border-slate-800 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="font-semibold text-slate-400">Waste Material:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{wasteCategory}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="font-semibold text-slate-400">Quantity Estimation:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{estimatedWeight} kg</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="font-semibold text-slate-400">Scheduled Date & Slot:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{pickupDate} ({pickupTimeSlot})</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="font-semibold text-slate-400">Recurring Service:</span>
                    <span className="font-bold text-slate-800 dark:text-white">{isRecurring ? 'Weekly' : 'One-time'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/40 pb-2">
                    <span className="font-semibold text-slate-400">Driver Notes:</span>
                    <span className="font-bold text-slate-800 dark:text-white max-w-xs truncate">{driverNotes || 'None'}</span>
                  </div>
                  <div className="flex justify-between pb-2 items-start">
                    <span className="font-semibold text-slate-400">Pickup Address:</span>
                    <span className="font-bold text-slate-800 dark:text-white text-right max-w-xs truncate">
                      {user.addresses[selectedAddressIndex]?.street}, {user.addresses[selectedAddressIndex]?.city}
                    </span>
                  </div>
                </div>

                {/* Estimate points summary */}
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250/20 rounded-2xl flex items-center justify-between text-emerald-800 dark:text-emerald-400">
                  <div className="flex items-center space-x-2">
                    <FaCoins className="h-6 w-6 animate-pulse" />
                    <div>
                      <span className="text-xs font-semibold block uppercase tracking-wider opacity-85">Estimate Wallet Earnings</span>
                      <span className="text-2xl font-extrabold">{estimatedPoints} Points</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-slate-100 hover:bg-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <FaArrowLeft />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl transition-colors shadow-md shadow-primary-500/20 flex items-center space-x-1.5"
                  >
                    <FaCheck />
                    <span>{loading ? 'Scheduling...' : 'Confirm Pickup'}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Smart Waste Segregation Guide Modal */}
      {showSegregationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xl">♻️</span>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Smart Waste Segregation Assistant</h3>
              </div>
              <button 
                onClick={() => setShowSegregationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <input 
              type="text"
              placeholder="Search item (e.g., TetraPak, Bottle, Battery)..."
              value={segregationQuery}
              onChange={(e) => setSegregationQuery(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
            />

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {segregationItems
                .filter(i => i.item.toLowerCase().includes(segregationQuery.toLowerCase()) || i.category.toLowerCase().includes(segregationQuery.toLowerCase()))
                .map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/40 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 dark:text-white">{item.item}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-full">{item.category}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{item.prep}</p>
                  </div>
                ))}
            </div>

            <button 
              onClick={() => setShowSegregationModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Done / Back to Scheduling
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePickup;
