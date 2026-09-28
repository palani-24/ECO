import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUniversity, FaTimes, FaExchangeAlt, FaCheckCircle, FaSpinner, 
  FaShieldAlt, FaLock, FaReceipt, FaCheck, FaCoins, FaMobileAlt,
  FaBolt, FaArrowRight, FaCreditCard, FaBuilding
} from 'react-icons/fa';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/mobileNative';
import { soundFx } from '../utils/audioFeedback';

const SAVED_BANKS = [
  {
    id: 'bank-1',
    bankName: 'State Bank of India (SBI)',
    accountNumber: '•••• •••• 4921',
    fullAccount: '304918294921',
    ifsc: 'SBIN0001234',
    branch: 'Coimbatore Main Branch, TN',
    holderName: 'PALANI (Citizen Eco Guardian)',
    accountType: 'Savings Account',
    isPrimary: true
  },
  {
    id: 'bank-2',
    bankName: 'HDFC Bank',
    accountNumber: '•••• •••• 8812',
    fullAccount: '50100482918812',
    ifsc: 'HDFC0000240',
    branch: 'Race Course Branch, Coimbatore',
    holderName: 'PALANI',
    accountType: 'Savings Account',
    isPrimary: false
  }
];

const BankWithdrawalModal = ({ 
  isOpen, 
  onClose, 
  walletCash = 562, 
  userPoints = 1842,
  onWithdrawalSuccess 
}) => {
  if (!isOpen) return null;

  // Withdrawal Mode: 'bank' | 'upi'
  const [mode, setMode] = useState('bank');

  // Bank Form State
  const [selectedBankId, setSelectedBankId] = useState('bank-1');
  const [isAddingNewBank, setIsAddingNewBank] = useState(false);
  const [newBankName, setNewBankName] = useState('Canara Bank');
  const [newAccountNum, setNewAccountNum] = useState('');
  const [newConfirmAccountNum, setNewConfirmAccountNum] = useState('');
  const [newIfsc, setNewIfsc] = useState('CNRB0001089');
  const [newBranch, setNewBranch] = useState('Gandhipuram Branch, Coimbatore');
  const [newHolderName, setNewHolderName] = useState('PALANI');

  // UPI Form State
  const [upiId, setUpiId] = useState('citizen@okaxis');

  // Amount State
  const [withdrawAmount, setWithdrawAmount] = useState('200');
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  // IFSC Lookup Simulator
  const handleIfscChange = (val) => {
    setNewIfsc(val.toUpperCase());
    if (val.length >= 11) {
      if (val.toUpperCase().startsWith('SBIN')) {
        setNewBankName('State Bank of India');
        setNewBranch('Coimbatore Main Branch');
      } else if (val.toUpperCase().startsWith('HDFC')) {
        setNewBankName('HDFC Bank');
        setNewBranch('Race Course Branch');
      } else if (val.toUpperCase().startsWith('ICIC')) {
        setNewBankName('ICICI Bank');
        setNewBranch('Avinashi Road Branch');
      } else {
        setNewBankName('Nationalized Bank');
        setNewBranch('Coimbatore Central Branch');
      }
    }
  };

  // Execute Withdrawal
  const handleProcessWithdrawal = (e) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }
    if (amt > walletCash) {
      alert('Insufficient Wallet Cash balance');
      return;
    }

    if (mode === 'bank' && isAddingNewBank) {
      if (newAccountNum !== newConfirmAccountNum) {
        alert('Bank account numbers do not match!');
        return;
      }
    }

    setIsProcessing(true);
    triggerHaptic(30);

    const activeBank = SAVED_BANKS.find(b => b.id === selectedBankId) || {
      bankName: newBankName,
      accountNumber: `•••• •••• ${newAccountNum.slice(-4)}`,
      ifsc: newIfsc,
      holderName: newHolderName,
      branch: newBranch
    };

    setTimeout(() => {
      const withdrawalReceipt = {
        txnId: `TXN-WTH-${Date.now().toString().slice(-6)}`,
        utr: `NPCI-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        amount: amt,
        mode: mode === 'bank' ? `Direct Bank IMPS (24x7 Fast Credit)` : 'UPI Instant Fast Rail',
        destination: mode === 'bank' ? `${activeBank.bankName} (${activeBank.accountNumber})` : upiId,
        holderName: mode === 'bank' ? activeBank.holderName : 'Palani (Citizen Account)',
        ifsc: mode === 'bank' ? activeBank.ifsc : 'NPCI UPI VPA',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setReceipt(withdrawalReceipt);
      setIsProcessing(false);
      triggerConfetti({ count: 120 });
      soundFx?.playSuccessChime?.();

      if (onWithdrawalSuccess) {
        onWithdrawalSuccess({
          amount: amt,
          receipt: withdrawalReceipt
        });
      }
    }, 1200);
  };

  const handleDone = () => {
    setReceipt(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white/98 backdrop-blur-xl border-2 border-slate-300 rounded-3xl p-5 sm:p-7 text-slate-800 shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto my-auto"
        >
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3.5 pb-4 border-b-2 border-slate-100">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center text-xl shrink-0">
              <FaUniversity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Withdraw to Bank / UPI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase">
                  NPCI 24x7
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Direct bank account transfer via IMPS or instant UPI credit
              </p>
            </div>
          </div>

          {receipt ? (
            /* Digital Bank Transfer Receipt Screen */
            <div className="py-4 text-center space-y-4">
              <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-600 border-2 border-emerald-200 shadow-sm">
                <FaCheck className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Direct Bank Credit Completed
                </span>
                <h4 className="text-2xl font-black text-slate-900 pt-1">₹{receipt.amount}.00</h4>
                <p className="text-xs text-slate-600 font-semibold">Credited to {receipt.destination}</p>
              </div>

              {/* Receipt Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Bank UTR Reference:</span>
                  <span className="font-mono font-bold text-slate-900">{receipt.utr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Account Holder:</span>
                  <span className="font-bold text-slate-900">{receipt.holderName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Transfer Gateway:</span>
                  <span className="font-black text-emerald-700">{receipt.mode}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-500 font-semibold">Fee / Surcharge:</span>
                  <span className="font-black text-emerald-600">₹0.00 (Zero Fee)</span>
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
                  onClick={handleDone}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 cursor-pointer transition active:scale-98"
                >
                  Done & Return to Wallet
                </button>
              </div>
            </div>
          ) : (
            /* Withdrawal Form */
            <form onSubmit={handleProcessWithdrawal} className="space-y-4 pt-3">
              
              {/* Wallet Balance Strip */}
              <div className="p-3.5 bg-emerald-50/70 border-2 border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">Available Wallet Balance</span>
                  <span className="text-lg font-black text-slate-900">₹{walletCash}.00</span>
                </div>
                <span className="text-[10px] font-black px-2.5 py-1 bg-white text-emerald-700 rounded-xl border border-emerald-200 shadow-2xs">
                  0% Withdrawal Fee
                </span>
              </div>

              {/* Mode Switcher Tabs (Bank Transfer vs UPI) */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  Select Payout Destination:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('bank');
                      setIsAddingNewBank(false);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center space-x-2.5 ${
                      mode === 'bank'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FaUniversity className="text-emerald-600 text-base" />
                    <div>
                      <div className="text-xs font-black">Direct Bank Account</div>
                      <div className="text-[10px] text-slate-400 font-bold">IMPS / NEFT 24x7</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('upi')}
                    className={`p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center space-x-2.5 ${
                      mode === 'upi'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <FaMobileAlt className="text-emerald-600 text-base" />
                    <div>
                      <div className="text-xs font-black">UPI Fast Payout</div>
                      <div className="text-[10px] text-slate-400 font-bold">GPay, PhonePe, Paytm</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* MODE 1: BANK ACCOUNT DETAILS */}
              {mode === 'bank' && (
                <div className="space-y-3">
                  {!isAddingNewBank ? (
                    /* Select From Saved Bank Accounts */
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-black text-slate-800">Saved Bank Accounts:</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewBank(true)}
                          className="font-black text-emerald-700 hover:underline"
                        >
                          + Add New Bank
                        </button>
                      </div>

                      <div className="space-y-2">
                        {SAVED_BANKS.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => setSelectedBankId(b.id)}
                            className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                              selectedBankId === b.id
                                ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl p-2 bg-white rounded-xl border border-slate-200">🏦</span>
                              <div>
                                <h5 className="text-xs font-black text-slate-900">{b.bankName}</h5>
                                <p className="text-[11px] font-mono font-bold text-slate-600">{b.accountNumber}</p>
                                <span className="text-[10px] text-slate-400 font-semibold">{b.branch} • IFSC: {b.ifsc}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                              ✓ Verified
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Add New Bank Account Form */
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900">Enter Bank Details:</span>
                        <button
                          type="button"
                          onClick={() => setIsAddingNewBank(false)}
                          className="text-xs font-black text-slate-500 underline"
                        >
                          Cancel
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">IFSC Code:</label>
                        <input
                          type="text"
                          value={newIfsc}
                          onChange={(e) => handleIfscChange(e.target.value)}
                          placeholder="e.g. SBIN0001234"
                          maxLength={11}
                          className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black uppercase focus:outline-none focus:border-emerald-500"
                          required
                        />
                        <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
                          ✓ Branch: {newBankName} ({newBranch})
                        </span>
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">Account Number:</label>
                        <input
                          type="password"
                          value={newAccountNum}
                          onChange={(e) => setNewAccountNum(e.target.value)}
                          placeholder="Enter account number"
                          className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">Confirm Account Number:</label>
                        <input
                          type="text"
                          value={newConfirmAccountNum}
                          onChange={(e) => setNewConfirmAccountNum(e.target.value)}
                          placeholder="Re-enter account number"
                          className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-mono font-black focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-0.5">Account Holder Name:</label>
                        <input
                          type="text"
                          value={newHolderName}
                          onChange={(e) => setNewHolderName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-black focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: UPI ID */}
              {mode === 'upi' && (
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-1">Enter UPI VPA:</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm, name@okaxis"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-emerald-700 font-bold block mt-1">✓ Instant NPCI Fast Rail</span>
                </div>
              )}

              {/* Amount to Withdraw */}
              <div>
                <label className="text-xs font-black text-slate-800 block mb-1.5">
                  Enter Amount to Withdraw (₹):
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['100', '200', '500', walletCash.toString()].map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(amt)}
                      className={`p-2 rounded-xl border-2 text-xs font-black transition cursor-pointer ${
                        withdrawAmount === amt
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={walletCash}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 focus:border-emerald-500 rounded-xl text-sm font-black text-slate-900 focus:outline-none"
                  required
                />
              </div>

              {/* Security Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
                <span className="flex items-center gap-1.5">
                  <FaShieldAlt className="text-emerald-600" /> NPCI IMPS Instant Rail
                </span>
                <span className="font-black text-slate-900">Credit Time: ~30 Seconds</span>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-2xl border-2 border-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || Number(withdrawAmount) > walletCash}
                  className="flex-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg border-2 border-emerald-600 transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>Transferring to Bank...</span>
                    </>
                  ) : (
                    <>
                      <FaLock className="text-xs" />
                      <span>Transfer ₹{withdrawAmount} to Bank</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BankWithdrawalModal;
