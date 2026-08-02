import React, { useState } from 'react';
import DriverLayout from '../../components/DriverLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { FaQrcode, FaTruck, FaCheckCircle, FaPrint, FaMapMarkerAlt, FaWeight, FaLeaf, FaClock } from 'react-icons/fa';

const DriverGatePass = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [selectedHub, setSelectedHub] = useState('Anna Nagar Municipal Recycling Yard');
  const [wasteWeight, setWasteWeight] = useState(485);
  const [wasteCategory, setWasteCategory] = useState('Mixed Plastic & Dry Recyclables');
  const [passGenerated, setPassGenerated] = useState(true);

  const hubs = [
    { name: 'Anna Nagar Municipal Recycling Yard', city: 'Chennai', slot: '11:30 AM - 12:00 PM', bay: 'Bay 04 (Plastic Shredder)' },
    { name: 'Adyar Bio-Compost Facility', city: 'Chennai', slot: '01:15 PM - 01:45 PM', bay: 'Bay 01 (Organic Digestor)' },
    { name: 'Guindy E-Waste Processing Center', city: 'Chennai', slot: '03:00 PM - 03:30 PM', bay: 'Bay 02 (Electronic Metals)' },
  ];

  const currentPassCode = `GATE-PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

  const handleGeneratePass = (e) => {
    e.preventDefault();
    setPassGenerated(true);
    addToast('🎉 Digital Gate Pass Generated with Dynamic Verification QR!', 'success', 'Pass Created');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DriverLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <FaQrcode className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Unloading Digital Gate-Pass</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Generate official QR entry pass for municipal recycling plants & processing yards.</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-2"
        >
          <FaPrint />
          <span>Print Gate Manifest</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Select Unloading Hub & Load Data */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Unloading Dispatch Details
          </h3>

          <form onSubmit={handleGeneratePass} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Recycling Processing Yard</label>
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
              >
                {hubs.map(h => (
                  <option key={h.name} value={h.name}>{h.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Truck Load Weight (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  value={wasteWeight}
                  onChange={(e) => setWasteWeight(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500 pr-10"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">KG</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Waste Classification Manifest</label>
              <select
                value={wasteCategory}
                onChange={(e) => setWasteCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
              >
                <option value="Mixed Plastic & Dry Recyclables">Mixed Plastic & Dry Recyclables</option>
                <option value="Cardboard & Office Paper Bulk">Cardboard & Office Paper Bulk</option>
                <option value="Scrap Metal & Aluminum Cans">Scrap Metal & Aluminum Cans</option>
                <option value="Segregated E-Waste & Circuitry">Segregated E-Waste & Circuitry</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Generate Official QR Pass
            </button>
          </form>
        </div>

        {/* Right Display: Official Digital QR Pass Card */}
        <div className="lg:col-span-2 space-y-6">
          {passGenerated && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/40 rounded-3xl p-8 text-white shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black">
                    <FaLeaf className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base tracking-wide text-white">OFFICIAL UNLOADING ENTRY MANIFEST</h3>
                    <p className="text-[10px] text-emerald-400 font-mono font-bold">{currentPassCode}</p>
                  </div>
                </div>

                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center space-x-1">
                  <FaCheckCircle />
                  <span>GATE APPROVED</span>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Simulated SVG QR Code */}
                <div className="bg-white p-5 rounded-2xl shadow-inner flex flex-col items-center justify-center space-y-2">
                  <svg viewBox="0 0 100 100" className="w-48 h-48">
                    <rect x="5" y="5" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
                    <rect x="11" y="11" width="16" height="16" fill="#0f172a" />
                    <rect x="67" y="5" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
                    <rect x="73" y="11" width="16" height="16" fill="#0f172a" />
                    <rect x="5" y="67" width="28" height="28" fill="none" stroke="#0f172a" strokeWidth="4" />
                    <rect x="11" y="73" width="16" height="16" fill="#0f172a" />
                    <rect x="40" y="8" width="8" height="8" fill="#10b981" />
                    <rect x="50" y="18" width="8" height="8" fill="#0f172a" />
                    <rect x="40" y="40" width="20" height="20" fill="#10b981" />
                    <rect x="68" y="40" width="8" height="8" fill="#0f172a" />
                    <rect x="78" y="78" width="12" height="12" fill="#0f172a" />
                  </svg>
                  <p className="text-[11px] font-mono font-extrabold text-slate-900 tracking-widest">{currentPassCode}</p>
                </div>

                {/* Manifest Information Grid */}
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                      <FaMapMarkerAlt className="text-emerald-400" />
                      <span>DESTINATION PLANT</span>
                    </span>
                    <p className="font-extrabold text-white text-sm">{selectedHub}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                        <FaWeight className="text-amber-400" />
                        <span>NET LOAD WEIGHT</span>
                      </span>
                      <p className="font-extrabold text-emerald-400 text-sm">{wasteWeight} kg</p>
                    </div>
                    <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                        <FaClock className="text-sky-400" />
                        <span>ENTRY WINDOW</span>
                      </span>
                      <p className="font-extrabold text-white text-sm">11:30 - 12:00 PM</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">DRIVER & VEHICLE</span>
                    <p className="font-bold text-slate-200">{user?.name || 'Ramesh Kumar'} (Vehicle: TN-01-AX-9945)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverGatePass;
