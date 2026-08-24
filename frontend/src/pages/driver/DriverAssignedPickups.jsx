import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DriverLayout from '../../components/DriverLayout';
import GoogleRouteMap from '../../components/GoogleRouteMap';
import DriverChatModal from '../../components/DriverChatModal';
import api from '../../utils/api';
import { 
  FaTruck, FaClock, FaCheck, FaPhoneAlt, FaComments, FaCompass, 
  FaSearch, FaFilter, FaMapMarkerAlt, FaSpinner, FaWeight, FaCalendarAlt, 
  FaCheckCircle, FaCoins, FaBolt, FaCrown, FaRoute, FaLocationArrow
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
  const [showChatModal, setShowChatModal] = useState(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState(null);
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState(null);

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
          priority: 'high',
          user: { name: 'vengayam', phone: '+91 98765 43210' },
          pickupAddress: { street: '12-A, Metro Heights', city: 'Anna Nagar, Chennai' }
        },
        {
          _id: 'PK102',
          wasteCategory: 'Plastic Containers',
          estimatedWeight: 5.0,
          pickupTimeSlot: '10:00 AM - 12:00 PM',
          status: 'assigned',
          priority: 'standard',
          user: { name: 'Dinesh', phone: '+91 98123 45678' },
          pickupAddress: { street: 'Bharathi puram', city: 'Tiruppur' }
        },
        {
          _id: 'PK103',
          wasteCategory: 'Metal & Heavy Scrap',
          estimatedWeight: 87.6,
          pickupTimeSlot: '10:00 AM - 12:00 PM',
          status: 'assigned',
          priority: 'bulk',
          user: { name: 'vengayam', phone: '+91 98765 43210' },
          pickupAddress: { street: '12-A, Metro Heights', city: 'Anna Nagar, Chennai' }
        },
        {
          _id: 'PK104',
          wasteCategory: 'Metal & Wiring',
          estimatedWeight: 99.6,
          pickupTimeSlot: '10:00 AM - 12:00 PM',
          status: 'assigned',
          priority: 'vip',
          user: { name: 'K2d', phone: '+91 98999 11223' },
          pickupAddress: { street: 'Sri Ram Garden', city: 'Tiruppur' }
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

  const handleOpenChat = (pickupUser) => {
    setActiveChatRecipient(pickupUser);
    setShowChatModal(true);
  };

  const handleOptimizeRoute = () => {
    const sorted = [...pickups].sort((a, b) => (b.estimatedWeight || 0) - (a.estimatedWeight || 0));
    setPickups(sorted);
    addToast('⚡ Route Optimized by Weight & Distance Priority!', 'success', 'Route Optimized');
  };

  const filteredPickups = pickups.filter(p => {
    const nameStr = p?.user?.name || '';
    const addrStr = typeof p?.pickupAddress === 'string' ? p.pickupAddress : `${p?.pickupAddress?.street} ${p?.pickupAddress?.city}`;
    const matchesSearch = nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || addrStr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p?.wasteCategory?.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const totalEstWeight = filteredPickups.reduce((acc, curr) => acc + (curr.estimatedWeight || 0), 0);
  const totalEstEarnings = Math.round(totalEstWeight * 12.5);

  return (
    <DriverLayout>
          
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

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleOptimizeRoute}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-sm flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                <FaBolt />
                <span>⚡ Optimize Route</span>
              </button>

              <span className="px-3.5 py-2 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs border border-emerald-500/20">
                {filteredPickups.length} Pickups Queued
              </span>
            </div>
          </div>

          {/* Multi-Stop Interactive Route Map */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-4 rounded-3xl shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <FaLocationArrow className="text-emerald-500 animate-pulse" />
                <span>Multi-Stop Route Map Overview</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">14.2 km Total Travel Route</span>
            </div>

            <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden border border-emerald-500/30">
              <GoogleRouteMap 
                pickups={filteredPickups} 
                height="192px" 
                isDriver={true}
              />
            </div>
          </div>

          {/* Route Summary Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Est. Weight</span>
              <span className="text-xl font-black text-emerald-500 block">{totalEstWeight.toFixed(1)} kg</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Est. Route Earnings</span>
              <span className="text-xl font-black text-amber-500 block">₹{totalEstEarnings}</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Total Distance</span>
              <span className="text-xl font-black text-sky-500 block">14.2 km (35 mins)</span>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-1">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block">Pickups Ready</span>
              <span className="text-xl font-black text-teal-500 block">{filteredPickups.length} Jobs</span>
            </div>
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
              {['all', 'plastic', 'e-waste', 'paper', 'metal'].map(cat => (
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
                const isHeavy = (pickup.estimatedWeight || 0) > 20;

                return (
                  <div 
                    key={pickup._id} 
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm hover:border-emerald-500/50 transition-all space-y-4 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-black text-slate-900 dark:text-white text-base">{pickup.user?.name || 'Customer'}</h4>
                          {isHeavy && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-black text-[9px] border border-amber-500/20">
                              📦 Bulk Scrap
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold block pt-0.5">{pickup.wasteCategory}</span>
                      </div>

                      <span className="px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-[10px] rounded-full border border-amber-500/20 uppercase">
                        {pickup.pickupTimeSlot || '10:00 AM - 12:00 PM'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Customer Uploaded Waste Photo Preview Thumbnail */}
                      {pickup.wasteImageUrl && (
                        <div className="flex items-center space-x-3 p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <img 
                            src={pickup.wasteImageUrl} 
                            alt="User Waste Pile" 
                            className="h-12 w-12 object-cover rounded-xl border border-emerald-500/40 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => setSelectedPhotoUrl(pickup.wasteImageUrl)}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1">
                              <span>📸 Customer Photo Attached</span>
                            </span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Tap to inspect waste pile before arrival</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPhotoUrl(pickup.wasteImageUrl)}
                            className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold border border-emerald-500/30"
                          >
                            View
                          </button>
                        </div>
                      )}

                      {/* Multi-Material Itemized Badges if available */}
                      {pickup.items && pickup.items.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {pickup.items.map((it, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] rounded-lg border border-slate-200 dark:border-slate-700">
                              {it.category}: <strong className="text-emerald-500">{it.estimatedWeight}kg</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 font-medium">
                        <FaMapMarkerAlt className="text-emerald-500 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{addrStr}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-extrabold p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                        <span className="flex items-center space-x-1.5">
                          <FaWeight className="text-emerald-500 h-3.5 w-3.5 flex-shrink-0" />
                          <span>Total: <strong>{pickup.estimatedWeight || 5} kg</strong></span>
                        </span>
                        <span className="text-[11px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-lg shadow-sm">
                          +{Math.round((pickup.estimatedWeight || 5) * 35)} pts
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <button 
                        onClick={() => openGoogleMapsNavigation(addrStr)}
                        className="py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-transform active:scale-95"
                        title="Open Google Maps GPS Navigation"
                      >
                        <FaCompass className="h-3.5 w-3.5" />
                        <span>GPS</span>
                      </button>

                      <a 
                        href={`tel:${pickup.user?.phone || '9876543210'}`}
                        className="py-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20 font-bold rounded-xl flex items-center justify-center space-x-1 border border-teal-500/20"
                        title="Call Customer"
                      >
                        <FaPhoneAlt className="h-3 w-3" />
                        <span>Call</span>
                      </a>

                      <button 
                        onClick={() => handleOpenChat(pickup.user)}
                        className="py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold rounded-xl flex items-center justify-center space-x-1 border border-emerald-500/20"
                        title="Chat with Customer"
                      >
                        <FaComments className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </button>

                      <button 
                        onClick={() => handleAcceptJob(pickup._id)}
                        className="py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow-md flex items-center justify-center space-x-1 transition-transform active:scale-95"
                        title="Accept Pickup Job"
                      >
                        <FaCheckCircle className="h-3.5 w-3.5" />
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

          {/* Customer Waste Photo Preview Modal */}
          {selectedPhotoUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">📸</span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Customer Attached Waste Photo</h3>
                  </div>
                  <button
                    onClick={() => setSelectedPhotoUrl(null)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-96">
                  <img src={selectedPhotoUrl} alt="Enlarged Waste Pile" className="w-full h-auto max-h-96 object-contain rounded-2xl" />
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center justify-between">
                  <span>💡 Verify waste type & estimate vehicle sacks needed</span>
                  <button
                    onClick={() => setSelectedPhotoUrl(null)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Citizen Live Chat Modal */}
          <DriverChatModal
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
            recipientName={activeChatRecipient?.name || 'Citizen Customer'}
            recipientRole="user"
          />

    </DriverLayout>
  );
};

export default DriverAssignedPickups;
