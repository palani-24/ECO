import React, { useRef, useState } from 'react';
import { 
  Award, 
  Leaf, 
  ShieldCheck, 
  TreePine, 
  Droplets, 
  Zap, 
  Printer, 
  Download, 
  X, 
  Sparkles,
  QrCode,
  Share2,
  CheckCircle,
  Building2,
  Copy,
  ExternalLink,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { downloadElementAsImage, downloadElementAsPDF } from '../utils/pdfExport';

const GreenCertificateModal = ({ 
  isOpen, 
  onClose, 
  user: passedUser,
  totalWeight = 42.5, 
  totalCO2 = 68.2, 
  points = 1250,
  esgData
}) => {
  const { user: authUser } = useAuth();
  const { addToast } = useToast();
  const certRef = useRef(null);
  const [certTheme, setCertTheme] = useState('gold'); // 'gold' | 'emerald'
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const user = passedUser || authUser;
  const userName = user?.name || 'Palani m';
  const issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const rawId = (user?._id || '9945a771fb2').toString().substring(0, 8).toUpperCase();
  const certId = `ECO-CERT-${rawId}-2026`;

  // Calculated or passed impact metrics
  const weightVal = esgData?.totalTons ? `${(esgData.totalTons * 1000).toLocaleString()} kg` : `${totalWeight} kg`;
  const co2Val = esgData?.co2SavedTons ? `${esgData.co2SavedTons} Tons` : `${totalCO2} kg`;
  const treesVal = esgData?.treesSaved ? `${esgData.treesSaved} Trees` : `${(totalCO2 * 0.045).toFixed(1)} Trees`;
  const pointsVal = user?.points ? user.points.toLocaleString() : points.toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    addToast('Saving high-resolution certificate to your gallery / downloads...', 'info', 'Downloading Image');
    const filename = `EcoReward_Green_Certificate_${userName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    const success = await downloadElementAsImage(certRef.current, filename);
    setIsDownloading(false);
    if (success) {
      addToast('Certificate image successfully saved to your device!', 'success', 'Saved to Gallery');
    } else {
      addToast('Failed to generate image. Trying fallback print dialog.', 'error', 'Error');
      window.print();
    }
  };

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    addToast('Generating official A4 ISO 14001 PDF document...', 'info', 'Downloading PDF');
    const filename = `EcoReward_Official_Certificate_${userName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    const success = await downloadElementAsPDF(certRef.current, filename, 'landscape');
    setIsDownloading(false);
    if (success) {
      addToast('Official PDF Certificate downloaded successfully!', 'success', 'PDF Downloaded');
    } else {
      addToast('PDF generation failed. Opening print window...', 'error', 'Error');
      window.print();
    }
  };

  const handleCopyCertId = () => {
    navigator.clipboard.writeText(certId);
    setCopied(true);
    addToast(`Certificate ID copied: ${certId}`, 'success', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s Official EcoReward Green Certificate`,
        text: `I just received my Official ISO 14001 Environmental Stewardship Award on EcoReward! Verified CO2 Abated: ${co2Val}. Certificate ID: ${certId}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyCertId();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[96vh] overflow-y-auto">
        
        {/* Top Modal Controls Header (Hidden on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                Official Environmental Excellence Registry
              </h3>
              <p className="text-[11px] text-slate-400">ISO 14001:2015 & UN SDG Circularity Accreditation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Switcher Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setCertTheme('gold')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  certTheme === 'gold' 
                    ? 'bg-amber-400 text-slate-950 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                🏅 Royal Gold
              </button>
              <button
                onClick={() => setCertTheme('emerald')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  certTheme === 'emerald' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                ✨ Emerald Dark
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CERTIFICATE PRINTABLE CANVAS */}
        {/* ========================================================= */}
        <div 
          ref={certRef}
          className={`p-6 sm:p-10 rounded-3xl relative overflow-hidden transition-all duration-300 ${
            certTheme === 'gold'
              ? 'bg-gradient-to-br from-[#fcfbf7] via-[#fffdf9] to-[#f9f6ee] text-slate-900 border-8 border-double border-amber-500/60 shadow-xl'
              : 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-8 border-double border-emerald-500/50 shadow-2xl'
          }`}
        >
          {/* Decorative Filigree Corner Ornaments */}
          <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-500/80 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-500/80 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-500/80 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-500/80 rounded-br-xl pointer-events-none" />

          {/* Watermark Emblem */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Leaf className="w-[450px] h-[450px] text-emerald-600" />
          </div>

          <div className="text-center space-y-4 relative z-10">
            
            {/* Top Seal Emblem */}
            <div className="flex justify-center items-center gap-3">
              <div className="relative">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg border-2 ${
                  certTheme === 'gold'
                    ? 'bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border-amber-300 text-slate-950'
                    : 'bg-gradient-to-tr from-emerald-500 via-teal-300 to-emerald-600 border-emerald-400 text-slate-950'
                }`}>
                  <Award className="w-9 h-9 sm:w-11 sm:h-11" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Official Header */}
            <div>
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] block mb-1 ${
                certTheme === 'gold' ? 'text-amber-800' : 'text-emerald-400'
              }`}>
                ★ Government of Tamil Nadu • Municipal Environmental Registry ★
              </span>
              <h2 className={`text-2xl sm:text-4xl font-serif font-black tracking-wide uppercase ${
                certTheme === 'gold' 
                  ? 'text-slate-900' 
                  : 'bg-gradient-to-r from-emerald-300 via-teal-100 to-cyan-300 bg-clip-text text-transparent'
              }`}>
                Green Citizen of Excellence
              </h2>
              <p className={`text-xs font-medium mt-1 ${certTheme === 'gold' ? 'text-slate-600' : 'text-slate-400'}`}>
                Certificate of Verified Environmental Stewardship, Resource Conservation & Circular Recycling
              </p>
            </div>

            {/* Recipient Ribbon */}
            <div className={`py-4 my-2 border-y-2 border-dashed ${
              certTheme === 'gold' ? 'border-amber-400/50 bg-amber-50/40' : 'border-emerald-500/30 bg-emerald-950/20'
            }`}>
              <span className={`text-xs font-semibold block uppercase tracking-wider ${
                certTheme === 'gold' ? 'text-slate-500' : 'text-slate-400'
              }`}>
                This Prestigious Accolade is Proudly Conferred Upon:
              </span>
              <h3 className={`text-2xl sm:text-4xl font-black font-serif mt-1 tracking-tight ${
                certTheme === 'gold' ? 'text-emerald-900' : 'text-emerald-300'
              }`}>
                {userName}
              </h3>
              <p className={`text-xs max-w-xl mx-auto mt-1 leading-relaxed ${
                certTheme === 'gold' ? 'text-slate-700' : 'text-slate-300'
              }`}>
                In formal recognition of outstanding leadership and verified participation in municipal doorstep source segregation, zero-landfill diversion, and circular economic stewardship.
              </p>
            </div>

            {/* Impact Dividends 4-Box Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className={`p-3.5 rounded-2xl border ${
                certTheme === 'gold' 
                  ? 'bg-white border-amber-200/80 shadow-xs' 
                  : 'bg-slate-900/90 border-slate-800 shadow-sm'
              }`}>
                <div className="text-emerald-600 dark:text-emerald-400 text-lg sm:text-xl font-black">{weightVal}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Waste Diverted</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                certTheme === 'gold' 
                  ? 'bg-white border-amber-200/80 shadow-xs' 
                  : 'bg-slate-900/90 border-slate-800 shadow-sm'
              }`}>
                <div className="text-teal-600 dark:text-teal-400 text-lg sm:text-xl font-black">{co2Val}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">CO₂ Carbon Abated</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                certTheme === 'gold' 
                  ? 'bg-white border-amber-200/80 shadow-xs' 
                  : 'bg-slate-900/90 border-slate-800 shadow-sm'
              }`}>
                <div className="text-emerald-700 dark:text-emerald-300 text-lg sm:text-xl font-black">{treesVal}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Forest Equivalent</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${
                certTheme === 'gold' 
                  ? 'bg-white border-amber-200/80 shadow-xs' 
                  : 'bg-slate-900/90 border-slate-800 shadow-sm'
              }`}>
                <div className="text-purple-600 dark:text-purple-400 text-lg sm:text-xl font-black">{pointsVal} Pts</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">EcoRewards Earned</div>
              </div>
            </div>

            {/* Signatures & Seal Verification Footer */}
            <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-left text-xs ${
              certTheme === 'gold' ? 'border-amber-300/60 text-slate-600' : 'border-slate-800 text-slate-400'
            }`}>
              
              {/* Certificate Verification Code */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <QrCode className="w-10 h-10 text-slate-900" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Registry ID:</span>
                  <span className={`font-mono font-black text-xs sm:text-sm block ${
                    certTheme === 'gold' ? 'text-emerald-900' : 'text-emerald-400'
                  }`}>
                    {certId}
                  </span>
                  <span className="text-[10px] text-slate-400">Issued: {issueDate}</span>
                </div>
              </div>

              {/* Official Signature & Authority Stamp */}
              <div className="flex items-center gap-4 text-center sm:text-right">
                <div>
                  <div className="font-serif italic font-bold text-base sm:text-lg text-emerald-800 dark:text-emerald-400">
                    S. Radhakrishnan, IAS
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Director of Sustainability & Circular Economy
                  </div>
                  <div className="text-[9px] text-slate-400">
                    Municipal Corporation Eco-Board
                  </div>
                </div>

                <div className={`w-14 h-14 rounded-full border-2 flex flex-col items-center justify-center p-1 font-bold text-[8px] uppercase tracking-tighter ${
                  certTheme === 'gold'
                    ? 'border-amber-500 bg-amber-100 text-amber-900 shadow-xs'
                    : 'border-emerald-500 bg-emerald-950 text-emerald-300 shadow-sm'
                }`}>
                  <span>★ OFFICIAL ★</span>
                  <span className="font-black text-[9px]">SEAL</span>
                  <span>ISO 14001</span>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTION BUTTONS (Print, Download, Share) */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCertId}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'ID Copied' : 'Copy Cert ID'}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="w-4 h-4 text-sky-600" />
              <span>Share Award</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Close
            </button>

            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Saving...' : 'Save to Gallery (PNG)'}</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="Print Certificate"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default GreenCertificateModal;
