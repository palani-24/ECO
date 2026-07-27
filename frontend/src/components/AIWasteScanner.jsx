import React, { useState } from 'react';
import { FaCamera, FaMagic, FaCheckCircle, FaCheck, FaExclamationTriangle, FaRecycle, FaRedo } from 'react-icons/fa';
import api from '../utils/api';

const AIWasteScanner = ({ onAnalysisComplete, initialCategory = 'Plastic' }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState(null);
  const [claimedWeight, setClaimedWeight] = useState(5);

  const sampleImages = [
    { label: 'Plastic Bottles', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500', category: 'Plastic' },
    { label: 'Aluminum Cans', url: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=500', category: 'Metal' },
    { label: 'Cardboard Boxes', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500', category: 'Paper' },
    { label: 'Glass Bottles', url: 'https://images.unsplash.com/photo-1548695607-9c73430ba065?w=500', category: 'Glass' }
  ];

  const handleSelectSample = (img) => {
    setSelectedImage(img.url);
    runScanner(img.url, img.category);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      runScanner(url, initialCategory);
    }
  };

  const runScanner = async (imgUrl, category) => {
    setAnalyzing(true);
    setReport(null);

    // Simulate AI scanner API calculation
    setTimeout(() => {
      const confidence = parseFloat((0.91 + Math.random() * 0.07).toFixed(2));
      const qualityScore = Math.floor(82 + Math.random() * 16);
      const rates = { Plastic: 10, Paper: 8, Metal: 20, Glass: 6, Organic: 4, 'E-Waste': 15 };
      const rate = rates[category] || 10;
      const points = Math.round(claimedWeight * rate);

      const aiReport = {
        category,
        materialSubtype: category === 'Plastic' ? 'PET Plastic Bottles #1' : `${category} Recyclable`,
        confidence,
        qualityScore,
        purity: `${qualityScore}% Pure Material`,
        impurityIndex: `${100 - qualityScore}% Contaminant`,
        points,
        estimatedWeight: claimedWeight,
        objects: [
          { label: `${category} Waste`, confidence: `${Math.round(confidence * 100)}%` }
        ]
      };

      setReport(aiReport);
      setAnalyzing(false);
      if (onAnalysisComplete) {
        onAnalysisComplete(aiReport);
      }
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
            <FaMagic className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base">AI Waste Vision Scanner</h3>
            <p className="text-xs text-slate-400">Upload or select a photo to auto-verify material purity & points.</p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
          v2.4 Neural Vision
        </span>
      </div>

      {/* Image Preview & Scanner Box */}
      <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center group">
        {selectedImage ? (
          <>
            <img src={selectedImage} alt="Waste preview" className="w-full h-full object-cover" />
            
            {/* Laser scanning beam effect */}
            {analyzing && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[bounce_1.5s_infinite]"></div>
            )}

            {/* Bounding box annotation overlay */}
            {report && (
              <div className="absolute inset-8 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3 bg-emerald-500/5">
                <div className="flex justify-between items-center">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow">
                    {report.materialSubtype} ({Math.round(report.confidence * 100)}%)
                  </span>
                  <span className="bg-slate-900/90 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    Purity: {report.qualityScore}%
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-6 space-y-3">
            <FaCamera className="h-10 w-10 mx-auto text-slate-600 group-hover:text-emerald-400 transition-colors" />
            <p className="text-xs text-slate-400 font-medium">Select a sample below or upload a photo to test AI verification</p>
          </div>
        )}
      </div>

      {/* Quick Sample Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400">Select Test Image Sample:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sampleImages.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(s)}
              className="flex items-center space-x-2 p-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 rounded-xl text-left transition-all text-xs"
            >
              <img src={s.url} alt={s.label} className="w-8 h-8 rounded-lg object-cover" />
              <span className="truncate font-semibold text-slate-300">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Results Display */}
      {report && (
        <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-emerald-400 text-sm font-bold">
              <FaCheckCircle />
              <span>Material Verified: {report.materialSubtype}</span>
            </div>
            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              +{report.points} Points
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Quality Grade</p>
              <p className="font-extrabold text-emerald-400">{report.qualityScore >= 90 ? 'High Grade' : 'Medium Grade'}</p>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Purity Index</p>
              <p className="font-extrabold text-sky-400">{report.qualityScore}%</p>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">AI Confidence</p>
              <p className="font-extrabold text-purple-400">{Math.round(report.confidence * 100)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWasteScanner;
