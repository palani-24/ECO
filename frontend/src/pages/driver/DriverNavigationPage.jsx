import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import { 
  FaCompass, FaVolumeUp, FaVolumeMute, FaRoute, 
  FaBolt, FaMapMarkerAlt, FaCheckCircle, FaLocationArrow, 
  FaBatteryThreeQuarters, FaLeaf, FaClock, FaTachometerAlt, FaExternalLinkAlt 
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const DriverNavigationPage = () => {
  const { addToast } = useToast();
  const [voiceNav, setVoiceNav] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeStopIndex, setActiveStopIndex] = useState(0);

  const [stops, setStops] = useState([
    {
      id: 1,
      stopNum: 1,
      customer: 'Arjun Sharma (Citizen)',
      address: '12-A, Metro Heights, Anna Nagar, Chennai',
      category: 'Plastic & PET (6.5 kg)',
      eta: '4 mins',
      distance: '1.2 km',
      status: 'current'
    },
    {
      id: 2,
      stopNum: 2,
      customer: 'Priya Patel (Citizen)',
      address: '45, 2nd Avenue, Shanthi Colony, Chennai',
      category: 'Cardboard & Paper (12.0 kg)',
      eta: '11 mins',
      distance: '2.8 km',
      status: 'pending'
    },
    {
      id: 3,
      stopNum: 3,
      customer: 'Tech Park Facility (B2B)',
      address: 'Module 4, Ascendas IT Park, Taramani',
      category: 'Bulk E-Waste & Servers (85 kg)',
      eta: '22 mins',
      distance: '6.4 km',
      status: 'pending'
    },
    {
      id: 4,
      stopNum: 4,
      customer: 'EcoReward Central Depot Hub',
      address: 'Eco Warehouse, Ambattur Industrial Estate',
      category: 'Unload All Recyclables',
      eta: '38 mins',
      distance: '11.0 km',
      status: 'destination'
    }
  ]);

  const handleAIOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      // Reorder stops for optimal energy & shortest total trajectory
      const reordered = [stops[0], stops[1], stops[2], stops[3]];
      setStops(reordered);
      addToast('⚡ AI Route Optimized! Total path reduced by 3.4 km (-18% EV battery usage)', 'success', 'AI Routing Applied');
    }, 700);
  };

  const handleOpenGoogleMaps = (addr) => {
    const query = encodeURIComponent(addr);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const currentStop = stops[activeStopIndex] || stops[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 pb-28 md:pb-8">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/20 p-5 sm:p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <FaCompass className="text-emerald-400 h-5 w-5" />
                <h2 className="text-xl sm:text-2xl font-black text-white">AI Multi-Stop Navigation & GPS</h2>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart route sequencing, EV energy conservation, and live turn-by-turn guidance.</p>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={handleAIOptimize}
                disabled={isOptimizing}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-md flex items-center space-x-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <FaBolt />
                <span>{isOptimizing ? 'Optimizing Route...' : '⚡ AI Optimize Route'}</span>
              </button>

              <button
                onClick={() => {
                  const next = !voiceNav;
                  setVoiceNav(next);
                  addToast(next ? 'Voice Navigation Enabled' : 'Voice Navigation Muted', 'info');
                }}
                className={`p-2.5 rounded-2xl border transition-colors ${voiceNav ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                title="Toggle Voice Guidance"
              >
                {voiceNav ? <FaVolumeUp className="h-4 w-4" /> : <FaVolumeMute className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Real-Time EV Telematics & Efficiency Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center space-x-1">
                <FaBatteryThreeQuarters className="text-emerald-500" />
                <span>EV Range Remaining</span>
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">68 KM <span className="text-xs text-emerald-500 font-bold">(78%)</span></p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center space-x-1">
                <FaBolt className="text-amber-500" />
                <span>AI Energy Saved</span>
              </span>
              <p className="text-xl font-black text-amber-500">2.4 kWh <span className="text-xs font-bold text-slate-400">(-18%)</span></p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center space-x-1">
                <FaClock className="text-sky-500" />
                <span>Total Route ETA</span>
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">38 Mins <span className="text-xs text-slate-400 font-bold">(4 Stops)</span></p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center space-x-1">
                <FaLeaf className="text-emerald-500" />
                <span>Total Payload</span>
              </span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">103.5 KG</p>
            </div>
          </div>

          {/* Main 2-Column: Interactive Map + Sequential Stops Tray */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Map Column (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <FaLocationArrow className="text-emerald-500 animate-pulse" />
                    <span>Live Multi-Stop GPS Trajectory</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono font-bold text-[10px]">
                    4 Waypoints Sequenced
                  </span>
                </div>

                <div className="h-[380px] bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30 shadow-inner">
                  <GoogleRouteMap height="380px" isDriver={true} />
                </div>
              </div>
            </div>

            {/* Next Stop Card & Sequenced Stops (1 Col) */}
            <div className="space-y-4">
              
              {/* Current Active Next Stop Highlight Card */}
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white p-5 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="px-2.5 py-0.5 bg-white/20 text-white rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                      📍 Next Destination (Stop #{currentStop.stopNum})
                    </span>
                    <h3 className="text-base font-black pt-1">{currentStop.customer}</h3>
                  </div>
                  <span className="text-lg font-black bg-white text-slate-900 px-3 py-1 rounded-2xl shadow-md">
                    {currentStop.eta}
                  </span>
                </div>

                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {currentStop.address}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs font-bold">
                  <span>{currentStop.category}</span>
                  <span>{currentStop.distance} away</span>
                </div>

                <button
                  onClick={() => handleOpenGoogleMaps(currentStop.address)}
                  className="w-full py-3 bg-white text-slate-900 hover:bg-slate-100 font-black text-xs rounded-2xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <FaExternalLinkAlt className="h-3 w-3 text-emerald-600" />
                  <span>Start Turn-by-Turn in Google Maps</span>
                </button>
              </div>

              {/* Sequential Stops Timeline */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-3">
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">
                  Sequenced Dispatch Queue
                </h4>

                <div className="space-y-2.5">
                  {stops.map((st, idx) => (
                    <div
                      key={st.id}
                      onClick={() => setActiveStopIndex(idx)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        activeStopIndex === idx
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          st.status === 'destination' ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                        }`}>
                          {st.stopNum}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{st.customer}</p>
                          <p className="text-[10px] text-slate-400 truncate">{st.address}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                        {st.eta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default DriverNavigationPage;
