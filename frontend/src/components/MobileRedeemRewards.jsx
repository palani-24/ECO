import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCoins, FaExchangeAlt, FaMapMarkedAlt, FaTree, FaSearch, 
  FaFilter, FaCheck, FaLeaf, FaWater, FaSubway, FaBolt, FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import MobileCitizenHeader from './MobileCitizenHeader';
import MobileCitizenNav from './MobileCitizenNav';
import UPIPayoutModal from './UPIPayoutModal';
import SmartKioskLocatorModal from './SmartKioskLocatorModal';
import PlantTreeModal from './PlantTreeModal';
import { triggerHaptic } from '../utils/mobileNative';
import { triggerConfetti } from '../utils/confetti';
import { soundFx } from '../utils/audioFeedback';

const REWARD_CATALOG = [
  {
    id: 'rw-1',
    title: 'Plant a Real Geo-Tagged Tree (Living Seedling)',
    description: 'Sponsor an actual native sapling (Neem/Teak) planted in reserve zones with GPS Coordinates and certificate.',
    category: 'eco',
    pointsCost: 500,
    badge: 'VERIFIED NGO',
    icon: '🌳',
    impact: 'Offsets ~22kg CO2/year per tree',
    isTreeModal: true
  },
  {
    id: 'rw-2',
    title: 'Recover 2kg Ocean-Bound Plastic',
    description: 'Fund certified coastal recovery operations removing 2,000g of ocean plastics before entering marine ecosystems.',
    category: 'eco',
    pointsCost: 400,
    badge: 'MARINE IMPACT',
    icon: '🌊',
    impact: 'Recovers 2,000g ocean plastic'
  },
  {
    id: 'rw-3',
    title: 'Green Metro Rail Pass (₹100 Recharge)',
    description: 'Instant smart transit credit valid for CMRL Metro trains & Metropolitan Electric Smart Buses.',
    category: 'transit',
    pointsCost: 350,
    badge: 'CLEAN COMMUTE',
    icon: '🚇',
    impact: 'Replaces ~4.2kg vehicular carbon emissions'
  },
  {
    id: 'rw-4',
    title: 'TNEB Electricity Bill Rebate (₹150 Off)',
    description: 'Direct rebate coupon code for Tamil Nadu Electricity residential consumer accounts.',
    category: 'utility',
    pointsCost: 500,
    badge: 'SMART CITY',
    icon: '💡',
    impact: 'Promotes domestic energy conservation'
  },
  {
    id: 'rw-5',
    title: 'Metro Water & Tax Discount (₹100 Off)',
    description: 'CMWSSB & Municipal rainwater harvesting and zero-waste civic incentive certificate.',
    category: 'utility',
    pointsCost: 350,
    badge: 'CIVIC BENEFIT',
    icon: '💧',
    impact: 'Incentivizes water conservation'
  }
];

const MobileRedeemRewards = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  // Modals
  const [showUPI, setShowUPI] = useState(false);
  const [showKiosk, setShowKiosk] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);

  const points = user?.points ?? 1758;

  const filteredRewards = REWARD_CATALOG.filter(item => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (onlyAffordable && item.pointsCost > points) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    }
    return true;
  });

  const handleClaim = (reward) => {
    triggerHaptic(40);
    if (points < reward.pointsCost) {
      addToast(`Need ${reward.pointsCost - points} more EcoPoints to claim this!`, 'warning', 'Insufficient Points');
      return;
    }

    if (reward.isTreeModal) {
      setShowTreeModal(true);
      return;
    }

    triggerConfetti();
    soundFx.playSuccessChime();
    if (updateUserPoints) {
      updateUserPoints(points - reward.pointsCost);
    }
    addToast(`🎉 Claimed "${reward.title}"! Voucher code sent to your SMS/Email.`, 'success', 'Reward Unlocked');
  };

  return (
    <div className="min-h-screen bg-[#F4F7F6] dark:bg-[#07131F] text-slate-900 dark:text-slate-100 pb-28 font-sans select-none">
      
      {/* 1. GREEN APP HEADER */}
      <MobileCitizenHeader 
        title="Redeem Rewards & Points" 
        showBack={true} 
      />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* 2. TITLE & CONNECTED BADGE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 dark:text-white">
              Redeem Points
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[9px] font-bold text-slate-600 dark:text-slate-400">
              ⚡ Eco Microservice Connected
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Exchange your points for green transit passes, real trees, smart utility bill rebates, and eco-deals.
          </p>
        </div>

        {/* 3. QUICK ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setShowUPI(true);
            }}
            className="py-3 px-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-md active:scale-98 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <FaExchangeAlt />
            <span>Withdraw Cash (UPI)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setShowKiosk(true);
            }}
            className="py-3 px-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs border border-slate-200 dark:border-slate-800 shadow-sm active:scale-98 transition flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <FaMapMarkedAlt className="text-emerald-600" />
            <span>Smart Kiosks</span>
          </button>
        </div>

        {/* 4. POINTS BALANCE PILL */}
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/25 flex items-center space-x-2.5">
          <div className="text-xl">🪙</div>
          <div>
            <span className="text-base font-black text-emerald-700 dark:text-emerald-300">
              {points} Points
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
              Available balance for instant redemption
            </span>
          </div>
        </div>

        {/* 5. 4-METRIC IMPACT SUMMARY (Screenshot 2 Match) */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center text-lg">
                🌳
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">142+ Trees</h4>
                <p className="text-[10px] text-slate-400 font-medium">Geo-tagged & Planted</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center text-lg">
                🌊
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">380 kg</h4>
                <p className="text-[10px] text-slate-400 font-medium">Ocean Plastic Recovered</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center text-lg">
                🚇
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">1,250 km</h4>
                <p className="text-[10px] text-slate-400 font-medium">Clean Metro Commute</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center text-lg">
                ⚡
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">₹1.8L+ Saved</h4>
                <p className="text-[10px] text-slate-400 font-medium">Utility & Power Rebates</p>
              </div>
            </div>
          </div>
        </div>

        {/* 6. CATEGORY FILTER TABS */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: '⭐ All Rewards' },
            { id: 'eco', label: '🌱 Eco Impact' },
            { id: 'transit', label: '🚇 Green Transit & EV' },
            { id: 'utility', label: '💡 Utility Rebates' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                triggerHaptic(20);
                setActiveTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 7. SEARCH & AFFORDABLE FILTER */}
        <div className="flex items-center space-x-2">
          <div className="flex-1 flex items-center bg-white dark:bg-slate-900 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800">
            <FaSearch className="text-slate-400 text-xs mr-2" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rewards..."
              className="w-full bg-transparent text-xs font-semibold outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic(20);
              setOnlyAffordable(!onlyAffordable);
            }}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition flex items-center space-x-1 cursor-pointer ${
              onlyAffordable 
                ? 'bg-emerald-600 text-white border-emerald-600' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <FaFilter className="text-[10px]" />
            <span>Affordable</span>
          </button>
        </div>

        {/* 8. REWARDS CARDS LIST */}
        <div className="space-y-3">
          {filteredRewards.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-2xl">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.badge}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white pt-1">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                {item.description}
              </p>

              <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl flex items-center space-x-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                <FaLeaf className="shrink-0" />
                <span>{item.impact}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline space-x-1">
                  <span className="text-base font-black text-slate-900 dark:text-white">
                    {item.pointsCost}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">pts</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleClaim(item)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Redeem Now
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* MODALS */}
      <UPIPayoutModal 
        isOpen={showUPI}
        onClose={() => setShowUPI(false)}
        userPoints={points}
        onPayoutSuccess={(newPts) => {
          if (updateUserPoints) updateUserPoints(newPts);
        }}
      />

      <SmartKioskLocatorModal 
        isOpen={showKiosk}
        onClose={() => setShowKiosk(false)}
      />

      <PlantTreeModal
        isOpen={showTreeModal}
        onClose={() => setShowTreeModal(false)}
        userPoints={points}
        onTreePlanted={(updatedPts) => {
          if (updateUserPoints) updateUserPoints(updatedPts);
        }}
      />

      {/* STICKY BOTTOM NAV BAR */}
      <MobileCitizenNav />

    </div>
  );
};

export default MobileRedeemRewards;
