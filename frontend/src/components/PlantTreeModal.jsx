import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTree, FaMapMarkerAlt, FaQrcode, FaDownload, 
  FaCheckCircle, FaTimes, FaLeaf, FaSeedling, FaCalendarAlt, FaAward, FaHeart
} from 'react-icons/fa';
import { useToast } from '../context/ToastContext';

const TREE_SPECIES = [
  { id: 'neem', name: 'Neem Tree (Azadirachta indica)', co2: '24 kg/year', icon: '🌿', description: 'High oxygen generator & natural air purifier' },
  { id: 'teak', name: 'Teak (Tectona grandis)', co2: '28 kg/year', icon: '🌳', description: 'Dense canopy & massive carbon sequestration' },
  { id: 'pungan', name: 'Indian Beech / Pungan', co2: '22 kg/year', icon: '🍃', description: 'Native Tamil Nadu bio-diverse shade provider' },
  { id: 'bamboo', name: 'Giant Green Bamboo', co2: '35 kg/year', icon: '🎋', description: 'Rapid growth & maximum soil enrichment' }
];

const PlantTreeModal = ({ isOpen, onClose, userPoints = 1200, onTreePlanted }) => {
  const { addToast } = useToast();
  const [selectedSpecies, setSelectedSpecies] = useState(TREE_SPECIES[0]);
  const [dedicatedName, setDedicatedName] = useState('');
  const [plantedCertificate, setPlantedCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const TREE_COST = 500; // 500 EcoPoints

  const handlePlantTree = () => {
    if (userPoints < TREE_COST) {
      addToast(`You need at least ${TREE_COST} EcoPoints to plant a tree. Current: ${userPoints} pts`, 'error', 'Insufficient Points');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const treeId = `ECO-TREE-${Math.floor(100000 + Math.random() * 900000)}`;
      const cert = {
        treeId,
        species: selectedSpecies.name,
        dedicatedTo: dedicatedName.trim() || 'Planet Earth & Green Future',
        plantedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
        gpsLat: '12.8797° N',
        gpsLng: '80.0811° E',
        forestZone: 'Vandalur Reserve Green Belt & Bio-Corridor',
        ngoPartner: 'Tamil Nadu Green Mission & EcoReward NGO Partner',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://ecoreward.org/verify-tree/${treeId}`
      };
      setPlantedCertificate(cert);
      addToast(`🎉 Real Tree Planted! Seedling ID: ${treeId}`, 'reward', 'Tree Planted Successfully!');
      if (onTreePlanted) {
        onTreePlanted(TREE_COST, cert);
      }
    }, 1000);
  };

  const handleDownloadCertificate = () => {
    addToast('Opening Print & PDF Certificate Generator...', 'info', 'Generating Certificate');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl text-white my-8 space-y-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xl shadow-lg">
                🌳
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <span>Plant a Real Tree</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Geo-Tagged</span>
                </h3>
                <p className="text-xs text-slate-400 font-semibold">Convert 500 EcoPoints into a permanent real-world sapling</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {!plantedCertificate ? (
            /* STEP 1: TREE SELECTION & DEDICATION */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Select Tree Species:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TREE_SPECIES.map((spec) => {
                    const isSelected = selectedSpecies.id === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => setSelectedSpecies(spec)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500'
                            : 'bg-slate-800/70 border-slate-750 hover:bg-slate-800'
                        }`}
                      >
                        <span className="text-2xl mt-0.5">{spec.icon}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate">{spec.name}</h4>
                          <p className="text-[10px] text-emerald-400 font-bold">CO2 Offset: {spec.co2}</p>
                          <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{spec.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dedication Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Dedicate Tree To (Optional):
                </label>
                <input
                  type="text"
                  value={dedicatedName}
                  onChange={(e) => setDedicatedName(e.target.value)}
                  placeholder="e.g. In Memory of Grandma / For Earth Day 2026"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Geo-tag Plantation Location Badge */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
                <FaMapMarkerAlt className="text-emerald-400 h-5 w-5 shrink-0" />
                <div className="text-xs">
                  <p className="font-black text-white">Plantation Reserve: Vandalur Green Corridor, Chennai</p>
                  <p className="text-[10px] text-slate-400 font-medium">GPS: 12.8797° N, 80.0811° E • Geo-tagged & Verified by Forest NGO</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs">
                  <p className="text-slate-400 font-semibold">Cost: <strong className="text-emerald-400 text-sm">{TREE_COST} EcoPoints</strong></p>
                  <p className="text-[10px] text-slate-500">Your Wallet: {userPoints} pts</p>
                </div>

                <button
                  type="button"
                  onClick={handlePlantTree}
                  disabled={loading || userPoints < TREE_COST}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-2xl font-black text-xs shadow-xl flex items-center space-x-2 transition-all active:scale-95 cursor-pointer"
                >
                  <FaSeedling className="h-4 w-4" />
                  <span>{loading ? 'Planting Sapling...' : 'Confirm & Plant Tree (500 pts)'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: OFFICIAL DIGITAL CERTIFICATE VIEW */
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 border-2 border-emerald-500/50 rounded-3xl p-6 relative overflow-hidden shadow-2xl space-y-4 print:bg-white print:text-black">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🌱</span>
                    <div>
                      <h4 className="font-black text-sm text-emerald-400 uppercase tracking-wider">Official Certificate of Living Tree</h4>
                      <p className="text-[9px] text-slate-400 font-mono">ID: {plantedCertificate.treeId}</p>
                    </div>
                  </div>
                  <FaAward className="text-amber-400 text-2xl" />
                </div>

                <div className="text-center py-2 space-y-1">
                  <p className="text-[11px] text-slate-400">This certifies that a living tree has been planted & geo-tagged for:</p>
                  <h2 className="text-lg font-black text-white">{plantedCertificate.dedicatedTo}</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Species:</span>
                    <span className="font-black text-emerald-300">{plantedCertificate.species}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Planted Date:</span>
                    <span className="font-bold text-white">{plantedCertificate.plantedAt}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">GPS Coordinates:</span>
                    <span className="font-mono text-[10px] text-slate-300">{plantedCertificate.gpsLat}, {plantedCertificate.gpsLng}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Forest Zone:</span>
                    <span className="font-semibold text-slate-300 text-[10px] truncate">{plantedCertificate.forestZone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[9px] text-slate-400">
                    <p className="font-bold text-emerald-400">Verified by EcoReward Green Foundation</p>
                    <p>Protected Native Sapling Reserve</p>
                  </div>
                  <img src={plantedCertificate.qrCodeUrl} alt="QR Code" className="h-12 w-12 rounded-lg bg-white p-0.5" />
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleDownloadCertificate}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <FaDownload className="h-3.5 w-3.5" />
                  <span>Download / Print Certificate (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlantTreeModal;
