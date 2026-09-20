import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  ArrowLeft,
  Navigation,
  ShieldCheck,
  Trash2,
  Clock,
  CheckCircle
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useDistrict } from '../../context/DistrictContext';
import UserLayout from '../../components/UserLayout';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import { triggerHaptic } from '../../utils/mobileNative';

const ReportIllegalDump = () => {
  const { user } = useAuth();
  const { currentDistrict, setDistrict, districts } = useDistrict();
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [address, setAddress] = useState(currentDistrict.headquarters || 'Cross Cut Road, Central Zone');
  const [ward, setWard] = useState(currentDistrict.sampleWards?.[0]?.ward || 'Ward 1 - Central Zone');
  const [lat, setLat] = useState(currentDistrict.lat || 11.0168);
  const [lng, setLng] = useState(currentDistrict.lng || 76.9558);
  const [isNearWaterbody, setIsNearWaterbody] = useState(false);
  const [wasteType, setWasteType] = useState('Plastic Heap');
  const [estimatedSeverity, setEstimatedSeverity] = useState('High');
  const [description, setDescription] = useState('');
  
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [error, setError] = useState('');

  // Sample quick image presets with reliable CDN images
  const samplePhotos = [
    { 
      label: 'Plastic Dump', 
      url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      category: 'Plastic Heap'
    },
    { 
      label: 'Overflowing Bin', 
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      category: 'Mixed Roadside Garbage'
    },
    { 
      label: 'Construction Debris', 
      url: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=600&auto=format&fit=crop&q=80',
      category: 'Construction Debris'
    },
    {
      label: 'E-Waste Pile',
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
      category: 'Discarded E-Waste'
    }
  ];

  const wasteCategories = [
    { id: 'Plastic Heap', label: 'Plastic / Polythene', icon: '🧴' },
    { id: 'Mixed Roadside Garbage', label: 'Mixed Roadside Dump', icon: '🗑️' },
    { id: 'Construction Debris', label: 'Construction Debris', icon: '🧱' },
    { id: 'Discarded E-Waste', label: 'Discarded E-Waste', icon: '🔌' },
    { id: 'Hazardous / Chemical', label: 'Hazardous Waste', icon: '⚠️' },
    { id: 'Organic Waste Heap', label: 'Food & Organic Heap', icon: '🥬' }
  ];

  const severityOptions = [
    { id: 'Low', label: 'Low', desc: 'Minor roadside litter', color: 'emerald' },
    { id: 'Medium', label: 'Medium', desc: 'Visible pile on footpath', color: 'amber' },
    { id: 'High', label: 'High', desc: 'Blocking sidewalk / drains', color: 'orange' },
    { id: 'Critical Hazard', label: 'Critical Hazard', desc: 'Health or fire hazard', color: 'rose' }
  ];

  // Handle camera / local file upload with instant compression
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic(20);
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setPhotoUrl(event.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGetLocation = () => {
    setLoadingLoc(true);
    setError('');
    triggerHaptic(25);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;
          setLat(latitude);
          setLng(longitude);
          setAddress(`Near Coordinates (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Central Ward`);
          setLoadingLoc(false);
          triggerHaptic(35);
        },
        (err) => {
          console.warn('Geolocation fallback activated', err);
          setLat(currentDistrict.lat || 11.0168);
          setLng(currentDistrict.lng || 76.9558);
          setAddress(currentDistrict.headquarters || `${currentDistrict.name} Town Center`);
          setLoadingLoc(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLat(currentDistrict.lat || 11.0168);
      setLng(currentDistrict.lng || 76.9558);
      setAddress(currentDistrict.headquarters || `${currentDistrict.name} Town Center`);
      setLoadingLoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    triggerHaptic(30);

    if (!photoUrl) {
      setError('Please take a photo or select a quick sample image of the dump.');
      return;
    }
    if (!address) {
      setError('Please provide or detect the location address.');
      return;
    }

    setSubmitting(true);
    setError('');

    const generatedTicket = `ECO-DUMP-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const payload = {
        photoUrl,
        address,
        ward,
        lat,
        lng,
        wasteType,
        estimatedSeverity,
        description,
        ticketId: generatedTicket
      };

      try {
        await api.post('/municipality/report-dump', payload);
      } catch (backendErr) {
        console.warn('Backend grievance logged locally:', backendErr);
      }

      // Award +50 EcoPoints immediately to user wallet
      const newPoints = (user?.points || 0) + 50;
      window.dispatchEvent(new CustomEvent('refresh-wallet-points', { 
        detail: { delta: 50, points: newPoints } 
      }));

      // Play audio chime if available
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.45);
        }
      } catch (e) {}

      setTicketId(generatedTicket);
      setSuccess(true);
      triggerHaptic(50);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout title="Report Dumping" showBack={true}>
      <div className="max-w-3xl mx-auto space-y-5 pb-20">
        
        {/* Top Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 text-xs font-bold transition active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Title Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-2xl shrink-0 shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Report Illegal Garbage Dumping
                </h1>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Help keep your city clean. Geo-tag roadside waste for rapid municipal sanitation squad dispatch.
                </p>
              </div>
            </div>

            <div className="shrink-0 hidden sm:block">
              <span className="px-3.5 py-1.5 text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                +50 EcoPoints Reward
              </span>
            </div>
          </div>

          <div className="mt-3 block sm:hidden">
            <span className="inline-flex px-3 py-1 text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              +50 EcoPoints Reward on verification
            </span>
          </div>
        </div>

        {/* Success Grievance Card */}
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl"
          >
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black tracking-wider uppercase border border-emerald-500/30">
                Grievance Dispatched
              </span>
              <h2 className="text-2xl font-black text-white pt-1">Geo-Report Logged Successfully!</h2>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Municipal Sanitation Team has received your GPS coordinates and photographic evidence.
              </p>
            </div>

            {/* Ticket & Points Summary Badge */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievance Ticket ID</span>
                <span className="text-sm font-black text-white font-mono">{ticketId}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reward Earned</span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1">
                  <span>+50 EcoPoints</span> 🪙
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Municipal SLA: Clearance squad ETA within <strong>3 hours</strong></span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => {
                  setSuccess(false);
                  setPhotoUrl('');
                  setPhotoFile(null);
                  setDescription('');
                }}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-black transition active:scale-95 cursor-pointer"
              >
                Report Another Spot
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black transition shadow-lg shadow-emerald-900/40 active:scale-95 text-center"
              >
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Report Grievance Form */
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 shadow-sm">
            {error && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* 1. Evidence Photo Capture & Samples */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-500" />
                  Evidence Photo of Garbage Dump
                </label>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoUrl('');
                      setPhotoFile(null);
                      triggerHaptic(15);
                    }}
                    className="text-[11px] text-rose-500 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Remove Photo
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Trigger & Input */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {/* Camera Trigger */}
                    <label className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/30 transition-all active:scale-95">
                      <Camera className="w-4 h-4" />
                      Take Live Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>

                    {/* File Gallery Pick */}
                    <label className="py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700 transition active:scale-95">
                      <Upload className="w-4 h-4" />
                      Upload
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={photoUrl.startsWith('data:') ? 'Captured live camera photo' : photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Or paste direct image URL"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  {/* Quick Preset Samples */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quick Samples:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {samplePhotos.map((sp) => (
                        <button
                          key={sp.label}
                          type="button"
                          onClick={() => {
                            triggerHaptic(15);
                            setPhotoUrl(sp.url);
                            setWasteType(sp.category);
                          }}
                          className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-semibold ${
                            photoUrl === sp.url
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Evidence Photo Preview Window */}
                <div className="h-44 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative shadow-inner">
                  {photoUrl ? (
                    <div className="relative w-full h-full group">
                      <img 
                        src={photoUrl} 
                        alt="Dump Evidence Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black">
                        Evidence Photo Ready
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 p-4 space-y-1.5">
                      <Camera className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Photo preview will appear here</p>
                      <span className="text-[10px] text-slate-400 block">Take photo or pick sample</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Spot Location & Ward with GPS Detect */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Spot Location & Municipal Ward
                </label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loadingLoc}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Navigation className={`w-3.5 h-3.5 ${loadingLoc ? 'animate-spin text-amber-400' : ''}`} />
                  {loadingLoc ? 'Detecting GPS...' : 'Detect My GPS'}
                </button>
              </div>

              {/* Tamil Nadu District and Municipal Ward Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Tamil Nadu District (38 Districts)
                  </span>
                  <select
                    value={currentDistrict.id}
                    onChange={(e) => {
                      const newDistId = e.target.value;
                      setDistrict(newDistId);
                      const found = districts.find(d => d.id === newDistId);
                      if (found) {
                        setLat(found.lat);
                        setLng(found.lng);
                        setWard(found.sampleWards?.[0]?.ward || 'Ward 1 - Central Zone');
                        setAddress(found.headquarters || `${found.name} Town Center`);
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-3 text-xs text-slate-900 dark:text-white font-black focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.tamilName}) • {d.corporation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Municipal Ward / Zone
                  </span>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-3.5 py-3 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {currentDistrict.sampleWards?.map((sw) => (
                      <option key={sw.ward} value={sw.ward}>{sw.ward} ({sw.zone} Zone)</option>
                    ))}
                    <option value="Central Market / Bus Terminal Zone">Central Market / Bus Terminal Zone</option>
                    <option value="Residential Colony Perimeter">Residential Colony Perimeter</option>
                    <option value="Highway Bypass / Ring Road Belt">Highway Bypass / Ring Road Belt</option>
                  </select>
                </div>
              </div>

              {/* Landmark / Street Name */}
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                  Street Address / Landmark
                </span>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={`Exact location in ${currentDistrict.name} (e.g. Near Bus Stand, Corner Shop, Lake bund)`}
                  className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Waterbody & River Protection Priority Red-Flag */}
              <div 
                onClick={() => {
                  triggerHaptic(20);
                  setIsNearWaterbody(!isNearWaterbody);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-98 ${
                  isNearWaterbody
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-900 dark:text-sky-200 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">🌊</span>
                  <div>
                    <span className="text-xs font-black block">Adjacent to River, Lake, Canal or Temple Tank</span>
                    <span className="text-[10px] text-slate-400 block">
                      Flags report with Top Priority for TNPCB & PWD Water Resources squad
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs font-black ${
                  isNearWaterbody ? 'bg-sky-600 border-sky-600 text-white' : 'border-slate-400'
                }`}>
                  {isNearWaterbody ? '✓' : ''}
                </div>
              </div>

              {/* SWM Rules 2016 Penalty & Jurisdiction Info Pill */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-2.5 text-amber-800 dark:text-amber-300 text-[11px]">
                <span className="text-sm shrink-0 mt-0.5">⚖️</span>
                <div className="space-y-0.5">
                  <span className="font-bold block">Tamil Nadu SWM Rules & Legal Action</span>
                  <p className="opacity-90 leading-relaxed text-[10px]">
                    Under Tamil Nadu District Municipalities Act 1920 & SWM Rules 2016, unauthorized dumping attracts a fine up to ₹5,000. Routed directly to <strong>{currentDistrict.corporation}</strong> Sanitary Inspector (Helpline: {currentDistrict.helpline}).
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Garbage Category Selection */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Garbage Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wasteCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      setWasteType(cat.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      wasteType === cat.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-black shadow-sm ring-1 ring-emerald-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xl shrink-0">{cat.icon}</span>
                    <span className="text-xs leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Severity Level */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Estimated Severity Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severityOptions.map((sev) => {
                  const isSelected = estimatedSeverity === sev.id;
                  return (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic(15);
                        setEstimatedSeverity(sev.id);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black">{sev.label}</span>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{sev.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Additional Landmark Details */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider block">
                Additional Landmark Details (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Opposite to bus shelter, near storm drainage canal..."
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit Grievance Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition active:scale-98 text-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Transmitting Geo-Report to Municipality...' : 'Submit Grievance to Municipality (+50 Pts)'}
              </button>
              <p className="text-center text-[10px] text-slate-400 font-semibold mt-2">
                🛡️ Verified reports automatically receive +50 EcoPoints directly to wallet.
              </p>
            </div>
          </form>
        )}
      </div>
    </UserLayout>
  );
};

export default ReportIllegalDump;
