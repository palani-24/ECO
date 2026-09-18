import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserLayout from '../../components/UserLayout';
import MobileRedeemRewards from '../../components/MobileRedeemRewards';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import SmartKioskLocatorModal from '../../components/SmartKioskLocatorModal';
import PlantTreeModal from '../../components/PlantTreeModal';
import VoucherQRModal from '../../components/VoucherQRModal';
import api from '../../utils/api';
import { CardSkeleton } from '../../components/LoadingSkeleton';
import { 
  FaCoins, FaGift, FaTicketAlt, FaCheckCircle, 
  FaExclamationTriangle, FaMobileAlt, FaAmazon, FaShoppingCart, 
  FaMapMarkedAlt, FaExchangeAlt, FaTree, FaBolt, FaTint, FaSearch,
  FaFilter, FaQrcode, FaCopy, FaCheck, FaLeaf, FaWater, FaCar,
  FaSun, FaSubway, FaServer, FaDice
} from 'react-icons/fa';

// URL for the Spring Boot Microservice
const SPRING_BOOT_API = 'http://localhost:8085/api/v1/rewards';

const RedeemRewards = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAffordable, setOnlyAffordable] = useState(false);

  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processLoading, setProcessLoading] = useState(false);
  const [springBootActive, setSpringBootActive] = useState(false);

  // Modals
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showKioskModal, setShowKioskModal] = useState(false);
  const [showPlantTreeModal, setShowPlantTreeModal] = useState(false);
  const [selectedVoucherForQR, setSelectedVoucherForQR] = useState(null);

  // Dynamic inputs for cards that require specific identifiers
  const [itemInputs, setItemInputs] = useState({});
  const [copiedCode, setCopiedCode] = useState('');
  const [claimsFilter, setClaimsFilter] = useState('all');

  // Hardcoded rich catalog fallback when Spring Boot service is starting
  const fallbackCatalog = [
    {
      id: 'rw-1', key: 'tree_planting', title: 'Plant a Real Geo-Tagged Tree (Living Seedling)',
      description: 'Sponsor an actual native sapling (Neem/Teak) planted in reserve zones with GPS Coordinates and official certificate.',
      category: 'eco', pointsCost: 500, badge: 'Verified NGO', provider: 'Tamil Nadu Green Mission', icon: '🌳',
      impactDescription: 'Offsets ~22kg CO2/year per tree', isTreeModal: true
    },
    {
      id: 'rw-2', key: 'ocean_plastic', title: 'Recover 2kg Ocean-Bound Plastic',
      description: 'Fund certified coastal recovery operations removing 2,000g of ocean plastics before entering marine ecosystems.',
      category: 'eco', pointsCost: 400, badge: 'Marine Impact', provider: 'CleanSeas Alliance', icon: '🌊',
      impactDescription: 'Recovers 2,000g ocean plastic'
    },
    {
      id: 'rw-3', key: 'metro_pass', title: 'Green Metro Rail & EV Bus Pass (₹100 Recharge)',
      description: 'Instant smart transit credit valid for CMRL Metro trains & Metropolitan Electric Smart Buses.',
      category: 'transit', pointsCost: 350, badge: 'Clean Commute', provider: 'CMRL / Smart Transit', icon: '🚇',
      impactDescription: 'Replaces ~4.2kg vehicular carbon emissions',
      requiresInput: true, inputLabel: 'Smart Card / Mobile No', inputPlaceholder: 'Enter Metro Smart Card Number'
    },
    {
      id: 'rw-4', key: 'ev_charging', title: 'EV Fast Charging Wallet Credits (₹150)',
      description: 'Redeemable across Tata Power EZ Charge, Ather Grid, and Kazam public EV fast charging hubs.',
      category: 'transit', pointsCost: 450, badge: 'Clean Mobility', provider: 'Tata Power / Ather Grid', icon: '⚡',
      impactDescription: 'Powers ~35km zero-emission EV riding',
      requiresInput: true, inputLabel: 'EV App Mobile No', inputPlaceholder: 'e.g. 9876543210'
    },
    {
      id: 'rw-5', key: 'solar_rebate', title: 'Rooftop Solar & Clean Energy Rebate (₹200 Off)',
      description: 'Subsidy rebate certificate towards rooftop solar inspection, grid metering, or green power surcharge.',
      category: 'utility', pointsCost: 600, badge: 'Renewable Power', provider: 'TNERC Green Energy Portal', icon: '☀️',
      impactDescription: 'Supports decentralized rooftop solar generation',
      requiresInput: true, inputLabel: 'Consumer / Solar ID', inputPlaceholder: 'e.g. 04-123-5678'
    },
    {
      id: 'rw-6', key: 'tneb_discount', title: 'TNEB Electricity Bill Rebate (₹150 Off)',
      description: 'Direct rebate coupon for Tamil Nadu Electricity domestic/residential consumer accounts.',
      category: 'utility', pointsCost: 500, badge: 'Smart City', provider: 'TNEB TANGEDCO', icon: '💡',
      impactDescription: 'Promotes domestic energy conservation',
      requiresInput: true, inputLabel: 'TNEB Consumer No', inputPlaceholder: 'e.g. 09-245-001'
    },
    {
      id: 'rw-7', key: 'water_discount', title: 'Metro Water & Tax Discount (₹100 Off)',
      description: 'CMWSSB & Municipal rainwater harvesting and zero-waste civic incentive certificate.',
      category: 'utility', pointsCost: 350, badge: 'Civic Benefit', provider: 'CMWSSB / Smart City', icon: '💧',
      impactDescription: 'Incentivizes water conservation & zero-waste',
      requiresInput: true, inputLabel: 'Water Connection ID', inputPlaceholder: 'CMC Water ID'
    },
    {
      id: 'rw-8', key: 'ecostore_voucher', title: '20% Off Zero-Waste & Organic Store',
      description: 'Unlock a 20% discount code valid on organic foods, bamboo essentials, and compostable goods.',
      category: 'voucher', pointsCost: 250, badge: 'Eco Certified', provider: 'EcoStore Partner Network', icon: '🛍️',
      impactDescription: 'Promotes single-use plastic alternatives'
    },
    {
      id: 'rw-9', key: 'amazon_gc', title: '₹100 Amazon Eco-Friendly Essentials Gift Card',
      description: 'Digital gift voucher code delivered to your registered email for verified sustainable storefronts.',
      category: 'voucher', pointsCost: 800, badge: 'Instant Digital', provider: 'Amazon Pay', icon: '📦',
      impactDescription: 'Usable on certified climate pledge items',
      requiresInput: true, inputLabel: 'Email ID', inputPlaceholder: user?.email || 'user@example.com'
    },
    {
      id: 'rw-10', key: 'mystery_box', title: 'Eco Mystery Lucky Box (Instant Win)',
      description: 'Spend 150 points for a guaranteed surprise: Win up to 500 bonus points, mega discount codes, or tree saplings!',
      category: 'mystery', pointsCost: 150, badge: 'Lucky Draw', provider: 'EcoReward Gamification', icon: '🎁',
      impactDescription: '100% Guaranteed Surprise Outcome!'
    }
  ];

  const fetchRewardsData = async () => {
    setLoading(true);
    let springBootSuccess = false;

    // 1. Try fetching directly from Spring Boot Microservice
    try {
      const springRes = await axios.get(`${SPRING_BOOT_API}/catalog`, { timeout: 2000 });
      if (springRes.data?.success && springRes.data?.data) {
        setCoupons(springRes.data.data);
        setSpringBootActive(true);
        springBootSuccess = true;
      }
    } catch (err) {
      // Spring Boot service not reachable, use fallback catalog
      setSpringBootActive(false);
    }

    if (!springBootSuccess) {
      setCoupons(fallbackCatalog);
    }

    // 2. Fetch User Redemptions
    try {
      const redeemRes = await api.get('/user/redemptions');
      if (redeemRes.data.success) {
        setRedemptions(redeemRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load user redemptions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const handleInputChange = (key, val) => {
    setItemInputs(prev => ({ ...prev, [key]: val }));
  };

  const handleRedeemItem = async (item) => {
    if (item.isTreeModal) {
      setShowPlantTreeModal(true);
      return;
    }

    const requiredInputVal = itemInputs[item.key] || (item.key === 'amazon_gc' ? user?.email : '');
    if (item.requiresInput && !requiredInputVal?.trim()) {
      addToast(`Please enter ${item.inputLabel || 'required details'}`, 'warning', 'Details Required');
      return;
    }

    if ((user?.points || 0) < item.pointsCost) {
      addToast(`You need ${item.pointsCost} points to claim this reward.`, 'error', 'Insufficient Points');
      return;
    }

    setProcessLoading(true);

    // If Spring Boot is active, invoke Spring Boot API
    if (springBootActive) {
      try {
        const springRes = await axios.post(`${SPRING_BOOT_API}/redeem`, {
          userId: user?._id || 'user_current',
          rewardKey: item.key,
          userCurrentPoints: user?.points || 0,
          userInput: requiredInputVal
        });

        if (springRes.data?.success) {
          addToast(`🎉 Claimed ${item.title}! Code: ${springRes.data.claim.voucherCode}`, 'reward', 'Voucher Unlocked');
          updateUserPoints(springRes.data.remainingPoints);
          fetchRewardsData();
          setItemInputs(prev => ({ ...prev, [item.key]: '' }));
          setProcessLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Spring Boot redeem failed, falling back to standard API', err);
      }
    }

    // Fallback: Use standard Express API
    try {
      const payload = {
        rewardType: item.key === 'tneb_discount' || item.key === 'water_discount' || item.key === 'ecostore_voucher' ? 'discount' : item.key,
        title: item.title,
        provider: item.provider,
        pointsCost: item.pointsCost,
        consumerNo: requiredInputVal,
        email: requiredInputVal || user?.email
      };

      const res = await api.post('/user/redeem', payload);
      setProcessLoading(false);

      if (res.data.success) {
        addToast(`🎉 Reward Redeemed! Voucher Code: ${res.data.data.details.code}`, 'reward', 'Voucher Unlocked!');
        updateUserPoints(res.data.remainingPoints);
        fetchRewardsData();
        setItemInputs(prev => ({ ...prev, [item.key]: '' }));
      }
    } catch (err) {
      setProcessLoading(false);
      const msg = err.response?.data?.message || 'Failed to process redemption.';
      addToast(msg, 'error', 'Redemption Failed');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    addToast('Code copied to clipboard!', 'success', 'Copied');
    setTimeout(() => setCopiedCode(''), 2500);
  };

  // Filter items
  const filteredCatalog = useMemo(() => {
    return coupons.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Affordability filter
      if (onlyAffordable && (user?.points || 0) < item.pointsCost) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesProvider = item.provider?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesProvider && !matchesDesc) return false;
      }
      return true;
    });
  }, [coupons, activeCategory, onlyAffordable, searchQuery, user?.points]);

  // Filter claimed vouchers
  const filteredClaims = useMemo(() => {
    return redemptions.filter(c => {
      if (claimsFilter === 'active') {
        return c.status === 'completed' || c.status === 'pending';
      }
      return true;
    });
  }, [redemptions, claimsFilter]);

  return (
    <>
      {/* 📱 MOBILE VIEW - Screenshot 2 Exact Match */}
      <div className="block md:hidden">
        <MobileRedeemRewards />
      </div>

      {/* 💻 DESKTOP WORKSPACE VIEW */}
      <div className="hidden md:block">
        <UserLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Redeem Points</h2>
              {springBootActive ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                  <span>Spring Boot 3 Engine Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <FaServer className="text-slate-400 text-[9px]" />
                  <span>Eco Microservice Connected</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exchange your points for green transit passes, real trees, smart utility bill rebates, and eco-deals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowUPIModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center space-x-2 transition-transform active:scale-95 cursor-pointer"
            >
              <FaExchangeAlt />
              <span>Withdraw Cash (UPI)</span>
            </button>

            <button
              onClick={() => setShowKioskModal(true)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl flex items-center space-x-2 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <FaMapMarkedAlt className="text-emerald-500" />
              <span>Smart Kiosks</span>
            </button>

            {/* Live Wallet Points Badge */}
            <div className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 font-black rounded-2xl shadow-inner">
              <FaCoins className="h-4 w-4 animate-bounce text-amber-500" />
              <span className="text-sm">{user?.points || 0} Points</span>
            </div>
          </div>
        </div>

        {/* Environmental Community Impact Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-sky-900/10 dark:from-slate-900 dark:to-slate-850 p-4 rounded-3xl border border-emerald-500/20 shadow-sm">
          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shadow-sm">
              🌳
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 dark:text-white">142+ Trees</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Geo-tagged & Planted</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center text-lg shadow-sm">
              🌊
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 dark:text-white">380 kg</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Ocean Plastic Recovered</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg shadow-sm">
              🚇
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 dark:text-white">1,250 km</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Clean Metro Commuting</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center text-lg shadow-sm">
              ⚡
            </div>
            <div>
              <span className="block text-sm font-black text-slate-900 dark:text-white">₹1.8L+ Saved</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Utility & Power Rebates</span>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', label: 'All Rewards', icon: '🌟' },
              { id: 'eco', label: 'Eco Impact', icon: '🌱' },
              { id: 'transit', label: 'Green Transit & EV', icon: '🚇' },
              { id: 'utility', label: 'Smart Utilities', icon: '⚡' },
              { id: 'voucher', label: 'Partner Deals', icon: '🎟️' },
              { id: 'mystery', label: 'Mystery Lucky Box', icon: '🎁' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap flex items-center space-x-1.5 transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200/70 dark:border-slate-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search & Affordability Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search rewards..."
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={() => setOnlyAffordable(prev => !prev)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 border transition-all cursor-pointer ${
                onlyAffordable
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-600 dark:text-emerald-400'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
              title="Show only items I can afford"
            >
              <FaFilter className="text-[10px]" />
              <span>Affordable</span>
            </button>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left 2 Cols: Rewards Grid */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <span className="text-4xl block">🔍</span>
                <h4 className="font-extrabold text-slate-800 dark:text-slate-200">No Rewards Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms or uncheck the "Affordable" filter to see all eco rewards.
                </p>
                <button
                  onClick={() => { setActiveCategory('all'); setSearchQuery(''); setOnlyAffordable(false); }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredCatalog.map(item => {
                  const canAfford = (user?.points || 0) >= item.pointsCost;
                  const isMystery = item.category === 'mystery';
                  const isEcoFeatured = item.category === 'eco';

                  return (
                    <div
                      key={item.id || item.key}
                      className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between h-full relative overflow-hidden ${
                        isMystery
                          ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-indigo-950/40 border-purple-500/40 hover:border-purple-400 shadow-md sm:col-span-2'
                          : isEcoFeatured && item.key === 'tree_planting'
                          ? 'bg-gradient-to-br from-emerald-950/30 to-slate-900 border-emerald-500/40 hover:border-emerald-500 shadow-md sm:col-span-2'
                          : 'bg-white dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm'
                      }`}
                    >
                      {/* Top Meta info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl">{item.icon}</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.badge || item.provider}
                            </span>
                            {item.stock && item.stock < 200 && (
                              <span className="text-[10px] text-amber-500 font-bold">Few Left</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                            {item.description}
                          </p>
                        </div>

                        {/* Impact Tag */}
                        {item.impactDescription && (
                          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">
                            <FaLeaf className="text-[9px]" />
                            <span>{item.impactDescription}</span>
                          </div>
                        )}

                        {/* Input requirement if applicable */}
                        {item.requiresInput && (
                          <div className="pt-2">
                            <input
                              type="text"
                              value={itemInputs[item.key] || ''}
                              onChange={e => handleInputChange(item.key, e.target.value)}
                              placeholder={item.inputPlaceholder || 'Enter identifier'}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Footer & Action */}
                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center space-x-1">
                          <FaCoins className="text-amber-500 text-xs" />
                          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                            {item.pointsCost} <span className="text-[10px] font-medium text-slate-400">pts</span>
                          </span>
                        </div>

                        <button
                          onClick={() => handleRedeemItem(item)}
                          disabled={processLoading || !canAfford}
                          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed ${
                            isMystery
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95'
                              : isEcoFeatured
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95'
                              : canAfford
                              ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-sm active:scale-95'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 opacity-60'
                          }`}
                        >
                          {isMystery ? <FaDice /> : null}
                          <span>
                            {item.isTreeModal 
                              ? 'Plant & Certify' 
                              : isMystery 
                              ? 'Roll Mystery Box' 
                              : canAfford 
                              ? 'Claim Reward' 
                              : 'Need Points'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Col: Interactive My Claims & Codes */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 dark:text-white flex items-center space-x-2 text-sm">
                  <FaGift className="text-emerald-500" />
                  <span>My Claims & Codes</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  {redemptions.length} claimed
                </span>
              </div>

              {/* Status filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setClaimsFilter('all')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-xl border transition-colors ${
                    claimsFilter === 'all'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  All History
                </button>
                <button
                  onClick={() => setClaimsFilter('active')}
                  className={`flex-1 py-1 text-[11px] font-bold rounded-xl border transition-colors ${
                    claimsFilter === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  Active Codes
                </button>
              </div>

              {/* Claims List */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredClaims.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <span className="text-3xl block">🎟️</span>
                    <p className="text-xs font-semibold text-slate-400">No claimed vouchers yet.</p>
                    <p className="text-[11px] text-slate-500">Pick any reward from the left to unlock codes instantly.</p>
                  </div>
                ) : (
                  filteredClaims.map((claim, idx) => {
                    const code = claim.details?.code || claim.voucherCode;
                    const title = claim.details?.title || claim.title || 'EcoReward Voucher';
                    const provider = claim.details?.provider || claim.provider || 'Partner';
                    const isCopied = copiedCode === code;

                    return (
                      <div
                        key={claim._id || claim.id || idx}
                        className="p-4 bg-slate-50/70 dark:bg-slate-850/50 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-2.5 transition-all hover:border-emerald-500/40"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5">
                            <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-200 leading-snug">
                              {title}
                            </h5>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              {provider}
                            </span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            claim.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}>
                            {claim.status || 'Active'}
                          </span>
                        </div>

                        {/* Code box with Copy and QR Code trigger */}
                        {code && (
                          <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                            <div className="flex flex-col">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Voucher Code</span>
                              <span className="text-[11px] font-mono font-black text-slate-800 dark:text-emerald-400 select-all">
                                {code}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Show QR Code modal button */}
                              <button
                                onClick={() => setSelectedVoucherForQR(claim)}
                                title="Show QR Code for scanning"
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors cursor-pointer"
                              >
                                <FaQrcode />
                              </button>

                              {/* 1-Click Copy Code Button */}
                              <button
                                onClick={() => handleCopy(code)}
                                title="Copy voucher code"
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center space-x-1 transition-all cursor-pointer ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                }`}
                              >
                                {isCopied ? <FaCheck className="text-[9px]" /> : <FaCopy className="text-[9px]" />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                          <span>Points: <strong className="text-slate-700 dark:text-slate-300">{claim.pointsRedeemed || 0} pts</strong></span>
                          <span>{claim.details?.email || claim.metadata || 'Instant Voucher'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Eco Tips Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                <FaLeaf />
                <span>Zero Carbon Mission</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                By redeeming Green Metro passes and EV charging credits, you directly subsidize clean urban transport in your city.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <UPIPayoutModal
        isOpen={showUPIModal}
        onClose={() => setShowUPIModal(false)}
        userPoints={user?.points || 0}
        onPayoutSuccess={(newPoints) => {
          updateUserPoints(newPoints);
          fetchRewardsData();
        }}
      />

      <SmartKioskLocatorModal
        isOpen={showKioskModal}
        onClose={() => setShowKioskModal(false)}
      />

      <PlantTreeModal
        isOpen={showPlantTreeModal}
        onClose={() => setShowPlantTreeModal(false)}
        userPoints={user?.points || 0}
        onTreePlanted={(cost, cert) => {
          updateUserPoints(Math.max(0, (user?.points || 0) - cost));
          fetchRewardsData();
        }}
      />

      <VoucherQRModal
        isOpen={!!selectedVoucherForQR}
        onClose={() => setSelectedVoucherForQR(null)}
        voucher={selectedVoucherForQR}
      />
        </UserLayout>
      </div>
    </>
  );
};

export default RedeemRewards;
