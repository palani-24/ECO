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
    { path: '/report-dump', label: 'Report Roadside Dump', icon: FaExclamationTriangle, badge: 'ALERT' },
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

  // Robust Active Link Checker handling query params and clean root routes
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;
    if (linkPath.includes('?')) {
      return (currentPath + location.search) === linkPath;
    }
    if (['/dashboard', '/driver', '/admin', '/municipality/dashboard'].includes(linkPath)) {
      return currentPath === linkPath;
    }
    return currentPath === linkPath || currentPath.startsWith(linkPath + '/');
  };

  const isDriver = user.role === 'driver';
  const isAdmin = user.role === 'admin';
  const isMunicipality = user.role === 'municipality';
  const isCustomer = !isDriver && !isAdmin && !isMunicipality;

  return (
    <>
      {/* Desktop Sidebar (Clean Glassmorphic Executive Navigation Panel) */}
      <aside className="w-full h-[calc(100vh-5.5rem)] rounded-3xl bg-white/75 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/80 dark:border-white/10 shadow-xl shadow-emerald-950/5 flex flex-col justify-between p-3.5 text-slate-800 dark:text-slate-100 transition-all select-none">
        
        {/* User Profile Quick Executive Glass Card */}
        <div className="shrink-0 p-3 bg-white/80 dark:bg-slate-800/60 backdrop-blur-md border border-white/90 dark:border-white/10 rounded-2xl flex flex-col gap-2 shadow-xs relative overflow-hidden group">
          <div className="flex items-center space-x-2.5 relative z-10">
            <div className="relative shrink-0">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-black flex items-center justify-center text-sm shadow-sm ring-2 ring-emerald-500/25 overflow-hidden">
                {user?.profileImage && !user.profileImage.includes('dicebear') ? (
                  <img 
                    src={getAvatarUrl(user, user?.name)} 
                    onError={(e) => handleAvatarError(e, user?.name)}
                    alt={user?.name || 'User'} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{(user?.name || (isDriver ? 'Driver' : 'User')).charAt(0).toUpperCase()}</span>
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-900 dark:text-white text-xs truncate leading-tight" title={user?.name}>
                {user?.name?.replace(/\s*\([^)]*\)/g, '') || (isDriver ? 'Palani Driver' : 'Palani')}
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1 pt-0.5">
                {isDriver ? <FaTruck className="h-2.5 w-2.5 shrink-0" /> : <FaLeaf className="h-2.5 w-2.5 shrink-0" />}
                <span className="capitalize">
                  {isDriver ? 'EV Fleet Pilot' : isAdmin ? 'System Admin' : isMunicipality ? 'Ward Officer' : 'Eco Guardian'}
                </span>
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg block border border-emerald-500/20 shadow-2xs">
                {isDriver ? '★ 4.9' : isAdmin ? 'ROOT' : isMunicipality ? 'GOV' : `${user.points || 2392} pts`}
              </span>
            </div>
          </div>

          {/* Mini Eco Level Tier Strip */}
          <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isDriver ? 'Tier 1 EV Pilot' : isAdmin ? 'Clearance Level 5' : isMunicipality ? 'Zone Commander' : 'Level 4 Citizen'}
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-extrabold text-[9px] bg-slate-100/80 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                {isDriver ? '98% On-Time' : isAdmin ? 'Online' : isMunicipality ? 'Ward 12' : '77% to Lvl 5'}
              </span>
            </div>
            <div className="w-full bg-slate-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                style={{ width: isDriver ? '92%' : '77%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* Middle Scrollable Section (Links + Mini Stats Card: Smoothly scrolls if window is small) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 my-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 px-3 block mb-1">
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
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-white/60 dark:hover:bg-slate-800/60 border border-transparent'
                  }`
                }
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`h-3.5 w-3.5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                    active 
                      ? 'bg-white/25 text-white' 
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Role-specific Mini Stats Card (Inside scrollable body, so it never pushes the logout button off!) */}
          {isDriver ? (
            <div className="mt-2 p-2.5 bg-gradient-to-br from-emerald-50/80 via-white/80 to-teal-50/50 dark:from-slate-800/60 dark:to-slate-800/30 border border-emerald-500/20 rounded-2xl shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-300">
                  <FaTruck className="h-3 w-3 text-emerald-600" />
                  <span>Fleet Telematics</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                  ONLINE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-center pt-0.5">
                <div className="bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                  <div className="text-xs font-black text-slate-900 dark:text-white">18 Done</div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Pickups Today</div>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">88% Batt</div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">EV Range 48km</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-2 p-2.5 bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-300">
                  <FaLeaf className="h-3 w-3 text-emerald-600" />
                  <span>Eco Impact</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-center pt-0.5">
                <div className="bg-slate-50/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                  <div className="text-xs font-black text-slate-900 dark:text-white">333.6 kg</div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Recycled</div>
                </div>
                <div className="bg-slate-50/80 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xs">
                  <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">500.4 kg</div>
                  <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400">CO₂ Saved</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom District AQI & Logout Button (ALWAYS pinned & visible at the bottom) */}
        <div className="shrink-0 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 space-y-1.5">
          <div className="flex items-center justify-between px-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
            <span className="flex items-center space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black">Live Eco Grid</span>
            </span>
            <span className="text-slate-400 dark:text-slate-500 font-medium">Net Positive</span>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-50/80 hover:bg-rose-100/90 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all border border-rose-200/80 dark:border-rose-900/40 cursor-pointer active:scale-98 shadow-xs"
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
