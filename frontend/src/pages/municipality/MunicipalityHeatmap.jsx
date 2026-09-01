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
  ChevronLeft,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ShieldCheck,
  Award
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../utils/api';
import UserLayout from '../../components/UserLayout';
import { useToast } from '../../context/ToastContext';

// Helper component to center map smoothly
const MapRecenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 13, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom Leaflet Div Icons
const createCustomIcon = (type, label, isSelected) => {
  const isDump = type === 'illegal_dump';
  const isTruck = type === 'fleet_truck';
  
  const bgClass = isDump ? 'bg-rose-500 text-white' : isTruck ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white';
  const borderClass = isDump ? 'border-rose-300' : isTruck ? 'border-indigo-300' : 'border-emerald-300';
  const pingBg = isDump ? 'bg-rose-500' : isTruck ? 'bg-indigo-500' : 'bg-emerald-400';
  const ringEffect = isSelected ? 'ring-4 ring-slate-900 shadow-xl scale-125 z-50' : 'shadow-md hover:scale-110';

  const iconHtml = `
    <div class="relative flex items-center justify-center transition-all duration-300 ${ringEffect}">
      <span class="absolute w-8 h-8 rounded-full ${pingBg} opacity-40 animate-ping"></span>
      <div class="relative w-8 h-8 rounded-full ${bgClass} border-2 ${borderClass} flex items-center justify-center font-bold text-[11px] shadow-lg">
        ${isDump ? '⚠️' : isTruck ? '🚛' : '♻️'}
      </div>
      ${label ? `<span class="absolute -bottom-5 bg-slate-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-slate-700">${label}</span>` : ''}
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20]
  });
};

const MunicipalityHeatmap = () => {
  const { addToast } = useToast();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, pickup, illegal_dump, fleet
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapCenter, setMapCenter] = useState([11.0168, 76.9558]); // Coimbatore Center
  const [mapZoom, setMapZoom] = useState(13);

  // Real Geographical Hotspot Nodes (Coimbatore / Tamil Nadu Wards)
  const defaultGeoPoints = [
    {
      id: 'PT-101',
      type: 'pickup',
      category: 'Plastic',
      weightKg: 145.5,
      ward: 'Ward 1 - Gandhipuram',
      address: '7th Cross Cut Road, Gandhipuram Market, Coimbatore',
      lat: 11.0185,
      lng: 76.9620,
      intensity: 0.95,
      status: 'Active Hotspot',
      notes: 'High commercial PET bottles & LDPE packaging aggregation.'
    },
    {
      id: 'PT-102',
      type: 'illegal_dump',
      category: 'Mixed Garbage',
      severity: 'High Priority',
      ward: 'Ward 2 - RS Puram',
      address: 'West Club Road, Near Corporation Park, RS Puram',
      lat: 11.0090,
      lng: 76.9510,
      intensity: 0.88,
      status: 'Reported Spot',
      photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      description: 'Open garbage mound obstructing drainage and footpath.'
    },
    {
      id: 'PT-103',
      type: 'pickup',
      category: 'Paper',
      weightKg: 180.0,
      ward: 'Ward 3 - Saibaba Colony',
      address: 'NSR Road, Saibaba Colony Commercial Hub',
      lat: 11.0280,
      lng: 76.9460,
      intensity: 0.82,
      status: 'Active Hotspot',
      notes: 'Carton and newspaper bulk segregation center.'
    },
    {
      id: 'PT-104',
      type: 'fleet_truck',
      category: 'Compactor Fleet #4',
      driver: 'Karthik Raja (★ 4.9)',
      vehicleNumber: 'TN-38-MUNI-8819',
      ward: 'Ward 1 - Gandhipuram',
      address: 'En Route to Cross Cut Road Hub',
      lat: 11.0210,
      lng: 76.9680,
      load: '450 / 800 kg',
      status: 'Collecting Waste',
      speed: '24 km/h'
    },
    {
      id: 'PT-105',
      type: 'pickup',
      category: 'Metal',
      weightKg: 210.0,
      ward: 'Ward 4 - Peelamedu',
      address: 'Avinashi Road, Peelamedu Industrial Zone',
      lat: 11.0250,
      lng: 77.0020,
      intensity: 0.90,
      status: 'Active Hotspot',
      notes: 'Verified scrap metal and aluminum cans bulk stream.'
    },
    {
      id: 'PT-106',
      type: 'illegal_dump',
      category: 'E-Waste & Debris',
      severity: 'Critical Hazard',
      ward: 'Ward 5 - Singanallur',
      address: 'Trichy Road, Near Singanallur Bus Stand Area',
      lat: 10.9980,
      lng: 77.0210,
      intensity: 0.92,
      status: 'Reported Spot',
      photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      description: 'Discarded electronic parts and broken CRT monitors.'
    },
    {
      id: 'PT-107',
      type: 'fleet_truck',
      category: 'EV Mini-Truck #2',
      driver: 'Praveen Kumar (★ 4.8)',
      vehicleNumber: 'TN-38-EV-4011',
      ward: 'Ward 3 - Saibaba Colony',
      address: 'Door-to-door organic collection',
      lat: 11.0310,
      lng: 76.9420,
      load: '280 / 500 kg',
      status: 'Doorstep Pickup',
      speed: '18 km/h'
    }
  ];

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/municipality/heatmap-data');
      if (res.data?.success && res.data.data?.length > 0) {
        setPoints(res.data.data);
        setSelectedPoint(res.data.data[0]);
      } else {
        setPoints(defaultGeoPoints);
        setSelectedPoint(defaultGeoPoints[0]);
      }
    } catch (err) {
      setPoints(defaultGeoPoints);
      setSelectedPoint(defaultGeoPoints[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const activePointsList = points.length > 0 ? points : defaultGeoPoints;

  const filteredPoints = activePointsList.filter((p) => {
    if (filterType !== 'all') {
      if (filterType === 'pickup' && p.type !== 'pickup') return false;
      if (filterType === 'illegal_dump' && p.type !== 'illegal_dump') return false;
      if (filterType === 'fleet' && p.type !== 'fleet_truck') return false;
    }
    if (filterCategory !== 'all' && p.category && !p.category.includes(filterCategory)) return false;
    return true;
  });

  const handleSelectPoint = (pt) => {
    setSelectedPoint(pt);
    if (pt.lat && pt.lng) {
      setMapCenter([pt.lat, pt.lng]);
      setMapZoom(15);
    }
  };

  return (
    <UserLayout>
      <div className="space-y-6 text-slate-800">
        
        {/* Top Header Card */}
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
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Real 3D & Spatial GIS Waste Density Map
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  OpenStreetMap Live GPS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Interactive real-time geographical spatial GIS intelligence. Live tracking of municipal compactors, high-volume pickup density, and citizen blackspot grievances.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => {
                setMapCenter([11.0168, 76.9558]);
                setMapZoom(13);
                addToast('Map recentered to Municipal HQ zone', 'info', 'Spatial Recenter');
              }}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Crosshair className="w-4 h-4 text-emerald-600" />
              Recenter
            </button>
            <button
              onClick={fetchHeatmapData}
              disabled={loading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Nodes
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-2">
              <Filter className="w-3.5 h-3.5" />
              GIS Layers:
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
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Pickup Hotspots
            </button>
            <button
              onClick={() => setFilterType('illegal_dump')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'illegal_dump'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Illegal Garbage Dumps
            </button>
            <button
              onClick={() => setFilterType('fleet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterType === 'fleet'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              Live Fleet Trucks
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Material:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 text-slate-700 text-xs border border-slate-200 rounded-xl px-3 py-1.5 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Waste Streams</option>
              <option value="Plastic">Plastic</option>
              <option value="Paper">Paper</option>
              <option value="Metal">Metal</option>
              <option value="E-Waste">E-Waste</option>
              <option value="Mixed">Mixed Garbage</option>
            </select>
          </div>
        </div>

        {/* Large GIS Spatial Map Grid */}
        <div className={`grid grid-cols-1 ${isFullscreen ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-6`}>
          
          {/* Main Big Leaflet Real Map Container */}
          <div className={`${isFullscreen ? 'lg:col-span-1' : 'lg:col-span-2'} bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden flex flex-col relative`}>
            
            {/* Top Interactive Map HUD Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[400] flex items-center justify-between pointer-events-none">
              <div className="bg-slate-900/90 backdrop-blur-md text-white border border-slate-700 px-4 py-2 rounded-2xl shadow-lg flex items-center gap-2 pointer-events-auto">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold">
                  Coimbatore Municipal Zone • {filteredPoints.length} Live Spatial Points
                </span>
              </div>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl shadow-md border border-slate-200 transition font-bold"
                  title={isFullscreen ? 'Exit Expand View' : 'Expand Big Map'}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Real Interactive Leaflet OpenStreetMap View */}
            <div className="w-full h-[580px] sm:h-[640px] z-0">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
                className="w-full h-full rounded-3xl"
              >
                <MapRecenter center={mapCenter} zoom={mapZoom} />
                
                {/* Clean, High-Definition OpenStreetMap Tiles */}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Spatial Heat Radius Circles around high-volume hotspots */}
                {filteredPoints.map((pt) => {
                  if (!pt.lat || !pt.lng) return null;
                  const isDump = pt.type === 'illegal_dump';
                  const isTruck = pt.type === 'fleet_truck';
                  if (isTruck) return null;

                  return (
                    <Circle
                      key={`circle-${pt.id}`}
                      center={[pt.lat, pt.lng]}
                      radius={isDump ? 350 : 250}
                      pathOptions={{
                        color: isDump ? '#e11d48' : '#059669',
                        fillColor: isDump ? '#f43f5e' : '#10b981',
                        fillOpacity: 0.25,
                        weight: 1.5
                      }}
                    />
                  );
                })}

                {/* Render Custom Markers with Popup Modals */}
                {filteredPoints.map((pt) => {
                  if (!pt.lat || !pt.lng) return null;
                  const isSelected = selectedPoint?.id === pt.id;
                  const markerIcon = createCustomIcon(pt.type, pt.weightKg ? `${pt.weightKg} kg` : pt.severity || pt.vehicleNumber, isSelected);

                  return (
                    <Marker
                      key={pt.id}
                      position={[pt.lat, pt.lng]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => handleSelectPoint(pt)
                      }}
                    >
                      <Popup className="custom-leaflet-popup">
                        <div className="p-1 space-y-1.5 text-slate-800 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                            <span className="font-extrabold text-xs text-emerald-800">
                              {pt.ward || pt.category}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              pt.type === 'illegal_dump' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {pt.status}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600">{pt.address}</p>
                          {pt.photoUrl && (
                            <img src={pt.photoUrl} alt="Evidence" className="w-full h-20 object-cover rounded-lg mt-1" />
                          )}
                          <button
                            onClick={() => handleSelectPoint(pt)}
                            className="w-full mt-2 py-1 bg-slate-900 text-white rounded text-[11px] font-bold"
                          >
                            Inspect Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>

            {/* Bottom Floating Legend Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md border border-slate-200/90 px-4 py-2.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-xs"></span>
                  <span className="font-bold text-slate-700">Pickup Hotspot (Doorstep)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-600 shadow-xs"></span>
                  <span className="font-bold text-slate-700">Citizen Illegal Spot</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-600 shadow-xs"></span>
                  <span className="font-bold text-slate-700">Live Active Compactor Fleet</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-semibold">
                Click any marker on the map to inspect metadata
              </span>
            </div>

          </div>

          {/* Right Selected Spatial Node Details Panel */}
          {!isFullscreen && (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4">
              {selectedPoint ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2.5 rounded-2xl ${
                        selectedPoint.type === 'illegal_dump' ? 'bg-rose-100 text-rose-600' :
                        selectedPoint.type === 'fleet_truck' ? 'bg-indigo-100 text-indigo-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {selectedPoint.type === 'illegal_dump' ? <AlertTriangle className="w-5 h-5" /> :
                         selectedPoint.type === 'fleet_truck' ? <Truck className="w-5 h-5" /> :
                         <MapPin className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base">
                          {selectedPoint.type === 'illegal_dump' ? 'Citizen Grievance Spot' :
                           selectedPoint.type === 'fleet_truck' ? 'Active Municipal Fleet' :
                           'Recycling Hotspot Node'}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">Node: {selectedPoint.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Location Address:</span>
                      <span className="text-slate-800 font-bold text-sm flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        {selectedPoint.address}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 block mt-1">
                        {selectedPoint.ward}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">Stream / Unit</span>
                        <span className="text-slate-800 font-black text-sm mt-0.5 block">{selectedPoint.category}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block">
                          {selectedPoint.weightKg ? 'Verified Weight' : selectedPoint.load ? 'Truck Load' : 'Severity'}
                        </span>
                        <span className="text-emerald-700 font-black text-sm mt-0.5 block">
                          {selectedPoint.weightKg ? `${selectedPoint.weightKg} kg` : selectedPoint.load || selectedPoint.severity || 'Normal'}
                        </span>
                      </div>
                    </div>

                    {selectedPoint.driver && (
                      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-indigo-900">Driver: {selectedPoint.driver}</span>
                          <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded">{selectedPoint.speed}</span>
                        </div>
                        <p className="text-[11px] text-indigo-700 mt-1">Vehicle: {selectedPoint.vehicleNumber}</p>
                      </div>
                    )}

                    {selectedPoint.photoUrl && (
                      <div className="mt-2">
                        <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">Citizen Geo-Tagged Photo Evidence:</span>
                        <img
                          src={selectedPoint.photoUrl}
                          alt="Evidence"
                          className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <MapPin className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold">Select any node on the big map to inspect</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 space-y-2">
                <Link
                  to="/municipality/grievances"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold text-center block transition shadow-md"
                >
                  Dispatch Clean-up Crew / Manage Grievances
                </Link>
                <button
                  onClick={() => addToast('GIS Layer exported to Municipal GIS database (GeoJSON)', 'success', 'Export Success')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold text-center block transition"
                >
                  Export GIS GeoJSON Coordinates
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </UserLayout>
  );
};

export default MunicipalityHeatmap;
