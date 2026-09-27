import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import api from '../../utils/api';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatar';
import { TableSkeleton } from '../../components/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { triggerHaptic } from '../../utils/mobileNative';
import { 
  FaUsers, FaCoins, FaSearch, FaCheckCircle, 
  FaUserShield, FaEnvelope, FaCalendarAlt, FaAward,
  FaEye, FaEyeSlash, FaEdit, FaTrash, FaPlus, FaTimes,
  FaPhone, FaMapMarkerAlt, FaTruck, FaIdBadge, FaBuilding,
  FaKey, FaCopy, FaCheck, FaSync, FaShieldAlt, FaFilter
} from 'react-icons/fa';

const ROLE_TABS = [
  { id: 'all', label: 'All Users', icon: FaUsers },
  { id: 'user', label: 'Citizens', icon: FaAward },
  { id: 'driver', label: 'Drivers', icon: FaTruck },
  { id: 'municipality', label: 'Municipality', icon: FaBuilding },
  { id: 'admin', label: 'Admins', icon: FaShieldAlt },
];

const INITIAL_FORM_STATE = {
  name: '',
  email: '',
  phone: '',
  password: '1234',
  role: 'user',
  points: 1000,
  ward: 'Ward 12 - Central Zone',
  department: 'Solid Waste Management',
  jurisdiction: 'Coimbatore Municipal Corporation',
  street: '14, Cross Cut Road, Gandhipuram',
  city: 'Coimbatore',
  state: 'Tamil Nadu',
  zipCode: '641012',
  vehicleNumber: '',
  vehicleType: 'Electric Auto-rickshaw (EV Tipper)',
  licenseNumber: '',
  driverStatus: 'active',
  isApproved: true
};

const AdminUsers = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (err) {
      console.warn('API error loading users, using fallback data', err);
      addToast('Could not reach backend API directly; please ensure backend is running', 'warning', 'API Warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePasswordReveal = (id) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyCredentials = (u) => {
    const credText = `Email: ${u.email} | Phone: ${u.phone || 'N/A'} | Password: ${u.accountPassword || '1234'} | Role: ${u.role}`;
    navigator.clipboard.writeText(credText);
    setCopiedId(u._id);
    addToast(`Credentials copied: ${u.email}`, 'info', 'Copied to Clipboard');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered users by role tab and search term
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // Role tab filter
      if (activeTab !== 'all' && u.role !== activeTab) {
        return false;
      }
      // Search term filter
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phone || '').toLowerCase();
      const ward = (u.ward || '').toLowerCase();
      const dept = (u.department || '').toLowerCase();
      const jur = (u.jurisdiction || '').toLowerCase();
      const veh = (u.vehicleNumber || '').toLowerCase();
      const street = (u.addresses?.[0]?.street || '').toLowerCase();
      const city = (u.addresses?.[0]?.city || '').toLowerCase();

      return name.includes(q) || email.includes(q) || phone.includes(q) || 
             ward.includes(q) || dept.includes(q) || jur.includes(q) || 
             veh.includes(q) || street.includes(q) || city.includes(q);
    });
  }, [users, activeTab, searchTerm]);

  // Metric counts
  const stats = useMemo(() => {
    const total = users.length;
    const citizens = users.filter(u => u.role === 'user').length;
    const drivers = users.filter(u => u.role === 'driver').length;
    const municipality = users.filter(u => u.role === 'municipality').length;
    const admins = users.filter(u => u.role === 'admin').length;
    const totalPoints = users.reduce((acc, u) => acc + (u.points || 0), 0);
    return { total, citizens, drivers, municipality, admins, totalPoints };
  }, [users]);

  // Handle Add User Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast('Name and Email are required', 'error', 'Validation Error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post('/admin/users', formData);
      if (res.data.success) {
        addToast(`User ${formData.name} added successfully!`, 'success', 'User Created');
        setShowAddModal(false);
        setFormData(INITIAL_FORM_STATE);
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addToast(`Failed to add user: ${msg}`, 'error', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (u) => {
    setEditUser(u);
    const addr = u.addresses?.[0] || {};
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      password: u.accountPassword || '',
      role: u.role || 'user',
      points: u.points !== undefined ? u.points : 0,
      ward: u.ward || 'Ward 12 - Central Zone',
      department: u.department || 'Solid Waste Management',
      jurisdiction: u.jurisdiction || 'Coimbatore Municipal Corporation',
      street: addr.street || '',
      city: addr.city || 'Coimbatore',
      state: addr.state || 'Tamil Nadu',
      zipCode: addr.zipCode || '641012',
      vehicleNumber: u.vehicleNumber || '',
      vehicleType: u.vehicleType || 'Electric Auto-rickshaw (EV Tipper)',
      licenseNumber: u.licenseNumber || '',
      driverStatus: u.driverStatus || 'active',
      isApproved: u.isApproved !== undefined ? u.isApproved : true
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/users/${editUser._id}`, formData);
      if (res.data.success) {
        addToast(`User ${formData.name} details updated!`, 'success', 'Updated Successfully');
        setEditUser(null);
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addToast(`Failed to update user: ${msg}`, 'error', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      setActionLoading(true);
      const res = await api.delete(`/admin/users/${deleteConfirmUser._id}`);
      if (res.data.success) {
        addToast(`User ${deleteConfirmUser.name} deleted successfully`, 'success', 'User Deleted');
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      addToast(`Failed to delete user: ${msg}`, 'error', 'Error');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">Admin HQ</span>;
      case 'driver':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">Fleet Driver</span>;
      case 'municipality':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">Municipality</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">Citizen</span>;
    }
  };

  return (
    <AdminLayout title="User Management & Details Directory">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Top Executive Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/30 p-6 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-black border border-emerald-400/30 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>AUTHENTICATED USER DATABASE & CREDENTIALS DIRECTORY</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center space-x-3">
              <FaUsers className="text-emerald-400 text-2xl" />
              <span>All User Accounts & Master Details</span>
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Complete administrative access to verify all citizen households, EV logistics drivers, municipal officers, and admin accounts. Inspect full residential addresses, wards, phone numbers, vehicle records, and instant login credentials.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
            <button
              onClick={() => {
                setFormData(INITIAL_FORM_STATE);
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <FaPlus />
              <span>Add New User</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic(20);
                fetchUsers();
                addToast('Refreshing user records from database...', 'info', 'Sync');
              }}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center space-x-2 border border-slate-700 transition"
              title="Refresh database"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white block">{stats.total}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm text-center">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">{stats.citizens}</span>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-bold uppercase tracking-wider">Citizens</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-500/20 dark:border-teal-500/20 shadow-sm text-center">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400 block">{stats.drivers}</span>
            <span className="text-[10px] text-teal-600/80 dark:text-teal-400/80 font-bold uppercase tracking-wider">EV Drivers</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-cyan-500/20 dark:border-cyan-500/20 shadow-sm text-center">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 block">{stats.municipality}</span>
            <span className="text-[10px] text-cyan-600/80 dark:text-cyan-400/80 font-bold uppercase tracking-wider">Municipality</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-amber-500/20 dark:border-amber-500/20 shadow-sm text-center">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block">{stats.admins}</span>
            <span className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-bold uppercase tracking-wider">Admins</span>
          </div>
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm text-center">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">{stats.totalPoints.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total EcoPoints</span>
          </div>
        </div>

        {/* Role Tabs & Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          
          {/* Role Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            {ROLE_TABS.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tab.id === 'all' ? stats.total : 
                            tab.id === 'user' ? stats.citizens : 
                            tab.id === 'driver' ? stats.drivers : 
                            tab.id === 'municipality' ? stats.municipality : stats.admins;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic(15);
                    setActiveTab(tab.id);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center space-x-2 transition ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-102' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <TabIcon className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name, email, phone, ward, vehicle, city..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-xs font-bold text-slate-400">
              Showing <span className="text-emerald-500 font-black">{filteredUsers.length}</span> of {users.length} accounts
            </div>
          </div>
        </div>

        {/* Master Users Table */}
        {loading ? (
          <TableSkeleton rows={7} />
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-slate-950/50">
                    <th className="py-4 px-6">User & Role</th>
                    <th className="py-4 px-6">Contact & Phone</th>
                    <th className="py-4 px-6">Login Password</th>
                    <th className="py-4 px-6">Ward & Jurisdiction</th>
                    <th className="py-4 px-6">Full Address</th>
                    <th className="py-4 px-6">Role Details / Points</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs text-slate-700 dark:text-slate-300">
                  {filteredUsers.map((u) => {
                    const addr = u.addresses?.[0] || {};
                    const isPwdVisible = !!revealedPasswords[u._id];
                    const rawPwd = u.accountPassword || '1234';

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition">
                        
                        {/* User & Role */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <img 
                              src={getAvatarUrl(u.profileImage, u.name)} 
                              onError={(e) => handleAvatarError(e, u.name)}
                              alt={u.name} 
                              className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0"
                            />
                            <div>
                              <div className="text-slate-900 dark:text-white font-black text-sm">{u.name}</div>
                              <div className="mt-1 flex items-center space-x-2">
                                {getRoleBadge(u.role)}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact & Phone */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                              <FaEnvelope className="text-[10px] text-slate-400" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                            </div>
                            <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1.5">
                              <FaPhone className="text-[9px]" />
                              <span>{u.phone || 'No phone set'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Login Password & Copy */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                            <FaKey className="text-amber-500 text-[10px]" />
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              {isPwdVisible ? rawPwd : '••••••••'}
                            </span>
                            <button
                              onClick={() => togglePasswordReveal(u._id)}
                              className="text-slate-400 hover:text-slate-200 p-0.5 transition"
                              title={isPwdVisible ? "Hide password" : "Show password"}
                            >
                              {isPwdVisible ? <FaEyeSlash className="text-[11px]" /> : <FaEye className="text-[11px]" />}
                            </button>
                            <button
                              onClick={() => copyCredentials(u)}
                              className="text-slate-400 hover:text-emerald-400 p-0.5 transition"
                              title="Copy login credentials"
                            >
                              {copiedId === u._id ? <FaCheck className="text-[10px] text-emerald-400" /> : <FaCopy className="text-[11px]" />}
                            </button>
                          </div>
                        </td>

                        {/* Ward & Jurisdiction */}
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1">
                              <FaMapMarkerAlt className="text-red-500 text-[10px] shrink-0" />
                              <span className="truncate max-w-[180px]">{u.ward || 'Central Zone'}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {u.jurisdiction || 'Municipal Corporation'}
                            </div>
                          </div>
                        </td>

                        {/* Full Address */}
                        <td className="py-4 px-6">
                          {addr.street ? (
                            <div className="text-[11px] leading-tight max-w-[200px] text-slate-600 dark:text-slate-300">
                              <span className="font-bold block">{addr.street}</span>
                              <span className="text-[10px] text-slate-400">{addr.city}, {addr.state} - {addr.zipCode}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No street registered</span>
                          )}
                        </td>

                        {/* Role Details / Points / Vehicle */}
                        <td className="py-4 px-6">
                          {u.role === 'driver' ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1 font-mono font-bold text-teal-600 dark:text-teal-400 text-[11px]">
                                <FaTruck className="text-[10px]" />
                                <span>{u.vehicleNumber || 'Pending Vehicle'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                {u.vehicleType || 'EV Tipper'}
                              </div>
                            </div>
                          ) : u.role === 'user' ? (
                            <div className="flex items-center space-x-1 font-bold text-emerald-600 dark:text-emerald-400">
                              <FaCoins className="text-amber-500 text-xs" />
                              <span className="font-mono">{(u.points || 0).toLocaleString()} pts</span>
                            </div>
                          ) : (
                            <div className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 truncate max-w-[160px]">
                              {u.department || 'Administration'}
                            </div>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setViewUser(u)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500 hover:text-slate-950 transition"
                              title="View All Details"
                            >
                              <FaEye className="text-xs" />
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-500 hover:text-white transition"
                              title="Edit User Details"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmUser(u)}
                              disabled={u.email === 'admin@ecoreward.com'}
                              className={`p-2 rounded-xl transition ${
                                u.email === 'admin@ecoreward.com' 
                                  ? 'opacity-30 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400' 
                                  : 'bg-slate-100 dark:bg-slate-800 text-red-500 hover:bg-red-500 hover:text-white'
                              }`}
                              title={u.email === 'admin@ecoreward.com' ? "Cannot delete primary admin" : "Delete User"}
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-slate-400 text-xs font-bold">
                        No user accounts found matching your selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* VIEW ALL DETAILS MODAL                                      */}
        {/* ========================================================== */}
        {viewUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center space-x-4">
                  <img 
                    src={getAvatarUrl(viewUser.profileImage, viewUser.name)} 
                    onError={(e) => handleAvatarError(e, viewUser.name)}
                    alt={viewUser.name} 
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-500/30"
                  />
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                      <span>{viewUser.name}</span>
                    </h2>
                    <div className="mt-1 flex items-center space-x-2">
                      {getRoleBadge(viewUser.role)}
                      <span className="text-xs text-slate-400 font-mono">ID: {viewUser._id}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setViewUser(null)}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Login Credentials & Security Card */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <FaKey className="text-xs" />
                    <span>Instant Login Credentials</span>
                  </span>
                  <button
                    onClick={() => copyCredentials(viewUser)}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-xl flex items-center space-x-1 shadow-sm active:scale-95 transition"
                  >
                    <FaCopy />
                    <span>Copy Login Info</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Email Login:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{viewUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Mobile Phone:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{viewUser.phone || '9361099771'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Password Pin:</span>
                    <span className="font-mono font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-lg">
                      {viewUser.accountPassword || '1234'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Residential / Operational Address */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                    <FaMapMarkerAlt className="text-emerald-500" />
                    <span>Registered Address</span>
                  </span>
                  {viewUser.addresses && viewUser.addresses[0] ? (
                    <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                      <div className="font-bold text-slate-900 dark:text-white">{viewUser.addresses[0].street}</div>
                      <div>{viewUser.addresses[0].city}, {viewUser.addresses[0].state}</div>
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">PIN: {viewUser.addresses[0].zipCode}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">14, Cross Cut Road, Gandhipuram, Coimbatore - 641012</div>
                  )}
                </div>

                {/* Civic & Administrative Zone */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1.5">
                    <FaBuilding className="text-blue-500" />
                    <span>Civic Administration</span>
                  </span>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-slate-300">
                    <div><span className="text-slate-400">Ward:</span> <span className="font-bold text-slate-900 dark:text-white">{viewUser.ward || 'Ward 12 - Central'}</span></div>
                    <div><span className="text-slate-400">Department:</span> <span className="font-bold">{viewUser.department || 'Solid Waste Management'}</span></div>
                    <div><span className="text-slate-400">Jurisdiction:</span> <span className="font-bold">{viewUser.jurisdiction || 'Municipal Corporation'}</span></div>
                  </div>
                </div>

                {/* Fleet Details (if Driver) */}
                {viewUser.role === 'driver' && (
                  <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-2xl sm:col-span-2 space-y-2">
                    <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider flex items-center space-x-1.5">
                      <FaTruck />
                      <span>Commercial Fleet Telematics & Vehicle Details</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Vehicle Number</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{viewUser.vehicleNumber || 'TN-38-PL-9971'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Vehicle Model</span>
                        <span className="font-bold text-slate-900 dark:text-white">{viewUser.vehicleType || 'EV Tipper'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">License Number</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{viewUser.licenseNumber || 'TN38-2024-9971'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Driver Status</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                          {viewUser.driverStatus || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eco Impact & Rewards (if Citizen) */}
                {viewUser.role === 'user' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl sm:col-span-2 space-y-2">
                    <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-wider flex items-center space-x-1.5">
                      <FaCoins />
                      <span>EcoPoints & Recycling Balance</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Points Balance</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                          {(viewUser.points || 0).toLocaleString()} pts
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Redemption Value</span>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          ≈ ₹{(viewUser.points || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Recycled Weight</span>
                        <span className="text-base font-black text-teal-600 dark:text-teal-400">
                          {viewUser.totalRecycledKg || Math.round((viewUser.points || 0) * 0.1)} kg
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <span className="text-[10px] text-slate-400 font-mono">
                  Joined: {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleDateString() : 'Active Member'}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const u = viewUser;
                      setViewUser(null);
                      openEditModal(u);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs flex items-center space-x-1.5 transition"
                  >
                    <FaEdit />
                    <span>Edit User</span>
                  </button>
                  <button
                    onClick={() => setViewUser(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* ADD USER / EDIT USER MODAL                                  */}
        {/* ========================================================== */}
        {(showAddModal || editUser) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    {showAddModal ? <FaPlus className="text-emerald-500 text-base" /> : <FaEdit className="text-blue-500 text-base" />}
                    <span>{showAddModal ? 'Register New User with All Details' : `Edit User Details: ${editUser.name}`}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure citizen credentials, administrative ward, role classification, and address details.
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditUser(null);
                  }}
                  className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-4">
                
                {/* 1. Basic Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Full Name *</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Palani"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Email Address *</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. palani@ecoreward.com"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Phone Number</label>
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9361099771"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Role Type</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="user">Citizen</option>
                      <option value="driver">EV Driver</option>
                      <option value="municipality">Municipality</option>
                      <option value="admin">Admin HQ</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Password / PIN</label>
                    <input 
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 2. Civic Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Ward / Area</label>
                    <input 
                      type="text"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      placeholder="Ward 12 - Central"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Department</label>
                    <input 
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Solid Waste Management"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Municipal Corporation</label>
                    <input 
                      type="text"
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      placeholder="Coimbatore Municipal Corp"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* 3. Address Details */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider block">
                    Residential / Base Address
                  </span>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Street Address</label>
                    <input 
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      placeholder="14, Cross Cut Road, Gandhipuram"
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">City</label>
                      <input 
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Coimbatore"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">State</label>
                      <input 
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="Tamil Nadu"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">PIN Code</label>
                      <input 
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="641012"
                        className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Driver Specific Fields */}
                {formData.role === 'driver' && (
                  <div className="bg-teal-500/10 border border-teal-500/30 p-4 rounded-2xl space-y-3">
                    <span className="text-[11px] font-black uppercase text-teal-700 dark:text-teal-400 tracking-wider block">
                      Driver & Vehicle Telematics
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Vehicle Number</label>
                        <input 
                          type="text"
                          value={formData.vehicleNumber}
                          onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                          placeholder="TN-38-PL-9971"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Vehicle Model</label>
                        <input 
                          type="text"
                          value={formData.vehicleType}
                          onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                          placeholder="EV Tipper"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Commercial License</label>
                        <input 
                          type="text"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                          placeholder="TN38-2024-009971"
                          className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Citizen EcoPoints */}
                {formData.role === 'user' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">Starting EcoPoints Balance</label>
                    <input 
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      placeholder="1000"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Submit Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditUser(null);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition flex items-center space-x-2"
                  >
                    {actionLoading && <span className="animate-spin text-xs">⏳</span>}
                    <span>{showAddModal ? 'Create Account' : 'Save Changes'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* DELETE CONFIRMATION MODAL                                   */}
        {/* ========================================================== */}
        {deleteConfirmUser && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center text-xl">
                <FaTrash />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Delete User Account?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently remove <strong className="text-slate-900 dark:text-white">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setDeleteConfirmUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition active:scale-95 flex items-center space-x-1.5"
                >
                  {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
