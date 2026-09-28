import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileAdminHeader from './MobileAdminHeader';
import MobileAdminNav from './MobileAdminNav';

const AdminLayout = ({ children, hideFooter = false, title = 'Admin Console' }) => {
  return (
    <div className="relative min-h-screen bg-slate-50/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* 🌄 Scenic Mountain Vector Landscape Artwork (Matching First Image) */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/images/mountain_vector_auth_bg.jpg')",
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.02) saturate(1.08)'
        }}
      />
      {/* Atmospheric Soft Lighting Overlay so cards and text remain crystal clear */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/15 via-white/10 to-slate-950/15 pointer-events-none z-0" />

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
