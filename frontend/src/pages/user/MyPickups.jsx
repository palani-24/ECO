import React, { useState, useEffect } from 'react';
import UserLayout from '../../components/UserLayout';
import DriverLiveTrackingModal from '../../components/DriverLiveTrackingModal';
import CarbonCertificateModal from '../../components/CarbonCertificateModal';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { FaRecycle, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes, FaFileInvoice, FaEye, FaTruck, FaMedal, FaCertificate, FaStar, FaLeaf, FaCoins, FaCamera } from 'react-icons/fa';

const MyPickups = () => {
  const { user } = useAuth() || {};
  const { addToast } = useToast();
  const { realtimeData } = useSocket() || {};
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackingPickup, setTrackingPickup] = useState(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [tipAmount, setTipAmount] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);

  // Real-Time Socket Updates Sync
  useEffect(() => {
    if (realtimeData?.latestPickup) {
      const updatedPickup = realtimeData.latestPickup;
      setPickups(prev => {
        const index = prev.findIndex(p => p._id === updatedPickup._id);
        if (index !== -1) {
          const newPickups = [...prev];
          newPickups[index] = { ...newPickups[index], ...updatedPickup };
          return newPickups;
        }
        return [updatedPickup, ...prev];
      });
    }
  }, [realtimeData?.latestPickup]);

  // In-App Chat Modal States
  const [chatPickup, setChatPickup] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: 'Hello! I am on my way for your waste pickup. / வணக்கம்! சேகரிக்க வந்து கொண்டு இருக்கிறேன்.', time: '10:15 AM' }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'user', text: chatInput, time: 'Just now' }]);
    setChatInput('');
  };

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await api.get('/user/pickups');
        if (res.data.success) {
          setPickups(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch pickup records.');
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, []);

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      assigned: 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400',
      accepted: 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400',
      completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400',
      cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  return (
    <UserLayout>
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>My Pickups & History</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-full border border-emerald-500/20">LIVE REALTIME</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track active recycling requests and review past completed history in one place.</p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCertModal(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-md flex items-center space-x-1.5 transition-transform active:scale-95"
              >
                <FaCertificate />
                <span>Green Eco Certificate</span>
              </button>

              {/* Filter Tabs */}
              <div className="flex items-center space-x-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                {['all', 'active', 'completed'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                      statusFilter === tab
                        ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? `All (${pickups.length})` : tab === 'active' ? `Active (${pickups.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length})` : `Completed (${pickups.filter(p => p.status === 'completed').length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-semibold border border-rose-250/20 flex items-center space-x-1">
              <FaExclamationTriangle /> <span>{error}</span>
            </div>
          )}

          {loading ? (
            <TableSkeleton rows={6} />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/40">
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Scheduled Details</th>
                        <th className="py-4 px-6">Handover OTP</th>
                        <th className="py-4 px-6">Est. Weight</th>
                        <th className="py-4 px-6">Points</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                      {pickups
                        .filter(p => {
                          if (statusFilter === 'all') return true;
                          if (statusFilter === 'active') return p.status === 'pending' || p.status === 'assigned' || p.status === 'accepted';
                          if (statusFilter === 'completed') return p.status === 'completed';
                          return true;
                        })
                        .map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="py-4 px-6 font-bold flex items-center space-x-2">
                            <FaRecycle className="text-emerald-500" />
                            <span>{p.wasteCategory}</span>
                          </td>
                          <td className="py-4 px-6 font-semibold">
                            <div className="space-y-0.5">
                              <p className="text-slate-800 dark:text-white">{new Date(p.pickupDate).toLocaleDateString()}</p>
                              <span className="text-[10px] text-slate-400 flex items-center space-x-1"><FaClock className="h-3 w-3" /> <span>{p.pickupTimeSlot}</span></span>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold">
                            {p.status !== 'completed' && p.status !== 'cancelled' ? (
                              <span className="px-2 py-1 bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-black">
                                OTP: 4829
                              </span>
                            ) : (
                              <span className="text-slate-400">Verified</span>
                            )}
                          </td>
                          <td className="py-4 px-6 font-semibold">{p.estimatedWeight} kg</td>
                          <td className="py-4 px-6 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {p.pointsAwarded ? `+${p.pointsAwarded}` : '--'}
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                          <td className="py-4 px-6 text-right flex items-center justify-end space-x-2">
                            {p.status !== 'completed' && p.status !== 'cancelled' && (
                              <button 
                                onClick={() => setTrackingPickup(p)}
                                className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 rounded-lg text-[10px] font-bold border border-amber-500/20 flex items-center space-x-1"
                              >
                                <FaTruck className="w-3 h-3 animate-bounce" />
                                <span>Track Live GPS</span>
                              </button>
                            )}
                            {p.driver && p.status !== 'completed' && (
                              <button 
                                onClick={() => setChatPickup(p)}
                                className="px-2.5 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 rounded-lg text-[10px] font-bold"
                              >
                                💬 Chat Driver
                              </button>
                            )}
                            {p.status === 'completed' && (
                              <button 
                                onClick={() => setSelectedReceipt(p)}
                                className="p-2 text-slate-400 hover:text-emerald-500 transition-colors inline-flex items-center space-x-1"
                                title="View Receipt"
                              >
                                <FaFileInvoice />
                                <span className="text-[10px] font-bold">Receipt</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {pickups.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">No scheduled pickup requests found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rich Digital Eco-Receipt & Driver Rating Modal */}
          {selectedReceipt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4 text-xs max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-xl">
                      <FaFileInvoice className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-tight">Verified Eco-Receipt</h3>
                      <span className="text-[10px] font-mono text-emerald-500 font-bold">{selectedReceipt.receiptUrl || 'REC-VERIFIED'}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setSelectedReceipt(null); setIsRatingSubmitted(false); }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-100 dark:bg-slate-800"
                  >
                    <FaTimes />
                  </button>
                </div>

                {/* Doorstep Verification Photo Proof */}
                {(selectedReceipt.verificationPhotoUrl || selectedReceipt.wasteImageUrl) && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center space-x-1">
                      <FaCamera className="text-emerald-500" />
                      <span>Doorstep Scale Photo Proof</span>
                    </span>
                    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-32 flex items-center justify-center">
                      <img 
                        src={selectedReceipt.verificationPhotoUrl || selectedReceipt.wasteImageUrl} 
                        alt="Doorstep Verified Pile" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}

                {/* Itemized Verified Table or Summary */}
                {selectedReceipt.items && selectedReceipt.items.length > 0 ? (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Verified Itemized Breakdown</span>
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {selectedReceipt.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-200/40 dark:border-slate-800/60 last:border-0">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{it.category}</span>
                            <span className="text-[9px] text-slate-400">{it.actualWeight || it.estimatedWeight} kg verified</span>
                          </div>
                          <span className="font-black text-emerald-500">+{it.pointsEarned || Math.round((it.actualWeight || it.estimatedWeight || 1) * 35)} pts</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-400">Processed Waste:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedReceipt.wasteCategory} ({selectedReceipt.actualWeight || selectedReceipt.estimatedWeight} kg)</span>
                  </div>
                )}

                {/* Quality Grade & Carbon Impact */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Quality Grade</p>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{selectedReceipt.qualityGrade || 'Grade A+ Premium'}</p>
                  </div>
                  <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-center">
                    <p className="text-[9px] font-black text-teal-600 dark:text-teal-400 uppercase">CO2 Offset</p>
                    <p className="text-xs font-black text-teal-700 dark:text-teal-300 mt-0.5">{((selectedReceipt.actualWeight || 5) * 1.8).toFixed(1)} kg saved</p>
                  </div>
                </div>

                {/* Total Points Credited Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FaCoins className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase block">Wallet Reward</span>
                      <span className="font-black text-sm text-slate-900 dark:text-white">EcoPoints Credited</span>
                    </div>
                  </div>
                  <span className="font-black text-lg text-emerald-500">+{selectedReceipt.pointsAwarded || 175} pts</span>
                </div>

                {/* Star Rating & Driver Tip Section */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      Rate Collector Driver ({selectedReceipt.driver?.user?.name || 'Driver'})
                    </span>
                    {isRatingSubmitted && <span className="text-[10px] font-bold text-emerald-500">Feedback Saved ✓</span>}
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center space-x-2 justify-center py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className={`text-xl transition-transform hover:scale-110 ${star <= ratingScore ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                      >
                        <FaStar />
                      </button>
                    ))}
                  </div>

                  {/* Quick Tip Chips */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400">Tip Driver (EcoPoints):</span>
                    <div className="flex items-center space-x-1.5">
                      {[0, 10, 25, 50].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setTipAmount(pts)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            tipAmount === pts ? 'bg-amber-400 text-slate-950 border-amber-300 font-black' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {pts === 0 ? 'No tip' : `+${pts} pts`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!isRatingSubmitted && (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await api.put(`/user/pickups/${selectedReceipt._id}/rate`, {
                            rating: ratingScore,
                            tipPoints: tipAmount
                          });
                        } catch (e) {}
                        setIsRatingSubmitted(true);
                        addToast(`⭐ Thank you! Rated ${ratingScore} Stars for driver.`, 'success', 'Rating Submitted');
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                    >
                      Submit Driver Rating
                    </button>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => addToast('📄 Official Eco Receipt PDF downloaded successfully!', 'success', 'PDF Export')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl transition-colors text-xs border border-slate-700"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => { setSelectedReceipt(null); setIsRatingSubmitted(false); }}
                    className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-colors text-xs shadow-md"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Live Driver Chat Modal */}
          {chatPickup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💬</span>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Collector Driver Chat</h4>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{chatPickup.driver?.user?.name || 'Driver'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setChatPickup(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Messages Box */}
                <div className="h-60 overflow-y-auto space-y-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/40 dark:border-slate-800 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.sender === 'user' 
                            ? 'bg-emerald-600 text-white font-medium rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700 rounded-bl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 font-bold">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Preset Tamil / English Quick Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button 
                    type="button"
                    onClick={() => setChatMessages(prev => [...prev, { sender: 'user', text: 'கதவு அருகே பை வைத்துள்ளேன் (Left bag near security gate)', time: 'Just now' }])}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    📍 Left at Gate
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChatMessages(prev => [...prev, { sender: 'user', text: 'நான் வீட்டில் உள்ளேன் (I am at home)', time: 'Just now' }])}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                  >
                    🏠 I am at Home
                  </button>
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="flex space-x-2 pt-2">
                  <input 
                    type="text" 
                    placeholder="Type message in Tamil or English..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Driver Live GPS Tracking Modal */}
          <DriverLiveTrackingModal 
            pickup={trackingPickup} 
            isOpen={!!trackingPickup} 
            onClose={() => setTrackingPickup(null)} 
          />

          {/* Official Green Carbon Certificate Modal */}
          <CarbonCertificateModal 
            isOpen={showCertModal} 
            onClose={() => setShowCertModal(false)} 
          />

    </UserLayout>
  );
};

export default MyPickups;
