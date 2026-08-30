import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Flame, 
  Layers, 
  Filter, 
  AlertTriangle, 
  Truck, 
  Building2, 
  RefreshCw, 
  Eye, 
  Compass,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import api from '../../utils/api';

const MunicipalityHeatmap = () => {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, pickup, illegal_dump
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState(null);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/municipality/heatmap-data');
      if (res.data?.success) {
        setPoints(res.data.data);
        if (res.data.data?.length > 0) {
          setSelectedPoint(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Heatmap fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const filteredPoints = points.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">GIS Waste Density & Hotspot Heatmap</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                  Spatial Intelligence
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Real-time spatial visualization of waste generation rates, doorstep pickups, and illegal garbage spots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/municipality/dashboard"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
            >
              Back to Overview
            </Link>
            <button
              onClick={fetchHeatmapData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Map
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Layer Filter:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers ({points.length})
            </button>
            <button
              onClick={() => setFilterType('pickup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterType === 'pickup'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Truck className="w-3 h-3" />
              Pickup Hotspots
            </button>
            <button
              onClick={() => setFilterType('illegal_dump')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                filterType === 'illegal_dump'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-900/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Illegal Garbage Dumps
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Waste Material:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Categories</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Metal">Metal</option>
              <option value="E-Waste">E-Waste</option>
              <option value="Organic">Organic</option>
            </select>
          </div>
        </div>

        {/* Spatial Map & Sidebar Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Map Visualization Container */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 min-h-[520px] relative overflow-hidden flex flex-col justify-between">
            {/* Map Background Grid Simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
            
            {/* Map Top Badge */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">
                  Coimbatore Spatial Zone &bull; 11.0168° N, 76.9558° E
                </span>
              </div>
              <span className="text-xs text-cyan-400 font-mono">
                {filteredPoints.length} Active Spatial Nodes
              </span>
            </div>

            {/* Simulated Interactive Coordinate Points Layout */}
            <div className="relative z-10 my-8 min-h-[360px] flex items-center justify-center">
              <div className="w-full h-full max-w-lg max-h-[360px] relative border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/40 p-4">
                {/* Center Municipality Reference Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="p-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-full shadow-lg shadow-emerald-500/20 animate-pulse">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-slate-950/90 px-2 py-0.5 rounded border border-emerald-500/30">
                    City Municipal HQ
                  </span>
                </div>

                {/* Render Filtered Geo Points */}
                {filteredPoints.map((pt, idx) => {
                  const angle = (idx * 52) % 360;
                  const dist = 32 + ((idx % 6) * 11);
                  const top = 50 + Math.sin((angle * Math.PI) / 180) * (dist * 0.75);
                  const left = 50 + Math.cos((angle * Math.PI) / 180) * dist;

                  const isSelected = selectedPoint?.id === pt.id;
                  const isDump = pt.type === 'illegal_dump';

                  return (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedPoint(pt)}
                      style={{ top: `${top}%`, left: `${left}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 transform hover:scale-125 z-20 ${
                        isSelected ? 'scale-125 ring-2 ring-white rounded-full' : ''
                      }`}
                      title={pt.address}
                    >
                      <div className="relative flex items-center justify-center">
                        {/* Heat glow ring */}
                        <div
                          className={`absolute w-8 h-8 rounded-full opacity-40 group-hover:opacity-75 transition animate-ping ${
                            isDump ? 'bg-rose-500' : 'bg-cyan-500'
                          }`}
                        />
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg text-[10px] font-bold ${
                            isDump
                              ? 'bg-rose-600 text-white border-2 border-rose-400'
                              : 'bg-cyan-600 text-white border-2 border-cyan-300'
                          }`}
                        >
                          {isDump ? '!' : (pt.weightKg ? Math.round(pt.weightKg) : '•')}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Map Legend */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-xl text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-300">High Collection Hotspot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-300">Illegal Garbage Dump Spot</span>
                </div>
              </div>
              <div className="text-slate-500 font-mono text-[11px]">
                Click any node to view spatial metadata
              </div>
            </div>
          </div>

          {/* Right Selected Node Details Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
            {selectedPoint ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    {selectedPoint.type === 'illegal_dump' ? (
                      <span className="p-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-xl">
                        <Truck className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {selectedPoint.type === 'illegal_dump' ? 'Citizen Grievance Node' : 'Recycling Collection Hotspot'}
                      </h4>
                      <p className="text-xs text-slate-400">Node ID: {selectedPoint.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Location Address:</span>
                    <span className="text-slate-200 font-medium text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      {selectedPoint.address}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">Waste Stream</span>
                      <span className="text-white font-bold text-sm">{selectedPoint.category}</span>
                    </div>
                    <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <span className="text-slate-400 block text-[11px]">
                        {selectedPoint.weightKg ? 'Verified Weight' : 'Severity'}
                      </span>
                      <span className="text-cyan-400 font-bold text-sm">
                        {selectedPoint.weightKg ? `${selectedPoint.weightKg} kg` : selectedPoint.severity || 'Medium'}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-400 text-[11px]">Intensity Level</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {Math.round((selectedPoint.intensity || 0.7) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        style={{ width: `${(selectedPoint.intensity || 0.7) * 100}%` }}
                      />
                    </div>
                  </div>

                  {selectedPoint.photoUrl && (
                    <div className="mt-2">
                      <span className="text-slate-400 block text-[11px] mb-1">Citizen Geo-Tagged Photo:</span>
                      <img
                        src={selectedPoint.photoUrl}
                        alt="Spot Evidence"
                        className="w-full h-32 object-cover rounded-xl border border-slate-800"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <MapPin className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                <p className="text-sm">Select a map point to inspect details</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800">
              <Link
                to="/municipality/grievances"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center block transition shadow-lg shadow-emerald-900/30"
              >
                Dispatch Clean-up Crew / Manage Grievance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalityHeatmap;
