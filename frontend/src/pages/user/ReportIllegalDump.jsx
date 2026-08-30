import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Upload, 
  Sparkles, 
  ArrowLeft,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ReportIllegalDump = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [photoUrl, setPhotoUrl] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('Ward 12 - Central Zone');
  const [lat, setLat] = useState(11.0168);
  const [lng, setLng] = useState(76.9558);
  const [wasteType, setWasteType] = useState('Plastic Heap');
  const [estimatedSeverity, setEstimatedSeverity] = useState('High');
  const [description, setDescription] = useState('');
  
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Sample quick image presets
  const samplePhotos = [
    { label: 'Plastic Dump', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80' },
    { label: 'Overflowing Bin', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80' },
    { label: 'Construction Debris', url: 'https://images.unsplash.com/photo-1526951521990-620dc14c214b?w=600&auto=format&fit=crop&q=80' }
  ];

  const handleGetLocation = () => {
    setLoadingLoc(true);
    setError('');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`Near GPS Coordinate (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}), Central Sector`);
          setLoadingLoc(false);
        },
        (err) => {
          console.warn('Geolocation denied/unavailable, setting simulated location');
          setLat(11.0168);
          setLng(76.9558);
          setAddress('Cross Cut Road Corner, Gandhipuram, Coimbatore');
          setLoadingLoc(false);
        }
      );
    } else {
      setAddress('Cross Cut Road Corner, Gandhipuram, Coimbatore');
      setLoadingLoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoUrl || !address) {
      setError('Please provide a photo and location address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        photoUrl,
        address,
        ward,
        lat,
        lng,
        wasteType,
        estimatedSeverity,
        description
      };
      const res = await api.post('/municipality/report-dump', payload);
      if (res.data?.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit grievance report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Back Link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-400 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Title Header */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Report Illegal Garbage Dumping</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> +50 EcoPoints Reward
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Help keep your city clean. Geo-tag roadside waste for rapid municipal sanitation squad dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Success Card */}
        {success ? (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white">Grievance Submitted Successfully!</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              The Municipal Sanitation Team has been alerted with your geo-coordinates. You will receive <strong>50 EcoPoints</strong> as soon as the site is cleaned and verified!
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setPhotoUrl('');
                  setDescription('');
                }}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold transition"
              >
                Report Another Spot
              </button>
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/40"
              >
                Go to My Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* 1. Photo Capture / Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                Evidence Photo of Illegal Garbage Dump
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="Enter image URL or select sample below"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-xs text-slate-500">Quick Samples:</span>
                    {samplePhotos.map((sp) => (
                      <button
                        key={sp.label}
                        type="button"
                        onClick={() => setPhotoUrl(sp.url)}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                      >
                        {sp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview Box */}
                <div className="h-36 rounded-xl border border-dashed border-slate-700 bg-slate-950 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Dump Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-600 text-xs">
                      <Camera className="w-8 h-8 mx-auto mb-1 text-slate-700" />
                      Image preview will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Location & Ward */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Spot Location & Ward
                </span>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loadingLoc}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
                >
                  <Navigation className={`w-3.5 h-3.5 ${loadingLoc ? 'animate-spin' : ''}`} />
                  Detect My GPS
                </button>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street name, landmark, corner details"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Ward 1 - Gandhipuram">Ward 1 - Gandhipuram</option>
                    <option value="Ward 2 - RS Puram">Ward 2 - RS Puram</option>
                    <option value="Ward 3 - Saibaba Colony">Ward 3 - Saibaba Colony</option>
                    <option value="Ward 4 - Peelamedu">Ward 4 - Peelamedu</option>
                    <option value="Ward 5 - Singanallur">Ward 5 - Singanallur</option>
                    <option value="Ward 6 - Saravanampatti">Ward 6 - Saravanampatti</option>
                    <option value="Ward 12 - Central Zone">Ward 12 - Central Zone</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Waste Type & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Garbage Category
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Mixed Garbage">Mixed Roadside Garbage</option>
                  <option value="Plastic Heap">Plastic / Polythene Heap</option>
                  <option value="Construction Debris">Construction Debris</option>
                  <option value="E-Waste">Discarded E-Waste</option>
                  <option value="Hazardous">Hazardous / Chemical</option>
                  <option value="Organic Waste">Organic Food Waste Heap</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Severity Level
                </label>
                <select
                  value={estimatedSeverity}
                  onChange={(e) => setEstimatedSeverity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low - Minor Litter</option>
                  <option value="Medium">Medium - Visible Dump Pile</option>
                  <option value="High">High - Blocking Sidewalk / Drain</option>
                  <option value="Critical Hazard">Critical Hazard - Health Risk / Fire Risk</option>
                </select>
              </div>
            </div>

            {/* 4. Description Note */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                Additional Landmark Details (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g. Opposite to bus shelter, near drainage canal..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition text-base"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Transmitting Geo-Report...' : 'Submit Grievance to Municipality'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIllegalDump;
