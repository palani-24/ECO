import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaExchangeAlt, FaUserCheck } from 'react-icons/fa';

const DriverShifts = () => {
  const { addToast } = useToast();

  const [selectedShift, setSelectedShift] = useState('Morning (07:00 AM - 03:00 PM)');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const [roster, setRoster] = useState([
    { day: 'Monday', shift: 'Morning Shift (7AM - 3PM)', status: 'Assigned', zone: 'Anna Nagar' },
    { day: 'Tuesday', shift: 'Morning Shift (7AM - 3PM)', status: 'Assigned', zone: 'Adyar' },
    { day: 'Wednesday', shift: 'Morning Shift (7AM - 3PM)', status: 'Assigned', zone: 'Velachery' },
    { day: 'Thursday', shift: 'Afternoon Shift (3PM - 11PM)', status: 'Assigned', zone: 'T. Nagar' },
    { day: 'Friday', shift: 'Morning Shift (7AM - 3PM)', status: 'Assigned', zone: 'Guindy' },
    { day: 'Saturday', shift: 'Weekly Off', status: 'Off-Day', zone: '--' },
    { day: 'Sunday', shift: 'Overtime Shift (+1.5x Pay)', status: 'Confirmed', zone: 'Central' },
  ]);

  const handleRequestLeave = (e) => {
    e.preventDefault();
    addToast('📅 Leave Request Submitted to Admin Dispatcher!', 'info', 'Leave Pending');
    setLeaveDate('');
    setLeaveReason('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-sky-500/10 text-sky-500 rounded-2xl border border-sky-500/20">
              <FaCalendarAlt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Shift Roster & Leave Manager</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">View weekly collection roster, request shift swaps with drivers, and submit leave requests.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Roster Calendar List */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Weekly Work Roster Schedule
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roster.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900 dark:text-white">{item.day}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        item.status === 'Off-Day' ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                      <FaClock className="text-sky-500" />
                      <span>{item.shift}</span>
                    </p>

                    <p className="text-[10px] text-slate-400 font-bold">Assigned Zone: {item.zone}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave Request Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Request Leave / Day-Off
              </h3>

              <form onSubmit={handleRequestLeave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Requested Leave Date</label>
                  <input
                    type="date"
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Leave</label>
                  <textarea
                    rows="3"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    required
                    placeholder="Enter reason for day off..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Submit Leave Request
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverShifts;
