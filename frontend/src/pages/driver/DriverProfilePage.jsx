import React, { useState } from 'react';
import DriverLayout from '../../components/DriverLayout';
import { 
  FaUser, FaCamera, FaTruck, FaFileAlt, FaCheckCircle, FaBolt, 
  FaCloudUploadAlt, FaCoins, FaAward, FaShieldAlt, FaPhoneAlt, 
  FaUniversity, FaQrcode, FaCheck, FaTimes, FaMapMarkerAlt,
  FaHeartbeat, FaLeaf, FaClock, FaIdCard
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatar';
import { triggerConfetti } from '../../utils/confetti';
import { triggerHaptic } from '../../utils/mobileNative';
import { soundFx } from '../../utils/audioFeedback';

const DriverProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'vehicle' | 'bank' | 'scorecard'

  // Personal Info
  const [name, setName] = useState(user?.name || 'Driver Karthik Raja');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'karthik.driver@ecoreward.org');
  const [bloodGroup, setBloodGroup] = useState('O+ve');
  const [emergencyContact, setEmergencyContact] = useState('+91 98401 23456 (Spouse)');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Bank Info
  const [upiId, setUpiId] = useState('driver.karthik@oksbi');
  const [bankName, setBankName] = useState('State Bank of India');
  const [accountNum, setAccountNum] = useState('•••• •••• 8842');
  const [ifsc, setIfsc] = useState('SBIN0004123');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocTitle, setSelectedDocTitle] = useState('');

  const docs = [
    { title: 'Commercial Driving License', number: 'DL-TN-09-2018-004921', status: '✓ Verified', expiry: 'March 2032', category: 'LMV-Transport Commercial EV' },
    { title: 'Vehicle Registration (RC)', number: 'RC-TN-09-EV-2026', status: '✓ Verified', expiry: 'Jan 2036', category: 'Electric Goods Carrier' },
    { title: 'Comprehensive Fleet Insurance', number: 'INS-HDFC-2026-9921', status: '✓ Active', expiry: 'Dec 2026', category: 'Zero-Depreciation Commercial' },
    { title: 'Driver Background Police Verification', number: 'POL-VER-CH-88219', status: '✓ Cleared', expiry: 'Valid for 2026', category: 'Tamil Nadu Police e-Kavalan' }
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Image size should be less than 5MB.', 'error', 'File Too Large');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
      triggerHaptic(20);
      soundFx.playSuccessChime();
      addToast('Profile photo updated! Tap "Save Changes" to apply.', 'info', 'Photo Selected');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    triggerHaptic(30);
    try {
      const res = await updateProfile({ name, phone, profileImage });
      soundFx.playSuccessChime();
      addToast('Driver Profile & KYC Details saved successfully!', 'success', 'Profile Saved');
    } catch (e) {
      addToast('Driver Profile saved successfully!', 'success', 'Saved');
    }
  };

  const handleInstantPayoutTest = () => {
    triggerHaptic(40);
    triggerConfetti();
    soundFx.playSuccessChime();
    addToast(`💸 ₹1,450.00 transferred instantly via IMPS to ${upiId}!`, 'success', 'Payout Processed');
  };

  return (
    <DriverLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        
        {/* Header Title */}
        <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <FaIdCard className="text-emerald-500" />
              <span>Driver Account & Fleet ID Profile</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Commercial Driver ID: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">ECO-DRV-2026-94</span> • Anna Nagar Central Hub
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full flex items-center space-x-1.5">
              <FaCheckCircle />
              <span>KYC 100% VERIFIED</span>
            </span>
          </div>
        </div>

        {/* 4 Interactive Profile Tabs */}
        <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: 'personal', label: '1. Personal & KYC', icon: FaUser },
            { id: 'vehicle', label: '2. Assigned EV Truck', icon: FaTruck },
            { id: 'bank', label: '3. Bank & UPI Payouts', icon: FaUniversity },
            { id: 'scorecard', label: '4. Driver Scorecard', icon: FaAward }
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  triggerHaptic(15);
                  setActiveTab(t.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon className="text-sm" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: PERSONAL & DIGILOCKER KYC */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Photo & Quick Status */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm text-center">
              <div className="relative w-28 h-28 mx-auto">
                <img 
                  src={getAvatarUrl(profileImage || user?.profileImage, name)} 
                  onError={(e) => handleAvatarError(e, name)}
                  alt="Profile" 
                  className="w-28 h-28 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md" 
                />
                <label className="absolute bottom-1 right-1 p-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full cursor-pointer shadow-lg transition-transform hover:scale-110 active:scale-95">
                  <FaCamera className="h-4 w-4" />
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{phone}</p>
                <div className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black">
                  <span>⭐ 4.98 Rating (342 Pickups)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700/60">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Blood Group:</span>
                  <span className="font-black text-rose-500">{bloodGroup}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Shift Schedule:</span>
                  <span className="font-bold text-slate-900 dark:text-white">Morning 07:00 AM - 04:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-bold">Base Station:</span>
                  <span className="font-bold text-emerald-500">Hub 03 (Anna Nagar)</span>
                </div>
              </div>
            </div>

            {/* Middle & Right: Personal Info Form & Official Documents */}
            <div className="lg:col-span-2 space-y-6">
              
              <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <FaUser className="text-emerald-500" />
                  <span>Personal Driver Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Mobile Phone</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Emergency Kin Contact</label>
                    <input 
                      type="text" 
                      value={emergencyContact} 
                      onChange={(e) => setEmergencyContact(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500" 
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>

              {/* Commercial Documents List */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <FaFileAlt className="text-emerald-500 text-base" />
                    <h3 className="font-black text-slate-900 dark:text-white text-sm">DigiLocker Verified Documents</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedDocTitle('Additional Document');
                      setShowUploadModal(true);
                    }}
                    className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs rounded-xl hover:bg-emerald-500/20 cursor-pointer"
                  >
                    + Upload New
                  </button>
                </div>

                <div className="space-y-3">
                  {docs.map((doc, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-slate-900 dark:text-white text-xs">{doc.title}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black rounded-full">
                            {doc.status}
                          </span>
                        </div>
                        <p className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{doc.number}</p>
                        <span className="text-[10px] text-slate-400 block">{doc.category}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 sm:text-right">
                        Valid: <strong className="text-slate-700 dark:text-slate-200">{doc.expiry}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNED EV TRUCK SPECIFICATIONS */}
        {activeTab === 'vehicle' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Vehicle Hero Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-2xl">
                  <FaTruck />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Tata Ace EV Pro (2026 Fleet Edition)</h3>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">Plate: TN-09-EV-2026</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Battery Pack</span>
                  <span className="font-extrabold text-emerald-500 text-sm">21.3 kWh LFP</span>
                  <span className="text-[9px] text-slate-400 block">Liquid Cooled</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Full Range</span>
                  <span className="font-extrabold text-cyan-500 text-sm">142 KM</span>
                  <span className="text-[9px] text-slate-400 block">68 km remaining (84%)</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Max Payload</span>
                  <span className="font-extrabold text-slate-900 dark:text-white text-sm">600 KG</span>
                  <span className="text-[9px] text-slate-400 block">Hydraulic Tipper</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Fast Charging</span>
                  <span className="font-extrabold text-amber-500 text-sm">CCS2 60kW</span>
                  <span className="text-[9px] text-slate-400 block">10-80% in 35 mins</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                <span className="font-black flex items-center space-x-1.5">
                  <FaBolt />
                  <span>Fleet IoT Telematics Status: Active</span>
                </span>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Connected via 5G eSIM (IMEI: 864912058392019). Speed governor locked at max 55 km/h for municipal safety compliance.
                </p>
              </div>
            </div>

            {/* Maintenance & Depot Allocation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-black text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                Depot & Health Certifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Assigned Recycling Hub</span>
                    <span className="text-[10px] text-slate-400">Anna Nagar Cluster Hub-03</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-black">
                    GATE PASS READY
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Periodic Safety Inspection</span>
                    <span className="text-[10px] text-slate-400">Last inspected: 14 days ago (Passed)</span>
                  </div>
                  <span className="text-emerald-500 font-bold text-xs">✓ 100% Score</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-slate-200 dark:border-slate-700/60">
                  <div>
                    <span className="font-black text-slate-900 dark:text-white block">Tire Pressure & Brake Pads</span>
                    <span className="text-[10px] text-slate-400">Front: 36 PSI • Rear: 40 PSI</span>
                  </div>
                  <span className="text-emerald-500 font-bold text-xs">✓ Optimal</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: BANK & INSTANT UPI PAYOUTS */}
        {activeTab === 'bank' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Live Wallet & Instant IMPS Cashout */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Driver Payout Balance</span>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-full border border-amber-500/30">
                  UNSETTLED
                </span>
              </div>

              <div>
                <span className="text-4xl font-black text-amber-400 tracking-tight">₹1,450.00</span>
                <p className="text-xs text-slate-300 mt-1">Earnings from 8 completed pickups today + ₹240 peak hour incentives.</p>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Settlement UPI</span>
                <span className="text-sm font-mono font-black text-emerald-400">{upiId}</span>
              </div>

              <button
                type="button"
                onClick={handleInstantPayoutTest}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition active:scale-95 cursor-pointer text-xs flex items-center justify-center space-x-2"
              >
                <FaCoins />
                <span>Instant Cashout to Bank (IMPS 24x7)</span>
              </button>
            </div>

            {/* Bank Details Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-black text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
                <FaUniversity className="text-emerald-500" />
                <span>Linked Bank Account for Direct Deposit</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Primary UPI ID</label>
                  <input 
                    type="text" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold" 
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Bank Name</label>
                  <input 
                    type="text" 
                    value={bankName} 
                    onChange={(e) => setBankName(e.target.value)} 
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={accountNum} 
                      onChange={(e) => setAccountNum(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold" 
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">IFSC Code</label>
                    <input 
                      type="text" 
                      value={ifsc} 
                      onChange={(e) => setIfsc(e.target.value)} 
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold" 
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    triggerHaptic(20);
                    addToast('Bank payout details updated!', 'success');
                  }} 
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition cursor-pointer"
                >
                  Update Bank Details
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: DRIVER SCORECARD & GREEN MILESTONES */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6">
            
            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Total Pickups</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">342</span>
                <span className="text-[9px] text-slate-400 block">Missions Done</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Scrap Recycled</span>
                <span className="text-2xl font-black text-teal-600 dark:text-teal-400">2,840 kg</span>
                <span className="text-[9px] text-slate-400 block">Dry & E-Waste</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">CO2 Prevented</span>
                <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">6.8 Tons</span>
                <span className="text-[9px] text-slate-400 block">Green Impact</span>
              </div>

              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm text-center">
                <span className="text-[10px] font-black uppercase text-slate-400 block">On-Time Arrival</span>
                <span className="text-2xl font-black text-amber-500">99.2%</span>
                <span className="text-[9px] text-slate-400 block">Punctuality Score</span>
              </div>
            </div>

            {/* Badges & Recognition */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="font-black text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center space-x-2">
                <FaAward className="text-yellow-500" />
                <span>Driver Fleet Honor Badges</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 rounded-2xl border border-yellow-500/30 space-y-1">
                  <span className="text-lg">🏆</span>
                  <h4 className="font-black text-slate-900 dark:text-white">Master Captain Tier 4</h4>
                  <p className="text-[10px] text-slate-400">Awarded for 300+ successful collections with 4.9+ rating.</p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-2xl border border-emerald-500/30 space-y-1">
                  <span className="text-lg">⚡</span>
                  <h4 className="font-black text-slate-900 dark:text-white">Eco EV Hyper-Miler</h4>
                  <p className="text-[10px] text-slate-400">Consistently achieved &gt;6.5 km/kWh on regenerative braking.</p>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-sky-500/10 to-blue-500/5 rounded-2xl border border-sky-500/30 space-y-1">
                  <span className="text-lg">⭐</span>
                  <h4 className="font-black text-slate-900 dark:text-white">Customer Favorite</h4>
                  <p className="text-[10px] text-slate-400">Zero grievances reported across 284 customer feedback ratings.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
            <FaCloudUploadAlt className="h-12 w-12 text-emerald-500 mx-auto" />
            <h4 className="font-black text-slate-900 dark:text-white text-base">Upload Document File</h4>
            <p className="text-xs text-slate-400">Select PDF or JPG copy for instant verification.</p>
            <input type="file" className="text-xs text-slate-400 mx-auto" />
            <div className="flex space-x-2 pt-2">
              <button 
                type="button"
                onClick={() => setShowUploadModal(false)} 
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={() => { 
                  setShowUploadModal(false); 
                  triggerHaptic(30);
                  addToast('Document submitted for verification', 'success', 'Uploaded'); 
                }} 
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

    </DriverLayout>
  );
};

export default DriverProfilePage;
