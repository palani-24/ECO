import React from 'react';
import DriverLayout from '../../components/DriverLayout';
import { FaComments, FaPhoneAlt, FaExclamationTriangle, FaHeadset, FaShieldAlt } from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/mobileNative';

const DriverSupport = () => {
  const { addToast } = useToast();
  const faqs = [
    { q: 'How do I earn daily incentive bonuses?', a: 'Complete 10+ pickups daily during peak surge hours to unlock the ₹250 captain bonus.' },
    { q: 'What should I do if customer scrap is contaminated or wet?', a: 'Reject the contaminated portion using the "Quality Check" section in your Cockpit and notify dispatch.' },
    { q: 'Where do I find my nearest battery swap station?', a: 'Use the Telematics section in your bottom navigation or drawer to reserve a 3-min battery swap.' },
    { q: 'How do I generate an unloading Gate Pass at the municipal yard?', a: 'Tap "Gate Pass" in your Cockpit or Drawer menu to get your official QR manifest for weighbridge check-in.' }
  ];

  const handleSOS = () => {
    triggerHaptic(50);
    addToast('🚨 24/7 SOS Dispatch Alert Broadcasted! Hub team is monitoring your location.', 'warning', 'Emergency SOS Activated');
  };

  return (
    <DriverLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
              <FaHeadset className="text-emerald-500" />
              <span>Driver Helpdesk & Dispatch SOS</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get instant assistance from live MRF dispatch officers, EV roadside breakdown team, or view operational FAQs.</p>
          </div>

          <button
            onClick={handleSOS}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <FaShieldAlt className="animate-pulse" />
            <span>24/7 Emergency SOS Hotline</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="tel:1800123456" className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-2 block shadow-sm hover:border-emerald-500/50 transition-all">
            <FaPhoneAlt className="text-2xl text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Toll-Free Dispatch Support</h4>
            <span className="text-[10px] text-slate-500 font-bold block">1800-123-456 (24/7 Help)</span>
          </a>

          <div 
            onClick={() => {
              triggerHaptic(20);
              window.dispatchEvent(new CustomEvent('open-support-chat'));
            }}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-2 cursor-pointer shadow-sm hover:border-teal-500/50 transition-all"
          >
            <FaComments className="text-2xl text-teal-500 mx-auto" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Live Dispatch Chat</h4>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold block">Avg response: &lt; 2 mins</span>
          </div>

          <div 
            onClick={handleSOS}
            className="p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-center space-y-2 cursor-pointer shadow-sm hover:border-rose-500/50 transition-all"
          >
            <FaExclamationTriangle className="text-2xl text-rose-500 mx-auto" />
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">EV Breakdown & Puncture</h4>
            <span className="text-[10px] text-rose-500 font-bold block">Roadside Mobile Van</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Frequently Asked Questions & Protocols</h3>
          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-1 text-xs">
                <p className="font-extrabold text-slate-900 dark:text-white">{faq.q}</p>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">{faq.a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
};

export default DriverSupport;
