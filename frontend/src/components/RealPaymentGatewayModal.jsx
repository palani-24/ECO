import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaShieldAlt, FaLock, FaCheckCircle, FaTimes, FaCoins, FaCreditCard, 
  FaUniversity, FaQrcode, FaMobileAlt, FaBolt, FaArrowRight, FaSpinner, 
  FaReceipt, FaCheck, FaTruck, FaTag, FaRegClock, FaGooglePay, FaPlus, FaMinus
} from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', icon: '🏛️', code: 'HDFC' },
  { id: 'sbi', name: 'State Bank of India', icon: '🏦', code: 'SBIN' },
  { id: 'icici', name: 'ICICI Bank', icon: '🏢', code: 'ICIC' },
  { id: 'axis', name: 'Axis Bank', icon: '🏛️', code: 'UTIB' },
  { id: 'kotak', name: 'Kotak Mahindra', icon: '🏦', code: 'KKBK' },
];

const RealPaymentGatewayModal = ({ 
  isOpen, 
  onClose, 
  item, 
  walletCash = 511, 
  userPoints = 1842,
  onPaymentSuccess 
}) => {
  if (!isOpen || !item) return null;

  // Checkout State
  const [quantity, setQuantity] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState('wallet'); // 'wallet' | 'upi' | 'card' | 'netbanking' | 'points'
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  // Card Form State
  const [cardNumber, setCardNumber] = useState('4532 8841 9923 1042');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('784');
  const [cardHolder, setCardHolder] = useState('PALANI ECO GUARDIAN');

  // UPI State
  const [upiApp, setUpiApp] = useState('gpay');
  const [customVpa, setCustomVpa] = useState('citizen@okaxis');
  const [showDynamicQr, setShowDynamicQr] = useState(false);

  // NetBanking State
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Processing & Verification Flow
  const [step, setStep] = useState('checkout'); // 'checkout' | 'processing' | 'otp' | 'success'
  const [otpCode, setOtpCode] = useState('4829');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Calculations
  const rawTotal = item.priceRupees * quantity;
  const finalTotal = Math.max(0, rawTotal - discountAmount);
  const pointsTotal = item.pointsPrice * quantity;
  const canAffordWallet = walletCash >= finalTotal;
  const canAffordPoints = userPoints >= pointsTotal;

  // Format Card Number input with spaces
  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  // Apply Coupon Code
  const handleApplyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'ECOSAVE10' || couponCode.trim().toUpperCase() === 'GREEN10') {
      const disc = Math.round(rawTotal * 0.1);
      setDiscountAmount(disc);
      setCouponApplied(true);
      triggerConfetti({ count: 50 });
      soundFx?.playSuccessChime?.();
    } else if (couponCode.trim().toUpperCase() === 'FIRST50') {
      setDiscountAmount(50);
      setCouponApplied(true);
      triggerConfetti({ count: 50 });
      soundFx?.playSuccessChime?.();
    } else {
      alert('Invalid coupon! Try ECOSAVE10 for 10% discount');
    }
  };

  // Pay Action Trigger
  const handleInitiatePayment = () => {
    triggerHaptic(25);

    if (selectedMethod === 'wallet' && !canAffordWallet) {
      alert('Insufficient Wallet Balance. Please top up or choose UPI/Card.');
      return;
    }
    if (selectedMethod === 'points' && !canAffordPoints) {
      alert('Insufficient EcoPoints balance for this purchase.');
      return;
    }

    setStep('processing');

    setTimeout(() => {
      // If card or netbanking, simulate 3D Secure Bank OTP verification
      if (selectedMethod === 'card' || selectedMethod === 'netbanking') {
        setStep('otp');
      } else {
        completeOrderSuccess();
      }
    }, 1200);
  };

  // Complete Order
  const completeOrderSuccess = () => {
    const orderId = `ECO-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const bankRef = `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const receipt = {
      orderId,
      bankRef,
      itemTitle: item.name,
      quantity,
      amountPaid: selectedMethod === 'points' ? `${pointsTotal} Pts` : `₹${finalTotal}.00`,
      paymentMethod: selectedMethod === 'wallet' ? 'Eco-Wallet 1-Click Pay' : selectedMethod === 'upi' ? `UPI Fast Rail (${upiApp.toUpperCase()})` : selectedMethod === 'card' ? 'Visa 3D-Secure Card' : selectedMethod === 'netbanking' ? `${selectedBank.toUpperCase()} NetBanking` : 'EcoPoints Direct Exchange',
      deliveryDays: item.deliveryDays,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrderReceipt(receipt);
    setStep('success');
    triggerConfetti({ count: 120 });
    soundFx?.playSuccessChime?.();

    if (onPaymentSuccess) {
      onPaymentSuccess({
        orderId,
        product: item,
        quantity,
        totalRupees: finalTotal,
        pointsPaid: selectedMethod === 'points' ? pointsTotal : 0,
        paymentMode: selectedMethod,
        receipt
      });
    }
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white/98 backdrop-blur-xl border-2 border-slate-300 rounded-3xl p-5 sm:p-7 text-slate-800 shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto my-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* ============================================================= */}
          {/* STEP 1: CHECKOUT & PAYMENT SELECTION                         */}
          {/* ============================================================= */}
          {step === 'checkout' && (
            <div className="space-y-5">
              
              {/* Top Gateway Header */}
              <div className="flex items-center space-x-3.5 pb-4 border-b-2 border-slate-100">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  <FaShieldAlt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">
                      EcoPay Real Gateway
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                      256-Bit SSL
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Choose your preferred payment method to complete this order securely
                  </p>
                </div>
              </div>

              {/* Product Info & Quantity Strip */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    {item.icon}
                  </span>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                    <span className="text-[11px] font-bold text-emerald-700 block">{item.tagline}</span>
                    <span className="text-[10px] text-slate-500 font-medium">🚚 Delivered {item.deliveryDays}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center space-x-2 bg-white px-2.5 py-1.5 rounded-xl border-2 border-slate-300">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <FaMinus className="text-[10px]" />
                    </button>
                    <span className="font-black text-xs px-2 text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600"
                    >
                      <FaPlus className="text-[10px]" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">₹{rawTotal}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{pointsTotal} pts</span>
                  </div>
                </div>
              </div>

              {/* 2-Column Payment Options: Left Tabs, Right Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Payment Option Selector Tabs (4 Cols) */}
                <div className="md:col-span-4 space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
                    Select Payment Option
                  </span>

                  {/* 1. Eco-Wallet */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('wallet')}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                      selectedMethod === 'wallet'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaBolt className="text-amber-500" />
                      <div>
                        <div className="text-xs font-black">Eco-Wallet</div>
                        <div className="text-[10px] text-slate-500 font-bold">Bal: ₹{walletCash}</div>
                      </div>
                    </div>
                    {canAffordWallet && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">1-TAP</span>}
                  </button>

                  {/* 2. UPI Apps & QR */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('upi')}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                      selectedMethod === 'upi'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaMobileAlt className="text-emerald-600" />
                      <div>
                        <div className="text-xs font-black">UPI & QR</div>
                        <div className="text-[10px] text-slate-500 font-bold">GPay, PhonePe, QR</div>
                      </div>
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black">FAST</span>
                  </button>

                  {/* 3. Cards */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('card')}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                      selectedMethod === 'card'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaCreditCard className="text-indigo-600" />
                      <div>
                        <div className="text-xs font-black">Cards</div>
                        <div className="text-[10px] text-slate-500 font-bold">Visa, Master, RuPay</div>
                      </div>
                    </div>
                  </button>

                  {/* 4. Net Banking */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('netbanking')}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                      selectedMethod === 'netbanking'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaUniversity className="text-sky-600" />
                      <div>
                        <div className="text-xs font-black">NetBanking</div>
                        <div className="text-[10px] text-slate-500 font-bold">All Major Banks</div>
                      </div>
                    </div>
                  </button>

                  {/* 5. EcoPoints Exchange */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('points')}
                    className={`w-full p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center justify-between ${
                      selectedMethod === 'points'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <FaCoins className="text-amber-500" />
                      <div>
                        <div className="text-xs font-black">EcoPoints</div>
                        <div className="text-[10px] text-slate-500 font-bold">Bal: {userPoints} pts</div>
                      </div>
                    </div>
                  </button>

                </div>

                {/* Payment Option Input Details (8 Cols) */}
                <div className="md:col-span-8 p-4 bg-slate-50/80 rounded-2xl border-2 border-slate-200 flex flex-col justify-between">
                  
                  {/* TAB CONTENT: ECO-WALLET */}
                  {selectedMethod === 'wallet' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">1-Click Eco-Wallet Debit</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          Verified Citizen Account
                        </span>
                      </div>
                      
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Available Wallet Balance:</span>
                          <span className="font-black text-slate-900">₹{walletCash}.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Amount to Deduct:</span>
                          <span className="font-black text-emerald-700">-₹{finalTotal}.00</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-2 font-black">
                          <span>Remaining Balance:</span>
                          <span className={canAffordWallet ? 'text-slate-800' : 'text-rose-600'}>
                            ₹{Math.max(0, walletCash - finalTotal)}.00
                          </span>
                        </div>
                      </div>

                      {!canAffordWallet && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                          ⚠️ You need ₹{finalTotal - walletCash} more. Please select UPI or Card below.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: UPI */}
                  {selectedMethod === 'upi' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">Select UPI Platform / Scan QR</span>
                        <button
                          type="button"
                          onClick={() => setShowDynamicQr(!showDynamicQr)}
                          className="text-[11px] font-black text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FaQrcode /> {showDynamicQr ? 'Use App Handle' : 'Show Dynamic QR'}
                        </button>
                      </div>

                      {showDynamicQr ? (
                        <div className="text-center p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="h-32 w-32 mx-auto bg-slate-900 rounded-xl flex items-center justify-center text-white text-5xl">
                            <FaQrcode />
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold">Scan with any UPI app to pay ₹{finalTotal}.00</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'gpay', label: 'Google Pay', icon: '🟢' },
                              { id: 'phonepe', label: 'PhonePe', icon: '🟣' },
                              { id: 'paytm', label: 'Paytm UPI', icon: '🔵' }
                            ].map(app => (
                              <button
                                key={app.id}
                                type="button"
                                onClick={() => setUpiApp(app.id)}
                                className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                                  upiApp === app.id
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black'
                                    : 'bg-white border-slate-200 text-slate-600 font-bold'
                                }`}
                              >
                                <span className="text-sm block">{app.icon}</span>
                                <span className="text-[10px]">{app.label}</span>
                              </button>
                            ))}
                          </div>

                          <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Enter UPI VPA:</label>
                            <input
                              type="text"
                              value={customVpa}
                              onChange={(e) => setCustomVpa(e.target.value)}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT: CARD */}
                  {selectedMethod === 'card' && (
                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Card Number:</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4532 •••• •••• ••••"
                          maxLength={19}
                          className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">Expiry:</label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase block mb-0.5">CVV / CVC:</label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold block">🔒 3D Secure OTP authentication on next step</span>
                    </div>
                  )}

                  {/* TAB CONTENT: NETBANKING */}
                  {selectedMethod === 'netbanking' && (
                    <div className="space-y-2">
                      <span className="text-xs font-black text-slate-800 block">Choose Bank:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {POPULAR_BANKS.map(bank => (
                          <button
                            key={bank.id}
                            type="button"
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition cursor-pointer ${
                              selectedBank === bank.id
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-black'
                                : 'bg-white border-slate-200 text-slate-700 font-bold'
                            }`}
                          >
                            <span className="text-sm">{bank.icon}</span>
                            <span className="text-xs truncate">{bank.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT: POINTS */}
                  {selectedMethod === 'points' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800">Pay 100% with EcoPoints</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                          Available: {userPoints} pts
                        </span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Points Cost:</span>
                          <span className="font-black text-amber-600">{pointsTotal} pts</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-100 pt-1.5 font-black">
                          <span>Remaining Points:</span>
                          <span className={canAffordPoints ? 'text-slate-800' : 'text-rose-600'}>
                            {Math.max(0, userPoints - pointsTotal)} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Input */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon: ECOSAVE10"
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 uppercase focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponApplied && (
                      <span className="text-[10px] text-emerald-600 font-black block mt-1">
                        ✓ ₹{discountAmount} Discount Applied!
                      </span>
                    )}
                  </div>

                </div>

              </div>

              {/* Price Breakdown Footer & Final CTA */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-left w-full sm:w-auto">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs text-slate-500 font-bold">Total to Pay:</span>
                    <span className="text-xl font-black text-slate-900">
                      {selectedMethod === 'points' ? `${pointsTotal} pts` : `₹${finalTotal}.00`}
                    </span>
                    {discountAmount > 0 && (
                      <span className="text-xs text-emerald-600 font-black">(Saved ₹{discountAmount})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Includes green packaging & doorstep delivery</span>
                </div>

                <div className="flex items-center space-x-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-3 bg-white hover:bg-slate-100 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiatePayment}
                    className="flex-2 sm:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/25 border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                  >
                    <FaLock className="text-xs" />
                    <span>Pay {selectedMethod === 'points' ? `${pointsTotal} Pts` : `₹${finalTotal}`} Now</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 2: PROCESSING OVERLAY                                   */}
          {/* ============================================================= */}
          {step === 'processing' && (
            <div className="py-12 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-2xl animate-spin">
                <FaSpinner />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900">Contacting Payment Gateway...</h4>
                <p className="text-xs text-slate-500 font-semibold">
                  Secure 256-Bit SSL Handshake with Banking Rail
                </p>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 3: 3D SECURE OTP SIMULATOR FOR CARDS/NETBANKING          */}
          {/* ============================================================= */}
          {step === 'otp' && (
            <div className="py-6 max-w-sm mx-auto text-center space-y-4">
              <div className="h-12 w-12 mx-auto rounded-2xl bg-indigo-50 text-indigo-600 border-2 border-indigo-200 flex items-center justify-center text-xl">
                <FaLock />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">3D Secure Bank Verification</h4>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Enter the 4-digit OTP sent to registered mobile <span className="font-mono font-bold">+91 ••••• 99771</span>
                </p>
              </div>

              {/* Demo Hint */}
              <div className="p-2 bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl border border-emerald-200">
                Demo OTP: {otpCode}
              </div>

              <input
                type="text"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="Enter 4829"
                maxLength={4}
                className="w-40 mx-auto text-center text-xl font-mono font-black tracking-widest px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-indigo-500 block"
              />

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="flex-1 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-black"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={completeOrderSuccess}
                  className="flex-2 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-md border-2 border-emerald-600"
                >
                  Verify & Pay ₹{finalTotal}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* STEP 4: SUCCESS CONFIRMATION & TAX INVOICE                    */}
          {/* ============================================================= */}
          {step === 'success' && orderReceipt && (
            <div className="py-4 text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 border-2 border-emerald-200 shadow-sm">
                <FaCheck className="w-10 h-10" />
              </div>
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Payment Verified & Completed
                </span>
                <h4 className="text-2xl font-black text-slate-900 pt-1.5">{orderReceipt.itemTitle}</h4>
                <p className="text-xs text-slate-500 font-semibold">Order Ref: {orderReceipt.orderId}</p>
              </div>

              {/* Digital Tax Invoice Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">NPCI Banking UTR:</span>
                  <span className="font-mono font-bold text-slate-800">{orderReceipt.bankRef}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Amount Charged:</span>
                  <span className="font-black text-slate-900">{orderReceipt.amountPaid}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Payment Rail:</span>
                  <span className="font-black text-emerald-700">{orderReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2 font-bold text-slate-700">
                  <span>Dispatch Status:</span>
                  <span className="text-emerald-700 font-black">📦 Packed • {orderReceipt.deliveryDays}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <FaReceipt />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 cursor-pointer transition active:scale-98"
                >
                  Done & Return to Wallet
                </button>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RealPaymentGatewayModal;
