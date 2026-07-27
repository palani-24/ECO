import React, { useState } from 'react';
import { FaQrcode, FaTimes, FaCamera, FaCheckCircle, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';
import api from '../utils/api';

const QRScannerModal = ({ isOpen, onClose, pickup, onVerified }) => {
  const [qrInput, setQrInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !pickup) return null;

  const expectedToken = pickup.qrToken || `ECO-QR-${pickup._id.toString().substring(18).toUpperCase()}`;

  const handleSimulateScan = async () => {
    setScanning(true);
    setErrorMsg('');
    setStatusMsg('');

    setTimeout(async () => {
      setQrInput(expectedToken);
      try {
        const res = await api.post('/driver/verify-qr', { qrToken: expectedToken, pickupId: pickup._id });
        if (res.data.success) {
          setStatusMsg('Customer QR Pass Verified Successfully! Collection UNLOCKED.');
          if (onVerified) onVerified(pickup._id);
        } else {
          setErrorMsg(res.data.message || 'Verification failed.');
        }
      } catch (err) {
        setErrorMsg('QR Verification failed. Token mismatch.');
      } finally {
        setScanning(false);
      }
    }, 1000);
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    setScanning(true);
    setErrorMsg('');
    setStatusMsg('');

    try {
      const res = await api.post('/driver/verify-qr', { qrToken: qrInput.trim(), pickupId: pickup._id });
      if (res.data.success) {
        setStatusMsg('Customer QR Pass Verified Successfully! Collection UNLOCKED.');
        if (onVerified) onVerified(pickup._id);
      } else {
        setErrorMsg(res.data.message || 'Verification failed.');
      }
    } catch (err) {
      setErrorMsg('QR Verification failed. Invalid Token.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <FaQrcode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Driver QR Scanner</h3>
              <p className="text-[10px] text-slate-400">Scan customer QR pass to verify pickup arrival</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <FaTimes />
          </button>
        </div>

        {/* Viewfinder Simulator */}
        <div className="relative w-full h-56 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center space-y-3 p-4">
          <div className="relative w-40 h-40 border-2 border-emerald-500/80 rounded-xl flex items-center justify-center">
            {/* Viewfinder Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>

            {scanning ? (
              <div className="text-center space-y-2">
                <FaCamera className="h-8 w-8 mx-auto text-emerald-400 animate-pulse" />
                <p className="text-[10px] text-emerald-400 font-bold">Scanning Code...</p>
              </div>
            ) : (
              <div className="text-center space-y-2 p-2">
                <FaQrcode className="h-10 w-10 mx-auto text-slate-600" />
                <p className="text-[10px] text-slate-400 font-medium">Position customer QR pass within box</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions & Status */}
        <div className="space-y-3">
          {statusMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center space-x-2">
              <FaCheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center space-x-2">
              <FaExclamationTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={scanning}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2"
          >
            <FaCamera />
            <span>{scanning ? 'Scanning...' : 'Simulate Camera QR Scan'}</span>
          </button>

          <form onSubmit={handleManualVerify} className="flex space-x-2 pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Or enter QR Token manually"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
            >
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
