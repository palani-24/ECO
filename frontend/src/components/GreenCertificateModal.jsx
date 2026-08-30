import React, { useRef } from 'react';
import { 
  Award, 
  Leaf, 
  ShieldCheck, 
  TreePine, 
  Droplets, 
  Zap, 
  Printer, 
  Download, 
  X, 
  Sparkles,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GreenCertificateModal = ({ isOpen, onClose, totalWeight = 42.5, totalCO2 = 68.2, points = 1250 }) => {
  const { user } = useAuth();
  const certRef = useRef(null);

  if (!isOpen) return null;

  const userName = user?.name || 'Eco Champion Recycler';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const certId = `ECO-CERT-${(user?._id || '9945').toString().substring(0, 8).toUpperCase()}-2026`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 rounded-lg bg-slate-800 print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Printable Canvas */}
        <div 
          ref={certRef}
          className="border-4 border-double border-emerald-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 relative overflow-hidden text-center space-y-5"
        >
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Leaf className="w-96 h-96 text-emerald-400" />
          </div>

          {/* Top Seal */}
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 rounded-full shadow-lg shadow-emerald-500/30">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              Official City Environmental Registry
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              GREEN CITIZEN OF EXCELLENCE
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Certificate of Environmental Stewardship & Circular Resource Conservation
            </p>
          </div>

          {/* Recipient */}
          <div className="py-2 border-y border-emerald-500/20 my-3">
            <span className="text-xs text-slate-400 block">This is proudly presented to:</span>
            <h3 className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300 bg-clip-text text-transparent mt-1">
              {userName}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              For active participation in verified household waste segregation and circular recycling.
            </p>
          </div>

          {/* Impact Stats Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-emerald-400 text-base font-extrabold">{totalWeight} kg</div>
              <div className="text-[10px] text-slate-400">Waste Diverted</div>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-teal-400 text-base font-extrabold">{totalCO2} kg</div>
              <div className="text-[10px] text-slate-400">CO₂ Abated</div>
            </div>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="text-cyan-400 text-base font-extrabold">{points} Pts</div>
              <div className="text-[10px] text-slate-400">EcoRewards Earned</div>
            </div>
          </div>

          {/* Signature & Seal Footer */}
          <div className="flex items-center justify-between pt-4 text-left border-t border-slate-800 text-[11px] text-slate-400">
            <div>
              <span className="block font-mono text-slate-500">Certificate ID:</span>
              <span className="font-mono text-emerald-400 font-bold">{certId}</span>
              <span className="block text-[10px] text-slate-500">Issued: {issueDate}</span>
            </div>

            <div className="text-right flex items-center gap-2">
              <div>
                <span className="block font-semibold text-slate-200">Director of Sustainability</span>
                <span className="text-[10px] text-slate-500">Municipal Eco-Board</span>
              </div>
              <div className="p-1 bg-slate-800 border border-emerald-500/30 rounded-lg">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-900/30"
          >
            <Printer className="w-4 h-4" />
            Print / Save Certificate PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default GreenCertificateModal;
