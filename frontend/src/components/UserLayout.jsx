import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileCitizenHeader from './MobileCitizenHeader';
import MobileCitizenNav from './MobileCitizenNav';

const UserLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="relative min-h-screen text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 🌄 Bright, Clear, Vibrant Ambient Eco Landscape Background */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/eco_city_skyline_banner.jpg')",
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.03) saturate(1.2)'
        }}
      />
      {/* Ultra light vignette overlay so cards pop while landscape stays vivid */}
      <div className="fixed inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/30 pointer-events-none z-0" />

      {/* 💻 Desktop Top Navbar */}
      <div className="relative z-20 hidden md:block">
        <Navbar />
      </div>

      {/* 📱 Mobile Unified Green App Header */}
      <div className="relative z-20 block md:hidden">
        <MobileCitizenHeader />
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row w-full px-3 sm:px-6 lg:px-8 py-3 md:py-6 gap-6 min-w-0">
        
        {/* 💻 Desktop Sidebar Navigation */}
        <div className="hidden md:block flex-shrink-0 sticky top-16 self-start w-72 xl:w-80">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6 pb-28 md:pb-20">
          {children}
        </main>
      </div>

      {/* 📱 Mobile Unified Bottom 4-Tab Navigation & Slide-Out Drawer */}
      <div className="block md:hidden">
        <MobileCitizenNav />
      </div>

    </div>
  );
};

export default UserLayout;
