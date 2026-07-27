import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { FaClipboardList, FaCamera, FaCheckCircle, FaExclamationTriangle, FaStar, FaShieldAlt } from 'react-icons/fa';

const DriverQualityAudit = () => {
  const { addToast } = useToast();

  const [selectedGrade, setSelectedGrade] = useState('A');
  const [wasteCategory, setWasteCategory] = useState('Plastic');
  const [contaminationType, setContaminationType] = useState('None (Clean)');
  const [notes, setNotes] = useState('');
  const [auditLog, setAuditLog] = useState([
    { id: 1, customer: 'Arjun Sharma', category: 'Plastic', grade: 'A', bonus: '₹50 Purity Bonus', time: '10:30 AM', status: 'Approved' },
    { id: 2, customer: 'Priya Patel', category: 'Metal', grade: 'B', bonus: '₹25 Regular', time: '01:15 PM', status: 'Approved' },
  ]);

  const handleSubmitAudit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      customer: 'Karthik Raja',
      category: wasteCategory,
      grade: selectedGrade,
      bonus: selectedGrade === 'A' ? '₹50 Purity Bonus' : selectedGrade === 'B' ? '₹25 Regular' : 'No Bonus (High Contamination)',
      time: 'Just now',
      status: 'Approved'
    };
    setAuditLog([newEntry, ...auditLog]);
    addToast(`Quality Audit Submitted! Grade ${selectedGrade} recorded.`, 'success', 'Audit Saved');
    setNotes('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <FaClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">AI Material Quality Audit Tool</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inspect waste material purity, report contamination, and trigger quality bonus payouts.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Audit Submission Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                New Material Quality Audit
              </h3>

              <form onSubmit={handleSubmitAudit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Waste Material Category</label>
                  <select
                    value={wasteCategory}
                    onChange={(e) => setWasteCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="Plastic">Plastic (PET / HDPE Bottles)</option>
                    <option value="Paper">Paper & Cardboard</option>
                    <option value="Metal">Scrap Metal & Aluminum</option>
                    <option value="Glass">Glass Containers</option>
                    <option value="E-Waste">E-Waste & Electronics</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Material Purity Grade</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedGrade('A')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedGrade === 'A'
                          ? 'bg-emerald-500 text-white border-emerald-400 font-black shadow-lg scale-105'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <span className="text-base block">⭐ Grade A</span>
                      <span className="text-[9px] opacity-90 block">Clean & Sorted</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGrade('B')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedGrade === 'B'
                          ? 'bg-amber-500 text-white border-amber-400 font-black shadow-lg scale-105'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <span className="text-base block">Grade B</span>
                      <span className="text-[9px] opacity-90 block">Moderate Mix</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedGrade('C')}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedGrade === 'C'
                          ? 'bg-rose-500 text-white border-rose-400 font-black shadow-lg scale-105'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold'
                      }`}
                    >
                      <span className="text-base block">Grade C</span>
                      <span className="text-[9px] opacity-90 block">Contaminated</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contamination Type (If Any)</label>
                  <select
                    value={contaminationType}
                    onChange={(e) => setContaminationType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="None (Clean)">None (Clean & Sorted)</option>
                    <option value="Food Residuals">Food / Liquid Residuals</option>
                    <option value="Mixed Non-Recyclable">Mixed Non-Recyclable Trash</option>
                    <option value="Wet Moisture Damage">Wet Moisture Damage</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Audit Notes / Comments</label>
                  <textarea
                    rows="2"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter audit observations..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Submit Quality Audit Log
                </button>
              </form>
            </div>

            {/* Audit History Log */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Recent Quality Inspections</h3>

                <div className="space-y-3">
                  {auditLog.map(item => (
                    <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            item.grade === 'A' ? 'bg-emerald-500 text-white' : item.grade === 'B' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                          }`}>
                            Grade {item.grade}
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{item.customer} ({item.category})</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Logged at {item.time}</p>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">{item.bonus}</span>
                        <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">{item.status}</span>
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

export default DriverQualityAudit;
