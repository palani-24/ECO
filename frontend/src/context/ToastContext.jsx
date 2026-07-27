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
            success: 'bg-emerald-900/90 border-emerald-500/30 text-white shadow-emerald-950/40',
            error: 'bg-rose-900/90 border-rose-500/30 text-white shadow-rose-950/40',
            info: 'bg-slate-900/90 border-slate-700/50 text-white shadow-slate-950/40',
            reward: 'bg-amber-900/90 border-amber-500/30 text-white shadow-amber-950/40'
          };
          const icons = {
            success: <FaCheckCircle className="text-emerald-400 h-5 w-5 flex-shrink-0" />,
            error: <FaExclamationCircle className="text-rose-400 h-5 w-5 flex-shrink-0" />,
            info: <FaInfoCircle className="text-sky-400 h-5 w-5 flex-shrink-0" />,
            reward: <FaRecycle className="text-amber-400 h-5 w-5 flex-shrink-0 animate-bounce" />
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all transform duration-300 translate-y-0 ${bgColors[toast.type] || bgColors.info}`}
            >
              {icons[toast.type] || <FaBell className="text-emerald-400 h-5 w-5" />}
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-black tracking-wide uppercase">{toast.title}</h4>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
