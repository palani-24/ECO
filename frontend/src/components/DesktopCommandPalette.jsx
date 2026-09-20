import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAMIL_NADU_DISTRICTS, useDistrict } from '../context/DistrictContext';
import { useAuth } from '../context/AuthContext';
import { 
  FaSearch, FaTimes, FaMapMarkerAlt, FaTruck, FaRecycle, FaShieldAlt, 
  FaPhoneAlt, FaCoins, FaBuilding, FaUserCheck, FaKeyboard
} from 'react-icons/fa';

const COMMAND_ACTIONS = [
  { id: 'pickup', title: 'Schedule Doorstep Scrap Pickup', category: 'Citizen Actions', route: '/schedule-pickup', icon: FaTruck },
  { id: 'rates', title: 'Check Today Scrap Buyback Rates', category: 'Scrap & Rates', route: '/dashboard', icon: FaCoins },
  { id: 'driver', title: 'Open Driver EV Dispatch Portal', category: 'Portals', route: '/driver', icon: FaTruck },
  { id: 'municipality', title: 'Municipal Ward Command Desk', category: 'Portals', route: '/municipality/dashboard', icon: FaBuilding },
  { id: 'admin', title: 'Admin 38-District Headquarters', category: 'Portals', route: '/admin', icon: FaShieldAlt },
  { id: 'dump', title: 'Report Illegal Roadside Waste Dump', category: 'Civic Grievances', route: '/report-dump', icon: FaRecycle },
  { id: 'helpline', title: 'Tamil Nadu SWM Helpline (1913)', category: 'Support', route: '/support', icon: FaPhoneAlt },
];

const DesktopCommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { currentDistrict, selectDistrict } = useDistrict() || {};
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggles open in parent
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filtered districts
  const matchedDistricts = TAMIL_NADU_DISTRICTS.filter(d => 
    d.name.toLowerCase().includes(q) || 
    (d.tamilName && d.tamilName.includes(q)) ||
    (d.corporation && d.corporation.toLowerCase().includes(q))
  ).slice(0, 5);

  // Filtered actions
  const matchedActions = COMMAND_ACTIONS.filter(a =>
    a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
  );

  const totalResults = [...matchedDistricts.map(d => ({ type: 'district', item: d })), ...matchedActions.map(a => ({ type: 'action', item: a }))];

  const handleSelect = (result) => {
    if (!result) return;
    if (result.type === 'district') {
      if (selectDistrict) selectDistrict(result.item.id);
      navigate('/dashboard');
    } else {
      navigate(result.item.route);
    }
    onClose();
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, totalResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalResults.length) % Math.max(1, totalResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalResults[selectedIndex]) {
        handleSelect(totalResults[selectedIndex]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#071729] rounded-3xl border border-slate-200 dark:border-emerald-500/30 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#050e18]">
          <FaSearch className="text-emerald-600 dark:text-emerald-400 text-sm mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a district (Chennai, Coimbatore...), action or portal..."
            className="flex-1 bg-transparent border-none text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              ESC to exit
            </span>
            <button 
              type="button" 
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {totalResults.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No matching districts or actions found for "{query}".
            </div>
          ) : (
            <>
              {matchedDistricts.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Tamil Nadu Districts
                </div>
              )}
              {matchedDistricts.map((d, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSelect({ type: 'district', item: d })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-black' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FaMapMarkerAlt className="text-xs" />
                      </div>
                      <div>
                        <span className="font-extrabold">{d.name} ({d.tamilName})</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                          {d.corporation || `${d.name} District Administration`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      Switch District ↵
                    </span>
                  </button>
                );
              })}

              {matchedActions.length > 0 && (
                <div className="px-3 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Direct Portal Commands
                </div>
              )}
              {matchedActions.map((a, aIdx) => {
                const actualIndex = matchedDistricts.length + aIdx;
                const isSelected = selectedIndex === actualIndex;
                const IconComponent = a.icon;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleSelect({ type: 'action', item: a })}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left text-xs transition cursor-pointer ${
                      isSelected 
                        ? 'bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 font-black' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 rounded-xl bg-teal-100 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                        <IconComponent className="text-xs" />
                      </div>
                      <div>
                        <span className="font-extrabold">{a.title}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                          {a.category}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-bold">
                      Open ↵
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center space-x-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Tamil Nadu Smart SWM Network</span>
        </div>
      </div>
    </div>
  );
};

export default DesktopCommandPalette;
