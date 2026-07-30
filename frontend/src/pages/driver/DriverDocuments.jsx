import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaFileAlt, FaCheckCircle, FaCloudUploadAlt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';

const DriverDocuments = () => {
  const { addToast } = useToast();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const docs = [
    { title: 'Driving License', number: 'DL-TN-2024-99882', status: '✓ Verified', expiry: 'Nov 2028' },
    { title: 'Vehicle Registration (RC)', number: 'RC-TN-38-8877', status: '✓ Verified', expiry: 'Dec 2030' },
    { title: 'Insurance Certificate', number: 'INS-2026-1122', status: '✓ Verified', expiry: 'Dec 2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Verification Documents</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View and update your driving license, vehicle RC, and insurance certificates.</p>
            </div>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow"
            >
              Upload New Document
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {docs.map((doc, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center space-x-2 text-emerald-500">
                  <FaFileAlt className="text-xl" />
                  <span className="font-black text-slate-900 dark:text-white text-sm">{doc.title}</span>
                </div>
                <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{doc.number}</p>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full">
                  {doc.status}
                </span>
                <span className="text-[10px] text-slate-400 block font-semibold">Expiry: {doc.expiry}</span>
              </div>
            ))}
          </div>

          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center">
                <FaCloudUploadAlt className="h-12 w-12 text-emerald-500 mx-auto" />
                <h4 className="font-black text-slate-900 dark:text-white text-base">Upload Document File</h4>
                <input type="file" className="text-xs text-slate-400 mx-auto" />
                <div className="flex space-x-2">
                  <button onClick={() => setShowUploadModal(false)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs">Cancel</button>
                  <button onClick={() => { setShowUploadModal(false); addToast('Document submitted for verification', 'success', 'Uploaded'); }} className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs">Submit</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DriverDocuments;
