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
  Navigation,
  ChevronLeft
} from 'lucide-react';
import api from '../../utils/api';
import UserLayout from '../../components/UserLayout';

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

  const defaultPoints = [
    { id: 'PT-1', type: 'pickup', category: 'Plastic', weightKg: 86.5, address: 'Gandhipuram 7th Cross, Coimbatore', intensity: 0.9 },
    { id: 'PT-2', type: 'illegal_dump', category: 'Mixed Garbage', severity: 'High', address: 'Cross Cut Road Market Corner', intensity: 0.85, photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80' },
    { id: 'PT-3', type: 'pickup', category: 'Paper', weightKg: 64.0, address: 'DB Road, RS Puram, Coimbatore', intensity: 0.75 },
    { id: 'PT-4', type: 'pickup', category: 'Metal', weightKg: 110.0, address: 'Peelamedu Industrial Estate', intensity: 0.95 },
    { id: 'PT-5', type: 'illegal_dump', category: 'E-Waste', severity: 'Critical Hazard', address: 'West Club Road, RS Puram', intensity: 0.9, photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80' }
  ];

  const activePointsList = points.length > 0 ? points : defaultPoints;

  const filteredPoints = activePointsList.filter((p) => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    return true;
  });

  return (
    <UserLayout>
      <div className="space-y-6 text-slate-800">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Link
              to="/municipality/dashboard"
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
              title="Back to Command Center"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800">
                  GIS Waste Density & Hotspot Heatmap
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-sky-100 text-sky-800 rounded-full">
                  Spatial Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time spatial visualization of waste generation rates, doorstep pickups, and illegal garbage spots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={fetchHeatmapData}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" />
              Layer Filter:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Layers ({activePointsList.length})
            </button>
            <button
              onClick={() => setFilterType('pickup')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'pickup'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Pickup Hotspots
            </button>
            <button
              onClick={() => setFilterType('illegal_dump')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'illegal_dump'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Illegal Garbage Spots
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Waste Material:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
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
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 min-h-[500px] relative overflow-hidden flex flex-col justify-between shadow-sm">
            {/* Map Top Badge */}
            <div className="relative z-10 flex items-center justify-between bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200">
                  Coimbatore Spatial Zone • 11.0168° N, 76.9558° E
                </span>
              </div>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                {filteredPoints.length} Active Nodes
              </span>
            </div>

            {/* Simulated Interactive Coordinate Points Layout */}
            <div className="relative z-10 my-8 min-h-[340px] flex items-center justify-center">
              <div className="w-full h-full max-w-lg max-h-[340px] relative border border-dashed border-slate-800 rounded-3xl bg-slate-950/50 p-4">
                {/* Center Municipality Reference Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="p-2.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-2xl shadow-lg animate-pulse">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-1 bg-slate-950/90 px-2 py-0.5 rounded-md border border-emerald-500/30">
                    City Municipal HQ
                  </span>
                </div>

                {/* Render Filtered Geo Points */}
                {filteredPoints.map((pt, idx) => {
                  const angle = (idx * 58) % 360;
                  const dist = 34 + ((idx % 5) * 12);
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
                        isSelected ? 'scale-125 ring-4 ring-white rounded-full' : ''
                      }`}
                      title={pt.address}
                    >
                      <div className="relative flex items-center justify-center">
                        <div
                          className={`absolute w-8 h-8 rounded-full opacity-40 group-hover:opacity-80 transition animate-ping ${
                            isDump ? 'bg-rose-500' : 'bg-cyan-500'
                          }`}
                        />
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg text-[11px] font-bold ${
                            isDump
                              ? 'bg-rose-600 text-white border-2 border-rose-300'
                              : 'bg-cyan-600 text-white border-2 border-cyan-200'
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
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-300 font-medium">Pickup Hotspot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="text-slate-300 font-medium">Illegal Garbage Spot</span>
                </div>
              </div>
              <div className="text-slate-400 font-medium text-[11px]">
                Click node to inspect metadata
              </div>
            </div>
          </div>

          {/* Right Selected Node Details Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
            {selectedPoint ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    {selectedPoint.type === 'illegal_dump' ? (
                      <span className="p-2.5 bg-rose-100 text-rose-600 rounded-2xl">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2.5 bg-sky-100 text-sky-600 rounded-2xl">
                        <Truck className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-base">
                        {selectedPoint.type === 'illegal_dump' ? 'Citizen Grievance Node' : 'Recycling Collection Hotspot'}
                      </h4>
                      <p className="text-xs text-slate-400">Node ID: {selectedPoint.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Location Address:</span>
                    <span className="text-slate-700 font-medium text-sm flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      {selectedPoint.address}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">Material</span>
                      <span className="text-slate-800 font-extrabold text-sm mt-0.5 block">{selectedPoint.category}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block">
                        {selectedPoint.weightKg ? 'Verified Weight' : 'Severity'}
                      </span>
                      <span className="text-emerald-700 font-extrabold text-sm mt-0.5 block">
                        {selectedPoint.weightKg ? `${selectedPoint.weightKg} kg` : selectedPoint.severity || 'Medium'}
                      </span>
                    </div>
                  </div>

                  {selectedPoint.photoUrl && (
                    <div className="mt-2">
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Citizen Photo:</span>
                      <img
                        src={selectedPoint.photoUrl}
                        alt="Spot Evidence"
                        className="w-full h-32 object-cover rounded-2xl border border-slate-100 shadow-xs"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">Select a map point to inspect details</p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100">
              <Link
                to="/municipality/grievances"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold text-center block transition shadow-md"
              >
                Dispatch Clean-up Crew / Manage Grievance
              </Link>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default MunicipalityHeatmap;
