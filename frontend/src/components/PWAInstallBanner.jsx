import React, { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaMobileAlt, FaRecycle, FaShareAlt, FaPlusSquare } from 'react-icons/fa';

const PWAInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode (already installed as app)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      return; // Already installed, do not show banner
    }

    // Check if user dismissed banner recently
    const isDismissed = localStorage.getItem('pwa_banner_dismissed');
    if (isDismissed) {
      const dismissedTime = parseInt(isDismissed, 10);
      if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
        return; // Don't show again within 24 hrs
      }
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (iosDevice) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Listen for native Android/Desktop Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Floating Mobile PWA Install Banner */}
      <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 max-w-md bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-500/60 rounded-3xl p-4 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between gap-3">
          
          <div className="flex items-center space-x-3 min-w-0">
            <img 
              src="/app-logo.png" 
              alt="EcoReward App Icon" 
              className="h-10 w-10 rounded-2xl object-cover ring-2 ring-emerald-500/50 flex-shrink-0 shadow-md" 
            />
            <div className="min-w-0">
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate flex items-center space-x-1">
                <span>Install EcoReward App</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-md font-mono">App</span>
              </h4>
              <p className="text-[10px] text-slate-300 truncate">Add to phone home screen for 1-tap fast access!</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl text-xs shadow-md transition-all flex items-center space-x-1 active:scale-95"
            >
              <FaDownload className="h-3 w-3" />
              <span>Install</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <FaTimes className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <FaMobileAlt className="text-emerald-400" />
                <span>Install on iPhone / iPad</span>
              </h3>
              <button onClick={() => setShowIOSInstructions(false)} className="text-slate-400 hover:text-white">
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                <FaShareAlt className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">1. Tap the Share Button</p>
                  <p className="text-[11px] text-slate-400">Tap the Share icon at the bottom of Safari browser.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-700">
                <FaPlusSquare className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">2. Add to Home Screen</p>
                  <p className="text-[11px] text-slate-400">Scroll down and select "Add to Home Screen".</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-emerald-600 font-extrabold rounded-xl text-xs text-white"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallBanner;
