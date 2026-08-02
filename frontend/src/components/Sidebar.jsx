import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaHistory, FaGift, FaUser, FaBell, FaSignOutAlt, 
  FaClipboardList, FaChartLine, FaTruck, FaUsers, FaCogs, FaTicketAlt,
  FaCoins, FaTrophy, FaQuestionCircle, FaLeaf, FaClock, FaLock, FaComments, FaStore
} from 'react-icons/fa';
import { getAvatarUrl, handleAvatarError } from '../utils/avatar';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const customerLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/store', label: 'Eco-Store', icon: FaStore, badge: 'NEW' },
    { path: '/profile', label: 'My Profile', icon: FaUser },
    { path: '/redeem', label: 'Wallet & Points', icon: FaCoins },
    { path: '/schedule-pickup', label: 'Book a Pickup', icon: FaCalendarAlt },
    { path: '/my-pickups', label: 'My Pickups & History', icon: FaClipboardList },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
    { path: '/profile?tab=support', label: 'Help & Support', icon: FaQuestionCircle },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Dashboard', icon: FaChartLine },
    { path: '/driver/pickups', label: 'Assigned Pickups', icon: FaTruck },
    { path: '/driver/history', label: 'Pickup History', icon: FaHistory },
    { path: '/driver/earnings', label: 'Earnings & Incentives', icon: FaCoins },
    { path: '/driver/profile', label: 'Profile', icon: FaUser },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Dashboard Overview', icon: FaChartLine },
    { path: '/admin/users', label: 'Manage Users', icon: FaUsers },
    { path: '/admin/drivers', label: 'Manage Drivers', icon: FaTruck },
    { path: '/admin/pickups', label: 'Pickup Requests', icon: FaClipboardList },
    { path: '/admin/support', label: 'Support Desk', icon: FaComments, badge: '3' },
    { path: '/admin/coupons', label: 'Coupons Catalog', icon: FaTicketAlt },
    { path: '/admin/settings', label: 'System Settings', icon: FaCogs },
  ];

  const getLinks = () => {
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'driver') return driverLinks;
    return customerLinks;
  };

  const links = getLinks();

  // Strict Active Link Checker to prevent multiple items highlighting simultaneously
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    const fullCurrent = currentPath + currentSearch;

    if (linkPath.includes('?')) {
      return fullCurrent === linkPath;
    }

    if (currentSearch && currentSearch !== '?') {
      return false; // If query param is present, non-query link should not be highlighted
    }

    return currentPath === linkPath;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 md:min-h-[calc(100vh-4rem)] flex-col justify-between py-5 px-4 transition-colors duration-300">
        <div className="space-y-6">
          
          {/* User Profile Quick Card */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl flex items-center space-x-3 shadow-sm">
            <img 
              src={getAvatarUrl(user, user?.name)} 
              onError={(e) => handleAvatarError(e, user?.name)}
              alt={user?.name || 'User'} 
              className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs truncate flex items-center space-x-1">
                <span>{user?.name || 'Driver Console'}</span>
              </h4>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center space-x-1 pt-0.5">
                <FaLeaf className="h-2.5 w-2.5" />
                <span>Eco Warrior</span>
              </span>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-lg block border border-emerald-500/20">
                {user.points || 0} pts
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 px-3 block mb-2">
              Main Menu
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
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 ${
                      active
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 translate-x-1'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-black transition-all border border-rose-200/50 dark:border-rose-800/50"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex justify-around items-center shadow-lg">
        {links.slice(0, 5).map((link, idx) => {
          const Icon = link.icon;
          const active = isLinkActive(link.path);
          return (
            <NavLink
              key={idx}
              to={link.path}
              end={link.path.indexOf('?') === -1}
              className={
                `flex flex-col items-center space-y-1 p-2 rounded-xl transition-all ${
                  active ? 'text-emerald-500 font-extrabold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{link.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
