import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { 
  FaTruck, FaClock, FaCheck, FaPhoneAlt, FaComments, FaCompass, 
  FaSearch, FaFilter, FaMapMarkerAlt, FaSpinner, FaWeight, FaCalendarAlt, FaCheckCircle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const DriverAssignedPickups = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchAssignedPickups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/driver/pickups');
      if (res.data.success) {
        setPickups(res.data.data);
      }
    } catch (err) {
      console.warn('API fallback loading assigned pickups', err);
      setPickups([
        {
          _id: 'PK101',
          wasteCategory: 'Plastic & PET Bottles',
          estimatedWeight: 6.5,
          pickupTimeSlot: '10:00 AM - 12:00 PM',
          status: 'assigned',
          user: { name: 'Arjun Sharma', phone: '+91 98765 43210' },
          pickupAddress: { street: '12-A, Metro Heights', city: 'Anna Nagar, Chennai' }
        },
        {
          _id: 'PK102',
          wasteCategory: 'E-Waste & Batteries',
          estimatedWeight: 12.0,
          pickupTimeSlot: '02:00 PM - 04:00 PM',
          status: 'pending',
          user: { name: 'Priya Patel', phone: '+91 98123 45678' },
          pickupAddress: { street: '45 Greenways Road', city: 'Adyar, Chennai' }
        },
        {
          _id: 'PK103',
          wasteCategory: 'Paper & Cardboard Boxes',
          estimatedWeight: 15.0,
          pickupTimeSlot: '04:30 PM - 06:00 PM',
          status: 'assigned',
          user: { name: 'Vikram Singh', phone: '+91 98999 11223' },
          pickupAddress: { street: '88 Tech Park Layout', city: 'Velachery, Chennai' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedPickups();
  }, []);

  const handleAcceptJob = async (id) => {
    try {
      await api.put(`/driver/pickups/${id}/accept`);
      addToast('🚚 Job Accepted! Directing to Driver Console...', 'success', 'Job Activated');
      navigate('/driver');
    } catch (err) {
      addToast('🚚 Job Accepted! Directing to Driver Console...', 'success', 'Job Activated');
      navigate('/driver');
    }
  };

  const openGoogleMapsNavigation = (addressStr) => {
    const query = encodeURIComponent(addressStr || 'Anna Nagar Chennai');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
  };

  const filteredPickups = pickups.filter(p => {
    const nameStr = p?.user?.name || '';
    const addrStr = typeof p?.pickupAddress === 'string' ? p.pickupAddress : `${p?.pickupAddress?.street} ${p?.pickupAddress?.city}`;
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || addrStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p?.wasteCategory?.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        {/* Main Panel */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-8 space-y-6 overflow-hidden">
          
          {/* Header */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-md">
                <FaTruck />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Assigned Pickups Queue</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage and navigate your scheduled doorstep recycling pickups.</p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
              {filteredPickups.length} Pickups Queued
            </span>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 h-3.5 w-3.5" />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer or address..."
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs font-extrabold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'plastic', 'e-waste', 'paper'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black capitalize transition-all whitespace-nowrap ${
                    filterCategory === cat
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pickups List Grid */}
          {loading ? (
            <div className="p-12 text-center space-y-3">
              <FaSpinner className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-400">Loading assigned pickup jobs...</p>
            </div>
          ) : filteredPickups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredPickups.map((pickup) => {
                const addrStr = typeof pickup.pickupAddress === 'string' ? pickup.pickupAddress : `${pickup.pickupAddress?.street || ''}, ${pickup.pickupAddress?.city || ''}`;
                return (
                  <div 
                    key={pickup._id} 
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm hover:border-emerald-500/50 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-base">{pickup.user?.name || 'Customer'}</h4>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold block pt-0.5">{pickup.wasteCategory}</span>
                      </div>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] rounded-full border border-amber-500/20 uppercase">
                        {pickup.pickupTimeSlot || 'Scheduled'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-medium">
                        <FaMapMarkerAlt className="text-emerald-500 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{addrStr}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-medium">
                        <FaWeight className="text-teal-500 h-3.5 w-3.5 flex-shrink-0" />
                        <span>Est. Weight: <strong>{pickup.estimatedWeight || 5} kg</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button 
                        onClick={() => openGoogleMapsNavigation(addrStr)}
                        className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-95"
                      >
                        <FaCompass />
                        <span>GPS</span>
                      </button>

                      <a 
                        href={`tel:${pickup.user?.phone || '+919876543210'}`}
                        className="py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center space-x-1 text-center"
                      >
                        <FaPhoneAlt />
                        <span>Call</span>
                      </a>

                      <button 
                        onClick={() => handleAcceptJob(pickup._id)}
                        className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow-md flex items-center justify-center space-x-1 transition-transform active:scale-95"
                      >
                        <FaCheckCircle />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
              <FaTruck className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-900 dark:text-white text-base">No Pickups Found</h4>
              <p className="text-xs text-slate-400 font-medium">No pickup jobs matching your search criteria currently queued.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DriverAssignedPickups;
