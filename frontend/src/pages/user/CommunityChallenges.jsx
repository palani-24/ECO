import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { FaTrophy, FaUsers, FaClock, FaCheckCircle, FaRecycle, FaTree } from 'react-icons/fa';

const CommunityChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/user/challenges');
      if (res.data.success) {
        setChallenges(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (id, title) => {
    try {
      const res = await api.post(`/user/challenges/${id}/join`);
      if (res.data.success) {
        addToast(`Joined challenge "${title}" successfully!`, 'success', 'Challenge Joined');
        fetchChallenges();
      } else {
        addToast(res.data.message || 'Already joined.', 'info');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to join challenge.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          {/* Page Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-3xl p-6 md:p-8 text-white space-y-3 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <FaTrophy className="text-amber-300" />
              <span>Community Impact Hub</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">Neighborhood Eco-Challenges</h1>
            <p className="text-xs md:text-sm text-emerald-100 max-w-2xl">
              Team up with your local community to reach collective recycling targets and win bonus Eco-Points pools.
            </p>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((c) => {
              const progressPct = Math.min(100, Math.round((c.currentWeight / c.targetWeight) * 100));
              return (
                <div
                  key={c._id}
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all space-y-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{c.icon || '🌿'}</span>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{c.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.location}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20">
                      +{c.bonusPoints} Bonus Points
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    {c.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500 dark:text-slate-400">Progress Target</span>
                      <span className="text-emerald-600 dark:text-emerald-400">{c.currentWeight}kg / {c.targetWeight}kg ({progressPct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Footer Meta & Join Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1"><FaUsers className="text-emerald-500" /> <span>{c.participants?.length || 0} Joined</span></span>
                      <span className="flex items-center space-x-1"><FaClock className="text-amber-500" /> <span>14 Days Left</span></span>
                    </div>

                    <button
                      onClick={() => handleJoin(c._id, c.title)}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md"
                    >
                      Join Challenge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityChallenges;
