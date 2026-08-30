import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Truck, 
  User, 
  ShieldCheck, 
  Filter, 
  Upload, 
  Camera, 
  Send,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../../utils/api';

const MunicipalityGrievances = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [wardFilter, setWardFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Form states for resolving report
  const [updateStatus, setUpdateStatus] = useState('assigned');
  const [assignedTeam, setAssignedTeam] = useState('Central Rapid Sanitation Squad #4');
  const [assignedVehicle, setAssignedVehicle] = useState('TN-38-MUNI-8819 (Compactor)');
  const [cleanedPhotoUrl, setCleanedPhotoUrl] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/municipality/dump-reports?status=${statusFilter}&ward=${wardFilter}`);
      if (res.data?.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, wardFilter]);

  const openActionModal = (report) => {
    setSelectedReport(report);
    setUpdateStatus(report.status === 'reported' ? 'assigned' : report.status);
    setAssignedTeam(report.assignedTeam || 'Central Rapid Sanitation Squad #4');
    setAssignedVehicle(report.assignedVehicle || 'TN-38-MUNI-8819 (Compactor)');
    setCleanedPhotoUrl(report.cleanedPhotoUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80');
    setResolutionNotes(report.resolutionNotes || 'Debris cleared, bin sanitized, and area disinfected.');
    setShowModal(true);
    setSuccessMsg('');
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSaving(true);
    try {
      const payload = {
        status: updateStatus,
        assignedTeam,
        assignedVehicle,
        cleanedPhotoUrl: updateStatus === 'cleaned' ? cleanedPhotoUrl : '',
        resolutionNotes
      };
      const res = await api.patch(`/municipality/dump-reports/${selectedReport._id}`, payload);
      if (res.data?.success) {
        setSuccessMsg(`Status successfully updated to '${updateStatus}'. Citizen notified!`);
        setTimeout(() => {
          setShowModal(false);
          fetchReports();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update grievance:', err);
    } finally {
      setSaving(false);
    }
  };

  // Mock initial demo grievances if empty
  const displayReports = reports.length > 0 ? reports : [
    {
      _id: 'rep-001',
      location: { address: 'Cross Cut Road, Gandhipuram Market Corner', ward: 'Ward 1 - Gandhipuram', lat: 11.0185, lng: 76.9620 },
      wasteType: 'Plastic Heap',
      estimatedSeverity: 'High',
      description: 'Open illegal dump accumulating near vegetable market creating foul smell.',
      status: 'reported',
      createdAt: new Date().toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      reporter: { name: 'Karthik Raja', phone: '9845012345' },
      rewardPoints: 50
    },
    {
      _id: 'rep-002',
      location: { address: 'West Club Road, Near Park Gate, RS Puram', ward: 'Ward 2 - RS Puram', lat: 11.0090, lng: 76.9510 },
      wasteType: 'Mixed Garbage',
      estimatedSeverity: 'Critical Hazard',
      description: 'Medical and electronic e-waste dumped by roadside.',
      status: 'assigned',
      assignedTeam: 'Central Rapid Squad #2',
      assignedVehicle: 'TN-38-MUNI-1044',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      reporter: { name: 'Priya Sundaram', phone: '9790145678' },
      rewardPoints: 50
    },
    {
      _id: 'rep-003',
      location: { address: 'Avinashi Road, Near PSG Bridge, Peelamedu', ward: 'Ward 4 - Peelamedu', lat: 11.0250, lng: 77.0020 },
      wasteType: 'Construction Debris',
      estimatedSeverity: 'Medium',
      description: 'Cement blocks and debris blocking pedestrian sidewalk.',
      status: 'cleaned',
      assignedTeam: 'Heavy Debris Hauler Unit',
      cleanedPhotoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
      resolutionNotes: 'Site completely cleared and sanitized.',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      photoUrl: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=600&auto=format&fit=crop&q=80',
      reporter: { name: 'Ramesh Babu', phone: '9443219876' },
      rewardPoints: 50,
      rewardCredited: true
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Citizen Illegal Dump Redressal Hub</h1>
              <p className="text-slate-400 text-sm">
                Track, dispatch sanitation squads, and resolve citizen-reported roadside garbage heaps with automated rewards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/municipality/dashboard"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
            >
              Back to Overview
            </Link>
            <button
              onClick={fetchReports}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-2">Status:</span>
            {['all', 'reported', 'assigned', 'in_progress', 'cleaned'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Ward:</span>
            <select
              value={wardFilter}
              onChange={(e) => setWardFilter(e.target.value)}
              className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Wards</option>
              <option value="Ward 1">Ward 1 - Gandhipuram</option>
              <option value="Ward 2">Ward 2 - RS Puram</option>
              <option value="Ward 4">Ward 4 - Peelamedu</option>
            </select>
          </div>
        </div>

        {/* Grievances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayReports.map((report) => {
            const isCleaned = report.status === 'cleaned';
            const isAssigned = report.status === 'assigned' || report.status === 'in_progress';

            return (
              <div
                key={report._id}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  {/* Photo with Overlay Badge */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={report.photoUrl}
                      alt="Garbage report"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                        report.estimatedSeverity === 'Critical Hazard' ? 'bg-rose-500/90 text-white border-rose-400' :
                        report.estimatedSeverity === 'High' ? 'bg-amber-500/90 text-slate-950 border-amber-300' :
                        'bg-blue-500/90 text-white border-blue-400'
                      }`}>
                        {report.estimatedSeverity}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${
                        isCleaned ? 'bg-emerald-500 text-slate-950' :
                        isAssigned ? 'bg-cyan-500 text-slate-950' :
                        'bg-rose-500 text-white'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-slate-200">{report.wasteType}</span>
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>

                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {report.description || 'Roadside illegal waste dump.'}
                    </p>

                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{report.location?.address}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Reported by: <strong>{report.reporter?.name || 'Citizen Vigilant'}</strong></span>
                      </div>
                    </div>

                    {isCleaned && report.resolutionNotes && (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-1">
                        <div className="flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Resolved & 50 Points Credited
                        </div>
                        <p className="text-slate-400 text-[11px]">{report.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-950/60 border-t border-slate-800">
                  <button
                    onClick={() => openActionModal(report)}
                    className="w-full py-2 bg-slate-800 hover:bg-amber-600 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    {isCleaned ? 'View Redressal Details' : 'Dispatch / Update Status'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Municipal Action */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Grievance Action & Resolution</h3>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleUpdateReport} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Grievance Status</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="assigned">Assigned to Field Squad</option>
                    <option value="in_progress">In Progress (Clean-up underway)</option>
                    <option value="cleaned">Cleaned & Resolved (Credit Citizen Reward)</option>
                    <option value="rejected">Reject / False Alarm</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Assigned Sanitation Squad</label>
                    <input
                      type="text"
                      value={assignedTeam}
                      onChange={(e) => setAssignedTeam(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Squad name/number"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Sanitation Vehicle</label>
                    <input
                      type="text"
                      value={assignedVehicle}
                      onChange={(e) => setAssignedVehicle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="Vehicle plate"
                    />
                  </div>
                </div>

                {updateStatus === 'cleaned' && (
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">
                      Proof of Cleaned Site Photo URL (Citizen Verification)
                    </label>
                    <input
                      type="text"
                      value={cleanedPhotoUrl}
                      onChange={(e) => setCleanedPhotoUrl(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                      placeholder="https://..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Action Resolution Notes</label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="Describe sanitization, disposal, and disinfection measures..."
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-900/30 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {saving ? 'Updating...' : 'Save & Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MunicipalityGrievances;
