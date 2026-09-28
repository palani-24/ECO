import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserLayout from '../../components/UserLayout';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import { triggerConfetti } from '../../utils/confetti';
import { soundFx } from '../../utils/audioFeedback';
import { triggerHaptic } from '../../utils/mobileNative';
import { 
  FaCoins, FaExchangeAlt, FaShieldAlt, FaLock, FaCheckCircle, 
  FaQrcode, FaShoppingBag, FaHistory, FaArrowDown, FaArrowUp, 
  FaTruck, FaLeaf, FaReceipt, FaPlus, FaTimes, FaCheck, FaSearch, 
  FaFilter, FaCreditCard, FaBolt, FaUniversity, FaMobileAlt,
  FaFileInvoiceDollar, FaStore
} from 'react-icons/fa';

// Curated Eco-Products (100% Derived from Recycled Waste or Zero-Waste Alternatives)
const ECO_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Organic Vermicompost (5kg Pack)',
    tagline: '100% Municipal Organic Bio-Waste Derived',
    description: 'Enriched soil fertilizer crafted from segregated organic kitchen bio-waste. Odorless, NPK rich, and certified organic.',
    priceRupees: 149,
    pointsPrice: 596,
    icon: '🌱',
    badge: 'BIO-WASTE DERIVED',
    rating: 4.9,
    reviews: 142,
    stock: 45,
    carbonSavedKg: 18.5,
    deliveryDays: 'Tomorrow, by 2 PM'
  },
  {
    id: 'prod-2',
    name: 'Cornstarch Trash Bags (60 Pack)',
    tagline: 'CPCB Certified 100% Compostable',
    description: 'Tough, leak-proof garbage bags made from natural corn starch. Degrades naturally in 90 days with zero microplastics.',
    priceRupees: 129,
    pointsPrice: 516,
    icon: '🗑️',
    badge: 'ZERO PLASTIC',
    rating: 4.8,
    reviews: 98,
    stock: 120,
    carbonSavedKg: 9.2,
    deliveryDays: '2 Days Delivery'
  },
  {
    id: 'prod-3',
    name: 'Dual Waste Segregation Bins (Wet & Dry)',
    tagline: 'Molded from 100% Ocean Recycled HDPE',
    description: 'Foot pedal-operated dual household sorting system. Color-coded green & blue with odor-seal lids.',
    priceRupees: 449,
    pointsPrice: 1796,
    icon: '♻️',
    badge: 'RECYCLED POLYMER',
    rating: 5.0,
    reviews: 64,
    stock: 28,
    carbonSavedKg: 34.0,
    deliveryDays: 'Tomorrow, by 6 PM'
  },
  {
    id: 'prod-4',
    name: 'Zero-Waste Bamboo Personal Kit',
    tagline: 'Sustainable Daily Grooming & Hydration',
    description: 'Includes bamboo charcoal toothbrushes, steel thermal flask, copper straw, and organic cotton mesh pouch.',
    priceRupees: 279,
    pointsPrice: 1116,
    icon: '🎋',
    badge: 'ECO ESSENTIALS',
    rating: 4.9,
    reviews: 210,
    stock: 75,
    carbonSavedKg: 14.8,
    deliveryDays: '2 Days Delivery'
  },
  {
    id: 'prod-5',
    name: 'Kitchen Bokashi Indoor Composter (15L)',
    tagline: 'Convert Food Scraps Odor-Free',
    description: 'Compact airtight fermentation bin with microbial bran culture for apartments. Produces liquid compost tea.',
    priceRupees: 699,
    pointsPrice: 2796,
    icon: '🪱',
    badge: 'HOME COMPOSTING',
    rating: 4.8,
    reviews: 43,
    stock: 19,
    carbonSavedKg: 52.0,
    deliveryDays: 'Tomorrow, by 5 PM'
  },
  {
    id: 'prod-6',
    name: 'Solar Motion-Sensor Garden Floodlight',
    tagline: 'Zero Electricity Outdoor Illumination',
    description: 'High-efficiency monocrystalline solar panel with 1200mAh battery. Auto dusk-to-dawn sensor and IP65 waterproof.',
    priceRupees: 399,
    pointsPrice: 1596,
    icon: '☀️',
    badge: 'CLEAN ENERGY',
    rating: 4.7,
    reviews: 86,
    stock: 52,
    carbonSavedKg: 28.4,
    deliveryDays: '3 Days Delivery'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-90281',
    type: 'credit_waste',
    title: 'Doorstep Pickup Credited',
    subtitle: 'Order #6AB7D28F - 8.5 kg Plastics & E-Waste verified',
    amountRupees: 180,
    points: 720,
    isCredit: true,
    timestamp: 'Today, 10:24 AM',
    status: 'Completed',
    mode: 'Doorstep Weighed & Credited'
  },
  {
    id: 'TXN-90142',
    type: 'debit_payout',
    title: 'Instant Bank UPI Cashout',
    subtitle: 'Sent to citizen@okaxis via NPCI IMPS Rail',
    amountRupees: 150,
    points: 600,
    isCredit: false,
    timestamp: 'Yesterday, 04:15 PM',
    status: 'Completed',
    mode: 'Bank UPI Fast Payout'
  },
  {
    id: 'TXN-89823',
    type: 'debit_purchase',
    title: 'Product Order: Cornstarch Trash Bags',
    subtitle: 'Paid using Eco-Wallet Balance • Delivered to Race Course Rd',
    amountRupees: 129,
    points: 516,
    isCredit: false,
    timestamp: '25 Sep 2026, 02:40 PM',
    status: 'Delivered',
    mode: 'Eco-Wallet Direct Pay'
  },
  {
    id: 'TXN-89211',
    type: 'credit_bonus',
    title: 'Weekly Segregation Champion Reward',
    subtitle: '100% Dry/Wet Segregation accuracy audit bonus',
    amountRupees: 50,
    points: 200,
    isCredit: true,
    timestamp: '22 Sep 2026, 09:00 AM',
    status: 'Completed',
    mode: 'Civic Bonus Incentive'
  }
];

const RedeemRewards = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();

  // Active Points & Wallet Cash State
  const initialPoints = user?.points || 2392;
  const [points, setPoints] = useState(initialPoints);
  const [walletCash, setWalletCash] = useState(() => {
    const saved = localStorage.getItem('eco_wallet_cash');
    return saved ? Number(saved) : Math.round(initialPoints * 0.25);
  });

  // Navigation Tabs: 'store' | 'passbook' | 'convert'
  const [activeTab, setActiveTab] = useState('store');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showScanPayModal, setShowScanPayModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutPaymentMode, setCheckoutPaymentMode] = useState('wallet'); // 'wallet' | 'points' | 'upi'
  const [checkoutAddress, setCheckoutAddress] = useState('124 Avinashi Road, Race Course, Coimbatore - 641018');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Conversion Tool State
  const [pointsToConvert, setPointsToConvert] = useState(400);

  // Scan & Pay Modal State
  const [merchantUpi, setMerchantUpi] = useState('ecostore@upi');
  const [merchantAmount, setMerchantAmount] = useState('150');
  const [isPayingMerchant, setIsPayingMerchant] = useState(false);

  // Save wallet balance
  useEffect(() => {
    localStorage.setItem('eco_wallet_cash', walletCash.toString());
  }, [walletCash]);

  // Sync with auth user points
  useEffect(() => {
    if (user?.points) setPoints(user.points);
  }, [user?.points]);

  // 1-Click Points to Cash Converter
  const handleConvertPoints = (pts) => {
    if (pts > points) {
      addToast('Insufficient EcoPoints balance to convert', 'warning', 'Low Balance');
      return;
    }
    triggerHaptic(30);
    const addedCash = Math.round(pts * 0.25);
    const newPoints = points - pts;
    const newCash = walletCash + addedCash;

    setPoints(newPoints);
    setWalletCash(newCash);
    if (updateUserPoints) updateUserPoints(newPoints);

    // Add to transaction ledger
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'credit_convert',
      title: 'Converted Points to Wallet Cash',
      subtitle: `Exchanged ${pts} EcoPoints at 4:1 guaranteed rate`,
      amountRupees: addedCash,
      points: pts,
      isCredit: true,
      timestamp: 'Just now',
      status: 'Completed',
      mode: 'Wallet Point Conversion'
    };
    setTransactions(prev => [newTxn, ...prev]);

    triggerConfetti({ count: 80 });
    soundFx?.playSuccessChime?.();
    addToast(`+₹${addedCash}.00 added to Wallet Cash!`, 'success', 'Points Converted');
  };

  // Buy Eco-Product Flow (Using Wallet Balance or Points)
  const handleConfirmOrder = () => {
    if (!selectedProduct) return;
    setIsOrdering(true);
    triggerHaptic(30);

    setTimeout(() => {
      let finalDeductionText = '';
      if (checkoutPaymentMode === 'wallet') {
        if (walletCash < selectedProduct.priceRupees) {
          addToast('Insufficient Wallet balance. Please top up or convert points.', 'warning', 'Low Balance');
          setIsOrdering(false);
          return;
        }
        setWalletCash(prev => prev - selectedProduct.priceRupees);
        finalDeductionText = `₹${selectedProduct.priceRupees} deducted from Wallet Cash`;
      } else if (checkoutPaymentMode === 'points') {
        if (points < selectedProduct.pointsPrice) {
          addToast('Insufficient EcoPoints to buy this product.', 'warning', 'Low Points');
          setIsOrdering(false);
          return;
        }
        const newPts = points - selectedProduct.pointsPrice;
        setPoints(newPts);
        if (updateUserPoints) updateUserPoints(newPts);
        finalDeductionText = `${selectedProduct.pointsPrice} EcoPoints deducted`;
      } else {
        finalDeductionText = `Paid via UPI Fast Gateway`;
      }

      // Record Order in Ledger
      const orderId = `ECO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'debit_purchase',
        title: `Store Purchase: ${selectedProduct.name}`,
        subtitle: `Order #${orderId} • Delivered to ${checkoutAddress.slice(0, 25)}...`,
        amountRupees: selectedProduct.priceRupees,
        points: selectedProduct.pointsPrice,
        isCredit: false,
        timestamp: 'Just now',
        status: 'Confirmed',
        mode: checkoutPaymentMode === 'wallet' ? 'Eco-Wallet Direct' : checkoutPaymentMode === 'points' ? 'EcoPoints Redeemed' : 'UPI Fast Rail'
      };
      setTransactions(prev => [orderTxn, ...prev]);

      setOrderReceipt({
        orderId,
        productName: selectedProduct.name,
        price: selectedProduct.priceRupees,
        deliveryDays: selectedProduct.deliveryDays,
        address: checkoutAddress,
        paymentMode: checkoutPaymentMode === 'wallet' ? 'Eco-Wallet Cash' : checkoutPaymentMode === 'points' ? 'EcoPoints' : 'UPI Instant Pay'
      });

      setIsOrdering(false);
      triggerConfetti({ count: 120 });
      soundFx?.playSuccessChime?.();
      addToast(`Order placed for ${selectedProduct.name}!`, 'success', 'Order Confirmed');
    }, 600);
  };

  // Merchant Scan & Pay Flow
  const handleProcessMerchantPay = (e) => {
    e.preventDefault();
    const amountNum = Number(merchantAmount);
    if (!amountNum || amountNum <= 0) {
      addToast('Please enter a valid payment amount', 'warning', 'Invalid Amount');
      return;
    }
    if (amountNum > walletCash) {
      addToast('Insufficient Wallet Cash balance', 'warning', 'Low Balance');
      return;
    }

    setIsPayingMerchant(true);
    triggerHaptic(30);

    setTimeout(() => {
      setWalletCash(prev => prev - amountNum);
      const payTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'debit_merchant',
        title: `Merchant Scan & Pay to ${merchantUpi}`,
        subtitle: `Instant QR Payment via Eco-Wallet Balance`,
        amountRupees: amountNum,
        points: amountNum * 4,
        isCredit: false,
        timestamp: 'Just now',
        status: 'Completed',
        mode: 'Merchant Scan & Pay'
      };
      setTransactions(prev => [payTxn, ...prev]);

      setIsPayingMerchant(false);
      setShowScanPayModal(false);
      triggerConfetti({ count: 90 });
      soundFx?.playSuccessChime?.();
      addToast(`₹${amountNum} paid to ${merchantUpi} successfully!`, 'success', 'Payment Sent');
    }, 600);
  };

  // Handle successful payout from modal
  const handlePayoutSuccess = (newRemainingPoints) => {
    setPoints(newRemainingPoints);
    if (updateUserPoints) updateUserPoints(newRemainingPoints);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return ECO_PRODUCTS.filter(p => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery]);

  return (
    <UserLayout>
      <div className="space-y-6 pb-16">
        
        {/* ========================================================================= */}
        {/* 1. EXECUTIVE ECO-WALLET & ONLINE TRANSACTIONS COMMAND CENTER             */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-300 shadow-xl shadow-slate-900/5 space-y-6">
          
          {/* Top Row: Wallet Card Identity & Live Status */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-xl shadow-xs">
                  <FaCoins className="text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Eco-Wallet & Payments Hub
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                      NPCI 24x7
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Convert scrap earnings to cash, buy eco-products, or pay merchants online
                  </p>
                </div>
              </div>
            </div>

            {/* Dual Wallet Display (Available Cash + EcoPoints) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Wallet Cash Balance Box */}
              <div className="px-4 py-2.5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl flex items-center space-x-3.5 shadow-xs">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                    Wallet Cash Balance
                  </span>
                  <span className="text-xl font-black text-slate-900 leading-none">
                    ₹{walletCash}.00
                  </span>
                </div>
                <div className="h-8 w-[1.5px] bg-emerald-200" />
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                    EcoPoints
                  </span>
                  <span className="text-sm font-black text-amber-600 leading-none">
                    {points} pts
                  </span>
                </div>
              </div>

              {/* 1-Click Convert Points to Cash Shortcut */}
              <button
                onClick={() => setActiveTab('convert')}
                className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs rounded-2xl border-2 border-amber-300 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                title="Convert points into cash balance"
              >
                <FaBolt className="text-amber-500" />
                <span>Convert to Cash</span>
              </button>
            </div>
          </div>

          {/* 4 Core Financial Transaction Action Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t-2 border-slate-100">
            
            {/* Action 1: Instant Bank UPI Cashout */}
            <button
              onClick={() => setShowUPIModal(true)}
              className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl border-2 border-emerald-600 shadow-md shadow-emerald-600/20 flex flex-col justify-between items-start transition cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between w-full">
                <FaExchangeAlt className="text-base" />
                <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">INSTANT</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black">Withdraw Cash (UPI)</div>
                <div className="text-[10px] text-emerald-100 font-medium">To GPay, PhonePe, Bank</div>
              </div>
            </button>

            {/* Action 2: Merchant Scan & Pay QR */}
            <button
              onClick={() => setShowScanPayModal(true)}
              className="p-3.5 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col justify-between items-start transition cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between w-full">
                <FaQrcode className="text-base text-emerald-600" />
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">ZERO FEE</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black text-slate-900">Scan & Pay QR</div>
                <div className="text-[10px] text-slate-500 font-semibold">Pay stores from wallet</div>
              </div>
            </button>

            {/* Action 3: In-App Eco Store */}
            <button
              onClick={() => setActiveTab('store')}
              className={`p-3.5 rounded-2xl border-2 shadow-xs flex flex-col justify-between items-start transition cursor-pointer group active:scale-98 ${
                activeTab === 'store' 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <FaShoppingBag className="text-base text-emerald-600" />
                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-200">ECO SHOP</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black text-slate-900">Buy Eco Products</div>
                <div className="text-[10px] text-slate-500 font-semibold">Pay with wallet balance</div>
              </div>
            </button>

            {/* Action 4: Transaction Passbook */}
            <button
              onClick={() => setActiveTab('passbook')}
              className={`p-3.5 rounded-2xl border-2 shadow-xs flex flex-col justify-between items-start transition cursor-pointer group active:scale-98 ${
                activeTab === 'passbook' 
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-800' 
                  : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <FaHistory className="text-base text-emerald-600" />
                <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded-full border border-slate-200">STATEMENT</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black text-slate-900">Online Passbook</div>
                <div className="text-[10px] text-slate-500 font-semibold">View transaction ledger</div>
              </div>
            </button>

          </div>

          {/* Security & Bank Grade Assurance Bar */}
          <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] font-bold text-slate-600">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1.5 text-slate-800 font-black">
                <FaLock className="text-emerald-600" /> 256-Bit SSL Encrypted
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <FaCheckCircle className="text-emerald-500" /> Direct NPCI IMPS Rail
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-slate-700">
                <FaCheckCircle className="text-emerald-500" /> 0% Transaction Surcharge
              </span>
            </div>
            <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              Guaranteed Value: 4 EcoPoints = ₹1.00 Cash
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. TAB CONTENT SWITCHER                                                  */}
        {/* ========================================================================= */}
        
        {/* TAB 1: ZERO-WASTE ECO COMMERCE STORE */}
        {activeTab === 'store' && (
          <div className="space-y-5">
            
            {/* Store Header & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-slate-300 shadow-md shadow-slate-900/5">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <FaStore className="text-emerald-600" />
                  <h3 className="text-base font-black text-slate-900">
                    Zero-Waste Green Market
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800 border border-emerald-300">
                    6 Products Available
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  Buy certified eco-friendly household goods using your Eco-Wallet balance or points
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const canAffordCash = walletCash >= product.priceRupees;
                const canAffordPoints = points >= product.pointsPrice;

                return (
                  <div
                    key={product.id}
                    className="p-5 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-300 hover:border-emerald-500 transition-all shadow-md shadow-slate-900/5 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Product Badge & Eco Rating */}
                      <div className="flex items-center justify-between">
                        <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-200">
                          {product.icon}
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {product.badge}
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-500 flex items-center gap-0.5">
                            ★ {product.rating}
                          </span>
                        </div>
                      </div>

                      {/* Product Name & Details */}
                      <div>
                        <h4 className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-700 transition">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-extrabold mt-0.5">
                          {product.tagline}
                        </p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      {/* Carbon Saved Strip */}
                      <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span className="flex items-center gap-1 text-emerald-700 font-black">
                          <FaLeaf className="text-emerald-600" /> -{product.carbonSavedKg} kg CO₂
                        </span>
                        <span>🚚 {product.deliveryDays}</span>
                      </div>
                    </div>

                    {/* Price & Instant Buy Actions */}
                    <div className="pt-3 border-t-2 border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-slate-900">₹{product.priceRupees}</span>
                          <span className="text-[11px] text-slate-400 font-bold ml-1.5">or {product.pointsPrice} pts</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          Stock: {product.stock} units
                        </span>
                      </div>

                      {/* Buy Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setCheckoutPaymentMode('wallet');
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-black border-2 transition flex items-center justify-center space-x-1 cursor-pointer active:scale-98 ${
                            canAffordCash
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600 shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          <FaShoppingBag className="text-[10px]" />
                          <span>Buy with Cash</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setCheckoutPaymentMode('points');
                          }}
                          className={`py-2 px-2.5 rounded-xl text-xs font-black border-2 transition flex items-center justify-center space-x-1 cursor-pointer active:scale-98 ${
                            canAffordPoints
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                          }`}
                        >
                          <FaCoins className="text-[10px]" />
                          <span>Use Points</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: ONLINE TRANSACTIONS & PASSBOOK LEDGER */}
        {activeTab === 'passbook' && (
          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-300 shadow-xl shadow-slate-900/5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-emerald-600" />
                    <span>Online Transactions Passbook</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Official financial statement of scrap collection earnings, UPI withdrawals, and purchases
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black">
                    {transactions.length} Records Logged
                  </span>
                </div>
              </div>

              {/* Transactions Feed */}
              <div className="space-y-3">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-4 rounded-2xl bg-white border-2 border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-lg border-2 shrink-0 ${
                        txn.isCredit 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}>
                        {txn.isCredit ? <FaArrowDown /> : <FaArrowUp />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-xs font-black text-slate-900">{txn.title}</h5>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            txn.isCredit
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {txn.mode}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {txn.subtitle}
                        </p>
                        <span className="text-[10px] text-slate-400 font-bold block">
                          ID: {txn.id} • {txn.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <span className={`text-base font-black ${
                        txn.isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {txn.isCredit ? '+' : '-'}₹{txn.amountRupees}.00
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        ({txn.points} Pts equivalent)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INSTANT POINTS TO CASH CONVERTER */}
        {activeTab === 'convert' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-slate-300 shadow-xl shadow-slate-900/5 max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex p-3 bg-amber-50 text-amber-500 rounded-2xl border-2 border-amber-200 text-2xl shadow-xs">
                <FaBolt />
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Points-to-Cash Instant Converter
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Exchange your verified EcoPoints directly into spendable Wallet Cash at a fixed 4:1 rate
              </p>
            </div>

            {/* Live Exchange Rate Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Available EcoPoints</span>
                <span className="text-lg font-black text-slate-900">{points} Pts</span>
              </div>
              <div className="text-center px-4 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-black text-emerald-700">4 EcoPoints = ₹1.00 Cash</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">Total Potential Cash</span>
                <span className="text-lg font-black text-emerald-600">₹{Math.round(points * 0.25)}.00</span>
              </div>
            </div>

            {/* Quick Conversion Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">
                Choose Conversion Amount:
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { pts: 200, cash: 50 },
                  { pts: 400, cash: 100 },
                  { pts: 1000, cash: 250 },
                  { pts: points, cash: Math.round(points * 0.25) }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleConvertPoints(item.pts)}
                    disabled={item.pts > points || points <= 0}
                    className="p-3 bg-white hover:bg-slate-50 disabled:opacity-40 border-2 border-slate-300 hover:border-emerald-500 rounded-2xl text-center transition cursor-pointer shadow-2xs active:scale-98"
                  >
                    <div className="text-sm font-black text-slate-900">₹{item.cash}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{item.pts} Pts</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-500 font-bold">
              ⚡ Converted money is immediately ready for Bank UPI Cashout or buying Eco Products!
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MODALS                                                                */}
        {/* ========================================================================= */}

        {/* Product Checkout Modal (Pay with Wallet / Points / UPI) */}
        {selectedProduct && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 text-slate-800 shadow-2xl max-h-[94vh] overflow-y-auto my-auto">
              
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setOrderReceipt(null);
                }}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              {orderReceipt ? (
                /* Order Confirmation Screen */
                <div className="py-3 text-center space-y-4">
                  <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 border-2 border-emerald-200 shadow-sm">
                    <FaCheck className="w-10 h-10" />
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      Order Placed Successfully
                    </span>
                    <h4 className="text-xl font-black text-slate-900 pt-1.5">{orderReceipt.productName}</h4>
                    <p className="text-xs text-slate-500 font-semibold">Order ID: {orderReceipt.orderId}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Amount Paid:</span>
                      <span className="font-black text-slate-900">₹{orderReceipt.price}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Payment Mode:</span>
                      <span className="font-black text-emerald-700">{orderReceipt.paymentMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Estimated Delivery:</span>
                      <span className="font-bold text-slate-800">{orderReceipt.deliveryDays}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 text-[11px] text-slate-600 font-medium">
                      📍 Delivering to: {orderReceipt.address}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setOrderReceipt(null);
                    }}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 cursor-pointer transition active:scale-98"
                  >
                    Done & Return to Market
                  </button>
                </div>
              ) : (
                /* Checkout Form */
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
                    <span className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-200">
                      {selectedProduct.icon}
                    </span>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{selectedProduct.name}</h4>
                      <p className="text-xs font-bold text-emerald-700">{selectedProduct.tagline}</p>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="text-xs font-black text-slate-800 block mb-1.5">
                      Choose Payment Method:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMode('wallet')}
                        className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                          checkoutPaymentMode === 'wallet'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black flex items-center justify-between">
                          <span>Eco-Wallet Cash</span>
                          <FaCheckCircle className={checkoutPaymentMode === 'wallet' ? 'text-emerald-600' : 'text-transparent'} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Bal: ₹{walletCash}.00
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCheckoutPaymentMode('points')}
                        className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer ${
                          checkoutPaymentMode === 'points'
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs font-black flex items-center justify-between">
                          <span>EcoPoints</span>
                          <FaCheckCircle className={checkoutPaymentMode === 'points' ? 'text-amber-600' : 'text-transparent'} />
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                          Cost: {selectedProduct.pointsPrice} pts
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="text-xs font-black text-slate-800 block mb-1.5">
                      Delivery Address:
                    </label>
                    <input
                      type="text"
                      value={checkoutAddress}
                      onChange={(e) => setCheckoutAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Order Total Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs space-y-1.5 font-semibold text-slate-600">
                    <div className="flex justify-between">
                      <span>Item Price:</span>
                      <span className="font-bold text-slate-900">₹{selectedProduct.priceRupees}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Green Packaging & Delivery:</span>
                      <span className="font-bold text-emerald-600">FREE</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1.5 flex justify-between font-black text-slate-900 text-sm">
                      <span>Total Payable:</span>
                      <span>
                        {checkoutPaymentMode === 'points' 
                          ? `${selectedProduct.pointsPrice} pts` 
                          : `₹${selectedProduct.priceRupees}.00`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(null)}
                      className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      disabled={isOrdering}
                      className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <FaLock className="text-xs" />
                      <span>{isOrdering ? 'Processing Order...' : 'Pay & Confirm Order'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scan & Pay Merchant QR Modal */}
        {showScanPayModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 text-slate-800 shadow-2xl">
              <button
                onClick={() => setShowScanPayModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xl">
                  <FaQrcode />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Scan & Pay from Wallet</h4>
                  <p className="text-xs text-slate-500 font-semibold">Pay any merchant or friend using Eco-Wallet balance</p>
                </div>
              </div>

              <form onSubmit={handleProcessMerchantPay} className="space-y-4 pt-3">
                <div className="p-3 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex justify-between items-center text-xs">
                  <span className="text-emerald-800 font-bold">Wallet Cash Balance:</span>
                  <span className="font-black text-slate-900 text-sm">₹{walletCash}.00</span>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">Merchant UPI / QR Handle:</label>
                  <input
                    type="text"
                    value={merchantUpi}
                    onChange={(e) => setMerchantUpi(e.target.value)}
                    placeholder="e.g. greencafe@okaxis, shop@paytm"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">Amount to Pay (₹):</label>
                  <input
                    type="number"
                    value={merchantAmount}
                    onChange={(e) => setMerchantAmount(e.target.value)}
                    placeholder="150"
                    max={walletCash}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-black text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowScanPayModal(false)}
                    className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPayingMerchant || Number(merchantAmount) > walletCash}
                    className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <FaLock className="text-xs" />
                    <span>{isPayingMerchant ? 'Processing Payment...' : `Pay ₹${merchantAmount} from Wallet`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bank UPI Cashout Modal (High-Security White Theme) */}
        <UPIPayoutModal
          isOpen={showUPIModal}
          onClose={() => setShowUPIModal(false)}
          userPoints={points}
          onPayoutSuccess={handlePayoutSuccess}
        />

      </div>
    </UserLayout>
  );
};

export default RedeemRewards;
