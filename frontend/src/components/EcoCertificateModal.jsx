import React, { useRef } from 'react';
import { FaTimes, FaPrint, FaDownload, FaAward, FaTree, FaTint, FaBolt, FaLeaf, FaShieldAlt } from 'react-icons/fa';

const EcoCertificateModal = ({ isOpen, onClose, user, impactData }) => {
  const certRef = useRef(null);

  if (!isOpen || !user) return null;

  const totalCo2 = impactData?.co2SavedKg || (user.points ? (user.points * 0.4).toFixed(1) : 42.5);
  const treesEquiv = impactData?.treesPlantedEquiv || (totalCo2 / 20).toFixed(1);
  const waterSaved = impactData?.waterSavedLiters || Math.round(totalCo2 * 8.5);
  const energySaved = impactData?.energySavedKwh || Math.round(totalCo2 * 1.4);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Modal Controls */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <FaAward className="h-5 w-5 text-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Official Eco-Impact Certificate</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow"
            >
              <FaPrint />
              <span>Print / Download PDF</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1">
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Printable Certificate Template */}
        <div
          ref={certRef}
          className="border-8 border-double border-emerald-600/40 p-8 rounded-3xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white space-y-6 relative overflow-hidden text-center shadow-inner"
        >
          {/* Certificate Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center space-x-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              <FaLeaf />
              <span>EcoReward Global Certification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-slate-900 dark:text-white pt-2">
              CERTIFICATE OF ENVIRONMENTAL IMPACT
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">This official ESG certificate recognizes outstanding contribution to smart waste recycling</p>
          </div>

          {/* User Name */}
          <div className="py-4 border-y border-emerald-500/20 max-w-lg mx-auto space-y-1">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">PROUDLY PRESENTED TO</p>
            <h2 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide font-serif">
              {user.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">For outstanding sustainability performance and verified waste reduction</p>
          </div>

          {/* ESG Impact Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-1">
              <FaLeaf className="h-5 w-5 mx-auto text-emerald-500" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">CO2 Prevented</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{totalCo2} kg</p>
            </div>
            <div className="p-3 bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 rounded-2xl space-y-1">
              <FaTree className="h-5 w-5 mx-auto text-indigo-500" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Trees Saved</p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{treesEquiv} Trees</p>
            </div>
            <div className="p-3 bg-sky-500/5 dark:bg-sky-950/20 border border-sky-500/20 rounded-2xl space-y-1">
              <FaTint className="h-5 w-5 mx-auto text-sky-500" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Water Conserved</p>
              <p className="text-sm font-black text-sky-600 dark:text-sky-400">{waterSaved} L</p>
            </div>
            <div className="p-3 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-1">
              <FaBolt className="h-5 w-5 mx-auto text-amber-500" />
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Clean Energy</p>
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">{energySaved} kWh</p>
            </div>
          </div>

          {/* Footer & Gold Seal */}
          <div className="flex items-center justify-between pt-6 border-t border-emerald-500/20">
            <div className="text-left space-y-0.5">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Verification ID</p>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">ECO-CERT-{user._id.toString().substring(18).toUpperCase()}</p>
              <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Official Gold Seal Graphic */}
            <div className="h-16 w-16 bg-gradient-to-br from-amber-300 to-amber-600 text-slate-950 rounded-full flex flex-col items-center justify-center shadow-xl border-2 border-amber-200">
              <FaShieldAlt className="h-6 w-6" />
              <span className="text-[7px] font-black uppercase tracking-tighter">OFFICIAL SEAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoCertificateModal;
