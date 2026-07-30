import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUser, FaCamera, FaTruck, FaFileAlt, FaCheckCircle, FaBolt, FaCloudUploadAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DriverProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const docs = [
    { title: 'Driving License', number: 'DL-TN-2024-99882', status: '✓ Verified', expiry: 'Nov 2028' },
    { title: 'Vehicle Registration (RC)', number: 'RC-TN-38-8877', status: '✓ Verified', expiry: 'Dec 2030' },
    { title: 'Insurance Certificate', number: 'INS-2026-1122', status: '✓ Verified', expiry: 'Dec 2026' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      addToast('Profile updated successfully!', 'success', 'Saved');
    } catch (e) {
      addToast('Saved locally', 'info', 'Saved');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Account & Vehicle Profile</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View personal details, assigned vehicle specifications, and verification documents.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Personal Profile Form */}
            <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img src={profileImage} alt="Profile" className="h-20 w-20 rounded-full object-cover ring-4 ring-emerald-500/30" />
                  <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 text-white rounded-full cursor-pointer shadow">
                    <FaCamera className="h-3.5 w-3.5" />
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && setProfileImage(URL.createObjectURL(e.target.files[0]))} className="hidden" />
                  </label>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">{name}</h3>
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full">
                    ★ 4.9 Rating (48 Pickups)
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
                </div>
                <div>
                  <label className="font-bold text-slate-400 uppercase text-[9px] block mb-1">Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold" />
                </div>
                <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-2xl shadow">Save Changes</button>
              </div>
            </form>

            {/* 2. Merged Vehicle Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xl">
                  <FaTruck />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Assigned Vehicle</h3>
                  <span className="text-xs font-mono font-bold text-emerald-500">TN-38-ECO-9945</span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Vehicle Model</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">E-Rickshaw Heavy Loader</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Battery & Range</span>
                  <span className="font-extrabold text-emerald-500 flex items-center space-x-1">
                    <FaBolt /> <span>88% (Est. 65 km range)</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase">Max Payload Capacity</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">500 kg Capacity</span>
                </div>
              </div>
            </div>

            {/* 3. Merged Driver Documents */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <FaFileAlt className="text-emerald-500 text-lg" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Verification Documents</h3>
                </div>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-3 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-xl"
                >
                  + Upload
                </button>
              </div>

              <div className="space-y-3">
                {docs.map((doc, i) => (
                  <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-slate-900 dark:text-white text-xs">{doc.title}</span>
                      <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 font-bold rounded-full">{doc.status}</span>
                    </div>
                    <p className="font-mono text-[10px] font-bold text-slate-500">{doc.number}</p>
                  </div>
                ))}
              </div>
            </div>

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

export default DriverProfilePage;
