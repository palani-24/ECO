import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { FaExclamationTriangle, FaMapMarkerAlt, FaBullhorn, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

const DriverRoadHazards = () => {
  const { addToast } = useToast();

  const [hazardType, setHazardType] = useState('Chemical / Biohazard Spill');
  const [location, setLocation] = useState('Anna Salai Main Junction (Near Metro Gate 2)');
  const [severity, setSeverity] = useState('High');
  const [description, setDescription] = useState('');

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Waterlogging & Flood Alert', location: 'Adyar Canal Road (East Boundary)', severity: 'High', reporter: 'Driver Suresh B.', time: '15 mins ago', status: 'Active' },
    { id: 2, type: 'Road Closure / Civic Work', location: 'Velachery Main Bypass', severity: 'Moderate', reporter: 'Driver Ramesh K.', time: '1 hour ago', status: 'Active' },
    { id: 3, type: 'Overflowing Public Dump Unit', location: 'T. Nagar Commercial Hub', severity: 'Critical', reporter: 'Fleet Control Center', time: '2 hours ago', status: 'Investigating' },
  ]);

  const handleReportHazard = (e) => {
    e.preventDefault();
    const newAlert = {
      id: Date.now(),
      type: hazardType,
      location,
      severity,
      reporter: 'Ramesh Kumar (You)',
      time: 'Just now',
      status: 'Active'
    };
    setAlerts([newAlert, ...alerts]);
    addToast('⚠️ Road Hazard Broadcasted to Fleet Control!', 'error', 'Hazard Reported');
    setDescription('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20">
              <FaExclamationTriangle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Fleet Road Hazards & Incident Reporter</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Broadcast live road closures, spills, or public dump overflows to all fleet drivers & control room.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center space-x-2">
                <FaBullhorn className="text-rose-500" />
                <span>Broadcast New Hazard</span>
              </h3>

              <form onSubmit={handleReportHazard} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hazard Type</label>
                  <select
                    value={hazardType}
                    onChange={(e) => setHazardType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="Chemical / Biohazard Spill">Chemical / Biohazard Spill</option>
                    <option value="Waterlogging & Flood Alert">Waterlogging & Flood Alert</option>
                    <option value="Road Closure / Civic Work">Road Closure / Civic Construction</option>
                    <option value="Overflowing Public Dump Unit">Overflowing Municipal Bin Dump</option>
                    <option value="Accident / Traffic Jam">Accident / Severe Traffic Delay</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Location Landmark</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="High">High (Reroute Advised)</option>
                    <option value="Critical">Critical (Immediate Stop)</option>
                    <option value="Moderate">Moderate (Slow Traffic)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Incident Notes</label>
                  <textarea
                    rows="2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide details for fleet members..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Broadcast Hazard Alert
                </button>
              </form>
            </div>

            {/* Active Hazard Alerts Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Active Fleet Road Hazard Alerts</h3>

                <div className="space-y-3">
                  {alerts.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            item.severity === 'Critical' ? 'bg-rose-600 text-white' : item.severity === 'High' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-white'
                          }`}>
                            {item.severity} Severity
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.type}</h4>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{item.time}</span>
                      </div>

                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                        <FaMapMarkerAlt className="text-rose-500" />
                        <span>{item.location}</span>
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/40 dark:border-slate-800">
                        <span>Reported by: {item.reporter}</span>
                        <span className="text-emerald-500 font-extrabold">{item.status}</span>
                      </div>
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

export default DriverRoadHazards;
