import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const DriverLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6 min-w-0">
        <Sidebar />

        <main className="flex-1 min-w-0 space-y-6 pb-24 md:pb-6">
          {children}
        </main>
      </div>

      {!hideFooter && <Footer />}
    </div>
  );
};

export default DriverLayout;
