import React, { useState, useEffect } from 'react';
import { FaRoute, FaClock } from 'react-icons/fa';
import GoogleRouteMap from './GoogleRouteMap';

const LiveRouteMap = ({ driverName = 'Ramesh Kumar', vehicleNumber = 'TN-01-AX-9945', pickups = [] }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Waypoints list representing TSP optimized route
  const waypoints = pickups.length > 0 ? pickups.map((p, idx) => ({
    id: p._id || idx,
    name: p.user?.name || `Customer #${idx + 1}`,
    address: p.pickupAddress?.street || '12-A Metro Heights, Anna Nagar',
    city: p.pickupAddress?.city || 'Chennai',
    category: p.wasteCategory || 'Plastic',
    weight: p.estimatedWeight || 5,
    status: p.status || 'assigned',
    pickupAddress: p.pickupAddress
  })) : [
    { id: 1, name: 'Arjun Sharma', address: '12-A Metro Heights, Anna Nagar', category: 'Plastic', weight: 15 },
    { id: 2, name: 'Priya Patel', address: '45 Green Park, Adyar', category: 'Metal', weight: 8 },
    { id: 3, name: 'Karthik Raja', address: '78 Lake View, Velachery', category: 'E-Waste', weight: 4 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <FaRoute className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">Live Google Maps Route & TSP Optimization</h3>
            <p className="text-xs text-slate-400">Driver {driverName} ({vehicleNumber}) - Optimized Collection Sequence</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real Google GPS Active</span>
          </span>
        </div>
      </div>

      {/* Real Google Maps Container */}
      <GoogleRouteMap
        driverName={driverName}
        vehicleNumber={vehicleNumber}
        pickups={pickups}
        height="320px"
      />

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
