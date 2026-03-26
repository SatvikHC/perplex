import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { 
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, 
  Clock, CheckCircle, XCircle, AlertCircle,
  QrCode, Gift, Plus, Smartphone, Copy,
  ChevronRight, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Skeleton, Modal, LoadingSpinner } from '../../components/UIComponents';

const typeConfig = {
  CREDIT: { icon: ArrowDownRight, color: 'text-green-500', prefix: '+' },
  DEBIT: { icon: ArrowUpRight, color: 'text-[#FF1A1A]', prefix: '-' },
  PRIZE: { icon: ArrowDownRight, color: 'text-[#FFD700]', prefix: '+' },
  REFUND: { icon: ArrowDownRight, color: 'text-blue-500', prefix: '+' },
  WITHDRAWAL: { icon: ArrowUpRight, color: 'text-purple-500', prefix: '-' },
};

const withdrawalStatusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-500' },
  PROCESSING: { icon: AlertCircle, color: 'text-blue-500' },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500' },
  FAILED: { icon: XCircle, color: 'text-[#FF1A1A]' },
};

const topupStatusConfig = {
  PENDING: { label: 'Pending Verification', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  APPROVED: { label: 'Approved', color: 'text-green-500', bg: 'bg-green-500/10' },
  REJECTED: { label: 'Rejected', color: 'text-[#FF1A1A]', bg: 'bg-[#FF1A1A]/10' },
};

export default function Wallet() {
  const { user, token, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  // Modals
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Topup state
  const [topupTab, setTopupTab] = useState('upi'); // 'upi' or 'redeem'
  const [topupAmount, setTopupAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [redeemCode, setRedeemCode] = useState('');

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');

  const { data: wallet, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => api.getWallet(token),
    enabled: !!token,
  });

  const { data: withdrawals } = useQuery({
    queryKey: ['withdrawals'],
    queryFn: () => api.getWithdrawals(token),
    enabled: !!token,
  });

  const { data: topupHistory } = useQuery({
    queryKey: ['topupHistory'],
    queryFn: () => api.getTopupHistory(token),
    enabled: !!token,
  });

  const { data: paymentSettings } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: () => api.getPaymentSettings(),
  });

  const topupMutation = useMutation({
    mutationFn: () => api.requestTopup(parseFloat(topupAmount), utrNumber, 'UPI', token),
    onSuccess: () => {
      toast.success('Topup request submitted! Admin will verify within 30 minutes.');
      queryClient.invalidateQueries(['topupHistory']);
      setShowTopupModal(false);
      setTopupAmount('');
      setUtrNumber('');
    },
    onError: (err) => toast.error(err.message),
  });

  const redeemMutation = useMutation({
    mutationFn: () => api.redeemCode(redeemCode, token),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(['wallet']);
      refreshUser();
      setShowTopupModal(false);
      setRedeemCode('');
    },
    onError: (err) => toast.error(err.message),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => api.createWithdrawal(parseFloat(withdrawAmount), upiId, token),
    onSuccess: () => {
      toast.success('Withdrawal request submitted!');
      queryClient.invalidateQueries(['wallet', 'withdrawals']);
      refreshUser();
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setUpiId('');
    },
    onError: (err) => toast.error(err.message),
  });

  const copyUPI = () => {
    navigator.clipboard.writeText(paymentSettings?.upiId || 'osglive@upi');
    toast.success('UPI ID copied!');
  };

  const balance = user?.walletBalance || 0;
  const upiEnabled = paymentSettings?.upiEnabled !== false;
  const redeemEnabled = paymentSettings?.redeemEnabled !== false;
  const adminUpiId = paymentSettings?.upiId || 'osglive@upi';
  const qrCodeUrl = paymentSettings?.qrCodeUrl;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-['Rajdhani'] font-bold text-white mb-2">Wallet</h1>
        <p className="text-[#A1A1AA]">Manage your balance and transactions</p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-[#FFD700]/5" />
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[#A1A1AA] text-sm mb-2 uppercase tracking-wider">
                Available Balance
              </p>
              <div className="text-5xl font-['Rajdhani'] font-bold text-white">
                ₹<span className="text-[#FFD700]">{balance.toFixed(2)}</span>
              </div>
              <p className="text-[#52525B] text-sm mt-2">
                {user?.ign} • {user?.ffUid}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTopupModal(true)}
                className="btn-primary px-6 py-3 flex items-center gap-2 text-base"
              >
                <Plus className="w-5 h-5" />
                Add Money
              </button>
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={balance < 50}
                className="btn-secondary px-6 py-3 flex items-center gap-2 text-base disabled:opacity-50"
              >
                <ArrowUpRight className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Topup History */}
      {topupHistory?.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#FF6B00]" />
            Topup Requests
          </h2>
          <div className="space-y-3">
            {topupHistory.map((req) => {
              const statusConf = topupStatusConfig[req.status] || topupStatusConfig.PENDING;
              return (
                <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">₹{req.amount}</p>
                    <p className="text-xs text-[#A1A1AA]">UTR: {req.utrNumber}</p>
                    <p className="text-xs text-[#52525B]">
                      {req.requestedAt ? format(new Date(req.requestedAt), 'MMM d, h:mm a') : '-'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConf.bg} ${statusConf.color}`}>
                    {statusConf.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-6 flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-[#FF6B00]" />
          Transaction History
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16" />)}
          </div>
        ) : wallet?.transactions?.length > 0 ? (
          <div className="space-y-3">
            {wallet.transactions.map((tx) => {
              const config = typeConfig[tx.type] || typeConfig.CREDIT;
              const Icon = config.icon;
              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/8 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/10 ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{tx.description}</p>
                    <p className="text-[#52525B] text-xs">
                      {tx.createdAt ? format(new Date(tx.createdAt), 'MMM d, yyyy • h:mm a') : '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-['Rajdhani'] font-bold text-lg ${config.color}`}>
                      {config.prefix}₹{Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[#52525B] text-xs">Bal: ₹{tx.balanceAfter?.toFixed(2)}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <WalletIcon className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
            <p className="text-[#A1A1AA]">No transactions yet</p>
          </div>
        )}
      </div>

      {/* Withdrawals */}
      {withdrawals?.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-xl font-['Rajdhani'] font-bold text-white mb-4">
            Withdrawal History
          </h2>
          <div className="space-y-3">
            {withdrawals.map((w) => {
              const statusConf = withdrawalStatusConfig[w.status] || withdrawalStatusConfig.PENDING;
              const StatusIcon = statusConf.icon;
              return (
                <div key={w.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-5 h-5 ${statusConf.color}`} />
                    <div>
                      <p className="text-white font-semibold">₹{w.amount}</p>
                      <p className="text-xs text-[#A1A1AA]">{w.upiId}</p>
                      {w.utrNumber && <p className="text-xs text-green-500">UTR: {w.utrNumber}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${statusConf.color}`}>{w.status}</p>
                    <p className="text-xs text-[#52525B]">
                      {w.requestedAt ? format(new Date(w.requestedAt), 'MMM d') : '-'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ADD MONEY MODAL */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => { setShowTopupModal(false); setTopupAmount(''); setUtrNumber(''); setRedeemCode(''); }}
        title="Add Money to Wallet"
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
            {upiEnabled && (
              <button
                onClick={() => setTopupTab('upi')}
                className={`flex-1 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  topupTab === 'upi' ? 'bg-[#FF6B00] text-black' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                UPI / QR Code
              </button>
            )}
            {redeemEnabled && (
              <button
                onClick={() => setTopupTab('redeem')}
                className={`flex-1 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  topupTab === 'redeem' ? 'bg-[#FF6B00] text-black' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                <Gift className="w-4 h-4" />
                Redeem Code
              </button>
            )}
          </div>

          {/* UPI Tab */}
          <AnimatePresence mode="wait">
            {topupTab === 'upi' && upiEnabled && (
              <motion.div
                key="upi"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* QR Code */}
                <div className="bg-white rounded-xl p-4 flex flex-col items-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Payment QR" className="w-48 h-48 object-contain" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-xs">QR Code</p>
                      </div>
                    </div>
                  )}
                  <p className="text-gray-600 text-xs mt-2">Scan to pay</p>
                </div>

                {/* UPI ID */}
                <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-lg p-4">
                  <p className="text-xs text-[#A1A1AA] mb-1 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" />
                    UPI ID (Pay directly)
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold text-lg">{adminUpiId}</p>
                    <button
                      onClick={copyUPI}
                      className="flex items-center gap-1 text-[#FF6B00] text-sm hover:underline"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-[#A1A1AA] flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#FF6B00] flex-shrink-0 mt-0.5" />
                    Pay the amount to the UPI ID above, then enter the amount and UTR/Transaction ID below. Your wallet will be credited within 30 minutes after verification.
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-[#A1A1AA] mb-2">Amount You Paid (₹)</label>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    className="input-dark w-full px-4 py-3 rounded"
                    placeholder="Enter amount e.g. 100"
                    min="10"
                    max="10000"
                  />
                  {/* Quick amount buttons */}
                  <div className="flex gap-2 mt-2">
                    {[50, 100, 200, 500].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setTopupAmount(String(amt))}
                        className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                          topupAmount === String(amt)
                            ? 'bg-[#FF6B00] text-black'
                            : 'bg-white/10 text-[#A1A1AA] hover:bg-white/20'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* UTR */}
                <div>
                  <label className="block text-sm text-[#A1A1AA] mb-2">
                    UTR / Transaction ID
                    <span className="text-[#FF1A1A] ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className="input-dark w-full px-4 py-3 rounded"
                    placeholder="Enter 12-digit UTR or transaction ID"
                  />
                  <p className="text-xs text-[#52525B] mt-1">
                    Find UTR in your UPI app → Transaction details
                  </p>
                </div>

                <button
                  onClick={() => topupMutation.mutate()}
                  disabled={!topupAmount || !utrNumber || topupMutation.isPending || parseFloat(topupAmount) < 10}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {topupMutation.isPending ? <LoadingSpinner size="sm" /> : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Submit Topup Request
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Redeem Tab */}
            {topupTab === 'redeem' && redeemEnabled && (
              <motion.div
                key="redeem"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#FF6B00]/30">
                    <Gift className="w-10 h-10 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-white font-['Rajdhani'] font-bold text-xl mb-1">
                    Redeem Gift Code
                  </h3>
                  <p className="text-[#A1A1AA] text-sm">
                    Enter a promo or gift code to add money to your wallet instantly
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-[#A1A1AA] mb-2">Enter Redeem Code</label>
                  <input
                    type="text"
                    value={redeemCode}
                    onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                    className="input-dark w-full px-4 py-3 rounded text-center text-xl font-bold tracking-widest"
                    placeholder="OSGXXXX"
                    maxLength={20}
                  />
                </div>

                <button
                  onClick={() => redeemMutation.mutate()}
                  disabled={!redeemCode || redeemMutation.isPending}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {redeemMutation.isPending ? <LoadingSpinner size="sm" /> : (
                    <>
                      <Gift className="w-4 h-4" />
                      Redeem Code
                    </>
                  )}
                </button>

                <p className="text-xs text-[#52525B] text-center">
                  Codes are case-insensitive. Each code can only be used once per account.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!upiEnabled && !redeemEnabled && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
              <p className="text-[#A1A1AA]">Payment options are currently unavailable</p>
              <p className="text-[#52525B] text-sm mt-1">Please contact support</p>
            </div>
          )}
        </div>
      </Modal>

      {/* WITHDRAW MODAL */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => { setShowWithdrawModal(false); setWithdrawAmount(''); setUpiId(''); }}
        title="Withdraw Funds"
      >
        <div className="space-y-4">
          <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-lg p-4 flex items-center gap-3">
            <WalletIcon className="w-5 h-5 text-[#FFD700]" />
            <div>
              <p className="text-xs text-[#A1A1AA]">Available Balance</p>
              <p className="text-[#FFD700] font-['Rajdhani'] font-bold text-xl">₹{balance.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Withdraw Amount (Min ₹50)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="input-dark w-full px-4 py-3 rounded"
              placeholder="Enter amount"
              min="50"
              max={balance}
            />
            <button
              onClick={() => setWithdrawAmount(String(Math.floor(balance)))}
              className="text-xs text-[#FF6B00] hover:underline mt-1"
            >
              Withdraw all (₹{Math.floor(balance)})
            </button>
          </div>

          <div>
            <label className="block text-sm text-[#A1A1AA] mb-2">Your UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="input-dark w-full px-4 py-3 rounded"
              placeholder="yourname@bank"
            />
          </div>

          <div className="bg-white/5 rounded-lg p-3 text-xs text-[#A1A1AA] border border-white/10">
            <p>• Withdrawals are processed within 24 hours</p>
            <p>• Make sure your UPI ID is correct</p>
            <p>• Minimum withdrawal: ₹50</p>
          </div>

          <button
            onClick={() => withdrawMutation.mutate()}
            disabled={
              !withdrawAmount || !upiId ||
              parseFloat(withdrawAmount) < 50 ||
              parseFloat(withdrawAmount) > balance ||
              withdrawMutation.isPending
            }
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {withdrawMutation.isPending ? <LoadingSpinner size="sm" /> : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                Request Withdrawal
              </>
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
}