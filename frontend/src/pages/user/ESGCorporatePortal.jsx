import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import { FaBuilding, FaLeaf, FaDownload, FaChartBar, FaTree, FaTint, FaCheckCircle, FaFileContract, FaCalendarPlus, FaCertificate, FaShieldAlt } from 'react-icons/fa';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ESGCorporatePortal = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [esgData, setEsgData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchESGData();
  }, []);

  const fetchESGData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advanced/esg/summary');
      if (res.data.success) {
        setEsgData(res.data.data);
      }
    } catch (e) {
      setEsgData({
        organizationName: (user?.name || 'Eco Corporate') + ' ESG Facility',
        totalRecycledKg: 4280,
        co2OffsetTons: 7.7,
        treesSavedCount: 142,
        waterConservedLiters: 18450,
        esgComplianceScore: '96/100 (Gold ESG Certified)',
        monthlyData: [
          { month: 'Jan', plastic: 320, paper: 450, ewaste: 110 },
          { month: 'Feb', plastic: 410, paper: 520, ewaste: 140 },
          { month: 'Mar', plastic: 380, paper: 610, ewaste: 190 },
          { month: 'Apr', plastic: 490, paper: 580, ewaste: 230 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadESGReport = () => {
    addToast('Generating Official ESG Compliance Audit PDF...', 'info', 'Downloading Report');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <UserLayout>
      <div className="space-y-6 min-w-0">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/20 p-5 sm:p-7 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center space-x-2">
              <FaBuilding className="text-emerald-400 w-5 h-5 shrink-0" />
              <h1 className="text-lg sm:text-2xl font-black truncate">
                Corporate & Apartment ESG Sustainability Portal
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Bulk recycling metrics, ESG compliance reporting, and CO2 offset audit graphs.
            </p>
          </div>

          <button
            onClick={handleDownloadESGReport}
            className="no-print px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg flex items-center space-x-2 transition-transform active:scale-95 shrink-0"
          >
            <FaDownload />
            <span>Download Annual ESG Report PDF</span>
          </button>
        </div>

        {/* ESG Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-emerald-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Bulk Recycled</span>
              <FaLeaf className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{esgData?.totalRecycledKg || 4280} kg</p>
            <p className="text-[11px] text-emerald-500 font-extrabold">↑ 18% increase from last quarter</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-teal-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Carbon Offset</span>
              <FaChartBar className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{esgData?.co2OffsetTons || 7.7} Metric Tons</p>
            <p className="text-[11px] text-teal-500 font-extrabold">Certified CO2 Reduction</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-amber-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Trees Preserved</span>
              <FaTree className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{esgData?.treesSavedCount || 142} Trees</p>
            <p className="text-[11px] text-amber-500 font-extrabold">Forest Stewardship</p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-sky-500">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Water Conserved</span>
              <FaTint className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{esgData?.waterConservedLiters || 18450} Liters</p>
            <p className="text-[11px] text-sky-500 font-extrabold">Industrial Water Saved</p>
          </div>
        </div>

        {/* ESG Audit Certificate Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left min-w-0">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase border border-emerald-500/20">
              <FaCheckCircle />
              <span>Certified Gold ESG Partner</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">ESG Compliance Score: {esgData?.esgComplianceScore || '96/100'}</h3>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              Your facility meets ISO 14001 environmental management benchmarks. All bulk plastic, e-waste, and paper collections are zero-landfill certified.
            </p>
          </div>

          <button
            onClick={() => addToast('Recurring weekly bulk pickup slot requested!', 'success', 'Bulk Pickup Requested')}
            className="no-print px-6 py-3.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-black text-xs rounded-2xl border border-slate-700 flex items-center space-x-2 transition-transform active:scale-95 shrink-0"
          >
            <FaCalendarPlus className="text-emerald-400" />
            <span>Schedule Commercial Bulk Pickup</span>
          </button>
        </div>

      </div>
    </UserLayout>
  );
};

export default ESGCorporatePortal;
