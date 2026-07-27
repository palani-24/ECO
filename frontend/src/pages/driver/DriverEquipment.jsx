import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../context/ToastContext';
import { FaShieldAlt, FaCheckCircle, FaWrench, FaBoxOpen, FaTruck } from 'react-icons/fa';

const DriverEquipment = () => {
  const { addToast } = useToast();

  const [requestedItem, setRequestedItem] = useState('Heavy Duty Rubber Safety Gloves');
  const [reason, setReason] = useState('Replacement due to wear and tear');

  const [inventory, setInventory] = useState([
    { id: 1, item: 'Heavy-Duty Cut-Resistant Gloves', tag: 'EQ-GLV-049', status: 'Assigned', condition: 'Good' },
    { id: 2, item: 'Bluetooth Smart Weighing Scale (50kg)', tag: 'EQ-SCL-882', status: 'Assigned', condition: 'Calibrated' },
    { id: 3, item: 'High-Vis Safety Reflective Jacket', tag: 'EQ-JKT-102', status: 'Assigned', condition: 'Good' },
    { id: 4, item: 'Reusable Hazardous Waste Sorting Bags', tag: 'EQ-BAG-554', status: 'Assigned', condition: 'Good' },
  ]);

  const handleRequestEquipment = (e) => {
    e.preventDefault();
    addToast('📦 Equipment Replacement Requisition Submitted to Admin!', 'success', 'Request Sent');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 pb-24 md:pb-8 space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
              <FaShieldAlt className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Safety Equipment & Wearable Locker</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Digital inventory of assigned driver gear, weighing scales, and replacement requisition.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Inventory Locker Grid */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Assigned Gear & Tools Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventory.map(item => (
                  <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.tag}</span>
                      <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/20">
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{item.item}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Condition: {item.condition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Replacement Requisition Form */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                Request Replacement Equipment
              </h3>

              <form onSubmit={handleRequestEquipment} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Item Needed</label>
                  <select
                    value={requestedItem}
                    onChange={(e) => setRequestedItem(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="Heavy Duty Rubber Safety Gloves">Heavy Duty Rubber Safety Gloves</option>
                    <option value="Bluetooth Smart Weighing Scale (50kg)">Bluetooth Smart Weighing Scale (50kg)</option>
                    <option value="High-Vis Safety Reflective Vest">High-Vis Safety Reflective Vest</option>
                    <option value="Heavy Hazardous Bag Roll">Heavy Hazardous Bag Roll</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason for Request</label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
                >
                  Submit Gear Requisition
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverEquipment;
