import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  Factory, 
  ShoppingBag, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Leaf, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import api from '../utils/api';

const RecyclingJourneyModal = ({ isOpen, onClose, pickup = null }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchTraceability = async () => {
        setLoading(true);
        try {
          const res = await api.get('/municipality/traceability');
          if (res.data?.success) {
            setBatches(res.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch traceability:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchTraceability();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentBatch = batches[0] || {
    batchId: 'BATCH-PET-2026-08',
    category: pickup?.wasteCategory || 'Plastic (PET #1)',
    collectedTons: 14.5,
    stages: [
      { stage: 'Doorstep Collection', location: 'Citizen Household (Your Pickup)', date: 'Day 1', status: 'completed', badge: '100% Weight Verified' },
      { stage: 'Material Recovery Facility (MRF)', location: 'Coimbatore South MRF Unit', date: 'Day 3', status: 'completed', badge: 'Optical Laser Segregation' },
      { stage: 'Pelletizing & Shredding Plant', location: 'GreenTech Polymers Hub', date: 'Day 5', status: 'completed', badge: 'High Purity rPET Flakes' },
      { stage: 'Upcycled into Eco Products', location: 'EcoReward Circular Store', date: 'Day 7', status: 'active', badge: 'Available in Store Rewards' }
    ],
    carbonOffsetKg: 23925,
    upcycledProductsCount: 1250
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition p-1 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Circular Recycling Journey</h2>
              <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Batch Verified
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Trace exactly where your collected recyclables travel and what new products they become!
            </p>
          </div>
        </div>

        {/* Batch Metadata Card */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Material Stream</span>
            <span className="text-white font-bold text-sm">{currentBatch.category}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Batch Lot ID</span>
            <span className="text-cyan-400 font-mono font-bold text-sm">{currentBatch.batchId}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">CO₂ Abated</span>
            <span className="text-emerald-400 font-bold text-sm">{currentBatch.carbonOffsetKg?.toLocaleString()} kg</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Upcycled Items</span>
            <span className="text-purple-400 font-bold text-sm">{currentBatch.upcycledProductsCount} Goods</span>
          </div>
        </div>

        {/* Timeline Workflow */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Lifecycle Transformation Stages
          </h3>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
            {currentBatch.stages.map((stage, idx) => {
              const isLast = idx === currentBatch.stages.length - 1;
              return (
                <div key={stage.stage} className="relative flex items-start gap-4 pl-1">
                  {/* Step Circle */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                    stage.status === 'completed' 
                      ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold' 
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-400 animate-pulse'
                  }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Factory className="w-4 h-4" />
                    )}
                  </div>

                  {/* Stage Details Card */}
                  <div className="flex-1 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:border-slate-700 transition space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{stage.stage}</h4>
                      <span className="text-[11px] text-slate-500 font-mono">{stage.date}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{stage.location}</span>
                    </div>

                    <div className="pt-1">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                        {stage.badge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecyclingJourneyModal;
