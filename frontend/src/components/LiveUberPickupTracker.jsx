import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaTruck, FaPhoneAlt, FaComments, FaClock, FaLeaf, FaStar, 
  FaPlay, FaCheck, FaHome, FaShoppingCart
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
  [11.0168, 76.9558], // Your Gate (Lakshmi Mills / Race Course)
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
    subtitle: 'Driver accepted your pickup request',
    time: '10:12 AM',
    badge: 'ASSIGNED',
    progress: 25,
    icon: FaCheck,
    coordsIndex: 0
  },
  {
    id: 'en_route',
    title: 'Driver En Route',
    subtitle: 'Driver is moving toward your location via Avinashi Road',
    time: '10:18 AM',
    badge: 'LIVE GPS',
    progress: 62,
    icon: FaTruck,
    coordsIndex: 3
  },
  {
    id: 'arrived',
    title: 'Arrived at Doorstep',
    subtitle: 'Driver has reached your gate. Please share your 4-digit OTP',
    time: '--:--',
    badge: 'DOORSTEP',
    progress: 88,
    icon: FaHome,
    coordsIndex: 1
  },
  {
    id: 'completed',
    title: 'Weighed & Credited',
    subtitle: '8.5 kg waste verified! +180 EcoPoints added to green wallet',
    time: '--:--',
    badge: 'COMPLETED',
    progress: 100,
    icon: FaShoppingCart,
    coordsIndex: 5
  }
];

// Custom HTML Markers for Leaflet
const gateIcon = L.divIcon({
  className: 'gate-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#ffffff; color:#059669; border:2.5px solid #10b981; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.18); font-size:17px;">
            📍
          </div>
          <span style="background:#ffffff; color:#1e293b; font-weight:800; font-size:10px; padding:2px 8px; border-radius:999px; border:1px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.08); margin-top:3px; white-space:nowrap;">
            Your Gate
          </span>
         </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 20]
});

const hubIcon = L.divIcon({
  className: 'hub-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#ffffff; color:#059669; border:2.5px solid #10b981; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.18); font-size:17px;">
            🍃
          </div>
          <span style="background:#ffffff; color:#1e293b; font-weight:800; font-size:10px; padding:2px 8px; border-radius:999px; border:1px solid #cbd5e1; box-shadow:0 2px 6px rgba(0,0,0,0.08); margin-top:3px; white-space:nowrap;">
            Eco Hub
          </span>
         </div>`,
  iconSize: [60, 60],
  iconAnchor: [30, 20]
});

const createTruckIcon = (etaCountdown) => L.divIcon({
  className: 'truck-marker',
  html: `<div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#0f172a; color:#ffffff; font-weight:700; font-size:10px; padding:2px 8px; border-radius:999px; box-shadow:0 4px 10px rgba(0,0,0,0.25); margin-bottom:3px; white-space:nowrap; display:flex; align-items:center; gap:4px;">
            <span style="color:#34d399; font-size:9px;">⏱</span> ${etaCountdown} min
          </div>
          <div style="background:#0f9f6e; color:#ffffff; border:2px solid #ffffff; width:42px; height:42px; border-radius:14px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 20px rgba(15,159,110,0.5); font-size:20px; position:relative;">
            🚚
            <span style="position:absolute; top:-2px; right:-2px; width:10px; height:10px; background:#f59e0b; border-radius:50%; border:2px solid #ffffff;"></span>
          </div>
         </div>`,
  iconSize: [70, 70],
  iconAnchor: [35, 45]
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
        setLiveSpeed(prev => 22 + Math.floor(Math.random() * 5));
        setEtaCountdown(prev => (prev > 1 ? prev - 1 : 1));
      }, 9000);
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
    }, 2400);

    setTimeout(() => {
      setCurrentStageIndex(2);
      soundFx.playScanBeep();
    }, 5200);

    setTimeout(() => {
      setCurrentStageIndex(3);
      soundFx.playSuccessChime();
      triggerConfetti({ count: 100 });
      setIsDemoRunning(false);
    }, 8000);
  };

  // Driver details
  const driverName = externalPickup?.driver?.name || externalPickup?.assignedDriver?.name || 'Palani Driver';
  const driverPhone = externalPickup?.driver?.phone || '+91 93610 99771';
  const vehicleNumber = externalPickup?.driver?.vehicleNumber || 'TN-01-AX-9945';
  const vehicleType = externalPickup?.driver?.vehicleType || 'E-Rickshaw Tipper (EV)';
  const otpCode = externalPickup?.otpCode || '4829';
  const wasteType = externalPickup?.wasteType || 'Plastics & E-Waste';
  const estimatedWeight = externalPickup?.estimatedWeight || '8';
  const pickupId = externalPickup?._id ? externalPickup._id.substring(0, 8).toUpperCase() : '6AB7D28F';

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-white/95 backdrop-blur-sm border-2 border-slate-300 p-6 sm:p-7 text-slate-800 shadow-xl shadow-slate-900/5 ${className}`}>
      
      {/* Top Header: Badge, Title & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#ecfdf5] text-[#059669] border-2 border-[#a7f3d0] flex items-center justify-center text-xl shadow-xs">
            <FaTruck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Doorstep Pickup Tracker
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase rounded-full bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                LIVE GPS
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Order #{pickupId} - {wasteType} (~{estimatedWeight})
            </p>
          </div>
        </div>

        {/* ETA & Interactive Demo Button */}
        <div className="flex items-center space-x-2.5">
          <div className="px-3.5 py-1.5 rounded-full bg-[#ecfdf5] border-2 border-[#a7f3d0] flex items-center space-x-1.5 text-[#059669] text-xs font-bold shadow-xs">
            <FaClock className="text-xs" />
            <span>ETA {etaCountdown} Mins</span>
          </div>

          <button
            onClick={handleRunDemo}
            disabled={isDemoRunning}
            className="px-4 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
          >
            <FaPlay className="text-[10px] text-slate-800" />
            <span>Simulate Flow</span>
          </button>
        </div>
      </div>

      {/* 4-Step Milestone Progress Bar */}
      <div className="relative py-5">
        <div className="grid grid-cols-4 gap-2 relative">
          
          {/* Connecting Cyan/Teal Progress Line */}
          <div className="absolute top-5 left-10 right-10 h-1.5 bg-slate-200 rounded-full z-0 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#059669] via-[#0d9488] to-[#06b6d4] rounded-full"
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
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                    isCurrent 
                      ? 'bg-[#0f9f6e] text-white ring-4 ring-[#0f9f6e]/30 shadow-md scale-105' 
                      : isPassed 
                        ? 'bg-[#0f9f6e] text-white shadow-xs' 
                        : 'bg-white text-slate-400 border-2 border-slate-300 shadow-2xs'
                  }`}
                >
                  <Icon className="text-sm" />
                </div>

                <span className={`mt-2.5 text-xs font-bold truncate max-w-full ${
                  isCurrent ? 'text-slate-900 font-extrabold' : isPassed ? 'text-slate-800 font-bold' : 'text-slate-400 font-medium'
                }`}>
                  {stage.title}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {stage.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real Interactive Leaflet GPS Map Container with Crisp Outline */}
      <div className="relative my-2 rounded-2xl bg-white border-2 border-slate-300 overflow-hidden shadow-sm">
        
        {/* Telematics Bar Top */}
        <div className="flex items-center justify-between text-xs font-semibold px-4 py-2.5 bg-[#f8fafc] border-b-2 border-slate-200 z-10 relative">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-slate-800 font-bold">{activeStage.subtitle}</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-600">
            <span className="flex items-center gap-1.5 text-[#059669] font-bold">
              <FaLeaf className="text-xs" /> Zero Emission EV
            </span>
            <span className="font-mono text-slate-700 font-bold">{liveSpeed} km/h</span>
          </div>
        </div>

        {/* Real Interactive Leaflet Map Canvas */}
        <div className="relative h-60 sm:h-72 w-full z-0">
          <MapContainer
            center={driverCurrentPosition}
            zoom={15}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Free, Open, Clean Map Tiles (100% Free, Zero watermark, No API key required) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapController center={driverCurrentPosition} />

            {/* Road Route Polyline (Green Glowing Highway) */}
            <Polyline
              positions={COIMBATORE_ROUTE}
              color="#059669"
              weight={7}
              opacity={0.95}
              lineCap="round"
            />
            <Polyline
              positions={COIMBATORE_ROUTE}
              color="#34d399"
              weight={2.5}
              dashArray="6, 8"
              opacity={1}
            />

            {/* Citizen Home Gate Marker (Lakshmi Mills / Avinashi Rd) */}
            <LeafletMarker position={COIMBATORE_ROUTE[0]} icon={gateIcon}>
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-slate-900 text-xs">📍 Your Gate</p>
                  <p className="text-[11px] text-slate-500">Avinashi Road, Coimbatore</p>
                </div>
              </Popup>
            </LeafletMarker>

            {/* Moving EV Green Truck Driver Marker */}
            <LeafletMarker 
              position={driverCurrentPosition} 
              icon={createTruckIcon(etaCountdown)}
            >
              <Popup>
                <div className="p-1 font-sans text-center">
                  <p className="font-bold text-emerald-800 text-xs">🚚 {driverName}</p>
                  <p className="text-[11px] text-slate-600">{vehicleNumber} • {liveSpeed} km/h</p>
                  <p className="text-[10px] text-emerald-600 font-black mt-0.5">ETA: {etaCountdown} Mins</p>
                </div>
              </Popup>
            </LeafletMarker>

            {/* Destination Scrap Hub Marker (Peelamedu) */}
            <LeafletMarker position={COIMBATORE_ROUTE[5]} icon={hubIcon}>
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="font-bold text-slate-900 text-xs">🍃 Eco Hub</p>
                  <p className="text-[11px] text-slate-500">Central Waste Sorting Station</p>
                </div>
              </Popup>
            </LeafletMarker>
          </MapContainer>
        </div>
      </div>

      {/* Driver Card + Doorstep OTP Bar */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Driver Profile (8 cols) */}
        <div className="md:col-span-8 flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/95 border-2 border-slate-300 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-[#10b981] shadow-xs">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" 
                  alt="Palani Driver" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-black text-slate-900">{driverName}</h4>
                <div className="flex items-center text-amber-500 text-xs font-black">
                  <FaStar className="mr-0.5 text-[10px]" /> 4.9
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {vehicleNumber} • <span className="text-[#059669] font-bold">{vehicleType}</span>
              </p>
            </div>
          </div>

          {/* Quick Call & Chat Buttons */}
          <div className="flex items-center space-x-2.5">
            <a 
              href={`tel:${driverPhone}`}
              className="h-9 w-9 rounded-full bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Call Driver"
            >
              <FaPhoneAlt className="h-3.5 w-3.5 text-slate-800" />
            </a>

            <button 
              onClick={() => onOpenChat ? onOpenChat() : alert(`Starting Live In-App Chat with Driver: ${driverName}`)}
              className="h-9 w-9 rounded-full bg-[#ecfdf5] hover:bg-[#d1fae5] text-[#059669] border-2 border-[#a7f3d0] transition flex items-center justify-center cursor-pointer shadow-xs"
              title="Chat with Driver"
            >
              <FaComments className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Security Doorstep OTP Box (4 cols) */}
        <div className="md:col-span-4 p-3.5 sm:p-4 rounded-2xl bg-[#ecfdf5] border-2 border-[#10b981]/50 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 block">
              DOORSTEP PICKUP OTP
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Share upon driver arrival
            </span>
          </div>

          <div>
            <span className="font-mono text-2xl font-black tracking-wider text-[#065f46]">
              {otpCode}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveUberPickupTracker;
