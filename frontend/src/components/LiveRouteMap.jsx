import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkerAlt, FaLocationArrow, FaRoute, FaCheckCircle, FaClock } from 'react-icons/fa';

const LiveRouteMap = ({ driverName = 'Ramesh Kumar', vehicleNumber = 'TN-01-AX-9945', pickups = [] }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [vehiclePos, setVehiclePos] = useState({ lat: 13.0827, lng: 80.2707 }); // Chennai default coords
  const [simulating, setSimulating] = useState(true);

  // Waypoints list representing TSP optimized route
  const waypoints = pickups.length > 0 ? pickups.map((p, idx) => ({
    id: p._id || idx,
    name: p.user?.name || `Customer #${idx + 1}`,
    address: p.pickupAddress?.street || '12-A Metro Heights, Anna Nagar',
    city: p.pickupAddress?.city || 'Chennai',
    category: p.wasteCategory || 'Plastic',
    weight: p.estimatedWeight || 5,
    status: p.status || 'assigned',
    coords: { x: 20 + (idx * 25) % 65, y: 30 + (idx * 30) % 55 }
  })) : [
    { id: 1, name: 'Arjun Sharma', address: '12-A Metro Heights, Anna Nagar', category: 'Plastic', weight: 15, coords: { x: 25, y: 35 } },
    { id: 2, name: 'Priya Patel', address: '45 Green Park, Adyar', category: 'Metal', weight: 8, coords: { x: 55, y: 65 } },
    { id: 3, name: 'Karthik Raja', address: '78 Lake View, Velachery', category: 'E-Waste', weight: 4, coords: { x: 80, y: 40 } }
  ];

  useEffect(() => {
    if (!simulating) return;
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % waypoints.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [simulating, waypoints.length]);

  const currentDestination = waypoints[activeStep] || waypoints[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <FaRoute className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Live Route & TSP Optimization</h3>
            <p className="text-xs text-slate-400">Driver {driverName} ({vehicleNumber}) - Optimized Collection Sequence</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>GPS Tracking Active</span>
          </span>
        </div>
      </div>

      {/* Map Canvas Frame */}
      <div className="relative w-full h-72 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
        {/* OpenStreetMap Tile Layer Simulation Background */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Simulated Road Grid network */}
          <line x1="0" y1="35" x2="100" y2="35" stroke="#475569" strokeWidth="3" opacity="0.4" />
          <line x1="0" y1="65" x2="100" y2="65" stroke="#475569" strokeWidth="3" opacity="0.4" />
          <line x1="25" y1="0" x2="25" y2="100" stroke="#475569" strokeWidth="3" opacity="0.4" />
          <line x1="55" y1="0" x2="55" y2="100" stroke="#475569" strokeWidth="3" opacity="0.4" />
          <line x1="80" y1="0" x2="80" y2="100" stroke="#475569" strokeWidth="3" opacity="0.4" />

          {/* Optimized Route Polyline */}
          <path
            d={`M 10 20 ${waypoints.map(w => `L ${w.coords.x} ${w.coords.y}`).join(' ')}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="5,5"
            className="animate-pulse"
          />

          {/* Waypoint Customer Markers */}
          {waypoints.map((w, idx) => {
            const isTarget = idx === activeStep;
            return (
              <g key={w.id}>
                <circle
                  cx={w.coords.x}
                  cy={w.coords.y}
                  r={isTarget ? 5 : 3.5}
                  fill={isTarget ? '#10b981' : '#64748b'}
                  className={isTarget ? 'animate-ping opacity-75' : ''}
                />
                <circle
                  cx={w.coords.x}
                  cy={w.coords.y}
                  r={isTarget ? 3.5 : 2.5}
                  fill={isTarget ? '#10b981' : '#94a3b8'}
                />
              </g>
            );
          })}
        </svg>

        {/* Live Moving Driver Vehicle Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out z-10"
          style={{
            left: `${currentDestination.coords.x}%`,
            top: `${currentDestination.coords.y}%`
          }}
        >
          <div className="relative">
            <div className="absolute -inset-3 bg-emerald-500/30 rounded-full blur animate-ping"></div>
            <div className="relative h-9 w-9 bg-emerald-500 text-slate-950 rounded-full flex items-center justify-center shadow-2xl border-2 border-white">
              <FaTruck className="h-4 w-4" />
            </div>
            <span className="absolute left-11 top-1/2 -translate-y-1/2 bg-slate-900/90 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-md whitespace-nowrap shadow-lg">
              Next Stop: {currentDestination.name}
            </span>
          </div>
        </div>
      </div>

      {/* TSP Route Waypoints List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Optimized Pickup Sequence (TSP):</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {waypoints.map((w, idx) => {
            const isTarget = idx === activeStep;
            return (
              <div
                key={w.id}
                className={`p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                  isTarget
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs flex items-center space-x-1.5">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] ${isTarget ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {idx + 1}
                    </span>
                    <span>{w.name}</span>
                  </span>
                  {isTarget && <span className="text-[9px] uppercase font-black bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded">En Route</span>}
                </div>
                <p className="text-[11px] truncate text-slate-300">{w.address}</p>
                <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/60">
                  <span>{w.category} ({w.weight}kg)</span>
                  <span className="flex items-center space-x-1"><FaClock className="h-3 w-3 text-emerald-400" /> <span>ETA: ~{5 * (idx + 1)} mins</span></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveRouteMap;
