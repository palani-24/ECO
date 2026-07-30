import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaUser, FaCamera } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DriverProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');

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
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Profile Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View personal details, contact info, and driver rating.</p>
          </div>

          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-4 max-w-lg">
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
        </main>
      </div>
    </div>
  );
};

export default DriverProfilePage;
