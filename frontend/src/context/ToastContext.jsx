import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaBell, FaRecycle } from 'react-icons/fa';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = 'EcoAlert') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, title }]);

    // Play subtle audio alert simulation
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'success' ? 587.33 : 440, audioCtx.currentTime); // D5 or A4
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio fallback
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => {
          const bgColors = {
            success: 'bg-emerald-950/90 border-emerald-500/40 text-white shadow-[0_10px_30px_rgba(16,185,129,0.25)]',
            error: 'bg-rose-950/90 border-rose-500/40 text-white shadow-[0_10px_30px_rgba(244,63,94,0.25)]',
            info: 'bg-slate-900/90 border-slate-700/60 text-white shadow-2xl',
            reward: 'bg-amber-950/90 border-amber-500/40 text-white shadow-[0_10px_30px_rgba(245,158,11,0.25)]'
          };
          const progressColors = {
            success: 'bg-emerald-400',
            error: 'bg-rose-400',
            info: 'bg-sky-400',
            reward: 'bg-amber-400'
          };
          const icons = {
            success: <FaCheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" />,
            error: <FaExclamationCircle className="text-rose-400 h-5 w-5 flex-shrink-0" />,
            info: <FaInfoCircle className="text-sky-400 h-5 w-5 flex-shrink-0" />,
            reward: <FaRecycle className="text-amber-400 h-5 w-5 flex-shrink-0 animate-spin" />
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative overflow-hidden flex items-start space-x-3 p-4 rounded-2xl border backdrop-blur-xl transition-all transform duration-300 translate-y-0 ${bgColors[toast.type] || bgColors.info}`}
            >
              {icons[toast.type] || <FaBell className="text-emerald-400 h-5 w-5" />}
              <div className="flex-1 space-y-0.5">
                <h4 className="text-[11px] font-black tracking-wider uppercase text-slate-100">{toast.title}</h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white text-xs p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Dismiss toast"
              >
                ✕
              </button>

              {/* Dismiss countdown progress bar */}
              <div 
                className={`absolute bottom-0 left-0 h-1 ${progressColors[toast.type] || progressColors.info}`}
                style={{
                  width: '100%',
                  animation: 'toastProgress 4.5s linear forwards'
                }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
