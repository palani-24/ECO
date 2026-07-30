import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FaQuestionCircle, FaComments, FaPhoneAlt, FaExclamationTriangle } from 'react-icons/fa';

const DriverSupport = () => {
  const faqs = [
    { q: 'How do I earn incentive bonuses?', a: 'Complete 10+ pickups daily during peak hours to unlock bonus rewards.' },
    { q: 'What to do if customer waste is contaminated?', a: 'Use the "Report Issue" button on the job screen and select "Contaminated Waste".' },
    { q: 'How to update vehicle insurance document?', a: 'Go to Documents section in the left sidebar menu.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Driver Helpdesk & Support Center</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Get instant help from live support agents, contact municipal dispatch, or view FAQs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="tel:1800123456" className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2 block">
              <FaPhoneAlt className="text-2xl text-emerald-500 mx-auto" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Call Toll-Free Support</h4>
              <span className="text-[10px] text-slate-400 font-bold block">1800-123-456 (24/7)</span>
            </a>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <FaComments className="text-2xl text-sky-500 mx-auto" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Live Dispatch Chat</h4>
              <span className="text-[10px] text-slate-400 font-bold block">Avg response: 2 mins</span>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl text-center space-y-2">
              <FaExclamationTriangle className="text-2xl text-rose-500 mx-auto" />
              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Report Road Hazard</h4>
              <span className="text-[10px] text-slate-400 font-bold block">Traffic / Vehicle Issue</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl space-y-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Frequently Asked Questions</h3>
            {faqs.map((faq, i) => (
              <div key={i} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1 text-xs">
                <p className="font-extrabold text-slate-900 dark:text-white">{faq.q}</p>
                <span className="text-slate-400 font-medium block">{faq.a}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DriverSupport;
