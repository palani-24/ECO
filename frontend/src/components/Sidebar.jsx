import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaCalendarAlt, FaHistory, FaGift, FaUser, FaBell, FaSignOutAlt, 
  FaClipboardList, FaChartLine, FaTruck, FaUsers, FaCogs, FaTicketAlt,
  FaQrcode, FaDollarSign, FaTrophy
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
    { path: '/profile', label: 'Profile Settings', icon: FaUser },
  ];

  const driverLinks = [
    { path: '/driver', label: 'Driver Dashboard', icon: FaChartLine },
    { path: '/driver/pickups', label: 'Assigned Pickups', icon: FaTruck },
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
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 md:min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 transition-colors duration-300">
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
  );
};

export default Sidebar;
