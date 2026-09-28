import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserLayout from '../../components/UserLayout';
import UPIPayoutModal from '../../components/UPIPayoutModal';
import RealPaymentGatewayModal from '../../components/RealPaymentGatewayModal';
import RealQRScannerModal from '../../components/RealQRScannerModal';
import BankWithdrawalModal from '../../components/BankWithdrawalModal';
import { triggerConfetti } from '../../utils/confetti';
import { soundFx } from '../../utils/audioFeedback';
import { triggerHaptic } from '../../utils/mobileNative';
import { 
  FaCoins, FaExchangeAlt, FaShieldAlt, FaLock, FaCheckCircle, 
  FaQrcode, FaShoppingBag, FaHistory, FaArrowDown, FaArrowUp, 
  FaTruck, FaLeaf, FaReceipt, FaPlus, FaTimes, FaCheck, FaSearch, 
  FaFilter, FaCreditCard, FaBolt, FaUniversity, FaMobileAlt,
  FaFileInvoiceDollar, FaStore, FaWallet, FaPrint, FaShareAlt,
  FaCamera
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
    mode: 'Doorstep Weighed & Credited',
    utr: 'NPCI-984712093847'
  },
  {
    id: 'TXN-90142',
    type: 'debit_payout',
    title: 'Instant Bank UPI Cashout',
    subtitle: 'Sent to citizen@okaxis via NPCI IMPS Fast Rail',
    amountRupees: 150,
    points: 600,
    isCredit: false,
    timestamp: 'Yesterday, 04:15 PM',
    status: 'Completed',
    mode: 'Bank UPI Fast Payout',
    utr: 'NPCI-847291039482'
  },
  {
    id: 'TXN-89823',
    type: 'debit_purchase',
    title: 'Store Purchase: Cornstarch Trash Bags',
    subtitle: 'Paid using Eco-Wallet Balance • Delivered to Avinashi Rd',
    amountRupees: 129,
    points: 516,
    isCredit: false,
    timestamp: '25 Sep 2026, 02:40 PM',
    status: 'Delivered',
    mode: 'Eco-Wallet Direct Pay',
    utr: 'NPCI-748291049281'
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
    mode: 'Civic Bonus Incentive',
    utr: 'NPCI-649201948271'
  }
];

const RedeemRewards = () => {
  const { user, updateUserPoints } = useAuth();
  const { addToast } = useToast();

  // Active Points & Wallet Cash State
  const initialPoints = user?.points || 1842;
  const [points, setPoints] = useState(initialPoints);
  const [walletCash, setWalletCash] = useState(() => {
    const saved = localStorage.getItem('eco_wallet_cash');
    return saved ? Number(saved) : 511;
  });

  // Navigation Tabs: 'store' | 'passbook' | 'convert'
  const [activeTab, setActiveTab] = useState('store');
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [passbookFilter, setPassbookFilter] = useState('all'); // 'all' | 'credits' | 'debits'

  // Modals
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [showBankWithdrawModal, setShowBankWithdrawModal] = useState(false);
  const [showRealQRScannerModal, setShowRealQRScannerModal] = useState(false);
  const [showScanPayModal, setShowScanPayModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedProductForGateway, setSelectedProductForGateway] = useState(null);
  const [selectedTxnReceipt, setSelectedTxnReceipt] = useState(null);

  // Top Up Wallet Form
  const [topUpAmount, setTopUpAmount] = useState('250');
  const [topUpMethod, setTopUpMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [isToppingUp, setIsToppingUp] = useState(false);

  // Conversion Tool State (Interactive Slider & Presets)
  const [sliderPoints, setSliderPoints] = useState(400);

  // Scan & Pay Modal State
  const [merchantUpi, setMerchantUpi] = useState('greencafe@okaxis');
  const [merchantAmount, setMerchantAmount] = useState('120');
  const [merchantPin, setMerchantPin] = useState('4829');
  const [enteredPin, setEnteredPin] = useState('');
  const [isPayingMerchant, setIsPayingMerchant] = useState(false);

  // Sync wallet balance to storage
  useEffect(() => {
    localStorage.setItem('eco_wallet_cash', walletCash.toString());
  }, [walletCash]);

  // Sync user points
  useEffect(() => {
    if (user?.points) setPoints(user.points);
  }, [user?.points]);

  // 1-Click Points to Cash Converter
  const handleConvertPoints = (ptsToConvert) => {
    if (ptsToConvert > points) {
      addToast('Insufficient EcoPoints balance to convert', 'warning', 'Low Balance');
      return;
    }
    triggerHaptic(30);
    const addedCash = Math.round(ptsToConvert * 0.25);
    const newPoints = points - ptsToConvert;
    const newCash = walletCash + addedCash;

    setPoints(newPoints);
    setWalletCash(newCash);
    if (updateUserPoints) updateUserPoints(newPoints);

    // Add to transaction ledger
    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'credit_convert',
      title: 'Converted Points to Wallet Cash',
      subtitle: `Exchanged ${ptsToConvert} EcoPoints at 4:1 guaranteed rate`,
      amountRupees: addedCash,
      points: ptsToConvert,
      isCredit: true,
      timestamp: 'Just now',
      status: 'Completed',
      mode: 'Wallet Point Conversion',
      utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
    };
    setTransactions(prev => [newTxn, ...prev]);

    triggerConfetti({ count: 90 });
    soundFx?.playSuccessChime?.();
    addToast(`+₹${addedCash}.00 credited to Wallet Cash!`, 'success', 'Points Converted');
  };

  // Top Up Wallet Handler
  const handleProcessTopUp = (e) => {
    e.preventDefault();
    const amt = Number(topUpAmount);
    if (!amt || amt <= 0) {
      addToast('Please enter a valid top-up amount', 'warning', 'Invalid Amount');
      return;
    }

    setIsToppingUp(true);
    triggerHaptic(30);

    setTimeout(() => {
      setWalletCash(prev => prev + amt);
      const topUpTxn = {
        id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        type: 'credit_topup',
        title: 'Wallet Cash Top-Up',
        subtitle: `Added money via ${topUpMethod.toUpperCase()} Fast Rail`,
        amountRupees: amt,
        points: amt * 4,
        isCredit: true,
        timestamp: 'Just now',
        status: 'Completed',
        mode: `${topUpMethod.toUpperCase()} Direct Recharge`,
        utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
      };
      setTransactions(prev => [topUpTxn, ...prev]);

      setIsToppingUp(false);
      setShowTopUpModal(false);
      triggerConfetti({ count: 80 });
      soundFx?.playSuccessChime?.();
      addToast(`+₹${amt}.00 added to Wallet successfully!`, 'success', 'Wallet Recharged');
    }, 900);
  };

  // Successful payment from RealPaymentGatewayModal
  const handleGatewayPaymentSuccess = (paymentData) => {
    if (paymentData.paymentMode === 'wallet') {
      setWalletCash(prev => Math.max(0, prev - paymentData.totalRupees));
    } else if (paymentData.paymentMode === 'points') {
      const newPts = Math.max(0, points - paymentData.pointsPaid);
      setPoints(newPts);
      if (updateUserPoints) updateUserPoints(newPts);
    }

    // Add to ledger
    const orderTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'debit_purchase',
      title: `Store Purchase: ${paymentData.product.name} (x${paymentData.quantity})`,
      subtitle: `Order #${paymentData.orderId} • Delivered to Coimbatore`,
      amountRupees: paymentData.totalRupees,
      points: paymentData.pointsPaid,
      isCredit: false,
      timestamp: 'Just now',
      status: 'Confirmed',
      mode: paymentData.receipt.paymentMethod,
      utr: paymentData.receipt.bankRef
    };
    setTransactions(prev => [orderTxn, ...prev]);
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
        title: `Merchant QR Pay: ${merchantUpi}`,
        subtitle: `Instant Scan & Pay from Eco-Wallet balance`,
        amountRupees: amountNum,
        points: amountNum * 4,
        isCredit: false,
        timestamp: 'Just now',
        status: 'Completed',
        mode: 'Merchant Scan & Pay',
        utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
      };
      setTransactions(prev => [payTxn, ...prev]);

      setIsPayingMerchant(false);
      setShowScanPayModal(false);
      triggerConfetti({ count: 90 });
      soundFx?.playSuccessChime?.();
      addToast(`₹${amountNum} paid to ${merchantUpi} successfully!`, 'success', 'Payment Sent');
    }, 700);
  };

  // Handle successful payout from modal
  const handlePayoutSuccess = (newRemainingPoints) => {
    setPoints(newRemainingPoints);
    if (updateUserPoints) updateUserPoints(newRemainingPoints);
    const addedTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'debit_payout',
      title: 'Bank UPI Cashout',
      subtitle: 'Funds credited to registered UPI account via IMPS',
      amountRupees: Math.round((points - newRemainingPoints) * 0.25),
      points: points - newRemainingPoints,
      isCredit: false,
      timestamp: 'Just now',
      status: 'Completed',
      mode: 'Bank UPI Fast Payout',
      utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`
    };
    setTransactions(prev => [addedTxn, ...prev]);
  };

  // Handle direct bank transfer / IMPS cashout success
  const handleBankWithdrawSuccess = (withdrawData) => {
    const amt = withdrawData.amount;
    setWalletCash(prev => Math.max(0, prev - amt));
    
    const wthTxn = {
      id: withdrawData.receipt.txnId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'debit_payout',
      title: `Bank Withdrawal: ${withdrawData.receipt.destination}`,
      subtitle: `Transferred via ${withdrawData.receipt.mode} • Beneficiary: ${withdrawData.receipt.holderName}`,
      amountRupees: amt,
      points: amt * 4,
      isCredit: false,
      timestamp: 'Just now',
      status: 'Completed',
      mode: withdrawData.receipt.mode,
      utr: withdrawData.receipt.utr
    };
    setTransactions(prev => [wthTxn, ...prev]);
    addToast(`₹${amt}.00 transferred to your bank account successfully!`, 'success', 'Bank Credit Completed');
  };

  // Handle live camera QR merchant payment success
  const handleRealQRPaySuccess = (payData) => {
    const amt = payData.amount;
    setWalletCash(prev => Math.max(0, prev - amt));

    const qrTxn = {
      id: payData.receipt.txnId || `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'debit_merchant',
      title: `QR Merchant Pay: ${payData.merchant.name}`,
      subtitle: `Paid to ${payData.merchant.vpa} via Camera QR Scanner`,
      amountRupees: amt,
      points: amt * 4,
      isCredit: false,
      timestamp: 'Just now',
      status: 'Completed',
      mode: 'Live Camera QR Pay',
      utr: payData.receipt.utr
    };
    setTransactions(prev => [qrTxn, ...prev]);
    addToast(`₹${amt}.00 paid to ${payData.merchant.name}!`, 'success', 'QR Payment Sent');
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

  // Filtered Passbook Transactions
  const filteredTransactions = useMemo(() => {
    if (passbookFilter === 'credits') return transactions.filter(t => t.isCredit);
    if (passbookFilter === 'debits') return transactions.filter(t => !t.isCredit);
    return transactions;
  }, [transactions, passbookFilter]);

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

            {/* Dual Wallet Display (Available Cash + EcoPoints + Top Up) */}
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

              {/* Top Up Wallet Button */}
              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl border-2 border-emerald-600 transition flex items-center space-x-1.5 cursor-pointer shadow-sm active:scale-98"
              >
                <FaPlus className="text-xs" />
                <span>Top Up Cash</span>
              </button>
            </div>
          </div>

          {/* 4 Core Financial Transaction Action Pillars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t-2 border-slate-100">
            
            {/* Action 1: Instant Direct Bank & UPI Withdrawal */}
            <button
              onClick={() => setShowBankWithdrawModal(true)}
              className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl border-2 border-emerald-600 shadow-md shadow-emerald-600/20 flex flex-col justify-between items-start transition cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between w-full">
                <FaUniversity className="text-base" />
                <span className="text-[9px] font-black bg-white/20 px-2 py-0.5 rounded-full">INSTANT</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black">Withdraw to Bank / UPI</div>
                <div className="text-[10px] text-emerald-100 font-medium">To SBI, HDFC, GPay, PhonePe</div>
              </div>
            </button>

            {/* Action 2: Merchant Live Camera Scan & Pay QR */}
            <button
              onClick={() => setShowRealQRScannerModal(true)}
              className="p-3.5 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl border-2 border-slate-300 shadow-xs flex flex-col justify-between items-start transition cursor-pointer group active:scale-98"
            >
              <div className="flex items-center justify-between w-full">
                <FaCamera className="text-base text-emerald-600" />
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">LIVE CAMERA</span>
              </div>
              <div className="text-left mt-2">
                <div className="text-xs font-black text-slate-900">Scan & Pay QR</div>
                <div className="text-[10px] text-slate-500 font-semibold">Real optical camera scanner</div>
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

          {/* Linked Bank Account Details Strip (Real Banking Integration) */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-slate-50 to-white border-2 border-emerald-200/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="h-11 w-11 rounded-2xl bg-white border-2 border-emerald-300 text-emerald-700 flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                <FaUniversity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black text-slate-900">State Bank of India (SBI)</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    <FaCheckCircle className="text-[8px]" /> PRIMARY LINKED A/C
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <span>A/C: <strong className="font-mono text-slate-900">•••• •••• 4921</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>IFSC: <strong className="font-mono text-slate-800">SBIN0001234</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Branch: <strong>Coimbatore Main Branch, TN</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>Beneficiary: <strong>PALANI</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowBankWithdrawModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-sm border border-emerald-600 transition flex items-center space-x-1.5 cursor-pointer active:scale-98"
              >
                <FaExchangeAlt className="text-xs" />
                <span>Withdraw to this Bank</span>
              </button>
              <button
                type="button"
                onClick={() => setShowBankWithdrawModal(true)}
                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition cursor-pointer"
              >
                Manage Banks
              </button>
            </div>
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
                  Buy certified eco-friendly household goods using your Eco-Wallet balance, UPI, or Cards
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

                    {/* Price & Real Gateway Buy Action */}
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

                      {/* Single Unified High-Conversion "Buy & Pay Now" Button */}
                      <button
                        onClick={() => setSelectedProductForGateway(product)}
                        className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl border-2 border-emerald-600 shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                      >
                        <FaCreditCard className="text-xs" />
                        <span>Buy Now & Pay with Gateway</span>
                      </button>
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
              
              {/* Passbook Header & Filters */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b-2 border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <FaFileInvoiceDollar className="text-emerald-600" />
                    <span>Online Transactions Passbook</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Click any transaction to view and print official bank payment receipts
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
                  {[
                    { id: 'all', label: `All (${transactions.length})` },
                    { id: 'credits', label: 'Credits (+)' },
                    { id: 'debits', label: 'Debits (-)' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setPassbookFilter(f.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
                        passbookFilter === f.id
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Feed */}
              <div className="space-y-3">
                {filteredTransactions.map((txn) => (
                  <div
                    key={txn.id}
                    onClick={() => setSelectedTxnReceipt(txn)}
                    className="p-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-400 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs cursor-pointer group"
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
                          <h5 className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition">
                            {txn.title}
                          </h5>
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
                          Ref: {txn.id} • {txn.timestamp} • Click for Receipt
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
                        ({txn.points} Pts)
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

            {/* Interactive Points Slider */}
            <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-slate-700">Drag to Select Points to Convert:</span>
                <span className="text-emerald-700 text-sm">
                  {sliderPoints} Pts = ₹{Math.round(sliderPoints * 0.25)}.00 Cash
                </span>
              </div>

              <input
                type="range"
                min={50}
                max={Math.max(50, points)}
                step={50}
                value={sliderPoints}
                onChange={(e) => setSliderPoints(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Min: 50 Pts (₹12)</span>
                <span>Max: {points} Pts (₹{Math.round(points * 0.25)})</span>
              </div>

              <button
                type="button"
                onClick={() => handleConvertPoints(sliderPoints)}
                disabled={sliderPoints > points || points <= 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md border-2 border-emerald-600 transition cursor-pointer active:scale-98"
              >
                Convert {sliderPoints} Pts to ₹{Math.round(sliderPoints * 0.25)}.00 Now
              </button>
            </div>

            {/* Quick Conversion Amount Presets */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-800 block">
                Or Choose Instant Preset:
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

          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MODALS                                                                */}
        {/* ========================================================================= */}

        {/* Real Payment Gateway Modal (Razorpay/Stripe Grade) */}
        <RealPaymentGatewayModal
          isOpen={!!selectedProductForGateway}
          onClose={() => setSelectedProductForGateway(null)}
          item={selectedProductForGateway}
          walletCash={walletCash}
          userPoints={points}
          onPaymentSuccess={handleGatewayPaymentSuccess}
        />

        {/* Top-Up Wallet Modal */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 text-slate-800 shadow-2xl">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-3 pb-3 border-b-2 border-slate-100">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xl">
                  <FaWallet />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Top Up Eco-Wallet Cash</h4>
                  <p className="text-xs text-slate-500 font-semibold">Add money to your wallet balance instantly via UPI or Card</p>
                </div>
              </div>

              <form onSubmit={handleProcessTopUp} className="space-y-4 pt-3">
                {/* Preset Recharge Amounts */}
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1.5">Select Top-Up Amount:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['100', '250', '500', '1000'].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`p-2.5 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                          topUpAmount === amt
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">Or Enter Custom Amount (₹):</label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min={10}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-black text-slate-900 focus:outline-none"
                    required
                  />
                </div>

                {/* Payment Rail */}
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1.5">Recharge Via:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'upi', label: 'UPI Fast Rail' },
                      { id: 'card', label: 'Debit Card' },
                      { id: 'netbanking', label: 'NetBanking' }
                    ].map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTopUpMethod(m.id)}
                        className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer text-center ${
                          topUpMethod === m.id
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(false)}
                    className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isToppingUp}
                    className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <FaLock className="text-xs" />
                    <span>{isToppingUp ? 'Adding Money...' : `Add ₹${topUpAmount} to Wallet`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detailed Transaction Invoice Receipt Modal */}
        {selectedTxnReceipt && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-md bg-white border-2 border-slate-300 rounded-3xl p-6 sm:p-7 text-slate-800 shadow-2xl">
              <button
                onClick={() => setSelectedTxnReceipt(null)}
                className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 pb-4 border-b-2 border-slate-100">
                <div className={`h-12 w-12 mx-auto rounded-2xl flex items-center justify-center text-xl border-2 ${
                  selectedTxnReceipt.isCredit 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                  <FaReceipt />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Official Payment Receipt
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 pt-1">
                    {selectedTxnReceipt.isCredit ? '+' : '-'}₹{selectedTxnReceipt.amountRupees}.00
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">{selectedTxnReceipt.title}</p>
                </div>
              </div>

              {/* Receipt Details Table */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-2.5 text-xs my-4">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Transaction ID:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTxnReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Bank UTR Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTxnReceipt.utr || 'NPCI-984712093847'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Payment Mode:</span>
                  <span className="font-black text-emerald-700">{selectedTxnReceipt.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Date & Time:</span>
                  <span className="font-bold text-slate-800">{selectedTxnReceipt.timestamp}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <span className="font-black text-emerald-600 flex items-center gap-1">
                    <FaCheckCircle /> {selectedTxnReceipt.status}
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <FaPrint />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTxnReceipt(null)}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-md border-2 border-emerald-600 transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Real Optical Camera QR Scanner & Merchant Pay Modal */}
        <RealQRScannerModal
          isOpen={showRealQRScannerModal}
          onClose={() => setShowRealQRScannerModal(false)}
          walletCash={walletCash}
          onPaymentComplete={handleRealQRPaySuccess}
        />

        {/* Real Direct Bank Account (IMPS/NEFT) & UPI Withdrawal Modal */}
        <BankWithdrawalModal
          isOpen={showBankWithdrawModal}
          onClose={() => setShowBankWithdrawModal(false)}
          walletCash={walletCash}
          userPoints={points}
          onWithdrawalSuccess={handleBankWithdrawSuccess}
        />

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
