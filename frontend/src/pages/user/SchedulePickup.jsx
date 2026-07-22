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
      pickupAddress: user.addresses[selectedAddressIndex]
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
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                      <span>Estimated Weight (kg)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={estimatedWeight}
                      onChange={(e) => setEstimatedWeight(Math.max(1, parseInt(e.target.value) || 1))}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-sm focus:outline-none"
                    />
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
    </div>
  );
};

export default SchedulePickup;
