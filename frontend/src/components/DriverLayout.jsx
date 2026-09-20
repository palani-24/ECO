import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileDriverHeader from './MobileDriverHeader';
import MobileDriverNav from './MobileDriverNav';

const DriverLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 💻 Desktop Top Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      {/* 📱 Mobile Driver Green App Header */}
      <div className="block md:hidden">
        <MobileDriverHeader />
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 gap-6 min-w-0">
        
        {/* 💻 Desktop Sidebar Navigation */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6 pb-28 md:pb-6">
          {children}
        </main>
      </div>

      {/* 📱 Mobile Driver Bottom 4-Tab Navigation & Slide-Out Drawer */}
      <div className="block md:hidden">
        <MobileDriverNav />
      </div>

      {/* 💻 Desktop Footer */}
      {!hideFooter && (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </div>
  );
};

export default DriverLayout;
