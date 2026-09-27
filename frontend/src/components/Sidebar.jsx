import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaHistory, FaGift, FaUser, FaBell, FaSignOutAlt, 
  FaClipboardList, FaChartLine, FaTruck, FaUsers, FaCogs, FaTicketAlt,
  FaCoins, FaTrophy, FaQuestionCircle, FaLeaf, FaClock, FaLock, FaComments, 
  FaStore, FaBars, FaTimes, FaRecycle, FaEllipsisH, FaBuilding,
  FaMapPin, FaExclamationTriangle
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileDrawerOpen(false);
  }, [location.pathname, location.search]);

  // Global listener for navbar hamburger icon toggle
  useEffect(() => {
    const handleToggle = () => setIsMobileDrawerOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  const handleLogout = () => {
    setIsMobileDrawerOpen(false);
    logout();
    navigate('/');
  };

  if (!user) return null;

  const customerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/schedule-pickup', label: 'Book a Pickup', icon: FaCalendarAlt, badge: 'FAST' },
    { path: '/my-pickups', label: 'My Pickups & History', icon: FaClipboardList },
    { path: '/redeem', label: 'Wallet & Points', icon: FaCoins },
    { path: '/store', label: 'Eco-Store', icon: FaStore, badge: 'NEW' },
    { path: '/support', label: 'Helpdesk & Messages', icon: FaComments, badge: 'HELP' },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
    { path: '/esg-portal', label: 'ESG Portal', icon: FaBuilding, badge: 'PRO' },
    { path: '/profile', label: 'My Profile', icon: FaUser },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Dashboard', icon: FaChartLine },
    { path: '/driver/pickups', label: 'Assigned Pickups', icon: FaTruck },
    { path: '/driver/gate-pass', label: 'Hub Gate Pass', icon: FaTicketAlt, badge: 'QR' },
    { path: '/driver/battery-telematics', label: 'EV & Telematics', icon: FaLeaf },
    { path: '/driver/history', label: 'Pickup History', icon: FaHistory },
    { path: '/driver/earnings', label: 'Earnings & Incentives', icon: FaCoins },
    { path: '/driver/support', label: 'Dispatch & SOS Hub', icon: FaComments, badge: 'SOS' },
    { path: '/driver/profile', label: 'Profile', icon: FaUser },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard', icon: FaChartLine },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/drivers', label: 'Drivers', icon: FaTruck },
    { path: '/admin/pickups', label: 'Pickups', icon: FaClipboardList },
    { path: '/admin/support', label: 'Support Desk', icon: FaComments, badge: '3' },
    { path: '/admin/coupons', label: 'Coupons', icon: FaTicketAlt },
    { path: '/admin/settings', label: 'Settings', icon: FaCogs },
  ];

  const municipalityLinks = [
    { path: '/municipality/dashboard', label: 'Command Center', icon: FaChartLine },
    { path: '/municipality/heatmap', label: 'GIS Heatmap', icon: FaMapPin, badge: 'LIVE' },
    { path: '/municipality/grievances', label: 'Citizen Grievances', icon: FaExclamationTriangle, badge: 'ALERT' },
    { path: '/municipality/support', label: 'Command & Support Hub', icon: FaComments, badge: 'DESK' },
    { path: '/esg-portal', label: 'ESG Audit Portal', icon: FaBuilding, badge: 'ISO' },
    { path: '/leaderboard', label: 'Ward Leaderboard', icon: FaTrophy },
    { path: '/profile', label: 'Officer Profile', icon: FaUser },
  ];

  const getLinks = () => {
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'municipality') return municipalityLinks;
    if (user.role === 'driver') return driverLinks;
    return customerLinks;
  };

  const links = getLinks();

  // Primary 4 shortcuts for the Mobile Bottom Bar per role
  const getMobileBottomItems = () => {
    if (user.role === 'admin') {
      return [
        { path: '/admin', label: 'Overview', icon: FaChartLine },
        { path: '/admin/users', label: 'Users', icon: FaUsers },
        { path: '/admin/drivers', label: 'Drivers', icon: FaTruck },
        { path: '/admin/pickups', label: 'Pickups', icon: FaClipboardList },
      ];
    }
    if (user.role === 'municipality') {
      return [
        { path: '/municipality/dashboard', label: 'Command', icon: FaChartLine },
        { path: '/municipality/heatmap', label: 'Heatmap', icon: FaMapPin },
        { path: '/municipality/grievances', label: 'Grievance', icon: FaExclamationTriangle },
        { path: '/esg-portal', label: 'Audit', icon: FaBuilding },
      ];
    }
    if (user.role === 'driver') {
      return [
        { path: '/driver', label: 'Cockpit', icon: FaChartLine },
        { path: '/driver/pickups', label: 'Pickups', icon: FaTruck },
        { path: '/driver/gate-pass', label: 'Gate Pass', icon: FaTicketAlt },
        { path: '/driver/earnings', label: 'Earnings', icon: FaCoins },
      ];
    }
    // Default Customer
    return [
      { path: '/dashboard', label: 'Home', icon: FaChartLine },
      { path: '/schedule-pickup', label: 'Book Pickup', icon: FaCalendarAlt },
      { path: '/my-pickups', label: 'My Pickups', icon: FaClipboardList },
      { path: '/redeem', label: 'Wallet', icon: FaCoins },
    ];
  };

  const mobileBottomItems = getMobileBottomItems();

  // Strict Active Link Checker to prevent multiple items highlighting simultaneously
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullCurrent = currentPath + currentSearch;

    if (linkPath.includes('?')) {
      return fullCurrent === linkPath;
    }

    if (currentSearch && currentSearch !== '?') {
      return false;
    }

    return currentPath === linkPath;
  };

  return (
    <>
      {/* Desktop Sidebar (Pristine White Executive Eco Navigation Panel) */}
      <aside className="w-full h-[calc(100vh-6rem)] rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-col justify-between p-4 text-slate-800 transition-all overflow-hidden select-none">
        
        <div className="space-y-3.5 flex-1 flex flex-col min-h-0">
          
          {/* User Profile Quick Executive Card */}
          <div className="p-3 bg-slate-50/90 border border-slate-200/80 rounded-2xl flex flex-col gap-2.5 shadow-2xs relative overflow-hidden group">
            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative shrink-0">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-base shadow-sm ring-2 ring-emerald-500/25 overflow-hidden">
                  {user?.profileImage && !user.profileImage.includes('dicebear') ? (
                    <img 
                      src={getAvatarUrl(user, user?.name)} 
                      onError={(e) => handleAvatarError(e, user?.name)}
                      alt={user?.name || 'User'} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{(user?.name || 'Palani').charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white flex items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 text-xs truncate leading-tight" title={user?.name}>
                  {user?.name?.replace(/\s*\([^)]*\)/g, '') || user?.name || 'Palani'}
                </h4>
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center space-x-1 pt-0.5">
                  <FaLeaf className="h-2.5 w-2.5 shrink-0" />
                  <span className="capitalize">{user.role === 'customer' ? 'Eco Guardian' : `${user.role} Partner`}</span>
                </span>
              </div>

              <div className="text-right shrink-0">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl block border border-emerald-500/25 shadow-2xs">
                  {user.points || 0} pts
                </span>
              </div>
            </div>

            {/* Mini Eco Level Tier Strip */}
            <div className="pt-2 border-t border-slate-200/70 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Level 4 Citizen
                </span>
                <span className="text-slate-400 font-mono text-[9px] bg-slate-100 px-1.5 py-0.5 rounded">71% to Lvl 5</span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: '71%' }}></div>
              </div>
            </div>
          </div>

          {/* Navigation Links (Scrollable if viewport is small) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block mb-1">
              Portal Menu
            </span>
            {links.map((link, idx) => {
              const Icon = link.icon;
              const active = isLinkActive(link.path);
              return (
                <NavLink
                  key={idx}
                  to={link.path}
                  end={link.path.indexOf('?') === -1}
                  className={
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 scale-[1.01]'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                      active 
                        ? 'bg-white/25 text-white' 
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-500/25'
                    }`}>
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* Eco Contribution & Active Ward Stats Card to eliminate vertical gap */}
          <div className="p-3 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/50 border border-emerald-500/20 rounded-2xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 font-black text-emerald-900">
                <FaLeaf className="h-3 w-3 text-emerald-600" />
                <span>Eco Impact</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                Verified
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
              <div className="bg-white/90 p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs font-black text-slate-900">333.6 kg</div>
                <div className="text-[9px] font-bold text-slate-500">Recycled</div>
              </div>
              <div className="bg-white/90 p-2 rounded-xl border border-slate-200/60 shadow-2xs">
                <div className="text-xs font-black text-emerald-600">500.4 kg</div>
                <div className="text-[9px] font-bold text-slate-500">CO₂ Saved</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom District AQI & Logout Button */}
        <div className="pt-3 border-t border-slate-200/70 space-y-2 mt-auto">
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 font-bold">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-600 font-black">Live Eco Grid</span>
            </span>
            <span className="text-slate-400 font-medium">Net Positive</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-all border border-rose-200 cursor-pointer active:scale-98 shadow-2xs"
          >
            <FaSignOutAlt className="h-3.5 w-3.5" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Mobile Slide-Out Drawer Side Menu (Opens on Mobile with z-[100] and click-outside dismissal) */}
      {isMobileDrawerOpen && (
        <div 
          onClick={() => setIsMobileDrawerOpen(false)}
          className="md:hidden fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white border-r border-slate-200 p-5 space-y-4 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300 h-full text-slate-900"
          >
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <img 
                  src="/app-logo.png" 
                  alt="EcoReward Logo" 
                  className="h-8 w-8 rounded-xl object-contain ring-1 ring-emerald-500/30 shadow-sm" 
                />
                <div>
                  <span className="font-black text-slate-900 text-sm block leading-tight">
                    EcoReward
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold capitalize">
                    {user.role} Navigation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                aria-label="Close navigation menu"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile User Profile Quick Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center space-x-3 shadow-xs">
              <img 
                src={getAvatarUrl(user, user?.name)} 
                onError={(e) => handleAvatarError(e, user?.name)}
                alt={user?.name || 'User'} 
                className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-sm bg-white"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 text-xs truncate">
                  {user?.name || 'User Profile'}
                </h4>
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center space-x-1 pt-0.5">
                  <FaLeaf className="h-2.5 w-2.5" />
                  <span className="capitalize">{user.role} Member</span>
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-500/25 shrink-0">
                {user.points || 0} pts
              </span>
            </div>

            {/* Quick Action Shortcuts for Customers on Mobile */}
            {user.role !== 'driver' && user.role !== 'admin' && user.role !== 'municipality' && (
              <div className="grid grid-cols-2 gap-2">
                <NavLink
                  to="/schedule-pickup"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-500/30 text-emerald-700 flex items-center space-x-2 text-xs font-black hover:bg-emerald-100 transition"
                >
                  <FaCalendarAlt className="text-xs shrink-0" />
                  <span className="truncate">Book Pickup</span>
                </NavLink>
                <NavLink
                  to="/redeem"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2.5 rounded-xl bg-teal-50 border border-teal-500/30 text-teal-700 flex items-center space-x-2 text-xs font-black hover:bg-teal-100 transition"
                >
                  <FaCoins className="text-xs shrink-0" />
                  <span className="truncate">Redeem Cash</span>
                </NavLink>
              </div>
            )}

            {/* Full Scrollable Navigation Links List for Mobile */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 px-3 block mb-1">
                Portal Options
              </span>
              {links.map((link, idx) => {
                const Icon = link.icon;
                const active = isLinkActive(link.path);
                return (
                  <NavLink
                    key={idx}
                    to={link.path}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    end={link.path.indexOf('?') === -1}
                    className={
                      `flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all duration-200 ${
                        active
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'text-slate-700 hover:text-emerald-700 hover:bg-slate-100'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-xl ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                        active ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-500/25'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Mobile Footer Logout */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs border border-rose-200 cursor-pointer active:scale-98 transition"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span>Logout Account</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Bottom Bar with Menu Toggle */}
      <nav 
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-1.5 py-1.5 flex justify-around items-center shadow-lg pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
      >
        {mobileBottomItems.map((link, idx) => {
          const Icon = link.icon;
          const active = isLinkActive(link.path);
          return (
            <NavLink
              key={idx}
              to={link.path}
              end={link.path.indexOf('?') === -1}
              className={
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
                  active 
                    ? 'text-emerald-600 dark:text-emerald-400 font-black' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold'
                }`
              }
            >
              <div className={`p-1 rounded-lg ${active ? 'bg-emerald-500/15' : ''}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{link.label}</span>
            </NavLink>
          );
        })}

        {/* 5th Button: Open Full Slide-Out Drawer with All Options */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all active:scale-95 ${
            isMobileDrawerOpen
              ? 'text-emerald-600 dark:text-emerald-400 font-black'
              : 'text-slate-600 dark:text-slate-300 font-black'
          }`}
          aria-label="Open Full Navigation Drawer"
        >
          <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FaBars className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">All Menu</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
