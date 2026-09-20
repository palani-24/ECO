import React, { useState } from 'react';
import DriverLayout from '../../components/DriverLayout';
import { useToast } from '../../context/ToastContext';
import { FaBolt, FaMapMarkerAlt, FaCheckCircle, FaBatteryThreeQuarters, FaExchangeAlt, FaShieldAlt } from 'react-icons/fa';

const DriverBatteryTelematics = () => {
  const { addToast } = useToast();

  const [batteryPercent, setBatteryPercent] = useState(74);
  const [estRangeKm, setEstRangeKm] = useState(82);
  const [selectedStation, setSelectedStation] = useState(null);

  const swapStations = [
    { id: 1, name: 'EcoCharge Station #04 - Anna Nagar Hub', distance: '1.2 km', availablePacks: 6, swapTime: '3 mins', status: 'Fast Swap Ready' },
    { id: 2, name: 'SunGrid Depot #09 - Adyar Link Road', distance: '3.8 km', availablePacks: 4, swapTime: '4 mins', status: 'Available' },
    { id: 3, name: 'GreenEnergy Station - Guindy Industrial', distance: '5.1 km', availablePacks: 9, swapTime: '2 mins', status: 'Fast Swap Ready' },
  ];

  const handleReserveSwap = (station) => {
    setSelectedStation(station);
    addToast(`⚡ Battery Swap Reserved at ${station.name}! Bay #02 Locked for 15 mins.`, 'success', 'Swap Reserved');
  };

  return (
    <DriverLayout>
      <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20">
              <FaBolt className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">EV Fleet Battery & Swap Locator</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time EV battery telematics, remaining range, and 1-Click Depot Battery Swap reservation.</p>
            </div>
          </div>

          {/* Battery Telematics Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">
                <span>BATTERY STATE OF CHARGE</span>
                <FaBatteryThreeQuarters className="text-emerald-500 h-5 w-5" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{batteryPercent}%</span>
                <span className="text-xs text-slate-500 font-semibold">Lithium-ion Pack</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" style={{ width: `${batteryPercent}%` }}></div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">
                <span>ESTIMATED REMAINING RANGE</span>
                <FaBolt className="text-amber-500 h-5 w-5" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-amber-500">{estRangeKm} km</span>
                <span className="text-xs text-slate-500 font-semibold">Optimal Eco Mode</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Sufficient for 6 more scheduled pickup stops</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">
                <span>BATTERY HEALTH & TEMP</span>
                <FaShieldAlt className="text-sky-500 h-5 w-5" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-sky-500">98%</span>
                <span className="text-xs text-slate-500 font-semibold">Good (32°C Normal)</span>
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Cell balancing active • 3.78V Avg</p>
            </div>
          </div>

          {/* Depot Swap Station Finder */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center space-x-2">
              <FaExchangeAlt className="text-amber-500" />
              <span>Nearby Fast Battery Swap & Supercharger Hubs</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {swapStations.map(st => (
                <div key={st.id} className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">{st.status}</span>
                      <span className="text-xs text-slate-400 font-bold">{st.distance}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">{st.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">⚡ {st.availablePacks} Charged Battery Packs Available</p>
                  </div>

                  <button
                    onClick={() => handleReserveSwap(st)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm mt-2 flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FaBolt />
                    <span>Reserve 3-Min Swap</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
      </div>
    </DriverLayout>
  );
};

export default DriverBatteryTelematics;
