import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileAdminHeader from './MobileAdminHeader';
import MobileAdminNav from './MobileAdminNav';
import { getPageBackground } from '../utils/pageBackgrounds';

const AdminLayout = ({ children, hideFooter = false, title = 'Admin Console', bgImage }) => {
  const location = useLocation();
  const bg = getPageBackground(location.pathname, bgImage);

  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 🌄 Unique Per-Page High-Res Landscape Artwork */}
      <div 
        key={bg.image}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 transition-all duration-700 ease-in-out"
        style={{
          backgroundImage: `url('${bg.image}')`,
          backgroundAttachment: 'fixed',
          filter: bg.blur || 'brightness(1.02) saturate(1.05)'
        }}
      />
      {/* 🔮 Ethereal Per-Page Ambient Glow Orbs */}
      <div className={`fixed top-[-10%] left-[15%] w-[500px] h-[500px] rounded-full ${bg.orbs?.c1 || 'bg-emerald-400/15 dark:bg-emerald-500/10'} blur-[120px] pointer-events-none z-0 transition-colors duration-700`} />
      <div className={`fixed top-[40%] right-[10%] w-[450px] h-[450px] rounded-full ${bg.orbs?.c2 || 'bg-teal-400/15 dark:bg-teal-500/10'} blur-[130px] pointer-events-none z-0 transition-colors duration-700`} />
      <div className={`fixed bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full ${bg.orbs?.c3 || 'bg-sky-400/10 dark:bg-emerald-600/10'} blur-[140px] pointer-events-none z-0 transition-colors duration-700`} />
      
      {/* Atmospheric Soft Lighting Overlay so cards and text remain crystal clear */}
      <div className={`fixed inset-0 ${bg.overlay || 'bg-gradient-to-b from-white/20 via-transparent to-slate-900/10 dark:to-slate-950/40'} pointer-events-none z-0 transition-all duration-700`} />

      {/* 💻 Desktop Top Navbar (Fixed / Sticky at Top - Does Not Move on Scroll) */}
      <div className="sticky top-0 z-50 hidden md:block">
        <Navbar />
      </div>

      {/* 📱 Mobile Admin Cyber Header (Fixed / Sticky at Top - Does Not Move on Scroll) */}
      <div className="sticky top-0 z-50 block md:hidden">
        <MobileAdminHeader title={title} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row w-full px-3 sm:px-6 lg:px-8 py-4 md:py-6 gap-6 min-w-0">
        
        {/* 💻 Desktop Sidebar Navigation */}
        <div className="hidden md:block flex-shrink-0 sticky top-16 self-start w-72 xl:w-80">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6 pb-28 md:pb-6">
          {children}
        </main>
      </div>

      {/* 📱 Mobile Admin Bottom 4-Tab Navigation & Slide-Out Drawer */}
      <div className="block md:hidden">
        <MobileAdminNav />
      </div>

    </div>
  );
};

export default AdminLayout;
