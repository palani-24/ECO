import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTruck, FaPhoneAlt, FaComments, FaClock, FaLeaf, FaStar, 
  FaPlay, FaCheck, FaHome, FaShoppingCart, FaShieldAlt, FaBolt,
  FaRedo, FaCheckCircle, FaMapMarkerAlt
} from 'react-icons/fa';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';

// Fix Leaflet default icon paths in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Real Coimbatore Avinashi Road Route Waypoints
const COIMBATORE_ROUTE = [
  [11.0168, 76.9558], // Citizen Gate (Lakshmi Mills / Race Course)
  [11.0175, 76.9590],
  [11.0188, 76.9635],
  [11.0205, 76.9680], // Mid En Route
  [11.0225, 76.9720],
  [11.0250, 76.9760]  // Eco Hub (Peelamedu)
];

const STAGES = [
  {
    id: 'assigned',
    title: 'Driver Assigned',
    subtitle: 'Driver accepted your doorstep recycling request',
    time: '10:12 AM',
    badge: 'ASSIGNED',
    progress: 25,
    icon: FaCheck,
    coordsIndex: 0,
    color: '#06b6d4', // Cyan
    glowClass: 'from-cyan-500 to-sky-600',
    ringColor: 'ring-cyan-500/40 shadow-cyan-500/30'
  },
  {
    id: 'en_route',
    title: 'Driver En Route',
    subtitle: 'Driver Karthik is moving toward your gate via Avinashi Road',
    time: '10:18 AM',
    badge: 'LIVE GPS',
    progress: 62,
    icon: FaTruck,
    coordsIndex: 3,
    color: '#10b981', // Emerald
    glowClass: 'from-emerald-500 to-teal-600',
    ringColor: 'ring-emerald-500/40 shadow-emerald-500/30'
  },
  {
    id: 'arrived',
    title: 'Arrived at Doorstep',
    subtitle: 'Driver has reached your gate. Please share your 4-digit OTP',
    time: '10:24 AM',
    badge: 'DOORSTEP',
    progress: 88,
    icon: FaHome,
    coordsIndex: 1,
    color: '#f59e0b', // Amber
    glowClass: 'from-amber-500 to-orange-600',
    ringColor: 'ring-amber-500/40 shadow-amber-500/30'
  },
  {
    id: 'completed',
    title: 'Weighed & Credited',
    subtitle: '8.5 kg waste verified! +180 EcoPoints added to green wallet',
    time: '10:30 AM',
    badge: 'COMPLETED',
    progress: 100,
    icon: FaShoppingCart,
    coordsIndex: 5,
    color: '#a855f7', // Violet
    glowClass: 'from-purple-500 to-fuchsia-600',
    ringColor: 'ring-purple-500/40 shadow-purple-500/30'
  }
];

// Custom HTML Markers for Leaflet with Modern Dark & Light Styling
const gateIcon = L.divIcon({
  className: 'gate-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#0f172a; color:#38bdf8; border:2.5px solid #0284c7; width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 20px rgba(56,189,248,0.5); font-size:18px; position:relative;">
            🏠
            <span style="position:absolute; width:100%; height:100%; border-radius:50%; border:2px solid #38bdf8; animation:ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite; opacity:0.75;"></span>
          </div>
          <span style="background:rgba(15,23,42,0.95); color:#e2e8f0; font-weight:800; font-size:10px; padding:3px 10px; border-radius:999px; border:1px solid rgba(56,189,248,0.4); box-shadow:0 4px 14px rgba(0,0,0,0.4); margin-top:4px; white-space:nowrap; letter-spacing:0.2px;">
            Your Gate
          </span>
         </div>`,
  iconSize: [64, 64],
  iconAnchor: [32, 22]
});

const hubIcon = L.divIcon({
  className: 'hub-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#0f172a; color:#34d399; border:2.5px solid #059669; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 16px rgba(16,185,129,0.4); font-size:18px;">
            ♻️
          </div>
          <span style="background:rgba(15,23,42,0.95); color:#e2e8f0; font-weight:800; font-size:10px; padding:3px 9px; border-radius:999px; border:1px solid rgba(16,185,129,0.4); box-shadow:0 4px 10px rgba(0,0,0,0.3); margin-top:3px; white-space:nowrap;">
            Eco Hub
          </span>
         </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 20]
});

const createTruckIcon = (etaCountdown, liveSpeed) => L.divIcon({
  className: 'truck-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:rgba(15,23,42,0.95); backdrop-filter:blur(8px); color:#ffffff; font-weight:800; font-size:10px; padding:3px 10px; border-radius:999px; box-shadow:0 6px 18px rgba(0,0,0,0.4); margin-bottom:4px; white-space:nowrap; display:flex; align-items:center; gap:5px; border:1px solid rgba(52,211,153,0.5);">
            <span style="color:#00f2aa; font-size:10px;">⚡</span>
            <span>${etaCountdown} MINS</span>
            <span style="color:#94a3b8; font-weight:600; font-size:9px;">• ${liveSpeed} km/h</span>
          </div>
          <div style="background:linear-gradient(135deg, #10b981 0%, #064e3b 100%); color:#ffffff; border:2.5px solid #00f2aa; width:46px; height:46px; border-radius:15px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 25px rgba(0,242,170,0.5); font-size:22px; position:relative;">
            🚚
            <span style="position:absolute; top:-3px; right:-3px; width:12px; height:12px; background:#00f2aa; border-radius:50%; border:2px solid #0f172a; box-shadow:0 0 10px #00f2aa;"></span>
          </div>
         </div>`,
  iconSize: [84, 84],
  iconAnchor: [42, 52]
});

// Map Viewport Auto-Center Controller
const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
};

const LiveUberPickupTracker = ({ 
  pickup: externalPickup = null,
  onOpenChat = null,
  className = '' 
}) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(1); // Default to 'Driver En Route'
  const [etaCountdown, setEtaCountdown] = useState(5);
  const [liveSpeed, setLiveSpeed] = useState(24);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Watch for dark mode changes on <html>
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const activeStage = STAGES[currentStageIndex];
  const driverCurrentPosition = COIMBATORE_ROUTE[activeStage.coordsIndex];

  useEffect(() => {
    if (externalPickup?.status) {
      const s = externalPickup.status.toLowerCase();
      if (s === 'pending' || s === 'assigned') setCurrentStageIndex(0);
      else if (s === 'accepted' || s === 'en_route') setCurrentStageIndex(1);
      else if (s === 'arrived') setCurrentStageIndex(2);
      else if (s === 'completed') setCurrentStageIndex(3);
    }
  }, [externalPickup?.status]);

  useEffect(() => {
    if (currentStageIndex === 1) {
      const interval = setInterval(() => {
        setLiveSpeed(prev => 21 + Math.floor(Math.random() * 6));
        setEtaCountdown(prev => (prev > 1 ? prev - 1 : 1));
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [currentStageIndex]);

  const handleSelectStage = (index) => {
    setCurrentStageIndex(index);
    if (index === 3) {
      soundFx.playSuccessChime();
      triggerConfetti({ count: 90 });
    } else {
      soundFx.playScanBeep();
    }
  };

  const handleRunDemo = () => {
    setIsDemoRunning(true);
    setCurrentStageIndex(0);
    soundFx.playScanBeep();

    setTimeout(() => {
      setCurrentStageIndex(1);
      soundFx.playScanBeep();
    }, 2200);

    setTimeout(() => {
      setCurrentStageIndex(2);
      soundFx.playScanBeep();
    }, 4800);

    setTimeout(() => {
      setCurrentStageIndex(3);
      soundFx.playSuccessChime();
      triggerConfetti({ count: 100 });
      setIsDemoRunning(false);
    }, 7500);
  };

  // Driver details
  const driverName = externalPickup?.driver?.name || externalPickup?.assignedDriver?.name || 'Karthik Raja';
  const driverPhone = externalPickup?.driver?.phone || '+91 93610 99771';
  const vehicleNumber = externalPickup?.driver?.vehicleNumber || 'TN-38-AX-9945';
  const vehicleType = externalPickup?.driver?.vehicleType || 'Tata Ace EV (Zero Emission)';
  const otpCode = externalPickup?.otpCode || '4829';
  const wasteType = externalPickup?.wasteType || 'Plastics & E-Waste';
  const estimatedWeight = externalPickup?.estimatedWeight || '8.5 kg';
  const pickupId = externalPickup?._id ? externalPickup._id.substring(0, 8).toUpperCase() : '6AD05CE6';

  return (
    <div className={`relative overflow-hidden rounded-3xl glass-bright p-5 sm:p-7 text-slate-800 dark:text-slate-100 shadow-xl border border-white/80 dark:border-slate-800 dark:bg-[#07131e]/90 ${className}`}>
      
      {/* Top Header: Badge, Title & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center space-x-3.5">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center text-xl shadow-lg shadow-emerald-500/25">
              <FaTruck className="h-5 w-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-white dark:border-slate-900"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Doorstep Pickup Tracker
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shadow-2xs flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                LIVE GPS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-2">
              <span>Order #{pickupId}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{wasteType}</span>
              <span>•</span>
              <span>~{estimatedWeight}</span>
            </p>
          </div>
        </div>

        {/* ETA & Interactive Demo Button */}
        <div className="flex items-center space-x-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 border border-emerald-500/30 dark:border-cyan-500/30 flex items-center space-x-1.5 text-emerald-700 dark:text-cyan-300 text-xs font-black shadow-xs">
            <FaClock className="text-xs text-emerald-500 dark:text-cyan-400" />
            <span>ETA {etaCountdown} Mins</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 text-xs font-black transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Simulate complete pickup journey in real-time"
          >
            <FaPlay className="text-[10px] text-emerald-600 dark:text-cyan-400" />
            <span>{isDemoRunning ? 'Simulating...' : 'Simulate Flow'}</span>
          </motion.button>
        </div>
      </div>

      {/* 4-Step Milestone Progress Bar with Distinct Color Highlights */}
      <div className="relative py-6">
        <div className="grid grid-cols-4 gap-2 relative">
          
          {/* Connecting Multicolored Progress Conduit */}
          <div className="absolute top-5 left-10 right-10 h-2 bg-slate-200/80 dark:bg-slate-800/90 rounded-full z-0 overflow-hidden shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 via-amber-400 to-purple-500 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${activeStage.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>

          {STAGES.map((stage, idx) => {
            const isPassed = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => handleSelectStage(idx)}
                className="relative z-10 flex flex-col items-center text-center group cursor-pointer focus:outline-none"
              >
                {/* Node Circle */}
                <div 
                  className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    isCurrent 
                      ? `bg-gradient-to-br ${stage.glowClass} text-white ring-4 ${stage.ringColor} shadow-lg scale-110`
                      : isPassed 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-300 dark:border-slate-700 shadow-2xs'
                  }`}
                >
                  <Icon className="text-sm" />
                </div>

                <span className={`mt-2.5 text-xs font-extrabold truncate max-w-full transition-colors ${
                  isCurrent ? 'text-cyan-600 dark:text-cyan-400' : isPassed ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {stage.title}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                  {stage.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Interactive Leaflet GPS Map with Dark Matter Mode */}
      <div className="relative my-2 rounded-2xl bg-white dark:bg-[#060d17] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        
        {/* Telematics Bar Top */}
        <div className="flex items-center justify-between text-xs font-semibold px-4 py-3 bg-slate-50/95 dark:bg-[#081320]/95 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800 z-10 relative">
          <div className="flex items-center space-x-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-900 dark:text-slate-100 font-bold">{activeStage.subtitle}</span>
          </div>
          <div className="flex items-center space-x-3.5 text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
              <FaLeaf className="text-xs" /> Zero Emission EV
            </span>
            <span className="font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-md font-bold text-[11px] border border-cyan-500/20">
              {liveSpeed} km/h
            </span>
          </div>
        </div>

        {/* Real Interactive Leaflet Map Canvas */}
        <div className="relative h-64 sm:h-80 w-full z-0">
          <MapContainer
            center={driverCurrentPosition}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Dynamic Tile Layer: CartoDB Dark Matter in Dark Mode / Voyager in Light Mode */}
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              }
              maxZoom={19}
            />

            <MapController center={driverCurrentPosition} />

            {/* Glowing Neon Emerald & Cyan Highway Polyline */}
            <Polyline
              positions={COIMBATORE_ROUTE}
              color={isDarkMode ? "#00f2aa" : "#059669"}
              weight={isDarkMode ? 9 : 8}
              opacity={isDarkMode ? 0.95 : 0.9}
              lineCap="round"
            />
            <Polyline
              positions={COIMBATORE_ROUTE}
              color={isDarkMode ? "#38bdf8" : "#34d399"}
              weight={3}
              dashArray="6, 8"
              opacity={1}
            />

            {/* Citizen Home Gate Marker (Lakshmi Mills / Avinashi Rd) */}
            <LeafletMarker position={COIMBATORE_ROUTE[0]} icon={gateIcon}>
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">🏠 Your Gate</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Avinashi Road, Coimbatore</p>
                </div>
              </Popup>
            </LeafletMarker>

            {/* Moving EV Green Truck Driver Marker */}
            <LeafletMarker 
              position={driverCurrentPosition} 
              icon={createTruckIcon(etaCountdown, liveSpeed)}
            >
              <Popup>
                <div className="p-1 font-sans text-center">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">🚚 {driverName}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{vehicleNumber} • {liveSpeed} km/h</p>
                  <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-black mt-0.5">ETA: {etaCountdown} Mins</p>
                </div>
              </Popup>
            </LeafletMarker>

            {/* Destination Scrap Hub Marker (Peelamedu) */}
            <LeafletMarker position={COIMBATORE_ROUTE[5]} icon={hubIcon}>
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-slate-900 dark:text-white text-xs">♻️ Eco Hub</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Central Waste Sorting Station</p>
                </div>
              </Popup>
            </LeafletMarker>
          </MapContainer>
        </div>
      </div>

      {/* Driver Card + Doorstep OTP Bar */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Driver Profile (8 cols) */}
        <div className="md:col-span-8 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-cyan-500/25 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-md shadow-cyan-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                  alt="Karthik Raja" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                <FaCheckCircle className="text-[9px] text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-slate-900 dark:text-white">{driverName}</h4>
                <div className="flex items-center text-amber-500 text-xs font-black bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  <FaStar className="mr-0.5 text-[10px]" /> 4.9
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {vehicleNumber} • <span className="text-emerald-600 dark:text-emerald-400 font-bold">{vehicleType}</span>
              </p>
            </div>
          </div>

          {/* Quick Call & Chat Buttons */}
          <div className="flex items-center space-x-2.5">
            <a 
              href={`tel:${driverPhone}`}
              className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95"
              title="Call Driver"
            >
              <FaPhoneAlt className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" />
            </a>

            <button 
              onClick={() => onOpenChat ? onOpenChat() : alert(`Starting Live In-App Chat with Driver: ${driverName}`)}
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-600 to-emerald-600 hover:from-cyan-600 hover:to-emerald-700 text-white transition flex items-center justify-center cursor-pointer shadow-md shadow-cyan-500/30 active:scale-95"
              title="Chat with Driver"
            >
              <FaComments className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security Doorstep OTP Box (4 cols) */}
        <div className="md:col-span-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 dark:bg-amber-950/30 border border-amber-500/35 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-amber-300 flex items-center gap-1">
              <FaShieldAlt className="text-amber-600 dark:text-amber-400 text-xs" />
              DOORSTEP OTP
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mt-0.5">
              Share after digital weighing
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl font-black tracking-widest text-amber-700 dark:text-amber-400 bg-white/80 dark:bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/40 shadow-xs">
              {otpCode}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveUberPickupTracker;
