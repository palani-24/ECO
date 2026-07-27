import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaHistory, FaGift, FaUser, FaBell, FaSignOutAlt, 
  FaClipboardList, FaChartLine, FaTruck, FaUsers, FaCogs, FaTicketAlt,
  FaQrcode, FaDollarSign, FaTrophy, FaBolt, FaExclamationTriangle, FaShieldAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  const userLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: FaChartLine },
    { path: '/my-pickups', label: 'My Pickups', icon: FaHistory },
    { path: '/schedule-pickup', label: 'Schedule Pickup', icon: FaCalendarAlt },
    { path: '/redeem', label: 'Redeem Rewards', icon: FaGift },
    { path: '/leaderboard', label: 'Leaderboard', icon: FaTrophy },
    { path: '/challenges', label: 'Eco Challenges', icon: FaUsers },
    { path: '/profile', label: 'Profile Settings', icon: FaUser },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Driver Dashboard', icon: FaChartLine },
    { path: '/driver/pickups', label: 'Assigned Pickups', icon: FaTruck },
    { path: '/driver/gate-pass', label: 'Unloading Gate-Pass', icon: FaQrcode },
    { path: '/driver/quality-audit', label: 'Quality Audit Tool', icon: FaClipboardList },
    { path: '/driver/battery-telematics', label: 'EV Battery & Swaps', icon: FaBolt },
    { path: '/driver/road-hazards', label: 'Road Hazard Reporter', icon: FaExclamationTriangle },
    { path: '/driver/shifts', label: 'Shift Roster & Leaves', icon: FaCalendarAlt },
    { path: '/driver/equipment', label: 'Safety Gear Locker', icon: FaShieldAlt },
    { path: '/driver/earnings', label: 'Earnings & Profile', icon: FaDollarSign },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin Overview', icon: FaChartLine },
    { path: '/admin/users', label: 'Manage Users', icon: FaUsers },
    { path: '/admin/drivers', label: 'Manage Drivers', icon: FaTruck },
    { path: '/admin/pickups', label: 'Pickup Requests', icon: FaClipboardList },
    { path: '/admin/coupons', label: 'Coupons Catalog', icon: FaTicketAlt },
    { path: '/admin/settings', label: 'System Settings', icon: FaCogs },
  ];

  const getLinks = () => {
    if (user.role === 'admin') return adminLinks;
    if (user.role === 'driver') return driverLinks;
    return userLinks;
  };

  const links = getLinks();

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:min-h-[calc(100vh-4rem)] flex-col justify-between py-6 transition-colors duration-300">
        <div className="px-4 space-y-7">
          {/* User Card */}
          <div className="flex items-center space-x-3 pb-6 border-b border-slate-200 dark:border-slate-800">
            <img 
              src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`} 
              alt={user.name} 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div className="overflow-hidden">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate text-sm">{user.name}</h4>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role} Account</span>
            </div>
          </div>

          {/* Sidebar Nav */}
          <nav className="space-y-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/dashboard' || link.path === '/driver' || link.path === '/admin'}
                  className={({ isActive }) => 
                    `flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-4 mt-6">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-semibold text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <FaSignOutAlt className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Navigation (visible on mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-250/60 dark:border-slate-800/80 flex justify-around items-center py-2.5 px-2 shadow-lg shadow-black/10 transition-colors duration-300">
        {links.slice(0, 5).map((link) => { // limit to top 5 icons for neat space
          const Icon = link.icon;
          let label = link.label;
          if (label === 'Dashboard' || label === 'Driver Dashboard' || label === 'Admin Overview') label = 'Home';
          if (label === 'Schedule Pickup') label = 'Schedule';
          if (label === 'Redeem Rewards') label = 'Redeem';
          if (label === 'Profile Settings' || label === 'Earnings & Profile') label = 'Profile';
          if (label === 'My Pickups' || label === 'Assigned Pickups') label = 'Pickups';
          if (label === 'Leaderboard') label = 'Ranks';

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/dashboard' || link.path === '/driver' || link.path === '/admin'}
              className={({ isActive }) => 
                `flex flex-col items-center space-y-1 transition-all duration-200 ${
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400 font-extrabold scale-110' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              <Icon className="h-4.5 w-4.5" />
              <span className="text-[9px] font-bold tracking-tight">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};

export default Sidebar;
